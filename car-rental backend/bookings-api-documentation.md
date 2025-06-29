# Booking & Reservation API Documentation

## Overview
The Booking & Reservation module provides endpoints for managing car rental bookings. All endpoints require authentication via JWT token.

## Base URL
```
http://localhost:3000/bookings
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Booking
**POST** `/bookings`

Creates a new booking for a vehicle.

**Request Body:**
```json
{
  "vehicleId": "string (required)",
  "startDate": "ISO date string (required)",
  "endDate": "ISO date string (required)",
  "pickupLocation": "string (required)",
  "returnLocation": "string (required)",
  "notes": "string (optional)",
  "couponCode": "string (optional)"
}
```

**Response:**
```json
{
  "id": "booking-uuid",
  "userId": "user-uuid",
  "vehicleId": "vehicle-uuid",
  "startDate": "2025-07-01T10:00:00.000Z",
  "endDate": "2025-07-03T18:00:00.000Z",
  "totalAmount": 150.00,
  "status": "PENDING",
  "pickupLocation": "New York Airport",
  "returnLocation": "New York Downtown",
  "notes": "Need GPS and child seat",
  "createdAt": "2025-06-29T10:00:00.000Z",
  "updatedAt": "2025-06-29T10:00:00.000Z",
  "vehicle": {
    "id": "vehicle-uuid",
    "model": "Toyota Corolla",
    "year": 2022,
    "category": "Sedan",
    "dailyRate": 50.00,
    "images": ["url1", "url2"]
  },
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Get All Bookings
**GET** `/bookings`

Retrieves all bookings (admin/agent access).

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `vehicleId` (optional): Filter by vehicle ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `status` (optional): Filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `pickupLocation` (optional): Filter by pickup location
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
[
  {
    "id": "booking-uuid",
    "userId": "user-uuid",
    "vehicleId": "vehicle-uuid",
    "startDate": "2025-07-01T10:00:00.000Z",
    "endDate": "2025-07-03T18:00:00.000Z",
    "totalAmount": 150.00,
    "status": "PENDING",
    "pickupLocation": "New York Airport",
    "returnLocation": "New York Downtown",
    "notes": "Need GPS and child seat",
    "createdAt": "2025-06-29T10:00:00.000Z",
    "updatedAt": "2025-06-29T10:00:00.000Z",
    "vehicle": {
      "id": "vehicle-uuid",
      "model": "Toyota Corolla",
      "year": 2022,
      "category": "Sedan",
      "dailyRate": 50.00,
      "images": ["url1", "url2"]
    },
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### 3. Get My Bookings
**GET** `/bookings/me`

Retrieves bookings for the authenticated user.

**Query Parameters:** Same as Get All Bookings

**Response:** Same as Get All Bookings

### 4. Get Booking by ID
**GET** `/bookings/:id`

Retrieves a specific booking by ID.

**Parameters:**
- `id` (path): Booking UUID

**Response:** Same as Create Booking response

### 5. Update Booking
**PATCH** `/bookings/:id`

Updates a booking (only owner can update).

**Parameters:**
- `id` (path): Booking UUID

**Request Body:**
```json
{
  "startDate": "ISO date string (optional)",
  "endDate": "ISO date string (optional)",
  "pickupLocation": "string (optional)",
  "returnLocation": "string (optional)",
  "notes": "string (optional)",
  "status": "PENDING|CONFIRMED|CANCELLED|COMPLETED (optional, admin only)"
}
```

**Response:** Same as Create Booking response

### 6. Cancel Booking
**DELETE** `/bookings/:id`

Cancels a booking (only owner can cancel).

**Parameters:**
- `id` (path): Booking UUID

**Response:**
```json
{
  "id": "booking-uuid",
  "status": "CANCELLED",
  "updatedAt": "2025-06-29T10:00:00.000Z"
}
```

## Booking Status Flow

1. **PENDING** - Initial status when booking is created
2. **CONFIRMED** - Admin/Agent confirms the booking
3. **COMPLETED** - Booking period has ended
4. **CANCELLED** - Booking was cancelled by user or admin

## Error Responses

### 400 Bad Request
```json
{
  "message": "Vehicle not available",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Authorization header missing",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Access denied",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Booking not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## Business Rules

1. **Vehicle Availability**: Cannot book unavailable vehicles
2. **Date Overlap**: Cannot book overlapping dates for the same vehicle
3. **Booking Modification**: Cannot modify completed or cancelled bookings
4. **Access Control**: Users can only access their own bookings (except admins)
5. **Status Updates**: Only admins can change booking status to CONFIRMED

## Testing Examples

### Create a Booking
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "vehicleId": "vehicle-uuid",
    "startDate": "2025-07-01T10:00:00.000Z",
    "endDate": "2025-07-03T18:00:00.000Z",
    "pickupLocation": "New York Airport",
    "returnLocation": "New York Downtown",
    "notes": "Need GPS and child seat"
  }'
```

### Get My Bookings
```bash
curl -X GET http://localhost:3000/bookings/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Booking
```bash
curl -X PATCH http://localhost:3000/bookings/booking-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickupLocation": "Updated Location",
    "notes": "Updated notes"
  }'
```

### Cancel Booking
```bash
curl -X DELETE http://localhost:3000/bookings/booking-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
``` 