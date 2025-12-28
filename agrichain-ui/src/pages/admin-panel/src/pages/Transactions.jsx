import React, { useEffect, useState } from 'react';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

/**
 * Transactions Page
 * Displays list of blockchain transactions
 * Shows transaction hashes, timestamps, and status
 */
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, 'orders'), (snap) => {
      console.log('[Transactions] orders snapshot size:', snap.size);
      const items = snap.docs.map((doc, idx) => {
        const data = doc.data() || {}
        const parent = doc.ref.parent?.parent
        const consumerEmail = parent ? parent.id : (data.consumerEmail || '')
        const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null
        return {
          id: doc.id || idx,
          productName: data.productName || data.name || '',
          farmerEmail: data.farmerEmail || data.farmer || '',
          consumerEmail,
          status: data.status || '',
          createdAt,
          traceId: data.traceId || ''
        }
      })
      // sort newest first
      items.sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      console.log('[Transactions] parsed items count:', items.length)
      setTransactions(items)
    })

    return () => unsub();
  }, []);

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Truncate hash for display
  const truncateHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-2">
          View all blockchain transactions in the supply chain
        </p>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Confirmed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {transactions.filter(t => t.status === 'Confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {transactions.filter(t => t.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {transactions.filter(t => t.status === 'Failed').length}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs text-blue-600 font-mono">
                      {truncateHash(tx.traceId)}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tx.farmerEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tx.consumerEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tx.totalAmount ?? tx.quantity ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tx.createdAt ? tx.createdAt.toLocaleString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(tx.status)}`}>
                      {tx.status}
                    </span>
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

export default Transactions;
