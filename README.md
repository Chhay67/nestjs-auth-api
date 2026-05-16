# NestJS API Education Project

This project is a beginner-friendly NestJS API with JWT authentication, refresh token rotation, Swagger documentation, MongoDB through Mongoose, and a simple Products feature for testing protected routes.

## Refactor Recap

The project was refactored into a cleaner feature-based structure with improved JWT authentication, Swagger documentation, and a simple Products feature.

What changed:

- Moved feature code into `src/features`.
- Split core concerns into `common`, `config`, and `database`.
- Kept controllers thin and moved business logic into services.
- Added bcrypt password hashing.
- Added hashed refresh tokens stored in the database.
- Added refresh token rotation.
- Added logout that clears the stored refresh token.
- Added current-user decorator and JWT guard.
- Added environment variable validation.
- Added Swagger tags, bearer auth, operations, and response DTOs.
- Added public Swagger examples for request bodies, responses, and route parameters.
- Added a simple Products feature for testing authorization.
- Removed `POST /auth/signup`; use `POST /auth/register`.
- Removed `GET /auth/me`; use `GET /auth/profile`.
- Updated token expiry defaults to 5 minutes for access tokens and 1 day for refresh tokens.

## Folder Structure

```text
src/
  app.module.ts
  main.ts
  common/
    decorators/
      current-user.decorator.ts
    guards/
      jwt-auth.guard.ts
  config/
    config.ts
  database/
    database.module.ts
  features/
    auth/
      auth.controller.ts
      auth.module.ts
      auth.service.ts
      dto/
      schemas/
    users/
      users.module.ts
      users.service.ts
      schemas/
    products/
      products.controller.ts
      products.module.ts
      products.service.ts
      dto/
      schemas/
```

## Environment Variables

Create a `.env` file in the project root:

```env
CONNECTION_STRING=mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
JWT_ACCESS_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=1d
```

Required variables:

- `CONNECTION_STRING`
- `JWT_SECRET`

Optional variables:

- `PORT`, defaults to `3000`
- `JWT_ACCESS_EXPIRES_IN`, defaults to `5m`
- `JWT_REFRESH_EXPIRES_IN`, defaults to `1d`

## Current API Changes

The latest API shape is:

- Registration is only `POST /auth/register`.
- `POST /auth/signup` was removed.
- Current profile is only `GET /auth/profile`.
- `GET /auth/me` was removed.
- Access tokens expire after 5 minutes by default.
- Refresh tokens expire after 1 day by default.
- Refresh tokens are rotated, so every successful refresh returns a new refresh token.

## Authentication

Auth routes are under `/auth`.

| Method | Route | Protected | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive tokens |
| POST | `/auth/refresh-token` | No | Rotate refresh token and receive new tokens |
| POST | `/auth/logout` | Yes | Clear stored refresh token |
| GET | `/auth/profile` | Yes | Get current user profile |
| GET | `/auth/:id` | Yes | Existing get-user route, preserved |

### Login Response Shape

The login response keeps the existing frontend-friendly shape:

```json
{
  "id": "665f1f7d0f4f3a6a9a111111",
  "username": "example",
  "name": "example",
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

Access tokens include `tokenType: "access"` inside the JWT payload.

### Refresh Response Shape

The refresh response keeps the existing shape:

```json
{
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

Refresh tokens include `tokenType: "refresh"` inside the JWT payload.

### Refresh Token Flow

Use this flow when testing in Swagger or from the frontend:

1. Call `POST /auth/login`.
2. Copy `tokens.refreshToken` from the login response.
3. Call `POST /auth/refresh-token`.
4. Send the refresh token in the request body:

```json
{
  "refreshToken": "your_refresh_token"
}
```

The refresh endpoint also accepts a value with the Bearer prefix:

```json
{
  "refreshToken": "Bearer your_refresh_token"
}
```

After a successful refresh, replace both tokens on the frontend:

- replace the old access token with the new `accessToken`
- replace the old refresh token with the new `refreshToken`

Important: the previous refresh token becomes invalid after refresh token rotation. If refresh always returns `401 Refresh Token is invalid`, login again and use the newest `tokens.refreshToken`.

## Security Notes

- Passwords are hashed with bcrypt before saving.
- Passwords are never returned in API responses.
- Refresh tokens are hashed before being stored in MongoDB.
- Access tokens cannot be used as refresh tokens.
- Logout deletes the stored refresh token.
- Private routes use `JwtAuthGuard`.
- Environment variables are validated during app startup.
- Existing plaintext-password users can still log in once; after a successful login, their password is automatically upgraded to bcrypt.

## Products

Products are a simple feature for testing authentication and authorization.

Product fields:

- `id`
- `name`
- `description`
- `price`
- `createdAt`
- `updatedAt`

| Method | Route | Protected | Description |
| --- | --- | --- | --- |
| GET | `/products` | No | Get all products |
| GET | `/products/:id` | No | Get one product |
| POST | `/products` | Yes | Create product |
| PATCH | `/products/:id` | Yes | Update product |
| DELETE | `/products/:id` | Yes | Delete product |

For protected product routes, send the access token in the Authorization header:

```text
Authorization: Bearer your_access_token
```

## Swagger

Swagger is available at:

```text
http://localhost:3000/docs
```

If `PORT` is changed in `.env`, use that port instead.

Swagger includes:

- `Auth` tag
- `Products` tag
- public examples for all routes
- request DTO documentation
- response DTO documentation
- route parameter examples
- bearer token support for protected endpoints

## Install

```bash
npm install
```

## Run

```bash
npm run start
```

Watch mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run start:prod
```

## Verify

Build:

```bash
npm run build
```

Unit tests:

```bash
npm test -- --runInBand
```

## Notes

This project intentionally does not include roles or advanced permissions yet. Product authorization only checks that the user has a valid JWT access token.
