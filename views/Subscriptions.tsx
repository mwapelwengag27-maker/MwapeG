
import React, { useState } from 'react';
import { SubscriptionRecord, Member, UserRole } from '../types.ts';
import { Search, CreditCard, Filter, CheckCircle2, Clock, AlertCircle, X, Save } from 'lucide-react';

interface SubscriptionsProps {
  members: Member[];
  subscriptions: SubscriptionRecord[];
  setSubscriptions: React.Dispatch<React.SetStateAction<SubscriptionRecord[]>>;
  currentRole: UserRole;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ members, subscriptions, setSubscriptions, currentRole }) => {
  const [editingSub, setEditingSub] = useState<SubscriptionRecord | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit = currentRole === UserRole.ADMIN || currentRole === UserRole.TREASURER;

  const STANDARD_FEE = 10;
  const currentMonth = "May 2024";

  // Combine members and existing subscriptions to ensure everyone is listed
  const allSubData = members.map(m => {
    const existing = subscriptions.find(s => s.memberId === m.id && s.month === currentMonth);
    return existing || {
      id: `new-sub-${m.id}`,
      memberId: m.id,
      memberName: m.name,
      month: currentMonth,
      amountPaid: 0,
      status: 'Unpaid' as 'Unpaid'
    };
  });

  const filteredSubs = allSubData.filter(sub => 
    sub.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (sub: SubscriptionRecord) => {
    if (!canEdit) return;
    setEditingSub(sub);
    setEditAmount(sub.amountPaid.toString());
  };

  const handleSaveUpdate = () => {
    if (!editingSub) return;

    const amount = parseFloat(editAmount) || 0;
    let status: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
    
    if (amount >= STANDARD_FEE) status = 'Paid';
    else if (amount > 0) status = 'Partial';
    else status = 'Unpaid';

    const updatedRecord: SubscriptionRecord = {
      ...editingSub,
      amountPaid: amount,
      status
    };

    setSubscriptions(prev => {
      const exists = prev.some(s => s.memberId === updatedRecord.memberId && s.month === updatedRecord.month);
      if (exists) {
        return prev.map(s => (s.memberId === updatedRecord.memberId && s.month === updatedRecord.month) ? updatedRecord : s);
      }
      return [updatedRecord, ...prev];
    });

    setEditingSub(null);
  };

  const totalCollected = allSubData.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalExpected = allSubData.length * STANDARD_FEE;
  const outstanding = totalExpected - totalCollected;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Monthly Subscriptions</h2>
          <p className="text-gray-500">Track member dues and monthly payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Expected</p>
          <div className="flex items-end space-x-2">
            <p className="text-2xl font-bold text-gray-900">K{totalExpected.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mb-1 font-medium">{currentMonth}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Collected</p>
          <div className="flex items-end space-x-2">
            <p className="text-2xl font-bold text-green-600">K{totalCollected.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mb-1 font-medium">{totalExpected > 0 ? Math.round((totalCollected/totalExpected)*100) : 0}% Met</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Outstanding</p>
          <div className="flex items-end space-x-2">
            <p className="text-2xl font-bold text-red-500">K{outstanding.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mb-1 font-medium">{allSubData.filter(s => s.status !== 'Paid').length} Pending</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by member name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <p className="text-xs font-bold text-blue-700">Standard Fee: K{STANDARD_FEE.toLocaleString()}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (K)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{sub.memberName}</td>
                  <td className="px-6 py-4 font-bold">K{sub.amountPaid}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sub.month}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                        sub.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        sub.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sub.status === 'Paid' && <CheckCircle2 size={14} />}
                        {sub.status === 'Partial' && <Clock size={14} />}
                        {sub.status === 'Unpaid' && <AlertCircle size={14} />}
                        <span>{sub.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canEdit && (
                      <button 
                        onClick={() => handleOpenEdit(sub)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold uppercase tracking-tight transition-colors"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Payment Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Update Subscription</h3>
              </div>
              <button onClick={() => setEditingSub(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Member Name</label>
                <p className="text-lg font-semibold text-gray-900">{editingSub.memberName}</p>
                <p className="text-sm text-gray-400">{editingSub.month}</p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Amount Paid (K)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">K</span>
                  <input 
                    id="amount"
                    type="number" 
                    autoFocus
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xl font-bold transition-all"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">Full subscription amount is <span className="font-bold">K{STANDARD_FEE.toFixed(2)}</span></p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex space-x-3">
              <button 
                onClick={() => setEditingSub(null)}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveUpdate}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all"
              >
                <Save size={18} />
                <span>Save Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
