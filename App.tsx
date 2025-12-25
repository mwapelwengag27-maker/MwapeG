
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './views/Dashboard.tsx';
import Membership from './views/Membership.tsx';
import Finance from './views/Finance.tsx';
import MusicDept from './views/MusicDept.tsx';
import Attendance from './views/Attendance.tsx';
import EventsNews from './views/EventsNews.tsx';
import MemberFinances from './views/MemberFinances.tsx';
import Subscriptions from './views/Subscriptions.tsx';
import HarvestAssessments from './views/HarvestAssessments.tsx';
import ConcertFinances from './views/ConcertFinances.tsx';
import Disciplinary from './views/Disciplinary.tsx';
import Projects from './views/Projects.tsx';
import Minutes from './views/Minutes.tsx';
import PortalSelector from './views/PortalSelector.tsx';
import Landing from './views/Landing.tsx';
import Profile from './views/Profile.tsx';
import { UserRole, Member, FinancialRecord, SubscriptionRecord, HarvestRecord, MemberContribution, DisciplinaryCase, GroupRule, MeetingMinutes, AttendanceRecord, Song, TeamEvent, Announcement, CommitteeMember } from './types.ts';
import { 
  MOCK_MEMBERS, 
  MOCK_FINANCE, 
  MOCK_SUBSCRIPTIONS, 
  MOCK_HARVESTS, 
  MOCK_MEMBER_CONTRIBUTIONS, 
  MOCK_DISCIPLINARY, 
  MOCK_RULES, 
  MOCK_MINUTES,
  MOCK_ATTENDANCE,
  MOCK_SONGS,
  MOCK_EVENTS,
  MOCK_ANNOUNCEMENTS,
  MOCK_COMMITTEE
} from './constants.tsx';
import { Bell, Settings, LogOut, ShieldCheck, X, Menu, CloudUpload, Cloud, Check } from 'lucide-react';
import { db } from './dbService.ts';

interface AppProps {
  onBooted?: () => void;
}

const App: React.FC<AppProps> = ({ onBooted }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.ADMIN);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [targetMemberIdForFinance, setTargetMemberIdForFinance] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Central States initialized with mock data as fallback
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [generalFinance, setGeneralFinance] = useState<FinancialRecord[]>(MOCK_FINANCE);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(MOCK_SUBSCRIPTIONS);
  const [harvests, setHarvests] = useState<HarvestRecord[]>(MOCK_HARVESTS);
  const [contributions, setContributions] = useState<MemberContribution[]>(MOCK_MEMBER_CONTRIBUTIONS);
  const [disciplinaryCases, setDisciplinaryCases] = useState<DisciplinaryCase[]>(MOCK_DISCIPLINARY);
  const [rules, setRules] = useState<GroupRule[]>(MOCK_RULES);
  const [minutes, setMinutes] = useState<MeetingMinutes[]>(MOCK_MINUTES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [events, setEvents] = useState<TeamEvent[]>(MOCK_EVENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(MOCK_COMMITTEE);

  // Signal that the app has successfully reached its first render cycle
  useLayoutEffect(() => {
    if (onBooted) onBooted();
  }, [onBooted]);

  // FETCH DATA ON MOUNT
  useEffect(() => {
    const initData = async () => {
      try {
        const remoteMembers = await db.fetchAll('members');
        if (remoteMembers && remoteMembers.length > 0) setMembers(remoteMembers);

        const remoteFinance = await db.fetchAll('finance_records');
        if (remoteFinance && remoteFinance.length > 0) setGeneralFinance(remoteFinance);

        const remoteSubs = await db.fetchAll('subscriptions');
        if (remoteSubs && remoteSubs.length > 0) setSubscriptions(remoteSubs);

        const remoteHarvests = await db.fetchAll('harvest_records');
        if (remoteHarvests && remoteHarvests.length > 0) setHarvests(remoteHarvests);

        const remoteContributions = await db.fetchAll('member_contributions');
        if (remoteContributions && remoteContributions.length > 0) setContributions(remoteContributions);

        const remoteCases = await db.fetchAll('disciplinary_cases');
        if (remoteCases && remoteCases.length > 0) setDisciplinaryCases(remoteCases);

        const remoteRules = await db.fetchAll('group_rules');
        if (remoteRules && remoteRules.length > 0) setRules(remoteRules);

        const remoteMinutes = await db.fetchAll('meeting_minutes');
        if (remoteMinutes && remoteMinutes.length > 0) setMinutes(remoteMinutes);

        const remoteAttendance = await db.fetchAll('attendance_records');
        if (remoteAttendance && remoteAttendance.length > 0) setAttendanceRecords(remoteAttendance);

        const remoteSongs = await db.fetchAll('songs');
        if (remoteSongs && remoteSongs.length > 0) setSongs(remoteSongs);

        const remoteEvents = await db.fetchAll('team_events');
        if (remoteEvents && remoteEvents.length > 0) setEvents(remoteEvents);

        const remoteAnnouncements = await db.fetchAll('announcements');
        if (remoteAnnouncements && remoteAnnouncements.length > 0) setAnnouncements(remoteAnnouncements);

        const remoteCommittee = await db.fetchAll('committee_members');
        if (remoteCommittee && remoteCommittee.length > 0) setCommitteeMembers(remoteCommittee);
      } catch (err) {
        console.warn("Could not sync with remote backend, using local state:", err);
      }
    };
    initData();
  }, []);

  // AUTO-SYNC TO SUPABASE ON STATE CHANGES
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const syncToDB = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([
          db.upsert('members', members),
          db.upsert('finance_records', generalFinance),
          db.upsert('team_events', events),
          db.upsert('announcements', announcements),
          db.upsert('member_contributions', contributions),
          db.upsert('attendance_records', attendanceRecords),
          db.upsert('disciplinary_cases', disciplinaryCases),
          db.upsert('songs', songs),
          db.upsert('meeting_minutes', minutes),
          db.upsert('harvest_records', harvests),
          db.upsert('subscriptions', subscriptions),
          db.upsert('group_rules', rules),
          db.upsert('committee_members', committeeMembers)
        ]);
      } catch (err) {
        console.error("Sync to Supabase failed:", err);
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    };

    const debounceTimer = setTimeout(syncToDB, 3000);
    return () => clearTimeout(debounceTimer);
  }, [members, generalFinance, events, announcements, contributions, attendanceRecords, disciplinaryCases, songs, minutes, harvests, subscriptions, rules, committeeMembers]);

  const currentMember = members.find(m => m.id === currentUser?.member_id);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
    setTargetMemberIdForFinance(null);
    setIsSidebarOpen(false);
  };

  const handleViewMemberFinances = (memberId: string) => {
    setTargetMemberIdForFinance(memberId);
    setCurrentView('member-finances');
  };

  const handlePermanentDeleteMember = async (id: string) => {
    try {
      await db.delete('members', id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Failed to permanently delete member:", err);
      alert("System error: Could not remove member from database.");
    }
  };

  const handleLoginSuccess = (role: UserRole, user: any) => {
    setCurrentRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    
    if (role === UserRole.MEMBER && user.member_id) {
        setTargetMemberIdForFinance(user.member_id);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': 
        return (
          <Dashboard 
            members={members} 
            finance={generalFinance} 
            cases={disciplinaryCases} 
            events={events} 
            minutes={minutes}
            attendance={attendanceRecords}
            onNavigate={setCurrentView}
            currentRole={currentRole}
          />
        );
      case 'profile':
        return (
          <Profile 
            currentUser={currentUser}
            members={members}
            setMembers={setMembers}
            currentRole={currentRole}
          />
        );
      case 'membership': 
        return (
          <Membership 
            members={members} 
            setMembers={setMembers} 
            currentRole={currentRole}
            currentUser={currentUser}
            onViewFinancials={handleViewMemberFinances}
            onDeleteMember={handlePermanentDeleteMember}
            attendanceRecords={attendanceRecords}
            contributions={contributions}
            subscriptions={subscriptions}
            harvests={harvests}
            disciplinaryCases={disciplinaryCases}
          />
        );
      case 'attendance': 
        return (
          <Attendance 
            members={members} 
            currentRole={currentRole} 
            attendanceRecords={attendanceRecords} 
            setAttendanceRecords={setAttendanceRecords}
          />
        );
      case 'events': 
        return (
          <EventsNews 
            currentRole={currentRole} 
            events={events} 
            setEvents={setEvents} 
            announcements={announcements} 
            setAnnouncements={setAnnouncements} 
          />
        );
      case 'member-finances': 
        return (
          <MemberFinances 
            currentRole={currentRole} 
            members={members} 
            contributions={contributions} 
            setContributions={setContributions}
            subscriptions={subscriptions}
            harvests={harvests}
            initialMemberId={targetMemberIdForFinance || undefined}
            onCloseDetail={() => setTargetMemberIdForFinance(null)}
          />
        );
      case 'subscriptions': 
        return (
          <Subscriptions 
            members={members} 
            subscriptions={subscriptions} 
            setSubscriptions={setSubscriptions} 
            currentRole={currentRole}
          />
        );
      case 'harvest': 
        return (
          <HarvestAssessments 
            members={members} 
            harvests={harvests} 
            setHarvests={setHarvests} 
            currentRole={currentRole}
          />
        );
      case 'projects': 
        return <Projects currentRole={currentRole} />;
      case 'concerts': 
        return <ConcertFinances currentRole={currentRole} />;
      case 'finance': 
        return <Finance records={generalFinance} setRecords={setGeneralFinance} currentRole={currentRole} />;
      case 'music': 
        return <MusicDept currentRole={currentRole} songs={songs} setSongs={setSongs} />;
      case 'disciplinary': 
        const relevantCases = currentRole === UserRole.MEMBER && currentUser?.member_id
          ? disciplinaryCases.filter(c => c.memberId === currentUser.member_id)
          : disciplinaryCases;

        return (
          <Disciplinary 
            members={members} 
            cases={relevantCases} 
            setCases={setDisciplinaryCases}
            rules={rules}
            setRules={setRules}
            committeeMembers={committeeMembers}
            setCommitteeMembers={setCommitteeMembers}
            currentRole={currentRole}
          />
        );
      case 'minutes': 
        return <Minutes members={members} minutesList={minutes} setMinutesList={setMinutes} currentRole={currentRole} />;
      default: 
        return <Dashboard members={members} finance={generalFinance} cases={disciplinaryCases} events={events} minutes={minutes} attendance={attendanceRecords} onNavigate={setCurrentView} currentRole={currentRole} />;
    }
  };

  if (!isAuthenticated) {
    if (showLogin) {
      return (
        <div className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <button 
            onClick={() => setShowLogin(false)} 
            className="fixed top-6 left-6 z-[70] bg-white p-3 rounded-full shadow-xl border border-slate-200 text-slate-400 hover:text-slate-900 transition-all active:scale-95 group"
            title="Go Back"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
          <PortalSelector onLoginSuccess={handleLoginSuccess} members={members} />
        </div>
      );
    }
    return <Landing onEnterPortal={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex animate-in fade-in duration-500">
      <Sidebar 
        currentRole={currentRole} 
        currentView={currentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onViewChange={(view) => {
          setTargetMemberIdForFinance(null);
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full overflow-x-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-red-600 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all active:scale-95 group shrink-0"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
            <div className="h-4 w-px bg-gray-200 shrink-0 hidden xs:block"></div>
            
            <div className="flex items-center space-x-2 px-2 py-1 rounded text-[10px] font-black uppercase shrink-0 transition-all duration-500">
               {isSyncing ? (
                 <div className="flex items-center space-x-2 text-blue-500 bg-blue-50 px-2 py-1 rounded">
                   <CloudUpload size={12} className="animate-bounce" />
                   <span className="hidden sm:inline">Updating Cloud</span>
                 </div>
               ) : (
                 <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                   <Cloud size={12} />
                   <Check size={10} className="-ml-1" />
                   <span className="hidden sm:inline">Data Synchronized</span>
                 </div>
               )}
            </div>

            <div className="h-4 w-px bg-gray-200 ml-2 shrink-0 hidden md:block"></div>
            <span className="hidden lg:inline text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 mr-2 shrink-0">Access:</span>
            <div className="hidden sm:block bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-black text-blue-600 border border-blue-100 shrink-0">
               {currentRole}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Settings size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1 sm:mx-2 shrink-0"></div>
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors"
              onClick={() => setCurrentView('profile')}
            >
              <div className="text-right hidden xl:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{currentUser?.display_name || 'Portal User'}</p>
                <p className="text-xs text-gray-500 mt-1">Mpulungu UCZ</p>
              </div>
              <img 
                src={currentMember?.photo || `https://ui-avatars.com/api/?name=${currentUser?.display_name || 'User'}&background=random`} 
                alt="Profile" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-100 shadow-sm shrink-0 object-cover"
              />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
