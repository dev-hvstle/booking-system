'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AvailableSlot } from '@/types';

export function useAvailability(merchantId: string | null) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'availableSlots'),
      where('merchantId', '==', merchantId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const slotsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
            } as AvailableSlot;
          });
          setSlots(slotsData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing availability slots:', err);
          setError('Failed to load availability slots');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching availability slots:', err);
        setError('Failed to fetch availability from database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [merchantId]);

  const addSlot = async (slot: Omit<AvailableSlot, 'id'>) => {
    try {
      // Convert Date to Timestamp for Firestore
      const slotData = {
        ...slot,
        date: Timestamp.fromDate(slot.date instanceof Date ? slot.date : new Date(slot.date)),
      };
      await addDoc(collection(db, 'availableSlots'), slotData);
    } catch (err) {
      console.error('Error adding availability slot:', err);
      throw new Error('Failed to add availability slot');
    }
  };

  const updateSlot = async (slotId: string, updates: Partial<AvailableSlot>) => {
    try {
      const slotRef = doc(db, 'availableSlots', slotId);
      // Convert Date to Timestamp if date is being updated
      const updateData = { ...updates };
      if (updates.date) {
        updateData.date = Timestamp.fromDate(
          updates.date instanceof Date ? updates.date : new Date(updates.date)
        ) as any;
      }
      await updateDoc(slotRef, updateData);
    } catch (err) {
      console.error('Error updating availability slot:', err);
      throw new Error('Failed to update availability slot');
    }
  };

  const deleteSlot = async (slotId: string) => {
    try {
      const slotRef = doc(db, 'availableSlots', slotId);
      await deleteDoc(slotRef);
    } catch (err) {
      console.error('Error deleting availability slot:', err);
      throw new Error('Failed to delete availability slot');
    }
  };

  return { slots, loading, error, addSlot, updateSlot, deleteSlot };
}
