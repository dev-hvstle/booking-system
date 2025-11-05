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

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'pricingTiers'),
      where('merchantId', '==', merchantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tiersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PricingTier[];
      setTiers(tiersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [merchantId]);

  const addTier = async (tier: Omit<PricingTier, 'id'>) => {
    await addDoc(collection(db, 'pricingTiers'), tier);
  };

  const updateTier = async (tierId: string, updates: Partial<PricingTier>) => {
    const tierRef = doc(db, 'pricingTiers', tierId);
    await updateDoc(tierRef, updates);
  };

  const deleteTier = async (tierId: string) => {
    const tierRef = doc(db, 'pricingTiers', tierId);
    await deleteDoc(tierRef);
  };

  return { tiers, loading, addTier, updateTier, deleteTier };
}
