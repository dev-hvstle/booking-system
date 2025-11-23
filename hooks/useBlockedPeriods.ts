'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BlockedPeriod } from '@/types';

export function useBlockedPeriods(merchantId: string | null) {
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'blockedPeriods'),
      where('merchantId', '==', merchantId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const periodsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate),
              endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate),
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            } as BlockedPeriod;
          });
          // Sort client-side by startDate descending
          periodsData.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
          setBlockedPeriods(periodsData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing blocked periods:', err);
          setError('Failed to load blocked periods');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching blocked periods:', err);
        setError('Failed to fetch blocked periods from database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [merchantId]);

  const addBlockedPeriod = async (period: Omit<BlockedPeriod, 'id' | 'createdAt'>) => {
    try {
      const periodData = {
        ...period,
        startDate: Timestamp.fromDate(period.startDate instanceof Date ? period.startDate : new Date(period.startDate)),
        endDate: Timestamp.fromDate(period.endDate instanceof Date ? period.endDate : new Date(period.endDate)),
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, 'blockedPeriods'), periodData);
    } catch (err) {
      console.error('Error adding blocked period:', err);
      throw new Error('Failed to add blocked period');
    }
  };

  const deleteBlockedPeriod = async (periodId: string) => {
    try {
      const periodRef = doc(db, 'blockedPeriods', periodId);
      await deleteDoc(periodRef);
    } catch (err) {
      console.error('Error deleting blocked period:', err);
      throw new Error('Failed to delete blocked period');
    }
  };

  return { blockedPeriods, loading, error, addBlockedPeriod, deleteBlockedPeriod };
}
