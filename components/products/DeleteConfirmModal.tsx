'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteProductMutation } from '@/lib/redux/features/products/productsApi';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  productId,
  productName,
}: DeleteConfirmModalProps) {
  const [deleteProduct, { isLoading }] = useDeleteProductMutation();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteProduct(productId).unwrap();
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      onClose();
    } catch (error) {
      const err = error as ApiError;
      toast({
        title: 'Error',
        description: err.data?.message || 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{' '}
            <strong>{productName}</strong> and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}