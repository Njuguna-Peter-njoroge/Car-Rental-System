# Authentication & Authorization System

This document describes the complete authentication and authorization system implemented for the Car Rental application.

## Overview

The authentication system provides:
- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality
- Role-based access control (RBAC)
- Permission-based authorization
- Refresh token mechanism
- Email notifications

## Features

### 1. User Registration
- Email and password validation
- Email verification required before login
- Role assignment (default: CUSTOMER)
- Welcome email with verification link

### 2. User Login
- Email and password authentication
- JWT token generation
- Refresh token for session management
- Last login tracking

### 3. Password Management
- Forgot password functionality
- Secure password reset with tokens
- Password change for authenticated users
- Password strength validation

### 4. Email Verification
- Email verification on registration
- Resend verification email
- Token expiration (24 hours)

### 5. Role-Based Access Control
Three user roles with different permissions:

#### Admin Role
- Full system access
- User management
- Vehicle management
- Booking management
- Payment management
- System settings

#### Agent Role
- Limited user management (read only)
- Vehicle management
- Booking management
- Payment processing
- Review moderation

#### Customer Role
- Profile management
- Booking creation and management
- Payment processing
- Review creation
- Vehicle browsing

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "name": "John Doe",
      "status": "ACTIVE"
    }
  }
}
```

#### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
```

#### GET /auth/verify-email?token=verification_token
Verify email address.

#### POST /auth/resend-verification
Resend email verification.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### GET /auth/me
Get current user profile (requires authentication).

#### POST /auth/refresh-token
Refresh access token (requires authentication).

#### POST /auth/logout
Logout user (requires authentication).

### User Management Endpoints

#### GET /users
Get all users (requires LIST_USERS permission).

#### GET /users/:id
Get user by ID (requires READ_USER permission).

#### POST /users
Create new user (requires CREATE_USER permission, ADMIN role).

#### PATCH /users/:id
Update user (requires UPDATE_USER permission).

#### DELETE /users/:id
Delete user (requires DELETE_USER permission, ADMIN role).

#### POST /users/:id/change-password
Change user password (requires authentication, own profile only).

## Guards and Decorators

### Guards

#### JwtAuthGuard
Validates JWT tokens and attaches user to request.

#### PermissionsGuard
Checks if user has required permissions.

#### RolesGuard
Checks if user has required roles.

### Decorators

#### @RequirePermissions(...permissions)
Requires specific permissions.

#### @RequireRoles(...roles)
Requires specific roles.

#### @CurrentUser()
Extracts current user from request.

## Usage Examples

### Protecting Routes with Permissions

```typescript
@Controller('vehicles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VehiclesController {
  @Post()
  @RequirePermissions(Permission.CREATE_VEHICLE)
  @RequireRoles(Role.ADMIN, Role.AGENT)
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @RequirePermissions(Permission.LIST_VEHICLES)
  findAll() {
    return this.vehiclesService.findAll();
  }
}
```

### Getting Current User

```typescript
@Get('profile')
getProfile(@CurrentUser() user: any) {
  return this.usersService.findOne(user.id);
}
```

### Conditional Access

```typescript
@Patch(':id')
@RequirePermissions(Permission.UPDATE_USER)
update(
  @Param('id') id: string,
  @Body() updateUserDto: UpdateUserDto,
  @CurrentUser() currentUser: any,
) {
  // Users can only update their own profile unless they're admin
  if (currentUser.role !== Role.ADMIN && currentUser.id !== id) {
    throw new Error('You can only update your own profile');
  }
  return this.usersService.update(id, updateUserDto);
}
```

## Environment Variables

Required environment variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/car_rental

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@carrental.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication
3. **Token Expiration**: Configurable token expiration times
4. **Email Verification**: Required before account activation
5. **Password Reset**: Secure token-based password reset
6. **Role-Based Access**: Granular permission system
7. **Input Validation**: Comprehensive request validation
8. **SQL Injection Protection**: Using Prisma ORM
9. **XSS Protection**: Input sanitization and validation

## Database Schema

The authentication system uses the following database models:

- **User**: Core user information and authentication data
- **RefreshToken**: Refresh token management
- **Vehicle**: Vehicle information (for the car rental system)
- **Booking**: Booking records
- **Payment**: Payment transactions
- **Review**: User reviews
- **Location**: Rental locations
- **Coupon**: Discount coupons

## Email Templates

The system includes email templates for:
- Welcome email with verification
- Password reset
- Email verification
- Booking confirmation
- Booking cancellation

## Error Handling

The system provides comprehensive error handling:
- Invalid credentials
- Expired tokens
- Insufficient permissions
- Email verification required
- Account inactive
- Validation errors

## Testing

To test the authentication system:

1. Start the application
2. Register a new user
3. Check email for verification link
4. Verify email
5. Login with credentials
6. Test protected endpoints with JWT token

## Best Practices

1. Always use HTTPS in production
2. Regularly rotate JWT secrets
3. Implement rate limiting
4. Monitor failed login attempts
5. Use strong password policies
6. Implement account lockout after failed attempts
7. Log authentication events
8. Regular security audits 