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

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'availableSlots'),
      where('merchantId', '==', merchantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slotsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        } as AvailableSlot;
      });
      setSlots(slotsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [merchantId]);

  const addSlot = async (slot: Omit<AvailableSlot, 'id'>) => {
    // Convert Date to Timestamp for Firestore
    const slotData = {
      ...slot,
      date: Timestamp.fromDate(slot.date instanceof Date ? slot.date : new Date(slot.date)),
    };
    await addDoc(collection(db, 'availableSlots'), slotData);
  };

  const updateSlot = async (slotId: string, updates: Partial<AvailableSlot>) => {
    const slotRef = doc(db, 'availableSlots', slotId);
    // Convert Date to Timestamp if date is being updated
    const updateData = { ...updates };
    if (updates.date) {
      updateData.date = Timestamp.fromDate(
        updates.date instanceof Date ? updates.date : new Date(updates.date)
      ) as any;
    }
    await updateDoc(slotRef, updateData);
  };

  const deleteSlot = async (slotId: string) => {
    const slotRef = doc(db, 'availableSlots', slotId);
    await deleteDoc(slotRef);
  };

  return { slots, loading, addSlot, updateSlot, deleteSlot };
}
