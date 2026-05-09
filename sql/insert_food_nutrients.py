#!/usr/bin/env python3
"""
Insert food_nutrient rows for the 7 new nutrients (IDs 53–59).
Run from repo root: python3 sql/insert_food_nutrients.py
"""
import json, urllib.request, sys

SUPABASE_URL = "https://ieqrdzffpotiedipffka.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcXJkemZmcG90aWVkaXBmZmthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIwOTg3MiwiZXhwIjoyMDkxNzg1ODcyfQ.6wPkTbb2yidI2Lb2uRS-eOX4URAmf3xJbKQF0Tdvon4"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

def post_batch(rows):
    data = json.dumps(rows).encode()
    req  = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/food_nutrients",
        data=data, headers=HEADERS, method="POST"
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:300]}")
        return e.code


# ── Helper ────────────────────────────────────────────────────────────────────

def row(food_id, nutrient_id, value):
    return {"food_id": food_id, "nutrient_id": nutrient_id, "value_per_100g": value}

# All plant-food IDs that have zero EPA/DHA (confirmed absence)
PLANT_IDS = list(range(1, 128)) + list(range(183, 201)) + list(range(201, 213)) + [217, 218] + list(range(219, 254))
# Remove pure oils that appear in 189-200 range but have actual EPA/DHA (Ghee=197, Fish Oil=199)
PLANT_OIL_IDS = [189,190,191,192,193,194,195,196,198,200]  # confirmed 0
ANIMAL_OIL_EPA = {197: 7, 199: 12869}   # Ghee, Fish Oil (USDA menhaden oil)
ANIMAL_OIL_DHA = {197: 9, 199: 8681}

# ── EPA (nutrient_id = 54) ────────────────────────────────────────────────────

epa_values = {
    # Red Meat
    128: 7, 129: 8, 130: 8, 131: 28, 132: 2, 133: 2, 134: 2,
    135: 9, 136: 14, 137: 22,
    # Poultry
    138: 5, 139: 10, 140: 8, 141: 9, 142: 14, 143: 35, 144: 16,
    # Fish & Seafood
    145: 862, 146: 28, 147: 473, 148: 898, 149: 11, 150: 10,
    151: 70, 152: 288, 153: 909, 154: 538, 155: 79, 156: 157,
    157: 64, 158: 350, 159: 254, 160: 59, 161: 90, 162: 148,
    # Eggs
    163: 30, 164: 0, 165: 95, 166: 60, 167: 25,
    # Dairy
    168: 2, 169: 1, 170: 7, 171: 5, 172: 3, 173: 3, 174: 2,
    175: 7, 176: 7, 177: 1, 178: 4, 179: 4, 180: 2, 181: 10,
    182: None,  # Whey Protein (variable)
    # Oils with EPA
    197: 7, 199: 12869,
    # Supplements
    213: None, 214: None, 215: None, 216: None,
}

epa_rows = []
for fid in range(1, 254):
    if fid in epa_values:
        epa_rows.append(row(fid, 54, epa_values[fid]))
    elif fid in PLANT_OIL_IDS or fid <= 127 or fid in range(183, 201) or fid in [201,202,203,204,205,206,207,208,209,210,211,212,217,218] or fid >= 219:
        epa_rows.append(row(fid, 54, 0))
    else:
        epa_rows.append(row(fid, 54, 0))

# ── DHA (nutrient_id = 55) ────────────────────────────────────────────────────

dha_values = {
    # Red Meat
    128: 5, 129: 9, 130: 16, 131: 19, 132: 4, 133: 5, 134: 5,
    135: 8, 136: 17, 137: 21,
    # Poultry
    138: 10, 139: 18, 140: 15, 141: 12, 142: 17, 143: 65, 144: 36,
    # Fish & Seafood
    145: 1429, 146: 197, 147: 586, 148: 1401, 149: 112, 150: 91,
    151: 118, 152: 486, 153: 1105, 154: 911, 155: 147, 156: 298,
    157: 56, 158: 253, 159: 226, 160: 127, 161: 117, 162: 380,
    # Eggs
    163: 52, 164: 0, 165: 262, 166: 130, 167: 55,
    # Dairy
    168: 3, 169: 1, 170: 11, 171: 8, 172: 4, 173: 5, 174: 4,
    175: 9, 176: 9, 177: 2, 178: 6, 179: 6, 180: 2, 181: 14,
    182: None,
    # Oils with DHA
    197: 9, 199: 8681,
    # Supplements
    213: None, 214: None, 215: None, 216: None,
}

dha_rows = []
for fid in range(1, 254):
    if fid in dha_values:
        dha_rows.append(row(fid, 55, dha_values[fid]))
    else:
        dha_rows.append(row(fid, 55, 0))

# ── Biotin (nutrient_id = 53) — research agent values ────────────────────────

biotin_values = {
    # Fruits
    1: None, 2: None, 3: None, 4: 0.2, 5: 0.3, 6: 0.7, 7: 3.2,
    8: None, 9: None, 10: None, 11: None, 12: None, 13: None,
    14: 1.4, 15: None, 16: None, 17: None, 18: None, 19: None,
    20: None, 21: None, 22: None, 23: None, 24: None, 25: None,
    26: None, 27: None, 28: None, 29: None, 30: None,
    # Vegetables
    31: 1.0, 32: None, 33: 4.8, 34: None, 35: None, 36: None,
    37: None, 38: None, 39: None, 40: None, 41: None, 42: None,
    43: None, 44: None, 45: None, 46: None, 47: None, 48: None,
    49: None, 50: None, 51: None, 52: None, 53: 8.0, 54: None,
    55: None, 56: None, 57: None, 58: None, 59: None, 60: None,
    61: None, 62: 15.0, 63: None, 64: None,
    # Leafy Greens
    65: 0.5, 66: None, 67: None, 68: None, 69: None, 70: None,
    71: None, 72: None, 73: None, 74: None, 75: None, 76: None,
    # Legumes (dry)
    77: 23.0, 78: 23.0, 79: 27.0, 80: 25.0, 81: 25.0, 82: 23.0,
    83: 9.0,  84: 25.0, 85: 25.0, 86: 25.0, 87: 25.0, 88: 4.3,
    89: 19.9, 90: 34.0, 91: 13.0,
    # Nuts
    92: 4.4,  93: 36.0, 94: 6.5,  95: 6.0,  96: None, 97: None,
    98: None, 99: 62.0, 100: None, 101: 17.5, 102: None,
    # Seeds
    103: None, 104: None, 105: 56.0, 106: 12.9, 107: 27.3,
    108: 11.7, 109: 47.1,
    # Grains (dry)
    110: 7.7, 111: 3.3, 112: 1.5, 113: 21.7, 114: 10.8, 115: 3.0,
    116: 3.5, 117: 9.5, 118: 3.0, 119: 17.0, 120: 5.8, 121: 9.0,
    122: 16.3, 123: 5.0, 124: 3.0, 125: 15.4, 126: None, 127: 3.0,
    # Red Meat
    128: 3.8, 129: 1.0, 130: 45.0, 131: 4.0, 132: 4.5, 133: 4.0,
    134: 3.0, 135: 4.0, 136: None, 137: None,
    # Poultry
    138: 3.0, 139: 3.5, 140: 3.5, 141: 3.0, 142: 3.0, 143: 4.0,
    144: 170.0,
    # Fish & Seafood
    145: 5.9, 146: 1.7, 147: 24.4, 148: 7.0, 149: None, 150: None,
    151: None, 152: None, 153: None, 154: None, 155: None, 156: None,
    157: None, 158: None, 159: 40.9, 160: None, 161: None, 162: None,
    # Eggs
    163: 14.4, 164: 0.1, 165: 53.0, 166: 14.5, 167: 15.3,
    # Dairy
    168: 4.0, 169: 3.0, 170: 3.4, 171: 2.0, 172: 2.0, 173: 4.0,
    174: 4.0, 175: None, 176: None, 177: 3.5, 178: 7.0, 179: 2.0,
    180: 4.0, 181: 6.0, 182: None,
    # Dairy Alternatives
    183: None, 184: None, 185: None, 186: None, 187: None, 188: None,
    # Oils — pure fats, no biotin (NULL = USDA does not report)
    189: None, 190: None, 191: None, 192: None, 193: None, 194: None,
    195: None, 196: None, 197: None, 198: None, 199: None, 200: None,
    # Herbs & Spices
    201: None, 202: None, 203: None, 204: None, 205: None, 206: None,
    207: None, 208: None, 209: None, 210: None, 211: None, 212: None,
    # Supplements
    213: None, 214: None, 215: None, 216: None,
    # Tortillas
    217: 2.0, 218: 2.0,
    # Cooked Legumes (IDs 219–230)
    219: 9.0, 220: 9.0, 221: 11.0, 222: 10.0, 223: 5.0, 224: 9.0,
    225: 10.0, 226: 10.0, 227: 10.0, 228: 10.0, 229: 14.0, 230: 5.0,
    # Cooked Grains (IDs 231–243)
    231: 3.0, 232: 1.3, 233: 0.6, 234: 7.0, 235: 1.4, 236: 6.0,
    237: 2.3, 238: 5.9, 239: 2.0, 240: 1.2, 241: 6.0, 242: None,
    243: 1.2,
    # Dried Fruits & Vegetables (IDs 244–253)
    244: None, 245: None, 246: None, 247: None, 248: None, 249: None,
    250: None, 251: None, 252: None, 253: 75.0,
}

biotin_rows = [row(fid, 53, biotin_values[fid]) for fid in range(1, 254)]

# ── Betaine (nutrient_id = 58) ────────────────────────────────────────────────

betaine_values = {
    1: 0.1, 2: 0.1, 3: 0.1, 4: 0.2, 5: 0.2, 6: 0.5, 7: 0.8,
    8: 0.3, 9: 0.2, 10: 0.1, 11: 0.3, 12: 0.3, 13: 0.3, 14: 0.5,
    15: 0.1, 16: 0.1, 17: 0.1, 18: 0.3, 19: 0.3, 20: 0.3, 21: 0.4,
    22: 0.3, 23: 0.4, 24: 0.8, 25: 0.8, 26: 0.3, 27: 0.3, 28: 0.3,
    29: 0.3, 30: 0.4,
    # Vegetables
    31: 0.1, 32: 0.4, 33: 34.6, 34: 0.7, 35: 0.3, 36: 0.1, 37: 0.5,
    38: 0.5, 39: 6.1, 40: 0.1, 41: 0.4, 42: 0.4, 43: 0.2, 44: 0.3,
    45: 0.6, 46: 128.7, 47: 0.3, 48: 0.1, 49: 15.0, 50: 0.4,
    51: 0.4, 52: 0.7, 53: 9.0, 54: 0.5, 55: 1.0, 56: 0.5, 57: 0.5,
    58: 0.6, 59: 0.6, 60: 0.1, 61: 0.5, 62: 9.0, 63: 9.0, 64: 0.4,
    # Leafy Greens
    65: 102.6, 66: 30.0, 67: 3.0, 68: 150.0, 69: 643.0, 70: 31.0,
    71: 6.0, 72: 195.0, 73: 23.0, 74: 40.0, 75: 805.0, 76: 60.0,
    # Legumes (dry)
    77: 47.0, 78: 47.0, 79: 32.0, 80: 16.0, 81: 16.0, 82: 97.0,
    83: 14.0, 84: 14.0, 85: 16.0, 86: 15.0, 87: 15.0, 88: 31.0,
    89: 97.0, 90: 16.0, 91: 15.0,
    # Nuts
    92: 0.5, 93: 0.3, 94: 1.4, 95: 0.6, 96: 0.5, 97: 0.2, 98: 0.2,
    99: 0.5, 100: 0.8, 101: 0.5, 102: 0.3,
    # Seeds
    103: 32.0, 104: 1.5, 105: 35.4, 106: 30.0, 107: 5.0, 108: 18.0,
    109: 4.0,
    # Grains (dry)
    110: 630.0, 111: 26.0, 112: 15.0, 113: 193.0, 114: 99.0,
    115: 70.3, 116: 91.0, 117: 150.0, 118: 15.0, 119: 387.0,
    120: 50.0, 121: 130.0, 122: 290.0, 123: 291.0, 124: 130.0,
    125: 120.0, 126: 120.0, 127: 142.4,
    # Red Meat
    128: 77.0, 129: 77.0, 130: 14.0, 131: 78.0, 132: 89.0, 133: 50.0,
    134: 50.0, 135: 29.0, 136: 60.0, 137: 70.0,
    # Poultry
    138: 87.0, 139: 70.0, 140: 70.0, 141: 119.0, 142: 100.0,
    143: 80.0, 144: 14.0,
    # Fish & Seafood
    145: 109.0, 146: 78.0, 147: 100.0, 148: 90.0, 149: 70.0,
    150: 50.0, 151: 60.0, 152: 80.0, 153: 90.0, 154: 50.0,
    155: 218.0, 156: 120.0, 157: 100.0, 158: 250.0, 159: 250.0,
    160: 150.0, 161: 250.0, 162: 80.0,
    # Eggs
    163: 0.8, 164: 0.1, 165: 0.1, 166: 0.8, 167: 0.8,
    # Dairy
    168: 0.3, 169: 0.3, 170: 0.7, 171: 0.5, 172: 0.7, 173: 0.3,
    174: 0.3, 175: 0.3, 176: 0.3, 177: 0.7, 178: 0.7, 179: 0.3,
    180: 0.3, 181: 0.5, 182: 1.0,
    # Dairy Alternatives
    183: 0.0, 184: 0.5, 185: 1.0, 186: 0.0, 187: 0.0, 188: 0.0,
    # Oils (pure fats have 0 betaine)
    189: 0.0, 190: 0.0, 191: 0.0, 192: 0.0, 193: 0.0, 194: 0.0,
    195: 0.0, 196: 0.0, 197: 0.0, 198: 0.0, 199: 0.0, 200: 0.0,
    # Herbs & Spices
    201: 4.0, 202: 3.0, 203: 1.0, 204: 3.0, 205: 5.0, 206: 3.0,
    207: 3.0, 208: 2.0, 209: 1.0, 210: 1.0, 211: 1.0, 212: 1.0,
    # Supplements
    213: None, 214: None, 215: None, 216: None,
    # Tortillas
    217: 20.0, 218: 45.4,
    # Cooked Legumes
    219: 19.0, 220: 19.0, 221: 13.0, 222: 6.0, 223: 6.0, 224: 39.0,
    225: 6.0, 226: 6.0, 227: 6.0, 228: 6.0, 229: 6.0, 230: 6.0,
    # Cooked Grains
    231: 210.0, 232: 8.0, 233: 5.0, 234: 64.0, 235: 30.0, 236: 83.4,
    237: 17.0, 238: 67.6, 239: 83.4, 240: 68.0, 241: 40.0, 242: 40.0,
    243: 68.0,
    # Dried Fruits & Vegetables
    244: 0.3, 245: 1.0, 246: 1.5, 247: 1.5, 248: 1.0, 249: 2.0,
    250: 1.0, 251: 1.5, 252: 1.5, 253: 30.0,
}

betaine_rows = [row(fid, 58, betaine_values[fid]) for fid in range(1, 254)]

# ── CoQ10 (nutrient_id = 59) ──────────────────────────────────────────────────

coq10_values = {
    # Fruits
    1: 0.14, 2: 0.11, 3: 0.27, 4: 0.14, 5: 0.14, 6: 0.14, 7: 0.95,
    8: 0.08, 9: 0.09, 10: 0.14, 11: 0.10, 12: 0.10, 13: 0.12,
    14: 0.10, 15: 0.07, 16: 0.07, 17: 0.10, 18: 0.10, 19: 0.10,
    20: 0.10, 21: 0.08, 22: 0.10, 23: 0.10, 24: 0.14, 25: 0.14,
    26: 0.10, 27: 0.08, 28: 0.08, 29: 0.10, 30: 0.10,
    # Vegetables
    31: 0.86, 32: 0.19, 33: 0.19, 34: 0.19, 35: 0.11, 36: 0.08,
    37: 0.11, 38: 0.10, 39: 0.10, 40: 0.08, 41: 0.10, 42: 0.63,
    43: 0.08, 44: 0.08, 45: 0.19, 46: 0.19, 47: 0.19, 48: 0.10,
    49: 0.10, 50: 0.10, 51: 0.10, 52: 0.63, 53: 0.12, 54: 0.10,
    55: 0.10, 56: 0.10, 57: 0.08, 58: 0.08, 59: 0.10, 60: 0.08,
    61: 0.10, 62: 0.16, 63: 0.13, 64: 0.10,
    # Leafy Greens
    65: 0.90, 66: 0.78, 67: 0.10, 68: 0.10, 69: 0.10, 70: 0.10,
    71: 0.10, 72: 0.10, 73: 0.08, 74: 0.10, 75: 0.10, 76: 0.10,
    # Legumes (dry)
    77: 0.40, 78: 0.40, 79: 0.40, 80: 0.40, 81: 0.40, 82: 1.70,
    83: 1.50, 84: 0.40, 85: 0.40, 86: 0.40, 87: 0.40, 88: 0.50,
    89: 0.30, 90: 0.40, 91: 0.40,
    # Nuts
    92: 0.78, 93: 1.90, 94: 0.50, 95: 2.00, 96: 0.60, 97: 0.30,
    98: 0.40, 99: 0.78, 100: 1.20, 101: 2.70, 102: 0.20,
    # Seeds
    103: 0.30, 104: 0.30, 105: 0.60, 106: 0.60, 107: 0.30,
    108: 1.70, 109: 0.30,
    # Grains (dry)
    110: 0.30, 111: 0.20, 112: 0.10, 113: 0.30, 114: 0.60,
    115: 0.20, 116: 0.30, 117: 1.50, 118: 0.10, 119: 0.30,
    120: 0.10, 121: 0.50, 122: 0.30, 123: 0.40, 124: 0.20,
    125: 0.20, 126: 0.30, 127: 0.30,
    # Red Meat
    128: 3.10, 129: 3.10, 130: 3.90, 131: 2.10, 132: 2.40, 133: 2.00,
    134: 2.00, 135: 2.20, 136: 2.50, 137: 2.00,
    # Poultry
    138: 1.40, 139: 2.40, 140: 2.40, 141: 1.40, 142: 1.60,
    143: 2.50, 144: 11.60,
    # Fish & Seafood
    145: 0.40, 146: 1.50, 147: 0.50, 148: 4.30, 149: 0.60,
    150: 0.30, 151: 0.60, 152: 0.85, 153: 2.70, 154: 0.30,
    155: 0.30, 156: 0.30, 157: 0.20, 158: 0.30, 159: 0.40,
    160: 0.30, 161: 0.30, 162: 0.50,
    # Eggs
    163: 0.22, 164: 0.05, 165: 0.75, 166: 0.22, 167: 0.22,
    # Dairy
    168: 0.10, 169: 0.05, 170: 0.21, 171: 0.18, 172: 0.25,
    173: 0.10, 174: 0.10, 175: 0.31, 176: 0.20, 177: 0.10,
    178: 0.10, 179: 0.10, 180: 0.10, 181: 0.20, 182: None,
    # Dairy Alternatives
    183: None, 184: None, 185: 0.10, 186: None, 187: None, 188: None,
    # Oils
    189: 0.04, 190: 0.10, 191: 0.10, 192: 0.04, 193: 0.30, 194: 0.50,
    195: 0.04, 196: 0.30, 197: 0.20, 198: 0.20, 199: None, 200: 0.30,
    # Herbs & Spices — no published CoQ10 data
    201: None, 202: None, 203: None, 204: None, 205: None, 206: None,
    207: None, 208: None, 209: None, 210: None, 211: None, 212: None,
    # Supplements
    213: None, 214: None, 215: None, 216: None,
    # Tortillas
    217: 0.10, 218: 0.20,
    # Cooked Legumes
    219: 0.16, 220: 0.16, 221: 0.16, 222: 0.16, 223: 0.16, 224: 0.70,
    225: 0.16, 226: 0.16, 227: 0.16, 228: 0.16, 229: 0.16, 230: 0.16,
    # Cooked Grains
    231: 0.12, 232: 0.08, 233: 0.04, 234: 0.12, 235: 0.12, 236: 0.12,
    237: 0.04, 238: 0.12, 239: 0.16, 240: 0.08, 241: 0.08, 242: 0.12,
    243: 0.12,
    # Dried Fruits & Vegetables
    244: 0.10, 245: 0.12, 246: 0.10, 247: 0.10, 248: 0.10, 249: 0.10,
    250: 0.10, 251: 0.10, 252: 0.20, 253: 0.50,
}

coq10_rows = [row(fid, 59, coq10_values[fid]) for fid in range(1, 254)]

# ── Lycopene (nutrient_id = 57) ───────────────────────────────────────────────
# Lycopene is a red carotenoid found almost exclusively in tomato products,
# watermelon, pink grapefruit, guava, and papaya. All others confirmed 0.
# Values from USDA SR Legacy per 100g raw.

LYCOPENE_NONZERO = {
    8:   4532,   # Watermelon
    17:  1420,   # Grapefruit (pink/red)
    18:  1828,   # Papaya
    30:  5204,   # Guava
    35:  2573,   # Tomato (raw)
    252: 45902,  # Sun-Dried Tomatoes (oil-packed, USDA concentrated)
}

lycopene_rows = [
    row(fid, 57, LYCOPENE_NONZERO.get(fid, 0))
    for fid in range(1, 254)
]

# ── Execute inserts ───────────────────────────────────────────────────────────

batches = [
    ("Biotin (53)",   biotin_rows),
    ("EPA (54)",      epa_rows),
    ("DHA (55)",      dha_rows),
    ("Betaine (58)",  betaine_rows),
    ("CoQ10 (59)",    coq10_rows),
    ("Lycopene (57)", lycopene_rows),
]

for name, rows in batches:
    print(f"Inserting {name} — {len(rows)} rows ...", end=" ", flush=True)
    status = post_batch(rows)
    print(f"HTTP {status}" if status != 201 else "OK")
