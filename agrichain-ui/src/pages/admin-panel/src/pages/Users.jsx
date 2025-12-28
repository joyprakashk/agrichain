import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

/**
 * Users Page
 * Displays table of all users in the system
 * Shows: Name, Role (Farmer/Distributor/Retailer), User ID
 */
const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // keep latest snapshots locally and merge deterministically
    let latestFarmers = [];
    let latestConsumers = [];

    const mergeAndSet = () => {
      setUsers([...latestFarmers, ...latestConsumers]);
    };

    const farmersCol = collection(db, 'farmers');
    const unsubF = onSnapshot(farmersCol, (snap) => {
      console.log('[Users] farmers snapshot size:', snap.size);
      latestFarmers = snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data()?.fullName || doc.id,
        role: 'Farmer',
        email: doc.data()?.email || doc.id,
        status: 'Active'
      }));
      mergeAndSet();
    });

    const consumersCol = collection(db, 'consumers');
    const unsubC = onSnapshot(consumersCol, (snap) => {
      console.log('[Users] consumers snapshot size:', snap.size);
      latestConsumers = snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data()?.fullName || doc.id,
        role: 'Consumer',
        email: doc.data()?.email || doc.id,
        status: 'Active'
      }));
      mergeAndSet();
    });

    return () => {
      unsubF && unsubF();
      unsubC && unsubC();
    };
  }, []);

  // Role badge colors
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Farmer':
        return 'bg-green-100 text-green-800';
      case 'Distributor':
        return 'bg-blue-100 text-blue-800';
      case 'Retailer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status badge colors
  const getStatusBadgeColor = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">
            Manage all users in the agricultural supply chain
          </p>
        </div>
        <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
          ➕ Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Active Users</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {users.filter(u => u.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Farmers</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {users.filter(u => u.role === 'Farmer').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
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

export default Users;
