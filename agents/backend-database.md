# Backend Database Guidelines

> Database design, optimization, and best practices

---

## Database Configuration

### Prisma Setup
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Connection Configuration
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  errorFormat: 'pretty',
});

// Connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  // Add to DATABASE_URL: ?connection_limit=10&pool_timeout=20
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
```

---

## Schema Design Principles

### Standard Fields
```prisma
// Every model should have these fields
model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // For soft deletes
  
  // Your fields here
}
```

### Naming Conventions
```prisma
// ✅ Good: Singular, PascalCase
model User { }
model Post { }
model UserProfile { }

// ❌ Bad: Plural, snake_case
model users { }
model user_profiles { }
```

### Relationships
```prisma
// One-to-One
model User {
  id      String   @id @default(uuid())
  profile Profile?
}

model Profile {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

// One-to-Many
model User {
  id    String @id @default(uuid())
  posts Post[]
}

model Post {
  id       String @id @default(uuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
  
  @@index([authorId])
}

// Many-to-Many
model Post {
  id   String @id @default(uuid())
  tags Tag[]  @relation("PostTags")
}

model Tag {
  id    String @id @default(uuid())
  posts Post[] @relation("PostTags")
}
```

---

## Indexing Strategy

### When to Add Indexes
```prisma
model User {
  id       String   @id @default(uuid())
  email    String   @unique // Automatically indexed
  username String
  status   String
  country  String
  createdAt DateTime @default(now())
  
  // Add indexes for:
  // 1. Foreign keys
  @@index([status]) // Frequently filtered
  
  // 2. Search fields
  @@index([username]) // User lookups
  
  // 3. Sorting fields
  @@index([createdAt]) // Time-based queries
  
  // 4. Composite indexes
  @@index([country, status]) // Combined filters
  
  // 5. Partial indexes (PostgreSQL)
  @@index([email], where: "deletedAt IS NULL")
}
```

### Index Types
```sql
-- B-tree (default, good for =, <, >, <=, >=)
CREATE INDEX idx_users_email ON users(email);

-- Hash (only for =, faster but limited)
CREATE INDEX idx_users_api_key ON users USING HASH (api_key);

-- GIN (good for arrays, JSONB, full-text)
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

-- Full-text search
CREATE INDEX idx_posts_content ON posts USING GIN (to_tsvector('english', content));
```

---

## Query Optimization

### Select Only Needed Fields
```typescript
// ❌ Bad: Fetches all fields
const users = await prisma.user.findMany();

// ✅ Good: Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
});
```

### Avoid N+1 Queries
```typescript
// ❌ Bad: N+1 query problem
const posts = await prisma.post.findMany();
for (const post of posts) {
  post.author = await prisma.user.findUnique({
    where: { id: post.authorId }
  });
}

// ✅ Good: Use include
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: {
        id: true,
        name: true
      }
    }
  }
});

// ✅ Better: Use select with relations
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    author: {
      select: {
        id: true,
        name: true
      }
    }
  }
});
```

### Batch Operations
```typescript
// ❌ Bad: Multiple individual queries
for (const userId of userIds) {
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'active' }
  });
}

// ✅ Good: Batch update
await prisma.user.updateMany({
  where: {
    id: { in: userIds }
  },
  data: { status: 'active' }
});
```

---

## Transactions

### Basic Transaction
```typescript
async function transferFunds(fromId: string, toId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    // Deduct from sender
    await tx.account.update({
      where: { userId: fromId },
      data: { balance: { decrement: amount } }
    });
    
    // Add to receiver
    await tx.account.update({
      where: { userId: toId },
      data: { balance: { increment: amount } }
    });
    
    // Record transaction
    await tx.transaction.create({
      data: {
        fromId,
        toId,
        amount,
        type: 'TRANSFER'
      }
    });
  });
}
```

### Transaction with Isolation Level
```typescript
await prisma.$transaction(
  async (tx) => {
    // Your queries
  },
  {
    isolationLevel: 'Serializable', // or 'ReadCommitted', 'RepeatableRead'
    maxWait: 5000, // 5 seconds
    timeout: 10000 // 10 seconds
  }
);
```

### Interactive Transactions
```typescript
async function createUserWithRetry(userData: CreateUserDto) {
  return prisma.$transaction(async (tx) => {
    // Check if email exists
    const existing = await tx.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existing) {
      throw new ConflictError('Email already exists');
    }
    
    // Create user
    const user = await tx.user.create({ data: userData });
    
    // Create profile
    await tx.profile.create({
      data: {
        userId: user.id,
        bio: ''
      }
    });
    
    return user;
  });
}
```

---

## Migrations

### Creating Migrations
```bash
# Create migration
npx prisma migrate dev --name add_user_status

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Migration Best Practices
```sql
-- migrations/20240301_add_user_status.sql

-- Step 1: Add column as nullable
ALTER TABLE "User" ADD COLUMN "status" TEXT;

-- Step 2: Set default for existing rows
UPDATE "User" SET "status" = 'active' WHERE "status" IS NULL;

-- Step 3: Make column required
ALTER TABLE "User" ALTER COLUMN "status" SET NOT NULL;

-- Step 4: Add default for new rows
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'active';

-- Step 5: Add index
CREATE INDEX "User_status_idx" ON "User"("status");
```

### Rollback Strategy
```sql
-- Down migration
-- migrations/20240301_add_user_status.down.sql

DROP INDEX IF EXISTS "User_status_idx";
ALTER TABLE "User" DROP COLUMN IF EXISTS "status";
```

---

## Soft Deletes

### Implementation
```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  deletedAt DateTime?
  
  // Ensure deleted users don't conflict
  @@unique([email, deletedAt])
}
```

### Soft Delete Middleware
```typescript
// Automatically filter soft-deleted records
prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where = {
        ...params.args.where,
        deletedAt: null
      };
    }
    
    if (params.action === 'findMany') {
      if (params.args.where) {
        if (!params.args.where.deletedAt) {
          params.args.where.deletedAt = null;
        }
      } else {
        params.args.where = { deletedAt: null };
      }
    }
    
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
  }
  
  return next(params);
});
```

---

## Full-Text Search

### PostgreSQL Full-Text Search
```prisma
model Post {
  id      String @id @default(uuid())
  title   String
  content String @db.Text
  
  @@index([title, content], type: Gin)
}
```

```typescript
// Raw SQL for full-text search
async function searchPosts(query: string) {
  return prisma.$queryRaw`
    SELECT id, title, content,
      ts_rank(to_tsvector('english', title || ' ' || content),
              to_tsquery('english', ${query})) as rank
    FROM "Post"
    WHERE to_tsvector('english', title || ' ' || content)
      @@ to_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT 10
  `;
}
```

---

## Database Seeding

### Seed Script
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN'
    }
  });
  
  console.log('Created admin:', admin);
  
  // Create test users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        password: await bcrypt.hash('password123', 10),
        role: 'USER'
      }
    });
    users.push(user);
  }
  
  console.log(`Created ${users.length} test users`);
  
  // Create posts
  for (const user of users.slice(0, 3)) {
    await prisma.post.createMany({
      data: [
        {
          title: `Post 1 by ${user.name}`,
          content: 'Lorem ipsum dolor sit amet...',
          authorId: user.id,
          published: true
        },
        {
          title: `Post 2 by ${user.name}`,
          content: 'Consectetur adipiscing elit...',
          authorId: user.id,
          published: false
        }
      ]
    });
  }
  
  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## Database Backup & Recovery

### Automated Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="myapp"

# Create backup
pg_dump $DATABASE_URL -F c -f "$BACKUP_DIR/backup_$DATE.dump"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.dump" -mtime +7 -delete

echo "Backup completed: backup_$DATE.dump"
```

### Restore from Backup
```bash
# Restore from dump
pg_restore -d myapp backup_20240301_120000.dump

# Or from SQL
psql myapp < backup_20240301_120000.sql
```

---

## Performance Monitoring

### Query Logging
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query'
    }
  ]
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Slower than 1 second
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params
    });
  }
});
```

### Connection Pool Monitoring
```typescript
// Monitor connection pool
setInterval(() => {
  const poolMetrics = prisma.$metrics.json();
  
  console.log('Pool metrics:', {
    activeConnections: poolMetrics.activeConnections,
    idleConnections: poolMetrics.idleConnections,
    waitingRequests: poolMetrics.waitingRequests
  });
}, 60000); // Every minute
```

---

## Common Patterns

### Pagination with Cursor
```typescript
async function getPaginatedPosts(cursor?: string, limit = 20) {
  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1
    }),
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { id: true, name: true }
      }
    }
  });
  
  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  
  return { data, nextCursor, hasMore };
}
```

### Atomic Counter
```typescript
// Increment view count atomically
async function incrementViewCount(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: {
      viewCount: { increment: 1 }
    }
  });
}
```

### Upsert Pattern
```typescript
// Create or update
async function saveUserProfile(userId: string, data: ProfileData) {
  return prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data
    }
  });
}
```

---

## Database Security

### Row-Level Security (PostgreSQL)
```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY user_isolation ON "User"
  USING (id = current_setting('app.user_id')::uuid);
```

### Prevent SQL Injection
```typescript
// ✅ Always use parameterized queries
await prisma.$queryRaw`
  SELECT * FROM "User" WHERE email = ${email}
`;

// ❌ Never concatenate user input
// await prisma.$queryRawUnsafe(`SELECT * FROM User WHERE email = '${email}'`);
```

### Sensitive Data
```prisma
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  password String  // Always hashed
  ssn      String? // Consider encryption at app level
  
  // Never log sensitive fields
  @@map("users")
}
```

---

## Troubleshooting

### Connection Issues
```typescript
// Test connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}
```

### Lock Timeouts
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Kill blocking query
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle in transaction'
  AND state_change < now() - interval '10 minutes';
```

### Reset Database (Development)
```bash
# Drop all data and reapply migrations
npx prisma migrate reset

# Or manually
npx prisma migrate reset --skip-seed
npx prisma db seed
```