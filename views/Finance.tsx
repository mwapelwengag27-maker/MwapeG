
import React, { useState, useMemo } from 'react';
import { FinancialRecord, UserRole } from '../types.ts';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  X, 
  Save, 
  DollarSign, 
  PieChart, 
  Calendar as CalendarIcon,
  Tag,
  FileSpreadsheet,
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
  Layers,
  ShoppingBag,
  Printer,
  ShieldCheck,
  Settings2
} from 'lucide-react';
import { getTeamSummary } from '../geminiService.ts';

interface FinanceProps {
  records: FinancialRecord[];
  setRecords: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
  currentRole: UserRole;
}

const Finance: React.FC<FinanceProps> = ({ records, setRecords, currentRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Tithes',
    amount: '',
    type: 'Income' as 'Income' | 'Expense'
  });

  const [reportConfig, setReportConfig] = useState({
    type: 'Quarterly' as 'Quarterly' | 'Annual',
    year: '2024',
    quarter: '1' 
  });

  const canEdit = currentRole === UserRole.ADMIN || currentRole === UserRole.TREASURER;

  const reportData = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(r => {
        const date = new Date(r.date);
        const yearMatch = date.getFullYear().toString() === reportConfig.year;
        if (reportConfig.type === 'Annual') return yearMatch;
        const month = date.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        return yearMatch && quarter.toString() === reportConfig.quarter;
      });
  }, [records, reportConfig]);

  const reportStats = useMemo(() => {
    const incomeRecords = reportData.filter(r => r.type === 'Income');
    const expenseRecords = reportData.filter(r => r.type === 'Expense');
    
    const income = incomeRecords.reduce((a, b) => a + b.amount, 0);
    const expense = expenseRecords.reduce((a, b) => a + b.amount, 0);
    
    const incomeByCat: Record<string, number> = {};
    incomeRecords.forEach(r => {
      incomeByCat[r.category] = (incomeByCat[r.category] || 0) + r.amount;
    });

    const expenseByCat: Record<string, number> = {};
    expenseRecords.forEach(r => {
      expenseByCat[r.category] = (expenseByCat[r.category] || 0) + r.amount;
    });

    const topCategory = Object.entries(incomeByCat).sort((a, b) => b[1] - (a[1] as number))[0]?.[0] || 'N/A';

    return { income, expense, balance: income - expense, topCategory, incomeByCat, expenseByCat };
  }, [reportData]);

  const totalIncome = records.filter(f => f.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = records.filter(f => f.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);

  const handleExport = (dataToExport: FinancialRecord[], fileNamePrefix: string) => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (ZMW)'];
    const rows = dataToExport.map(r => [
      r.date, 
      `"${r.description.replace(/"/g, '""')}"`, 
      r.category, 
      r.type, 
      r.amount
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateAIReport = async () => {
    setIsGeneratingAI(true);
    const insight = await getTeamSummary({
      reportType: reportConfig.type,
      period: reportConfig.type === 'Quarterly' ? `Q${reportConfig.quarter} ${reportConfig.year}` : reportConfig.year,
      income: reportStats.income,
      expense: reportStats.expense,
      balance: reportStats.balance,
      transactions: reportData.length,
      topCategory: reportStats.topCategory,
      incomeCategories: reportStats.incomeByCat,
      expenseCategories: reportStats.expenseByCat
    });
    setAiInsight(insight);
    setIsGeneratingAI(false);
  };

  const handleSaveTransaction = () => {
    if (!form.description || !form.amount || !canEdit) return;
    const newEntry: FinancialRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: form.date,
      description: form.description,
      category: form.category,
      type: form.type,
      amount: parseFloat(form.amount) || 0
    };
    setRecords(prev => [newEntry, ...prev]);
    setIsModalOpen(false);
    setForm({ date: new Date().toISOString().split('T')[0], description: '', category: 'Tithes', amount: '', type: 'Income' });
  };

  const categories = form.type === 'Income' 
    ? ['Tithes', 'Offerings', 'Donations', 'UCZ Mission Fund', 'Project Revenue', 'Concert Proceeds']
    : ['Equipment', 'Repairs', 'Transport', 'Uniforms', 'Welfare', 'Admin Costs', 'Miscellaneous'];

  const formatDateReadable = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZM', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Treasury</h2>
          <p className="text-slate-500 text-sm font-medium">Mpulungu Central Ebenezer Praise Team Cashbook.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setAiInsight(null); setIsReportModalOpen(true); }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
          {canEdit && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-black shadow-xl transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Fund Balance</p>
            <p className={`text-4xl font-black ${totalIncome - totalExpense >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              K{(totalIncome - totalExpense).toLocaleString()}
            </p>
          </div>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <PieChart size={96} className="text-slate-900" />
          </div>
        </div>
        <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Yearly Inflow</p>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <ArrowUpRight size={24} />
            </div>
            <p className="text-3xl font-black text-emerald-900">K{totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-rose-50/50 p-8 rounded-[2rem] border border-rose-100 shadow-sm">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Yearly Outflow</p>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/20">
              <ArrowDownLeft size={24} />
            </div>
            <p className="text-3xl font-black text-rose-900">K{totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet size={18} className="text-slate-400" />
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">Primary Ledger History</h3>
          </div>
          <button 
            onClick={() => handleExport(records, 'general_ledger')}
            className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation / Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (ZMW)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-xs font-black text-slate-400 whitespace-nowrap uppercase tracking-tighter">
                    {formatDateReadable(record.date)}
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
                      {record.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900 leading-tight">{record.description}</p>
                    <p className={`text-[10px] font-black uppercase mt-1 tracking-tighter ${record.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {record.type} Recording
                    </p>
                  </td>
                  <td className={`px-8 py-6 text-right whitespace-nowrap`}>
                    <p className={`text-lg font-black ${record.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {record.type === 'Income' ? '+' : '-'} K{record.amount.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <FileSpreadsheet className="text-slate-300" size={32} />
                      </div>
                      <p className="text-slate-400 font-bold italic text-sm">No ledger entries detected in current selection.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERHAULED Report Center Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-6xl overflow-hidden border border-white/20 transform transition-all scale-100 animate-in fade-in zoom-in duration-300 my-8">
            
            {/* Report Header */}
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3">
                  <BarChart3 size={32} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Statement of Accounts</h3>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {reportConfig.type} AUDIT
                    </span>
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Fiscal Period: {reportConfig.type === 'Quarterly' ? `Quarter ${reportConfig.quarter}` : 'Yearly'} {reportConfig.year}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                >
                  <Printer size={16} />
                  <span>Print Report</span>
                </button>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-3 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Sidebar Settings */}
              <div className="lg:col-span-3 space-y-8 no-print">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                    <Settings2 size={14} className="mr-2" /> Report Parameters
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                      <button 
                        onClick={() => setReportConfig({ ...reportConfig, type: 'Quarterly' })}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${reportConfig.type === 'Quarterly' ? 'bg-white text-slate-900 shadow-md' : 'text-gray-400 hover:text-slate-600'}`}
                      >
                        Quarterly
                      </button>
                      <button 
                        onClick={() => setReportConfig({ ...reportConfig, type: 'Annual' })}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${reportConfig.type === 'Annual' ? 'bg-white text-slate-900 shadow-md' : 'text-gray-400 hover:text-slate-600'}`}
                      >
                        Annual
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Select Year</label>
                        <select 
                          value={reportConfig.year}
                          onChange={(e) => setReportConfig({ ...reportConfig, year: e.target.value })}
                          className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="2023">Fiscal 2023</option>
                          <option value="2024">Fiscal 2024</option>
                          <option value="2025">Fiscal 2025</option>
                        </select>
                      </div>
                      {reportConfig.type === 'Quarterly' && (
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Select Quarter</label>
                          <select 
                            value={reportConfig.quarter}
                            onChange={(e) => setReportConfig({ ...reportConfig, quarter: e.target.value })}
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="1">Q1 (Jan - Mar)</option>
                            <option value="2">Q2 (Apr - Jun)</option>
                            <option value="3">Q3 (Jul - Sep)</option>
                            <option value="4">Q4 (Oct - Dec)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center">
                        <Sparkles size={14} className="mr-2" />
                        Strategic Insight
                      </h5>
                      <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <ShieldCheck size={14} className="text-blue-300" />
                      </div>
                    </div>
                    {aiInsight ? (
                      <p className="text-xs text-blue-100 leading-relaxed italic border-l-2 border-blue-500/50 pl-5 py-2 font-medium">
                        "{aiInsight}"
                      </p>
                    ) : (
                      <button 
                        onClick={handleGenerateAIReport}
                        disabled={isGeneratingAI || reportData.length === 0}
                        className="w-full py-4 bg-white/10 hover:bg-white text-blue-100 hover:text-slate-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shadow-lg active:scale-95"
                      >
                        {isGeneratingAI ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        <span>Analyze Performance</span>
                      </button>
                    )}
                  </div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
                </div>
              </div>

              {/* Main Report Content */}
              <div className="lg:col-span-9 space-y-10">
                
                {/* Visual Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Total Inflow</p>
                    <p className="text-4xl font-black">K{reportStats.income.toLocaleString()}</p>
                    <div className="flex items-center text-[10px] font-black text-blue-300 mt-4 uppercase tracking-widest">
                      <TrendingUp size={14} className="mr-2" />
                      <span>Period Revenue</span>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Layers size={64} />
                    </div>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Outflow</p>
                    <p className="text-4xl font-black text-slate-900">K{reportStats.expense.toLocaleString()}</p>
                    <div className="flex items-center text-[10px] font-black text-rose-500 mt-4 uppercase tracking-widest">
                      <TrendingDown size={14} className="mr-2" />
                      <span>Operational Costs</span>
                    </div>
                  </div>
                  <div className={`p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden border ${reportStats.balance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${reportStats.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Net Period Balance</p>
                    <p className={`text-4xl font-black ${reportStats.balance >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>K{reportStats.balance.toLocaleString()}</p>
                    <div className={`flex items-center text-[10px] font-black mt-4 uppercase tracking-widest ${reportStats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <DollarSign size={14} className="mr-2" />
                      <span>{reportStats.balance >= 0 ? 'Surplus Recorded' : 'Deficit Recorded'}</span>
                    </div>
                  </div>
                </div>

                {/* Highly Readable Detailed Log */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center">
                      <FileSpreadsheet size={16} className="mr-3 text-blue-600" /> Detailed Transaction Journal
                    </h4>
                    <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-xl">
                      {reportData.length} TOTAL ENTRIES
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Record</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Particulars</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ledger Classification</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fund Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {reportData.map((r) => (
                          <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-8">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${r.type === 'Income' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                <p className="text-sm font-black text-slate-900 whitespace-nowrap">{formatDateReadable(r.date)}</p>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <p className="font-bold text-slate-900 leading-relaxed text-sm">{r.description}</p>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:border-blue-200 group-hover:text-blue-600 transition-colors shadow-sm">
                                  {r.category}
                                </span>
                              </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <p className={`text-lg font-black tracking-tight ${r.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {r.type === 'Income' ? '+' : '-'} K{r.amount.toLocaleString()}
                              </p>
                            </td>
                          </tr>
                        ))}
                        {reportData.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-10 py-32 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                  <FileText className="text-slate-200" size={32} />
                                </div>
                                <p className="text-slate-400 font-bold italic">No financial movements captured for this audit period.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Final Statement Footer */}
                  <div className="p-10 border-t border-slate-100 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated By</p>
                      <p className="text-sm font-bold text-blue-300">Treasury Technical Committee</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated On</p>
                      <p className="text-sm font-bold text-slate-200">{new Date().toLocaleDateString('en-ZM', { dateStyle: 'full' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl text-blue-300">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-xl font-bold">New Payment Log</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setForm({ ...form, type: 'Income' })}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    form.type === 'Income' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-400'
                  }`}
                >
                  Incoming (+)
                </button>
                <button 
                  onClick={() => setForm({ ...form, type: 'Expense' })}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    form.type === 'Expense' ? 'bg-white text-rose-600 shadow-md' : 'text-gray-400'
                  }`}
                >
                  Outgoing (-)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Record Date</label>
                  <div className="relative">
                    <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-black text-slate-700 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-black text-slate-700 transition-all text-sm appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entry Description</label>
                <input 
                  type="text"
                  placeholder="e.g. Sunday Service Collection"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-black text-slate-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Amount (ZMW)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-200">K</span>
                  <input 
                    type="number"
                    placeholder="0.00"
                    autoFocus
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full pl-12 pr-6 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-8 focus:ring-blue-500/5 focus:bg-white outline-none font-black text-4xl text-center transition-all ${
                      form.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex space-x-4 border-t border-slate-100">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Discard
              </button>
              <button 
                onClick={handleSaveTransaction}
                disabled={!form.description || !form.amount}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Post Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
