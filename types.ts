
export enum UserRole {
  ADMIN = 'ADMIN',
  SECRETARIAT = 'SECRETARIAT',
  TREASURER = 'TREASURER',
  DISCIPLINARY = 'DISCIPLINARY',
  MUSIC_DEPT = 'MUSIC_DEPT',
  MEMBER = 'MEMBER'
}

export interface Member {
  id: string;
  name: string;
  role: string;
  voicePart: 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist';
  cellGroup: string;
  phoneNumber: string;
  dateOfBirth: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Transferred';
  joinedDate: string;
  photo?: string;
  username?: string;
  password?: string;
}

export interface CommitteeMember {
  id: string;
  memberId: string;
  name: string;
  committeeRole: 'Chairperson' | 'Secretary' | 'Member';
  appointedDate: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
}

export interface TeamProject {
  id: string;
  name: string;
  category: 'Munkoyo' | 'Transport' | 'Farming' | 'Poultry' | 'Meat Selling';
  description: string;
  status: 'Active' | 'On Hold' | 'Completed';
  totalRevenue: number;
  totalExpenses: number;
  lastUpdate: string;
}

export interface ProjectTransaction {
  id: string;
  projectId: string;
  date: string;
  type: 'Revenue' | 'Expense';
  amount: number;
  description: string;
}

export interface MemberContribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  type: 'Tithe' | 'Offering' | 'UCZ Mission Fund' | 'Subscription' | 'Harvest';
}

export interface SubscriptionRecord {
  id: string;
  memberId: string;
  memberName: string;
  month: string; // "January 2024"
  amountPaid: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
}

export interface HarvestRecord {
  id: string;
  memberId: string;
  memberName: string;
  assessmentAmount: number;
  amountPaid: number;
  status: 'Met' | 'Pending';
}

export interface ConcertFinance {
  id: string;
  concertName: string;
  type: 'Main Ebe' | 'Group' | 'Other';
  date: string;
  budget: number;
  actualIncome: number;
  actualExpense: number;
  status: 'Planning' | 'Completed';
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

export interface TeamEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  author: string;
  type: 'Rehearsal' | 'Service' | 'Meeting' | 'Outreach' | 'Concert';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'Normal' | 'Urgent';
}

export interface Song {
  id: string;
  title: string;
  key: string;
  composer: string;
  tags: string[];
}

export interface DisciplinaryCase {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  issue: string;
  resolution: string;
  status: 'Open' | 'Closed';
  fineAmount: number;
  finePaid: number;
}

export interface GroupRule {
  id: string;
  title: string;
  description: string;
  category: 'Punctuality' | 'Uniform' | 'Conduct' | 'Financial' | 'General' | 'Other';
  effectiveDate: string;
  fileName?: string;
}

export interface ViolationPreset {
  id: string;
  label: string;
  amount: number;
  category: string;
}

export interface MeetingMinutes {
  id: string;
  date: string;
  title: string;
  category: 'General' | 'Music Dept' | 'Committee' | 'Disciplinary';
  attendees: string[];
  content: string;
  fileName?: string;
}
