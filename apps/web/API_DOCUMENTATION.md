# Washify API Documentation

## Overview

This document describes the RESTful API endpoints for the Washify car wash booking platform. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL
```
http://localhost:3000/api
```

## Authentication
⚠️ **Note**: Authentication is not yet implemented in these routes. In production, you would add JWT token verification middleware.

---

## 📅 Bookings API

### GET /api/bookings
Fetch bookings with optional filtering and pagination.

**Query Parameters:**
- `userId` (string, optional): Filter by user ID
- `businessId` (string, optional): Filter by business ID  
- `status` (string, optional): Filter by status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
- `limit` (number, optional, default: 10): Number of results per page
- `offset` (number, optional, default: 0): Pagination offset

**Example Request:**
```bash
GET /api/bookings?userId=123&status=PENDING&limit=5
```

**Example Response:**
```json
{
  "bookings": [
    {
      "id": "booking-uuid",
      "userId": "user-uuid",
      "businessId": "business-uuid",
      "serviceId": "service-uuid",
      "scheduledAt": "2024-01-15T10:00:00Z",
      "status": "PENDING",
      "notes": "Please wash exterior only",
      "photos": ["https://example.com/photo1.jpg"],
      "createdAt": "2024-01-10T10:00:00Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "business": {
        "id": "business-uuid",
        "name": "Sparkle Car Wash",
        "address": "123 Main St",
        "lat": 40.7128,
        "lng": -74.0060
      },
      "service": {
        "id": "service-uuid",
        "name": "Premium Wash",
        "description": "Full exterior and interior cleaning",
        "price": 29.99,
        "duration": 60,
        "tier": "PREMIUM"
      },
      "payment": null,
      "review": null
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 5,
    "offset": 0,
    "hasMore": true
  }
}
```

### POST /api/bookings
Create a new booking.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "businessId": "business-uuid", 
  "serviceId": "service-uuid",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "notes": "Please wash exterior only",
  "photos": ["https://example.com/photo1.jpg"]
}
```

**Response:** Returns the created booking with status `201`.

---

## 🔧 Services API

### GET /api/services
Fetch available services with filtering and pagination.

**Query Parameters:**
- `businessId` (string, optional): Filter by business ID
- `tier` (string, optional): Filter by tier (`BASIC`, `PREMIUM`, `LUXURY`)
- `minPrice` (number, optional, default: 0): Minimum price filter
- `maxPrice` (number, optional, default: 999999): Maximum price filter
- `limit` (number, optional, default: 20): Number of results per page
- `offset` (number, optional, default: 0): Pagination offset

**Example Request:**
```bash
GET /api/services?businessId=123&tier=PREMIUM&minPrice=20&maxPrice=50
```

**Example Response:**
```json
{
  "services": [
    {
      "id": "service-uuid",
      "businessId": "business-uuid",
      "name": "Premium Wash",
      "description": "Full exterior and interior cleaning with wax",
      "price": 29.99,
      "duration": 60,
      "tier": "PREMIUM",
      "business": {
        "id": "business-uuid",
        "name": "Sparkle Car Wash",
        "address": "123 Main St",
        "lat": 40.7128,
        "lng": -74.0060
      },
      "_count": {
        "bookings": 45
      }
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST /api/services
Create a new service (for business owners/operators).

**Request Body:**
```json
{
  "businessId": "business-uuid",
  "name": "Deluxe Wash",
  "description": "Premium wash with interior detailing and ceramic coating",
  "price": 49.99,
  "duration": 90,
  "tier": "LUXURY"
}
```

**Response:** Returns the created service with status `201`.

---

## 🏢 Businesses API

### GET /api/businesses
Discover car wash businesses with geolocation support.

**Query Parameters:**
- `lat` (number, optional): Latitude for geolocation search
- `lng` (number, optional): Longitude for geolocation search
- `radius` (number, optional, default: 10): Search radius in kilometers
- `search` (string, optional): Text search in name/address
- `limit` (number, optional, default: 20): Number of results per page
- `offset` (number, optional, default: 0): Pagination offset

**Example Request:**
```bash
GET /api/businesses?lat=40.7128&lng=-74.0060&radius=5&search=sparkle
```

**Example Response:**
```json
{
  "businesses": [
    {
      "id": "business-uuid",
      "name": "Sparkle Car Wash",
      "address": "123 Main St, New York, NY",
      "lat": 40.7128,
      "lng": -74.0060,
      "ownerId": "owner-uuid",
      "createdAt": "2024-01-01T10:00:00Z",
      "distance": 2.3,
      "owner": {
        "id": "owner-uuid",
        "name": "Jane Smith",
        "email": "jane@sparklewash.com"
      },
      "services": [
        {
          "id": "service-uuid",
          "name": "Basic Wash",
          "description": "Exterior wash only",
          "price": 15.99,
          "duration": 30,
          "tier": "BASIC"
        }
      ],
      "_count": {
        "bookings": 156
      }
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST /api/businesses
Register a new car wash business.

**Request Body:**
```json
{
  "name": "Super Clean Car Wash",
  "address": "456 Oak Ave, Brooklyn, NY",
  "lat": 40.6782,
  "lng": -73.9442,
  "ownerId": "owner-uuid"
}
```

**Response:** Returns the created business with status `201`.

---

## 💳 Payments API

### GET /api/payments
Get payment information (for operators/admins).

**Query Parameters:**
- `bookingId` (string, optional): Filter by booking ID
- `businessId` (string, optional): Filter by business ID
- `status` (string, optional): Filter by status (`PENDING`, `PAID`, `FAILED`)
- `limit` (number, optional, default: 20): Number of results per page
- `offset` (number, optional, default: 0): Pagination offset

### POST /api/payments
Create a payment record and link to booking.

**Request Body:**
```json
{
  "bookingId": "booking-uuid",
  "amount": 29.99,
  "currency": "USD",
  "provider": "stripe",
  "providerId": "pi_1234567890"
}
```

**Response:** Returns the created payment with status `201`.

---

## ⭐ Reviews API

### GET /api/reviews
Fetch customer reviews with filtering.

**Query Parameters:**
- `businessId` (string, optional): Filter by business ID
- `userId` (string, optional): Filter by user ID
- `minRating` (number, optional, default: 1): Minimum rating filter (1-5)
- `maxRating` (number, optional, default: 5): Maximum rating filter (1-5)
- `limit` (number, optional, default: 20): Number of results per page
- `offset` (number, optional, default: 0): Pagination offset

**Example Response:**
```json
{
  "reviews": [
    {
      "id": "review-uuid",
      "userId": "user-uuid",
      "bookingId": "booking-uuid",
      "rating": 5,
      "comment": "Excellent service! My car looks brand new.",
      "createdAt": "2024-01-16T15:30:00Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe"
      },
      "booking": {
        "service": {
          "id": "service-uuid",
          "name": "Premium Wash",
          "tier": "PREMIUM"
        },
        "business": {
          "id": "business-uuid",
          "name": "Sparkle Car Wash",
          "address": "123 Main St"
        }
      }
    }
  ],
  "averageRating": {
    "average": 4.2,
    "count": 28
  },
  "pagination": {
    "total": 28,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### POST /api/reviews
Create a new customer review.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "bookingId": "booking-uuid",
  "rating": 5,
  "comment": "Amazing service! Highly recommended."
}
```

**Response:** Returns the created review with status `201`.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "details": "Additional error details (for validation errors)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `403` - Forbidden (authorization errors)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `500` - Internal Server Error

---

## Testing with cURL

### Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "businessId": "business-uuid",
    "serviceId": "service-uuid", 
    "scheduledAt": "2024-01-15T10:00:00Z",
    "notes": "Please wash exterior only"
  }'
```

### Get Nearby Businesses
```bash
curl "http://localhost:3000/api/businesses?lat=40.7128&lng=-74.0060&radius=5"
```

### Get Business Reviews
```bash
curl "http://localhost:3000/api/reviews?businessId=business-uuid&limit=10"
``` 