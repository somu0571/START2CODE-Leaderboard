const { db } = require('../config/firebase');

const COLLECTION = 'auditLogs';

async function log(entry) {
  await db.collection(COLLECTION).add({
    adminUserId: entry.adminUserId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    previousValue: entry.previousValue || null,
    newValue: entry.newValue || null,
    reason: entry.reason || '',
    createdAt: new Date()
  });
}

async function getLogs(limit = 50, startAfter = null) {
  let query = db.collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(limit);

  if (startAfter) {
    const afterDoc = await db.collection(COLLECTION).doc(startAfter).get();
    if (afterDoc.exists) {
      query = query.startAfter(afterDoc);
    }
  }

  const snapshot = await query.get();
  const logs = [];
  snapshot.forEach(doc => {
    logs.push({ id: doc.id, ...doc.data() });
  });
  return logs;
}

module.exports = { log, getLogs };
