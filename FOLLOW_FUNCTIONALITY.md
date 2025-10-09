# Follow Functionality Documentation

## Overview
This document describes the follow functionality that allows users to follow/unfollow places and events, creating a favorites system.

## Database Structure

### Migration: `20250115000000-create-user-follows.js`
Creates the `user_follows` table with the following structure:
- `id` (Primary Key)
- `user_id` (Foreign Key to users table)
- `followable_id` (ID of the place or event being followed)
- `followable_type` (ENUM: 'place' or 'event')
- `createdAt` and `updatedAt` timestamps
- Unique constraint on `(user_id, followable_id, followable_type)`
- Indexes for performance optimization

## Models

### UserFollow Model
Located at: `src/follows/models/user-follow.model.ts`

**Features:**
- Polymorphic associations with Place and Event models
- Proper indexing for performance
- Helper method `getFollowable()` to retrieve the followed item

**Associations:**
- BelongsTo User
- BelongsTo Place (polymorphic)
- BelongsTo Event (polymorphic)

### Updated Models

#### User Model
- Added `HasMany` association with UserFollow
- Import added for UserFollow model

#### Place Model
- Added `HasMany` association with UserFollow (polymorphic)
- Scope constraint for `followable_type: 'place'`

#### Event Model
- Added `HasMany` association with UserFollow (polymorphic)
- Scope constraint for `followable_type: 'event'`

## API Endpoints

### Base URL: `/follows`

#### 1. Follow an Item
```http
POST /follows
Authorization: Bearer <token>
Content-Type: application/json

{
  "followable_id": 123,
  "followable_type": "place" // or "event"
}
```

**Response:**
```json
{
  "message": "Successfully followed",
  "followed": true
}
```

#### 2. Unfollow an Item
```http
DELETE /follows
Authorization: Bearer <token>
Content-Type: application/json

{
  "followable_id": 123,
  "followable_type": "place" // or "event"
}
```

**Response:**
```json
{
  "message": "Successfully unfollowed",
  "followed": false
}
```

#### 3. Toggle Follow (Follow/Unfollow)
```http
POST /follows/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "followable_id": 123,
  "followable_type": "place" // or "event"
}
```

**Response:**
```json
{
  "message": "Successfully followed", // or "Successfully unfollowed"
  "followed": true // or false
}
```

#### 4. Get User's Follows (Paginated)
```http
GET /follows/my-follows?page=1&limit=10&type=place
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by type ('place' or 'event')

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "followed_at": "2025-01-15T10:30:00.000Z",
      "followable": {
        "id": 123,
        "slug": "example-place",
        "image": "https://domain.com/uploads/places/image.jpg",
        "logo": "https://domain.com/uploads/places/logo.jpg",
        "latitude": 40.1234,
        "longitude": 44.5678,
        "address": "123 Main St",
        "created_at": "2025-01-10T08:00:00.000Z",
        "type": "place"
      },
      "name": "Example Place",
      "description": "A great place to visit"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### 5. Check if User is Following
```http
GET /follows/check/123/place
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isFollowing": true
}
```

#### 6. Get Follow Statistics
```http
GET /follows/stats/123/place
```

**Response:**
```json
{
  "followers_count": 42
}
```

## Service Methods

### FollowsService
Located at: `src/follows/follows.service.ts`

**Key Methods:**
1. `follow(userId, followDto)` - Follow an item
2. `unfollow(userId, followDto)` - Unfollow an item
3. `toggleFollow(userId, followDto)` - Toggle follow status
4. `getUserFollows(userId, query, lang)` - Get paginated follows with translations
5. `isFollowing(userId, followable_id, followable_type)` - Check follow status
6. `getFollowStats(followable_id, followable_type)` - Get follower count

## DTOs

### FollowDto
```typescript
{
  followable_id: number;
  followable_type: 'place' | 'event';
}
```

### GetFollowsDto
```typescript
{
  page?: number;
  limit?: number;
  type?: 'place' | 'event';
}
```

## Features

### 1. Polymorphic Relationships
- Single table handles follows for both places and events
- Efficient querying with proper indexing

### 2. Internationalization Support
- Follow lists include translated names and descriptions
- Respects user's language preference

### 3. Pagination
- Efficient pagination for large follow lists
- Configurable page size

### 4. Performance Optimizations
- Database indexes on frequently queried columns
- Unique constraints prevent duplicate follows
- Optimized queries with proper includes

### 5. Security
- JWT authentication required
- User can only manage their own follows
- Input validation with DTOs

## Usage Examples

### Frontend Integration

#### Follow a Place
```javascript
const followPlace = async (placeId) => {
  const response = await fetch('/api/follows', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      followable_id: placeId,
      followable_type: 'place'
    })
  });
  return response.json();
};
```

#### Get User's Favorite Places
```javascript
const getFavoritePlaces = async (page = 1) => {
  const response = await fetch(`/api/follows/my-follows?type=place&page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### Toggle Follow Button
```javascript
const toggleFollow = async (itemId, itemType) => {
  const response = await fetch('/api/follows/toggle', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      followable_id: itemId,
      followable_type: itemType
    })
  });
  return response.json();
};
```

## Migration Instructions

1. Run the migration to create the `user_follows` table:
   ```bash
   npx sequelize-cli db:migrate
   ```

2. The FollowModule is already integrated into the AppModule, so no additional setup is required.

## Error Handling

The API handles various error scenarios:
- **404 Not Found**: When trying to follow a non-existent item
- **400 Bad Request**: When trying to follow an already followed item
- **401 Unauthorized**: When user is not authenticated
- **403 Forbidden**: When user doesn't have proper permissions

## Future Enhancements

Potential improvements for the follow functionality:
1. **Follow Notifications**: Notify users when followed items are updated
2. **Follow Recommendations**: Suggest items to follow based on user preferences
3. **Follow Analytics**: Track follow patterns and engagement
4. **Bulk Operations**: Allow following multiple items at once
5. **Follow Categories**: Organize follows into custom categories
