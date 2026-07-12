import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertAdmin, logActivity } from "./lib";

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
  { category: 'PEASANO', name: "Nonno's Table", description: 'Upgraded Italian feast with seafood, handmade ravioli, veal scallopini, tiramisu', priceLabel: '$72/pp', orderIndex: 2 },

  // ===== MEXICAN FIESTA =====
  { category: 'MEXICAN', name: 'Fiesta Buffet', description: 'Chicken, beef and veggie fajitas with all the fixings, Spanish rice, refried beans, tortilla chips with salsa and guacamole', priceLabel: '$45/pp', orderIndex: 1 },
  { category: 'MEXICAN', name: 'Taco Bar', description: 'Build-your-own taco station with seasoned ground beef, chicken, fish, all toppings, rice and beans', priceLabel: '$38/pp', orderIndex: 2 },
  { category: 'MEXICAN', name: 'Nacho Station', description: 'Loaded nacho bar with all toppings, great as an appetizer add-on', priceLabel: '$12/pp', orderIndex: 3 },

  // ===== BBQ =====
  { category: 'BBQ', name: 'Classic BBQ Package', description: 'Hamburgers, hot dogs, chicken burgers, coleslaw, potato salad, corn on the cob, condiments', priceLabel: '$35/pp', orderIndex: 1 },
  { category: 'BBQ', name: 'Premium BBQ', description: 'Marinated steaks, chicken skewers, sausages, grilled vegetables, Caesar salad, baked potatoes', priceLabel: '$52/pp', orderIndex: 2 },
  { category: 'BBQ', name: 'Smoker Package', description: 'Pulled pork, smoked brisket, BBQ chicken, cornbread, beans, coleslaw, pickles', priceLabel: '$48/pp', orderIndex: 3 },

  // ===== CORPORATE BREAKFAST =====
  { category: 'BREAKFAST', name: 'Continental', description: 'Freshly-baked pastries, danishes and muffins served with cold fruit juices, fresh brewed coffee and hot tea.', priceLabel: '$9.95/pp', orderIndex: 1 },
  { category: 'BREAKFAST', name: 'Royal Continental', description: 'Freshly-baked pastries, Danishes and muffins served with fresh seasonal sliced fruit, juices, coffee and tea.', priceLabel: '$12.50/pp', orderIndex: 2 },
  { category: 'BREAKFAST', name: 'Supreme Continental', description: 'Soft bagels, freshly-baked scones, fruit yogurt with granola, seasonal sliced fruit, juices, coffee and tea.', priceLabel: '$14.50/pp', orderIndex: 3 },
  { category: 'BREAKFAST', name: 'Hot Breakfast Buffet', description: 'Scrambled eggs, bacon, sausages, hash browns, toast, fresh fruit, coffee, tea and juices', priceLabel: '$18.95/pp', orderIndex: 4 },
  { category: 'BREAKFAST', name: 'Eggs Benedict Station', description: 'Classic, salmon, and mushroom Eggs Benedict with hollandaise, breakfast potatoes, fruit', priceLabel: '$22.50/pp', orderIndex: 5 },

  // ===== CORPORATE LUNCH =====
  { category: 'LUNCH', name: 'The Picnic', description: 'Cold cut combos sandwich.', priceLabel: '$8.95/ea', orderIndex: 1 },
  { category: 'LUNCH', name: 'The Italian', description: 'Italian meats, Mozzarella cheese, lettuce and tomato, served with a variety of flavored mayonnaises, pesto, and red pepper.', priceLabel: '$9.95/ea', orderIndex: 2 },
  { category: 'LUNCH', name: 'The Grilled Chicken', description: 'Grilled chicken, goat cheese and pesto mayo with fresh spinach leaves, red peppers.', priceLabel: '$9.95/ea', orderIndex: 3 },
  { category: 'LUNCH', name: 'The Grilled Cheese', description: 'Black Forest ham on French bread with cheddar cheese and mayo, Grilled.', priceLabel: '$7.95/ea', orderIndex: 4 },
  { category: 'LUNCH', name: 'The Roasted Veggie', description: 'Assorted veggies roasted with baby greens and cheese.', priceLabel: '$7.95/ea', orderIndex: 5 },
  { category: 'LUNCH', name: 'Baron of Beef', description: 'Succulent roast beef cooked medium rare served with Au jus on a sub bun.', priceLabel: '$11.95/ea', orderIndex: 6 },
  { category: 'LUNCH', name: 'Traditional BBQ Lunch', description: 'Hamburgers, Veggie or Chicken Burgers, cheese, lettuce, tomato, pickles, onions, condiments.', priceLabel: '$12.95/ea', orderIndex: 7 },
  { category: 'LUNCH', name: 'Chicken, Beef or Veggie Fajitas', description: 'With warm flour tortillas, Spanish rice, refried beans, lettuce, tomato, salsa, sour cream.', priceLabel: '$13.95/ea', orderIndex: 8 },
  { category: 'LUNCH', name: 'Lasagna', description: 'Traditional meat or veggie lasagna stuffed full of your favorite Italian ingredients.', priceLabel: '$12.95/ea', orderIndex: 9 },

  // ===== BEVERAGES =====
  { category: 'BEVERAGES', name: 'Coffee & Tea Station', description: 'Fresh brewed coffee, selection of teas, cream, sugar, honey', priceLabel: '$3.50/pp', orderIndex: 1 },
  { category: 'BEVERAGES', name: 'Juice Bar', description: 'Assorted chilled fruit juices and sparkling water', priceLabel: '$4.50/pp', orderIndex: 2 },
  { category: 'BEVERAGES', name: 'Lemonade & Iced Tea', description: 'Fresh-squeezed lemonade and house-brewed iced tea station', priceLabel: '$4.00/pp', orderIndex: 3 },
  { category: 'BEVERAGES', name: 'Hot Chocolate Station', description: 'Rich hot chocolate with marshmallows, whipped cream, and chocolate shavings', priceLabel: '$5.00/pp', orderIndex: 4 },
];

// Run via CLI: npx convex run seed:seedMenuItems '{"adminSecret":"..."}'
// Refuses to touch a non-empty table unless { force: true } is passed;
// force wipes the table before re-inserting the hardcoded data.
export const seedMenuItems = mutation({
  args: { adminSecret: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.query("menuItems").collect();
    if (existing.length > 0 && !args.force) {
      return {
        seeded: 0,
        skipped: true,
        reason: `menuItems already has ${existing.length} rows; pass { force: true } to wipe and reseed`,
      };
    }

    // Clear existing (only reachable when empty or force=true)
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    for (const item of allItems) {
      await ctx.db.insert("menuItems", {
        category: item.category,
        name: item.name,
        description: item.description,
        priceLabel: item.priceLabel,
        orderIndex: item.orderIndex,
        isActive: true,
        isFeatured: false,
      });
    }

    await logActivity(ctx, {
      action: "Seeded menu items",
      section: "Menu",
      details: `${allItems.length} items`,
    });
    return { seeded: allItems.length, skipped: false };
  },
});

const guidosProducts = [
  // Lasagnes
  { name: 'Beef Bolognese Lasagne', category: 'Lasagnes', priceFrom: 27, sizes: [{ label: 'Family (4-6)', price: 27 }, { label: 'Party (8-10)', price: 45 }], image: '/guidos/beef-bolognese-lasagne.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 1 },
  { name: 'Meat Lasagne', category: 'Lasagnes', priceFrom: 16.95, sizes: [{ label: 'Single', price: 16.95 }, { label: 'Family (4-6)', price: 27 }], image: '/guidos/meat-lasagne.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 2 },
  { name: 'Veggie Lasagne', category: 'Lasagnes', priceFrom: 14, sizes: [{ label: 'Single', price: 14 }, { label: 'Family (4-6)', price: 24 }], image: '/guidos/veggie-lasagne.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 3 },
  { name: 'Vegan Lasagne w/ Roasted Veg', category: 'Lasagnes', priceFrom: 14, image: '/guidos/vegan-lasagne.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 4 },
  { name: 'Eggplant Parmesan', category: 'Lasagnes', priceFrom: 14, image: '/guidos/eggplant-parmesan.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 5 },
  // Pot Pies
  { name: 'Turkey Pot Pie', category: 'Pot Pies', priceFrom: 9, image: '/guidos/turkey-pot-pie.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 6 },
  // Soups
  { name: 'Beef Stew', category: 'Soups', priceFrom: 12, image: '/guidos/beef-stew.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 7 },
  { name: 'Beef Barley Soup', category: 'Soups', priceFrom: 10, image: '/guidos/beef-barley-soup.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 8 },
  { name: 'Broccoli Cheddar Soup', category: 'Soups', priceFrom: 10, image: '/guidos/broccoli-cheddar-soup.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 9 },
  // Pasta
  { name: 'Spaghetti and Meatballs', category: 'Pasta', priceFrom: 14, image: '/guidos/spaghetti-meatballs.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 10 },
  { name: 'Pulled Pork Mac & Cheese', category: 'Pasta', priceFrom: 14, image: '/guidos/pulled-pork-mac.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 11 },
  { name: 'Mac & Cheese', category: 'Pasta', priceFrom: 12, image: '/guidos/mac-cheese.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 12 },
  { name: 'Peanut Chicken', category: 'Pasta', priceFrom: 14, image: '/guidos/peanut-chicken.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 13 },
  // Desserts
  { name: 'Tiramisu', category: 'Desserts', priceFrom: 12, image: '/guidos/tiramisu.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 14 },
  { name: 'Tiramisu Cans (5 Flavours)', category: 'Desserts', priceFrom: 9.95, image: '/guidos/tiramisu-cans.webp', isAvailable: true, isLimitedEdition: false, orderIndex: 15 },
  // Holiday
  { name: 'Turkey Dinner', category: 'Holiday', priceFrom: 25, image: '/guidos/turkey-dinner.webp', isAvailable: true, isLimitedEdition: true, orderIndex: 16 },
];

// Run via CLI: npx convex run seed:seedGuidosProducts '{"adminSecret":"..."}'
// Refuses to touch a non-empty table unless { force: true } is passed;
// force wipes the table before re-inserting the hardcoded data.
export const seedGuidosProducts = mutation({
  args: { adminSecret: v.string(), force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    const existing = await ctx.db.query("guidosProducts").collect();
    if (existing.length > 0 && !args.force) {
      return {
        seeded: 0,
        skipped: true,
        reason: `guidosProducts already has ${existing.length} rows; pass { force: true } to wipe and reseed`,
      };
    }

    // Clear existing (only reachable when empty or force=true)
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    for (const item of guidosProducts) {
      await ctx.db.insert("guidosProducts", {
        name: item.name,
        category: item.category,
        priceFrom: item.priceFrom,
        sizes: item.sizes,
        image: item.image,
        isAvailable: item.isAvailable,
        isLimitedEdition: item.isLimitedEdition,
        orderIndex: item.orderIndex,
      });
    }

    await logActivity(ctx, {
      action: "Seeded Guido's products",
      section: "Guido's Products",
      details: `${guidosProducts.length} products`,
    });
    return { seeded: guidosProducts.length, skipped: false };
  },
});
