export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'income-tax-slabs-fy-2024',
    title: 'Complete Guide to Income Tax Slabs for FY 2023-24',
    category: 'Income Tax',
    author: {
      name: 'Priya Sharma',
      avatar: '👩‍💼',
    },
    date: '2024-03-15',
    readTime: '8 min read',
    excerpt: 'Understand the new income tax slabs, exemptions, and how to optimize your tax savings for Financial Year 2023-24 with our comprehensive guide.',
    content: `
      <h2>Understanding India's Tax Structure for FY 2023-24</h2>
      <p>The Finance Act 2023 introduced significant changes to the income tax structure in India. Taxpayers now have the option to choose between the old tax regime with deductions and the new simplified tax regime. This comprehensive guide will help you understand both options and make an informed decision.</p>
      
      <h3>New Tax Regime - Tax Slabs for FY 2023-24</h3>
      <p>The new tax regime offers lower tax rates but eliminates most deductions and exemptions. Here's a detailed breakdown of the tax slabs:</p>
      <ul>
        <li><strong>Up to ₹3 lakhs:</strong> Nil (completely tax-free)</li>
        <li><strong>₹3 - ₹6 lakhs:</strong> 5% (₹15,000 max tax)</li>
        <li><strong>₹6 - ₹9 lakhs:</strong> 10% (₹30,000 on this slab)</li>
        <li><strong>₹9 - ₹12 lakhs:</strong> 15% (₹45,000 on this slab)</li>
        <li><strong>₹12 - ₹15 lakhs:</strong> 20% (₹60,000 on this slab)</li>
        <li><strong>Above ₹15 lakhs:</strong> 30% on income exceeding ₹15 lakhs</li>
      </ul>
      
      <h3>Old Tax Regime - Key Deductions</h3>
      <p>The old regime continues to offer various deductions that can significantly reduce your taxable income:</p>
      <ul>
        <li><strong>Section 80C:</strong> Investments up to ₹1.5 lakhs (PPF, ELSS, Life Insurance, etc.)</li>
        <li><strong>Section 80D:</strong> Health insurance premiums up to ₹25,000 (₹50,000 for senior citizens)</li>
        <li><strong>Section 80E:</strong> Education loan interest (no upper limit)</li>
        <li><strong>HRA Exemption:</strong> For salaried employees paying rent</li>
        <li><strong>Standard Deduction:</strong> ₹50,000 for salaried individuals</li>
      </ul>
      
      <h3>Tax Slabs Under Old Regime</h3>
      <p>The old regime has higher tax rates but allows for various deductions:</p>
      <ul>
        <li><strong>Up to ₹2.5 lakhs:</strong> Nil</li>
        <li><strong>₹2.5 - ₹5 lakhs:</strong> 5%</li>
        <li><strong>₹5 - ₹10 lakhs:</strong> 20%</li>
        <li><strong>Above ₹10 lakhs:</strong> 30%</li>
      </ul>
      
      <h3>Comparative Analysis</h3>
      <p>Let's compare both regimes with an example of ₹10 lakh annual income:</p>
      <p><strong>New Regime:</strong> Total tax approximately ₹75,000</p>
      <p><strong>Old Regime (with ₹1.5L deductions):</strong> Total tax approximately ₹62,500</p>
      
      <h3>Which Regime Should You Choose?</h3>
      <p>Your choice depends on your eligible deductions:</p>
      <ul>
        <li><strong>Choose New Regime if:</strong> You have minimal deductions, don't have home loan or significant investments</li>
        <li><strong>Choose Old Regime if:</strong> You claim significant deductions under 80C, 80D, HRA, or have a home loan</li>
      </ul>
      
      <h3>How to Calculate Your Tax</h3>
      <p>Use our <a href="/calculators/income-tax" style="color: #00A3E0; text-decoration: underline;">Income Tax Calculator</a> to compare both regimes and make an informed decision. The calculator will help you determine which regime is more beneficial based on your income and deductions.</p>
      
      <h3>Important Deadlines</h3>
      <p>Remember these key dates for FY 2023-24:</p>
      <ul>
        <li><strong>June 15, 2024:</strong> Last date for filing ITR for businesses</li>
        <li><strong>July 31, 2024:</strong> Last date for filing ITR for individuals</li>
        <li><strong>December 31, 2024:</strong> Last date for filing revised/belated returns</li>
      </ul>
      
      <h3>Pro Tips for Tax Savings</h3>
      <ol>
        <li>Start tax planning at the beginning of the financial year</li>
        <li>Maintain proper documentation for all deductions</li>
        <li>Consider tax-saving investments like ELSS mutual funds</li>
        <li>Don't forget to claim employer-provided benefits like LTA, food coupons</li>
        <li>File your returns before the deadline to avoid penalties</li>
      </ol>
      
      <p><strong>Disclaimer:</strong> This article is for informational purposes only. Please consult a certified tax professional for personalized advice.</p>
    `,
    image: '/images/blog-tax-slabs.jpg',
    featured: true,
  },
  {
    id: '2',
    slug: 'gst-compliance-small-business',
    title: 'GST Compliance Checklist for Small Businesses',
    category: 'GST',
    author: {
      name: 'Rahul Verma',
      avatar: '👨‍💻',
    },
    date: '2024-03-10',
    readTime: '6 min read',
    excerpt: 'A complete checklist to ensure your small business stays GST compliant. Learn about filing deadlines, invoice requirements, and common mistakes to avoid.',
    content: `
      <h2>Understanding GST Compliance</h2>
      <p>GST compliance is crucial for small businesses to avoid penalties and maintain smooth operations. This guide covers all essential aspects.</p>
      
      <h3>Monthly GST Filing Deadlines</h3>
      <ul>
        <li>GSTR-1: 11th of next month</li>
        <li>GSTR-3B: 20th of next month</li>
        <li>GSTR-9: Annual return by 31st December</li>
      </ul>
      
      <h3>Invoice Requirements</h3>
      <p>Proper invoicing is critical for ITC claims. Ensure all invoices include GSTIN, HSN/SAC codes, and tax breakdown.</p>
      
      <h3>Common Mistakes to Avoid</h3>
      <p>Late filing, incorrect GSTIN, missing invoice details, and improper ITC claims are common errors that can lead to penalties.</p>
    `,
    image: '/images/blog-gst-compliance.jpg',
    featured: false,
  },
  {
    id: '3',
    slug: 'maximize-home-loan-tax-benefits',
    title: 'How to Maximize Tax Benefits on Your Home Loan',
    category: 'Tax Planning',
    author: {
      name: 'Anjali Gupta',
      avatar: '👩‍🎓',
    },
    date: '2024-03-05',
    readTime: '7 min read',
    excerpt: 'Learn how to claim deductions up to ₹3.5 lakhs on your home loan under various sections of the Income Tax Act and reduce your tax liability significantly.',
    content: `
      <h2>Tax Benefits on Home Loans</h2>
      <p>Home loans offer significant tax benefits under multiple sections of the Income Tax Act, helping you save lakhs in taxes.</p>
      
      <h3>Section 24: Interest Deduction</h3>
      <p>Claim up to ₹2 lakhs deduction on interest paid for a self-occupied property. For let-out properties, there's no upper limit.</p>
      
      <h3>Section 80C: Principal Repayment</h3>
      <p>Principal repayment qualifies for deduction up to ₹1.5 lakhs under Section 80C, along with other investments like PPF and ELSS.</p>
      
      <h3>Section 80EEA: Additional Benefit</h3>
      <p>First-time homebuyers can claim an additional ₹1.5 lakhs deduction on interest for properties valued up to ₹45 lakhs.</p>
      
      <h3>Planning Tips</h3>
      <p>Time your home purchase and loan sanction strategically to maximize tax benefits across financial years.</p>
    `,
    image: '/images/blog-home-loan.jpg',
    featured: false,
  },
  {
    id: '4',
    slug: 'tds-on-salary-explained',
    title: 'TDS on Salary: What Employees Need to Know',
    category: 'TDS',
    author: {
      name: 'Vikram Singh',
      avatar: '👨‍💼',
    },
    date: '2024-02-28',
    readTime: '5 min read',
    excerpt: 'Complete guide to understanding TDS deductions from your salary, Form 16, tax exemptions, and how to claim refunds if excess TDS is deducted.',
    content: `
      <h2>Understanding TDS on Salary</h2>
      <p>Tax Deducted at Source (TDS) on salary is deducted by your employer based on your estimated annual income and applicable tax slabs.</p>
      
      <h3>How TDS is Calculated</h3>
      <p>Your employer considers your basic salary, allowances, perquisites, and declared investments to calculate monthly TDS deductions.</p>
      
      <h3>Form 16: Your TDS Certificate</h3>
      <p>Form 16 is issued by your employer showing total income, deductions claimed, and TDS deducted. It's essential for ITR filing.</p>
      
      <h3>Reducing TDS Burden</h3>
      <p>Submit investment proofs under Section 80C, 80D, and HRA details to your employer to reduce monthly TDS deductions.</p>
      
      <h3>Claiming TDS Refund</h3>
      <p>If excess TDS is deducted, file your ITR to claim refund. Ensure all details in Form 26AS match your Form 16.</p>
    `,
    image: '/images/blog-tds-salary.jpg',
    featured: false,
  },
  {
    id: '5',
    slug: 'hra-exemption-calculation',
    title: 'HRA Exemption: How to Calculate and Claim',
    category: 'Tax Saving',
    author: {
      name: 'Meera Reddy',
      avatar: '👩‍💻',
    },
    date: '2024-02-20',
    readTime: '6 min read',
    excerpt: 'Detailed guide on HRA exemption calculation with examples. Learn metro vs non-metro differences and documentation required for claiming HRA benefits.',
    content: `
      <h2>HRA Exemption Calculation</h2>
      <p>House Rent Allowance (HRA) exemption is one of the most beneficial tax-saving options for salaried individuals living in rented accommodation.</p>
      
      <h3>Three-Step Calculation</h3>
      <p>HRA exemption is the minimum of:</p>
      <ol>
        <li>Actual HRA received</li>
        <li>50% of salary (40% for non-metro) </li>
        <li>Rent paid minus 10% of salary</li>
      </ol>
      
      <h3>Metro vs Non-Metro Cities</h3>
      <p>Metro cities (Delhi, Mumbai, Kolkata, Chennai) allow 50% deduction while others get 40%.</p>
      
      <h3>Documentation Required</h3>
      <p>Keep rent receipts, rental agreement, and landlord's PAN (for annual rent above ₹1 lakh) ready for verification.</p>
      
      <h3>Living with Parents</h3>
      <p>Yes, you can claim HRA even if living with parents by paying them rent, provided proper documentation is maintained.</p>
    `,
    image: '/images/blog-hra-exemption.jpg',
    featured: false,
  },
  {
    id: '6',
    slug: 'emi-calculator-guide',
    title: 'Using EMI Calculator to Plan Your Loan Better',
    category: 'Financial Planning',
    author: {
      name: 'Arjun Malhotra',
      avatar: '👨‍🏫',
    },
    date: '2024-02-15',
    readTime: '5 min read',
    excerpt: 'Master the art of loan planning with EMI calculators. Understand how interest rates and tenure affect your monthly payments and total interest cost.',
    content: `
      <h2>Why Use an EMI Calculator?</h2>
      <p>An EMI calculator helps you plan your loan by showing exact monthly payments, total interest, and comparing different loan scenarios.</p>
      
      <h3>Key Factors Affecting EMI</h3>
      <ul>
        <li>Loan Amount: Principal borrowed</li>
        <li>Interest Rate: Annual percentage</li>
        <li>Tenure: Loan duration in months</li>
      </ul>
      
      <h3>Shorter vs Longer Tenure</h3>
      <p>Shorter tenure means higher EMI but lower total interest. Longer tenure reduces EMI but increases total cost significantly.</p>
      
      <h3>Prepayment Benefits</h3>
      <p>Making prepayments or increasing EMI by small amounts can save lakhs in interest and reduce loan tenure substantially.</p>
      
      <h3>Comparing Loan Offers</h3>
      <p>Use our EMI calculator to compare offers from different banks and choose the most cost-effective option.</p>
    `,
    image: '/images/blog-emi-calculator.jpg',
    featured: false,
  },
];

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find(post => post.featured);
}

export function getRecentPosts(limit: number = 6): BlogPost[] {
  return blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];
  
  return blogPosts
    .filter(post => post.slug !== currentSlug && post.category === currentPost.category)
    .slice(0, limit);
}

