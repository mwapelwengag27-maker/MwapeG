
import React, { useState, useRef } from 'react';
import { Member, UserRole } from '../types.ts';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Lock, 
  Key, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2,
  Calendar,
  MapPin,
  Mic2
} from 'lucide-react';

interface ProfileProps {
  currentUser: any;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  currentRole: UserRole;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, members, setMembers, currentRole }) => {
  const memberId = currentUser?.member_id;
  const currentMember = members.find(m => m.id === memberId);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentMember?.name || currentUser?.display_name || '',
    phoneNumber: currentMember?.phoneNumber || '',
    username: currentMember?.username || currentUser?.username || '',
    password: currentMember?.password || '',
    photo: currentMember?.photo || ''
  });

  if (!currentMember && currentRole !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <User size={48} className="text-slate-200 mb-4" />
        <p className="text-slate-500 font-bold">Member record not linked to this portal session.</p>
        <p className="text-xs text-slate-400 mt-1">Please contact the administrator to link your profile.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          phoneNumber: formData.phoneNumber,
          username: formData.username,
          password: formData.password,
          photo: formData.photo
        };
      }
      return m;
    }));

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your personal information and portal security.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Changes Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                {formData.photo ? (
                  <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-200" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Camera size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="mt-6 space-y-1">
              <h3 className="text-xl font-black text-slate-900">{formData.name}</h3>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{currentRole}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 w-full space-y-4 text-left">
              <div className="flex items-center space-x-3 text-slate-500">
                <Mic2 size={16} className="text-slate-400" />
                <span className="text-xs font-bold">{currentMember?.voicePart || 'Section Not Set'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-xs font-bold">{currentMember?.cellGroup || 'Group Not Set'}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-xs font-bold italic">Joined {currentMember?.joinedDate || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheck size={18} className="text-blue-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Portal Security</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Your account is protected by industry-standard encryption. Ensure your password is kept private.
            </p>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <section className="space-y-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
                <User size={16} className="mr-3 text-blue-600" /> Personal Identity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Member Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    disabled
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-400 outline-none cursor-not-allowed"
                  />
                  <p className="text-[9px] text-slate-400 mt-2 italic">* Contact administrator to correct name spellings.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="tel" 
                      placeholder="+260..."
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-50"></div>

            <section className="space-y-6">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
                <Key size={16} className="mr-3 text-blue-600" /> Access Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Portal Username</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Security Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center space-x-3 disabled:bg-slate-200 disabled:shadow-none"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <Save size={20} />
                    <span>Synchronize Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
