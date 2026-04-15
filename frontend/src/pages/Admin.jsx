import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Users, 
  CalendarDays, 
  Clock,
  Search,
  Edit2,
  Save,
  MapPin,
  Camera,
  AlertCircle,
  CheckCircle,
  History,
  RefreshCw,
  Calendar,
  Eye,
  ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraModal } from '../components/CameraModal';

export const Admin = ({ 
  user,
  users = [], 
  logs = [],
  leaves = [], 
  announcements = [],
  activeTab,
  onUpdateLeaveStatus, 
  onBulkUpdateLeaveStatus,
  onUpdateUser,
  onDeleteUser,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onAddLog,
  onUpdateLog,
  onPageChange
}) => {
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeaves, setSelectedLeaves] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [viewingSelfie, setViewingSelfie] = useState(null);
  const [viewingLeaveDoc, setViewingLeaveDoc] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState({
    lat: 13.4429,
    lng: 121.8373,
    address: user?.address || 'Boac'
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    address: '',
    role: 'employee',
    leaveCredits: 0,
    password: ''
  });

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    refreshLocation();
    return () => clearInterval(timer);
  }, []);

  const refreshLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser.');
      setStatus('error');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          setLocation({
            lat: latitude,
            lng: longitude,
            address: data.display_name || 'Address not found'
          });
          setIsLocating(false);
        } catch (error) {
          console.error("Error fetching address:", error);
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          });
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setMessage('Unable to retrieve your location. Please ensure GPS is on.');
        setStatus('error');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === today);
  const pendingLeavesList = leaves.filter(l => l.status?.toLowerCase() === 'pending');

  const toggleSelectAllLeaves = () => {
    if (selectedLeaves.length === pendingLeavesList.length && pendingLeavesList.length > 0) {
      setSelectedLeaves([]);
    } else {
      setSelectedLeaves(pendingLeavesList.map(l => l._id));
    }
  };

  const toggleSelectLeave = (id) => {
    setSelectedLeaves(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      department: user.department || '',
      position: user.position || '',
      address: user.address || '',
      role: user.role || 'employee',
      leaveCredits: user.leaveCredits || 0,
      password: user.password || 'password'
    });
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      // Include _id for routing, but it won't be sent to backend
      const updateData = {
        _id: editingUser._id || editingUser.id,
        name: editForm.name,
        email: editForm.email,
        department: editForm.department,
        position: editForm.position,
        address: editForm.address,
        role: editForm.role,
        leaveCredits: editForm.leaveCredits
      };
      
      // Only include password if it's been explicitly changed (non-empty and not the default)
      if (editForm.password && editForm.password !== 'password' && editForm.password.length >= 6) {
        updateData.password = editForm.password;
      }
      
      onUpdateUser(updateData);
      setEditingUser(null);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-denr-green-50 text-denr-green-600 p-3 rounded-2xl">
              <Clock size={24} />
            </div>
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Present Today</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{todayLogs.length}</p>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-denr-green-500" style={{ width: `${(todayLogs.length / users.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <CalendarDays size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pending Leaves</p>
              <p className="text-2xl font-bold text-gray-900">{pendingLeavesList.length}</p>
            </div>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${(pendingLeavesList.length / (leaves.length || 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Activities</h3>
            <button className="text-denr-green-700 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {[...logs, ...leaves]
              .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
              .slice(0, 6)
              .map((item) => {
                const emp = users.find(u => u.id === item.userId);
                return (
                  <div key={item._id || item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <img src={emp?.avatar} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        <span className="font-bold">{emp?.name}</span> 
                        {item.timeIn ? ' timed in' : item.type ? ` applied for ${item.type}` : ` requested travel to ${item.destination}`}
                      </p>
                      <p className="text-[10px] text-gray-400">{item.date || item.createdAt}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-6">Attendance Overview (Today)</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                <span className="text-sm font-bold text-gray-700">Present</span>
              </div>
              <span className="font-bold text-gray-900">{todayLogs.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-sm text-gray-600">Late</span>
              </div>
              <span className="font-bold text-gray-900">{todayLogs.filter(l => l.timeIn > '08:00 AM').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <span className="font-bold text-gray-900">{users.length - todayLogs.length}</span>
            </div>
            <div className="pt-6 border-t border-gray-50">
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Overall Participation</p>
                <p className="text-xl font-black text-denr-green-700">{Math.round((todayLogs.length / users.length) * 100)}%</p>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-denr-green-600" style={{ width: `${(todayLogs.length / users.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDTR = () => {
    const todayLog = logs.find(log => log.date === today && log.userId === (user?.id || user?._id));

    const handleTimeAction = (type) => {
      if (!capturedSelfie) {
        setMessage('Please capture a selfie first.');
        setStatus('error');
        return;
      }

      const hours = String(currentTime.getHours()).padStart(2, '0');
      const minutes = String(currentTime.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      
      if (type === 'in') {
        const newLog = {
          userId: user?.id || user?._id,
          date: today,
          timeIn: timeStr,
          location: location,
          selfie: capturedSelfie
        };
        console.log('📝 Admin time in:', newLog);
        onAddLog?.(newLog);
        setMessage(`Successfully timed in at ${timeStr}`);
      } else if (todayLog) {
        const updatedLog = { 
          ...todayLog, 
          timeOut: timeStr 
        };
        console.log('📝 Admin time out:', updatedLog);
        onUpdateLog?.(updatedLog);
        setMessage(`Successfully timed out at ${timeStr}`);
      }
      
      setStatus('success');
      setCapturedSelfie(null);
      setTimeout(() => setStatus('idle'), 3000);
    };

    const absentEmployees = users.filter(u => !todayLogs.some(l => l.userId === u.id));

    return (
      <div className="space-y-8">
        {/* Attendance Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">All Employee Attendance</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100">Export Report</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Selfie</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Time In</th>
                  <th className="px-6 py-3">Time Out</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.slice().reverse().map((log) => {
                  // Try to find the employee from the users list
                  // Handle ObjectId references by converting to string and comparing
                  let emp = log.user; // In case user is already embedded in the log
                  
                  if (!emp) {
                    emp = users.find(u => {
                      const logUserId = String(log.userId || '');
                      const userId = String(u._id || u.id || '');
                      return logUserId === userId;
                    });
                  }
                  
                  const isLate = log.timeIn > '08:00 AM';
                  return (
                    <tr key={log._id || log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={emp?.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{emp?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{emp?.department || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{emp?.position || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setViewingSelfie({selfie: log.selfie, employee: emp, log: log})}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm hover:scale-150 hover:shadow-lg hover:border-denr-green-300 transition-all cursor-pointer overflow-hidden flex items-center justify-center"
                        >
                          <img 
                            src={log.selfie} 
                            alt="Selfie" 
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.date}</td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-denr-green-700">{log.timeIn}</td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-amber-600">{log.timeOut || '--:--'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 w-fit ${isLate ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {!isLate && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />}
                          {isLate ? 'LATE' : 'ON TIME'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 truncate max-w-[200px]">
                        <div className="flex items-center gap-1">
                          <MapPin size={10} />
                          <span>{log.location?.address || 'N/A'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-800 text-red-600">Absent Employees (Today)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {absentEmployees.map(emp => (
              <div key={emp.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <img src={emp.avatar} className="w-10 h-10 rounded-full grayscale" alt="" />
                <div>
                  <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{emp.department}</p>
                </div>
              </div>
            ))}
            {absentEmployees.length === 0 && (
              <p className="text-sm text-gray-400 italic col-span-full text-center py-4">All employees are present today.</p>
            )}
          </div>
        </div>

        {isCameraOpen && (
          <CameraModal 
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={(photoData) => {
              setCapturedSelfie(photoData);
              setIsCameraOpen(false);
            }}
          />
        )}
      </div>
    );
  };

  const renderLeaves = () => {
    const handleBulkAction = (status) => {
      if (selectedLeaves.length === 0) return;
      if (window.confirm(`Are you sure you want to ${status} ${selectedLeaves.length} leave applications?`)) {
        onBulkUpdateLeaveStatus(selectedLeaves, status);
        setSelectedLeaves([]);
      }
    };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-gray-800">Leave Applications</h3>
              {selectedLeaves.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-xs font-bold text-denr-green-700 bg-denr-green-50 px-2 py-1 rounded-md">
                    {selectedLeaves.length} selected
                  </span>
                  <button 
                    onClick={() => handleBulkAction('approved')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-all shadow-sm"
                  >
                    <Check size={14} /> Approve Bulk
                  </button>
                  <button 
                    onClick={() => handleBulkAction('rejected')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all shadow-sm"
                  >
                    <X size={14} /> Reject Bulk
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold">
                <tr>
                  <th className="px-6 py-3 w-10 cursor-pointer" onClick={toggleSelectAllLeaves}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-denr-green-600 focus:ring-denr-green-600 cursor-pointer"
                      checked={pendingLeavesList.length > 0 && selectedLeaves.length === pendingLeavesList.length}
                      onChange={() => {}} // Handled by th onClick
                    />
                  </th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Doc</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaves.slice().reverse().map((leave) => {
                  const emp = users.find(u => (u.id || u._id) === (leave.userId || leave.userId));
                  const isSelected = selectedLeaves.includes(leave._id);
                  const isPending = leave.status?.toLowerCase() === 'pending';

                  return (
                    <tr key={leave._id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-denr-green-50/30' : ''}`}>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => isPending && toggleSelectLeave(leave._id)}>
                        {isPending && (
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-denr-green-600 focus:ring-denr-green-600 cursor-pointer"
                            checked={isSelected}
                            onChange={() => {}} // Handled by td onClick
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={emp?.avatar} className="w-8 h-8 rounded-full" alt="" />
                          <span className="text-sm font-bold text-gray-800">{emp?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {leave.documentImage ? (
                          <div className="group relative cursor-pointer" onClick={() => setViewingLeaveDoc({leave: leave, employee: emp})}>
                            <div className="relative inline-block">
                              <img 
                                src={leave.documentImage} 
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm hover:scale-110 transition-transform" 
                                alt="Doc" 
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-lg transition-colors">
                                <Eye size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            {leave.ocrText && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-20 shadow-xl border border-gray-700">
                                <p className="font-bold text-denr-green-400 mb-1 uppercase tracking-wider">OCR Data:</p>
                                <p className="leading-relaxed">{leave.ocrText}</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 italic">No doc</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{leave.type}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{leave.startDate} to {leave.endDate}</td>
                      <td className="px-6 py-4 text-xs text-gray-400 italic">"{leave.reason}"</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                          leave.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                          leave.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => onUpdateLeaveStatus(leave._id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={16} /></button>
                            <button onClick={() => onUpdateLeaveStatus(leave._id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={16} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };


  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-2xl text-sm w-64 focus:ring-2 focus:ring-denr-green-600 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Leave Credits</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                <tr key={u._id || u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={u.avatar} className="w-10 h-10 rounded-full border border-gray-100" alt="" />
                        {todayLogs.some(l => l.userId === u.id) && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" title="Present Today" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">{u._id || u.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.position}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 group relative">
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden max-w-[60px]">
                        <div className="bg-denr-green-600 h-full" style={{ width: `${(u.leaveCredits / 30) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{u.leaveCredits}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                        {u.leaveCredits} credits available
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      u.role === 'supervisor' ? 'bg-orange-100 text-orange-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditClick(u)} className="p-2 text-gray-400 hover:text-denr-green-600 hover:bg-denr-green-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => onDeleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Manage Announcements</h3>
        <form onSubmit={handleAnnouncementSubmit} className="space-y-3 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="input-field"
              placeholder="Title"
              value={announcementForm.title}
              onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              required
            />
            <select
              className="input-field"
              value={announcementForm.category}
              onChange={e => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
            >
              <option value="Memo">Memo</option>
              <option value="Event">Event</option>
              <option value="Training">Training</option>
              <option value="Advisory">Advisory</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <textarea
            className="input-field"
            placeholder="Content"
            value={announcementForm.content}
            onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-denr-green-700 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-denr-green-800 transition-all">
              {editingAnnouncement ? 'Update' : 'Add'} Announcement
            </button>
            {editingAnnouncement && (
              <button type="button" onClick={() => { setEditingAnnouncement(null); setAnnouncementForm({ title: '', content: '', category: 'Memo' }); }} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
            )}
          </div>
        </form>
        <div className="divide-y divide-gray-50">
          {announcements.map(a => (
            <div key={a._id} className="py-4 flex flex-col md:flex-row md:items-center md:gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-denr-green-50 text-denr-green-700">{a.category}</span>
                  <span className="text-xs text-gray-400">{new Date(a.date || a.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-gray-800">{a.title}</div>
                <div className="text-sm text-gray-500 line-clamp-2">{a.content}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button onClick={() => handleEditAnnouncement(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDeleteAnnouncement(a._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <div className="text-gray-400 italic py-8 text-center">No announcements yet.</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => onPageChange?.('admin-dashboard')}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-denr-green-600 text-denr-green-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => onPageChange?.('admin-dtr')}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'dtr' ? 'border-denr-green-600 text-denr-green-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          <Clock size={14} className="inline mr-2" />DTR Monitoring
        </button>
        <button 
          onClick={() => onPageChange?.('admin-leaves')}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'leaves' ? 'border-denr-green-600 text-denr-green-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          <CalendarDays size={14} className="inline mr-2" />Leaves
        </button>
        <button 
          onClick={() => onPageChange?.('admin-users')}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'users' ? 'border-denr-green-600 text-denr-green-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          <Users size={14} className="inline mr-2" />Users
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'dtr' && renderDTR()}
          {activeTab === 'leaves' && renderLeaves()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'announcements' && renderAnnouncements()}
        </motion.div>
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-denr-green-100 text-denr-green-700 p-2 rounded-xl"><Edit2 size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Edit Employee</h3>
                    <p className="text-xs text-gray-500">{editingUser.name}</p>
                  </div>
                </div>
                <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name</label>
                  <input type="text" className="input-field" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" className="input-field" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                    <input type="text" className="input-field" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Position</label>
                    <input type="text" className="input-field" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address</label>
                  <input type="text" className="input-field" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                  <select className="input-field" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Leave Credits</label>
                  <input type="number" step="0.5" className="input-field" value={editForm.leaveCredits} onChange={e => setEditForm({...editForm, leaveCredits: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reset Password (Leave empty to keep current)</label>
                  <input type="password" className="input-field" placeholder="Enter new password (min 6 chars)" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                  <p className="text-[9px] text-gray-400 mt-1">Only fill this field if you need to reset the employee's password.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Cancel</button>
                  <button onClick={handleSaveEdit} className="flex-1 px-4 py-3 bg-denr-green-700 text-white rounded-xl font-bold text-sm hover:bg-denr-green-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-denr-green-100"><Save size={18} />Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Viewing Modal */}
      <AnimatePresence>
        {viewingDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => setViewingDocument(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Document Viewer</h3>
                  <p className="text-xs text-gray-500">Leave Application - {viewingDocument?.type}</p>
                </div>
                <button 
                  onClick={() => setViewingDocument(null)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                <img 
                  src={viewingDocument?.documentImage} 
                  alt="Document" 
                  className="w-full rounded-xl border border-gray-200 shadow-lg" 
                />
                {viewingDocument?.ocrText && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <ZoomIn size={16} className="text-denr-green-600" />
                      OCR Data
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingDocument.ocrText}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selfie Viewer Modal */}
      <AnimatePresence>
        {viewingSelfie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingSelfie(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img src={viewingSelfie?.employee?.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-denr-green-200" />
                  <div>
                    <h3 className="font-bold text-gray-900">{viewingSelfie?.employee?.name || 'Employee'}</h3>
                    <p className="text-xs text-gray-500">{viewingSelfie?.log?.date} at {viewingSelfie?.log?.timeIn}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingSelfie(null)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <img 
                  src={viewingSelfie?.selfie} 
                  alt="Selfie" 
                  className="w-full rounded-2xl border-2 border-gray-200 shadow-lg" 
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Time In</p>
                    <p className="text-lg font-bold text-green-700">{viewingSelfie?.log?.timeIn}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-[10px] text-amber-600 uppercase font-bold mb-1">Time Out</p>
                    <p className="text-lg font-bold text-amber-700">{viewingSelfie?.log?.timeOut || '--:--'}</p>
                  </div>
                </div>
                {viewingSelfie?.log?.location && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-denr-green-600" />
                      <p className="font-bold text-gray-800 text-xs">Location</p>
                    </div>
                    <p className="text-sm text-gray-700">{viewingSelfie?.log?.location?.address}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      Lat: {viewingSelfie?.log?.location?.lat?.toFixed(4)}, Lng: {viewingSelfie?.log?.location?.lng?.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Document Viewer Modal */}
      <AnimatePresence>
        {viewingLeaveDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingLeaveDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img src={viewingLeaveDoc?.employee?.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-denr-green-200" />
                  <div>
                    <h3 className="font-bold text-gray-900">{viewingLeaveDoc?.employee?.name || 'Employee'}</h3>
                    <p className="text-xs text-gray-500">{viewingLeaveDoc?.leave?.startDate} to {viewingLeaveDoc?.leave?.endDate}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingLeaveDoc(null)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {viewingLeaveDoc?.leave?.documentImage ? (
                  <img 
                    src={viewingLeaveDoc.leave.documentImage} 
                    alt="Leave Document" 
                    className="w-full rounded-2xl border-2 border-gray-200 shadow-lg" 
                    onError={(e) => {
                      console.error('Image failed to load:', viewingLeaveDoc.leave.documentImage);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => console.log('✅ Image loaded successfully')}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Camera size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No document image available</p>
                      {viewingLeaveDoc?.leave && console.log('📋 Leave data:', viewingLeaveDoc.leave)}
                    </div>
                  </div>
                )}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">Leave Type</p>
                    <p className="text-sm font-bold text-blue-700">{viewingLeaveDoc?.leave?.type}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[10px] text-purple-600 uppercase font-bold mb-1">Status</p>
                    <p className={`text-sm font-bold ${
                      viewingLeaveDoc?.leave?.status?.toLowerCase() === 'approved' ? 'text-green-700' :
                      viewingLeaveDoc?.leave?.status?.toLowerCase() === 'pending' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {viewingLeaveDoc?.leave?.status}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <ZoomIn size={16} className="text-denr-green-600" />
                    <span className="text-sm">Leave Details</span>
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-gray-800">"{viewingLeaveDoc?.leave?.reason}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-800">{viewingLeaveDoc?.employee?.department || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium text-gray-800">{viewingLeaveDoc?.employee?.position || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                {viewingLeaveDoc?.leave?.ocrText && (
                  <div className="mt-4 p-4 bg-denr-green-50 rounded-xl border border-denr-green-100">
                    <p className="font-bold text-denr-green-800 mb-2 flex items-center gap-2">
                      <Eye size={16} />
                      <span className="text-sm">OCR Data</span>
                    </p>
                    <p className="text-sm text-denr-green-700 leading-relaxed whitespace-pre-wrap">{viewingLeaveDoc?.leave?.ocrText}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      {/* Removed - Users must register through the registration page */}
    </div>
  );
};
