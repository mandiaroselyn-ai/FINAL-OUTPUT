import { useState, useEffect } from 'react';
import axiosInstance from './config/axiosInstance';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DTR } from './pages/DTR';
import { Leave } from './pages/Leave';
import { TravelOrderPage } from './pages/TravelOrder';
import { Admin } from './pages/Admin';
import { Supervisor } from './pages/Supervisor';
import { Announcements } from './pages/Announcements';
import { Profile } from './pages/Profile';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('denr_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Normalize user object to include both _id and id
      return { ...parsed, id: parsed._id || parsed.id };
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('denr_token') || '');
  const [currentPage, setCurrentPage] = useState(() => {
    const savedUser = localStorage.getItem('denr_user');
    if (savedUser && savedUser !== 'null') {
      const u = JSON.parse(savedUser);
      if (u && u.role === 'admin') return 'admin-dashboard';
      if (u && u.role === 'supervisor') return 'supervisor-dashboard';
    }
    return 'dashboard';
  });
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [travels, setTravels] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!token || !user) return;
    
    // Admin and Supervisor load ALL data, Employees load their own
    if (user.role === 'admin' || user.role === 'supervisor') {
      console.log('👨‍💼 Loading data for admin/supervisor...');
      axiosInstance.get('/api/dtrlogs').then(res => setLogs(Array.isArray(res.data) ? res.data : res.data.logs || [])).catch(err => {
        console.error('Error loading dtrlogs:', err);
        setLogs([]);
      });
      axiosInstance.get('/api/leaves').then(res => setLeaves(Array.isArray(res.data) ? res.data : res.data.leaves || [])).catch(err => {
        console.error('Error loading leaves:', err);
        setLeaves([]);
      });
      axiosInstance.get('/api/travelorders').then(res => setTravels(Array.isArray(res.data) ? res.data : res.data.travels || [])).catch(err => {
        console.error('Error loading travelorders:', err);
        setTravels([]);
      });
    } else {
      // Employee loads only their own data
      console.log('👤 Loading data for employee...');
      axiosInstance.get(`/api/dtrlogs/${user._id}`).then(res => setLogs(Array.isArray(res.data) ? res.data : res.data.logs || [])).catch(() => setLogs([]));
      axiosInstance.get(`/api/leaves/${user._id}`).then(res => setLeaves(Array.isArray(res.data) ? res.data : res.data.leaves || [])).catch(() => setLeaves([]));
      axiosInstance.get(`/api/travelorders/${user._id}`).then(res => setTravels(Array.isArray(res.data) ? res.data : res.data.travels || [])).catch(() => setTravels([]));
    }
    
    axiosInstance.get('/api/announcements').then(res => setAnnouncements(Array.isArray(res.data) ? res.data : res.data.announcements || [])).catch(() => setAnnouncements([]));
    
    // Only load all users if admin
    if (user.role === 'admin') {
      axiosInstance.get('/api/users').then(res => setRegisteredUsers(Array.isArray(res.data) ? res.data : res.data.users || [])).catch(() => setRegisteredUsers([]));
    }
  }, [token, user]);

  const allUsers = registeredUsers;

  const handleLogin = async (credentials) => {
    try {
      console.log('📝 App.jsx - Processing login with credentials:', { email: credentials.email });
      const res = await axiosInstance.post('/api/users/login', credentials);
      console.log('✅ App.jsx - Login successful, user:', res.data.user);
      // Normalize user object to include both _id and id
      const normalizedUser = { ...res.data.user, id: res.data.user._id };
      setUser(normalizedUser);
      setToken(res.data.token);
      localStorage.setItem('denr_user', JSON.stringify(normalizedUser));
      localStorage.setItem('denr_token', res.data.token);
      console.log('💾 App.jsx - Token and user saved to localStorage');
      if (res.data.user.role === 'admin') setCurrentPage('admin-dashboard');
      else if (res.data.user.role === 'supervisor') setCurrentPage('supervisor-dashboard');
      else setCurrentPage('dashboard');
    } catch (err) {
      console.error('❌ App.jsx - Login error:', err.response?.data || err.message);
      alert('Login failed: ' + (err.response?.data?.message || 'Please check your credentials.'));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('denr_user');
    localStorage.removeItem('denr_token');
    setCurrentPage('dashboard');
  };

  const handleAddLog = async (log) => {
    try {
      const res = await axiosInstance.post('/api/dtrlogs', log);
      console.log('✅ DTR Log added:', res.data);
      setLogs([...logs, res.data.log || res.data]);
    } catch (err) {
      console.error('❌ Error adding DTR log:', err.response?.data || err.message);
      alert('Failed to save DTR log: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleUpdateLog = async (log) => {
    try {
      const logId = log._id || log.id;
      const res = await axiosInstance.put(`/api/dtrlogs/${logId}`, log);
      console.log('✅ DTR Log updated:', res.data);
      setLogs(logs.map(l => (l._id || l.id) === logId ? (res.data.log || res.data) : l));
    } catch (err) {
      console.error('❌ Error updating DTR log:', err.response?.data || err.message);
      alert('Failed to update DTR log: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddLeave = async (leave) => {
    try {
      const res = await axiosInstance.post('/api/leaves', leave);
      console.log('✅ Leave applied:', res.data);
      const savedLeave = res.data.leave || res.data;
      console.log('📋 Saved leave data:', {
        hasDocumentImage: !!savedLeave.documentImage,
        documentImageSize: savedLeave.documentImage ? Math.round(savedLeave.documentImage.length / 1024) + ' KB' : 'N/A',
        leave: savedLeave
      });
      setLeaves([...leaves, savedLeave]);
    } catch (err) {
      console.error('❌ Error adding leave:', err.response?.data || err.message);
      alert('Failed to apply for leave: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      const res = await axiosInstance.put(`/api/leaves/${id}`, { status });
      console.log('✅ Leave status updated:', res.data);
      setLeaves(prev => prev.map(l => (l._id || l.id) === id ? (res.data.leave || { ...l, status }) : l));
    } catch (err) {
      console.error('❌ Error updating leave status:', err.response?.data || err.message);
      alert('Failed to update leave: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleBulkUpdateLeaveStatus = async (ids, status) => {
    try {
      await Promise.all(ids.map(id => axiosInstance.put(`/api/leaves/${id}`, { status })));
      console.log('✅ Bulk leave status updated');
      setLeaves(prev => prev.map(l => ids.includes((l._id || l.id)) ? { ...l, status } : l));
    } catch (err) {
      console.error('❌ Error bulk updating leaves:', err.response?.data || err.message);
      alert('Failed to bulk update leaves: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddTravel = async (travel) => {
    try {
      console.log('📸 Travel submission:', {
        destination: travel.destination,
        hasDocument: !!travel.documentImage,
        documentSize: travel.documentImage ? travel.documentImage.length : 0,
        hasOCR: !!travel.ocrText
      });
      const res = await axiosInstance.post('/api/travelorders', travel);
      console.log('✅ Travel order submitted:', {
        id: res.data.travel?._id,
        destination: res.data.travel?.destination,
        hasDocument: !!res.data.travel?.documentImage,
        documentSize: res.data.travel?.documentImage ? res.data.travel.documentImage.length : 0
      });
      setTravels([...travels, res.data.travel || res.data]);
    } catch (err) {
      console.error('❌ Error adding travel order:', err.response?.data || err.message);
      alert('Failed to submit travel order: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleUpdateTravelStatus = async (id, status) => {
    try {
      const res = await axiosInstance.put(`/api/travelorders/${id}`, { status });
      console.log('✅ Travel order status updated:', res.data);
      setTravels(prev => prev.map(t => (t._id || t.id) === id ? (res.data.travel || { ...t, status }) : t));
    } catch (err) {
      console.error('❌ Error updating travel status:', err.response?.data || err.message);
      alert('Failed to update travel order: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleBulkUpdateTravelStatus = async (ids, status) => {
    try {
      await Promise.all(ids.map(id => axiosInstance.put(`/api/travelorders/${id}`, { status })));
      console.log('✅ Bulk travel order status updated');
      setTravels(prev => prev.map(t => ids.includes((t._id || t.id)) ? { ...t, status } : t));
    } catch (err) {
      console.error('❌ Error bulk updating travel orders:', err.response?.data || err.message);
      alert('Failed to bulk update travel orders: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    const userId = updatedUser._id || updatedUser.id;
    console.log('📝 [Profile Update] Sending update for user ID:', userId);
    console.log('📝 [Profile Update] Update data:', updatedUser);
    
    if (!userId) {
      alert('Error: User ID not found');
      return;
    }
    try {
      console.log(`🔄 [Profile Update] Sending PUT request to /api/users/${userId}`);

      // Clean data before sending - remove _id and other fields that shouldn't be updated
      const cleanData = { ...updatedUser };
      delete cleanData._id;
      delete cleanData.id;
      delete cleanData.createdAt;
      delete cleanData.updatedAt;

      // Only send avatar if it is a new base64 string (changed in this session)
      if (typeof updatedUser.avatar !== 'string' || !updatedUser.avatar?.startsWith('data:image')) {
        delete cleanData.avatar;
      }

      console.log('📋 [Profile Update] Cleaned data to send:', cleanData);

      const res = await axiosInstance.put(`/api/users/${userId}`, cleanData);
      console.log('✅ [Profile Update] Response received:', res.data);

      if (!res.data.user) {
        console.error('❌ [Profile Update] No user data in response');
        alert('Error: Invalid response from server');
        return;
      }

      const normalizedUpdated = { ...res.data.user, id: res.data.user._id };
      console.log('✅ [Profile Update] Normalized user:', normalizedUpdated);

      // Check if role was changed
      const roleChanged = user && user._id === userId && user.role !== normalizedUpdated.role;

      // If a new token was provided (role change), update localStorage
      if (res.data.token) {
        console.log('🔐 [Profile Update] New token received - updating localStorage');
        localStorage.setItem('denr_token', res.data.token);
        setToken(res.data.token);
      }

      setRegisteredUsers(registeredUsers.map(u => u._id === userId ? normalizedUpdated : u));
      if (user && user._id === userId) {
        setUser(normalizedUpdated);
        localStorage.setItem('denr_user', JSON.stringify(normalizedUpdated));
        console.log('✅ [Profile Update] localStorage updated');
      }

      // If editing another user's role, inform them they need to log in again
      if (roleChanged) {
        alert(`✅ Profile updated successfully! Role changed to ${normalizedUpdated.role}. Please log in again to access your new role features.`);
      } else {
        alert('✅ Profile updated successfully!');
      }
    } catch (err) {
      console.error('❌ [Profile Update] Error:', err.response?.data || err.message);
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this employee account?')) {
      await axiosInstance.delete(`/api/users/${userId}`);
      setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            logs={logs.filter(l => l.userId === user.id)} 
            leaves={leaves.filter(l => l.userId === user.id)} 
            travels={travels.filter(t => t.userId === user.id)} 
            onPageChange={setCurrentPage}
          />
        );
      case 'dtr':
        return <DTR user={user} logs={logs.filter(l => l.userId === user.id)} onAddLog={handleAddLog} onUpdateLog={handleUpdateLog} />;
      case 'leave':
        return <Leave user={user} leaves={leaves.filter(l => l.userId === user.id)} onAddLeave={handleAddLeave} />;
      case 'travel':
        return <TravelOrderPage user={user} travels={travels.filter(t => t.userId === user.id)} onAddTravel={handleAddTravel} />;
      case 'announcements':
        return <Announcements announcements={announcements} />;
      case 'profile':
        return <Profile user={user} onUpdateUser={handleUpdateUser} />;
      case 'supervisor-dashboard':
      case 'supervisor-travel':
      case 'supervisor-dtr':
        return user.role === 'supervisor' ? (
          <Supervisor 
            user={user}
            users={allUsers}
            logs={logs}
            travels={travels}
            activeTab={currentPage.replace('supervisor-', '')}
            onUpdateTravelStatus={handleUpdateTravelStatus}
            onBulkUpdateTravelStatus={handleBulkUpdateTravelStatus}
            onPageChange={setCurrentPage}
            onAddLog={handleAddLog}
            onUpdateLog={handleUpdateLog}
          />
        ) : (
          <Dashboard 
            user={user} 
            logs={logs.filter(l => l.userId === user.id)} 
            leaves={leaves.filter(l => l.userId === user.id)} 
            travels={travels.filter(t => t.userId === user.id)} 
            onPageChange={setCurrentPage}
          />
        );
      case 'admin-dashboard':
      case 'admin-dtr':
      case 'admin-leaves':
      case 'admin-users':
        return user.role === 'admin' ? (
          <Admin 
            user={user}
            users={allUsers} 
            logs={logs}
            leaves={leaves} 
            activeTab={currentPage.replace('admin-', '')}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onBulkUpdateLeaveStatus={handleBulkUpdateLeaveStatus}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onPageChange={setCurrentPage}
            onAddLog={handleAddLog}
            onUpdateLog={handleUpdateLog}
          />
        ) : (
          <DTR user={user} logs={logs.filter(l => l.userId === user.id)} onAddLog={handleAddLog} onUpdateLog={handleUpdateLog} />
        );
      default:
        return <DTR user={user} logs={logs.filter(l => l.userId === user.id)} onAddLog={handleAddLog} onUpdateLog={handleUpdateLog} />;
    }
  };

  const pageTitles = {
    dashboard: 'Employee Dashboard',
    dtr: 'Daily Time Record',
    leave: 'Leave Management',
    travel: 'Travel Orders',
    announcements: 'Announcements',
    profile: 'My Profile',
    'admin-dashboard': 'Admin Dashboard',
    'admin-dtr': 'DTR Monitoring',
    'admin-leaves': 'Leave Management',
    'admin-travel': 'Travel Orders',
    'admin-users': 'User Management',
    'supervisor-dashboard': 'Supervisor Dashboard',
    'supervisor-dtr': 'DTR Monitoring',
    'supervisor-travel': 'Travel Orders'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        user={user} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <Navbar 
          user={user} 
          title={pageTitles[currentPage]} 
          leaves={leaves}
          travels={travels}
          logs={logs}
          users={allUsers}
          onPageChange={setCurrentPage}
        />
        
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
