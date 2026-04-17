/**
 * Daily Value profiles and nutrient behaviour metadata.
 *
 * Nutrient names must match exactly what Supabase returns (nutrients.name column).
 * Sources:
 *   - US DRI/RDA values (National Academy of Medicine, 2020)
 *   - WHO/FAO EAR for essential amino acids (2007), scaled to 80 kg male / 65 kg female
 *   - Tolerable Upper Intake Levels (ULs) from NIH Office of Dietary Supplements
 */

export type ProfileId = 'male-avg' | 'female-avg' | 'male-lowcarb' | 'female-lowcarb' | 'custom'

/** Per-nutrient daily target values. null = no established daily target for this nutrient. */
export type RDAValues = Record<string, number | null>

export interface RDAProfile {
  id: ProfileId
  label: string
  shortLabel: string
  description: string
  values: RDAValues
}

// ─── Behavior metadata ────────────────────────────────────────────────────────

/**
 * How to color %DV cells:
 *   'normal'         — higher is better; >100% is fine and stays green
 *   'limit'          — lower is better (sat fat, sodium, etc.); the RDA value IS the daily cap
 *   'normal-with-ul' — has a target to reach AND a safety upper limit above which excess is harmful
 */
export type NutrientBehavior = 'normal' | 'limit' | 'normal-with-ul'

export const NUTRIENT_BEHAVIORS: Record<string, NutrientBehavior> = {
  // Lower is better — the target is an upper limit
  'Saturated Fat':  'limit',
  'Trans Fat':      'limit',
  'Cholesterol':    'limit',
  'Sodium':         'limit',
  'Total Sugars':   'limit',
  'Glycemic Index': 'limit',   // target ≤55 (low-GI threshold); higher = worse blood sugar response

  // Normal but with a meaningful safety UL reachable through diet
  'Vitamin A':      'normal-with-ul',
  'Vitamin D':      'normal-with-ul',
  'Niacin':         'normal-with-ul',
  'Folate':         'normal-with-ul',
  'Calcium':        'normal-with-ul',
  'Iron':           'normal-with-ul',
  'Zinc':           'normal-with-ul',
  'Copper':         'normal-with-ul',
  'Manganese':      'normal-with-ul',
  'Selenium':       'normal-with-ul',
  'Iodine':         'normal-with-ul',
  'Choline':        'normal-with-ul',
  'Phosphorus':     'normal-with-ul',
}

/** Absolute upper intake level (UL) in the same unit as the DB column. */
export const NUTRIENT_UPPER_LIMITS: Record<string, number> = {
  'Vitamin A':  3000,  // mcg RAE — fat-soluble, teratogenic at high doses
  'Vitamin D':  100,   // mcg — hypercalcemia
  'Niacin':     35,    // mg — flushing, liver damage
  'Folate':     1000,  // mcg DFE — neurological masking with B12 deficiency
  'Calcium':    2500,  // mg — hypercalcaemia, kidney stones
  'Iron':       45,    // mg — GI damage, organ toxicity
  'Zinc':       40,    // mg — copper depletion, immune suppression
  'Copper':     10,    // mg — liver damage
  'Manganese':  11,    // mg — neurotoxicity
  'Selenium':   400,   // mcg — selenosis
  'Iodine':     1100,  // mcg — thyroid dysfunction
  'Choline':    3500,  // mg — fishy body odour, hypotension
  'Phosphorus': 4000,  // mg — impairs calcium/magnesium absorption
}

// ─── Built-in profiles ────────────────────────────────────────────────────────

const MALE_AVG: RDAValues = {
  // Macronutrients
  'Calories':          2500,
  'Water':             null,   // food water contribution is too variable to target
  'Protein':           56,
  'Total Fat':         83,     // ~30% of 2500 kcal
  'Carbohydrates':     325,    // ~52% of 2500 kcal
  'Dietary Fibre':     38,
  'Total Sugars':      50,     // WHO: <10% of calories → limit

  // Fatty acids
  'Saturated Fat':     28,     // <10% of 2500 kcal / 9 kcal/g → limit
  'Monounsaturated Fat': null, // no specific RDA
  'Polyunsaturated Fat': null,
  'Omega-3 Fatty Acids': 1.6,  // AI (ALA)
  'Omega-6 Fatty Acids': 17,   // AI
  'Trans Fat':         2.5,    // <1% of calories → limit
  'Cholesterol':       300,    // traditional limit; newer guidelines say "as low as possible"

  // Minerals
  'Calcium':    1000,
  'Iron':       8,
  'Magnesium':  420,
  'Phosphorus': 700,
  'Potassium':  3400,
  'Sodium':     2300,
  'Zinc':       11,
  'Copper':     0.9,
  'Manganese':  2.3,
  'Selenium':   55,
  'Iodine':     150,
  'Chromium':   35,

  // Vitamins
  'Vitamin A':        900,
  'Vitamin C':        90,
  'Vitamin D':        15,
  'Vitamin E':        15,
  'Vitamin K':        120,
  'Thiamine':         1.2,
  'Riboflavin':       1.3,
  'Niacin':           16,
  'Pantothenic Acid': 5,
  'Vitamin B6':       1.3,
  'Folate':           400,
  'Vitamin B12':      2.4,
  'Choline':          550,

  // Amino acids — WHO/FAO EAR mg/kg × 80 kg reference male
  'Histidine':      800,
  'Isoleucine':     1600,
  'Leucine':        3100,
  'Lysine':         2400,
  'Methionine':     1200,
  'Phenylalanine':  2000,
  'Threonine':      1200,
  'Tryptophan':     320,
  'Valine':         2100,

  // Food metrics — research-derived targets (no official DRI)
  'Glycemic Index':       55,   // stay below low-GI threshold; behavior='limit'
  'Antioxidant Capacity': 10,   // ~10 mmol FRAP/day achievable from healthy diet (Carlsen 2010)
}

const FEMALE_AVG: RDAValues = {
  'Calories':          2000,
  'Water':             null,
  'Protein':           46,
  'Total Fat':         65,
  'Carbohydrates':     260,
  'Dietary Fibre':     25,
  'Total Sugars':      50,
  'Saturated Fat':     22,
  'Monounsaturated Fat': null,
  'Polyunsaturated Fat': null,
  'Omega-3 Fatty Acids': 1.1,
  'Omega-6 Fatty Acids': 12,
  'Trans Fat':         2.0,
  'Cholesterol':       300,
  'Calcium':    1000,
  'Iron':       18,    // higher pre-menopause
  'Magnesium':  320,
  'Phosphorus': 700,
  'Potassium':  2600,
  'Sodium':     2300,
  'Zinc':       8,
  'Copper':     0.9,
  'Manganese':  1.8,
  'Selenium':   55,
  'Iodine':     150,
  'Chromium':   25,
  'Vitamin A':        700,
  'Vitamin C':        75,
  'Vitamin D':        15,
  'Vitamin E':        15,
  'Vitamin K':        90,
  'Thiamine':         1.1,
  'Riboflavin':       1.1,
  'Niacin':           14,
  'Pantothenic Acid': 5,
  'Vitamin B6':       1.3,
  'Folate':           400,
  'Vitamin B12':      2.4,
  'Choline':          425,
  // WHO/FAO EAR × 65 kg reference female
  'Histidine':      650,
  'Isoleucine':     1300,
  'Leucine':        2500,
  'Lysine':         2000,
  'Methionine':     1000,
  'Phenylalanine':  1600,
  'Threonine':      1000,
  'Tryptophan':     260,
  'Valine':         1700,
  'Glycemic Index':       null,
  'Antioxidant Capacity': null,
}

const MALE_LOWCARB: RDAValues = {
  // Higher protein and fat, very low carb (keto-adjacent, ~50g net carbs)
  'Calories':          2200,
  'Water':             null,
  'Protein':           130,   // ~1.6 g/kg for active male
  'Total Fat':         160,   // ~65% of calories
  'Carbohydrates':     50,
  'Dietary Fibre':     25,
  'Total Sugars':      25,
  'Saturated Fat':     35,    // higher on low-carb; remains a limit
  'Monounsaturated Fat': null,
  'Polyunsaturated Fat': null,
  'Omega-3 Fatty Acids': 2.4,  // higher target for active
  'Omega-6 Fatty Acids': 17,
  'Trans Fat':         2.0,
  'Cholesterol':       300,
  'Calcium':    1000,
  'Iron':       8,
  'Magnesium':  420,
  'Phosphorus': 700,
  'Potassium':  3400,  // especially important on low-carb for electrolyte balance
  'Sodium':     2500,  // slightly higher on low-carb due to electrolyte needs
  'Zinc':       11,
  'Copper':     0.9,
  'Manganese':  2.3,
  'Selenium':   55,
  'Iodine':     150,
  'Chromium':   35,
  'Vitamin A':        900,
  'Vitamin C':        90,
  'Vitamin D':        20,    // higher target (800 IU)
  'Vitamin E':        15,
  'Vitamin K':        120,
  'Thiamine':         1.2,
  'Riboflavin':       1.3,
  'Niacin':           16,
  'Pantothenic Acid': 5,
  'Vitamin B6':       1.3,
  'Folate':           400,
  'Vitamin B12':      2.4,
  'Choline':          550,
  'Histidine':      800,
  'Isoleucine':     1600,
  'Leucine':        3100,
  'Lysine':         2400,
  'Methionine':     1200,
  'Phenylalanine':  2000,
  'Threonine':      1200,
  'Tryptophan':     320,
  'Valine':         2100,
  'Glycemic Index':       null,
  'Antioxidant Capacity': null,
}

const FEMALE_LOWCARB: RDAValues = {
  'Calories':          1800,
  'Water':             null,
  'Protein':           100,
  'Total Fat':         125,
  'Carbohydrates':     50,
  'Dietary Fibre':     20,
  'Total Sugars':      20,
  'Saturated Fat':     27,
  'Monounsaturated Fat': null,
  'Polyunsaturated Fat': null,
  'Omega-3 Fatty Acids': 1.6,
  'Omega-6 Fatty Acids': 12,
  'Trans Fat':         2.0,
  'Cholesterol':       300,
  'Calcium':    1000,
  'Iron':       18,
  'Magnesium':  320,
  'Phosphorus': 700,
  'Potassium':  2600,
  'Sodium':     2300,
  'Zinc':       8,
  'Copper':     0.9,
  'Manganese':  1.8,
  'Selenium':   55,
  'Iodine':     150,
  'Chromium':   25,
  'Vitamin A':        700,
  'Vitamin C':        75,
  'Vitamin D':        20,
  'Vitamin E':        15,
  'Vitamin K':        90,
  'Thiamine':         1.1,
  'Riboflavin':       1.1,
  'Niacin':           14,
  'Pantothenic Acid': 5,
  'Vitamin B6':       1.3,
  'Folate':           400,
  'Vitamin B12':      2.4,
  'Choline':          425,
  'Histidine':      650,
  'Isoleucine':     1300,
  'Leucine':        2500,
  'Lysine':         2000,
  'Methionine':     1000,
  'Phenylalanine':  1600,
  'Threonine':      1000,
  'Tryptophan':     260,
  'Valine':         1700,
  'Glycemic Index':       null,
  'Antioxidant Capacity': null,
}

export const RDA_PROFILES: RDAProfile[] = [
  {
    id: 'male-avg',
    label: 'Male Average',
    shortLabel: 'Male Avg',
    description: 'Sedentary–moderate activity, 19–50 y, ~80 kg. US DRI/RDA reference values.',
    values: MALE_AVG,
  },
  {
    id: 'female-avg',
    label: 'Female Average',
    shortLabel: 'Female Avg',
    description: 'Sedentary–moderate activity, 19–50 y, ~65 kg. Pre-menopausal iron target.',
    values: FEMALE_AVG,
  },
  {
    id: 'male-lowcarb',
    label: 'Male Low-Carb',
    shortLabel: 'M Low-Carb',
    description: 'Active male, keto-adjacent (~50 g carbs), higher protein and fat targets.',
    values: MALE_LOWCARB,
  },
  {
    id: 'female-lowcarb',
    label: 'Female Low-Carb',
    shortLabel: 'F Low-Carb',
    description: 'Active female, keto-adjacent (~50 g carbs), higher protein and fat targets.',
    values: FEMALE_LOWCARB,
  },
]

/** Returns the RDA profile for a given id (null → no profile active). */
export function getProfile(id: ProfileId | null, customValues?: RDAValues): RDAProfile | null {
  if (!id) return null
  if (id === 'custom') {
    return {
      id: 'custom',
      label: 'Custom',
      shortLabel: 'Custom',
      description: 'Your personal daily targets.',
      values: customValues ?? { ...MALE_AVG },
    }
  }
  return RDA_PROFILES.find((p) => p.id === id) ?? null
}
