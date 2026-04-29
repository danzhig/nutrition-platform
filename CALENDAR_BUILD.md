# Calendar Tracker — Build Plan

**Design reference:** `CALENDAR_PLAN.md`  
**Created:** 2026-04-29  
**Status:** Not started

Phases are in strict dependency order. Each phase is scoped to fit a single working session. Do not start a phase until the previous one is complete — each phase depends on the storage layer and component contracts defined before it.

---

## Phase 1 — Database & Storage Layer

**Scope:** Supabase table + TypeScript CRUD lib. No UI. Everything else in the build depends on this.

### Supabase (run in SQL editor)

```sql
CREATE TABLE food_log (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL,
    log_date      DATE        NOT NULL,
    entry_type    TEXT        NOT NULL,
    label         TEXT,
    items         JSONB       NOT NULL,
    source_id     UUID,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_log_user_date ON food_log (user_id, log_date);
CREATE INDEX idx_food_log_user      ON food_log (user_id);

-- RLS: same pattern as meal_plans
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_access_food_log ON food_log
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### New files

**`types/calendar.ts`**
- `FoodLogItem` — `{ food_id, food_name, amount_g, mode, meal_label? }`
- `FoodLogEntry` — full row shape matching the table above

**`lib/foodLogStorage.ts`** — CRUD layer (same pattern as `mealStorage.ts`)
- `getEntriesForDateRange(userId, startDate, endDate)` — SELECT WHERE user_id + log_date BETWEEN
- `addEntry(entry)` — INSERT, returns the new row
- `updateEntryItemGrams(entryId, userId, foodId, newGrams)` — UPDATE items JSONB in-place for one item
- `deleteEntry(entryId, userId)` — DELETE
- `nullSourceId(sourceId, userId)` — `UPDATE food_log SET source_id = NULL WHERE source_id = $1 AND user_id = $2`
  - Call this from `mealStorage.ts` and `savedMealStorage.ts` delete functions

### Also update

- `mealStorage.ts` — call `nullSourceId` after deleting a meal plan
- `savedMealStorage.ts` — call `nullSourceId` after deleting a saved meal

### Done when

- `food_log` table exists in Supabase with RLS enabled
- `tsc --noEmit` passes
- `foodLogStorage.ts` functions compile; no UI work yet

---

## Phase 2 — Tab Shell + Month Grid (display only)

**Scope:** Wire the Calendar tab, build the month grid that renders existing log entries as pills. No add flow, no Day Detail panel — just the read path.

### Modify existing files

**`components/MainView.tsx`**
- Add `'calendar'` to the `Tab` type union
- Add `<TabButton label="Calendar" .../>` after Day Planner
- Import and mount `<CalendarView />` when `activeTab === 'calendar'`
- Add `'calendar'` to the localStorage key set for tab persistence

### New files

**`components/CalendarView.tsx`** — orchestrator
- `Month | Week` pill toggle in header; persists to `np:calendar:view`
- Two-column layout: calendar (~65%) + Day Detail panel (~35%) when a day is selected; panel slot is empty for now (wired in Phase 4)
- Fetches `food_log` entries for the visible date range via `getEntriesForDateRange`; re-fetches when month changes
- Passes entries, selectedDate, and setSelectedDate down to child components
- Renders `<CalendarMonthGrid />` when view = month; placeholder for week mode

**`components/CalendarMonthGrid.tsx`** — monthly grid
- 7 × 5–6 cell grid built from JS `Date` math; correct first-day-of-week alignment
- `← Prev` / `Today` / `Next →` navigation; persists year + month to `np:calendar:year` + `np:calendar:month`
- Day cell:
  - Date number in top-left
  - Entry pills (violet = plan, teal = meal, amber = food); pill label = `label` field
  - "+N more" if > 3 entries
  - `+` button on hover — wired but no-op until Phase 3
  - Click cell → sets `selectedDate` (opens panel in Phase 4; slot is empty for now)
- Today's date highlighted

### Done when

- Calendar tab appears in the tab bar and is clickable
- Month grid renders with correct day layout and navigation
- Entry pills appear on days that have logged data (test by inserting a row directly in Supabase)
- `tsc --noEmit` passes

---

## Phase 3 — Add Entry Modal

**Scope:** The full write path. Users can log meals, plans, and standalone foods from the calendar. Month grid pills update after adding.

### New file

**`components/CalendarAddModal.tsx`**

**Step 1 — type chooser:** three large buttons: `Add Meal` / `Add Plan` / `Add Food`

**Add Food path:**
- Embed `<FoodPickerModal>` (reuse as-is, including category filter + search)
- After food is selected: show a grams input pre-filled from `portionSizes.ts`; user can adjust
- On confirm: call `addEntry` with `entry_type = 'food'`, `label = food_name`, `items = [{ food_id, food_name, amount_g, mode: 'weight' }]`, `source_id = null`

**Add Meal path:**
- Render the same Presets pane used in MealPlanner (category pills, "My Templates" subcategory, nutrient sort dropdown)
- **Do not show complement score badges** — recording past eating, not deciding
- On meal selected: call `addEntry` with `entry_type = 'meal'`, `label = meal.name`, `source_id = meal.id`, `items` = meal foods each with `meal_label = meal.name`

**Add Plan path:**
- Render the same plan picker list used in the Day Planner tab bar
- On plan selected: call `addEntry` with `entry_type = 'plan'`, `label = plan.name`, `source_id = plan.id`, `items` = all foods across all meals, each item carrying `meal_label = the originating meal name`

**After any confirm:** close modal, trigger re-fetch of entries in `CalendarView` so new pills appear immediately.

### Wire into CalendarView

- Pass `onAddClick(date)` down to `CalendarMonthGrid`; month grid's `+` button calls it
- `CalendarView` renders `<CalendarAddModal>` when a target date is set; closes on confirm or dismiss

### Done when

- Clicking `+` on a month cell opens the modal for that date
- All three paths (Food / Meal / Plan) write a valid row to `food_log`
- Entry pill appears on the correct day immediately after adding
- `tsc --noEmit` passes

---

## Phase 4 — Day Detail Panel

**Scope:** The right-side panel with the full entry list, meal grouping, edit/remove, and nutrition analysis. This makes the calendar analytically useful.

### New file

**`components/CalendarDayPanel.tsx`**

**Header:**
- Date formatted as "Tuesday, April 29"
- `‹ ›` arrows step to previous / next day (updates selected date without closing panel)
- `✕` closes panel (clears selectedDate)
- `+ Add Entry` button → opens `CalendarAddModal` for the current panel date

**Entry list** — one card per `food_log` row for the selected day:
- Entry type badge + `label` + total kcal
- Compact macro bar (protein / fat / carbs / fibre as %DV)
- Meal grouping by `meal_label`:
  - `food` entry: single food item directly under card header
  - `meal` entry: meal name as card header; foods listed below
  - `plan` entry: plan name as card header; foods sub-grouped under named meal section headers (Breakfast, Lunch, etc.); no food appears without meal context
- Per-card actions:
  - **Edit grams:** inline input on each food item; calls `updateEntryItemGrams` on blur/enter; refreshes nutrition totals
  - **Remove:** calls `deleteEntry`; removes card from list

**Day Total section:**
- Aggregate all `items` across all entries → build items array → JOIN `food_nutrients`
- Pass aggregated items to `<MealNutritionSidebar>` (reuse as-is)
- "Chart view" toggle expands `<MealNutritionChart>` (reuse as-is)

### Wire into CalendarView

- Selected date persists to `np:calendar:selected-date`; restore on tab return
- When `selectedDate != null`: render `<CalendarDayPanel>` in the right column; grid narrows to ~65%
- Panel's `‹ ›` navigation updates `selectedDate` (grid highlights the new cell)
- Month grid cell click sets `selectedDate`; clicking same date again or `✕` clears it

### Done when

- Clicking a day in the month grid opens the panel on the right
- Entry cards render with correct meal grouping
- Edit grams and Remove both work and update the UI immediately
- Day Total nutrition sidebar and chart view both render correctly
- Panel `‹ ›` navigation steps between days
- Last-selected day is restored on tab return
- `tsc --noEmit` passes

---

## Phase 5 — Week Mode

**Scope:** The second calendar view. Vertically scrollable week rolodex with entry cards, kcal badges, and Day Detail panel integration.

### New file

**`components/CalendarWeekList.tsx`**

- Renders a vertically scrollable stack of week strips covering a rolling window (current week ± 8 weeks ≈ 17 strips)
- Each strip: week header ("Week of Apr 21") + 7 day columns (Mon–Sun)
- Day column:
  - Date number
  - Entry cards — taller than month pills: show `label` + kcal badge; plan cards list meal sub-labels (meal names) beneath the plan title
  - Total kcal badge at bottom of column
  - Persistent `+` button at bottom → opens `CalendarAddModal` for that date
  - Click column → sets `selectedDate` (same panel as Phase 4)
- **Scroll behavior:**
  - On mount, scroll so the current week is visible (snap-to-current)
  - `IntersectionObserver` at top/bottom edges triggers loading more weeks
  - Scroll position saved to `np:calendar:week` (ISO date string of week anchor); restored on return to week mode
- When `selectedDate` is set: panel renders on the right alongside the week list (same two-column layout as month mode)

### Wire into CalendarView

- `<CalendarWeekList>` renders when view = `'week'`
- Shares `selectedDate` / `setSelectedDate` state with `<CalendarDayPanel>` (panel is the same component in both modes)

### Done when

- Week mode renders correctly with scrollable week strips
- Scroll snaps to current week on first open; scroll position is restored on return
- `+` per day column works (Add Modal)
- Clicking a day column opens Day Detail panel
- `tsc --noEmit` passes
- Full feature: both Month and Week modes working end-to-end

---

## Build Order Summary

| Phase | What | New files | Modifies |
|---|---|---|---|
| 1 | DB + storage | `types/calendar.ts`, `lib/foodLogStorage.ts` | `mealStorage.ts`, `savedMealStorage.ts` |
| 2 | Tab + month grid (display) | `CalendarView.tsx`, `CalendarMonthGrid.tsx` | `MainView.tsx` |
| 3 | Add entry modal | `CalendarAddModal.tsx` | `CalendarView.tsx` |
| 4 | Day detail panel | `CalendarDayPanel.tsx` | `CalendarView.tsx` |
| 5 | Week mode | `CalendarWeekList.tsx` | `CalendarView.tsx` |
