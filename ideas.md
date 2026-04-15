# Nutrition Website — Visualization Ideas

**Project context:** Supabase + Vercel dietary learning tool. Database: 212 foods × 39 nutrients, all per 100g raw. Goal: help users understand what's in their food, identify gaps in their diet, and learn about nutrition through interactive exploration.

---

## Section 1 — The Master Food Table (Browse & Discover)

This is the core analytical surface — a rich, interactive table where users can see all foods and all nutrients at once and start to notice patterns and clusters.

---

### 1.1 — Heat Map Table

**What it is:** A full grid where rows are foods and columns are nutrients. Each cell is colored on a gradient — deep green for high relative content, white/grey for mid, deep red for low or zero. The gradient is normalized within each nutrient column so the darkest green always goes to the food with the highest value for that nutrient.

**Why it's powerful:** This immediately reveals "pockets of clustering" — you can visually see that leafy greens form a band of dark greens in the mineral columns, that nuts cluster dark in the fat columns, that seeds are dark on both zinc and omega-6. Patterns that would take a spreadsheet an hour to reveal become instantly obvious.

**Interactivity to add:**
- Click any column header to sort by that nutrient descending (top 10 foods for magnesium, instantly)
- Toggle between showing all 39 nutrients or grouped nutrient categories (Macros only, Vitamins only, Minerals only, Fatty Acids only)
- Click any food row to expand a detail panel showing that food's full nutrient profile
- Hover any cell to show the exact value and what % of a daily recommended amount it represents
- Filter rows by food category (show only Nuts, show only Fish, etc.)
- Search bar to find a specific food

**Technical note for Supabase:** A single query — `SELECT f.name, fc.name as category, fn.nutrient_id, fn.value_per_100g FROM food_nutrients fn JOIN foods f ON f.id = fn.food_id JOIN food_categories fc ON fc.id = f.food_category_id` — returns everything needed. Normalize and color-map on the front end.

---

### 1.2 — Nutrient Density Ranking Bar Charts

**What it is:** A side panel or dedicated page where you pick any nutrient from a dropdown, and an animated horizontal bar chart renders showing all 212 foods ranked from highest to lowest for that nutrient. Bars are colored by food category (nuts = orange, fish = blue, vegetables = green, etc.).

**Why it's powerful:** Answers the most common nutritional question — "what food should I eat to get more X?" — in one visual. Users quickly learn that pumpkin seeds dominate zinc, that clams top vitamin B12, that spirulina is the highest plant-source protein per gram.

**Interactivity:**
- Top-N filter (show top 10, top 20, top 50)
- Category filter checkboxes so the user can ask "what's the best vegetable source of iron?" specifically
- Toggle between per-100g view and per-typical-serving view (requires portion sizes data from the future extensions list)
- Clicking a bar opens the full food detail card

---

### 1.3 — Cluster / Bubble Map

**What it is:** A 2D scatter plot (or force-directed bubble chart) where each food is a bubble. The user picks two nutrients for the X and Y axes. The bubble size represents a third nutrient (optional). Bubbles are colored by food category. 

**Why it's powerful:** This is the best tool for discovering relationships between nutrients. Set X = Omega-3 and Y = Omega-6 and you immediately see that most plant seeds cluster high on omega-6 but low on omega-3, while fatty fish cluster in the opposite quadrant. Set X = Iron and Y = Vitamin C and you can educate users that Vitamin C enhances iron absorption — foods that have both are ideal. Set X = Calcium and Y = Magnesium and you see dairy clusters differently from leafy greens.

**Interactivity:**
- X-axis, Y-axis, and bubble-size dropdowns (any of the 39 nutrients)
- Hover bubble shows food name, category, and exact values for both axes
- Click bubble to expand food detail card
- Category filter to highlight or isolate groups
- An "Add annotation" mode that lets users draw a label or circle cluster groups manually

---

### 1.4 — Nutrient Co-occurrence Matrix

**What it is:** A triangular matrix (like a correlation heatmap) showing which nutrients tend to be high in the same foods. Each cell is colored by how frequently foods that are high in nutrient A are also high in nutrient B.

**Why it's powerful:** This is a uniquely educational view. Users discover things like: "Zinc and Iron co-occur in red meat," "Vitamin C and Folate co-occur in citrus and greens," "Vitamin D and Omega-3 co-occur in fatty fish." These are not just interesting facts — they tell a user that eating for one nutrient often serves another, or that deficiency in one might signal a gap in a correlated one too.

**Technical note:** This can be computed entirely in the front end from the nutrient data — no extra database columns needed.

---

## Section 2 — Personal Diet Analyzer (My Plate)

This is where the tool becomes personal. The user builds their own daily food intake and sees how it stacks up against nutritional recommendations.

---

### 2.1 — My Day Builder (Food Combination Tool)

**What it is:** A drag-and-drop or search-and-add panel where the user assembles a day's worth of eating. They search for "chicken breast," add it, set a serving size (in grams), then add "spinach," "brown rice," "almonds," etc. The tool sums up the total nutrient intake across all selected foods.

**Why it's powerful:** This answers the question the user described: "How does a combination of foods fill my dietary recommendations?" It moves from theory (which food has what) to practice (what does my actual day look like nutritionally).

**Components:**
- Search-and-add panel with portion slider (25g, 50g, 75g, 100g, or free input)
- Running total panel showing aggregated nutrients updating in real time as foods are added or removed
- Visual progress bars for each nutrient showing % of Daily Recommended Intake filled
- Color coding: green = within range, yellow = under 60%, red = under 30%, purple = exceeding recommended max (relevant for sodium, saturated fat, sugar)
- Export to a summary card (screenshot-friendly for sharing)

---

### 2.2 — Dietary Recommendations Dial

**What it is:** The benchmark numbers (Recommended Daily Allowances, or RDAs — which are the scientifically established average daily intake levels that meet the nutritional needs of most healthy people) that the progress bars in 2.1 compare against. The user can:
- Use the default standard adult RDA values (built into the front end from official dietary guidelines)
- Switch to preset profiles: "Adult Female," "Adult Male," "Pregnant," "Athlete," "Elderly," "Child 9–13"
- Or fully customize each nutrient's target manually

**Why it's powerful:** This transforms the tool from a one-size-fits-all calculator into a personalized guide. A 60kg endurance runner has completely different protein and carbohydrate targets than a sedentary office worker. The tool becoming customizable is what makes it genuinely educational rather than just descriptive.

**UI approach:** A settings panel with sliders or numeric inputs for each nutrient target, with the default RDA pre-filled and a "reset to default" button per nutrient or globally. This does not require a user account — values can live in browser state (or localStorage for persistence between visits).

---

### 2.3 — Radar Chart (Nutritional Fingerprint)

**What it is:** A spider/radar chart — which is a circular diagram with one axis per nutrient extending outward from a center point, where a filled polygon shows how a food or food combination scores across multiple nutrients simultaneously — showing the nutritional fingerprint of either a single food or the user's assembled daily plate.

**Why it's powerful:** A radar chart makes nutritional balance intuitively visible. A perfect day's plate would form a nearly complete circle. A diet heavy in one area (say, very high protein, high fat, but low in minerals and vitamins) shows up as a lopsided, stretched shape. Users can see their "nutritional silhouette" at a glance.

**Two modes:**
- **Single food mode:** compare up to 3 foods on the same radar chart with overlapping transparent polygons — each food gets a color. This immediately shows "chicken breast vs. salmon vs. tempeh" as a shape comparison
- **My Plate mode:** shows the aggregated day's intake vs. the RDA target (which is a perfect filled circle at 100%). The gap between the polygon and the circle is the user's nutritional gap

**Nutrient grouping:** Show separate radar charts per category (one for Vitamins, one for Minerals, one for Macros/Fatty Acids) since all 39 on one chart becomes visually cluttered.

---

### 2.4 — Gap Analysis Panel (The Hole Finder)

**What it is:** After a user builds their plate in the Day Builder, a dedicated "Gaps" panel surfaces automatically showing any nutrient where the total falls below a threshold (e.g. below 70% of RDA). For each gap, the panel suggests the top 3 foods from the database that would best fill that specific gap, ranked by how much of the shortfall they can cover per 100g.

**Why it's powerful:** This directly serves the user goal: "identify holes in nutrition or need for supplementation." Instead of the user having to manually look up "what has more magnesium," the tool does it for them. It becomes a proactive advisor, not just a calculator.

**Supplementation flag:** If a nutrient gap cannot realistically be filled by whole food (e.g. Vitamin D, B12 for vegans, Iodine for people not eating seafood or dairy), a small label appears noting that supplementation is commonly recommended for this gap — with a brief explanation of why.

---

### 2.5 — Before & After Comparison

**What it is:** A split-screen or toggle view. The user builds their current typical day (Plate A). They then add or swap foods and see the result as Plate B. The tool shows side-by-side progress bars for every nutrient, with arrows indicating which nutrients improved, which declined, and by how much.

**Why it's powerful:** This creates the "aha moment" of behavior change. A user can see: "If I swap white rice for quinoa, my magnesium goes from 18% to 34% of RDA, my protein goes from 40g to 52g, and my zinc doubles." That kind of concrete before/after visualization is more persuasive than any written nutrition advice.

---

## Section 3 — Educational Views (Learn the Why)

These views support the learning tool goal — not just showing numbers, but building understanding.

---

### 3.1 — Nutrient Deep-Dive Cards

**What it is:** Clicking any nutrient name anywhere in the site opens a card that shows: the nutrient's plain-English description (already stored in `nutrients.description`), its unit, its role in the body, the top 10 foods that contain it, its RDA value for a standard adult, what deficiency symptoms look like, and which other nutrients it works synergistically with (e.g., Iron absorption is enhanced by Vitamin C; Vitamin D is needed to absorb Calcium).

**Why it's powerful:** This turns the database's description field (already written with educational intent) into a learning surface. Users don't just see numbers — they understand context. The nutrient synergy information is particularly valuable because it shows the food matrix matters, not just individual nutrients in isolation.

---

### 3.2 — Food Category Comparison Bars

**What it is:** A stacked or grouped bar chart comparing the average nutrient content across all 15 food categories for a selected nutrient. Each bar represents a food category, and the bar height is the mean value of that nutrient across all foods in that category.

**Why it's powerful:** Gives users the high-level mental model: "On average, Fish & Seafood delivers far more B12 than any other category." "Leafy Greens are the category leader for Vitamin K." "Seeds lead on Manganese." These category-level averages give users useful heuristics for thinking about food choices even when they haven't memorized individual food values.

---

### 3.3 — Nutrient Timeline / Meal Timing View (Future Feature)

**What it is:** A daily timeline (breakfast, snack, lunch, snack, dinner) where the user can drag foods into time slots and see how nutrient intake accumulates over the course of a day. Some nutrients are better absorbed when spread across meals (protein synthesis, for example, benefits from protein distribution rather than one large dose). A small indicator highlights when a single meal is providing an unusually high concentration of a single nutrient.

**Why it's powerful:** This is the advanced tier — it teaches not just what to eat but when. Fat-soluble vitamins (A, D, E, K — meaning they dissolve in fat and are stored in body tissue rather than flushed out daily like water-soluble vitamins) are better absorbed with fat, so the tool can flag "your Vitamin K source has no fat in this meal — pair it with an oil or avocado for better absorption."

---

## Section 4 — UX and Design Principles for This Tool

A few guiding principles to hold onto as the front end is built, given the educational and analytical goals described.

**Show values in context, not in isolation.** A raw number like "18mg of magnesium" means nothing. Always display it as "18mg (4% of daily recommended intake)" or visually as a progress bar. Numbers only educate when they're anchored to a reference point.

**Progressive disclosure.** The home view should be simple: a clean food table and a "build my plate" entry point. The clustering maps, radar charts, and gap analysis are advanced features — accessible but not mandatory on first load. Users who want depth can find it; users who just want a quick answer aren't overwhelmed.

**Explanatory tooltips everywhere.** Every nutrient name should be hoverable to show a one-sentence description. Users should never feel lost because they don't know what "Pantothenic Acid" is. The `nutrients.description` field already contains this copy — just wire it up.

**No account required for core features.** The educational value of the tool is maximized when there's no friction. Let users build plates, save comparisons, and explore the database without signing in. An optional account layer can add persistence and history tracking later.

**Mobile-first for the table views.** The heat map table is complex on mobile — design it to collapse to a category-filtered single-nutrient view on small screens, expanding to the full matrix on desktop.

---

## Quick-Reference: Visualization Summary

| Visualization | Primary Question It Answers | Data Required |
|---|---|---|
| Heat Map Table | Which foods are richest in which nutrients at a glance? | All food_nutrients |
| Nutrient Ranking Bars | What are the top food sources of nutrient X? | food_nutrients filtered by nutrient |
| Cluster / Bubble Map | How do foods relate on two nutrients simultaneously? | food_nutrients (2 nutrients) |
| Co-occurrence Matrix | Which nutrients tend to appear together in the same foods? | All food_nutrients |
| My Day Builder | What does my total intake look like today? | User selection + food_nutrients |
| Dietary Recommendations Dial | Am I hitting my personal targets? | User-defined targets (front end) |
| Radar Chart | What is the nutritional fingerprint of a food or my plate? | food_nutrients + RDA targets |
| Gap Analysis Panel | What am I missing and what should I eat to fix it? | User plate + food_nutrients + RDA |
| Before & After Comparison | What changes if I swap or add a food? | User plate (two states) |
| Nutrient Deep-Dive Cards | What does this nutrient do and where do I find it? | nutrients.description + food_nutrients |
| Category Average Bars | What category of food is the best source of nutrient X? | food_nutrients averaged by category |
