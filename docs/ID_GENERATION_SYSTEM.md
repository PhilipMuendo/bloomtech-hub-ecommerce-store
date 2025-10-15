# ID Generation System Documentation

## Overview

This document outlines the ID generation system used across the BloomTech Hub e-commerce platform. The system ensures consistent, secure, and reliable ID generation for all database entities.

## ID Types

### 1. Database Primary Keys
- **Type**: Auto-incrementing integers
- **Range**: 1 to Number.MAX_SAFE_INTEGER (2^53 - 1)
- **Database**: MySQL with Sequelize ORM
- **Usage**: All database entities (Users, Products, Orders, Reviews, etc.)

### 2. Tracking Numbers
- **Format**: `BT-YYYYMMDD-XXXXXX`
- **Example**: `BT-20250115-123456`
- **Usage**: Order tracking and identification
- **Generation**: Automatic via `generateTrackingNumber()` utility

### 3. Transaction IDs
- **Format**: `TX-YYYYMMDD-HHMMSS-XXXXXX`
- **Example**: `TX-20250115-143022-789012`
- **Usage**: Payment transaction identification
- **Generation**: Automatic via `generateTransactionId()` utility

### 4. Verification Tokens
- **Format**: Random alphanumeric strings (32-64 characters)
- **Usage**: Email verification, password reset
- **Generation**: Automatic via `generateVerificationToken()` utility

## ID Validation System

### Middleware Validation
All ID parameters are validated using the `validateId` middleware:

```javascript
// Example usage in routes
router.put('/:id/approve', requireAuth, requireAdmin, validateId, approveReview);
```

### Validation Rules
1. **Required**: ID parameter must be present
2. **Format**: Must be a valid positive integer
3. **Range**: Must be between 1 and Number.MAX_SAFE_INTEGER
4. **Type**: Must parse to a valid number

### Error Responses
```json
{
  "error": "Invalid ID format",
  "message": "ID must be a valid positive integer"
}
```

## Utility Functions

### Core Functions

#### `parseId(id)`
- **Purpose**: Validate and parse string ID to integer
- **Returns**: Parsed integer or null if invalid
- **Usage**: Controller ID validation

#### `parseIds(ids)`
- **Purpose**: Validate array of IDs
- **Returns**: Array of parsed integers or null if any invalid
- **Usage**: Bulk operations

#### `isValidId(id)`
- **Purpose**: Check if ID is valid
- **Returns**: Boolean
- **Usage**: Frontend validation

#### `idToString(id)`
- **Purpose**: Convert database ID to string
- **Returns**: String representation
- **Usage**: Frontend compatibility

#### `stringToId(id)`
- **Purpose**: Convert string ID to database ID
- **Returns**: Parsed integer or null
- **Usage**: Backend processing

### Generation Functions

#### `generateTrackingNumber()`
- **Format**: `BT-YYYYMMDD-XXXXXX`
- **Usage**: Order tracking
- **Uniqueness**: Date + random number ensures uniqueness

#### `generateTransactionId()`
- **Format**: `TX-YYYYMMDD-HHMMSS-XXXXXX`
- **Usage**: Payment transactions
- **Uniqueness**: Timestamp + random number ensures uniqueness

#### `generateVerificationToken(length = 32)`
- **Format**: Random alphanumeric string
- **Usage**: Email verification, password reset
- **Security**: Cryptographically secure random generation

## Database Schema

### Primary Key Configuration
All tables use auto-incrementing integer primary keys:

```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

### Foreign Key Relationships
All foreign keys reference the primary key of the parent table:

```sql
userId INT,
FOREIGN KEY (userId) REFERENCES Users(id)
```

## Frontend-Backend ID Handling

### Frontend (TypeScript/React)
- **ID Type**: String (for compatibility)
- **Display**: String representation of database IDs
- **API Calls**: Send IDs as strings, receive as strings

### Backend (Node.js/Sequelize)
- **ID Type**: Integer (database storage)
- **Processing**: Parse string IDs to integers
- **Validation**: Ensure IDs are valid integers

### Conversion Flow
1. **Frontend** → **API**: String ID
2. **Middleware**: Validate and parse to integer
3. **Controller**: Use parsed integer for database queries
4. **Response**: Convert back to string for frontend

## Error Handling

### Invalid ID Scenarios
1. **Missing ID**: 400 Bad Request
2. **Invalid Format**: 400 Bad Request
3. **Out of Range**: 400 Bad Request
4. **Not Found**: 404 Not Found

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Security Considerations

### ID Exposure
- **Risk**: Sequential IDs can be guessed
- **Mitigation**: Use tracking numbers for public-facing IDs
- **Implementation**: Orders use tracking numbers, not database IDs

### ID Validation
- **Risk**: SQL injection through invalid IDs
- **Mitigation**: Strict validation and parameterized queries
- **Implementation**: Middleware validation + Sequelize ORM

### Token Security
- **Risk**: Weak token generation
- **Mitigation**: Cryptographically secure random generation
- **Implementation**: `generateVerificationToken()` with proper entropy

## Testing

### Test Coverage
- **Unit Tests**: ID validation functions
- **Integration Tests**: Database ID generation
- **Edge Cases**: Invalid formats, large numbers, special characters

### Test Script
Run comprehensive ID tests:
```bash
node backend/scripts/test-id-generation.js
```

## Migration Considerations

### Data Migration
When migrating data between systems:
1. **Preserve IDs**: Maintain existing ID relationships
2. **Validate**: Ensure all IDs are valid integers
3. **Test**: Verify foreign key relationships

### Schema Changes
When modifying ID-related schemas:
1. **Backup**: Always backup before changes
2. **Test**: Test in development environment
3. **Rollback**: Have rollback plan ready

## Best Practices

### Do's
- ✅ Always validate IDs in middleware
- ✅ Use utility functions for ID operations
- ✅ Handle ID conversion consistently
- ✅ Test ID validation thoroughly
- ✅ Use tracking numbers for public-facing entities

### Don'ts
- ❌ Don't trust frontend ID values
- ❌ Don't skip ID validation
- ❌ Don't expose database IDs directly
- ❌ Don't use sequential IDs for public entities
- ❌ Don't ignore ID type mismatches

## Troubleshooting

### Common Issues

#### ID Type Mismatch
**Problem**: Frontend sends string, backend expects integer
**Solution**: Use `parseId()` utility function

#### Invalid ID Format
**Problem**: Non-numeric or negative IDs
**Solution**: Implement proper validation middleware

#### ID Overflow
**Problem**: Very large numbers causing issues
**Solution**: Check against Number.MAX_SAFE_INTEGER

#### Missing ID
**Problem**: Required ID parameter not provided
**Solution**: Add validation middleware to routes

### Debug Commands
```bash
# Test ID generation system
node backend/scripts/test-id-generation.js

# Check database ID consistency
node backend/scripts/check-schema.js

# Validate all IDs in database
node backend/scripts/validate-data.js
```

## Future Enhancements

### Planned Improvements
1. **UUID Support**: Add UUID generation for enhanced security
2. **ID Encryption**: Encrypt sensitive IDs
3. **Rate Limiting**: Prevent ID enumeration attacks
4. **Audit Logging**: Track ID-related operations

### Monitoring
1. **ID Usage**: Monitor ID generation patterns
2. **Error Rates**: Track validation failures
3. **Performance**: Monitor ID parsing performance
4. **Security**: Monitor for ID-based attacks

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintainer**: Development Team 