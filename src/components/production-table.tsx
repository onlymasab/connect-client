import { ProductionBatchModel } from "@/models/DataModel";
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDotsVertical, IconGripVertical } from "@tabler/icons-react";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, Row, SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";



type ProductionTableProps = {
  data: ProductionBatchModel[];
  tableMeta: TableMeta
};

type TableMeta = {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
};

type StatusTab = "all" | "panding" | "completed" | "halted" | "in_progress";


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
function DraggableRow({ row }: { row: Row<ProductionBatchModel> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.batch_number,
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



const columns: ColumnDef<ProductionBatchModel>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.batch_number} />,
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
      <div className="flex items-center justify-center object-fit">
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
    accessorKey: "batch_number", // 👈 links to row.category
    header: "Batch Number",
    cell: ({ table , row }) => <div>{row.original.batch_number}</div>
  }, {
    accessorKey: "product_id", // 👈 links to row.category
    header: "Product",
    cell: ({ table , row }) => <div>{row.original.product_id}</div>
  }, {
    accessorKey: "start_date", // 👈 links to row.category
    header: "Start",
    cell: ({ table , row }) => <div>{row.original.start_date}</div>
  }, {
    accessorKey: "end_date", // 👈 links to row.category
    header: "End",
    cell: ({ table , row }) => <div>{row.original.end_date}</div>
  }, {
    accessorKey: "quantity_produced", // 👈 links to row.category
    header: "Production",
    cell: ({ table , row }) => <div>{row.original.quantity_produced}</div>
  }, {
    accessorKey: "quantity_wasted", // 👈 links to row.category
    header: "Wasted",
    cell: ({ table , row }) => <div>{row.original.quantity_wasted}</div>
  }, {
    accessorKey: "notes", // 👈 links to row.category
    header: "Notes",
    cell: ({ table , row }) => <div>{row.original.notes}</div>
  }

  ,{
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

      const handleEdit = () => {
        // ✅ Replace this with your drawer/modal or form logic
        console.log("Editing product:", product)
        toast(`Editing product ${product.batch_number}`)
      }

      const handleDelete = () => {
        // ✅ Replace this with your delete API call or confirm dialog
        console.log("Deleting product:", product)
        toast.error(`Deleted product ${product.batch_number}`)
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


export function ProductionTable({ data: initialData, tableMeta: TableMeta } : ProductionTableProps) {

  const data : ProductionBatchModel[] = initialData;
  const [tab, setTab] = useState<StatusTab>("all");
  const sortableId = React.useId();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
        
      );

      const pandingCount = React.useMemo(() => {
        return data.filter((p) => p.status === "panding").length;
      }, [data]);

      const completedCount = React.useMemo(() => {
        return data.filter((p) => p.status === "completed").length;
      }, [data]);

      const haltedCount = React.useMemo(() => {
        return data.filter((p) => p.status === "halted").length;
      }, [data]);

      const inProgressCount = React.useMemo(() => {
        return data.filter((p) => p.status === "in_progress").length;
      }, [data]);

      // Filtered list based on tab
          const filteredProduction = React.useMemo(() => {
          if (["pending", "completed", "halted", "in_progress"].includes(tab)) {
            return data.filter((p) => p.status === tab);
          }
          return data;
        }, [data, tab]);

      const dataIds = React.useMemo(
            () => filteredProduction.map(({ batch_number }) => batch_number) || [],
            [filteredProduction]
        );


    const table = useReactTable<ProductionBatchModel>({
        data : initialData,
        columns,
        state: {
          sorting,
          columnFilters,
        },
        getRowId: (row) => row.batch_number,
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
            const reorderedProducts = arrayMove(filteredProduction, oldIndex, newIndex);
            console.log("Reordered products:", reorderedProducts);
          }
        }
 

    return (
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
              <TabsTrigger value="panding">
                Panding <Badge variant="secondary">{pandingCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress<Badge variant="secondary">{inProgressCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed <Badge variant="secondary">{completedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="halted">
                Halted <Badge variant="secondary">{haltedCount}</Badge>
              </TabsTrigger>
            </TabsList>
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