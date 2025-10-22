'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Product } from '@/types';
import { ProductModal } from './ProductModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'imageUrl',
      header: '',
      cell: ({ row }) => (
        <Avatar className="h-9 w-9">
          <AvatarImage src={row.original.imageUrl} alt={row.original.name} />
          <AvatarFallback>{row.original.name[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      ),
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium max-w-[180px] truncate sm:max-w-none">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className={row.original.stock < 10 ? 'text-red-600 font-medium' : ''}>
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedProduct(row.original);
                setIsEditOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedProduct(row.original);
                setIsDeleteOpen(true);
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50,
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs sm:text-sm font-medium whitespace-nowrap"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs sm:text-sm py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {/* Delete Modal */}
      {selectedProduct && (
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id!}
          productName={selectedProduct.name}
        />
      )}
    </>
  );
}