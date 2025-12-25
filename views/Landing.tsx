
import React from 'react';
import { Pill as Church, ShieldCheck, Music, Users, ArrowRight, HeartHandshake } from 'lucide-react';

interface LandingProps {
  onEnterPortal: () => void;
}

const Landing: React.FC<LandingProps> = ({ onEnterPortal }) => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Hero Section */}
      <nav className="h-24 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
            <Church size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-none tracking-tighter">Ebenezer Praise Team</h1>
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mt-1.5">Mpulungu Central UCZ</p>
          </div>
        </div>
        <button 
          onClick={onEnterPortal}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-blue-600 text-white px-8 py-3.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <span>Staff Portal</span>
          <ShieldCheck size={18} />
        </button>
      </nav>

      <main>
        <div className="relative pt-24 pb-40 px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-12">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                <Music size={14} />
                <span>One Heart, One Voice, One Purpose</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-7xl sm:text-9xl font-black text-slate-900 tracking-tighter leading-[0.8] uppercase">
                  Ebenezer <br/>
                  <span className="text-blue-600 italic">Praise Team</span>
                </h1>
                <div className="flex items-center space-x-4 ml-1">
                  <div className="h-0.5 w-12 bg-blue-600"></div>
                  <p className="text-xl font-black text-slate-400 uppercase tracking-[0.4em]">Mpulungu Central UCZ</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                  Psalms 139 vs 14
                </h2>
                <p className="text-blue-600 text-2xl sm:text-3xl font-extrabold italic max-w-lg leading-relaxed opacity-90">
                  (mwalilengwa busuma-busuma kutinya kutinya mwenso-mwenso)
                </p>
              </div>

              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                The official management system for the Mpulungu Central UCZ Ebenezer Praise Team. Empowering our ministry through digital governance and organized stewardship.
              </p>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={onEnterPortal}
                  className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center space-x-4 group"
                >
                  <span>Enter Portal</span>
                  <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[4rem] rotate-3 blur-3xl opacity-10"></div>
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <button 
                      onClick={onEnterPortal}
                      className="w-full text-left p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-xl transition-all group-hover:-translate-y-2"
                    >
                      <Users size={32} className="text-blue-600 mb-4" />
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Team Directory</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Unified database of all active members and leadership.</p>
                    </button>
                    <button 
                      onClick={onEnterPortal}
                      className="w-full text-left p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-purple-300 hover:bg-white hover:shadow-xl transition-all group-hover:-translate-y-2 delay-75"
                    >
                      <Music size={32} className="text-purple-600 mb-4" />
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Music Library</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium">AI-powered song management and setlist planning.</p>
                    </button>
                  </div>
                  <div className="space-y-8 pt-12">
                    <button 
                      onClick={onEnterPortal}
                      className="w-full text-left p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-pink-300 hover:bg-white hover:shadow-xl transition-all group-hover:-translate-y-2 delay-150"
                    >
                      <HeartHandshake size={32} className="text-pink-600 mb-4" />
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">IGA Projects</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Tracking our income-generating ventures for the kingdom.</p>
                    </button>
                    <button 
                      onClick={onEnterPortal}
                      className="w-full text-left p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-green-300 hover:bg-white hover:shadow-xl transition-all group-hover:-translate-y-2 delay-200"
                    >
                      <ShieldCheck size={32} className="text-green-600 mb-4" />
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Governance</h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Minutes, rules, and disciplinary oversight records.</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[40rem] h-[40rem] bg-blue-100/50 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-indigo-100/50 rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white py-32 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center space-y-16">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Digital Stewardship</h3>
              <p className="text-4xl font-black text-slate-900">Empowering Modern Ministry</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full">
              <div>
                <p className="text-6xl font-black text-slate-900 mb-4">11+</p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Cell Groups</p>
              </div>
              <div>
                <p className="text-6xl font-black text-slate-900 mb-4">50+</p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Active Songs</p>
              </div>
              <div>
                <p className="text-6xl font-black text-slate-900 mb-4">100%</p>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Accountability</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-50 py-16 px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400">
          <div className="text-left space-y-2">
            <p className="text-lg font-black text-slate-900 uppercase tracking-tighter">Ebenezer Praise Team</p>
            <p className="text-sm font-medium">© {new Date().getFullYear()} Mpulungu Central UCZ. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-8 mt-10 md:mt-0">
            <a href="#" className="text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
