# API Services Documentation

This directory contains all API service files for communicating with the backend.

## Structure

```
api/
├── config.ts              # API configuration (base URL, timeout, etc.)
├── types.ts               # TypeScript type definitions
├── axios.ts               # Axios instance with interceptors
├── services/              # Individual service modules
│   ├── blog.service.ts
│   ├── service.service.ts
│   ├── inquiry.service.ts
│   ├── team.service.ts
│   ├── compliance.service.ts
│   └── calculator.service.ts
└── index.ts               # Main export file
```

## Setup

1. **Set Environment Variable**
   - Create a `.env.local` file in the root directory
   - Add: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
   - Update with your actual backend URL

2. **Import Services**
   ```typescript
   import { blogService, inquiryService } from '@/app/lib/api';
   ```

## Usage Examples

### Blog Service
```typescript
import { blogService } from '@/app/lib/api';

// Get all blogs
const blogs = await blogService.getAll({ page: 1, limit: 10 });

// Get featured blog
const featured = await blogService.getFeatured();

// Get blog by slug
const blog = await blogService.getBySlug('income-tax-slabs-fy-2024');

// Create blog (admin)
const newBlog = await blogService.create({
  slug: 'new-blog',
  title: 'New Blog Post',
  // ... other fields
});
```

### Inquiry Service
```typescript
import { inquiryService } from '@/app/lib/api';

// Create inquiry
const inquiry = await inquiryService.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 9876543210',
  interest: 'GST Services',
  sourcePage: '/services/gst',
  type: 'callback',
});

// Get all inquiries (admin)
const inquiries = await inquiryService.getAll({
  page: 1,
  limit: 20,
  type: 'callback',
});
```

### Calculator Service
```typescript
import { calculatorService } from '@/app/lib/api';

// Calculate income tax
const result = await calculatorService.calculateIncomeTax({
  financialYear: '2023-24',
  incomeType: 'salary',
  grossIncome: 1000000,
  // ... other fields
});
```

### Service Service
```typescript
import { serviceService } from '@/app/lib/api';

// Get all services
const services = await serviceService.getAll();

// Get services by category
const gstServices = await serviceService.getByCategory('gst');

// Get specific service
const service = await serviceService.getByCategoryAndSlug('gst', 'registration');
```

## Error Handling

All services throw errors that can be caught:

```typescript
import { ApiError } from '@/app/lib/api';

try {
  const blog = await blogService.getBySlug('some-slug');
} catch (error) {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    console.error(apiError.message);
    if (apiError.errors) {
      // Handle validation errors
    }
  }
}
```

## Response Format

All API responses follow this format:

```typescript
{
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Authentication

Currently, authentication is not required. When authentication is implemented:

1. Tokens will be automatically added to requests via interceptors
2. Tokens are stored in `localStorage` as `authToken`
3. On 401 errors, tokens are automatically cleared

## File Uploads

For file uploads (e.g., compliance documents):

```typescript
import { complianceService } from '@/app/lib/api';

const file = // File object from input
const document = await complianceService.uploadDocument(file, {
  name: 'Document Name',
  type: 'GST Return',
});
```

## Notes

- All services return promises
- Services handle errors internally and return null/empty arrays when appropriate
- Pagination is supported where applicable
- Query parameters are automatically URL-encoded

