// Comprehensive seed script for all Melting Moments menu items
// Run with: npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const allItems = [
  // ===== BREADS =====
  { category: 'BREADS', name: 'Baguettes', description: '', priceLabel: 'Included', orderIndex: 1 },
  { category: 'BREADS', name: 'Dinner Rolls', description: '', priceLabel: 'Included', orderIndex: 2 },
  { category: 'BREADS', name: 'Focaccia Bread', description: '', priceLabel: 'Included', orderIndex: 3 },

  // ===== ANTIPASTO =====
  { category: 'ANTIPASTO', name: 'Fresh Fruits', description: 'Seasonal fresh fruit display', priceLabel: 'Included', orderIndex: 1 },
  { category: 'ANTIPASTO', name: 'Assorted Cheeses', description: 'Selection of imported and domestic cheeses', priceLabel: 'Included', orderIndex: 2 },
  { category: 'ANTIPASTO', name: 'Deli Meat Mirror', description: 'Cured meats arranged on a mirror display', priceLabel: 'Included', orderIndex: 3 },
  { category: 'ANTIPASTO', name: 'European Platter', description: 'Premium European-style antipasto selection', priceLabel: 'Included', orderIndex: 4 },

  // ===== SALADS =====
  { category: 'SALADS', name: 'Garden Salad', description: 'Fresh greens with house vinaigrette', priceLabel: 'Included', orderIndex: 1 },
  { category: 'SALADS', name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan with Caesar dressing', priceLabel: 'Included', orderIndex: 2 },
  { category: 'SALADS', name: 'Roasted Corn Salsa Salad', description: 'Fire-roasted corn with fresh salsa', priceLabel: 'Included', orderIndex: 3 },

  // ===== STARCHES =====
  { category: 'STARCHES', name: 'Saffron Rice', description: 'Fragrant basmati rice with saffron threads', priceLabel: 'Included', orderIndex: 1 },
  { category: 'STARCHES', name: 'Roasted Rosemary Red Skin Potatoes', description: 'Baby potatoes roasted with fresh rosemary', priceLabel: 'Included', orderIndex: 2 },
  { category: 'STARCHES', name: 'Penne Alfredo', description: 'Penne pasta in a creamy Alfredo sauce', priceLabel: 'Included', orderIndex: 3 },
  { category: 'STARCHES', name: 'Garlic Mashed Potatoes', description: 'Creamy mashed potatoes with roasted garlic', priceLabel: 'Included', orderIndex: 4 },

  // ===== VEGETABLES =====
  { category: 'VEGETABLES', name: 'Hot Steamed Vegetables', description: 'Seasonal medley of steamed vegetables', priceLabel: 'Included', orderIndex: 1 },
  { category: 'VEGETABLES', name: 'Fiery Green Beans', description: 'Green beans sautéed with chili flakes', priceLabel: 'Included', orderIndex: 2 },
  { category: 'VEGETABLES', name: 'Grilled Mediterranean Vegetables', description: 'Zucchini, eggplant, peppers grilled with herbs', priceLabel: 'Included', orderIndex: 3 },

  // ===== SEAFOOD / GOURMET MIRRORS =====
  { category: 'SEAFOOD', name: 'Smoked Salmon Mirror', description: 'Atlantic smoked salmon with capers and cream cheese', priceLabel: '$8.95/pp', orderIndex: 1 },
  { category: 'SEAFOOD', name: 'Shrimp Mirror', description: 'Jumbo shrimp displayed on ice with cocktail sauce', priceLabel: '$9.95/pp', orderIndex: 2 },
  { category: 'SEAFOOD', name: 'Oyster Bar', description: 'Fresh Fanny Bay oysters on the half shell', priceLabel: 'Market Price', orderIndex: 3 },

  // ===== ENTREES / CHEF CARVED =====
  { category: 'ENTREES', name: 'Roasted Beef', description: 'Slow-roasted prime rib of beef with au jus', priceLabel: '$8.95/pp', orderIndex: 1 },
  { category: 'ENTREES', name: 'Stuffed Pork Tenderloin', description: 'Apple and sage stuffed pork with port reduction', priceLabel: '$7.95/pp', orderIndex: 2 },
  { category: 'ENTREES', name: 'Honey Glazed Ham', description: 'Brown sugar and Dijon glazed ham', priceLabel: '$6.95/pp', orderIndex: 3 },
  { category: 'ENTREES', name: 'Herb Crusted Lamb', description: 'Rack of lamb with rosemary and garlic crust', priceLabel: '$12.95/pp', orderIndex: 4 },
  { category: 'ENTREES', name: 'Chicken Supreme', description: 'Boneless chicken breast stuffed with brie and cranberry', priceLabel: '$7.95/pp', orderIndex: 5 },

  // ===== PACKAGES =====
  { category: 'PACKAGES', name: 'Basic Buffet', description: 'Garden salad, two starches, two vegetables, one entrée, breads, coffee & tea', priceLabel: '$50/pp', orderIndex: 1 },
  { category: 'PACKAGES', name: 'Traditional Buffet', description: 'Antipasto display, Caesar salad, garden salad, two starches, two vegetables, two entrées, breads, coffee & tea', priceLabel: '$57/pp', orderIndex: 2 },
  { category: 'PACKAGES', name: 'Gourmet Buffet', description: 'Full antipasto & cheese display, three salads, two starches, two vegetables, two entrées, one seafood mirror, breads, coffee & tea', priceLabel: '$65/pp', orderIndex: 3 },
  { category: 'PACKAGES', name: 'Premium Gala', description: 'Complete antipasto, cheese & seafood display, all salads, all starches, all vegetables, three entrées, chocolate fountain, breads, coffee & tea', priceLabel: '$85/pp', orderIndex: 4 },

  // ===== SOIRÉE =====
  { category: 'SOIREE', name: 'Caprese Skewers', description: 'Cherry tomato, bocconcini, basil with balsamic glaze', priceLabel: '$4.50/ea', orderIndex: 1 },
  { category: 'SOIREE', name: 'Smoked Salmon Blinis', description: 'Mini buckwheat blinis with crème fraîche and dill', priceLabel: '$4.95/ea', orderIndex: 2 },
  { category: 'SOIREE', name: 'Beef Tenderloin Crostini', description: 'Seared beef on toasted crostini with horseradish aioli', priceLabel: '$5.50/ea', orderIndex: 3 },
  { category: 'SOIREE', name: 'Prawn Cocktail Shots', description: 'Tiger prawns with cocktail sauce in shot glasses', priceLabel: '$5.95/ea', orderIndex: 4 },
  { category: 'SOIREE', name: 'Mushroom Arancini', description: 'Wild mushroom risotto balls, deep-fried with truffle aioli', priceLabel: '$4.50/ea', orderIndex: 5 },

  // ===== PEASANO DINNER =====
  { category: 'PEASANO', name: 'Peasano Family Dinner', description: 'Authentic Italian family-style dinner with antipasto, fresh pasta, roasted meats, vegetables, breads, and dessert', priceLabel: '$55/pp', orderIndex: 1 },
  { category: 'PEASANO', name: 'Nonno\'s Table', description: 'Upgraded Italian feast with seafood, handmade ravioli, veal scallopini, tiramisu', priceLabel: '$72/pp', orderIndex: 2 },

  // ===== MEXICAN FIESTA =====
  { category: 'MEXICAN', name: 'Fiesta Buffet', description: 'Chicken, beef and veggie fajitas with all the fixings, Spanish rice, refried beans, tortilla chips with salsa and guacamole', priceLabel: '$45/pp', orderIndex: 1 },
  { category: 'MEXICAN', name: 'Taco Bar', description: 'Build-your-own taco station with seasoned ground beef, chicken, fish, all toppings, rice and beans', priceLabel: '$38/pp', orderIndex: 2 },
  { category: 'MEXICAN', name: 'Nacho Station', description: 'Loaded nacho bar with all toppings, great as an appetizer add-on', priceLabel: '$12/pp', orderIndex: 3 },

  // ===== BBQ =====
  { category: 'BBQ', name: 'Classic BBQ Package', description: 'Hamburgers, hot dogs, chicken burgers, coleslaw, potato salad, corn on the cob, condiments', priceLabel: '$35/pp', orderIndex: 1 },
  { category: 'BBQ', name: 'Premium BBQ', description: 'Marinated steaks, chicken skewers, sausages, grilled vegetables, Caesar salad, baked potatoes', priceLabel: '$52/pp', orderIndex: 2 },
  { category: 'BBQ', name: 'Smoker Package', description: 'Pulled pork, smoked brisket, BBQ chicken, cornbread, beans, coleslaw, pickles', priceLabel: '$48/pp', orderIndex: 3 },

  // ===== CORPORATE BREAKFAST =====
  { category: 'BREAKFAST', name: 'Continental', description: 'Baskets filled with delicious freshly-baked pastries, danishes and muffins served with cold fruit juices, fresh brewed coffee and hot tea.', priceLabel: '$9.95/pp', orderIndex: 1 },
  { category: 'BREAKFAST', name: 'Royal Continental', description: 'Freshly-baked pastries, Danishes and muffins served with fresh seasonal sliced fruit as well as cold fruit juices, fresh brewed coffee and hot tea.', priceLabel: '$12.50/pp', orderIndex: 2 },
  { category: 'BREAKFAST', name: 'Supreme Continental', description: 'Soft bagels, freshly-baked scones, fruit yogurt with granola, seasonal sliced fruit as well as cold fruit juices, fresh brewed coffee and hot tea.', priceLabel: '$14.50/pp', orderIndex: 3 },
  { category: 'BREAKFAST', name: 'Hot Breakfast Buffet', description: 'Scrambled eggs, bacon, sausages, hash browns, toast, fresh fruit, coffee, tea and juices', priceLabel: '$18.95/pp', orderIndex: 4 },
  { category: 'BREAKFAST', name: 'Eggs Benedict Station', description: 'Classic, salmon, and mushroom Eggs Benedict with hollandaise, breakfast potatoes, fruit', priceLabel: '$22.50/pp', orderIndex: 5 },

  // ===== CORPORATE LUNCH =====
  { category: 'LUNCH', name: 'The Picnic', description: 'Cold cut combos sandwich.', priceLabel: '$8.95/ea', orderIndex: 1 },
  { category: 'LUNCH', name: 'The Italian', description: 'Italian meats, Mozzarella cheese, lettuce and tomato, served with a variety of flavored mayonnaises, pesto, and red pepper.', priceLabel: '$9.95/ea', orderIndex: 2 },
  { category: 'LUNCH', name: 'The Grilled Chicken', description: 'Grilled chicken, goat cheese and pesto mayo with fresh spinach leaves, red peppers.', priceLabel: '$9.95/ea', orderIndex: 3 },
  { category: 'LUNCH', name: 'The Grilled Cheese', description: 'Black Forest ham on French bread with cheddar cheese and mayo, Grilled.', priceLabel: '$7.95/ea', orderIndex: 4 },
  { category: 'LUNCH', name: 'The Roasted Veggie', description: 'Assorted veggies roasted with baby greens and cheese.', priceLabel: '$7.95/ea', orderIndex: 5 },
  { category: 'LUNCH', name: 'Baron of Beef', description: 'Succulent roast beef cooked medium rare served with Au jus on a sub bun.', priceLabel: '$11.95/ea', orderIndex: 6 },
  { category: 'LUNCH', name: 'Traditional BBQ Lunch', description: 'Hamburgers, Veggie or Chicken Burgers served with sliced cheese, lettuce, tomato pickles, onions, and a condiment tray.', priceLabel: '$12.95/ea', orderIndex: 7 },
  { category: 'LUNCH', name: 'Chicken, Beef or Veggie Fajitas', description: 'With warm flour tortillas, accompanied by Spanish rice, refried beans, lettuce and tomato and topped with salsa, sour cream.', priceLabel: '$13.95/ea', orderIndex: 8 },
  { category: 'LUNCH', name: 'Lasagna', description: 'Traditional meat or veggie lasagna stuffed full of your favorite Italian ingredients.', priceLabel: '$12.95/ea', orderIndex: 9 },

  // ===== BEVERAGES =====
  { category: 'BEVERAGES', name: 'Coffee & Tea Station', description: 'Fresh brewed coffee, selection of teas, cream, sugar, honey', priceLabel: '$3.50/pp', orderIndex: 1 },
  { category: 'BEVERAGES', name: 'Juice Bar', description: 'Assorted chilled fruit juices and sparkling water', priceLabel: '$4.50/pp', orderIndex: 2 },
  { category: 'BEVERAGES', name: 'Lemonade & Iced Tea', description: 'Fresh-squeezed lemonade and house-brewed iced tea station', priceLabel: '$4.00/pp', orderIndex: 3 },
  { category: 'BEVERAGES', name: 'Hot Chocolate Station', description: 'Rich hot chocolate with marshmallows, whipped cream, and chocolate shavings', priceLabel: '$5.00/pp', orderIndex: 4 },
];

async function main() {
  console.log('🌱 Seeding database with all menu items...');
  
  // Clear existing menu items
  const deleteResult = await prisma.menuItem.deleteMany();
  console.log(`   Deleted ${deleteResult.count} existing items.`);
  
  // Insert all items
  for (const item of allItems) {
    await prisma.menuItem.create({
      data: {
        category: item.category,
        name: item.name,
        description: item.description,
        price: null,
        priceLabel: item.priceLabel,
        orderIndex: item.orderIndex,
      }
    });
  }
  
  console.log(`✅ Seeded ${allItems.length} menu items across the following categories:`);
  
  const cats = [...new Set(allItems.map(i => i.category))];
  for (const cat of cats) {
    const count = allItems.filter(i => i.category === cat).length;
    console.log(`   ${cat}: ${count} items`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
