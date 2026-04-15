import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const HolidayCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // Default to April 2026

  const holidays2026 = [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-02-17', name: 'Chinese New Year' },
    { date: '2026-02-25', name: 'EDSA Anniversary' },
    { date: '2026-04-02', name: 'Maundy Thursday' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-04-04', name: 'Black Saturday' },
    { date: '2026-04-09', name: 'Araw ng Kagitingan' },
    { date: '2026-05-01', name: 'Labor Day' },
    { date: '2026-06-12', name: 'Independence Day' },
    { date: '2026-08-21', name: 'Ninoy Aquino Day' },
    { date: '2026-08-31', name: 'National Heroes Day' },
    { date: '2026-11-01', name: "All Saints' Day" },
    { date: '2026-11-02', name: "All Souls' Day" },
    { date: '2026-11-30', name: 'Bonifacio Day' },
    { date: '2026-12-08', name: 'Feast of the Immaculate Conception' },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2026-12-30', name: 'Rizal Day' },
    { date: '2026-12-31', name: 'Last Day of the Year' },
  ];

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const getHoliday = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays2026.find(h => h.date === dateStr);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-denr-green-700" />
          <h3 className="font-bold text-gray-800">2026 Holidays</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={idx} className="text-center text-[10px] font-bold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const holiday = getHoliday(day);
          return (
            <div 
              key={idx} 
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs relative group ${
                !day ? 'invisible' : ''
              } ${
                holiday ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {day}
              {holiday && (
                <>
                  <div className="w-1 h-1 bg-red-400 rounded-full mt-0.5" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                    {holiday.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upcoming this month</p>
        {holidays2026
          .filter(h => {
            const hDate = new Date(h.date);
            return hDate.getFullYear() === year && hDate.getMonth() === month;
          })
          .map((h, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
              <div className="bg-red-100 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold">
                {new Date(h.date).getDate()}
              </div>
              <p className="text-[11px] font-bold text-gray-700 truncate">{h.name}</p>
            </div>
          ))}
        {holidays2026.filter(h => {
          const hDate = new Date(h.date);
          return hDate.getFullYear() === year && hDate.getMonth() === month;
        }).length === 0 && (
          <p className="text-[11px] text-gray-400 italic">No holidays this month.</p>
        )}
      </div>
    </div>
  );
};
