# API Integration Guide

This guide explains how to use the API services in your frontend components.

## ✅ Updated Configuration

- **Base URL**: `http://localhost:4000/api` (matches backend)
- **All endpoints**: Updated to match backend API structure
- **Types**: Synchronized with backend TypeScript definitions

## 📦 Available Services

### 1. Blog Service (`blogService`)

```typescript
import { blogService } from '@/app/lib/api';

// Get all blogs with filters
const blogs = await blogService.getAll({
  page: 1,
  limit: 10,
  category: 'Income Tax',
  search: 'tax',
  featured: true,
  sortBy: 'date',
  sortOrder: 'desc'
});

// Get featured blog
const featured = await blogService.getFeatured();

// Get recent blogs
const recent = await blogService.getRecent(6);

// Get blog by slug
const blog = await blogService.getBySlug('income-tax-slabs-fy-2024');

// Get related blogs
const related = await blogService.getRelated('income-tax-slabs-fy-2024', 3);

// Create blog (admin)
const newBlog = await blogService.create({
  title: 'New Blog Post',
  category: 'GST',
  author: { name: 'Author', avatar: '👨‍💼' },
  date: '2024-01-15',
  readTime: '5 min read',
  excerpt: 'Short description',
  content: '<h2>Full HTML content</h2>',
  image: 'https://example.com/image.jpg',
  featured: false
});
```

### 2. Service Service (`serviceService`)

```typescript
import { serviceService } from '@/app/lib/api';

// Get all services
const services = await serviceService.getAll({
  page: 1,
  limit: 10,
  category: 'GST',
  search: 'registration'
});

// Get all categories
const categories = await serviceService.getCategories();

// Get category by ID
const category = await serviceService.getCategoryById('gst');

// Get services by category
const gstServices = await serviceService.getByCategory('gst');

// Get specific service
const service = await serviceService.getByCategoryAndSlug('gst', 'registration');

// Create service category (admin)
const newCategory = await serviceService.createCategory({
  id: 'new-category',
  title: 'New Category',
  description: 'Description',
  iconName: 'IconName',
  heroTitle: 'Hero Title',
  heroDescription: 'Hero Description',
  categoryType: 'simple'
});
```

### 3. Inquiry Service (`inquiryService`)

```typescript
import { inquiryService } from '@/app/lib/api';

// Create inquiry
const inquiry = await inquiryService.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
  businessType: 'proprietorship',
  message: 'I need help with GST registration',
  sourcePage: '/services/gst/registration',
  type: 'callback',
  serviceId: 'service-id-here'
});

// Get all inquiries (admin)
const inquiries = await inquiryService.getAll({
  page: 1,
  limit: 20,
  type: 'callback',
  status: 'pending',
  sourcePage: '/services/gst',
  search: 'john',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Get statistics (admin)
const stats = await inquiryService.getStats();

// Export to Excel (admin)
const blob = await inquiryService.export({ type: 'callback' });
// Then download the blob
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'inquiries.xlsx';
a.click();
```

### 4. Team Service (`teamService`)

```typescript
import { teamService } from '@/app/lib/api';

// Get all team members
const members = await teamService.getAll();

// Get team member by ID
const member = await teamService.getById('ananya-mehta');

// Create team member (admin)
const newMember = await teamService.create({
  id: 'new-member',
  name: 'John Doe',
  role: 'Senior Developer',
  description: 'Description here',
  linkedin: 'https://linkedin.com/in/johndoe',
  avatar: 'https://example.com/avatar.jpg',
  accent: 'from-blue-400 to-cyan-500'
});
```

### 5. Compliance Service (`complianceService`)

```typescript
import { complianceService } from '@/app/lib/api';

// Get deadlines
const deadlines = await complianceService.getDeadlines({
  page: 1,
  limit: 10,
  status: 'urgent',
  category: 'GST'
});

// Get upcoming deadlines
const upcoming = await complianceService.getUpcomingDeadlines(10);

// Upload document
const file = // File from input
const document = await complianceService.uploadDocument(file, {
  name: 'GSTR-3B_March_2024.pdf',
  type: 'GST Return',
  uploadDate: new Date().toISOString()
});

// Get documents
const documents = await complianceService.getDocuments({
  page: 1,
  limit: 10,
  status: 'verified'
});

// Get statistics
const stats = await complianceService.getStats();
```

### 6. Calculator Service (`calculatorService`)

```typescript
import { calculatorService } from '@/app/lib/api';

// Calculate Income Tax
const incomeTaxResult = await calculatorService.calculateIncomeTax({
  financialYear: '2023-24',
  incomeType: 'salary',
  grossIncome: 1000000,
  age: 35,
  deductions: {
    section80C: 150000,
    section80D: 25000,
    section80E: 0,
    others: 0
  },
  state: 'Maharashtra',
  surcharge: false
});

// Calculate GST
const gstResult = await calculatorService.calculateGST({
  calculationType: 'add',
  amount: 10000,
  gstRate: 18,
  transactionType: 'b2b',
  interstate: false
});

// Calculate EMI
const emiResult = await calculatorService.calculateEMI({
  loanAmount: 5000000,
  interestRate: 8.5,
  loanDuration: 240,
  loanType: 'home',
  processingFee: 5000,
  insurance: 1000,
  prepayment: 100000
});

// Calculate HRA
const hraResult = await calculatorService.calculateHRA({
  basicSalary: 500000,
  da: 100000,
  hraReceived: 200000,
  cityType: 'metro',
  rentPaid: 300000,
  spouseIncome: 0
});

// Calculate TDS
const tdsResult = await calculatorService.calculateTDS({
  tdsType: 'salary',
  amount: 500000,
  hasPAN: true,
  financialYear: '2023-24',
  quarter: 'Q1',
  specialCategory: false
});

// Get calculation history (authenticated users)
const history = await calculatorService.getHistory();
```

## 🔄 Migration from localStorage

### Before (localStorage):
```typescript
import { getBlogs, saveBlog } from '@/app/lib/admin/blogStorage';

const blogs = getBlogs();
saveBlog(blog);
```

### After (API):
```typescript
import { blogService } from '@/app/lib/api';

const blogs = await blogService.getAll();
await blogService.create(blog);
```

## ⚠️ Important Notes

1. **Error Handling**: All services throw errors that should be caught:
   ```typescript
   try {
     const blogs = await blogService.getAll();
   } catch (error) {
     console.error('Failed to fetch blogs:', error);
     // Handle error (show toast, fallback UI, etc.)
   }
   ```

2. **Loading States**: Use React state for loading:
   ```typescript
   const [loading, setLoading] = useState(false);
   const [blogs, setBlogs] = useState<BlogPost[]>([]);

   useEffect(() => {
     const fetchBlogs = async () => {
       setLoading(true);
       try {
         const response = await blogService.getAll();
         setBlogs(response.data);
       } catch (error) {
         console.error(error);
       } finally {
         setLoading(false);
       }
     };
     fetchBlogs();
   }, []);
   ```

3. **Pagination**: Services return paginated responses:
   ```typescript
   const response = await blogService.getAll({ page: 1, limit: 10 });
   // response.data = BlogPost[]
   // response.pagination = { page, limit, total, totalPages }
   ```

4. **Type Safety**: All services are fully typed. Use TypeScript for better IDE support.

5. **Environment Variables**: Set `NEXT_PUBLIC_API_URL` in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

## 🚀 Next Steps

1. Replace all `localStorage` calls with API service calls
2. Add error handling and loading states
3. Update components to use async/await
4. Test all API integrations
5. Add authentication when ready (tokens will be auto-added via interceptors)

## 📝 Example: Updating a Component

### Before:
```typescript
'use client';
import { getBlogs } from '@/app/lib/admin/blogStorage';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  
  useEffect(() => {
    setBlogs(getBlogs());
  }, []);
  
  // ...
}
```

### After:
```typescript
'use client';
import { blogService } from '@/app/lib/api';
import { BlogPost } from '@/app/lib/api/types';

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogService.getAll({ page: 1, limit: 10 });
        setBlogs(response.data);
      } catch (err) {
        setError('Failed to load blogs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // ...
}
```



