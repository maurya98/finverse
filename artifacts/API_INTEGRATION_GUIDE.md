# Site Platform API Integration Guide

## Overview
This document describes the integration of Site Platform APIs into the admin_dashboard project.

## API Services Created

### 1. **API Base Service** (`services/api.ts`)
Generic API request handler that:
- Manages base URL configuration
- Handles API requests with proper headers
- Implements error handling
- Accepts RequestInit options for flexible API calls

**Base URL**: Configured via `VITE_API_BASE_URL` environment variable (default: `http://localhost:3001`)

### 2. **Services API** (`services/servicesApi.ts`)
Manages internal services with the following operations:
- **GET All**: `GET /api/admin/services`
- **GET By ID**: `GET /api/admin/services/:id`
- **CREATE**: `POST /api/admin/services`
- **CREATE Bulk**: `POST /api/admin/services/bulk`
- **UPDATE**: `PUT /api/admin/services/:id`
- **UPDATE Bulk**: `PUT /api/admin/services/bulk`
- **DELETE**: `DELETE /api/admin/services/:id`

**Data Model**:
```typescript
Service {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  isActive: boolean;
  createdAt: string;
}
```

### 3. **Applications API** (`services/applicationsApi.ts`)
Manages client applications with the following operations:
- **GET All**: `GET /api/admin/applications`
- **GET By ID**: `GET /api/admin/applications/:id`
- **CREATE**: `POST /api/admin/applications`
- **CREATE Bulk**: `POST /api/admin/applications/bulk`
- **UPDATE**: `PUT /api/admin/applications/:id`
- **UPDATE Bulk**: `PUT /api/admin/applications/bulk`
- **DELETE**: `DELETE /api/admin/applications/:id`
- **ROTATE KEY**: `POST /api/admin/applications/:id/rotate-key`

**Data Model**:
```typescript
Application {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  secret: string;
  createdAt: string;
}
```

### 4. **Routes API** (`services/routesApi.ts`)
Manages API routes for services with operations:
- **GET All**: `GET /api/admin/routes`
- **GET By ID**: `GET /api/admin/routes/:id`
- **CREATE**: `POST /api/admin/routes`
- **CREATE Bulk**: `POST /api/admin/routes/bulk`
- **UPDATE**: `PUT /api/admin/routes/:id`
- **UPDATE Bulk**: `PUT /api/admin/routes/bulk`
- **DELETE**: `DELETE /api/admin/routes/:id`
- **DELETE Bulk**: `DELETE /api/admin/routes/bulk`

**Data Model**:
```typescript
Route {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  method: string;
  actualPath: string;
  exposedPath: string;
  isActive: boolean;
  createdAt: string;
}
```

### 5. **Permissions API** (`services/permissionsApi.ts`)
Manages application permissions with operations:
- **GET All**: `GET /api/admin/permissions`
- **GET By ID**: `GET /api/admin/permissions/:id`
- **CREATE**: `POST /api/admin/permissions`
- **CREATE Bulk**: `POST /api/admin/permissions/bulk`
- **UPDATE**: `PUT /api/admin/permissions/:id`
- **UPDATE Bulk**: `PUT /api/admin/permissions/bulk`
- **DELETE**: `DELETE /api/admin/permissions/:id`
- **DELETE Bulk**: `DELETE /api/admin/permissions/bulk`

**Data Model**:
```typescript
Permission {
  id: string;
  clientId: string;
  routeId: string;
  description: string;
  scope: 'READ' | 'WRITE' | 'FULL';
  isActive: boolean;
}
```

## UI Components Updated

### 1. **ServicesPage** (`pages/ServicesPage.tsx`)
**Changes**:
- Added `useEffect` to load services from API on component mount
- Integrated `handleStatusToggle` with `updateService` API call
- Integrated `handleDeleteConfirm` with `deleteService` API call
- Replaced dummy data generation with real API data
- Added loading state management

**Features**:
- Displays list/grid of services fetched from API
- Toggle service active status
- Delete services with API confirmation
- Edit service details with routes

### 2. **ApplicationsPage** (`pages/ApplicationsPage.tsx`)
**Changes**:
- Added `useEffect` to load applications from API on component mount
- Integrated `handleStatusToggle` with `updateApplication` API call
- Integrated `handleDeleteConfirm` with `deleteApplication` API call
- Replaced dummy data generation with real API data
- Added loading state management

**Features**:
- Displays list/grid of applications fetched from API
- Toggle application active status
- Delete applications with API confirmation
- Edit application details with permissions
- Rotate application key functionality

### 3. **EditService Form** (`components/forms/EditService.tsx`)
**Changes**:
- Added `useEffect` to load service details and routes from API
- Replaced `secret` field with `baseUrl` field
- Integrated `handleUpdate` with API calls to:
  - Update service details via `updateService`
  - Create new routes via `createRoute`
  - Update existing routes via `updateRoute`
  - Delete routes via `deleteRoute`
- Added loading and saving states
- Added error handling and validation

**Features**:
- Load existing service data
- Load service routes
- Edit service details (name, baseUrl, description, isActive)
- Add/edit/delete service routes inline
- Comprehensive form validation
- Error messages and loading indicators

### 4. **EditApplication Form** (`components/forms/EditApplication.tsx`)
**Changes**:
- Added `useEffect` to load application details and permissions from API
- Removed `secret` field from form (read-only in API)
- Integrated `handleUpdate` with API calls to:
  - Update application details via `updateApplication`
  - Create new permissions via `createPermission`
  - Update existing permissions via `updatePermission`
  - Delete permissions via `deletePermission`
- Added loading and saving states
- Added error handling and validation

**Features**:
- Load existing application data
- Load application permissions
- Edit application details (name, description, isActive)
- Add/edit/delete application permissions inline
- Comprehensive form validation
- Error messages and loading indicators

### 5. **CreateService Popup** (`components/popups/CreateService.tsx`)
**Changes**:
- Added state management for form data
- Integrated `createService` API call
- Added error handling and validation
- Added saving state with disabled buttons during submission
- Auto-reload page on success

**Features**:
- Create new service with name and baseUrl
- Input validation
- Error display
- Loading state

### 6. **CreateApplication Popup** (`components/popups/CreateApplication.tsx`)
**Changes**:
- Added state management for form data
- Integrated `createApplication` API call
- Added error handling and validation
- Added saving state with disabled buttons during submission
- Auto-reload page on success

**Features**:
- Create new application with name and description
- Input validation
- Error display
- Loading state

## Environment Configuration

### `.env.local` File
```
VITE_API_BASE_URL=http://localhost:3001
```

This environment variable is used by the API services to construct request URLs.

## Usage Examples

### Creating a Service
```typescript
import { createService } from '@/services/servicesApi';

await createService({
  name: 'User Service',
  baseUrl: 'http://localhost:4000',
  description: 'Service for managing users'
});
```

### Updating an Application
```typescript
import { updateApplication } from '@/services/applicationsApi';

await updateApplication('app-id', {
  name: 'Updated App',
  isActive: true
});
```

### Creating a Permission
```typescript
import { createPermission } from '@/services/permissionsApi';

await createPermission({
  clientId: 'app-id',
  routeId: 'route-id',
  scope: 'READ',
  description: 'Read access'
});
```

## API Integration Flow

1. **Data Loading**: Components use `useEffect` to load initial data from APIs
2. **CRUD Operations**: User actions trigger API calls through service functions
3. **State Management**: React state is updated after successful API operations
4. **Error Handling**: All API calls are wrapped in try-catch blocks with user feedback
5. **Loading States**: UI shows loading/saving indicators during API operations

## Features Summary

✅ **Services Management**
- View all services
- Create new service with baseUrl
- Edit service details and routes
- Delete services
- Toggle service status

✅ **Applications Management**
- View all applications
- Create new application
- Edit application details and permissions
- Delete applications
- Toggle application status
- Rotate application keys

✅ **Routes Management**
- Manage routes within service editing
- Create/edit/delete routes
- Assign routes to services

✅ **Permissions Management**
- Manage permissions within application editing
- Create/edit/delete permissions
- Assign permissions to applications and routes
- Set access scopes (READ, WRITE, FULL)

## Notes

- The API base URL defaults to `http://localhost:3001`
- All API responses follow a standard format: `{ success: boolean, data: T }`
- Error handling includes descriptive messages from the backend
- Forms validate input before submission
- Pages auto-load data and refresh the list after successful operations
