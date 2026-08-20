import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  X,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Percent,
  Calendar,
  CreditCard,
  Building2,
  GraduationCap,
  Car,
  Home,
  HeartPulse,
  SunMedium
} from 'lucide-react';

const CompactLoanOptions = ({ onApplyClick, application, user }) => {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Complete, clean, visually self-explanatory loan categories
  const allLoanTypes = [
    {
      id: 'personal',
      title: 'Personal Loan',
      intentQuestion: 'Need funds for personal or family expenses?',
      illustration: '💰',
      category: 'personal',
      accentColor: 'from-blue-600/15 via-indigo-500/10 to-transparent',
      borderColor: 'border-blue-200/80 hover:border-blue-500',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      defaultBadge: 'Most Popular',
      useCases: [
        { label: 'Emergency Cash', icon: '🚨' },
        { label: 'Medical', icon: '🏥' },
        { label: 'Travel', icon: '✈️' },
        { label: 'Family Needs', icon: '👨‍👩‍👧' }
      ],
      details: {
        summary: 'Instant multi-purpose cash with zero security and 10-minute digital approval.',
        amountRange: '₹25,000 – ₹10,00,000',
        tenureRange: '3 – 60 Months',
        interestRate: 'From 10.49% p.a.',
        sampleEmi: '₹2,148 / mo per ₹1 Lakh',
        eligibility: [
          'Age: 21 to 58 years',
          'Min. Monthly Income: ₹15,000',
          'Salaried or Self-Employed'
        ]
      }
    },
    {
      id: 'home',
      title: 'Home Loan',
      intentQuestion: 'Buying or building your dream home?',
      illustration: '🏠',
      category: 'lifestyle',
      accentColor: 'from-amber-600/15 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-200/80 hover:border-amber-500',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
      defaultBadge: 'Lowest Rate',
      useCases: [
        { label: 'Buy a Home', icon: '🏠' },
        { label: 'Build House', icon: '🏗️' },
        { label: 'Renovation', icon: '🎨' }
      ],
      details: {
        summary: 'Low-interest property finance for purchasing new flats, plots, construction or home upgrades.',
        amountRange: '₹5,00,000 – ₹50,00,000',
        tenureRange: '12 – 240 Months',
        interestRate: 'From 8.50% p.a.',
        sampleEmi: '₹868 / mo per ₹1 Lakh (20 Yrs)',
        eligibility: [
          'Age: 21 to 65 years',
          'Indian Resident with clear property title',
          'Salaried or Business owner'
        ]
      }
    },
    {
      id: 'vehicle',
      title: 'Vehicle Loan',
      intentQuestion: 'Planning your next car or two-wheeler?',
      illustration: '🚗',
      category: 'lifestyle',
      accentColor: 'from-emerald-600/15 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-200/80 hover:border-emerald-500',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      defaultBadge: 'Fast Disbursal',
      useCases: [
        { label: 'Buy New Car', icon: '🚗' },
        { label: 'Used Car', icon: '🚙' },
        { label: 'Two-Wheeler', icon: '🛵' },
        { label: 'Electric EV', icon: '⚡' }
      ],
      details: {
        summary: 'Drive home your vehicle with up to 100% on-road funding, instant RC check and EV rebates.',
        amountRange: '₹50,00,00 – ₹15,00,000',
        tenureRange: '12 – 60 Months',
        interestRate: 'From 8.99% p.a.',
        sampleEmi: '₹2,075 / mo per ₹1 Lakh',
        eligibility: [
          'Age: 18 to 60 years',
          'Valid Driving License / ID',
          'Salaried or Self-employed'
        ]
      }
    },
    {
      id: 'education',
      title: 'Education Loan',
      intentQuestion: 'Funding college or career upskilling?',
      illustration: '🎓',
      category: 'career',
      accentColor: 'from-indigo-600/15 via-blue-500/10 to-transparent',
      borderColor: 'border-indigo-200/80 hover:border-indigo-500',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      defaultBadge: 'Career Boost',
      useCases: [
        { label: 'College Fees', icon: '🎓' },
        { label: 'Higher Studies', icon: '📚' },
        { label: 'Study Abroad', icon: '✈️' },
        { label: 'Tech Bootcamp', icon: '💻' }
      ],
      details: {
        summary: 'Comprehensive academic credit covering college tuition fees, books, living expenses, and overseas courses.',
        amountRange: '₹1,00,000 – ₹20,00,000',
        tenureRange: '12 – 84 Months',
        interestRate: 'From 9.25% p.a.',
        sampleEmi: '₹1,625 / mo per ₹1 Lakh (7 Yrs)',
        eligibility: [
          'Confirmed admission in recognized institution',
          'Student with Co-borrower (Parent/Guardian)',
          'No collateral up to ₹7.5 Lakhs'
        ]
      }
    },
    {
      id: 'business',
      title: 'Business Loan',
      intentQuestion: 'Growing or expanding your enterprise?',
      illustration: '🏢',
      category: 'business',
      accentColor: 'from-violet-600/15 via-purple-500/10 to-transparent',
      borderColor: 'border-violet-200/80 hover:border-violet-500',
      tagColor: 'bg-violet-50 text-violet-700 border-violet-200',
      defaultBadge: 'High Limit',
      useCases: [
        { label: 'Start Business', icon: '🏢' },
        { label: 'Expand Store', icon: '📈' },
        { label: 'Working Capital', icon: '📦' },
        { label: 'Machinery', icon: '⚙️' }
      ],
      details: {
        summary: 'Unsecured business funding based on GST cashflows and banking history with rapid disbursal.',
        amountRange: '₹1,00,000 – ₹25,00,000',
        tenureRange: '6 – 48 Months',
        interestRate: 'From 11.25% p.a.',
        sampleEmi: '₹2,600 / mo per ₹1 Lakh',
        eligibility: [
          'Min. 1 year business operation',
          'Bank statement with steady cashflow',
          'Zero collateral required'
        ]
      }
    },
    {
      id: 'solar',
      title: 'Solar & Clean Energy',
      intentQuestion: 'Switching to clean rooftop solar power?',
      illustration: '☀️',
      category: 'green',
      accentColor: 'from-lime-600/15 via-emerald-500/10 to-transparent',
      borderColor: 'border-lime-200/80 hover:border-lime-500',
      tagColor: 'bg-lime-50 text-lime-800 border-lime-200',
      defaultBadge: 'PM Subsidy',
      useCases: [
        { label: 'Rooftop Solar', icon: '☀️' },
        { label: 'Govt Subsidy', icon: '🏛️' },
        { label: 'Battery Backup', icon: '🔋' }
      ],
      details: {
        summary: 'Special low-rate financing for residential rooftop solar panels and PM Surya Ghar subsidies.',
        amountRange: '₹50,000 – ₹6,00,000',
        tenureRange: '12 – 60 Months',
        interestRate: 'From 8.50% p.a.',
        sampleEmi: '₹2,051 / mo per ₹1 Lakh',
        eligibility: [
          'Residential homeowner or villa owner',
          'Electricity bill in applicant name',
          'Direct subsidy credited to bank'
        ]
      }
    },
    {
      id: 'medical',
      title: 'Medical & Healthcare Loan',
      intentQuestion: 'Urgent hospital bills or planned surgery?',
      illustration: '🏥',
      category: 'urgent',
      accentColor: 'from-rose-600/15 via-pink-500/10 to-transparent',
      borderColor: 'border-rose-200/80 hover:border-rose-500',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
      defaultBadge: 'Zero Delay',
      useCases: [
        { label: 'Surgeries', icon: '🏥' },
        { label: 'Hospitalization', icon: '🩺' },
        { label: 'Medications', icon: '💊' },
        { label: 'Dental / Eye', icon: '👁️' }
      ],
      details: {
        summary: 'Priority express healthcare credit disbursed directly to ensure medical care proceeds without worry.',
        amountRange: '₹25,000 – ₹7,50,000',
        tenureRange: '6 – 36 Months',
        interestRate: 'From 9.99% p.a.',
        sampleEmi: '₹3,226 / mo per ₹1 Lakh',
        eligibility: [
          'Age: 21 to 60 years',
          'Medical estimation or hospital bill',
          'Immediate same-day disbursal'
        ]
      }
    },
    {
      id: 'wedding',
      title: 'Wedding & Celebration Loan',
      intentQuestion: 'Planning a grand wedding or family event?',
      illustration: '💍',
      category: 'lifestyle',
      accentColor: 'from-pink-600/15 via-rose-500/10 to-transparent',
      borderColor: 'border-pink-200/80 hover:border-pink-500',
      tagColor: 'bg-pink-50 text-pink-700 border-pink-200',
      defaultBadge: 'Milestone Events',
      useCases: [
        { label: 'Banquet Venue', icon: '🏰' },
        { label: 'Jewelry', icon: '✨' },
        { label: 'Catering', icon: '🍽️' },
        { label: 'Photography', icon: '📸' }
      ],
      details: {
        summary: 'Complete financial backing for wedding ceremonies, banquet halls, bridal jewelry, and milestone events.',
        amountRange: '₹1,00,000 – ₹15,00,000',
        tenureRange: '12 – 48 Months',
        interestRate: 'From 10.75% p.a.',
        sampleEmi: '₹2,572 / mo per ₹1 Lakh',
        eligibility: [
          'Salaried or Self-employed individuals',
          'Comfortable flexible repayment installments',
          'Staged disbursals across vendor milestones'
        ]
      }
    },
    {
      id: 'gadgets',
      title: 'Consumer Tech & Gadgets',
      intentQuestion: 'Upgrading your laptop, phone or workstation?',
      illustration: '💻',
      category: 'personal',
      accentColor: 'from-cyan-600/15 via-blue-500/10 to-transparent',
      borderColor: 'border-cyan-200/80 hover:border-cyan-500',
      tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      defaultBadge: 'Instant Token',
      useCases: [
        { label: 'MacBook & Laptop', icon: '💻' },
        { label: 'Smartphones', icon: '📱' },
        { label: 'Camera Gear', icon: '📷' },
        { label: 'Smart TV', icon: '📺' }
      ],
      details: {
        summary: 'Instant micro-credit vouchers for premium laptops, gaming rigs, iPhones, and content creation gear.',
        amountRange: '₹15,000 – ₹2,50,000',
        tenureRange: '3 – 18 Months',
        interestRate: 'From 9.99% p.a.',
        sampleEmi: '₹5,900 / mo per ₹1 Lakh (18 Mos)',
        eligibility: [
          'PAN & Aadhaar online KYC',
          'Zero-cost EMI schemes with partner merchants',
          'Digital token ready in 5 mins'
        ]
      }
    },
    {
      id: 'debt_consolidation',
      title: 'Debt Consolidation Loan',
      intentQuestion: 'Combine multiple credit cards & loans into 1 EMI?',
      illustration: '📊',
      category: 'personal',
      accentColor: 'from-purple-600/15 via-indigo-500/10 to-transparent',
      borderColor: 'border-purple-200/80 hover:border-purple-500',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      defaultBadge: 'Save Interest',
      useCases: [
        { label: 'Clear Card Dues', icon: '💳' },
        { label: 'Lower Monthly EMI', icon: '📉' },
        { label: 'Single Due Date', icon: '📅' },
        { label: 'Boost CIBIL Score', icon: '📈' }
      ],
      details: {
        summary: 'Consolidate multiple high-interest credit cards and micro-loans into a single manageable low-interest payment.',
        amountRange: '₹50,000 – ₹10,00,000',
        tenureRange: '12 – 60 Months',
        interestRate: 'From 10.99% p.a.',
        sampleEmi: '₹2,174 / mo per ₹1 Lakh',
        eligibility: [
          'Regular verifiable income source',
          'Reduces total monthly outflow significantly',
          'Instant payoff directly to outstanding lenders'
        ]
      }
    },
    {
      id: 'women_entrepreneur',
      title: 'Women Entrepreneur Loan',
      intentQuestion: 'Subsidized business funding for women founders?',
      illustration: '👩‍💼',
      category: 'business',
      accentColor: 'from-fuchsia-600/15 via-pink-500/10 to-transparent',
      borderColor: 'border-fuchsia-200/80 hover:border-fuchsia-500',
      tagColor: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      defaultBadge: '0.5% Rebate',
      useCases: [
        { label: 'Boutique & Retail', icon: '🛍️' },
        { label: 'Working Capital', icon: '💼' },
        { label: 'Artisans & Crafts', icon: '🎨' },
        { label: 'Hiring Staff', icon: '👥' }
      ],
      details: {
        summary: 'Special low-rate credit line and dedicated financial guidance exclusively for women-led startups and MSMEs.',
        amountRange: '₹50,000 – ₹10,00,000',
        tenureRange: '12 – 60 Months',
        interestRate: 'From 9.25% p.a.',
        sampleEmi: '₹2,088 / mo per ₹1 Lakh',
        eligibility: [
          'Women founder / proprietor / partner',
          'Special 0.50% interest rate rebate on on-time payments',
          'Minimal documentation requirements'
        ]
      }
    },
    {
      id: 'rental_deposit',
      title: 'Rental Deposit & Relocation',
      intentQuestion: 'Need security deposit or movers funding?',
      illustration: '🛋️',
      category: 'urgent',
      accentColor: 'from-orange-600/15 via-amber-500/10 to-transparent',
      borderColor: 'border-orange-200/80 hover:border-orange-500',
      tagColor: 'bg-orange-50 text-orange-700 border-orange-200',
      defaultBadge: 'Same Day',
      useCases: [
        { label: 'Rental Deposit', icon: '🏢' },
        { label: 'Movers & Packers', icon: '🚚' },
        { label: 'Brokerage Fees', icon: '🤝' },
        { label: 'New Furniture', icon: '🛋️' }
      ],
      details: {
        summary: 'Instant liquidity for heavy landlord rental deposits and moving costs, disbursed within 12 hours.',
        amountRange: '₹30,000 – ₹3,50,000',
        tenureRange: '6 – 24 Months',
        interestRate: 'From 10.99% p.a.',
        sampleEmi: '₹4,660 / mo per ₹1 Lakh',
        eligibility: [
          'Valid tenancy agreement or relocation letter',
          'Direct disbursal to secure home agreements',
          'Zero foreclosure charges'
        ]
      }
    }
  ];

  const categories = [
    { id: 'all', label: 'All 12 Options' },
    { id: 'personal', label: 'Personal & Lifestyle' },
    { id: 'urgent', label: 'Medical & Urgent' },
    { id: 'business', label: 'Business & MSME' },
    { id: 'career', label: 'Education & Career' },
    { id: 'green', label: 'EV & Solar Energy' }
  ];

  // Recommendation matching
  const recommendedLoanId = useMemo(() => {
    const existingType = (application?.loanType || '').toLowerCase();
    if (existingType.includes('home') || existingType.includes('renovat')) return 'home';
    if (existingType.includes('vehicle') || existingType.includes('car') || existingType.includes('wheeler')) return 'vehicle';
    if (existingType.includes('education') || existingType.includes('study')) return 'education';
    if (existingType.includes('business') || existingType.includes('msme')) return 'business';
    if (existingType.includes('solar') || existingType.includes('green')) return 'solar';
    if (existingType.includes('medical') || existingType.includes('health')) return 'medical';
    if (existingType.includes('wedding')) return 'wedding';
    if (existingType.includes('personal')) return 'personal';

    if (application?.employmentType === 'BUSINESS' || application?.employmentType === 'SELF_EMPLOYED') return 'business';

    return 'personal';
  }, [application]);

  // Filtered loan list
  const filteredLoans = useMemo(() => {
    let list = allLoanTypes;

    if (activeCategory !== 'all') {
      list = list.filter((loan) => {
        if (activeCategory === 'personal') return loan.category === 'personal' || loan.category === 'lifestyle';
        return loan.category === activeCategory;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((loan) =>
        loan.title.toLowerCase().includes(q) ||
        loan.intentQuestion.toLowerCase().includes(q) ||
        loan.useCases.some((u) => u.label.toLowerCase().includes(q))
      );
    } else if (!showAll && activeCategory === 'all') {
      // By default show top 6 featured loans
      list = list.slice(0, 6);
    }

    return list;
  }, [activeCategory, searchQuery, showAll]);

  return (
    <section id="loan-options-section" className="space-y-6">
      {/* ── SECTION HEADER & SEARCH ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Find the loan that fits your need
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              What are you planning?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your goal to view matching loan terms with zero paperwork and instant approval.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by goal (e.g. laptop, car, wedding)..."
              className="w-full pl-9.5 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setShowAll(true);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── VISUALLY SELF-EXPLANATORY CARDS GRID ── */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-700">No loan options matched "{searchQuery}"</p>
          <p className="text-xs text-slate-400">Try searching for keywords like home, medical, laptop, or car</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="text-xs font-bold text-blue-600 hover:underline pt-1 inline-block cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredLoans.map((loan) => {
            const isRecommended = loan.id === recommendedLoanId;

            return (
              <div
                key={loan.id}
                onClick={() => setSelectedLoan(loan)}
                className={`group relative bg-white rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                  isRecommended
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : `${loan.borderColor} shadow-xs`
                }`}
              >
                {/* Subtle top gradient aura */}
                <div className={`absolute inset-x-0 top-0 h-28 rounded-t-3xl bg-gradient-to-b ${loan.accentColor} pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  {/* Top Row: Large Visual Illustration & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-4xl sm:text-5xl select-none group-hover:scale-110 transition-transform duration-300">
                      {loan.illustration}
                    </div>

                    {isRecommended ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-600 text-white shadow-xs">
                        <Sparkles className="w-3 h-3" /> Recommended
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${loan.tagColor}`}>
                        {loan.defaultBadge}
                      </span>
                    )}
                  </div>

                  {/* Title & Short Intent Question */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {loan.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 leading-snug">
                      {loan.intentQuestion}
                    </p>
                  </div>

                  {/* 2-4 Small Visual Use-Case Chips */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {loan.useCases.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80 group-hover:bg-white group-hover:border-slate-300 transition-colors"
                      >
                        <span className="text-xs">{chip.icon}</span>
                        <span>{chip.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Row */}
                <div className="relative z-10 pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-600 group-hover:text-blue-600 transition-colors">
                    {loan.details.interestRate}
                  </span>

                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EXPAND / COLLAPSE ALL 12 PRODUCTS TOGGLE ── */}
      {!searchQuery && activeCategory === 'all' && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            {showAll ? 'Show Top 6 Featured Loans' : 'Explore All 12 Loan Options'}
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* ── CLEAN FINTECH DETAIL MODAL (ON CLICK) ── */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Header with Large Illustration */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="text-4xl bg-slate-100 p-3 rounded-2xl">
                  {selectedLoan.illustration}
                </div>
                <div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${selectedLoan.tagColor}`}>
                    {selectedLoan.title}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {selectedLoan.intentQuestion}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedLoan(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Typical Use-Cases */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Typical Use Cases:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedLoan.useCases.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200"
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100">
                <span className="text-[10px] text-blue-600 font-extrabold uppercase block">Amount Range</span>
                <span className="text-xs sm:text-sm font-black text-blue-950 font-mono mt-0.5 block">
                  {selectedLoan.details.amountRange}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase block">Interest Rate</span>
                <span className="text-xs sm:text-sm font-black text-emerald-950 mt-0.5 block">
                  {selectedLoan.details.interestRate}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase block">Tenure</span>
                <span className="text-xs sm:text-sm font-black text-indigo-950 mt-0.5 block">
                  {selectedLoan.details.tenureRange}
                </span>
              </div>
            </div>

            {/* Example EMI & Eligibility */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Sample Repayment EMI:</span>
                <span className="font-mono font-black text-slate-900">{selectedLoan.details.sampleEmi}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block">Eligibility Basics:</span>
                {selectedLoan.details.eligibility.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const loanTitle = selectedLoan.title;
                  setSelectedLoan(null);
                  onApplyClick(loanTitle);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                Check Eligibility & Apply <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CompactLoanOptions;
