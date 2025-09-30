import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye, EyeOff, Shield, Smartphone, Globe, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: 'none' | 'token' | 'team';
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response: {
    status: number;
    description: string;
    example: any;
  };
}

const ApiDocumentation: React.FC = () => {
  const [showToken, setShowToken] = useState(false);
  const [testToken, setTestToken] = useState('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoints: ApiEndpoint[] = [
    // Authentication APIs
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'User login for web and mobile applications',
      auth: 'none',
      parameters: [
        { name: 'email', type: 'string', required: true, description: 'User email address' },
        { name: 'password', type: 'string', required: true, description: 'User password' }
      ],
      response: {
        status: 200,
        description: 'Login successful',
        example: {
          message: 'Login successful',
          user: {
            id: 1,
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'customer',
            emailVerified: true,
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z'
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/auth/mobile-login',
      description: 'Mobile app login with device token support',
      auth: 'none',
      parameters: [
        { name: 'email', type: 'string', required: true, description: 'User email address' },
        { name: 'password', type: 'string', required: true, description: 'User password' },
        { name: 'deviceToken', type: 'string', required: false, description: 'Device token for push notifications' },
        { name: 'deviceType', type: 'string', required: false, description: 'Device type (ios/android)' }
      ],
      response: {
        status: 200,
        description: 'Mobile login successful',
        example: {
          message: 'Mobile login successful',
          user: {
            id: 1,
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'customer'
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: '7d'
        }
      }
    },
    {
      method: 'POST',
      path: '/api/auth/register',
      description: 'User registration',
      auth: 'none',
      parameters: [
        { name: 'email', type: 'string', required: true, description: 'User email address' },
        { name: 'password', type: 'string', required: true, description: 'Password (min 6 characters)' },
        { name: 'firstName', type: 'string', required: true, description: 'User first name' },
        { name: 'lastName', type: 'string', required: true, description: 'User last name' },
        { name: 'phone', type: 'string', required: false, description: 'User phone number' }
      ],
      response: {
        status: 201,
        description: 'Registration successful',
        example: {
          message: 'Registration successful',
          user: {
            id: 1,
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'customer'
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/auth/user',
      description: 'Get current user information',
      auth: 'token',
      response: {
        status: 200,
        description: 'User information retrieved',
        example: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          emailVerified: true,
          isActive: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/auth/logout',
      description: 'User logout',
      auth: 'token',
      response: {
        status: 200,
        description: 'Logout successful',
        example: {
          message: 'Logged out successfully'
        }
      }
    },
    // Public APIs
    {
      method: 'GET',
      path: '/api/services',
      description: 'Get all available services',
      auth: 'none',
      response: {
        status: 200,
        description: 'Services retrieved successfully',
        example: [
          {
            id: 1,
            name: 'Web Design',
            description: 'Custom website design and development',
            price: 1500,
            duration: '2-4 weeks',
            features: ['Responsive Design', 'SEO Optimization', 'CMS Integration']
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/portfolio',
      description: 'Get portfolio projects',
      auth: 'none',
      response: {
        status: 200,
        description: 'Portfolio projects retrieved',
        example: [
          {
            id: 1,
            title: 'E-commerce Website',
            description: 'Modern e-commerce platform',
            imageUrl: '/images/project1.jpg',
            technologies: ['React', 'Node.js', 'PostgreSQL'],
            category: 'Web Development'
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/blog',
      description: 'Get published blog posts',
      auth: 'none',
      response: {
        status: 200,
        description: 'Blog posts retrieved',
        example: [
          {
            id: 1,
            title: 'Web Design Trends 2024',
            slug: 'web-design-trends-2024',
            excerpt: 'Latest trends in web design...',
            publishedAt: '2024-01-01T00:00:00.000Z',
            author: {
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/contact',
      description: 'Submit contact form',
      auth: 'none',
      parameters: [
        { name: 'name', type: 'string', required: true, description: 'Contact name' },
        { name: 'email', type: 'string', required: true, description: 'Contact email' },
        { name: 'message', type: 'string', required: true, description: 'Contact message' },
        { name: 'phone', type: 'string', required: false, description: 'Contact phone' }
      ],
      response: {
        status: 200,
        description: 'Contact submission received',
        example: {
          message: 'Contact submission received successfully'
        }
      }
    },
    // Client APIs
    {
      method: 'GET',
      path: '/api/client/projects',
      description: 'Get user projects (authenticated)',
      auth: 'token',
      response: {
        status: 200,
        description: 'User projects retrieved',
        example: [
          {
            id: 1,
            title: 'My Website Project',
            status: 'in-progress',
            progress: 75,
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-02-01T00:00:00.000Z'
          }
        ]
      }
    },
    // Admin APIs removed for security
  ];

  const getAuthBadge = (auth: string) => {
    switch (auth) {
      case 'none':
        return <Badge variant="secondary"><Globe className="w-3 h-3 mr-1" />Public</Badge>;
      case 'token':
        return <Badge variant="default"><Shield className="w-3 h-3 mr-1" />Token Required</Badge>;
      case 'team':
        return <Badge variant="outline"><Shield className="w-3 h-3 mr-1" />Team Access</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'POST':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API endpoint copied successfully",
    });
  };

  const testApiEndpoint = async (endpoint: ApiEndpoint) => {
    if (!testToken && endpoint.auth !== 'none') {
      toast({
        title: "Token Required",
        description: "Please provide a token to test this endpoint",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (endpoint.auth !== 'none' && testToken) {
        headers['Authorization'] = `Bearer ${testToken}`;
      }

      const response = await fetch(`http://localhost:5000${endpoint.path}`, {
        method: endpoint.method,
        headers,
        body: endpoint.method !== 'GET' ? JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword',
          name: 'Test User',
          message: 'Test message'
        }) : undefined,
      });

      const data = await response.json();
      setTestResponse({
        status: response.status,
        data,
        endpoint: endpoint.path
      });
    } catch (error) {
      setTestResponse({
        status: 'error',
        data: { error: 'Network error or endpoint not available' },
        endpoint: endpoint.path
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete API reference for Inventor Design Studio. Secure, token-based authentication 
            with support for web and mobile applications.
          </p>
        </div>

        <Tabs defaultValue="endpoints" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="testing">API Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid gap-6">
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getMethodColor(endpoint.method)} border`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-lg font-mono bg-white px-3 py-1 rounded border">
                          {endpoint.path}
                        </code>
                        {getAuthBadge(endpoint.auth)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.path)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{endpoint.description}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {endpoint.parameters && (
                      <div>
                        <h4 className="font-semibold mb-2">Parameters:</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center gap-2 text-sm">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {param.name}
                              </code>
                              <span className="text-gray-600">({param.type})</span>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              <span className="text-gray-500">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Response:</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={endpoint.response.status === 200 ? "default" : "secondary"}>
                            {endpoint.response.status}
                          </Badge>
                          <span className="text-sm text-gray-600">{endpoint.response.description}</span>
                        </div>
                        <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                          {JSON.stringify(endpoint.response.example, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Token-Based Authentication
                </CardTitle>
                <CardDescription>
                  Secure authentication system using JWT tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Web Application Authentication</h3>
                  <p className="text-gray-600 mb-3">
                    Web applications use HTTP-only cookies for secure token storage.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm">
{`// Login request
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

// Response includes httpOnly cookie
{
  "message": "Login successful",
  "user": { ... }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Mobile Application Authentication</h3>
                  <p className="text-gray-600 mb-3">
                    Mobile applications receive JWT tokens in the response body for storage.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm">
{`// Mobile login request
POST /api/auth/mobile-login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "deviceToken": "device_push_token",
  "deviceType": "ios"
}

// Response includes JWT token
{
  "message": "Mobile login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Using Tokens in Requests</h3>
                  <p className="text-gray-600 mb-3">
                    Include the JWT token in the Authorization header for protected endpoints.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm">
{`// Authenticated request
GET /api/auth/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Token Expiration</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Tokens expire after 7 days</li>
                    <li>Refresh tokens automatically on each request</li>
                    <li>Logout clears the token immediately</li>
                    <li>Invalid tokens return 401 Unauthorized</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Testing Tool</CardTitle>
                <CardDescription>
                  Test API endpoints with your authentication token
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-token">Authentication Token (for protected endpoints)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="test-token"
                      type={showToken ? "text" : "password"}
                      value={testToken}
                      onChange={(e) => setTestToken(e.target.value)}
                      placeholder="Enter your JWT token here"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {testResponse && (
                  <div>
                    <h4 className="font-semibold mb-2">Test Response:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={testResponse.status === 200 ? "default" : "destructive"}>
                          {testResponse.status}
                        </Badge>
                        <span className="text-sm text-gray-600">{testResponse.endpoint}</span>
                      </div>
                      <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(testResponse.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <h4 className="font-semibold">Quick Test Endpoints:</h4>
                  {apiEndpoints.slice(0, 5).map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getMethodColor(endpoint.method)} border text-xs`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                        {getAuthBadge(endpoint.auth)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiEndpoint(endpoint)}
                        disabled={isLoading}
                      >
                        Test
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiDocumentation;
