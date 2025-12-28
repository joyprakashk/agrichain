const admin = require('firebase-admin');
const path = require('path');

const saPath = path.join(__dirname, 'serviceAccountKey.json');
try {
  const serviceAccount = require(saPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  (async () => {
    try {
      const farmersSnap = await db.collection('farmers').get();
      console.log('farmers count:', farmersSnap.size);

      let totalProduce = 0;
      let produceWithTrace = 0;
      for (const f of farmersSnap.docs) {
        const pSnap = await db.collection('farmers').doc(f.id).collection('produce').get();
        totalProduce += pSnap.size;
        pSnap.forEach(d => { if (d.data() && d.data().traceId) produceWithTrace++; });
      }
      console.log('total produce:', totalProduce, 'produce with traceId:', produceWithTrace);

      const consumersSnap = await db.collection('consumers').get();
      console.log('consumers count:', consumersSnap.size);

      const ordersGroup = await db.collectionGroup('orders').get();
      console.log('orders count (collectionGroup):', ordersGroup.size);

      if (!farmersSnap.empty) {
        console.log('sample farmer id:', farmersSnap.docs[0].id, 'data:', farmersSnap.docs[0].data());
      }
      if (!ordersGroup.empty) {
        const doc = ordersGroup.docs[0];
        console.log('sample order:', { id: doc.id, data: doc.data() });
      }

      process.exit(0);
    } catch (err) {
      console.error('Error querying Firestore:', err);
      process.exit(2);
    }
  })();
} catch (err) {
  console.error('Failed to load serviceAccountKey.json at', saPath, err);
  process.exit(1);
}
