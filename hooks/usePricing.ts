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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PricingTier } from '@/types';

export function usePricing(merchantId: string | null) {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'pricingTiers'),
      where('merchantId', '==', merchantId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const tiersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as PricingTier[];
          setTiers(tiersData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing pricing tiers:', err);
          setError('Failed to load pricing tiers');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching pricing tiers:', err);
        setError('Failed to fetch pricing tiers from database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [merchantId]);

  const addTier = async (tier: Omit<PricingTier, 'id'>) => {
    try {
      await addDoc(collection(db, 'pricingTiers'), tier);
    } catch (err) {
      console.error('Error adding pricing tier:', err);
      throw new Error('Failed to add pricing tier');
    }
  };

  const updateTier = async (tierId: string, updates: Partial<PricingTier>) => {
    try {
      const tierRef = doc(db, 'pricingTiers', tierId);
      await updateDoc(tierRef, updates);
    } catch (err) {
      console.error('Error updating pricing tier:', err);
      throw new Error('Failed to update pricing tier');
    }
  };

  const deleteTier = async (tierId: string) => {
    try {
      const tierRef = doc(db, 'pricingTiers', tierId);
      await deleteDoc(tierRef);
    } catch (err) {
      console.error('Error deleting pricing tier:', err);
      throw new Error('Failed to delete pricing tier');
    }
  };

  return { tiers, loading, error, addTier, updateTier, deleteTier };
}
