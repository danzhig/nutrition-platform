# Calendar Tracker — Feature Plan

**Prepared:** 2026-04-27  
**Status:** Draft for review — no code written yet

---

## What We're Building

A new top-level tab ("Calendar") sitting alongside Day Planner and Data View. Users log what they actually eat on each day by attaching existing Day Planner plans, individual saved/preset meals, or standalone foods. The data is stored in a dedicated Supabase table so future analysis (weekly/monthly summaries, trends, habit patterns) can be run against it.

---

## Part 1 — Database Schema Alternatives

This is the most consequential decision. Everything else flows from it.

---

### Option A — Snapshot Log (Recommended)

One row per calendar entry. Every entry stores a **full JSONB snapshot** of what was logged — the actual food items and grams — regardless of source type. References to the source (plan ID, saved meal ID) are stored as metadata only, not as foreign key dependencies.

```sql
CREATE TABLE food_log (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL,
    log_date      DATE        NOT NULL,
    entry_type    TEXT        NOT NULL,   -- 'plan' | 'meal' | 'food'
    label         TEXT,                   -- display name (plan name, meal name, or food name)
    items         JSONB       NOT NULL,   -- snapshot: [{ food_id, food_name, amount_g, mode }]
    source_id     UUID,                   -- optional: meal_plans.id or saved_meals.id it came from
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_log_user_date ON food_log (user_id, log_date);
CREATE INDEX idx_food_log_user      ON food_log (user_id);
```

**How the three entry types work:**

| Entry type | `label` | `items` | `source_id` |
|---|---|---|---|
| `plan` | Plan name | All foods from all meals in the plan | `meal_plans.id` |
| `meal` | Meal name | Foods in that single meal | `saved_meals.id` or `preset_meals.id` |
| `food` | Food name | Single food item with grams | NULL |

**Pros:**
- Future-proof: editing or deleting a plan later does not corrupt the log — the snapshot is what was actually eaten
- Simple to query for analytics: every row has `items` JSONB, easy to SUM nutrients across a date range
- Flexible: supports all three entry types with the same structure
- No cascade delete risk

**Cons:**
- Some data duplication (items are stored in both the source table and the log)
- If a user wants to "re-link" a logged entry to an updated plan, there's no automatic sync (this is intentional — a log is a record of the past)

---

### Option B — Reference-Only (Thin Log)

One row per calendar entry, storing only a foreign key reference to the source — no data duplication.

```sql
CREATE TABLE food_log (
    id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID  NOT NULL,
    log_date         DATE  NOT NULL,
    entry_type       TEXT  NOT NULL,   -- 'plan' | 'meal' | 'food'
    meal_plan_id     UUID  REFERENCES meal_plans(id) ON DELETE SET NULL,
    saved_meal_id    UUID  REFERENCES saved_meals(id) ON DELETE SET NULL,
    preset_meal_id   UUID  REFERENCES preset_meals(id) ON DELETE SET NULL,
    food_id          INTEGER REFERENCES foods(id),
    amount_g         DECIMAL,
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

**Pros:**
- No data duplication
- Always reflects the "latest" version of a saved meal if the user edits it

**Cons:**
- Can't run nutrition analytics directly — must JOIN back to the source at query time
- If a meal plan or saved meal is deleted, the log entry loses its data (SET NULL means nutrient history disappears)
- Analytics queries are significantly more complex (JSONB traversal across three possible sources)
- A logged day no longer reflects what the person actually ate if the source was later modified

**Verdict:** Not recommended. The snapshot approach is safer for an activity log.

---

### Option C — Day-Level Document

One row per user per day — a single JSONB blob containing everything eaten that day.

```sql
CREATE TABLE food_log_days (
    id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID  NOT NULL,
    log_date    DATE  NOT NULL,
    entries     JSONB NOT NULL,   -- array of entry objects (same shape as Option A items)
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, log_date)
);
```

**Pros:**
- One read fetches everything for a day
- Clean "upsert" pattern for the frontend

**Cons:**
- Harder to query at the entry level (can't easily filter "all days that contained chicken")
- Analytics require JSONB array unpacking (`jsonb_array_elements`) for every query
- Concurrency issues if multiple browser tabs write simultaneously (last-write-wins overwrites the whole day)
- Doesn't scale as cleanly for future analytics

**Verdict:** Simpler upfront but limits future analytics. Not recommended for this use case.

---

### Recommendation: Option A

Use the snapshot log (Option A). It treats the calendar as a genuine time-stamped activity record, enables clean analytics queries, and protects log data from future edits to plans.

---

## Part 2 — Calendar Layout Alternatives

---

### Option A — Month Grid with Week Toggle (Recommended)

The default view is a standard monthly calendar (7 columns × 5–6 rows). A "Week" toggle at the top switches to a 7-column single-week strip with more vertical space per cell.

**Month view cell:**
- Date number in corner
- Up to 3 entry pills (colored by type: violet = plan, teal = meal, amber = food)
- Overflow indicator: "+2 more" if more than 3 entries
- `+` button on hover

**Week view cell:**
- Full day column with more space
- Entries listed as cards instead of pills
- Easier to see nutrition summary badges on each entry

**Navigation:** `← Prev` / `Today` / `Next →` arrows in the header for month/week navigation.

**Pros:**
- Familiar to users (Google Calendar / Apple Calendar mental model)
- Month view gives the "big picture" habit overview
- Week view is actionable for day-to-day planning

**Cons:**
- More complex to build (grid math, overflow logic)

---

### Option B — Scrollable Week List

No grid — instead a vertical list of week blocks. Each week is a section header ("Week of April 21") followed by 7 day rows. Scroll down to see past weeks.

**Day row:**
- Date label on left
- Entry pills in the middle
- Total kcal / protein summary on the right
- `+` to add entry

**Pros:**
- Simpler to build
- Very easy to scroll through history
- Works naturally on mobile

**Cons:**
- No spatial overview of the month
- Less intuitive than a calendar grid for "how did this month go" questions
- Doesn't look like a calendar

---

### Option C — Compact Month + Day Panel Split

Month grid on the left (compact, ~35% width). Clicking a day opens a detail panel on the right (65% width) without a modal — the panel is always visible.

**Pros:**
- No modal interruptions; the calendar and the day detail are always co-visible
- Power-user feel
- Good for desktop usage

**Cons:**
- Cramped on narrower screens
- Month grid cells are small — hard to read entry pills
- More complex layout to maintain responsively

---

### Recommendation: Option A

Month grid with week toggle. Matches user expectations for a "calendar" feature. Week toggle adds the actionable daily view without building a separate screen.

---

## Part 3 — Add Entry Interaction Alternatives

How a user adds food to a calendar day.

---

### Option A — Quick Add Modal (Recommended)

Clicking `+` on a day opens a compact modal. Step 1: choose entry type (three large buttons: Add Plan / Add Meal / Add Food). Step 2: a search/select panel matching the type chosen.

**Add Plan flow:**
- List of the user's saved plans (same as the Plan picker in Day Planner)
- Select one → it's logged as a snapshot

**Add Meal flow:**
- Same pane as the Presets panel in Day Planner — saved templates + preset meals, same category pills, same nutrient sort dropdown
- Select one → logged as a snapshot

**Add Food flow:**
- Same modal as FoodPickerModal — search + category filter, single food
- Input grams or use default serving → logged

**Pros:**
- Reuses existing UI components (FoodPickerModal, preset pane logic) with minimal new code
- Clean separation of steps
- Works on both month and week views

**Cons:**
- Two-step flow for the common case (Add Meal)

---

### Option B — Inline Day Drawer

Clicking `+` on a day (or clicking the day cell itself) slides open a right-side drawer — a full Day Detail view that includes the add-entry controls inline. No separate modal.

**The drawer shows:**
- Day header (date, total kcal, DV% summary bar)
- List of existing entries for that day
- An "Add" button that expands inline into the three-type chooser

**Pros:**
- No nested modals
- Feels more integrated — you see what's already on the day while adding

**Cons:**
- Drawer takes up screen space
- On a month grid, opening a drawer hides part of the calendar

---

### Option C — Drag & Drop from Presets

A sidebar panel on the right lists saved plans and meals (like the Presets pane). Users drag a meal card and drop it onto a calendar day.

**Pros:**
- Fast for power users who know their meals
- Very visual

**Cons:**
- High implementation complexity (drag-and-drop across components)
- Doesn't work on touch/mobile
- Not intuitive to first-time users
- Doesn't cover the "add a single food" case naturally

---

### Recommendation: Option A

The Quick Add Modal reuses the most existing infrastructure (FoodPickerModal, preset/template pane). The two-step flow is worth the code reuse savings.

---

## Part 4 — Day Detail View Alternatives

What happens when you click into a day to see its full picture.

---

### Option A — Full-Screen Day Modal (Recommended)

Clicking a day number (not the `+`) opens a full-width overlay modal, similar to a lightbox.

**Contents:**
- Date header + navigation arrows to go to previous/next day
- Entry list: each entry is a card showing label, entry type badge, total kcal, and a nutrition summary bar (same %DV bar style as the meal sidebar)
- Per-entry options: Edit grams, Remove
- "Add entry" button at the top-right
- Bottom summary section: Day Total — all entries combined into one %DV bar chart (50 nutrients)
- Optional: reuse MealNutritionChart component to show the full chart view for the whole day

**Pros:**
- Maximum space for the nutrition summary
- Can reuse MealNutritionSidebar / MealNutritionChart almost directly by passing the aggregated items array
- Clear mental model: you're "inside" that day

**Cons:**
- Covers the calendar while open
- Need a good close/escape UX

---

### Option B — Slide-in Right Drawer

Clicking a day opens a right-side drawer (60% width), similar to a slide-out panel. The calendar remains visible on the left.

**Contents:** Same as Option A, but narrower.

**Pros:**
- Calendar context always visible
- Less disorienting than a full-screen takeover

**Cons:**
- Narrow space for the nutrition bar chart — may need to omit the full chart view
- On smaller screens, the drawer covers the calendar anyway

---

### Option C — In-Place Row/Cell Expansion

In the week view, clicking a day expands that row downward to show full detail. In the month view, clicking a day replaces the grid row with an expanded detail band.

**Pros:**
- No overlay — feels native to the calendar
- Context of surrounding days is always visible

**Cons:**
- Shifts layout dramatically (jumpy UX)
- Hard to show rich nutrition charts in an inline expansion
- Complex to implement cleanly

---

### Recommendation: Option A

The full-screen modal gives the most room for the nutrition summary. Since MealNutritionSidebar and MealNutritionChart already exist and accept an `items` array, the day summary is nearly free — just aggregate all logged items across all entries for that day and pass them in.

---

## Part 5 — Analytics / Summary Views

This section covers future capability — the Calendar tab can be built phase by phase.

### Phase 1 (MVP): Log + View
- Add/remove entries per day
- Day detail modal with nutrition summary
- Month/week calendar grid

### Phase 2: Weekly Summary
A "Week Summary" panel (accessible from the week view header) showing:
- Total kcal per day (bar chart across 7 days)
- Average %DV per nutrient for the week (same bar style as the meal sidebar)
- "Best day" and "Needs work" callouts

### Phase 3: Monthly Summary
A "Month Summary" button opening a modal/view showing:
- Day-by-day kcal/protein line chart (Recharts `<LineChart>`)
- Nutrient heatmap: rows = days, columns = key nutrients, color = %DV hit or miss
- Total logged days out of the month
- Most-logged foods / meals

### Phase 4: Trends
- Streak tracking (consecutive days logged)
- Compare this week vs last week
- Rolling 30-day nutrient averages

---

## Part 6 — Technical Integration Notes

### What changes in the existing codebase

**`components/MainView.tsx`** — add `'calendar'` to the `Tab` type and add a third `<TabButton label="Calendar" .../>`. Mount `<CalendarView data={data} />` when active. Update the localStorage key set to include the new value.

**New files needed:**
- `components/CalendarView.tsx` — top-level orchestrator (month/week toggle, navigation, calendar grid)
- `components/CalendarDayModal.tsx` — full-screen day detail modal
- `components/CalendarAddModal.tsx` — add entry modal (type chooser → search/select)
- `lib/foodLogStorage.ts` — CRUD for the `food_log` table (same pattern as `mealStorage.ts`)

**Existing components reused:**
- `FoodPickerModal` — reused as-is for the "Add Food" flow
- `MealNutritionSidebar` — reused in the day detail modal with aggregated items
- `MealNutritionChart` — reused in the day detail modal for the full chart view
- Preset/template pane logic from `MealPlanner.tsx` — extracted or duplicated for "Add Meal" flow

### Supabase changes

1. New table `food_log` (SQL above, Option A schema)
2. New index `idx_food_log_user_date`
3. RLS policy: `user_access_food_log` — same pattern as `meal_plans` (`auth.uid() = user_id`)

### State persistence pattern

Follow the established project pattern: lazy `useState(() => localStorage.getItem(...))` init + `useEffect` save. Keys:
- `np:calendar:view` — `'month'` | `'week'`
- `np:calendar:year` + `np:calendar:month` — current month in view
- `np:calendar:week` — ISO week start date when in week view

---

## Summary — Recommended Stack

| Dimension | Recommendation | Alternative |
|---|---|---|
| Database | Option A — Snapshot log | Option C (day doc) if analytics are deprioritized |
| Calendar layout | Option A — Month grid + week toggle | Option B (scrollable week list) for mobile-first |
| Add entry UX | Option A — Quick Add Modal (type chooser) | Option B (drawer) for fewer clicks |
| Day detail | Option A — Full-screen modal | Option B (right drawer) if side-by-side context matters |

The recommended stack prioritizes: reuse of existing components, clean analytics foundation, and a calendar UX that matches user mental models from mainstream calendar apps.

---

*Review this document and provide feedback before implementation begins.*
