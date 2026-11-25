# Backend Specification 4: Ratings and Enquiries

## Scope

Implement authenticated per-user ratings and public product enquiry email submission.

## Ratings routes

All routes are protected by Bearer authentication.

### Get top-rated products

- Route: `GET /api/me/top-rated`
- Find every `Rating` document for `req.userId`.
- Populate the `product` reference.
- Sort by rating descending, then `updatedAt` descending.
- Return lean rows in this shape:

```json
[
  {
    "product": {
      "_id": "<mongodb-id>",
      "title": "<title>",
      "description": "<description>",
      "price": 999,
      "category": "<category>",
      "image": "<image>"
    },
    "rating": 5
  }
]
```

Exclude rating rows whose populated product no longer exists.

### Get raw ratings

- Route: `GET /api/me`
- Return all rating documents belonging to `req.userId` as lean Mongoose documents.

### Save or replace a rating

- Route: `PUT /api/me/products/:id`
- Request:

```json
{
  "rating": 4
}
```

- Convert `rating` to a number.
- Require an integer from `1` through `5`.
- Invalid values return HTTP `400` `{ "message": "Rating must be an integer from 1 to 5" }`.
- Verify the product exists.
- Missing product returns HTTP `404` `{ "message": "Product not found" }`.
- Use `findOneAndUpdate` with:
  - filter `{ user: req.userId, product: product.id }`
  - update `{ rating }`
  - `upsert: true`
  - `new: true`
  - defaults on insert
- Success returns:

```json
{
  "message": "Your rating was saved",
  "rating": 4
}
```

One rating record exists per user/product pair. Saving again replaces the previous value.

## Enquiry endpoint

- Route: `POST /api/enquiries`
- Public endpoint; no login required.
- Request body:

```json
{
  "productId": "<mongodb-id>",
  "name": "Customer name",
  "email": "customer@example.com",
  "phone": "+91-9876543210",
  "message": "Optional message"
}
```

## Enquiry validation

- Require `productId`, `name`, `email`, and `phone` with correct types.
- `message` is optional, but it must be a string when supplied.
- `productId` must be a valid MongoDB ObjectId.
- Trim name, email, phone, and message.
- Name: required and maximum 100 characters.
- Email: required, maximum 254 characters, and basic email format.
- Phone: required and maximum 40 characters.
- Message: maximum 2000 characters.
- Invalid data returns HTTP `400` `{ "message": "Please provide valid enquiry details." }`.
- Unknown product returns HTTP `404` `{ "message": "Product not found." }`.

## Email delivery

- Create a Nodemailer SMTP transporter using `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`.
- If host, user, password, or sender is missing, return HTTP `503` `{ "message": "Enquiry email service is not configured." }`.
- Sender is `SMTP_FROM`.
- Recipient is `queendev1998@gmail.com`.
- Set `replyTo` to the customer email.
- Subject: `Product enquiry: <product title>`
- Include product title, product ID, customer name, email, phone, and message in plain text.
- Use `(none)` when message is empty.
- Success returns HTTP `200` `{ "message": "Enquiry submitted successfully." }`.

## Acceptance

- A logged-in user can save, update, list, and top-sort ratings.
- A second rating for the same product replaces rather than duplicates it.
- Ratings outside `1`-`5` are rejected.
- Top-rated results include only populated products.
- Valid enquiries send an email when SMTP is configured.
- Invalid enquiries are rejected before database/email operations.
- Missing SMTP configuration returns `503`.
