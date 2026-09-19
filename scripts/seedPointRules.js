require('dotenv').config();

const { seedDefaultRules, DEFAULT_RULES } = require('../services/pointsService');
const { db } = require('../config/firebase');

async function main() {
  console.log('--- START2CODE: Seeding Default Point Rules ---');

  if (!db) {
    console.error('Error: Firestore is not initialized. Please verify your Firebase credentials in .env.');
    process.exit(1);
  }

  try {
    const count = await seedDefaultRules();
    console.log(`Successfully seeded/updated ${count} default point rules in Firestore:`);
    DEFAULT_RULES.forEach(r => {
      console.log(`  - [${r.label}]: ${r.points} pts (${r.description})`);
    });
    console.log('\nSeeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed point rules:', err.message);
    process.exit(1);
  }
}

main();
