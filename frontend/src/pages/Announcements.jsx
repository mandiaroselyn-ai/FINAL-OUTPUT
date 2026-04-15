import React from 'react';
import { Megaphone, Calendar, ChevronRight, FileText, Bell } from 'lucide-react';
import { motion } from 'motion/react';

export const Announcements = ({ announcements = [] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm">Stay updated with the latest news and memos from the department.</p>
        </div>
        <div className="bg-denr-green-50 text-denr-green-700 px-4 py-2 rounded-xl flex items-center gap-2 border border-denr-green-100">
          <Bell size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Notifications On</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {announcements.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                    item.category === 'Memo' ? 'bg-blue-100 text-blue-700' :
                    item.category === 'Event' ? 'bg-purple-100 text-purple-700' :
                    item.category === 'Training' ? 'bg-amber-100 text-amber-700' :
                    'bg-denr-green-100 text-denr-green-700'
                  }`}>
                    {item.category}
                  </span>
                  {item.isNew && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {item.date}
                </p>
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-denr-green-700 transition-colors mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {item.excerpt}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-denr-green-700">
                  <FileText size={16} />
                  <span className="text-xs font-bold">Read Full Memo</span>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-denr-green-700 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-denr-green-600" />
              Categories
            </h3>
            <div className="space-y-2">
              {['All Announcements', 'Office Memos', 'Events & Activities', 'Trainings & Seminars', 'Field Advisories'].map((cat, i) => (
                <button 
                  key={i}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    i === 0 ? 'bg-denr-green-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-denr-green-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold mb-2">Need to post?</h3>
              <p className="text-denr-green-300 text-xs mb-4">Contact the HR department to submit an announcement for review.</p>
              <button className="w-full bg-white text-denr-green-900 py-2.5 rounded-xl font-bold text-xs hover:bg-denr-green-50 transition-colors">
                Contact HR
              </button>
            </div>
            <Megaphone className="absolute -right-4 -bottom-4 w-24 h-24 text-denr-green-800 rotate-12 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};
