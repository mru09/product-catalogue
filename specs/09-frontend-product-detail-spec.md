# Frontend Specification 4: Product Detail and Actions

## Scope

Implement product detail, authentication-gated rating, enquiry form/email feedback, and navigation.

## Product loading

- Read `id` from `/products/:id`.
- Reset page-local enquiry and rating state whenever `id` changes.
- Fetch `/products/<id>`.
- Show `Loading product...` until product response arrives.
- Show an API error instead of stale product data when loading fails.
- If the product is loaded:

```text
Product image
Category
Title
₹price
Description
```

## Existing rating

- If a token exists, fetch `/me/top-rated`.
- Find the row whose product `_id` equals route `id`.
- Initialize selected rating to that row's rating.
- API errors can be displayed in the shared page message.
- If no token exists, do not call the protected endpoint.

## Rating controls

- Render five buttons labelled with the star character.
- Rating values `1` through `5`.
- Selecting a star updates only local state.
- Filled class: `selected` for stars `<=` current rating.
- Save action:
  - No token: show `Please log in to save your rating.`.
  - Rating `0`: show `Please select a rating.`.
  - Valid: `PUT /me/products/<id>` with `{ rating }`.
  - Success: show the server message.
  - Failure: show the server message.

Do not call save with a missing product ID or no token.

## Enquiry panel

- Button text: `Enquire`.
- Toggle the enquiry form open/closed.
- Closing and reopening must preserve the current form state if not submitted.
- On successful submission:
  - replace the form with `Thank you! Your enquiry has been sent.`

## Enquiry form

Fields:

- Name: text, `name`, autocomplete `name`, maximum 100, required
- Email: email, `email`, autocomplete `email`, maximum 254, required
- Phone: telephone, `phone`, autocomplete `tel`, maximum 40, required
- Message: optional textarea, name `message`, maximum 2000, 4 rows

Submission:

1. Prevent browser navigation.
2. Require loaded product and route ID.
3. Set pending state and clear enquiry error.
4. Send `POST /enquiries` with:
   - `productId`
   - `name`
   - `email`
   - `phone`
   - `message`
5. Success sets enquiry sent state.
6. Failure shows the server/client error in an alert.
7. Pending always ends after success or failure.

Pending UI:

- Submit button disabled.
- Text `Sending...`.

## Navigation

- Include `← Back to catalogue` linking to `/catalogue`.
- Card and detail navigation must use React Router, not full page reloads.

## Responsive and visual requirements

- Desktop detail layout: 1fr / 1fr two-column grid.
- Mobile at 650px and below: single-column detail layout.
- Product image fills a large visual column and uses `object-fit: cover`.
- Rating stars remain accessible as buttons.
- Enquiry form fields remain vertically structured.

## Acceptance

- Valid product ID renders all detail fields.
- Invalid/missing product ID shows an error or loading-safe fallback.
- Existing rating is preselected for logged-in users.
- Logged-out save is blocked locally with a clear message.
- Rating `1`-`5` saves successfully and can be replaced.
- Enquiry form validates browser-required fields.
- Enquiry pending state prevents duplicate submissions.
- Enquiry success replaces the form.
- Enquiry failure remains in the form and shows an alert.
