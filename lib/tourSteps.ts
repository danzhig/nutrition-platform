export interface TourStep {
  target: string | null
  title: string
  body: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  // When set, the step auto-advances when this custom event fires (no Next button shown).
  advanceOn?: string
}

export const SALMON_MEAL_TOUR: TourStep[] = [
  // ── Welcome ────────────────────────────────────────────────────────────────
  {
    target: '[data-tour="day-planner-tab"]',
    title: 'Welcome to the Day Builder',
    body: "Let's build a Salmon with Mashed Potatoes meal together. Each step advances automatically once you complete the highlighted action. Click Next to begin.",
    position: 'bottom',
  },

  // ── Build the meal ─────────────────────────────────────────────────────────
  {
    target: '[data-tour="add-meal-btn"]',
    title: 'Step 1 — Add a Meal',
    body: "Click '+ Add Meal' to create a new meal slot.",
    position: 'bottom',
    advanceOn: 'np:tour:meal-added',
  },
  {
    target: '[data-tour="meal-name-btn"]',
    title: 'Step 2 — Name Your Meal',
    body: "Click the meal name to edit it. Type whatever you like — for example 'Salmon & Mashed Potatoes' — then press Enter. Click Next when done.",
    position: 'bottom',
  },
  {
    target: '[data-tour="meal-add-food-btn"]',
    title: 'Step 3 — Open the Food Browser',
    body: "Click '+ Add food' to open the ingredient browser.",
    position: 'top',
    advanceOn: 'np:tour:food-picker-opened',
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Step 4 — Add Salmon',
    body: "Type 'Salmon' in the search bar and click a salmon result to add it.",
    position: 'right',
    advanceOn: 'np:tour:food-added',
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Step 5 — Add Potato',
    body: "Clear the search, type 'Potato', and click 'Potato (raw)' to add it.",
    position: 'right',
    advanceOn: 'np:tour:food-added',
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Step 6 — Add Olive Oil',
    body: "Search for 'Olive Oil' and click it to add to the meal.",
    position: 'right',
    advanceOn: 'np:tour:food-added',
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Step 7 — Add a Spice',
    body: "Search for 'Black Pepper' (or any spice) and click it to add.",
    position: 'right',
    advanceOn: 'np:tour:food-added',
  },
  {
    target: '[data-tour="food-picker-done-btn"]',
    title: 'Step 8 — Close the Food Browser',
    body: "All four ingredients added! Click 'Done' to close the food browser.",
    position: 'bottom',
    advanceOn: 'np:tour:food-picker-closed',
  },
  {
    target: '[data-tour="meal-items-list"]',
    title: 'Step 9 — Reduce the Potato Portion',
    body: "Find 'Potato' in the list. Click the 'g' button next to it to switch to grams mode, then change the value to 120 for a smaller portion. Click Next when done.",
    position: 'right',
  },
  {
    target: '[data-tour="nutrition-sidebar"]',
    title: 'Step 10 — Your Nutrition Coverage',
    body: "These %DV bars update in real time as you adjust ingredients — showing how your meal covers vitamins, minerals, and macros. Click Next to continue.",
    position: 'left',
  },
  {
    target: '[data-tour="save-template-btn"]',
    title: 'Step 11 — Save as a Template',
    body: "Click 'Save template' to save this meal. You'll find it under Presets → My Templates for quick reuse.",
    position: 'bottom',
    advanceOn: 'np:tour:template-saved',
  },

  // ── Presets ────────────────────────────────────────────────────────────────
  {
    target: '[data-tour="presets-btn"]',
    title: 'Step 12 — Explore Preset Meals',
    body: "The Presets panel has 113 curated meals across 12 categories. Click '⊞ Presets' to open it.",
    position: 'bottom',
    advanceOn: 'np:tour:presets-opened',
  },
  {
    target: '[data-tour="preset-categories"]',
    title: 'Step 13 — Filter by Category',
    body: "These pills filter presets by meal type — Salads, High Protein, Breakfast, Keto, Soups, and more. Click any category to explore it. Click Next when ready.",
    position: 'bottom',
  },
  {
    target: '[data-tour="presets-list"]',
    title: 'Step 14 — Add a Preset Meal',
    body: "Each preset shows a complement score — how well it fills your remaining nutritional gaps. Click any meal to add it to your day plan.",
    position: 'right',
    advanceOn: 'np:tour:preset-loaded',
  },
  {
    target: '[data-tour="save-plan-btn"]',
    title: 'Step 15 — Save Your Plan',
    body: "Click 'Save Plan' to save your full day plan. It will appear in the Plan dropdown so you can reload it any time.",
    position: 'bottom',
    advanceOn: 'np:tour:plan-saved',
  },

  // ── Charts ─────────────────────────────────────────────────────────────────
  {
    target: '[data-tour="charts-view-tab"]',
    title: 'Step 16 — Open the Charts View',
    body: "Now let's see a visual breakdown of your day's nutrition. Click '▦ Charts'.",
    position: 'bottom',
    advanceOn: 'np:tour:charts-opened',
  },
  {
    target: '[data-tour="nutrition-bar-chart"]',
    title: 'Step 17 — Nutrient Bar Chart',
    body: "This chart shows every nutrient as a % of your Daily Value, colour-coded by category. Bars crossing the 100% line are highlighted. Hover any bar for the exact amount. Click Next to continue.",
    position: 'bottom',
  },
  {
    target: '[data-tour="nutrition-radar-chart"]',
    title: 'Step 18 — Category Radar',
    body: "The radar shows average %DV across five food categories — Macronutrients, Vitamins, Minerals, Fatty Acids, and Amino Acids. Gradient edges indicate where coverage is strong or weak. Click Next.",
    position: 'right',
  },
  {
    target: '[data-tour="nutrition-donut-chart"]',
    title: 'Step 19 — Macro Donut',
    body: "The inner ring shows your caloric split across Net Carbs, Fibre, Protein, and Fat. The outer ring shows which foods contribute most to each macro. Click Next to finish.",
    position: 'left',
  },

  // ── Done ───────────────────────────────────────────────────────────────────
  {
    target: null,
    title: "That's the full tour!",
    body: "You've seen the Day Builder, Preset Meals, Plan saving, and Charts. The demo data will be cleared now so you start with a clean slate. Click Finish to exit.",
    position: 'center',
  },
]
