import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

/**
 * Users Page
 * Displays table of all users in the system
 * Shows: Name, Role (Farmer/Distributor/Retailer), User ID
 */
const Users = () => {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  // Add user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Farmer');

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
    }, (err) => {
      console.error('[Users] farmers snapshot error', err);
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
    }, (err) => {
      console.error('[Users] consumers snapshot error', err);
    });

    return () => {
      unsubF && unsubF();
      unsubC && unsubC();
    };
  }, []);

  // focus-users support (optional): scroll to top of page when requested
  useEffect(() => {
    const handler = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    window.addEventListener('focus-users', handler);
    return () => window.removeEventListener('focus-users', handler);
  }, []);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditName(user.name || '');
    setEditRole(user.role || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditRole('');
  };

  const saveEdit = async (user) => {
    try {
      const collectionName = user.role === 'Farmer' ? 'farmers' : 'consumers';
      const ref = doc(db, collectionName, user.id);
      await updateDoc(ref, { fullName: editName, role: editRole });
      cancelEdit();
    } catch (err) {
      console.error('Failed to save user edit', err);
      alert('Failed to save changes');
    }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Delete user ${user.name || user.id}? This cannot be undone.`)) return;
    try {
      const collectionName = user.role === 'Farmer' ? 'farmers' : 'consumers';
      const ref = doc(db, collectionName, user.id);
      await deleteDoc(ref);
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Delete failed');
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    const email = newEmail.trim();
    const role = newRole;
    if (!name || !email) {
      alert('Please provide name and email');
      return;
    }
    try {
      const collectionName = role === 'Farmer' ? 'farmers' : 'consumers';
      const ref = doc(db, collectionName, email);
      await setDoc(ref, { fullName: name, email, role, registeredAt: serverTimestamp() }, { merge: true });
      setNewName(''); setNewEmail(''); setNewRole('Farmer');
      alert('User added');
    } catch (err) {
      console.error('Failed to add user', err);
      alert('Add user failed');
    }
  };

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
        <form onSubmit={addUser} className="flex items-center space-x-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" className="px-3 py-2 border rounded-lg" />
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com" className="px-3 py-2 border rounded-lg" />
          <select value={newRole} onChange={e => setNewRole(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option>Farmer</option>
            <option>Consumer</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">➕ Add</button>
        </form>
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
                        {(user.name || '').charAt(0)}
                      </div>
                      {editingId === user.id ? (
                        <input value={editName} onChange={e => setEditName(e.target.value)} className="text-sm font-medium text-gray-900 border-b" />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === user.id ? (
                      <select value={editRole} onChange={e => setEditRole(e.target.value)} className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(editRole)}`}>
                        <option>Farmer</option>
                        <option>Consumer</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingId === user.id ? (
                      <>
                        <button onClick={() => saveEdit(user)} className="text-green-600 hover:text-green-900 mr-3">Save</button>
                        <button onClick={cancelEdit} className="text-gray-600 hover:text-gray-900 mr-3">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(user)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button onClick={() => deleteUser(user)} className="text-red-600 hover:text-red-900">Delete</button>
                      </>
                    )}
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
