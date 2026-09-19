require('dotenv').config();

const { auth } = require('../config/firebase');

async function main() {
  console.log('--- START2CODE: Admin Setup Script ---');

  if (!auth) {
    console.error('Error: Firebase Admin Auth is not initialized. Please verify your Firebase credentials in .env.');
    process.exit(1);
  }

  const email = process.argv[2] || process.env.INITIAL_ADMIN_EMAIL;
  const password = process.argv[3] || process.env.INITIAL_ADMIN_PASSWORD;

  if (!email) {
    console.log('\nUsage:');
    console.log('  node scripts/setupAdmin.js <email> [password]');
    console.log('\nExample:');
    console.log('  node scripts/setupAdmin.js admin@start2code.local SecretPassword123!\n');
    process.exit(1);
  }

  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`Found existing user with UID: ${user.uid}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        if (!password) {
          console.error(`User ${email} does not exist. Please provide a password to create the user.`);
          process.exit(1);
        }
        user = await auth.createUser({
          email,
          password,
          displayName: 'START2CODE Admin',
          emailVerified: true
        });
        console.log(`Created new Firebase user for ${email} with UID: ${user.uid}`);
      } else {
        throw err;
      }
    }

    // Assign admin: true custom claim
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully assigned { admin: true } custom claims to ${email}!`);
    console.log('This user can now authenticate and access the /admin dashboard.\n');
    process.exit(0);
  } catch (err) {
    console.error('Failed to setup admin user:', err.message);
    process.exit(1);
  }
}

main();
