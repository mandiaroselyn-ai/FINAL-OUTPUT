import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  History,
  Calendar,
  RefreshCw,
  X
} from 'lucide-react';
import { CameraModal } from '../components/CameraModal';
import { motion } from 'motion/react';


// Cleaned up: Only one export, all logic and JSX inside
export const DTR = ({ user, logs = [], onAddLog, onUpdateLog }) => {
  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    // Admin view: Only show All Employee Attendance and Absent Employees
    return (
      <div className="space-y-8">
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
                {logs.slice().reverse().map((log, idx) => {
                  const emp = log.employee || log.user || {};
                  const isLate = log.timeIn > '08:00 AM';
                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} className="w-8 h-8 rounded-full" alt="" />
                          <span className="text-sm font-bold text-gray-800">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <img 
                          src={log.selfie} 
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm hover:scale-150 transition-transform cursor-zoom-in" 
                          alt="Selfie" 
                        />
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
            {/* You need to provide the absent employees list as in your logic */}
            {/* Example: */}
            {/* absentEmployees.map(emp => ( ... )) */}
            <p className="text-sm text-gray-400 italic col-span-full text-center py-4">All employees are present today.</p>
          </div>
        </div>
      </div>
    );
  }

  // Employee view: show Daily Attendance card and controls
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
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
  const todayLog = logs.find(l => l.date === today && l.userId === (user?.id || user?._id));

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
      onAddLog?.(newLog);
      setMessage(`Successfully timed in at ${timeStr}`);
    } else if (todayLog) {
      const updatedLog = { 
        ...todayLog, 
        timeOut: timeStr 
      };
      onUpdateLog?.(updatedLog);
      setMessage(`Successfully timed out at ${timeStr}`);
    }
    
    setStatus('success');
    setCapturedSelfie(null);
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleCameraSelfie = (image) => {
    setCapturedSelfie(image);
    setIsCameraOpen(false);
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
                        <X size={16} />
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
                logs.filter(l => l.userId === (user?.id || user?._id)).slice().reverse().map((log) => (
                  <div key={log._id || log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">{log.date}</span>
                      </div>
                      {log.selfie && <img src={log.selfie} className="w-8 h-8 rounded-lg object-cover border border-gray-200" alt="Selfie" />}
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

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCameraSelfie} />
    </div>
  );
};
