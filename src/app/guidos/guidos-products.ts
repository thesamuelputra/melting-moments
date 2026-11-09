// The Guido's Gourmet range as the public page needs it. The owner manages the
// real list in the admin; this file carries the shape, the house order of the
// categories, and the starting range the page shows while the table is empty.

export type GuidosProduct = {
  id: string;
  name: string;
  category: string;
  priceFrom: number;
  sizes: { label: string; price: number }[];
  isAvailable: boolean;
  isLimitedEdition: boolean;
};

export const CATEGORY_ORDER = ['Lasagnes', 'Pot Pies', 'Soups', 'Pasta', 'Desserts', 'Holiday'];

const starter = (
  name: string,
  category: string,
  priceFrom: number,
  sizes: { label: string; price: number }[] = [],
  isLimitedEdition = false,
): GuidosProduct => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name,
  category,
  priceFrom,
  sizes,
  isAvailable: true,
  isLimitedEdition,
});

export const FALLBACK_PRODUCTS: GuidosProduct[] = [
  starter('Beef Bolognese Lasagne', 'Lasagnes', 27, [{ label: 'Family (4-6)', price: 27 }, { label: 'Party (8-10)', price: 45 }]),
  starter('Meat Lasagne', 'Lasagnes', 16.95, [{ label: 'Single', price: 16.95 }, { label: 'Family (4-6)', price: 27 }]),
  starter('Veggie Lasagne', 'Lasagnes', 14, [{ label: 'Single', price: 14 }, { label: 'Family (4-6)', price: 24 }]),
  starter('Vegan Lasagne with Roasted Veg', 'Lasagnes', 14),
  starter('Eggplant Parmesan', 'Lasagnes', 14),
  starter('Turkey Pot Pie', 'Pot Pies', 9),
  starter('Beef Stew', 'Soups', 12),
  starter('Beef Barley Soup', 'Soups', 10),
  starter('Broccoli Cheddar Soup', 'Soups', 10),
  starter('Spaghetti and Meatballs', 'Pasta', 14),
  starter('Pulled Pork Mac and Cheese', 'Pasta', 14),
  starter('Mac and Cheese', 'Pasta', 12),
  starter('Peanut Chicken', 'Pasta', 14),
  starter('Tiramisu', 'Desserts', 12),
  starter('Tiramisu Cans, five flavours', 'Desserts', 9.95),
  starter('Turkey Dinner', 'Holiday', 25, [], true),
];
