import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Plane,
  Search,
  MapPin,
  Info,
  Wallet,
  Wrench,
  FileText,
  Calendar,
  Eye,
  Clock,
  Camera,
  CheckCircle,
  AlertCircle,
  History,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraModal } from '../components/CameraModal';

export const Supervisor = ({ 
  user,
  users = [], 
  logs = [],
  travels = [], 
  activeTab,
  onUpdateTravelStatus,
  onBulkUpdateTravelStatus,
  onPageChange,
  onAddLog,
  onUpdateLog
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTravels, setSelectedTravels] = useState([]);
  const [viewingTravel, setViewingTravel] = useState(null);
  const [viewingTravelDoc, setViewingTravelDoc] = useState(null);
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
  
  const pendingTravelsList = (travels || []).filter(t => t.status?.toLowerCase() === 'pending');

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

  const toggleSelectAllTravels = () => {
    if (selectedTravels.length === pendingTravelsList.length && pendingTravelsList.length > 0) {
      setSelectedTravels([]);
    } else {
      setSelectedTravels(pendingTravelsList.map(t => t._id || t.id));
    }
  };

  const toggleSelectTravel = (id) => {
    setSelectedTravels(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl">
              <Plane size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pending Travels</p>
              <p className="text-2xl font-bold text-gray-900">{pendingTravelsList.length}</p>
            </div>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${(pendingTravelsList.length / (travels.length || 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recent Travel Requests</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {travels
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
            .map((item, idx) => {
              // Handle both populated user object and user ID string
              const emp = typeof item.userId === 'object' ? item.userId : users.find(u => u.id === item.userId);
              const isPending = item.status?.toLowerCase() === 'pending';
              return (
                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <img src={emp?.avatar} className="w-8 h-8 rounded-full" alt="" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        <span className="font-bold">{emp?.name}</span> requested travel to {item.destination}
                      </p>
                      <p className="text-[10px] text-gray-400">{item.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewingTravel(item)}
                      className="p-1.5 text-denr-green-600 hover:bg-denr-green-50 rounded-lg transition-colors" 
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase ${
                      item.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                      item.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                    {isPending && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => onUpdateTravelStatus(item._id || item.id, 'Approved')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Approve"><Check size={14} /></button>
                        <button onClick={() => onUpdateTravelStatus(item._id || item.id, 'Rejected')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Reject"><X size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  const renderTravel = () => {
    const handleBulkAction = (status) => {
      if (selectedTravels.length === 0) return;
      if (window.confirm(`Are you sure you want to ${status} ${selectedTravels.length} travel orders?`)) {
        onBulkUpdateTravelStatus(selectedTravels, status);
        setSelectedTravels([]);
      }
    };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-gray-800">Travel Order Requests</h3>
              {selectedTravels.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                  <span className="text-xs font-bold text-denr-green-700 bg-denr-green-50 px-2 py-1 rounded-md">
                    {selectedTravels.length} selected
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
                  <th className="px-6 py-3 w-10 cursor-pointer" onClick={toggleSelectAllTravels}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-denr-green-600 focus:ring-denr-green-600 cursor-pointer"
                      checked={pendingTravelsList.length > 0 && selectedTravels.length === pendingTravelsList.length}
                      onChange={() => {}} 
                    />
                  </th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Doc</th>
                  <th className="px-6 py-3">Destination</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {travels.slice().reverse().map((travel) => {
                  // Handle both populated user object and user ID string
                  const emp = typeof travel.userId === 'object' ? travel.userId : users.find(u => u.id === travel.userId);
                  const travelId = travel._id || travel.id;
                  const isSelected = selectedTravels.includes(travelId);
                  const isPending = travel.status?.toLowerCase() === 'pending';
                  
                  return (
                    <tr key={travelId} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-denr-green-50/30' : ''}`}>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => isPending && toggleSelectTravel(travelId)}>
                        {isPending && (
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-denr-green-600 focus:ring-denr-green-600 cursor-pointer"
                            checked={isSelected}
                            onChange={() => {}} 
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
                        {travel.documentImage ? (
                          <button
                            onClick={() => setViewingTravelDoc({document: travel, employee: emp})}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm hover:scale-110 hover:shadow-lg hover:border-denr-green-300 transition-all cursor-pointer overflow-hidden flex items-center justify-center"
                          >
                            <img 
                              src={travel.documentImage} 
                              alt="Doc" 
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-300 italic">No doc</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{travel.destination}</td>
                      <td className="px-6 py-4 text-xs text-gray-400 italic">"{travel.purpose}"</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{travel.startDate} to {travel.endDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewingTravel(travel)}
                            className="p-2 text-denr-green-600 hover:bg-denr-green-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Info size={16} />
                          </button>
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                            travel.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                            travel.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {travel.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => onUpdateTravelStatus(travelId, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={16} /></button>
                            <button onClick={() => onUpdateTravelStatus(travelId, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={16} /></button>
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

  const renderDTR = () => {
    const todayLog = logs.find(log => log.date === new Date().toISOString().split('T')[0] && log.userId === (user?.id || user?._id));

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
          date: new Date().toISOString().split('T')[0],
          timeIn: timeStr,
          location: location,
          selfie: capturedSelfie
        };
        console.log('📝 Supervisor time in:', newLog);
        onAddLog?.(newLog);
        setMessage(`Successfully timed in at ${timeStr}`);
      } else if (todayLog) {
        const updatedLog = { 
          ...todayLog, 
          timeOut: timeStr 
        };
        console.log('📝 Supervisor time out:', updatedLog);
        onUpdateLog?.(updatedLog);
        setMessage(`Successfully timed out at ${timeStr}`);
      }
      
      setStatus('success');
      setCapturedSelfie(null);
      setTimeout(() => setStatus('idle'), 3000);
    };

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Daily Attendance</h2>
                  <p className="text-gray-500">Record your time in and out with geo-tagging.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-denr-green-700 uppercase tracking-widest mb-1">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-4xl font-mono font-bold text-gray-800">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-denr-green-700">
                        <MapPin size={20} />
                        <span className="font-bold uppercase text-xs tracking-wider">Current Location</span>
                      </div>
                      <button 
                        onClick={refreshLocation}
                        disabled={isLocating}
                        className="p-1.5 hover:bg-denr-green-100 rounded-lg text-denr-green-700 transition-colors disabled:opacity-50"
                        title="Refresh Location"
                      >
                        <RefreshCw size={14} className={isLocating ? 'animate-spin' : ''} />
                      </button>
                    </div>
                    {isLocating ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700 mb-2">{location?.address}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          Lat: {location?.lat.toFixed(4)}, Lng: {location?.lng.toFixed(4)}
                        </p>
                      </>
                    )}
                    <div className="mt-4 h-32 bg-gray-200 rounded-xl overflow-hidden relative">
                      {location ? (
                        <img 
                          src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${location.lng},${location.lat}&z=16&l=map&size=450,150&pt=${location.lng},${location.lat},pm2rdm`}
                          alt="Location Map"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">
                          Waiting for location...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-denr-green-700">
                      <Camera size={20} />
                      <span className="font-bold uppercase text-xs tracking-wider">Biometrics / Selfie</span>
                    </div>
                    {capturedSelfie ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                        <img src={capturedSelfie} alt="Selfie" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setCapturedSelfie(null)}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <AlertCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-denr-green-500 hover:text-denr-green-600 transition-all group"
                      >
                        <div className="bg-gray-100 p-3 rounded-full group-hover:bg-denr-green-50 transition-colors">
                          <Camera size={24} />
                        </div>
                        <span className="text-sm font-medium">Capture Selfie</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4">
                  {status !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-2xl flex items-center gap-3 ${
                        status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      <span className="text-sm font-medium">{message}</span>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => handleTimeAction('in')}
                      disabled={!!todayLog?.timeIn || !capturedSelfie}
                      className={`h-20 rounded-2xl flex items-center justify-center gap-4 text-xl font-bold transition-all shadow-lg ${
                        todayLog?.timeIn || !capturedSelfie
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-denr-green-600 text-white hover:bg-denr-green-700 active:scale-95'
                      }`}
                    >
                      <Clock size={28} />
                      <span>Time In</span>
                    </button>
                    
                    <button 
                      onClick={() => handleTimeAction('out')}
                      disabled={!todayLog?.timeIn || !!todayLog?.timeOut || !capturedSelfie}
                      className={`h-20 rounded-2xl flex items-center justify-center gap-4 text-xl font-bold transition-all shadow-lg ${
                        !todayLog?.timeIn || todayLog?.timeOut || !capturedSelfie
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                      }`}
                    >
                      <History size={28} />
                      <span>Time Out</span>
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-denr-green-50 rounded-2xl border border-denr-green-100">
                    <h4 className="text-denr-green-800 font-bold text-xs uppercase tracking-wider mb-2">Today's Status</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time In:</span>
                      <span className="font-bold text-gray-700">{todayLog?.timeIn || '--:--'}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Time Out:</span>
                      <span className="font-bold text-gray-700">{todayLog?.timeOut || '--:--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <History className="text-denr-green-700" size={20} />
                <h3 className="font-bold text-gray-800">Recent Logs</h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {logs.filter(l => l.userId === (user?.id || user?._id)).length > 0 ? (
                  logs.filter(l => l.userId === (user?.id || user?._id)).slice().reverse().map((log, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">{log.date}</span>
                        </div>
                        <img src={log.selfie} className="w-8 h-8 rounded-lg object-cover border border-gray-200" alt="Selfie" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 p-2 rounded-lg">
                          <p className="text-[9px] text-green-600 uppercase font-bold">In</p>
                          <p className="text-xs font-bold text-green-700">{log.timeIn}</p>
                        </div>
                        <div className="bg-amber-50 p-2 rounded-lg">
                          <p className="text-[9px] text-amber-600 uppercase font-bold">Out</p>
                          <p className="text-xs font-bold text-amber-700">{log.timeOut || '--:--'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">No logs yet</div>
                )}
              </div>
            </div>
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

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => onPageChange?.('supervisor-dashboard')}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-denr-green-600 text-denr-green-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => onPageChange?.('supervisor-dtr')}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'dtr' ? 'border-denr-green-600 text-denr-green-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          <Clock size={14} className="inline mr-2" />DTR Monitoring
        </button>
        <button 
          onClick={() => onPageChange?.('supervisor-travel')}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'travel' ? 'border-denr-green-600 text-denr-green-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          <Plane size={14} className="inline mr-2" />Travel Orders
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
          {activeTab === 'travel' && renderTravel()}
          {activeTab === 'dtr' && renderDTR()}
        </motion.div>
      </AnimatePresence>

      {/* Travel Details Modal */}
      <AnimatePresence>
        {viewingTravel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            {console.log('🔍 Viewing travel:', {
              destination: viewingTravel.destination,
              hasDocument: !!viewingTravel.documentImage,
              documentSize: viewingTravel.documentImage ? viewingTravel.documentImage.length : 0,
              hasOCR: !!viewingTravel.ocrText
            })}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-denr-green-100 text-denr-green-700 p-2 rounded-xl"><Plane size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">Travel Details</h3>
                    <p className="text-xs text-gray-500">Request ID: {viewingTravel._id || viewingTravel.id}</p>
                  </div>
                </div>
                <button onClick={() => setViewingTravel(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {/* Employee Profile Section */}
                {(() => {
                  const emp = typeof viewingTravel.userId === 'object' ? viewingTravel.userId : users.find(u => u.id === viewingTravel.userId);
                  return emp ? (
                    <div className="bg-gradient-to-r from-denr-green-50 to-blue-50 rounded-2xl p-4 border border-denr-green-100">
                      <div className="flex items-center gap-4">
                        <img src={emp.avatar} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md" alt="" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employee</p>
                          <p className="text-lg font-bold text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-600">{emp.position} • {emp.department}</p>
                          {emp.email && <p className="text-xs text-gray-500">{emp.email}</p>}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</p>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <MapPin size={14} className="text-denr-green-600" />
                      {viewingTravel.destination}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dates</p>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Calendar size={14} className="text-denr-green-600" />
                      {viewingTravel.startDate} to {viewingTravel.endDate}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Purpose</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    "{viewingTravel.purpose}"
                  </p>
                </div>

                {/* Document Display */}
                {viewingTravel.documentImage && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supporting Document</p>
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-denr-green-200">
                      <img 
                        src={viewingTravel.documentImage} 
                        alt="Document" 
                        className="w-full max-h-64 object-contain rounded-lg shadow-md" 
                      />
                      {viewingTravel.ocrText && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-600 font-mono">
                          <p className="font-bold text-gray-700 mb-2">Extracted Text (OCR):</p>
                          <p className="whitespace-pre-wrap">{viewingTravel.ocrText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No document message */}
                {!viewingTravel.documentImage && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supporting Document</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <p className="text-sm text-amber-700 font-medium">No document uploaded</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  {viewingTravel.status?.toLowerCase() === 'pending' ? (
                    <>
                      <button 
                        onClick={() => { onUpdateTravelStatus(viewingTravel._id || viewingTravel.id, 'Rejected'); setViewingTravel(null); }}
                        className="flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                      >
                        Reject Request
                      </button>
                      <button 
                        onClick={() => { onUpdateTravelStatus(viewingTravel._id || viewingTravel.id, 'Approved'); setViewingTravel(null); }}
                        className="flex-1 px-4 py-3 bg-denr-green-700 text-white rounded-xl font-bold text-sm hover:bg-denr-green-800 transition-all shadow-lg shadow-denr-green-100"
                      >
                        Approve Request
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setViewingTravel(null)}
                      className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Travel Document Viewer Modal */}
      <AnimatePresence>
        {viewingTravelDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingTravelDoc(null)}
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
                  <img src={viewingTravelDoc?.employee?.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-denr-green-200" />
                  <div>
                    <h3 className="font-bold text-gray-900">{viewingTravelDoc?.employee?.name || 'Employee'}</h3>
                    <p className="text-xs text-gray-500">Travel to {viewingTravelDoc?.document?.destination}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingTravelDoc(null)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {viewingTravelDoc?.document?.documentImage ? (
                  <img 
                    src={viewingTravelDoc.document.documentImage} 
                    alt="Travel Document" 
                    className="w-full rounded-2xl border-2 border-gray-200 shadow-lg" 
                    onError={(e) => {
                      console.error('Image failed to load:', viewingTravelDoc.document.documentImage);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => console.log('✅ Travel document image loaded')}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FileText size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No document image available</p>
                    </div>
                  </div>
                )}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">Destination</p>
                    <p className="text-sm font-bold text-blue-700">{viewingTravelDoc?.document?.destination}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[10px] text-purple-600 uppercase font-bold mb-1">Status</p>
                    <p className={`text-sm font-bold ${
                      viewingTravelDoc?.document?.status?.toLowerCase() === 'approved' ? 'text-green-700' :
                      viewingTravelDoc?.document?.status?.toLowerCase() === 'pending' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {viewingTravelDoc?.document?.status}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-denr-green-600" />
                    <span className="text-sm">Travel Details</span>
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="font-medium text-gray-800">"{viewingTravelDoc?.document?.purpose}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dates:</span>
                      <span className="font-medium text-gray-800">{viewingTravelDoc?.document?.startDate} to {viewingTravelDoc?.document?.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium text-gray-800">{viewingTravelDoc?.employee?.department || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                {viewingTravelDoc?.document?.ocrText && (
                  <div className="mt-4 p-4 bg-denr-green-50 rounded-xl border border-denr-green-100">
                    <p className="font-bold text-denr-green-800 mb-2 flex items-center gap-2">
                      <Eye size={16} />
                      <span className="text-sm">OCR Data</span>
                    </p>
                    <p className="text-sm text-denr-green-700 leading-relaxed whitespace-pre-wrap">{viewingTravelDoc?.document?.ocrText}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
