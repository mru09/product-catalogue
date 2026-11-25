# Backend Specification 3: Product Catalogue

## Scope

Implement public APIs for categories, filtered catalogue listings, and product detail.

## List products

- Route: `GET /api/products`
- Optional query `category`: exact category match.
- Optional query `q`: case-insensitive title search.
- Trim and limit `q` to 100 characters.
- Use a case-insensitive regular-expression title filter.
- Sort by category ascending, then title ascending.
- Limit results to 100 documents.
- Return lean Mongoose documents.

Examples:

- `/api/products`
- `/api/products?category=Jewellery`
- `/api/products?q=ring`
- `/api/products?category=Home&q=lamp`

Category and search parameters must compose as one MongoDB filter.

## List categories

- Route: `GET /api/products/categories`
- Return all distinct non-duplicate `category` values.
- Return a JSON string array.
- Ordering is not required unless the implementation sorts it; the frontend must tolerate any stable list.

## Product detail

- Route: `GET /api/products/:id`
- Accept a MongoDB ObjectId.
- Return lean product data for an existing ID.
- Return HTTP `404` `{ "message": "Product not found" }` for no match.

## Product response shape

```json
{
  "_id": "<mongodb-id>",
  "title": "Classic Gold Pendant",
  "description": "Minimal gold-finish pendant for everyday styling.",
  "price": 1299,
  "category": "Jewellery",
  "image": "https://placehold.co/600x600?text=Classic%20Gold%20Pendant"
}
```

Timestamp and average-rating fields may be returned by Mongoose, but the frontend contract requires at least the fields above.

## Behavioural requirements

- Category filters must match seeded category names exactly.
- Search should find text anywhere in the title using case-insensitive matching.
- An empty `q` should not add a title filter.
- Invalid ObjectIds may be handled by Mongoose/database error handling as a server error unless an explicit validation converts it to `404`.
- Public catalogue routes do not require authentication.

## Acceptance

- All products can be listed.
- Category-only filtering works.
- Search-only filtering works.
- Combined category/search filtering works.
- Categories contain no duplicates.
- Product detail works for a valid seeded ID.
- Missing product detail returns HTTP `404`.
