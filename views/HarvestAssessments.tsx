
import React, { useState } from 'react';
import { HarvestRecord, Member, UserRole } from '../types.ts';
import { Wheat, Plus, Search, TrendingUp, UserCheck, X, Save, Edit2, UserPlus } from 'lucide-react';

// Added currentRole to props interface to fix type mismatch in App.tsx
interface HarvestAssessmentsProps {
  members: Member[];
  harvests: HarvestRecord[];
  setHarvests: React.Dispatch<React.SetStateAction<HarvestRecord[]>>;
  currentRole: UserRole;
}

const HarvestAssessments: React.FC<HarvestAssessmentsProps> = ({ members, harvests, setHarvests, currentRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingHarvest, setEditingHarvest] = useState<HarvestRecord | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  // Edit Form State
  const [editValues, setEditValues] = useState({ assessment: '', paid: '' });
  
  // New Assessment Form State
  const [newForm, setNewForm] = useState({
    memberId: '',
    assessmentAmount: ''
  });

  const totalTarget = harvests.reduce((a, b) => a + b.assessmentAmount, 0);
  const totalCollected = harvests.reduce((a, b) => a + b.amountPaid, 0);
  const progress = totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0;

  const filteredHarvests = harvests.filter(h => 
    h.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (h: HarvestRecord) => {
    setEditingHarvest(h);
    setEditValues({
      assessment: h.assessmentAmount.toString(),
      paid: h.amountPaid.toString()
    });
  };

  const handleSaveEdit = () => {
    if (!editingHarvest) return;
    
    const assessment = parseFloat(editValues.assessment) || 0;
    const paid = parseFloat(editValues.paid) || 0;
    const status = paid >= assessment ? 'Met' : 'Pending';

    setHarvests(prev => prev.map(h => 
      h.id === editingHarvest.id 
        ? { ...h, assessmentAmount: assessment, amountPaid: paid, status }
        : h
    ));
    setEditingHarvest(null);
  };

  const handleCreateNew = () => {
    if (!newForm.memberId || !newForm.assessmentAmount) return;
    
    const member = members.find(m => m.id === newForm.memberId);
    if (!member) return;

    if (harvests.some(h => h.memberId === newForm.memberId)) {
      alert("This member already has a harvest assessment. Please edit the existing record.");
      return;
    }

    const assessmentAmount = parseFloat(newForm.assessmentAmount);
    const newRecord: HarvestRecord = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: newForm.memberId,
      memberName: member.name,
      assessmentAmount: assessmentAmount,
      amountPaid: 0,
      status: 'Pending'
    };

    setHarvests(prev => [newRecord, ...prev]);
    setIsNewModalOpen(false);
    setNewForm({ memberId: '', assessmentAmount: '' });
  };

  // Members not yet assessed
  const unassessedMembers = members.filter(m => 
    !harvests.some(h => h.memberId === m.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Harvest Assessments</h2>
          <p className="text-gray-500">Track annual harvest contributions and member pledges.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>New Assessment</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
              <Wheat size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Team Harvest Progress</p>
              <p className="text-3xl font-black text-gray-900">K{totalCollected.toLocaleString()} / K{totalTarget.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-amber-600">{progress.toFixed(0)}%</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">of Goal Met</p>
          </div>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <UserCheck size={18} className="text-green-600" />
              <span className="text-sm font-black uppercase tracking-widest">Assessment Records</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Find member..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm outline-none w-48 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredHarvests.map((h) => (
              <div key={h.id} className="p-5 flex items-center justify-between hover:bg-amber-50/30 transition-colors group">
                <div>
                  <p className="font-black text-gray-900">{h.memberName}</p>
                  <p className="text-xs text-gray-500 font-medium">Target Assessment: <span className="text-gray-900 font-bold">K{h.assessmentAmount.toLocaleString()}</span></p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="font-black text-amber-600 text-lg">K{h.amountPaid.toLocaleString()}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      h.status === 'Met' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleOpenEdit(h)}
                    className="p-2 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    title="Edit Record"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {filteredHarvests.length === 0 && (
              <div className="p-10 text-center text-gray-400 italic">
                No assessments found matching your search.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="text-blue-400" size={20} />
                <h3 className="font-black text-xs uppercase tracking-widest">Collection Strategy</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">
                "Our harvest drive goal is K{totalTarget.toLocaleString()}. Encourage all members to fulfill at least 50% of their assessment by the next quarter review."
              </p>
              <div className="mt-8 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Upcoming Milestone</p>
                  <p className="font-black text-amber-400">Quarterly Harvest Review</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold">June 15th</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assessments Met</p>
              <p className="text-2xl font-black text-gray-900">
                {harvests.filter(h => h.status === 'Met').length} <span className="text-sm text-gray-400 font-medium">/ {harvests.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Assessment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-amber-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <UserPlus size={20} />
                </div>
                <h3 className="text-xl font-bold">New Assessment</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Member</label>
                <select 
                  value={newForm.memberId}
                  onChange={(e) => setNewForm({ ...newForm, memberId: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none font-bold text-gray-700 transition-all"
                >
                  <option value="">-- Choose Member --</option>
                  {unassessedMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.voicePart})</option>
                  ))}
                </select>
                {unassessedMembers.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-2 font-bold italic uppercase tracking-tighter">
                    All members have already been assessed.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assessment Target (ZMW)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-amber-300">K</span>
                  <input 
                    type="number"
                    value={newForm.assessmentAmount}
                    onChange={(e) => setNewForm({ ...newForm, assessmentAmount: e.target.value })}
                    className="w-full pl-12 pr-6 py-5 bg-amber-50/50 border-2 border-amber-100 rounded-3xl focus:ring-8 focus:ring-amber-500/5 focus:border-amber-500 outline-none font-black text-3xl text-amber-600 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNew}
                disabled={!newForm.memberId || !newForm.assessmentAmount}
                className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:shadow-none text-white rounded-2xl font-black shadow-xl shadow-amber-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>Set Target</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Harvest Modal */}
      {editingHarvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <Wheat size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Edit Harvest Record</h3>
              </div>
              <button onClick={() => setEditingHarvest(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Member Name</p>
                <p className="text-xl font-black text-gray-900">{editingHarvest.memberName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Goal (K)</label>
                  <input 
                    type="number"
                    value={editValues.assessment}
                    onChange={(e) => setEditValues({ ...editValues, assessment: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Paid (K)</label>
                  <input 
                    type="number"
                    value={editValues.paid}
                    onChange={(e) => setEditValues({ ...editValues, paid: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none font-black text-green-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => setEditingHarvest(null)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-xl shadow-amber-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestAssessments;
