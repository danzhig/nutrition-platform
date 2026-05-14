export interface TourStep {
  target: string | null
  title: string
  body: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export const SALMON_MEAL_TOUR: TourStep[] = [
  {
    target: '[data-tour="day-planner-tab"]',
    title: 'Welcome to the Day Builder',
    body: "Let's build a Salmon with Mashed Potatoes meal together — step by step. Click Next when you're ready to begin.",
    position: 'bottom',
  },
  {
    target: '[data-tour="add-meal-btn"]',
    title: 'Step 1 — Add a Meal',
    body: "Click '+ Add Meal' to create a new meal slot. Then click Next.",
    position: 'bottom',
  },
  {
    target: '[data-tour="meal-name-btn"]',
    title: 'Step 2 — Name Your Meal',
    body: "Click the meal name (e.g. 'Breakfast') to edit it. Type 'Salmon & Mashed Potatoes', then press Enter. Click Next when done.",
    position: 'bottom',
  },
  {
    target: '[data-tour="meal-add-food-btn"]',
    title: 'Step 3 — Open the Food Browser',
    body: "Click '+ Add food' to open the ingredient browser. Then click Next.",
    position: 'top',
  },
  {
    target: '[data-tour="food-picker-search"]',
    title: 'Step 4 — Add Salmon',
    body: "The food browser is open. Type 'Salmon' in the search bar and click the result to add it to your meal. Then click Next.",
    position: 'bottom',
  },
  {
    target: '[data-tour="food-picker-search"]',
    title: 'Step 5 — Add Potato',
    body: "Clear the search and type 'Potato'. Click 'Potato (raw)' to add it. Then click Next.",
    position: 'bottom',
  },
  {
    target: '[data-tour="food-picker-search"]',
    title: 'Step 6 — Add Olive Oil',
    body: "Search for 'Olive Oil' and click it to add to the meal. Then click Next.",
    position: 'bottom',
  },
  {
    target: '[data-tour="food-picker-search"]',
    title: 'Step 7 — Add a Spice',
    body: "Search for 'Black Pepper' (or any spice you like) and add it. Then close the food picker with the Done or ✕ button. Click Next.",
    position: 'bottom',
  },
  {
    target: '[data-tour="meal-items-list"]',
    title: 'Step 8 — Reduce the Potato Portion',
    body: "Find 'Potato' in your ingredient list. Click the 'g' button next to it to switch to grams mode, then change the value to 120 for a smaller portion. Click Next when done.",
    position: 'right',
  },
  {
    target: '[data-tour="nutrition-sidebar"]',
    title: 'Step 9 — Your Daily Nutrition Coverage',
    body: "These %DV bars show how your meal covers your daily nutritional needs. Notice how the bars update in real time as you add and adjust ingredients.",
    position: 'left',
  },
  {
    target: '[data-tour="meal-name-btn"]',
    title: 'Step 10 — Confirm the Meal Name',
    body: "Make sure the meal is named 'Salmon & Mashed Potatoes'. Click the name to rename it if needed, then click Next.",
    position: 'bottom',
  },
  {
    target: '[data-tour="save-template-btn"]',
    title: 'Step 11 — Save as a Template',
    body: "Click 'Save template' to save this meal for future use. You'll find it under Presets → My Templates anytime you want to reuse it.",
    position: 'bottom',
  },
  {
    target: null,
    title: 'All Done!',
    body: "Your Salmon & Mashed Potatoes meal is saved as a template. You can load it any time from the Presets panel under My Templates. Enjoy your meal planning!",
    position: 'center',
  },
]
