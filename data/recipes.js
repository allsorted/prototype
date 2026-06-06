// AllSorted — recipe pool. Loaded before app.js (classic scripts share global scope).
// Migrated verbatim from prototype.html. Globals: PHOTO, PLAN_A, PLAN_B, SWAP_POOL, ALL_RECIPES.

const PHOTO = id => "https://images.unsplash.com/photo-".concat(id, "?w=600&h=400&fit=crop&crop=entropy&q=85&auto=format");

// ─── Plan A — 7 meals (IDs 0–6) ────────────────────────────────────────────
const PLAN_A = [{
  id: 0,
  name: 'Garlic Butter Chicken',
  emoji: '🍗',
  photo: PHOTO('1694579740719-0e601c5d2437'),
  cuisine: 'Irish',
  time: '25 min',
  serves: 4,
  protein: 42,
  carbs: 8,
  fat: 18,
  fibre: 2,
  allergens: ['milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [{
    n: 'Chicken breast',
    q: '600g',
    price: 5.49,
    cat: 'Meat & Fish'
  }, {
    n: 'Unsalted butter',
    q: '30g',
    price: 0.79,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Garlic cloves',
    q: '3, minced',
    price: 0.35,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Fresh thyme',
    q: '3 sprigs',
    price: 0.79,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Lemon',
    q: '1',
    price: 0.49,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Pat chicken dry and season generously with salt and pepper.', 'Heat olive oil in a large pan over medium-high heat until shimmering.', 'Add chicken and cook 5–6 minutes per side until deep golden brown.', 'Reduce heat. Add butter, garlic and thyme. Baste continuously for 2 minutes.', 'Squeeze lemon juice over, rest 3 minutes before slicing.']
}, {
  id: 1,
  name: 'Smoked Salmon Pasta',
  emoji: '🍝',
  photo: PHOTO('1693820206774-d4a769355142'),
  cuisine: 'Italian',
  time: '20 min',
  serves: 2,
  protein: 31,
  carbs: 58,
  fat: 12,
  fibre: 4,
  allergens: ['fish', 'gluten'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [{
    n: 'Smoked salmon',
    q: '200g',
    price: 4.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Penne pasta',
    q: '300g',
    price: 1.39,
    cat: 'Pantry & Dry'
  }, {
    n: 'Double cream',
    q: '150ml',
    price: 1.79,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Garlic cloves',
    q: '2, minced',
    price: 0.25,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Capers',
    q: '1 tbsp',
    price: 1.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Fresh dill',
    q: 'small bunch',
    price: 0.89,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Cook penne in salted boiling water until al dente. Reserve a cup of pasta water.', 'Gently heat cream and garlic in a wide pan over medium heat for 2 minutes.', 'Add smoked salmon, torn into pieces. Stir for 1 minute.', 'Drain pasta and add to pan with a splash of pasta water. Toss well.', 'Serve topped with capers and fresh dill.']
}, {
  id: 2,
  name: 'Beef & Guinness Stew',
  emoji: '🥘',
  photo: PHOTO('1664741662725-bd131742b7b7'),
  cuisine: 'Irish',
  time: '45 min',
  serves: 4,
  protein: 38,
  carbs: 22,
  fat: 14,
  fibre: 6,
  allergens: ['gluten', 'celery'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [{
    n: 'Beef stewing pieces',
    q: '500g',
    price: 6.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Onions',
    q: '2, diced',
    price: 0.79,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Carrots',
    q: '3, sliced',
    price: 0.99,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Baby potatoes',
    q: '400g',
    price: 1.49,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Guinness',
    q: '330ml can',
    price: 1.99,
    cat: 'Pantry & Dry'
  }, {
    n: 'Beef stock',
    q: '500ml',
    price: 1.19,
    cat: 'Pantry & Dry'
  }],
  steps: ['Brown beef in batches in a heavy pot over high heat. Set aside.', 'Soften onions and carrots in same pot for 5 minutes.', 'Return beef, pour in Guinness and stock. Season well.', 'Bring to boil, then simmer covered for 45 minutes.', 'Add potatoes halfway through. Cook until tender and sauce thickened.']
}, {
  id: 3,
  name: 'Lemon Herb Cod',
  emoji: '🐟',
  photo: PHOTO('1728963228980-71c76178616a'),
  cuisine: 'Irish',
  time: '18 min',
  serves: 2,
  protein: 29,
  carbs: 6,
  fat: 9,
  fibre: 1,
  allergens: ['fish'],
  incompatible: ['veg', 'vegan'],
  ingredients: [{
    n: 'Cod fillet',
    q: '2 × 180g',
    price: 5.79,
    cat: 'Meat & Fish'
  }, {
    n: 'Lemon',
    q: '1',
    price: 0.49,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Fresh parsley',
    q: 'small bunch',
    price: 0.75,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Garlic cloves',
    q: '2, minced',
    price: 0.25,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Capers',
    q: '1 tbsp',
    price: 1.29,
    cat: 'Pantry & Dry'
  }],
  steps: ['Pat cod dry and season with salt and pepper on both sides.', 'Heat olive oil in a non-stick pan over medium-high heat.', 'Cook cod 3–4 minutes per side until golden and just cooked through.', 'Add garlic and capers for the last 30 seconds.', 'Squeeze lemon juice over and scatter with fresh parsley.']
}, {
  id: 4,
  name: 'Chickpea Curry',
  emoji: '🍛',
  photo: PHOTO('1582576163090-09d3b6f8a969'),
  cuisine: 'Asian',
  time: '30 min',
  serves: 4,
  protein: 18,
  carbs: 44,
  fat: 11,
  fibre: 12,
  allergens: ['mustard', 'celery'],
  incompatible: ['lowcarb'],
  ingredients: [{
    n: 'Chickpeas',
    q: '2 × 400g tins',
    price: 1.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Onion',
    q: '1, diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Chopped tomatoes',
    q: '400g tin',
    price: 0.89,
    cat: 'Pantry & Dry'
  }, {
    n: 'Curry paste',
    q: '2 tbsp',
    price: 2.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Coconut cream',
    q: '160ml',
    price: 1.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Spinach',
    q: '100g',
    price: 1.49,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Soften onion in a splash of oil over medium heat for 5 minutes.', 'Stir in curry paste and cook for 1 minute until fragrant.', 'Add chickpeas, tomatoes and coconut cream. Stir well.', 'Simmer uncovered for 20 minutes until sauce thickens.', 'Wilt in spinach at the end. Serve with naan or rice.']
}, {
  id: 5,
  name: "Lamb Shepherd's Pie",
  emoji: '🧇',
  photo: PHOTO('1696935257293-9ec4f03074a1'),
  cuisine: 'Irish',
  time: '55 min',
  serves: 6,
  protein: 34,
  carbs: 38,
  fat: 16,
  fibre: 5,
  allergens: ['gluten', 'milk', 'eggs', 'celery', 'mustard'],
  incompatible: ['veg', 'vegan', 'gf', 'lowcarb'],
  ingredients: [{
    n: 'Lamb mince',
    q: '500g',
    price: 7.49,
    cat: 'Meat & Fish'
  }, {
    n: 'Onion',
    q: '1, diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Carrots',
    q: '2, diced',
    price: 0.69,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Frozen peas',
    q: '150g',
    price: 0.89,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Potatoes',
    q: '900g',
    price: 1.69,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Unsalted butter',
    q: '50g',
    price: 1.19,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Milk',
    q: '100ml',
    price: 0.69,
    cat: 'Dairy & Eggs'
  }],
  steps: ['Brown lamb mince with onion and carrots until cooked through.', 'Stir in peas and season with salt, pepper and Worcestershire sauce.', 'Transfer to a baking dish and spread mashed potato on top.', 'Rough up the surface with a fork and dot with butter.', 'Bake at 200°C for 25 minutes until golden and bubbling.']
}, {
  id: 6,
  name: 'Roast Chicken Sunday',
  emoji: '🍖',
  photo: PHOTO('1606728035253-49e8a23146de'),
  cuisine: 'Irish',
  time: '90 min',
  serves: 6,
  protein: 45,
  carbs: 32,
  fat: 22,
  fibre: 3,
  allergens: ['gluten', 'milk'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [{
    n: 'Whole chicken',
    q: '1.6 kg',
    price: 9.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Roasting potatoes',
    q: '1 kg',
    price: 1.99,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Carrots',
    q: '4',
    price: 0.99,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Onion',
    q: '2',
    price: 0.59,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Unsalted butter',
    q: '50g',
    price: 1.19,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Fresh thyme',
    q: '4 sprigs',
    price: 0.79,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Chicken stock',
    q: '500ml',
    price: 1.19,
    cat: 'Pantry & Dry'
  }],
  steps: ['Preheat oven to 200°C. Rub chicken with butter, season generously.', 'Stuff cavity with half the thyme and onion quarters.', 'Roast for 20 min per 500g + 20 min extra, until juices run clear.', 'Add potatoes and carrots around chicken halfway through.', 'Rest 15 minutes before carving. Make gravy from pan juices.']
}];

// ─── Plan B — 7 meals (IDs 7–13) ────────────────────────────────────────────
const PLAN_B = [{
  id: 7,
  name: 'Honey Garlic Salmon',
  emoji: '🐟',
  photo: PHOTO('1710508774177-7ac2f3492675'),
  cuisine: 'Asian',
  time: '22 min',
  serves: 2,
  protein: 38,
  carbs: 16,
  fat: 14,
  fibre: 1,
  allergens: ['fish', 'soy'],
  incompatible: ['veg', 'vegan'],
  ingredients: [{
    n: 'Salmon fillet',
    q: '2 × 180g',
    price: 7.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Honey',
    q: '3 tbsp',
    price: 0.99,
    cat: 'Pantry & Dry'
  }, {
    n: 'Soy sauce',
    q: '2 tbsp',
    price: 1.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Garlic cloves',
    q: '3, minced',
    price: 0.35,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Spring onions',
    q: '4, sliced',
    price: 0.79,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Mix honey, soy sauce and garlic in a small bowl.', 'Season salmon with salt and pepper.', 'Heat oil in a pan over medium-high. Add salmon skin-side down for 4 minutes.', 'Flip salmon, pour sauce over and cook 3 more minutes, basting constantly.', 'Serve with spring onions scattered over.']
}, {
  id: 8,
  name: 'Spaghetti Bolognese',
  emoji: '🍝',
  photo: PHOTO('1622973536968-3ead9e780960'),
  cuisine: 'Italian',
  time: '35 min',
  serves: 4,
  protein: 36,
  carbs: 62,
  fat: 18,
  fibre: 4,
  allergens: ['gluten'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [{
    n: 'Beef mince',
    q: '500g',
    price: 5.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Spaghetti',
    q: '400g',
    price: 1.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Chopped tomatoes',
    q: '2 × 400g',
    price: 1.69,
    cat: 'Pantry & Dry'
  }, {
    n: 'Onion',
    q: '1, diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Garlic cloves',
    q: '3, minced',
    price: 0.35,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Red wine',
    q: '100ml',
    price: 2.49,
    cat: 'Pantry & Dry'
  }],
  steps: ['Brown mince in a large pan, breaking up lumps. Season well.', 'Add onion and garlic, cook 3 minutes until softened.', 'Pour in wine and let bubble for 1 minute.', 'Add tomatoes, simmer uncovered 20 minutes until thick.', 'Cook spaghetti, drain and serve topped with bolognese and parmesan.']
}, {
  id: 9,
  name: 'Chicken & Mushroom Pie',
  emoji: '🧇',
  photo: PHOTO('1650917331384-1fd06afa3230'),
  cuisine: 'Irish',
  time: '50 min',
  serves: 4,
  protein: 34,
  carbs: 28,
  fat: 22,
  fibre: 3,
  allergens: ['gluten', 'milk', 'eggs'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [{
    n: 'Chicken thighs',
    q: '600g, diced',
    price: 5.49,
    cat: 'Meat & Fish'
  }, {
    n: 'Mixed mushrooms',
    q: '300g',
    price: 2.49,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Double cream',
    q: '200ml',
    price: 1.99,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Puff pastry',
    q: '320g sheet',
    price: 2.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Onion',
    q: '1, diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Fresh thyme',
    q: '3 sprigs',
    price: 0.79,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Preheat oven to 200°C. Brown chicken in batches, set aside.', 'Sauté onion and mushrooms until golden and any liquid evaporates.', 'Return chicken, add cream and thyme. Simmer 10 minutes.', 'Pour into a pie dish, top with pastry and crimp edges.', 'Egg wash and bake 25 minutes until deep golden.']
}, {
  id: 10,
  name: 'Baked Cod with Chips',
  emoji: '🐟',
  photo: PHOTO('1611599538235-128e54f1250f'),
  cuisine: 'Irish',
  time: '35 min',
  serves: 2,
  protein: 32,
  carbs: 42,
  fat: 10,
  fibre: 4,
  allergens: ['fish'],
  incompatible: ['veg', 'vegan'],
  ingredients: [{
    n: 'Cod fillet',
    q: '2 × 180g',
    price: 5.79,
    cat: 'Meat & Fish'
  }, {
    n: 'Potatoes',
    q: '600g',
    price: 1.19,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Lemon',
    q: '1',
    price: 0.49,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Paprika',
    q: '1 tsp',
    price: 0.89,
    cat: 'Pantry & Dry'
  }, {
    n: 'Garlic powder',
    q: '½ tsp',
    price: 0.79,
    cat: 'Pantry & Dry'
  }],
  steps: ['Preheat oven to 220°C. Toss chips in oil, paprika and garlic powder.', 'Spread chips on a tray and roast 15 minutes.', 'Season cod fillets and place alongside the chips.', 'Roast everything together for a further 15 minutes.', 'Squeeze lemon over the cod and serve immediately.']
}, {
  id: 11,
  name: 'Thai Green Curry',
  emoji: '🍛',
  photo: PHOTO('1605461682195-9fd4d079a41d'),
  cuisine: 'Asian',
  time: '30 min',
  serves: 4,
  protein: 32,
  carbs: 18,
  fat: 16,
  fibre: 3,
  allergens: ['fish'],
  incompatible: ['veg', 'vegan'],
  ingredients: [{
    n: 'Chicken breast',
    q: '600g, sliced',
    price: 5.49,
    cat: 'Meat & Fish'
  }, {
    n: 'Green curry paste',
    q: '3 tbsp',
    price: 2.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Coconut milk',
    q: '400ml tin',
    price: 1.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Green beans',
    q: '200g',
    price: 1.29,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Lime',
    q: '1',
    price: 0.45,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Fish sauce',
    q: '1 tbsp',
    price: 1.69,
    cat: 'Pantry & Dry'
  }],
  steps: ['Fry curry paste in a wok over medium heat for 1 minute until fragrant.', 'Add chicken and cook 5 minutes, stirring, until sealed.', 'Pour in coconut milk and fish sauce. Bring to a simmer.', 'Add green beans and cook 8 minutes until chicken is cooked through.', 'Squeeze lime juice over and serve with jasmine rice.']
}, {
  id: 12,
  name: 'Beef Lasagne',
  emoji: '🍝',
  photo: PHOTO('1709429790175-b02bb1b19207'),
  cuisine: 'Italian',
  time: '60 min',
  serves: 6,
  protein: 34,
  carbs: 42,
  fat: 22,
  fibre: 4,
  allergens: ['gluten', 'milk', 'eggs'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [{
    n: 'Beef mince',
    q: '500g',
    price: 5.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Lasagne sheets',
    q: '250g',
    price: 1.89,
    cat: 'Pantry & Dry'
  }, {
    n: 'Chopped tomatoes',
    q: '2 × 400g',
    price: 1.69,
    cat: 'Pantry & Dry'
  }, {
    n: 'Béchamel sauce',
    q: '500ml jar',
    price: 2.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Mozzarella',
    q: '125g',
    price: 2.49,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Onion',
    q: '1, diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Preheat oven to 190°C. Brown mince with onion.', 'Add tomatoes, simmer 15 minutes. Season well.', 'Layer: meat sauce → lasagne sheets → béchamel. Repeat.', 'Top with final layer of béchamel and mozzarella.', 'Bake 35 minutes until bubbling and golden. Rest 5 minutes.']
}, {
  id: 13,
  name: 'Pork Belly Roast',
  emoji: '🥩',
  photo: PHOTO('1635897411141-7bd2b9c6ab16'),
  cuisine: 'Irish',
  time: '90 min',
  serves: 4,
  protein: 40,
  carbs: 28,
  fat: 28,
  fibre: 3,
  allergens: [],
  incompatible: ['veg', 'vegan'],
  ingredients: [{
    n: 'Pork belly',
    q: '1 kg',
    price: 8.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Roasting potatoes',
    q: '800g',
    price: 1.69,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Apple',
    q: '2',
    price: 0.99,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Onion',
    q: '2',
    price: 0.59,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Garlic cloves',
    q: '4',
    price: 0.45,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Mixed dried herbs',
    q: '1 tsp',
    price: 0.79,
    cat: 'Pantry & Dry'
  }],
  steps: ['Preheat oven to 220°C. Score pork skin deeply, rub with salt and herbs.', 'Start skin-side up on a rack. Roast 30 minutes for crackling.', 'Reduce to 180°C. Add apple, onion and potatoes around pork.', 'Roast a further 60 minutes until pork is cooked through.', 'Rest 10 minutes before slicing. Serve with pan juices.']
}];

// ─── Swap Pool — 6 alt meals (IDs 14–19) ─────────────────────────────────────────────
const SWAP_POOL = [{
  id: 14,
  name: 'Thai Basil Stir Fry',
  emoji: '🍜',
  photo: PHOTO('1696906594893-e9995c4d7082'),
  cuisine: 'Asian',
  time: '20 min',
  serves: 2,
  protein: 28,
  carbs: 18,
  fat: 12,
  fibre: 3,
  allergens: ['soy'],
  incompatible: ['vegan'],
  ingredients: [{
    n: 'Chicken breast',
    q: '400g, sliced',
    price: 4.49,
    cat: 'Meat & Fish'
  }, {
    n: 'Thai basil',
    q: 'large bunch',
    price: 0.99,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Soy sauce',
    q: '2 tbsp',
    price: 1.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Oyster sauce',
    q: '1 tbsp',
    price: 1.69,
    cat: 'Pantry & Dry'
  }, {
    n: 'Garlic cloves',
    q: '3, minced',
    price: 0.35,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Red chilli',
    q: '1, sliced',
    price: 0.49,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Heat a wok over high heat until smoking.', 'Add oil, garlic and chilli. Stir fry 30 seconds.', 'Add chicken, cook 4–5 minutes until cooked through.', 'Add soy and oyster sauce, toss well for 1 minute.', 'Remove from heat, toss in thai basil leaves and serve over rice.']
}, {
  id: 15,
  name: 'Honey Garlic Prawns',
  emoji: '🦐',
  photo: PHOTO('1625943553852-781c6dd46faa'),
  cuisine: 'Asian',
  time: '20 min',
  serves: 2,
  protein: 28,
  carbs: 12,
  fat: 8,
  fibre: 2,
  allergens: ['crustaceans', 'soy'],
  incompatible: ['veg', 'vegan'],
  ingredients: [{
    n: 'King prawns',
    q: '300g, raw',
    price: 5.99,
    cat: 'Meat & Fish'
  }, {
    n: 'Honey',
    q: '2 tbsp',
    price: 0.79,
    cat: 'Pantry & Dry'
  }, {
    n: 'Soy sauce',
    q: '2 tbsp',
    price: 1.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Garlic cloves',
    q: '3, minced',
    price: 0.35,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Spring onions',
    q: '4, sliced',
    price: 0.79,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Mix honey, soy sauce and garlic in a bowl.', 'Pat prawns dry and season with salt and pepper.', 'Heat oil in a large pan over high heat.', 'Cook prawns 1–2 minutes per side until pink and curled.', 'Add sauce, cook 1 minute until glazed. Serve with spring onions.']
}, {
  id: 16,
  name: 'Mushroom Risotto',
  emoji: '🍚',
  photo: PHOTO('1609770424775-39ec362f2d94'),
  cuisine: 'Italian',
  time: '35 min',
  serves: 4,
  protein: 14,
  carbs: 58,
  fat: 16,
  fibre: 4,
  allergens: ['milk'],
  incompatible: ['vegan', 'gf'],
  ingredients: [{
    n: 'Arborio rice',
    q: '320g',
    price: 2.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Mixed mushrooms',
    q: '400g',
    price: 2.99,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Onion',
    q: '1, finely diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'White wine',
    q: '150ml',
    price: 2.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Parmesan',
    q: '60g, grated',
    price: 1.99,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Vegetable stock',
    q: '1 litre',
    price: 1.49,
    cat: 'Pantry & Dry'
  }],
  steps: ['Sauté onion in butter until soft. Add mushrooms, cook until golden.', 'Add rice, stir for 2 minutes until grains look translucent.', 'Add wine, stir until absorbed.', 'Add stock one ladle at a time, stirring constantly for 18–20 minutes.', 'Remove from heat, stir in parmesan and a knob of butter. Rest 2 minutes.']
}, {
  id: 17,
  name: 'Chicken Caesar Salad',
  emoji: '🥗',
  photo: PHOTO('1550304943-4f24f54ddde9'),
  cuisine: 'Mediterranean',
  time: '20 min',
  serves: 2,
  protein: 36,
  carbs: 14,
  fat: 18,
  fibre: 4,
  allergens: ['eggs', 'fish', 'gluten', 'milk'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [{
    n: 'Chicken breast',
    q: '400g',
    price: 4.49,
    cat: 'Meat & Fish'
  }, {
    n: 'Romaine lettuce',
    q: '1 head',
    price: 1.29,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Parmesan',
    q: '40g, shaved',
    price: 1.49,
    cat: 'Dairy & Eggs'
  }, {
    n: 'Caesar dressing',
    q: '4 tbsp',
    price: 2.29,
    cat: 'Pantry & Dry'
  }, {
    n: 'Croutons',
    q: '50g',
    price: 1.49,
    cat: 'Pantry & Dry'
  }],
  steps: ['Season chicken and pan-fry over medium-high heat 5–6 minutes per side.', 'Rest chicken 3 minutes then slice.', 'Tear lettuce into a large bowl.', 'Toss with Caesar dressing until well coated.', 'Top with chicken slices, parmesan shavings and croutons.']
}, {
  id: 18,
  name: 'Vegetable Tagine',
  emoji: '🥕',
  photo: PHOTO('1682370207954-c8a9cccaabb4'),
  cuisine: 'Middle Eastern',
  time: '40 min',
  serves: 4,
  protein: 12,
  carbs: 42,
  fat: 9,
  fibre: 8,
  allergens: ['celery'],
  incompatible: ['lowcarb'],
  ingredients: [{
    n: 'Butternut squash',
    q: '1 small, cubed',
    price: 1.49,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Chickpeas',
    q: '400g tin',
    price: 0.89,
    cat: 'Pantry & Dry'
  }, {
    n: 'Onion',
    q: '1, diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Ras el hanout',
    q: '1½ tsp',
    price: 1.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Chopped tomatoes',
    q: '400g tin',
    price: 0.89,
    cat: 'Pantry & Dry'
  }, {
    n: 'Couscous',
    q: '200g',
    price: 1.29,
    cat: 'Pantry & Dry'
  }],
  steps: ['Sauté onion in olive oil until soft. Add spices, cook 1 minute.', 'Add squash, tomatoes and chickpeas. Season well.', 'Add 200ml water, cover and simmer 25 minutes until squash is tender.', 'Place couscous in a bowl, pour boiling water over to cover, leave 5 minutes.', 'Fluff couscous with a fork and serve tagine on top.']
}, {
  id: 19,
  name: 'Lentil Dahl',
  emoji: '🥣',
  photo: PHOTO('1626500155537-93690c24099e'),
  cuisine: 'Asian',
  time: '35 min',
  serves: 4,
  protein: 16,
  carbs: 44,
  fat: 8,
  fibre: 10,
  allergens: [],
  incompatible: ['lowcarb'],
  ingredients: [{
    n: 'Red lentils',
    q: '300g',
    price: 1.99,
    cat: 'Pantry & Dry'
  }, {
    n: 'Onion',
    q: '1, diced',
    price: 0.39,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Garlic cloves',
    q: '3, minced',
    price: 0.35,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Fresh ginger',
    q: '1 tbsp, grated',
    price: 0.49,
    cat: 'Vegetables & Fruit'
  }, {
    n: 'Curry powder',
    q: '1½ tsp',
    price: 0.89,
    cat: 'Pantry & Dry'
  }, {
    n: 'Coconut milk',
    q: '400ml tin',
    price: 1.49,
    cat: 'Pantry & Dry'
  }, {
    n: 'Spinach',
    q: '100g',
    price: 1.49,
    cat: 'Vegetables & Fruit'
  }],
  steps: ['Sauté onion in oil until golden. Add garlic, ginger and curry powder.', 'Cook 1 minute, stirring until fragrant.', 'Add rinsed lentils, coconut milk and 400ml water.', 'Simmer 20–25 minutes, stirring occasionally, until lentils are soft.', 'Wilt in spinach, season with salt and serve with naan or basmati rice.']
},{
  id: 20,
  name: 'Seared Sirloin Steak',
  emoji: '🥩',
  photo: PHOTO('1619719015339-133a130520f6'),
  cuisine: 'Irish',
  time: '20 min',
  serves: 2,
  protein: 44,
  carbs: 2,
  fat: 26,
  fibre: 0,
  allergens: ['milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Sirloin steak', q: '220g per person', price: 8.99, cat: 'Meat & Fish' },
    { n: 'Butter', q: '40g', price: 0.80, cat: 'Dairy & Eggs' },
    { n: 'Garlic', q: '2 cloves, crushed', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Fresh thyme & rosemary', q: '4 sprigs', price: 0.99, cat: 'Herbs & Spices' },
    { n: 'Olive oil', q: '1 tbsp', price: 0.30, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Remove steak from fridge 30 minutes before cooking. Season generously with salt and black pepper.',
    'Heat a cast iron pan until smoking hot. Add a thin layer of oil.',
    'Sear steak 2-3 minutes each side for medium-rare. Press down to ensure full contact.',
    'Reduce heat. Add butter, garlic and herbs. Tilt pan and baste the steak continuously for 90 seconds.',
    'Rest on a warm plate for 3 minutes before slicing. Spoon herb butter over to serve.'
  ]
},{
  id: 21,
  name: 'Baked Salmon with Cream & Dill',
  emoji: '🐟',
  photo: PHOTO('1539136788836-5699e78bfc75'),
  cuisine: 'Irish',
  time: '25 min',
  serves: 2,
  protein: 36,
  carbs: 4,
  fat: 22,
  fibre: 1,
  allergens: ['fish', 'milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Salmon fillets', q: '2 x 180g', price: 7.49, cat: 'Meat & Fish' },
    { n: 'Cream', q: '150ml', price: 1.49, cat: 'Dairy & Eggs' },
    { n: 'Fresh dill', q: 'small bunch', price: 0.99, cat: 'Herbs & Spices' },
    { n: 'Lemon', q: '1, sliced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic', q: '2 cloves', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Capers', q: '1 tbsp', price: 0.99, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Preheat oven to 190 degrees C. Place salmon in a baking dish, season with salt and pepper.',
    'Whisk cream with crushed garlic, half the dill, and a pinch of salt.',
    'Pour cream sauce over salmon. Lay lemon slices on top.',
    'Bake 18-20 minutes until salmon is cooked through and cream is bubbling.',
    'Scatter remaining fresh dill and capers over to serve.'
  ]
},{
  id: 22,
  name: 'Butter Chicken',
  emoji: '🍗',
  photo: PHOTO('1603894584373-5ac82b2ae398'),
  cuisine: 'Indian',
  time: '45 min',
  serves: 4,
  protein: 36,
  carbs: 14,
  fat: 24,
  fibre: 3,
  allergens: ['milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Chicken thighs', q: '600g, cubed', price: 5.49, cat: 'Meat & Fish' },
    { n: 'Butter', q: '40g', price: 0.80, cat: 'Dairy & Eggs' },
    { n: 'Double cream', q: '150ml', price: 1.49, cat: 'Dairy & Eggs' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Onion', q: '1 large, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic & ginger paste', q: '2 tbsp', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Garam masala', q: '2 tsp', price: 0.60, cat: 'Herbs & Spices' },
    { n: 'Ground cumin & coriander', q: '1 tsp each', price: 0.60, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Melt butter in a large pan over medium heat. Fry onion until golden, about 8 minutes.',
    'Add garlic-ginger paste and spices. Cook 2 minutes until fragrant.',
    'Add chicken and cook 6-8 minutes, stirring, until sealed and golden.',
    'Pour in tomatoes, stir well, and simmer uncovered 15 minutes until sauce thickens.',
    'Stir in cream and simmer 5 more minutes. Serve with basmati rice and naan.'
  ]
},{
  id: 23,
  name: 'Mushroom Stroganoff',
  emoji: '🍄',
  photo: PHOTO('1600345968497-bb0c69de64f8'),
  cuisine: 'European',
  time: '35 min',
  serves: 4,
  protein: 14,
  carbs: 42,
  fat: 16,
  fibre: 5,
  allergens: ['milk', 'gluten'],
  incompatible: ['vegan', 'gf', 'lowcarb'],
  ingredients: [
    { n: 'Mixed mushrooms', q: '500g, sliced', price: 3.49, cat: 'Vegetables & Fruit' },
    { n: 'Onion', q: '1 large, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic', q: '3 cloves', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Sour cream', q: '200g', price: 1.29, cat: 'Dairy & Eggs' },
    { n: 'Tagliatelle pasta', q: '320g', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Smoked paprika', q: '2 tsp', price: 0.60, cat: 'Herbs & Spices' },
    { n: 'Vegetable stock', q: '200ml', price: 0.60, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Cook pasta in salted boiling water per packet. Drain, reserving a ladle of water.',
    'Saute onion in oil over medium heat 5 minutes until soft. Add garlic and cook 1 minute.',
    'Turn heat to high. Add mushrooms and cook 8-10 minutes until golden and any liquid evaporates.',
    'Add paprika, cook 30 seconds. Pour in stock and simmer 3 minutes until reduced.',
    'Remove from heat. Stir in sour cream and pasta. Add pasta water if needed to loosen.'
  ]
},{
  id: 24,
  name: 'Black Bean Chilli',
  emoji: '🫘',
  photo: PHOTO('1662743086910-38419bbf7f34'),
  cuisine: 'Mexican',
  time: '40 min',
  serves: 4,
  protein: 15,
  carbs: 48,
  fat: 6,
  fibre: 16,
  allergens: [],
  incompatible: ['lowcarb'],
  ingredients: [
    { n: 'Black beans', q: '2 x 400g tins, drained', price: 1.58, cat: 'Pantry & Dry' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Onion', q: '1 large, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Red pepper', q: '2, diced', price: 1.20, cat: 'Vegetables & Fruit' },
    { n: 'Garlic', q: '3 cloves', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Ground cumin & chilli powder', q: '1.5 tsp each', price: 0.70, cat: 'Herbs & Spices' },
    { n: 'Smoked paprika', q: '1 tsp', price: 0.50, cat: 'Herbs & Spices' },
    { n: 'Vegetable stock', q: '200ml', price: 0.60, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Soften onion and peppers in oil over medium heat for 8 minutes.',
    'Add garlic, cumin, chilli powder and paprika. Cook 1 minute until fragrant.',
    'Add beans, tomatoes and stock. Stir well and bring to a boil.',
    'Reduce heat and simmer uncovered 20 minutes until sauce thickens.',
    'Season with salt and lime juice. Serve with rice, sour cream and fresh coriander.'
  ]
},{
  id: 25,
  name: 'Tofu & Vegetable Stir-fry',
  emoji: '🥬',
  photo: PHOTO('1564834724105-918b73d1b9e0'),
  cuisine: 'Asian',
  time: '20 min',
  serves: 2,
  protein: 18,
  carbs: 22,
  fat: 10,
  fibre: 5,
  allergens: ['soya', 'gluten'],
  incompatible: ['lowcarb', 'gf'],
  ingredients: [
    { n: 'Firm tofu', q: '400g, cubed', price: 2.49, cat: 'Pantry & Dry' },
    { n: 'Broccoli', q: '1 head, cut into florets', price: 1.29, cat: 'Vegetables & Fruit' },
    { n: 'Red pepper', q: '1, sliced', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Soy sauce', q: '3 tbsp', price: 0.60, cat: 'Pantry & Dry' },
    { n: 'Garlic', q: '3 cloves', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Fresh ginger', q: '2cm piece', price: 0.40, cat: 'Herbs & Spices' },
    { n: 'Sesame oil', q: '1 tbsp', price: 0.80, cat: 'Pantry & Dry' },
    { n: 'Spring onions', q: '4', price: 0.60, cat: 'Vegetables & Fruit' }
  ],
  steps: [
    'Press tofu between paper towels for 10 minutes then cut into 2cm cubes.',
    'Heat oil in a wok over very high heat. Fry tofu 5 minutes until golden. Set aside.',
    'In same wok, stir-fry broccoli and pepper 3-4 minutes until just tender.',
    'Add garlic and ginger. Cook 30 seconds. Return tofu to the wok.',
    'Add soy sauce and sesame oil, toss 1 minute. Serve over rice with spring onions.'
  ]
},{
  id: 26,
  name: 'Chicken Tikka Masala',
  emoji: '🍲',
  photo: PHOTO('1565557623262-b51c2513a641'),
  cuisine: 'Indian',
  time: '50 min',
  serves: 4,
  protein: 38,
  carbs: 16,
  fat: 20,
  fibre: 3,
  allergens: ['milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Chicken breast', q: '600g, cubed', price: 5.99, cat: 'Meat & Fish' },
    { n: 'Greek yogurt', q: '150g', price: 1.19, cat: 'Dairy & Eggs' },
    { n: 'Double cream', q: '100ml', price: 0.99, cat: 'Dairy & Eggs' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Onion', q: '1 large, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic & ginger paste', q: '2 tbsp', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Tikka masala paste', q: '3 tbsp', price: 1.49, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Marinate chicken in yogurt and 1 tbsp tikka paste for at least 15 minutes.',
    'Grill or pan-fry marinated chicken on high heat 8-10 minutes until charred at edges. Set aside.',
    'Fry onion in oil 8 minutes until golden. Add garlic-ginger paste and remaining tikka paste, cook 2 minutes.',
    'Pour in tomatoes and simmer 15 minutes until sauce reduces and deepens.',
    'Add cream and charred chicken. Simmer 5 minutes. Serve with rice and naan.'
  ]
},{
  id: 27,
  name: 'Beef Chilli Con Carne',
  emoji: '🌮',
  photo: PHOTO('1679279726937-122c49626802'),
  cuisine: 'Mexican',
  time: '45 min',
  serves: 4,
  protein: 32,
  carbs: 28,
  fat: 14,
  fibre: 8,
  allergens: [],
  incompatible: ['veg', 'vegan', 'lowcarb'],
  ingredients: [
    { n: 'Beef mince', q: '500g', price: 5.49, cat: 'Meat & Fish' },
    { n: 'Kidney beans', q: '400g tin, drained', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Onion', q: '1 large, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Red pepper', q: '1, diced', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Garlic', q: '3 cloves', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Chilli powder, cumin & paprika', q: '1 tsp each', price: 0.70, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Brown mince in a large pan over high heat, breaking up lumps. Drain excess fat.',
    'Add onion and pepper, cook 5 minutes. Add garlic and spices, stir 1 minute.',
    'Pour in tomatoes. Fill the empty tin with water and add that too.',
    'Add kidney beans, bring to a boil then simmer uncovered 25 minutes until thick.',
    'Season with salt. Serve with rice, sour cream and a squeeze of lime.'
  ]
},{
  id: 28,
  name: 'Moroccan Lamb Tagine',
  emoji: '🍲',
  photo: PHOTO('1541518763669-27fef04b14ea'),
  cuisine: 'North African',
  time: '80 min',
  serves: 4,
  protein: 40,
  carbs: 22,
  fat: 20,
  fibre: 5,
  allergens: ['gluten'],
  incompatible: ['veg', 'vegan', 'gf', 'lowcarb'],
  ingredients: [
    { n: 'Lamb shoulder', q: '700g, cubed', price: 8.99, cat: 'Meat & Fish' },
    { n: 'Couscous', q: '250g', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Onion', q: '1 large, sliced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Carrot', q: '2, sliced', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Chickpeas', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Ras el hanout', q: '2 tsp', price: 1.29, cat: 'Herbs & Spices' },
    { n: 'Dried apricots', q: '50g, halved', price: 1.29, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Brown lamb in batches in a heavy pot over high heat. Set aside.',
    'Soften onion 5 minutes. Add ras el hanout, cinnamon and cumin, stir 1 minute.',
    'Return lamb with tomatoes, carrots, chickpeas and apricots. Add 300ml water.',
    'Bring to a boil, then simmer covered on low for 60 minutes until lamb is tender.',
    'Prepare couscous per packet. Serve tagine over couscous with fresh coriander.'
  ]
},{
  id: 29,
  name: 'Prawn Pad Thai',
  emoji: '🍜',
  photo: PHOTO('1655091273851-7bdc2e578a88'),
  cuisine: 'Asian',
  time: '25 min',
  serves: 2,
  protein: 26,
  carbs: 45,
  fat: 10,
  fibre: 3,
  allergens: ['crustaceans', 'gluten', 'peanuts', 'eggs'],
  incompatible: ['veg', 'vegan', 'lowcarb', 'gf'],
  ingredients: [
    { n: 'Raw king prawns', q: '200g', price: 4.99, cat: 'Meat & Fish' },
    { n: 'Flat rice noodles', q: '150g', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Eggs', q: '2, beaten', price: 0.80, cat: 'Dairy & Eggs' },
    { n: 'Beansprouts', q: '100g', price: 0.99, cat: 'Vegetables & Fruit' },
    { n: 'Fish sauce', q: '2 tbsp', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Tamarind paste', q: '2 tbsp', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Crushed peanuts & lime', q: '30g / 1', price: 0.90, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Soak noodles in boiling water 4 minutes until pliable but still firm. Drain.',
    'Heat wok on high. Stir-fry prawns 2 minutes until pink. Push to the side.',
    'Add beaten egg, scramble quickly then mix through the prawns.',
    'Add noodles, fish sauce and tamarind. Toss everything together 2 minutes.',
    'Add beansprouts, toss 30 seconds. Serve with peanuts, spring onion and lime.'
  ]
},{
  id: 30,
  name: 'Chicken Shawarma Bowl',
  emoji: '🍗',
  photo: PHOTO('1653983194833-7a10838b12f4'),
  cuisine: 'Middle Eastern',
  time: '40 min',
  serves: 2,
  protein: 38,
  carbs: 22,
  fat: 16,
  fibre: 4,
  allergens: ['sesame', 'milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Chicken thighs', q: '400g', price: 3.99, cat: 'Meat & Fish' },
    { n: 'Greek yogurt', q: '100g', price: 0.79, cat: 'Dairy & Eggs' },
    { n: 'Hummus', q: '100g', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Cumin, coriander & turmeric', q: '1 tsp each', price: 0.70, cat: 'Herbs & Spices' },
    { n: 'Garlic', q: '3 cloves', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Lemon', q: '1', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Cucumber & tomato', q: 'half each, diced', price: 0.80, cat: 'Vegetables & Fruit' }
  ],
  steps: [
    'Mix spices, garlic, lemon juice and 2 tbsp yogurt. Coat chicken and marinate 20 minutes.',
    'Grill chicken thighs on high heat 6 minutes each side until cooked through.',
    'Rest chicken 3 minutes then slice into strips.',
    'Spread hummus in bowls. Top with diced cucumber and tomato.',
    'Lay chicken strips over. Drizzle with remaining yogurt and a squeeze of lemon.'
  ]
},{
  id: 31,
  name: 'Vegetable Biryani',
  emoji: '🍛',
  photo: PHOTO('1630409346824-4f0e7b080087'),
  cuisine: 'Indian',
  time: '50 min',
  serves: 4,
  protein: 10,
  carbs: 58,
  fat: 8,
  fibre: 7,
  allergens: [],
  incompatible: ['lowcarb'],
  ingredients: [
    { n: 'Basmati rice', q: '300g', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Mixed vegetables', q: '400g (carrot, peas, cauliflower)', price: 2.49, cat: 'Vegetables & Fruit' },
    { n: 'Onion', q: '2, sliced', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Biryani spice mix', q: '2 tbsp', price: 1.49, cat: 'Herbs & Spices' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Vegetable stock', q: '500ml', price: 0.80, cat: 'Pantry & Dry' },
    { n: 'Fresh coriander & mint', q: 'handful each', price: 0.80, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Rinse rice until water runs clear. Soak in cold water 20 minutes, then drain.',
    'Fry onions in oil until deep golden and caramelised, about 15 minutes.',
    'Add vegetables and biryani spice mix, stir-fry 3 minutes.',
    'Add tomatoes and stock. Stir in rice and bring to a boil.',
    'Cover tightly and cook on lowest heat 20 minutes. Rest 5 minutes. Scatter coriander and mint over.'
  ]
},{
  id: 32,
  name: 'Pork Schnitzel with Roasted Veg',
  emoji: '🍖',
  photo: PHOTO('1523813301608-f54a198f6b5f'),
  cuisine: 'European',
  time: '30 min',
  serves: 2,
  protein: 38,
  carbs: 28,
  fat: 18,
  fibre: 5,
  allergens: ['gluten', 'eggs'],
  incompatible: ['veg', 'vegan', 'gf', 'lowcarb'],
  ingredients: [
    { n: 'Pork loin steaks', q: '2 x 180g', price: 5.99, cat: 'Meat & Fish' },
    { n: 'Breadcrumbs', q: '80g', price: 0.99, cat: 'Pantry & Dry' },
    { n: 'Eggs', q: '2, beaten', price: 0.80, cat: 'Dairy & Eggs' },
    { n: 'Plain flour', q: '50g', price: 0.30, cat: 'Pantry & Dry' },
    { n: 'Courgette & cherry tomatoes', q: '1 / 200g', price: 2.49, cat: 'Vegetables & Fruit' },
    { n: 'Lemon', q: '1', price: 0.40, cat: 'Vegetables & Fruit' }
  ],
  steps: [
    'Preheat oven to 200 degrees C. Toss courgette and tomatoes in oil and salt. Roast 20 minutes.',
    'Pound pork steaks to 5mm thickness between cling film.',
    'Coat each steak in order: flour, beaten egg, breadcrumbs. Press firmly.',
    'Pan-fry schnitzels in 1cm of hot oil, 3 minutes each side until deep golden.',
    'Drain on paper towels. Serve with roasted veg and a wedge of lemon.'
  ]
},{
  id: 33,
  name: 'Irish Lamb & Root Veg Stew',
  emoji: '🧆',
  photo: PHOTO('1689860892307-7db54ab276ba'),
  cuisine: 'Irish',
  time: '90 min',
  serves: 4,
  protein: 36,
  carbs: 24,
  fat: 16,
  fibre: 6,
  allergens: [],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Lamb shoulder', q: '700g, cubed', price: 7.99, cat: 'Meat & Fish' },
    { n: 'Potato', q: '400g, cubed', price: 1.29, cat: 'Vegetables & Fruit' },
    { n: 'Carrot', q: '3, sliced', price: 0.80, cat: 'Vegetables & Fruit' },
    { n: 'Parsnip', q: '2, cubed', price: 0.90, cat: 'Vegetables & Fruit' },
    { n: 'Onion', q: '1 large, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Lamb or beef stock', q: '750ml', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Fresh thyme & rosemary', q: '4 sprigs', price: 0.99, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Brown lamb in batches in a heavy pot over high heat until dark on all sides. Set aside.',
    'Soften onion in same pot 5 minutes. Return lamb with all vegetables and herbs.',
    'Pour in stock to just cover. Bring to a boil, then reduce to a gentle simmer.',
    'Cover and cook 70-80 minutes until lamb is completely tender.',
    'Season generously. Serve in deep bowls with crusty bread.'
  ]
},{
  id: 34,
  name: 'Sesame Salmon Teriyaki Bowl',
  emoji: '🍣',
  photo: PHOTO('1676300185165-3f543c1fcb72'),
  cuisine: 'Asian',
  time: '25 min',
  serves: 2,
  protein: 38,
  carbs: 34,
  fat: 14,
  fibre: 3,
  allergens: ['fish', 'gluten', 'sesame'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [
    { n: 'Salmon fillets', q: '2 x 180g', price: 7.49, cat: 'Meat & Fish' },
    { n: 'Soy sauce', q: '3 tbsp', price: 0.60, cat: 'Pantry & Dry' },
    { n: 'Honey', q: '2 tbsp', price: 0.80, cat: 'Pantry & Dry' },
    { n: 'Sesame oil', q: '1 tbsp', price: 0.80, cat: 'Pantry & Dry' },
    { n: 'Garlic & ginger', q: '2 cloves / 1cm', price: 0.60, cat: 'Herbs & Spices' },
    { n: 'Basmati rice', q: '180g', price: 0.90, cat: 'Pantry & Dry' },
    { n: 'Sesame seeds & spring onions', q: 'to garnish', price: 0.80, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Cook rice per packet instructions.',
    'Mix soy sauce, honey, sesame oil, garlic and ginger into a teriyaki sauce.',
    'Heat oil in a non-stick pan over medium-high. Cook salmon skin-side down 4 minutes.',
    'Flip salmon, pour sauce over and cook 3 more minutes, basting constantly.',
    'Serve salmon over rice. Drizzle pan sauce over and garnish with sesame seeds and spring onion.'
  ]
},{
  id: 35,
  name: 'Penne Arrabiata',
  emoji: '🍝',
  photo: PHOTO('1606671605581-51d2bc46140d'),
  cuisine: 'Italian',
  time: '25 min',
  serves: 4,
  protein: 12,
  carbs: 62,
  fat: 8,
  fibre: 5,
  allergens: ['gluten'],
  incompatible: ['gf', 'lowcarb'],
  ingredients: [
    { n: 'Penne pasta', q: '350g', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Chopped tomatoes', q: '2 x 400g tins', price: 1.58, cat: 'Pantry & Dry' },
    { n: 'Garlic', q: '4 cloves, sliced', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Dried chilli flakes', q: '1-2 tsp', price: 0.50, cat: 'Herbs & Spices' },
    { n: 'Olive oil', q: '3 tbsp', price: 0.60, cat: 'Pantry & Dry' },
    { n: 'Fresh basil', q: 'handful', price: 0.99, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Cook penne in a large pot of salted boiling water until al dente. Reserve a cup of pasta water.',
    'Heat olive oil in a wide pan over medium heat. Add garlic and chilli flakes, fry gently 2 minutes.',
    'Pour in tomatoes, breaking them up. Season well and simmer uncovered 15 minutes until thick.',
    'Drain pasta and add to the sauce. Toss well, adding a splash of pasta water if needed.',
    'Serve immediately with fresh basil torn over the top.'
  ]
},{
  id: 36,
  name: 'Spaghetti Carbonara',
  emoji: '🍝',
  photo: PHOTO('1621996346565-e3dbc646d9a9'),
  cuisine: 'Italian',
  time: '20 min',
  serves: 2,
  protein: 28,
  carbs: 62,
  fat: 22,
  fibre: 3,
  allergens: ['gluten', 'eggs', 'milk'],
  incompatible: ['veg', 'vegan', 'gf', 'lowcarb'],
  ingredients: [
    { n: 'Spaghetti', q: '200g', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Pancetta', q: '150g, diced', price: 2.99, cat: 'Meat & Fish' },
    { n: 'Eggs', q: '2 whole + 2 yolks', price: 1.20, cat: 'Dairy & Eggs' },
    { n: 'Pecorino Romano', q: '60g, finely grated', price: 1.99, cat: 'Dairy & Eggs' },
    { n: 'Black pepper', q: 'generous amount', price: 0.30, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Cook spaghetti in heavily salted boiling water until al dente. Reserve 2 cups of pasta water before draining.',
    'Fry pancetta in a cold pan over medium heat until the fat renders and it crisps up, about 5 minutes. Remove from heat.',
    'Whisk together eggs, yolks, and most of the cheese. Season very generously with black pepper.',
    'Add drained pasta to the pancetta pan. Add a big splash of pasta water and toss well.',
    'Pour in the egg mixture, tossing constantly and adding more pasta water until silky and creamy. Never let it scramble. Serve immediately with the remaining cheese.'
  ]
},{
  id: 37,
  name: 'Chicken Parmigiana',
  emoji: '🍗',
  photo: PHOTO('1632778149955-e80f8ceca2e8'),
  cuisine: 'Italian',
  time: '35 min',
  serves: 2,
  protein: 48,
  carbs: 28,
  fat: 18,
  fibre: 4,
  allergens: ['gluten', 'eggs', 'milk'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [
    { n: 'Chicken breast', q: '2, butterflied', price: 5.49, cat: 'Meat & Fish' },
    { n: 'Breadcrumbs', q: '80g', price: 0.99, cat: 'Pantry & Dry' },
    { n: 'Egg', q: '1, beaten', price: 0.40, cat: 'Dairy & Eggs' },
    { n: 'Passata', q: '200ml', price: 0.89, cat: 'Pantry & Dry' },
    { n: 'Mozzarella', q: '125g, torn', price: 2.49, cat: 'Dairy & Eggs' },
    { n: 'Parmesan', q: '30g, grated', price: 1.20, cat: 'Dairy & Eggs' },
    { n: 'Fresh basil', q: 'handful', price: 0.99, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Preheat oven to 200°C. Bash chicken breasts to an even 1.5cm thickness between cling film.',
    'Dip each breast in beaten egg, then press firmly into breadcrumbs on both sides.',
    'Shallow-fry crumbed chicken in hot oil 3 minutes each side until deep golden. Transfer to a baking dish.',
    'Spoon passata over each breast. Top generously with mozzarella and parmesan.',
    'Bake 12 minutes until cheese is molten and bubbling. Rest 2 minutes and scatter with fresh basil.'
  ]
},{
  id: 38,
  name: 'Gnocchi with Gorgonzola & Spinach',
  emoji: '🥬',
  photo: PHOTO('1579349443343-73da56a71a20'),
  cuisine: 'Italian',
  time: '20 min',
  serves: 2,
  protein: 18,
  carbs: 52,
  fat: 22,
  fibre: 4,
  allergens: ['gluten', 'milk', 'tree nuts'],
  incompatible: ['vegan', 'gf', 'lowcarb'],
  ingredients: [
    { n: 'Fresh gnocchi', q: '500g', price: 2.49, cat: 'Pantry & Dry' },
    { n: 'Gorgonzola', q: '100g, crumbled', price: 2.99, cat: 'Dairy & Eggs' },
    { n: 'Double cream', q: '150ml', price: 1.49, cat: 'Dairy & Eggs' },
    { n: 'Baby spinach', q: '100g', price: 1.49, cat: 'Vegetables & Fruit' },
    { n: 'Walnuts', q: '30g, roughly chopped', price: 0.99, cat: 'Pantry & Dry' },
    { n: 'Nutmeg', q: 'pinch, freshly grated', price: 0.30, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Cook gnocchi in salted boiling water until they float to the surface, about 2 minutes. Reserve a cup of water and drain.',
    'Warm cream in a wide pan over medium heat. Add gorgonzola and stir until melted and smooth.',
    'Add a grating of nutmeg and a good turn of black pepper.',
    'Add drained gnocchi, toss gently to coat. Add a splash of pasta water to loosen if needed.',
    'Wilt in the spinach for 30 seconds, then divide between bowls. Top with toasted walnuts.'
  ]
},{
  id: 39,
  name: 'Pesto Pasta with Cherry Tomatoes',
  emoji: '🍝',
  photo: PHOTO('1598866594230-a7c12756260f'),
  cuisine: 'Italian',
  time: '20 min',
  serves: 2,
  protein: 14,
  carbs: 64,
  fat: 20,
  fibre: 5,
  allergens: ['gluten', 'milk', 'tree nuts'],
  incompatible: ['vegan', 'gf', 'lowcarb'],
  ingredients: [
    { n: 'Fusilli or penne', q: '250g', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Basil pesto', q: '4 tbsp', price: 2.29, cat: 'Pantry & Dry' },
    { n: 'Cherry tomatoes', q: '250g, halved', price: 1.49, cat: 'Vegetables & Fruit' },
    { n: 'Parmesan', q: '30g, grated', price: 1.20, cat: 'Dairy & Eggs' },
    { n: 'Toasted pine nuts', q: '2 tbsp', price: 1.49, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Cook pasta in salted boiling water until al dente. Reserve a cup of pasta water.',
    'Heat olive oil in a wide pan over high heat. Add cherry tomatoes and cook 3 minutes until blistered and bursting.',
    'Drain pasta and add to the tomato pan. Remove from heat.',
    'Stir in pesto, adding a splash of pasta water to create a loose, glossy sauce.',
    'Divide between bowls, top with parmesan and toasted pine nuts. Serve immediately.'
  ]
},{
  id: 40,
  name: 'Chicken Katsu Curry',
  emoji: '🍛',
  photo: PHOTO('1677743540715-d4fe04852225'),
  cuisine: 'Asian',
  time: '40 min',
  serves: 2,
  protein: 40,
  carbs: 56,
  fat: 14,
  fibre: 4,
  allergens: ['gluten', 'eggs'],
  incompatible: ['veg', 'vegan', 'gf', 'lowcarb'],
  ingredients: [
    { n: 'Chicken breast', q: '2, flattened', price: 5.49, cat: 'Meat & Fish' },
    { n: 'Panko breadcrumbs', q: '80g', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Plain flour', q: '50g', price: 0.30, cat: 'Pantry & Dry' },
    { n: 'Egg', q: '1, beaten', price: 0.40, cat: 'Dairy & Eggs' },
    { n: 'Japanese curry sauce', q: '3 roux cubes or 1 packet', price: 2.99, cat: 'Pantry & Dry' },
    { n: 'Basmati rice', q: '180g', price: 0.90, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Cook rice per packet. Make curry sauce: simmer an onion and the roux blocks with 400ml water for 10 minutes, stirring until smooth.',
    'Bash chicken to an even 1cm thickness. Coat in flour, then beaten egg, then panko — pressing firmly at each stage.',
    'Pan-fry in 1cm of oil over medium heat, 4 minutes each side, until deep golden and cooked through.',
    'Drain on paper and slice diagonally into thick strips.',
    'Serve rice in a bowl, chicken alongside, curry sauce poured over one half. Finished with pickled ginger if you have it.'
  ]
},{
  id: 41,
  name: 'Miso Glazed Salmon',
  emoji: '🐟',
  photo: PHOTO('1519708227418-c8fd9a32b7a2'),
  cuisine: 'Asian',
  time: '20 min',
  serves: 2,
  protein: 36,
  carbs: 12,
  fat: 18,
  fibre: 1,
  allergens: ['fish', 'soy', 'gluten'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Salmon fillets', q: '2 × 180g', price: 7.49, cat: 'Meat & Fish' },
    { n: 'White miso paste', q: '2 tbsp', price: 2.49, cat: 'Pantry & Dry' },
    { n: 'Mirin', q: '1 tbsp', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Soy sauce', q: '1 tbsp', price: 0.60, cat: 'Pantry & Dry' },
    { n: 'Sesame oil', q: '1 tsp', price: 0.80, cat: 'Pantry & Dry' },
    { n: 'Spring onions & sesame seeds', q: 'to garnish', price: 0.80, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Mix miso, mirin, soy sauce and sesame oil into a smooth glaze.',
    'Pat salmon dry. Spread glaze generously over the flesh side of each fillet.',
    'Heat an oven-proof pan over medium-high. Cook salmon skin-side down for 3 minutes.',
    'Flip, brush remaining glaze on the skin side, then transfer to a 200°C oven for 5 minutes.',
    'Remove when glaze is caramelised and salmon just cooked through. Scatter with spring onions and sesame seeds.'
  ]
},{
  id: 42,
  name: 'Beef Bulgogi Bowl',
  emoji: '🥩',
  photo: PHOTO('1604908177453-7462950a6a3b'),
  cuisine: 'Asian',
  time: '25 min',
  serves: 2,
  protein: 36,
  carbs: 44,
  fat: 16,
  fibre: 3,
  allergens: ['soy', 'sesame', 'gluten'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [
    { n: 'Sirloin steak', q: '300g, very thinly sliced', price: 7.99, cat: 'Meat & Fish' },
    { n: 'Soy sauce', q: '3 tbsp', price: 0.60, cat: 'Pantry & Dry' },
    { n: 'Sesame oil', q: '1 tbsp', price: 0.80, cat: 'Pantry & Dry' },
    { n: 'Garlic & ginger', q: '3 cloves / 1cm piece', price: 0.50, cat: 'Herbs & Spices' },
    { n: 'Brown sugar', q: '1 tbsp', price: 0.30, cat: 'Pantry & Dry' },
    { n: 'Basmati rice & spring onions', q: '180g / 4', price: 1.50, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Cook rice per packet. Mix soy sauce, sesame oil, garlic, ginger and sugar. Coat beef and rest 10 minutes.',
    'Heat a wok or wide pan over the highest possible heat until smoking.',
    'Cook beef in two batches — do not overcrowd. Each batch takes 60 to 90 seconds. Set aside.',
    'Return all beef to the pan for 15 seconds to heat through together.',
    'Serve over rice in bowls. Drizzle any pan juices over. Top with sliced spring onions.'
  ]
},{
  id: 43,
  name: 'Korean Bibimbap',
  emoji: '🍲',
  photo: PHOTO('1718777791239-c473e9ce7376'),
  cuisine: 'Asian',
  time: '30 min',
  serves: 2,
  protein: 22,
  carbs: 56,
  fat: 14,
  fibre: 6,
  allergens: ['soy', 'sesame', 'eggs'],
  incompatible: ['vegan', 'gf'],
  ingredients: [
    { n: 'Short grain rice', q: '200g', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Mixed veg (carrot, courgette, spinach, mushrooms)', q: '300g', price: 2.49, cat: 'Vegetables & Fruit' },
    { n: 'Eggs', q: '2', price: 0.80, cat: 'Dairy & Eggs' },
    { n: 'Gochujang paste', q: '2 tbsp', price: 2.29, cat: 'Pantry & Dry' },
    { n: 'Sesame oil & soy sauce', q: '1 tbsp each', price: 1.00, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Cook rice per packet. Cut all vegetables into thin strips or julienne.',
    'Sauté each vegetable separately in sesame oil 2 minutes with a dash of soy sauce. Keep warm.',
    'Fry eggs sunny-side-up in a little oil — yolk should still be runny.',
    'Divide rice between bowls. Arrange each vegetable in a separate cluster around the edge.',
    'Place a fried egg in the centre. Add a spoonful of gochujang. Drizzle with sesame oil and mix everything together before eating.'
  ]
},{
  id: 44,
  name: 'Paneer Tikka Masala',
  emoji: '🧀',
  photo: PHOTO('1666001120694-3ebe8fd207be'),
  cuisine: 'Indian',
  time: '35 min',
  serves: 4,
  protein: 24,
  carbs: 18,
  fat: 20,
  fibre: 4,
  allergens: ['milk'],
  incompatible: ['vegan', 'lowcarb'],
  ingredients: [
    { n: 'Paneer', q: '400g, cubed', price: 3.49, cat: 'Dairy & Eggs' },
    { n: 'Tikka masala paste', q: '3 tbsp', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Double cream', q: '100ml', price: 0.99, cat: 'Dairy & Eggs' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Onion', q: '1, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic & ginger paste', q: '2 tbsp', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Fresh coriander', q: 'handful', price: 0.79, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Fry paneer cubes in a non-stick pan over high heat, turning, until golden on all sides. Set aside.',
    'Soften onion in the same pan over medium heat, 5 minutes. Add garlic-ginger paste and tikka masala paste, cook 2 minutes.',
    'Pour in tomatoes and simmer uncovered 10 minutes until sauce deepens.',
    'Stir in cream and add the fried paneer. Simmer 5 minutes.',
    'Season with salt, scatter fresh coriander over and serve with basmati rice and naan.'
  ]
},{
  id: 45,
  name: 'Lamb Rogan Josh',
  emoji: '🍲',
  photo: PHOTO('1596797038530-2c107229654b'),
  cuisine: 'Indian',
  time: '70 min',
  serves: 4,
  protein: 38,
  carbs: 10,
  fat: 24,
  fibre: 3,
  allergens: ['milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Lamb shoulder', q: '700g, cubed', price: 8.99, cat: 'Meat & Fish' },
    { n: 'Onions', q: '2, finely sliced', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Greek yogurt', q: '150g', price: 1.19, cat: 'Dairy & Eggs' },
    { n: 'Garlic & ginger paste', q: '2 tbsp', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Rogan josh paste', q: '3 tbsp', price: 1.99, cat: 'Pantry & Dry' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Brown lamb in batches in a heavy pan over high heat. Set aside.',
    'Fry onions in the same pan over medium heat 10 minutes until deep golden.',
    'Add garlic-ginger paste and rogan josh paste. Stir and cook 2 minutes until fragrant.',
    'Return lamb to the pan. Add yogurt a spoonful at a time, stirring between each addition to prevent splitting.',
    'Add tomatoes, bring to a boil, then reduce and simmer covered 45 minutes until lamb is completely tender. Serve with basmati rice.'
  ]
},{
  id: 46,
  name: 'Chicken Saag',
  emoji: '🍗',
  photo: PHOTO('1621515554656-3da68ba128b1'),
  cuisine: 'Indian',
  time: '35 min',
  serves: 4,
  protein: 40,
  carbs: 8,
  fat: 16,
  fibre: 5,
  allergens: ['milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Chicken thighs', q: '600g, cubed', price: 5.49, cat: 'Meat & Fish' },
    { n: 'Frozen spinach', q: '300g, defrosted', price: 1.49, cat: 'Vegetables & Fruit' },
    { n: 'Onion', q: '1, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic & ginger paste', q: '2 tbsp', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Double cream', q: '100ml', price: 0.99, cat: 'Dairy & Eggs' },
    { n: 'Ground cumin, coriander, turmeric & garam masala', q: '1 tsp each', price: 0.80, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Fry onion in oil over medium heat 6 minutes until golden. Add garlic-ginger paste and all spices, cook 1 minute.',
    'Add chicken and cook 8 minutes, stirring, until sealed and golden.',
    'Squeeze excess water from spinach and add to the pan. Stir well to combine.',
    'Pour in cream, stir and simmer uncovered 10 minutes until chicken is cooked through and sauce thickens.',
    'Season with salt. Serve with basmati rice and warm naan.'
  ]
},{
  id: 47,
  name: 'Dal Makhani',
  emoji: '🥣',
  photo: PHOTO('1627366422957-3efa9c6df0fc'),
  cuisine: 'Indian',
  time: '50 min',
  serves: 4,
  protein: 14,
  carbs: 40,
  fat: 12,
  fibre: 14,
  allergens: ['milk'],
  incompatible: ['vegan', 'lowcarb'],
  ingredients: [
    { n: 'Whole black lentils (urad dal)', q: '250g', price: 1.99, cat: 'Pantry & Dry' },
    { n: 'Kidney beans', q: '400g tin, drained', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Butter', q: '50g', price: 1.00, cat: 'Dairy & Eggs' },
    { n: 'Double cream', q: '100ml', price: 0.99, cat: 'Dairy & Eggs' },
    { n: 'Onion', q: '1, finely diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic & ginger paste & tomato purée', q: '2 tbsp each', price: 1.80, cat: 'Pantry & Dry' },
    { n: 'Garam masala', q: '1 tsp', price: 0.40, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Boil lentils in plenty of water 30 minutes until just tender. Drain.',
    'Melt butter in a heavy pan. Fry onion 8 minutes until golden. Add garlic-ginger paste and garam masala, cook 1 minute.',
    'Add tomato purée and stir 2 minutes until the paste darkens.',
    'Add lentils and kidney beans with 200ml water. Simmer 15 minutes, stirring, until thick and creamy.',
    'Stir in cream and simmer 2 more minutes. Serve with naan, a swirl of cream and chopped coriander.'
  ]
},{
  id: 48,
  name: 'Chicken Fajitas',
  emoji: '🌮',
  photo: PHOTO('1689773976415-293dd893f77e'),
  cuisine: 'Mexican',
  time: '25 min',
  serves: 2,
  protein: 38,
  carbs: 34,
  fat: 12,
  fibre: 4,
  allergens: ['gluten'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [
    { n: 'Chicken breast', q: '400g, sliced', price: 4.49, cat: 'Meat & Fish' },
    { n: 'Mixed peppers', q: '2, sliced', price: 1.29, cat: 'Vegetables & Fruit' },
    { n: 'Red onion', q: '1, sliced', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Fajita seasoning', q: '2 tbsp', price: 0.99, cat: 'Herbs & Spices' },
    { n: 'Flour tortillas', q: '6', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Sour cream & guacamole', q: 'to serve', price: 2.49, cat: 'Dairy & Eggs' }
  ],
  steps: [
    'Toss chicken slices with half the fajita seasoning and a drizzle of oil.',
    'Heat a wide pan or griddle over very high heat until smoking. Cook chicken 4 to 5 minutes, tossing, until charred at edges. Remove.',
    'In the same pan, cook peppers and onion with remaining seasoning 4 minutes until charred and just tender.',
    'Warm tortillas in a dry pan for 30 seconds each side.',
    'Serve chicken and veg with sour cream and guacamole for everyone to assemble their own.'
  ]
},{
  id: 49,
  name: 'Beef Tacos',
  emoji: '🌮',
  photo: PHOTO('1599974579688-8dbdd335c77f'),
  cuisine: 'Mexican',
  time: '25 min',
  serves: 2,
  protein: 32,
  carbs: 32,
  fat: 18,
  fibre: 5,
  allergens: ['gluten', 'milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Beef mince', q: '400g', price: 4.49, cat: 'Meat & Fish' },
    { n: 'Taco seasoning', q: '2 tbsp', price: 0.99, cat: 'Herbs & Spices' },
    { n: 'Flour or corn tortillas', q: '8 small', price: 1.79, cat: 'Pantry & Dry' },
    { n: 'Cherry tomatoes', q: '150g, chopped', price: 1.19, cat: 'Vegetables & Fruit' },
    { n: 'Cheddar', q: '60g, grated', price: 0.80, cat: 'Dairy & Eggs' },
    { n: 'Sour cream & lime', q: '3 tbsp / 1', price: 1.00, cat: 'Dairy & Eggs' }
  ],
  steps: [
    'Brown beef over high heat, breaking up lumps, until deeply coloured — about 6 minutes.',
    'Add taco seasoning and 4 tbsp water. Stir and cook 2 minutes until liquid reduces and beef is well coated.',
    'Char tortillas directly on a gas flame or in a hot dry pan until lightly blistered.',
    'Mix cherry tomatoes with a squeeze of lime and pinch of salt for a quick salsa.',
    'Fill each tortilla with beef, top with cheese, sour cream and salsa. Serve immediately.'
  ]
},{
  id: 50,
  name: 'Baja Fish Tacos',
  emoji: '🌮',
  photo: PHOTO('1551504734-5ee1c4a1479b'),
  cuisine: 'Mexican',
  time: '25 min',
  serves: 2,
  protein: 30,
  carbs: 32,
  fat: 12,
  fibre: 4,
  allergens: ['fish', 'gluten', 'eggs', 'milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'White fish fillet (cod or haddock)', q: '300g', price: 4.99, cat: 'Meat & Fish' },
    { n: 'Taco seasoning', q: '1 tbsp', price: 0.60, cat: 'Herbs & Spices' },
    { n: 'Corn tortillas', q: '6 small', price: 1.79, cat: 'Pantry & Dry' },
    { n: 'Coleslaw mix', q: '150g', price: 0.99, cat: 'Vegetables & Fruit' },
    { n: 'Chipotle mayonnaise', q: '4 tbsp', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Lime', q: '2', price: 0.80, cat: 'Vegetables & Fruit' }
  ],
  steps: [
    'Cut fish into strips. Toss with taco seasoning and a drizzle of oil.',
    'Cook in a hot pan 2 to 3 minutes per side until cooked through and crisping at the edges.',
    'Dress coleslaw mix with a squeeze of lime juice and a pinch of salt.',
    'Char tortillas in a dry pan or directly on a gas flame for 30 seconds each side.',
    'Assemble: coleslaw first, fish on top, finish with a drizzle of chipotle mayo and a squeeze of lime.'
  ]
},{
  id: 51,
  name: 'Shakshuka',
  emoji: '🍳',
  photo: PHOTO('1590412200988-a436970781fa'),
  cuisine: 'Middle Eastern',
  time: '25 min',
  serves: 2,
  protein: 18,
  carbs: 22,
  fat: 14,
  fibre: 6,
  allergens: ['eggs', 'milk'],
  incompatible: ['vegan', 'lowcarb'],
  ingredients: [
    { n: 'Eggs', q: '4', price: 1.60, cat: 'Dairy & Eggs' },
    { n: 'Chopped tomatoes', q: '2 × 400g tins', price: 1.58, cat: 'Pantry & Dry' },
    { n: 'Onion', q: '1, diced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Red pepper', q: '1, diced', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Garlic', q: '3 cloves, sliced', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Ground cumin, smoked paprika & chilli flakes', q: '1 tsp each', price: 0.70, cat: 'Herbs & Spices' },
    { n: 'Feta', q: '80g, crumbled', price: 1.49, cat: 'Dairy & Eggs' }
  ],
  steps: [
    'Heat oil in a wide, deep pan. Soften onion and pepper over medium heat 6 minutes.',
    'Add garlic, cumin, paprika and chilli flakes. Cook 1 minute until fragrant.',
    'Pour in tomatoes, season well, and simmer uncovered 10 minutes until the sauce thickens.',
    'Make 4 wells in the sauce. Crack an egg into each well. Cover with a lid.',
    'Cook 5 to 7 minutes until whites are set but yolks still runny. Scatter feta over and serve with crusty bread.'
  ]
},{
  id: 52,
  name: 'Lamb Kofta with Tzatziki',
  emoji: '🥙',
  photo: PHOTO('1734987052573-0fbe611842ae'),
  cuisine: 'Middle Eastern',
  time: '30 min',
  serves: 2,
  protein: 38,
  carbs: 14,
  fat: 24,
  fibre: 3,
  allergens: ['gluten', 'milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Lamb mince', q: '400g', price: 5.99, cat: 'Meat & Fish' },
    { n: 'Ground cumin, coriander & cinnamon', q: '1 tsp each', price: 0.60, cat: 'Herbs & Spices' },
    { n: 'Garlic', q: '2 cloves, grated', price: 0.35, cat: 'Vegetables & Fruit' },
    { n: 'Tzatziki', q: '150g', price: 1.99, cat: 'Dairy & Eggs' },
    { n: 'Flatbreads', q: '2', price: 0.99, cat: 'Pantry & Dry' },
    { n: 'Red onion & fresh mint', q: 'half / handful', price: 0.80, cat: 'Vegetables & Fruit' }
  ],
  steps: [
    'Combine lamb mince with spices, garlic and a generous pinch of salt. Mix well with your hands until everything is evenly distributed.',
    'Divide into 8 portions. Shape each into an elongated sausage on a skewer or free-form log.',
    'Cook on a hot griddle or wide pan 3 to 4 minutes per side until cooked through and charred at edges.',
    'Warm flatbreads in a dry pan.',
    'Serve kofta on flatbreads with tzatziki, thinly sliced red onion and fresh mint.'
  ]
},{
  id: 53,
  name: 'Greek Moussaka',
  emoji: '🫕',
  photo: PHOTO('1777199311086-ec5ff230aefd'),
  cuisine: 'Mediterranean',
  time: '80 min',
  serves: 4,
  protein: 32,
  carbs: 22,
  fat: 28,
  fibre: 5,
  allergens: ['gluten', 'milk', 'eggs'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [
    { n: 'Lamb mince', q: '500g', price: 7.49, cat: 'Meat & Fish' },
    { n: 'Aubergines', q: '2 large, sliced 1cm thick', price: 2.49, cat: 'Vegetables & Fruit' },
    { n: 'Onion & garlic', q: '1 / 3 cloves', price: 0.70, cat: 'Vegetables & Fruit' },
    { n: 'Chopped tomatoes', q: '400g tin', price: 0.79, cat: 'Pantry & Dry' },
    { n: 'Cinnamon & allspice', q: '½ tsp each', price: 0.50, cat: 'Herbs & Spices' },
    { n: 'Béchamel sauce', q: '500ml jar', price: 2.29, cat: 'Pantry & Dry' },
    { n: 'Parmesan', q: '40g, grated', price: 1.49, cat: 'Dairy & Eggs' }
  ],
  steps: [
    'Preheat oven to 200°C. Brush aubergine slices with oil, spread on trays and roast 20 minutes, flipping once, until golden.',
    'Brown lamb with onion and garlic. Add cinnamon, allspice and tomatoes. Simmer 15 minutes until thick.',
    'Layer in a deep baking dish: half the aubergine, all the meat sauce, remaining aubergine.',
    'Pour béchamel over the top, spread evenly and scatter with parmesan.',
    'Bake 30 minutes until deep golden. Rest at least 10 minutes before cutting.'
  ]
},{
  id: 54,
  name: 'Chicken Souvlaki Bowl',
  emoji: '🥙',
  photo: PHOTO('1604908176997-125f25cc6f3d'),
  cuisine: 'Mediterranean',
  time: '35 min',
  serves: 2,
  protein: 44,
  carbs: 26,
  fat: 14,
  fibre: 5,
  allergens: ['milk', 'gluten'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Chicken breast', q: '400g, cubed', price: 4.49, cat: 'Meat & Fish' },
    { n: 'Lemon', q: '1, zest and juice', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Garlic & dried oregano', q: '2 cloves / 1 tsp', price: 0.50, cat: 'Herbs & Spices' },
    { n: 'Tzatziki', q: '150g', price: 1.99, cat: 'Dairy & Eggs' },
    { n: 'Cherry tomatoes & cucumber', q: '150g / half', price: 1.50, cat: 'Vegetables & Fruit' },
    { n: 'Pitta breads', q: '2', price: 0.99, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Mix olive oil, lemon juice, zest, garlic and oregano. Toss chicken in the marinade and rest 15 minutes.',
    'Cook chicken on a hot griddle or wide pan over high heat 10 to 12 minutes, turning, until charred at the edges and cooked through.',
    'Halve cherry tomatoes and slice cucumber. Toss with a squeeze of lemon and a pinch of salt.',
    'Warm pitta in a dry pan.',
    'Serve chicken over the salad in bowls with a generous dollop of tzatziki and warm pitta alongside.'
  ]
},{
  id: 55,
  name: 'Spanish Chicken & Chorizo',
  emoji: '🍗',
  photo: PHOTO('1565599837634-134bc3aadce8'),
  cuisine: 'Mediterranean',
  time: '50 min',
  serves: 4,
  protein: 44,
  carbs: 22,
  fat: 22,
  fibre: 5,
  allergens: ['gluten'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Chicken thighs', q: '6, bone-in skin-on', price: 6.99, cat: 'Meat & Fish' },
    { n: 'Chorizo', q: '150g, sliced', price: 2.99, cat: 'Meat & Fish' },
    { n: 'Mixed peppers', q: '2, sliced', price: 1.29, cat: 'Vegetables & Fruit' },
    { n: 'Cherry tomatoes', q: '250g', price: 1.49, cat: 'Vegetables & Fruit' },
    { n: 'Garlic', q: '4 cloves, crushed', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Smoked paprika & chicken stock', q: '1 tsp / 150ml', price: 1.00, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Preheat oven to 200°C. Season chicken and brown skin-side down in an oven-proof pan over high heat 5 minutes. Remove.',
    'Fry chorizo in the same pan 2 minutes until it releases its oil. Remove.',
    'Add peppers and garlic to the pan. Cook 3 minutes, then add tomatoes, paprika and stock.',
    'Return chicken and chorizo to the pan, chicken skin-side up above the vegetables.',
    'Roast uncovered 30 minutes until chicken skin is crisp and juices run clear. Serve with crusty bread.'
  ]
},{
  id: 56,
  name: 'Prawn Risotto',
  emoji: '🦐',
  photo: PHOTO('1461009683693-342af2f2d6ce'),
  cuisine: 'Italian',
  time: '35 min',
  serves: 2,
  protein: 28,
  carbs: 56,
  fat: 14,
  fibre: 3,
  allergens: ['crustaceans', 'milk'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Raw king prawns', q: '250g', price: 5.99, cat: 'Meat & Fish' },
    { n: 'Arborio rice', q: '200g', price: 1.99, cat: 'Pantry & Dry' },
    { n: 'Dry white wine', q: '100ml', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Fish or veg stock', q: '800ml, kept hot', price: 1.49, cat: 'Pantry & Dry' },
    { n: 'Garlic & shallots', q: '2 cloves / 2', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Butter, lemon & parsley', q: '30g / 1 / handful', price: 1.50, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Keep stock warm. Sauté shallots and garlic in butter over medium heat until soft, about 4 minutes.',
    'Add rice and stir 2 minutes until translucent. Add wine and stir until fully absorbed.',
    'Add stock one ladle at a time, stirring constantly. Each ladle should be absorbed before adding the next — about 18 minutes total.',
    'When rice is just al dente, stir in prawns. They cook in 2 to 3 minutes from the residual heat.',
    'Remove from heat. Stir in remaining butter and a squeeze of lemon. Season, scatter parsley over and serve immediately.'
  ]
},{
  id: 57,
  name: 'Creamy Pork Tenderloin',
  emoji: '🥩',
  photo: PHOTO('1628268909376-e8c44bb3153f'),
  cuisine: 'European',
  time: '30 min',
  serves: 2,
  protein: 40,
  carbs: 6,
  fat: 24,
  fibre: 2,
  allergens: ['milk', 'mustard'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Pork tenderloin', q: '400g', price: 5.99, cat: 'Meat & Fish' },
    { n: 'Double cream', q: '150ml', price: 1.49, cat: 'Dairy & Eggs' },
    { n: 'Dijon mustard', q: '2 tsp', price: 0.80, cat: 'Pantry & Dry' },
    { n: 'Shallots', q: '2, finely diced', price: 0.50, cat: 'Vegetables & Fruit' },
    { n: 'Garlic & fresh thyme', q: '2 cloves / 3 sprigs', price: 0.60, cat: 'Herbs & Spices' },
    { n: 'Chicken stock', q: '100ml', price: 0.50, cat: 'Pantry & Dry' }
  ],
  steps: [
    'Season pork generously. Sear in a hot pan over high heat on all sides, about 6 minutes total, until deep golden.',
    'Transfer to a 200°C oven for 8 to 10 minutes until just cooked through. Rest 5 minutes.',
    'In the same pan over medium heat, soften shallots and garlic 3 minutes.',
    'Add stock and thyme, bubble 2 minutes. Add cream and mustard, stir and simmer 3 minutes until sauce coats a spoon.',
    'Slice pork on an angle and serve over the sauce with mash or green veg.'
  ]
},{
  id: 58,
  name: 'Dublin Coddle',
  emoji: '🥘',
  photo: PHOTO('1648455320791-a667c8aab7e4'),
  cuisine: 'Irish',
  time: '60 min',
  serves: 4,
  protein: 26,
  carbs: 34,
  fat: 16,
  fibre: 5,
  allergens: ['gluten'],
  incompatible: ['veg', 'vegan', 'gf'],
  ingredients: [
    { n: 'Pork sausages', q: '8', price: 4.49, cat: 'Meat & Fish' },
    { n: 'Back bacon', q: '200g, thick cut', price: 2.99, cat: 'Meat & Fish' },
    { n: 'Baby potatoes', q: '600g, halved', price: 1.49, cat: 'Vegetables & Fruit' },
    { n: 'Onions', q: '2, sliced', price: 0.60, cat: 'Vegetables & Fruit' },
    { n: 'Chicken stock', q: '600ml', price: 1.19, cat: 'Pantry & Dry' },
    { n: 'Fresh parsley', q: 'handful, chopped', price: 0.75, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Brown sausages in a heavy pot over medium-high heat until golden. Remove. Brown bacon briefly in the same pot. Remove.',
    'Layer onions and potatoes in the pot. Lay sausages and bacon on top.',
    'Pour stock over everything — it should just cover. Season well with black pepper.',
    'Bring to a simmer, cover and cook over low heat 45 minutes until potatoes are completely tender.',
    'Scatter parsley over and serve in deep bowls with soda bread for mopping up the rich broth.'
  ]
},{
  id: 59,
  name: 'Baked Sea Bass',
  emoji: '🐟',
  photo: PHOTO('1665401015549-712c0dc5ef85'),
  cuisine: 'Mediterranean',
  time: '25 min',
  serves: 2,
  protein: 32,
  carbs: 8,
  fat: 12,
  fibre: 3,
  allergens: ['fish'],
  incompatible: ['veg', 'vegan'],
  ingredients: [
    { n: 'Sea bass fillets', q: '2 × 180g', price: 7.49, cat: 'Meat & Fish' },
    { n: 'Cherry tomatoes', q: '200g, halved', price: 1.29, cat: 'Vegetables & Fruit' },
    { n: 'Capers', q: '1 tbsp', price: 1.29, cat: 'Pantry & Dry' },
    { n: 'Olives', q: '60g, pitted', price: 1.19, cat: 'Pantry & Dry' },
    { n: 'Lemon', q: '1, sliced', price: 0.40, cat: 'Vegetables & Fruit' },
    { n: 'Fresh herbs (parsley or basil)', q: 'handful', price: 0.79, cat: 'Herbs & Spices' }
  ],
  steps: [
    'Preheat oven to 200°C. Scatter tomatoes, capers and olives in a roasting dish. Drizzle with olive oil and season.',
    'Roast the tomatoes 8 minutes until softening and starting to burst.',
    'Nestle sea bass fillets skin-side down among the tomatoes. Lay lemon slices on top of each fillet.',
    'Roast 12 minutes until fish is just opaque and flakes easily at the thickest part.',
    'Scatter fresh herbs over, drizzle with the roasting juices and serve with crusty bread or couscous.'
  ]
}];

// ─── All recipes merged ───────────────────────────────────────────────────────────────────
const ALL_RECIPES = [...PLAN_A, ...PLAN_B, ...SWAP_POOL];

// Expose merged pool for app.js / future algorithm work (#7).
window.RECIPES = ALL_RECIPES;
