import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User as UserIcon, ChevronDown, Clock, Calendar, Plane, CheckCircle2, XCircle, AlertCircle, Briefcase, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = ({ user, title, leaves = [], travels = [], logs = [], onPageChange }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifications = () => {
    const notifs = [];
    
    if (user.role === 'admin') {
      // Pending Leaves
      leaves.filter(l => l.status === 'pending').forEach(l => {
        notifs.push({
          id: `leave-${l.id}`,
          type: 'leave',
          title: 'New Leave Request',
          message: `Employee applied for ${l.type}`,
          time: l.createdAt,
          icon: <Calendar className="text-amber-500" size={16} />,
          bgColor: 'bg-amber-50'
        });
      });
      // const today = new Date().toISOString().split('T')[0];
      // logs.filter(log => log.date === today && log.timeIn > '08:00 AM').forEach(log => {
      //   notifs.push({
      //     id: `late-${log.id}`,
      //     type: 'attendance',
      //     title: 'Late Attendance',
      //     message: `Employee timed in at ${log.timeIn}`,
      //     time: 'Today',
      //     icon: <Clock className="text-red-500" size={16} />,
      //     bgColor: 'bg-red-50'
      //   });
      // });
    } else if (user.role === 'supervisor') {
      // Supervisor-specific: Pending travel orders for review
      travels.filter(t => t.status === 'pending').forEach(t => {
        notifs.push({
          id: `travel-review-${t.id}`,
          type: 'travel',
          title: 'Travel Order Needs Review',
          message: `Pending travel to ${t.destination}`,
          time: t.createdAt,
          icon: <Plane className="text-amber-600" size={16} />,
          bgColor: 'bg-amber-50'
        });
      });
      // Supervisor as employee: Approved/Rejected Leaves
      leaves.filter(l => l.userId === user.id && l.status !== 'pending').forEach(l => {
        notifs.push({
          id: `leave-res-${l.id}`,
          type: 'leave',
          title: `Leave ${l.status.charAt(0).toUpperCase() + l.status.slice(1)}`,
          message: `Your ${l.type} request has been ${l.status}`,
          time: 'Recently',
          icon: l.status === 'approved' ? <CheckCircle2 className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />,
          bgColor: l.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
        });
      });
      // Supervisor as employee: Approved/Rejected Travels
      travels.filter(t => t.userId === user.id && t.status !== 'pending').forEach(t => {
        notifs.push({
          id: `travel-res-${t.id}`,
          type: 'travel',
          title: `Travel ${t.status.charAt(0).toUpperCase() + t.status.slice(1)}`,
          message: `Travel to ${t.destination} was ${t.status}`,
          time: 'Recently',
          icon: t.status === 'approved' ? <CheckCircle2 className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />,
          bgColor: t.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
        });
      });
      // Supervisor as employee: Attendance reminders
      const today = new Date().toISOString().split('T')[0];
      const todayLog = logs.find(log => log.userId === user.id && log.date === today);
      if (!todayLog) {
        notifs.push({
          id: 'remind-in',
          type: 'reminder',
          title: 'Attendance Reminder',
          message: "Don't forget to time in for today!",
          time: 'Now',
          icon: <AlertCircle className="text-denr-green-600" size={16} />,
          bgColor: 'bg-denr-green-50'
        });
      } else if (!todayLog.timeOut) {
        notifs.push({
          id: 'remind-out',
          type: 'reminder',
          title: 'Attendance Reminder',
          message: "Don't forget to time out before leaving!",
          time: 'Now',
          icon: <AlertCircle className="text-amber-600" size={16} />,
          bgColor: 'bg-amber-50'
        });
      }
      // Supervisor-specific: Overdue travel order approvals (pending > 2 days)
      const now = new Date();
      travels.filter(t => t.status === 'pending' && t.createdAt).forEach(t => {
        const created = new Date(t.createdAt);
        const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        if (diffDays > 2) {
          notifs.push({
            id: `travel-overdue-${t.id}`,
            type: 'overdue',
            title: 'Overdue Travel Approval',
            message: `Travel to ${t.destination} pending for ${diffDays} days`,
            time: `${diffDays} days ago`,
            icon: <AlertCircle className="text-red-600" size={16} />,
            bgColor: 'bg-red-50'
          });
        }
      });
    } else {
      // Employee Notifications
      // Approved/Rejected Leaves
      leaves.filter(l => l.userId === user.id && l.status !== 'pending').forEach(l => {
        notifs.push({
          id: `leave-res-${l.id}`,
          type: 'leave',
          title: `Leave ${l.status.charAt(0).toUpperCase() + l.status.slice(1)}`,
          message: `Your ${l.type} request has been ${l.status}`,
          time: 'Recently',
          icon: l.status === 'approved' ? <CheckCircle2 className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />,
          bgColor: l.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
        });
      });

      // Approved/Rejected Travels
      travels.filter(t => t.userId === user.id && t.status !== 'pending').forEach(t => {
        notifs.push({
          id: `travel-res-${t.id}`,
          type: 'travel',
          title: `Travel ${t.status.charAt(0).toUpperCase() + t.status.slice(1)}`,
          message: `Travel to ${t.destination} was ${t.status}`,
          time: 'Recently',
          icon: t.status === 'approved' ? <CheckCircle2 className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />,
          bgColor: t.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
        });
      });

      // Reminders
      const today = new Date().toISOString().split('T')[0];
      const todayLog = logs.find(log => log.userId === user.id && log.date === today);
      if (!todayLog) {
        notifs.push({
          id: 'remind-in',
          type: 'reminder',
          title: 'Attendance Reminder',
          message: "Don't forget to time in for today!",
          time: 'Now',
          icon: <AlertCircle className="text-denr-green-600" size={16} />,
          bgColor: 'bg-denr-green-50'
        });
      } else if (!todayLog.timeOut) {
        notifs.push({
          id: 'remind-out',
          type: 'reminder',
          title: 'Attendance Reminder',
          message: "Don't forget to time out before leaving!",
          time: 'Now',
          icon: <AlertCircle className="text-amber-600" size={16} />,
          bgColor: 'bg-amber-50'
        });
      }
    }

    return notifs.slice(0, 5); // Show last 5
  };

  const notifications = getNotifications();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="md:hidden bg-white p-1 rounded-full w-10 h-10 flex items-center justify-center border border-gray-100 overflow-hidden">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSffAnIjiFKIVoxn1Ufevzt4rBO6PF2otrRsA&s" 
            alt="DENR Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Only show search bar if not supervisor */}
        {user.role !== 'supervisor' && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-denr-green-600 rounded-full text-sm w-64 transition-all"
            />
          </div>
        )}

        {/* Notification bell always visible */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors ${isNotifOpen ? 'bg-gray-100' : ''}`}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                  <span className="text-[10px] font-bold text-denr-green-700 bg-denr-green-50 px-2 py-0.5 rounded-full">
                    {notifications.length} New
                  </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full ${n.bgColor} flex items-center justify-center shrink-0`}>
                            {n.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{n.title}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-1 font-medium">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="text-gray-300" size={24} />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">No new notifications</p>
                      <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens.</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                  <button className="text-[11px] font-bold text-denr-green-700 hover:text-denr-green-800 transition-colors">
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-all ${isProfileOpen ? 'bg-gray-50' : ''}`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">{user.name}</p>
              <p className="text-[10px] text-gray-500 uppercase font-medium tracking-tight">{user.position}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-denr-green-100 p-0.5 overflow-hidden shadow-sm">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-6 text-center bg-gradient-to-br from-denr-green-50 to-white border-b border-gray-50">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-3 overflow-hidden">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-denr-green-100 text-denr-green-700 rounded-md">
                      {user.role}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <Briefcase size={16} className="text-denr-green-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Position</p>
                        <p className="text-xs font-bold text-gray-800">{user.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <Building2 size={16} className="text-denr-green-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                        <p className="text-xs font-bold text-gray-800">{user.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => {
                        onPageChange('profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full bg-denr-green-700 hover:bg-denr-green-800 text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-denr-green-100"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
