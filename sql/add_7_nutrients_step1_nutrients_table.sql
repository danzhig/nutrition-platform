-- Step 1: Insert 7 new nutrients into the nutrients table (IDs 53–59)
-- Run in Supabase SQL editor.

INSERT INTO nutrients (id, name, unit, nutrient_category_id, description, body_role, deficiency_symptoms, excess_symptoms) VALUES

(53,
 'Biotin',
 'mcg',
 4,
 'Water-soluble B vitamin (B7) essential for carbohydrate, fat, and protein metabolism.',
 'Cofactor for five carboxylase enzymes; critical for gluconeogenesis, fatty acid synthesis, and amino acid catabolism. Required for gene expression and cell proliferation.',
 'Hair thinning and loss, brittle nails, skin rashes around eyes and nose, depression, lethargy, and peripheral neuropathy. Raw egg whites (avidin) block biotin absorption and can induce deficiency.',
 'No established UL; no toxicity from food sources. High-dose supplements (>10 mg/day) can falsely interfere with immunoassay lab tests, causing abnormal thyroid and cardiac biomarker readings.'
),

(54,
 'EPA',
 'mg',
 2,
 'Eicosapentaenoic acid — long-chain omega-3 that directly reduces inflammation and supports cardiovascular health.',
 'Precursor to anti-inflammatory eicosanoids; reduces triglycerides, improves endothelial function, and stabilises cardiac rhythm. Competes with arachidonic acid to dampen inflammatory prostaglandin pathways.',
 'Elevated triglycerides, increased cardiovascular disease risk, heightened systemic inflammation, and poor wound healing. Plants contain no EPA — dietary ALA converts at less than 5% efficiency.',
 'Very high supplemental doses (>3 g/day EPA+DHA combined) may modestly raise LDL-C in some individuals and prolong bleeding time. No serious toxicity from dietary fish consumption.'
),

(55,
 'DHA',
 'mg',
 2,
 'Docosahexaenoic acid — structural omega-3 comprising 40% of the brain''s polyunsaturated fat content.',
 'Critical structural component of neuronal membranes, retinal photoreceptors, and sperm. Essential for neurotransmission, visual acuity, and reducing neuroinflammation throughout the lifespan.',
 'Impaired visual acuity, cognitive decline, elevated dementia and depression risk, and compromised fetal brain development. Vegans typically have 50–70% lower blood DHA than omnivores.',
 'Very high supplemental doses (>3 g/day EPA+DHA combined) may modestly raise LDL-C and prolong bleeding time. No toxicity from dietary fish consumption.'
),

(56,
 'Lutein & Zeaxanthin',
 'mcg',
 4,
 'Carotenoid pigments concentrated in the retina that filter blue light and protect against macular degeneration.',
 'Accumulate in the macula and lens, acting as a natural blue-light filter and antioxidant shield. Reduce progression of age-related macular degeneration (AMD) and cataracts. Also support cognitive function via anti-inflammatory mechanisms in neural tissue.',
 'Increased risk of age-related macular degeneration and cataracts; reduced macular pigment density; greater photosensitivity. Low intake correlates with higher AMD risk in large-scale epidemiological studies.',
 'No established UL. Very high long-term supplemental doses may cause carotenodermia (harmless skin yellowing) — fully reversible on dose reduction.'
),

(57,
 'Lycopene',
 'mcg',
 4,
 'Red carotenoid antioxidant in tomatoes and pink fruits with the strongest anti-cancer evidence of any dietary carotenoid.',
 'Potent singlet oxygen quencher; concentrates in prostate, testes, skin, and liver. Epidemiological evidence links high intake to 30–40% reduced prostate cancer risk and cardiovascular protection via reduced LDL oxidation. Bioavailability increases dramatically when tomatoes are cooked with fat.',
 'No clinical deficiency syndrome. Low intake correlates with higher prostate cancer and cardiovascular disease risk in observational studies.',
 'No established UL. High supplemental doses may cause lycopenodermia (orange skin tint) — harmless and reversible. No toxicity reported from dietary sources.'
),

(58,
 'Betaine',
 'mg',
 5,
 'Glycine-derived methyl donor that lowers plasma homocysteine and protects liver cells from oxidative stress.',
 'Donates methyl groups in the homocysteine-to-methionine pathway, reducing plasma homocysteine — an independent cardiovascular risk factor. Osmolyte protecting hepatocytes and kidney cells from physiological stress. Works synergistically with folate and B12 in the methylation cycle.',
 'Elevated plasma homocysteine (cardiovascular and neurological risk), non-alcoholic fatty liver disease, and impaired kidney osmoregulation. Low betaine intake is associated with elevated inflammatory markers.',
 'Very high supplemental doses (>4 g/day) may raise LDL-C in some individuals. Fishy body odour reported at very high doses in individuals with TMAU. No established UL from food sources.'
),

(59,
 'CoQ10',
 'mg',
 6,
 'Mitochondrial coenzyme essential for cellular ATP production; potently depleted by statin medications.',
 'Electron carrier in the mitochondrial respiratory chain (Complexes I–III); required for ATP synthesis in every cell. Functions as a fat-soluble antioxidant in cell membranes and LDL. Endogenous synthesis declines ~50% between ages 20 and 80. Statins block the same mevalonate pathway that produces CoQ10.',
 'Fatigue, muscle weakness and myopathy (especially in statin users), heart failure, and mitochondrial dysfunction. Associated with faster progression of Parkinson''s disease. Plasma CoQ10 drops measurably within weeks of statin initiation.',
 'No known toxicity from food or supplements. Very high supplemental doses (>1,200 mg/day) rarely cause mild nausea or insomnia. May reduce anticoagulant efficacy of warfarin — caution for patients on anticoagulant therapy.'
);
