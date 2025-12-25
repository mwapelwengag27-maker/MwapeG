
import React, { useState, useEffect } from 'react';
import { Member, MemberContribution, UserRole, SubscriptionRecord, HarvestRecord } from '../types.ts';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  HandCoins, 
  X, 
  History, 
  CreditCard, 
  Wheat, 
  Plus, 
  Edit2, 
  Save, 
  Trash2,
  DollarSign
} from 'lucide-react';

interface MemberFinancesProps {
  currentRole: UserRole;
  members: Member[];
  contributions: MemberContribution[];
  setContributions: React.Dispatch<React.SetStateAction<MemberContribution[]>>;
  subscriptions: SubscriptionRecord[];
  harvests: HarvestRecord[];
  initialMemberId?: string;
  onCloseDetail?: () => void;
}

const MemberFinances: React.FC<MemberFinancesProps> = ({ 
  currentRole, 
  members, 
  contributions, 
  setContributions, 
  subscriptions, 
  harvests,
  initialMemberId,
  onCloseDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // State for Payment Entry/Edit Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<MemberContribution | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    memberId: '',
    amount: '',
    type: 'Tithe' as MemberContribution['type'],
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const isTreasurer = currentRole === UserRole.TREASURER || currentRole === UserRole.ADMIN;

  // Handle initial member selection from props
  useEffect(() => {
    if (initialMemberId) {
      const member = members.find(m => m.id === initialMemberId);
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [initialMemberId, members]);

  // Aggregate contributions per member for the table using props
  const memberStats = members.map(m => {
    const totalCont = contributions
      .filter(c => c.memberId === m.id)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const subTotal = subscriptions
      .filter(s => s.memberId === m.id)
      .reduce((acc, curr) => acc + curr.amountPaid, 0);

    const harvestTotal = harvests
      .filter(h => h.memberId === m.id)
      .reduce((acc, curr) => acc + curr.amountPaid, 0);

    return { ...m, totalContribution: totalCont + subTotal + harvestTotal };
  });

  const filteredMembers = memberStats.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberDetails = (memberId: string) => {
    return {
      memberContributions: contributions.filter(c => c.memberId === memberId),
      memberSubscriptions: subscriptions.filter(s => s.memberId === memberId),
      memberHarvest: harvests.find(h => h.memberId === memberId)
    };
  };

  const handleOpenPaymentModal = (member?: Member, payment?: MemberContribution) => {
    if (!isTreasurer) return;
    
    if (payment) {
      setEditingPayment(payment);
      setPaymentForm({
        memberId: payment.memberId,
        amount: payment.amount.toString(),
        type: payment.type,
        date: payment.date,
        note: ''
      });
    } else {
      setEditingPayment(null);
      setPaymentForm({
        memberId: member?.id || '',
        amount: '',
        type: 'Tithe',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    }
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = () => {
    if (!paymentForm.memberId || !paymentForm.amount) return;

    const member = members.find(m => m.id === paymentForm.memberId);
    const amount = parseFloat(paymentForm.amount);
    
    const newPayment: MemberContribution = {
      id: editingPayment?.id || Math.random().toString(36).substr(2, 9),
      memberId: paymentForm.memberId,
      memberName: member?.name || 'Unknown',
      amount: amount,
      type: paymentForm.type,
      date: paymentForm.date
    };

    if (editingPayment) {
      setContributions(prev => prev.map(c => c.id === editingPayment.id ? newPayment : c));
    } else {
      setContributions(prev => [newPayment, ...prev]);
    }

    setIsPaymentModalOpen(false);
    setEditingPayment(null);
  };

  const handleDeletePayment = (id: string) => {
    if (!isTreasurer) return;
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      setContributions(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedMember(null);
    onCloseDetail?.();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Member Financial Hub</h2>
          <p className="text-gray-500">Comprehensive view of all member tithes, subscriptions, and harvest assessments.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          {isTreasurer && (
            <button 
              onClick={() => handleOpenPaymentModal()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
            >
              <Plus size={20} />
              <span>Log New Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by member name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Member List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Voice / Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Contributed (YTD)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-400">Joined: {member.joinedDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700">{member.voicePart}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{member.role}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-blue-600">K{member.totalContribution.toLocaleString()}</p>
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="text-[10px] text-blue-400 hover:text-blue-700 hover:underline inline-flex items-center font-bold uppercase tracking-tighter"
                    >
                      View Breakdown <ArrowUpRight size={10} className="ml-1" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center space-x-2">
                      {isTreasurer && (
                        <button 
                          onClick={() => handleOpenPaymentModal(member)}
                          className="p-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Quick Add Payment"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        member.totalContribution > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {member.totalContribution > 0 ? 'Consistent' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details & History Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-700 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-none">{selectedMember.name}</h3>
                  <p className="text-xs text-blue-200 uppercase tracking-widest mt-1">Financial History</p>
                </div>
              </div>
              <button onClick={handleCloseDetailModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Total Paid</p>
                  <p className="text-xl font-black text-blue-900">
                    K{memberStats.find(m => m.id === selectedMember.id)?.totalContribution.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Part</p>
                  <p className="text-lg font-bold text-gray-800">{selectedMember.voicePart}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                  <div className="flex justify-center mt-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      selectedMember.status === 'Active' ? 'bg-green-100 text-green-700' :
                      selectedMember.status === 'Suspended' ? 'bg-red-100 text-red-700' :
                      selectedMember.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedMember.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Sections */}
              {(() => {
                const details = getMemberDetails(selectedMember.id);
                return (
                  <div className="space-y-8">
                    {/* General Contributions */}
                    <section>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                        <h4 className="flex items-center space-x-2 text-sm font-black text-gray-900 uppercase tracking-widest">
                          <History size={16} className="text-blue-500" />
                          <span>Tithes & Offerings</span>
                        </h4>
                        {isTreasurer && (
                          <button 
                            onClick={() => handleOpenPaymentModal(selectedMember)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-2 py-1 rounded-md"
                          >
                            <Plus size={12} className="mr-1" /> Add Record
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {details.memberContributions.length > 0 ? details.memberContributions.map(c => (
                          <div key={c.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center group/item">
                            <div>
                              <p className="text-sm font-bold text-gray-800">{c.type}</p>
                              <p className="text-xs text-gray-400">{c.date}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <p className="font-bold text-gray-900">K{c.amount.toLocaleString()}</p>
                              {isTreasurer && (
                                <div className="flex space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <button onClick={() => handleOpenPaymentModal(undefined, c)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg">
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDeletePayment(c.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )) : <p className="text-sm text-gray-400 italic py-2">No transaction records found.</p>}
                      </div>
                    </section>

                    {/* Subscriptions section (Unified) */}
                    <section>
                      <h4 className="flex items-center space-x-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                        <CreditCard size={16} className="text-purple-500" />
                        <span>Monthly Subscriptions</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {details.memberSubscriptions.map(s => (
                          <div key={s.id} className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-purple-700 uppercase">{s.month}</p>
                              <p className="text-lg font-black text-gray-900">K{s.amountPaid.toLocaleString()}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${s.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Harvest section */}
                    <section>
                      <h4 className="flex items-center space-x-2 text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">
                        <Wheat size={16} className="text-amber-500" />
                        <span>Harvest Assessment</span>
                      </h4>
                      {details.memberHarvest ? (
                        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Target Assessment</p>
                            <p className="text-2xl font-black text-amber-900 leading-none">K{details.memberHarvest.assessmentAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Current Progress</p>
                            <p className="text-2xl font-black text-green-600 leading-none">K{details.memberHarvest.amountPaid.toLocaleString()}</p>
                          </div>
                        </div>
                      ) : <p className="text-sm text-gray-400 italic py-2 text-center">No assessment set for this member.</p>}
                    </section>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleCloseDetailModal}
                className="px-8 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Payment Entry/Edit Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-xl font-bold">
                  {editingPayment ? 'Edit Transaction' : 'Record New Payment'}
                </h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Member Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Member</label>
                <select 
                  value={paymentForm.memberId}
                  disabled={!!editingPayment}
                  onChange={(e) => setPaymentForm({...paymentForm, memberId: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Type</label>
                  <select 
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                  >
                    <option value="Tithe">Tithe</option>
                    <option value="Offering">Offering</option>
                    <option value="Subscription">Monthly Sub</option>
                    <option value="Harvest">Harvest</option>
                    <option value="UCZ Mission Fund">UCZ Mission Fund</option>
                  </select>
                </div>
                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date Received</label>
                  <input 
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
              </div>

              {/* Amount Entry */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Amount (ZMW)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-300">K</span>
                  <input 
                    type="number"
                    placeholder="0.00"
                    autoFocus
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full pl-12 pr-6 py-5 bg-blue-50/50 border-2 border-blue-100 rounded-3xl focus:ring-8 focus:ring-blue-500/5 focus:border-slate-500 outline-none font-black text-4xl text-blue-600 text-center placeholder:text-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4">
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePayment}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>{editingPayment ? 'Update Payment' : 'Post Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberFinances;
