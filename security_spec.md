# Security Specification - T-Facile

## 1. Data Invariants
- Products in the catalog must have a unique code as document ID.
- Products are publicly readable for consultation.
- Only authenticated users with 'admin' role (or the bootstrap email) can create or update products.
- User profiles are private to the owner and admins.
- Timestamps must be server-controlled.

## 2. Tested Payloads (Expected to fail)
1. **Unauthenticated Write**: `{ identity: { code: '123' }, pricing: { currentPrice: 10 } }` (No auth)
2. **Identity Spoofing**: User `A` trying to update document `products/xyz` with `identity.code: 'abc'`.
3. **Ghost Field**: `{ identity: { code: '123' }, isVerified: true }` (Invalid schema)
4. **Invalid Price**: `{ pricing: { currentPrice: -5 } }` (Negative price)
5. **PII Leak**: Unauthenticated reading of `/users/some_user_id`.
6. **Self-Promotion**: User `A` creating `/users/A` with `{ role: 'admin' }`.
7. **Bypassing Server Time**: `{ updatedAt: "2023-01-01T00:00:00Z" }` (Manual timestamp).

## 3. Test Plan
Verifying that:
- `get /products/123` works for anyone.
- `list /products` works for anyone.
- `create /products/123` fails for non-admins.
- `update /users/my_id` works for `my_id`.
- `get /admins/any_id` fails for non-admins.
