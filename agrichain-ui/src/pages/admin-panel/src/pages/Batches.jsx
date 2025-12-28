import React, { useEffect, useState } from 'react';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

/**
 * Batches Page
 * Displays all produce batches with verification status
 * Shows: Batch ID, Status (Verified/Unverified), Farmer, Product Name, Verification Time
 */
const Batches = () => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    let unsub = null;
    unsub = onSnapshot(collectionGroup(db, 'produce'), (snap) => {
      console.log('[Batches] produce snapshot size:', snap.size);
      const items = snap.docs.map((doc, idx) => {
        const data = doc.data() || {};
        const parent = doc.ref.parent?.parent;
        const farmerEmail = parent ? parent.id : (data.farmerEmail || '');
        const verifiedAt = data.verifiedAt ? (data.verifiedAt.toDate ? data.verifiedAt.toDate() : new Date(data.verifiedAt)) : null;
        return {
          id: doc.id || idx,
          produceName: data.produceName || data.name || '',
          farmerEmail,
          status: data.status || 'unverified',
          traceId: data.traceId || '',
          verifiedAt,
          quantity: data.quantity || '',
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null,
        };
      });
      console.log('[Batches] parsed items count:', items.length);
      setBatches(items);
    }, (err) => {
      console.error('[Batches] produce snapshot error', err);
      if (typeof unsub === 'function') try { unsub(); } catch(e){}
    });

    return () => {
      unsub && typeof unsub === 'function' && unsub();
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'unverified':
        return 'bg-yellow-100 text-yellow-800';
      case 'fake':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const verifiedCount = batches.filter(b => b.status === 'verified').length;
  const unverifiedCount = batches.filter(b => b.status === 'unverified').length;
  const fakeCount = batches.filter(b => b.status === 'fake').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
        <p className="text-gray-600 mt-2">
          Monitor all produce batches and their verification status
        </p>
      </div>

      {/* Batch Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Total Batches</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{batches.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Verified</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{verifiedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Unverified</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{unverifiedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Fake</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{fakeCount}</p>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {batch.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {batch.produceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {batch.farmerEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {batch.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(batch.status)}`}>
                      {batch.status === 'verified' ? '✓ Verified' : batch.status === 'unverified' ? 'Unverified' : batch.status === 'fake' ? '⚠ Fake' : batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {batch.verifiedAt ? batch.verifiedAt.toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Batches;
