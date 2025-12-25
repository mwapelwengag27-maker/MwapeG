
import React, { useState } from 'react';
import { TeamEvent, Announcement, UserRole } from '../types.ts';
import { 
  Plus, 
  Calendar, 
  Megaphone, 
  MapPin, 
  Clock, 
  Trash2, 
  BellRing, 
  X, 
  Save, 
  AlertTriangle, 
  User, 
  Info,
  Edit3,
  History,
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface EventsNewsProps {
  currentRole: UserRole;
  events: TeamEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TeamEvent[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
}

const EventsNews: React.FC<EventsNewsProps> = ({ currentRole, events, setEvents, announcements, setAnnouncements }) => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '17:30',
    location: 'UCZ Church Hall',
    type: 'Rehearsal' as TeamEvent['type']
  });

  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    priority: 'Normal' as Announcement['priority']
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isMember = currentRole === UserRole.MEMBER;

  // Permission logic updated to activate "Clear" power for all users on past items
  const canDeleteEvent = (event: TeamEvent) => {
    const isPast = event.date < todayStr;
    const isAuthor = currentRole === event.author;
    const isAdmin = currentRole === UserRole.ADMIN;
    // Activate delete for all users if event is achieved/past
    return isAdmin || isAuthor || isPast;
  };

  const canEditEvent = (event: TeamEvent) => {
    return currentRole === UserRole.ADMIN || currentRole === event.author;
  };

  const canDeleteAnnouncement = (ann: Announcement) => {
    const isAuthor = currentRole === ann.author;
    const isAdmin = currentRole === UserRole.ADMIN;
    // Allow all users to clear old announcements (assumed old if they exist)
    return isAdmin || isAuthor || true; 
  };

  const expiredEvents = events.filter(e => e.date < todayStr);

  const handlePurgeExpired = () => {
    if (expiredEvents.length === 0) {
      alert("No expired events found to clear.");
      return;
    }

    if (window.confirm(`Found ${expiredEvents.length} events that have already passed. Remove them from the global schedule for all users?`)) {
      setEvents(prev => prev.filter(e => e.date >= todayStr));
    }
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    
    if (editingEventId) {
      setEvents(prev => prev.map(e => e.id === editingEventId ? { ...e, ...newEvent } : e));
    } else {
      const event: TeamEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        type: newEvent.type,
        author: currentRole
      };
      setEvents(prev => [event, ...prev]);
    }

    setIsEventModalOpen(false);
    setEditingEventId(null);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '17:30',
      location: 'UCZ Church Hall',
      type: 'Rehearsal'
    });
  };

  const handleSaveAnnouncement = () => {
    if (!newAnn.title || !newAnn.content) return;

    if (editingAnnId) {
      setAnnouncements(prev => prev.map(a => a.id === editingAnnId ? { 
        ...a, 
        title: newAnn.title, 
        content: newAnn.content, 
        priority: newAnn.priority 
      } : a));
    } else {
      const ann: Announcement = {
        id: Math.random().toString(36).substr(2, 9),
        title: newAnn.title,
        content: newAnn.content,
        date: new Date().toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' }),
        author: currentRole,
        priority: newAnn.priority
      };
      setAnnouncements(prev => [ann, ...prev]);
    }

    setIsAnnModalOpen(false);
    setEditingAnnId(null);
    setNewAnn({ title: '', content: '', priority: 'Normal' });
  };

  const handleOpenEditEvent = (event: TeamEvent) => {
    setEditingEventId(event.id);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditAnn = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setNewAnn({
      title: ann.title,
      content: ann.content,
      priority: ann.priority
    });
    setIsAnnModalOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Remove this event? This will clear it for all users.')) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleDeleteAnn = (id: string) => {
    if (window.confirm('Delete this announcement from the team board?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Events & Announcements</h2>
          <p className="text-gray-500 text-sm">Communicate with the team. Anyone can clear past items.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button 
            onClick={handlePurgeExpired}
            className="flex items-center justify-center space-x-2 bg-rose-600 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-200"
            title="Remove achieved/past events for all users"
          >
            <History size={16} />
            <span>Purge Past Events</span>
            {expiredEvents.length > 0 && (
              <span className="ml-1 bg-white text-rose-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px] animate-pulse">
                {expiredEvents.length}
              </span>
            )}
          </button>
          {!isMember && (
            <>
              <button 
                onClick={() => { setEditingAnnId(null); setNewAnn({ title: '', content: '', priority: 'Normal' }); setIsAnnModalOpen(true); }}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <Megaphone size={18} />
                <span>Broadcast News</span>
              </button>
              <button 
                onClick={() => { setEditingEventId(null); setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], time: '17:30', location: 'UCZ Church Hall', type: 'Rehearsal' }); setIsEventModalOpen(true); }}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus size={18} />
                <span>Schedule Event</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Schedule Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Team Itinerary</h3>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">
              <ShieldCheck size={12} />
              <span>CLEANUP MODE ACTIVE</span>
            </div>
          </div>
          <div className="space-y-5">
            {[...events].sort((a,b) => a.date.localeCompare(b.date)).map(event => {
              const isPast = event.date < todayStr;
              const userCanDelete = canDeleteEvent(event);
              const userCanEdit = canEditEvent(event);
              
              return (
                <div key={event.id} className={`bg-white p-6 rounded-2xl border transition-all group relative ${
                  isPast ? 'opacity-60 border-rose-200 bg-rose-50/20' : 'border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'
                }`}>
                  {isPast && (
                    <div className="absolute top-2 right-12 z-10 flex items-center space-x-2">
                      <span className="flex items-center space-x-1 px-2 py-0.5 bg-rose-600 text-white rounded text-[9px] font-black uppercase tracking-widest animate-pulse">
                        <CheckCircle2 size={10} />
                        <span>Achieved</span>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-md ${
                        event.type === 'Rehearsal' ? 'bg-blue-100 text-blue-700' : 
                        event.type === 'Concert' ? 'bg-pink-100 text-pink-700' :
                        event.type === 'Service' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {event.type}
                      </span>
                      <h4 className={`text-xl font-black leading-tight pt-1 ${isPast ? 'text-rose-900' : 'text-gray-900'}`}>{event.title}</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      {userCanEdit && (
                        <button 
                          onClick={() => handleOpenEditEvent(event)}
                          className="text-slate-300 hover:text-blue-600 p-2 transition-colors"
                          title="Edit Event (Author Only)"
                        >
                          <Edit3 size={18} />
                        </button>
                      )}
                      {userCanDelete && (
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className={`p-2 transition-colors ${isPast ? 'text-rose-600 hover:bg-rose-100 rounded-lg' : 'text-slate-300 hover:text-red-500'}`}
                          title={isPast ? "Clear achieved item (Available to all)" : "Delete Event (Author Only)"}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className={`flex items-center space-x-3 font-bold ${isPast ? 'text-rose-700/60' : 'text-gray-600'}`}>
                      <div className="p-1.5 bg-gray-50 rounded-lg"><Calendar size={14} className="text-gray-400" /></div>
                      <span>{new Date(event.date).toLocaleDateString('en-ZM', { dateStyle: 'medium' })}</span>
                    </div>
                    <div className={`flex items-center space-x-3 font-bold ${isPast ? 'text-rose-700/60' : 'text-gray-600'}`}>
                      <div className="p-1.5 bg-gray-50 rounded-lg"><Clock size={14} className="text-gray-400" /></div>
                      <span>{event.time}</span>
                    </div>
                    <div className={`flex items-center space-x-3 font-medium col-span-2 ${isPast ? 'text-rose-700/60' : 'text-gray-500'}`}>
                      <div className="p-1.5 bg-gray-50 rounded-lg"><MapPin size={14} className="text-gray-400" /></div>
                      <span className="italic">{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                        {event.author.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">POSTED BY: {event.author}</span>
                    </div>
                    {isPast && (
                      <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Safe to Purge</span>
                    )}
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Calendar size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-bold">No events scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <BellRing size={20} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Bulletin Board</h3>
          </div>
          <div className="space-y-5">
            {announcements.map(ann => {
              const userCanDelete = canDeleteAnnouncement(ann);
              const userCanEdit = currentRole === ann.author || currentRole === UserRole.ADMIN;

              return (
                <div key={ann.id} className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group transition-all ${
                  ann.priority === 'Urgent' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-orange-200'
                }`}>
                  {ann.priority === 'Urgent' && (
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <AlertTriangle size={80} className="text-red-900" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center space-x-2">
                      {ann.priority === 'Urgent' && <AlertTriangle size={16} className="text-red-600 animate-pulse" />}
                      <h4 className={`text-lg font-black ${ann.priority === 'Urgent' ? 'text-red-900' : 'text-gray-900'}`}>
                        {ann.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{ann.date}</span>
                      <div className="flex items-center space-x-1 ml-2">
                         {userCanEdit && (
                           <button 
                            onClick={() => handleOpenEditAnn(ann)}
                            className="text-slate-300 hover:text-blue-600 p-1 transition-all"
                            title="Edit News (Author Only)"
                          >
                            <Edit3 size={16} />
                          </button>
                         )}
                         {userCanDelete && (
                            <button 
                              onClick={() => handleDeleteAnn(ann.id)}
                              className="text-slate-300 hover:text-red-600 p-1 transition-all"
                              title="Clear announcement (Available to all)"
                            >
                              <Trash2 size={16} />
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed mb-6 font-medium ${ann.priority === 'Urgent' ? 'text-red-800/80' : 'text-gray-600'}`}>
                    {ann.content}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                    <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <User size={12} className="text-gray-300" />
                      <span>AUTHOR: {ann.author}</span>
                    </div>
                    {ann.priority === 'Urgent' && (
                      <span className="flex items-center text-[9px] font-black text-white bg-red-600 px-2 py-0.5 rounded uppercase tracking-widest">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {announcements.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Megaphone size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-bold">No announcements yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {editingEventId ? 'Update Activity' : 'Schedule Activity'}
                </h3>
              </div>
              <button onClick={() => { setIsEventModalOpen(false); setEditingEventId(null); }} className="p-2 hover:bg-white/10 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Event Name / Purpose</label>
                <input 
                  type="text"
                  placeholder="e.g. Easter Cantata Rehearsal"
                  autoFocus
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Event Date</label>
                  <input 
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                  <input 
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select 
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all appearance-none"
                  >
                    <option value="Rehearsal">Rehearsal</option>
                    <option value="Service">Church Service</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Concert">Concert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                  <input 
                    type="text"
                    placeholder="Venue..."
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => { setIsEventModalOpen(false); setEditingEventId(null); }}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEvent}
                disabled={!newEvent.title}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl font-black shadow-xl shadow-blue-500/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>{editingEventId ? 'Update' : 'Save'} Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Megaphone size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {editingAnnId ? 'Update Broadcast' : 'Broadcast News'}
                </h3>
              </div>
              <button onClick={() => { setIsAnnModalOpen(false); setEditingAnnId(null); }} className="p-2 hover:bg-white/10 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3 mb-4">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  {editingAnnId ? 'You are modifying an existing broadcast.' : `Broadcasting as ${currentRole}. Your post will be visible to all relevant team members.`}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bulletin Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Change in Uniform Colors"
                  autoFocus
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none font-bold text-gray-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Message Content</label>
                <textarea 
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                  placeholder="Details of the announcement..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none text-sm font-medium transition-all h-32 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Priority Level</label>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                  <button 
                    onClick={() => setNewAnn({ ...newAnn, priority: 'Normal' })}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newAnn.priority === 'Normal' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                  >
                    Normal
                  </button>
                  <button 
                    onClick={() => setNewAnn({ ...newAnn, priority: 'Urgent' })}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newAnn.priority === 'Urgent' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-gray-400'}`}
                  >
                    Urgent
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex space-x-4 border-t border-gray-100">
              <button 
                onClick={() => { setIsAnnModalOpen(false); setEditingAnnId(null); }}
                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAnnouncement}
                disabled={!newAnn.title || !newAnn.content}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>{editingAnnId ? 'Update' : 'Broadcast'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsNews;
