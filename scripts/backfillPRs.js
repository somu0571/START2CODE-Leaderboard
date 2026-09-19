require('dotenv').config();

const { Octokit } = require('@octokit/rest');
const repoConfig = require('../config/repo');
const webhookService = require('../services/webhookService');
const { db } = require('../config/firebase');

async function main() {
  console.log('--- START2CODE: Pull Request Backfill Script ---');

  if (!db) {
    console.error('Error: Firestore is not initialized. Please verify your Firebase credentials in .env.');
    process.exit(1);
  }

  const octokit = new Octokit({
    auth: repoConfig.token || undefined,
    userAgent: 'START2CODE-Backfill/1.0'
  });

  console.log(`Fetching merged PRs from repository: ${repoConfig.owner}/${repoConfig.name}...`);

  try {
    const { data: prs } = await octokit.pulls.list({
      owner: repoConfig.owner,
      repo: repoConfig.name,
      state: 'closed',
      per_page: 100,
      sort: 'updated',
      direction: 'desc'
    });

    const mergedPRs = prs.filter(pr => pr.merged_at);
    console.log(`Found ${mergedPRs.length} merged pull requests.`);

    let successCount = 0;
    let errorCount = 0;

    for (const pr of mergedPRs) {
      console.log(`Processing PR #${pr.number} ("${pr.title}") by @${pr.user.login}...`);
      try {
        const result = await webhookService.resyncPR(pr.number, 'backfill-script');
        console.log(`  -> Status: ${result.status}, Awarded: ${result.points || 0} pts`);
        successCount++;
      } catch (err) {
        console.error(`  -> Failed: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\nBackfill completed: ${successCount} processed, ${errorCount} errors.`);
    process.exit(0);
  } catch (err) {
    console.error('GitHub API error during backfill:', err.message);
    process.exit(1);
  }
}

main();
