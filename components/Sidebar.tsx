
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Music, 
  ShieldAlert, 
  FileText,
  Calendar,
  CheckCircle,
  HandCoins,
  CreditCard,
  Wheat,
  Ticket,
  LogOut,
  Briefcase,
  X,
  UserCircle
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface SidebarProps {
  currentRole: UserRole;
  currentView: string;
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, currentView, isOpen, onClose, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.TREASURER, UserRole.MUSIC_DEPT, UserRole.DISCIPLINARY] },
    { id: 'profile', label: 'My Profile', icon: UserCircle, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.TREASURER, UserRole.MUSIC_DEPT, UserRole.DISCIPLINARY, UserRole.MEMBER] },
    { id: 'membership', label: 'Directory', icon: Users, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.TREASURER, UserRole.MUSIC_DEPT, UserRole.DISCIPLINARY, UserRole.MEMBER] },
    { id: 'attendance', label: currentRole === UserRole.MEMBER ? 'My Attendance' : 'Team Attendance', icon: CheckCircle, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.TREASURER, UserRole.MUSIC_DEPT, UserRole.DISCIPLINARY, UserRole.MEMBER] },
    { id: 'events', label: 'Events & News', icon: Calendar, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.TREASURER, UserRole.MUSIC_DEPT, UserRole.DISCIPLINARY, UserRole.MEMBER] },
    { id: 'member-finances', label: 'Member Finances', icon: HandCoins, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.TREASURER, UserRole.MEMBER] },
    { id: 'subscriptions', label: 'Monthly Subs', icon: CreditCard, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'harvest', label: 'Harvest Assessment', icon: Wheat, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'projects', label: 'Team Projects', icon: Briefcase, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'concerts', label: 'Concert Finances', icon: Ticket, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'finance', label: 'General Finance', icon: Wallet, roles: [UserRole.ADMIN, UserRole.TREASURER] },
    { id: 'music', label: 'Music Dept', icon: Music, roles: [UserRole.ADMIN, UserRole.MUSIC_DEPT] },
    { id: 'disciplinary', label: 'Disciplinary Committee', icon: ShieldAlert, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.TREASURER, UserRole.DISCIPLINARY, UserRole.MEMBER] },
    { id: 'minutes', label: 'Minutes', icon: FileText, roles: [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.DISCIPLINARY] },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed left-0 top-0 w-64 bg-slate-900 text-white h-screen flex flex-col z-[50] overflow-y-auto transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-400">Ebenezer Praise</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Mpulungu UCZ</p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-4 pb-10">
          {menuItems
            .filter(item => item.roles.includes(currentRole))
            .map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  currentView === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0">
          <div className="flex items-center space-x-3 px-4 py-3 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
              {currentRole.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentRole}</p>
              <p className="text-xs truncate">Portal User</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 mt-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
