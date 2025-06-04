"use client"
import { PrecastProductMaterialModel, RawMaterialUsageModel } from "@/models/DataModel";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "./ui/button";
import { IconChevronDown, IconDotsVertical, IconGripVertical, IconLayoutColumns } from "@tabler/icons-react";
import { ColumnDef, flexRender, getCoreRowModel, Row, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { format } from "date-fns";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMemo, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";


type ProductMaterialTableProps = {
  data: PrecastProductMaterialModel[];
  tableMeta: TableMeta
};

type TableMeta = {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
};


// DragHandle component for reordering rows
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// DraggableRow component for rendering sortable rows
function DraggableRow({ row }: { row: Row<PrecastProductMaterialModel> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

const columns: ColumnDef<PrecastProductMaterialModel>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex w-4 items-center justify-center object-fit">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }, {
    accessorKey: "product", // 👈 links to row.category
    header: "Product Name",
    cell: ({ table , row }) => <div className="w-32">{row.original.product.name}</div>
  }, {
    accessorKey: "material", // 👈 links to row.category
    header: "Material Name",
    cell: ({ table , row }) => <div className="w-32">{row.original.material.name}</div>
  }, {
    accessorKey: "unit", // 👈 links to row.category
    header: "Unit",
    cell: ({ table , row }) => <div className="w-32">{row.original.unit}</div>
  },  {
    accessorKey: "quantity", // 👈 links to row.category
    header: "Quantity",
    cell: ({ table , row }) => <div className="w-32">{row.original.quantity}</div>
  }, {
    accessorKey: "created", // 👈 links to row.category
    header: "Created at",
    cell: ({ table , row }) => {
          const rawDate = row.original.created_at;
          const date = new Date(rawDate);
    
          const formatted = `${format(date, "dd MMM yyyy")}\n${format(date, "hh:mm a")}`;
          
          return <div className="flex flex-col gap-2 group hover:text-gray-500 w-24">
              <div className="group-hover:text-blue-500">{format(date, "dd MMM yyyy")}</div>
              <div className="text-[14px] text-gray-500">{format(date, "hh:mm a")}</div>
          </div>;
        }
  } ,{
    id: "actions",
    cell: ({ row }) => {
      const rawMaterial = row.original

      const handleEdit = () => {
        // ✅ Replace this with your drawer/modal or form logic
        toast(`Editing product ${rawMaterial.id}`)
      }

      const handleDelete = () => {
        // ✅ Replace this with your delete API call or confirm dialog
        console.log("Deleting product:", rawMaterial)
        toast.error(`Deleted product ${rawMaterial.id}`)
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger >
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];

export function ProductMaterialTable({
  data: initialData,
  tableMeta: TableMeta,
}: ProductMaterialTableProps) {
  // Extract unique product names from initialData
  const productNames = React.useMemo(() => {
    const names = initialData.map((item) => item.product?.name).filter(Boolean);
    return Array.from(new Set(names)); // unique names
  }, [initialData]);

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  // Filter data based on selected product name
  const filteredData = React.useMemo(() => {
    if (!value) return initialData; // show all if no filter
    return initialData.filter((item) => item.product?.name === value);
  }, [initialData, value]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="px-4 lg:px-6 mb-4">
      <div className="flex items-center justify-between  mb-4">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger >
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {value || "Select product..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search product..." className="h-9" />
              <CommandList>
                <CommandEmpty>No product found.</CommandEmpty>
                <CommandGroup>
                  {productNames.map((name) => (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      {name}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
            <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="hidden @4xl/main:flex" onClick={() => {}}>
            <span className="hidden lg:inline">Add Product</span>
            <span className="lg:hidden">New</span>
          </Button>
        </div> 

      </div>

      <div className="rounded-md border px-4 lg:px-6 mb-4">
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
            {table.getRowModel().rows.length ? (
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


