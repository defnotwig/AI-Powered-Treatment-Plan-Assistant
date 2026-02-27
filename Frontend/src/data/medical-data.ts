/**
 * Medical Data Lookup Tables for Autocomplete/Predictive Fields
 * This file contains comprehensive lists for medical conditions, allergies,
 * surgeries, medications, and other clinical data for form autocomplete.
 */

// ==================== MEDICAL CONDITIONS ====================
export const MEDICAL_CONDITIONS = [
  // Cardiovascular
  { name: 'Hypertension', category: 'Cardiovascular' },
  { name: 'Hypotension', category: 'Cardiovascular' },
  { name: 'Coronary Artery Disease', category: 'Cardiovascular' },
  { name: 'Heart Failure', category: 'Cardiovascular' },
  { name: 'Atrial Fibrillation', category: 'Cardiovascular' },
  { name: 'Atrial Flutter', category: 'Cardiovascular' },
  { name: 'Ventricular Tachycardia', category: 'Cardiovascular' },
  { name: 'Cardiomyopathy', category: 'Cardiovascular' },
  { name: 'Myocardial Infarction', category: 'Cardiovascular' },
  { name: 'Angina Pectoris', category: 'Cardiovascular' },
  { name: 'Peripheral Artery Disease', category: 'Cardiovascular' },
  { name: 'Deep Vein Thrombosis', category: 'Cardiovascular' },
  { name: 'Pulmonary Embolism', category: 'Cardiovascular' },
  { name: 'Aortic Stenosis', category: 'Cardiovascular' },
  { name: 'Mitral Valve Prolapse', category: 'Cardiovascular' },

  // Endocrine/Metabolic
  { name: 'Type 1 Diabetes', category: 'Endocrine' },
  { name: 'Type 2 Diabetes', category: 'Endocrine' },
  { name: 'Gestational Diabetes', category: 'Endocrine' },
  { name: 'Prediabetes', category: 'Endocrine' },
  { name: 'Hyperthyroidism', category: 'Endocrine' },
  { name: 'Hypothyroidism', category: 'Endocrine' },
  { name: 'Hashimoto\'s Thyroiditis', category: 'Endocrine' },
  { name: 'Graves\' Disease', category: 'Endocrine' },
  { name: 'Cushing\'s Syndrome', category: 'Endocrine' },
  { name: 'Addison\'s Disease', category: 'Endocrine' },
  { name: 'Hyperlipidemia', category: 'Metabolic' },
  { name: 'Hypercholesterolemia', category: 'Metabolic' },
  { name: 'Metabolic Syndrome', category: 'Metabolic' },
  { name: 'Obesity', category: 'Metabolic' },
  { name: 'Gout', category: 'Metabolic' },

  // Respiratory
  { name: 'Asthma', category: 'Respiratory' },
  { name: 'COPD', category: 'Respiratory' },
  { name: 'Chronic Bronchitis', category: 'Respiratory' },
  { name: 'Emphysema', category: 'Respiratory' },
  { name: 'Pulmonary Fibrosis', category: 'Respiratory' },
  { name: 'Sleep Apnea', category: 'Respiratory' },
  { name: 'Pneumonia (recurrent)', category: 'Respiratory' },
  { name: 'Tuberculosis', category: 'Respiratory' },
  { name: 'Sarcoidosis', category: 'Respiratory' },
  { name: 'Pulmonary Hypertension', category: 'Respiratory' },

  // Gastrointestinal
  { name: 'GERD', category: 'Gastrointestinal' },
  { name: 'Peptic Ulcer Disease', category: 'Gastrointestinal' },
  { name: 'Gastritis', category: 'Gastrointestinal' },
  { name: 'Irritable Bowel Syndrome', category: 'Gastrointestinal' },
  { name: 'Crohn\'s Disease', category: 'Gastrointestinal' },
  { name: 'Ulcerative Colitis', category: 'Gastrointestinal' },
  { name: 'Celiac Disease', category: 'Gastrointestinal' },
  { name: 'Diverticulitis', category: 'Gastrointestinal' },
  { name: 'Gallstones', category: 'Gastrointestinal' },
  { name: 'Pancreatitis', category: 'Gastrointestinal' },
  { name: 'Hepatitis B', category: 'Gastrointestinal' },
  { name: 'Hepatitis C', category: 'Gastrointestinal' },
  { name: 'Cirrhosis', category: 'Gastrointestinal' },
  { name: 'Fatty Liver Disease', category: 'Gastrointestinal' },

  // Renal/Urological
  { name: 'Chronic Kidney Disease Stage 1', category: 'Renal' },
  { name: 'Chronic Kidney Disease Stage 2', category: 'Renal' },
  { name: 'Chronic Kidney Disease Stage 3', category: 'Renal' },
  { name: 'Chronic Kidney Disease Stage 4', category: 'Renal' },
  { name: 'Chronic Kidney Disease Stage 5', category: 'Renal' },
  { name: 'End-Stage Renal Disease', category: 'Renal' },
  { name: 'Nephrolithiasis', category: 'Renal' },
  { name: 'Polycystic Kidney Disease', category: 'Renal' },
  { name: 'Benign Prostatic Hyperplasia', category: 'Urological' },
  { name: 'Prostate Cancer', category: 'Urological' },
  { name: 'Bladder Cancer', category: 'Urological' },
  { name: 'Urinary Tract Infection (recurrent)', category: 'Urological' },
  { name: 'Urinary Incontinence', category: 'Urological' },

  // Neurological
  { name: 'Epilepsy', category: 'Neurological' },
  { name: 'Migraine', category: 'Neurological' },
  { name: 'Tension Headache', category: 'Neurological' },
  { name: 'Cluster Headache', category: 'Neurological' },
  { name: 'Stroke', category: 'Neurological' },
  { name: 'Transient Ischemic Attack', category: 'Neurological' },
  { name: 'Parkinson\'s Disease', category: 'Neurological' },
  { name: 'Alzheimer\'s Disease', category: 'Neurological' },
  { name: 'Dementia', category: 'Neurological' },
  { name: 'Multiple Sclerosis', category: 'Neurological' },
  { name: 'Peripheral Neuropathy', category: 'Neurological' },
  { name: 'Restless Leg Syndrome', category: 'Neurological' },
  { name: 'Bell\'s Palsy', category: 'Neurological' },

  // Psychiatric
  { name: 'Major Depressive Disorder', category: 'Psychiatric' },
  { name: 'Generalized Anxiety Disorder', category: 'Psychiatric' },
  { name: 'Panic Disorder', category: 'Psychiatric' },
  { name: 'Social Anxiety Disorder', category: 'Psychiatric' },
  { name: 'Bipolar Disorder', category: 'Psychiatric' },
  { name: 'Schizophrenia', category: 'Psychiatric' },
  { name: 'PTSD', category: 'Psychiatric' },
  { name: 'OCD', category: 'Psychiatric' },
  { name: 'ADHD', category: 'Psychiatric' },
  { name: 'Insomnia', category: 'Psychiatric' },
  { name: 'Eating Disorder', category: 'Psychiatric' },
  { name: 'Substance Use Disorder', category: 'Psychiatric' },

  // Musculoskeletal
  { name: 'Osteoarthritis', category: 'Musculoskeletal' },
  { name: 'Rheumatoid Arthritis', category: 'Musculoskeletal' },
  { name: 'Osteoporosis', category: 'Musculoskeletal' },
  { name: 'Fibromyalgia', category: 'Musculoskeletal' },
  { name: 'Lupus', category: 'Musculoskeletal' },
  { name: 'Gout', category: 'Musculoskeletal' },
  { name: 'Ankylosing Spondylitis', category: 'Musculoskeletal' },
  { name: 'Chronic Back Pain', category: 'Musculoskeletal' },
  { name: 'Herniated Disc', category: 'Musculoskeletal' },
  { name: 'Spinal Stenosis', category: 'Musculoskeletal' },

  // Dermatological
  { name: 'Psoriasis', category: 'Dermatological' },
  { name: 'Eczema', category: 'Dermatological' },
  { name: 'Rosacea', category: 'Dermatological' },
  { name: 'Acne', category: 'Dermatological' },
  { name: 'Vitiligo', category: 'Dermatological' },
  { name: 'Melanoma', category: 'Dermatological' },
  { name: 'Skin Cancer (non-melanoma)', category: 'Dermatological' },

  // Hematological
  { name: 'Anemia', category: 'Hematological' },
  { name: 'Iron Deficiency Anemia', category: 'Hematological' },
  { name: 'Sickle Cell Disease', category: 'Hematological' },
  { name: 'Thalassemia', category: 'Hematological' },
  { name: 'Hemophilia', category: 'Hematological' },
  { name: 'Thrombocytopenia', category: 'Hematological' },
  { name: 'Leukemia', category: 'Hematological' },
  { name: 'Lymphoma', category: 'Hematological' },

  // Infectious
  { name: 'HIV/AIDS', category: 'Infectious' },
  { name: 'Hepatitis B (chronic)', category: 'Infectious' },
  { name: 'Hepatitis C (chronic)', category: 'Infectious' },
  { name: 'Tuberculosis', category: 'Infectious' },
  { name: 'Lyme Disease', category: 'Infectious' },

  // Cancer
  { name: 'Breast Cancer', category: 'Oncology' },
  { name: 'Lung Cancer', category: 'Oncology' },
  { name: 'Colon Cancer', category: 'Oncology' },
  { name: 'Prostate Cancer', category: 'Oncology' },
  { name: 'Pancreatic Cancer', category: 'Oncology' },
  { name: 'Ovarian Cancer', category: 'Oncology' },
  { name: 'Thyroid Cancer', category: 'Oncology' },
  { name: 'Bladder Cancer', category: 'Oncology' },
  { name: 'Kidney Cancer', category: 'Oncology' },

  // Other
  { name: 'Allergic Rhinitis', category: 'Allergy/Immunology' },
  { name: 'Chronic Sinusitis', category: 'ENT' },
  { name: 'Hearing Loss', category: 'ENT' },
  { name: 'Glaucoma', category: 'Ophthalmology' },
  { name: 'Cataracts', category: 'Ophthalmology' },
  { name: 'Macular Degeneration', category: 'Ophthalmology' },
];

// ==================== ALLERGENS ====================
export const ALLERGENS = [
  // Medications - Antibiotics
  { name: 'Penicillin', category: 'Antibiotic' },
  { name: 'Amoxicillin', category: 'Antibiotic' },
  { name: 'Ampicillin', category: 'Antibiotic' },
  { name: 'Cephalosporins', category: 'Antibiotic' },
  { name: 'Sulfa drugs (Sulfonamides)', category: 'Antibiotic' },
  { name: 'Sulfamethoxazole', category: 'Antibiotic' },
  { name: 'Trimethoprim-Sulfamethoxazole', category: 'Antibiotic' },
  { name: 'Fluoroquinolones', category: 'Antibiotic' },
  { name: 'Ciprofloxacin', category: 'Antibiotic' },
  { name: 'Levofloxacin', category: 'Antibiotic' },
  { name: 'Macrolides', category: 'Antibiotic' },
  { name: 'Erythromycin', category: 'Antibiotic' },
  { name: 'Azithromycin', category: 'Antibiotic' },
  { name: 'Tetracyclines', category: 'Antibiotic' },
  { name: 'Doxycycline', category: 'Antibiotic' },
  { name: 'Vancomycin', category: 'Antibiotic' },
  { name: 'Clindamycin', category: 'Antibiotic' },
  { name: 'Metronidazole', category: 'Antibiotic' },
  { name: 'Nitrofurantoin', category: 'Antibiotic' },

  // Pain medications
  { name: 'Aspirin', category: 'NSAID' },
  { name: 'Ibuprofen', category: 'NSAID' },
  { name: 'Naproxen', category: 'NSAID' },
  { name: 'Celecoxib', category: 'NSAID' },
  { name: 'Meloxicam', category: 'NSAID' },
  { name: 'Diclofenac', category: 'NSAID' },
  { name: 'Indomethacin', category: 'NSAID' },
  { name: 'NSAIDs (all)', category: 'NSAID' },
  { name: 'Codeine', category: 'Opioid' },
  { name: 'Morphine', category: 'Opioid' },
  { name: 'Hydrocodone', category: 'Opioid' },
  { name: 'Oxycodone', category: 'Opioid' },
  { name: 'Fentanyl', category: 'Opioid' },
  { name: 'Tramadol', category: 'Opioid' },
  { name: 'Meperidine', category: 'Opioid' },
  { name: 'Acetaminophen', category: 'Analgesic' },

  // Anesthetics
  { name: 'Lidocaine', category: 'Anesthetic' },
  { name: 'Novocaine (Procaine)', category: 'Anesthetic' },
  { name: 'Bupivacaine', category: 'Anesthetic' },
  { name: 'General anesthesia', category: 'Anesthetic' },
  { name: 'Propofol', category: 'Anesthetic' },
  { name: 'Ketamine', category: 'Anesthetic' },

  // Cardiovascular medications
  { name: 'ACE inhibitors', category: 'Cardiovascular' },
  { name: 'Beta-blockers', category: 'Cardiovascular' },
  { name: 'Statins', category: 'Cardiovascular' },
  { name: 'Calcium channel blockers', category: 'Cardiovascular' },
  { name: 'Warfarin', category: 'Cardiovascular' },
  { name: 'Heparin', category: 'Cardiovascular' },

  // Other medications
  { name: 'Insulin', category: 'Antidiabetic' },
  { name: 'Metformin', category: 'Antidiabetic' },
  { name: 'Contrast dye (Iodine)', category: 'Diagnostic' },
  { name: 'Gadolinium', category: 'Diagnostic' },
  { name: 'Gabapentin', category: 'Neurological' },
  { name: 'Pregabalin', category: 'Neurological' },
  { name: 'Phenytoin', category: 'Neurological' },
  { name: 'Carbamazepine', category: 'Neurological' },

  // Food allergies - Common
  { name: 'Peanuts', category: 'Food - Legumes' },
  { name: 'Tree nuts (all)', category: 'Food - Nuts' },
  { name: 'Almonds', category: 'Food - Nuts' },
  { name: 'Walnuts', category: 'Food - Nuts' },
  { name: 'Cashews', category: 'Food - Nuts' },
  { name: 'Pistachios', category: 'Food - Nuts' },
  { name: 'Pecans', category: 'Food - Nuts' },
  { name: 'Hazelnuts', category: 'Food - Nuts' },
  { name: 'Macadamia nuts', category: 'Food - Nuts' },
  { name: 'Brazil nuts', category: 'Food - Nuts' },
  { name: 'Pine nuts', category: 'Food - Nuts' },

  // Food allergies - Seafood
  { name: 'Shellfish (all)', category: 'Food - Seafood' },
  { name: 'Shrimp', category: 'Food - Seafood' },
  { name: 'Crab', category: 'Food - Seafood' },
  { name: 'Lobster', category: 'Food - Seafood' },
  { name: 'Clams', category: 'Food - Seafood' },
  { name: 'Mussels', category: 'Food - Seafood' },
  { name: 'Oysters', category: 'Food - Seafood' },
  { name: 'Scallops', category: 'Food - Seafood' },
  { name: 'Fish (all)', category: 'Food - Seafood' },
  { name: 'Salmon', category: 'Food - Seafood' },
  { name: 'Tuna', category: 'Food - Seafood' },
  { name: 'Cod', category: 'Food - Seafood' },
  { name: 'Tilapia', category: 'Food - Seafood' },

  // Food allergies - Dairy/Eggs
  { name: 'Eggs', category: 'Food - Animal Products' },
  { name: 'Egg whites', category: 'Food - Animal Products' },
  { name: 'Egg yolks', category: 'Food - Animal Products' },
  { name: 'Milk/Dairy', category: 'Food - Dairy' },
  { name: 'Cow milk', category: 'Food - Dairy' },
  { name: 'Goat milk', category: 'Food - Dairy' },
  { name: 'Cheese', category: 'Food - Dairy' },
  { name: 'Butter', category: 'Food - Dairy' },
  { name: 'Yogurt', category: 'Food - Dairy' },
  { name: 'Casein', category: 'Food - Dairy' },
  { name: 'Whey', category: 'Food - Dairy' },
  { name: 'Lactose', category: 'Food - Dairy' },

  // Food allergies - Grains
  { name: 'Wheat/Gluten', category: 'Food - Grains' },
  { name: 'Barley', category: 'Food - Grains' },
  { name: 'Rye', category: 'Food - Grains' },
  { name: 'Oats', category: 'Food - Grains' },
  { name: 'Corn', category: 'Food - Grains' },
  { name: 'Rice', category: 'Food - Grains' },

  // Food allergies - Seeds and Legumes
  { name: 'Sesame', category: 'Food - Seeds' },
  { name: 'Sunflower seeds', category: 'Food - Seeds' },
  { name: 'Poppy seeds', category: 'Food - Seeds' },
  { name: 'Mustard seeds', category: 'Food - Seeds' },
  { name: 'Soy', category: 'Food - Legumes' },
  { name: 'Lentils', category: 'Food - Legumes' },
  { name: 'Chickpeas', category: 'Food - Legumes' },
  { name: 'Beans', category: 'Food - Legumes' },
  { name: 'Peas', category: 'Food - Legumes' },

  // Food allergies - Fruits
  { name: 'Strawberries', category: 'Food - Fruits' },
  { name: 'Kiwi', category: 'Food - Fruits' },
  { name: 'Banana', category: 'Food - Fruits' },
  { name: 'Avocado', category: 'Food - Fruits' },
  { name: 'Mango', category: 'Food - Fruits' },
  { name: 'Papaya', category: 'Food - Fruits' },
  { name: 'Pineapple', category: 'Food - Fruits' },
  { name: 'Apple', category: 'Food - Fruits' },
  { name: 'Peach', category: 'Food - Fruits' },
  { name: 'Cherry', category: 'Food - Fruits' },
  { name: 'Plum', category: 'Food - Fruits' },
  { name: 'Citrus fruits', category: 'Food - Fruits' },
  { name: 'Orange', category: 'Food - Fruits' },
  { name: 'Lemon', category: 'Food - Fruits' },
  { name: 'Grapefruit', category: 'Food - Fruits' },
  { name: 'Melon', category: 'Food - Fruits' },
  { name: 'Grapes', category: 'Food - Fruits' },

  // Food allergies - Vegetables
  { name: 'Celery', category: 'Food - Vegetables' },
  { name: 'Carrot', category: 'Food - Vegetables' },
  { name: 'Tomato', category: 'Food - Vegetables' },
  { name: 'Potato', category: 'Food - Vegetables' },
  { name: 'Onion', category: 'Food - Vegetables' },
  { name: 'Garlic', category: 'Food - Vegetables' },
  { name: 'Spinach', category: 'Food - Vegetables' },
  { name: 'Lettuce', category: 'Food - Vegetables' },

  // Food allergies - Other
  { name: 'Chocolate', category: 'Food - Other' },
  { name: 'Cocoa', category: 'Food - Other' },
  { name: 'Honey', category: 'Food - Other' },
  { name: 'Cinnamon', category: 'Food - Spices' },
  { name: 'Vanilla', category: 'Food - Spices' },
  { name: 'Sulfites', category: 'Food - Preservatives' },
  { name: 'MSG (Monosodium glutamate)', category: 'Food - Additives' },
  { name: 'Food coloring/dyes', category: 'Food - Additives' },
  { name: 'Caffeine', category: 'Food - Other' },
  { name: 'Alcohol', category: 'Food - Other' },
  { name: 'Red meat (Alpha-gal)', category: 'Food - Meat' },
  { name: 'Gelatin', category: 'Food - Other' },

  // Environmental - Insects
  { name: 'Bee stings', category: 'Environmental - Insects' },
  { name: 'Wasp stings', category: 'Environmental - Insects' },
  { name: 'Hornet stings', category: 'Environmental - Insects' },
  { name: 'Fire ant bites', category: 'Environmental - Insects' },
  { name: 'Mosquito bites', category: 'Environmental - Insects' },
  { name: 'Cockroaches', category: 'Environmental - Insects' },

  // Environmental - Airborne
  { name: 'Dust mites', category: 'Environmental - Airborne' },
  { name: 'Pollen (all)', category: 'Environmental - Airborne' },
  { name: 'Tree pollen', category: 'Environmental - Airborne' },
  { name: 'Grass pollen', category: 'Environmental - Airborne' },
  { name: 'Ragweed pollen', category: 'Environmental - Airborne' },
  { name: 'Weed pollen', category: 'Environmental - Airborne' },
  { name: 'Mold spores', category: 'Environmental - Airborne' },
  { name: 'Mildew', category: 'Environmental - Airborne' },
  { name: 'Fungal spores', category: 'Environmental - Airborne' },

  // Environmental - Animals
  { name: 'Cat dander', category: 'Environmental - Animals' },
  { name: 'Dog dander', category: 'Environmental - Animals' },
  { name: 'Pet dander (all)', category: 'Environmental - Animals' },
  { name: 'Horse dander', category: 'Environmental - Animals' },
  { name: 'Rabbit fur', category: 'Environmental - Animals' },
  { name: 'Bird feathers', category: 'Environmental - Animals' },
  { name: 'Rodent allergens', category: 'Environmental - Animals' },

  // Environmental - Materials
  { name: 'Latex', category: 'Environmental - Materials' },
  { name: 'Nickel', category: 'Environmental - Metals' },
  { name: 'Cobalt', category: 'Environmental - Metals' },
  { name: 'Chromium', category: 'Environmental - Metals' },
  { name: 'Gold', category: 'Environmental - Metals' },
  { name: 'Wool', category: 'Environmental - Fabrics' },
  { name: 'Formaldehyde', category: 'Environmental - Chemicals' },
  { name: 'Fragrance/Perfume', category: 'Environmental - Chemicals' },
  { name: 'Cleaning products', category: 'Environmental - Chemicals' },
  { name: 'Hair dye', category: 'Environmental - Chemicals' },
  { name: 'Cosmetics', category: 'Environmental - Chemicals' },
  { name: 'Sunscreen', category: 'Environmental - Chemicals' },
  { name: 'Preservatives (skin products)', category: 'Environmental - Chemicals' },
];

// ==================== ALLERGY REACTIONS ====================
export const ALLERGY_REACTIONS = [
  'Rash',
  'Hives (Urticaria)',
  'Itching (Pruritus)',
  'Swelling (Angioedema)',
  'Anaphylaxis',
  'Difficulty breathing',
  'Throat swelling',
  'Nausea/Vomiting',
  'Diarrhea',
  'Abdominal pain',
  'Dizziness',
  'Hypotension',
  'Stevens-Johnson syndrome',
  'Toxic epidermal necrolysis',
  'Drug-induced liver injury',
  'Fever',
  'Joint pain',
  'Serum sickness',
  'Hemolytic anemia',
];

// ==================== SURGERIES/PROCEDURES ====================
export const SURGERIES = [
  // General Surgery
  { name: 'Appendectomy', category: 'General Surgery' },
  { name: 'Cholecystectomy (gallbladder removal)', category: 'General Surgery' },
  { name: 'Hernia repair (inguinal)', category: 'General Surgery' },
  { name: 'Hernia repair (umbilical)', category: 'General Surgery' },
  { name: 'Hernia repair (hiatal)', category: 'General Surgery' },
  { name: 'Hernia repair (incisional)', category: 'General Surgery' },
  { name: 'Colectomy', category: 'General Surgery' },
  { name: 'Gastrectomy', category: 'General Surgery' },
  { name: 'Gastric bypass', category: 'General Surgery' },
  { name: 'Gastric sleeve', category: 'General Surgery' },
  { name: 'Liver resection', category: 'General Surgery' },
  { name: 'Pancreatectomy', category: 'General Surgery' },
  { name: 'Splenectomy', category: 'General Surgery' },
  { name: 'Bowel resection', category: 'General Surgery' },
  { name: 'Laparoscopic surgery', category: 'General Surgery' },
  { name: 'Exploratory laparotomy', category: 'General Surgery' },
  { name: 'Thyroidectomy', category: 'General Surgery' },
  { name: 'Parathyroidectomy', category: 'General Surgery' },
  { name: 'Adrenalectomy', category: 'General Surgery' },

  // Neurosurgery
  { name: 'Craniotomy', category: 'Neurosurgery' },
  { name: 'Brain tumor resection', category: 'Neurosurgery' },
  { name: 'VP shunt placement', category: 'Neurosurgery' },
  { name: 'Deep brain stimulation', category: 'Neurosurgery' },
  { name: 'Spinal fusion', category: 'Neurosurgery' },
  { name: 'Laminectomy', category: 'Neurosurgery' },
  { name: 'Discectomy', category: 'Neurosurgery' },
  { name: 'Microdiscectomy', category: 'Neurosurgery' },
  { name: 'Spinal cord decompression', category: 'Neurosurgery' },
  { name: 'Aneurysm clipping', category: 'Neurosurgery' },
  { name: 'Cerebral aneurysm repair', category: 'Neurosurgery' },
  { name: 'Epilepsy surgery', category: 'Neurosurgery' },
  { name: 'Stereotactic radiosurgery', category: 'Neurosurgery' },
  { name: 'Carpal tunnel release', category: 'Neurosurgery' },
  { name: 'Peripheral nerve surgery', category: 'Neurosurgery' },

  // Plastic Surgery
  { name: 'Rhinoplasty', category: 'Plastic Surgery' },
  { name: 'Facelift (Rhytidectomy)', category: 'Plastic Surgery' },
  { name: 'Blepharoplasty (Eyelid surgery)', category: 'Plastic Surgery' },
  { name: 'Breast augmentation', category: 'Plastic Surgery' },
  { name: 'Breast reduction', category: 'Plastic Surgery' },
  { name: 'Breast reconstruction', category: 'Plastic Surgery' },
  { name: 'Abdominoplasty (Tummy tuck)', category: 'Plastic Surgery' },
  { name: 'Liposuction', category: 'Plastic Surgery' },
  { name: 'Skin graft', category: 'Plastic Surgery' },
  { name: 'Burn reconstruction', category: 'Plastic Surgery' },
  { name: 'Cleft palate repair', category: 'Plastic Surgery' },
  { name: 'Hand reconstruction', category: 'Plastic Surgery' },
  { name: 'Scar revision', category: 'Plastic Surgery' },

  // Otolaryngology (ENT)
  { name: 'Tonsillectomy', category: 'Otolaryngology (ENT)' },
  { name: 'Adenoidectomy', category: 'Otolaryngology (ENT)' },
  { name: 'Septoplasty', category: 'Otolaryngology (ENT)' },
  { name: 'Sinus surgery (FESS)', category: 'Otolaryngology (ENT)' },
  { name: 'Cochlear implant', category: 'Otolaryngology (ENT)' },
  { name: 'Tympanoplasty', category: 'Otolaryngology (ENT)' },
  { name: 'Mastoidectomy', category: 'Otolaryngology (ENT)' },
  { name: 'Laryngoscopy', category: 'Otolaryngology (ENT)' },
  { name: 'Laryngectomy', category: 'Otolaryngology (ENT)' },
  { name: 'Neck dissection', category: 'Otolaryngology (ENT)' },
  { name: 'Parotidectomy', category: 'Otolaryngology (ENT)' },
  { name: 'Turbinate reduction', category: 'Otolaryngology (ENT)' },
  { name: 'Sleep apnea surgery (UPPP)', category: 'Otolaryngology (ENT)' },

  // Urology
  { name: 'Prostatectomy', category: 'Urology' },
  { name: 'Radical prostatectomy', category: 'Urology' },
  { name: 'TURP (Transurethral resection of prostate)', category: 'Urology' },
  { name: 'Nephrectomy', category: 'Urology' },
  { name: 'Partial nephrectomy', category: 'Urology' },
  { name: 'Cystectomy', category: 'Urology' },
  { name: 'Kidney transplant', category: 'Urology' },
  { name: 'Vasectomy', category: 'Urology' },
  { name: 'Vasectomy reversal', category: 'Urology' },
  { name: 'Circumcision', category: 'Urology' },
  { name: 'Lithotripsy', category: 'Urology' },
  { name: 'Ureteroscopy', category: 'Urology' },
  { name: 'Bladder suspension surgery', category: 'Urology' },
  { name: 'Penile implant', category: 'Urology' },
  { name: 'Orchiectomy', category: 'Urology' },

  // Obstetrics and Gynecology (OB/GYN)
  { name: 'Cesarean section (C-section)', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Hysterectomy (total)', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Hysterectomy (partial)', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Oophorectomy', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Salpingectomy', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Tubal ligation', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'D&C (Dilation and curettage)', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Myomectomy', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Ovarian cystectomy', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Endometrial ablation', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Laparoscopic surgery (gynecological)', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Hysteroscopy', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Cervical conization', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Vaginal repair surgery', category: 'Obstetrics and Gynecology (OB/GYN)' },
  { name: 'Episiotomy repair', category: 'Obstetrics and Gynecology (OB/GYN)' },

  // Ophthalmic Surgery
  { name: 'Cataract surgery', category: 'Ophthalmic Surgery' },
  { name: 'LASIK', category: 'Ophthalmic Surgery' },
  { name: 'PRK (Photorefractive keratectomy)', category: 'Ophthalmic Surgery' },
  { name: 'Glaucoma surgery', category: 'Ophthalmic Surgery' },
  { name: 'Trabeculectomy', category: 'Ophthalmic Surgery' },
  { name: 'Vitrectomy', category: 'Ophthalmic Surgery' },
  { name: 'Retinal detachment repair', category: 'Ophthalmic Surgery' },
  { name: 'Corneal transplant', category: 'Ophthalmic Surgery' },
  { name: 'Strabismus surgery', category: 'Ophthalmic Surgery' },
  { name: 'Eyelid surgery (ptosis repair)', category: 'Ophthalmic Surgery' },
  { name: 'Laser photocoagulation', category: 'Ophthalmic Surgery' },

  // Pediatric Surgery
  { name: 'Pediatric appendectomy', category: 'Pediatric Surgery' },
  { name: 'Pediatric hernia repair', category: 'Pediatric Surgery' },
  { name: 'Pyloric stenosis repair', category: 'Pediatric Surgery' },
  { name: 'Tracheoesophageal fistula repair', category: 'Pediatric Surgery' },
  { name: 'Hirschsprung disease surgery', category: 'Pediatric Surgery' },
  { name: 'Congenital heart defect repair', category: 'Pediatric Surgery' },
  { name: 'Undescended testicle surgery', category: 'Pediatric Surgery' },
  { name: 'Cleft lip/palate repair', category: 'Pediatric Surgery' },
  { name: 'Pediatric tumor resection', category: 'Pediatric Surgery' },
  { name: 'Gastrostomy tube placement', category: 'Pediatric Surgery' },

  // Colon and Rectal Surgery
  { name: 'Hemorrhoidectomy', category: 'Colon and Rectal Surgery' },
  { name: 'Fistulotomy', category: 'Colon and Rectal Surgery' },
  { name: 'Colostomy', category: 'Colon and Rectal Surgery' },
  { name: 'Ileostomy', category: 'Colon and Rectal Surgery' },
  { name: 'Colorectal cancer resection', category: 'Colon and Rectal Surgery' },
  { name: 'Rectopexy', category: 'Colon and Rectal Surgery' },
  { name: 'Anal sphincter repair', category: 'Colon and Rectal Surgery' },
  { name: 'Pilonidal cyst surgery', category: 'Colon and Rectal Surgery' },
  { name: 'J-pouch surgery', category: 'Colon and Rectal Surgery' },

  // Vascular Surgery
  { name: 'Carotid endarterectomy', category: 'Vascular Surgery' },
  { name: 'Aortic aneurysm repair (open)', category: 'Vascular Surgery' },
  { name: 'Aortic aneurysm repair (endovascular)', category: 'Vascular Surgery' },
  { name: 'Peripheral bypass surgery', category: 'Vascular Surgery' },
  { name: 'Varicose vein surgery', category: 'Vascular Surgery' },
  { name: 'Vein stripping', category: 'Vascular Surgery' },
  { name: 'Arteriovenous fistula creation', category: 'Vascular Surgery' },
  { name: 'Embolectomy', category: 'Vascular Surgery' },
  { name: 'Thrombectomy', category: 'Vascular Surgery' },
  { name: 'Angioplasty', category: 'Vascular Surgery' },
  { name: 'Stent placement', category: 'Vascular Surgery' },
  { name: 'Amputation (lower limb)', category: 'Vascular Surgery' },

  // Oral and Maxillofacial Surgery
  { name: 'Wisdom teeth extraction', category: 'Oral and Maxillofacial Surgery' },
  { name: 'Dental implant surgery', category: 'Oral and Maxillofacial Surgery' },
  { name: 'Jaw surgery (orthognathic)', category: 'Oral and Maxillofacial Surgery' },
  { name: 'TMJ surgery', category: 'Oral and Maxillofacial Surgery' },
  { name: 'Facial fracture repair', category: 'Oral and Maxillofacial Surgery' },
  { name: 'Cleft palate repair', category: 'Oral and Maxillofacial Surgery' },
  { name: 'Bone grafting (dental)', category: 'Oral and Maxillofacial Surgery' },
  { name: 'Oral tumor resection', category: 'Oral and Maxillofacial Surgery' },
  { name: 'Salivary gland surgery', category: 'Oral and Maxillofacial Surgery' },

  // Cardiovascular/Cardiothoracic Surgery
  { name: 'Coronary artery bypass graft (CABG)', category: 'Cardiovascular Surgery' },
  { name: 'Percutaneous coronary intervention (PCI/Stent)', category: 'Cardiovascular Surgery' },
  { name: 'Heart valve replacement', category: 'Cardiovascular Surgery' },
  { name: 'Heart valve repair', category: 'Cardiovascular Surgery' },
  { name: 'Pacemaker implantation', category: 'Cardiovascular Surgery' },
  { name: 'ICD implantation', category: 'Cardiovascular Surgery' },
  { name: 'Cardiac catheterization', category: 'Cardiovascular Surgery' },
  { name: 'Heart transplant', category: 'Cardiovascular Surgery' },
  { name: 'LVAD implantation', category: 'Cardiovascular Surgery' },
  { name: 'Maze procedure', category: 'Cardiovascular Surgery' },
  { name: 'CABG (Off-pump)', category: 'Cardiovascular Surgery' },

  // Thoracic Surgery
  { name: 'Lung resection (lobectomy)', category: 'Thoracic Surgery' },
  { name: 'Pneumonectomy', category: 'Thoracic Surgery' },
  { name: 'VATS (Video-assisted thoracoscopic surgery)', category: 'Thoracic Surgery' },
  { name: 'Lung transplant', category: 'Thoracic Surgery' },
  { name: 'Esophagectomy', category: 'Thoracic Surgery' },
  { name: 'Mediastinoscopy', category: 'Thoracic Surgery' },
  { name: 'Thymectomy', category: 'Thoracic Surgery' },

  // Orthopedic Surgery
  { name: 'Total hip replacement', category: 'Orthopedic Surgery' },
  { name: 'Total knee replacement', category: 'Orthopedic Surgery' },
  { name: 'Knee arthroscopy', category: 'Orthopedic Surgery' },
  { name: 'Shoulder replacement', category: 'Orthopedic Surgery' },
  { name: 'Rotator cuff repair', category: 'Orthopedic Surgery' },
  { name: 'ACL reconstruction', category: 'Orthopedic Surgery' },
  { name: 'Meniscus repair', category: 'Orthopedic Surgery' },
  { name: 'Fracture fixation (ORIF)', category: 'Orthopedic Surgery' },
  { name: 'Ankle replacement', category: 'Orthopedic Surgery' },
  { name: 'Bunionectomy', category: 'Orthopedic Surgery' },
  { name: 'Tendon repair', category: 'Orthopedic Surgery' },
  { name: 'Joint fusion (arthrodesis)', category: 'Orthopedic Surgery' },
  { name: 'Hip resurfacing', category: 'Orthopedic Surgery' },

  // Oncological Surgery
  { name: 'Mastectomy', category: 'Oncological Surgery' },
  { name: 'Lumpectomy', category: 'Oncological Surgery' },
  { name: 'Lymph node dissection', category: 'Oncological Surgery' },
  { name: 'Sentinel lymph node biopsy', category: 'Oncological Surgery' },
  { name: 'Tumor resection', category: 'Oncological Surgery' },
  { name: 'Whipple procedure', category: 'Oncological Surgery' },
  { name: 'Debulking surgery', category: 'Oncological Surgery' },
];

// ==================== MEDICATIONS DATABASE ====================
export interface DrugInfo {
  brandName: string;
  genericName: string;
  category: string;
  commonDosages: string[];
}

export const MEDICATIONS: DrugInfo[] = [
  // Cardiovascular
  { brandName: 'Lisinopril', genericName: 'lisinopril', category: 'ACE Inhibitor', commonDosages: ['5mg', '10mg', '20mg', '40mg'] },
  { brandName: 'Enalapril', genericName: 'enalapril', category: 'ACE Inhibitor', commonDosages: ['2.5mg', '5mg', '10mg', '20mg'] },
  { brandName: 'Ramipril', genericName: 'ramipril', category: 'ACE Inhibitor', commonDosages: ['2.5mg', '5mg', '10mg'] },
  { brandName: 'Losartan', genericName: 'losartan', category: 'ARB', commonDosages: ['25mg', '50mg', '100mg'] },
  { brandName: 'Valsartan', genericName: 'valsartan', category: 'ARB', commonDosages: ['80mg', '160mg', '320mg'] },
  { brandName: 'Olmesartan', genericName: 'olmesartan', category: 'ARB', commonDosages: ['20mg', '40mg'] },
  { brandName: 'Amlodipine', genericName: 'amlodipine', category: 'Calcium Channel Blocker', commonDosages: ['2.5mg', '5mg', '10mg'] },
  { brandName: 'Diltiazem', genericName: 'diltiazem', category: 'Calcium Channel Blocker', commonDosages: ['120mg', '180mg', '240mg', '360mg'] },
  { brandName: 'Metoprolol', genericName: 'metoprolol', category: 'Beta Blocker', commonDosages: ['25mg', '50mg', '100mg', '200mg'] },
  { brandName: 'Atenolol', genericName: 'atenolol', category: 'Beta Blocker', commonDosages: ['25mg', '50mg', '100mg'] },
  { brandName: 'Carvedilol', genericName: 'carvedilol', category: 'Beta Blocker', commonDosages: ['3.125mg', '6.25mg', '12.5mg', '25mg'] },
  { brandName: 'Propranolol', genericName: 'propranolol', category: 'Beta Blocker', commonDosages: ['10mg', '20mg', '40mg', '80mg'] },
  { brandName: 'Hydrochlorothiazide', genericName: 'hydrochlorothiazide', category: 'Diuretic', commonDosages: ['12.5mg', '25mg', '50mg'] },
  { brandName: 'Furosemide', genericName: 'furosemide', category: 'Loop Diuretic', commonDosages: ['20mg', '40mg', '80mg'] },
  { brandName: 'Spironolactone', genericName: 'spironolactone', category: 'Diuretic', commonDosages: ['25mg', '50mg', '100mg'] },
  { brandName: 'Nitroglycerin', genericName: 'nitroglycerin', category: 'Nitrate', commonDosages: ['0.3mg', '0.4mg', '0.6mg'] },
  { brandName: 'Isosorbide Mononitrate', genericName: 'isosorbide mononitrate', category: 'Nitrate', commonDosages: ['30mg', '60mg', '120mg'] },

  // Statins/Cholesterol
  { brandName: 'Lipitor', genericName: 'atorvastatin', category: 'Statin', commonDosages: ['10mg', '20mg', '40mg', '80mg'] },
  { brandName: 'Crestor', genericName: 'rosuvastatin', category: 'Statin', commonDosages: ['5mg', '10mg', '20mg', '40mg'] },
  { brandName: 'Zocor', genericName: 'simvastatin', category: 'Statin', commonDosages: ['10mg', '20mg', '40mg'] },
  { brandName: 'Pravachol', genericName: 'pravastatin', category: 'Statin', commonDosages: ['10mg', '20mg', '40mg', '80mg'] },
  { brandName: 'Ezetimibe', genericName: 'ezetimibe', category: 'Cholesterol Absorption Inhibitor', commonDosages: ['10mg'] },

  // Anticoagulants/Antiplatelets
  { brandName: 'Aspirin', genericName: 'aspirin', category: 'Antiplatelet', commonDosages: ['81mg', '325mg'] },
  { brandName: 'Plavix', genericName: 'clopidogrel', category: 'Antiplatelet', commonDosages: ['75mg'] },
  { brandName: 'Coumadin', genericName: 'warfarin', category: 'Anticoagulant', commonDosages: ['1mg', '2mg', '2.5mg', '5mg', '7.5mg', '10mg'] },
  { brandName: 'Eliquis', genericName: 'apixaban', category: 'Anticoagulant', commonDosages: ['2.5mg', '5mg'] },
  { brandName: 'Xarelto', genericName: 'rivaroxaban', category: 'Anticoagulant', commonDosages: ['10mg', '15mg', '20mg'] },
  { brandName: 'Pradaxa', genericName: 'dabigatran', category: 'Anticoagulant', commonDosages: ['75mg', '110mg', '150mg'] },

  // Diabetes
  { brandName: 'Glucophage', genericName: 'metformin', category: 'Biguanide', commonDosages: ['500mg', '850mg', '1000mg'] },
  { brandName: 'Januvia', genericName: 'sitagliptin', category: 'DPP-4 Inhibitor', commonDosages: ['25mg', '50mg', '100mg'] },
  { brandName: 'Jardiance', genericName: 'empagliflozin', category: 'SGLT2 Inhibitor', commonDosages: ['10mg', '25mg'] },
  { brandName: 'Farxiga', genericName: 'dapagliflozin', category: 'SGLT2 Inhibitor', commonDosages: ['5mg', '10mg'] },
  { brandName: 'Ozempic', genericName: 'semaglutide', category: 'GLP-1 Agonist', commonDosages: ['0.25mg', '0.5mg', '1mg', '2mg'] },
  { brandName: 'Trulicity', genericName: 'dulaglutide', category: 'GLP-1 Agonist', commonDosages: ['0.75mg', '1.5mg', '3mg', '4.5mg'] },
  { brandName: 'Glipizide', genericName: 'glipizide', category: 'Sulfonylurea', commonDosages: ['5mg', '10mg'] },
  { brandName: 'Glyburide', genericName: 'glyburide', category: 'Sulfonylurea', commonDosages: ['1.25mg', '2.5mg', '5mg'] },
  { brandName: 'Lantus', genericName: 'insulin glargine', category: 'Insulin', commonDosages: ['10 units', '20 units', '30 units', '40 units'] },
  { brandName: 'Humalog', genericName: 'insulin lispro', category: 'Insulin', commonDosages: ['Variable units'] },

  // Thyroid
  { brandName: 'Synthroid', genericName: 'levothyroxine', category: 'Thyroid', commonDosages: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg', '150mcg'] },
  { brandName: 'Cytomel', genericName: 'liothyronine', category: 'Thyroid', commonDosages: ['5mcg', '25mcg', '50mcg'] },
  { brandName: 'Methimazole', genericName: 'methimazole', category: 'Antithyroid', commonDosages: ['5mg', '10mg', '20mg'] },

  // Pain/Inflammation
  { brandName: 'Tylenol', genericName: 'acetaminophen', category: 'Analgesic', commonDosages: ['325mg', '500mg', '650mg', '1000mg'] },
  { brandName: 'Advil', genericName: 'ibuprofen', category: 'NSAID', commonDosages: ['200mg', '400mg', '600mg', '800mg'] },
  { brandName: 'Aleve', genericName: 'naproxen', category: 'NSAID', commonDosages: ['220mg', '250mg', '375mg', '500mg'] },
  { brandName: 'Celebrex', genericName: 'celecoxib', category: 'COX-2 Inhibitor', commonDosages: ['100mg', '200mg'] },
  { brandName: 'Tramadol', genericName: 'tramadol', category: 'Opioid', commonDosages: ['50mg', '100mg'] },
  { brandName: 'Gabapentin', genericName: 'gabapentin', category: 'Neuropathic Pain', commonDosages: ['100mg', '300mg', '400mg', '600mg', '800mg'] },
  { brandName: 'Lyrica', genericName: 'pregabalin', category: 'Neuropathic Pain', commonDosages: ['25mg', '50mg', '75mg', '150mg', '300mg'] },

  // Psychiatric
  { brandName: 'Zoloft', genericName: 'sertraline', category: 'SSRI', commonDosages: ['25mg', '50mg', '100mg', '150mg', '200mg'] },
  { brandName: 'Lexapro', genericName: 'escitalopram', category: 'SSRI', commonDosages: ['5mg', '10mg', '20mg'] },
  { brandName: 'Prozac', genericName: 'fluoxetine', category: 'SSRI', commonDosages: ['10mg', '20mg', '40mg', '60mg'] },
  { brandName: 'Paxil', genericName: 'paroxetine', category: 'SSRI', commonDosages: ['10mg', '20mg', '30mg', '40mg'] },
  { brandName: 'Celexa', genericName: 'citalopram', category: 'SSRI', commonDosages: ['10mg', '20mg', '40mg'] },
  { brandName: 'Cymbalta', genericName: 'duloxetine', category: 'SNRI', commonDosages: ['20mg', '30mg', '60mg'] },
  { brandName: 'Effexor', genericName: 'venlafaxine', category: 'SNRI', commonDosages: ['37.5mg', '75mg', '150mg', '225mg'] },
  { brandName: 'Wellbutrin', genericName: 'bupropion', category: 'Antidepressant', commonDosages: ['100mg', '150mg', '300mg'] },
  { brandName: 'Xanax', genericName: 'alprazolam', category: 'Benzodiazepine', commonDosages: ['0.25mg', '0.5mg', '1mg', '2mg'] },
  { brandName: 'Ativan', genericName: 'lorazepam', category: 'Benzodiazepine', commonDosages: ['0.5mg', '1mg', '2mg'] },
  { brandName: 'Klonopin', genericName: 'clonazepam', category: 'Benzodiazepine', commonDosages: ['0.25mg', '0.5mg', '1mg', '2mg'] },
  { brandName: 'Ambien', genericName: 'zolpidem', category: 'Sedative', commonDosages: ['5mg', '10mg'] },
  { brandName: 'Seroquel', genericName: 'quetiapine', category: 'Antipsychotic', commonDosages: ['25mg', '50mg', '100mg', '200mg', '300mg'] },
  { brandName: 'Abilify', genericName: 'aripiprazole', category: 'Antipsychotic', commonDosages: ['2mg', '5mg', '10mg', '15mg', '20mg', '30mg'] },
  { brandName: 'Risperdal', genericName: 'risperidone', category: 'Antipsychotic', commonDosages: ['0.5mg', '1mg', '2mg', '3mg', '4mg'] },

  // Respiratory
  { brandName: 'Albuterol', genericName: 'albuterol', category: 'Bronchodilator', commonDosages: ['90mcg/puff', '2.5mg/3mL nebulizer'] },
  { brandName: 'Symbicort', genericName: 'budesonide/formoterol', category: 'Inhaled Corticosteroid', commonDosages: ['80/4.5mcg', '160/4.5mcg'] },
  { brandName: 'Advair', genericName: 'fluticasone/salmeterol', category: 'Inhaled Corticosteroid', commonDosages: ['100/50mcg', '250/50mcg', '500/50mcg'] },
  { brandName: 'Spiriva', genericName: 'tiotropium', category: 'Anticholinergic', commonDosages: ['18mcg', '2.5mcg'] },
  { brandName: 'Singulair', genericName: 'montelukast', category: 'Leukotriene Modifier', commonDosages: ['4mg', '5mg', '10mg'] },
  { brandName: 'Prednisone', genericName: 'prednisone', category: 'Corticosteroid', commonDosages: ['5mg', '10mg', '20mg', '50mg'] },

  // GI
  { brandName: 'Prilosec', genericName: 'omeprazole', category: 'PPI', commonDosages: ['10mg', '20mg', '40mg'] },
  { brandName: 'Nexium', genericName: 'esomeprazole', category: 'PPI', commonDosages: ['20mg', '40mg'] },
  { brandName: 'Protonix', genericName: 'pantoprazole', category: 'PPI', commonDosages: ['20mg', '40mg'] },
  { brandName: 'Pepcid', genericName: 'famotidine', category: 'H2 Blocker', commonDosages: ['10mg', '20mg', '40mg'] },
  { brandName: 'Zofran', genericName: 'ondansetron', category: 'Antiemetic', commonDosages: ['4mg', '8mg'] },
  { brandName: 'Reglan', genericName: 'metoclopramide', category: 'Prokinetic', commonDosages: ['5mg', '10mg'] },

  // Antibiotics
  { brandName: 'Amoxicillin', genericName: 'amoxicillin', category: 'Antibiotic', commonDosages: ['250mg', '500mg', '875mg'] },
  { brandName: 'Augmentin', genericName: 'amoxicillin/clavulanate', category: 'Antibiotic', commonDosages: ['500/125mg', '875/125mg'] },
  { brandName: 'Azithromycin', genericName: 'azithromycin', category: 'Antibiotic', commonDosages: ['250mg', '500mg'] },
  { brandName: 'Ciprofloxacin', genericName: 'ciprofloxacin', category: 'Antibiotic', commonDosages: ['250mg', '500mg', '750mg'] },
  { brandName: 'Levofloxacin', genericName: 'levofloxacin', category: 'Antibiotic', commonDosages: ['250mg', '500mg', '750mg'] },
  { brandName: 'Doxycycline', genericName: 'doxycycline', category: 'Antibiotic', commonDosages: ['50mg', '100mg'] },
  { brandName: 'Bactrim', genericName: 'sulfamethoxazole/trimethoprim', category: 'Antibiotic', commonDosages: ['400/80mg', '800/160mg'] },

  // Urology
  { brandName: 'Flomax', genericName: 'tamsulosin', category: 'Alpha Blocker', commonDosages: ['0.4mg'] },
  { brandName: 'Finasteride', genericName: 'finasteride', category: '5-Alpha Reductase Inhibitor', commonDosages: ['1mg', '5mg'] },
  { brandName: 'Viagra', genericName: 'sildenafil', category: 'PDE5 Inhibitor', commonDosages: ['25mg', '50mg', '100mg'] },
  { brandName: 'Cialis', genericName: 'tadalafil', category: 'PDE5 Inhibitor', commonDosages: ['2.5mg', '5mg', '10mg', '20mg'] },

  // Additional Medications - User Requested
  { brandName: 'Acetaminophen', genericName: 'acetaminophen', category: 'Analgesic', commonDosages: ['325mg', '500mg', '650mg', '1000mg'] },
  { brandName: 'Adderall', genericName: 'amphetamine/dextroamphetamine', category: 'CNS Stimulant', commonDosages: ['5mg', '10mg', '15mg', '20mg', '25mg', '30mg'] },
  { brandName: 'Amitriptyline', genericName: 'amitriptyline', category: 'Tricyclic Antidepressant', commonDosages: ['10mg', '25mg', '50mg', '75mg', '100mg', '150mg'] },
  { brandName: 'Benzonatate', genericName: 'benzonatate', category: 'Antitussive', commonDosages: ['100mg', '200mg'] },
  { brandName: 'Biktarvy', genericName: 'bictegravir/emtricitabine/tenofovir', category: 'HIV Antiretroviral', commonDosages: ['50/200/25mg'] },
  { brandName: 'Botox', genericName: 'onabotulinumtoxinA', category: 'Neuromuscular Blocker', commonDosages: ['50 units', '100 units', '200 units'] },
  { brandName: 'Brilinta', genericName: 'ticagrelor', category: 'Antiplatelet', commonDosages: ['60mg', '90mg'] },
  { brandName: 'Bunavail', genericName: 'buprenorphine/naloxone', category: 'Opioid Partial Agonist', commonDosages: ['2.1/0.3mg', '4.2/0.7mg', '6.3/1mg'] },
  { brandName: 'Buprenorphine', genericName: 'buprenorphine', category: 'Opioid Partial Agonist', commonDosages: ['2mg', '4mg', '8mg'] },
  { brandName: 'Cephalexin', genericName: 'cephalexin', category: 'Antibiotic', commonDosages: ['250mg', '500mg', '750mg'] },
  { brandName: 'Clindamycin', genericName: 'clindamycin', category: 'Antibiotic', commonDosages: ['150mg', '300mg', '450mg'] },
  { brandName: 'Cyclobenzaprine', genericName: 'cyclobenzaprine', category: 'Muscle Relaxant', commonDosages: ['5mg', '10mg', '15mg'] },
  { brandName: 'Dupixent', genericName: 'dupilumab', category: 'Immunomodulator', commonDosages: ['200mg', '300mg'] },
  { brandName: 'Entresto', genericName: 'sacubitril/valsartan', category: 'Heart Failure', commonDosages: ['24/26mg', '49/51mg', '97/103mg'] },
  { brandName: 'Entyvio', genericName: 'vedolizumab', category: 'Immunomodulator', commonDosages: ['300mg'] },
  { brandName: 'Fentanyl Patch', genericName: 'fentanyl transdermal', category: 'Opioid', commonDosages: ['12mcg/hr', '25mcg/hr', '50mcg/hr', '75mcg/hr', '100mcg/hr'] },
  { brandName: 'Gemtesa', genericName: 'vibegron', category: 'Overactive Bladder', commonDosages: ['75mg'] },
  { brandName: 'Humira', genericName: 'adalimumab', category: 'Immunomodulator', commonDosages: ['20mg', '40mg', '80mg'] },
  { brandName: 'Imbruvica', genericName: 'ibrutinib', category: 'Antineoplastic', commonDosages: ['140mg', '280mg', '420mg', '560mg'] },
  { brandName: 'Keytruda', genericName: 'pembrolizumab', category: 'Immunotherapy', commonDosages: ['200mg', '400mg'] },
  { brandName: 'Lofexidine', genericName: 'lofexidine', category: 'Opioid Withdrawal', commonDosages: ['0.18mg'] },
  { brandName: 'Loratadine', genericName: 'loratadine', category: 'Antihistamine', commonDosages: ['10mg'] },
  { brandName: 'Melatonin', genericName: 'melatonin', category: 'Sleep Aid', commonDosages: ['1mg', '3mg', '5mg', '10mg'] },
  { brandName: 'Meloxicam', genericName: 'meloxicam', category: 'NSAID', commonDosages: ['7.5mg', '15mg'] },
  { brandName: 'Metformin', genericName: 'metformin', category: 'Antidiabetic', commonDosages: ['500mg', '850mg', '1000mg'] },
  { brandName: 'Methadone', genericName: 'methadone', category: 'Opioid Agonist', commonDosages: ['5mg', '10mg', '40mg'] },
  { brandName: 'Methotrexate', genericName: 'methotrexate', category: 'Immunosuppressant', commonDosages: ['2.5mg', '5mg', '7.5mg', '10mg', '15mg', '25mg'] },
  { brandName: 'Mounjaro', genericName: 'tirzepatide', category: 'GLP-1/GIP Agonist', commonDosages: ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'] },
  { brandName: 'Naltrexone', genericName: 'naltrexone', category: 'Opioid Antagonist', commonDosages: ['25mg', '50mg'] },
  { brandName: 'Narcan', genericName: 'naloxone', category: 'Opioid Reversal', commonDosages: ['2mg nasal', '4mg nasal', '0.4mg injection'] },
  { brandName: 'Nurtec', genericName: 'rimegepant', category: 'Migraine', commonDosages: ['75mg'] },
  { brandName: 'Opdivo', genericName: 'nivolumab', category: 'Immunotherapy', commonDosages: ['40mg', '100mg', '240mg'] },
  { brandName: 'Otezla', genericName: 'apremilast', category: 'Immunomodulator', commonDosages: ['10mg', '20mg', '30mg'] },
  { brandName: 'Plan B', genericName: 'levonorgestrel', category: 'Emergency Contraceptive', commonDosages: ['1.5mg'] },
  { brandName: 'Probuphine', genericName: 'buprenorphine implant', category: 'Opioid Partial Agonist', commonDosages: ['80mg implant'] },
  { brandName: 'Qulipta', genericName: 'atogepant', category: 'Migraine Prevention', commonDosages: ['10mg', '30mg', '60mg'] },
  { brandName: 'Quviviq', genericName: 'daridorexant', category: 'Sleep Aid', commonDosages: ['25mg', '50mg'] },
  { brandName: 'Rybelsus', genericName: 'semaglutide oral', category: 'GLP-1 Agonist', commonDosages: ['3mg', '7mg', '14mg'] },
  { brandName: 'Sublocade', genericName: 'buprenorphine extended-release', category: 'Opioid Partial Agonist', commonDosages: ['100mg', '300mg'] },
  { brandName: 'Sunlenca', genericName: 'lenacapavir', category: 'HIV Antiretroviral', commonDosages: ['927mg injection'] },
  { brandName: 'Tepezza', genericName: 'teprotumumab', category: 'Thyroid Eye Disease', commonDosages: ['10mg/kg', '20mg/kg'] },
  { brandName: 'Trazodone', genericName: 'trazodone', category: 'Antidepressant/Sleep', commonDosages: ['50mg', '100mg', '150mg', '300mg'] },
  { brandName: 'Vraylar', genericName: 'cariprazine', category: 'Antipsychotic', commonDosages: ['1.5mg', '3mg', '4.5mg', '6mg'] },
  { brandName: 'Wegovy', genericName: 'semaglutide', category: 'Weight Management', commonDosages: ['0.25mg', '0.5mg', '1mg', '1.7mg', '2.4mg'] },
  { brandName: 'Yervoy', genericName: 'ipilimumab', category: 'Immunotherapy', commonDosages: ['50mg', '200mg'] },
  { brandName: 'Zepbound', genericName: 'tirzepatide', category: 'Weight Management', commonDosages: ['2.5mg', '5mg', '7.5mg', '10mg', '12.5mg', '15mg'] },
  { brandName: 'Zubsolv', genericName: 'buprenorphine/naloxone', category: 'Opioid Partial Agonist', commonDosages: ['0.7/0.18mg', '1.4/0.36mg', '2.9/0.71mg', '5.7/1.4mg', '8.6/2.1mg', '11.4/2.9mg'] },

  // Supplements and Other
  { brandName: 'Vitamin D3', genericName: 'cholecalciferol', category: 'Supplement', commonDosages: ['1000 IU', '2000 IU', '5000 IU', '50000 IU'] },
  { brandName: 'Multivitamin', genericName: 'multivitamin', category: 'Supplement', commonDosages: ['1 tablet'] },
  { brandName: 'Fish Oil', genericName: 'omega-3 fatty acids', category: 'Supplement', commonDosages: ['1000mg', '1200mg'] },
  { brandName: 'Calcium', genericName: 'calcium carbonate', category: 'Supplement', commonDosages: ['500mg', '600mg', '1000mg'] },
  { brandName: 'Iron', genericName: 'ferrous sulfate', category: 'Supplement', commonDosages: ['325mg'] },
  { brandName: 'Folic Acid', genericName: 'folic acid', category: 'Supplement', commonDosages: ['400mcg', '800mcg', '1mg'] },
];

// ==================== FREQUENCY OPTIONS ====================
export const FREQUENCY_OPTIONS = [
  { value: 'QD', label: 'Once daily (QD)' },
  { value: 'BID', label: 'Twice daily (BID)' },
  { value: 'TID', label: 'Three times daily (TID)' },
  { value: 'QID', label: 'Four times daily (QID)' },
  { value: 'Q4H', label: 'Every 4 hours (Q4H)' },
  { value: 'Q6H', label: 'Every 6 hours (Q6H)' },
  { value: 'Q8H', label: 'Every 8 hours (Q8H)' },
  { value: 'Q12H', label: 'Every 12 hours (Q12H)' },
  { value: 'QHS', label: 'At bedtime (QHS)' },
  { value: 'QAM', label: 'Every morning (QAM)' },
  { value: 'QPM', label: 'Every evening (QPM)' },
  { value: 'QOD', label: 'Every other day (QOD)' },
  { value: 'QWeek', label: 'Once weekly' },
  { value: 'BIW', label: 'Twice weekly' },
  { value: 'QMonth', label: 'Once monthly' },
  { value: 'PRN', label: 'As needed (PRN)' },
  { value: 'AC', label: 'Before meals (AC)' },
  { value: 'PC', label: 'After meals (PC)' },
  { value: 'STAT', label: 'Immediately (STAT)' },
];

// ==================== SYMPTOM DURATION OPTIONS ====================
export const SYMPTOM_DURATION_OPTIONS = [
  { value: '< 24 hours', label: 'Less than 24 hours' },
  { value: '1-3 days', label: '1-3 days' },
  { value: '4-7 days', label: '4-7 days' },
  { value: '1-2 weeks', label: '1-2 weeks' },
  { value: '2-4 weeks', label: '2-4 weeks' },
  { value: '1-3 months', label: '1-3 months' },
  { value: '3-6 months', label: '3-6 months' },
  { value: '6-12 months', label: '6-12 months' },
  { value: '1-2 years', label: '1-2 years' },
  { value: '2-5 years', label: '2-5 years' },
  { value: '> 5 years', label: 'More than 5 years' },
  { value: 'Since childhood', label: 'Since childhood' },
  { value: 'Intermittent', label: 'Intermittent/Recurring' },
  { value: 'Unknown', label: 'Unknown/Uncertain' },
];

// ==================== OCCUPATION OPTIONS ====================
export const OCCUPATION_OPTIONS = [
  // Healthcare
  { value: 'Physician', category: 'Healthcare' },
  { value: 'Nurse', category: 'Healthcare' },
  { value: 'Pharmacist', category: 'Healthcare' },
  { value: 'Dentist', category: 'Healthcare' },
  { value: 'Physical Therapist', category: 'Healthcare' },
  { value: 'Healthcare Administrator', category: 'Healthcare' },
  { value: 'Medical Technician', category: 'Healthcare' },
  { value: 'Paramedic/EMT', category: 'Healthcare' },

  // Office/Professional
  { value: 'Office Worker', category: 'Professional' },
  { value: 'Accountant', category: 'Professional' },
  { value: 'Lawyer', category: 'Professional' },
  { value: 'Engineer', category: 'Professional' },
  { value: 'Architect', category: 'Professional' },
  { value: 'Software Developer', category: 'Professional' },
  { value: 'Manager/Executive', category: 'Professional' },
  { value: 'Sales Representative', category: 'Professional' },
  { value: 'Consultant', category: 'Professional' },

  // Education
  { value: 'Teacher', category: 'Education' },
  { value: 'Professor', category: 'Education' },
  { value: 'School Administrator', category: 'Education' },
  { value: 'Researcher', category: 'Education' },

  // Service Industry
  { value: 'Retail Worker', category: 'Service' },
  { value: 'Restaurant Worker', category: 'Service' },
  { value: 'Customer Service', category: 'Service' },
  { value: 'Hospitality Worker', category: 'Service' },

  // Trades/Labor
  { value: 'Construction Worker', category: 'Trades' },
  { value: 'Electrician', category: 'Trades' },
  { value: 'Plumber', category: 'Trades' },
  { value: 'Carpenter', category: 'Trades' },
  { value: 'Mechanic', category: 'Trades' },
  { value: 'Welder', category: 'Trades' },
  { value: 'Factory Worker', category: 'Trades' },
  { value: 'Warehouse Worker', category: 'Trades' },

  // Transportation
  { value: 'Truck Driver', category: 'Transportation' },
  { value: 'Pilot', category: 'Transportation' },
  { value: 'Bus Driver', category: 'Transportation' },
  { value: 'Delivery Driver', category: 'Transportation' },

  // Other
  { value: 'Artist/Musician', category: 'Creative' },
  { value: 'Athlete', category: 'Sports' },
  { value: 'Military/Law Enforcement', category: 'Public Service' },
  { value: 'Farmer/Agriculture', category: 'Agriculture' },
  { value: 'Homemaker', category: 'Home' },
  { value: 'Student', category: 'Education' },
  { value: 'Retired', category: 'Other' },
  { value: 'Unemployed', category: 'Other' },
  { value: 'Disabled', category: 'Other' },
  { value: 'Self-Employed', category: 'Other' },
  { value: 'Prefer not to say', category: 'Other' },
  { value: 'Other', category: 'Other' },
];

// ==================== PRESCRIBER OPTIONS ====================
export const PRESCRIBER_OPTIONS = [
  // Primary Care
  { value: 'Family Physician', category: 'Primary Care' },
  { value: 'General Internal Medicine Physician', category: 'Primary Care' },
  { value: 'Pediatrician', category: 'Primary Care' },
  { value: 'Geriatrician', category: 'Primary Care' },

  // Specialists
  { value: 'Obstetrician/Gynecologist (OB/GYN)', category: 'Specialist' },
  { value: 'Allergist/Immunologist', category: 'Specialist' },
  { value: 'Anesthesiologist', category: 'Specialist' },
  { value: 'Cardiologist', category: 'Specialist' },
  { value: 'Dermatologist', category: 'Specialist' },
  { value: 'Emergency Medicine Physician', category: 'Specialist' },
  { value: 'Endocrinologist', category: 'Specialist' },
  { value: 'Gastroenterologist', category: 'Specialist' },
  { value: 'Hematologist', category: 'Specialist' },
  { value: 'Infectious Disease Specialist', category: 'Specialist' },
  { value: 'Nephrologist', category: 'Specialist' },
  { value: 'Neurologist', category: 'Specialist' },
  { value: 'Oncologist', category: 'Specialist' },
  { value: 'Ophthalmologist', category: 'Specialist' },
  { value: 'Orthopedic Surgeon', category: 'Specialist' },
  { value: 'Otolaryngologist (ENT)', category: 'Specialist' },
  { value: 'Pain Management Specialist', category: 'Specialist' },
  { value: 'Pathologist', category: 'Specialist' },
  { value: 'Physiatrist (PM&R)', category: 'Specialist' },
  { value: 'Plastic Surgeon', category: 'Specialist' },
  { value: 'Podiatrist', category: 'Specialist' },
  { value: 'Psychiatrist', category: 'Specialist' },
  { value: 'Pulmonologist', category: 'Specialist' },
  { value: 'Radiologist', category: 'Specialist' },
  { value: 'Rheumatologist', category: 'Specialist' },
  { value: 'Sports Medicine Physician', category: 'Specialist' },
  { value: 'Surgeon (General)', category: 'Specialist' },
  { value: 'Urologist', category: 'Specialist' },
  { value: 'Vascular Surgeon', category: 'Specialist' },

  // Other Providers
  { value: 'Nurse Practitioner (NP)', category: 'Advanced Practice' },
  { value: 'Physician Assistant (PA)', category: 'Advanced Practice' },
  { value: 'Dentist', category: 'Dental' },
  { value: 'Oral Surgeon', category: 'Dental' },
  { value: 'Pharmacist', category: 'Pharmacy' },
  { value: 'Hospital/Inpatient', category: 'Facility' },
  { value: 'Urgent Care', category: 'Facility' },
  { value: 'Emergency Room', category: 'Facility' },
  { value: 'Self-prescribed (OTC)', category: 'Self' },
  { value: 'Unknown/Not specified', category: 'Other' },
];

// ==================== DIET TYPES ====================
export const DIET_TYPES = [
  // Balanced/General
  { value: 'Regular/Mixed Diet', category: 'General' },
  { value: 'Balanced Diet', category: 'General' },
  { value: 'Mediterranean Diet', category: 'Heart-Healthy' },
  { value: 'DASH Diet (Dietary Approaches to Stop Hypertension)', category: 'Heart-Healthy' },
  { value: 'MIND Diet', category: 'Heart-Healthy' },

  // Plant-Based
  { value: 'Plant-Based Diet', category: 'Vegetarian' },
  { value: 'Flexitarian Diet', category: 'Vegetarian' },
  { value: 'Pescatarian', category: 'Vegetarian' },
  { value: 'Vegetarian', category: 'Vegetarian' },
  { value: 'Lacto-ovo Vegetarian', category: 'Vegetarian' },
  { value: 'Lacto Vegetarian', category: 'Vegetarian' },
  { value: 'Ovo Vegetarian', category: 'Vegetarian' },
  { value: 'Vegan', category: 'Vegetarian' },
  { value: 'Fruitarianism', category: 'Vegetarian' },
  { value: 'Raw Food Diet (Raw Foodism)', category: 'Vegetarian' },

  // Low-Carb/Keto
  { value: 'Ketogenic (Keto) Diet', category: 'Low-Carb' },
  { value: 'Low-Carb Diet', category: 'Low-Carb' },
  { value: 'Atkins Diet', category: 'Low-Carb' },
  { value: 'South Beach Diet', category: 'Low-Carb' },

  // High-Protein/Other Macros
  { value: 'High-Protein Diet', category: 'Protein-Focused' },
  { value: 'Low-Fat Diet', category: 'Fat-Restricted' },
  { value: 'Zone Diet', category: 'Balanced Macros' },

  // Fasting/Timing
  { value: 'Intermittent Fasting', category: 'Time-Restricted' },
  { value: 'Time-Restricted Eating', category: 'Time-Restricted' },
  { value: 'OMAD (One Meal a Day)', category: 'Time-Restricted' },

  // Ancestral/Elimination
  { value: 'Paleo Diet', category: 'Ancestral' },
  { value: 'Whole30', category: 'Elimination' },
  { value: 'Elimination Diet', category: 'Elimination' },
  { value: 'Anti-Inflammatory Diet', category: 'Therapeutic' },

  // Allergy/Intolerance
  { value: 'Gluten-Free Diet', category: 'Allergy/Intolerance' },
  { value: 'Dairy-Free Diet', category: 'Allergy/Intolerance' },
  { value: 'Lactose-Free Diet', category: 'Allergy/Intolerance' },
  { value: 'Nut-Free Diet', category: 'Allergy/Intolerance' },
  { value: 'Egg-Free Diet', category: 'Allergy/Intolerance' },
  { value: 'Soy-Free Diet', category: 'Allergy/Intolerance' },

  // Medical/Therapeutic
  { value: 'Diabetic Diet', category: 'Medical' },
  { value: 'Cardiac/Heart Healthy Diet', category: 'Medical' },
  { value: 'Renal/Kidney Diet', category: 'Medical' },
  { value: 'Low-Sodium Diet', category: 'Medical' },
  { value: 'Low-Potassium Diet', category: 'Medical' },
  { value: 'Low-Phosphorus Diet', category: 'Medical' },
  { value: 'Low-FODMAP Diet', category: 'Medical' },
  { value: 'Soft/Mechanical Soft Diet', category: 'Medical' },
  { value: 'Liquid Diet', category: 'Medical' },
  { value: 'Tube Feeding/Enteral Nutrition', category: 'Medical' },
  { value: 'TPN (Total Parenteral Nutrition)', category: 'Medical' },

  // Cultural/Religious
  { value: 'Kosher Diet', category: 'Religious' },
  { value: 'Halal Diet', category: 'Religious' },
  { value: 'Hindu Vegetarian', category: 'Religious' },

  // Other
  { value: 'No Specific Diet', category: 'Other' },
  { value: 'Other (please specify)', category: 'Other' },
];

// ==================== OCCUPATIONAL HAZARDS ====================
export const OCCUPATIONAL_HAZARDS = [
  // Chemical Hazards
  { value: 'None', category: 'None' },
  { value: 'Chemical Exposure - General', category: 'Chemical' },
  { value: 'Pesticides/Herbicides', category: 'Chemical' },
  { value: 'Industrial Solvents', category: 'Chemical' },
  { value: 'Heavy Metals (Lead, Mercury)', category: 'Chemical' },
  { value: 'Asbestos Exposure', category: 'Chemical' },
  { value: 'Silica Dust', category: 'Chemical' },
  { value: 'Formaldehyde', category: 'Chemical' },
  { value: 'Petroleum Products', category: 'Chemical' },
  { value: 'Cleaning Chemicals', category: 'Chemical' },
  { value: 'Paint/Coatings', category: 'Chemical' },
  { value: 'Pharmaceutical Compounds', category: 'Chemical' },
  { value: 'Anesthetic Gases', category: 'Chemical' },

  // Physical Hazards
  { value: 'Noise Exposure', category: 'Physical' },
  { value: 'Vibration Exposure', category: 'Physical' },
  { value: 'Extreme Heat', category: 'Physical' },
  { value: 'Extreme Cold', category: 'Physical' },
  { value: 'Radiation (Ionizing)', category: 'Physical' },
  { value: 'Radiation (Non-ionizing/UV)', category: 'Physical' },
  { value: 'High Altitude', category: 'Physical' },
  { value: 'High Pressure (Diving)', category: 'Physical' },
  { value: 'Electrical Hazards', category: 'Physical' },

  // Ergonomic Hazards
  { value: 'Repetitive Motion', category: 'Ergonomic' },
  { value: 'Heavy Lifting', category: 'Ergonomic' },
  { value: 'Prolonged Standing', category: 'Ergonomic' },
  { value: 'Prolonged Sitting', category: 'Ergonomic' },
  { value: 'Awkward Postures', category: 'Ergonomic' },
  { value: 'Computer/Screen Work', category: 'Ergonomic' },
  { value: 'Manual Labor', category: 'Ergonomic' },

  // Biological Hazards
  { value: 'Bloodborne Pathogens', category: 'Biological' },
  { value: 'Airborne Pathogens', category: 'Biological' },
  { value: 'Animal Contact', category: 'Biological' },
  { value: 'Mold/Fungi Exposure', category: 'Biological' },
  { value: 'Bacterial Exposure', category: 'Biological' },
  { value: 'Viral Exposure', category: 'Biological' },
  { value: 'Healthcare Setting', category: 'Biological' },
  { value: 'Laboratory Work', category: 'Biological' },

  // Dust/Particulates
  { value: 'Coal Dust', category: 'Dust/Particulates' },
  { value: 'Wood Dust', category: 'Dust/Particulates' },
  { value: 'Metal Dust/Fumes', category: 'Dust/Particulates' },
  { value: 'Textile Fibers', category: 'Dust/Particulates' },
  { value: 'Grain Dust', category: 'Dust/Particulates' },
  { value: 'Construction Dust', category: 'Dust/Particulates' },
  { value: 'Welding Fumes', category: 'Dust/Particulates' },

  // Psychosocial Hazards
  { value: 'High Stress Environment', category: 'Psychosocial' },
  { value: 'Shift Work/Night Shifts', category: 'Psychosocial' },
  { value: 'Long Working Hours', category: 'Psychosocial' },
  { value: 'Workplace Violence Risk', category: 'Psychosocial' },
  { value: 'Isolation/Remote Work', category: 'Psychosocial' },
  { value: 'Emergency Response', category: 'Psychosocial' },

  // Industry-Specific
  { value: 'Mining Hazards', category: 'Industry-Specific' },
  { value: 'Agricultural Hazards', category: 'Industry-Specific' },
  { value: 'Construction Hazards', category: 'Industry-Specific' },
  { value: 'Manufacturing Hazards', category: 'Industry-Specific' },
  { value: 'Transportation Hazards', category: 'Industry-Specific' },
  { value: 'Oil/Gas Industry', category: 'Industry-Specific' },
  { value: 'Food Processing', category: 'Industry-Specific' },

  // Multiple/Other
  { value: 'Multiple Hazards', category: 'Other' },
  { value: 'Other (specify in notes)', category: 'Other' },
];

// ==================== HELPER FUNCTIONS ====================
export const findDrugByName = (name: string): DrugInfo | undefined => {
  const searchTerm = name.toLowerCase();
  return MEDICATIONS.find(
    (med) =>
      med.brandName.toLowerCase() === searchTerm ||
      med.genericName.toLowerCase() === searchTerm
  );
};

export const getDrugSuggestions = (input: string): DrugInfo[] => {
  if (!input || input.length < 2) return [];
  const searchTerm = input.toLowerCase();
  return MEDICATIONS.filter(
    (med) =>
      med.brandName.toLowerCase().includes(searchTerm) ||
      med.genericName.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

export const getConditionSuggestions = (input: string): typeof MEDICAL_CONDITIONS => {
  if (!input || input.length < 2) return [];
  const searchTerm = input.toLowerCase();
  return MEDICAL_CONDITIONS.filter((cond) =>
    cond.name.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

export const getAllergenSuggestions = (input: string): typeof ALLERGENS => {
  if (!input || input.length < 2) return [];
  const searchTerm = input.toLowerCase();
  return ALLERGENS.filter((allergen) =>
    allergen.name.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

export const getSurgerySuggestions = (input: string): typeof SURGERIES => {
  if (!input || input.length < 2) return [];
  const searchTerm = input.toLowerCase();
  return SURGERIES.filter((surgery) =>
    surgery.name.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

export const getOccupationSuggestions = (input: string): typeof OCCUPATION_OPTIONS => {
  if (!input || input.length < 1) return [];
  const searchTerm = input.toLowerCase();
  return OCCUPATION_OPTIONS.filter((occ) =>
    occ.value.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};
