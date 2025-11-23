'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  isWithinInterval,
  startOfDay,
} from 'date-fns';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  highlightedDates?: Date[];
  blockedDates?: Date[];
  blockingMode?: boolean;
  selectedRange?: { start: Date | null; end: Date | null };
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  highlightedDates = [],
  blockedDates = [],
  blockingMode = false,
  selectedRange
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-2 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);
        const isHighlighted = highlightedDates.some((date) => isSameDay(date, day));
        const isBlocked = blockedDates.some((date) => isSameDay(date, day));
        const isPast = day < startOfDay(new Date()) && !isToday(day);

        // Check if date is in selected range during blocking mode
        let isInRange = false;
        if (blockingMode && selectedRange?.start && selectedRange?.end) {
          const rangeStart = selectedRange.start < selectedRange.end ? selectedRange.start : selectedRange.end;
          const rangeEnd = selectedRange.start < selectedRange.end ? selectedRange.end : selectedRange.start;
          isInRange = isWithinInterval(startOfDay(day), {
            start: startOfDay(rangeStart),
            end: startOfDay(rangeEnd),
          });
        }

        const isRangeStart = selectedRange?.start && isSameDay(day, selectedRange.start);
        const isRangeEnd = selectedRange?.end && isSameDay(day, selectedRange.end);

        days.push(
          <button
            key={day.toString()}
            onClick={() => !isPast && onDateSelect(currentDay)}
            disabled={isPast}
            className={`
              aspect-square p-2 rounded-lg text-sm font-medium transition relative
              ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
              ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              ${isBlocked && !blockingMode ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-2 ring-red-500' : ''}
              ${isSelected && !blockingMode ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              ${isTodayDate && !isSelected && !isBlocked && !isInRange ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
              ${isHighlighted && !isSelected && !isBlocked && !blockingMode ? 'ring-2 ring-green-500' : ''}
              ${isInRange && blockingMode ? 'bg-red-200 dark:bg-red-800/40' : ''}
              ${(isRangeStart || isRangeEnd) && blockingMode ? 'bg-red-600 text-white ring-2 ring-red-600' : ''}
            `}
          >
            {format(day, 'd')}
            {isHighlighted && !isSelected && !isBlocked && !blockingMode && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
            )}
            {isBlocked && !blockingMode && (
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full"></div>
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-2">{rows}</div>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
          {!blockingMode && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 ring-2 ring-green-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Has availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Blocked</span>
              </div>
            </>
          )}
          {blockingMode && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Range start/end</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 dark:bg-red-800/40 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Range selected</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
