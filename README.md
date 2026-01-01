# ClearTax - Tax & Compliance Website

A modern, animation-rich tax and compliance website built with Next.js 14, TypeScript, Tailwind CSS, GSAP, and Framer Motion.

## 🚀 Features

### Calculators
- **Income Tax Calculator** - Calculate tax liability with deductions
- **GST Calculator** - IGST/SGST/CGST breakdowns
- **EMI Calculator** - Loan planning with amortization schedules
- **HRA Calculator** - Maximize HRA exemption
- **TDS Calculator** - TDS deductions for all payment types

### Pages
- **Homepage** - Hero, stats, products grid, benefits, testimonials
- **Calculators Hub** - All calculators with search functionality
- **Compliance Dashboard** - Deadlines, documents, quick stats
- **Blog** - Featured articles, listing, and detailed post pages
- **Authentication** - Login and signup with validation
- **Contact** - Contact form with information sections

### Animations
- **GSAP ScrollTrigger** - Parallax, stagger, counters, timelines
- **Framer Motion** - Page transitions, hover effects, reveals
- **Smooth 60fps** - GPU-accelerated animations
- **Responsive** - Mobile-first design (320px to 1280px+)

### Technical Stack
- **Next.js 14** - App router, server components
- **TypeScript** - Strict mode, full type safety
- **Tailwind CSS** - Custom design system
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **GSAP** - Advanced animations
- **Framer Motion** - Component animations

## 📦 Installation

```bash
cd "/Users/vikrantchaudhary/Desktop/cleartax/cleartax frontend"
npm install
```

## 🏃 Running the Project

### Development Mode
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🎨 Design System

### Colors
- **Primary**: `#1F4E78` - Professional blue
- **Accent**: `#00A3E0` - Bright blue for CTAs
- **Light Blue**: `#E8F4FB` - Backgrounds
- **Success**: `#2ECC71` - Positive results
- **Warning**: `#F39C12` - Alerts
- **Error**: `#E74C3C` - Errors

### Typography
- **Headings**: Poppins (Bold/Semibold)
- **Body**: Inter (Regular/Medium)
- **H1**: 48px (32px mobile)
- **H2**: 36px (24px mobile)
- **Body**: 16px (14px mobile)

### Spacing
- Base unit: 8px (Tailwind default)
- Mobile padding: 16px
- Desktop padding: 32px
- Section gaps: 64-80px

## 📁 Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── calculators/
│   ├── page.tsx (hub)
│   ├── income-tax/page.tsx
│   ├── gst/page.tsx
│   ├── emi/page.tsx
│   ├── hra/page.tsx
│   └── tds/page.tsx
├── compliance/page.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/page.tsx
├── contact/page.tsx
├── components/
│   ├── common/ (Navigation, Footer, Breadcrumb)
│   ├── ui/ (Button, Input, Select, etc.)
│   ├── forms/ (FormError)
│   ├── animations/ (ScrollReveal, Counter, Stagger)
│   ├── home/ (Hero, Stats, Products, etc.)
│   ├── calculators/ (ResultsCard, Chart)
│   ├── dashboard/ (StatCard, Timeline, Table)
│   └── blog/ (BlogCard, RelatedPosts)
├── lib/
│   ├── calculations/ (All calculator logic)
│   ├── schemas/ (Zod validation)
│   └── animations/ (GSAP/Framer configs)
├── data/
│   ├── blog.ts (Mock blog posts)
│   └── compliance.ts (Mock compliance data)
├── types/ (TypeScript interfaces)
├── layout.tsx (Root layout with fonts)
├── page.tsx (Homepage)
└── globals.css
```

## 🧮 Calculator Logic

All calculations are client-side:
- **Income Tax**: Tax slabs, deductions, surcharge, cess
- **GST**: Add/remove GST, B2B/B2C, IGST/SGST/CGST
- **EMI**: Monthly EMI, amortization, prepayment scenarios
- **HRA**: Metro/non-metro, exemption calculation
- **TDS**: Multiple TDS types, PAN/non-PAN rates

## 🎭 Animations

### GSAP ScrollTrigger
- Parallax backgrounds on hero sections
- Staggered grid card animations
- Counter animations for stats
- Timeline animations for benefits section

### Framer Motion
- Page route transitions (fade + slide)
- Card hover effects (scale + shadow)
- Button tap interactions
- Form field reveals and validations

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Color contrast ratios (4.5:1 minimum)
- Alt text on all images
- Proper heading hierarchy

## 📱 Responsive Design

Breakpoints:
- **Mobile**: 320px+ (base styles)
- **Tablet**: 768px+ (md:)
- **Desktop**: 1024px+ (lg:)
- **Large Desktop**: 1280px+ (xl:)

All layouts are mobile-first and stack vertically on smaller screens.

## 🔒 Form Validation

All forms use React Hook Form + Zod:
- Real-time validation
- Custom error messages
- Type-safe schemas
- Client-side validation only (no backend yet)

## 📊 Data Visualization

Using Recharts with GSAP animations:
- Bar charts (tax breakdowns)
- Pie charts (GST distribution)
- Line charts (EMI over time)
- Animated chart entrances

## 🚦 Performance

- GPU-accelerated animations (transform/opacity)
- Lazy loading for heavy components
- Code splitting by route
- Optimized images with next/image
- Smooth 60fps animations

## 🎯 Future Enhancements

- Backend API integration
- User authentication (JWT)
- Data persistence (database)
- PDF export functionality
- Email notifications
- Payment gateway integration
- Advanced analytics dashboard

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Built with ❤️ for modern tax compliance

---

**Note**: This is a frontend-only implementation. All calculations are client-side and data is stored in component state or localStorage.

