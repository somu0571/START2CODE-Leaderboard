const repoConfig = {
  owner: process.env.GITHUB_REPO_OWNER || 'somu0571',
  name: process.env.GITHUB_REPO_NAME || 'InternPilot',
  token: process.env.GITHUB_TOKEN || '',
  get fullName() {
    return `${this.owner}/${this.name}`;
  },
  get url() {
    return `https://github.com/${this.owner}/${this.name}`;
  },
  liveDemo: 'https://internpilot-mv9c.onrender.com/',
  description: 'AI-driven internship management platform with smart candidate workflows, multi-role auth, OTP, Google OAuth 2.0, automated status notifications.',
  license: 'MIT',
  origin: 'Project Based Learning \u2013 1',
  maintainers: ['Somsubhra Chatterjee', 'Vishnu Shankar Tripathi', 'Tanmoy Saha'],
  techStack: [
    'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Passport.js',
    'Local Authentication', 'Google OAuth 2.0', 'Express Session',
    'Connect Flash', 'EJS', 'ejs-mate', 'Tailwind CSS', 'JavaScript',
    'Nodemailer', 'dotenv'
  ],
  features: [
    'Candidate registration',
    'OTP verification',
    'Internship discovery',
    'Application tracking',
    'Company profiles',
    'Internship listings',
    'Admin management',
    'Google OAuth 2.0',
    'Role-based dashboards',
    'Automated status emails'
  ],
  highlightLabels: ['good first issue', 'beginner', 'documentation', 'bug', 'S2C approved']
};

module.exports = repoConfig;
