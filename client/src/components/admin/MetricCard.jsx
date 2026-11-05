import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'cyan', trend }) => {
  const colorMap = {
    cyan: 'from-cyan-500 to-blue-600 text-cyan-600 bg-cyan-50',
    purple: 'from-purple-500 to-indigo-600 text-purple-600 bg-purple-50',
    emerald: 'from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50',
    amber: 'from-amber-500 to-orange-600 text-amber-600 bg-amber-50',
    rose: 'from-rose-500 to-pink-600 text-rose-600 bg-rose-50',
  };

  const currentTheme = colorMap[color] || colorMap.cyan;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentTheme.split(' ')[2]}`}>
          <Icon className={`w-5 h-5 ${currentTheme.split(' ')[1]}`} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
