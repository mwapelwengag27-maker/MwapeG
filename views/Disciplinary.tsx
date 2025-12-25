
import React, { useState, useRef } from 'react';
import { DisciplinaryCase, GroupRule, Member, ViolationPreset, UserRole, CommitteeMember } from '../types.ts';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Hammer, 
  X, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Gavel,
  DollarSign,
  Users,
  History,
  Scroll,
  Book,
  Trash2,
  Upload,
  FileText,
  Download,
  Settings2,
  Lock,
  UserPlus,
  BadgeCheck,
  Award,
  Paperclip
} from 'lucide-react';

interface DisciplinaryProps {
  members: Member[];
  cases: DisciplinaryCase[];
  setCases: React.Dispatch<React.SetStateAction<DisciplinaryCase[]>>;
  rules: GroupRule[];
  setRules: React.Dispatch<React.SetStateAction<GroupRule[]>>;
  committeeMembers: CommitteeMember[];
  setCommitteeMembers: React.Dispatch<React.SetStateAction<CommitteeMember[]>>;
  currentRole: UserRole;
}

const INITIAL_VIOLATIONS: ViolationPreset[] = [
  { id: 'v1', label: 'Lateness (Practice)', amount: 5, category: 'Punctuality' },
  { id: 'v2', label: 'Lateness (Service)', amount: 10, category: 'Punctuality' },
  { id: 'v3', label: 'Missing Practice', amount: 15, category: 'Attendance' },
  { id: 'v4', label: 'Wrong Uniform', amount: 30, category: 'Appearance' },
  { id: 'v5', label: 'Missing Service', amount: 20, category: 'Attendance' },
  { id: 'v6', label: 'Noise/Disturbance', amount: 5, category: 'Conduct' },
];

const Disciplinary: React.FC<DisciplinaryProps> = ({ 
  members, 
  cases, 
  setCases, 
  rules, 
  setRules, 
  committeeMembers, 
  setCommitteeMembers, 
  currentRole 
}) => {
  const [violations, setViolations] = useState<ViolationPreset[]>(INITIAL_VIOLATIONS);
  const [activeTab, setActiveTab] = useState<'cases' | 'summary' | 'rules' | 'settings' | 'committee'>('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'add' | 'fine' | 'rule' | 'violation' | 'comm-member' | null>(null);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(null);
  
  const ruleFileInputRef = useRef<HTMLInputElement>(null);

  const isMember = currentRole === UserRole.MEMBER;
  // Expanded permissions to include the Disciplinary Committee portal role
  const canModifyRecords = [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.DISCIPLINARY].includes(currentRole);
  const canAudit = [UserRole.ADMIN, UserRole.TREASURER, UserRole.SECRETARIAT, UserRole.DISCIPLINARY].includes(currentRole);

  // Form States
  const [newCase, setNewCase] = useState({
    memberId: '',
    issue: '',
    resolution: '',
    fineAmount: '0'
  });
  const [newRule, setNewRule] = useState({
    title: '',
    description: '',
    category: 'General' as GroupRule['category'],
    effectiveDate: new Date().toISOString().split('T')[0],
    fileName: ''
  });
  const [newViolation, setNewViolation] = useState({
    label: '',
    amount: '',
    category: 'Conduct'
  });
  const [newCommMember, setNewCommMember] = useState({
    memberId: '',
    committeeRole: 'Member' as CommitteeMember['committeeRole']
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  const filteredCases = cases.filter(c => 
    c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRules = rules.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const memberSummaries = members.map(member => {
    const memberCases = cases.filter(c => c.memberId === member.id);
    const totalFined = memberCases.reduce((acc, c) => acc + c.fineAmount, 0);
    const totalPaid = memberCases.reduce((acc, c) => acc + c.finePaid, 0);
    return {
      ...member,
      totalFined,
      totalPaid,
      balance: totalFined - totalPaid,
      casesCount: memberCases.length
    };
  }).filter(m => m.totalFined > 0);

  const totalOutstanding = cases.reduce((acc, curr) => acc + (curr.fineAmount - curr.finePaid), 0);
  const openCasesCount = cases.filter(c => c.status === 'Open').length;

  const handleAddCase = () => {
    if (!canModifyRecords || !newCase.memberId || !newCase.issue) return;
    const member = members.find(m => m.id === newCase.memberId);
    
    const caseRecord: DisciplinaryCase = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: newCase.memberId,
      memberName: member?.name || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      issue: newCase.issue,
      resolution: newCase.resolution || 'Pending restoration',
      status: 'Open',
      fineAmount: parseFloat(newCase.fineAmount) || 0,
      finePaid: 0
    };

    setCases(prev => [caseRecord, ...prev]);
    setActiveModal(null);
    setNewCase({ memberId: '', issue: '', resolution: '', fineAmount: '0' });
  };

  const handleAddRule = () => {
    if (!canModifyRecords || !newRule.title || !newRule.description) return;
    
    const ruleEntry: GroupRule = {
      id: Math.random().toString(36).substr(2, 9),
      title: newRule.title,
      description: newRule.description,
      category: newRule.category,
      effectiveDate: newRule.effectiveDate,
      fileName: newRule.fileName || undefined
    };

    setRules(prev => [ruleEntry, ...prev]);
    setActiveModal(null);
    setNewRule({
      title: '',
      description: '',
      category: 'General',
      effectiveDate: new Date().toISOString().split('T')[0],
      fileName: ''
    });
  };

  const handleRuleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewRule(prev => ({ ...prev, fileName: file.name }));
    }
  };

  const handleDownload = (fileName: string) => {
    const element = document.createElement("a");
    const file = new Blob([`Simulated secure content for official team document: ${fileName}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAddCommMember = () => {
    if (!canModifyRecords || !newCommMember.memberId) return;
    const member = members.find(m => m.id === newCommMember.memberId);
    if (!member) return;

    const entry: CommitteeMember = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: newCommMember.memberId,
      name: member.name,
      committeeRole: newCommMember.committeeRole,
      appointedDate: new Date().toISOString().split('T')[0]
    };
    setCommitteeMembers(prev => [...prev, entry]);
    setActiveModal(null);
  };

  const handleUpdateFine = () => {
    if (!canModifyRecords || !selectedCase) return;
    const amount = parseFloat(paymentAmount) || 0;
    
    setCases(prev => prev.map(c => {
      if (c.id === selectedCase.id) {
        const newPaid = c.finePaid + amount;
        return { 
          ...c, 
          finePaid: Math.min(newPaid, c.fineAmount),
          status: (newPaid >= c.fineAmount) ? 'Closed' : c.status
        };
      }
      return c;
    }));
    setActiveModal(null);
    setPaymentAmount('');
    setSelectedCase(null);
  };

  const toggleCaseStatus = (caseId: string) => {
    if (!canModifyRecords) return;
    setCases(prev => prev.map(c => 
      c.id === caseId 
        ? { ...c, status: c.status === 'Open' ? 'Closed' : 'Open' } 
        : c
    ));
  };

  const tabs = [
    { id: 'cases', label: isMember ? 'My Conduct Record' : 'Violations Log', icon: History, roles: [UserRole.ADMIN, UserRole.DISCIPLINARY, UserRole.SECRETARIAT, UserRole.MEMBER] },
    { id: 'committee', label: 'Disciplinary Committee', icon: Award, roles: [UserRole.ADMIN, UserRole.DISCIPLINARY, UserRole.SECRETARIAT, UserRole.MEMBER] },
    { id: 'rules', label: 'Team Rules', icon: Scroll, roles: [UserRole.ADMIN, UserRole.DISCIPLINARY, UserRole.SECRETARIAT, UserRole.MEMBER] },
    { id: 'summary', label: 'Fines Audit', icon: Users, roles: [UserRole.ADMIN, UserRole.DISCIPLINARY, UserRole.TREASURER, UserRole.SECRETARIAT] },
    { id: 'settings', label: 'Standard Penalties', icon: Settings2, roles: [UserRole.ADMIN, UserRole.DISCIPLINARY, UserRole.SECRETARIAT] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <ShieldAlert className="mr-3 text-red-600" size={28} />
            Disciplinary Committee Module
          </h2>
          <p className="text-slate-500 text-sm font-medium">Restoring order and spiritual accountability in Ebenezer Praise.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {canModifyRecords ? (
            <>
              {activeTab === 'committee' && (
                <button 
                  onClick={() => setActiveModal('comm-member')}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-xs"
                >
                  <UserPlus size={16} />
                  <span>Appoint Officer</span>
                </button>
              )}
              {activeTab === 'cases' && (
                <button 
                  onClick={() => setActiveModal('add')}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95 text-xs"
                >
                  <Plus size={16} />
                  <span>Log Infringement</span>
                </button>
              )}
              {activeTab === 'rules' && (
                <button 
                  onClick={() => setActiveModal('rule')}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-xs"
                >
                  <Plus size={16} />
                  <span>Legislate Rule</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
               <Lock size={12} />
               <span>Personnel Records Access</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unresolved Cases</p>
            <p className="text-2xl font-black text-slate-900">{openCasesCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Hammer size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aggregated Arrears</p>
            <p className="text-2xl font-black text-slate-900">K{totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex items-center">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-1">
              <Gavel size={16} className="text-blue-400" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Restoration Hub</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">Ethics tempered with grace.</p>
          </div>
          <Scroll size={60} className="absolute -right-4 -bottom-4 text-white opacity-5" />
        </div>
      </div>

      <div className="flex space-x-6 border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.filter(t => t.roles.includes(currentRole)).map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 shrink-0 ${activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <div className="flex items-center space-x-2">
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden min-h-[400px]">
        {activeTab === 'cases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[150px]">Member Involved</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">The Charge / Issue</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current State</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fine Flow</th>
                  {canModifyRecords && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Oversight</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{c.memberName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Case Record {c.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-2">{c.issue}</p>
                      <p className="text-[9px] text-slate-400 font-black mt-1 uppercase tracking-widest">{c.date}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        c.status === 'Open' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {c.status === 'Open' ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                        <span>{c.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-black text-xs ${c.fineAmount - c.finePaid > 0 ? 'text-red-500' : 'text-slate-900'}`}>
                        K{c.finePaid} / K{c.fineAmount}
                      </p>
                    </td>
                    {canModifyRecords && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center space-x-2">
                          <button 
                            onClick={() => { setSelectedCase(c); setActiveModal('fine'); }}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Record Payment"
                          >
                            <DollarSign size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Switch case ${c.id} to ${c.status === 'Open' ? 'CLOSED' : 'OPEN'} status?`)) {
                                toggleCaseStatus(c.id);
                              }
                            }}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Toggle Verdict"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic text-sm">Clear conduct history for current selection.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'committee' && (
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {committeeMembers.map((cm) => (
                <div key={cm.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl transition-all duration-500">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xl">
                    <BadgeCheck size={40} className="text-blue-400" />
                  </div>
                  <h4 className="font-black text-slate-900 text-xl leading-tight mb-2">{cm.name}</h4>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${
                    cm.committeeRole === 'Chairperson' ? 'bg-red-100 text-red-700' : 
                    cm.committeeRole === 'Secretary' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {cm.committeeRole}
                  </span>
                  <div className="pt-6 border-t border-slate-200 w-full">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Serving Since</p>
                    <p className="text-xs font-black text-slate-600">{cm.appointedDate}</p>
                  </div>
                  {canModifyRecords && (
                    <button 
                      onClick={() => {
                        if (window.confirm('Revoke appointment from committee?')) {
                          setCommitteeMembers(prev => prev.filter(p => p.id !== cm.id));
                        }
                      }}
                      className="mt-6 p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col group hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-red-50 text-red-600 rounded-[1.5rem]">
                    <Book size={24} />
                  </div>
                  <span className="text-[10px] font-black text-red-700 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    {rule.category}
                  </span>
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3">{rule.title}</h4>
                <p className="text-sm text-gray-600 italic leading-relaxed mb-8 flex-1 font-medium">"{rule.description}"</p>
                {rule.fileName && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 text-slate-600">
                    <FileText size={18} className="shrink-0 text-red-500" />
                    <span className="text-[10px] font-black truncate px-3 uppercase tracking-widest">{rule.fileName}</span>
                    <button 
                      onClick={() => handleDownload(rule.fileName!)}
                      className="p-1 hover:text-red-600 transition-colors"
                      title="Download Official Policy"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                )}
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span>Eff: {rule.effectiveDate}</span>
                  {canModifyRecords && (
                    <button onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))} className="text-slate-300 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'summary' && canAudit && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Identity</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Infractions</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fines Levied</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settled</th>
                  <th className="px-6 py-4 text-[10px] font-black text-red-600 uppercase tracking-widest text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberSummaries.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.role}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {m.casesCount} Entry
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold">K{m.totalFined}</td>
                    <td className="px-6 py-4 text-right font-black text-sm text-green-600">K{m.totalPaid}</td>
                    <td className="px-6 py-4 text-right font-black text-sm text-red-600">K{m.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {activeModal === 'comm-member' && canModifyRecords && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold tracking-tight">Appoint Committee Member</h3>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">1. Choose Ministry Member</label>
                  <select 
                    value={newCommMember.memberId} 
                    onChange={(e) => setNewCommMember({...newCommMember, memberId: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                  >
                    <option value="">-- Active Directory --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">2. Role in Committee</label>
                  <select 
                    value={newCommMember.committeeRole} 
                    onChange={(e) => setNewCommMember({...newCommMember, committeeRole: e.target.value as any})}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                  >
                    <option value="Member">Regular Member</option>
                    <option value="Chairperson">Committee Chairperson</option>
                    <option value="Secretary">Committee Secretary</option>
                  </select>
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex space-x-4 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={handleAddCommMember} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Grant Mandate</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Rule Modal */}
      {activeModal === 'rule' && canModifyRecords && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-xl font-bold tracking-tight">Legislate Team Rule</h3>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rule Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mandatory Voice Training Policy"
                  value={newRule.title}
                  onChange={(e) => setNewRule({...newRule, title: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-slate-500/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Classification</label>
                  <select 
                    value={newRule.category}
                    onChange={(e) => setNewRule({...newRule, category: e.target.value as any})}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-slate-500/5 appearance-none"
                  >
                    <option value="General">General</option>
                    <option value="Punctuality">Punctuality</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Conduct">Conduct</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Effective Date</label>
                  <input 
                    type="date"
                    value={newRule.effectiveDate}
                    onChange={(e) => setNewRule({...newRule, effectiveDate: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-slate-500/5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Policy Description</label>
                <textarea 
                  placeholder="Full text of the rule..."
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium outline-none h-32 resize-none focus:ring-4 focus:ring-slate-500/5 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Document</label>
                <button 
                  onClick={() => ruleFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 border-2 border-dashed border-red-200 rounded-2xl text-red-600 hover:bg-red-100 transition-all group"
                >
                  <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Attach Rule PDF/DOC</span>
                </button>
                <input 
                  type="file" 
                  ref={ruleFileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleRuleFileChange} 
                />
                {newRule.fileName && (
                  <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center space-x-2 animate-in fade-in">
                    <Paperclip size={14} className="text-green-600" />
                    <p className="text-[10px] font-bold text-green-700 truncate">{newRule.fileName}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Discard</button>
              <button onClick={handleAddRule} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-500/20 active:scale-95 transition-all">Publish Rule</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Violation Modal */}
      {activeModal === 'add' && canModifyRecords && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-red-600 text-white">
              <h3 className="text-xl font-bold tracking-tight">Record Conduct Incident</h3>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">1. Identify Target</label>
                  <select 
                    value={newCase.memberId} onChange={(e) => setNewCase({ ...newCase, memberId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-red-500/5 appearance-none transition-all"
                  >
                    <option value="">-- Active Members --</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">2. Load Penalty Preset</label>
                  <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {violations.map((v) => (
                      <button
                        key={v.id} type="button"
                        onClick={() => setNewCase({...newCase, issue: v.label, fineAmount: v.amount.toString()})}
                        className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${
                          newCase.issue === v.label ? 'border-red-500 bg-red-50 shadow-inner' : 'border-gray-100 bg-white hover:border-red-200'
                        }`}
                      >
                        <span className="text-[10px] font-black text-gray-800 text-center leading-tight uppercase tracking-widest">{v.label}</span>
                        <span className="text-sm font-black text-red-600 mt-2">K{v.amount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">3. Incident Evidence / Note</label>
                  <textarea 
                    value={newCase.issue} onChange={(e) => setNewCase({ ...newCase, issue: e.target.value })}
                    placeholder="Specific details of the breach..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm h-32 resize-none focus:ring-4 focus:ring-red-500/5 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Penalty (K)</label>
                    <input type="number" value={newCase.fineAmount} onChange={(e) => setNewCase({...newCase, fineAmount: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-red-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Initial Resolution</label>
                    <input type="text" value={newCase.resolution} onChange={(e) => setNewCase({...newCase, resolution: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold" placeholder="Immediate outcome..." />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancel</button>
              <button onClick={handleAddCase} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-500/40 active:scale-95 transition-all">Log Official Violation</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Fine Payment Modal */}
      {activeModal === 'fine' && selectedCase && canModifyRecords && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-amber-600 text-white">
              <div className="flex items-center space-x-3">
                <DollarSign size={24} />
                <h3 className="text-xl font-bold tracking-tight">Record Fine Settlement</h3>
              </div>
              <button onClick={() => { setActiveModal(null); setSelectedCase(null); }} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-6">
               <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Target Member</p>
                  <p className="text-lg font-black text-slate-900">{selectedCase.memberName}</p>
                  <p className="text-xs text-slate-500 mt-1 italic leading-tight">"{selectedCase.issue}"</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Fine</p>
                    <p className="text-xl font-black text-slate-700">K{selectedCase.fineAmount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Still Owed</p>
                    <p className="text-xl font-black text-red-600">K{selectedCase.fineAmount - selectedCase.finePaid}</p>
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 text-center">Amount being paid now (K)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-amber-300">K</span>
                    <input 
                      type="number"
                      autoFocus
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-3xl text-center text-amber-600 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                    />
                  </div>
               </div>
            </div>
            <div className="p-8 bg-slate-50 flex space-x-4 border-t border-gray-100">
              <button onClick={() => { setActiveModal(null); setSelectedCase(null); }} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={handleUpdateFine} className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disciplinary;
