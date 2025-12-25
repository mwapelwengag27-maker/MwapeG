
import React, { useState } from 'react';
import { MOCK_CONCERTS } from '../constants.tsx';
import { ConcertFinance, UserRole } from '../types.ts';
import { 
  Ticket, 
  Plus, 
  DollarSign, 
  PieChart, 
  Info, 
  MoreHorizontal, 
  X, 
  Save, 
  TrendingDown, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Tag
} from 'lucide-react';

// Added currentRole to props interface to fix type mismatch in App.tsx
interface ConcertFinancesProps {
  currentRole: UserRole;
}

const ConcertFinances: React.FC<ConcertFinancesProps> = ({ currentRole }) => {
  const [concerts, setConcerts] = useState<ConcertFinance[]>(MOCK_CONCERTS);
  const [activeModal, setActiveModal] = useState<'income' | 'new' | null>(null);
  const [selectedConcert, setSelectedConcert] = useState<ConcertFinance | null>(null);
  
  // Transaction Log Form
  const [logValue, setLogValue] = useState({ amount: '', type: 'income', desc: '' });
  
  // New Concert Form
  const [newConcert, setNewConcert] = useState({
    name: '',
    type: 'Other' as ConcertFinance['type'],
    date: new Date().toISOString().split('T')[0],
    budget: ''
  });

  const handleOpenLog = (c: ConcertFinance) => {
    setSelectedConcert(c);
    setActiveModal('income');
    setLogValue({ amount: '', type: 'income', desc: '' });
  };

  const handleSaveLog = () => {
    if (!selectedConcert) return;
    const val = parseFloat(logValue.amount) || 0;
    
    setConcerts(prev => prev.map(c => {
      if (c.id === selectedConcert.id) {
        return {
          ...c,
          actualIncome: logValue.type === 'income' ? c.actualIncome + val : c.actualIncome,
          actualExpense: logValue.type === 'expense' ? c.actualExpense + val : c.actualExpense
        };
      }
      return c;
    }));
    setActiveModal(null);
  };

  const handleCreateConcert = () => {
    if (!newConcert.name || !newConcert.budget) return;

    const concert: ConcertFinance = {
      id: Math.random().toString(36).substr(2, 9),
      concertName: newConcert.name,
      type: newConcert.type,
      date: newConcert.date,
      budget: parseFloat(newConcert.budget),
      actualIncome: 0,
      actualExpense: 0,
      status: 'Planning'
    };

    setConcerts(prev => [concert, ...prev]);
    setActiveModal(null);
    setNewConcert({
      name: '',
      type: 'Other',
      date: new Date().toISOString().split('T')[0],
      budget: ''
    });
  };

  const getTypeStyles = (type: ConcertFinance['type']) => {
    switch (type) {
      case 'Main Ebe':
        return 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white';
      case 'Group':
        return 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white';
      case 'Other':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadge = (type: ConcertFinance['type']) => {
    switch (type) {
      case 'Main Ebe':
        return 'bg-white/20 text-white';
      case 'Group':
        return 'bg-white/20 text-white';
      case 'Other':
        return 'bg-white/20 text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Concert Financials</h2>
          <p className="text-gray-500">Budgeting and income tracking for all Ebenezer events.</p>
        </div>
        <button 
          onClick={() => setActiveModal('new')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>New Concert Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {concerts.map(concert => (
          <div key={concert.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className={`p-6 ${getTypeStyles(concert.type)}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${getTypeBadge(concert.type)}`}>
                  {concert.type === 'Main Ebe' ? 'FLAGSHIP EVENT' : concert.type === 'Group' ? 'GROUP CONCERT' : 'OTHER OUTREACH'}
                </span>
                <button className="text-white/50 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <h3 className="text-2xl font-black mb-1">{concert.concertName}</h3>
              <div className="flex items-center text-sm text-white/80 space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <CalendarIcon size={14} />
                  <span>{concert.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tag size={14} />
                  <span>{concert.status}</span>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Budget Allocation</p>
                <p className="text-2xl font-black text-gray-900">K{concert.budget.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Current Income</p>
                <p className="text-2xl font-black text-green-600">K{concert.actualIncome.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Expenditure</p>
                <p className="text-2xl font-black text-red-500">K{concert.actualExpense.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Net Variance</p>
                <p className={`text-2xl font-black ${concert.actualIncome - concert.actualExpense >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                  K{(concert.actualIncome - concert.actualExpense).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 mt-auto">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                <span>Funding Progress</span>
                <span>{((concert.actualIncome / concert.budget) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    concert.type === 'Main Ebe' ? 'bg-blue-400' : 
                    concert.type === 'Group' ? 'bg-emerald-400' : 'bg-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, (concert.actualIncome / concert.budget) * 100)}%` }}
                ></div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => handleOpenLog(concert)}
                  className="flex-1 py-3 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 border border-gray-100"
                >
                  <DollarSign size={16} />
                  <span>Log Finance</span>
                </button>
                <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-bold transition-colors flex items-center justify-center space-x-2 border border-gray-100">
                  <PieChart size={16} />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
          <Info size={24} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 mb-1">Ebenezer Financial Policy</h4>
          <p className="text-sm text-blue-700/80 leading-relaxed">
            All 'Other' type concerts (outreaches, smaller fests) require a detailed budget breakdown submitted to the Treasurer at least 14 days before the event. Income must be deposited into the main account within 24 hours.
          </p>
        </div>
      </div>

      {/* Log Income/Expense Modal */}
      {activeModal === 'income' && selectedConcert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Post Transaction</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target Event</label>
                <p className="text-xl font-black text-gray-900">{selectedConcert.concertName}</p>
              </div>

              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setLogValue({ ...logValue, type: 'income' })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all ${logValue.type === 'income' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500'}`}
                >
                  <TrendingUp size={18} />
                  <span>Income</span>
                </button>
                <button 
                  onClick={() => setLogValue({ ...logValue, type: 'expense' })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all ${logValue.type === 'expense' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500'}`}
                >
                  <TrendingDown size={18} />
                  <span>Expense</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (ZMW)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">K</span>
                  <input 
                    type="number"
                    value={logValue.amount}
                    onChange={(e) => setLogValue({ ...logValue, amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-2xl font-black transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Note</label>
                <textarea 
                  value={logValue.desc}
                  onChange={(e) => setLogValue({ ...logValue, desc: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all h-24 resize-none"
                  placeholder="Describe the source or expense..."
                />
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4">
              <button 
                onClick={() => setActiveModal(null)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveLog}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Concert Modal */}
      {activeModal === 'new' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                  <Ticket size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Add New Event</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Name</label>
                <input 
                  type="text"
                  value={newConcert.name}
                  onChange={(e) => setNewConcert({ ...newConcert, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all"
                  placeholder="e.g. Mpulungu Outreach 2024"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Main Ebe', 'Group', 'Other'] as ConcertFinance['type'][]).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewConcert({ ...newConcert, type })}
                      className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                        newConcert.type === type 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Date</label>
                  <input 
                    type="date"
                    value={newConcert.date}
                    onChange={(e) => setNewConcert({ ...newConcert, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Budget (K)</label>
                  <input 
                    type="number"
                    value={newConcert.budget}
                    onChange={(e) => setNewConcert({ ...newConcert, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4">
              <button 
                onClick={() => setActiveModal(null)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateConcert}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Plus size={20} />
                <span>Create Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcertFinances;
