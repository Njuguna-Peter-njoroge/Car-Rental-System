# Vehicles API Testing Guide

## Overview
The vehicles API provides complete CRUD operations for managing vehicles in the car rental system. All endpoints require authentication and appropriate permissions.

## Authentication
All endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### 1. Create Vehicle (Admin/Agent Only)
**POST** `/vehicles`

**Required Permissions:** `CREATE_VEHICLE`
**Required Roles:** `ADMIN`, `AGENT`

**Request Body:**
```json
{
  "model": "Toyota Camry",
  "year": 2023,
  "licensePlate": "ABC123",
  "vin": "1HGBH41JXMN109186",
  "category": "Sedan",
  "transmission": "Automatic",
  "fuelType": "Gasoline",
  "seats": 5,
  "dailyRate": 45.00,
  "hourlyRate": 8.00,
  "isAvailable": true,
  "location": "Downtown Office",
  "features": ["AC", "GPS", "Bluetooth", "Backup Camera"],
  "images": ["https://example.com/camry1.jpg"],
  "description": "Comfortable sedan perfect for city driving",
  "mileage": 15000,
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "id": "vehicle-uuid",
    "model": "Toyota Camry",
    "year": 2023,
    "licensePlate": "ABC123",
    "vin": "1HGBH41JXMN109186",
    "category": "Sedan",
    "transmission": "Automatic",
    "fuelType": "Gasoline",
    "seats": 5,
    "dailyRate": 45.00,
    "hourlyRate": 8.00,
    "isAvailable": true,
    "location": "Downtown Office",
    "features": ["AC", "GPS", "Bluetooth", "Backup Camera"],
    "images": ["https://example.com/camry1.jpg"],
    "description": "Comfortable sedan perfect for city driving",
    "mileage": 15000,
    "status": "ACTIVE",
    "createdAt": "2025-06-29T08:00:00.000Z",
    "updatedAt": "2025-06-29T08:00:00.000Z"
  }
}
```

### 2. Get All Vehicles
**GET** `/vehicles`

**Required Permissions:** `LIST_VEHICLES`

**Query Parameters:**
- `category` (optional): Filter by vehicle category
- `location` (optional): Filter by location
- `available` (optional): Filter by availability (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /vehicles?category=Sedan&available=true&page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": {
    "vehicles": [
      {
        "id": "vehicle-uuid",
        "model": "Toyota Camry",
        "year": 2023,
        "licensePlate": "ABC123",
        "vin": "1HGBH41JXMN109186",
        "category": "Sedan",
        "transmission": "Automatic",
        "fuelType": "Gasoline",
        "seats": 5,
        "dailyRate": 45.00,
        "hourlyRate": 8.00,
        "isAvailable": true,
        "location": "Downtown Office",
        "features": ["AC", "GPS", "Bluetooth", "Backup Camera"],
        "images": ["https://example.com/camry1.jpg"],
        "description": "Comfortable sedan perfect for city driving",
        "mileage": 15000,
        "status": "ACTIVE",
        "createdAt": "2025-06-29T08:00:00.000Z",
        "updatedAt": "2025-06-29T08:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Search Vehicles
**GET** `/vehicles/search`

**Required Permissions:** `LIST_VEHICLES`

**Query Parameters:**
- `query` (required): Search term
- `startDate` (optional): Start date for availability check
- `endDate` (optional): End date for availability check
- `category` (optional): Filter by category
- `location` (optional): Filter by location

**Example:**
```
GET /vehicles/search?query=Toyota&startDate=2025-07-01&endDate=2025-07-05&category=Sedan
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle search completed",
  "data": [
    {
      "id": "vehicle-uuid",
      "model": "Toyota Camry",
      "year": 2023,
      "licensePlate": "ABC123",
      "vin": "1HGBH41JXMN109186",
      "category": "Sedan",
      "transmission": "Automatic",
      "fuelType": "Gasoline",
      "seats": 5,
      "dailyRate": 45.00,
      "hourlyRate": 8.00,
      "isAvailable": true,
      "location": "Downtown Office",
      "features": ["AC", "GPS", "Bluetooth", "Backup Camera"],
      "images": ["https://example.com/camry1.jpg"],
      "description": "Comfortable sedan perfect for city driving",
      "mileage": 15000,
      "status": "ACTIVE",
      "createdAt": "2025-06-29T08:00:00.000Z",
      "updatedAt": "2025-06-29T08:00:00.000Z"
    }
  ]
}
```

### 4. Get Vehicle by ID
**GET** `/vehicles/{id}`

**Required Permissions:** `READ_VEHICLE`

**Example:**
```
GET /vehicles/vehicle-uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle retrieved successfully",
  "data": {
    "id": "vehicle-uuid",
    "model": "Toyota Camry",
    "year": 2023,
    "licensePlate": "ABC123",
    "vin": "1HGBH41JXMN109186",
    "category": "Sedan",
    "transmission": "Automatic",
    "fuelType": "Gasoline",
    "seats": 5,
    "dailyRate": 45.00,
    "hourlyRate": 8.00,
    "isAvailable": true,
    "location": "Downtown Office",
    "features": ["AC", "GPS", "Bluetooth", "Backup Camera"],
    "images": ["https://example.com/camry1.jpg"],
    "description": "Comfortable sedan perfect for city driving",
    "mileage": 15000,
    "status": "ACTIVE",
    "createdAt": "2025-06-29T08:00:00.000Z",
    "updatedAt": "2025-06-29T08:00:00.000Z"
  }
}
```

### 5. Update Vehicle (Admin/Agent Only)
**PATCH** `/vehicles/{id}`

**Required Permissions:** `UPDATE_VEHICLE`
**Required Roles:** `ADMIN`, `AGENT`

**Request Body (all fields optional):**
```json
{
  "dailyRate": 50.00,
  "isAvailable": false,
  "status": "MAINTENANCE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "id": "vehicle-uuid",
    "model": "Toyota Camry",
    "year": 2023,
    "licensePlate": "ABC123",
    "vin": "1HGBH41JXMN109186",
    "category": "Sedan",
    "transmission": "Automatic",
    "fuelType": "Gasoline",
    "seats": 5,
    "dailyRate": 50.00,
    "hourlyRate": 8.00,
    "isAvailable": false,
    "location": "Downtown Office",
    "features": ["AC", "GPS", "Bluetooth", "Backup Camera"],
    "images": ["https://example.com/camry1.jpg"],
    "description": "Comfortable sedan perfect for city driving",
    "mileage": 15000,
    "status": "MAINTENANCE",
    "createdAt": "2025-06-29T08:00:00.000Z",
    "updatedAt": "2025-06-29T08:30:00.000Z"
  }
}
```

### 6. Update Vehicle Availability (Admin/Agent Only)
**PATCH** `/vehicles/{id}/availability`

**Required Permissions:** `MANAGE_VEHICLE_AVAILABILITY`
**Required Roles:** `ADMIN`, `AGENT`

**Request Body:**
```json
{
  "isAvailable": false,
  "reason": "Scheduled maintenance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle availability updated to unavailable",
  "data": {
    "id": "vehicle-uuid",
    "model": "Toyota Camry",
    "year": 2023,
    "licensePlate": "ABC123",
    "vin": "1HGBH41JXMN109186",
    "category": "Sedan",
    "transmission": "Automatic",
    "fuelType": "Gasoline",
    "seats": 5,
    "dailyRate": 50.00,
    "hourlyRate": 8.00,
    "isAvailable": false,
    "location": "Downtown Office",
    "features": ["AC", "GPS", "Bluetooth", "Backup Camera"],
    "images": ["https://example.com/camry1.jpg"],
    "description": "Comfortable sedan perfect for city driving",
    "mileage": 15000,
    "status": "Scheduled maintenance",
    "createdAt": "2025-06-29T08:00:00.000Z",
    "updatedAt": "2025-06-29T08:35:00.000Z"
  }
}
```

### 7. Delete Vehicle (Admin Only)
**DELETE** `/vehicles/{id}`

**Required Permissions:** `DELETE_VEHICLE`
**Required Roles:** `ADMIN`

**Example:**
```
DELETE /vehicles/vehicle-uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully",
  "data": {
    "message": "Vehicle has been permanently removed"
  }
}
```

### 8. Get Vehicle Reviews
**GET** `/vehicles/{id}/reviews`

**Required Permissions:** `READ_REVIEW`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /vehicles/vehicle-uuid/reviews?page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "review-uuid",
        "userId": "user-uuid",
        "vehicleId": "vehicle-uuid",
        "bookingId": null,
        "rating": 5,
        "comment": "Excellent vehicle, very comfortable and fuel efficient!",
        "isApproved": true,
        "createdAt": "2025-06-29T08:00:00.000Z",
        "updatedAt": "2025-06-29T08:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "profileImage": "https://example.com/profile.jpg"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 9. Create Vehicle Review
**POST** `/vehicles/{id}/reviews`

**Required Permissions:** `CREATE_REVIEW`

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great vehicle, highly recommended!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully and pending approval",
  "data": {
    "id": "review-uuid",
    "userId": "user-uuid",
    "vehicleId": "vehicle-uuid",
    "bookingId": null,
    "rating": 5,
    "comment": "Great vehicle, highly recommended!",
    "isApproved": false,
    "createdAt": "2025-06-29T08:00:00.000Z",
    "updatedAt": "2025-06-29T08:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "profileImage": "https://example.com/profile.jpg"
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Vehicle ID is required",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Vehicle not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Vehicle with this license plate already exists",
  "error": "Conflict"
}
```

## Testing with Sample Data

The database has been seeded with 5 sample vehicles:

1. **Toyota Camry** (ABC123) - Sedan, $45/day
2. **Honda CR-V** (XYZ789) - SUV, $65/day  
3. **Tesla Model 3** (EV001) - Electric, $85/day
4. **Ford F-150** (TRK456) - Truck, $75/day
5. **Toyota Prius** (HYB789) - Hybrid, $55/day

## Testing Steps

1. **Register/Login** to get a JWT token
2. **Test GET /vehicles** to see all vehicles
3. **Test GET /vehicles/search** with different queries
4. **Test GET /vehicles/{id}** with a specific vehicle ID
5. **Test PATCH /vehicles/{id}** to update vehicle details (Admin/Agent only)
6. **Test PATCH /vehicles/{id}/availability** to change availability (Admin/Agent only)
7. **Test POST /vehicles/{id}/reviews** to add a review
8. **Test GET /vehicles/{id}/reviews** to see reviews
9. **Test DELETE /vehicles/{id}** to delete a vehicle (Admin only)

## Notes

- All vehicles are created with unique license plates and VINs
- Reviews require admin approval before being visible
- Vehicle deletion is prevented if there are active bookings
- Search functionality includes availability checking for date ranges
- Pagination is available for listing and review endpoints 