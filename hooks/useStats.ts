'use client';

import { useMemo } from 'react';
import { Booking, BookingStats } from '@/types';

export function useStats(bookings: Booking[]): BookingStats {
  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats: BookingStats = {
      totalBookings: bookings.length,
      totalRevenue: 0,
      pendingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      monthlyRevenue: 0,
      monthlyBookings: 0,
    };

    bookings.forEach((booking) => {
      // Total revenue
      if (booking.status === 'completed') {
        stats.totalRevenue += booking.amount;
      }

      // Status counts
      if (booking.status === 'pending') stats.pendingBookings++;
      if (booking.status === 'completed') stats.completedBookings++;
      if (booking.status === 'cancelled') stats.cancelledBookings++;

      // Monthly stats
      const bookingDate = new Date(booking.date);
      if (
        bookingDate.getMonth() === currentMonth &&
        bookingDate.getFullYear() === currentYear
      ) {
        stats.monthlyBookings++;
        if (booking.status === 'completed') {
          stats.monthlyRevenue += booking.amount;
        }
      }
    });

    return stats;
  }, [bookings]);
}
