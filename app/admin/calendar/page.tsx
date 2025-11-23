'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailability } from '@/hooks/useAvailability';
import { useBlockedPeriods } from '@/hooks/useBlockedPeriods';
import { useServices } from '@/hooks/useServices';
import { ErrorMessage } from '@/components/ErrorMessage';
import Calendar from '@/components/Calendar';
import { format, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export default function CalendarManagement() {
  const { user } = useAuth();
  const { slots, loading, error, addSlot, updateSlot, deleteSlot } = useAvailability(user?.uid || null);
  const { blockedPeriods, loading: blockedLoading, error: blockedError, addBlockedPeriod, deleteBlockedPeriod } = useBlockedPeriods(user?.uid || null);
  const { services, loading: servicesLoading, error: servicesError } = useServices(user?.uid || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all'); // 'all' or service ID
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isBlockingMode, setIsBlockingMode] = useState(false);
  const [blockingRange, setBlockingRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [blockingReason, setBlockingReason] = useState('');
  const [newSlot, setNewSlot] = useState({
    startTime: '09:00',
    endTime: '17:00',
    serviceId: '',
  });

  // Filter slots by selected service
  const filteredSlots = selectedServiceFilter === 'all'
    ? slots
    : slots.filter(slot => slot.serviceId === selectedServiceFilter || (!slot.serviceId && selectedServiceFilter === 'general'));

  // Get slots for selected date
  const selectedDateSlots = selectedDate
    ? filteredSlots.filter((slot) => {
        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        return isSameDay(slotDate, selectedDate);
      })
    : [];

  // Get all dates that have availability (considering filter)
  const datesWithAvailability = filteredSlots.map((slot) =>
    slot.date instanceof Date ? slot.date : new Date(slot.date)
  );

  // Get service name by ID
  const getServiceName = (serviceId?: string) => {
    if (!serviceId) return 'General';
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  // Get all blocked dates from blocked periods
  const allBlockedDates: Date[] = [];
  blockedPeriods.forEach((period) => {
    const start = startOfDay(period.startDate);
    const end = startOfDay(period.endDate);
    let currentDate = start;
    while (currentDate <= end) {
      allBlockedDates.push(new Date(currentDate));
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
  });

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isBlockingMode) {
      // In blocking mode: select range
      if (!blockingRange.start) {
        setBlockingRange({ start: date, end: null });
      } else if (!blockingRange.end) {
        setBlockingRange({ ...blockingRange, end: date });
      } else {
        // Reset if both are selected
        setBlockingRange({ start: date, end: null });
      }
    } else {
      // Normal mode: select single date
      setSelectedDate(date);
    }
  };

  const handleAddSlot = async () => {
    if (!user || !selectedDate) return;

    try {
      await addSlot({
        merchantId: user.uid,
        date: selectedDate,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        serviceId: newSlot.serviceId || undefined,
        isActive: true,
      });
      setIsAddingSlot(false);
      setNewSlot({ startTime: '09:00', endTime: '17:00', serviceId: '' });
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

  const handleConfirmBlock = async () => {
    if (!user || !blockingRange.start || !blockingRange.end) return;

    try {
      await addBlockedPeriod({
        merchantId: user.uid,
        startDate: blockingRange.start,
        endDate: blockingRange.end,
        reason: blockingReason || undefined,
      });
      // Reset blocking state
      setIsBlockingMode(false);
      setBlockingRange({ start: null, end: null });
      setBlockingReason('');
    } catch (error) {
      console.error('Error blocking period:', error);
      alert('Failed to block period. Please try again.');
    }
  };

  const handleCancelBlocking = () => {
    setIsBlockingMode(false);
    setBlockingRange({ start: null, end: null });
    setBlockingReason('');
  };

  const handleEnterBlockingMode = () => {
    setIsBlockingMode(true);
    setSelectedDate(null); // Clear selected date when entering blocking mode
  };

  const handleDeleteBlockedPeriod = async (periodId: string) => {
    if (confirm('Are you sure you want to unblock this period?')) {
      try {
        await deleteBlockedPeriod(periodId);
      } catch (error) {
        console.error('Error deleting blocked period:', error);
      }
    }
  };

  // Check if a date is blocked
  const isDateBlocked = (date: Date) => {
    return blockedPeriods.some((period) =>
      isWithinInterval(startOfDay(date), {
        start: startOfDay(period.startDate),
        end: endOfDay(period.endDate),
      })
    );
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

  if (error || blockedError || servicesError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Calendar Management</h1>
        <ErrorMessage
          message={error || blockedError || servicesError || 'An error occurred'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendar Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isBlockingMode
                ? 'Select start and end dates to block a period'
                : 'Click on a date to view or add availability'}
            </p>
          </div>
          {!isBlockingMode ? (
            <button
              onClick={handleEnterBlockingMode}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition shadow-lg"
            >
              Block Dates
            </button>
          ) : (
            <button
              onClick={handleCancelBlocking}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Service Filter */}
        {!isBlockingMode && !servicesLoading && services.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Filter by Service</label>
            <select
              value={selectedServiceFilter}
              onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Services</option>
              <option value="general">General (No Service)</option>
              {services.filter(s => s.isActive).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            highlightedDates={datesWithAvailability}
            blockedDates={allBlockedDates}
            blockingMode={isBlockingMode}
            selectedRange={blockingRange}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blocking Mode Panel */}
          {isBlockingMode ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Block Period</h2>

              {!blockingRange.start && !blockingRange.end && (
                <div className="text-center py-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click on a date to start selecting a range
                  </p>
                </div>
              )}

              {blockingRange.start && !blockingRange.end && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {format(blockingRange.start, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click another date to set the end date
                  </p>
                </div>
              )}

              {blockingRange.start && blockingRange.end && (
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Selected Range</span>
                    </div>
                    <p className="text-center font-semibold text-red-900 dark:text-red-300">
                      {format(blockingRange.start, 'MMM d, yyyy')} -{' '}
                      {format(blockingRange.end, 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={blockingReason}
                      onChange={(e) => setBlockingReason(e.target.value)}
                      placeholder="e.g., Vacation, Holiday"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <button
                    onClick={handleConfirmBlock}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Confirm Block
                  </button>
                </div>
              )}
            </div>
          ) : selectedDate ? (
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
                            <div>
                              <span className="font-semibold text-lg">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {slot.serviceId && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  {getServiceName(slot.serviceId)}
                                </div>
                              )}
                            </div>
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

          {/* Blocked Periods List */}
          {!isBlockingMode && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Blocked Periods
              </h3>

              {blockedLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ) : blockedPeriods.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No blocked periods
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {blockedPeriods.map((period) => (
                    <div
                      key={period.id}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-900 dark:text-red-300">
                            {format(period.startDate, 'MMM d')} - {format(period.endDate, 'MMM d, yyyy')}
                          </p>
                          {period.reason && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {period.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBlockedPeriod(period.id)}
                        className="w-full px-2 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              {!servicesLoading && services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Service (Optional)</label>
                  <select
                    value={newSlot.serviceId}
                    onChange={(e) => setNewSlot({ ...newSlot, serviceId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">General (All Services)</option>
                    {services.filter(s => s.isActive).map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  setNewSlot({ startTime: '09:00', endTime: '17:00', serviceId: '' });
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
