'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  bio: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'delete'>('profile');

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    username: '',
    email: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminStats, setAdminStats] = useState<{ totalUsers: number; totalEvents: number } | null>(null);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    // only redirect to login after auth check completes
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
    // load admin stats when user is admin
    if (user?.role === 'admin') {
      const loadAdminStats = async () => {
        setLoadingAdminStats(true);
        setAdminError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setAdminStats({ totalUsers: data.totalUsers, totalEvents: data.totalEvents });
          } else {
            setAdminError(data.error || 'Failed to load admin stats');
          }
        } catch (err) {
          setAdminError('Failed to load admin stats');
        } finally {
          setLoadingAdminStats(false);
        }
      };

      loadAdminStats();
    }
  }, [user]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    clearMessages();
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    clearMessages();
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        await refreshUser();
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        logout();
        router.push('/');
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-8">
        <h1 className="text-3xl text-black font-bold mb-8">Profile Settings</h1>

          {user.role === 'admin' && (
            <div className="bg-white rounded-lg p-4 mb-6 text-black">
              <h2 className="text-lg font-semibold mb-3">Admin View</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="p-3 bg-zinc-100 rounded-md h-full flex flex-col justify-center">
                  <div className="text-xs text-zinc-500">Total users</div>
                  <div className="text-2xl font-semibold">
                    {loadingAdminStats ? '...' : adminStats?.totalUsers ?? 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-zinc-100 rounded-md h-full flex flex-col justify-center">
                  <div className="text-xs text-zinc-500">Total events</div>
                  <div className="text-2xl font-semibold">
                    {loadingAdminStats ? '...' : adminStats?.totalEvents ?? 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-zinc-100 rounded-md flex flex-col h-full">
                  <div className="text-xs text-zinc-500 mb-2">User management</div>
                  <a href="/users" className="inline-block mt-auto px-3 py-2 bg-black text-white rounded-lg text-sm text-center">View all users</a>
                </div>
              </div>
              {adminError && <div className="text-sm text-red-500 mt-3">{adminError}</div>}
            </div>
          )}

          <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg">
          {[
            { key: 'profile', label: 'Profile Information' },
            { key: 'password', label: 'Change Password' },
            { key: 'delete', label: 'Delete Account' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === tab.key
                  ? 'bg-gray-100 text-black'
                  : 'text-zinc-400 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="bg-white text-black rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-200 border-4 border-zinc-300">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-4xl font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 hover:bg-zinc-800 transition-colors hover:cursor-pointer"
                    title="Change profile picture"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="mb-2">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    placeholder="Your full name"
                    className="border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="mb-2">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={profileForm.username}
                    onChange={handleProfileInputChange}
                    placeholder="Your username"
                    className="border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email" className="mb-2">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    placeholder="your.email@example.com"
                    className="border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="mb-2">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileInputChange}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-zinc-300 text-sm font-normal rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-zinc-400">
                    {user.role === 'admin' && (
                      <p>Role: Admin</p>
                    )}
                    <p>Member since: {formatDate(user.createdAt)}</p>
                    <p>Last active: {formatDate(user.lastActive)}</p>
                  </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-black text-white hover:bg-black hover:cursor-pointer hover:scale-105 transition-all duration-200"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'password' && (
          <div className="bg-white text-black rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            
            <form onSubmit={updatePassword} className="space-y-6">
              <div>
                <Label htmlFor="currentPassword" className="mb-2">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter your current password"
                  className="w-full px-3 py-2 border border-zinc-300 text-sm font-normal rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="mb-2">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter your new password"
                  className="w-full px-3 py-2 border border-zinc-300 text-sm font-normal rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="mb-2">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Confirm your new password"
                  className="w-full px-3 py-2 border border-zinc-300 text-sm font-normal rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-black text-white hover:bg-black hover:cursor-pointer hover:scale-105 transition-all duration-200"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeSection === 'delete' && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-black">Delete Account</h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500">
                <p className="text-sm text-zinc-600 mb-4">
                  Once you delete your account, there is no going back. This will permanently delete your account and remove all of your data from our servers.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white hover:cursor-pointer"
                  >
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deleteConfirmation" className="mb-2 text-red-500">
                        Type "DELETE" to confirm account deletion
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE here"
                        className="border-red-500/50 text-black"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmation('');
                        }}
                        className="text-black bg-white border border-zinc-300 hover:cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={deleteAccount}
                        disabled={loading || deleteConfirmation !== 'DELETE'}
                        className="bg-red-600 hover:bg-red-700 text-white hover:cursor-pointer"
                      >
                        {loading ? 'Deleting...' : 'Delete My Account'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
