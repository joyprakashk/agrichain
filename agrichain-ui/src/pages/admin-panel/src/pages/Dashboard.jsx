import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { collection, collectionGroup, onSnapshot, getDocs, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

/**
 * Dashboard Page
 * Main overview page showing key metrics and statistics
 * Displays: Total Farmers, Verified Batches, Fake Products Detected
 */
const Dashboard = () => {
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [verifiedBatches, setVerifiedBatches] = useState(0);
  const [fakeProducts, setFakeProducts] = useState(0);
  const [totalProduce, setTotalProduce] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  // human readable time
  const timeSince = (date) => {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];
    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };

  useEffect(() => {
    const unsubscribers = [];

    // Farmers count & registrations
    const farmersCol = collection(db, 'farmers');
    unsubscribers.push(onSnapshot(farmersCol, (snap) => {
      setTotalFarmers(snap.size);
    }));

    // All produce across farmers
    const produceGroup = collectionGroup(db, 'produce');
    unsubscribers.push(onSnapshot(produceGroup, (snap) => {
      console.log('[Dashboard] produce snapshot size:', snap.size);
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
      setTotalProduce(docs.length);
      // Verified = presence of traceId (blockchain hash)
      const verified = docs.filter(p => !!p.traceId).length;
      setVerifiedBatches(verified);
      const fakeCount = docs.filter(p => p.status === 'fake').length;
      setFakeProducts(fakeCount);
    }));

    // Recent activity from farmers, produce and orders
    const makeActivities = (farmerSnap, produceSnap, ordersSnap) => {
      const activities = [];

      farmerSnap?.docs?.forEach(doc => {
        const data = doc.data() || {};
        const date = data.registeredAt ? new Date(data.registeredAt) : null;
        activities.push({ id: `farmer-${doc.id}`, action: 'New farmer registered', user: data.fullName || doc.id, time: date, ts: date ? date.getTime() : 0 });
      });

      produceSnap?.docs?.forEach(doc => {
        const data = doc.data() || {};
        const date = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
        activities.push({ id: `produce-${doc.id}`, action: 'Produce registered', user: data.produceName || data.farmerEmail || 'Produce', time: date, ts: date ? date.getTime() : 0 });
      });

      ordersSnap?.docs?.forEach(doc => {
        const data = doc.data() || {};
        const parent = doc.ref.parent?.parent;
        const consumerEmail = parent ? parent.id : (data.consumerEmail || 'unknown');
        const date = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
        activities.push({ id: `order-${doc.id}`, action: 'Order placed', user: consumerEmail, time: date, ts: date ? date.getTime() : 0 });
      });

      activities.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setRecentActivity(activities.slice(0, 6));
    };

    // We need snapshots for farmers, produce and orders together; create three listeners
    let latestFarmerSnap = null;
    let latestProduceSnap = null;
    let latestOrdersSnap = null;

    let unsubF = null;
    unsubF = onSnapshot(collection(db, 'farmers'), (s) => { console.log('[Dashboard] farmers snapshot:', s.size); latestFarmerSnap = s; makeActivities(latestFarmerSnap, latestProduceSnap, latestOrdersSnap); }, (err) => { console.error('[Dashboard] farmers snapshot error', err); if (typeof unsubF === 'function') try { unsubF(); } catch(e){} });

    let unsubP = null;
    unsubP = onSnapshot(collectionGroup(db, 'produce'), (s) => { console.log('[Dashboard] produce snapshot:', s.size); latestProduceSnap = s; makeActivities(latestFarmerSnap, latestProduceSnap, latestOrdersSnap); }, (err) => { console.error('[Dashboard] produce snapshot error', err); if (typeof unsubP === 'function') try { unsubP(); } catch(e){} });

    let unsubO = null;
    unsubO = onSnapshot(collectionGroup(db, 'orders'), (s) => { console.log('[Dashboard] orders snapshot:', s.size); latestOrdersSnap = s; makeActivities(latestFarmerSnap, latestProduceSnap, latestOrdersSnap); }, (err) => { console.error('[Dashboard] orders snapshot error', err); if (typeof unsubO === 'function') try { unsubO(); } catch(e){} });

    unsubscribers.push(unsubF, unsubP, unsubO);

    return () => unsubscribers.forEach(u => u && typeof u === 'function' && u());
  }, []);

  // Quick Actions handlers
  useEffect(() => {
    const onAddUser = () => {
      // navigate to users route and focus
      window.location.hash = '#/admin/users';
      window.setTimeout(() => window.dispatchEvent(new CustomEvent('focus-users')), 200);
    };

    const fmtDate = (v) => {
      if (!v) return '';
      try {
        if (typeof v.toDate === 'function') return v.toDate().toISOString();
        if (v instanceof Date) return v.toISOString();
        return String(v);
      } catch (e) { return String(v); }
    };

    const onGenerateReport = async () => {
      try {
        const farmersSnap = await getDocs(collection(db, 'farmers'));
        const farmers = farmersSnap.docs.map(d => ({ id: d.id, ...(d.data()||{}) }));

        const produceSnap = await getDocs(collectionGroup(db, 'produce'));
        const produce = produceSnap.docs.map(d => ({ id: d.id, ...(d.data()||{}), _refPath: d.ref.path }));

        const ordersSnap = await getDocs(collectionGroup(db, 'orders'));
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...(d.data()||{}) }));

        const csvSections = [];
        csvSections.push('Users');
        csvSections.push('id,fullName,email,registeredAt');
        farmers.forEach(f => csvSections.push(`${f.id},"${(f.fullName||'').replace(/"/g,'""')}",${f.email || ''},${fmtDate(f.registeredAt)}`));

        csvSections.push('\nProduce');
        csvSections.push('id,produceName,quantity,status,traceId,farmerPath,createdAt');
        produce.forEach(p => csvSections.push(`${p.id},"${(p.produceName||'').replace(/"/g,'""')}",${p.quantity||''},${p.status||''},${p.traceId||''},"${p._refPath}","${fmtDate(p.createdAt)}"`));

        csvSections.push('\nOrders');
        csvSections.push('id,productName,farmerEmail,consumerEmail,status,traceId,createdAt');
        orders.forEach(o => csvSections.push(`${o.id},"${(o.productName||'').replace(/"/g,'""')}",${o.farmerEmail||''},${o.consumerEmail||''},${o.status||''},${o.traceId||''},"${fmtDate(o.createdAt)}"`));

        const csvContent = csvSections.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agri-report-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Generate report failed', err);
        alert('Failed to generate report');
      }
    };

    const onVerifyBatch = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, 'produce'));
        const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, data: d.data() || {} }));
        const unverified = docs.filter(d => !d.data.traceId);
        if (unverified.length === 0) {
          alert('No unverified produce found');
          return;
        }
        // sort by createdAt desc
        unverified.sort((a,b) => {
          const da = a.data.createdAt && a.data.createdAt.toDate ? a.data.createdAt.toDate().getTime() : (a.data.createdAt ? new Date(a.data.createdAt).getTime() : 0);
          const dbt = b.data.createdAt && b.data.createdAt.toDate ? b.data.createdAt.toDate().getTime() : (b.data.createdAt ? new Date(b.data.createdAt).getTime() : 0);
          return dbt - da;
        });
        const target = unverified[0];
        await updateDoc(target.ref, { status: 'verified', verifiedAt: serverTimestamp() });
        alert('Latest unverified produce marked as verified');
      } catch (err) {
        console.error('Verify batch failed', err);
        alert('Verification failed');
      }
    };

    window.addEventListener('admin-action-add-user', onAddUser);
    window.addEventListener('admin-action-generate-report', onGenerateReport);
    window.addEventListener('admin-action-verify-batch', onVerifyBatch);

    return () => {
      window.removeEventListener('admin-action-add-user', onAddUser);
      window.removeEventListener('admin-action-generate-report', onGenerateReport);
      window.removeEventListener('admin-action-verify-batch', onVerifyBatch);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your agricultural supply chain system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Farmers" value={totalFarmers.toString()} icon={'👨‍🌾'} bgColor={'bg-blue-50'} />
        <Card title="Verified Batches" value={verifiedBatches.toString()} icon={'✅'} bgColor={'bg-green-50'} />
        <Card title="Fake Products Detected" value={fakeProducts.toString()} icon={'⚠️'} bgColor={'bg-red-50'} />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {activity.user ? activity.user.charAt(0) : '•'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time ? timeSince(activity.time) : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blockchain Network</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Connection</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button onClick={() => window.dispatchEvent(new CustomEvent('admin-action-add-user'))} className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-left">
              ➕ Add New User
            </button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('admin-action-generate-report'))} className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left">
              📊 Generate Report
            </button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('admin-action-verify-batch'))} className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-left">
              🔍 Verify Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
