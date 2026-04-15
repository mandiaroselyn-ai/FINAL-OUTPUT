import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  Plane, 
  ShieldCheck, 
  LogOut,
  Megaphone,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Sidebar = ({ user, currentPage, onPageChange, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const employeeItems = [
    { id: 'dashboard', label: 'Employee Dashboard', icon: LayoutDashboard },
    { id: 'dtr', label: 'Daily Time Record', icon: Clock },
    { id: 'leave', label: 'Leave Application', icon: CalendarDays },
    { id: 'travel', label: 'Travel Order', icon: Plane },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const adminItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin-dtr', label: 'DTR Monitoring', icon: Clock },
    { id: 'admin-leaves', label: 'Leave Management', icon: CalendarDays },
    { id: 'admin-users', label: 'User Management', icon: ShieldCheck },
  ];

  const supervisorItems = [
    { id: 'supervisor-dashboard', label: 'Supervisor Dashboard', icon: LayoutDashboard },
    { id: 'supervisor-dtr', label: 'DTR Monitoring', icon: Clock },
    { id: 'supervisor-travel', label: 'Travel Orders', icon: Plane },
  ];

  const menuItems = user.role === 'admin' ? adminItems : user.role === 'supervisor' ? supervisorItems : employeeItems;

  return (
    <aside className="w-64 bg-denr-green-900 text-white h-screen fixed left-0 top-0 flex flex-col z-40">
      <div className="p-6 flex items-center gap-3 border-b border-denr-green-800">
        <div className="bg-white p-1 rounded-full w-12 h-12 flex items-center justify-center shadow-inner overflow-hidden">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSffAnIjiFKIVoxn1Ufevzt4rBO6PF2otrRsA&s" 
            alt="DENR Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tighter">DENR</h1>
          <p className="text-[10px] text-denr-green-300 uppercase tracking-widest font-black">WorkMate</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentPage === item.id
                ? 'bg-denr-green-700 text-white shadow-lg'
                : 'text-denr-green-300 hover:bg-denr-green-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-denr-green-800">
        <div className="bg-denr-green-800/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border-2 border-denr-green-600"
            />
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-[10px] text-denr-green-400 truncate uppercase">{user.role}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-96 border border-gray-100"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h2 className="text-lg font-bold text-center text-gray-900 mb-2">
                Confirm Logout
              </h2>
              <p className="text-center text-gray-600 text-sm mb-6">
                Are you sure you want to logout? You'll need to log back in to continue working.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
