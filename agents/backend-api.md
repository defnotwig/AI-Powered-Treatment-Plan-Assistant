# Backend API Guidelines

> Comprehensive backend development standards and patterns

---

## API Development Standards

### Endpoint Naming
```
✅ Good:
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/products/search
POST   /api/v1/orders/:id/cancel
GET    /api/v1/users/:id/orders

❌ Bad:
GET    /api/v1/getAllUsers
POST   /api/v1/user/create
GET    /api/v1/user_by_id
DELETE /api/v1/removeUser
```

### Request/Response Standards

#### Request Body
```typescript
// POST /api/v1/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Success Response (201 Created)
```typescript
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-01T10:00:00Z"
  },
  "message": "User created successfully"
}
```

#### Error Response (400 Bad Request)
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "value": "***"
      }
    ]
  },
  "timestamp": "2024-03-01T10:00:00Z",
  "path": "/api/v1/users"
}
```

---

## HTTP Status Codes

### Success Codes (2xx)
```
200 OK              - Successful GET, PUT, PATCH
201 Created         - Successful POST
204 No Content      - Successful DELETE
```

### Client Error Codes (4xx)
```
400 Bad Request         - Invalid input
401 Unauthorized        - Missing or invalid authentication
403 Forbidden           - Authenticated but not authorized
404 Not Found           - Resource doesn't exist
409 Conflict            - Resource already exists
422 Unprocessable       - Validation failed
429 Too Many Requests   - Rate limit exceeded
```

### Server Error Codes (5xx)
```
500 Internal Server Error  - Unexpected error
502 Bad Gateway           - Upstream service error
503 Service Unavailable   - Service down/maintenance
504 Gateway Timeout       - Upstream timeout
```

---

## Middleware Stack

### Standard Middleware Order
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

// 3. Compression
app.use(compression());

// 4. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Logging
app.use(morgan('combined'));

// 6. Request ID
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

// 7. Authentication
app.use(authMiddleware);

// 8. Rate limiting
app.use('/api', rateLimitMiddleware);

// 9. Routes
app.use('/api/v1', routes);

// 10. Error handler (last)
app.use(errorHandler);
```

---

## Authentication Implementation

### JWT Strategy
```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  // Generate tokens
  generateTokens(user: User) {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  // Verify token
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
  
  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  
  // Compare password
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Auth middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    
    const payload = authService.verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based middleware
export const requireRole = (...roles: string[]) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};
```

---

## Input Validation

### Using Zod
```typescript
import { z } from 'zod';

// Define schemas
const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  age: z.number().int().min(18).optional(),
  terms: z.boolean().refine(val => val === true, {
    message: 'Must accept terms'
  })
});

const UpdateUserSchema = CreateUserSchema.partial();

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input
        }));
        
        return next(new ValidationError('Validation failed', details));
      }
      next(error);
    }
  };
};

// Usage
router.post('/users',
  validate(CreateUserSchema),
  userController.create
);

router.patch('/users/:id',
  authMiddleware,
  validate(UpdateUserSchema),
  userController.update
);
```

---

## Database Patterns

### Transaction Management
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async createUserWithProfile(data: CreateUserWithProfileDto) {
    return prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password
        }
      });
      
      // Create profile
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          bio: data.bio,
          avatar: data.avatar
        }
      });
      
      // Send welcome email (outside transaction)
      await this.emailService.sendWelcome(user.email);
      
      return { user, profile };
    });
  }
}
```

### Query Optimization
```typescript
// ❌ N+1 Query Problem
async function getPostsWithAuthors() {
  const posts = await prisma.post.findMany();
  
  // This causes N queries
  for (const post of posts) {
    post.author = await prisma.user.findUnique({
      where: { id: post.authorId }
    });
  }
  
  return posts;
}

// ✅ Use include/select
async function getPostsWithAuthors() {
  return prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

// ✅ Or use dataloader for complex cases
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (userIds: string[]) => {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } }
  });
  
  const userMap = new Map(users.map(u => [u.id, u]));
  return userIds.map(id => userMap.get(id));
});
```

---

## Pagination & Filtering

### Cursor-Based Pagination
```typescript
interface PaginationParams {
  cursor?: string;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export async function getPosts(
  params: PaginationParams
): Promise<PaginatedResponse<Post>> {
  const limit = Math.min(params.limit, 100); // Max 100 items
  
  const posts = await prisma.post.findMany({
    take: limit + 1, // Fetch one extra to check if there's more
    ...(params.cursor && {
      cursor: { id: params.cursor },
      skip: 1 // Skip the cursor
    }),
    orderBy: { createdAt: 'desc' }
  });
  
  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  
  return {
    data,
    meta: { nextCursor, hasMore }
  };
}
```

### Offset-Based Pagination
```typescript
interface OffsetPaginationParams {
  page: number;
  limit: number;
  sort?: string;
  filter?: Record<string, any>;
}

export async function getUsers(params: OffsetPaginationParams) {
  const page = Math.max(params.page, 1);
  const limit = Math.min(params.limit, 100);
  const skip = (page - 1) * limit;
  
  // Build where clause from filters
  const where: any = {};
  if (params.filter?.status) {
    where.status = params.filter.status;
  }
  if (params.filter?.search) {
    where.OR = [
      { name: { contains: params.filter.search, mode: 'insensitive' } },
      { email: { contains: params.filter.search, mode: 'insensitive' } }
    ];
  }
  
  // Parse sort
  const orderBy: any = {};
  if (params.sort) {
    const [field, direction] = params.sort.split(':');
    orderBy[field] = direction || 'asc';
  }
  
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);
  
  return {
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

---

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limit for sensitive endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many authentication attempts'
});

// Per-user rate limit
export const createUserLimiter = (userId: string) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: `rl:user:${userId}:`
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'You are doing that too fast'
  });
};

// Usage
app.use('/api', apiLimiter);
app.post('/api/v1/auth/login', authLimiter, authController.login);
```

---

## Background Jobs

### Using Bull Queue
```typescript
import Queue from 'bull';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Create queue
export const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

// Define job processor
emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  
  console.log(`Processing email job ${job.id}`);
  
  try {
    await emailService.send({ to, subject, body });
    return { success: true, sentAt: new Date() };
  } catch (error) {
    console.error('Email send failed:', error);
    throw error; // Will retry automatically
  }
});

// Add job to queue
export async function queueEmail(data: EmailData) {
  await emailQueue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
}

// Job events
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, error) => {
  console.error(`Email job ${job.id} failed:`, error);
});
```

---

## Logging

### Structured Logging with Winston
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.userId,
      ip: req.ip
    });
  });
  
  next();
};

// Usage
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Payment failed', { userId, error: error.message, stack: error.stack });
```

---

## Error Handling

### Custom Error Classes
```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
```

### Global Error Handler
```typescript
export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Log error
  logger.error('Error occurred', {
    requestId: req.id,
    error: err.message,
    stack: err.stack,
    userId: req.user?.userId
  });
  
  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.id
    });
  }
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Resource already exists'
        }
      });
    }
  }
  
  // Unknown error - don't expose details
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: req.id
  });
};
```

---

## Testing

### Integration Tests
```typescript
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/database';

describe('POST /api/v1/users', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  it('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };
    
    const response = await request(app)
      .post('/api/v1/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.email).toBe(userData.email);
    expect(response.body.data).not.toHaveProperty('password');
  });
  
  it('should return 409 for duplicate email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };
    
    // Create first user
    await request(app)
      .post('/api/v1/users')
      .send(userData);
    
    // Try to create duplicate
    const response = await request(app)
      .post('/api/v1/users')
      .send(userData)
      .expect(409);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('CONFLICT');
  });
});
```