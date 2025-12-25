
import React, { useState, useRef } from 'react';
import { MeetingMinutes, Member, UserRole } from '../types.ts';
import { 
  FileText, 
  Plus, 
  Search, 
  Users, 
  X, 
  Save, 
  Upload, 
  Download,
  Eye,
  Trash2,
  Tag,
  Paperclip
} from 'lucide-react';

interface MinutesProps {
  members: Member[];
  minutesList: MeetingMinutes[];
  setMinutesList: React.Dispatch<React.SetStateAction<MeetingMinutes[]>>;
  currentRole: UserRole;
}

const Minutes: React.FC<MinutesProps> = ({ members, minutesList, setMinutesList, currentRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingMinutes, setViewingMinutes] = useState<MeetingMinutes | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded permissions to include Disciplinary Committee
  const canEdit = [UserRole.ADMIN, UserRole.SECRETARIAT, UserRole.DISCIPLINARY].includes(currentRole);

  // Form state
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'General' as MeetingMinutes['category'],
    attendees: [] as string[],
    content: '',
    fileName: ''
  });

  const filteredMinutes = minutesList.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!form.title || !form.content || !canEdit) return;

    const newEntry: MeetingMinutes = {
      id: Math.random().toString(36).substr(2, 9),
      title: form.title,
      date: form.date,
      category: form.category,
      attendees: form.attendees,
      content: form.content,
      fileName: form.fileName || undefined
    };

    setMinutesList(prev => [newEntry, ...prev]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'General',
      attendees: [],
      content: '',
      fileName: ''
    });
  };

  const toggleAttendee = (name: string) => {
    if (!canEdit) return;
    setForm(prev => ({
      ...prev,
      attendees: prev.attendees.includes(name) 
        ? prev.attendees.filter(a => a !== name)
        : [...prev.attendees, name]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, fileName: file.name }));
    }
  };

  const handleDownload = (fileName: string) => {
    const element = document.createElement("a");
    const file = new Blob([`Simulated secure content for official team minute record: ${fileName}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Meeting Minutes</h2>
          <p className="text-gray-500">Official records of Mpulungu Central Ebenezer Praise Team meetings.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Record Minutes</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search minutes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title & Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendees</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attachment</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMinutes.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{m.date}</p>
                    <p className="text-[10px] text-slate-400 font-bold">ID: {m.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-gray-900 leading-tight">{m.title}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Tag size={10} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase">{m.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {m.attendees.slice(0, 3).map((a, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={a}>
                          {a.charAt(0)}
                        </div>
                      ))}
                      {m.attendees.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                          +{m.attendees.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {m.fileName ? (
                      <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                        <FileText size={14} />
                        <span className="text-xs font-bold truncate max-w-[120px]">{m.fileName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">No attachment</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center space-x-2">
                      <button 
                        onClick={() => setViewingMinutes(m)}
                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                        title="View Full Minutes"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Minutes Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FileText size={20} />
                </div>
                <h3 className="text-xl font-bold">Record Meeting Minutes</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[70vh] overflow-y-auto">
              {/* Sidebar Info */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Meeting Details</label>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Meeting Title"
                      value={form.title}
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                    />
                    <input 
                      type="date" 
                      value={form.date}
                      onChange={(e) => setForm({...form, date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                    />
                    <select 
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value as any})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                    >
                      <option value="General">General Meeting</option>
                      <option value="Music Dept">Music Dept</option>
                      <option value="Committee">Committee</option>
                      <option value="Disciplinary">Disciplinary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-indigo-600">Governance Doc</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 hover:bg-indigo-100 transition-all group"
                  >
                    <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Upload PDF/DOC</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleFileChange} 
                  />
                  {form.fileName && (
                    <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center space-x-2 animate-in fade-in">
                      <Paperclip size={14} className="text-green-600" />
                      <p className="text-[10px] font-bold text-green-700 truncate">{form.fileName}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Attendees</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-1">
                    {members.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleAttendee(m.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          form.attendees.includes(m.name) 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-2 space-y-4 flex flex-col">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Meeting Minutes / Summary</label>
                <textarea 
                  value={form.content}
                  onChange={(e) => setForm({...form, content: e.target.value})}
                  placeholder="Record discussions, resolutions, and action items here..."
                  className="flex-1 w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-3xl outline-none text-gray-700 leading-relaxed min-h-[400px] resize-none"
                />
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black">Save Minutes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Minutes Modal */}
      {viewingMinutes && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300 my-8">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest mb-2 inline-block">
                    {viewingMinutes.category} Minute Record
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{viewingMinutes.title}</h3>
                  <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">{viewingMinutes.date}</p>
                </div>
                <button onClick={() => setViewingMinutes(null)} className="p-3 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex flex-wrap gap-2">
                  <div className="w-full flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <Users size={14} />
                    <span>Roll Call:</span>
                  </div>
                  {viewingMinutes.attendees.map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                      {a}
                    </span>
                  ))}
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 italic text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {viewingMinutes.content}
                </div>

                {viewingMinutes.fileName && (
                  <div className="p-6 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{viewingMinutes.fileName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Authenticated PDF Attachment</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(viewingMinutes.fileName!)}
                      className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-50 flex justify-end">
              <button 
                onClick={() => setViewingMinutes(null)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minutes;
