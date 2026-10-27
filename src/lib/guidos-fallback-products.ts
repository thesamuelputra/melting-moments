/**
 * The Guido's menu as built into the site, shown whenever the CMS has no
 * products yet or cannot be reached. Shared by the Guido's landing page and
 * the menu page fallback; kept out of the client components so server code
 * can read it too.
 */
export type FallbackProduct = {
  name: string;
  category: string;
  priceFrom: number;
  sizes?: { label: string; price: number }[];
  image: string;
  isAvailable: boolean;
  isLimitedEdition: boolean;
};

export const GUIDOS_FALLBACK_PRODUCTS: FallbackProduct[] = [
  // Lasagnes
  { name: 'Beef Bolognese Lasagne', category: 'Lasagnes', priceFrom: 27, sizes: [{ label: 'Family (4-6)', price: 27 }, { label: 'Party (8-10)', price: 45 }], image: '/guidos/beef-bolognese-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Meat Lasagne', category: 'Lasagnes', priceFrom: 16.95, sizes: [{ label: 'Single', price: 16.95 }, { label: 'Family (4-6)', price: 27 }], image: '/guidos/meat-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Veggie Lasagne', category: 'Lasagnes', priceFrom: 14, sizes: [{ label: 'Single', price: 14 }, { label: 'Family (4-6)', price: 24 }], image: '/guidos/veggie-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Vegan Lasagne w/ Roasted Veg', category: 'Lasagnes', priceFrom: 14, image: '/guidos/vegan-lasagne.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Eggplant Parmesan', category: 'Lasagnes', priceFrom: 14, image: '/guidos/eggplant-parmesan.webp', isAvailable: true, isLimitedEdition: false },
  // Pot Pies
  { name: 'Turkey Pot Pie', category: 'Pot Pies', priceFrom: 9, image: '/guidos/turkey-pot-pie.webp', isAvailable: true, isLimitedEdition: false },
  // Soups
  { name: 'Beef Stew', category: 'Soups', priceFrom: 12, image: '/guidos/beef-stew.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Beef Barley Soup', category: 'Soups', priceFrom: 10, image: '/guidos/beef-barley-soup.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Broccoli Cheddar Soup', category: 'Soups', priceFrom: 10, image: '/guidos/broccoli-cheddar-soup.webp', isAvailable: true, isLimitedEdition: false },
  // Pasta
  { name: 'Spaghetti and Meatballs', category: 'Pasta', priceFrom: 14, image: '/guidos/spaghetti-meatballs.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Pulled Pork Mac & Cheese', category: 'Pasta', priceFrom: 14, image: '/guidos/pulled-pork-mac.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Mac & Cheese', category: 'Pasta', priceFrom: 12, image: '/guidos/mac-cheese.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Peanut Chicken', category: 'Pasta', priceFrom: 14, image: '/guidos/peanut-chicken.webp', isAvailable: true, isLimitedEdition: false },
  // Desserts
  { name: 'Tiramisu', category: 'Desserts', priceFrom: 12, image: '/guidos/tiramisu.webp', isAvailable: true, isLimitedEdition: false },
  { name: 'Tiramisu Cans (5 Flavours)', category: 'Desserts', priceFrom: 9.95, image: '/guidos/tiramisu-cans.webp', isAvailable: true, isLimitedEdition: false },
  // Holiday
  { name: 'Turkey Dinner', category: 'Holiday', priceFrom: 25, image: '/guidos/turkey-dinner.webp', isAvailable: true, isLimitedEdition: true },
];
