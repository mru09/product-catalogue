# Frontend Specification 3: Catalogue

## Scope

Implement search, category tabs, product grid, loading/error states, and catalogue navigation.

## Initial load

- Fetch `/products/categories`.
- Fetch `/products?` for all products.
- Render an error message if either request fails.
- Categories and products must be independent so that a category failure does not prevent product loading.

## Search

- Render an input with placeholder `Search products...`.
- Maintain separate draft `query` and submitted `submitted` values.
- Do not search while the user types; submit only through the form.
- Trim whitespace on submit.
- Preserve an empty search as no search parameter.

## Category tabs

- Render an `All` tab plus one tab per distinct category.
- `All` clears the category filter.
- Selecting a category sets that category.
- The active tab receives the `active` class.
- Category selections and submitted search combine into one request.

## Request construction

Use `URLSearchParams` semantics:

- All: `/products?`
- Category: `/products?category=<category>`
- Search: `/products?q=<trimmed query>`
- Category plus search: `/products?category=<category>&q=<query>`

Search and category changes trigger the product request. The request should rerun for:

- Selecting category
- Selecting All
- Submitting search

## Heading

- Search submitted: `Results for “<query>”`
- Category only: `<category>`
- No search/category: `All products`

If submitted search and category both exist, the heading should still reflect the submitted search text, not category.

## Product grid

- Render a responsive grid.
- Each card links to `/products/<_id>`.
- Card image:
  - uses `loading="lazy"`
  - alt text equals product title
  - hide visually on load error
- Card content:
  - category
  - title
  - INR price formatted with `₹<price>`
- Cards should respond to hover by a subtle upward movement.

## Empty state

- If products is empty, show `No matching products found.` instead of an empty grid.

## Acceptance

Cover these behaviour tests:

1. Initial categories and all products load.
2. Selecting a category loads that category.
3. Submitted search is trimmed.
4. Category and search combine.
5. All restores all products.
6. Empty results show the empty state.
7. Category request error is shown.
8. Product request error is shown.
9. Typing alone does not submit search.
