import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Product, User } from "./models/index.js";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/lumora_catalogue";

type SeedProduct = {
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

const catalogue: Array<{
  category: string;
  products: Array<{ title: string; description: string; price: number }>;
}> = [
  {
    category: "Jewellery",
    products: [
      [
        "Classic Gold Pendant",
        "Minimal gold-finish pendant for everyday styling.",
        1299,
      ],
      [
        "Pearl Drop Earrings",
        "Elegant faux-pearl drop earrings for day or evening.",
        899,
      ],
      [
        "Silver Chain Bracelet",
        "Delicate silver-tone chain bracelet with a polished finish.",
        749,
      ],
      ["Rose Gold Hoops", "Lightweight rose-gold-tone hoop earrings.", 999],
      [
        "Layered Charm Necklace",
        "Layered necklace with subtle decorative charms.",
        1499,
      ],
      [
        "Crystal Stud Earrings",
        "Compact crystal-look studs for a refined accent.",
        599,
      ],
      [
        "Beaded Statement Bracelet",
        "Colourful hand-finished beads on a comfortable band.",
        649,
      ],
      [
        "Minimalist Cuff",
        "Sculptural open cuff with a smooth metallic finish.",
        1199,
      ],
      [
        "Heart Pendant Necklace",
        "Small heart pendant on an adjustable chain.",
        1099,
      ],
      [
        "Gemstone Ring",
        "Adjustable fashion ring with a coloured centre stone.",
        1399,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Home Decor",
    products: [
      [
        "Linen Cushion Cover",
        "Textured neutral cushion cover for a relaxed living space.",
        599,
      ],
      [
        "Ceramic Table Vase",
        "Matte ceramic vase for shelves, consoles and tables.",
        899,
      ],
      [
        "Abstract Wall Print",
        "Modern abstract art print for a gallery wall.",
        749,
      ],
      [
        "Woven Storage Basket",
        "Handwoven-look basket for tidy everyday storage.",
        699,
      ],
      [
        "Decorative Photo Frame",
        "Simple tabletop frame with a timeless profile.",
        499,
      ],
      [
        "Scented Candle Jar",
        "Decorative candle jar for a warm ambient glow.",
        449,
      ],
      [
        "Cotton Table Runner",
        "Soft cotton runner to style a dining or coffee table.",
        549,
      ],
      [
        "Decorative Trinket Tray",
        "Small catch-all tray for jewellery and daily essentials.",
        399,
      ],
      ["Ceramic Planter", "Minimal planter pot for indoor greenery.", 649],
      ["Macrame Wall Hanging", "Textured wall accent for a cosy room.", 999],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Accessories",
    products: [
      [
        "Classic Sunglasses",
        "Timeless sunglasses with a versatile everyday silhouette.",
        999,
      ],
      [
        "Leather Card Holder",
        "Slim card holder for cards and daily essentials.",
        699,
      ],
      [
        "Everyday Backpack",
        "Lightweight backpack with practical storage compartments.",
        1599,
      ],
      [
        "Minimalist Belt",
        "Classic belt with a clean buckle and adjustable fit.",
        799,
      ],
      [
        "Travel Passport Cover",
        "Protective passport cover for organised travel.",
        599,
      ],
      ["Metal Keychain", "Compact metal keychain with a polished finish.", 299],
      ["Soft Knit Scarf", "Lightweight scarf for comfortable layering.", 899],
      [
        "Classic Baseball Cap",
        "Adjustable cap for casual everyday outfits.",
        499,
      ],
      ["Compact Wallet", "Everyday wallet with organised card slots.", 1099],
      [
        "Everyday Hair Clip Set",
        "Set of durable clips for simple everyday styling.",
        349,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Lighting",
    products: [
      [
        "Brass Desk Lamp",
        "Compact desk lamp with a warm metallic finish.",
        1899,
      ],
      [
        "Linen Table Lamp",
        "Soft fabric shade for gentle ambient lighting.",
        2199,
      ],
      [
        "LED String Lights",
        "Decorative warm-white string lights for indoor spaces.",
        499,
      ],
      [
        "Glass Pendant Light",
        "Modern pendant light shade for a statement corner.",
        2499,
      ],
      [
        "Wooden Bedside Lamp",
        "Natural-look bedside lamp with a simple profile.",
        1699,
      ],
      [
        "Rechargeable Night Light",
        "Portable night light with a soft diffused glow.",
        799,
      ],
      [
        "Minimal Floor Lamp",
        "Slim floor lamp designed for reading corners.",
        3299,
      ],
      [
        "Cage Wall Sconce",
        "Industrial-inspired wall light for accent lighting.",
        1499,
      ],
      [
        "Ceramic Accent Lamp",
        "Decorative ceramic base with a neutral shade.",
        1999,
      ],
      [
        "Motion Sensor Light",
        "Practical motion-activated light for cupboards and halls.",
        699,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Kitchen",
    products: [
      [
        "Ceramic Coffee Mug",
        "Hand-finished ceramic mug for daily coffee or tea.",
        399,
      ],
      [
        "Acacia Serving Board",
        "Natural wood serving board for snacks and appetisers.",
        899,
      ],
      [
        "Glass Storage Jar Set",
        "Clear storage jars to organise pantry essentials.",
        799,
      ],
      [
        "Stainless Steel Bottle",
        "Reusable insulated bottle for everyday hydration.",
        699,
      ],
      [
        "Cotton Kitchen Towels",
        "Absorbent cotton towel set for kitchen use.",
        349,
      ],
      [
        "Bamboo Utensil Set",
        "Lightweight reusable utensils for daily cooking.",
        599,
      ],
      [
        "Non-stick Frying Pan",
        "Everyday frying pan with an easy-clean surface.",
        1199,
      ],
      [
        "Measuring Cup Set",
        "Stackable measuring cups for accurate preparation.",
        449,
      ],
      [
        "Manual Coffee Press",
        "Simple coffee press for a fresh cup at home.",
        1399,
      ],
      [
        "Stoneware Dinner Plate",
        "Minimal stoneware plate for everyday dining.",
        549,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Furniture",
    products: [
      [
        "Compact Side Table",
        "Space-saving side table for a sofa or bedside.",
        2499,
      ],
      [
        "Ergonomic Study Chair",
        "Supportive chair designed for a home workspace.",
        4999,
      ],
      [
        "Floating Wall Shelf",
        "Clean-lined shelf for books and decorative objects.",
        1299,
      ],
      [
        "Oak Finish Bookshelf",
        "Open bookshelf with a warm wood-look finish.",
        3999,
      ],
      [
        "Round Coffee Table",
        "Simple round coffee table for a living room.",
        3499,
      ],
      [
        "Foldable Laptop Desk",
        "Practical foldable desk for flexible workspaces.",
        1899,
      ],
      [
        "Upholstered Footstool",
        "Compact footstool with a soft upholstered top.",
        2199,
      ],
      ["Entryway Shoe Rack", "Organised shoe storage for an entryway.", 1699],
      [
        "Minimal Dining Chair",
        "Versatile dining chair with a clean modern shape.",
        2799,
      ],
      [
        "Bedside Drawer Unit",
        "Compact bedside storage with easy-access drawers.",
        3299,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Beauty",
    products: [
      [
        "Daily Moisturiser",
        "Lightweight moisturiser for a comfortable daily routine.",
        499,
      ],
      [
        "Gentle Face Cleanser",
        "Mild daily cleanser for a fresh skin feel.",
        349,
      ],
      [
        "Makeup Brush Set",
        "Essential brush set for blending and application.",
        799,
      ],
      [
        "Reusable Makeup Pads",
        "Washable soft pads for a lower-waste routine.",
        299,
      ],
      ["Lip Care Balm", "Moisturising balm for everyday lip care.", 199],
      [
        "Facial Roller",
        "Smooth facial massage roller for a relaxing routine.",
        599,
      ],
      [
        "Travel Toiletry Pouch",
        "Compact zip pouch for beauty and grooming essentials.",
        449,
      ],
      ["Nail Care Kit", "Basic grooming kit with everyday nail tools.", 549],
      ["Body Lotion", "Everyday body lotion with a lightweight texture.", 399],
      [
        "Vanity Organiser",
        "Desktop organiser for makeup and skincare items.",
        699,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Fashion",
    products: [
      [
        "Classic Cotton T-Shirt",
        "Soft cotton tee with a versatile everyday fit.",
        599,
      ],
      [
        "Relaxed Linen Shirt",
        "Breathable relaxed shirt for casual styling.",
        1299,
      ],
      [
        "Straight Fit Denim",
        "Classic straight-fit denim for everyday wear.",
        1799,
      ],
      ["Everyday Hoodie", "Comfortable hoodie for relaxed layering.", 1499],
      [
        "Pleated Midi Skirt",
        "Flowing midi skirt for smart-casual outfits.",
        1199,
      ],
      [
        "Casual Cotton Dress",
        "Easy-to-wear dress for everyday occasions.",
        1599,
      ],
      ["Lightweight Cardigan", "Soft cardigan for comfortable layering.", 1399],
      [
        "Tailored Trousers",
        "Clean-cut trousers for work and weekend looks.",
        1699,
      ],
      [
        "Printed Summer Top",
        "Lightweight printed top for warm-weather outfits.",
        799,
      ],
      [
        "Classic Denim Jacket",
        "Versatile denim jacket for transitional weather.",
        2299,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Bags",
    products: [
      [
        "Canvas Tote Bag",
        "Reusable canvas tote for errands and daily essentials.",
        499,
      ],
      [
        "Structured Shoulder Bag",
        "Structured everyday shoulder bag with neat storage.",
        1799,
      ],
      [
        "Mini Crossbody Bag",
        "Compact crossbody bag for hands-free outings.",
        1299,
      ],
      [
        "Laptop Messenger Bag",
        "Padded messenger bag for carrying a laptop.",
        2199,
      ],
      [
        "Weekend Duffel Bag",
        "Roomy duffel for short trips and gym essentials.",
        1899,
      ],
      [
        "Woven Handbag",
        "Textured handbag for casual and occasion styling.",
        1499,
      ],
      [
        "Travel Organiser Pouch",
        "Zip pouch to keep travel accessories organised.",
        399,
      ],
      ["Quilted Sling Bag", "Lightweight quilted sling for everyday use.", 999],
      [
        "Drawstring Gym Bag",
        "Simple drawstring bag for workout essentials.",
        349,
      ],
      [
        "Compact Wallet Clutch",
        "Small clutch wallet for cards and essentials.",
        899,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Watches",
    products: [
      [
        "Classic Analog Watch",
        "Minimal analog watch for everyday styling.",
        2499,
      ],
      [
        "Mesh Strap Watch",
        "Slim watch with a comfortable mesh-style strap.",
        2799,
      ],
      [
        "Leather Strap Watch",
        "Traditional dial paired with a leather-look strap.",
        2299,
      ],
      [
        "Sport Digital Watch",
        "Practical digital watch for active routines.",
        1499,
      ],
      [
        "Rose Gold Dial Watch",
        "Elegant rose-gold-tone watch for occasion wear.",
        2999,
      ],
      [
        "Minimal Black Watch",
        "Understated black watch with a clean dial.",
        1999,
      ],
      ["Silver Link Watch", "Classic silver-tone link bracelet watch.", 2599],
      [
        "Kids Everyday Watch",
        "Easy-to-read watch designed for younger users.",
        999,
      ],
      ["Square Dial Watch", "Modern square dial with a simple display.", 2199],
      [
        "Chronograph Style Watch",
        "Multi-detail dial with a sporty look.",
        3299,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Stationery",
    products: [
      [
        "Hardcover Notebook",
        "Hardcover notebook for notes, plans and ideas.",
        299,
      ],
      [
        "Pastel Pen Set",
        "Smooth-writing pens in a set of assorted colours.",
        249,
      ],
      ["Weekly Planner", "Undated weekly planner for organising tasks.", 399],
      ["Desk Organizer", "Compact organiser for a tidy workspace.", 499],
      ["Minimal Desk Calendar", "Simple desk calendar for date planning.", 349],
      [
        "Watercolour Sketchbook",
        "Thick-paper sketchbook for creative projects.",
        599,
      ],
      [
        "Sticky Notes Bundle",
        "Colourful sticky notes for reminders and labels.",
        199,
      ],
      ["Metal Bookmark Set", "Slim decorative bookmarks for reading.", 179],
      ["Document Folder Set", "Folders to organise papers and documents.", 299],
      [
        "Mechanical Pencil Kit",
        "Mechanical pencil with spare lead and eraser.",
        229,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
  {
    category: "Outdoor",
    products: [
      [
        "Insulated Picnic Flask",
        "Reusable flask for drinks on outdoor days.",
        899,
      ],
      [
        "Compact Picnic Blanket",
        "Foldable blanket for parks and outdoor breaks.",
        999,
      ],
      [
        "Portable Camping Lantern",
        "Compact lantern for campsite and garden use.",
        1199,
      ],
      ["Garden Tool Set", "Basic hand tools for small gardening tasks.", 799],
      [
        "Reusable Water Bottle",
        "Lightweight bottle for walks and outdoor activities.",
        449,
      ],
      [
        "Foldable Travel Umbrella",
        "Compact umbrella for changing weather.",
        599,
      ],
      ["Outdoor Seat Cushion", "Portable cushion for outdoor seating.", 499],
      ["Plant Watering Can", "Small watering can for balcony plants.", 399],
      ["Thermal Lunch Bag", "Insulated bag for carrying meals outdoors.", 549],
      [
        "Compact Yoga Mat",
        "Portable exercise mat for stretching and yoga.",
        1099,
      ],
    ].map(([title, description, price]) => ({
      title: title as string,
      description: description as string,
      price: price as number,
    })),
  },
];

const productSeedData: SeedProduct[] = catalogue.flatMap(
  ({ category, products }) =>
    products.map((product) => ({
      ...product,
      category,
      image: `https://placehold.co/600x600?text=${encodeURIComponent(product.title)}`,
    })),
);

async function seedUsers() {
  const passwordHash = await bcrypt.hash("demo123", 10);
  const demoUsers = [
    { name: "Mrunal", email: "mrunal@example.com" },
    { name: "Alex", email: "alex@example.com" },
  ];

  for (const user of demoUsers) {
    await User.updateOne(
      { email: user.email },
      { $set: { ...user, passwordHash } },
      { upsert: true },
    );
  }
}

async function seedProducts() {
  let inserted = 0;
  let updated = 0;

  for (const product of productSeedData) {
    const result = await Product.updateOne(
      { title: product.title, category: product.category },
      { $set: { ...product, averageRating: 0 } },
      { upsert: true },
    );

    if (result.upsertedCount > 0) inserted += 1;
    else if (result.modifiedCount > 0) updated += 1;
  }

  return { inserted, updated };
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
    console.log(
      `Preparing ${productSeedData.length} products across ${catalogue.length} categories...`,
    );

    await seedUsers();
    const counts = await seedProducts();

    console.log("Seed completed successfully.");
    console.log(
      `Categories: ${catalogue.map((item) => item.category).join(", ")}`,
    );
    console.log(`Products inserted: ${counts.inserted}`);
    console.log(`Products updated: ${counts.updated}`);
    console.log("Demo logins:");
    console.log("  mrunal@example.com / demo123");
    console.log("  alex@example.com / demo123");
    console.log("Existing user ratings were not deleted.");
  } catch (error) {
    console.error(
      "Seed failed. Check that MongoDB Community Server is running and MONGODB_URI is correct.",
    );
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
