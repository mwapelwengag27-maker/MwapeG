
import React, { useState } from 'react';
import { MOCK_PROJECTS, MOCK_PROJECT_TRANSACTIONS } from '../constants.tsx';
import { TeamProject, ProjectTransaction, UserRole } from '../types.ts';
import { 
  Briefcase, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Bike, 
  Beef, 
  Sprout, 
  Egg, 
  Coffee, 
  MoreHorizontal,
  ArrowRight,
  DollarSign,
  History,
  Save,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  'Munkoyo': Coffee,
  'Transport': Bike,
  'Farming': Sprout,
  'Poultry': Egg,
  'Meat Selling': Beef
};

interface ProjectsProps {
  currentRole: UserRole;
}

const Projects: React.FC<ProjectsProps> = ({ currentRole }) => {
  const [projects, setProjects] = useState<TeamProject[]>(MOCK_PROJECTS);
  const [transactions, setTransactions] = useState<ProjectTransaction[]>(MOCK_PROJECT_TRANSACTIONS);
  const [selectedProject, setSelectedProject] = useState<TeamProject | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  
  const isAuthorized = currentRole === UserRole.ADMIN || currentRole === UserRole.TREASURER;

  // Transaction Form State
  const [logForm, setLogForm] = useState({
    projectId: '',
    type: 'Revenue' as 'Revenue' | 'Expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // New Project Form State
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    category: 'Munkoyo' as TeamProject['category'],
    description: '',
    status: 'Active' as TeamProject['status']
  });

  const totalRevenue = projects.reduce((acc, p) => acc + p.totalRevenue, 0);
  const totalExpenses = projects.reduce((acc, p) => acc + p.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const handleOpenLog = (project: TeamProject) => {
    setSelectedProject(project);
    setLogForm({
      ...logForm,
      projectId: project.id
    });
    setIsLogModalOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!logForm.projectId || !logForm.amount) return;

    const amount = parseFloat(logForm.amount);
    const newTransaction: ProjectTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: logForm.projectId,
      date: logForm.date,
      type: logForm.type,
      amount: amount,
      description: logForm.description
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Update project totals
    setProjects(prev => prev.map(p => {
      if (p.id === logForm.projectId) {
        return {
          ...p,
          totalRevenue: logForm.type === 'Revenue' ? p.totalRevenue + amount : p.totalRevenue,
          totalExpenses: logForm.type === 'Expense' ? p.totalExpenses + amount : p.totalExpenses,
          lastUpdate: logForm.date
        };
      }
      return p;
    }));

    setIsLogModalOpen(false);
    setLogForm({
      projectId: '',
      type: 'Revenue',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateProject = () => {
    if (!newProjectForm.name || !newProjectForm.category) return;

    const newProject: TeamProject = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProjectForm.name,
      category: newProjectForm.category,
      description: newProjectForm.description,
      status: newProjectForm.status,
      totalRevenue: 0,
      totalExpenses: 0,
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    setProjects([newProject, ...projects]);
    setIsNewProjectModalOpen(false);
    setNewProjectForm({
      name: '',
      category: 'Munkoyo',
      description: '',
      status: 'Active'
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Team Projects (IGA)</h2>
          <p className="text-gray-500 text-sm">Income Generating Activities to support church ministry.</p>
        </div>
        {isAuthorized && (
          <button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Launch New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cumulative Profit</p>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <TrendingUp size={24} />
            </div>
            <p className="text-3xl font-black text-gray-900">K{totalProfit.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gross Revenue</p>
          <div className="flex items-center space-x-3 text-indigo-600">
            <DollarSign size={24} />
            <p className="text-3xl font-black text-gray-900">K{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl text-white flex flex-col justify-center shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Briefcase size={18} className="text-indigo-400" />
            <h4 className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Active Ventures</h4>
          </div>
          <p className="text-3xl font-black">{projects.filter(p => p.status === 'Active').length}</p>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const Icon = categoryIcons[project.category] || Briefcase;
          const profit = project.totalRevenue - project.totalExpenses;
          const rawMargin = project.totalRevenue > 0 ? ( profit / project.totalRevenue ) * 100 : 0;
          const margin = rawMargin.toFixed(0);

          return (
            <div key={project.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all border-b-4 border-b-indigo-500 bg-opacity-50">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl shadow-sm ${
                    project.status === 'Active' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      project.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      project.status === 'On Hold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {project.status}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">{project.category}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight">{project.name}</h3>
                <p className="text-xs text-gray-500 mb-6 h-8 line-clamp-2 italic">{project.description}</p>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Net Profit</p>
                      <p className={`text-xl font-black ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        K{profit.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Margin</p>
                      <p className="text-sm font-black text-gray-900">{margin}%</p>
                    </div>
                  </div>

                  {/* Tiny Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(0, Number(margin)))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Updated: {project.lastUpdate}
                  </div>
                  <button 
                    onClick={() => handleOpenLog(project)}
                    className="flex items-center space-x-1 text-xs font-black text-indigo-600 uppercase hover:text-indigo-800 transition-colors py-1 px-2 hover:bg-indigo-50 rounded-lg"
                  >
                    <span>Log Finance</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction History Section (General) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <History size={20} className="text-indigo-600" />
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Recent Activity</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.slice(0, 10).map((t) => {
                const project = projects.find(p => p.id === t.projectId);
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{t.date}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm">{project?.name || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 italic">"{t.description}"</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black ${t.type === 'Revenue' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'Revenue' ? '+' : '-'} K{t.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No project transactions recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Launch New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl text-white">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Launch New Venture</h3>
              </div>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Project Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Ebenezer Layer Poultry"
                  autoFocus
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Business Category</label>
                  <select 
                    value={newProjectForm.category}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, category: e.target.value as any })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all appearance-none"
                  >
                    <option value="Munkoyo">Munkoyo</option>
                    <option value="Transport">Transport</option>
                    <option value="Farming">Farming</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Meat Selling">Meat Selling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Initial Status</label>
                  <select 
                    value={newProjectForm.status}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value as any })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Venture Description</label>
                <textarea 
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  placeholder="Describe the goals and operational model..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all h-28 resize-none"
                />
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => setIsNewProjectModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject}
                disabled={!newProjectForm.name}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Plus size={20} />
                <span>Launch Business</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Transaction Modal */}
      {isLogModalOpen && selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Log Project Item</h3>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Project</p>
                <p className="text-xl font-black text-gray-900">{selectedProject.name}</p>
              </div>

              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setLogForm({ ...logForm, type: 'Revenue' })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all ${logForm.type === 'Revenue' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500'}`}
                >
                  <TrendingUp size={18} />
                  <span>Revenue</span>
                </button>
                <button 
                  onClick={() => setLogForm({ ...logForm, type: 'Expense' })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all ${logForm.type === 'Expense' ? 'bg-white text-red-600 shadow-md' : 'text-gray-500'}`}
                >
                  <TrendingDown size={18} />
                  <span>Expense</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (ZMW)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-indigo-300">K</span>
                    <input 
                      type="number"
                      autoFocus
                      value={logForm.amount}
                      onChange={(e) => setLogForm({ ...logForm, amount: e.target.value })}
                      className="w-full pl-10 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-3xl font-black text-indigo-600 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction Date</label>
                   <input 
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Note</label>
                <textarea 
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all h-24 resize-none"
                  placeholder="e.g. Logistics returns / Fuel purchase..."
                />
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4">
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTransaction}
                disabled={!logForm.amount || !logForm.description}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
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

export default Projects;
