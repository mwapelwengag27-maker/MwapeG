
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Music, AlertCircle, Sparkles, Calendar, ArrowUpRight, Gift, FileText, BadgeAlert } from 'lucide-react';
import { MOCK_SONGS } from '../constants.tsx';
import { getTeamSummary } from '../geminiService.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Member, FinancialRecord, DisciplinaryCase, TeamEvent, UserRole, MeetingMinutes, AttendanceRecord } from '../types.ts';

interface DashboardProps {
  members: Member[];
  finance: FinancialRecord[];
  cases: DisciplinaryCase[];
  events: TeamEvent[];
  minutes: MeetingMinutes[];
  attendance: AttendanceRecord[];
  onNavigate: (view: string) => void;
  currentRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ members, finance, cases, events, minutes, attendance, onNavigate, currentRole }) => {
  const [aiSummary, setAiSummary] = useState<string>("Analyzing team performance...");
  
  const isAdminOrSec = [UserRole.ADMIN, UserRole.SECRETARIAT].includes(currentRole);
  const isFinanceHidden = [UserRole.MEMBER, UserRole.DISCIPLINARY, UserRole.MUSIC_DEPT].includes(currentRole);

  const stats = [
    { 
      label: 'Total Members', 
      value: members.length, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      target: 'membership',
      desc: 'View directory',
      hidden: false
    },
    { 
      label: 'Treasury Balance', 
      value: `K${finance.reduce((acc, curr) => curr.type === 'Income' ? acc + curr.amount : acc - curr.amount, 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      target: 'finance',
      desc: 'Cashbook ledger',
      hidden: isFinanceHidden
    },
    { 
      label: 'Active Songs', 
      value: MOCK_SONGS.length, 
      icon: Music, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100',
      target: 'music',
      desc: 'Setlist library',
      hidden: false
    },
    { 
      label: 'Open Cases', 
      value: cases.filter(c => c.status === 'Open').length, 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-100',
      target: 'disciplinary',
      desc: 'Review issues',
      hidden: false
    },
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      const summary = await getTeamSummary({
        memberCount: members.length,
        financialSummary: isFinanceHidden ? "Summary restricted" : finance,
        recentSongs: MOCK_SONGS.length,
        disciplinaryCount: cases.length,
        role: currentRole
      });
      setAiSummary(summary);
    };
    fetchSummary();
  }, [members, finance, cases, isFinanceHidden]);

  // Secretariat Desk: Upcoming Birthdays
  const upcomingBirthdays = members.filter(m => {
    if (!m.dateOfBirth) return false;
    const dob = new Date(m.dateOfBirth);
    const today = new Date();
    const nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).sort((a, b) => {
    const da = new Date(a.dateOfBirth!).getMonth();
    const db = new Date(b.dateOfBirth!).getMonth();
    return da - db;
  });

  // Secretariat Desk: Low Attendance Alerts
  const lowAttendanceMembers = members.map(m => {
    const mRecords = attendance.filter(r => r.memberId === m.id);
    if (mRecords.length === 0) return { ...m, rate: 100 };
    const rate = (mRecords.filter(r => r.status === 'Present' || r.status === 'Late').length / mRecords.length) * 100;
    return { ...m, rate };
  }).filter(m => m.rate < 75).sort((a, b) => a.rate - b.rate).slice(0, 3);

  const chartData = finance.slice(-10).map(f => ({
    name: f.date,
    amount: f.amount,
    type: f.type
  }));

  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Main Command Dashboard</h2>
          <p className="text-slate-500 text-sm font-medium">Real-time oversight for Ebenezer Praise Team management.</p>
        </div>
        <div className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-widest">
          {new Date().toLocaleDateString('en-ZM', { dateStyle: 'full' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.filter(s => !s.hidden).map((stat, i) => (
          <button 
            key={i} 
            onClick={() => onNavigate(stat.target)}
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 flex items-center space-x-4 hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
              <stat.icon size={100} />
            </div>

            <div className={`${stat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div className="relative z-10 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`text-[9px] font-bold uppercase ${stat.color}`}>{stat.desc}</span>
                <ArrowUpRight size={10} className={stat.color} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
           {!isFinanceHidden && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
                  Financial Pulse
                </h3>
                <button 
                  onClick={() => onNavigate('finance')}
                  className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest"
                >
                  Full Ledger
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ 
                        borderRadius: '1.5rem', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.type === 'Income' ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Secretariat Desk View (Visible to Admin/Sec) */}
          {isAdminOrSec && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Birthdays Card */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
                    <Gift size={16} className="text-pink-500 mr-2" /> Birthdays (Next 30 Days)
                  </h4>
                </div>
                <div className="space-y-3 flex-1">
                  {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-pink-600 text-[10px] border border-pink-100">
                          {m.name.charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-slate-900">{m.name}</p>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(m.dateOfBirth!).toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">No upcoming birthdays.</p>
                  )}
                </div>
              </div>

              {/* Attendance Alerts Card */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
                    <BadgeAlert size={16} className="text-red-500 mr-2" /> Attendance Outliers
                  </h4>
                </div>
                <div className="space-y-3 flex-1">
                  {lowAttendanceMembers.length > 0 ? lowAttendanceMembers.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-sm font-bold text-red-900">{m.name}</p>
                      <span className="text-[10px] font-black text-red-600 bg-white px-2 py-1 rounded-lg border border-red-200">
                        {Math.round(m.rate)}% Rate
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">Attendance health is optimal.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md group-hover:rotate-12 transition-transform">
                  <Sparkles size={20} className="text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-blue-50 uppercase tracking-widest">Gemini Insights</h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-tighter">AI Operational Summary</p>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-blue-100 leading-relaxed italic text-sm font-medium border-l-2 border-blue-500/50 pl-5 py-2">
                  "{aiSummary}"
                </p>
              </div>

              <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white text-blue-200 hover:text-indigo-900 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">
                Refine Strategic Analysis
              </button>
            </div>
            
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] animate-pulse"></div>
          </div>

          {/* Recent Minutes Quick Access */}
          {isAdminOrSec && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center mb-6">
                <FileText size={16} className="text-blue-600 mr-2" /> Latest Minute Records
              </h4>
              <div className="space-y-4">
                {minutes.slice(0, 2).map((m, i) => (
                  <button 
                    key={i} 
                    onClick={() => onNavigate('minutes')}
                    className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all group"
                  >
                    <p className="text-xs font-black text-slate-400 uppercase mb-1 tracking-tighter">{m.date}</p>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 truncate">{m.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Events Board */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/50">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <Calendar size={18} className="text-blue-600 mr-3" />
            Active Schedule
          </h3>
          <button 
            onClick={() => onNavigate('events')}
            className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            Manage Events
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
            <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 bg-white text-[10px] font-black text-blue-600 rounded-md border border-slate-200 uppercase tracking-tighter">
                  {event.type}
                </span>
                <p className="text-xs font-black text-slate-400">{event.time}</p>
              </div>
              <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{event.title}</p>
              <div className="flex items-center text-xs text-slate-500 font-bold mt-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                {event.location}
              </div>
              <p className="text-[10px] font-black text-blue-50 mt-4 uppercase tracking-[0.2em]">
                {new Date(event.date).toLocaleDateString('en-ZM', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic text-sm">No scheduled events found for this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
