import React, { useState } from 'react';
import { UserRole, Member } from '../types.ts';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Pill as Church,
  AlertCircle,
  Loader2,
  Key,
  BadgeAlert,
  Music,
  Users
} from 'lucide-react';
import { supabase } from '../supabaseClient.ts';

interface LoginProps {
  onLoginSuccess: (role: UserRole, user: any) => void;
  members: Member[];
}

const PortalSelector: React.FC<LoginProps> = ({ onLoginSuccess, members }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapTeamRoleToPortalRole = (teamRole: string): UserRole => {
    const role = teamRole.toLowerCase();
    if (role.includes('admin') || role.includes('leader')) return UserRole.ADMIN;
    if (role.includes('secretary')) return UserRole.SECRETARIAT;
    if (role.includes('treasurer')) return UserRole.TREASURER;
    if (role.includes('disciplinary')) return UserRole.DISCIPLINARY;
    if (role.includes('media') || role.includes('sound') || role.includes('music')) return UserRole.MUSIC_DEPT;
    return UserRole.MEMBER;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const lowerUser = username.toLowerCase().trim();

    try {
      // 1. Check for hardcoded legacy demo accounts first
      const demoUsers: Record<string, any> = {
        'admin': { role: UserRole.ADMIN, display_name: 'Admin Commander' },
        'sec': { role: UserRole.SECRETARIAT, display_name: 'Secretary General' }
      };

      if (demoUsers[lowerUser] && password === 'admin123') {
        onLoginSuccess(demoUsers[lowerUser].role, { ...demoUsers[lowerUser], username: lowerUser });
        return;
      }

      // 2. Check directory members
      const member = members.find(m => m.username?.toLowerCase() === lowerUser);
      if (member && member.password === password) {
        onLoginSuccess(mapTeamRoleToPortalRole(member.role), {
          member_id: member.id,
          username: member.username,
          display_name: member.name
        });
        return;
      }

      setError("Access Denied. Check your credentials.");
    } catch (err: any) {
      setError("System connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
      <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Ebenezer Portal</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Staff Access Only</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="p-10 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3 text-red-600">
            <BadgeAlert size={20} className="shrink-0 mt-0.5" />
            <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Handle</label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or sec"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Key</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <span>Access Portal</span>}
        </button>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-800 uppercase mb-2">Demo Credentials:</p>
            <div className="space-y-1">
                <p className="text-[10px] text-blue-600 font-bold">Admin: admin / admin123</p>
                <p className="text-[10px] text-blue-600 font-bold">Secretariat: sec / admin123</p>
            </div>
        </div>
      </form>
    </div>
  );
};

export default PortalSelector;