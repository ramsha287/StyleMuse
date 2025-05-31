import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL;

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users data
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched Users:', res.data.users);
      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      setError('Error fetching users.');
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  };

  // Toggle user status between active and inactive
  const toggleUserStatus = async (id, currentStatus) => {
    const token = localStorage.getItem('token');
    const endpoint = currentStatus 
      ? `${API_URL}/api/users/${id}/deactivate` 
      : `${API_URL}/api/users/${id}/reactivate`;
  
    try {
      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // Refresh user list after status change
    } catch (err) {
      console.error('Error updating user status', err);
    }
  };
  

  // Load users when component is mounted
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <h2 className="text-3xl font-bold mb-8 text-stone text-center mt-8">Manage Users</h2>

      {loading ? (
        <p className="text-1xl font-bold mb-8 text-stone text-center mt-8">Loading users...</p>
      ) : error ? (
        <p className="text-1xl font-bold mb-8 text-stone text-center mt-8">{error}</p>
      ) : (
        <div className="grid gap-6">
          {users.length === 0 ? (
            <p className="text-1xl font-bold mb-8 text-stone text-center mt-8">No users found</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="bg-linen border border-beige rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-sm text-taupe">Email: {user.email}</p>
                    <p className="text-sm text-taupe">Role: {user.role}</p>
                    <p className="text-sm text-taupe">
                      Status: <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                    className="bg-stone text-white px-4 py-1 rounded-lg hover:bg-opacity-90"
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminManageUsers;
