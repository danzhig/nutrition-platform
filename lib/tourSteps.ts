export interface TourStep {
  target: string | null
  title: string
  body: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  // When set, Next executes these actions before advancing to the next step.
  action?: TourActionStep[]
}

export type TourActionStep =
  | { type: 'click'; selector: string }
  | { type: 'type'; selector: string; text: string; charDelay?: number }
  | { type: 'wait'; duration: number }
  | { type: 'key'; selector: string; key: string }

export const SALMON_MEAL_TOUR: TourStep[] = [
  // ── Welcome ────────────────────────────────────────────────────────────────
  {
    target: '[data-tour="day-planner-tab"]',
    title: 'Welcome to the Day Builder — Demo Tour',
    body: "Watch as a Salmon with Mashed Potatoes meal is built step by step. Click Next at any time to advance.",
    position: 'bottom',
  },

  // ── Clear existing data ────────────────────────────────────────────────────
  {
    target: '#tour-new-plan-btn',
    title: 'Start Fresh',
    body: "Clearing any existing meals so we start with a clean slate.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '#tour-new-plan-btn' },
    ],
  },

  // ── Name the plan ──────────────────────────────────────────────────────────
  {
    target: '[data-tour="plan-dropdown-container"]',
    title: 'Name Your Plan',
    body: "Opening the plan editor and naming this plan 'Example Plan'.",
    position: 'right',
    action: [
      { type: 'click', selector: '[data-tour="plan-name-btn"]' },
      { type: 'wait', duration: 350 },
      { type: 'type', selector: '[data-tour="plan-name-input"]', text: 'Example Plan' },
      { type: 'wait', duration: 300 },
      { type: 'click', selector: '[data-tour="plan-name-btn"]' },
      { type: 'wait', duration: 200 },
    ],
  },

  // ── Build the meal ─────────────────────────────────────────────────────────
  {
    target: '[data-tour="add-meal-btn"]',
    title: 'Add a Meal',
    body: "Adding a new meal slot to the plan.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-tour="add-meal-btn"]' },
      { type: 'wait', duration: 200 },
    ],
  },
  {
    target: '[data-tour="meal-name-btn"]',
    title: 'Name Your Meal',
    body: "Clicking the meal name and typing 'Salmon & Mashed Potatoes'.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-tour="meal-name-btn"]' },
      { type: 'wait', duration: 250 },
      { type: 'type', selector: '[data-tour="meal-name-input"]', text: 'Salmon & Mashed Potatoes' },
      { type: 'wait', duration: 200 },
      { type: 'key', selector: '[data-tour="meal-name-input"]', key: 'Enter' },
      { type: 'wait', duration: 200 },
    ],
  },
  {
    target: '[data-tour="meal-add-food-btn"]',
    title: 'Open the Food Browser',
    body: "Opening the ingredient browser to start adding foods.",
    position: 'top',
    action: [
      { type: 'click', selector: '[data-tour="meal-add-food-btn"]' },
      { type: 'wait', duration: 400 },
    ],
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Add Salmon',
    body: "Searching for Atlantic Salmon and adding it to the meal.",
    position: 'right',
    action: [
      { type: 'type', selector: '[data-tour="food-picker-search"]', text: 'Salmon' },
      { type: 'wait', duration: 600 },
      { type: 'click', selector: '[data-food-name*="salmon"]' },
      { type: 'wait', duration: 300 },
    ],
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Add Potato',
    body: "Searching for Potato and adding a medium portion.",
    position: 'right',
    action: [
      { type: 'type', selector: '[data-tour="food-picker-search"]', text: 'Potato' },
      { type: 'wait', duration: 600 },
      { type: 'click', selector: '[data-food-name*="potato"] [data-size-key="m"]' },
      { type: 'wait', duration: 300 },
    ],
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Add Olive Oil',
    body: "Searching for Olive Oil and adding it.",
    position: 'right',
    action: [
      { type: 'type', selector: '[data-tour="food-picker-search"]', text: 'Olive Oil' },
      { type: 'wait', duration: 600 },
      { type: 'click', selector: '[data-food-name*="olive oil"]' },
      { type: 'wait', duration: 300 },
    ],
  },
  {
    target: '[data-tour="food-picker-modal"]',
    title: 'Add a Spice',
    body: "Searching for Black Pepper and adding it for seasoning.",
    position: 'right',
    action: [
      { type: 'type', selector: '[data-tour="food-picker-search"]', text: 'Black Pepper' },
      { type: 'wait', duration: 600 },
      { type: 'click', selector: '[data-food-name*="black pepper"]' },
      { type: 'wait', duration: 300 },
    ],
  },
  {
    target: '[data-tour="food-picker-done-btn"]',
    title: 'Close the Food Browser',
    body: "All four ingredients added. Closing the food browser.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-tour="food-picker-done-btn"]' },
      { type: 'wait', duration: 300 },
    ],
  },
  {
    target: '[data-tour="meal-items-list"]',
    title: 'Adjust the Potato Portion',
    body: "Switching the Potato to grams mode and setting it to 120g.",
    position: 'right',
    action: [
      { type: 'click', selector: '[data-food-name*="potato"] [data-tour="mode-g"]' },
      { type: 'wait', duration: 300 },
      { type: 'type', selector: '[data-food-name*="potato"] [data-tour="grams-input"]', text: '120', charDelay: 120 },
      { type: 'wait', duration: 200 },
    ],
  },
  {
    target: '[data-tour="nutrition-sidebar"]',
    title: 'Your Nutrition Coverage',
    body: "These %DV bars update in real time as you adjust ingredients — showing how your meal covers vitamins, minerals, and macros.",
    position: 'left',
  },
  {
    target: '[data-tour="save-template-btn"]',
    title: 'Save as a Template',
    body: "Saving this meal as a reusable template. It will appear under Presets → My Templates.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-tour="save-template-btn"]' },
      { type: 'wait', duration: 600 },
    ],
  },

  // ── Presets ────────────────────────────────────────────────────────────────
  {
    target: '[data-tour="presets-btn"]',
    title: 'Explore Preset Meals',
    body: "Opening the Presets panel — 113 curated meals across 12 categories.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-tour="presets-btn"]' },
      { type: 'wait', duration: 400 },
    ],
  },
  {
    target: '[data-tour="preset-categories"]',
    title: 'Filter by Category',
    body: "These pills filter presets by type. Selecting High Protein to narrow the list.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-preset-cat="High Protein"]' },
      { type: 'wait', duration: 400 },
    ],
  },
  {
    target: '[data-tour="presets-list"]',
    title: 'Add a Preset Meal',
    body: "Each preset shows a complement score — how well it fills your remaining nutritional gaps. Adding the first one.",
    position: 'right',
    action: [
      { type: 'click', selector: '[data-tour="preset-meal-item"]' },
      { type: 'wait', duration: 400 },
    ],
  },
  {
    target: '[data-tour="save-plan-btn"]',
    title: 'Save Your Plan',
    body: "Saving the full day plan so it can be reloaded any time.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-tour="save-plan-btn"]' },
      { type: 'wait', duration: 600 },
    ],
  },

  // ── Charts ─────────────────────────────────────────────────────────────────
  {
    target: '[data-tour="charts-view-tab"]',
    title: 'Open the Charts View',
    body: "Switching to the visual breakdown of your day's nutrition.",
    position: 'bottom',
    action: [
      { type: 'click', selector: '[data-tour="charts-view-tab"]' },
      { type: 'wait', duration: 400 },
    ],
  },
  {
    target: '[data-tour="nutrition-bar-chart"]',
    title: 'Nutrient Bar Chart',
    body: "Every nutrient shown as % of Daily Value, colour-coded by category. Bars crossing 100% are highlighted. Hover any bar for the exact amount.",
    position: 'bottom',
  },
  {
    target: '[data-tour="nutrition-radar-chart"]',
    title: 'Category Radar',
    body: "Average %DV across five food categories. Gradient edges show where coverage is strong or weak.",
    position: 'right',
  },
  {
    target: '[data-tour="nutrition-donut-chart"]',
    title: 'Macro Donut',
    body: "Inner ring: caloric split across Net Carbs, Fibre, Protein, and Fat. Outer ring: which foods contribute most to each macro.",
    position: 'left',
  },

  // ── Done ───────────────────────────────────────────────────────────────────
  {
    target: null,
    title: "That's the full tour!",
    body: "You've seen the Day Builder, Preset Meals, Plan saving, and Charts. The demo data will be cleared now so you start fresh. Click Finish to exit.",
    position: 'center',
  },
]
