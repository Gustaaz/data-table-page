"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import revalidateTagAction from "@/functions/revalidate-tag";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [limit, setLimit] = useQueryState("limit", { defaultValue: "10" });
  const [skip, setSkip] = useQueryState("skip", { defaultValue: "0" });
  const router = useRouter();

  const pageSize = useMemo(() => Number(limit), [limit]);
  const pageIndex = useMemo(() => Math.floor(Number(skip) / pageSize), [skip, pageSize]);
  const currentPage = useMemo(() => pageIndex + 1, [pageIndex]);
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  useEffect(() => {
    table.setPageSize(pageSize);
    table.setPageIndex(pageIndex);
  }, [pageSize, pageIndex, table]);

  const updateSkip = useCallback(
    async (newSkip: number) => {
      setSkip(newSkip.toString());
      await revalidateTagAction("users");
      router.refresh();
    },
    [router, setSkip]
  );

  const handleRowsPerPageChange = useCallback(
    async (value: string) => {
      setLimit(value);
      setSkip("0");
      await revalidateTagAction("users");
      router.refresh();
    },
    [setLimit, setSkip, router]
  );

  const handlePreviousPage = useCallback(async () => {
    const newSkip = Math.max(Number(skip) - pageSize, 0);
    await updateSkip(newSkip);
  }, [skip, pageSize, updateSkip]);

  const handleNextPage = useCallback(async () => {
    if (Number(skip) + pageSize < total) {
      await updateSkip(Number(skip) + pageSize);
    }
  }, [skip, pageSize, total, updateSkip]);

  const handleFirstPage = useCallback(async () => {
    await updateSkip(0);
  }, [updateSkip]);

  const lastSkip = useMemo(
    () => (total % pageSize === 0 ? total - pageSize : Math.floor(total / pageSize) * pageSize),
    [total, pageSize]
  );

  const handleLastPage = useCallback(async () => {
    await updateSkip(lastSkip);
  }, [lastSkip, updateSkip]);

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("firstName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2 mt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select value={limit || "10"} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[120px] items-center justify-center text-sm font-medium">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={handleFirstPage}
              disabled={Number(skip) === 0}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handlePreviousPage}
              disabled={Number(skip) === 0}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleNextPage}
              disabled={Number(skip) + pageSize >= total}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={handleLastPage}
              disabled={Number(skip) + pageSize >= total}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
