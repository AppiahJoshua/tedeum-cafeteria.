/* ============================================================
   TE-DEUM L'AUDAMUS — Database Seeder
   Run: node db/seed.js
   ============================================================ */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { initDB, getDB } = require('./database');

initDB();
const db = getDB();

const MENU = [
  // ── BREAKFAST ──────────────────────────────────────────────
  { name:'English Breakfast',           category:'breakfast', price:55,  emoji:'🍳', description:'Baked beans, fried eggs, bread, sausage and ham — a full morning spread.', popular:1 },
  { name:'Continental Breakfast',       category:'breakfast', price:45,  emoji:'🥐', description:'Oats, custard, salad, sausage, toasted bread and plain cakes.', popular:0 },
  { name:'Spanish Breakfast',           category:'breakfast', price:55,  emoji:'🥚', description:'Spanish omelette, hot coffee, toasted bread, salad, baked beans and cheese.', popular:0 },
  { name:'Tom Brown Porridge',          category:'breakfast', price:25,  emoji:'🌾', description:'Ghanaian roasted corn porridge — warm and nourishing.', popular:0 },
  { name:'Rice Porridge',               category:'breakfast', price:25,  emoji:'🥣', description:'Smooth rice porridge served hot.', popular:0 },
  { name:'Corn Porridge',               category:'breakfast', price:20,  emoji:'🌽', description:'Classic corn porridge — a Ghanaian breakfast staple.', popular:0 },
  { name:'Egg Sandwich',                category:'breakfast', price:30,  emoji:'🥪', description:'Fresh egg sandwich on toasted bread.', popular:0 },
  { name:'Fresh Fruits Breakfast',      category:'breakfast', price:20,  emoji:'🍓', description:'Melon, pineapple, mango and seasonal fruits — light and refreshing.', popular:0 },

  // ── SALADS ─────────────────────────────────────────────────
  { name:'Fruit Salad',                 category:'salads', price:30,  emoji:'🍇', description:'Fresh seasonal fruit salad — light and refreshing.', popular:0 },
  { name:'Vegetable Salad',             category:'salads', price:20,  emoji:'🥗', description:'Fresh garden vegetables with house dressing.', popular:0 },
  { name:'Vegetable Salad with Egg',    category:'salads', price:20,  emoji:'🥗', description:'Garden salad topped with boiled or fried egg.', popular:0 },
  { name:'Pasta Salad',                 category:'salads', price:20,  emoji:'🍝', description:'Al dente pasta tossed with vegetables and dressing.', popular:0 },
  { name:'Vegetable Salad with Chicken',category:'salads', price:35,  emoji:'🥗', description:'Garden salad topped with grilled chicken strips.', popular:1 },
  { name:'Egg Salad',                   category:'salads', price:20,  emoji:'🥚', description:'Classic egg salad with fresh vegetables.', popular:0 },
  { name:'Tuna & Potato Salad',         category:'salads', price:20,  emoji:'🐟', description:'Tuna and potato salad with light dressing.', popular:0 },
  { name:'Lebanese Salad',              category:'salads', price:40,  emoji:'🥙', description:'Authentic Lebanese-style salad with herbs and lemon.', popular:0 },
  { name:'Fatouch Salad',               category:'salads', price:40,  emoji:'🥗', description:'Lebanese fatouch with toasted pita chips and vegetables.', popular:0 },

  // ── CONTINENTAL ────────────────────────────────────────────
  { name:'Chicken Escalope',            category:'continental', price:70, emoji:'🍗', description:'Breaded chicken breast, pan-fried to golden perfection. Served with chips or rice.', popular:1 },
  { name:'Chicken Provencal',           category:'continental', price:70, emoji:'🍗', description:'Chicken in rich Provençal herb and tomato sauce.', popular:0 },
  { name:'Chicken Grilled Steak',       category:'continental', price:70, emoji:'🍗', description:'Tender grilled chicken steak with seasonal vegetables.', popular:0 },
  { name:'Chicken Cordon Bleu',         category:'continental', price:70, emoji:'🍗', description:'Classic chicken Cordon Bleu stuffed with ham and cheese.', popular:1 },
  { name:'Chicken Pepper Steak',        category:'continental', price:60, emoji:'🍗', description:'Juicy chicken steak in black pepper sauce.', popular:0 },
  { name:'Chicken Thermido + Chips',    category:'continental', price:80, emoji:'🍗', description:'Classic chicken thermidor served with crispy chips.', popular:0 },
  { name:'Beef Escalope',               category:'continental', price:70, emoji:'🥩', description:'Thinly pounded beef escalope, pan-fried golden. Served with chips or rice.', popular:0 },
  { name:'Beef Cordon Bleu',            category:'continental', price:70, emoji:'🥩', description:'Beef Cordon Bleu stuffed with ham and melted cheese.', popular:0 },
  { name:'Beef Pepper Steak',           category:'continental', price:60, emoji:'🥩', description:'Tender beef steak in black pepper sauce.', popular:0 },
  { name:'Lobster Thermidor + Chips',   category:'continental', price:80, emoji:'🦞', description:'Luxurious lobster thermidor served with chips.', popular:0 },
  { name:'Lobster in Chilli Sauce',     category:'continental', price:70, emoji:'🦞', description:'Lobster cooked in a rich chilli sauce.', popular:0 },
  { name:'Golden Fried Prawns',         category:'continental', price:100,emoji:'🦐', description:'Crispy golden fried prawns. All starters include chips, rice or spaghetti.', popular:1 },
  { name:'Prawns Creole',               category:'continental', price:85, emoji:'🦐', description:'Prawns in spicy Creole tomato sauce.', popular:0 },
  { name:'Grilled Prawns',              category:'continental', price:85, emoji:'🦐', description:'Chargrilled prawns with garlic butter.', popular:0 },
  { name:'Fish Creole',                 category:'continental', price:60, emoji:'🐟', description:'Fish fillet in aromatic Creole sauce.', popular:0 },
  { name:'Fish Provencal',              category:'continental', price:70, emoji:'🐟', description:'Fish in classic French Provençal sauce.', popular:0 },
  { name:'Grilled Grouper',             category:'continental', price:70, emoji:'🐟', description:'Fresh grouper fillet, grilled with herbs.', popular:0 },

  // ── GHANAIAN ───────────────────────────────────────────────
  { name:'Fufu & Light Soup',           category:'ghanaian', price:60,  emoji:'🫕', description:'Hand-pounded fufu served with delicious light soup.', popular:1 },
  { name:'Fufu with Tilapia',           category:'ghanaian', price:70,  emoji:'🐟', description:'Hand-pounded fufu with fresh tilapia and soup of choice.', popular:1 },
  { name:'Fufu with Goat Meat',         category:'ghanaian', price:60,  emoji:'🫕', description:'Hand-pounded fufu with tender goat meat soup.', popular:0 },
  { name:'Fufu with Live Chicken',      category:'ghanaian', price:70,  emoji:'🍗', description:'Hand-pounded fufu with live chicken soup.', popular:0 },
  { name:'Banku with M/S Tilapia',      category:'ghanaian', price:50,  emoji:'🐟', description:'Smooth banku served with medium or small tilapia.', popular:1 },
  { name:'Banku with L/S Tilapia',      category:'ghanaian', price:70,  emoji:'🐟', description:'Smooth banku served with large or special tilapia.', popular:0 },
  { name:'Banku with Okro Stew',        category:'ghanaian', price:60,  emoji:'🫕', description:'Smooth banku with okro stew and goat meat.', popular:0 },
  { name:'Omotuo with Groundnut Soup',  category:'ghanaian', price:70,  emoji:'🍚', description:'Soft rice balls served with rich groundnut soup.', popular:0 },
  { name:'Waakye with Chicken',         category:'ghanaian', price:60,  emoji:'🍛', description:'Classic waakye with fried or grilled chicken.', popular:0 },
  { name:'Waakye with Fish',            category:'ghanaian', price:60,  emoji:'🍛', description:'Classic waakye with fried fish.', popular:0 },
  { name:'Ampesi with Garden Eggs',     category:'ghanaian', price:40,  emoji:'🍲', description:'Boiled yam with garden egg stew.', popular:0 },
  { name:'Keta School Boys',            category:'ghanaian', price:30,  emoji:'🐟', description:'Smoked herrings — a Ghanaian classic.', popular:0 },

  // ── CHINESE ────────────────────────────────────────────────
  { name:'Beef Fried Rice',             category:'chinese', price:70,  emoji:'🍚', description:'Wok-fried rice with tender beef strips and vegetables.', popular:0 },
  { name:'Chicken Fried Rice',          category:'chinese', price:70,  emoji:'🍗', description:'Wok-fried rice with seasoned chicken and vegetables.', popular:1 },
  { name:'Assorted Fried Rice',         category:'chinese', price:70,  emoji:'🍚', description:'Fried rice with assorted meats and vegetables.', popular:0 },
  { name:'Special Assorted Fried Rice', category:'chinese', price:150, emoji:'⭐', description:'Premium assorted fried rice with a special blend of proteins.', popular:1 },
  { name:'Shrimps Fried Rice',          category:'chinese', price:85,  emoji:'🦐', description:'Fried rice loaded with juicy shrimps.', popular:0 },
  { name:'Egg Fried Rice & Chicken',    category:'chinese', price:65,  emoji:'🍳', description:'Classic egg fried rice served with chicken.', popular:0 },
  { name:'Steamed Rice',                category:'chinese', price:50,  emoji:'🍚', description:'Plain steamed white rice.', popular:0 },
  { name:'Veg. Fried Rice',             category:'chinese', price:65,  emoji:'🥦', description:'Fried rice with mixed vegetables — great vegetarian option.', popular:0 },
  { name:'Jollof Rice & Chicken (S)',   category:'chinese', price:60,  emoji:'🍛', description:'Ghanaian jollof rice with chicken — small size.', popular:0 },
  { name:'Jollof Rice & Chicken (L)',   category:'chinese', price:85,  emoji:'🍛', description:'Ghanaian jollof rice with chicken — large size.', popular:1 },

  // ── SAUCES & CURRIES ───────────────────────────────────────
  { name:'Beef in Chilli Sauce',        category:'sauces', price:45,  emoji:'🌶️', description:'Tender beef in spicy chilli sauce. Served with rice of your choice.', popular:0 },
  { name:'Beef in Vegetable Sauce',     category:'sauces', price:50,  emoji:'🥩', description:'Beef in rich vegetable sauce. Served with rice of your choice.', popular:0 },
  { name:'Chicken in Green Pepper Sauce',category:'sauces',price:60,  emoji:'🫑', description:'Chicken in onion and green pepper sauce with rice.', popular:0 },
  { name:'Chicken in Chilli Sauce',     category:'sauces', price:50,  emoji:'🍗', description:'Chicken in spicy chilli sauce with rice.', popular:0 },
  { name:'Fish in Vegetable Sauce',     category:'sauces', price:60,  emoji:'🐟', description:'Fish in rich vegetable sauce with rice.', popular:0 },
  { name:'Fish in Chilli Sauce',        category:'sauces', price:60,  emoji:'🌶️', description:'Fish cooked in chilli sauce with rice.', popular:0 },
  { name:'Beef Curry',                  category:'sauces', price:75,  emoji:'🍲', description:'Aromatic beef curry served with rice of your choice.', popular:0 },
  { name:'Chicken Curry',               category:'sauces', price:75,  emoji:'🍗', description:'Fragrant chicken curry with rice.', popular:1 },
  { name:'Fish Curry',                  category:'sauces', price:75,  emoji:'🐟', description:'Spiced fish curry served with rice.', popular:0 },
  { name:'Chicken Chow Mein',           category:'sauces', price:75,  emoji:'🍜', description:'Stir-fried noodles with chicken and vegetables.', popular:0 },
  { name:'Beef Chow Mein',              category:'sauces', price:75,  emoji:'🍜', description:'Stir-fried noodles with beef and vegetables.', popular:0 },
  { name:'Spaghetti Bolognese',         category:'sauces', price:65,  emoji:'🍝', description:'Al dente spaghetti with rich minced beef sauce.', popular:1 },
  { name:'Spaghetti & Assorted Meat',   category:'sauces', price:70,  emoji:'🍝', description:'Spaghetti with assorted meat sauce.', popular:0 },
  { name:'Spaghetti Carbonara',         category:'sauces', price:80,  emoji:'🍝', description:'Classic spaghetti carbonara with cream and bacon.', popular:0 },

  // ── PIZZA ──────────────────────────────────────────────────
  { name:'Margherita Pizza (M)',        category:'pizza', price:100, emoji:'🍕', description:'Classic tomato base, mozzarella and fresh basil. Medium size.', popular:0 },
  { name:'Beef Pizza (M)',              category:'pizza', price:100, emoji:'🍕', description:'Tomato base with seasoned beef and mozzarella. Medium size.', popular:0 },
  { name:'Chicken Pizza (M)',           category:'pizza', price:100, emoji:'🍗', description:'Tomato base with seasoned chicken and mozzarella. Medium size.', popular:1 },
  { name:'Beef & Sausage Pizza (M)',    category:'pizza', price:100, emoji:'🍕', description:'Loaded with beef and sausage on tomato base. Medium size.', popular:0 },
  { name:'Chicken & Sausage Pizza (M)', category:'pizza', price:100, emoji:'🍕', description:'Chicken and sausage pizza. Medium size.', popular:0 },
  { name:'Cheese Pizza (M)',            category:'pizza', price:120, emoji:'🧀', description:'Rich cheese pizza on tomato base. Medium size.', popular:0 },
  { name:'Ham Pizza (M)',               category:'pizza', price:140, emoji:'🍕', description:'Generous ham topping on tomato base. Medium size.', popular:0 },
  { name:'Pepperoni Pizza (M)',         category:'pizza', price:150, emoji:'🍕', description:'Classic pepperoni pizza. Medium size.', popular:1 },
  { name:'Tuna Pizza (M)',              category:'pizza', price:120, emoji:'🐟', description:'Tuna and onion pizza. Medium size.', popular:0 },
  { name:'Assorted Pizza (M)',          category:'pizza', price:140, emoji:'🍕', description:'Loaded with assorted toppings. Medium size.', popular:1 },
  { name:'Vegetarian Pizza (M)',        category:'pizza', price:100, emoji:'🥦', description:'Fresh vegetable pizza. Medium size.', popular:0 },
  { name:'Mexican Pizza (M)',           category:'pizza', price:140, emoji:'🌶️', description:'Spicy Mexican-style pizza. Medium size.', popular:0 },
  { name:'Hawaiian Pizza (M)',          category:'pizza', price:140, emoji:'🍍', description:'Chicken and pineapple pizza. Medium size.', popular:0 },
  { name:'Fully Loaded Pizza (M)',      category:'pizza', price:150, emoji:'👑', description:'Everything on it — the ultimate pizza. Medium size.', popular:1 },
  { name:'Te-Deum Special Pizza (M)',   category:'pizza', price:100, emoji:'⭐', description:"Chef's signature special pizza. Medium size.", popular:1 },
  { name:'Shrimps & Mushroom Pizza (M)',category:'pizza', price:150, emoji:'🦐', description:'Shrimps and mushroom pizza. Medium size.', popular:0 },
  { name:'Pizza Dough on Chicken Breast',category:'pizza',price:200, emoji:'🍗', description:'Pizza dough baked on chicken breast. Medium size.', popular:0 },

  // ── SANDWICHES & BURGERS ───────────────────────────────────
  { name:'Chicken Burger',              category:'sandwiches', price:40,  emoji:'🍔', description:'Grilled or crispy chicken burger. All include chips.', popular:1 },
  { name:'Double Chicken Burger',       category:'sandwiches', price:70,  emoji:'🍔', description:'Double chicken burger — fully loaded. All include chips.', popular:0 },
  { name:'Chicken Cheese Burger',       category:'sandwiches', price:70,  emoji:'🍔', description:'Chicken burger with melted cheese. All include chips.', popular:0 },
  { name:'Beef Burger',                 category:'sandwiches', price:40,  emoji:'🍔', description:'Classic beef burger. All include chips.', popular:1 },
  { name:'Double Beef Burger',          category:'sandwiches', price:70,  emoji:'🍔', description:'Double beef patty burger. All include chips.', popular:0 },
  { name:'Beef Cheese Burger',          category:'sandwiches', price:70,  emoji:'🍔', description:'Beef burger with melted cheese. All include chips.', popular:0 },
  { name:'Te-Deum Special Burger',      category:'sandwiches', price:70,  emoji:'⭐', description:"Chef's signature special burger. All include chips.", popular:1 },
  { name:'Club Sandwich',               category:'sandwiches', price:65,  emoji:'🥪', description:'Classic triple-decker club sandwich.', popular:0 },
  { name:'Chicken Club Sandwich',       category:'sandwiches', price:50,  emoji:'🥪', description:'Triple-decker chicken club sandwich.', popular:0 },
  { name:'Tuna Club Sandwich',          category:'sandwiches', price:70,  emoji:'🥪', description:'Triple-decker tuna club sandwich.', popular:0 },
  { name:'Chicken Shawarma',            category:'sandwiches', price:45,  emoji:'🌯', description:'Chicken shawarma wrap with sauce and vegetables.', popular:1 },
  { name:'Beef Shawarma',               category:'sandwiches', price:45,  emoji:'🌯', description:'Beef shawarma wrap with sauce and vegetables.', popular:1 },
  { name:'Hot Dogs',                    category:'sandwiches', price:30,  emoji:'🌭', description:'Classic hot dog with toppings.', popular:0 },
  { name:'Croque Monsieur',             category:'sandwiches', price:60,  emoji:'🥪', description:'Classic French toasted ham and cheese sandwich.', popular:0 },
  { name:'Croque Madame',               category:'sandwiches', price:80,  emoji:'🥪', description:'Croque Monsieur topped with a fried egg.', popular:0 },
  { name:'Ham Sandwich',                category:'sandwiches', price:70,  emoji:'🥪', description:'Fresh ham sandwich on toasted bread.', popular:0 },

  // ── SNACKS & SIDES ─────────────────────────────────────────
  { name:'Beef Khebab',                 category:'snacks', price:40,  emoji:'🍢', description:'Marinated beef on skewers, grilled to perfection.', popular:0 },
  { name:'Chicken Khebab',              category:'snacks', price:35,  emoji:'🍢', description:'Seasoned chicken skewers, chargrilled.', popular:0 },
  { name:'Assorted Khebab',             category:'snacks', price:50,  emoji:'🍢', description:'A mix of beef, chicken and sausage skewers.', popular:1 },
  { name:'Shish Kebab',                 category:'snacks', price:30,  emoji:'🍢', description:'Classic shish kebab on skewers.', popular:0 },
  { name:'Spring Rolls (5 pcs)',        category:'snacks', price:25,  emoji:'🥟', description:'Crispy vegetable and chicken spring rolls.', popular:1 },
  { name:'Grilled Chicken (5 pcs)',     category:'snacks', price:70,  emoji:'🍗', description:'Five pieces of grilled chicken.', popular:0 },
  { name:'Samosa (5 pcs)',              category:'snacks', price:30,  emoji:'🥟', description:'Crispy pastry stuffed with spiced filling.', popular:0 },
  { name:'Potato Chips',               category:'snacks', price:30,  emoji:'🍟', description:'Crispy golden potato chips.', popular:1 },
  { name:'Meat Pie',                    category:'snacks', price:15,  emoji:'🥧', description:'Fresh meat pie — GHS 15 each.', popular:0 },
  { name:'Fried Plantain',              category:'snacks', price:30,  emoji:'🍌', description:'Sweet fried plantain — also available with beans and fish.', popular:1 },
  { name:'Jollof Rice Only',            category:'snacks', price:30,  emoji:'🍛', description:'Portion of jollof rice only.', popular:0 },
  { name:'Boiled Yam',                  category:'snacks', price:20,  emoji:'🫚', description:'Plain boiled yam.', popular:0 },

  // ── PASTRIES & CAKES ───────────────────────────────────────
  { name:'Doughnut',                    category:'pastries', price:10,  emoji:'🍩', description:'Freshly baked glazed doughnut.', popular:1 },
  { name:'Rock Buns',                   category:'pastries', price:8,   emoji:'🧁', description:'Classic rock buns with raisins.', popular:0 },
  { name:'Cupcake',                     category:'pastries', price:15,  emoji:'🧁', description:'Beautifully frosted cupcake.', popular:1 },
  { name:'Swiss Roll',                  category:'pastries', price:20,  emoji:'🎂', description:'Classic Swiss roll cake.', popular:0 },
  { name:'Birthday Cake (Small)',       category:'pastries', price:100, emoji:'🎂', description:'Custom birthday cake — small size.', popular:1 },
  { name:'Birthday Cake (Medium)',      category:'pastries', price:150, emoji:'🎂', description:'Custom birthday cake — medium size.', popular:0 },
  { name:'Birthday Cake (Large)',       category:'pastries', price:200, emoji:'🎂', description:'Custom birthday cake — large size.', popular:0 },
  { name:'Birthday Cake (XL)',          category:'pastries', price:300, emoji:'🎂', description:'Custom birthday cake — extra large.', popular:0 },
  { name:'Wedding Cake (Standard)',     category:'pastries', price:400, emoji:'💍', description:'Elegant wedding cake — standard tier.', popular:0 },
  { name:'Wedding Cake (Premium)',      category:'pastries', price:1000,emoji:'💍', description:'Luxurious multi-tier wedding cake.', popular:0 },

  // ── DRINKS ─────────────────────────────────────────────────
  { name:'Soft Drink (Can/Bottle)',     category:'drinks', price:10,  emoji:'🥤', description:'Cola, Fanta, Sprite — your choice.', popular:0 },
  { name:'Bottled Water',               category:'drinks', price:5,   emoji:'💧', description:'Chilled pure water.', popular:0 },
  { name:'Malt Drink',                  category:'drinks', price:12,  emoji:'🥤', description:'Chilled Malta or Club malt.', popular:0 },
  { name:'Fresh Fruit Juice',           category:'drinks', price:20,  emoji:'🍊', description:'Freshly blended seasonal fruit juice.', popular:0 },
  { name:'Beer (Local)',                category:'drinks', price:20,  emoji:'🍺', description:'Chilled Star, Club, or ABC stout.', popular:1 },
  { name:'Beer (Premium/Import)',       category:'drinks', price:35,  emoji:'🍺', description:'Premium imported beer.', popular:0 },
  { name:'Wine (Glass)',                category:'drinks', price:40,  emoji:'🍷', description:'House red or white wine by the glass.', popular:0 },
  { name:'Wine (Bottle)',               category:'drinks', price:150, emoji:'🍷', description:'House red or white wine — full bottle.', popular:0 },
  { name:'Spirits (Shot)',              category:'drinks', price:25,  emoji:'🥃', description:'Choice of spirits — single shot.', popular:0 },
  { name:'Tea / Coffee',                category:'drinks', price:15,  emoji:'☕', description:'Hot tea or freshly brewed coffee.', popular:0 },
  { name:'Sobolo / Bissap',             category:'drinks', price:12,  emoji:'🧃', description:'Hibiscus flower drink — refreshing West African favourite.', popular:0 },
];

const existing = db.prepare('SELECT COUNT(*) as c FROM menu_items').get();
if (existing.c > 0 && !process.argv.includes('--force')) {
  console.log(`ℹ️  Menu already has ${existing.c} items. Run with --force to reseed.`);
  process.exit(0);
}
if (existing.c > 0) { db.prepare('DELETE FROM menu_items').run(); console.log('🗑️  Cleared existing items.'); }

const insert = db.prepare('INSERT INTO menu_items (name,category,price,emoji,description,popular,available) VALUES (@name,@category,@price,@emoji,@description,@popular,1)');
db.transaction(items => { for (const item of items) insert.run(item); })(MENU);
console.log(`✅  Seeded ${MENU.length} menu items.`);

/* Sample reviews */
const rc = db.prepare('SELECT COUNT(*) as c FROM reviews').get();
if (rc.c === 0) {
  const ri = db.prepare("INSERT INTO reviews (customer_name,rating,review_text,favourite_dish,status) VALUES (?,?,?,?,?)");
  [
    ['Joshua Appiah',    5, 'Food: 5, Service: 5, Atmosphere: 5. Everything about this place is top class. The pizza and Continental dishes are excellent!', 'Chicken Pizza', 'approved'],
    ['Francis Mwini',    5, 'The atmosphere is serene, the food is superb, and above all it is time-saving. Highly recommended!', 'Chicken Curry', 'approved'],
    ['Emmanuel Be-Large',5, 'They carry themselves very well and their environment is very neat. A wonderful place to be.', 'Beef Escalope', 'approved'],
  ].forEach(r => ri.run(...r));
  console.log('✅  Seeded 3 sample reviews.');
}

console.log('\n🎉  Te-Deum database seeding complete!\n');
process.exit(0);
