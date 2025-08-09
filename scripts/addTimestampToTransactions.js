// Run this script with Node.js after setting up Firebase Admin SDK credentials
// This will add a 'timestamp' field to all transactions that are missing it

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function addTimestampToTransactions() {
  const snapshot = await db.collection('transactions').get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.timestamp) {
      // Use 'date' if available, otherwise current time
      let ts = Timestamp.now();
      if (data.date) {
        try {
          ts = Timestamp.fromMillis(Number(data.date));
        } catch {}
      }
      await doc.ref.update({ timestamp: ts });
      updated++;
      console.log(`Updated transaction ${doc.id}`);
    }
  }
  console.log(`Done. Updated ${updated} transactions.`);
}

addTimestampToTransactions().catch(console.error);
