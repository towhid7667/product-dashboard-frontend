'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/ui/loader';
import { Product, ApiError } from '@/types';
import { useCreateProductMutation, useUpdateProductMutation } from '@/lib/redux/features/products/productsApi';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  status: z.enum(['active', 'inactive']),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Other',
];

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      status: 'active' as const,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
        imageUrl: product.imageUrl || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        status: 'active',
        imageUrl: '',
      });
    }
  }, [product, form]);

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    if (!process.env.NEXT_PUBLIC_IMGBB_API_KEY) {
      throw new Error('ImgBB API key is missing');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    }
    throw new Error(data.error?.message || 'Image upload failed');
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (product?.id) {
        await updateProduct({ id: product.id, data }).unwrap();
        toast({ title: 'Success', description: 'Product updated successfully' });
      } else {
        await createProduct(data).unwrap();
        toast({ title: 'Success', description: 'Product created successfully' });
      }
      onClose();
      form.reset();
    } catch (error) {
      const err = error as ApiError;
      toast({
        title: 'Error',
        description: err.data?.message || 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToImgBB(file);
      form.setValue('imageUrl', imageUrl);
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const isSubmitting = isCreating || isUpdating || uploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product information' : 'Create a new product'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploading}
                      />
                      {field.value && (
                        <img
                          src={field.value}
                          alt="Product preview"
                          className="w-full max-w-xs h-32 object-cover rounded-md border"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader size="sm" /> : null}
                {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}