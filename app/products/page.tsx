'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogOut, BarChart3 } from 'lucide-react';
import { ProductsTable } from '@/components/products/Productstable';
import { ProductModal } from '@/components/products/ProductModal';
import { useGetProductsQuery } from '@/lib/redux/features/products/productsApi';
import { useLogoutMutation } from '@/lib/redux/features/auth/authApi';
import { useAppDispatch } from '@/lib/redux/hooks';
import { logout } from '@/lib/redux/features/auth/authslice';
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts';
import { Loader } from '@/components/ui/loader';

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: products = [], isLoading } = useGetProductsQuery();
  const [logoutMutation] = useLogoutMutation();

  useRealtimeProducts();

  const handleLogout = async () => {
    await logoutMutation().unwrap();
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/analytics')}>
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">All Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader /> : <ProductsTable products={products} />}
          </CardContent>
        </Card>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}