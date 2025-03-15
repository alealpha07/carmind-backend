# API Documentation

This document provides detailed information about the API endpoints available in the Express application. The API is designed to handle user authentication, vehicle management, subscription handling, and file uploads. Authentication is managed using the Passport local strategy (username and password).

## Table of Contents
- [Authentication](#authentication)
  - [Register](#register)
  - [Login](#login)
  - [Get User](#get-user)
  - [Logout](#logout)
  - [Reset Password](#reset-password)
  - [Edit Profile](#edit-profile)
- [Subscription](#subscription)
  - [Subscribe](#subscribe)
- [Vehicle](#vehicle)
  - [Create Vehicle](#create-vehicle)
  - [Get Vehicles](#get-vehicles)
  - [Get Vehicle Details](#get-vehicle-details)
  - [Update Vehicle](#update-vehicle)
  - [Delete Vehicle](#delete-vehicle)
- [File Upload](#file-upload)
  - [Upload File](#upload-file)
  - [Get File](#get-file)
  - [Delete File](#delete-file)
- [Internationalization](#internationalization)

---

## Authentication

### Register
Registers a new user.

**URL**: `/auth/register`  
**Method**: `POST`  
**Authentication**: Not required  

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string",
  "name": "string",
  "surname": "string",
  "birthDate": "date"
}
```

**Response**:
- `200 OK`: User created successfully.
- `422 Unprocessable Entity`: Missing required parameters or email already taken.

---

### Login
Logs in a user.

**URL**: `/auth/login`  
**Method**: `POST`  
**Authentication**: Not required  

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
- `200 OK`: Logged in successfully.
- `401 Unauthorized`: Incorrect credentials.

---

### Get User
Retrieves the authenticated user's details.

**URL**: `/auth/user`  
**Method**: `GET`  
**Authentication**: Required  

**Response**:
- `200 OK`: Returns user details.
- `500 Internal Server Error`: Server error.

---

### Logout
Logs out the authenticated user.

**URL**: `/auth/logout`  
**Method**: `POST`  
**Authentication**: Required  

**Response**:
- `200 OK`: Logged out successfully.

---

### Reset Password
Resets the authenticated user's password.

**URL**: `/auth/reset`  
**Method**: `POST`  
**Authentication**: Required  

**Request Body**:
```json
{
  "password": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```

**Response**:
- `200 OK`: Password changed successfully.
- `422 Unprocessable Entity`: Missing required parameters or passwords do not match.

---

### Edit Profile
Edits the authenticated user's profile.

**URL**: `/auth/editprofile`  
**Method**: `POST`  
**Authentication**: Required  

**Request Body**:
```json
{
  "name": "string",
  "surname": "string",
  "birthDate": "date"
}
```

**Response**:
- `200 OK`: Profile updated successfully.
- `422 Unprocessable Entity`: Missing required parameters.

---

## Subscription

### Subscribe
Subscribes a user to push notifications.

**URL**: `/subscribe`  
**Method**: `POST`  
**Authentication**: Required  

**Request Body**:
```json
{
  "endpoint": "string",
  "keys": {
    "p256dh": "string",
    "auth": "string"
  }
}
```

**Response**:
- `201 Created`: Subscribed successfully.
- `422 Unprocessable Entity`: Missing required parameters.

---

## Vehicle

### Create Vehicle
Creates a new vehicle for the authenticated user.

**URL**: `/vehicle`  
**Method**: `POST`  
**Authentication**: Required  

**Request Body**:
```json
{
  "type": "string",
  "brand": "string",
  "model": "string",
  "registrationYear": "number",
  "plateNumber": "string",
  "isInsured": "boolean",
  "startDateInsurance": "date",
  "endDateInsurance": "date",
  "hasBill": "boolean",
  "endDateBill": "date",
  "endDateRevision": "date"
}
```

**Response**:
- `200 OK`: Vehicle created successfully.
- `422 Unprocessable Entity`: Missing required parameters.

---

### Get Vehicles
Retrieves all vehicles for the authenticated user.

**URL**: `/vehicle`  
**Method**: `GET`  
**Authentication**: Required  

**Response**:
- `200 OK`: Returns a list of vehicles.
- `500 Internal Server Error`: Server error.

---

### Get Vehicle Details
Retrieves details of a specific vehicle.

**URL**: `/vehicle/details`  
**Method**: `GET`  
**Authentication**: Required  

**Query Parameters**:
- `id`: Vehicle ID.

**Response**:
- `200 OK`: Returns vehicle details.
- `422 Unprocessable Entity`: Missing required parameters.

---

### Update Vehicle
Updates a specific vehicle.

**URL**: `/vehicle`  
**Method**: `PUT`  
**Authentication**: Required  

**Request Body**:
```json
{
  "id": "number",
  "type": "string",
  "brand": "string",
  "model": "string",
  "registrationYear": "number",
  "plateNumber": "string",
  "isInsured": "boolean",
  "startDateInsurance": "date",
  "endDateInsurance": "date",
  "hasBill": "boolean",
  "endDateBill": "date",
  "endDateRevision": "date"
}
```

**Response**:
- `200 OK`: Vehicle updated successfully.
- `422 Unprocessable Entity`: Missing required parameters.

---

### Delete Vehicle
Deletes a specific vehicle.

**URL**: `/vehicle`  
**Method**: `DELETE`  
**Authentication**: Required  

**Query Parameters**:
- `id`: Vehicle ID.

**Response**:
- `200 OK`: Vehicle deleted successfully.
- `422 Unprocessable Entity`: Missing required parameters.

---

## File Upload

### Upload File
Uploads a file for a specific vehicle.

**URL**: `/upload`  
**Method**: `POST`  
**Authentication**: Required  

**Query Parameters**:
- `id`: Vehicle ID.
- `type`: Type of file (e.g., `insuranceFileExtension`, `maintenanceFileExtension`, etc.) => taken from the Vehicle db schema props.

**Request Body**:
- `file`: The file to upload (multipart/form-data).

**Response**:
- `200 OK`: File uploaded successfully.
- `422 Unprocessable Entity`: Missing required parameters or invalid file type.

---

### Get File
Retrieves a file for a specific vehicle.

**URL**: `/upload`  
**Method**: `GET`  
**Authentication**: Required  

**Query Parameters**:
- `id`: Vehicle ID.
- `type`: Type of file (e.g., `insuranceFileExtension`, `maintenanceFileExtension`, etc.) => taken from the Vehicle db schema props.

**Response**:
- `200 OK`: Returns the file.
- `404 Not Found`: File or vehicle not found.
- `422 Unprocessable Entity`: Missing required parameters or invalid file type.

---

### Delete File
Deletes a file for a specific vehicle.

**URL**: `/upload`  
**Method**: `DELETE`  
**Authentication**: Required  

**Query Parameters**:
- `id`: Vehicle ID.
- `type`: Type of file (e.g., `insuranceFileExtension`, `maintenanceFileExtension`, etc.) => taken from the Vehicle db schema props.

**Response**:
- `200 OK`: File deleted successfully.
- `422 Unprocessable Entity`: Missing required parameters or invalid file type.

---

### Internationalization
To support multiple languages, translations are managed using the i18n library. You can specify your preferred language by including the lang query parameter in your request. This allows the API to return responses in the desired language.

For more detailed information on how internationalization is implemented, please refer to the [Internationalization Documentation](./INTERNATIONALIZATION.md)

[Go back to README.md](./README.md)