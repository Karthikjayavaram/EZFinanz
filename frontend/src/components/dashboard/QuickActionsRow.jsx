import React from 'react';
import {
  Coins,
  FileText,
  Layers,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const QuickActionsRow = ({ onApply, onMyApp, onExploreOptions, onHelpFaq }) => {
  const actions = [
    {
      icon: <Coins className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 group-hover:bg-blue-100 text-blue-600',
      border: 'hover:border-blue-300',
      title: 'Apply for Loan',
      subtitle: 'Start or resume your application',
      onClick: onApply
    },
    {
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600',
      border: 'hover:border-indigo-300',
      title: 'My Application',
      subtitle: 'Track status & timeline',
      onClick: onMyApp
    },
    {
      icon: <Layers className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600',
      border: 'hover:border-emerald-300',
      title: 'Loan Options',
      subtitle: 'Explore personal & medical',
      onClick: onExploreOptions
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50 group-hover:bg-purple-100 text-purple-600',
      border: 'hover:border-purple-300',
      title: 'Help & FAQs',
      subtitle: 'Answers to common questions',
      onClick: onHelpFaq
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {actions.map((act, i) => (
        <button
          key={i}
          type="button"
          onClick={act.onClick}
          className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs ${act.border} hover:shadow-md transition-all text-left group flex flex-col justify-between space-y-3 cursor-pointer`}
        >
          <div className="flex items-center justify-between w-full">
            <div className={`w-11 h-11 rounded-xl ${act.bg} flex items-center justify-center transition-colors`}>
              {act.icon}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              {act.title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              {act.subtitle}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActionsRow;
