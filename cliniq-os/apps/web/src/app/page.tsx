import React, { useState } from 'react';
import { 
  Plus, Search, Calendar, Users, FileText, 
  TrendingUp, Activity, Mic, Brain, CreditCard,
  ChevronRight, Clock, MapPin, Phone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClinicalDashboard() {
  const [isRecording, setIsRecording] = useState(false);

  const patients = [
    { id: '1', name: 'Alice Smith', lastVisit: '2 days ago', status: 'Follow-up', type: 'Physio' },
    { id: '2', name: 'Bob Jones', lastVisit: '1 week ago', status: 'New Patient', type: 'Derma' },
    { id: '3', name: 'Charlie Day', lastVisit: 'Yesterday', status: 'Stable', type: 'Dental' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 14000, recovered: 2000 },
    { month: 'Feb', revenue: 12500, recovered: 4500 },
    { month: 'Mar', revenue: 16800, recovered: 7000 },
    { month: 'Apr', revenue: 19000, recovered: 3200 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
             <Brain className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-indigo-900">CLINIQ OS</span>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { name: 'Dashboard', icon: Activity, active: true },
            { name: 'Patients', icon: Users },
            { name: 'Calendar', icon: Calendar },
            { name: 'Scribe V3', icon: Mic },
            { name: 'Billing', icon: CreditCard },
            { name: 'Analytics', icon: TrendingUp },
          ].map((item) => (
             <button key={item.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
               item.active ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'
             }`}>
               <item.icon className="w-5 h-5" />
               {item.name}
             </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-indigo-900 rounded-2xl text-white relative overflow-hidden group">
           <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
           <p className="text-sm text-indigo-200 mb-1">Recovered Revenue</p>
           <p className="text-2xl font-bold">$12,400</p>
           <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <Plus className="w-3 h-3" /> 14% this month
           </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Clinical Overview</h2>
            <p className="text-slate-500">Welcome back, Dr. Ibrahim</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
                  placeholder="Search patients..." 
                />
             </div>
             <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                <Calendar className="w-5 h-5 text-slate-600" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Main Timeline & Analytics */}
           <div className="lg:col-span-2 space-y-8">
              {/* Analytics */}
              <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold">Revenue Growth & Recovery</h3>
                    <div className="flex gap-4 text-xs font-semibold">
                       <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600" /> Total Revenue</span>
                       <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /> Recovered</span>
                    </div>
                 </div>
                 <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="revenue" fill="#4f46e5" radius={[6,6,0,0]} barSize={32} />
                          <Bar dataKey="recovered" fill="#fbbf24" radius={[6,6,0,0]} barSize={32} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Recent Patients */}
              <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
                 <h3 className="text-lg font-bold mb-6">Today's Consultations</h3>
                 <div className="space-y-4">
                    {patients.map(p => (
                       <div key={p.id} className="p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700">
                                {p.name[0]}
                             </div>
                             <div>
                                <p className="font-bold text-slate-900">{p.name}</p>
                                <p className="text-sm text-slate-500">{p.type} • Last visit {p.lastVisit}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{p.status}</span>
                             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Scribe Tool & Stats */}
           <div className="space-y-8">
              {/* Scribe V3 Card */}
              <div className="p-8 bg-indigo-600 rounded-3xl text-white relative overflow-hidden">
                 <Mic className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
                 <h3 className="text-xl font-bold mb-2">AI Scribe V3</h3>
                 <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
                   Next-gen ambient listening with specialty-aware SOAP note generation.
                 </p>
                 
                 {!isRecording ? (
                    <button 
                      onClick={async () => {
                        setIsRecording(true);
                        try {
                          const res = await fetch(process.env.NEXT_PUBLIC_CLINIQ_SCRIBE_URL || '#', {
                            method: 'POST',
                            body: JSON.stringify({ action: 'START_SCRIBING', patientId: 'current-session' })
                          });
                          if (!res.ok) throw new Error('Failed');
                        } catch (e) {
                          setIsRecording(false);
                          alert('Scribe trigger failed');
                        }
                      }}
                      className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-900/20"
                    >
                       <Mic className="w-5 h-5" /> Start Recording
                    </button>
                 ) : (
                    <button 
                      onClick={() => setIsRecording(false)}
                      className="w-full py-4 bg-rose-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 animate-pulse"
                    >
                       <div className="w-3 h-3 bg-white rounded-full" /> Recording...
                    </button>
                 )}

                 <div className="mt-8 pt-8 border-t border-white/20 grid grid-cols-2 gap-4">
                    <div className="text-center">
                       <p className="text-2xl font-bold">99.2%</p>
                       <p className="text-[10px] uppercase tracking-widest text-indigo-200">Accuracy</p>
                    </div>
                    <div className="text-center">
                       <p className="text-2xl font-bold">~45s</p>
                       <p className="text-[10px] uppercase tracking-widest text-indigo-200">Processing</p>
                    </div>
                 </div>
              </div>

              {/* Quick Actions */}
              <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
                 <h3 className="text-lg font-bold mb-6">Practitioner Stats</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          <span className="text-slate-600">Admin Saved</span>
                       </div>
                       <span className="font-bold text-slate-900">12.5 hrs</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <span className="text-slate-600">Notes Finalized</span>
                       </div>
                       <span className="font-bold text-slate-900">142</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-indigo-600" />
                          <span className="text-slate-600">New Leads</span>
                       </div>
                       <span className="font-bold text-slate-900">+12</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
