// AllSorted — app logic. Loaded after data/recipes.js.
// Migrated verbatim from prototype.html.

const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo
} = React;

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#0D0D0D',
  bgSec: '#161616',
  bgEl: '#1E1E1E',
  border: '#2C2C2C',
  accent: '#4CAF50',
  accentSoft: '#81C784',
  accentMuted: '#1B5E20',
  text: '#F0F0F0',
  textSec: '#9E9E9E',
  textHint: '#5E5E5E',
  error: '#EF5350',
  warning: '#FFB74D',
  slow: '#EF6C00',
  white: '#FFFFFF',
  protein: '#4CAF50',
  carbs: '#FFD740',
  fat: '#FF9800',
  fibre: '#42A5F5',
  gold: '#E0B33A'
};

// Gold SVG crown — premium emblem, perches centered on the avatar circle (never an emoji — #227)
const GOLD_CROWN_SVG = '<svg width="20" height="13" viewBox="0 0 20 13" xmlns="http://www.w3.org/2000/svg"><path d="M2 11.2 L0.9 3.6 L6 6.6 L10 1 L14 6.6 L19.1 3.6 L18 11.2 Z" fill="#E0B33A" stroke="#9A7415" stroke-width="0.6" stroke-linejoin="round"/><rect x="2" y="10.6" width="16" height="2.2" rx="0.6" fill="#E0B33A" stroke="#9A7415" stroke-width="0.5"/></svg>';

// ─── Typography scale ──────────────────────────────────────────────────────────
const T = {
  heading: {
    fontSize: 24,
    fontWeight: 700
  },
  // screen titles
  title: {
    fontSize: 18,
    fontWeight: 700
  },
  // back header, sheet titles
  logo: {
    fontSize: 18,
    fontWeight: 800
  },
  // AllSorted wordmark
  bodyMed: {
    fontSize: 15,
    fontWeight: 600
  },
  // card names, row labels, btn
  body: {
    fontSize: 15,
    fontWeight: 400
  },
  // body copy, list items
  meta: {
    fontSize: 13,
    fontWeight: 400
  },
  // subtext, cuisine/time
  label: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.9
  },
  // section labels
  hint: {
    fontSize: 12,
    fontWeight: 400
  } // hints, legal
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const timeColor = t => { const m = parseInt(t); return m <= 20 ? C.accent : m <= 40 ? C.warning : C.slow; };

// ─── Spacing ───────────────────────────────────────────────────────────────────
const S = {
  frame: 16,
  // horizontal padding for all screens
  card: 12,
  // internal card padding
  section: 16,
  // vertical gap between sections
  hdrPadT: 14,
  // header top padding
  hdrPadB: 14,
  // header bottom padding
  ftPadT: 12,
  // footer CTA top padding
  ftPadB: 20 // footer CTA bottom padding
};


// Safe placeholder for the degenerate case where NO recipe survives the user's
// filters (e.g. every allergen ticked). Keeps the plan renderable instead of
// crashing on an undefined day. Carries every field the card/sheet read.
const FALLBACK_MEAL = {
  id: -1, name: 'No matching recipe', cuisine: '', time: '0', emoji: '🍽️',
  photo: '', ingredients: [], steps: [], allergens: [], incompatible: [],
  protein: 0, carbs: 0, fat: 0, fibre: 0
};

const buildPlanForUser = (diet, allergens, seed, dislikedIds = new Set(), recentIds = new Set()) => {
  // Diet & allergen safety is the one filter that must NEVER be relaxed —
  // every tier below builds on top of it.
  const dietSafe = r =>
    !((r.incompatible || []).includes(diet)) &&
    !(r.allergens || []).some(a => allergens.includes(a));

  // Tier 1 (ideal): respects diet, allergens, dislikes AND recent no-repeat memory
  const tier1 = ALL_RECIPES.filter(r => dietSafe(r) && !dislikedIds.has(r.id) && !recentIds.has(r.id));
  // Tier 2 (graceful fallback): pool too small for the no-repeat window — relax that, keep dislikes out
  const tier2 = ALL_RECIPES.filter(r => dietSafe(r) && !dislikedIds.has(r.id));
  // Tier 3 (last resort): relax dislikes too — diet & allergen safety still guaranteed
  const tier3 = ALL_RECIPES.filter(r => dietSafe(r));
  const pool = tier1.length >= 7 ? tier1 : (tier2.length >= 7 ? tier2 : tier3);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const plan = [];
  const cuisineCounts = {};
  // Pass 1: max 2 of the same cuisine
  for (const r of shuffled) {
    if (plan.length >= 7) break;
    const c = cuisineCounts[r.cuisine] || 0;
    if (c < 2) { plan.push(r); cuisineCounts[r.cuisine] = c + 1; }
  }
  // Pass 2: fill any remaining slots if pool is too small for strict diversity
  const usedIds = new Set(plan.map(r => r.id));
  for (const r of shuffled) {
    if (plan.length >= 7) break;
    if (!usedIds.has(r.id)) { plan.push(r); usedIds.add(r.id); }
  }
  // Pass 3: a restrictive diet + allergen combo can leave fewer than 7 safe
  // recipes (e.g. vegan + gluten + milk). Loop the safe pool — repeats allowed —
  // so the week is ALWAYS full. Diet/allergen safety is already guaranteed by
  // `pool`, so repeating never introduces an unsafe meal. Prevents undefined days.
  for (let k = 0; plan.length < 7 && shuffled.length > 0; k++) {
    plan.push(shuffled[k % shuffled.length]);
  }
  return plan.slice(0, 7);
};

// ─── Pantry staples (pre-excluded) ──────────────────────────────────────────────────
const STAPLES = [{
  n: 'Olive oil',
  q: '500ml bottle',
  price: 3.49
}, {
  n: 'Salt',
  q: '750g drum',
  price: 0.79
}, {
  n: 'Black pepper',
  q: '25g jar',
  price: 0.99
}, {
  n: 'Plain flour',
  q: '1.5kg bag',
  price: 1.19
}, {
  n: 'Sugar',
  q: '1kg bag',
  price: 1.39
}, {
  n: 'Dried herbs',
  q: 'mixed, 20g',
  price: 1.49
}, {
  n: 'Stock cubes',
  q: 'pack of 6',
  price: 1.29
}];

// ─── Dynamic shopping list ──────────────────────────────────────────────────────────────
const buildShoppingList = (resolvedMeals, dayOn) => {
  const CAT_ORDER = ['Meat & Fish', 'Vegetables & Fruit', 'Dairy & Eggs', 'Pantry & Dry'];
  const merged = {};
  for (let i = 0; i < 7; i++) {
    if (!dayOn[i]) continue;
    const recipe = resolvedMeals[i];
    for (const ing of (recipe && recipe.ingredients) || []) {
      if (merged[ing.n]) {
        merged[ing.n] = {
          ...merged[ing.n],
          count: merged[ing.n].count + 1,
          price: merged[ing.n].price + ing.price
        };
      } else {
        merged[ing.n] = {
          ...ing,
          count: 1
        };
      }
    }
  }
  const result = {};
  for (const item of Object.values(merged)) {
    const cat = item.cat || 'Pantry & Dry';
    if (!result[cat]) result[cat] = [];
    result[cat].push({
      n: item.n,
      q: item.count > 1 ? "".concat(item.q, " \xD7").concat(item.count) : item.q,
      price: item.price
    });
  }
  const ordered = {};
  for (const cat of CAT_ORDER) {
    if (result[cat]) ordered[cat] = result[cat];
  }
  for (const cat of Object.keys(result)) {
    if (!ordered[cat]) ordered[cat] = result[cat];
  }
  return ordered;
};
const PAST_WEEKS = [{
  id: 1,
  delivery: new Date(2026, 4, 12),
  estimate: 54.20,
  // Mon 12 May
  meals: [{
    name: 'Garlic Butter Chicken',
    emoji: '🍗',
    cuisine: 'Irish',
    time: '25 min',
    protein: 42
  }, {
    name: 'Smoked Salmon Pasta',
    emoji: '🍝',
    cuisine: 'Italian',
    time: '20 min',
    protein: 31
  }, {
    name: 'Beef & Guinness Stew',
    emoji: '🥘',
    cuisine: 'Irish',
    time: '45 min',
    protein: 38
  }, {
    name: 'Lemon Herb Cod',
    emoji: '🐟',
    cuisine: 'Irish',
    time: '18 min',
    protein: 29
  }, {
    name: 'Chickpea Curry',
    emoji: '🍛',
    cuisine: 'Asian',
    time: '30 min',
    protein: 18
  }, {
    name: "Lamb Shepherd's Pie",
    emoji: '🥧',
    photo: PHOTO('1650917331384-1fd06afa3230'),
    cuisine: 'Irish',
    time: '55 min',
    protein: 34
  }, {
    name: 'Roast Chicken Sunday',
    emoji: '🍖',
    cuisine: 'Irish',
    time: '90 min',
    protein: 45
  }],
  tips: [{
    icon: '💪',
    text: 'Strong protein week — averaging 34g per meal. Good for an active lifestyle without supplements.'
  }, {
    icon: '⏱️',
    text: 'Sunday roast is 90 min — worth prepping the veg Saturday night to keep it stress-free.'
  }, {
    icon: '🥘',
    text: 'Beef stew and shepherd\'s pie improve overnight. Make the full batch and refrigerate half for next day.'
  }]
}, {
  id: 2,
  delivery: new Date(2026, 4, 5),
  estimate: 47.80,
  // Mon 5 May
  meals: [{
    name: 'Thai Basil Stir Fry',
    emoji: '🍜',
    cuisine: 'Asian',
    time: '20 min',
    protein: 22
  }, {
    name: 'Honey Garlic Prawns',
    emoji: '🦐',
    cuisine: 'Asian',
    time: '20 min',
    protein: 28
  }, {
    name: 'Irish Lamb Stew',
    emoji: '🥘',
    photo: PHOTO('1664741662725-bd131742b7b7'),
    cuisine: 'Irish',
    time: '50 min',
    protein: 35
  }, {
    name: 'Baked Hake',
    emoji: '🐟',
    photo: PHOTO('1728963228980-71c76178616a'),
    cuisine: 'Irish',
    time: '22 min',
    protein: 30
  }, {
    name: 'Lentil Dahl',
    emoji: '🥣',
    cuisine: 'Asian',
    time: '35 min',
    protein: 16
  }, {
    name: 'Chicken Pot Pie',
    emoji: '🥧',
    photo: PHOTO('1650917331384-1fd06afa3230'),
    cuisine: 'Irish',
    time: '55 min',
    protein: 32
  }, {
    name: 'Sunday Roast Beef',
    emoji: '🥩',
    photo: PHOTO('1635897411141-7bd2b9c6ab16'),
    cuisine: 'Irish',
    time: '90 min',
    protein: 48
  }],
  tips: [{
    icon: '🌏',
    text: 'Good variety — Asian flavours mid-week, Irish classics at the weekend. Nice balance.'
  }, {
    icon: '🦐',
    text: 'Prawns and baked hake are both under 22 mins — save these for your busiest weeknights.'
  }, {
    icon: '🛒',
    text: 'Garlic, ginger and soy sauce appear across multiple dishes — buy once, use three times.'
  }]
}];
const SHARE_APPS = [{
  name: 'WhatsApp',
  bg: '#25D366',
  icon: '💬'
}, {
  name: 'Instagram',
  bg: '#C13584',
  icon: '📸'
}, {
  name: 'iMessage',
  bg: '#34C759',
  icon: '✉️'
}, {
  name: 'Telegram',
  bg: '#2AABEE',
  icon: '✈️'
}, {
  name: 'X',
  bg: '#1A1A1A',
  icon: '✕'
}, {
  name: 'Save',
  bg: '#007AFF',
  icon: '⬇️'
}];
const INGREDIENTS = [{
  n: 'Chicken breast',
  q: '200g (1 serving)'
}, {
  n: 'Unsalted butter',
  q: '20g'
}, {
  n: 'Garlic cloves',
  q: '2, minced'
}, {
  n: 'Fresh thyme',
  q: '2 sprigs'
}, {
  n: 'Lemon',
  q: '½, zested & juiced'
}, {
  n: 'Olive oil',
  q: '½ tbsp'
}, {
  n: 'Salt & pepper',
  q: 'to taste'
}];
const STEPS = ['Pat chicken dry and season generously with salt and pepper.', 'Heat olive oil in a large pan over medium-high heat until shimmering.', 'Add chicken and cook 5–6 minutes per side until deep golden brown.', 'Reduce heat. Add butter, garlic and thyme. Baste continuously for 2 minutes.', 'Squeeze lemon juice over, rest 3 minutes before slicing.'];
const STORES = [{
  id: 'Tesco',
  label: 'Tesco Ireland',
  sub: 'Delivery + Click & Collect',
  emoji: '🛍️'
}, {
  id: 'Dunnes',
  label: 'Dunnes Stores',
  sub: 'Delivery + Click & Collect',
  emoji: '🏪'
}, {
  id: 'SuperValu',
  label: 'SuperValu',
  sub: 'Click & Collect + some delivery',
  emoji: '🏬'
}];
const CUISINE_COLOR = {
  'Irish': '#66BB6A',
  'Italian': '#EF5350',
  'Asian': '#FFA726',
  'French': '#CE93D8',
  'Mediterranean': '#4DD0E1',
  'Middle Eastern': '#FFD54F',
  'Mexican': '#FF8A65',
  'European': '#64B5F6',
  'Indian': '#FFAB40',
  'North African': '#80CBC4'
};
const DIET_LABELS = {
  veg: 'Vegetarian',
  vegan: 'Vegan',
  protein: 'High Protein',
  lowcarb: 'Low Carb',
  gf: 'Gluten-Free',
  balanced: 'Balanced'
};

// ── Per-ingredient conflict inference (prototype simulation of #215) ──────────
// The real app will carry per-ingredient allergen + category tags in the recipe
// data (EU allergen labelling already requires this at source). Here we infer
// from the ingredient name so the recipe sheet can red-flag the offending lines.
const ING_ALLERGEN_KW = {
  gluten: ['flour', 'bread', 'breadcrumb', 'pasta', 'noodle', 'couscous', 'naan', 'pita', 'tortilla', 'barley', 'bulgur', 'cracker', 'pastry', 'soy sauce', 'wrap'],
  milk: ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'yoghurt', 'ghee', 'paneer', 'feta', 'mozzarella', 'parmesan', 'mascarpone'],
  eggs: ['egg'],
  fish: ['fish', 'salmon', 'cod', 'tuna', 'anchovy', 'haddock', 'mackerel', 'sardine'],
  crustaceans: ['prawn', 'shrimp', 'crab', 'lobster', 'langoustine'],
  molluscs: ['mussel', 'clam', 'squid', 'octopus', 'oyster', 'calamari', 'scallop'],
  peanuts: ['peanut'],
  treenuts: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'tempeh', 'miso'],
  sesame: ['sesame', 'tahini'],
  celery: ['celery', 'celeriac'],
  mustard: ['mustard'],
  sulphites: [],
  lupin: ['lupin']
};
const MEAT_KW = ['chicken', 'beef', 'pork', 'lamb', 'bacon', 'ham', 'sausage', 'mince', 'steak', 'meat', 'gelatin', 'prosciutto', 'chorizo', 'pepperoni', 'turkey', 'duck', 'veal'];
const SEAFOOD_KW = ['fish', 'salmon', 'cod', 'tuna', 'anchovy', 'haddock', 'mackerel', 'sardine', 'prawn', 'shrimp', 'crab', 'lobster', 'mussel', 'clam', 'squid', 'octopus', 'oyster', 'calamari', 'scallop'];
const ANIMAL_KW = ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'yoghurt', 'ghee', 'paneer', 'feta', 'mozzarella', 'parmesan', 'mascarpone', 'egg', 'honey'];
const HICARB_KW = ['rice', 'pasta', 'bread', 'potato', 'flour', 'sugar', 'noodle', 'couscous', 'naan', 'tortilla', 'quinoa'];

// Strip compounds that would otherwise trip a keyword (coconut milk isn't dairy,
// eggplant isn't egg, butternut isn't butter, peanut butter isn't dairy).
const normIngredient = name => (name || '').toLowerCase()
  .replace(/eggplant/g, 'aubergine')
  .replace(/butternut/g, 'b-squash')
  .replace(/(coconut|almond|oat|soya?|cashew|rice|hemp) (milk|cream|yogurt|yoghurt)/g, '$1')
  .replace(/(peanut|almond|cashew|nut|cocoa|seed|sunflower) butter/g, '$1');

// True when this ingredient clashes with the user's active allergens or diet.
const ingredientConflicts = (name, userAllergens, diet) => {
  const n = normIngredient(name);
  const has = kws => kws.some(k => n.includes(k));
  for (const a of (userAllergens || [])) {
    const kws = ING_ALLERGEN_KW[a];
    if (kws && kws.length && has(kws)) return true;
  }
  if (diet === 'veg' && (has(MEAT_KW) || has(SEAFOOD_KW))) return true;
  if (diet === 'vegan' && (has(MEAT_KW) || has(SEAFOOD_KW) || has(ANIMAL_KW))) return true;
  if (diet === 'gf' && has(ING_ALLERGEN_KW.gluten)) return true;
  if (diet === 'lowcarb' && has(HICARB_KW)) return true;
  return false;
};
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Two-line brand lockup (mirrors prototype-logo.svg) inlined so the splash can
// animate the cart group on its own. The cart's positioning transform stays on
// the inner <g>; the .splash-cart / .splash-wheel wrappers carry the animation
// so they don't clobber that positioning.
const SPLASH_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <g transform="translate(-105.70,-260.68) scale(1.6640)">
    <path fill="#F0F0F0" d="M184.559 291.436L204.1 291.458L240.28 384.441C246.109 399.509 251.265 413.847 257.48 428.817C250.369 429.016 242.829 428.885 235.684 428.871C231.588 418.82 227.542 407.65 223.866 397.454L205.819 397.442L166.097 397.316C162.165 407.777 158.482 418.173 154.468 428.672C147.197 428.701 139.926 428.662 132.656 428.555C134.781 423.421 136.832 418.209 138.733 412.989C153.498 372.434 170.532 332.23 184.559 291.436Z"/>
    <path fill="#0D0D0D" d="M195.057 319.756C197.085 323.882 201.376 336.022 203.094 340.701C207.65 353.341 212.306 365.944 217.062 378.509L194.75 378.53L172.477 378.522C176.62 367.698 180.696 356.848 184.702 345.972C187.715 337.792 191.318 327.481 195.057 319.756Z"/>
    <path fill="#F0F0F0" d="M261.435 288.439C268.364 288.371 275.441 288.461 282.384 288.475L282.383 359.001C282.363 371.362 281.927 384.265 282.544 396.615C283.083 407.404 287.882 411.736 298.538 412.662L298.5 429.591C288.22 429.71 277.005 430.26 269.158 422.332C260.824 413.912 261.523 400.407 261.468 389.46C261.427 381.27 261.477 373.14 261.487 364.986L261.435 288.439Z"/>
    <path fill="#F0F0F0" d="M303.414 288.29C310.349 288.216 317.459 288.32 324.41 288.343L324.408 361.304C324.409 373.101 323.953 385.439 324.762 397.145C325.557 408.649 329.711 412.195 340.625 412.625C340.637 418.38 340.619 424.135 340.573 429.89L339.607 429.905C328.867 430.017 319.787 429.636 311.627 421.601C302.922 413.03 303.391 399.752 303.257 388.448C303.172 381.326 303.181 374.277 303.165 367.195C303.092 340.893 303.175 314.591 303.414 288.29Z"/>
  </g>
  <g class="splash-cart">
    <g transform="translate(95.53,-444.97) scale(1.2800)">
      <path fill="#F0F0F0" d="M635.461 486.221C648.95 485.72 662.706 486.234 676.224 485.948C681.899 485.828 689.15 485.109 693.513 489.222C696.087 491.642 697.59 494.988 697.687 498.519C697.804 502.014 696.633 505.308 694.195 507.839C692.47 509.613 690.273 510.855 687.864 511.419C678.339 513.598 660.337 510.961 649.773 512.065C638.889 513.202 633.448 513.72 629.018 525.29C624.975 535.849 621.896 546.323 618.285 556.795L591.752 635.841C576.699 681.567 581.585 676.356 534.325 676.365L462.125 676.352L428.5 676.441C418.4 676.477 400.733 679.126 398.882 665.746C397.857 658.337 402.019 650.867 410.016 650.588C421.13 650.201 432.405 650.514 443.542 650.513L517.923 650.511C529.831 650.514 541.988 650.668 553.874 650.468C556.225 650.429 559.72 649.305 560.733 647.318C564.903 639.143 568.724 625.497 571.523 616.786L599.192 532.119C602.53 522.154 605.518 512.078 608.891 502.132C613.433 488.739 622.764 486.785 635.461 486.221Z"/>
      <path fill="#4CAF50" d="M349.254 507.229C372.397 506.839 396.255 507.28 419.521 507.129L419.543 535.429C411.341 535.201 403.137 535.09 394.932 535.096C397.706 541.74 401.61 549.394 404.701 556.124L425.84 602.48C439.24 602.402 555.324 601.602 557.832 602.772L557.474 604.486C554.43 613.391 551.598 622.368 548.979 631.407C501.818 630.865 453.314 631.447 406.1 631.666C392.671 604.316 380.296 575.463 367.571 547.678L355.269 520.867C353.893 517.882 349.998 509.885 349.254 507.229Z"/>
      <path fill="#4CAF50" d="M498.884 506.915L555.279 506.982C566.172 506.998 578.504 506.76 589.293 507.343C587.192 514.211 584.729 521.32 582.469 528.164L580.079 535.485L498.878 535.468C498.753 526.044 498.876 516.36 498.884 506.915Z"/>
      <path fill="#4CAF50" d="M498.783 554.488L574.237 554.446C571.698 561.439 569.271 568.473 566.957 575.545L564.469 583.314L498.963 583.286L498.783 554.488Z"/>
      <g transform="translate(-6,-12) translate(466.34,543.5) scale(1.20) translate(-466.34,-543.5)">
        <path fill="#F0F0F0" d="M479.76 528.375C483.801 528.952 486.882 532.471 483.816 535.818C478.199 541.951 471.277 547.479 465.577 553.583C460.678 558.829 457.967 554.849 454.021 550.666C452.796 549.332 448.19 545.047 448.402 543.754C450.29 532.255 460.06 544.637 461.073 545.6C466.543 540.321 473.734 532.602 479.76 528.375Z"/>
        <path fill="#F0F0F0" d="M479.869 498.618C482.812 499.324 486.514 501.456 483.961 505.197C481.89 508.233 477.32 511.406 474.756 514.322C471.952 517.512 468.547 520.52 465.775 523.781C459.478 530.02 457.681 524.523 453.513 520.016C452.046 518.703 448.11 515.575 448.32 513.754C449.623 502.498 458.25 512.889 459.856 514.291L461.172 515.422C465.291 511.876 476.781 499.95 479.869 498.618Z"/>
        <path fill="#F0F0F0" d="M479.73 557.937C484.685 559.147 486.779 562.357 482.919 566.207C476.848 572.26 470.262 578.311 464.187 584.369C460.116 588.43 456.47 583.191 453.683 580.23C451.781 578.216 445.805 573.555 449.474 570.246C454.38 565.819 457.568 572.251 460.603 575.231C467.276 569.764 472.83 562.985 479.73 557.937Z"/>
      </g>
      <g class="splash-wheel">
        <g transform="translate(441.27,718.75) scale(1.10) translate(-441.27,-718.75)">
          <path fill="#F0F0F0" d="M437.952 695.197C446.411 694.007 454.856 697.472 460.041 704.261C465.226 711.051 466.346 720.109 462.97 727.957C459.595 735.805 452.249 741.222 443.754 742.128C430.921 743.497 419.361 734.324 417.778 721.516C416.194 708.708 425.172 696.995 437.952 695.197Z"/>
          <path fill="#0D0D0D" transform="translate(441.27,718.75) scale(0.6) translate(-441.27,-718.75)" d="M437.952 695.197C446.411 694.007 454.856 697.472 460.041 704.261C465.226 711.051 466.346 720.109 462.97 727.957C459.595 735.805 452.249 741.222 443.754 742.128C430.921 743.497 419.361 734.324 417.778 721.516C416.194 708.708 425.172 696.995 437.952 695.197Z"/>
        </g>
      </g>
      <g class="splash-wheel">
        <g transform="translate(8,0) translate(530.48,718.71) scale(1.10) translate(-530.48,-718.71)">
          <path fill="#F0F0F0" d="M526.688 695.279C539.484 693.193 551.573 701.802 553.785 714.576C555.998 727.351 547.509 739.524 534.757 741.862C521.826 744.234 509.444 735.599 507.2 722.645C504.957 709.691 513.713 697.395 526.688 695.279Z"/>
          <path fill="#0D0D0D" transform="translate(530.48,718.71) scale(0.6) translate(-530.48,-718.71)" d="M526.688 695.279C539.484 693.193 551.573 701.802 553.785 714.576C555.998 727.351 547.509 739.524 534.757 741.862C521.826 744.234 509.444 735.599 507.2 722.645C504.957 709.691 513.713 697.395 526.688 695.279Z"/>
        </g>
      </g>
    </g>
  </g>
  <g transform="translate(-523.84,62.98) scale(1.6640)">
    <path fill="#4CAF50" d="M384.53 278.098L403.69 278.104L403.835 294.402C426.762 298.623 438.164 309.854 441.153 332.882L417.15 332.909C413.944 318.192 406.389 313.344 391.596 313.795C385.939 313.967 378.476 316.28 374.722 320.598C371.766 323.999 370.83 329.729 371.248 334.107C372.811 348.783 393.569 349.781 404.817 353.634C413.541 356.623 420.586 358.719 428.029 364.663C435.262 370.463 439.877 378.912 440.85 388.131C443.337 411.059 425.083 427.216 403.507 429.428C403.501 432.927 404.303 443.478 402.666 445.536L400.625 445.699L384.821 445.985C384.485 440.666 384.556 434.644 384.501 429.267C366.05 427.192 348.156 416.176 345.173 396.663C344.842 394.498 344.916 391.589 344.9 389.368C352.625 389.099 361.243 389.252 369.037 389.225C370.174 395.777 372.249 401.121 377.903 405.174C391.858 415.177 421.66 410.037 417.149 387.752C416.466 384.38 413.836 379.63 410.738 377.928C395.584 369.602 376.915 369.335 362.311 359.197C355.245 354.329 350.541 348.465 349.046 339.883C347.244 329.541 348.247 319.258 354.362 310.494C361.633 300.066 372.519 296.414 384.367 294.186C384.347 288.882 384.47 283.415 384.53 278.098Z"/>
    <path fill="#4CAF50" d="M497.01 329.416C525.374 326.76 550.471 347.723 552.907 376.107C555.344 404.491 534.188 429.424 505.786 431.641C477.693 433.834 453.089 412.958 450.679 384.883C448.269 356.807 468.954 332.043 497.01 329.416Z"/>
    <path fill="#0D0D0D" d="M494.924 348.62C502.801 348.006 509.364 348.013 516.502 352.032C532.27 360.908 535.704 384.026 526.968 398.911C522.675 406.225 516.197 410.215 508.185 412.35C491.365 414.551 477.952 407.257 473.417 390.781C468.479 372.841 476.116 353.648 494.924 348.62Z"/>
    <path fill="#4CAF50" d="M606.756 331.133C610.661 330.859 615.242 330.996 619.204 331.018C619.409 337.019 619.246 343.893 619.227 349.965C611.207 349.911 599.346 349.049 593.558 355.469C585.111 364.839 587.128 382.67 587.228 394.359C587.323 406.141 587.325 417.923 587.235 429.705C580.408 429.564 573.34 429.629 566.493 429.602C565.161 428.209 565.859 400.253 565.878 395.502L565.909 331.398C572.794 331.387 579.679 331.426 586.563 331.515L586.687 344.72L587.442 343.566C592.692 335.411 597.297 332.698 606.756 331.133Z"/>
    <path fill="#4CAF50" d="M662.752 293.871C663.378 296.472 663.033 326.761 663.02 331.726C670.269 331.387 678.709 331.559 686.049 331.543L686.051 349.819C678.52 349.793 670.989 349.816 663.458 349.888L663.415 354.706L663.275 381.737C663.254 387.552 663.013 393.361 663.677 399.143C665.268 412.986 674.318 412.101 685.022 412.174L684.997 430.46C680.29 430.521 675.581 430.473 670.876 430.315C640.785 427.688 641.933 405.308 641.957 382.618L641.982 350.094L625.279 350.18C625.154 344.022 625.24 337.568 625.229 331.385C630.864 331.256 636.827 331.336 642.489 331.323L642.411 313.253C649.054 307.163 656.155 299.502 662.752 293.871Z"/>
    <path fill="#4CAF50" d="M737.71 329.685C751.345 328.83 767.624 333.383 777.243 343.455C789.629 356.426 790.646 370.723 790.455 387.541L713.888 387.505C716.472 417.351 754.055 423.509 767.699 399.878C768.387 398.686 770.973 399.035 772.25 399.031L787.452 399.139C780.927 418.79 770.876 428.458 749.385 431.072C735.529 432.757 721.943 430.145 710.84 421.361C688.921 404.02 686.139 367.445 703.958 346.304C713.371 335.052 723.311 331.045 737.71 329.685Z"/>
    <path fill="#0D0D0D" d="M738.278 347.612C755.241 346.151 765.997 354.853 769.378 371.543L745.543 371.529L713.546 371.501C716.978 357.345 723.896 350.214 738.278 347.612Z"/>
    <path fill="#4CAF50" d="M878.594 288.459C885.746 288.397 893.04 288.491 900.204 288.509L900.011 429.626L878.913 429.809C878.765 425.33 878.826 420.591 878.81 416.089C866.076 434.143 842.726 435.365 824.15 426.08C803.557 413.842 795.72 391.188 799.896 368.146C802.169 355.409 809.531 344.147 820.285 336.955C838.157 324.917 865.802 326.084 878.476 345.344C878.653 326.383 878.692 307.421 878.594 288.459Z"/>
    <path fill="#0D0D0D" d="M847.902 347.687C867.23 347.299 879.01 361.132 878.919 379.748C878.828 398.202 871.56 410.707 851.968 413.476C821.633 413.658 811.156 380.101 827.048 357.684C831.573 351.302 840.306 348.479 847.902 347.687Z"/>
  </g>
</svg>`;
const ALLERGENS = [{
  id: 'gluten',
  label: 'Gluten',
  emoji: '🌾'
}, {
  id: 'crustaceans',
  label: 'Crustaceans',
  emoji: '🦞'
}, {
  id: 'eggs',
  label: 'Eggs',
  emoji: '🥚'
}, {
  id: 'fish',
  label: 'Fish',
  emoji: '🐟'
}, {
  id: 'peanuts',
  label: 'Peanuts',
  emoji: '🥜'
}, {
  id: 'treenuts',
  label: 'Tree Nuts',
  emoji: '🌰'
}, {
  id: 'milk',
  label: 'Milk',
  emoji: '🥛'
}, {
  id: 'celery',
  label: 'Celery',
  emoji: '🌿'
}, {
  id: 'mustard',
  label: 'Mustard',
  emoji: '🟡'
}, {
  id: 'sesame',
  label: 'Sesame',
  emoji: '🫙'
}, {
  id: 'soy',
  label: 'Soy',
  emoji: '🫘'
}, {
  id: 'lupin',
  label: 'Lupin',
  emoji: '🌼'
}, {
  id: 'molluscs',
  label: 'Molluscs',
  emoji: '🐚'
}, {
  id: 'sulphites',
  label: 'Sulphites',
  emoji: '🍷'
}];

// ─── Shared UI helpers ─────────────────────────────────────────────────────────
const pill = (color, text) => /*#__PURE__*/React.createElement("span", {
  style: {
    background: color + '22',
    color,
    borderRadius: 20,
    padding: '2px 8px',
    ...T.hint,
    fontWeight: 600,
    flexShrink: 0
  }
}, text);
const SectionLabel = ({
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    ...T.label,
    color: C.textSec,
    marginBottom: 8
  }
}, children);

// Macro ring — SVG progress ring for recipe detail macros tab
// Defined at module level (not inside render) to keep React component identity stable
const _RING_R = 26;
const _RING_CIRC = 2 * Math.PI * _RING_R;
const MacroRing = ({
  label,
  value,
  color,
  refVal
}) => {
  const pct = Math.min(value / refVal, 1);
  const dash = pct * _RING_CIRC;
  const gap = _RING_CIRC - dash;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 64,
      height: 64
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "64",
    height: "64",
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "32",
    r: _RING_R,
    fill: "none",
    stroke: C.bgEl,
    strokeWidth: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "32",
    r: _RING_R,
    fill: "none",
    stroke: color,
    strokeWidth: "5",
    strokeDasharray: "".concat(dash, " ").concat(gap),
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.text,
      lineHeight: 1
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: C.textSec,
      lineHeight: 1,
      marginTop: 1
    }
  }, "g"))), /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.label,
      color: C.textSec,
      textAlign: 'center'
    }
  }, label));
};

// ─── ScreenHeader ──────────────────────────────────────────────────────────────
// Logo always mathematically centred via position:absolute — immune to left/right width.
// left / right: pass any ReactNode. Omit either and a 28px spacer balances it.
const ScreenHeader = ({
  left,
  right,
  badge
}) => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative',
    height: 52,
    paddingLeft: S.frame,
    paddingRight: S.frame,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    zIndex: 1,
    minWidth: 28,
    display: 'flex',
    alignItems: 'center'
  }
}, left || /*#__PURE__*/React.createElement("div", {
  style: {
    width: 28
  }
})), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  }
}, /*#__PURE__*/React.createElement("img", {
  src: "header-logo.png",
  alt: "AllSorted",
  style: { height: 22, width: 'auto', objectFit: 'contain' }
})), badge ? /*#__PURE__*/React.createElement("div", {
  style: { position: 'absolute', left: 44, right: '65%', top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }
}, badge) : null, /*#__PURE__*/React.createElement("div", {
  style: {
    zIndex: 1,
    minWidth: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
}, right || /*#__PURE__*/React.createElement("div", {
  style: {
    width: 28
  }
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    height: 1,
    background: C.border,
    flexShrink: 0
  }
}));

// ─── ScreenFooter ──────────────────────────────────────────────────────────────
// minHeight locks the border at the same Y position regardless of content.
// center: vertically + horizontally centres content (use for brand tagline / hint text).
const ScreenFooter = ({
  children,
  center = false
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "".concat(S.ftPadT, "px ").concat(S.frame, "px ").concat(S.ftPadB, "px"),
    borderTop: "1px solid ".concat(C.border),
    flexShrink: 0,
    boxSizing: 'border-box',
    minHeight: S.ftPadT + 58 + S.ftPadB + 1,
    // border-box: total height = 91px
    display: 'flex',
    flexDirection: 'column',
    justifyContent: center ? 'center' : 'flex-start',
    alignItems: center ? 'center' : 'stretch'
  }
}, children);

// ─── TapRow ────────────────────────────────────────────────────────────────────
// Tappable card row — used in CartReady and WeekComplete
const TapRow = ({
  label,
  onPress
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onPress,
  style: {
    background: C.bgSec,
    border: "1px solid ".concat(C.border),
    borderRadius: 12,
    padding: '13px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    width: '100%'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    ...T.body,
    color: C.text
  }
}, label), /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.textHint,
    fontSize: 18,
    lineHeight: 1
  }
}, "\u203A"));

// ─── BrandTagline ──────────────────────────────────────────────────────────────
// Shared footer signature for non-CTA screens. Use inside <ScreenFooter center>.
const BrandTagline = () => /*#__PURE__*/React.createElement("span", {
  style: {
    ...T.hint,
    fontSize: 14,
    color: C.textHint
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.accent
  }
}, "Plan"), ' it. ', /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.accent
  }
}, "Shop"), ' it. ', /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.accent
  }
}, "Cook"), ' it.');

// ─── SheetHandle ───────────────────────────────────────────────────────────────
// Standard grab-pill for every bottom sheet. Pass closeFn to enable swipe-down-to-dismiss.
const SheetHandle = ({
  closeFn, swipeDismissFn
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'center',
    padding: '12px 0 8px',
    flexShrink: 0,
    cursor: closeFn ? 'grab' : 'default',
    touchAction: 'none'
  },
  // Pointer Events (not Touch Events) — unify mouse, touch & pen behind one
  // API so swipe-down-to-dismiss works identically on phones AND in a
  // desktop browser (which has no touchstart/touchmove/touchend at all).
  // setPointerCapture keeps the gesture tracking even if the cursor/finger
  // drifts outside the handle's small hit area mid-drag.
  onPointerDown: closeFn ? e => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const s = e.currentTarget.parentNode;
    s._sy = e.clientY;
    s._dragging = true;
  } : undefined,
  onPointerMove: closeFn ? e => {
    const s = e.currentTarget.parentNode;
    if (!s._dragging) return;
    const dy = Math.max(0, e.clientY - (s._sy || 0));
    s.style.transform = 'translateY(' + dy + 'px)';
    s.style.transition = 'none';
  } : undefined,
  onPointerUp: closeFn ? e => {
    const s = e.currentTarget.parentNode;
    if (!s._dragging) return;
    s._dragging = false;
    const dy = Math.max(0, e.clientY - (s._sy || 0));
    if (dy > 80) {
      s.style.transform = 'translateY(100vh)';
      s.style.transition = 'transform 0.22s ease-in';
      const bd = s.previousElementSibling;
      if (bd) { bd.style.opacity = '0'; bd.style.transition = 'opacity 0.22s'; }
      // Use raw dismiss fn to skip closeWithAnim — CSS animations override inline styles
      // so calling closeWithAnim would snap the sheet back with its slideDown keyframe
      setTimeout(swipeDismissFn || closeFn, 210);
    } else {
      s.style.transform = 'translateY(0)';
      s.style.transition = 'transform 0.18s ease';
      setTimeout(() => { s.style.transform = ''; s.style.transition = ''; }, 200);
    }
  } : undefined,
  onPointerCancel: closeFn ? e => {
    const s = e.currentTarget.parentNode;
    s._dragging = false;
    s.style.transform = 'translateY(0)';
    s.style.transition = 'transform 0.18s ease';
    setTimeout(() => { s.style.transform = ''; s.style.transition = ''; }, 200);
  } : undefined
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 40,
    height: 4,
    borderRadius: 2,
    background: C.border
  }
}));

// ─── Divider ───────────────────────────────────────────────────────────────────
// 1px C.border rule. No margin — surrounding elements own their spacing.
// Use everywhere: between sheet sections, under cooking-for, etc.
const Divider = () => /*#__PURE__*/React.createElement("div", {
  style: {
    height: 1,
    background: C.border,
    flexShrink: 0
  }
});

// ─── scaleQty ──────────────────────────────────────────────────────────────────
// Scales a quantity string by factor. Only touches raw SI amounts (g/ml/kg/l) and
// plain counts. Purchase units (bottle, bag, jar, pack, drum…) are left unchanged.
const scaleQty = (q, factor) => {
  if (!q || Math.abs(factor - 1) < 0.05) return q;
  // buildShoppingList appends an aggregation suffix " ×N" when an ingredient appears in
  // N meals (e.g. "30g ×3"). Strip it, scale the base amount, then re-attach it unchanged —
  // the N is a meal count, not part of the quantity, so it must never scale or be dropped.
  const agg = q.match(/^(.*?)(\s*×\d+)$/);
  const base = agg ? agg[1] : q;
  const tail = agg ? agg[2] : '';
  let out;
  // "N × size" packs/tins (e.g. "2 × 400g tins") — scale the pack count, keep the size.
  const mult = base.match(/^([\d.]+)\s*×\s*(.+)$/);
  // Weight/volume — preserve any trailing words ("400g tin", "330ml can").
  const si = base.match(/^([\d.]+)\s*(g|ml|kg|l)\b(.*)$/i);
  // Plain integer count: "4", "1".
  const cnt = base.match(/^(\d+)$/);
  // Number + any other unit: "2 tbsp", "4 sprigs", "1, diced".
  const gen = base.match(/^([\d.]+)(\s*\S.*)$/);
  if (/\//.test(base)) {
    out = base; // leftover "/"-compound (shouldn't remain after the data split)
  } else if (mult) {
    out = Math.max(1, Math.round(parseFloat(mult[1]) * factor)) + ' × ' + mult[2];
  } else if (si) {
    const num = parseFloat(si[1]);
    const unit = si[2].toLowerCase();
    const scaled = (unit === 'kg' || unit === 'l')
      ? Math.round(num * factor * 10) / 10 // 1 decimal for kg/l
      : Math.max(5, Math.round(num * factor / 5) * 5); // nearest 5g/5ml
    out = "".concat(scaled).concat(unit).concat(si[3]);
  } else if (cnt) {
    out = String(Math.max(1, Math.round(parseFloat(cnt[1]) * factor)));
  } else if (gen) {
    const num = parseFloat(gen[1]);
    const rest = gen[2];
    const scaled = (/\b(tsp|tbsp)\b/i.test(rest))
      ? Math.max(0.5, Math.round(num * factor * 2) / 2) // ½-spoon steps
      : Math.max(1, Math.round(num * factor)); // whole units (sprigs, cloves, cans…)
    out = String(scaled) + rest;
  } else {
    out = base; // qualitative ("to garnish", "small bunch") or unknown — unchanged
  }
  return out + tail;
};

// ─── ItemRow ───────────────────────────────────────────────────────────────────
// Module-level so React doesn't unmount/remount on every parent render (prevents scroll-reset).
// Props: item {n, q, price?}, excluded map, portScale number, onToggle(name) fn.
// Logic: excluded=false → clean (in cart);  excluded=true → gray + strikethrough + ✕ (removed)
const ItemRow = ({
  item,
  excluded,
  portScale,
  onToggle
}) => {
  const isExcl = !!excluded[item.n];
  const factor = Math.max(portScale / 2, 0.5);
  const scaledPrice = item.price ? (item.price * factor).toFixed(2) : null;
  const displayQty = scaleQty(item.q, factor); // live-scales g/ml/counts; leaves units unchanged
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onToggle(item.n),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 4,
      border: "1.5px solid ".concat(isExcl ? C.textHint : C.border),
      background: isExcl ? C.bgEl : 'transparent',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s'
    }
  }, isExcl && /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.textHint,
      fontSize: 10,
      fontWeight: 800,
      lineHeight: 1
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      flex: 1,
      minWidth: 0,
      color: isExcl ? C.textHint : C.text,
      textDecoration: isExcl ? 'line-through' : 'none',
      transition: 'color 0.15s'
    }
  }, item.n), (displayQty || scaledPrice) && /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 1
    }
  }, displayQty && /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.hint,
      color: C.textSec,
      whiteSpace: 'nowrap',
      transition: 'color 0.15s'
    }
  }, displayQty), scaledPrice && /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.meta,
      color: C.textHint,
      whiteSpace: 'nowrap',
      transition: 'color 0.15s'
    }
  }, "\u20AC", scaledPrice)));
};

// ─── Main App ──────────────────────────────────────────────────────────────────
function AllSortedPrototype() {
  // Navigation
  const [screen, setScreen] = useState('splash');
  const screenStack = useRef([]);

  // Global
  const [isPremium, setIsPremium] = useState(false);
  const [selectedDiet, setDiet] = useState('balanced');
  const [allergens, setAllergens] = useState([]);
  const [pendingDiet, setPendingDiet] = useState('balanced');
  const [pendingAllergens, setPendingAllergens] = useState([]);
  const [gdpr, setGdpr] = useState(false);

  // Plan
  const [planVersion, setPlanVersion] = useState('A');
  const [activePlan, setActivePlan] = useState(PLAN_A);
  const [mealOrder, setOrder] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [dayOn, setDayOn] = useState(Array(7).fill(true));
  const [swapPos, setSwapPos] = useState(Array(7).fill(0));
  const [regenUsed, setRegenUsed] = useState(0);
  const [dragSrcIdx, setDragSrcIdx] = useState(null); // origin slot — fixed for the whole gesture
  const [dragDeltaY, setDragDeltaY] = useState(0);    // pixel offset following the finger
  const dragStartY = useRef(0);
  const dragSrcIdxRef = useRef(null);  // mirrors dragSrcIdx for native handlers
  const dragDeltaYRef = useRef(0);     // mirrors dragDeltaY for use in onEnd
  const dragCardH = useRef(96);        // measured card slot height (set on drag start)
  const planCardsRef = useRef(null);
  const [shakeIdx, setShakeIdx] = useState(null);
  const [landingIdx, setLandingIdx] = useState(null); // slot that plays the "settle" animation after drop
  const landingTimerRef = useRef(null);               // clears landingIdx after animation completes
  const landingOffsetRef = useRef(0);                 // how far from dest's natural position the user released
  const swipeStartRef = useRef(null);
  const pendingDragRef = useRef(null); // handle touch waiting for direction: {idx, startX, startY}
  const swapPosRef = useRef(swapPos);
  useEffect(() => { swapPosRef.current = swapPos; }, [swapPos]);
  const [closingSheet, setClosingSheet] = useState(null);
  const [sheetAnimDone, setSheetAnimDone] = useState({});
  const markAnimDone = (name) => setTimeout(() => setSheetAnimDone(p => ({...p, [name]: true})), 350);
  const closeWithAnim = (name, fn) => {
    setClosingSheet(name);
    setTimeout(() => { fn(); setClosingSheet(null); setSheetAnimDone(p => ({...p, [name]: false})); }, 280);
  };
  const [savedSet, setSavedSet] = useState(new Set([0, 2, 7]));
  const [dislikedSet, setDislikedSet] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('as_disliked') || '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => { localStorage.setItem('as_disliked', JSON.stringify([...dislikedSet])); }, [dislikedSet]);
  // No-repeat memory (mirrors production #213): only the 7 PRIMARY meals of a fresh
  // weekly plan are remembered — swap alts are never logged. Stored as a queue of
  // generations so the window rolls forward each fresh week / new plan.
  const RECENT_MEMORY_GENERATIONS = 3; // remember the last 3 fresh-week plans (~21 of 60 recipes)
  const [recentPrimaries, setRecentPrimaries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('as_recent_primaries') || '[]'); }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem('as_recent_primaries', JSON.stringify(recentPrimaries)); }, [recentPrimaries]);
  const recentPrimarySet = useMemo(() => new Set(recentPrimaries.flat()), [recentPrimaries]);
  const recordPrimaryGeneration = (ids) => {
    setRecentPrimaries(prev => [...prev, ids].slice(-RECENT_MEMORY_GENERATIONS));
  };
  const [weekStartDay, setWeekStartDay] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [isFrozen, setIsFrozen] = useState(false);
  const isFrozenRef = useRef(false);
  useEffect(() => { isFrozenRef.current = isFrozen; }, [isFrozen]);
  // Cascade: stagger the plan cards in once after a (re)generate. Cleared shortly
  // after so it doesn't replay on drag/swap re-renders or plain returns to plan.
  const [cascade, setCascade] = useState(false);
  useEffect(() => { if (cascade) { const t = setTimeout(() => setCascade(false), 1000); return () => clearTimeout(t); } }, [cascade]);

  // Portions (L/M/S model)
  const [cookFor, setCookFor] = useState(2);
  const [seatSizes, setSeatSizes] = useState(['M', 'M']);
  const [pendingSeatSizes, setPendingSeatSizes] = useState(['M', 'M']);

  // Shopping
  const [excluded, setExcluded] = useState(() => Object.fromEntries(STAPLES.map(s => [s.n, true])));
  const [store, setStore] = useState(null);
  const [storePick, setStorePick] = useState(null);
  const [pendingStore, setPendingStore] = useState(null);
  const [fillUsed, setFillUsed] = useState(0);

  // Injection animation
  const [injectPct, setInjectPct] = useState(0);
  const [injectDone, setInjectDone] = useState(false);

  // Overlays
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // showReinjectionDialog removed — replaced by showFillConfirm
  const [showWebViewExit, setShowWebViewExit] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [recipeTab, setRecipeTab] = useState('ingredients');
  const [macroP, setMacroP] = useState(0); // 0→1 progress for the synced macro reveal (grams + % + bar + kcal). #229
  const macroAnimRef = React.useRef(false);
  const [showStore, setShowStore] = useState(false);
  const [showPortions, setShowPortions] = useState(false);
  const [showNewWeek, setShowNewWeek] = useState(false);
  const [showNewWeekDialog, setShowNewWeekDialog] = useState(false);
  const [weekCompleteMode, setWeekCompleteMode] = useState('celebration'); // 'celebration' | 'stale-early' | 'stale-late'
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [dpMode, setDpMode] = useState('copy');
  const [copySource, setCopySource] = useState(null);
  const [showSubs, setShowSubs] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showInsightSheet, setShowInsightSheet] = useState(false);
  const [historyWeek, setHistoryWeek] = useState(null);
  const [historyInsightWeek, setHistoryInsightWeek] = useState(null);
  const [cartFilled, setCartFilled] = useState(false);
  const [showFillConfirm, setShowFillConfirm] = useState(false);
  const [showNextWeekDialog, setShowNextWeekDialog] = useState(false);
  const [showReuseConfirm, setShowReuseConfirm] = useState(false);
  const [showFreshConfirm, setShowFreshConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [aiText, setAiText] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Saved screen filters
  const [savedCuisines, setSavedCuisines] = useState([]);
  const [savedTime, setSavedTime] = useState('any');
  // Pending filter state (used inside filter sheet before Apply is tapped)
  const [pendingCuisines, setPendingCuisines] = useState([]);
  const [pendingTime, setPendingTime] = useState('any');

  // Derived
  const maxSwaps = isPremium ? 5 : 2;
  const maxRegens = isPremium ? 3 : 1;
  const regenLeft = maxRegens - regenUsed;
  const maxFills = isPremium ? 4 : 1;
  const totalPeople = cookFor;
  // Live preview while sheet open — uses pending sizes; committed sizes otherwise
  const activeSizes = showPortions ? pendingSeatSizes : seatSizes;
  const portScale = activeSizes.reduce((a, s) => a + (s === 'L' ? 1.30 : s === 'S' ? 0.75 : 1.00), 0);
  const go = (s, opts = {}) => {
    if (!opts.back && s !== 'historydetail' && screen !== 'historydetail') screenStack.current = [...screenStack.current, screen];
    setScreen(s);
    setShowRecipe(false);
    setShowStore(false);
    setShowNewWeek(false);
    setShowDayPicker(false);
    setShowSubs(false);
    setShowFillConfirm(false);
    setShowNextWeekDialog(false);
    setShowReuseConfirm(false);
    setShowFreshConfirm(false);
    setRecipeTab('ingredients');
    if (!opts.keepEditMode) setEditMode(false);
  };
  const goBack = () => {
    const stack = screenStack.current;
    const prev = stack.length > 0 ? stack[stack.length - 1] : 'plan';
    screenStack.current = stack.slice(0, -1);
    go(prev, { back: true });
  };
  const goEdit = s => {
    screenStack.current = [...screenStack.current, screen];
    setScreen(s);
    setEditMode(true);
    // Initialise pending state so edits don't affect live values unless saved
    setPendingDiet(selectedDiet);
    setPendingAllergens([...allergens]);
  };
  // Precompute swap alts once per plan/diet/disliked change — NOT per render.
  // Algorithm mirrors production (#129, #213): one shared pool, cross-day uniqueness as strong
  // preference, max 1 of any cuisine per carousel so every swipe feels genuinely different.
  const swapAltsMap = useMemo(() => {
    const planIds = new Set(activePlan.map(m => m.id));
    const shuffleFn = arr => [...arr].sort(() => Math.random() - 0.5);

    // Single shared pool — excludes all primary meals, diet conflicts, allergens, disliked.
    const basePool = shuffleFn(ALL_RECIPES.filter(r =>
      !planIds.has(r.id) &&
      !(r.incompatible || []).includes(selectedDiet) &&
      !(r.allergens || []).some(a => allergens.includes(a)) &&
      !dislikedSet.has(r.id)
    ));

    const allocatedIds = new Set(); // cross-day uniqueness tracking
    const map = {};

    activePlan.forEach(meal => {
      const alts = [];
      const cuisineInCarousel = {}; // max 1 of any cuisine among alts

      // Pass 1: prefer unallocated recipes; max 1 of any cuisine per carousel.
      for (const r of basePool) {
        if (alts.length >= maxSwaps) break;
        if (allocatedIds.has(r.id)) continue;
        if ((cuisineInCarousel[r.cuisine] || 0) >= 1) continue;
        alts.push(r);
        cuisineInCarousel[r.cuisine] = (cuisineInCarousel[r.cuisine] || 0) + 1;
      }

      // Pass 2: graceful fallback — allow already-allocated if pool is tight.
      if (alts.length < maxSwaps) {
        const altIds = new Set(alts.map(r => r.id));
        for (const r of basePool) {
          if (alts.length >= maxSwaps) break;
          if (altIds.has(r.id)) continue;
          if ((cuisineInCarousel[r.cuisine] || 0) >= 1) continue;
          alts.push(r);
          cuisineInCarousel[r.cuisine] = (cuisineInCarousel[r.cuisine] || 0) + 1;
        }
      }

      alts.forEach(r => allocatedIds.add(r.id));
      map[meal.id] = alts;
    });

    return map;
  }, [activePlan, dislikedSet, selectedDiet, allergens, maxSwaps]);

  const getMealAtDay = i => {
    const base = activePlan[mealOrder[i]];
    if (!base) return FALLBACK_MEAL;
    if (swapPos[i] > 0) {
      const alts = swapAltsMap[base.id] || [];
      if (alts[swapPos[i] - 1]) return alts[swapPos[i] - 1];
    }
    return base;
  };

  // Auto-advance
  useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => go('onboarding1', { back: true }), 2200);
      return () => clearTimeout(t);
    }
    if (screen === 'generating') {
      const t = setTimeout(() => {
        setIsFrozen(false);
        setCartFilled(false);
        setCascade(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        go('plan');
      }, 2800);
      return () => clearTimeout(t);
    }
    if (screen === 'injecting') {
      setInjectPct(0);
      setInjectDone(false);
      const t = setInterval(() => {
        setInjectPct(p => {
          if (p >= 100) {
            clearInterval(t);
            setInjectDone(true);
            return 100;
          }
          return Math.min(p + 7, 100);
        });
      }, 180);
      return () => clearInterval(t);
    }
  }, [screen]);

  // Close all overlays on any screen change
  useEffect(() => {
    setShowRecipe(false);
    setShowStore(false);
    setShowPortions(false);
    setShowNewWeek(false);
    setShowDayPicker(false);
    setShowSubs(false);
    setShowMissing(false);
    setShowShareSheet(false);
    setShowNewWeekDialog(false);
    setShowSavedFilters(false);
    setShowRegenConfirm(false);
    setShowLogoutDialog(false);
    setShowDeleteDialog(false);
    setShowFillConfirm(false);
    setShowWebViewExit(false);
    if (screen !== 'historydetail') setHistoryWeek(null);
  }, [screen]);

  // Sheet animation phase tracking
  const trackSheetOpen = (name, isOpen) => {
    if (isOpen) { setSheetAnimDone(p => ({...p, [name]: false})); markAnimDone(name); }
    else { setSheetAnimDone(p => ({...p, [name]: false})); }
  };
  useEffect(() => { trackSheetOpen('savedfilters', showSavedFilters); }, [showSavedFilters]);
  useEffect(() => { trackSheetOpen('recipe', showRecipe && !!activeRecipe); }, [showRecipe, activeRecipe]);
  // Macro reveal: grams, %, bar fill and kcal all count up 0→value in sync, once per sheet-open on first Macros view.
  // No re-trigger when toggling tabs inside one open sheet; re-arms on every fresh open. Reduced-motion → instant. #229
  useEffect(() => { macroAnimRef.current = false; setMacroP(0); }, [activeRecipe, showRecipe]);
  useEffect(() => {
    if (!(showRecipe && recipeTab === 'macros')) return;
    if (macroAnimRef.current) { setMacroP(1); return; }
    macroAnimRef.current = true;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setMacroP(1); return; }
    let raf, start = null;
    const step = t => { if (start === null) start = t; const e = Math.min((t - start) / 850, 1); setMacroP(1 - Math.pow(1 - e, 4)); if (e < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [showRecipe, recipeTab]);
  useEffect(() => { trackSheetOpen('store', showStore); }, [showStore]);
  useEffect(() => { trackSheetOpen('portions', showPortions); }, [showPortions]);
  useEffect(() => { trackSheetOpen('newweek', showNewWeek); }, [showNewWeek]);
  useEffect(() => { trackSheetOpen('insight', showInsightSheet || !!historyInsightWeek); }, [showInsightSheet, historyInsightWeek]);
  useEffect(() => { trackSheetOpen('daypicker', showDayPicker); }, [showDayPicker]);
  useEffect(() => { trackSheetOpen('subs', showSubs); }, [showSubs]);
  useEffect(() => { trackSheetOpen('missing', showMissing); }, [showMissing]);
  useEffect(() => { trackSheetOpen('share', showShareSheet); }, [showShareSheet]);

  // Auto-advance from injecting → cartready once done
  useEffect(() => {
    if (injectDone && screen === 'injecting') {
      const t = setTimeout(() => go('cartready', { back: true }), 600);
      return () => clearTimeout(t);
    }
  }, [injectDone]);

  // Auto-advance from webview → weekcomplete (simulates URL confirmation detection)
  // Only fires during a real purchase flow (cartFilled=true); review visits post-purchase are left alone
  useEffect(() => {
    if (screen === 'webview' && cartFilled) {
      const t = setTimeout(() => {
        setWeekCompleteMode('celebration');
        setCartFilled(false);
        screenStack.current = [];
        go('weekcomplete', { back: true });
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [screen, cartFilled]);

  // All plan card touch interactions — native listeners to allow preventDefault
  // Dep is [screen] not [planCardsRef.current]: refs are null at render time (read before commit),
  // so planCardsRef.current would always be null in the dep comparison.
  useEffect(() => {
    const container = planCardsRef.current;
    if (!container) return;
    const getCardH = () => container.getBoundingClientRect().height / 7;

    const startDrag = (idx, clientY) => {
      // Cancel any in-progress landing animation so a rapid new drag starts clean.
      if (landingTimerRef.current) { clearTimeout(landingTimerRef.current); landingTimerRef.current = null; }
      setLandingIdx(null);
      // Measure actual card slot height (card height + gap) from first card
      const firstCard = container.querySelector('[data-card-idx="0"]');
      dragCardH.current = firstCard ? firstCard.getBoundingClientRect().height + 8 : container.getBoundingClientRect().height / 7;
      dragSrcIdxRef.current = idx;
      dragStartY.current = clientY;
      dragDeltaYRef.current = 0;
      setDragSrcIdx(idx);
      setDragDeltaY(0);
    };

    const moveDrag = (clientY) => {
      if (dragSrcIdxRef.current === null) return;
      const dy = clientY - dragStartY.current;
      dragDeltaYRef.current = dy;
      setDragDeltaY(dy);
    };

    const endDrag = () => {
      const src = dragSrcIdxRef.current;
      if (src === null) return;
      const capturedDy = dragDeltaYRef.current; // capture before refs are cleared
      const h = dragCardH.current;
      const dest = Math.max(0, Math.min(6, src + Math.round(capturedDy / h)));
      dragSrcIdxRef.current = null;
      dragDeltaYRef.current = 0;
      // How far from dest's natural position the finger was at release.
      // WAAPI will animate the dest card from this offset to 0, giving a smooth "settle"
      // that starts from where the user actually dropped rather than from the shifted position.
      landingOffsetRef.current = capturedDy - (dest - src) * h;
      if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
      setLandingIdx(dest);
      landingTimerRef.current = setTimeout(() => { setLandingIdx(null); landingTimerRef.current = null; }, 250);
      setDragSrcIdx(null);
      setDragDeltaY(0);
      if (dest !== src) {
        const reorder = (arr) => { const n=[...arr]; const [item]=n.splice(src,1); n.splice(dest,0,item); return n; };
        setOrder(reorder); setDayOn(reorder); setSwapPos(reorder);
      }
    };

    const onStart = (e) => {
      const card = e.target.closest('[data-card-idx]');
      if (!card) return;
      const idx = parseInt(card.dataset.cardIdx);
      const cx = e.touches[0].clientX;
      const cy = e.touches[0].clientY;
      const handle = e.target.closest('[data-drag-handle]');
      if (handle) {
        e.preventDefault();
        // Don't commit to drag yet — first touchmove determines direction
        pendingDragRef.current = { idx, startX: cx, startY: cy };
      }
      // Always set swipeStartRef so horizontal handle-swipes also work
      swipeStartRef.current = { x: cx, y: cy, idx };
    };

    const onMove = (e) => {
      // Pending drag: handle was touched but direction not yet committed
      if (pendingDragRef.current) {
        const { idx, startX, startY } = pendingDragRef.current;
        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);
        if (dy > dx && dy > 6) {
          // Vertical → commit to drag.
          // Use current finger position (not startY) as origin so delta starts at 0 — no jump.
          pendingDragRef.current = null;
          swipeStartRef.current = null;
          e.preventDefault();
          startDrag(idx, e.touches[0].clientY);
        } else if (dx > dy && dx > 6) {
          // Horizontal → let it become a swipe (swipeStartRef already set)
          pendingDragRef.current = null;
        } else {
          e.preventDefault(); // prevent scroll while undecided
        }
        return;
      }
      if (dragSrcIdxRef.current === null) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientY);
    };

    const onEnd = (e) => {
      pendingDragRef.current = null; // resolve any uncommitted handle touch
      const wasDragging = dragSrcIdxRef.current !== null;
      endDrag();
      if (wasDragging) return; // don't process as swipe
      if (!swipeStartRef.current) return;
      if (isFrozenRef.current) return; // no swaps in frozen mode
      const { x, y, idx } = swipeStartRef.current;
      swipeStartRef.current = null;
      const dx = e.changedTouches[0].clientX - x;
      const dy = e.changedTouches[0].clientY - y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const card = container.querySelector('[data-card-idx="' + idx + '"]');
        if (!card || card.dataset.hasSwaps !== 'true') return;
        if (!dayOn[idx]) return;
        if (dx < 0) swapNext(idx);
        else swapPrev(idx);
      }
    };

    // Mouse fallbacks for desktop browsers (no touch surface, so the touch
    // handlers above never fire there). Mirrors onStart/onMove/onEnd in full —
    // both the handle drag-to-reorder AND the horizontal swipe-to-swap —
    // using mouse coordinates directly (no .touches[] wrapper needed).
    const onMouseStart = (e) => {
      const card = e.target.closest('[data-card-idx]');
      if (!card) return;
      const idx = parseInt(card.dataset.cardIdx);
      const handle = e.target.closest('[data-drag-handle]');
      if (handle) {
        e.preventDefault();
        pendingDragRef.current = { idx, startX: e.clientX, startY: e.clientY };
      }
      swipeStartRef.current = { x: e.clientX, y: e.clientY, idx };
    };
    const onMouseMove = (e) => {
      if (pendingDragRef.current) {
        const { idx, startX, startY } = pendingDragRef.current;
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        if (dy > dx && dy > 6) {
          pendingDragRef.current = null;
          swipeStartRef.current = null;
          startDrag(idx, e.clientY);
        } else if (dx > dy && dx > 6) {
          pendingDragRef.current = null;
        }
        return;
      }
      if (dragSrcIdxRef.current !== null) moveDrag(e.clientY);
    };
    const onMouseEnd = (e) => {
      pendingDragRef.current = null;
      const wasDragging = dragSrcIdxRef.current !== null;
      endDrag();
      if (wasDragging) return;
      if (!swipeStartRef.current) return;
      if (isFrozenRef.current) return;
      const { x, y, idx } = swipeStartRef.current;
      swipeStartRef.current = null;
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const card = container.querySelector('[data-card-idx="' + idx + '"]');
        if (!card || card.dataset.hasSwaps !== 'true') return;
        if (!dayOn[idx]) return;
        if (dx < 0) swapNext(idx);
        else swapPrev(idx);
      }
    };

    container.addEventListener('touchstart', onStart, { passive: false });
    container.addEventListener('touchmove', onMove, { passive: false });
    container.addEventListener('touchend', onEnd);
    container.addEventListener('mousedown', onMouseStart);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseEnd);
    return () => {
      container.removeEventListener('touchstart', onStart);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onEnd);
      container.removeEventListener('mousedown', onMouseStart);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseEnd);
    };
  // screen as dep: planCardsRef.current is null at render-time (before commit sets it),
  // so using it as dep means the effect never re-runs. screen changes trigger re-render
  // after which refs are committed, so planCardsRef.current is set when effect runs.
  }, [screen, isPremium, dayOn]);

  // Landing animation — runs after React commits the post-drop state (all cards at transform:0, transition:none).
  // WAAPI animates the dest card from where the user released (landingOffsetRef) to 0, starting with
  // the dragged-card scale (1.02) so the settle looks like the card coming to rest from your finger.
  useLayoutEffect(() => {
    if (landingIdx === null) return;
    const container = planCardsRef.current;
    if (!container) return;
    const destCard = container.querySelector('[data-card-idx="' + landingIdx + '"]');
    if (!destCard) return;
    const offset = landingOffsetRef.current;
    destCard.animate(
      [
        { transform: 'translateY(' + offset + 'px) scale(1.02)' },
        { transform: 'translateY(0) scale(1)' }
      ],
      { duration: 200, easing: 'ease-out', fill: 'none' }
    );
  }, [landingIdx]);

  const regenCore = (resetDays) => {
    if (!resetDays) {
      // Mid-week regen: keep meals where swapPos=0 (implicit approvals), up to 4
      const approvedMeals = mealOrder
        .filter((_, i) => swapPos[i] === 0)
        .map(mealIdx => activePlan[mealIdx])
        .slice(0, 4);
      const approvedIds = new Set(approvedMeals.map(m => m.id));
      const pool = ALL_RECIPES.filter(r =>
        !approvedIds.has(r.id) &&
        !(r.incompatible || []).includes(selectedDiet) &&
        !(r.allergens || []).some(a => allergens.includes(a)) &&
        !dislikedSet.has(r.id)
      );
      const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
      const newPlan = [...approvedMeals];
      const cuisineCounts = {};
      approvedMeals.forEach(m => { cuisineCounts[m.cuisine] = (cuisineCounts[m.cuisine] || 0) + 1; });
      for (const r of shuffledPool) {
        if (newPlan.length >= 7) break;
        const c = cuisineCounts[r.cuisine] || 0;
        if (c < 2) { newPlan.push(r); cuisineCounts[r.cuisine] = c + 1; }
      }
      const usedIds = new Set(newPlan.map(r => r.id));
      for (const r of shuffledPool) {
        if (newPlan.length >= 7) break;
        if (!usedIds.has(r.id)) { newPlan.push(r); usedIds.add(r.id); }
      }
      const finalPlan = newPlan.slice(0, 7);
      setActivePlan(finalPlan);
      setOrder([0, 1, 2, 3, 4, 5, 6]);
      setSwapPos(Array(7).fill(0));
      setRegenUsed(r => r + 1);
      const initExclMid = {};
      STAPLES.forEach(s => { initExclMid[s.n] = true; });
      setExcluded(initExclMid);
      setShowNewWeek(false);
      setShowRegenConfirm(false);
      go('generating');
    } else {
    const nextSeed = planVersion === 'A' ? 1 : 0;
    const freshPlan = buildPlanForUser(selectedDiet, allergens, nextSeed, dislikedSet, recentPrimarySet);
    recordPrimaryGeneration(freshPlan.map(r => r.id));
    setActivePlan(freshPlan);
    setPlanVersion(v => v === 'A' ? 'B' : 'A');
    setOrder([0, 1, 2, 3, 4, 5, 6]);
    setSwapPos(Array(7).fill(0));
    setDayOn(Array(7).fill(true));
    setRegenUsed(r => r + 1);
    const initExcl = {};
    STAPLES.forEach(s => {
      initExcl[s.n] = true;
    });
    setExcluded(initExcl);
    setShowNewWeek(false);
    setShowRegenConfirm(false);
    go('generating');
    }
  };
  const regen = () => regenCore(false);
  const regenFreshWeek = () => regenCore(true);
  const toggleDay = i => setDayOn(p => {
    const n = [...p];
    n[i] = !n[i];
    return n;
  });
  // Bounds check is inside the updater so it always reads fresh state (no stale closure issue)
  const swapNext = i => setSwapPos(p => {
    const n = [...p];
    n[i] = p[i] >= maxSwaps ? 0 : p[i] + 1;
    return n;
  });
  const swapPrev = i => setSwapPos(p => {
    const n = [...p];
    n[i] = p[i] <= 0 ? maxSwaps : p[i] - 1;
    return n;
  });
  const toggleDisliked = id => setDislikedSet(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSaved = id => setSavedSet(p => {
    const n = new Set(p);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleAllergen = id => setAllergens(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // All shopping items + any staples the user has tapped to include
  const totalEstimate = [...Object.values(buildShoppingList(mealOrder.map((_, k) => getMealAtDay(k)), dayOn)).flat(), ...STAPLES].filter(item => !excluded[item.n]).reduce((sum, item) => sum + item.price * Math.max(portScale / 2, 0.5), 0);

  // ─── Delivery day date helpers ─────────────────────────────────────────────
  const cardDate = i => {
    const d = new Date(weekStartDay);
    d.setDate(d.getDate() + i);
    return d;
  };
  const cardLabel = i => {
    const d = cardDate(i);
    return "".concat(DAY_SHORT[d.getDay()].toUpperCase(), " ").concat(d.getDate());
  };
  const monthBadge = () => {
    const s = weekStartDay.getMonth(),
      e = cardDate(6).getMonth();
    return s === e ? MONTH_SHORT[s] : "".concat(MONTH_SHORT[s], " \xB7 ").concat(MONTH_SHORT[e]);
  };
  const weekRange = () => {
    const s = weekStartDay,
      e = cardDate(6);
    return s.getMonth() === e.getMonth() ? "Week of ".concat(s.getDate(), "\u2013").concat(e.getDate(), " ").concat(MONTH_SHORT[s.getMonth()]) : "Week of ".concat(s.getDate(), " ").concat(MONTH_SHORT[s.getMonth()], " \u2013 ").concat(e.getDate(), " ").concat(MONTH_SHORT[e.getMonth()]);
  };

  // History date range helper (takes a delivery date, returns "12–18 May" format)
  const pastWeekRange = delivery => {
    const end = new Date(delivery);
    end.setDate(end.getDate() + 6);
    return delivery.getMonth() === end.getMonth() ? "".concat(delivery.getDate(), "\u2013").concat(end.getDate(), " ").concat(MONTH_SHORT[end.getMonth()]) : "".concat(delivery.getDate(), " ").concat(MONTH_SHORT[delivery.getMonth()], " \u2013 ").concat(end.getDate(), " ").concat(MONTH_SHORT[end.getMonth()]);
  };

  // ─── Shared components ───────────────────────────────────────────────────────

  const Btn = ({
    label,
    onPress,
    active = true,
    ghost = false,
    danger = false,
    small = false
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: active ? onPress : undefined,
    disabled: !active,
    style: {
      background: ghost ? C.bgEl : danger ? C.error + '22' : active ? C.accent : C.bgEl,
      color: ghost ? C.textSec : danger ? C.error : active ? C.white : C.textHint,
      border: 'none',
      borderRadius: 999,
      padding: small ? '8px 16px' : '20px 20px',
      ...(small ? T.meta : T.bodyMed),
      ...(small ? {} : {
        fontSize: 16
      }),
      cursor: active ? 'pointer' : 'default',
      width: small ? 'auto' : '100%',
      opacity: active ? 1 : 0.4,
      transition: 'all 0.15s',
      textAlign: 'center'
    }
  }, label);
  const Toggle = ({
    on,
    onToggle,
    disabled
  }) => /*#__PURE__*/React.createElement("div", {
    onClick: disabled ? undefined : onToggle,
    style: {
      width: 36,
      height: 20,
      borderRadius: 10,
      background: disabled ? on ? C.accent + '66' : C.border : on ? C.accent : C.border,
      cursor: disabled ? 'default' : 'pointer',
      position: 'relative',
      transition: 'background 0.2s',
      flexShrink: 0,
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 18 : 2,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: C.white,
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
    }
  }));
  // Shared meal-card body (flex row: rail · photo · content · right column).
  // One source of truth for the live plan, the frozen plan, and the Past Weeks history detail.
  const MealCardBody = ({ meal, label, ordinal, isFrozen, isOff, idx, isDragging, hasConflict, onOpen, share }) => {
    const cc = CUISINE_COLOR[meal.cuisine] || C.textSec;
    const tc = meal.time ? timeColor(meal.time) : C.textSec;
    const badge = (lbl, color, truncate) => /*#__PURE__*/React.createElement("span", {
      style: { background: color + '28', color, borderRadius: 4, padding: '0 6px', height: 18, display: 'inline-block', lineHeight: '18px', fontSize: 10, fontWeight: 600, letterSpacing: 0.2, flexShrink: truncate ? 1 : 0, minWidth: truncate ? 0 : undefined, overflow: truncate ? 'hidden' : undefined, textOverflow: truncate ? 'ellipsis' : undefined, whiteSpace: truncate ? 'nowrap' : undefined }
    }, lbl);
    return /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', alignItems: 'center', padding: '8px 8px 8px 4px', gap: 7, flex: 1 }
    }, share ? null : isFrozen
      ? /*#__PURE__*/React.createElement("div", { style: { fontSize: ordinal === '×' ? 36 : 32, fontWeight: 700, color: isOff ? C.textHint : C.textSec, flexShrink: 0, lineHeight: 1, alignSelf: 'center', width: 26, textAlign: 'center', userSelect: 'none' } }, ordinal)
      : /*#__PURE__*/React.createElement("div", { 'data-drag-handle': 'true', style: { color: isDragging ? C.accent : C.textSec, fontSize: 22, cursor: 'grab', flexShrink: 0, userSelect: 'none', lineHeight: 1, alignSelf: 'center', touchAction: 'none', width: 26, minHeight: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, "≡"),
    /*#__PURE__*/React.createElement("div", {
      onClick: isOff ? undefined : onOpen,
      style: { alignSelf: 'stretch', aspectRatio: '1', borderRadius: 8, background: C.bgEl, overflow: 'hidden', position: 'relative', flexShrink: 0, cursor: isOff ? 'default' : 'pointer' }
    }, /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, opacity: isOff ? 0.4 : 1 } }, meal.emoji),
      meal.photo && /*#__PURE__*/React.createElement("img", { src: meal.photo, alt: "", style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isOff ? 0.4 : 1 }, onError: e => { e.target.style.display = 'none'; } }),
      hasConflict && /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', top: 2, left: 2, width: 17, height: 17, borderRadius: '50%', background: '#EF5350', color: C.white, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.5)' } }, "!")),
    /*#__PURE__*/React.createElement("div", {
      onClick: isOff ? undefined : onOpen,
      style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'center', cursor: isOff ? 'default' : 'pointer' }
    }, /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' } },
      label && /*#__PURE__*/React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: isOff ? C.textHint : C.textSec, letterSpacing: 0.8, flexShrink: 0, whiteSpace: 'nowrap' } }, label),
      meal.time && badge(parseInt(meal.time) + ' min', tc),
      meal.cuisine && badge(meal.cuisine, cc, true)),
      /*#__PURE__*/React.createElement("div", { style: { ...T.bodyMed, color: isOff ? C.textSec : C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 } }, meal.name)),
    !share && /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, alignSelf: 'center' } },
      !isFrozen && /*#__PURE__*/React.createElement("button", {
        onClick: e => { e.stopPropagation(); if (!isOff) { setDpMode('copy'); setCopySource(idx); setShowDayPicker(true); } },
        style: { background: 'none', border: 'none', fontSize: 14, cursor: isOff ? 'default' : 'pointer', opacity: isOff ? 0.2 : 0.55, color: C.textSec, padding: 0, lineHeight: 1 }
      }, "📋"),
      /*#__PURE__*/React.createElement(Toggle, { on: !isOff, onToggle: isFrozen ? undefined : () => toggleDay(idx), disabled: isFrozen })));
  };
  const Stepper = ({
    label,
    value,
    onDec,
    onInc
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.label,
      color: C.textSec
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onDec,
    disabled: value <= 0,
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: value > 0 ? C.bgEl : C.border,
      border: "1px solid ".concat(C.border),
      color: value > 0 ? C.text : C.textHint,
      cursor: value > 0 ? 'pointer' : 'default',
      fontSize: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: C.text,
      minWidth: 20,
      textAlign: 'center'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    onClick: onInc,
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: C.bgEl,
      border: "1px solid ".concat(C.border),
      color: C.text,
      cursor: 'pointer',
      fontSize: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700
    }
  }, "+")));


  // Full macro bar for recipe sheet macros tab
  const MacroBar = ({
    label,
    value,
    color,
    max
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.textSec
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color
    }
  }, value, "g")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: C.bgEl,
      borderRadius: 3,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: "".concat(Math.min(value / max * 100, 100), "%"),
      background: color,
      borderRadius: 3
    }
  })));

  // ─── SCREENS ──────────────────────────────────────────────────────────────────

  // 1. Splash
  const Splash = () => /*#__PURE__*/React.createElement("div", {
    className: 'splash-root',
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280,
      height: 280,
      marginTop: -8
    },
    dangerouslySetInnerHTML: { __html: SPLASH_LOGO_SVG }
  }), /*#__PURE__*/React.createElement("div", {
    className: 'splash-tagline',
    style: {
      fontSize: 16,
      color: C.textHint,
      marginTop: -16
    }
  }, /*#__PURE__*/React.createElement("span", { style: { color: C.accent } }, "Plan"), " it. ", /*#__PURE__*/React.createElement("span", { style: { color: C.accent } }, "Shop"), " it. ", /*#__PURE__*/React.createElement("span", { style: { color: C.accent } }, "Cook"), " it."));

  // 2. Onboarding slides
  const Onboarding = ({
    slide: initialSlide
  }) => {
    const [slide, setSlide] = useState(initialSlide || 1);
    const goNext = () => slide < 3 ? setSlide(slide + 1) : go('auth');
    const goPrev = () => { if (slide > 1) setSlide(slide - 1); };
    const swipeRef = React.useRef(null);
    const onSwipeStart = x => { swipeRef.current = x; };
    const onSwipeEnd = x => {
      if (swipeRef.current === null) return;
      const dx = x - swipeRef.current;
      swipeRef.current = null;
      if (Math.abs(dx) > 40) dx < 0 ? goNext() : goPrev();
    };
    const data = [{
      emoji: '📅',
      title: 'Your week, planned.',
      body: "Tell us how you eat and what you avoid.\nWe'll plan 7 dinners around it.\nFresh every week."
    }, {
      emoji: '🛒',
      title: 'One tap to the trolley.',
      body: "Your list goes to Tesco, Dunnes, or SuperValu.\nPick a delivery day — we lock the plan in.\nNo typing. No forgetting."
    }, {
      emoji: '✨',
      title: 'Free to start.\nPowerful to grow.',
      body: 'One free cart fill included — no card required.\nPremium unlocks 4 fills a month.\nFull recipe library too.'
    }];
    return /*#__PURE__*/React.createElement("div", {
      className: 'onboard-enter',
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      },
      onTouchStart: e => onSwipeStart(e.touches[0].clientX),
      onTouchEnd: e => onSwipeEnd(e.changedTouches[0].clientX),
      onMouseDown: e => onSwipeStart(e.clientX),
      onMouseUp: e => onSwipeEnd(e.clientX)
    }, /*#__PURE__*/React.createElement(ScreenHeader, null), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        width: '300%',
        flexShrink: 0,
        transform: "translateX(-".concat((slide - 1) * (100 / 3), "%)"),
        transition: 'transform 0.3s ease'
      }
    }, data.map((d, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        width: '33.333%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: "0 ".concat(S.frame, "px")
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 82,
        marginBottom: 24,
        lineHeight: 1
      }
    }, d.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 26,
        fontWeight: 700,
        color: C.text,
        textAlign: 'center',
        marginBottom: 12,
        whiteSpace: 'pre-line',
        lineHeight: 1.25
      }
    }, d.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        color: C.textSec,
        textAlign: 'center',
        lineHeight: 1.8,
        whiteSpace: 'pre-line'
      }
    }, d.body))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        paddingBottom: 14
      }
    }, [1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: i === slide ? 22 : 7,
        height: 7,
        borderRadius: 4,
        background: i === slide ? C.accent : C.border,
        transition: 'width 0.3s'
      }
    }))), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: slide === 3 ? 'Get Started' : 'Next',
      onPress: goNext
    })));
  };

  // 3. Auth
  const Auth = () => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: "0 ".concat(S.frame, "px")
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 64,
      marginBottom: 20,
      lineHeight: 1
    }
  }, "\uD83C\uDF7D\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.heading,
      color: C.text,
      textAlign: 'center',
      marginBottom: 6
    }
  }, "Let's get you sorted."), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.body,
      color: C.textSec,
      textAlign: 'center',
      marginBottom: 36
    }
  }, "Plan it. Shop it. Cook it."), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go('pref1'),
    style: {
      background: '#000',
      border: '1px solid #333',
      color: C.white,
      borderRadius: 999,
      padding: '20px 20px',
      ...T.bodyMed,
      fontSize: 16,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\uD83C\uDF4E"), " Sign in with Apple"), /*#__PURE__*/React.createElement("button", {
    onClick: () => go('pref1'),
    style: {
      background: C.white,
      border: 'none',
      color: '#111',
      borderRadius: 999,
      padding: '20px 20px',
      ...T.bodyMed,
      fontSize: 16,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\uD83D\uDD35"), " Sign in with Google"))), /*#__PURE__*/React.createElement(ScreenFooter, {
    center: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.hint,
      fontSize: 14,
      color: C.textHint,
      textAlign: 'center',
      lineHeight: 1.5
    }
  }, "By signing in you agree to our ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.accent
    }
  }, "Terms of Service"), " and ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.accent
    }
  }, "Privacy Policy"))));

  // 4. Pref 1 — Diet type
  const Pref1 = () => {
    const diets = [{
      id: 'veg',
      label: 'Vegetarian',
      emoji: '🥗'
    }, {
      id: 'vegan',
      label: 'Vegan',
      emoji: '🌱'
    }, {
      id: 'protein',
      label: 'High Protein',
      emoji: '🥩'
    }, {
      id: 'lowcarb',
      label: 'Low Carb',
      emoji: '🥑'
    }, {
      id: 'gf',
      label: 'Gluten-Free',
      emoji: '🌾'
    }, {
      id: 'balanced',
      label: 'Balanced',
      emoji: '🍽️'
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      left: editMode ? /*#__PURE__*/React.createElement("button", {
        onClick: () => goBack(),
        style: {
          background: 'none',
          border: 'none',
          fontSize: 26,
          cursor: 'pointer',
          color: C.textSec,
          padding: '0 4px',
          lineHeight: 1
        }
      }, "\u2039") : null
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px ".concat(S.frame, "px 0"),
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.heading,
        color: C.text,
        marginBottom: 4
      }
    }, "What's your eating style?"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.textSec,
        marginBottom: 20
      }
    }, "We'll build every week around it."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }
    }, diets.map(d => /*#__PURE__*/React.createElement("div", {
      key: d.id,
      onClick: () => setPendingDiet(d.id),
      style: {
        height: 88,
        background: pendingDiet === d.id ? C.accent + '1F' : C.bgSec,
        border: "2px solid ".concat(pendingDiet === d.id ? C.accent : C.border),
        borderRadius: 14,
        padding: '0 10px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 24,
        lineHeight: 1
      }
    }, d.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        fontWeight: 600,
        color: pendingDiet === d.id ? C.accentSoft : C.text
      }
    }, d.label))))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(ScreenFooter, null, editMode ? /*#__PURE__*/React.createElement(Btn, {
      label: "Save",
      onPress: () => {
        setDiet(pendingDiet);
        goBack();
        showToast('Preferences saved');
      }
    }) : /*#__PURE__*/React.createElement(Btn, {
      label: "Next",
      onPress: () => go('pref2')
    })));
  };

  // 5. Pref 2 — Allergens + GDPR — static layout, no scroll
  const Pref2 = () => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    left: /*#__PURE__*/React.createElement("button", {
      onClick: () => goBack(),
      style: {
        background: 'none',
        border: 'none',
        fontSize: 26,
        cursor: 'pointer',
        color: C.textSec,
        padding: '0 4px',
        lineHeight: 1
      }
    }, "\u2039")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: "20px ".concat(S.frame, "px 0")
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.heading,
      color: C.text,
      marginBottom: 4
    }
  }, "Any foods to avoid?"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.body,
      color: C.textSec,
      marginBottom: 20
    }
  }, "We filter every recipe. Update anytime in Profile."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 5,
      marginBottom: 8
    }
  }, ALLERGENS.map(a => {
    const on = pendingAllergens.includes(a.id);
    return /*#__PURE__*/React.createElement("div", {
      key: a.id,
      onClick: () => setPendingAllergens(p => p.includes(a.id) ? p.filter(x => x !== a.id) : [...p, a.id]),
      style: {
        height: 60,
        background: on ? C.accent + '1F' : C.bgEl,
        border: "1.5px solid ".concat(on ? C.accent : C.border),
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        position: 'relative',
        transition: 'all 0.2s'
      }
    }, on && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 4,
        right: 5,
        color: C.accent,
        fontSize: 9,
        fontWeight: 700
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        lineHeight: 1
      }
    }, a.emoji), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        fontWeight: 600,
        color: on ? C.accentSoft : C.text,
        textAlign: 'center'
      }
    }, a.label));
  })), editMode ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.meta,
      color: C.textHint
    }
  }, "Your consent is saved. "), /*#__PURE__*/React.createElement("span", {
    onClick: () => {
      setAllergens([]);
      setGdpr(false);
      go('profile');
      showToast('Consent withdrawn');
    },
    style: {
      ...T.meta,
      color: C.error,
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  }, "Withdraw consent")) : /*#__PURE__*/React.createElement("div", {
    onClick: () => setGdpr(g => !g),
    style: {
      background: gdpr ? C.accent + '1F' : C.bgSec,
      border: "1.5px solid ".concat(gdpr ? C.accent : C.border),
      borderRadius: 10,
      padding: '11px 14px',
      cursor: 'pointer',
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 4,
      border: "2px solid ".concat(gdpr ? C.accent : C.border),
      background: gdpr ? C.accent : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1
    }
  }, gdpr && /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.white,
      fontSize: 10,
      fontWeight: 700
    }
  }, "\u2713")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.meta,
      color: C.textSec,
      lineHeight: 1.5
    }
  }, "I consent to AllSorted storing my intolerance data under GDPR Article 9 to personalise my meal plans. Stored in the EU. Withdraw anytime in Profile."))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  })), /*#__PURE__*/React.createElement(ScreenFooter, null, editMode ? /*#__PURE__*/React.createElement(Btn, {
    label: "Save",
    onPress: () => {
      setAllergens([...pendingAllergens]);
      goBack();
      showToast('Preferences saved');
    }
  }) : /*#__PURE__*/React.createElement(Btn, {
    label: "Start my first week",
    active: gdpr,
    onPress: () => {
      if (gdpr) {
        setAllergens([...pendingAllergens]);
        setDiet(pendingDiet);
        const firstPlan = buildPlanForUser(pendingDiet, pendingAllergens, planVersion === 'A' ? 0 : 1, new Set(), recentPrimarySet);
        recordPrimaryGeneration(firstPlan.map(r => r.id));
        setActivePlan(firstPlan);
        go('generating');
      }
    }
  })));

  // 6. Generating
  const Generating = () => {
    const isFirstPlan = regenUsed === 0;
    const title = isFirstPlan ? "Building your week\u2026" : "Let\u2019s try something different\u2026";
    const subtitle = isFirstPlan ? "7 meals matched to you" : "Here\u2019s another set of meals";
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', flexDirection: 'column' }
    }, /*#__PURE__*/React.createElement(ScreenHeader, null), /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }
    }, /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 56 }
    }, "\uD83C\uDF7D\uFE0F"), /*#__PURE__*/React.createElement("div", {
      style: { ...T.title, color: C.text }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: { ...T.body, color: C.textSec }
    }, subtitle), /*#__PURE__*/React.createElement("div", {
      style: { display: 'flex', gap: 8, marginTop: 4 }
    }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: { width: 10, height: 10, borderRadius: '50%', background: C.accent, animation: "bounce 0.9s ".concat(i * 0.2, "s infinite ease-in-out") }
    })))), /*#__PURE__*/React.createElement(ScreenFooter, { center: true }, /*#__PURE__*/React.createElement(BrandTagline, null)));
  };

  // 7. Plan Screen (home)
  const PlanScreen = () => {
    const meals = mealOrder.map((_, i) => getMealAtDay(i));
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    // Frozen cards use ordinal numbers, not dates — no tonight/delivery tracking needed
    const badge = (label, color, truncate) => /*#__PURE__*/React.createElement("span", {
      style: {
        background: color + '28',
        color,
        borderRadius: 4,
        padding: '0 6px',
        height: 18,
        display: 'inline-block',
        lineHeight: '18px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 0.2,
        flexShrink: truncate ? 1 : 0,
        minWidth: truncate ? 0 : undefined,
        overflow: truncate ? 'hidden' : undefined,
        textOverflow: truncate ? 'ellipsis' : undefined,
        whiteSpace: truncate ? 'nowrap' : undefined,
      }
    }, label);
    // Ordinal labels for frozen mode: active days → 1,2,3…; off days → ×
    const frozenOrdinals = (() => { let n = 0; return Array.from({length: 7}, (_, k) => dayOn[k] ? String(++n) : '×'); })();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, (() => {
      const crossesMonth = weekStartDay.getMonth() !== cardDate(6).getMonth();
      const monthLabel = crossesMonth ? "".concat(MONTH_SHORT[weekStartDay.getMonth()], " \u2013 ").concat(MONTH_SHORT[cardDate(6).getMonth()]) : MONTH_SHORT[weekStartDay.getMonth()];
      return /*#__PURE__*/React.createElement(ScreenHeader, {
        left: isFrozen ? /*#__PURE__*/React.createElement("button", {
          onClick: () => setShowInsightSheet(true),
          style: {
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: C.textSec,
            padding: '2px 4px',
            lineHeight: 1
          }
        }, "\u2728") : /*#__PURE__*/React.createElement("button", {
          onClick: () => setShowNewWeek(true),
          style: {
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: C.textSec,
            padding: '2px 4px',
            lineHeight: 1
          }
        }, "\ud83d\udd04"),
        badge: isFrozen
          ? /*#__PURE__*/React.createElement("span", {
              style: { background: 'transparent', border: "1px solid ".concat(C.accent), borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: C.accent, whiteSpace: 'nowrap' }
            }, monthLabel)
          : /*#__PURE__*/React.createElement("button", {
              onClick: () => { setDpMode('weekstart'); setShowDayPicker(true); },
              style: { background: 'transparent', border: "1px solid ".concat(C.border), borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: C.textSec, whiteSpace: 'nowrap', cursor: 'pointer' }
            }, monthLabel),
        right: /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: 4
          }
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => go('saved'),
          style: {
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: C.textSec,
            padding: '2px 4px',
            lineHeight: 1
          }
        }, "\uD83E\uDD0D"), /*#__PURE__*/React.createElement("button", {
          onClick: () => go('profile'),
          style: {
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: C.textSec,
            padding: '2px 4px',
            lineHeight: 1
          }
        }, "\u2699\uFE0F"))
      });
    })(), /*#__PURE__*/React.createElement("div", {
      ref: planCardsRef,
      style: {
        flex: 1,
        padding: '6px 8px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        touchAction: 'none',
        // Without this, mouse-dragging a card on desktop (swipe-to-swap /
        // drag-to-reorder) highlights the recipe text underneath the cursor —
        // looks broken. Touch devices suppress this natively; mouse doesn't.
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }
    }, meals.map((meal, i) => {
      const pos = swapPos[i];
      const baseMeal = activePlan[mealOrder[i]];
      const hasSwaps = !isFrozen;
      const isOff = !dayOn[i];
      const currentName = meal.name;
      const currentCuisine = meal.cuisine;
      const cc = CUISINE_COLOR[currentCuisine] || C.textSec;
      const tc = timeColor(meal.time);
      // Allergen conflict — only check base meal (alts have no allergen data in prototype)
      const mealAllergenIds = meal.allergens || [];
      const conflictIds = !isOff ? mealAllergenIds.filter(a => allergens.includes(a)) : [];
      const conflict = conflictIds.length > 0;
      const conflictLabels = conflictIds.map(a => ALLERGENS.find(x => x.id === a)?.label).filter(Boolean);
      // Diet type conflict — only base meal, only when day is on
      const dietConflict = !isOff && (meal.incompatible || []).includes(selectedDiet);
      const hasConflict = conflict || dietConflict;
      const isDragging = dragSrcIdx === i;
      const isShaking = shakeIdx === i;
      // Proportional shift: neighbour cards move continuously with the drag (no step-function pop).
      // shift = how much the dragged card has physically overlapped this slot, clamped 0–1.
      let cardShift = 0;
      if (dragSrcIdx !== null && !isDragging) {
        const h = dragCardH.current;
        const rawSlot = dragSrcIdx + dragDeltaY / h;
        if (i > dragSrcIdx) {
          cardShift = -h * Math.max(0, Math.min(1, rawSlot - (i - 1)));
        } else {
          cardShift = h * Math.max(0, Math.min(1, (i + 1) - rawSlot));
        }
      }
      const cardTransform = isDragging
        ? "translateY(".concat(dragDeltaY, "px) scale(1.02)")
        : "translateY(".concat(cardShift, "px)");
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        'data-card-idx': i,
        'data-has-swaps': hasSwaps ? 'true' : 'false',
        style: {
          background: C.bgSec,
          borderRadius: 10,
          opacity: isOff && !isDragging ? 0.4 : 1,
          transition: (dragSrcIdx !== null || landingIdx !== null) ? 'none' : 'transform 0.18s ease-out, opacity 0.2s',
          border: "1px solid ".concat(hasConflict ? '#EF5350' : isOff ? C.border : 'transparent'),
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: cardTransform,
          boxShadow: isDragging ? '0 12px 32px rgba(0,0,0,0.65)' : 'none',
          zIndex: isDragging ? 10 : 1,
          position: 'relative',
          willChange: isDragging ? 'transform' : 'auto',
          animation: isShaking ? 'shake 0.38s ease' : (cascade ? "cardIn 0.4s ease-out ".concat(i * 0.06, "s both") : 'none')
        }
      }, /*#__PURE__*/React.createElement(MealCardBody, {
        meal: meal,
        label: isFrozen ? null : cardLabel(i),
        ordinal: frozenOrdinals[i],
        isFrozen: isFrozen,
        isOff: isOff,
        idx: i,
        isDragging: isDragging,
        hasConflict: hasConflict,
        onOpen: () => { setActiveRecipe({ meal: meal, mealIdx: meal.id }); setRecipeTab('ingredients'); setShowRecipe(true); }
      }), hasSwaps && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 5,
          padding: '0 10px',
          opacity: isOff ? 0.25 : 1,
          transition: 'opacity 0.25s',
          pointerEvents: isOff ? 'none' : 'auto'
        }
      }, Array.from({
        length: maxSwaps + 1
      }).map((_, di) => /*#__PURE__*/React.createElement("div", {
        key: di,
        onClick: isOff ? undefined : () => setSwapPos(p => {
          const n = [...p];
          n[i] = di;
          return n;
        }),
        style: {
          width: pos === di ? 14 : 6,
          height: 5,
          borderRadius: 3,
          background: pos === di ? C.accent : C.border,
          transition: (dragSrcIdx !== null || landingIdx !== null) ? 'none' : 'all 0.2s',
          cursor: isOff ? 'default' : 'pointer'
        }
      }))));
    })), isFrozen ? /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (isFrozen && cartFilled) {
          setShowNextWeekDialog(true);
          return;
        }
        const _now = new Date(); _now.setHours(0,0,0,0);
        const _ws = new Date(weekStartDay); _ws.setHours(0,0,0,0);
        const deliveryPassed = (_ws - _now) / 86400000 < 0;
        setWeekCompleteMode(deliveryPassed ? 'stale-late' : 'stale-early');
        go('weekcomplete');
      },
      style: {
        flex: 1,
        background: C.bgEl,
        border: 'none',
        borderRadius: 999,
        color: C.textSec,
        ...T.bodyMed,
        fontSize: 14,
        cursor: 'pointer',
        padding: '20px 8px',
        textAlign: 'center'
      }
    }, "Next week"), /*#__PURE__*/React.createElement("button", {
      onClick: () => cartFilled ? go('webview') : go('shop'),
      style: {
        flex: 2,
        background: C.accent,
        border: 'none',
        borderRadius: 999,
        color: C.white,
        ...T.bodyMed,
        fontSize: 16,
        cursor: 'pointer',
        padding: '20px 16px',
        textAlign: 'center'
      }
    }, cartFilled ? (store ? "View ".concat(store, " Cart") : 'View Cart') : "Shopping List"))) : /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: "Shopping List",
      onPress: () => {
        if (dayOn.every(d => !d)) {
          showToast('Turn on at least one day first.');
          return;
        }
        go('shop');
      }
    })), showNextWeekDialog && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 270,
        background: C.bgSec,
        borderRadius: 14,
        overflow: 'hidden',
        border: "1px solid ".concat(C.border)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 16px 14px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.bodyMed,
        color: C.text,
        marginBottom: 6
      }
    }, "Cart not ordered yet"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        lineHeight: 1.5
      }
    }, "You've filled your cart but haven't ordered yet. Plan next week anyway?")), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(C.border),
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setShowNextWeekDialog(false),
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.text,
        cursor: 'pointer',
        borderRight: "1px solid ".concat(C.border)
      }
    }, "Cancel"), /*#__PURE__*/React.createElement("div", {
      onClick: () => {
        setShowNextWeekDialog(false);
        const _now = new Date(); _now.setHours(0,0,0,0);
        const _ws = new Date(weekStartDay); _ws.setHours(0,0,0,0);
        const deliveryPassed = (_ws - _now) / 86400000 < 0;
        setWeekCompleteMode(deliveryPassed ? 'stale-late' : 'stale-early');
        go('weekcomplete');
      },
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.accent,
        cursor: 'pointer'
      }
    }, "Plan next week")))));
  };

  // 8. Shopping List
  const ShopScreen = () => {
    const shopping = buildShoppingList(mealOrder.map((_, k) => getMealAtDay(k)), dayOn);
    const allItems = [...Object.values(shopping).flat(), ...STAPLES];
    const includedCount = allItems.filter(item => !excluded[item.n]).length;
    const fillAvailable = fillUsed < maxFills;
    const cycleSeat = i => setSeatSizes(prev => {
      const next = [...prev];
      next[i] = next[i] === 'M' ? 'L' : next[i] === 'L' ? 'S' : 'M';
      return next;
    });
    const addSeat = () => {
      if (cookFor >= 8) return;
      setCookFor(n => n + 1);
      setSeatSizes(p => [...p, 'M']);
    };
    const remSeat = () => {
      if (cookFor <= 1) return;
      setCookFor(n => n - 1);
      setSeatSizes(p => p.slice(0, -1));
    };
    const toggleItem = n => setExcluded(p => ({
      ...p,
      [n]: !p[n]
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      left: /*#__PURE__*/React.createElement("button", {
        onClick: () => goBack(),
        style: {
          background: 'none',
          border: 'none',
          fontSize: 26,
          cursor: 'pointer',
          color: C.textSec,
          padding: '0 4px',
          lineHeight: 1
        }
      }, "\u2039"),
      badge: null,
      right: store ? /*#__PURE__*/React.createElement("button", {
        onClick: cartFilled || isFrozen ? undefined : () => {
          setPendingStore(store);
          setStorePick(store);
          setShowStore(true);
        },
        style: {
          background: 'none',
          border: "1px solid ".concat(isFrozen ? C.accent : cartFilled ? C.border : C.accent),
          borderRadius: 20,
          padding: '3px 10px',
          ...T.hint,
          fontWeight: 600,
          color: isFrozen ? C.accent : cartFilled ? C.textHint : C.accent,
          cursor: cartFilled || isFrozen ? 'default' : 'pointer',
          opacity: cartFilled && !isFrozen ? 0.5 : 1
        }
      }, store) : null
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "8px ".concat(S.frame, "px 8px"),
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.bgSec,
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.body,
        color: C.text
      }
    }, "Cooking for"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: isFrozen ? undefined : remSeat,
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: "1px solid ".concat(C.border),
        background: 'none',
        color: C.textHint,
        fontSize: 16,
        cursor: isFrozen ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        opacity: isFrozen ? 0.4 : (cookFor <= 1 ? 0.4 : 1)
      }
    }, "\u2212"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.bodyMed,
        color: isFrozen ? C.accent : C.text,
        fontSize: isFrozen ? 20 : undefined,
        fontWeight: isFrozen ? 700 : undefined,
        minWidth: 14,
        textAlign: 'center'
      }
    }, cookFor), /*#__PURE__*/React.createElement("button", {
      onClick: isFrozen ? undefined : addSeat,
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: "1px solid ".concat(C.border),
        background: 'none',
        color: C.textHint,
        fontSize: 16,
        cursor: isFrozen ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        opacity: isFrozen ? 0.4 : (cookFor >= 8 ? 0.4 : 1)
      }
    }, "+")), /*#__PURE__*/React.createElement("button", {
      onClick: isFrozen ? undefined : () => {
        setPendingSeatSizes([...seatSizes]);
        setShowPortions(true);
      },
      style: {
        background: isFrozen ? C.bgEl : C.accent,
        color: isFrozen ? C.textHint : C.white,
        border: 'none',
        borderRadius: 999,
        padding: '6px 14px',
        ...T.hint,
        fontWeight: 700,
        cursor: isFrozen ? 'default' : 'pointer',
        opacity: isFrozen ? 0.4 : 1
      }
    }, "Portions"))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        scrollbarWidth: 'none'
      }
    }, Object.entries(shopping).map(([cat, items]) => /*#__PURE__*/React.createElement("div", {
      key: cat
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 14px 4px',
        position: 'sticky',
        top: 0,
        background: C.bg,
        zIndex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.label,
        color: C.textSec
      }
    }, cat)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.bgSec,
        margin: '0 14px 8px',
        borderRadius: 10,
        overflow: 'hidden'
      }
    }, items.map((item, i) => /*#__PURE__*/React.createElement("div", {
      key: item.n,
      style: {
        borderBottom: i < items.length - 1 ? "1px solid ".concat(C.border) : 'none'
      }
    }, /*#__PURE__*/React.createElement(ItemRow, {
      item: item,
      excluded: excluded,
      portScale: portScale,
      onToggle: toggleItem
    })))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 14px 4px',
        position: 'sticky',
        top: 0,
        background: C.bg,
        zIndex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.label,
        color: C.textSec
      }
    }, "Staples")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.bgSec,
        margin: '0 14px 8px',
        borderRadius: 10,
        overflow: 'hidden'
      }
    }, STAPLES.map((item, i) => /*#__PURE__*/React.createElement("div", {
      key: item.n,
      style: {
        borderBottom: i < STAPLES.length - 1 ? "1px solid ".concat(C.border) : 'none'
      }
    }, /*#__PURE__*/React.createElement(ItemRow, {
      item: item,
      excluded: excluded,
      portScale: portScale,
      onToggle: toggleItem
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 8
      }
    })), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottom: "1px solid ".concat(C.border)
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        color: C.textSec
      }
    }, includedCount, " of ", allItems.length, " in cart"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.bodyMed,
        color: C.text
      }
    }, "~\u20AC", totalEstimate.toFixed(2))), isFrozen && cartFilled ?
    /*#__PURE__*/
    /* Frozen + cart filled — greyed out, can't refill a locked week */
    React.createElement(Btn, {
      label: "Fill Cart",
      active: false
    }) : isFrozen ?
    /*#__PURE__*/
    /* Frozen + post-purchase — greyed out, week already purchased */
    React.createElement(Btn, {
      label: "Fill Cart",
      active: false
    }) : !store ? /*#__PURE__*/React.createElement(Btn, {
      label: "Choose your store",
      onPress: () => {
        setPendingStore(null);
        setStorePick(null);
        setShowStore(true);
      }
    }) : !fillAvailable ?
    /*#__PURE__*/
    /* Fills exhausted, no cart yet */
    React.createElement(Btn, {
      label: "Upgrade to fill",
      onPress: () => go('paywall')
    }) :
    /*#__PURE__*/
    /* No cart yet — first fill */
    React.createElement(Btn, {
      label: "Fill ".concat(store, " Cart"),
      onPress: () => setShowFillConfirm(true)
    })), showFillConfirm && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 270,
        background: C.bgSec,
        borderRadius: 14,
        overflow: 'hidden',
        border: "1px solid ".concat(C.border)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 16px 14px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.bodyMed,
        color: C.text,
        marginBottom: 6
      }
    }, "Fill your ", store, " cart?"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        lineHeight: 1.5
      }
    }, isPremium ? "Uses one fill and locks this week's plan." : "Uses your free fill and locks this week's plan.")), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(C.border),
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setShowFillConfirm(false),
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.text,
        cursor: 'pointer',
        borderRight: "1px solid ".concat(C.border)
      }
    }, "Cancel"), /*#__PURE__*/React.createElement("div", {
      onClick: () => {
        setShowFillConfirm(false);
        setFillUsed(f => f + 1);
        setCartFilled(true);
        setIsFrozen(true);
        go('injecting');
      },
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.accent,
        cursor: 'pointer'
      }
    }, "Fill Cart")))));
  };

  // 9. Injecting — Stage 1
  const Injecting = () => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: "0 ".concat(S.frame + 12, "px"),
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 56
    }
  }, "\uD83D\uDED2"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.title,
      color: C.text
    }
  }, "Filling your ", store, " cart\u2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.body,
      color: C.textSec
    }
  }, injectPct < 100 ? "Adding items\u2026 ".concat(injectPct, "%") : 'All done!'), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: 6,
      background: C.bgEl,
      borderRadius: 3,
      overflow: 'hidden',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: "".concat(injectPct, "%"),
      background: C.accent,
      borderRadius: 3,
      transition: 'width 0.3s'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.hint,
      color: fillUsed === 1 ? C.textSec : C.textHint,
      textAlign: 'center',
      marginTop: 6
    }
  }, "Don't close the app"), fillUsed <= 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.hint,
      color: C.textHint,
      textAlign: 'center',
      marginTop: 4
    }
  }, "You may be asked to sign into ", store || 'your store')), /*#__PURE__*/React.createElement(ScreenFooter, {
    center: true
  }, /*#__PURE__*/React.createElement(BrandTagline, null)));

  // 10. Cart Ready — Stage 2 (simplified, always perfect fill)
  const CartReady = () => {
    const fillsText = isPremium ? "".concat(fillUsed, " of ").concat(maxFills, " fills used this month") : "".concat(fillUsed, " of ").concat(maxFills, " free fill used");
    const backBtn = /*#__PURE__*/React.createElement("button", {
      onClick: () => { screenStack.current = []; go('plan', { back: true }); },
      style: {
        background: 'none',
        border: 'none',
        color: C.textSec,
        fontSize: 26,
        cursor: 'pointer',
        lineHeight: 1,
        padding: '0 4px'
      }
    }, "\u2039");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      left: backBtn
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: "0 ".concat(S.frame + 12, "px"),
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: C.accent + '1F',
        border: "3px solid ".concat(C.accent),
        color: C.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text
      }
    }, "Cart ready"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.textSec,
        textAlign: 'center'
      }
    }, "All items added to your ", store || 'store', " cart."), /*#__PURE__*/React.createElement("span", {
      style: {
        background: C.bgEl,
        border: "1px solid ".concat(C.border),
        borderRadius: 20,
        padding: '3px 10px',
        ...T.hint,
        color: C.textSec
      }
    }, fillsText)), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: "Go to ".concat(store || 'Store'),
      onPress: () => go('webview')
    })));
  };
  // 11. WebView — Stage 3 (review cart + pay)
  const WebViewScreen = () => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      background: C.bgSec,
      borderBottom: "1px solid ".concat(C.border),
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => cartFilled ? setShowWebViewExit(true) : goBack(),
    style: {
      background: 'none',
      border: 'none',
      color: C.textSec,
      fontSize: 26,
      cursor: 'pointer',
      lineHeight: 1,
      padding: '0 4px'
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: C.bgEl,
      borderRadius: 8,
      padding: '7px 12px',
      ...T.hint,
      color: C.textSec
    }
  }, (store || 'tesco')?.toLowerCase(), ".ie/trolley")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#090909',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#1A1A2E',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20
    }
  }, "\uD83C\uDFEA"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text
    }
  }, store || 'Store'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      background: C.accent + '33',
      border: "1px solid ".concat(C.accent, "55"),
      borderRadius: 20,
      padding: '3px 10px',
      ...T.hint,
      color: C.accentSoft
    }
  }, "Cart ready \u2713")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: '0 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48
    }
  }, "\uD83D\uDED2"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text,
      textAlign: 'center'
    }
  }, "Your cart is ready to review"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.meta,
      color: C.textSec,
      textAlign: 'center',
      lineHeight: 1.6
    }
  }, "Log in to your ", store || 'store', " account, pick a delivery slot and complete checkout."), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.hint,
      color: C.textHint,
      textAlign: 'center',
      lineHeight: 1.5,
      marginTop: 4
    }
  }, "After placing your order, come back to AllSorted."))), showWebViewExit && cartFilled && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 270,
      background: C.bgSec,
      borderRadius: 14,
      overflow: 'hidden',
      border: "1px solid ".concat(C.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 16px 14px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text,
      marginBottom: 6
    }
  }, "Leave checkout?"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.meta,
      color: C.textSec,
      lineHeight: 1.5
    }
  }, "Your cart at ", store || 'store', " will still be waiting. Come back any time.")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid ".concat(C.border),
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowWebViewExit(false),
    style: {
      flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.bodyMed,
      color: C.text,
      cursor: 'pointer',
      borderRight: "1px solid ".concat(C.border)
    }
  }, "Stay"), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      setShowWebViewExit(false);
      goBack();
    },
    style: {
      flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.bodyMed,
      color: C.textSec,
      cursor: 'pointer'
    }
  }, "Leave")))));

  // 12. Week Complete — Stage 4
  const WeekComplete = () => {
    const isStale = weekCompleteMode === 'stale-early' || weekCompleteMode === 'stale-late';
    const isLateSale = weekCompleteMode === 'stale-late';
    const headline = isLateSale ? 'Your week is up!' : 'Ready for next week?';
    const subtitle = isLateSale ? 'Time to plan the next one.' : 'Keep your meals or start fresh.';

    // Delivery date label
    const today1 = new Date();
    today1.setHours(0, 0, 0, 0);
    const dDay1 = new Date(weekStartDay);
    dDay1.setHours(0, 0, 0, 0);
    const diff1 = Math.round((dDay1 - today1) / (1000 * 60 * 60 * 24));
    const relLbl = diff1 === 0 ? 'Today' : diff1 === 1 ? 'Tomorrow' : diff1 === -1 ? 'Yesterday' : null;
    const deliveryFull = relLbl ? "".concat(relLbl, ", ").concat(DAY_SHORT[dDay1.getDay()], " ").concat(dDay1.getDate()) : "".concat(DAY_SHORT[dDay1.getDay()], " ").concat(dDay1.getDate());
    const reuseThisPlan = () => {
      setIsFrozen(false);
      setCartFilled(false);
      setRegenUsed(0);
      setDayOn(Array(7).fill(true));
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setWeekStartDay(d);
      screenStack.current = [];
      go('plan', { back: true });
    };
    const backBtn = /*#__PURE__*/React.createElement("button", {
      onClick: () => goBack(),
      style: {
        background: 'none',
        border: 'none',
        color: C.textSec,
        fontSize: 26,
        cursor: 'pointer',
        lineHeight: 1,
        padding: '0 4px'
      }
    }, "\u2039");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      left: isStale ? backBtn : undefined
    }), isStale ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: "0 ".concat(S.frame, "px"),
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: C.bgEl,
        border: "3px solid ".concat(C.border),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 34
      }
    }, "\uD83D\uDCC5"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.heading,
        color: C.text,
        textAlign: 'center'
      }
    }, headline), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.hint,
        color: C.textSec,
        textAlign: 'center'
      }
    }, subtitle)), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowReuseConfirm(true),
      style: {
        flex: 1,
        background: C.bgEl,
        border: 'none',
        borderRadius: 999,
        color: C.textSec,
        ...T.bodyMed,
        fontSize: 14,
        cursor: 'pointer',
        padding: '20px 8px',
        textAlign: 'center'
      }
    }, "Reuse plan"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowFreshConfirm(true),
      style: {
        flex: 2,
        background: C.accent,
        border: 'none',
        borderRadius: 999,
        color: C.white,
        ...T.bodyMed,
        fontSize: 16,
        cursor: 'pointer',
        padding: '20px 16px',
        textAlign: 'center'
      }
    }, "Generate fresh week")))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: "0 ".concat(S.frame, "px"),
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: C.accent + '1F',
        border: "3px solid ".concat(C.accent),
        color: C.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 34
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.heading,
        color: C.text
      }
    }, "Week sorted \u2713"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.hint,
        color: C.textSec,
        textAlign: 'center'
      }
    }, "Your groceries are on their way. Enjoy the week!")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement(TapRow, {
      label: "\uD83D\uDCE4  Share your week",
      onPress: () => setShowShareSheet(true)
    }))), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: "Back to plan",
      onPress: () => { screenStack.current = []; go('plan', { back: true }); }
    }))), showReuseConfirm && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 270,
        background: C.bgSec,
        borderRadius: 14,
        overflow: 'hidden',
        border: "1px solid ".concat(C.border)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 16px 14px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.bodyMed,
        color: C.text,
        marginBottom: 6
      }
    }, "Reuse this plan?"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        lineHeight: 1.5
      }
    }, "Keep the same 7 meals with a new delivery date.")), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(C.border),
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setShowReuseConfirm(false),
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.text,
        cursor: 'pointer',
        borderRight: "1px solid ".concat(C.border)
      }
    }, "Cancel"), /*#__PURE__*/React.createElement("div", {
      onClick: () => {
        setShowReuseConfirm(false);
        reuseThisPlan();
      },
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.accent,
        cursor: 'pointer'
      }
    }, "Reuse plan")))), showFreshConfirm && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 270,
        background: C.bgSec,
        borderRadius: 14,
        overflow: 'hidden',
        border: "1px solid ".concat(C.border)
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 16px 14px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.bodyMed,
        color: C.text,
        marginBottom: 6
      }
    }, "Generate fresh week?"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        lineHeight: 1.5
      }
    }, "Replace your plan with 7 new meals.")), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid ".concat(C.border),
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setShowFreshConfirm(false),
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.text,
        cursor: 'pointer',
        borderRight: "1px solid ".concat(C.border)
      }
    }, "Cancel"), /*#__PURE__*/React.createElement("div", {
      onClick: () => {
        setShowFreshConfirm(false);
        setIsFrozen(false);
        regenFreshWeek();
        setRegenUsed(0);
      },
      style: {
        flex: 1,
        padding: '13px 8px',
        textAlign: 'center',
        ...T.bodyMed,
        color: C.accent,
        cursor: 'pointer'
      }
    }, "Generate")))));
  };

  // 13. Saved screen
  const SavedScreen = () => {
    // Only show recipes the user has actually saved
    const savedRecipes = ALL_RECIPES.filter(r => savedSet.has(r.id));
    const hasFilters = savedCuisines.length > 0 || savedTime !== 'any';
    const filtered = savedRecipes.filter(r => {
      if (savedCuisines.length > 0 && !savedCuisines.includes(r.cuisine)) return false;
      if (savedTime === '15' && parseInt(r.time) > 15) return false;
      if (savedTime === '20' && parseInt(r.time) > 20) return false;
      if (savedTime === '30' && parseInt(r.time) > 30) return false;
      if (savedTime === '45' && parseInt(r.time) > 45) return false;
      if (savedTime === '60' && parseInt(r.time) > 60) return false;
      return true;
    });
    const timeCol = t => {
      const m = parseInt(t);
      return m <= 20 ? C.accent : m <= 40 ? C.warning : '#EF6C00';
    };
    const openFilters = () => {
      setPendingCuisines([...savedCuisines]);
      setPendingTime(savedTime);
      setShowSavedFilters(true);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      left: /*#__PURE__*/React.createElement("button", {
        onClick: () => goBack(),
        style: {
          background: 'none',
          border: 'none',
          fontSize: 26,
          cursor: 'pointer',
          color: C.textSec,
          padding: '0 4px',
          lineHeight: 1
        }
      }, "\u2039"),
      right: /*#__PURE__*/React.createElement("button", {
        onClick: openFilters,
        style: {
          background: 'transparent',
          border: "1px solid ".concat(hasFilters ? C.accent : C.border),
          borderRadius: 20,
          padding: '4px 12px',
          color: hasFilters ? C.accent : C.textSec,
          ...T.hint,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s'
        }
      }, "Filters")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '14px',
        scrollbarWidth: 'none'
      }
    }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 48
      }
    }, savedRecipes.length === 0 ? '🤍' : '🔍'), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.bodyMed,
        color: C.textSec
      }
    }, savedRecipes.length === 0 ? 'No saved recipes yet' : 'No recipes match'), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.textHint,
        lineHeight: 1.6
      }
    }, savedRecipes.length === 0 ? 'Heart a recipe from your plan to save it here.' : 'Try adjusting your filters.')) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      }
    }, filtered.map(r => {
      const rConflictIds = (r.allergens || []).filter(a => allergens.includes(a));
      const rConflict = rConflictIds.length > 0;
      const rDietConflict = (r.incompatible || []).includes(selectedDiet);
      const rHasConflict = rConflict || rDietConflict;
      return /*#__PURE__*/React.createElement("div", {
        key: r.id,
        onClick: () => {
          setActiveRecipe({
            meal: r,
            mealIdx: r.id,
            fromSaved: true
          });
          setRecipeTab('ingredients');
          setShowRecipe(true);
        },
        style: {
          background: C.bgSec,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          border: "1px solid ".concat(rHasConflict ? '#EF5350' : 'transparent')
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: 90,
          background: C.bgEl,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 38,
          position: 'relative'
        }
      }, r.photo ? /*#__PURE__*/React.createElement("img", {
        src: r.photo,
        alt: "",
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        },
        onError: e => {
          e.target.style.display = 'none';
        }
      }) : /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 38
        }
      }, r.emoji), rHasConflict && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 7,
          left: 7,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#EF5350',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#fff',
          fontWeight: 800,
          lineHeight: 1,
          boxShadow: '0 1px 4px rgba(0,0,0,0.5)'
        }
      }, "!"), !isFrozen && /*#__PURE__*/React.createElement("button", {
        onClick: e => {
          e.stopPropagation();
          setActiveRecipe({
            meal: r,
            mealIdx: r.id,
            fromSaved: true
          });
          setDpMode('use');
          setShowDayPicker(true);
        },
        style: {
          position: 'absolute',
          top: 7,
          right: 7,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: C.accent,
          border: 'none',
          color: C.white,
          fontSize: 18,
          fontWeight: 300,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }
      }, "+")), /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '9px 10px 10px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          ...T.bodyMed,
          color: C.text,
          lineHeight: 1.3,
          marginBottom: 6,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, r.name), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          background: timeCol(r.time) + '28',
          color: timeCol(r.time),
          borderRadius: 4,
          padding: '2px 6px',
          fontSize: 10,
          fontWeight: 700,
          flexShrink: 0
        }
      }, parseInt(r.time) + " min"), /*#__PURE__*/React.createElement("span", {
        style: {
          background: (CUISINE_COLOR[r.cuisine] || C.textSec) + '28',
          color: CUISINE_COLOR[r.cuisine] || C.textSec,
          borderRadius: 4,
          padding: '2px 6px',
          fontSize: 10,
          fontWeight: 600,
          flexShrink: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, r.cuisine))));
    }))), /*#__PURE__*/React.createElement(ScreenFooter, {
      center: true
    }, /*#__PURE__*/React.createElement(BrandTagline, null)));
  };

  // SavedFilterSheet — 2-column filter bottom sheet (cuisine + cook time)
  const SavedFilterSheet = () => {
    if (!showSavedFilters) return null;
    const cuisineOptions = [...new Set(ALL_RECIPES.map(r => r.cuisine))];
    const toggleCuisine = c => setPendingCuisines(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
    const apply = () => {
      setSavedCuisines(pendingCuisines);
      setSavedTime(pendingTime);
      setShowSavedFilters(false);
    };
    const clear = () => {
      setSavedCuisines([]);
      setSavedTime('any');
      setPendingCuisines([]);
      setPendingTime('any');
      setShowSavedFilters(false);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 100
      },
      'data-closing': closingSheet === 'savedfilters' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.savedfilters ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: () => closeWithAnim('savedfilters', () => setShowSavedFilters(false))
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.savedfilters ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: () => closeWithAnim('savedfilters', () => setShowSavedFilters(false)), swipeDismissFn: () => setShowSavedFilters(false)}), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        marginBottom: 4
      }
    }, "Filter recipes"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        marginBottom: 14
      }
    }, "Narrow your saved recipes by cuisine or cook time")), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 20px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", { style: { display: 'flex' } },
    /*#__PURE__*/React.createElement("div", { style: { flex: 1 } },
      /*#__PURE__*/React.createElement("div", { style: { ...T.label, color: C.textSec, marginBottom: 10 } }, "Cuisine"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        cuisineOptions.map(c => {
          const on = pendingCuisines.includes(c); const cc = CUISINE_COLOR[c] || C.textSec;
          return /*#__PURE__*/React.createElement("div", { key: c, onClick: () => toggleCuisine(c), style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' } },
            /*#__PURE__*/React.createElement("div", { style: { width: 18, height: 18, borderRadius: 5, border: "2px solid ".concat(on ? cc : C.border), background: on ? cc + '22' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
              on && /*#__PURE__*/React.createElement("div", { style: { width: 8, height: 8, borderRadius: 2, background: cc } })),
            /*#__PURE__*/React.createElement("span", { style: { ...T.meta, color: on ? C.text : C.textSec } }, c));
        }))),
    /*#__PURE__*/React.createElement("div", { style: { width: 1, background: C.border, margin: '0 14px', flexShrink: 0 } }),
    /*#__PURE__*/React.createElement("div", { style: { flex: 1 } },
      /*#__PURE__*/React.createElement("div", { style: { ...T.label, color: C.textSec, marginBottom: 10 } }, "Cook time"),
      /*#__PURE__*/React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        [['any','Any'],['15','≤15m'],['20','≤20m'],['30','≤30m'],['45','≤45m'],['60','≤60m']].map(([v,l]) => {
          const on = pendingTime === v;
          return /*#__PURE__*/React.createElement("div", { key: v, onClick: () => setPendingTime(v), style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' } },
            /*#__PURE__*/React.createElement("div", { style: { width: 18, height: 18, borderRadius: '50%', border: "2px solid ".concat(on ? C.accent : C.border), background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
              on && /*#__PURE__*/React.createElement("div", { style: { width: 8, height: 8, borderRadius: '50%', background: C.accent } })),
            /*#__PURE__*/React.createElement("span", { style: { ...T.meta, color: on ? C.text : C.textSec } }, l));
        }))))),
/*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: "Apply filters",
      onPress: apply
    }))));
  };

  // 14. Profile
  const ProfileScreen = () => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    left: /*#__PURE__*/React.createElement("button", {
      onClick: () => goBack(),
      style: {
        background: 'none',
        border: 'none',
        fontSize: 26,
        cursor: 'pointer',
        color: C.textSec,
        padding: '0 4px',
        lineHeight: 1
      }
    }, "\u2039")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px ".concat(S.frame, "px 0"),
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: C.bgEl,
      border: "1.5px solid ".concat(C.border),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: C.textSec,
      letterSpacing: -0.5
    }
  }, "MR"), isPremium && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -11,
      left: '50%',
      transform: 'translateX(-50%)',
      lineHeight: 0
    },
    dangerouslySetInnerHTML: { __html: GOLD_CROWN_SVG }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text
    }
  }, "Mike Ryan"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.meta,
      color: C.textSec,
      marginTop: 2
    }
  }, "mike@allsorted.ie")), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'transparent',
      color: isPremium ? C.gold : C.textSec,
      border: "1px solid ".concat(isPremium ? C.gold : C.border),
      borderRadius: 20,
      padding: '4px 10px',
      ...T.hint,
      fontWeight: 600,
      flexShrink: 0
    }
  }, isPremium ? 'Premium' : 'Free')), isPremium ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgSec,
      border: "1px solid ".concat(C.border),
      borderRadius: 12,
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text
    }
  }, "Premium")), /*#__PURE__*/React.createElement("button", {
    onClick: () => go('paywall'),
    style: {
      background: C.accent,
      color: C.white,
      border: 'none',
      borderRadius: 20,
      padding: '6px 14px',
      ...T.hint,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Manage")) : /*#__PURE__*/React.createElement("div", {
    onClick: () => go('paywall'),
    style: {
      background: C.bgSec,
      border: "1px solid ".concat(C.border),
      borderRadius: 12,
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text
    }
  }, "Free plan")), /*#__PURE__*/React.createElement("span", {
    style: {
      background: C.accent,
      color: C.white,
      borderRadius: 20,
      padding: '6px 14px',
      ...T.hint,
      fontWeight: 700
    }
  }, "Upgrade")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgSec,
      borderRadius: 12,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      color: C.text
    }
  }, "Notifications"), /*#__PURE__*/React.createElement(Toggle, {
    on: notifs,
    onToggle: () => setNotifs(p => !p)
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "History"), /*#__PURE__*/React.createElement("div", {
    style: { background: C.bgSec, borderRadius: 12, overflow: 'hidden' }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => go('pastweeks'),
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: "1px solid ".concat(C.border), cursor: 'pointer' }
  }, /*#__PURE__*/React.createElement("span", { style: { ...T.body, color: C.text } }, "Past Weeks"),
  /*#__PURE__*/React.createElement("span", { style: { color: C.textHint, fontSize: 18 } }, "\u203A")),
  /*#__PURE__*/React.createElement("div", {
    onClick: isPremium ? () => go('disliked') : undefined,
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: isPremium ? 'pointer' : 'default', opacity: isPremium ? 1 : 0.4 }
  }, /*#__PURE__*/React.createElement("span", { style: { ...T.body, color: C.text } }, "Disliked recipes"),
  /*#__PURE__*/React.createElement("span", { style: { color: C.textHint, fontSize: 18 } }, "\u203A")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Preferences"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgSec,
      borderRadius: 12,
      overflow: 'hidden'
    }
  }, [['Dietary type', 'pref1'], ['Food intolerances', 'pref2']].map(([l, to], i, a) => /*#__PURE__*/React.createElement("div", {
    key: l,
    onClick: () => goEdit(to),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: i < a.length - 1 ? "1px solid ".concat(C.border) : 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      color: C.text
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.textHint,
      fontSize: 18
    }
  }, "\u203A"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Support"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgSec,
      borderRadius: 12,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => showToast('Support: hello@allsorted.ie'),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      color: C.text
    }
  }, "Help & Support"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.textHint,
      fontSize: 18
    }
  }, "\u203A")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Legal"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgSec,
      borderRadius: 12,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => go('legal'),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      color: C.text
    }
  }, "Privacy & Legal"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.textHint,
      fontSize: 18
    }
  }, "\u203A"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
    label: "Log out",
    danger: true,
    onPress: () => setShowLogoutDialog(true)
  })), showLogoutDialog && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 270,
      background: C.bgSec,
      borderRadius: 14,
      overflow: 'hidden',
      border: "1px solid ".concat(C.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 16px 14px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text,
      marginBottom: 6
    }
  }, "Sign out?"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.meta,
      color: C.textSec,
      lineHeight: 1.5
    }
  }, "You'll need to log back in to access your plan.")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid ".concat(C.border),
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowLogoutDialog(false),
    style: {
      flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.bodyMed,
      color: C.text,
      cursor: 'pointer',
      borderRight: "1px solid ".concat(C.border)
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      setShowLogoutDialog(false);
      go('splash');
    },
    style: {
      flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.bodyMed,
      color: C.error,
      cursor: 'pointer'
    }
  }, "Sign out")))));

  // 15. Legal sub-screen
  const LegalScreen = () => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    left: /*#__PURE__*/React.createElement("button", {
      onClick: goBack,
      style: {
        background: 'none',
        border: 'none',
        fontSize: 26,
        cursor: 'pointer',
        color: C.textSec,
        padding: '0 4px',
        lineHeight: 1
      }
    }, "\u2039")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: "14px ".concat(S.frame, "px 32px"),
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgSec,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12
    }
  }, [['Privacy Policy', C.text, () => showToast('Opening Privacy Policy…')], ['Terms of Service', C.text, () => showToast('Opening Terms of Service…')], ['Cookie Policy', C.text, () => showToast('Opening Cookie Policy…')], ['Export my data', C.text, () => showToast('Your data export will be emailed to you.')]].map(([l, col, fn], i, a) => /*#__PURE__*/React.createElement("div", {
    key: l,
    onClick: fn,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '13px 16px',
      borderBottom: i < a.length - 1 ? "1px solid ".concat(C.border) : 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      color: col
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.textHint,
      fontSize: 18
    }
  }, "\u203A")))), /*#__PURE__*/React.createElement(SectionLabel, null, "Danger zone"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bgSec,
      borderRadius: 12,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowDeleteDialog(true),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '13px 16px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      color: C.error
    }
  }, "Delete my account"))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.hint,
      color: C.textHint,
      lineHeight: 1.6,
      marginTop: 10,
      padding: '0 4px'
    }
  }, "Deleting your account permanently removes all your data from our servers. This cannot be undone. Under GDPR Art. 17 you have the right to erasure.")), /*#__PURE__*/React.createElement(ScreenFooter, {
    center: true
  }, /*#__PURE__*/React.createElement(BrandTagline, null)), showDeleteDialog && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 270,
      background: C.bgSec,
      borderRadius: 14,
      overflow: 'hidden',
      border: "1px solid ".concat(C.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 16px 14px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text,
      marginBottom: 6
    }
  }, "Delete account?"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.meta,
      color: C.textSec,
      lineHeight: 1.5
    }
  }, "All your data will be permanently removed. This cannot be undone.")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid ".concat(C.border),
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowDeleteDialog(false),
    style: {
      flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.bodyMed,
      color: C.text,
      cursor: 'pointer',
      borderRight: "1px solid ".concat(C.border)
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      setShowDeleteDialog(false);
      showToast('Account deletion requested.');
    },
    style: {
      flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.bodyMed,
      color: C.error,
      cursor: 'pointer'
    }
  }, "Delete")))));

  // 16. Paywall
  const Paywall = () => /*#__PURE__*/React.createElement("div", {
    style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    left: /*#__PURE__*/React.createElement("button", {
      onClick: goBack,
      style: { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: C.textSec, padding: '0 4px', lineHeight: 1 }
    }, "\u2039")
  }), /*#__PURE__*/React.createElement("div", {
    style: { flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }
  }, /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "28px ".concat(S.frame, "px 12px"), textAlign: 'center' }
  }, /*#__PURE__*/React.createElement("div", { style: { marginBottom: 16, lineHeight: 0 }, dangerouslySetInnerHTML: { __html: GOLD_CROWN_SVG.replace('width="20" height="13"', 'width="60" height="39"') } }),
  /*#__PURE__*/React.createElement("div", { style: { ...T.heading, color: C.text, marginBottom: 8, fontSize: 22 } }, "AllSorted Premium"),
  /*#__PURE__*/React.createElement("div", { style: { ...T.body, color: C.textSec, lineHeight: 1.5, marginBottom: 6 } }, "For people who take their week seriously.")),
  /*#__PURE__*/React.createElement("div", {
    style: { padding: "0 ".concat(S.frame, "px"), display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }
  }, [{
    emoji: '\uD83D\uDED2', t: '4 fills a month', accent: C.accent
  }, {
    emoji: '\uD83D\uDD13', t: 'Up to 5 swaps a meal', accent: '#80DEEA'
  }, {
    emoji: '\uD83D\uDD04', t: '3 regens a week', accent: C.accentSoft
  }, {
    emoji: '\uD83C\uDF7D\uFE0F', t: '150 recipes', accent: '#EF9A9A'
  }, {
    emoji: '\uD83D\uDC4E', t: 'Dislike & hide', accent: '#CE93D8'
  }, {
    emoji: '\u2728', t: 'AI insight', accent: '#81D4FA'
  }].map(f => /*#__PURE__*/React.createElement("div", {
    key: f.t,
    style: {
      background: f.accent + '22',
      borderRadius: 14, padding: '14px 8px',
      border: "1px solid ".concat(f.accent, "66"),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 96, textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", { style: { fontSize: 26 } }, f.emoji),
  /*#__PURE__*/React.createElement("div", { style: { ...T.meta, color: C.text, fontWeight: 600, lineHeight: 1.35 } }, f.t)))),
  /*#__PURE__*/React.createElement("div", { style: { textAlign: 'center', padding: "0 ".concat(S.frame, "px 12px") } },
    isPremium ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", { style: { fontSize: 32, fontWeight: 800, color: C.accent } }, "25 May"), /*#__PURE__*/React.createElement("span", { style: { fontSize: 13, color: C.textSec } }, " / renewal")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", { style: { fontSize: 32, fontWeight: 800, color: C.gold } }, "€12.99"), /*#__PURE__*/React.createElement("span", { style: { fontSize: 13, color: C.textSec } }, " / month")),
    /*#__PURE__*/React.createElement("div", { style: { ...T.hint, color: C.textHint, lineHeight: 1.6, marginTop: 8 } }, (isPremium ? "Cancel or change your plan anytime in your subscription settings." : /*#__PURE__*/React.createElement(React.Fragment, null, "Auto-renews monthly until you cancel.", /*#__PURE__*/React.createElement("br", null), "Cancel anytime, with a 14-day EU refund if unused."))),
    /*#__PURE__*/React.createElement("div", { style: { display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, paddingBottom: 24 } },
      /*#__PURE__*/React.createElement("span", { style: { ...T.hint, color: C.textSec, cursor: 'pointer' } }, "Privacy Policy"),
      /*#__PURE__*/React.createElement("span", { style: { ...T.hint, color: C.textSec, cursor: 'pointer' } }, "Terms of Service")))),
  /*#__PURE__*/React.createElement(ScreenFooter, null, isPremium ? /*#__PURE__*/React.createElement(Btn, { label: "Manage subscription", ghost: true, onPress: () => showToast("Opening subscription settings…") }) : /*#__PURE__*/React.createElement(Btn, { label: "Start Premium", onPress: () => { setIsPremium(true); go('plan'); } })))
  // ─── OVERLAYS ─────────────────────────────────────────────────────────────────

  // Recipe Detail Bottom Sheet — stable height (sized to tallest tab), 3 tabs, no scroll
  const RecipeSheet = () => {
    if (!showRecipe || !activeRecipe) return null;
    const meal = activeRecipe.meal;
    const mealIdx = activeRecipe.mealIdx;
    const fromSaved = activeRecipe.fromSaved;

    // Dish-level conflict (same as the card's red border + ! badge). Per-ingredient
    // red-flagging is GATED on this: a compatible dish shows no red lines, even if a
    // keyword would otherwise match (e.g. a low-carb-approved dish that has a little
    // rice). Reds only appear when the dish itself conflicts with the user.
    const allergenConflict = (meal.allergens || []).some(a => allergens.includes(a));
    const dietConflict = (meal.incompatible || []).includes(selectedDiet);
    const dishConflict = allergenConflict || dietConflict;
    // Header badge text. Allergen stays generic ("Allergen") so it scales to any
    // number of allergens — the red ingredient lines name the specifics. Diet uses a
    // short label. Both → combined.
    const SHORT_DIET = { veg: 'Veg', vegan: 'Vegan', lowcarb: 'Low-Carb', gf: 'GF', protein: 'High-Protein', balanced: 'Balanced' };
    const dietShort = SHORT_DIET[selectedDiet] || selectedDiet;
    const conflictLabel = allergenConflict && dietConflict ? 'Allergen & Not ' + dietShort
      : allergenConflict ? 'Allergen'
      : dietConflict ? 'Not ' + dietShort
      : null;

    // Cook time badge colour — same logic as plan cards
    const timeMin = parseInt(meal.time);
    const tc = timeColor(meal.time);

    // Macro rings — normalize all four to the meal's dominant macro so rings
    // show proportional balance within this meal, not % of daily intake.
    // (Daily ref values were misleading: a dinner's carbs always looked near-empty.)
    const maxMacro = Math.max(meal.protein, meal.carbs, meal.fat, meal.fibre);
    const macros = [{
      label: 'Protein',
      value: meal.protein,
      color: C.protein,
      refVal: maxMacro
    }, {
      label: 'Carbs',
      value: meal.carbs,
      color: C.carbs,
      refVal: maxMacro
    }, {
      label: 'Fat',
      value: meal.fat,
      color: C.fat,
      refVal: maxMacro
    }, {
      label: 'Fibre',
      value: meal.fibre,
      color: C.fibre,
      refVal: maxMacro
    }];
    const kcal = Math.round(meal.protein * 4 + meal.carbs * 4 + meal.fat * 9);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 100
      },
      'data-closing': closingSheet === 'recipe' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.recipe ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: () => closeWithAnim('recipe', () => setShowRecipe(false))
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.recipe ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '85%',
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {
      closeFn: () => closeWithAnim('recipe', () => setShowRecipe(false)),
      swipeDismissFn: () => setShowRecipe(false)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 200,
        background: C.bgEl,
        margin: '10px 16px 0',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 52,
        flexShrink: 0,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 52
      }
    }, meal.emoji), meal.photo && /*#__PURE__*/React.createElement("img", {
      src: meal.photo,
      alt: "",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      },
      onError: e => {
        e.target.style.display = 'none';
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 16px 0',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        lineHeight: 1.2,
        marginBottom: 7
      }
    }, meal.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: tc + '28',
        color: tc,
        borderRadius: 4,
        padding: '0 8px',
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.2
      }
    }, parseInt(meal.time) + " min"), /*#__PURE__*/React.createElement("span", {
      style: {
        background: (CUISINE_COLOR[meal.cuisine] || C.textSec) + '28',
        color: CUISINE_COLOR[meal.cuisine] || C.textSec,
        borderRadius: 4,
        padding: '0 8px',
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.2
      }
    }, meal.cuisine), conflictLabel && /*#__PURE__*/React.createElement("span", {
      style: {
        background: '#EF535022',
        color: '#EF5350',
        borderRadius: 4,
        padding: '0 8px',
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.2
      }
    }, conflictLabel))), /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleSaved(mealIdx),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 22,
        lineHeight: 1,
        padding: '2px 0',
        marginTop: 1,
        flexShrink: 0
      }
    }, savedSet.has(mealIdx) ? '❤️' : '🤍'), isPremium ? /*#__PURE__*/React.createElement("button", {onClick: () => toggleDisliked(mealIdx), style: {background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '2px 0', marginTop: 1, flexShrink: 0, opacity: dislikedSet.has(mealIdx)?1:0.4}}, '👎') : null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        padding: '12px 16px 0',
        gap: 4,
        flexShrink: 0
      }
    }, ['ingredients', 'method', 'macros'].map(tab => /*#__PURE__*/React.createElement("button", {
      key: tab,
      onClick: () => setRecipeTab(tab),
      style: {
        flex: 1,
        padding: '9px 0',
        background: recipeTab === tab ? C.accent : C.bgEl,
        border: 'none',
        borderRadius: 8,
        ...T.meta,
        fontWeight: recipeTab === tab ? 700 : 400,
        color: recipeTab === tab ? C.white : C.textSec,
        cursor: 'pointer',
        textTransform: 'capitalize'
      }
    }, tab))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Divider, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        padding: '0 16px',
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        gridArea: '1/1',
        opacity: recipeTab === 'ingredients' ? 1 : 0,
        pointerEvents: recipeTab === 'ingredients' ? 'auto' : 'none',
        transition: 'opacity 0.15s ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.label,
        color: C.textSec,
        padding: '10px 0 6px'
      }
    }, "Ingredients \xB7 1 serving"), (meal.ingredients || INGREDIENTS).map((ing, i) => { const bad = dishConflict && ingredientConflicts(ing.n, allergens, selectedDiet); return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: i < INGREDIENTS.length - 1 ? "1px solid ".concat(C.border) : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.body,
        color: bad ? '#EF5350' : C.text,
        fontWeight: bad ? 600 : 400
      }
    }, ing.n), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        color: bad ? '#EF5350' : C.textSec,
        marginLeft: 12,
        flexShrink: 0
      }
    }, ing.q)); }), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 16
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        gridArea: '1/1',
        opacity: recipeTab === 'method' ? 1 : 0,
        pointerEvents: recipeTab === 'method' ? 'auto' : 'none',
        transition: 'opacity 0.15s ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.label,
        color: C.textSec,
        padding: '10px 0 6px'
      }
    }, "Method"), (meal.steps || STEPS).map((step, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 11,
        marginBottom: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: C.bgEl,
        border: "1px solid ".concat(C.border),
        boxSizing: 'border-box',
        color: C.textSec,
        ...T.hint,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 0
      }
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.text,
        lineHeight: 1.55
      }
    }, step))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 16
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        gridArea: '1/1',
        opacity: recipeTab === 'macros' ? 1 : 0,
        pointerEvents: recipeTab === 'macros' ? 'auto' : 'none',
        transition: 'opacity 0.15s ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.label,
        color: C.textSec,
        padding: '10px 0 10px'
      }
    }, "Nutrition \xB7 1 serving"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 10
      }
    }, macros.map((m, mi) => /*#__PURE__*/React.createElement("div", {
      key: m.label,
      style: {
        background: C.bgEl,
        borderRadius: 10,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 12px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        color: C.text,
        lineHeight: 1
      }
    }, Math.round(m.value * macroP), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 400,
        color: C.textSec,
        marginLeft: 2
      }
    }, "g")), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.label,
        color: m.color,
        marginTop: 5
      }
    }, m.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: C.textHint,
        lineHeight: 1
      }
    }, Math.round(m.value / maxMacro * 100 * macroP), "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 3,
        background: C.bgSec,
        margin: '0 12px 10px',
        borderRadius: 2,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(m.value / maxMacro * 100, "%"),
        transform: "scaleX(".concat(macroP, ")"),
        transformOrigin: 'left',
        background: m.color,
        borderRadius: 2
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.bgEl,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.bodyMed,
        color: C.text
      }
    }, "Calories"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.hint,
        color: C.textSec,
        marginTop: 2
      }
    }, "Calculated from macros")), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.heading,
        color: C.accent
      }
    }, Math.round(kcal * macroP), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        color: C.textSec,
        fontWeight: 400,
        marginLeft: 4
      }
    }, "kcal"))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 16
      }
    })))));
  };

  // Store Connect Sheet
  const StoreSheet = () => {
    if (!showStore) return null;
    const commitAndClose = () => {
      if (storePick) {
        setStore(storePick);
      }
      closeWithAnim('store', () => setShowStore(false));
    };
    const discardAndClose = () => closeWithAnim('store', () => { setStorePick(pendingStore); setShowStore(false); });
    // Per-store price estimates — apply multiplier to the current included-items total
    const STORE_MULT = {
      Tesco: 1.00,
      Dunnes: 0.96,
      SuperValu: 1.04
    };
    const storeEsts = Object.fromEntries(STORES.map(s => [s.id, totalEstimate * (STORE_MULT[s.id] || 1)]));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 100
      },
      'data-closing': closingSheet === 'store' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.store ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: discardAndClose
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.store ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: discardAndClose, swipeDismissFn: () => { setStorePick(pendingStore); setShowStore(false); }}), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        marginBottom: 4
      }
    }, "Choose your store"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        marginBottom: 14
      }
    }, "Linked once \u2014 remembered automatically")), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 20px 6px'
      }
    }, STORES.map(s => /*#__PURE__*/React.createElement("div", {
      key: s.id,
      onClick: () => setStorePick(s.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 12,
        marginBottom: 8,
        background: storePick === s.id ? C.accent + '1F' : C.bgEl,
        border: "1.5px solid ".concat(storePick === s.id ? C.accent : C.border),
        cursor: 'pointer',
        transition: 'all 0.2s'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 26
      }
    }, s.emoji), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.body,
        color: C.text
      }
    }, s.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        color: C.textSec
      }
    }, s.sub), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        color: storePick === s.id ? C.accent : C.textSec,
        fontWeight: storePick === s.id ? 700 : 400,
        flexShrink: 0
      }
    }, "~\u20AC", storeEsts[s.id].toFixed(2))))))), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: storePick ? "Shop at ".concat(storePick) : 'Choose a store',
      active: !!storePick,
      onPress: commitAndClose
    }))));
  };

  // Portions Sheet — per-person S/M/L picker, regen-modal style
  const PortionsSheet = () => {
    if (!showPortions) return null;
    const cycleSeat = i => setPendingSeatSizes(prev => {
      const next = [...prev];
      next[i] = next[i] === 'M' ? 'L' : next[i] === 'L' ? 'S' : 'M';
      return next;
    });
    const commitAndClose = () => {
      setSeatSizes([...pendingSeatSizes]);
      setShowPortions(false);
    };
    const discardAndClose = () => closeWithAnim('portions', () => setShowPortions(false));
    const szBg = {
      S: C.carbs + '2a',
      M: C.accent + '2a',
      L: C.warning + '2a'
    };
    const szBorder = {
      S: C.carbs + '77',
      M: C.accent + '77',
      L: C.warning + '77'
    };
    const szText = {
      S: C.carbs,
      M: C.accent,
      L: C.warning
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 110
      },
      'data-closing': closingSheet === 'portions' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.portions ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: discardAndClose
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.portions ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: discardAndClose, swipeDismissFn: () => setShowPortions(false)}), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        marginBottom: 4
      }
    }, "Portion sizes"), /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec
      }
    }, "Tap a person to cycle their portion size"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, [{
      sz: 'S',
      label: 'Small',
      color: C.carbs
    }, {
      sz: 'M',
      label: 'Medium',
      color: C.accent
    }, {
      sz: 'L',
      label: 'Large',
      color: C.warning
    }].map(({
      sz,
      label,
      color
    }) => /*#__PURE__*/React.createElement("span", {
      key: sz,
      style: {
        ...T.hint,
        color,
        fontWeight: 700
      }
    }, sz, " \xB7 ", label))))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 20px 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 16
      }
    }, pendingSeatSizes.map((sz, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: () => cycleSeat(i),
      style: {
        borderRadius: 10,
        background: szBg[sz],
        border: "1.5px solid ".concat(szBorder[sz]),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0',
        cursor: 'pointer',
        transition: 'all 0.15s',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: C.text,
        lineHeight: 1
      }
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: szText[sz],
        lineHeight: 1
      }
    }, sz))))), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: "Done",
      onPress: commitAndClose
    }))));
  };

  // Regen Modal — within-week regeneration (3x max). New week generation is a separate app-entry dialog.
  const NewWeekModal = () => {
    if (!showNewWeek) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 100
      },
      'data-closing': closingSheet === 'newweek' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.newweek ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: () => closeWithAnim('newweek', () => setShowNewWeek(false))
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.newweek ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: () => closeWithAnim('newweek', () => setShowNewWeek(false)), swipeDismissFn: () => setShowNewWeek(false)}), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        marginBottom: 4
      }
    }, "Regenerate week"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5
      }
    }, Array.from({
      length: maxRegens
    }).map((_, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: i < regenLeft ? C.accent : C.bgEl,
        border: "1.5px solid ".concat(i < regenLeft ? C.accent : C.border),
        transition: 'background 0.2s'
      }
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        color: regenLeft > 0 ? C.textSec : C.error
      }
    }, regenLeft > 0 ? "".concat(regenLeft, " of ").concat(maxRegens, " left this week") : 'No regenerations left this week'))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '16px 20px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.textSec,
        lineHeight: 1.65,
        marginBottom: 6
      }
    }, "Not feeling this week's plan?"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.textHint,
        lineHeight: 1.65
      }
    }, "We'll pick 7 fresh meals around your diet type and food intolerances.")), /*#__PURE__*/React.createElement(ScreenFooter, null, /*#__PURE__*/React.createElement(Btn, {
      label: regenLeft > 0 ? 'Regenerate my week' : 'No regenerations left',
      active: regenLeft > 0,
      onPress: () => regenLeft > 0 ? setShowRegenConfirm(true) : showToast('No regenerations left this week.')
    }))));
  };

  // AI Insight Sheet — current week (✨ on plan) or past week (✨ on history detail)
  const InsightSheet = () => {
    const isOpen = showInsightSheet || !!historyInsightWeek;
    if (!isOpen) return null;
    const closeAll = () => closeWithAnim('insight', () => { setShowInsightSheet(false); setHistoryInsightWeek(null); });

    // Source meals: history week if open from history, otherwise current frozen plan
    const sourceMeals = historyInsightWeek ? historyInsightWeek.meals : mealOrder.map((_, i) => ({
      ...getMealAtDay(i),
      active: dayOn[i]
    })).filter(m => m.active);
    const mealCount = sourceMeals.length;
    const cuisines = [...new Set(sourceMeals.map(m => m.cuisine).filter(Boolean))];
    const avgTime = mealCount ? Math.round(sourceMeals.reduce((s, m) => s + parseInt(m.time || '0'), 0) / mealCount) : 0;
    const quickMeals = sourceMeals.filter(m => parseInt(m.time || '0') <= 25).map(m => m.name.split(' ')[0]);
    const bigMeal = sourceMeals.length ? sourceMeals.reduce((a, b) => parseInt(a.time || '0') > parseInt(b.time || '0') ? a : b) : null;
    const hasStew = sourceMeals.some(m => m.name.includes('Stew') || m.name.includes('Pie'));
    const weekCost = historyInsightWeek ? (historyInsightWeek.estimate || 0) : totalEstimate;
    const costPerDinner = mealCount ? Math.round(weekCost / mealCount) : 0;
    // Three lenses on the week — variety / effort / cost. Coloured number names the
    // dimension (not a macro); plain figures (no ~) read as the summary they are.
    const chips = [
      cuisines.length > 0 && { num: "".concat(cuisines.length), label: cuisines.length !== 1 ? 'cuisines' : 'cuisine', color: '#42A5F5' },
      avgTime > 0 && { num: "".concat(avgTime), label: 'min', color: '#FF9800' },
      costPerDinner > 0 && { num: "\u20AC".concat(costPerDinner), label: 'dinner', color: '#B388FF' }
    ].filter(Boolean);

    // Plain one-line read of the week — no quotes, no numbers (chips own those), no dots.
    const topCuisine = (() => {
      const cnt = {};
      sourceMeals.forEach(m => { if (m.cuisine) cnt[m.cuisine] = (cnt[m.cuisine] || 0) + 1; });
      return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || '';
    })();
    const summaryLine = (cuisines.length >= 3 ? 'A varied' : 'A focused') + (topCuisine ? ", ".concat(topCuisine, "-leaning") : '') + ' week.';

    // Tips: from past week data if history mode, otherwise derived from current meals
    const tips = historyInsightWeek?.tips || [bigMeal && parseInt(bigMeal.time || '0') >= 55 ? {
      icon: '🍖',
      text: "".concat(bigMeal.name, " takes ").concat(bigMeal.time, " \u2014 worth starting early. Clear your Sunday afternoon."), em: bigMeal.time
    } : {
      icon: '⚡',
      text: "All ".concat(mealCount, " meals are under 35 mins this week. Good for busy evenings."), em: 'under 35 mins'
    }, quickMeals.length >= 2 ? {
      icon: '⚡',
      text: "Quick wins: ".concat(quickMeals.slice(0, 3).join(', '), " \u2014 all under 25 mins. Save them for late nights."), em: 'under 25 mins'
    } : {
      icon: '🍳',
      text: 'Steady week — no meal goes beyond 45 mins if you prep the veg in advance.', em: 'Steady week'
    }, hasStew ? {
      icon: '🥘',
      text: 'Stews and pies improve overnight. Make the full portion and refrigerate half for next day.', em: 'improve overnight'
    } : {
      icon: '🛒',
      text: 'Ingredients overlap well — a single mid-week shop should cover everything.', em: 'a single mid-week shop'
    }].filter(Boolean);
    const subtitle = historyInsightWeek ? pastWeekRange(historyInsightWeek.delivery) : "".concat(mealCount, " meals this week");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 160
      },
      'data-closing': closingSheet === 'insight' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.insight ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: closeAll
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.insight ? 'sheet-done' : 'sheet-slide',
      onAnimationEnd: () => setSheetAnimDone(p => ({ ...p, insight: true })),
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: closeAll, swipeDismissFn: () => { setShowInsightSheet(false); setHistoryInsightWeek(null); }}), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        marginBottom: 4
      }
    }, "Week insight"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.meta,
        color: C.textSec
      }
    }, subtitle))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 20px 0',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, chips.map(c => /*#__PURE__*/React.createElement("span", {
      key: c.label,
      style: {
        border: "0.5px solid ".concat(C.border),
        borderRadius: 20,
        padding: '4px 11px',
        fontSize: 13,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: { color: c.color, fontWeight: 600 }
    }, c.num), " ", /*#__PURE__*/React.createElement("span", {
      style: { color: C.textHint }
    }, c.label)))), isPremium ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 20px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.textSec,
        lineHeight: 1.6
      }
    }, summaryLine), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, tips.map((t, i) => {
      const idx = t.em ? t.text.indexOf(t.em) : -1;
      const content = idx >= 0 ? [t.text.slice(0, idx), /*#__PURE__*/React.createElement("span", {
        key: 'em',
        style: { color: C.accent, fontWeight: 600 }
      }, t.em), t.text.slice(idx + t.em.length)] : t.text;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          gap: 11,
          alignItems: 'flex-start'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: C.accent,
          border: "1.5px solid ".concat(C.accent),
          flexShrink: 0,
          marginTop: 6
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          ...T.body,
          color: C.textSec,
          lineHeight: 1.6
        }
      }, content));
    }))) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 20px 28px',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        filter: 'blur(4px)',
        userSelect: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 14,
        borderRadius: 4,
        background: C.bgEl,
        width: '85%'
      }
    }), [1, 2, 3].map(k => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 4,
        background: C.bgEl,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 12,
        borderRadius: 4,
        background: C.bgEl,
        width: '100%'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 12,
        borderRadius: 4,
        background: C.bgEl,
        width: '70%'
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => {
        closeAll();
        go('paywall');
      },
      style: {
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        background: 'rgba(76,175,80,0.12)',
        border: "1px solid rgba(76,175,80,0.45)",
        borderRadius: 999,
        padding: '9px 22px',
        fontSize: 13,
        fontWeight: 700,
        color: C.accent,
        cursor: 'pointer',
        letterSpacing: 0.2
      }
    }, "\uD83D\uDD12 Unlock Premium")))));
  };

  // Day Picker Sheet — three modes: 'weekstart' (set week start), 'copy' (Plan), 'use' (Saved)
  const DayPickerSheet = () => {
    if (!showDayPicker) return null;
    const isUse = dpMode === 'use';
    const isWeekStart = dpMode === 'weekstart';

    // Delivery mode rows — 8 days starting today
    const deliveryRows = isWeekStart ? Array.from({
      length: 8
    }, (_, k) => {
      const d = new Date();
      d.setDate(d.getDate() + k);
      return d;
    }) : null;
    const pickDay = i => {
      if (isWeekStart) {
        const d = deliveryRows[i];
        setWeekStartDay(new Date(d));
        setShowDayPicker(false);
        showToast("Delivery: ".concat(DAY_SHORT[d.getDay()], " ").concat(d.getDate()));
        return;
      }
      if (isUse) {
        if (activeRecipe && activeRecipe.meal) {
          setActivePlan(prev => {
            const next = [...prev];
            next[mealOrder[i]] = activeRecipe.meal;
            return next;
          });
        }
        setShowDayPicker(false);
        showToast("Added to ".concat(cardLabel(i)));
      } else {
        if (copySource !== null && copySource !== i) {
          setOrder(p => {
            const n = [...p];
            n[i] = p[copySource];
            return n;
          });
          setSwapPos(p => {
            const n = [...p];
            n[i] = swapPos[copySource];
            return n;
          });
          showToast("Copied to ".concat(cardLabel(i)));
        }
        setShowDayPicker(false);
      }
    };
    const title = isWeekStart ? "When does your week start?" : isUse ? 'Add to your week' : 'Copy to which day?';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 110
      },
      'data-closing': closingSheet === 'daypicker' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.daypicker ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: () => closeWithAnim('daypicker', () => setShowDayPicker(false))
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.daypicker ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: () => closeWithAnim('daypicker', () => setShowDayPicker(false)), swipeDismissFn: () => setShowDayPicker(false)}), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        textAlign: 'center',
        padding: '2px 20px 14px',
        flexShrink: 0
      }
    }, title), /*#__PURE__*/React.createElement(Divider, null), isWeekStart ? /*#__PURE__*/React.createElement(React.Fragment, null,
  /* Calendar header: month nav */
  /*#__PURE__*/React.createElement("div", {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', flexShrink: 0 }
  },
    /*#__PURE__*/React.createElement("button", {
      onClick: () => setCalMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d; }),
      style: { background: 'none', border: 'none', fontSize: 20, color: C.textSec, cursor: 'pointer', padding: '4px 8px' }
    }, "\u2039"),
    /*#__PURE__*/React.createElement("span", { style: { ...T.bodyMed, color: C.text } },
      MONTH_SHORT[calMonth.getMonth()] + ' ' + calMonth.getFullYear()),
    /*#__PURE__*/React.createElement("button", {
      onClick: () => setCalMonth(m => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d; }),
      style: { background: 'none', border: 'none', fontSize: 20, color: C.textSec, cursor: 'pointer', padding: '4px 8px' }
    }, "\u203A")),
  /* Day headers */
  /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px', marginBottom: 4, flexShrink: 0 }
  }, ['M','T','W','T','F','S','S'].map((d, i) =>
    /*#__PURE__*/React.createElement("div", {
      key: i,
      style: { textAlign: 'center', ...T.hint, color: C.textHint, paddingBottom: 6, fontWeight: 600 }
    }, d))),
  /* Calendar grid */
  /*#__PURE__*/React.createElement("div", {
    style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px 20px', gap: '6px 0', flexShrink: 0 }
  }, (() => {
    const yr = calMonth.getFullYear(), mo = calMonth.getMonth();
    const firstDow = (new Date(yr, mo, 1).getDay() + 6) % 7; // Mon=0
    const dim = new Date(yr, mo + 1, 0).getDate();
    const today0 = new Date(); today0.setHours(0,0,0,0);
    const selStr = weekStartDay.toDateString();
    const cells = [];
    for (let e = 0; e < firstDow; e++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells.map((d, idx) => {
      if (!d) return /*#__PURE__*/React.createElement("div", { key: idx });
      const date = new Date(yr, mo, d);
      const isPast = date < today0;
      const isSel = date.toDateString() === selStr;
      const isToday = date.toDateString() === today0.toDateString();
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        onClick: isPast ? undefined : () => { setWeekStartDay(new Date(yr, mo, d)); setShowDayPicker(false); showToast('Week starts ' + DAY_SHORT[date.getDay()] + ' ' + d); },
        style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, cursor: isPast ? 'default' : 'pointer' }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 34, height: 34, borderRadius: '50%', boxSizing: 'border-box',
          background: isSel ? C.accent : 'transparent',
          border: isToday && !isSel ? "1.5px solid ".concat(C.textHint) : '1.5px solid transparent',
          color: isSel ? C.white : isPast ? C.textHint : C.text,
          fontSize: 14, fontWeight: isSel || isToday ? 700 : 400,
          opacity: isPast ? 0.35 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
      }, d));
    });
  })())) :
    /*#__PURE__*/
    /* Copy / Use mode — plan day rows */
    React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        scrollbarWidth: 'none'
      }
    }, mealOrder.map((_, i) => {
      const isOff = !dayOn[i];
      const meal = getMealAtDay(i);
      const shownName = meal.name;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        onClick: isOff ? undefined : () => pickDay(i),
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '13px 20px',
          borderBottom: "1px solid ".concat(C.border),
          cursor: isOff ? 'default' : 'pointer',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: 700,
          color: isOff ? C.textHint : C.accent,
          width: 58,
          flexShrink: 0,
          letterSpacing: 0.5,
          whiteSpace: 'nowrap'
        }
      }, cardLabel(i)), /*#__PURE__*/React.createElement("span", {
        style: {
          ...T.meta,
          color: isOff ? C.textHint : C.textSec,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontStyle: isOff ? 'italic' : 'normal'
        }
      }, isOff ? 'Day off' : shownName), !isOff && /*#__PURE__*/React.createElement("span", {
        style: {
          color: C.textHint,
          fontSize: 18,
          flexShrink: 0,
          lineHeight: 1
        }
      }, "\u203A"));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        height: S.ftPadB + S.ftPadT
      }
    })));
  };

  // Substitutions Review Sheet
  const SubsSheet = () => {
    if (!showSubs) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 120
      },
      'data-closing': closingSheet === 'subs' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.subs ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: () => closeWithAnim('subs', () => setShowSubs(false))
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.subs ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 500
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: () => closeWithAnim('subs', () => setShowSubs(false)), swipeDismissFn: () => setShowSubs(false)}), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        marginBottom: 4
      }
    }, "Substitutions"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        marginBottom: 14
      }
    }, "Items swapped by ", store || 'your store', " \u2014 similar quality.")), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        scrollbarWidth: 'none',
        padding: '14px 20px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.bgEl,
        borderRadius: 12,
        padding: '0 16px',
        overflow: 'hidden'
      }
    }, [{
      from: 'Cod fillet',
      to: 'Haddock fillet'
    }, {
      from: 'Baby potatoes',
      to: 'New potatoes'
    }, {
      from: 'Double cream',
      to: 'Whipping cream'
    }, {
      from: 'Cherry tomatoes',
      to: 'Vine tomatoes'
    }, {
      from: 'Unsalted butter',
      to: 'Salted butter'
    }, {
      from: 'Free-range eggs',
      to: 'Barn eggs'
    }, {
      from: 'Sourdough loaf',
      to: 'White bloomer'
    }, {
      from: 'Whole milk',
      to: 'Semi-skimmed milk'
    }, {
      from: 'Streaky bacon',
      to: 'Back bacon'
    }].map((s, i, a) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '13px 0',
        borderBottom: i < a.length - 1 ? "1px solid ".concat(C.border) : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.body,
        color: C.textSec,
        flex: 1,
        minWidth: 0
      }
    }, s.from), /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.textHint,
        fontSize: 14,
        flexShrink: 0
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...T.body,
        color: C.text,
        flex: 1,
        minWidth: 0,
        textAlign: 'right'
      }
    }, s.to))))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: S.ftPadB + S.ftPadT
      }
    })));
  };

  // Missing Items Sheet
  const MissingSheet = () => {
    if (!showMissing) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 120
      },
      'data-closing': closingSheet === 'missing' ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.missing ? 'backdrop-done' : 'backdrop-anim',
      style: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.65)'
      },
      onClick: () => closeWithAnim('missing', () => setShowMissing(false))
    }), /*#__PURE__*/React.createElement("div", {
      className: sheetAnimDone.missing ? 'sheet-done' : 'sheet-slide',
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: C.bgSec,
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SheetHandle, {closeFn: () => closeWithAnim('missing', () => setShowMissing(false)), swipeDismissFn: () => setShowMissing(false)}), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 20px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.title,
        color: C.text,
        marginBottom: 4
      }
    }, "Unavailable items"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.meta,
        color: C.textSec,
        marginBottom: 14
      }
    }, "Out of stock at your store \u2014 not added to cart.")), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 20px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: C.bgEl,
        borderRadius: 12,
        padding: '0 16px',
        overflow: 'hidden'
      }
    }, ['Lamb shoulder 500g', 'Fresh dill 30g', 'Crème fraîche 200ml'].map((item, i, a) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: '13px 0',
        borderBottom: i < a.length - 1 ? "1px solid ".concat(C.border) : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...T.body,
        color: C.text
      }
    }, item))))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: S.ftPadB + S.ftPadT
      }
    })));
  };

  // ─── Share Sheet — single component for WeekComplete + HistoryDetailScreen ───
  const ShareSheet = () => {
    if (!showShareSheet) return null;
    const isHistory = !!historyWeek;
    const items = isHistory
      ? historyWeek.meals.map((m, i) => {
          const full = ALL_RECIPES.find(r => r.name === m.name) || m;
          const d = new Date(historyWeek.delivery);
          d.setDate(d.getDate() + i);
          return { meal: { ...full, name: m.name, emoji: m.emoji, cuisine: m.cuisine, time: m.time, photo: full.photo }, label: DAY_SHORT[d.getDay()].toUpperCase() + ' ' + d.getDate() };
        })
      : mealOrder.map((_, i) => i).filter(i => dayOn[i]).map(i => ({ meal: getMealAtDay(i), label: cardLabel(i) }));
    const ms = items.map(x => x.meal);
    const n = ms.length || 1;
    const avg = k => Math.round(ms.reduce((sum, m) => sum + (m[k] || 0), 0) / n);
    const pr = avg('protein'), cb = avg('carbs'), ft = avg('fat');
    const kcal = Math.round(pr * 4 + cb * 4 + ft * 9);
    const macros = [{ v: kcal, u: 'kcal', col: C.text }, { v: pr + 'g', u: 'P', col: C.protein }, { v: cb + 'g', u: 'C', col: C.carbs }, { v: ft + 'g', u: 'F', col: C.fat }];
    const startD = isHistory ? new Date(historyWeek.delivery) : cardDate(0);
    const endD = isHistory ? (() => { const d = new Date(historyWeek.delivery); d.setDate(d.getDate() + 6); return d; })() : cardDate(6);
    const weekLabel = 'Week of ' + startD.getDate() + '\u2013' + endD.getDate() + ' ' + MONTH_SHORT[endD.getMonth()];
    const close = () => closeWithAnim('share', () => setShowShareSheet(false));
    return /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', inset: 0, zIndex: 140 }, 'data-closing': closingSheet === 'share' ? 'true' : undefined },
      /*#__PURE__*/React.createElement("div", { className: sheetAnimDone.share ? 'backdrop-done' : 'backdrop-anim', style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }, onClick: close }),
      /*#__PURE__*/React.createElement("div", { className: sheetAnimDone.share ? 'sheet-done' : 'sheet-slide', onAnimationEnd: () => setSheetAnimDone(prev => ({ ...prev, share: true })), style: { position: 'absolute', bottom: 0, left: 0, right: 0, background: C.bgSec, borderRadius: '18px 18px 0 0' } },
        /*#__PURE__*/React.createElement(SheetHandle, { closeFn: close, swipeDismissFn: () => setShowShareSheet(false) }),
        /*#__PURE__*/React.createElement("div", { style: { margin: '4px 16px 12px', borderRadius: 16, overflow: 'hidden', border: '1px solid ' + C.accent + '44', background: C.bg } },
          /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px 11px', borderBottom: '1px solid ' + C.border } },
            /*#__PURE__*/React.createElement("img", { src: 'header-logo.png', alt: 'AllSorted', style: { height: 20, width: 'auto', objectFit: 'contain' } }),
            /*#__PURE__*/React.createElement("span", { style: { color: C.textSec, fontSize: 11, fontWeight: 600 } }, weekLabel)
          ),
          /*#__PURE__*/React.createElement("div", { style: { padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 } },
            items.map((it, i) => {
              const m = it.meal;
              const isHero = i === 0;
              const isOrphan = i === items.length - 1 && (items.length - 1) % 2 === 1;
              const full = isHero || isOrphan;
              const h = isHero ? 112 : isOrphan ? 74 : 88;
              return /*#__PURE__*/React.createElement("div", { key: i, style: { gridColumn: full ? 'span 2' : undefined, position: 'relative', height: h, borderRadius: 10, overflow: 'hidden', background: C.bgEl, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isHero ? 40 : 30, opacity: 0.5 } }, m.emoji),
                m.photo && /*#__PURE__*/React.createElement("img", { src: m.photo, alt: "", style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }, onError: e => { e.target.style.display = 'none'; } }),
                /*#__PURE__*/React.createElement("div", { style: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: isHero ? '7px 10px' : '6px 9px', background: 'rgba(0,0,0,0.5)' } },
                  /*#__PURE__*/React.createElement("span", { style: { fontSize: isHero ? 13 : 12, fontWeight: 600, color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' } }, m.name))
              );
            })
          ),
          /*#__PURE__*/React.createElement("div", { style: { background: '#0A1A0A', padding: '12px 14px 13px', borderTop: '1px solid ' + C.accent + '22', textAlign: 'center' } },
            /*#__PURE__*/React.createElement("div", { style: { ...T.label, color: C.textHint, marginBottom: 7 } }, 'Macros per dinner'),
            /*#__PURE__*/React.createElement("div", { style: { display: 'inline-flex', gap: 16, whiteSpace: 'nowrap' } },
              macros.map(m => /*#__PURE__*/React.createElement("span", { key: m.u, style: { fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' } },
                /*#__PURE__*/React.createElement("span", { style: { color: m.col } }, m.v),
                /*#__PURE__*/React.createElement("span", { style: { color: C.textHint, fontSize: 11, marginLeft: 3 } }, m.u)
              ))
            )
          )
        ),
        /*#__PURE__*/React.createElement("div", { style: { padding: '0 16px 4px' } },
          /*#__PURE__*/React.createElement(Btn, { label: 'Share', onPress: () => { setShowShareSheet(false); showToast('Opening share\u2026'); } })
        ),
        /*#__PURE__*/React.createElement("div", { style: { height: S.ftPadB } })
      )
    );
  };

  // Past Weeks list screen
  const PastWeeksScreen = () => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    left: /*#__PURE__*/React.createElement("button", {
      onClick: () => goBack(),
      style: {
        background: 'none',
        border: 'none',
        fontSize: 26,
        cursor: 'pointer',
        color: C.textSec,
        padding: '0 4px',
        lineHeight: 1
      }
    }, "\u2039")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: "14px ".concat(S.frame, "px 32px"),
      scrollbarWidth: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, PAST_WEEKS.map(week => /*#__PURE__*/React.createElement("div", {
    key: week.id,
    onClick: () => {
      setHistoryWeek(week);
      go('historydetail');
    },
    style: {
      background: C.bgSec,
      borderRadius: 12,
      padding: '13px 16px',
      cursor: 'pointer',
      border: "1px solid ".concat(C.border),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...T.body,
      color: C.text
    }
  }, pastWeekRange(week.delivery)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.textHint,
      fontSize: 18
    }
  }, "\u203A")))), /*#__PURE__*/React.createElement(ScreenFooter, {
    center: true
  }, /*#__PURE__*/React.createElement(BrandTagline, null)));

  // ─── History detail screen — frozen plan style ──────────────────────────────
  const HistoryDetailScreen = () => {
    if (!historyWeek) return null;
    const hCardDate = i => {
      const d = new Date(historyWeek.delivery);
      d.setDate(d.getDate() + i);
      return d;
    };
    const crossesMonth = historyWeek.delivery.getMonth() !== hCardDate(6).getMonth();
    const monthLabel = crossesMonth ? "".concat(MONTH_SHORT[historyWeek.delivery.getMonth()], " \u2013 ").concat(MONTH_SHORT[hCardDate(6).getMonth()]) : MONTH_SHORT[historyWeek.delivery.getMonth()];
    const badge = (label, color, truncate) => /*#__PURE__*/React.createElement("span", {
      style: {
        background: color + '28',
        color,
        borderRadius: 4,
        padding: '0 6px',
        height: 18,
        display: 'inline-block',
        lineHeight: '18px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 0.2,
        flexShrink: truncate ? 1 : 0,
        minWidth: truncate ? 0 : undefined,
        overflow: truncate ? 'hidden' : undefined,
        textOverflow: truncate ? 'ellipsis' : undefined,
        whiteSpace: truncate ? 'nowrap' : undefined,
      }
    }, label);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      left: /*#__PURE__*/React.createElement("button", {
        onClick: () => go('pastweeks', { back: true }),
        style: {
          background: 'none',
          border: 'none',
          fontSize: 26,
          cursor: 'pointer',
          color: C.textSec,
          padding: '0 4px',
          lineHeight: 1
        }
      }, "\u2039"),
      badge: /*#__PURE__*/React.createElement("span", {
        style: {
          background: 'transparent',
          border: "1px solid ".concat(C.border),
          borderRadius: 20,
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 600,
          color: C.textSec,
          whiteSpace: 'nowrap'
        }
      }, monthLabel),
      center: /*#__PURE__*/React.createElement("span", {
        style: {
          ...T.logo,
          color: C.text
        }
      }, "AllSorted"),
      right: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setHistoryInsightWeek(historyWeek),
        style: {
          background: 'none',
          border: 'none',
          fontSize: 18,
          cursor: 'pointer',
          color: C.textSec,
          padding: '2px 4px',
          lineHeight: 1
        }
      }, "\u2728"), /*#__PURE__*/React.createElement("button", {
        onClick: () => setShowShareSheet(true),
        style: {
          background: 'none',
          border: 'none',
          fontSize: 18,
          cursor: 'pointer',
          color: C.textSec,
          padding: '2px 4px',
          lineHeight: 1
        }
      }, "\uD83D\uDCE4"))
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: '6px 8px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto'
      }
    }, historyWeek.meals.map((meal, i) => {
      const cc = CUISINE_COLOR[meal.cuisine] || C.textSec;
      const tc = meal.time ? timeColor(meal.time) : C.textSec;
      const fullMeal = ALL_RECIPES.find(m => m.name === meal.name) || {
        ...meal,
        serves: 4,
        allergens: [],
        incompatible: [],
        carbs: 30,
        fat: 12,
        fibre: 4
      };
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          background: C.bgSec,
          borderRadius: 10,
          border: '1px solid transparent',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }
      }, /*#__PURE__*/React.createElement(MealCardBody, {
        meal: { ...fullMeal, emoji: meal.emoji, time: meal.time, cuisine: meal.cuisine, name: meal.name, photo: fullMeal.photo },
        label: null,
        ordinal: String(i + 1),
        isFrozen: true,
        isOff: false,
        idx: i,
        isDragging: false,
        hasConflict: false,
        onOpen: () => { setActiveRecipe({ meal: fullMeal, mealIdx: 0 }); setRecipeTab('ingredients'); setShowRecipe(true); }
      }));
    })), /*#__PURE__*/React.createElement(ScreenFooter, {
      center: true
    }, /*#__PURE__*/React.createElement(BrandTagline, null)));
  };

  // Disliked screen
  const DislikedScreen = () => {
    const dislikedRecipes = ALL_RECIPES.filter(r => dislikedSet.has(r.id));
    const hasFilters = savedCuisines.length > 0 || savedTime !== 'any';
    const filtered = dislikedRecipes.filter(r => {
      if (savedCuisines.length > 0 && !savedCuisines.includes(r.cuisine)) return false;
      if (savedTime === '15' && parseInt(r.time) > 15) return false;
      if (savedTime === '20' && parseInt(r.time) > 20) return false;
      if (savedTime === '30' && parseInt(r.time) > 30) return false;
      if (savedTime === '45' && parseInt(r.time) > 45) return false;
      if (savedTime === '60' && parseInt(r.time) > 60) return false;
      return true;
    });
    const openFilters = () => { setPendingCuisines([...savedCuisines]); setPendingTime(savedTime); setShowSavedFilters(true); };
    return /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
    }, /*#__PURE__*/React.createElement(ScreenHeader, {
      left: /*#__PURE__*/React.createElement("button", {
        onClick: () => goBack(),
        style: { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: C.textSec, padding: '0 4px', lineHeight: 1 }
      }, "\u2039"),
      right: /*#__PURE__*/React.createElement("button", {
        onClick: openFilters,
        style: { background: 'transparent', border: "1px solid ".concat(hasFilters ? C.accent : C.border), borderRadius: 20, padding: '4px 12px', color: hasFilters ? C.accent : C.textSec, ...T.hint, fontWeight: 600, cursor: 'pointer' }
      }, 'Filters')
    }), /*#__PURE__*/React.createElement("div", {
      style: { flex: 1, overflowY: 'auto', padding: '14px', scrollbarWidth: 'none' }
    }, filtered.length === 0
      ? /*#__PURE__*/React.createElement("div", {
          style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px', gap: 12 }
        }, /*#__PURE__*/React.createElement("div", { style: { fontSize: 48 } }, dislikedRecipes.length === 0 ? '\uD83D\uDC4E' : '\uD83D\uDD0D'),
        /*#__PURE__*/React.createElement("div", { style: { ...T.bodyMed, color: C.textSec } }, dislikedRecipes.length === 0 ? 'No disliked recipes' : 'No recipes match'),
        /*#__PURE__*/React.createElement("div", { style: { ...T.body, color: C.textHint, lineHeight: 1.6 } }, dislikedRecipes.length === 0 ? 'Thumbs-down a recipe to hide it from future plans.' : 'Try adjusting your filters.'))
      : /*#__PURE__*/React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
        filtered.map(r => {
          const tc2 = t => { const m = parseInt(t); return m <= 20 ? C.accent : m <= 40 ? C.warning : '#EF6C00'; };
          return /*#__PURE__*/React.createElement("div", {
            key: r.id,
            onClick: () => { setActiveRecipe({ meal: r, mealIdx: r.id, fromSaved: true }); setRecipeTab('ingredients'); setShowRecipe(true); },
            style: { background: C.bgSec, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: "1px solid transparent" }
          }, /*#__PURE__*/React.createElement("div", {
            style: { height: 90, background: C.bgEl, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }
          }, r.photo ? /*#__PURE__*/React.createElement("img", { src: r.photo, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' }, onError: e => { e.target.style.display = 'none'; } }) : null),
          /*#__PURE__*/React.createElement("div", { style: { padding: '9px 10px 10px' } },
            /*#__PURE__*/React.createElement("div", { style: { ...T.bodyMed, color: C.text, lineHeight: 1.3, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, r.name),
            /*#__PURE__*/React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' } },
              /*#__PURE__*/React.createElement("span", { style: { background: tc2(r.time) + '28', color: tc2(r.time), borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, flexShrink: 0 } }, parseInt(r.time) + ' min'),
              /*#__PURE__*/React.createElement("span", { style: { background: (CUISINE_COLOR[r.cuisine] || C.textSec) + '28', color: CUISINE_COLOR[r.cuisine] || C.textSec, borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 600, flexShrink: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, r.cuisine))));
        }))))
  };

  // ─── Screen map ────────────────────────────────────────────────────────────────
  const screens = {
    splash: /*#__PURE__*/React.createElement(Splash, null),
    onboarding1: /*#__PURE__*/React.createElement(Onboarding, {
      slide: 1
    }),
    onboarding2: /*#__PURE__*/React.createElement(Onboarding, {
      slide: 2
    }),
    onboarding3: /*#__PURE__*/React.createElement(Onboarding, {
      slide: 3
    }),
    auth: /*#__PURE__*/React.createElement(Auth, null),
    pref1: /*#__PURE__*/React.createElement(Pref1, null),
    pref2: /*#__PURE__*/React.createElement(Pref2, null),
    generating: /*#__PURE__*/React.createElement(Generating, null),
    plan: PlanScreen(),
    shop: ShopScreen(),
    // both called as fns (not components) so DOM nodes + event listeners stay stable across state changes
    injecting: /*#__PURE__*/React.createElement(Injecting, null),
    cartready: /*#__PURE__*/React.createElement(CartReady, null),
    webview: /*#__PURE__*/React.createElement(WebViewScreen, null),
    weekcomplete: /*#__PURE__*/React.createElement(WeekComplete, null),
    saved: /*#__PURE__*/React.createElement(SavedScreen, null),
    profile: /*#__PURE__*/React.createElement(ProfileScreen, null),
    pastweeks: /*#__PURE__*/React.createElement(PastWeeksScreen, null),
    disliked: /*#__PURE__*/React.createElement(DislikedScreen, null),
    historydetail: /*#__PURE__*/React.createElement(HistoryDetailScreen, null),
    legal: /*#__PURE__*/React.createElement(LegalScreen, null),
    paywall: /*#__PURE__*/React.createElement(Paywall, null)
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif',
      // Safe-area insets — mirrors what SafeAreaView will do in the real RN app.
      // Needed because the status bar is "black-translucent" (overlays content)
      // and viewport-fit=cover is set, so without this the header wordmark and
      // bottom buttons/sheets would render under the notch / home-indicator on
      // real notched phones. env() falls back to 0px on devices without insets
      // (incl. our desktop phone-frame), so this is invisible everywhere else.
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }
  }, /*#__PURE__*/React.createElement("style", null, "\n        * { box-sizing: border-box; }\n        ::-webkit-scrollbar { display: none; }\n        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }\n        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }\n        @keyframes toastIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }\n        @keyframes splashIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }\n        @keyframes splashFadeIn { from { opacity:0; } to { opacity:1; } }\n        @keyframes cartRollIn { 0%{ transform:translateX(-280px) rotate(-12deg); opacity:0 } 55%{ transform:translateX(16px) rotate(4deg); opacity:1 } 76%{ transform:translateX(-7px) rotate(-2deg) } 100%{ transform:translateX(0) rotate(0) } }\n        @keyframes wheelSpin { from{ transform:rotate(0) } to{ transform:rotate(360deg) } }\n        @keyframes taglineIn { from{ opacity:0; transform:translateY(8px) } to{ opacity:1; transform:translateY(0) } }\n        @keyframes screenIn { from{ opacity:0; transform:translateY(12px) } to{ opacity:1; transform:translateY(0) } }\n        @keyframes cardIn { from{ opacity:0; transform:translateY(14px) } to{ opacity:1; transform:translateY(0) } }\n        .splash-root { animation: splashFadeIn 0.5s ease-out both; }\n        .splash-cart { transform-box:fill-box; transform-origin:center; animation: cartRollIn 0.85s cubic-bezier(0.22,1,0.36,1) 0.35s both; }\n        .splash-wheel { transform-box:fill-box; transform-origin:center; animation: wheelSpin 0.85s cubic-bezier(0.22,1,0.36,1) 0.35s both; }\n        .splash-tagline { animation: taglineIn 0.5s ease-out 0.55s both; }\n        .onboard-enter { animation: screenIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }\n        @media (prefers-reduced-motion: reduce) { .splash-root, .splash-cart, .splash-wheel, .splash-tagline, .onboard-enter { animation: none !important; } }\n        @keyframes slideUp { from { transform:translateY(14px); opacity:0.5 } to { transform:translateY(0); opacity:1 } }\n        @keyframes slideDown { from { transform:translateY(0); opacity:1 } to { transform:translateY(14px); opacity:0 } }\n        @keyframes fadeOutBg { from { opacity:1 } to { opacity:0 } }\n        [data-closing='true'] .sheet-slide, [data-closing='true'] .sheet-done { animation: slideDown 0.28s cubic-bezier(0.32,0.72,0,1) both; }\n        [data-closing='true'] .backdrop-anim, [data-closing='true'] .backdrop-done { animation: fadeOutBg 0.22s ease both; }\n        .sheet-done { transform: translateY(0); }\n        .backdrop-done { opacity: 1; }\n        @keyframes fadeInBg { from { opacity:0 } to { opacity:1 } }\n        .sheet-slide { animation: slideUp 0.22s ease-out both; }\n        .backdrop-anim { animation: fadeInBg 0.2s ease both; }\n        @keyframes pushIn { from { opacity:0 } to { opacity:1 } }\n        .screen-push { animation: pushIn 0.2s ease-out both; }\n        button { transition: transform 0.12s ease; }\n        button:not(:disabled):active { transform: scale(0.97); }\n        @media (prefers-reduced-motion: reduce) { .screen-push { animation: none !important; } button:not(:disabled):active { transform: none !important; } }\n        input { font-family: inherit; }\n        input::placeholder { color: #5E5E5E; }\n      "), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: C.bg,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    key: screen,
    className: 'screen-push',
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, screens[screen] || null), /*#__PURE__*/React.createElement(RecipeSheet, null), /*#__PURE__*/React.createElement(StoreSheet, null), /*#__PURE__*/React.createElement(PortionsSheet, null), /*#__PURE__*/React.createElement(NewWeekModal, null), /*#__PURE__*/React.createElement(InsightSheet, null), /*#__PURE__*/React.createElement(DayPickerSheet, null), /*#__PURE__*/React.createElement(SubsSheet, null), /*#__PURE__*/React.createElement(MissingSheet, null), /*#__PURE__*/React.createElement(ShareSheet, null), /*#__PURE__*/React.createElement(SavedFilterSheet, null), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 80,
      left: 0,
      right: 0,
      zIndex: 300,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
      animation: 'toastIn 0.2s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(18,18,18,0.94)',
      border: "1px solid ".concat(C.border),
      borderRadius: 999,
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.accent,
      fontSize: 12,
      fontWeight: 700
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: C.text
    }
  }, toast))), showRegenConfirm && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 270,
      background: C.bgSec,
      borderRadius: 14,
      overflow: 'hidden',
      border: "1px solid ".concat(C.border)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 16px 14px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.bodyMed,
      color: C.text,
      marginBottom: 6
    }
  }, "Replace this week?"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...T.meta,
      color: C.textSec,
      lineHeight: 1.5
    }
  }, "All 7 meals will be swapped for a fresh set. This uses one regeneration (", regenLeft, " left).")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid ".concat(C.border),
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowRegenConfirm(false),
    style: {
      flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.body,
      color: C.textSec,
      cursor: 'pointer',
      borderRight: "1px solid ".concat(C.border)
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      setShowRegenConfirm(false);
      regen();
    },
    style: {
            flex: 1,
      padding: '13px 8px',
      textAlign: 'center',
      ...T.bodyMed,
      color: C.accent,
      cursor: 'pointer'
    }
  }, "Regenerate")))))));
}

ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(AllSortedPrototype, null));
