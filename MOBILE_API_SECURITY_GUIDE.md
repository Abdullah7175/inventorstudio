# Mobile API Security Guide
## Inventor Design Studio - Secure Mobile API Integration

### 🔐 Security Overview

Your mobile app connects to the Inventor Design Studio API using multiple layers of security to ensure data protection and prevent unauthorized access.

---

## 🔑 Authentication Methods

### 1. API Security Token (Primary)
**Default Token**: `inventor-design-studio-api-2024-secure`
**Header**: `X-API-Security-Token`
**Usage**: All mobile API requests

```javascript
// Example usage
const headers = {
  'X-API-Security-Token': 'inventor-design-studio-api-2024-secure',
  'Content-Type': 'application/json'
};
```

### 2. API Keys (Advanced)
**Format**: `ids_` + 48 character hex string
**Header**: `X-API-Key`
**Usage**: Alternative to security token with permissions

```javascript
// Example usage
const headers = {
  'X-API-Key': 'ids_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  'Content-Type': 'application/json'
};
```

### 3. JWT Tokens (User Authentication)
**Header**: `Authorization: Bearer <token>`
**Usage**: User-specific authenticated requests

```javascript
// Example usage
const headers = {
  'Authorization': `Bearer ${userJwtToken}`,
  'X-API-Security-Token': 'inventor-design-studio-api-2024-secure',
  'Content-Type': 'application/json'
};
```

---

## 🚦 Rate Limiting

### General API Calls
- **Limit**: 1000 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Authentication
- **Limit**: 5 login attempts per 15 minutes per IP
- **Error**: `LOGIN_RATE_LIMIT_EXCEEDED`

### Chat Messages
- **Limit**: 30 messages per minute per IP
- **Error**: `CHAT_RATE_LIMIT_EXCEEDED`

---

## 📱 Mobile App Integration

### 1. Environment Configuration

```javascript
// config.js
const API_CONFIG = {
  BASE_URL: 'https://your-domain.com/api/mobile',
  SECURITY_TOKEN: 'inventor-design-studio-api-2024-secure',
  API_KEY: 'your-api-key-here', // Optional, if using API keys
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 1000,
  MAX_LOGIN_ATTEMPTS: 5,
  MAX_CHAT_MESSAGES: 30,
  
  // Token management
  TOKEN_REFRESH_THRESHOLD: 3600000, // 1 hour before expiry
  SESSION_TIMEOUT: 604800000, // 7 days
};
```

### 2. API Client Implementation

```javascript
// apiClient.js
class MobileApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.securityToken = API_CONFIG.SECURITY_TOKEN;
    this.apiKey = API_CONFIG.API_KEY;
    this.jwtToken = null;
    this.deviceToken = this.generateDeviceToken();
  }

  // Generate unique device token
  generateDeviceToken() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get headers for requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Security-Token': this.securityToken,
      'User-Agent': 'InventorDesignStudio-Mobile/1.0',
      'X-Device-Token': this.deviceToken,
      'X-Platform': Platform.OS, // React Native
    };

    // Add API key if available
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    // Add JWT token for authenticated requests
    if (includeAuth && this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.requireAuth !== false),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      }

      // Handle token expiration
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error === 'TOKEN_EXPIRED') {
          await this.refreshToken();
          // Retry the request
          return this.request(endpoint, options);
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      requireAuth: false,
      body: JSON.stringify({
        email,
        password,
        deviceToken: this.deviceToken,
        deviceType: Platform.OS
      })
    });

    this.jwtToken = response.token;
    return response;
  }

  async refreshToken() {
    if (!this.jwtToken) {
      throw new Error('No token to refresh');
    }

    const response = await this.request('/refresh-token', {
      method: 'POST'
    });

    this.jwtToken = response.token;
    return response;
  }

  // API methods
  async getUserProfile() {
    return this.request('/user-profile');
  }

  async getProjects() {
    return this.request('/projects');
  }

  async sendMessage(projectId, message) {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        message,
        messageType: 'text'
      })
    });
  }

  async getNotifications() {
    return this.request('/notifications');
  }
}

export default new MobileApiClient();
```

### 3. Token Management

```javascript
// tokenManager.js
class TokenManager {
  constructor() {
    this.storageKey = 'inventor_design_studio_token';
    this.refreshThreshold = API_CONFIG.TOKEN_REFRESH_THRESHOLD;
  }

  // Store token securely
  async storeToken(token) {
    try {
      await SecureStore.setItemAsync(this.storageKey, JSON.stringify({
        token,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  // Retrieve token
  async getToken() {
    try {
      const tokenData = await SecureStore.getItemAsync(this.storageKey);
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        
        // Check if token needs refresh
        if (this.needsRefresh(parsed.timestamp)) {
          await this.refreshToken();
          return await this.getToken();
        }
        
        return parsed.token;
      }
    } catch (error) {
      console.error('Failed to retrieve token:', error);
    }
    return null;
  }

  // Check if token needs refresh
  needsRefresh(timestamp) {
    return Date.now() - timestamp > this.refreshThreshold;
  }

  // Clear token
  async clearToken() {
    try {
      await SecureStore.deleteItemAsync(this.storageKey);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }
}

export default new TokenManager();
```

---

## 🔒 Security Best Practices

### 1. Token Storage
- **iOS**: Use Keychain Services
- **Android**: Use EncryptedSharedPreferences
- **React Native**: Use react-native-keychain

```javascript
// React Native example
import * as Keychain from 'react-native-keychain';

// Store token
await Keychain.setInternetCredentials(
  'inventor_design_studio',
  'token',
  jwtToken
);

// Retrieve token
const credentials = await Keychain.getInternetCredentials(
  'inventor_design_studio'
);
```

### 2. Certificate Pinning
Implement SSL certificate pinning to prevent man-in-the-middle attacks:

```javascript
// React Native with react-native-ssl-pinning
import { fetch } from 'react-native-ssl-pinning';

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
  sslPinning: {
    certs: ['your-cert-hash']
  }
});
```

### 3. Request Signing
For sensitive operations, implement request signing:

```javascript
// Generate request signature
function generateSignature(data, timestamp, secret) {
  const payload = JSON.stringify(data) + timestamp;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Include signature in headers
const timestamp = Date.now();
const signature = generateSignature(requestData, timestamp, apiSecret);

headers['X-Timestamp'] = timestamp;
headers['X-Signature'] = signature;
```

### 4. Biometric Authentication
Use device biometrics for additional security:

```javascript
// React Native with react-native-touch-id
import TouchID from 'react-native-touch-id';

// Check if biometrics are available
TouchID.isSupported()
  .then(biometryType => {
    // Use biometrics for sensitive operations
  });

// Authenticate with biometrics
TouchID.authenticate('Authenticate to access your projects')
  .then(() => {
    // Proceed with sensitive operation
  });
```

---

## 🚨 Error Handling

### Common Error Codes
```javascript
const ERROR_CODES = {
  API_AUTHENTICATION_REQUIRED: 'Missing or invalid API credentials',
  TOKEN_EXPIRED: 'JWT token has expired',
  INVALID_CREDENTIALS: 'Wrong email/password',
  USER_NOT_FOUND: 'User does not exist',
  ACCOUNT_DEACTIVATED: 'User account is disabled',
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  VALIDATION_ERROR: 'Request data validation failed',
  NETWORK_ERROR: 'Network connection failed'
};

function handleApiError(error) {
  const errorCode = error.error || 'UNKNOWN_ERROR';
  const message = ERROR_CODES[errorCode] || error.message;
  
  // Log error for debugging
  console.error('API Error:', { errorCode, message, error });
  
  // Show user-friendly message
  Alert.alert('Error', message);
}
```

### Retry Logic
```javascript
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## 📊 Monitoring & Analytics

### Request Logging
```javascript
// Log API requests for debugging
function logApiRequest(endpoint, method, status, duration) {
  console.log(`API Request: ${method} ${endpoint} - ${status} (${duration}ms)`);
  
  // Send to analytics service
  analytics.track('api_request', {
    endpoint,
    method,
    status,
    duration,
    timestamp: new Date().toISOString()
  });
}
```

### Performance Monitoring
```javascript
// Monitor API performance
const performanceMonitor = {
  startTime: null,
  
  start() {
    this.startTime = Date.now();
  },
  
  end() {
    const duration = Date.now() - this.startTime;
    
    // Log slow requests
    if (duration > 5000) {
      console.warn(`Slow API request detected: ${duration}ms`);
    }
    
    return duration;
  }
};
```

---

## 🔧 Development & Testing

### API Testing
```javascript
// Test API connectivity
async function testApiConnection() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      headers: {
        'X-API-Security-Token': API_CONFIG.SECURITY_TOKEN
      }
    });
    
    const data = await response.json();
    console.log('API Health Check:', data);
    return data.status === 'healthy';
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
}
```

### Mock Data for Development
```javascript
// Mock API responses for development
const mockResponses = {
  '/auth/login': {
    message: 'Login successful',
    token: 'mock-jwt-token',
    user: {
      id: 'mock-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    }
  }
};

function useMockData() {
  return process.env.NODE_ENV === 'development' && API_CONFIG.USE_MOCK_DATA;
}
```

---

## 📋 Checklist for Production

### Security Checklist
- [ ] API Security Token configured
- [ ] JWT tokens stored securely
- [ ] SSL certificate pinning enabled
- [ ] Rate limiting implemented
- [ ] Error handling comprehensive
- [ ] Request logging configured
- [ ] Biometric authentication optional
- [ ] Token refresh mechanism working
- [ ] Network error handling robust
- [ ] API key management (if used)

### Performance Checklist
- [ ] Request caching implemented
- [ ] Image optimization enabled
- [ ] Lazy loading for content
- [ ] Background sync configured
- [ ] Offline support planned
- [ ] Memory usage optimized
- [ ] Battery usage optimized

### Testing Checklist
- [ ] Unit tests for API client
- [ ] Integration tests for endpoints
- [ ] Error scenario testing
- [ ] Network failure testing
- [ ] Token expiration testing
- [ ] Rate limit testing
- [ ] Security penetration testing

---

## 📞 Support

For API support and questions:
- **Email**: info@inventerdesignstudio.com
- **Address**: First Floor, Plaza No. 8, H, A4, Commercial Area Block H Valencia, Lahore, 54000
- **Documentation**: [MOBILE_API_DOCUMENTATION.md](./MOBILE_API_DOCUMENTATION.md)

---

## 🔄 Updates

This security guide is regularly updated. Check for the latest version before implementing new features or making changes to your mobile app integration.

**Last Updated**: January 2024
**Version**: 1.0
