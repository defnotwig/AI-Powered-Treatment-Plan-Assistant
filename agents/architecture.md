# Architecture

> System architecture overview, patterns, and design principles

---

## System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web Client  │  │ Mobile App   │  │   Desktop    │      │
│  │  (Next.js)   │  │ (React Native)│  │   (Electron) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│                    (Rate Limiting, Auth)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
┌──────────────────┐ ┌──────────────┐ ┌─────────────┐
│  Backend Service │ │   Auth       │ │  Payment    │
│  (Express/NestJS)│ │   Service    │ │  Service    │
└──────────────────┘ └──────────────┘ └─────────────┘
         │                   │               │
         └───────────────────┼───────────────┘
                             ▼
         ┌──────────────────────────────────┐
         │         Database Layer           │
         │  ┌──────────┐    ┌────────┐     │
         │  │PostgreSQL│    │ Redis  │     │
         │  └──────────┘    └────────┘     │
         └──────────────────────────────────┘
```

---

## Architecture Patterns

### Monolithic (Current/Option 1)
```
Advantages:
- Simpler to develop and deploy
- Easier to debug and test
- Lower operational overhead
- Single codebase

Disadvantages:
- Scaling entire application
- Tight coupling
- Single point of failure
- Deployment complexity as it grows

Use when:
- Small to medium team
- Early stage product
- Clear boundaries not yet established
```

### Microservices (Future/Option 2)
```
Advantages:
- Independent scaling
- Technology flexibility
- Isolated failures
- Team autonomy

Disadvantages:
- Operational complexity
- Distributed system challenges
- Network latency
- Data consistency

Use when:
- Large team (20+ developers)
- Clear service boundaries
- Different scaling needs
- Mature product
```

---

## Design Patterns

### 1. Repository Pattern
```typescript
// Abstracts data access logic

interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  constructor(private db: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }
  
  // ... other methods
}

// Service uses repository
class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async getUser(id: string) {
    return this.userRepo.findById(id);
  }
}
```

### 2. Service Layer Pattern
```typescript
// Business logic layer between controllers and data access

class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService
  ) {}
  
  async registerUser(data: RegisterDto): Promise<User> {
    // Validation
    if (await this.userRepo.findByEmail(data.email)) {
      throw new ConflictError('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user
    const user = await this.userRepo.create({
      ...data,
      password: hashedPassword
    });
    
    // Send welcome email
    await this.emailService.sendWelcome(user.email);
    
    return user;
  }
}
```

### 3. Factory Pattern
```typescript
// Create objects without specifying exact class

interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>;
}

class StripeProcessor implements PaymentProcessor {
  async process(amount: number): Promise<PaymentResult> {
    // Stripe implementation
  }
}

class PayPalProcessor implements PaymentProcessor {
  async process(amount: number): Promise<PaymentResult> {
    // PayPal implementation
  }
}

class PaymentProcessorFactory {
  static create(type: 'stripe' | 'paypal'): PaymentProcessor {
    switch (type) {
      case 'stripe':
        return new StripeProcessor();
      case 'paypal':
        return new PayPalProcessor();
      default:
        throw new Error('Unknown payment processor');
    }
  }
}
```

### 4. Observer Pattern (Event-Driven)
```typescript
// Notify multiple subscribers of events

interface EventSubscriber {
  handle(event: Event): Promise<void>;
}

class EventBus {
  private subscribers = new Map<string, EventSubscriber[]>();
  
  subscribe(eventType: string, subscriber: EventSubscriber) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(subscriber);
  }
  
  async publish(eventType: string, event: Event) {
    const subscribers = this.subscribers.get(eventType) || [];
    await Promise.all(subscribers.map(s => s.handle(event)));
  }
}

// Usage
class UserRegisteredSubscriber implements EventSubscriber {
  async handle(event: UserRegisteredEvent) {
    await emailService.sendWelcome(event.user.email);
    await analyticsService.track('user_registered', event.user.id);
  }
}

eventBus.subscribe('user.registered', new UserRegisteredSubscriber());
```

### 5. Strategy Pattern
```typescript
// Select algorithm at runtime

interface ValidationStrategy {
  validate(data: unknown): ValidationResult;
}

class EmailValidation implements ValidationStrategy {
  validate(email: string): ValidationResult {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: regex.test(email),
      errors: regex.test(email) ? [] : ['Invalid email format']
    };
  }
}

class PasswordValidation implements ValidationStrategy {
  validate(password: string): ValidationResult {
    const errors = [];
    if (password.length < 8) errors.push('Min 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Need uppercase');
    if (!/[0-9]/.test(password)) errors.push('Need number');
    
    return { valid: errors.length === 0, errors };
  }
}

class Validator {
  validate(data: unknown, strategy: ValidationStrategy): ValidationResult {
    return strategy.validate(data);
  }
}
```

---

## Layered Architecture

### Presentation Layer (Controllers)
```typescript
// Handle HTTP requests/responses

@Controller('/api/v1/users')
class UserController {
  constructor(private userService: UserService) {}
  
  @Post('/')
  async createUser(@Body() dto: CreateUserDto) {
    try {
      const user = await this.userService.create(dto);
      return { success: true, data: user };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message };
      }
      throw error;
    }
  }
}
```

### Business Logic Layer (Services)
```typescript
// Core business rules

class UserService {
  async create(dto: CreateUserDto): Promise<User> {
    // Business validation
    this.validateBusinessRules(dto);
    
    // Process business logic
    const hashedPassword = await this.hashPassword(dto.password);
    
    // Delegate to data layer
    const user = await this.userRepo.create({
      ...dto,
      password: hashedPassword
    });
    
    // Trigger business events
    await this.eventBus.publish('user.created', user);
    
    return user;
  }
  
  private validateBusinessRules(dto: CreateUserDto) {
    // Age restriction
    if (dto.age < 18) {
      throw new BusinessRuleError('Must be 18 or older');
    }
    
    // Email domain whitelist
    const allowedDomains = ['company.com', 'partner.com'];
    const domain = dto.email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      throw new BusinessRuleError('Email domain not allowed');
    }
  }
}
```

### Data Access Layer (Repositories)
```typescript
// Database operations

class UserRepository {
  constructor(private db: PrismaClient) {}
  
  async create(data: CreateUserData): Promise<User> {
    return this.db.user.create({ data });
  }
  
  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }
}
```

---

## Database Design

### Schema Principles
```
1. Normalization (3NF minimum)
2. Consistent naming conventions
3. Proper indexes
4. Foreign key constraints
5. Audit fields (createdAt, updatedAt)
```

### Example Schema
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  profile   Profile?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  
  @@index([email])
  @@index([createdAt])
}

model Profile {
  id       String  @id @default(uuid())
  userId   String  @unique
  user     User    @relation(fields: [userId], references: [id])
  bio      String?
  avatar   String?
  
  @@index([userId])
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([authorId])
  @@index([published])
}
```

---

## API Design

### RESTful Principles
```
1. Resource-based URLs
2. HTTP methods for operations
3. Stateless requests
4. Consistent response format
5. Proper status codes
```

### API Structure
```
GET    /api/v1/users              # List users
POST   /api/v1/users              # Create user
GET    /api/v1/users/:id          # Get user
PUT    /api/v1/users/:id          # Update user (full)
PATCH  /api/v1/users/:id          # Update user (partial)
DELETE /api/v1/users/:id          # Delete user

# Nested resources
GET    /api/v1/users/:id/posts    # Get user's posts
POST   /api/v1/users/:id/posts    # Create post for user
```

### Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid format" }
    ]
  }
}
```

---

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Server validates credentials
3. Server generates JWT token
4. Client stores token
5. Client sends token in Authorization header
6. Server validates token on each request
```

### Authorization Layers
```typescript
// Role-based access control (RBAC)

enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

const permissions = {
  USER: ['read:own', 'write:own'],
  MODERATOR: ['read:own', 'write:own', 'read:all', 'moderate'],
  ADMIN: ['read:all', 'write:all', 'delete:all', 'admin']
};

// Middleware
function requireRole(...roles: Role[]) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
app.get('/admin/users', requireRole(Role.ADMIN), adminController.listUsers);
```

---

## Caching Strategy

### Multi-Level Caching
```
1. Browser cache (static assets)
2. CDN cache (images, videos)
3. Application cache (Redis)
4. Database query cache
```

### Redis Caching Pattern
```typescript
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600) {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  }
  
  async invalidate(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Usage in service
class UserService {
  async getUser(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    let user = await cache.get<User>(cacheKey);
    
    if (!user) {
      // Cache miss - fetch from DB
      user = await userRepo.findById(id);
      if (user) {
        await cache.set(cacheKey, user, 3600); // 1 hour
      }
    }
    
    return user;
  }
  
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await userRepo.update(id, data);
    
    // Invalidate cache
    await cache.invalidate(`user:${id}`);
    
    return user;
  }
}
```

---

## Error Handling

### Error Hierarchy
```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(message: string, public details?: any[]) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }
  
  // Unknown error
  console.error(err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

---

## Scalability Considerations

### Horizontal Scaling
```
- Stateless application servers
- Session stored in Redis
- Load balancer distributes traffic
- Database read replicas
```

### Vertical Scaling
```
- Increase server resources
- Optimize queries
- Add database indexes
- Implement caching
```

### Database Scaling
```
1. Indexing
2. Query optimization
3. Read replicas
4. Sharding (if needed)
5. Connection pooling
```

---

## Monitoring & Observability

### Key Metrics
```
- Request rate (requests/second)
- Error rate (%)
- Response time (p50, p95, p99)
- Database query time
- Cache hit rate
- CPU/Memory usage
```

### Logging Strategy
```typescript
// Structured logging
logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
  requestId: req.id
});

logger.error('Payment failed', {
  userId: user.id,
  amount: payment.amount,
  error: error.message,
  stack: error.stack,
  requestId: req.id
});
```

---

## Decision Log

### ADR Template
```markdown
# ADR-XXX: [Title]

Date: YYYY-MM-DD
Status: [Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue that we're seeing that is motivating this decision]

## Decision
[What is the change that we're proposing and/or doing]

## Consequences
[What becomes easier or more difficult because of this change]

## Alternatives Considered
[What other options were evaluated]
```