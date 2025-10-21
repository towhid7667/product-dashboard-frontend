import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { productsApi } from '@/lib/redux/features/products/productsApi';
import { useAppDispatch } from '@/lib/redux/hooks';

export const useRealtimeProducts = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, () => {
      dispatch(productsApi.util.invalidateTags(['Products']));
    });

    return () => unsubscribe();
  }, [dispatch]);
};