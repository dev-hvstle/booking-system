'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';

export function useBookings(merchantId: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('merchantId', '==', merchantId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const bookingsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            } as Booking;
          });
          setBookings(bookingsData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing bookings:', err);
          setError('Failed to load bookings');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings from database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [merchantId]);

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status });
    } catch (err) {
      console.error('Error updating booking status:', err);
      throw new Error('Failed to update booking status');
    }
  };

  return { bookings, loading, error, updateBookingStatus };
}
