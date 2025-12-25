import React, { useState } from 'react';

/**
 * Transactions Page
 * Displays list of blockchain transactions
 * Shows transaction hashes, timestamps, and status
 */
const Transactions = () => {
  // Dummy transaction data
  const [transactions] = useState([
    {
      id: 1,
      hash: '0x7a3d8f9e2b1c4a5d6e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
      type: 'Product Registration',
      from: 'Farmer #4523',
      to: 'Blockchain Network',
      timestamp: '2024-01-15 10:23:45',
      status: 'Confirmed',
      amount: '-'
    },
    {
      id: 2,
      hash: '0x8b4e9a0f3c2d5b6e7f9a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
      type: 'Ownership Transfer',
      from: 'Farmer #4523',
      to: 'Distributor #89',
      timestamp: '2024-01-15 11:45:12',
      status: 'Confirmed',
      amount: '$500'
    },
    {
      id: 3,
      hash: '0x9c5f0b1e4d3a6c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d2',
      type: 'Quality Verification',
      from: 'Inspector #234',
      to: 'Blockchain Network',
      timestamp: '2024-01-15 12:10:33',
      status: 'Confirmed',
      amount: '-'
    },
    {
      id: 4,
      hash: '0xa0d6f1c2e5b4a7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d3',
      type: 'Batch Update',
      from: 'Distributor #89',
      to: 'Blockchain Network',
      timestamp: '2024-01-15 13:30:22',
      status: 'Pending',
      amount: '-'
    },
    {
      id: 5,
      hash: '0xb1e7f2d3a6c5b8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e4',
      type: 'Product Sale',
      from: 'Retailer #156',
      to: 'Consumer #7789',
      timestamp: '2024-01-15 14:55:10',
      status: 'Confirmed',
      amount: '$25'
    },
    {
      id: 6,
      hash: '0xc2f8e3d4b7a6c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e5',
      type: 'Product Registration',
      from: 'Farmer #2341',
      to: 'Blockchain Network',
      timestamp: '2024-01-15 15:20:45',
      status: 'Confirmed',
      amount: '-'
    },
    {
      id: 7,
      hash: '0xd3f9e4d5c8b7a0f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e6',
      type: 'Ownership Transfer',
      from: 'Distributor #112',
      to: 'Retailer #156',
      timestamp: '2024-01-15 16:10:18',
      status: 'Confirmed',
      amount: '$750'
    },
    {
      id: 8,
      hash: '0xe4f0e5d6c9b8a1f2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e7',
      type: 'Quality Check',
      from: 'Inspector #567',
      to: 'Blockchain Network',
      timestamp: '2024-01-15 17:05:55',
      status: 'Failed',
      amount: '-'
    },
  ]);

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
                      {truncateHash(tx.hash)}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tx.from}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tx.to}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tx.timestamp}
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
