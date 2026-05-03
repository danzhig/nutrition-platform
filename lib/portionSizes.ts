/**
 * Standard serving sizes for all 212 foods, keyed by food_id.
 * Sources: USDA standard reference portions, common culinary conventions.
 *
 * grams  — serving weight used for per-serving calculations
 * label  — human-readable description shown in the Serving column
 *
 * Per-serving value = (value_per_100g / 100) × grams
 */
export interface PortionSize {
  grams: number
  label: string
}

export const PORTION_SIZES: Record<number, PortionSize> = {
  // ── Fruits ────────────────────────────────────────────────────────────────
  1:  { grams: 182, label: '1 medium' },        // Apple
  2:  { grams: 118, label: '1 medium' },        // Banana
  3:  { grams: 131, label: '1 medium' },        // Orange
  4:  { grams: 152, label: '1 cup' },           // Strawberry
  5:  { grams: 148, label: '1 cup' },           // Blueberry
  6:  { grams: 165, label: '1 cup sliced' },    // Mango
  7:  { grams: 150, label: '1 medium' },        // Avocado
  8:  { grams: 280, label: '2 cups diced' },    // Watermelon
  9:  { grams: 165, label: '1 cup chunks' },    // Pineapple
  10: { grams: 92,  label: '1 cup' },           // Grape
  11: { grams: 150, label: '1 medium' },        // Peach
  12: { grams: 178, label: '1 medium' },        // Pear
  13: { grams: 138, label: '1 cup' },           // Cherry
  14: { grams: 76,  label: '1 medium' },        // Kiwi
  15: { grams: 58,  label: '1 medium' },        // Lemon
  16: { grams: 44,  label: '1 medium' },        // Lime
  17: { grams: 236, label: '½ fruit' },         // Grapefruit
  18: { grams: 145, label: '1 cup cubed' },     // Papaya
  19: { grams: 66,  label: '1 medium' },        // Plum
  20: { grams: 35,  label: '1 medium' },        // Apricot
  21: { grams: 24,  label: '1 date' },          // Date (Medjool)
  22: { grams: 50,  label: '1 medium' },        // Fig
  23: { grams: 87,  label: '½ fruit' },         // Pomegranate
  24: { grams: 123, label: '1 cup' },           // Raspberry
  25: { grams: 144, label: '1 cup' },           // Blackberry
  26: { grams: 110, label: '1 cup' },           // Cranberry
  27: { grams: 177, label: '1 cup diced' },     // Cantaloupe
  28: { grams: 177, label: '1 cup diced' },     // Honeydew Melon
  29: { grams: 18,  label: '1 fruit' },         // Passion Fruit
  30: { grams: 55,  label: '1 medium' },        // Guava

  // ── Vegetables ────────────────────────────────────────────────────────────
  31: { grams: 91,  label: '1 cup chopped' },   // Broccoli
  32: { grams: 61,  label: '1 medium' },        // Carrot
  33: { grams: 130, label: '1 medium' },        // Sweet Potato
  34: { grams: 213, label: '1 medium' },        // Potato
  35: { grams: 123, label: '1 medium' },        // Tomato
  36: { grams: 119, label: '½ medium' },        // Cucumber
  37: { grams: 119, label: '1 medium' },        // Red Bell Pepper
  38: { grams: 110, label: '1 medium' },        // Onion
  39: { grams: 3,   label: '1 clove' },         // Garlic
  40: { grams: 40,  label: '1 stalk' },         // Celery
  41: { grams: 89,  label: '1 cup shredded' },  // White Cabbage
  42: { grams: 107, label: '1 cup' },           // Cauliflower
  43: { grams: 124, label: '1 medium' },        // Zucchini
  44: { grams: 82,  label: '1 cup cubed' },     // Eggplant
  45: { grams: 134, label: '5 spears' },        // Asparagus
  46: { grams: 136, label: '1 medium' },        // Beetroot
  47: { grams: 145, label: '1 cup' },           // Peas (Green)
  48: { grams: 110, label: '1 cup' },           // Green Beans
  49: { grams: 154, label: '1 ear' },           // Corn
  50: { grams: 245, label: '1 cup' },           // Pumpkin
  51: { grams: 205, label: '1 cup cubed' },     // Butternut Squash
  52: { grams: 88,  label: '1 cup' },           // Brussels Sprouts
  53: { grams: 70,  label: '1 cup sliced' },    // Mushroom (White Button)
  54: { grams: 120, label: '1 medium' },        // Artichoke
  55: { grams: 89,  label: '1 medium' },        // Leek
  56: { grams: 87,  label: '1 cup sliced' },    // Fennel
  57: { grams: 45,  label: '1 cup sliced' },    // Radish
  58: { grams: 130, label: '1 medium' },        // Turnip
  59: { grams: 133, label: '1 medium' },        // Parsnip
  60: { grams: 100, label: '1 cup' },           // Okra
  61: { grams: 14,  label: '1 pepper' },        // Jalapeño Pepper
  62: { grams: 145, label: '1 cup' },           // Shiitake Mushroom
  63: { grams: 84,  label: '1 mushroom' },      // Portobello Mushroom
  64: { grams: 205, label: '1 cup cubed' },     // Acorn Squash

  // ── Leafy Greens ──────────────────────────────────────────────────────────
  65: { grams: 30,  label: '1 cup raw' },       // Spinach
  66: { grams: 67,  label: '1 cup chopped' },   // Kale
  67: { grams: 47,  label: '1 cup shredded' },  // Romaine Lettuce
  68: { grams: 20,  label: '1 cup' },           // Arugula
  69: { grams: 36,  label: '1 cup chopped' },   // Swiss Chard
  70: { grams: 36,  label: '1 cup chopped' },   // Collard Greens
  71: { grams: 70,  label: '1 cup shredded' },  // Bok Choy
  72: { grams: 34,  label: '1 cup chopped' },   // Watercress
  73: { grams: 50,  label: '1 cup chopped' },   // Endive
  74: { grams: 55,  label: '1 cup chopped' },   // Dandelion Greens
  75: { grams: 38,  label: '1 cup chopped' },   // Beet Greens
  76: { grams: 56,  label: '1 cup chopped' },   // Mustard Greens

  // ── Legumes ───────────────────────────────────────────────────────────────
  77: { grams: 48,  label: '¼ cup dry' },       // Lentils (Red)
  78: { grams: 48,  label: '¼ cup dry' },       // Lentils (Green)
  79: { grams: 50,  label: '¼ cup dry' },       // Chickpeas
  80: { grams: 46,  label: '¼ cup dry' },       // Black Beans
  81: { grams: 46,  label: '¼ cup dry' },       // Kidney Beans
  82: { grams: 47,  label: '¼ cup dry' },       // Soybeans
  83: { grams: 155, label: '1 cup' },           // Edamame
  84: { grams: 52,  label: '¼ cup dry' },       // Mung Beans
  85: { grams: 52,  label: '¼ cup dry' },       // Navy Beans
  86: { grams: 48,  label: '¼ cup dry' },       // Pinto Beans
  87: { grams: 45,  label: '¼ cup dry' },       // Lima Beans
  88: { grams: 126, label: '½ cup' },           // Tofu (Firm)
  89: { grams: 84,  label: '3 oz' },            // Tempeh
  90: { grams: 49,  label: '¼ cup dry' },       // Green Split Peas
  91: { grams: 43,  label: '¼ cup dry' },       // Fava Beans

  // ── Nuts ──────────────────────────────────────────────────────────────────
  92:  { grams: 28, label: '1 oz (~23 nuts)' }, // Almonds
  93:  { grams: 28, label: '1 oz (~14 halves)' }, // Walnuts
  94:  { grams: 28, label: '1 oz (~18 nuts)' }, // Cashews
  95:  { grams: 28, label: '1 oz (~49 nuts)' }, // Pistachios
  96:  { grams: 28, label: '1 oz (~19 halves)' }, // Pecans
  97:  { grams: 28, label: '1 oz (~11 nuts)' }, // Macadamia Nuts
  98:  { grams: 28, label: '1 oz (~6 nuts)' },  // Brazil Nuts
  99:  { grams: 28, label: '1 oz (~21 nuts)' }, // Hazelnuts
  100: { grams: 28, label: '1 oz' },            // Pine Nuts
  101: { grams: 28, label: '1 oz' },            // Peanuts
  102: { grams: 28, label: '3 chestnuts' },     // Chestnuts

  // ── Seeds ─────────────────────────────────────────────────────────────────
  // "Add to food" seeds (smoothies, yogurt, oatmeal) standardised to 2 tbsp
  // so per-serving comparisons are apples-to-apples.
  // Snack/trail seeds (sunflower, pumpkin) kept at 1 oz — different use case.
  // Condiment seeds (sesame, poppy) kept at 1 tbsp — sprinkled in small amounts.
  103: { grams: 28, label: '2 tbsp' },          // Chia Seeds     (1 tbsp ≈ 12–14g)
  104: { grams: 20, label: '2 tbsp' },          // Flaxseeds      (1 tbsp ≈ 10g)
  105: { grams: 28, label: '1 oz' },            // Sunflower Seeds
  106: { grams: 28, label: '1 oz' },            // Pumpkin Seeds
  107: { grams: 20, label: '2 tbsp' },          // Hemp Seeds     (1 tbsp ≈ 10g)
  108: { grams: 9,  label: '1 tbsp' },          // Sesame Seeds
  109: { grams: 9,  label: '1 tbsp' },          // Poppy Seeds

  // ── Grains & Cereals ──────────────────────────────────────────────────────
  110: { grams: 43,  label: '¼ cup dry' },      // Quinoa
  111: { grams: 45,  label: '¼ cup dry' },      // Brown Rice
  112: { grams: 45,  label: '¼ cup dry' },      // White Rice
  113: { grams: 40,  label: '½ cup dry' },      // Rolled Oats
  114: { grams: 30,  label: '¼ cup' },          // Whole Wheat Flour
  115: { grams: 30,  label: '¼ cup' },          // White Flour
  116: { grams: 50,  label: '¼ cup dry' },      // Barley (pearled)
  117: { grams: 25,  label: '¼ cup' },          // Rye Flour
  118: { grams: 27,  label: '¼ cup' },          // Corn Flour (Masa)
  119: { grams: 43,  label: '¼ cup dry' },      // Buckwheat
  120: { grams: 50,  label: '¼ cup dry' },      // Millet
  121: { grams: 25,  label: '¼ cup' },          // Spelt Flour
  122: { grams: 49,  label: '¼ cup dry' },      // Amaranth
  123: { grams: 35,  label: '¼ cup dry' },      // Bulgur Wheat
  124: { grams: 43,  label: '¼ cup dry' },      // Couscous (dry)
  125: { grams: 48,  label: '¼ cup dry' },      // Sorghum
  126: { grams: 40,  label: '¼ cup dry' },      // Wild Rice
  127: { grams: 85,  label: '2 oz dry' },       // Pasta (dry white)

  // ── Red Meat ──────────────────────────────────────────────────────────────
  128: { grams: 113, label: '4 oz' },           // Beef (ground 80% lean)
  129: { grams: 170, label: '6 oz' },           // Beef (sirloin steak)
  130: { grams: 85,  label: '3 oz' },           // Beef Liver
  131: { grams: 85,  label: '3 oz' },           // Lamb (leg)
  132: { grams: 113, label: '4 oz' },           // Pork Chop
  133: { grams: 85,  label: '3 oz' },           // Pork Belly
  134: { grams: 28,  label: '2 slices' },       // Bacon (pork)
  135: { grams: 85,  label: '3 oz' },           // Veal
  136: { grams: 85,  label: '3 oz' },           // Venison
  137: { grams: 85,  label: '3 oz' },           // Bison

  // ── Poultry ───────────────────────────────────────────────────────────────
  138: { grams: 172, label: '1 breast' },       // Chicken Breast (skinless)
  139: { grams: 116, label: '1 thigh' },        // Chicken Thigh (skinless)
  140: { grams: 110, label: '1 drumstick' },    // Chicken Drumstick
  141: { grams: 85,  label: '3 oz' },           // Turkey Breast
  142: { grams: 113, label: '4 oz' },           // Turkey Ground
  143: { grams: 163, label: '1 breast' },       // Duck Breast
  144: { grams: 85,  label: '3 oz' },           // Chicken Liver

  // ── Fish & Seafood ────────────────────────────────────────────────────────
  // Dinner fillets (salmon, tuna, cod, halibut, trout): 6 oz — full meal portion
  // Smaller/oily fish (sardines, mackerel, herring): 3 oz — rich, eaten in smaller amounts
  // Shellfish: 3 oz — typically a component, not a main
  // Tilapia: 4 oz — smaller fish, standard fillet weight
  145: { grams: 170, label: '6 oz fillet' },    // Salmon (Atlantic)
  146: { grams: 170, label: '6 oz fillet' },    // Tuna (yellowfin)
  147: { grams: 85,  label: '3 oz (~2 fish)' }, // Sardines (canned)
  148: { grams: 85,  label: '3 oz' },           // Mackerel (Atlantic)
  149: { grams: 170, label: '6 oz fillet' },    // Cod
  150: { grams: 113, label: '4 oz fillet' },    // Tilapia
  151: { grams: 170, label: '6 oz fillet' },    // Halibut
  152: { grams: 170, label: '6 oz fillet' },    // Rainbow Trout
  153: { grams: 85,  label: '3 oz' },           // Herring
  154: { grams: 20,  label: '5 anchovies' },    // Anchovies
  155: { grams: 85,  label: '3 oz' },           // Shrimp
  156: { grams: 85,  label: '3 oz' },           // Crab (Alaskan King)
  157: { grams: 85,  label: '3 oz' },           // Lobster
  158: { grams: 85,  label: '3 oz' },           // Mussels
  159: { grams: 85,  label: '3 oz (~6 oysters)' }, // Oysters
  160: { grams: 85,  label: '3 oz' },           // Scallops
  161: { grams: 85,  label: '3 oz' },           // Clams
  162: { grams: 85,  label: '3 oz' },           // Squid

  // ── Eggs ──────────────────────────────────────────────────────────────────
  163: { grams: 50, label: '1 large egg' },     // Chicken Egg (whole)
  164: { grams: 33, label: '1 large white' },   // Chicken Egg White
  165: { grams: 17, label: '1 large yolk' },    // Chicken Egg Yolk
  166: { grams: 70, label: '1 egg' },           // Duck Egg
  167: { grams: 9,  label: '1 egg' },           // Quail Egg

  // ── Dairy ─────────────────────────────────────────────────────────────────
  168: { grams: 244, label: '1 cup' },          // Whole Milk (3.25%)
  169: { grams: 245, label: '1 cup' },          // Skim Milk (0%)
  170: { grams: 28,  label: '1 oz slice' },     // Cheddar Cheese
  171: { grams: 28,  label: '1 oz' },           // Mozzarella Cheese
  172: { grams: 5,   label: '1 tbsp' },         // Parmesan Cheese
  173: { grams: 245, label: '1 cup' },          // Greek Yogurt (full fat)
  174: { grams: 245, label: '1 cup' },          // Plain Yogurt (whole milk)
  175: { grams: 14,  label: '1 tbsp' },         // Butter (unsalted)
  176: { grams: 15,  label: '1 tbsp' },         // Heavy Cream
  177: { grams: 226, label: '1 cup' },          // Cottage Cheese
  178: { grams: 28,  label: '2 tbsp' },         // Cream Cheese
  179: { grams: 30,  label: '2 tbsp' },         // Sour Cream
  180: { grams: 244, label: '1 cup' },          // Goat Milk
  181: { grams: 28,  label: '1 oz' },           // Brie Cheese
  182: { grams: 30,  label: '1 scoop' },        // Whey Protein Powder

  // ── Dairy Alternatives ────────────────────────────────────────────────────
  183: { grams: 240, label: '1 cup' },          // Almond Milk
  184: { grams: 240, label: '1 cup' },          // Oat Milk
  185: { grams: 240, label: '1 cup' },          // Soy Milk
  186: { grams: 60,  label: '¼ cup' },          // Coconut Milk (canned)
  187: { grams: 240, label: '1 cup' },          // Rice Milk
  188: { grams: 240, label: '1 cup' },          // Cashew Milk

  // ── Oils & Fats ───────────────────────────────────────────────────────────
  189: { grams: 14, label: '1 tbsp' },          // Olive Oil (extra virgin)
  190: { grams: 14, label: '1 tbsp' },          // Coconut Oil
  191: { grams: 14, label: '1 tbsp' },          // Avocado Oil
  192: { grams: 14, label: '1 tbsp' },          // Sunflower Oil
  193: { grams: 14, label: '1 tbsp' },          // Flaxseed Oil
  194: { grams: 14, label: '1 tbsp' },          // Canola Oil
  195: { grams: 14, label: '1 tbsp' },          // Sesame Oil
  196: { grams: 14, label: '1 tbsp' },          // Walnut Oil
  197: { grams: 14, label: '1 tbsp' },          // Ghee
  198: { grams: 13, label: '1 tbsp' },          // Lard
  199: { grams: 14, label: '1 tbsp' },          // Fish Oil
  200: { grams: 14, label: '1 tbsp' },          // Peanut Oil

  // ── Herbs & Spices ────────────────────────────────────────────────────────
  201: { grams: 3,  label: '1 tsp' },           // Turmeric (ground)
  202: { grams: 2,  label: '1 tsp' },           // Ginger (ground)
  203: { grams: 3,  label: '1 tsp' },           // Cinnamon (ground)
  204: { grams: 3,  label: '1 tsp' },           // Black Pepper (ground)
  205: { grams: 3,  label: '1 tsp' },           // Garlic Powder
  206: { grams: 2,  label: '1 tsp' },           // Cumin (ground)
  207: { grams: 2,  label: '1 tsp' },           // Paprika (sweet)
  208: { grams: 1,  label: '1 tsp' },           // Oregano (dried)
  209: { grams: 2,  label: '2 tbsp chopped' },  // Basil (fresh)
  210: { grams: 4,  label: '2 tbsp chopped' },  // Parsley (fresh)
  211: { grams: 1,  label: '1 tsp' },           // Rosemary (dried)
  212: { grams: 1,  label: '1 tsp' },           // Thyme (dried)

  // ── Tortillas ─────────────────────────────────────────────────────────────
  217: { grams: 28,  label: '1 tortilla (6 inch)' },  // Corn Tortilla
  218: { grams: 45,  label: '1 tortilla (8 inch)' },  // Flour Tortilla

  // ── Supplements ───────────────────────────────────────────────────────────
  // portion_grams = 100 so multiplier = 1.0; value_per_100g = per-serving label value
  213: { grams: 100, label: '1 tablet' },        // Multivitamin
  214: { grams: 100, label: '1 serving' },       // Magnesium Bisglycinate
  215: { grams: 100, label: '1 softgel' },       // Fish Oil (Omega-3)
  216: { grams: 100, label: '1 capsule' },       // Vitamin K2 + D3

  // ── Legumes (cooked) ──────────────────────────────────────────────────────
  219: { grams: 100, label: '½ cup cooked' },    // Lentils, Red (cooked)
  220: { grams: 100, label: '½ cup cooked' },    // Lentils, Green (cooked)
  221: { grams: 130, label: '½ cup cooked' },    // Chickpeas (cooked)
  222: { grams: 130, label: '½ cup cooked' },    // Black Beans (cooked)
  223: { grams: 130, label: '½ cup cooked' },    // Kidney Beans (cooked)
  224: { grams: 90,  label: '½ cup cooked' },    // Soybeans (cooked)
  225: { grams: 100, label: '½ cup cooked' },    // Mung Beans (cooked)
  226: { grams: 130, label: '½ cup cooked' },    // Navy Beans (cooked)
  227: { grams: 130, label: '½ cup cooked' },    // Pinto Beans (cooked)
  228: { grams: 130, label: '½ cup cooked' },    // Lima Beans (cooked)
  229: { grams: 100, label: '½ cup cooked' },    // Green Split Peas (cooked)
  230: { grams: 130, label: '½ cup cooked' },    // Fava Beans (cooked)

  // ── Grains (cooked) ───────────────────────────────────────────────────────
  231: { grams: 185, label: '1 cup cooked' },    // Quinoa (cooked)
  232: { grams: 195, label: '1 cup cooked' },    // Brown Rice (cooked)
  233: { grams: 186, label: '1 cup cooked' },    // White Rice (cooked)
  234: { grams: 234, label: '1 cup cooked' },    // Oatmeal (cooked)
  235: { grams: 157, label: '1 cup cooked' },    // Barley, Pearled (cooked)
  236: { grams: 168, label: '1 cup cooked' },    // Buckwheat (cooked)
  237: { grams: 174, label: '1 cup cooked' },    // Millet (cooked)
  238: { grams: 246, label: '1 cup cooked' },    // Amaranth (cooked)
  239: { grams: 182, label: '1 cup cooked' },    // Bulgur Wheat (cooked)
  240: { grams: 157, label: '1 cup cooked' },    // Couscous (cooked)
  241: { grams: 240, label: '1 cup cooked' },    // Sorghum (cooked)
  242: { grams: 164, label: '1 cup cooked' },    // Wild Rice (cooked)
  243: { grams: 140, label: '1 cup cooked' },    // Pasta, White (cooked)
}

/** Returns the portion size for a food, falling back to 100g if not defined. */
export function getPortionSize(foodId: number): PortionSize {
  return PORTION_SIZES[foodId] ?? { grams: 100, label: '100g' }
}
