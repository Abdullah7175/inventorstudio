# Mobile API Documentation
## Inventor Design Studio Mobile API

### Security Overview
All mobile APIs require a special API security token for authentication. This ensures that only authorized mobile applications can access the API endpoints.

### API Security Token
- **Header**: `X-API-Security-Token` or `api-security-token`
- **Value**: `inventor-design-studio-api-2024-secure` (default)
- **Environment Variable**: `API_SECURITY_TOKEN`

### Authentication Flow
1. **Login**: POST `/api/mobile/auth/login`
2. **Get JWT Token**: Use the returned JWT token in Authorization header
3. **API Calls**: Include both API security token and JWT token

---

## Authentication APIs

### 1. Mobile Login
**Endpoint**: `POST /api/mobile/auth/login`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "deviceToken": "device_unique_token",
  "deviceType": "ios" // or "android", "web"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  },
  "token": "jwt_token_here",
  "sessionToken": "mobile_session_token",
  "expiresIn": "7d"
}
```

### 2. Mobile Registration
**Endpoint**: `POST /api/mobile/auth/register`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "deviceToken": "device_unique_token",
  "deviceType": "ios"
}
```

### 3. Token Refresh
**Endpoint**: `POST /api/mobile/refresh-token`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

**Response**:
```json
{
  "message": "Token refreshed successfully",
  "token": "new_jwt_token",
  "expiresIn": "7d"
}
```

### 4. Session Validation
**Endpoint**: `POST /api/mobile/validate-session`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Content-Type: application/json
```

**Request Body**:
```json
{
  "userId": "user_id",
  "deviceToken": "device_unique_token",
  "sessionToken": "mobile_session_token"
}
```

---

## Content APIs

### 1. Portfolio Projects
**Endpoint**: `GET /api/mobile/portfolio`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

**Query Parameters**:
- `category` (optional): Filter by category
- `featured` (optional): Get only featured projects

### 2. Services
**Endpoint**: `GET /api/mobile/services`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

### 3. Blog Posts
**Endpoint**: `GET /api/mobile/blog`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

**Query Parameters**:
- `published` (optional): Filter by published status
- `limit` (optional): Number of posts to return

---

## Project Management APIs

### 1. User Projects
**Endpoint**: `GET /api/mobile/projects`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

### 2. Project Details
**Endpoint**: `GET /api/mobile/projects/:id`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

### 3. Create Project Request
**Endpoint**: `POST /api/mobile/projects`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

---

## Communication APIs

### 1. Send Message
**Endpoint**: `POST /api/mobile/chat/send`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### 2. Get Messages
**Endpoint**: `GET /api/mobile/chat/:projectId`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

### 3. Contact Form
**Endpoint**: `POST /api/mobile/contact`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

---

## User Profile APIs

### 1. Get Profile
**Endpoint**: `GET /api/mobile/user-profile`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

### 2. Update Profile
**Endpoint**: `PUT /api/mobile/user-profile`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

### 3. Update Device Token
**Endpoint**: `POST /api/mobile/update-device-token`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

---

## Notification APIs

### 1. Get Notifications
**Endpoint**: `GET /api/mobile/notifications`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

### 2. Mark Notification as Read
**Endpoint**: `PUT /api/mobile/notifications/:id/read`
**Headers**: 
```
X-API-Security-Token: inventor-design-studio-api-2024-secure
Authorization: Bearer jwt_token_here
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes:
- `API_SECURITY_TOKEN_REQUIRED`: Missing or invalid API security token
- `INVALID_CREDENTIALS`: Wrong email/password
- `TOKEN_EXPIRED`: JWT token has expired
- `USER_NOT_FOUND`: User doesn't exist
- `ACCOUNT_DEACTIVATED`: User account is disabled
- `VALIDATION_ERROR`: Request data validation failed

---

## Rate Limiting
- **Login attempts**: 5 attempts per 15 minutes per IP
- **API calls**: 1000 requests per hour per user
- **File uploads**: 10MB max file size

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store API security token securely** in your mobile app
3. **Implement token refresh** before expiration
4. **Use device-specific tokens** for better security
5. **Validate all inputs** on the client side
6. **Handle network errors gracefully**
7. **Log out users** when tokens expire

---

## SDK Integration Examples

### React Native Example:
```javascript
const API_BASE_URL = 'https://your-domain.com/api/mobile';
const API_SECURITY_TOKEN = 'inventor-design-studio-api-2024-secure';

// Login
const login = async (email, password, deviceToken) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'X-API-Security-Token': API_SECURITY_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      deviceToken,
      deviceType: Platform.OS
    })
  });
  
  return response.json();
};

// Make authenticated requests
const makeAuthenticatedRequest = async (endpoint, token, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Security-Token': API_SECURITY_TOKEN,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return response.json();
};
```

### Flutter Example:
```dart
class ApiService {
  static const String baseUrl = 'https://your-domain.com/api/mobile';
  static const String apiSecurityToken = 'inventor-design-studio-api-2024-secure';
  
  static Future<Map<String, dynamic>> login(String email, String password, String deviceToken) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {
        'X-API-Security-Token': apiSecurityToken,
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'password': password,
        'deviceToken': deviceToken,
        'deviceType': Platform.isIOS ? 'ios' : 'android',
      }),
    );
    
    return jsonDecode(response.body);
  }
}
```
