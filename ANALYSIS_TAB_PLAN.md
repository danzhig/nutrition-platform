# Analysis Tab — Design Plan

**Context:** The "Calendar" main tab becomes **"Tracker"** with two sub-tabs: **Calendar** (existing) and **Analysis** (new). The Analysis tab reads from the same `food_log` data and the active DV profile to show trend views over time.

**Data pipeline recap:** Each `food_log` entry has `items[]` (food_id + amount_g). Nutrient values are looked up from the existing `foodsById` map (food_id → nutrients array), scaled by `amount_g / 100`. Already proven in `CalendarDayPanel`. The Analysis tab uses the same computation aggregated over ranges of days.

---

## Decision 1 — Sub-Tab Navigation Style

Three options for how the Calendar ↔ Analysis switcher looks inside the Tracker tab.

---

### Option 1-A: Pill Toggle (Recommended starting point)

```
┌──────────────────────────────────────────────────┐
│  TRACKER                                          │
│  ┌──────────────┬───────────────┐                 │
│  │  📅 Calendar  │  📊 Analysis  │  ← pill toggle  │
│  └──────────────┴───────────────┘                 │
└──────────────────────────────────────────────────┘
```

A rounded pill toggle (like the existing Month/Week toggle in the Calendar). Active side gets a violet fill, inactive is transparent. Sits just below the Tracker tab label, left-aligned.

**Pros:** Minimal; matches existing design language; familiar to user.
**Cons:** Less discoverable than a full tab bar.

---

### Option 1-B: Underline Tab Bar

```
┌──────────────────────────────────────────────────┐
│  TRACKER                                          │
│  Calendar     Analysis                            │
│  ──────────   ─ ─ ─ ─                            │
└──────────────────────────────────────────────────┘
```

Two underlined tabs, active tab gets a solid violet bottom border, inactive is grey. The full tab width makes it visually prominent and always visible.

**Pros:** Standard UI pattern; both tabs are equally visible; easy to add a third tab later (e.g., "Goals").
**Cons:** Takes more vertical space than the pill.

---

### Option 1-C: Sidebar Icon Navigation (Advanced)

Two icons in a left-margin column (calendar icon / bar-chart icon), collapsing to icons-only on narrow screens.

**Pros:** Scales well; always visible; modern feel.
**Cons:** Most divergent from current design; adds complexity.

**Recommendation:** Start with **1-B (underline tab bar)** — it's the most discoverable and matches how the outer tabs (Day Planner | Data View | Tracker) are styled.

---

## Decision 2 — Time Range Selector

How the user chooses the period to analyze.

---

### Option 2-A: Fixed Preset Buttons

```
[ Last 7 Days ]  [ Last 30 Days ]  [ Last 90 Days ]  [ All Time ]
```

Four buttons, always visible. Active button highlighted violet. No date picker. Simple and fast.

**Pros:** Zero friction; always-on; no date math for the user.
**Cons:** No custom range; "All Time" could be slow if the log is large.

---

### Option 2-B: Sliding Range Selector + Preset Shortcuts

A horizontal slider showing a date range window on a timeline. Above the slider: preset shortcut chips (`7d`, `30d`, `90d`, `YTD`). Dragging either end adjusts the window.

**Pros:** Precise; lets user compare specific months; visually shows data density.
**Cons:** More complex to build; mobile UX for sliders is tricky.

---

### Option 2-C: Month/Quarter Navigator

```
  ← Apr 2026   [ May 2026 ]   Jun 2026 →
     [ Weekly ]  [ Monthly ]  [ Quarterly ]
```

Like a calendar navigator — prev/next arrows cycle through the unit (week, month, quarter). A secondary toggle switches the granularity unit.

**Pros:** Familiar navigation; ties naturally to the Calendar sub-tab mental model.
**Cons:** Harder to do "last N days" or cross-year comparisons.

**Recommendation:** **2-A (fixed preset buttons)** for MVP; note that 2-B can be layered in later as an enhancement since 2-A buttons would still exist as shortcuts.

---

## Decision 3 — Main Layout Architecture

How the Analysis screen is organized spatially.

---

### Option 3-A: Stacked Dashboard (Recommended)

```
┌──────────────────────────────────────────────────────┐
│  [Time Range: 7d | 30d | 90d | All]  [Filter: Macros ▼] │
├──────────────────────────────────────────────────────┤
│  SUMMARY ROW (3-4 stat cards)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Avg Cal  │ │ Days Met │ │ Best Day │ │ At Risk │ │
│  │  1,840   │ │  18/30   │ │ May 3    │ │   3     │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
├──────────────────────────────────────────────────────┤
│  MAIN CHART (full width)                             │
│  [bar/line chart — chosen in Decision 4]             │
│                                                      │
├──────────────────────────────────────────────────────┤
│  SECONDARY CHARTS (2-col grid)                       │
│  ┌─────────────────────┐ ┌──────────────────────┐   │
│  │  Macro Trend Lines  │ │  Category Radar      │   │
│  └─────────────────────┘ └──────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  AT-RISK NUTRIENTS (collapsible list)                │
└──────────────────────────────────────────────────────┘
```

Single scrollable column. Summary stats at top → primary chart → secondary charts → detail list.

**Pros:** Scannable top-to-bottom; no hidden panels; works naturally on all screen sizes.
**Cons:** Long scroll if all sections are open.

---

### Option 3-B: Two-Column Split

```
┌─────────────────────────┬──────────────────────────┐
│  LEFT: Controls +        │  RIGHT: Primary Chart    │
│  Summary Stats          │                          │
│  ─────────────────────  │  (full height)           │
│  ○ Macros               │                          │
│  ○ Vitamins             │                          │
│  ○ Minerals             │                          │
│  ─────────────────────  │                          │
│  At-Risk Nutrients      │                          │
│  ▸ Iron         42% avg │                          │
│  ▸ Zinc         55% avg │                          │
└─────────────────────────┴──────────────────────────┘
```

Left pane: controls, filter, summary cards, at-risk list. Right pane: main chart. Clicking an at-risk nutrient updates the right chart to show that nutrient's trend.

**Pros:** No scrolling; interactive sidebar drives the chart; feels like a real analytics tool.
**Cons:** More complex state; left pane can get crowded; harder on narrow screens.

---

### Option 3-C: Tabbed Sections (within Analysis)

Analysis has its own inner nav: `Overview | Macros | Vitamins | Minerals | Trends`.

Each inner tab is a focused one-chart view. Very clean per-section but requires many clicks to explore.

**Pros:** Each view stays focused; easier to implement incrementally.
**Cons:** Buried content; user must know to switch tabs to find insights.

**Recommendation:** **3-A (Stacked Dashboard)** — most informative at a glance; user can scroll to depth they want; easiest to build correctly.

---

## Decision 4 — Primary Chart: Goal-Tracking View

The most important chart on the page. Shows how consumption tracks against DV goals.

---

### Option 4-A: Horizontal %DV Bar Chart (Average, per Nutrient)

```
Protein     ████████████████░░░░  84%  Goal: 100%
Iron        ████████░░░░░░░░░░░░  42%  ⚠
Vitamin C   ████████████████████  120% ✓
Calcium     ████████████░░░░░░░░  62%  ⚠
Zinc        ████████████░░░░░░░░  55%  ⚠
Fiber       ██████████████████░░  92%  ○
```

Each nutrient gets a horizontal bar showing average daily %DV over the selected period. A vertical reference line at 100%. Color: green ≥100%, amber 60–99%, red <60% (mirrors existing `rdaColorScale`). Sorted by %DV ascending (worst at top) or alphabetical toggle.

**Pros:** Instantly shows which nutrients are under- vs over-target; matches the sidebar design users already know; shows the full picture across all 50 nutrients.
**Cons:** Long list with all 52 nutrients; need a "show top N" or category filter.

**Enhancement:** Pair with a "period comparison" mode: two bars per nutrient (e.g., this month vs last month), shaded differently.

---

### Option 4-B: Daily Value Timeline (Line Chart per Nutrient)

```
%DV
120% ─────────────────────────────── goal line
100% ·····································
 80%         ╭────╮
 60%   ╭──╮  │    │   ╭──────╮
 40%───╯  ╰──╯    ╰───╯      ╰──────
      May 1       May 8        May 15
```

One line per selected nutrient showing daily %DV over time. User selects 1–5 nutrients to compare. Reference line at 100%. Hover tooltip shows date + value.

**Pros:** Shows trends and patterns (weekday vs weekend, improvement over time); great for understanding consistency, not just average.
**Cons:** Only works for a small number of nutrients simultaneously; single-nutrient view is less useful if the user hasn't already spotted a problem.

**Enhancement:** Show a rolling 7-day average as a thick line + daily values as faint dots.

---

### Option 4-C: Stacked Daily Bar Chart (Macro Breakdown by Day)

```
kcal
2500 │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← fat
2000 │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ← protein
1500 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← net carbs
     └──────────────────────────────────
      Mon  Tue  Wed  Thu  Fri  Sat  Sun
```

Each bar = one day. Stacked segments = macro contribution (Net Carbs / Protein / Fat / Fibre). A reference line = total calorie goal. Bars are colored using the macro colors from the existing donut chart (amber / violet / emerald / lime).

**Pros:** Great for calorie + macro split at a glance; shows empty days (no log) as missing bars; visually satisfying.
**Cons:** Only macro-level; doesn't cover micronutrients; less useful for vitamin/mineral tracking.

**Enhancement:** Click a bar → flies open the CalendarDayPanel for that date (cross-link to Calendar sub-tab).

---

### Option 4-D: Heatmap Grid (Days × Nutrients)

```
         Calories  Protein  Iron  Vit C  Calcium
May 1    ████      ████     ██    ████   ████
May 2    ████████  ██████   ████  ██     ████████
May 3    ██        ████     ██    ████   ██
May 4    (empty)   (empty)  ...   ...    ...
```

A 2D color grid: rows = days, columns = selected nutrients. Color = %DV met (same green/amber/red scale). Empty days are grey. Hovering a cell shows exact %DV.

**Pros:** High information density; shows patterns (e.g., iron always low on certain days); beautiful as a summary.
**Cons:** Hard to read for 52 nutrients; works best with a curated 8–12 nutrient selection; more complex to build.

**Recommendation:** **4-A (Horizontal %DV bars) as the primary chart, with 4-B (timeline) as a drill-down mode.** The horizontal bars show the full nutritional picture immediately; timeline activates when the user clicks a specific nutrient to investigate its trend.

---

## Decision 5 — Secondary Charts (Pick any combination)

These appear below the primary chart in a 2-column grid (or stacked on mobile).

---

### Option 5-A: Macro Trend Lines
A 4-line chart (Net Carbs / Protein / Fat / Fibre) showing %DV per day over the selected period. Rolling 7-day average shown as thicker lines. Quick read of macro consistency.

---

### Option 5-B: Category Radar (Weekly Average)
The existing `MealCategoryRadar` adapted to show average %DV per nutrient category (Macros / Vitamins / Minerals / Fatty Acids / Amino Acids) for the chosen period. Instant visual of nutritional balance.

---

### Option 5-C: Calorie Distribution Histogram
A bar chart where x = calories consumed that day (binned: 0–500, 500–1000, etc.) and y = number of days. Shows whether calorie intake is consistent or highly variable.

---

### Option 5-D: Day-of-Week Pattern Chart
Groups log data by day of week (Mon–Sun). Shows average %DV or average calories per weekday. Reveals weekend vs weekday eating patterns.

```
Mon  ████████████  1,840 kcal avg
Tue  ████████████  1,920 kcal avg
Wed  ████████████  1,790 kcal avg
Sat  ████████████████  2,300 kcal avg  ← weekend spike
Sun  ████████████████  2,150 kcal avg
```

---

### Option 5-E: Nutrient Streak Tracker
For each nutrient: how many consecutive days did the user hit ≥80% of their DV goal? Shows as a horizontal bar of colored day-dots (green/amber/grey). Gamification-adjacent; motivating for daily logging.

---

### Option 5-F: Cumulative Intake vs Goal (Running Total)
A line chart showing cumulative intake of a selected nutrient vs cumulative goal (goal = daily target × days elapsed). Good for understanding if the user is running a deficit.

---

**Recommended secondary set:** **5-A (Macro Trends) + 5-B (Category Radar)** for the initial build. Both reuse existing chart infrastructure and provide complementary macro/micro views.

---

## Decision 6 — Nutrient / Category Filter

How the user controls which nutrients appear in the main chart.

---

### Option 6-A: Category Chip Filter Bar (Recommended)

```
[ All ]  [ Macros ]  [ Vitamins ]  [ Minerals ]  [ Fatty Acids ]  [ Amino Acids ]
```

A row of pill chips across the top. Active chip highlighted violet. Filters the nutrient list in the primary chart. "All" shows up to 20 by default (worst performers first); category chips show only that group.

**Pros:** One-click; low friction; matches existing FilterPanel chip style.
**Cons:** "All" with 52 nutrients is overwhelming; need a "show N worst" default.

---

### Option 6-B: Multi-Select Dropdown Checklist

A "Nutrients ▼" dropdown opens a checklist of all 52 nutrients, grouped by category. User checks/unchecks individual nutrients. Selected nutrient count shown on the button.

**Pros:** Precise control; user can build custom views.
**Cons:** Overhead for casual users; 52 checkboxes is too long without virtualization.

---

### Option 6-C: Smart "At-Risk" Auto-Filter + Manual Override

The chart automatically shows the 10 nutrients with the lowest average %DV over the period. A toggle switches between "At Risk" (auto) and "All" (full list). A secondary control lets the user pin specific nutrients.

**Pros:** Default view is immediately useful without any setup; shows what matters.
**Cons:** Less transparent — user might not understand why certain nutrients are shown.

**Recommendation:** **6-A (category chips) with a default of "Macros" selected** so the first view is clean and meaningful. The user can click "All" or another category to see more.

---

## Decision 7 — At-Risk / Summary Panel

A panel that surfaces actionable insights without requiring the user to read every chart.

---

### Option 7-A: Summary Stat Cards (above the main chart)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Avg Daily   │  │  Days Logged │  │ Nutrients    │  │  Nutrients   │
│  Calories    │  │              │  │  On Track    │  │  At Risk     │
│   1,840 kcal │  │  18 / 30     │  │  38 / 52    │  │  ⚠ 8        │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

Four stat cards in a row. "At Risk" card is amber/red. Clicking "At Risk" scrolls to or filters the main chart to show only those nutrients.

---

### Option 7-B: Collapsible Insight List (below the main chart)

```
▼ Insights (3 items)
  ⚠ Iron: averaging 42% DV — consistently below goal for 28 days
  ⚠ Zinc: averaging 55% DV — trending downward over last 2 weeks
  ✓ Vitamin C: averaging 118% DV — goal met on 26/30 days
```

A collapsible section that surfaces 3–5 auto-generated text insights based on the data. Each insight has an icon, a nutrient name (clickable to drill into the timeline), and a plain-English description.

**Recommendation:** **7-A (stat cards) at the top + 7-B (insight list) at the bottom.** The cards give instant KPIs; the insight list provides context without requiring chart literacy.

---

## Decision 8 — Tooltip & Drill-Down Interaction

What happens when the user hovers or clicks chart elements.

---

### Option 8-A: Rich Hover Tooltips Only

Hovering a bar or point shows a floating tooltip with:
- Nutrient name
- Average %DV value + raw amount (e.g., "Protein: 84% DV — 67g avg/day")
- DV goal (e.g., "Goal: 80g")
- Period context (e.g., "Over last 30 days")

No click-through behavior. Simple and low-friction.

---

### Option 8-B: Click-Through to Timeline Drill-Down

Clicking a nutrient bar in the primary chart switches the page into a single-nutrient detail mode:
- The main chart becomes a daily timeline for that nutrient
- Shows each day's %DV as a bar or line
- A "← Back to Overview" button returns to the full chart
- The timeline bars link back to the Calendar day panel when clicked

This creates a two-level hierarchy: Overview → Nutrient Timeline → Calendar Day.

**Recommendation:** **8-B (click-through drill-down)** — it turns the Analysis tab into a genuinely investigative tool. Overview → click a weak nutrient → see which specific days pulled it down → click a day → open Calendar for that date. The full chain is clear and useful.

---

## Decision 9 — Visual Style & Microinteractions

---

### Option 9-A: Consistent Slate-900 Dark (Match existing)

Charts use the existing dark slate-900 background. Bar fills use the same `rdaColorScale` colors (green/amber/red based on %DV). Grid lines are slate-700. Axis labels are slate-400. Reference line at 100% is white dashed.

This matches the heatmap and nutrition sidebar — zero visual disruption for the user.

---

### Option 9-B: Lighter Card-Based Panels

Each chart section gets a slate-800 card with a slight border (slate-700). Charts have a slightly lighter feel. Category chips and buttons use the same violet accent. Slightly more "dashboard" aesthetic vs the dense dark-mode table feel.

**Recommendation:** **9-B (card-based panels)** — the Analysis tab is a different use context (reflective analytics vs active planning), so a slightly airier card layout helps distinguish it from the Calendar view while maintaining the dark palette.

---

## Decision 10 — Tooltips on Nutrient Names

Since many users may not know what "Pantothenic Acid" or "Manganese" is, tooltip behavior on nutrient labels matters.

---

### Option 10-A: Hover Tooltip on Nutrient Name

Hovering the nutrient name label in the chart shows the existing NutrientInfoCard (body role, deficiency/excess info). Already built — just needs to be wired in.

---

### Option 10-B: Click to Open NutrientInfoCard

Clicking the label opens the floating NutrientInfoCard. Less likely to be triggered accidentally while scrolling.

**Recommendation:** **10-B (click to open NutrientInfoCard)** — reuses a fully-built component and gives users who want context a clear path to it.

---

## Summary Decision Table

| Decision | Recommended Option | Notes |
|---|---|---|
| **Sub-tab navigation** | 1-B Underline tab bar | Matches outer tab style |
| **Time range selector** | 2-A Fixed preset buttons (7d / 30d / 90d / All) | Lowest friction MVP |
| **Layout** | 3-A Stacked dashboard | Scrollable; no hidden panels |
| **Primary chart** | 4-A Horizontal %DV bars (avg) | Full nutritional picture at a glance |
| **Primary chart drill-down** | 4-B Timeline on click | Activated per-nutrient via click |
| **Secondary charts** | 5-A Macro trends + 5-B Category radar | Reuse existing chart code |
| **Nutrient filter** | 6-A Category chip bar (default: Macros) | One-click; familiar UI |
| **Summary panel** | 7-A Stat cards + 7-B insight list | Cards at top, insights at bottom |
| **Tooltip/interaction** | 8-B Click-through drill-down | Investigative; links to Calendar |
| **Visual style** | 9-B Slate-800 card panels | Dashboard feel; airy but still dark |
| **Nutrient name tooltips** | 10-B Click → NutrientInfoCard | Reuses existing component |

---

## Full Recommended Layout (Assembled)

```
TRACKER
─────────────────────────────────────────────────────
  Calendar     Analysis
  ─────────    ─ ─ ─ ─

─────────────────────────────────────────────────────
  [7 Days]  [30 Days]  [90 Days]  [All Time]    May 2026

  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │ Avg Daily  │  │  Logged    │  │ On Track   │  │  At Risk   │
  │  1,840 cal │  │  18 / 30   │  │   38/52    │  │   ⚠  8    │
  └────────────┘  └────────────┘  └────────────┘  └────────────┘

─────────────────────────────────────────────────────
  AVERAGE %DV — LAST 30 DAYS

  [ All ]  [ Macros ]  [ Vitamins ]  [ Minerals ]  [ Fatty Acids ]

  Iron            ██████░░░░░░░░░░░░░░   42%  ⚠
  Zinc            ████████░░░░░░░░░░░░   55%  ⚠
  Calcium         ██████████░░░░░░░░░░   62%  ⚠
  Fiber           ████████████████░░░░   91%  ○
  Protein         ████████████████░░░░   84%  ○
  Vitamin C       ████████████████████  118%  ✓
  Fat             █████████████████░░░   95%  ○
  Net Carbs       ████████████████████  107%  ✓
                  ────────────── 100% goal

─────────────────────────────────────────────────────
  [Macro Trends: 30 Days]         [Category Balance]
  ┌─────────────────────────┐     ┌─────────────────┐
  │  line chart: 4 macros   │     │  pentagon radar │
  │  over time              │     │  (avg %DV by    │
  │                         │     │   category)     │
  └─────────────────────────┘     └─────────────────┘

─────────────────────────────────────────────────────
  ▼ Insights
  ⚠ Iron: 42% avg DV — below goal for all 30 days
  ⚠ Zinc: 55% avg DV — trending downward, -8% vs prior period
  ✓ Vitamin C: 118% avg DV — goal met 26/30 days
```

**Drill-down state (after clicking Iron bar):**
```
  ← Back to Overview                    Iron — Last 30 Days

  Daily %DV
  120%
  100% ──────────────────────────────── goal
   80%
   60%    ╭─────╮       ╭──────╮
   40% ───╯     ╰───────╯      ╰────────────
        May 1         May 8         May 15
```

---

## Implementation Notes

### Data Computation
- Reuse `getEntriesForDateRange()` from `lib/foodLogStorage.ts` with a wider range.
- Per-day nutrient sum: `items.reduce((sum, item) => sum + foodsById.get(item.food_id)?.nutrients[nutrientId] * item.amount_g / 100, 0)`.
- Average %DV = (sum of daily totals / days logged) / rdaProfile[nutrientName].
- "Days logged" = days with at least one food_log entry (not all calendar days in range).

### State Persistence
- Follow existing pattern: `localStorage` keys under `np:analysis:*` (time range selection, active category chip, drill-down state).

### Chart Library
- Recharts `BarChart` (horizontal) + `LineChart` are the right tools.
- Horizontal bar chart: use `layout="vertical"` on `BarChart`, `XAxis type="number"`, `YAxis type="category"`.
- `ReferenceLine` at x=100 for the goal line (already used in `MealNutritionChart.tsx`).
- `LineChart` for the trend/drill-down view (new import, same bundle).

### Complexity Estimate
- **Low complexity:** Sub-tab nav rename + restructure (CalendarView.tsx + MainView.tsx)
- **Medium complexity:** Primary %DV bar chart with filter chips + stat cards
- **Medium complexity:** Drill-down timeline per nutrient
- **Higher complexity:** Insight text generation (data aggregation + threshold logic)
- **Reuse available:** Category radar (adapt `MealCategoryRadar`), color scale (`rdaColorScale`), NutrientInfoCard

### Suggested Build Order
1. Rename tab, add sub-tab nav, wire Analysis shell (no content yet)
2. Add time range selector + data aggregation hook
3. Primary horizontal %DV bar chart + category filter chips
4. Stat cards (avg calories, days logged, on track count, at-risk count)
5. Click-to-drill-down timeline
6. Macro trend line chart (secondary)
7. Category radar (secondary)
8. Insight list generation
9. Click-through to CalendarDay from timeline bars
