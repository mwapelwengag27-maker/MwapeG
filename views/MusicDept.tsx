
import React, { useState } from 'react';
import { Song, UserRole } from '../types.ts';
import { suggestSetlist } from '../geminiService.ts';
import { Music, Wand2, Search, Play, BookOpen, Plus, X, Save, Hash, User, Tag as TagIcon, ChevronRight } from 'lucide-react';

interface MusicDeptProps {
  currentRole: UserRole;
  songs: Song[];
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
}

const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

const MusicDept: React.FC<MusicDeptProps> = ({ currentRole, songs, setSongs }) => {
  const [theme, setTheme] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newSong, setNewSong] = useState({
    title: '',
    key: 'C',
    composer: '',
    tags: ''
  });

  // Only Admin and Secretariat should be able to formally add to the song library
  const canEditLibrary = currentRole === UserRole.ADMIN || currentRole === UserRole.SECRETARIAT;

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.composer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSuggest = async () => {
    if (!theme) return;
    setIsLoading(true);
    const result = await suggestSetlist(theme, songs.map(s => s.title));
    setSuggestion(result);
    setIsLoading(false);
  };

  const handleAddSong = () => {
    if (!newSong.title || !canEditLibrary) return;

    const song: Song = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSong.title,
      key: newSong.key,
      composer: newSong.composer || 'Unknown Composer',
      tags: newSong.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    setSongs(prev => [song, ...prev]);
    setIsAddModalOpen(false);
    setNewSong({
      title: '',
      key: 'C',
      composer: '',
      tags: ''
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Music Department</h2>
          <p className="text-gray-500 text-sm">Official song library and Sunday setlist planning.</p>
        </div>
        {canEditLibrary && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Add New Song</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search library by title, artist, or tag..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 overflow-y-auto max-h-[700px] custom-scrollbar">
              {filteredSongs.map((song) => (
                <div key={song.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{song.title}</h4>
                      <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{song.composer}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">KEY: {song.key}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {song.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {tag}
                      </span>
                    ))}
                    {song.tags.length === 0 && (
                      <span className="text-[10px] text-gray-300 italic">No tags</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredSongs.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <Music size={48} className="mx-auto text-gray-100 mb-4" />
                  <p className="text-gray-400 font-medium italic">No songs found in the library.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-t-4 border-t-purple-500">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Wand2 className="text-purple-600" size={20} />
              </div>
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">AI Setlist Planner</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed">Describe the service theme or scripture to receive a tailored setlist from our choir's repertoire.</p>
            <div className="space-y-3">
              <input 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Thanksgiving, Resurrection Power"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold"
              />
              <button 
                onClick={handleSuggest}
                disabled={isLoading || !theme}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white rounded-xl font-black shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Play size={18} className="animate-pulse" />
                ) : (
                  <Wand2 size={18} />
                )}
                <span>Generate Suggestions</span>
              </button>
            </div>

            {suggestion && (
              <div className="mt-6 p-5 bg-purple-50/50 border border-purple-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-3 flex items-center">
                  <ChevronRight size={12} />
                  <span>AI Recommendations</span>
                </p>
                <div className="text-xs text-purple-900 whitespace-pre-wrap leading-relaxed italic font-medium">
                  {suggestion}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl">
            <h3 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center space-x-2">
              <BookOpen size={18} className="text-blue-400" />
              <span>Dept Guidelines</span>
            </h3>
            <ul className="space-y-5">
              {[
                { label: 'Punctuality', desc: 'Instrumentalists must arrive 15 mins early for sound checks.' },
                { label: 'Preparation', desc: 'Chord sheets and lyrics must be vetted by the Dept Head.' },
                { label: 'Training', desc: 'Mandatory vocal training every 2nd Friday evening.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <div>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-tighter mb-0.5">{item.label}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Add Song Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Music size={24} />
                </div>
                <h3 className="text-xl font-bold">Register New Song</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Song Title</label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="e.g. Total Praise"
                      autoFocus
                      value={newSong.title}
                      onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Musical Key</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <select 
                        value={newSong.key}
                        onChange={(e) => setNewSong({ ...newSong, key: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all appearance-none"
                      >
                        {MUSICAL_KEYS.map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Composer / Artist</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        placeholder="e.g. Richard Smallwood"
                        value={newSong.composer}
                        onChange={(e) => setNewSong({ ...newSong, composer: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Categorization Tags (Comma separated)</label>
                  <div className="relative">
                    <TagIcon className="absolute left-4 top-4 text-gray-300" size={18} />
                    <textarea 
                      placeholder="e.g. Worship, Classical, Anthem"
                      value={newSong.tags}
                      onChange={(e) => setNewSong({ ...newSong, tags: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all h-24 resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic font-medium ml-1">Example: Worship, Praise, Fast, Slow, Bemba, Lozi</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddSong}
                disabled={!newSong.title}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none text-white rounded-2xl font-black shadow-xl shadow-blue-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>Save to Library</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicDept;
