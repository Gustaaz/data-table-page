"use client";

import { useState, useEffect } from "react";
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
  // Estados de ordenação e filtro
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Estados de paginação via query: definindo defaults como "10" e "0"
  const [limit, setLimit] = useQueryState("limit", { defaultValue: "10" });
  const [skip, setSkip] = useQueryState("skip", { defaultValue: "0" });

  // Hook para atualizar a rota
  const router = useRouter();

  // Configuração do react-table
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

  // Atualiza o react-table sempre que limit ou skip mudarem
  useEffect(() => {
    const pageSize = Number(limit);
    const pageIndex = Math.floor(Number(skip) / pageSize);
    table.setPageSize(pageSize);
    table.setPageIndex(pageIndex);
  }, [limit, skip, table]);

  // Calcula a página atual e o total de páginas
  const currentPage = Math.floor(Number(skip) / Number(limit)) + 1;
  const totalPages = Math.ceil(total / Number(limit));

  // Função para alterar o número de linhas por página (reseta para a 1ª página)
  const handleRowsPerPageChange = async (value: string) => {
    setLimit(value);
    setSkip("0");
    await revalidateTagAction("users");
    router.refresh();
  };

  // Calcula o skip para a última página
  const calculateLastSkip = () => {
    const lim = Number(limit);
    return total % lim === 0 ? total - lim : Math.floor(total / lim) * lim;
  };

  // Funções de navegação com router.refresh() para forçar a re-renderização
  const handlePreviousPage = async () => {
    const newSkip =
    Number(skip) - Number(limit) >= 0 ? Number(skip) - Number(limit) : 0;
    setSkip(newSkip.toString());
    await revalidateTagAction("users");

    router.refresh();
  };

  const handleNextPage = async () => {
    if (Number(skip) + Number(limit) < total) {
      setSkip((Number(skip) + Number(limit)).toString());
      await revalidateTagAction("users");

      router.refresh();
    }
  };

  const handleFirstPage = async () => {
    setSkip("0");
    await revalidateTagAction("users");

    router.refresh();
  };

  const handleLastPage = async () => {
    setSkip(calculateLastSkip().toString());
    await revalidateTagAction("users");
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={
            (table.getColumn("firstName")?.getFilterValue() as string) ?? ""
          }
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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
            <Select
              value={limit || "10"}
              onValueChange={handleRowsPerPageChange}
            >
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
              disabled={Number(skip) + Number(limit) >= total}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={handleLastPage}
              disabled={Number(skip) + Number(limit) >= total}
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
