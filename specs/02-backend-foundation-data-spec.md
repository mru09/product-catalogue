# Backend Specification 1: Foundation, Configuration, and Data

## Scope

Implement the backend process, Express composition, environment handling, MongoDB connection, Mongoose models, seed data, and shared middleware.

## Environment and startup

- Read `backend/.env` relative to `backend/src/config/env.ts`.
- Apply defaults:
  - Port `4000`
  - MongoDB `mongodb://127.0.0.1:27017/catalogue`
  - JWT secret `change-this-development-secret`
  - client origin `http://localhost:5173`
  - node environment `development`
  - SMTP port `587`
  - SMTP secure `false`
- Keep the JWT secret configurable and state in production documentation that it must be rotated and kept secret.
- Connect to MongoDB before listening.
- Log the listening URL and MongoDB connection status.

## Express app

Mount, in order:

1. CORS restricted to `CLIENT_ORIGIN`.
2. JSON parser with a `1 MB` request limit.
3. `GET /api/health`, returning `{ "status": "ok" }`.
4. Authentication routes at `/api/auth`.
5. Product routes at `/api/products`.
6. Rating routes at `/api/me`.
7. Enquiry routes at `/api/enquiries`.
8. JSON route-not-found handler.
9. JSON error handler.

## Mongoose models

### Product

Fields:

- `title`: required string
- `description`: string
- `price`: number
- `category`: indexed string
- timestamps
- `image`: string
- `averageRating`: number, default `0`

### User

Fields:

- `name`: string
- `email`: unique string
- `passwordHash`: string
- timestamps

### Rating

Fields:

- `user`: ObjectId reference to `User`, indexed
- `product`: ObjectId reference to `Product`, indexed
- `rating`: required integer range `1` to `5`
- timestamps

Create a compound unique index on `{ user: 1, product: 1 }`, preventing duplicate ratings by the same user for the same product.

## Shared middleware

- Implement an async handler that forwards controller rejections to Express error handling.
- `notFound` returns HTTP `404` with `{ "message": "Route not found" }`.
- `errorHandler` logs the error and returns HTTP `500`.
- Hide error details in production and return `{ "message": "Internal server error" }`.
- Preserve a useful error message in development.

## Seed catalogue

Seed exactly these category/data groups:

- Jewellery: Classic Gold Pendant, Pearl Drop Earrings, Silver Chain Bracelet, Rose Gold Hoops, Layered Charm Necklace, Crystal Stud Earrings, Beaded Statement Bracelet, Minimalist Cuff, Heart Pendant Necklace, Gemstone Ring.
- Home Decor: Linen Cushion Cover, Ceramic Table Vase, Abstract Wall Print, Woven Storage Basket, Decorative Photo Frame, Scented Candle Jar, Cotton Table Runner, Decorative Trinket Tray, Ceramic Planter, Macrame Wall Hanging.
- Accessories: Classic Sunglasses, Leather Card Holder, Everyday Backpack, Minimalist Belt, Travel Passport Cover, Metal Keychain, Soft Knit Scarf, Classic Baseball Cap, Compact Wallet, Everyday Hair Clip Set.
- Lighting: Brass Desk Lamp, Linen Table Lamp, LED String Lights, Glass Pendant Light, Wooden Bedside Lamp, Rechargeable Night Light, Minimal Floor Lamp, Cage Wall Sconce, Ceramic Accent Lamp, Motion Sensor Light.
- Kitchen: Ceramic Coffee Mug, Acacia Serving Board, Glass Storage Jar Set, Stainless Steel Bottle, Cotton Kitchen Towels, Bamboo Utensil Set, Non-stick Frying Pan, Measuring Cup Set, Manual Coffee Press, Stoneware Dinner Plate.
- Furniture: Compact Side Table, Ergonomic Study Chair, Floating Wall Shelf, Oak Finish Bookshelf, Round Coffee Table, Foldable Laptop Desk, Upholstered Footstool, Entryway Shoe Rack, Minimal Dining Chair, Bedside Drawer Unit.
- Beauty: Daily Moisturiser, Gentle Face Cleanser, Makeup Brush Set, Reusable Makeup Pads, Lip Care Balm, Facial Roller, Travel Toiletry Pouch, Nail Care Kit, Body Lotion, Vanity Organiser.
- Fashion: Classic Cotton T-Shirt, Relaxed Linen Shirt, Straight Fit Denim, Everyday Hoodie, Pleated Midi Skirt, Casual Cotton Dress, Lightweight Cardigan, Tailored Trousers, Printed Summer Top, Classic Denim Jacket.
- Bags: Canvas Tote Bag, Structured Shoulder Bag, Mini Crossbody Bag, Laptop Messenger Bag, Weekend Duffel Bag, Woven Handbag, Travel Organiser Pouch, Quilted Sling Bag, Drawstring Gym Bag, Compact Wallet Clutch.
- Watches: Classic Analog Watch, Mesh Strap Watch, Leather Strap Watch, Sport Digital Watch, Rose Gold Dial Watch, Minimal Black Watch, Silver Link Watch, Kids Everyday Watch, Square Dial Watch, Chronograph Style Watch.
- Stationery: Hardcover Notebook, Pastel Pen Set, Weekly Planner, Desk Organizer, Minimal Desk Calendar, Watercolour Sketchbook, Sticky Notes Bundle, Metal Bookmark Set, Document Folder Set, Mechanical Pencil Kit.
- Outdoor: Insulated Picnic Flask, Compact Picnic Blanket, Portable Camping Lantern, Garden Tool Set, Reusable Water Bottle, Foldable Travel Umbrella, Outdoor Seat Cushion, Plant Watering Can, Thermal Lunch Bag, Compact Yoga Mat.

Use the descriptions and INR prices already present in the source implementation. The new repository must not replace a product by title alone if category differs; identify products by both title and category.

Demo users are `Mrunal` and `Alex`, with lowercase emails and password hash generated using bcrypt cost `10`. Upsert rather than duplicate users.

## Acceptance

- Health endpoint works before authentication.
- MongoDB connection is mandatory before server startup.
- Invalid routes return the route-not-found JSON response.
- All schema indexes are created.
- Seeder prints success/failure, category count, inserted/updated counts, and disconnects safely.
