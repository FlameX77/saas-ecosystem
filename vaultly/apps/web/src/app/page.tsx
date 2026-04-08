import React, { useState } from 'react';
import { 
  BarChart3, PieChart, TrendingDown, LayoutGrid, 
  Calendar, Search, Bell, Settings, DollarSign, 
  ArrowUpRight, ArrowDownRight, MessageSquare, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VaultlyDashboard() {
  const [activeTab, setActiveTab] = useState('stack');

  const stack = [
    { id: '1', name: 'Google Workspace', cost: '$1,240', status: 'Approved', usage: '92%' },
    { id: '2', name: 'Salesforce CRM', cost: '$4,800', status: 'Investigating', usage: '45%' },
    { id: '3', name: 'Waitlist.ai', cost: '$499', status: 'Unapproved', usage: '12%' },
    { id: '4', name: 'GitHub Enterprise', cost: '$2,100', status: 'Approved', usage: '88%' },
  ];

  const chartData = [
    { month: 'Nov', spend: 85000 },
    { month: 'Dec', spend: 92000 },
    { month: 'Jan', spend: 78000 },
    { month: 'Feb', spend: 64000 }, // Savings realized here
    { month: 'Mar', spend: 61000 },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex">
      {/* Navigation */}
      <div className="w-20 bg-[#0f172a] border-r border-white/5 flex flex-col items-center py-8 gap-10">
        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl shadow-blue-500/20">
          V
        </div>
        <nav className="flex flex-col gap-6">
          <button className="p-3 bg-white/5 text-white rounded-xl shadow-lg border border-white/10"><BarChart3 /></button>
          <button className="p-3 text-slate-500 hover:text-white transition-colors"><LayoutGrid /></button>
          <button className="p-3 text-slate-500 hover:text-white transition-colors"><Calendar /></button>
          <button className="p-3 text-slate-500 hover:text-white transition-colors"><MessageSquare /></button>
        </nav>
        <button className="mt-auto p-3 text-slate-500 hover:text-white transition-colors"><Settings /></button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
              VAULTLY <span className="text-slate-500 font-light">FINOPS</span>
            </h1>
            <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-slate-400">
                    <Bell className="w-4 h-4" /> 4 Critical Renewals 
                </span>
                <span className="text-slate-700">•</span>
                <span className="text-emerald-400 font-bold">$22,400 Total Savings Identified</span>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  className="pl-10 pr-4 py-2 bg-[#0f172a] border border-white/10 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  placeholder="Find a vendor..." 
                />
             </div>
             <button className="px-5 cursor-pointer py-2 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> Generate Report
             </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Spend Trend & Stack Map */}
           <div className="lg:col-span-2 space-y-8">
              {/* Main Chart */}
              <div className="p-8 bg-[#0f172a] border border-white/5 rounded-3xl shadow-sm">
                 <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" /> Spend Intel Trend
                    </h2>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 mb-1">Monthly Runrate</p>
                        <p className="text-3xl font-bold text-white">$61,000 <span className="text-xs text-emerald-400 ml-2 font-normal">-12% YoY</span></p>
                    </div>
                 </div>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                           <defs>
                              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis dataKey="month" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                           <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                           />
                           <Area type="monotone" dataKey="spend" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Stack Table */}
              <div className="p-8 bg-[#0f172a] border border-white/5 rounded-3xl">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">The SaaS Stack Map</h2>
                    <button className="text-sm text-blue-400 font-semibold cursor-pointer hover:underline">View All 103 Apps</button>
                 </div>
                 <div className="space-y-4">
                    {stack.map(app => (
                        <div key={app.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] transition-all cursor-pointer">
                           <div className="flex items-center gap-5">
                               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white group-hover:scale-110 transition-transform">
                                   {app.name[0]}
                               </div>
                               <div>
                                   <p className="font-bold text-white">{app.name}</p>
                                   <p className="text-xs text-slate-500 uppercase tracking-widest">{app.status}</p>
                               </div>
                           </div>
                           <div className="flex gap-12 items-center">
                               <div className="text-right">
                                   <p className="text-sm font-bold text-white">{app.cost} <span className="text-[10px] text-slate-500 font-normal">/mo</span></p>
                                   <p className="text-xs text-slate-400">Monthly Cost</p>
                               </div>
                               <div className="text-right w-24">
                                   <div className="flex items-center justify-between mb-1">
                                      <p className="text-xs text-slate-500">Usage</p>
                                      <p className={`text-xs font-bold ${parseInt(app.usage) > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{app.usage}</p>
                                   </div>
                                   <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                       <div className={`h-full ${parseInt(app.usage) > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: app.usage }} />
                                   </div>
                               </div>
                               <ArrowUpRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors" />
                           </div>
                        </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Saving Ops & Advisor */}
           <div className="space-y-8">
              {/* Savings Opportunity Board */}
              <div className="p-8 bg-blue-600 rounded-3xl text-white relative overflow-hidden group">
                 <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                 <h2 className="text-xl font-bold mb-2">Savings Priorities</h2>
                 <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                   Immediate FinOps actions to reduce monthly runrate.
                 </p>
                 <div className="space-y-4">
                    <div className="p-4 bg-white/10 border border-white/20 rounded-2xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm">Salesforce Downgrade</span>
                            <span className="text-xs text-blue-200">High Impact</span>
                        </div>
                        <p className="text-xs text-blue-100 mb-2 font-mono">Potential Savings: $1,200/mo</p>
                        <button className="text-[10px] font-bold bg-white text-blue-600 px-3 py-1.5 rounded-lg active:scale-95 transition-all">Execute Action</button>
                    </div>
                    <div className="p-4 bg-white/10 border border-white/20 rounded-2xl opacity-60">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm">Zoom Duplicate Check</span>
                            <span className="text-xs text-blue-200">Medium</span>
                        </div>
                        <p className="text-xs text-blue-100 mb-2 font-mono">Potential Savings: $240/mo</p>
                    </div>
                 </div>
              </div>

              {/* Benchmarking Stats */}
              <div className="p-8 bg-[#0f172a] border border-white/5 rounded-3xl">
                 <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-400" /> Benchmark IQ
                 </h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-400 text-sm">Avg Tool Cost</span>
                       </div>
                       <span className="text-sm font-bold text-white">$2,402</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-400 text-sm">Seat Utilization</span>
                       </div>
                       <span className="text-sm font-bold text-white">72%</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3 text-red-400">
                          <ArrowDownRight className="w-4 h-4" />
                          <span className="text-sm">Shadow IT Alerts</span>
                       </div>
                       <span className="text-sm font-bold">12 Active</span>
                    </div>
                 </div>
              </div>

              {/* Spend Advisor Assistant */}
              <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-white/5 rounded-3xl">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="font-bold text-sm">Vaultly AI Advisor</p>
                 </div>
                 <p className="text-xs text-slate-400 italic mb-4 leading-relaxed">
                   "You have 4 tools with less than 20% utilization. Would you like me to draft a downgrade request for the board?"
                 </p>
                 <button className="w-full py-2.5 bg-blue-500 text-sm font-bold rounded-xl hover:bg-blue-600 transition-all transition-all">Ask Advisor</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
