# Subcategory Audit Monitoring Guide

## Overview

All subcategory operations are now automatically logged to the audit system, allowing you to monitor and track all subcategory-related activities in your e-commerce platform.

## What Gets Logged

### 1. Subcategory Creation
- **Action**: `create`
- **Details**: Includes subcategory name, category, and display name
- **New Values**: Complete subcategory data
- **User**: Who created the subcategory
- **Timestamp**: When it was created

### 2. Subcategory Updates
- **Action**: `update`
- **Details**: What was changed
- **Previous Values**: Original subcategory data
- **New Values**: Updated subcategory data
- **User**: Who made the changes
- **Timestamp**: When it was updated

### 3. Subcategory Deletion
- **Action**: `delete`
- **Details**: Subcategory name and category
- **Previous Values**: Complete subcategory data before deletion
- **User**: Who deleted the subcategory
- **Timestamp**: When it was deleted

### 4. Product Operations with Subcategories
- **Product Creation**: Logs when products are created with subcategories
- **Product Updates**: Logs when product subcategories are changed
- **Product Deletion**: Logs when products with subcategories are deleted

## How to Access Audit Logs

### 1. Through Admin Dashboard
1. Navigate to **Admin Panel → Audit Logs**
2. Filter by **Entity Type**: `subcategory`
3. View all subcategory-related activities

### 2. Filter Options Available
- **Entity Type**: `subcategory`
- **Action**: `create`, `update`, `delete`
- **User**: Filter by who performed the action
- **Date Range**: Filter by when actions occurred
- **Status**: `success` or `failed`

### 3. Audit Log Details Include
- **User Information**: Name, role, and ID
- **Action Details**: What was done
- **Entity Information**: Subcategory ID and details
- **Previous/New Values**: What changed
- **IP Address**: Where the action was performed from
- **User Agent**: Browser/device information
- **Timestamp**: Exact time of the action

## Example Audit Log Entries

### Subcategory Creation
```json
{
  "id": 123,
  "performedBy": 1,
  "performedByName": "Admin User",
  "performedByRole": "superadmin",
  "action": "create",
  "entityType": "subcategory",
  "entityId": 45,
  "details": "Created subcategory \"Wireless Cameras\" under category \"security\"",
  "newValues": {
    "name": "wireless-cameras",
    "displayName": "Wireless Cameras",
    "category": "security",
    "isActive": true
  },
  "status": "success",
  "createdAt": "2025-08-05T10:30:00.000Z"
}
```

### Subcategory Update
```json
{
  "id": 124,
  "performedBy": 1,
  "performedByName": "Admin User",
  "performedByRole": "superadmin",
  "action": "update",
  "entityType": "subcategory",
  "entityId": 45,
  "details": "Updated subcategory \"Wireless Cameras\"",
  "previousValues": {
    "displayName": "Wireless Cameras",
    "isActive": true
  },
  "newValues": {
    "displayName": "Advanced Wireless Cameras",
    "isActive": false
  },
  "status": "success",
  "createdAt": "2025-08-05T11:15:00.000Z"
}
```

### Product with Subcategory
```json
{
  "id": 125,
  "performedBy": 1,
  "performedByName": "Admin User",
  "performedByRole": "superadmin",
  "action": "product_created",
  "entityType": "product",
  "entityId": 10,
  "details": "Product \"Security Camera Pro\" created with subcategory \"wireless-cameras\"",
  "newValues": {
    "name": "Security Camera Pro",
    "category": "security",
    "subcategory": "wireless-cameras",
    "price": 3599.99
  },
  "status": "success",
  "createdAt": "2025-08-05T12:00:00.000Z"
}
```

## Monitoring Best Practices

### 1. Regular Review
- Check audit logs weekly for unusual activity
- Monitor for failed operations
- Track who is making subcategory changes

### 2. Alerts for Critical Actions
- Monitor subcategory deletions (potential data loss)
- Track subcategory updates that affect product organization
- Watch for bulk operations

### 3. Compliance and Security
- All actions are logged with user identification
- IP addresses are recorded for security tracking
- Complete audit trail for compliance requirements

### 4. Performance Monitoring
- Track how often subcategories are created/updated
- Monitor subcategory usage in products
- Identify most active users

## Exporting Audit Data

### CSV Export
1. Go to **Admin Panel → Audit Logs**
2. Apply filters (e.g., Entity Type: subcategory)
3. Click **Export to CSV**
4. Download contains all audit data for analysis

### API Access
Audit logs can also be accessed via API endpoints for integration with external monitoring tools.

## Troubleshooting

### No Audit Logs Appearing
1. Check if user is authenticated
2. Verify audit service is running
3. Check database connectivity

### Missing Subcategory Information
1. Ensure subcategory field is required (already implemented)
2. Verify subcategory is selected when creating products
3. Check that subcategory exists in database

## Security Considerations

- All audit logs are immutable (cannot be modified)
- Logs include IP addresses for security tracking
- User agent information helps identify access patterns
- Failed operations are also logged for security monitoring

## Integration with Existing Systems

The audit system integrates with:
- **User Management**: Tracks who performed actions
- **Product Management**: Logs subcategory usage in products
- **Admin Dashboard**: Provides audit log viewing interface
- **Security Systems**: IP and user agent tracking

This comprehensive audit system ensures full visibility into all subcategory operations while maintaining security and compliance standards. 