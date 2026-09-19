const { db } = require('../config/firebase');
const { calculatePoints, normalizeLabel } = require('../utils/scoring');

const COLLECTION = 'pointRules';

const DEFAULT_RULES = [
  { label: 'beginner', points: 10, description: 'Beginner-friendly contribution' },
  { label: 'good first issue', points: 15, description: 'Good first issue for newcomers' },
  { label: 'bug', points: 20, description: 'Bug fix' },
  { label: 'documentation', points: 5, description: 'Documentation update' },
  { label: 'frontend', points: 15, description: 'Frontend work' },
  { label: 'backend', points: 20, description: 'Backend work' },
  { label: 'feature', points: 25, description: 'New feature' },
  { label: 'enhancement', points: 20, description: 'Enhancement to existing functionality' },
  { label: 'major-feature', points: 40, description: 'Major feature implementation' },
  { label: 'testing', points: 15, description: 'Testing contribution' },
  { label: 'ui-improvement', points: 15, description: 'UI/UX improvement' },
  { label: 'refactor', points: 15, description: 'Code refactoring' },
  { label: 's2c:minor-docs', points: 10, description: 'S2C Tier: Minor documentation improvement' },
  { label: 's2c:helpful-issue', points: 15, description: 'S2C Tier: Helpful issue or report' },
  { label: 's2c:bug-fix', points: 25, description: 'S2C Tier: Bug fix' },
  { label: 's2c:significant-docs', points: 25, description: 'S2C Tier: Significant documentation or tutorial' },
  { label: 's2c:meaningful-improvement', points: 50, description: 'S2C Tier: Meaningful feature or improvement' },
  { label: 's2c:major-feature', points: 75, description: 'S2C Tier: Major feature or significant improvement' }
];

async function getActiveRules() {
  if (!db) {
    return DEFAULT_RULES.map(r => ({ id: r.label, ...r, active: true }));
  }
  const snapshot = await db.collection(COLLECTION)
    .where('active', '==', true)
    .get();
  const rules = [];
  snapshot.forEach(doc => {
    rules.push({ id: doc.id, ...doc.data() });
  });
  return rules;
}

async function getAllRules() {
  if (!db) {
    return DEFAULT_RULES.map(r => ({ id: r.label, ...r, active: true }));
  }
  const snapshot = await db.collection(COLLECTION)
    .orderBy('label')
    .get();
  const rules = [];
  snapshot.forEach(doc => {
    rules.push({ id: doc.id, ...doc.data() });
  });
  return rules;
}

async function getRulesMap() {
  const rules = await getActiveRules();
  const map = new Map();
  for (const rule of rules) {
    map.set(normalizeLabel(rule.label), rule.points);
  }
  return map;
}

async function updateRule(label, data, adminEmail) {
  const normalized = normalizeLabel(label);
  const ref = db.collection(COLLECTION).doc(normalized);
  const doc = await ref.get();
  const now = new Date();

  const updateData = {
    label: normalized,
    points: data.points,
    description: data.description || '',
    active: data.active !== false,
    updatedBy: adminEmail,
    updatedAt: now
  };

  const previousValue = doc.exists ? doc.data() : null;

  if (doc.exists) {
    await ref.update(updateData);
  } else {
    updateData.createdAt = now;
    await ref.set(updateData);
  }

  return { previousValue, newValue: updateData };
}

async function calculateContributionPoints(prLabels) {
  const rulesMap = await getRulesMap();
  return calculatePoints(prLabels, rulesMap);
}

async function seedDefaultRules() {
  const batch = db.batch();
  const now = new Date();

  for (const rule of DEFAULT_RULES) {
    const ref = db.collection(COLLECTION).doc(normalizeLabel(rule.label));
    batch.set(ref, {
      label: normalizeLabel(rule.label),
      points: rule.points,
      description: rule.description,
      active: true,
      updatedBy: 'system',
      updatedAt: now,
      createdAt: now
    }, { merge: true });
  }

  await batch.commit();
  return DEFAULT_RULES.length;
}

module.exports = {
  getActiveRules,
  getAllRules,
  getRulesMap,
  updateRule,
  calculateContributionPoints,
  seedDefaultRules,
  DEFAULT_RULES
};
