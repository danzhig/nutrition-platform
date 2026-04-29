# Calendar Tracker — Feature Plan

**Prepared:** 2026-04-27  
**Status:** Draft for review — no code written yet

---

## What We're Building

A new top-level tab ("Calendar") sitting alongside Day Planner and Data View. Users log what they actually eat on each day by attaching existing Day Planner plans, individual saved/preset meals, or standalone foods. The data is stored in a dedicated Supabase table so future analysis (weekly/monthly summaries, trends, habit patterns) can be run against it.

---

## Part 1 — Database Schema (Decided)

This is the most consequential decision. Everything else flows from it.

---

### Design Principles

Before the schema options, these requirements constrain the design:

1. **Food IDs must always be preserved.** Every logged item must store `food_id` (integer FK to `foods`). Nutrient values are never snapshotted — they are derived at query time by JOINing `food_id` to the live `food_nutrients` table. This means adding a new nutrient (e.g. creatine) retroactively surfaces in all historical calendar entries with no data migration.

2. **Quantities (grams) are locked at log time.** The `amount_g` stored at the moment of logging is immutable. Changing portion sizes in the app does not alter what was actually eaten.

3. **Meal/plan source IDs are stored but soft.** `source_id` records which saved meal or plan the entry came from, enabling future queries like "how many times did I eat the Tuna Bowl." If that meal is later deleted from the planner, the application clears `source_id` (sets it to NULL) on the affected food_log rows but leaves food items, quantities, and the label intact.

4. **Label is a captured string, not a live reference.** The meal/plan name is written to `label` at log time for display grouping. It never changes after logging, even if the source is renamed or deleted. This gives the calendar a faithful "what I called it at the time" record.

5. **Editing a saved meal never retroactively changes logged history.** The log records what was consumed, not what the current version of a meal contains. A user updating their "Tuna Bowl" recipe does not mutate past calendar entries.

---

### Schema

One row per calendar entry. The `items` JSONB array always contains `food_id` — the stable FK that anchors all analytics.

```sql
CREATE TABLE food_log (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL,
    log_date      DATE        NOT NULL,
    entry_type    TEXT        NOT NULL,   -- 'plan' | 'meal' | 'food'
    label         TEXT,                   -- display name captured at log time; never updated
    items         JSONB       NOT NULL,   -- [{ food_id, food_name, amount_g, mode }] — food_id always present
    source_id     UUID,                   -- soft ref: meal_plans.id, saved_meals.id, or preset_meals.id
                                          -- NULLed by app logic on source deletion; never a hard FK
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_log_user_date ON food_log (user_id, log_date);
CREATE INDEX idx_food_log_user      ON food_log (user_id);
```

**`items` array shape — every element:**

```json
{
  "food_id":   42,           // integer FK → foods.id — REQUIRED, never null
  "food_name": "Tuna",       // string captured at log time for display only
  "amount_g":  170.0,        // grams at time of logging — immutable
  "mode":      "weight"      // "weight" | "serving" (from meal planner)
}
```

`food_name` is stored for display convenience so the UI does not need to JOIN to `foods` just to render a label. `food_id` is the authoritative reference for all calculations.

**How the three entry types work:**

| Entry type | `label` | `items` | `source_id` |
|---|---|---|---|
| `plan` | Plan name (captured) | All foods from all meals, each with `food_id` + `amount_g` | `meal_plans.id` — NULLed if plan deleted |
| `meal` | Meal name (captured) | Foods in that meal, each with `food_id` + `amount_g` | `saved_meals.id` or `preset_meals.id` — NULLed if meal deleted |
| `food` | Food name (captured) | Single item with `food_id` + `amount_g` | NULL |

**On source deletion (app-level logic in `lib/foodLogStorage.ts`):**

When a meal plan or saved meal is deleted, before committing the delete the app runs:

```sql
UPDATE food_log
SET source_id = NULL
WHERE source_id = $deleted_id AND user_id = $user_id;
```

The row remains. `label` and `items` (including all `food_id` values) are untouched. The calendar still shows the entry grouped under its original name; nutrient math still works; the only thing lost is the ability to re-open the source in the planner.

---

### Why nutrient values are never stored in the snapshot

Storing values per 100g in the log would freeze the nutritional profile at the time of logging. The design explicitly avoids this so that:

- Adding a new nutrient (e.g. creatine) surfaces in all past calendar entries automatically
- Correcting an error in a food's nutrient values (e.g. fixing a wrong iron entry) propagates to historical analytics
- The `food_nutrients` table remains the single source of truth for all nutritional math

The tradeoff is that if USDA revises a food's values, historical calorie/macro totals will shift. This is acceptable — the log records *what was eaten* (food + quantity), not *what we knew about it at the time*.

---

### Pros

- Food IDs preserved forever → retroactive nutrient analysis always possible
- Adding new nutrients (e.g. creatine) immediately surfaces across all historical entries
- Source IDs enable "how many times did I eat Meal X" queries
- Meal deletions leave the log intact — only the soft FK is cleared
- Label + items captured at log time give a faithful historical record
- Simple analytics queries: every row has a flat `items` array; SUM nutrients by JOINing `food_id` to `food_nutrients`

### Cons

- Nutrient math requires a JOIN to `food_nutrients` at query time (not a raw number read from the log)
- Deleting a meal requires an explicit `UPDATE food_log SET source_id = NULL` step in app logic (no DB-level cascade)

---

### Rejected Alternatives

**Option B — Reference-Only (Thin Log):** Stores only FK references, no food items. Ruled out because deleting a meal would erase all food data from those calendar entries — the core requirement is that food IDs must survive meal deletion.

**Option C — Day-Level Document:** One JSONB blob per user per day. Ruled out because it complicates entry-level queries, has concurrency issues with concurrent tab writes, and doesn't scale cleanly for analytics like "all days I ate salmon."

---

## Part 2 — Calendar Layout (Decided)

Two distinct modes toggled from the header. Each has its own navigation and density model.

---

### Month Mode

A standard monthly calendar grid (7 columns × 5–6 rows). Navigate between months with `← Prev` / `Today` / `Next →` arrows.

**Day cell:**
- Date number in top-left corner
- Up to 3 entry pills, colored by type: violet = plan, teal = meal, amber = food
- Overflow indicator: "+2 more" if more than 3 entries on that day
- `+` button on hover to add an entry
- Clicking the date number or anywhere in the cell (not the `+`) opens the Day Detail panel on the right (see Part 4)

**Purpose:** High-level habit overview. See which days have logged entries, spot gaps, understand the shape of a month at a glance.

---

### Week Mode

A vertically scrollable stack of week strips — not a single isolated week. Each strip is one week (Mon–Sun or Sun–Sat), displayed as a 7-column row. Weeks stack top-to-bottom so you can scroll the entire history like a rolodex.

**Week strip:**
- Week header row: "Week of Apr 21" with a `← →` nudge or anchor-scroll to that week (optional)
- 7 day columns, each showing:
  - Date number
  - Entry cards (not pills) — enough vertical height to show label + kcal badge per entry
  - Total kcal for the day as a compact badge at the bottom of the column
  - `+` button to add an entry
- Clicking a day column (not the `+`) opens the Day Detail panel on the right

**Scrolling behavior:** The list renders enough weeks to cover a rolling window (e.g. current week ± 8 weeks = ~17 strips). A "Load more" trigger at the top and bottom extends the window. The scroll position on first open snaps to the current week. Returning to Week mode after navigating away restores the previous scroll position via `np:calendar:week` localStorage key.

**Purpose:** Comparative weekly view. Scroll up/down to see how meal and food choices evolved week over week. The vertical rolodex makes it natural to visually diff "last Tuesday vs this Tuesday."

---

### Toggle and Navigation

A `Month | Week` pill toggle in the Calendar tab header switches between modes. Each mode remembers its own position (month in view, scroll offset in week list) independently via localStorage.

The Day Detail panel (Part 4) works identically in both modes — clicking any day in either view populates the panel on the right.

---

## Part 3 — Add Entry Interaction (Decided)

A Quick Add Modal triggered from two surfaces: the `+` button on a calendar cell (Part 2) and the `+ Add Entry` button in the Day Detail panel header (Part 4). Both open the same `CalendarAddModal` component pre-seeded with the target date.

---

### Trigger points

- **Month mode:** hovering a day cell reveals a `+` in the corner; clicking it opens the modal for that date
- **Week mode:** each day column has a persistent `+` at the bottom; clicking opens the modal for that date
- **Day Detail panel:** the `+ Add Entry` button in the panel header opens the modal for the currently displayed date — the natural flow when the panel is already open

---

### Modal flow

**Step 1 — Choose entry type:**

Three large buttons presented in order of expected frequency:

| Button | What gets logged |
|---|---|
| Add Meal | A single meal from presets or saved templates |
| Add Plan | All meals from a saved Day Planner plan |
| Add Food | A single standalone food item |

**Step 2 — Select the item:**

**Add Meal:**
- The same Presets pane used in the Day Planner: category pills (preset categories + "My Templates" subcategory), nutrient sort dropdown, complement score badges
- Selecting a meal writes one `food_log` row: `entry_type = 'meal'`, `label` = meal name at selection time, `source_id` = `saved_meals.id` or `preset_meals.id`, `items` = array of `{ food_id, food_name, amount_g, mode }` for each food in that meal

**Add Plan:**
- The same plan picker list used in the Day Planner tab bar
- Selecting a plan writes one `food_log` row: `entry_type = 'plan'`, `label` = plan name at selection time, `source_id` = `meal_plans.id`, `items` = all foods across all meals in the plan, each with their `food_id` and `amount_g`

**Add Food:**
- Reuses `FoodPickerModal` as-is: search box + category filter, complement score badges sorted by score
- After selecting a food, a grams input appears pre-filled with the food's default serving size from `portionSizes.ts`; user can adjust
- Writes one `food_log` row: `entry_type = 'food'`, `label` = food name, `source_id` = NULL, `items` = single `{ food_id, food_name, amount_g, mode }`

---

### Consistency with the rest of the design

- **Part 1 (Database):** Every path through the modal writes `food_id` into every item in `items`. No nutrient values are stored — the log row contains only IDs and grams. `source_id` is written where available and is the nullable soft reference described in Part 1.
- **Part 2 (Layout):** The modal is compact and overlays the calendar without replacing it. On confirmation the modal closes, the calendar cell gains an entry pill, and if the Day Detail panel is open it refreshes its entry list in-place.
- **Part 4 (Day Detail panel):** After adding an entry via the panel's `+ Add Entry` button, the panel's entry list and nutrition summary update immediately — no reload required.

---

## Part 4 — Day Detail Panel (Decided)

Clicking any day in either Month or Week mode opens a persistent right-side panel — the calendar remains visible on the left. The panel is not a modal; it is a fixed sidebar that replaces the empty right zone of the Calendar tab layout.

---

### Layout

The Calendar tab renders as a two-column layout when a day is selected:

```
┌─────────────────────────────┬──────────────────────────┐
│  Month grid  /  Week strips │   Day Detail Panel       │
│  (~65% width)               │   (~35% width)           │
│                             │                          │
│  [calendar content]         │  [date header]           │
│                             │  [entry list]            │
│                             │  [nutrition summary]     │
└─────────────────────────────┴──────────────────────────┘
```

When no day is selected the panel is hidden and the calendar occupies full width.

---

### Day Detail Panel Contents

**Header:**
- Date (e.g. "Tuesday, April 29") with `‹ ›` arrows to step to previous/next day without closing the panel
- `✕` to close the panel and return to full-width calendar
- "+ Add Entry" button

**Entry list:**
- One card per `food_log` row for that day
- Each card shows: entry type badge (plan / meal / food), `label`, total kcal, and a compact horizontal %DV bar for protein / fat / carbs / fibre
- Per-card actions: "Edit grams" (updates `amount_g` in place), "Remove" (deletes the `food_log` row)
- If the entry came from a named meal/plan (`source_id` not null), the card header shows the source name as a grouping label; foods within it are listed below

**Day Total nutrition section:**
- Aggregates all `items` across all entries for that day (JOIN to `food_nutrients` for current values)
- Renders the same `MealNutritionSidebar` component used in the Day Planner, passing the aggregated items array
- A "Chart view" toggle (same as Day Planner) expands to `MealNutritionChart` showing the full bar chart + radar + donut for the day's eating
- This reuse means the Day Detail panel has feature parity with the Day Planner's right-hand analysis tools

---

### Interaction with the Calendar

- In Month mode: clicking a day cell selects it, panel slides in from the right, grid narrows to ~65%
- In Week mode: clicking a day column highlights it, panel appears on the right alongside the week strips
- Navigating `‹ ›` in the panel header steps through days without touching the calendar scroll position
- Clicking a different day cell updates the panel in-place (no open/close animation)
- The selected day is stored in `np:calendar:selected-date` localStorage so returning to the Calendar tab reopens the last-viewed day's panel

---

## Part 5 — Technical Integration Notes

### What changes in the existing codebase

**`components/MainView.tsx`** — add `'calendar'` to the `Tab` type and add a third `<TabButton label="Calendar" .../>`. Mount `<CalendarView data={data} />` when active. Update the localStorage key set to include the new value.

**New files needed:**
- `components/CalendarView.tsx` — top-level orchestrator: month/week toggle, two-column layout (calendar + Day Detail panel), selected-day state
- `components/CalendarMonthGrid.tsx` — monthly calendar grid (7 × 5–6 cells, navigation arrows, entry pills)
- `components/CalendarWeekList.tsx` — vertically scrollable week strips; renders rolling window of weeks; snap-to-current-week on mount
- `components/CalendarDayPanel.tsx` — right-side Day Detail panel: entry list cards, MealNutritionSidebar integration, chart view toggle, day-step navigation
- `components/CalendarAddModal.tsx` — add entry modal (type chooser: Plan / Meal / Food → search/select step)
- `lib/foodLogStorage.ts` — CRUD for the `food_log` table (same pattern as `mealStorage.ts`)

**Existing components reused:**
- `FoodPickerModal` — reused as-is for the "Add Food" flow in `CalendarAddModal`
- `MealNutritionSidebar` — reused in `CalendarDayPanel` with the day's aggregated items array
- `MealNutritionChart` — reused in `CalendarDayPanel` chart view toggle
- Preset/template pane logic from `MealPlanner.tsx` — reused in `CalendarAddModal` "Add Meal" step

### Supabase changes

1. New table `food_log` (schema defined in Part 1)
2. New index `idx_food_log_user_date`
3. RLS policy: `user_access_food_log` — same pattern as `meal_plans` (`auth.uid() = user_id`)

### State persistence pattern

Follow the established project pattern: lazy `useState(() => localStorage.getItem(...))` init + `useEffect` save. Keys:
- `np:calendar:view` — `'month'` | `'week'`
- `np:calendar:year` + `np:calendar:month` — current month in view (month mode)
- `np:calendar:week` — ISO week start date for scroll-snap anchor (week mode)
- `np:calendar:selected-date` — ISO date string of the currently open Day Detail panel; `null` if panel is closed

---

## Summary — Decided Stack

| Dimension | Decision | Status |
|---|---|---|
| Database | Food-ID-anchored log — food_ids always in items JSONB; nutrient values derived live; source_id soft-nulled on meal deletion | ✅ Decided |
| Calendar layout | Month grid (overview) + vertically scrollable week rolodex (comparative detail); `Month \| Week` toggle in header | ✅ Decided |
| Add entry UX | Quick Add Modal — type chooser (Meal / Plan / Food); triggered from calendar cell `+` or Day Detail panel header; writes food_id-anchored food_log rows | ✅ Decided |
| Day detail | Persistent right-side panel (not a modal); two-column layout with calendar on left; MealNutritionSidebar + chart view reused directly | ✅ Decided |

---

*All parts decided. Ready for implementation.*
