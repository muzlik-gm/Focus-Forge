# User Registration Endpoint

## Overview

The registration endpoint creates new user accounts with secure password hashing and input validation.

**Endpoint**: `POST /api/auth/register`

**Requirements**: 1.1, 13.1

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

### Validation Rules

- **email**: Must be a valid email address
- **password**: 
  - Minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
- **name**: 
  - Required, non-empty
  - Maximum 100 characters

## Response

### Success (201 Created)
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "FREE",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Validation Error (400 Bad Request)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Invalid email address"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Duplicate Email (409 Conflict)
```json
{
  "error": {
    "code": "USER_EXISTS",
    "message": "A user with this email already exists"
  }
}
```

### Server Error (500 Internal Server Error)
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An error occurred during registration"
  }
}
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
2. **Input Validation**: All inputs are validated using Zod schemas
3. **SQL Injection Prevention**: Prisma ORM provides parameterized queries
4. **Password Complexity**: Enforces strong password requirements
5. **No Password Exposure**: Password hash is never returned in responses

## Example Usage

### cURL
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

### JavaScript (fetch)
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123',
    name: 'John Doe',
  }),
});

const data = await response.json();

if (response.ok) {
  console.log('User created:', data.user);
} else {
  console.error('Registration failed:', data.error);
}
```

## Testing

### Unit Tests
Run unit tests:
```bash
npm test -- tests/unit/api/auth-register.test.ts
```

Unit tests cover:
- Valid registration
- Invalid email validation
- Weak password rejection
- Duplicate email prevention
- Missing field validation
- Database error handling

### Integration Tests
Run integration tests (requires database):
```bash
npm test -- tests/integration/auth-registration.test.ts --runInBand
```

Integration tests verify:
- Complete registration flow with database
- Password hashing verification
- Duplicate email prevention at database level
- Multiple user creation

## Implementation Details

### Password Hashing
- Algorithm: bcrypt
- Salt rounds: 12
- Hash format: `$2b$12$...`

### Database Schema
```prisma
model User {
  id               String           @id @default(cuid())
  email            String           @unique
  name             String
  passwordHash     String
  subscriptionTier SubscriptionTier @default(FREE)
  // ... other fields
}
```

### Default Values
- `subscriptionTier`: Set to `FREE` for new users
- `id`: Auto-generated CUID
- `createdAt`: Auto-set to current timestamp
- `updatedAt`: Auto-set to current timestamp

## Next Steps

After registration, users should:
1. Sign in using the credentials provider at `/api/auth/signin`
2. Complete onboarding flow (if implemented)
3. Access the dashboard

## Related Endpoints

- `POST /api/auth/signin` - User login (NextAuth)
- `POST /api/auth/signout` - User logout (NextAuth)
- `GET /api/auth/session` - Get current session (NextAuth)
