import admin from 'firebase-admin';

// Do not call admin.firestore() at module load time because server initializes Firebase Admin later.
// Each handler will call admin.firestore() when invoked.

const quoteCell = (v) => {
  if (v === null || v === undefined) return '';
  let s = String(v);
  s = s.replace(/"/g, '""');
  if (/[",\n]/.test(s)) return `"${s}"`;
  return s;
};

const sectionsToCSV = (sections) => {
  const lines = sections.map(row => {
    if (!row || row.length === 0) return '';
    return row.map(quoteCell).join(',');
  });
  return lines.join('\n');
};

export const requireAdminSecret = (req, res, next) => {
  const secret = req.headers['x-admin-secret'] || req.query.admin_secret;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

export const addUser = async (req, res) => {
  try {
    const { email, fullName, role } = req.body;
    if (!email || !fullName || !role) return res.status(400).json({ message: 'Missing fields' });
    const db = admin.firestore();
    const collectionName = role === 'Farmer' ? 'farmers' : 'consumers';
    await db.collection(collectionName).doc(email).set({ fullName, email, role, registeredAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return res.status(200).json({ message: 'User added' });
  } catch (err) {
    console.error('admin.addUser error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
};

export const editUser = async (req, res) => {
  try {
    const { id, fullName, role } = req.body;
    if (!id || !role) return res.status(400).json({ message: 'Missing fields' });
    const db = admin.firestore();
    const collectionName = role === 'Farmer' ? 'farmers' : 'consumers';
    await db.collection(collectionName).doc(id).update({ fullName });
    return res.status(200).json({ message: 'User updated' });
  } catch (err) {
    console.error('admin.editUser error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id, role } = req.body;
    if (!id || !role) return res.status(400).json({ message: 'Missing fields' });
    const db = admin.firestore();
    const collectionName = role === 'Farmer' ? 'farmers' : 'consumers';
    await db.collection(collectionName).doc(id).delete();
    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error('admin.deleteUser error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
};

export const verifyBatch = async (req, res) => {
  try {
    const { traceId } = req.body || {};
    const db = admin.firestore();
    
    console.log('🔍 [verifyBatch] Starting verification. traceId:', traceId || 'all unverified');
    
    // Collect all produce docs by iterating through farmers
    const allProduceDocs = [];
    const farmersSnap = await db.collection('farmers').get();
    console.log(`📁 Found ${farmersSnap.size} farmers`);
    
    for (const farmerDoc of farmersSnap.docs) {
      const produceSnap = await farmerDoc.ref.collection('produce').get();
      console.log(`  └─ ${farmerDoc.id}: ${produceSnap.size} produce docs`);
      produceSnap.forEach(doc => {
        allProduceDocs.push({ ref: doc.ref, data: doc.data() });
      });
    }
    
    console.log(`📦 Total produce docs found: ${allProduceDocs.length}`);
    
    // Filter by traceId if provided, otherwise get unverified (no status='verified')
    let docsToUpdate = allProduceDocs;
    if (traceId) {
      docsToUpdate = allProduceDocs.filter(d => d.data.traceId === traceId);
      console.log(`🔎 Filtered by traceId: ${docsToUpdate.length} docs`);
    } else {
      // Unverified = status != 'verified'
      docsToUpdate = allProduceDocs.filter(d => d.data.status !== 'verified');
      console.log(`⏳ Unverified docs (status != 'verified'): ${docsToUpdate.length}`);
    }
    
    if (docsToUpdate.length === 0) {
      console.log('✅ All batches are already verified!');
      return res.status(200).json({ message: 'All batches already verified', count: 0 });
    }
    
    console.log(`⚙️ Updating ${docsToUpdate.length} documents...`);
    const updates = [];
    docsToUpdate.forEach(item => {
      console.log(`  ✏️ Updating: ${item.ref.path}`);
      updates.push(item.ref.update({ status: 'verified', verifiedAt: admin.firestore.FieldValue.serverTimestamp() }));
    });
    
    await Promise.all(updates);
    console.log(`✅ [verifyBatch] Success! Updated ${updates.length} batches`);
    return res.status(200).json({ message: 'Batch verified', count: updates.length });
  } catch (err) {
    console.error('❌ [verifyBatch] Error:', err.code, err.message);
    return res.status(500).json({ message: `Verify failed: ${err.message}` });
  }
};;

export const generateReport = async (req, res) => {
  try {
    // Fetch farmers
    const db = admin.firestore();
    const farmersSnap = await db.collection('farmers').get();
    const farmers = farmersSnap.docs.map(d => ({ id: d.id, ...(d.data()||{}) }));

    // Fetch consumers
    const consumersSnap = await db.collection('consumers').get();
    const consumers = consumersSnap.docs.map(d => ({ id: d.id, ...(d.data()||{}) }));

    // Fetch produce
    const produceSnap = await db.collectionGroup('produce').get();
    const produce = produceSnap.docs.map(d => ({ id: d.id, ...(d.data()||{}), path: d.ref.path }));

    // Fetch orders
    const ordersSnap = await db.collectionGroup('orders').get();
    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...(d.data()||{}), path: d.ref.path }));

    // Build CSV with sections
    const sections = [];
    sections.push(['Users']);
    sections.push(['id','fullName','email','registeredAt']);
    farmers.forEach(f => sections.push([f.id, f.fullName||'', f.email||'', f.registeredAt||'']));
    sections.push([]);
    sections.push(['Consumers']);
    sections.push(['id','fullName','email','registeredAt']);
    consumers.forEach(c => sections.push([c.id, c.fullName||'', c.email||'', c.registeredAt||'']));
    sections.push([]);
    sections.push(['Produce']);
    sections.push(['id','produceName','quantity','status','traceId','path','createdAt']);
    produce.forEach(p => sections.push([p.id, p.produceName||'', p.quantity||'', p.status||'', p.traceId||'', p.path||'', p.createdAt||'']));
    sections.push([]);
    sections.push(['Orders']);
    sections.push(['id','productName','farmerEmail','consumerEmail','status','traceId','createdAt','path']);
    orders.forEach(o => sections.push([o.id, o.productName||'', o.farmerEmail||'', o.consumerEmail||'', o.status||'', o.traceId||'', o.createdAt||'', o.path||'']));

    // Convert to CSV string
    const csv = sectionsToCSV(sections);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="agri-report-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error('admin.generateReport error', err);
    res.status(500).json({ message: 'Internal error' });
  }
};

export default {
  addUser,
  editUser,
  deleteUser,
  verifyBatch,
  generateReport,
  requireAdminSecret
};
