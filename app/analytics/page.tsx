'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useGetProductsQuery } from '@/lib/redux/features/products/productsApi';
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts';
import { Loader } from '@/components/ui/loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: products = [], isLoading } = useGetProductsQuery();
  useRealtimeProducts();

  if (isLoading) return <Loader fullScreen />;

  const categoryData = products.reduce((acc: any[], p) => {
    const found = acc.find(i => i.category === p.category);
    if (found) {
      found.count += 1;
      found.value += p.price * p.stock;
    } else {
      acc.push({ category: p.category, count: 1, value: p.price * p.stock });
    }
    return acc;
  }, []);

  const statusData = [
    { name: 'Active', value: products.filter(p => p.status === 'active').length },
    { name: 'Inactive', value: products.filter(p => p.status === 'inactive').length },
  ];

  const stockData = products
    .map(p => ({ name: p.name.slice(0, 10) + '...', stock: p.stock }))
    .slice(0, 8);

  const total = products.length;
  const value = products.reduce((s, p) => s + p.price * p.stock, 0);
  const avg = total > 0 ? products.reduce((s, p) => s + p.price, 0) / total : 0;
  const low = products.filter(p => p.stock < 10).length;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/products')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle className="text-2xl">{total}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Value</CardDescription><CardTitle className="text-2xl">${value.toFixed(2)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Avg Price</CardDescription><CardTitle className="text-2xl">${avg.toFixed(2)}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Low Stock</CardDescription><CardTitle className="text-2xl text-red-600">{low}</CardTitle></CardHeader></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">By Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Status</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} fill="#8884d8" dataKey="value" label>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}