
import { 
  Member, 
  FinancialRecord, 
  Song, 
  DisciplinaryCase, 
  AttendanceRecord, 
  MemberContribution, 
  TeamEvent, 
  Announcement,
  SubscriptionRecord,
  HarvestRecord,
  ConcertFinance,
  TeamProject,
  ProjectTransaction,
  MeetingMinutes,
  GroupRule,
  CommitteeMember
} from './types.ts';

export const CELL_GROUPS = [
  'Kasaka', 'Kawimbe', 'Lubwa', 'Kashinda', 'Kambole', 
  'Senga', 'Mbereshi', 'Mwandi', 'Niamukolo', 'Mwenzo', 'Chipembi'
];

export const MOCK_COMMITTEE: CommitteeMember[] = [
  { id: 'cm1', memberId: '1', name: 'John Phiri', committeeRole: 'Chairperson', appointedDate: '2023-01-10' },
  { id: 'cm2', memberId: '4', name: 'Grace Mutale', committeeRole: 'Secretary', appointedDate: '2023-01-10' },
  { id: 'cm3', memberId: '3', name: 'Peter Bwalya', committeeRole: 'Member', appointedDate: '2023-06-15' },
];

export const MOCK_RULES: GroupRule[] = [
  {
    id: 'r1',
    title: 'Punctuality Policy',
    category: 'Punctuality',
    description: 'All members must arrive 15 minutes before the start of any scheduled practice or service. Lateness attracts a fine as per the standard penalty schedule.',
    effectiveDate: '2024-01-01'
  },
  {
    id: 'r2',
    title: 'Uniform Standards',
    category: 'Uniform',
    description: 'Only approved Ebenezer uniforms are to be worn during Sunday services. Uniform must be clean and well-pressed. Wrong uniform attracts a K30 fine.',
    effectiveDate: '2024-02-15'
  },
  {
    id: 'r3',
    title: 'Code of Conduct',
    category: 'Conduct',
    description: 'Members are expected to maintain a Christ-like attitude at all times. Noise making during prayers or word ministration is strictly prohibited.',
    effectiveDate: '2024-01-01'
  }
];

export const MOCK_MINUTES: MeetingMinutes[] = [
  {
    id: 'm1',
    date: '2024-05-10',
    title: 'Quarterly Strategic Meeting',
    category: 'Committee',
    attendees: ['John Phiri', 'Mary Mwansa', 'Peter Bwalya'],
    content: 'Discussed the roadmap for the annual concert. Treasurer presented the IGA progress report.',
    fileName: 'quarterly_strat_may.pdf'
  },
  {
    id: 'm2',
    date: '2024-05-15',
    title: 'Music Selection Committee',
    category: 'Music Dept',
    attendees: ['Grace Mutale', 'John Phiri'],
    content: 'Vetted 5 new songs for the youth conference. Approved the use of acoustic arrangements.',
  }
];

export const MOCK_PROJECTS: TeamProject[] = [
  { id: 'p1', name: 'Ebenezer Munkoyo Hub', category: 'Munkoyo', description: 'Production and sales of local traditional brew.', status: 'Active', totalRevenue: 1500, totalExpenses: 600, lastUpdate: '2024-05-20' },
  { id: 'p2', name: 'Ebenezer Transport Services', category: 'Transport', description: 'Praise team owned vehicle assets for daily logistics and transport services.', status: 'Active', totalRevenue: 4500, totalExpenses: 1200, lastUpdate: '2024-05-21' },
  { id: 'p3', name: 'Maize & Veg Garden', category: 'Farming', description: 'Community plot for seasonal crops.', status: 'Active', totalRevenue: 800, totalExpenses: 300, lastUpdate: '2024-05-15' },
  { id: 'p4', name: 'Layer Poultry Project', category: 'Poultry', description: 'Chicken rearing for egg and meat production.', status: 'Active', totalRevenue: 2200, totalExpenses: 1500, lastUpdate: '2024-05-22' },
  { id: 'p5', name: 'Beef Resale Drive', category: 'Meat Selling', description: 'Bulk buying and community resale of quality meat.', status: 'On Hold', totalRevenue: 3000, totalExpenses: 2800, lastUpdate: '2024-04-10' },
];

export const MOCK_PROJECT_TRANSACTIONS: ProjectTransaction[] = [
  { id: 'pt1', projectId: 'p2', date: '2024-05-20', type: 'Revenue', amount: 150, description: 'Daily returns from logistics operations' },
  { id: 'pt2', projectId: 'p2', date: '2024-05-18', type: 'Expense', amount: 80, description: 'Asset maintenance and service' },
  { id: 'pt3', projectId: 'p4', date: '2024-05-19', type: 'Revenue', amount: 400, description: 'Sales of 10 trays of eggs' },
  { id: 'pt4', projectId: 'p1', date: '2024-05-21', type: 'Revenue', amount: 120, description: 'Sunday market sales' },
];

export const MOCK_MEMBERS: Member[] = [
  { 
    id: '1', 
    name: 'John Phiri', 
    role: 'Team Leader', 
    voicePart: 'Tenor', 
    cellGroup: 'Kasaka', 
    phoneNumber: '+260 971 000 001', 
    dateOfBirth: '1990-05-12', 
    status: 'Active', 
    joinedDate: '2022-01-15', 
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    username: 'john.phiri',
    password: 'password123'
  },
  { 
    id: '2', 
    name: 'Mary Mwansa', 
    role: 'Disciplinary Committee', 
    voicePart: 'Soprano', 
    cellGroup: 'Niamukolo', 
    phoneNumber: '+260 966 000 002', 
    dateOfBirth: '1995-10-25', 
    status: 'Active', 
    joinedDate: '2022-03-10', 
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    username: 'mary.mwansa',
    password: 'password123'
  },
  { 
    id: '3', 
    name: 'Peter Bwalya', 
    role: 'Music Dept Official', 
    voicePart: 'Instrumentalist', 
    cellGroup: 'Lubwa', 
    phoneNumber: '+260 955 000 003', 
    dateOfBirth: '1988-02-14', 
    status: 'Active', 
    joinedDate: '2023-05-20', 
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    username: 'peter.bwalya',
    password: 'password123'
  },
  { id: '4', name: 'Grace Mutale', role: 'Singer', voicePart: 'Alto', cellGroup: 'Chipembi', phoneNumber: '+260 977 000 004', dateOfBirth: '1992-07-08', status: 'On Leave', joinedDate: '2021-11-05', photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop' },
];

export const MOCK_FINANCE: FinancialRecord[] = [
  { id: '1', date: '2024-05-01', type: 'Income', category: 'Tithes', amount: 1200, description: 'Sunday Service Collection' },
  { id: '2', date: '2024-05-05', type: 'Expense', category: 'Equipment', amount: 450, description: 'Microphone Repair' },
  { id: '3', date: '2024-05-12', type: 'Income', category: 'Donation', amount: 500, description: 'Anonymous Gift' },
];

export const MOCK_SUBSCRIPTIONS: SubscriptionRecord[] = [
  { id: 's1', memberId: '1', memberName: 'John Phiri', month: 'May 2024', amountPaid: 10, status: 'Paid' },
  { id: 's2', memberId: '2', memberName: 'Mary Mwansa', month: 'May 2024', amountPaid: 10, status: 'Paid' },
  { id: 's3', memberId: '3', memberName: 'Peter Bwalya', month: 'May 2024', amountPaid: 5, status: 'Partial' },
  { id: 's4', memberId: '4', memberName: 'Grace Mutale', month: 'May 2024', amountPaid: 0, status: 'Unpaid' },
];

export const MOCK_HARVESTS: HarvestRecord[] = [
  { id: 'h1', memberId: '1', memberName: 'John Phiri', assessmentAmount: 500, amountPaid: 500, status: 'Met' },
  { id: 'h2', memberId: '2', memberName: 'Mary Mwansa', assessmentAmount: 500, amountPaid: 250, status: 'Pending' },
  { id: 'h3', memberId: '3', memberName: 'Peter Bwalya', assessmentAmount: 300, amountPaid: 100, status: 'Pending' },
];

export const MOCK_MEMBER_CONTRIBUTIONS: MemberContribution[] = [
  { id: 'c1', memberId: '1', memberName: 'John Phiri', amount: 200, date: '2024-05-10', type: 'Tithe' },
  { id: 'c2', memberId: '2', memberName: 'Mary Mwansa', amount: 150, date: '2024-05-12', type: 'Offering' },
  { id: 'c3', memberId: '3', memberName: 'Peter Bwalya', amount: 50, date: '2024-05-15', type: 'Tithe' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', memberId: '1', memberName: 'John Phiri', date: '2024-05-15', status: 'Present' },
  { id: 'a2', memberId: '2', memberName: 'Mary Mwansa', date: '2024-05-15', status: 'Late' },
  { id: 'a3', memberId: '3', memberName: 'Peter Bwalya', date: '2024-05-15', status: 'Absent' },
];

export const MOCK_EVENTS: TeamEvent[] = [
  { id: 'e1', title: 'Mid-week Practice', date: '2024-05-22', time: '17:30', location: 'UCZ Church Hall', type: 'Rehearsal', author: 'ADMIN' },
  { id: 'e2', title: 'Youth Praise Night', date: '2024-05-24', time: '19:00', location: 'Mpulungu Central', type: 'Outreach', author: 'ADMIN' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'an1', title: 'New Uniform Colors', content: 'Please note we will be wearing White and Gold for next Sunday.', date: '2024-05-18', author: 'SECRETARIAT', priority: 'Urgent' },
  { id: 'an2', title: 'Prayer Meeting', content: 'Morning prayers tomorrow at 05:00 AM on Zoom.', date: '2024-05-19', author: 'ADMIN', priority: 'Normal' },
];

export const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Amazing Grace', key: 'G', composer: 'John Newton', tags: ['Hymn', 'Classic'] },
  { id: '2', title: 'Way Maker', key: 'C', composer: 'Sinach', tags: ['Worship', 'Modern'] },
  { id: '3', title: 'Mwasuulwa', key: 'D', composer: 'Local Artist', tags: ['Bemba', 'Praise'] },
];

export const MOCK_DISCIPLINARY: DisciplinaryCase[] = [
  { id: '1', memberId: '3', memberName: 'Peter Bwalya', date: '2024-04-15', issue: 'Repeated lateness to practice', resolution: 'Verbal warning issued', status: 'Open', fineAmount: 50, finePaid: 0 },
  { id: '2', memberId: '2', memberName: 'Mary Mwansa', date: '2024-03-10', issue: 'Missing uniform during service', resolution: 'K20 fine paid', status: 'Closed', fineAmount: 20, finePaid: 20 },
];

export const MOCK_CONCERTS: ConcertFinance[] = [
  {
    id: 'c1',
    concertName: 'Annual Ebenezer Festival 2024',
    type: 'Main Ebe',
    date: '2024-12-20',
    budget: 15000,
    actualIncome: 4500,
    actualExpense: 1200,
    status: 'Planning'
  },
  {
    id: 'c2',
    concertName: 'Youth Outreach Night',
    type: 'Group',
    date: '2024-06-15',
    budget: 3000,
    actualIncome: 800,
    actualExpense: 500,
    status: 'Planning'
  }
];
