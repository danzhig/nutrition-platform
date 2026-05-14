export interface TourStep {
  target: string | null
  title: string
  body: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  // When set, the step auto-advances when this custom event fires (no Next button shown).
  advanceOn?: string
}

export const SALMON_MEAL_TOUR: TourStep[] = [
  {
    target: '[data-tour="day-planner-tab"]',
    title: 'Welcome to the Day Builder',
    body: "Let's build a Salmon with Mashed Potatoes meal together. Each step will advance automatically once you complete the highlighted action. Click Next to begin.",
    position: 'bottom',
  },
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
    body: "Click the meal name to edit it. Type whatever you like (e.g. 'Salmon & Mashed Potatoes'), then press Enter. Click Next when done.",
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
    body: "These %DV bars update in real time as you build your meal. Notice coverage across vitamins, minerals, and macros. Click Next to continue.",
    position: 'left',
  },
  {
    target: '[data-tour="save-template-btn"]',
    title: 'Step 11 — Save as a Template',
    body: "Click 'Save template' to save this meal. You'll find it under Presets → My Templates for quick reuse.",
    position: 'bottom',
    advanceOn: 'np:tour:template-saved',
  },
  {
    target: null,
    title: 'All Done!',
    body: "Your Salmon & Mashed Potatoes meal is saved as a template. Find it anytime under Presets → My Templates.",
    position: 'center',
  },
]
