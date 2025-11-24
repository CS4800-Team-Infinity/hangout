'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from "@/components/ui/checkbox"

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  passwordHash?: string;
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

export default function UsersPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const endpoint = isAdmin ? '/api/admin/users' : '/api/users/list';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError('failed to fetch users');
      }
    } catch (err) {
      setError('error loading users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!isAdmin) return;
    
    const confirmed = window.confirm(`are you sure you want to delete user "${userName}"? this action cannot be undone.`);
    if (!confirmed) return;

    setDeleting(userId);
    
    try {
      const response = await fetch(`/api/admin/delete-user?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
        alert(`user "${userName}" has been deleted successfully.`);
      } else {
        alert(`failed to delete user: ${data.error}`);
      }
    } catch (err) {
      alert('error deleting user. please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div>please log in to view users.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-400">error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black pt-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">registered users ({users.length})</h1>
          
          {isAdmin && (
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="rounded"
                />
                show password hashes
              </label>
            </div>
          )}
        </div>
        
        {users.length === 0 ? (
          <div className="text-zinc-400">no users have signed up yet.</div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user._id} className="bg-white p-6 rounded-lg border border-zinc-300">
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-zinc-400">@{user.username}</p>
                    <p className="text-zinc-400">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-sm bg-red-800 text-zinc-100`}>
                        {user.role}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        user.isActive ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                      }`}>
                        {user.isActive ? 'active' : 'inactive'}
                      </span>
                    </div>
                    
                    {isAdmin && showPasswords && user.passwordHash && (
                      <div className="mt-3 p-3 bg-zinc-100 rounded border-l-4 border-zinc-500">
                        <p className="text-zinc-800 text-xs font-semibold mb-1">PASSWORD HASH:</p>
                        <p className="text-xs text-zinc-600 font-mono break-all">
                          {user.passwordHash}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right text-sm text-zinc-400">
                      <div>joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                      <div>last active: {new Date(user.lastActive).toLocaleDateString()}</div>
                    </div>
                    
                    {isAdmin && user._id !== currentUser?.id && (
                      <button
                        onClick={() => deleteUser(user._id, user.name)}
                        disabled={deleting === user._id}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          deleting === user._id
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                        }`}
                      >
                        {deleting === user._id ? 'deleting...' : 'delete user'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={fetchUsers}
          className="my-4 bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
        >
          refresh
        </button>
      </div>
    </div>
  );
}