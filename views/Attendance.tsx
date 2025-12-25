
import React, { useState, useMemo } from 'react';
import { Member, UserRole, AttendanceRecord } from '../types.ts';
import { 
  Calendar, 
  Save, 
  Check, 
  X, 
  Clock, 
  UserMinus, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Filter,
  Info
} from 'lucide-react';

interface AttendanceProps {
  members: Member[];
  currentRole: UserRole;
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

const Attendance: React.FC<AttendanceProps> = ({ 
  members, 
  currentRole, 
  attendanceRecords, 
  setAttendanceRecords 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Derive month details
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Status mapping for cycling
  const statusCycle: (AttendanceRecord['status'] | undefined)[] = [undefined, 'Present', 'Late', 'Absent', 'Excused'];

  const getStatusInfo = (status?: AttendanceRecord['status']) => {
    switch (status) {
      case 'Present': return { char: 'P', color: 'bg-green-500 text-white', border: 'border-green-600' };
      case 'Late': return { char: 'L', color: 'bg-amber-500 text-white', border: 'border-amber-600' };
      case 'Absent': return { char: 'A', color: 'bg-red-500 text-white', border: 'border-red-600' };
      case 'Excused': return { char: 'E', color: 'bg-blue-500 text-white', border: 'border-blue-600' };
      default: return { char: '-', color: 'bg-gray-50 text-gray-300', border: 'border-gray-200' };
    }
  };

  const handleMonthChange = (offset: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + offset);
    setCurrentDate(nextDate);
  };

  const handleToggleStatus = (memberId: string, day: number) => {
    // Member cannot mark attendance
    if (currentRole === UserRole.MEMBER) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existingIndex = attendanceRecords.findIndex(r => r.memberId === memberId && r.date === dateStr);
    
    let nextStatus: AttendanceRecord['status'] | undefined;
    if (existingIndex === -1) {
      nextStatus = 'Present';
    } else {
      const currentStatus = attendanceRecords[existingIndex].status;
      const currentIndex = statusCycle.indexOf(currentStatus);
      nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    }

    if (!nextStatus) {
      // Remove record if cycle returns to undefined
      setAttendanceRecords(prev => prev.filter((_, idx) => idx !== existingIndex));
    } else {
      const member = members.find(m => m.id === memberId);
      const newRecord: AttendanceRecord = {
        id: existingIndex >= 0 ? attendanceRecords[existingIndex].id : Math.random().toString(36).substr(2, 9),
        memberId,
        memberName: member?.name || 'Unknown',
        date: dateStr,
        status: nextStatus
      };

      setAttendanceRecords(prev => {
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newRecord;
          return updated;
        }
        return [...prev, newRecord];
      });
    }
  };

  const getAttendanceSummary = (memberId: string) => {
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;
    
    const memberMonthRecords = attendanceRecords.filter(r => 
      r.memberId === memberId && r.date >= monthStart && r.date <= monthEnd
    );

    return {
      present: memberMonthRecords.filter(r => r.status === 'Present').length,
      late: memberMonthRecords.filter(r => r.status === 'Late').length,
      absent: memberMonthRecords.filter(r => r.status === 'Absent').length,
      excused: memberMonthRecords.filter(r => r.status === 'Excused').length,
    };
  };

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const handleExport = () => {
    const headers = ['Member Name', 'P', 'L', 'A', 'E', ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const rows = members.map(m => {
      const stats = getAttendanceSummary(m.id);
      const dayStatuses = Array.from({ length: daysInMonth }, (_, i) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
        return attendanceRecords.find(r => r.memberId === m.id && r.date === dateStr)?.status || '-';
      });
      return [m.name, stats.present, stats.late, stats.absent, stats.excused, ...dayStatuses];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_${monthName}_${year}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Monthly Register Sheet</h2>
          <p className="text-slate-500 text-sm font-medium">
            {currentRole === UserRole.MEMBER 
              ? 'View team and individual attendance records.' 
              : 'Click on a cell to cycle status: P → L → A → E → Clear'}
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 font-black text-slate-700 min-w-[140px] text-center">
              {monthName} {year}
            </div>
            <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export Sheet</span>
          </button>
        </div>
      </div>

      {/* Legend & Summary Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Present (P)', color: 'bg-green-500', icon: Check },
          { label: 'Late (L)', color: 'bg-amber-500', icon: Clock },
          { label: 'Absent (A)', color: 'bg-red-500', icon: X },
          { label: 'Excused (E)', color: 'bg-blue-500', icon: UserMinus },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className={`p-2 ${item.color} text-white rounded-lg`}>
              <item.icon size={16} />
            </div>
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Member Name</th>
                {/* Status Summary Headers */}
                <th className="px-3 py-4 text-[10px] font-black text-green-600 uppercase text-center bg-green-50/30">P</th>
                <th className="px-3 py-4 text-[10px] font-black text-amber-600 uppercase text-center bg-amber-50/30">L</th>
                <th className="px-3 py-4 text-[10px] font-black text-red-600 uppercase text-center bg-red-50/30">A</th>
                <th className="px-3 py-4 text-[10px] font-black text-blue-600 uppercase text-center bg-blue-50/30 border-r border-slate-100">E</th>
                
                {/* Monthly Days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                  <th key={day} className={`px-2 py-4 text-[10px] font-black uppercase text-center min-w-[40px] ${isWeekend(day) ? 'bg-slate-100/50 text-slate-500' : 'text-slate-400'}`}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => {
                const stats = getAttendanceSummary(member.id);
                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px]">
                          {member.name.charAt(0)}
                        </div>
                        <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{member.name}</p>
                      </div>
                    </td>
                    
                    {/* Stats cells */}
                    <td className="px-3 py-4 text-center font-black text-xs text-green-600 bg-green-50/10">{stats.present}</td>
                    <td className="px-3 py-4 text-center font-black text-xs text-amber-600 bg-amber-50/10">{stats.late}</td>
                    <td className="px-3 py-4 text-center font-black text-xs text-red-600 bg-red-50/10">{stats.absent}</td>
                    <td className="px-3 py-4 text-center font-black text-xs text-blue-600 bg-blue-50/10 border-r border-slate-100">{stats.excused}</td>

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const record = attendanceRecords.find(r => r.memberId === member.id && r.date === dateStr);
                      const info = getStatusInfo(record?.status);

                      return (
                        <td key={day} className={`p-1 text-center ${isWeekend(day) ? 'bg-slate-50/30' : ''}`}>
                          <button
                            onClick={() => handleToggleStatus(member.id, day)}
                            className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all border flex items-center justify-center ${info.color} ${info.border} ${currentRole === UserRole.MEMBER ? 'cursor-default' : 'hover:scale-110 active:scale-90'}`}
                            title={`${member.name} - ${day} ${monthName}: ${record?.status || 'Unmarked'}`}
                          >
                            {info.char}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl flex items-start space-x-4 border border-slate-200 border-dashed">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Info size={20} className="text-blue-500" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Administrative Guidelines</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            This sheet is a real-time tracking tool. Changes are automatically updated in the central registry. 
            Members with more than 3 unexplained absences (A) in a single month may be subject to disciplinary review as per Ebenezer Praise Team standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
