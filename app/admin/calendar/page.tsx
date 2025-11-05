'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailability } from '@/hooks/useAvailability';
import Calendar from '@/components/Calendar';
import { format, isSameDay } from 'date-fns';

export default function CalendarManagement() {
  const { user } = useAuth();
  const { slots, loading, addSlot, updateSlot, deleteSlot } = useAvailability(user?.uid || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '09:00',
    endTime: '17:00',
  });

  // Get slots for selected date
  const selectedDateSlots = selectedDate
    ? slots.filter((slot) => {
        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        return isSameDay(slotDate, selectedDate);
      })
    : [];

  // Get all dates that have availability
  const datesWithAvailability = slots.map((slot) =>
    slot.date instanceof Date ? slot.date : new Date(slot.date)
  );

  const handleAddSlot = async () => {
    if (!user || !selectedDate) return;

    try {
      await addSlot({
        merchantId: user.uid,
        date: selectedDate,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isActive: true,
      });
      setIsAddingSlot(false);
      setNewSlot({ startTime: '09:00', endTime: '17:00' });
    } catch (error) {
      console.error('Error adding slot:', error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      try {
        await deleteSlot(slotId);
      } catch (error) {
        console.error('Error deleting slot:', error);
      }
    }
  };

  const toggleSlotStatus = async (slotId: string, currentStatus: boolean) => {
    try {
      await updateSlot(slotId, { isActive: !currentStatus });
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calendar Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Click on a date to view or add availability for that day
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            highlightedDates={datesWithAvailability}
          />
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          {selectedDate ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h2>

                {selectedDateSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No availability set for this day
                    </p>
                    <button
                      onClick={() => setIsAddingSlot(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                    >
                      Add Time Slot
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {selectedDateSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-lg">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                slot.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                              }`}
                            >
                              {slot.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleSlotStatus(slot.id, slot.isActive)}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition ${
                                slot.isActive
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                              }`}
                            >
                              {slot.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="flex-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium text-sm transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setIsAddingSlot(true)}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition font-medium"
                    >
                      + Add Another Time Slot
                    </button>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">
                  Quick Tips
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Green ring = day has availability</li>
                  <li>• Add multiple slots per day</li>
                  <li>• Past dates cannot be edited</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-center py-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a date from the calendar to manage availability
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Slot Modal */}
      {isAddingSlot && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Add Time Slot
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddSlot}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Add Slot
              </button>
              <button
                onClick={() => {
                  setIsAddingSlot(false);
                  setNewSlot({ startTime: '09:00', endTime: '17:00' });
                }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
