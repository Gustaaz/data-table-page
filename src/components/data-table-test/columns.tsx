"use client"

import type { User } from "@/types/user"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "firstName",
    header: "Primeiro Nome",
  },
  {
    accessorKey: "age",
    header: "Idade",
  },
]
