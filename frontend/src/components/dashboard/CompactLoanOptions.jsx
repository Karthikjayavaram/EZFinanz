import React, { useState } from 'react';
import {
  ArrowRight,
  X,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const CompactLoanOptions = ({ onApplyClick }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const options = [
    {
      id: 'personal',
      title: 'Personal Loan',
      tagline: 'Flexible funds for everyday personal & emergency needs',
      icon: '💰',
      badge: 'Multi-Purpose',
      category: 'personal',
      maxAmount: '₹10,00,000',
      tenure: '3 – 60 Months',
      interestRate: 'From 10.49% p.a.',
      whoItsFor: 'Salaried or self-employed individuals needing flexible unsecured funds.',
      useCases: 'Home renovation, debt consolidation, family events, or major purchases.',
      considerations: 'Tenure ranges from 3 to 60 months with reducing balance interest calculations.'
    },
    {
      id: 'medical',
      title: 'Medical & Health Loan',
      tagline: 'Healthcare funding for treatments, surgeries & emergencies',
      icon: '🚑',
      badge: 'Healthcare',
      category: 'urgent',
      maxAmount: '₹7,50,000',
      tenure: '6 – 36 Months',
      interestRate: 'From 9.99% p.a.',
      whoItsFor: 'Individuals facing planned surgeries, hospitalizations, or urgent medical bills.',
      useCases: 'Hospital stays, elective procedures, dental treatments, and prescriptions.',
      considerations: 'Fast priority processing to assist with urgent cash flow requirements.'
    },
    {
      id: 'education',
      title: 'Education & Upskilling',
      tagline: 'Invest in college tuition fees, certifications & bootcamps',
      icon: '🎓',
      badge: 'Academics',
      category: 'career',
      maxAmount: '₹15,00,000',
      tenure: '12 – 84 Months',
      interestRate: 'From 9.50% p.a.',
      whoItsFor: 'Students and working professionals seeking career upskilling or degree courses.',
      useCases: 'Tuition fees, certification programs, textbooks, tech bootcamps, and hostel costs.',
      considerations: 'Structured monthly installments aligned with academic timelines and moratorium options.'
    },
    {
      id: 'business',
      title: 'Business & MSME Credit',
      tagline: 'Working capital, inventory & equipment for enterprises',
      icon: '💼',
      badge: 'Commercial',
      category: 'business',
      maxAmount: '₹20,00,000',
      tenure: '6 – 48 Months',
      interestRate: 'From 11.25% p.a.',
      whoItsFor: 'Small business owners, traders, consultants, and independent proprietors.',
      useCases: 'Inventory purchase, supplier payments, equipment leases, and cash flow bridge.',
      considerations: 'Minimal documentation based on monthly cash inflows and GST returns.'
    },
    {
      id: 'two_wheeler_ev',
      title: 'Two-Wheeler & EV Loan',
      tagline: 'Drive your dream electric scooter, bike, or EV vehicle',
      icon: '⚡',
      badge: 'Mobility',
      category: 'green',
      maxAmount: '₹3,00,000',
      tenure: '12 – 48 Months',
      interestRate: 'From 8.99% p.a.',
      whoItsFor: 'Commuters and delivery professionals purchasing bikes, scooters, or green EVs.',
      useCases: 'Electric scooter downpayment, two-wheeler purchases, and battery financing.',
      considerations: 'Special green interest subsidy available for certified EV models.'
    },
    {
      id: 'home_renovation',
      title: 'Home Renovation & Decor',
      tagline: 'Upgrade interiors, modular kitchen & smart home fixtures',
      icon: '🏡',
      badge: 'Property',
      category: 'lifestyle',
      maxAmount: '₹12,00,000',
      tenure: '12 – 60 Months',
      interestRate: 'From 10.25% p.a.',
      whoItsFor: 'Homeowners and tenants upgrading living spaces or handling structural maintenance.',
      useCases: 'Modular kitchen, painting, solar panel installation, and furniture upgrades.',
      considerations: 'Attractive low rates for collateral-free home upgrade funding.'
    },
    {
      id: 'debt_consolidation',
      title: 'Debt Consolidation',
      tagline: 'Combine multiple loans & credit cards into one low EMI',
      icon: '📊',
      badge: 'Smart Finance',
      category: 'personal',
      maxAmount: '₹10,00,000',
      tenure: '12 – 60 Months',
      interestRate: 'From 10.99% p.a.',
      whoItsFor: 'Individuals with multiple credit card bills or micro-loans looking to save interest.',
      useCases: 'Paying off credit cards, clearing high-cost informal debt, and boosting credit score.',
      considerations: 'Lowers total monthly outflow with a single predictable payment date.'
    },
    {
      id: 'travel',
      title: 'Travel & Vacation Loan',
      tagline: 'Fund your dream holidays, flights & international trips',
      icon: '✈️',
      badge: 'Lifestyle',
      category: 'lifestyle',
      maxAmount: '₹5,00,000',
      tenure: '3 – 24 Months',
      interestRate: 'From 11.50% p.a.',
      whoItsFor: 'Travelers planning domestic holidays, international vacations, or family trips.',
      useCases: 'Flight tickets, hotel reservations, tour packages, visa fees, and travel gear.',
      considerations: 'Fixed monthly EMIs to help you budget travel without liquidating emergency savings.'
    },
    {
      id: 'wedding',
      title: 'Wedding & Celebration',
      tagline: 'Complete financing for venues, catering, jewelry & outfits',
      icon: '💍',
      badge: 'Celebrations',
      category: 'lifestyle',
      maxAmount: '₹15,00,000',
      tenure: '12 – 48 Months',
      interestRate: 'From 10.75% p.a.',
      whoItsFor: 'Couples and families planning wedding ceremonies, receptions, or milestone anniversaries.',
      useCases: 'Venue booking, photography, bridal wear, jewelry purchases, and catering.',
      considerations: 'Staged disbursals available to pay vendors across various event milestones.'
    },
    {
      id: 'gadgets',
      title: 'Consumer Tech & Gadgets',
      tagline: 'Instant credit for laptops, smartphones & workstations',
      icon: '💻',
      badge: 'Tech & Home',
      category: 'personal',
      maxAmount: '₹2,50,000',
      tenure: '3 – 18 Months',
      interestRate: 'From 9.99% p.a.',
      whoItsFor: 'Tech enthusiasts, creators, remote workers, and students upgrading hardware.',
      useCases: 'Flagship smartphones, editing laptops, graphic tablets, and smart TVs.',
      considerations: 'Zero-cost EMI promotions available with participating partner merchants.'
    },
    {
      id: 'solar',
      title: 'Solar & Green Energy',
      tagline: 'Residential rooftop solar panels & eco energy setups',
      icon: '☀️',
      badge: 'Eco Friendly',
      category: 'green',
      maxAmount: '₹6,00,000',
      tenure: '12 – 60 Months',
      interestRate: 'From 8.50% p.a.',
      whoItsFor: 'Homeowners and housing societies seeking to reduce power bills and go green.',
      useCases: 'Rooftop solar panel installation, inverters, smart net meters, and battery backup.',
      considerations: 'Eligible for central/state government rooftop solar subsidy schemes.'
    },
    {
      id: 'women_entrepreneur',
      title: 'Women Entrepreneur Loan',
      tagline: 'Dedicated funding & subsidized rates for women-led startups',
      icon: '👩‍💼',
      badge: 'Empowerment',
      category: 'business',
      maxAmount: '₹10,00,000',
      tenure: '12 – 60 Months',
      interestRate: 'From 9.25% p.a.',
      whoItsFor: 'Women founders, boutique owners, artisans, and women-led MSME enterprises.',
      useCases: 'Shop setup, raw material procurement, team expansion, and digital marketing.',
      considerations: 'Special 0.50% interest rate rebate on prompt monthly EMI repayments.'
    },
    {
      id: 'agri_tech',
      title: 'Agri-Tech & Farm Equipment',
      tagline: 'Micro-irrigation, solar pumps & modern farming tools',
      icon: '🚜',
      badge: 'Agriculture',
      category: 'business',
      maxAmount: '₹8,00,000',
      tenure: '12 – 48 Months',
      interestRate: 'From 9.75% p.a.',
      whoItsFor: 'Progressive farmers, agribusiness operators, and rural agro-service providers.',
      useCases: 'Drip irrigation kits, tractor attachments, greenhouse setups, and seed storage.',
      considerations: 'Flexible seasonal repayment cycles matched to harvest revenue periods.'
    },
    {
      id: 'freelancer',
      title: 'Gig & Freelancer Credit',
      tagline: 'Cash flow bridge based on bank statement & invoice history',
      icon: '🎨',
      badge: 'Gig Economy',
      category: 'career',
      maxAmount: '₹4,00,000',
      tenure: '3 – 24 Months',
      interestRate: 'From 11.99% p.a.',
      whoItsFor: 'Independent consultants, freelance designers, developers, and content creators.',
      useCases: 'Smoothing irregular income, client payment delays, software subscriptions, and tools.',
      considerations: 'No ITR mandatory — approved via UPI transaction flows and banking analytics.'
    },
    {
      id: 'used_car',
      title: 'Used Car & Pre-Owned Vehicle',
      tagline: 'Certified second-hand cars & transfer financing',
      icon: '🚗',
      badge: 'Automobile',
      category: 'lifestyle',
      maxAmount: '₹8,00,000',
      tenure: '12 – 60 Months',
      interestRate: 'From 10.50% p.a.',
      whoItsFor: 'Families and commuters upgrading to four-wheeler personal mobility.',
      useCases: 'Certified pre-owned sedans, hatchbacks, SUVs, RC transfers, and insurance.',
      considerations: 'Financing available up to 85% of certified vehicle valuation.'
    },
    {
      id: 'rental_deposit',
      title: 'Rental Deposit & Relocation',
      tagline: 'Security deposit for new apartments, packing & moving',
      icon: '🛋️',
      badge: 'Relocation',
      category: 'urgent',
      maxAmount: '₹3,50,000',
      tenure: '6 – 24 Months',
      interestRate: 'From 10.99% p.a.',
      whoItsFor: 'Professionals moving to new cities or renting new residential homes.',
      useCases: 'Heavy landlord security deposits, brokerage fees, movers & packers bills.',
      considerations: 'Disbursed directly within 24 hours to secure property agreements without delays.'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Options', count: options.length },
    { id: 'personal', label: 'Personal & Lifestyle', count: options.filter(o => o.category === 'personal' || o.category === 'lifestyle').length },
    { id: 'urgent', label: 'Healthcare & Urgent', count: options.filter(o => o.category === 'urgent').length },
    { id: 'business', label: 'Business & MSME', count: options.filter(o => o.category === 'business').length },
    { id: 'career', label: 'Education & Career', count: options.filter(o => o.category === 'career').length },
    { id: 'green', label: 'EV & Green Energy', count: options.filter(o => o.category === 'green').length },
  ];

  const filteredOptions = options.filter(opt => {
    const matchesCategory = 
      activeCategory === 'all' ? true :
      activeCategory === 'personal' ? (opt.category === 'personal' || opt.category === 'lifestyle') :
      opt.category === activeCategory;

    const matchesSearch = 
      opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.badge.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div id="loan-options-section" className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Comprehensive Financing
          </div>
          <h2 className="font-black text-slate-900 text-2xl tracking-tight">
            Explore All 16 Loan Options
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-xl">
            Choose from tailored digital loan facilities designed for your specific financial journey with transparent rates and fast paperless disbursal.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by loan type or goal..."
            className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      {filteredOptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-700">No loan options matched "{searchQuery}"</p>
          <p className="text-xs text-slate-400">Try searching for keywords like medical, business, wedding, or car</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="text-xs text-blue-600 font-bold hover:underline pt-2 inline-block"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredOptions.map((opt) => (
            <div
              key={opt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {opt.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                    {opt.tagline}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Max Limit</span>
                    <span className="font-black text-slate-800 font-mono">{opt.maxAmount}</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Tenure</span>
                    <span className="font-bold text-slate-800">{opt.tenure}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Learn more
                </button>

                <button
                  type="button"
                  onClick={() => onApplyClick(opt.title)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Apply <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Info Modal */}
      {selectedOption && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedOption.icon}</span>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {selectedOption.badge}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedOption.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedOption(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold uppercase block">Max Amount</span>
                <span className="font-extrabold text-blue-900 font-mono text-sm">{selectedOption.maxAmount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Tenure</span>
                <span className="font-extrabold text-emerald-900 text-sm">{selectedOption.tenure}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-[10px] text-indigo-600 font-bold uppercase block">Interest Rate</span>
                <span className="font-extrabold text-indigo-900 text-xs">{selectedOption.interestRate}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 block">Who it's for</span>
                <p className="text-slate-600">{selectedOption.whoItsFor}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 block">Typical use cases</span>
                <p className="text-slate-600">{selectedOption.useCases}</p>
              </div>

              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-blue-900">
                <strong>Important note:</strong> {selectedOption.considerations}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOption(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const loanTitle = selectedOption.title;
                  setSelectedOption(null);
                  onApplyClick(loanTitle);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                Proceed to Application <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactLoanOptions;
