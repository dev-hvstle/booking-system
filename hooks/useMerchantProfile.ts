'use client';

import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Merchant } from '@/types';

export function useMerchantProfile(userId: string | null) {
  const [profile, setProfile] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Use real-time listener for profile updates
    const profileRef = doc(db, 'merchants', userId);
    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setProfile({
              id: snapshot.id,
              email: data.email || '',
              name: data.name || '',
              businessName: data.businessName || '',
              profilePicture: data.profilePicture,
              coverPicture: data.coverPicture,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
              updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt ? new Date(data.updatedAt) : undefined,
            } as Merchant);
          } else {
            setProfile(null);
          }
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing merchant profile:', err);
          setError('Failed to load profile');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching merchant profile:', err);
        setError('Failed to fetch profile from database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const createProfile = async (profileData: Omit<Merchant, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) {
      throw new Error('User ID is required to create profile');
    }

    try {
      const profileRef = doc(db, 'merchants', userId);
      const newProfile = {
        ...profileData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await setDoc(profileRef, newProfile);
    } catch (err) {
      console.error('Error creating merchant profile:', err);
      throw new Error('Failed to create profile');
    }
  };

  const updateProfile = async (updates: Partial<Omit<Merchant, 'id' | 'createdAt'>>) => {
    if (!userId) {
      throw new Error('User ID is required to update profile');
    }

    try {
      const profileRef = doc(db, 'merchants', userId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(profileRef, updateData);
    } catch (err) {
      console.error('Error updating merchant profile:', err);
      throw new Error('Failed to update profile');
    }
  };

  return { profile, loading, error, createProfile, updateProfile };
}
