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
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service } from '@/types';

export function useServices(merchantId: string | null) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'services'),
      where('merchantId', '==', merchantId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const servicesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            } as Service;
          });
          // Sort client-side instead of using Firestore orderBy
          servicesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setServices(servicesData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing services:', err);
          setError('Failed to load services');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching services:', err);
        setError('Failed to fetch services from database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [merchantId]);

  const addService = async (service: Omit<Service, 'id' | 'createdAt'>) => {
    try {
      const serviceData = {
        ...service,
        createdAt: Timestamp.now(),
      };
      await addDoc(collection(db, 'services'), serviceData);
    } catch (err) {
      console.error('Error adding service:', err);
      throw new Error('Failed to add service');
    }
  };

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, updates);
    } catch (err) {
      console.error('Error updating service:', err);
      throw new Error('Failed to update service');
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await deleteDoc(serviceRef);
    } catch (err) {
      console.error('Error deleting service:', err);
      throw new Error('Failed to delete service');
    }
  };

  return { services, loading, error, addService, updateService, deleteService };
}
