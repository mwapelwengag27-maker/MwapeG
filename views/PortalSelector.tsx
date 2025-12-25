
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

// Fixed the missing component logic and added default export to resolve "no default export" error in App.tsx
const PortalSelector: React.FC<LoginProps> = ({ onLoginSuccess, members }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to map directory roles to system portal roles
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
        'sec': { role: UserRole.SECRETARIAT, display_name: 'Secretary General' },
        'trez': { role: UserRole.TREASURER, display_name: 'Team Treasurer' },
        'disc': { role: UserRole.DISCIPLINARY, display_name: 'Gavel Officer' },
        'music': { role: UserRole.MUSIC_DEPT, display_name: 'Music Director' },
      };

      if (demoUsers[lowerUser] && password === 'admin123') {
        onLoginSuccess(demoUsers[lowerUser].role, { ...demoUsers[lowerUser], username: lowerUser });
        return;
      }

      // 2. Check local directory (MOCK_MEMBERS/State)
      const member = members.find(m => m.username?.toLowerCase() === lowerUser);
      if (member && member.password === password) {
        onLoginSuccess(mapTeamRoleToPortalRole(member.role), {
          member_id: member.id,
          username: member.username,
          display_name: member.name
        });
        return;
      }

      // 3. Fallback Supabase check (if implemented) or default error
      setError("Invalid credentials. Please verify your portal access keys.");
    } catch (err: any) {
      setError(err.message || "Portal access denied. System error.");
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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Authentication</p>
          </div>
        </div>
        <Church size={120} className="absolute -right-8 -bottom-8 opacity-5 text-white" />
      </div>

      <form onSubmit={handleLogin} className="p-10 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3 text-red-600 animate-in slide-in-from-top-2">
            <BadgeAlert size={20} className="shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Handle</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Key</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <span>Access Secure Portal</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>

        <div className="pt-4 flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>
      </form>
      
      <div className="bg-slate-50 p-6 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Music size={16} className="text-slate-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase">Music Dept v2.4</span>
          </div>
          <div className="flex items-center space-x-2 justify-end">
            <Users size={16} className="text-slate-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase">Directory Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelector;
