import { RawMaterialModel } from "@/models/DataModel";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, Row, SortingState, useReactTable } from "@tanstack/react-table";
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import { Button } from "./ui/button";
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDotsVertical, IconGripVertical, IconLayoutColumns } from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState } from "react";
import React from "react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress"


type RawMaterialTableProps = {
  data: RawMaterialModel[];
  tableMeta: TableMeta
};

type TableMeta = {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
};

type StatusTab = "all" | "in_stock" | "out_stock" | "min_stock";

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
function DraggableRow({ row }: { row: Row<RawMaterialModel> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.raw_material_id,
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

const columns: ColumnDef<RawMaterialModel>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.raw_material_id} />,
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
    accessorKey: "name", // 👈 links to row.category
    header: "Name",
    cell: ({ table , row }) => <div className="w-32">{row.original.name}</div>
  }, {
    accessorKey: "created_at", // 👈 links to row.category
    header: "Create at",
    cell: ({ table , row }) => {
      const rawDate = row.original.created_at;
      const date = new Date(rawDate);

      const formatted = `${format(date, "dd MMM yyyy")}\n${format(date, "hh:mm a")}`;
      
      return <div className="flex flex-col gap-2 group hover:text-gray-500 w-24">
          <div className="group-hover:text-blue-500">{format(date, "dd MMM yyyy")}</div>
          <div className="text-[14px] text-gray-500">{format(date, "hh:mm a")}</div>
      </div>;
    }
  }, {
    accessorKey: "current_stock", // 👈 links to row.category
    header: "Stock",
    cell: ({ row }) => {
  const current = row.original.current_stock ?? 0;
  const min = row.original.min_required_stock ?? 0;

  let status = "";
  let textColorClass = "";
  let bgColorClass = ""
  let progress = 0;

  if (current === 0) {
    status = "Out of Stock";
    textColorClass = "text-red-600";
    bgColorClass = "bg-red-600/20";
    progress = 0;
  } else if (current <= min) {
    status = `${current} Low in Stock`;
    textColorClass = "text-yellow-500";
    bgColorClass = "bg-yellow-500/20"
    progress = (current / (min || 1)) * 100;
  } else {
    status = `${current} In Stock`;
    textColorClass = "text-green-600";
    bgColorClass = "bg-green-600/20"
    progress = 100;
  }

  return (
    <div className="flex flex-col gap-1 w-32">
      <Progress value={progress} className={`w-[75%] ${bgColorClass}`} indicatorClass={
    current === 0
      ? "bg-red-500"
      : current <= min
      ? "bg-yellow-400"
      : "bg-green-500"
  } />
      <span className={`${textColorClass} font-normal`}>{status}</span>
    </div>
  );
}
  }, {
    accessorKey: "cost_per_unit", // 👈 links to row.category
    header: "Price",
    cell: ({ table , row }) => <div>PKR {row.original.cost_per_unit} per {row.original.unit}</div>
  }, {
    accessorKey: "supplier", // 👈 links to row.category
    header: "Supplier",
    cell: ({ table , row }) => <Badge variant="outline">{row.original.supplier}</Badge>
  }

  ,{
    id: "actions",
    cell: ({ row }) => {
      const rawMaterial = row.original

      const handleEdit = () => {
        // ✅ Replace this with your drawer/modal or form logic
        toast(`Editing product ${rawMaterial.raw_material_id}`)
      }

      const handleDelete = () => {
        // ✅ Replace this with your delete API call or confirm dialog
        console.log("Deleting product:", rawMaterial)
        toast.error(`Deleted product ${rawMaterial.raw_material_id}`)
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


export function RawMaterialTable({ data: initialData, tableMeta: TableMeta } : RawMaterialTableProps) {

    const data : RawMaterialModel[] = initialData;
      const [tab, setTab] = useState<StatusTab>("all");
      const sortableId = React.useId();
      const [sorting, setSorting] = React.useState<SortingState>([]);
      const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    
    
      const sensors = useSensors(
            useSensor(MouseSensor, {}),
            useSensor(TouchSensor, {}),
            useSensor(KeyboardSensor, {})
            
          );

          const stockCount = React.useMemo(() => {
            return data.filter((p) => (p.current_stock ?? 0) > 0).length;
          }, [data]);

          const minStockCount = React.useMemo(() => {
            return data.filter((p) => {
              const current = p.current_stock ?? 0;
              const min = p.min_required_stock ?? 0;
              return current > 0 && current <= min;
            }).length;
          }, [data]);

          const outStockCount = React.useMemo(() => {
            return data.filter((p) => (p.current_stock ?? 0) === 0).length;
          }, [data]);

           const filteredRawMaterial = React.useMemo(() => {
            return data.filter((p) => {
              const current = p.current_stock ?? 0;
              const min = p.min_required_stock ?? 0;

              if (tab === "out_stock") return current === 0;
              if (tab === "min_stock") return current > 0 && current <= min;
              if (tab === "in_stock") return current > min;

              return true; // If no tab selected, show all
            });
          }, [data, tab]);

          const dataIds = React.useMemo(
              () => filteredRawMaterial.map(({ raw_material_id }) => raw_material_id) || [],
              [filteredRawMaterial]
          );

     const table = useReactTable<RawMaterialModel>({
            data : filteredRawMaterial,
            columns,
            state: {
              sorting,
              columnFilters,
            },
            getRowId: (row) => row.raw_material_id,
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            onSortingChange: setSorting,
            onColumnFiltersChange: setColumnFilters,
            getFilteredRowModel: getFilteredRowModel(),
          })
    
          function handleDragEnd(event: { active: any; over: any; }) {
              const { active, over } = event;
              if (active && over && active.id !== over.id) {
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                const reorderedRawMaterials = arrayMove(filteredRawMaterial, oldIndex, newIndex);
                console.log("Reordered products:", reorderedRawMaterials);
              }
            }

    return(
        <Tabs value={tab} onValueChange={(value) => setTab(value as StatusTab)} className="w-full flex-col justify-start gap-6">
          {/* Table Top Tabs */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <Label htmlFor="view-selector" className="sr-only">
                      View
            </Label>
            <Select value={tab} onValueChange={(value) => setTab(value as StatusTab)}>
                <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
                  <SelectValue placeholder="Select a view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="panding">Panding</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="halted">Halted</SelectItem>
                </SelectContent>
            </Select>
            <TabsList className="hidden @4xl/main:flex">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="in_stock">
                  In Stock <Badge variant="secondary">{stockCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="min_stock">
                  Min Stock<Badge variant="secondary">{minStockCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="out_stock">
                  Out Stock <Badge variant="secondary">{outStockCount}</Badge>
                </TabsTrigger>
              </TabsList>

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
          {/* Table Content */}
            <TabsContent value={tab} className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
              <div className="overflow-hidden rounded-lg border">
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                  id={sortableId}
                >
                  <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>

                    <TableBody>
                      {table.getRowModel().rows.length ? (
                        <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                          {table.getRowModel().rows.map((row) => (
                            <DraggableRow key={row.id} row={row} />
                          ))}
                        </SortableContext>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </DndContext>
              </div>

              {/* Pagination  */}
              <div className="flex items-center justify-between px-4">
                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                  {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>

                <div className="flex w-full items-center gap-8 lg:w-fit">
                  <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                      Rows per page
                    </Label>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                        <SelectValue placeholder={table.getState().pagination.pageSize.toString()} />
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

                  <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </div>

                  <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to first page</span>
                      <IconChevronsLeft />
                    </Button>

                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <IconChevronLeft />
                    </Button>

                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to next page</span>
                      <IconChevronRight />
                    </Button>

                    <Button
                      variant="outline"
                      className="hidden size-8 lg:flex"
                      size="icon"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Go to last page</span>
                      <IconChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
        </Tabs>
    );
}