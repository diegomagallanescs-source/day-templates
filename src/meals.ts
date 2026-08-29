// Meal ideas, baked into the code like templates.ts. Leaning GERD-friendly:
// mostly low-fat, non-spicy, low-acid. A couple of the classics (alfredo,
// meatballs) are richer than strict GERD guidance prefers — kept because
// they were specifically requested, with a lighter-prep note attached.

export interface Meal {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const MEALS: Meal[] = [
  {
    id: 'chicken-alfredo',
    name: 'Chicken Alfredo',
    emoji: '🍝',
    description: 'Grilled chicken, fettuccine, light cream sauce. Skip the garlic-heavy versions and go easy on the butter to keep it gentler on reflux.',
  },
  {
    id: 'spaghetti-meatballs',
    name: 'Spaghetti & Meatballs',
    emoji: '🍝',
    description: 'Lean turkey or chicken meatballs over pasta. Use a low-acid or no-added-sugar marinara — regular tomato sauce is one of the more common reflux triggers.',
  },
  {
    id: 'chicken-rice-bowl',
    name: 'Grilled Chicken & Rice Bowl',
    emoji: '🍚',
    description: 'Grilled chicken breast, steamed rice, roasted carrots and zucchini. Simple, low-fat, batch-cooks well for both lunch and dinner.',
  },
  {
    id: 'baked-salmon-sweet-potato',
    name: 'Baked Salmon with Sweet Potato',
    emoji: '🐟',
    description: 'Baked (not fried) salmon, roasted sweet potato, steamed green beans. Skip citrus-based marinades — try dill or ginger instead.',
  },
  {
    id: 'turkey-stuffed-peppers',
    name: 'Turkey & Rice Stuffed Peppers',
    emoji: '🫑',
    description: 'Lean ground turkey, rice, mild bell peppers. No chili powder or hot spice — keep the seasoning mild.',
  },
  {
    id: 'chicken-veggie-stirfry',
    name: 'Chicken & Vegetable Stir-Fry',
    emoji: '🥢',
    description: 'Chicken breast, broccoli, carrots, snap peas, light soy-ginger sauce. Skip the chili oil and keep the oil light.',
  },
  {
    id: 'baked-cod-veggies',
    name: 'Baked Cod with Steamed Vegetables',
    emoji: '🐠',
    description: 'Mild white fish, baked plain or with herbs, over rice with steamed vegetables. One of the gentlest options on this list.',
  },
  {
    id: 'chicken-noodle-soup',
    name: 'Chicken Noodle Soup',
    emoji: '🍲',
    description: 'Chicken, carrots, celery, egg noodles in a light broth. Easy to make in a big batch and reheats well all week.',
  },
  {
    id: 'chicken-sandwich',
    name: 'Grilled Chicken Sandwich',
    emoji: '🥪',
    description: 'Grilled chicken breast, whole wheat bun, lettuce. Skip the mayo/mustard-heavy or citrus dressings if reflux is active.',
  },
  {
    id: 'baked-chicken-mashed-potato',
    name: 'Baked Chicken with Mashed Potatoes',
    emoji: '🍗',
    description: 'Baked (skin-off) chicken breast, mashed potatoes, steamed green beans. About as classic and gentle a comfort-food dinner as it gets.',
  },
];
