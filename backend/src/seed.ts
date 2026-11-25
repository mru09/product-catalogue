import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { Product } from "./models/Product.js";
import { Rating } from "./models/Rating.js";
import { User } from "./models/User.js";

const catalogue: Record<string, string[]> = {
  Jewellery: [
    "Classic Gold Pendant", "Pearl Drop Earrings", "Silver Chain Bracelet", "Rose Gold Hoops",
    "Layered Charm Necklace", "Crystal Stud Earrings", "Beaded Statement Bracelet",
    "Minimalist Cuff", "Heart Pendant Necklace", "Gemstone Ring"
  ],
  "Home Decor": [
    "Linen Cushion Cover", "Ceramic Table Vase", "Abstract Wall Print", "Woven Storage Basket",
    "Decorative Photo Frame", "Scented Candle Jar", "Cotton Table Runner", "Decorative Trinket Tray",
    "Ceramic Planter", "Macrame Wall Hanging"
  ],
  Accessories: [
    "Classic Sunglasses", "Leather Card Holder", "Everyday Backpack", "Minimalist Belt",
    "Travel Passport Cover", "Metal Keychain", "Soft Knit Scarf", "Classic Baseball Cap",
    "Compact Wallet", "Everyday Hair Clip Set"
  ],
  Lighting: [
    "Brass Desk Lamp", "Linen Table Lamp", "LED String Lights", "Glass Pendant Light",
    "Wooden Bedside Lamp", "Rechargeable Night Light", "Minimal Floor Lamp", "Cage Wall Sconce",
    "Ceramic Accent Lamp", "Motion Sensor Light"
  ],
  Kitchen: [
    "Ceramic Coffee Mug", "Acacia Serving Board", "Glass Storage Jar Set", "Stainless Steel Bottle",
    "Cotton Kitchen Towels", "Bamboo Utensil Set", "Non-stick Frying Pan", "Measuring Cup Set",
    "Manual Coffee Press", "Stoneware Dinner Plate"
  ],
  Furniture: [
    "Compact Side Table", "Ergonomic Study Chair", "Floating Wall Shelf", "Oak Finish Bookshelf",
    "Round Coffee Table", "Foldable Laptop Desk", "Upholstered Footstool", "Entryway Shoe Rack",
    "Minimal Dining Chair", "Bedside Drawer Unit"
  ],
  Beauty: [
    "Daily Moisturiser", "Gentle Face Cleanser", "Makeup Brush Set", "Reusable Makeup Pads",
    "Lip Care Balm", "Facial Roller", "Travel Toiletry Pouch", "Nail Care Kit", "Body Lotion",
    "Vanity Organiser"
  ],
  Fashion: [
    "Classic Cotton T-Shirt", "Relaxed Linen Shirt", "Straight Fit Denim", "Everyday Hoodie",
    "Pleated Midi Skirt", "Casual Cotton Dress", "Lightweight Cardigan", "Tailored Trousers",
    "Printed Summer Top", "Classic Denim Jacket"
  ],
  Bags: [
    "Canvas Tote Bag", "Structured Shoulder Bag", "Mini Crossbody Bag", "Laptop Messenger Bag",
    "Weekend Duffel Bag", "Woven Handbag", "Travel Organiser Pouch", "Quilted Sling Bag",
    "Drawstring Gym Bag", "Compact Wallet Clutch"
  ],
  Watches: [
    "Classic Analog Watch", "Mesh Strap Watch", "Leather Strap Watch", "Sport Digital Watch",
    "Rose Gold Dial Watch", "Minimal Black Watch", "Silver Link Watch", "Kids Everyday Watch",
    "Square Dial Watch", "Chronograph Style Watch"
  ],
  Stationery: [
    "Hardcover Notebook", "Pastel Pen Set", "Weekly Planner", "Desk Organizer",
    "Minimal Desk Calendar", "Watercolour Sketchbook", "Sticky Notes Bundle",
    "Metal Bookmark Set", "Document Folder Set", "Mechanical Pencil Kit"
  ],
  Outdoor: [
    "Insulated Picnic Flask", "Compact Picnic Blanket", "Portable Camping Lantern", "Garden Tool Set",
    "Reusable Water Bottle", "Foldable Travel Umbrella", "Outdoor Seat Cushion", "Plant Watering Can",
    "Thermal Lunch Bag", "Compact Yoga Mat"
  ]
};

const demoUsers = [
  { name: "Mrunal", email: "mrunal@example.com" },
  { name: "Alex", email: "alex@example.com" }
];

const categoryBasePricesInr: Record<string, number> = {
  Jewellery: 799,
  "Home Decor": 499,
  Accessories: 399,
  Lighting: 999,
  Kitchen: 299,
  Furniture: 2499,
  Beauty: 249,
  Fashion: 699,
  Bags: 599,
  Watches: 1499,
  Stationery: 149,
  Outdoor: 499
};

async function seed(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  await Promise.all([Product.init(), User.init(), Rating.init()]);

  const passwordHash = await bcrypt.hash("demo123", 10);
  for (const user of demoUsers) {
    await User.updateOne(
      { email: user.email },
      { $set: { ...user, passwordHash } },
      { upsert: true }
    );
  }

  let inserted = 0;
  let updated = 0;
  const categories = Object.entries(catalogue);
  for (const [category, titles] of categories) {
    for (const [index, title] of titles.entries()) {
      const result = await Product.updateOne(
        { title, category },
        {
          $set: {
            title,
            description: `${title} from our ${category.toLowerCase()} collection.`,
            price: categoryBasePricesInr[category] + index * 100,
            category,
            image: `https://placehold.co/600x600?text=${encodeURIComponent(title)}`,
            averageRating: 0
          }
        },
        { upsert: true }
      );
      if (result.upsertedCount > 0) inserted += 1;
      else updated += 1;
    }
  }

  console.log("Seeding completed successfully.");
  console.log(`Categories (${categories.length}): ${categories.map(([category]) => category).join(", ")}`);
  console.log(`Products: ${inserted} inserted, ${updated} updated.`);
}

async function main(): Promise<void> {
  try {
    await seed();
  } catch (error: unknown) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch (error: unknown) {
      console.error("Failed to disconnect from MongoDB:", error);
      process.exitCode = 1;
    }
  }
}

void main();
