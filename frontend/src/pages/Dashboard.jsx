import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  MapPin, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ShieldCheck,
  Plane
} from 'lucide-react';
import { motion } from 'motion/react';
import { HolidayCalendar } from '../components/HolidayCalendar';

export const Dashboard = ({ user, logs = [], leaves = [], travels = [], onPageChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { 
      label: 'Days Worked', 
      value: logs.length, 
      icon: CalendarCheck, 
      color: 'bg-blue-50 text-blue-600',
      trend: '+2 from last week'
    },
    { 
      label: 'Leave Balance', 
      value: user.leaveCredits || '0', 
      icon: CalendarCheck, 
      color: 'bg-purple-50 text-purple-600',
      trend: 'Available credits'
    },
    { 
      label: 'Pending Leaves', 
      value: leaves.filter(l => l.status === 'pending').length, 
      icon: Clock3, 
      color: 'bg-amber-50 text-amber-600',
      trend: 'Awaiting approval'
    },
    { 
      label: 'Travel Orders', 
      value: travels.filter(t => t.status === 'approved').length, 
      icon: MapPin, 
      color: 'bg-denr-green-50 text-denr-green-600',
      trend: 'Active/Upcoming'
    },
  ];

  const recentActivities = [
    ...logs.map(l => ({ type: 'DTR', date: l.date, text: `Timed in at ${l.timeIn}`, status: 'success' })),
    ...leaves.map(l => ({ type: 'Leave', date: l.createdAt, text: `${l.type} application submitted`, status: l.status })),
    ...travels.map(t => ({ type: 'Travel', date: t.createdAt, text: `Travel to ${t.destination} ${t.status}`, status: t.status })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-500">Here's what's happening with your account today.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-denr-green-100 p-2 rounded-lg">
            <Clock className="text-denr-green-700" size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Time</p>
            <p className="text-xl font-mono font-bold text-gray-800">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <ArrowUpRight size={20} />
              </button>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              {stat.trend}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Activity</h3>
              <button className="text-denr-green-700 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <div key={idx} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'approved' || activity.status === 'success' ? 'bg-green-50 text-green-600' :
                      activity.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {activity.status === 'approved' || activity.status === 'success' ? <CheckCircle2 size={20} /> :
                       activity.status === 'pending' ? <Clock3 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{activity.text}</p>
                      <p className="text-xs text-gray-400">{activity.type} • {activity.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                        activity.status === 'approved' || activity.status === 'success' ? 'bg-green-100 text-green-700' :
                        activity.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400">
                  No recent activities found.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-denr-green-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Employee Handbook</h3>
              <p className="text-denr-green-300 text-sm mb-6">Access the latest guidelines and policies for DENR employees.</p>
              <button className="bg-white text-denr-green-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-denr-green-50 transition-colors">
                Download PDF
              </button>
            </div>
            <Leaf className="absolute -right-8 -bottom-8 text-denr-green-800 w-48 h-48 rotate-12 opacity-50" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onPageChange('dtr')}
                className="flex flex-col items-center justify-center p-4 bg-denr-green-50 text-denr-green-700 rounded-2xl hover:bg-denr-green-100 transition-colors border border-denr-green-100"
              >
                <Clock size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase">Time In</span>
              </button>
              <button 
                onClick={() => onPageChange('leave')}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <CalendarCheck size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase">Leave</span>
              </button>
              <button 
                onClick={() => onPageChange('travel')}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-2xl hover:bg-purple-100 transition-colors border border-purple-100"
              >
                <Plane size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase">Travel</span>
              </button>
              <button 
                onClick={() => onPageChange('profile')}
                className="flex flex-col items-center justify-center p-4 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-100 transition-colors border border-amber-100"
              >
                <ShieldCheck size={20} className="mb-2" />
                <span className="text-[10px] font-bold uppercase">My Profile</span>
              </button>
            </div>
          </div>

          <HolidayCalendar />
        </div>
      </div>
    </div>
  );
};

const Leaf = ({ className, size }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C10.9 14.36 12 14 15 12" />
  </svg>
);
