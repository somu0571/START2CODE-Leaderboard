const eventConfig = {
  name: process.env.EVENT_NAME || 'Start2Code',
  fullName: 'Start2Code \u2014 Git, GitHub & Open Source Bootcamp',
  tagline: 'Learn Git. Ship Code. Contribute to Open Source.',
  organizer: process.env.EVENT_ORGANIZER || 'GitHub Club, Technova - SSCSE, Sharda University',
  club: 'GitHub Club',
  society: 'Technova \u2014 The Technical Society of SSCSE',
  institution: 'Sharda University',
  leads: (process.env.EVENT_LEADS || 'Tanmoy Saha,Vishnu Shankar Tripathi').split(',').map(s => s.trim()),
  dates: {
    start: '2026-09-19',
    end: '2026-09-27',
    workshopEnd: '2026-09-20',
    marathonStart: process.env.MARATHON_START || '2026-09-21',
    marathonEnd: process.env.MARATHON_END || '2026-09-27'
  },
  mode: 'Online',
  duration: '2-Day Workshop + 1-Week Open Source Marathon',
  targetAudience: 'Students and beginners',
  prerequisites: 'No prior Git/GitHub knowledge required',
  tools: ['Git', 'GitHub', 'VS Code'],
  schedule: [
    { day: 'Day 1', title: 'Git Fundamentals & Basics', type: 'workshop' },
    { day: 'Day 2', title: 'Branching, Collaboration, Pull Requests & SSH', type: 'workshop' },
    { day: 'Day 2', title: 'Marathon Introduction', type: 'workshop' },
    { day: 'Days 3\u20138', title: 'Open Source Contribution Marathon', type: 'marathon' },
    { day: 'Day 8/9', title: 'Evaluation & Closing', type: 'closing' }
  ],
  description: [
    'The event consists of a two-day Git/GitHub workshop followed by a one-week open-source contribution marathon.',
    'Days 1\u20132 cover repositories, commits, branches, push/pull, forking, pull requests, merge conflicts, and SSH.',
    'Days 3\u20139 focus on the contribution marathon.',
    'Contributions are evaluated based on meaningful contribution value rather than commit count.',
    'Examples include code improvements, bug fixes, documentation, testing, useful features, and meaningful improvements.'
  ]
};

module.exports = eventConfig;
