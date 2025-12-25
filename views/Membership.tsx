
import React, { useState, useRef } from 'react';
import { Member, UserRole, AttendanceRecord, MemberContribution, SubscriptionRecord, HarvestRecord, DisciplinaryCase } from '../types.ts';
import { CELL_GROUPS } from '../constants.tsx';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Filter, 
  X, 
  Save, 
  UserPlus, 
  UserCircle, 
  Trash2, 
  Edit3, 
  UserCheck, 
  UserX, 
  Clock, 
  ExternalLink,
  MapPin,
  Phone,
  Gift,
  Camera,
  User,
  ShieldCheck,
  CalendarDays,
  BadgeCheck,
  HandCoins,
  History,
  CheckCircle,
  AlertTriangle,
  Gavel,
  CreditCard,
  Wheat,
  Activity,
  Lock,
  Key
} from 'lucide-react';

interface MembershipProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  currentRole: UserRole;
  currentUser?: any;
  onViewFinancials?: (memberId: string) => void;
  onDeleteMember?: (memberId: string) => void;
  // Unified Data Props
  attendanceRecords?: AttendanceRecord[];
  contributions?: MemberContribution[];
  subscriptions?: SubscriptionRecord[];
  harvests?: HarvestRecord[];
  disciplinaryCases?: DisciplinaryCase[];
}

const Membership: React.FC<MembershipProps> = ({ 
  members, 
  setMembers, 
  currentRole, 
  currentUser,
  onViewFinancials,
  onDeleteMember,
  attendanceRecords = [],
  contributions = [],
  subscriptions = [],
  harvests = [],
  disciplinaryCases = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedProfileMember, setSelectedProfileMember] = useState<Member | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'finance' | 'attendance' | 'conduct'>('overview');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Singer',
    voicePart: 'Soprano' as Member['voicePart'],
    cellGroup: 'Kasaka',
    phoneNumber: '',
    dateOfBirth: '',
    joinedDate: new Date().toISOString().split('T')[0],
    photo: '',
    username: '',
    password: ''
  });

  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const isAdmin = currentRole === UserRole.ADMIN;
  // Strictly allow only Admin and Secretariat to modify the membership directory overall
  const canManageMembership = currentRole === UserRole.ADMIN || currentRole === UserRole.SECRETARIAT;

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cellGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phoneNumber.includes(searchTerm)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'add') {
          setNewMember({ ...newMember, photo: base64String });
        } else if (editingMember) {
          setEditingMember({ ...editingMember, photo: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = () => {
    if (!newMember.name || !canManageMembership) return;

    const member: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMember.name,
      role: newMember.role,
      voicePart: newMember.voicePart,
      cellGroup: newMember.cellGroup,
      phoneNumber: newMember.phoneNumber,
      dateOfBirth: newMember.dateOfBirth,
      status: 'Active',
      joinedDate: newMember.joinedDate,
      photo: newMember.photo,
      username: newMember.username || undefined,
      password: newMember.password || undefined
    };

    setMembers(prev => [member, ...prev]);
    setIsAddModalOpen(false);
    setNewMember({
      name: '',
      role: 'Singer',
      voicePart: 'Soprano',
      cellGroup: 'Kasaka',
      phoneNumber: '',
      dateOfBirth: '',
      joinedDate: new Date().toISOString().split('T')[0],
      photo: '',
      username: '',
      password: ''
    });
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    // Allow if manage permission OR if user is editing themselves
    const isSelf = editingMember.id === currentUser?.member_id;
    if (!canManageMembership && !isSelf) return;

    setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
    setIsEditModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Are you sure you want to remove ${name} from the team? This action is permanent.`)) {
      if (onDeleteMember) {
        onDeleteMember(id);
      } else {
        setMembers(prev => prev.filter(m => m.id !== id));
      }
      setActiveMenuId(null);
    }
  };

  const toggleStatus = (id: string, newStatus: Member['status']) => {
    if (!isAdmin) return;
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    setActiveMenuId(null);
  };

  const openProfile = (member: Member) => {
    setSelectedProfileMember(member);
    setIsProfileModalOpen(true);
    setProfileTab('overview');
    setActiveMenuId(null);
  };

  const getStatusBadgeStyles = (status: Member['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Suspended': return 'bg-red-100 text-red-700';
      case 'On Leave': return 'bg-yellow-100 text-yellow-700';
      case 'Transferred': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Team Membership</h2>
          <p className="text-gray-500 text-sm">Official directory of the Ebenezer Praise Team.</p>
        </div>
        {canManageMembership && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Add Member</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, group, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Team Member</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Role / Part</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="text-gray-300 w-full h-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                           <p className="font-bold text-gray-900 leading-none">{member.name}</p>
                           {member.username && (
                             <span title="Portal User">
                               <Lock size={10} className="text-blue-400" />
                             </span>
                           )}
                        </div>
                        <div className="flex items-center space-x-1 mt-1.5 text-[10px] font-bold text-gray-400 uppercase">
                          <MapPin size={10} className="text-blue-400" />
                          <span>{member.cellGroup}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        <span className="font-medium">{member.phoneNumber || 'No phone'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Gift size={12} className="text-pink-300" />
                        <span>{member.dateOfBirth || 'Unknown DOB'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-700">{member.role}</p>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{member.voicePart}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadgeStyles(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 relative text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button 
                        onClick={() => openProfile(member)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Individual Dashboard"
                      >
                        <Activity size={18} />
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                          className={`p-2 rounded-lg transition-all ${activeMenuId === member.id ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:text-slate-600'}`}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {activeMenuId === member.id && (
                          <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 space-y-1">
                              {(canManageMembership || member.id === currentUser?.member_id) && (
                                <button 
                                  onClick={() => { setEditingMember(member); setIsEditModalOpen(true); setActiveMenuId(null); }}
                                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                                >
                                  <Edit3 size={16} />
                                  <span>Edit Member Details</span>
                                </button>
                              )}
                              
                              <div className="h-px bg-gray-50 my-1" />
                              
                              {isAdmin && (
                                <>
                                  <p className="px-3 py-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Team Status</p>
                                  <button 
                                    onClick={() => toggleStatus(member.id, 'Active')}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors"
                                  >
                                    <UserCheck size={16} />
                                    <span>Set Active</span>
                                  </button>
                                  <button 
                                    onClick={() => toggleStatus(member.id, 'Suspended')}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
                                  >
                                    <UserX size={16} />
                                    <span>Set Suspended</span>
                                  </button>
                                  <div className="h-px bg-gray-50 my-1" />
                                  <button 
                                    onClick={() => handleDeleteMember(member.id, member.name)}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                  >
                                    <Trash2 size={16} />
                                    <span>Remove from Team</span>
                                  </button>
                                </>
                              )}
                              
                              <button 
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onViewFinancials?.(member.id);
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                              >
                                <ExternalLink size={16} />
                                <span>Financial Records</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal (Unified Dashboard) */}
      {isProfileModalOpen && selectedProfileMember && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-white/20 transform transition-all scale-100 animate-in fade-in zoom-in duration-300 my-8">
            <div className="relative h-48 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <ShieldCheck size={160} />
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="absolute bottom-0 left-0 w-full p-8 flex items-end space-x-6 translate-y-8">
                <div className="w-28 h-28 rounded-3xl bg-white p-1 shadow-2xl shrink-0">
                  <div className="w-full h-full rounded-[1.25rem] overflow-hidden bg-gray-50 flex items-center justify-center">
                    {selectedProfileMember.photo ? (
                      <img src={selectedProfileMember.photo} alt={selectedProfileMember.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-200" />
                    )}
                  </div>
                </div>
                <div className="pb-10">
                  <h3 className="text-2xl font-black text-white leading-tight">{selectedProfileMember.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-500/40 text-[10px] font-black text-white uppercase tracking-widest rounded border border-white/20">
                      {selectedProfileMember.role}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded ${
                      selectedProfileMember.status === 'Active' ? 'bg-green-500/40 text-green-100 border-green-400/20' : 'bg-red-500/40 text-red-100 border-red-400/20'
                    } border`}>
                      {selectedProfileMember.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-8 pt-12 flex space-x-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'finance', label: 'Financials', icon: HandCoins },
                { id: 'attendance', label: 'Attendance', icon: CheckCircle },
                { id: 'conduct', label: 'Conduct', icon: Gavel },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id as any)}
                  className={`flex items-center space-x-2 pb-4 px-2 text-xs font-black uppercase tracking-[0.15em] transition-all border-b-2 shrink-0 ${
                    profileTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {profileTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Ministry Info</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-700 font-bold">
                            <BadgeCheck size={16} className="text-blue-500" />
                            <span className="text-sm">{selectedProfileMember.voicePart} Section</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500 font-medium">
                            <MapPin size={14} className="text-gray-300" />
                            <span className="text-xs">{selectedProfileMember.cellGroup} Group</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500 font-medium">
                            <CalendarDays size={14} className="text-gray-300" />
                            <span className="text-xs">Joined {new Date(selectedProfileMember.joinedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Contact & Life</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-700 font-bold">
                            <Phone size={16} className="text-blue-500" />
                            <span className="text-sm">{selectedProfileMember.phoneNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500 font-medium">
                            <Gift size={14} className="text-pink-300" />
                            <span className="text-xs">{selectedProfileMember.dateOfBirth || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance Health</p>
                      {(() => {
                        const mRecords = attendanceRecords.filter(r => r.memberId === selectedProfileMember.id);
                        const rate = mRecords.length > 0 
                          ? Math.round((mRecords.filter(r => r.status === 'Present' || r.status === 'Late').length / ( mRecords.length || 1 )) * 100) 
                          : 0;
                        return (
                          <div className="flex items-center space-x-3 mt-1">
                            <p className="text-2xl font-black text-slate-900">{rate}%</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${rate > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {rate > 80 ? 'Excellent' : 'Needs Improvement'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
                      <Activity size={24} className="text-blue-500" />
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'finance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      const mSubs = subscriptions.filter(s => s.memberId === selectedProfileMember.id);
                      const mHarvest = harvests.find(h => h.memberId === selectedProfileMember.id);
                      return (
                        <>
                          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                            <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1">Subscriptions Paid</p>
                            <p className="text-xl font-black text-purple-900">K{mSubs.reduce((a, b) => a + b.amountPaid, 0)}</p>
                          </div>
                          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Harvest Paid</p>
                            <p className="text-xl font-black text-amber-900">K{mHarvest?.amountPaid || 0}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <History size={14} className="mr-2" />
                      Recent Contributions Ledger
                    </h4>
                    <div className="space-y-2">
                      {contributions.filter(c => c.memberId === selectedProfileMember.id).slice(0, 5).map(c => (
                        <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition-shadow">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{c.type}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{c.date}</p>
                          </div>
                          <p className="font-black text-green-600">K{c.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'attendance' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Monthly History Breakdown</h4>
                    <div className="space-y-2">
                      {attendanceRecords.filter(r => r.memberId === selectedProfileMember.id).slice(0, 8).map(r => (
                        <div key={r.id} className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">{new Date(r.date).toLocaleDateString('en-ZM', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                            r.status === 'Present' ? 'bg-green-100 text-green-700' :
                            r.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'conduct' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      const mCases = disciplinaryCases.filter(c => c.memberId === selectedProfileMember.id);
                      const totalFines = mCases.reduce((a, b) => a + b.fineAmount, 0);
                      const paidFines = mCases.reduce((a, b) => a + b.finePaid, 0);
                      return (
                        <>
                          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Open Cases</p>
                            <p className="text-xl font-black text-red-900">{mCases.filter(c => c.status === 'Open').length}</p>
                          </div>
                          <div className="bg-slate-900 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fine Balance</p>
                            <p className="text-xl font-black text-red-400">K{totalFines - paidFines}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-50 flex space-x-4 bg-gray-50/50">
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onViewFinancials?.(selectedProfileMember.id);
                }}
                className="flex-1 py-4 bg-white border border-gray-200 text-slate-700 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm hover:bg-slate-50 active:scale-95"
              >
                <HandCoins size={14} />
                <span>Deep Ledger</span>
              </button>
              {(canManageMembership || selectedProfileMember.id === currentUser?.member_id) && (
                <button 
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setEditingMember(selectedProfileMember);
                    setIsEditModalOpen(true);
                  }}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Edit3 size={14} />
                  <span>Modify Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-xl font-bold">New Member Registration</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {newMember.photo ? (
                      <img src={newMember.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={64} className="text-gray-200" />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'add')} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Identity Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter member's full official name"
                    autoFocus
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Church Cell Group</label>
                  <select 
                    value={newMember.cellGroup}
                    onChange={(e) => setNewMember({ ...newMember, cellGroup: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all text-sm"
                  >
                    {CELL_GROUPS.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mobile Contact</label>
                  <input 
                    type="tel" 
                    placeholder="+260 9xx..."
                    value={newMember.phoneNumber}
                    onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={newMember.dateOfBirth}
                    onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Team Designation</label>
                  <select 
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all text-sm"
                  >
                    <option value="Singer">Singer</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Instrumentalist">Instrumentalist</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Music Dept Official">Music Dept Official</option>
                    <option value="Disciplinary Committee">Disciplinary Committee</option>
                    <option value="Media/Sound">Media/Sound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vocal Section / Part</label>
                  <select 
                    value={newMember.voicePart}
                    onChange={(e) => setNewMember({ ...newMember, voicePart: e.target.value as any })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all text-sm"
                  >
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bass">Bass</option>
                    <option value="Instrumentalist">Instrumentalist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Enrollment Date</label>
                  <input 
                    type="date" 
                    value={newMember.joinedDate}
                    onChange={(e) => setNewMember({ ...newMember, joinedDate: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all text-sm"
                  />
                </div>
              </div>

              {/* SECURITY / PORTAL ACCESS SECTION (ADMIN ONLY) */}
              {isAdmin && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Lock size={18} />
                    </div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em]">Portal Access & Security</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Portal Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="text" 
                          placeholder="Unique identifier"
                          value={newMember.username}
                          onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="password" 
                          placeholder="New access code"
                          value={newMember.password}
                          onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddMember}
                disabled={!newMember.name}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none text-white rounded-2xl font-black shadow-xl shadow-blue-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>Save Member</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Edit3 size={24} />
                </div>
                <h3 className="text-xl font-bold">Edit Member Profile</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {editingMember.photo ? (
                      <img src={editingMember.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={64} className="text-gray-200" />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'edit')} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Official Name</label>
                  <input 
                    type="text" 
                    disabled={!canManageMembership}
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-base disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Church Cell Group</label>
                  <select 
                    value={editingMember.cellGroup}
                    disabled={!canManageMembership}
                    onChange={(e) => setEditingMember({ ...editingMember, cellGroup: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm disabled:opacity-60"
                  >
                    {CELL_GROUPS.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                  <input 
                    type="tel" 
                    value={editingMember.phoneNumber}
                    onChange={(e) => setEditingMember({ ...editingMember, phoneNumber: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date of Birth</label>
                  <input 
                    type="date" 
                    disabled={!canManageMembership}
                    value={editingMember.dateOfBirth}
                    onChange={(e) => setEditingMember({ ...editingMember, dateOfBirth: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Team Role</label>
                  <select 
                    value={editingMember.role}
                    disabled={!canManageMembership}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm disabled:opacity-60"
                  >
                    <option value="Singer">Singer</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Instrumentalist">Instrumentalist</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Music Dept Official">Music Dept Official</option>
                    <option value="Disciplinary Committee">Disciplinary Committee</option>
                    <option value="Media/Sound">Media/Sound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vocal Section</label>
                  <select 
                    value={editingMember.voicePart}
                    disabled={!canManageMembership}
                    onChange={(e) => setEditingMember({ ...editingMember, voicePart: e.target.value as any })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm disabled:opacity-60"
                  >
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bass">Bass</option>
                    <option value="Instrumentalist">Instrumentalist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Team Status</label>
                  <select 
                    value={editingMember.status}
                    disabled={!canManageMembership}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm disabled:opacity-60"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              {/* SECURITY / PORTAL ACCESS SECTION (ADMIN ONLY) */}
              {isAdmin && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Lock size={18} />
                    </div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em]">Update Portal Access</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Current/New Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="text" 
                          placeholder="Unique identifier"
                          value={editingMember.username || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, username: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Secure Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="password" 
                          placeholder="Update access code"
                          value={editingMember.password || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateMember}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
