import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ProductModel } from "@/models/ProductModel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { ArrowUpDown } from "lucide-react"
import { AddProductDialog } from "./product-dialog"
import { supabase } from "@/lib/supabase/client"

// ====== Schema + Type ======
const schema = z.object({
  sku_id: z.string(),
  name: z.string(),
  category: z.string(),
  type: z.string(),
  dimensions: z.string(),
  weight: z.number(),
  material: z.string(),
  strength: z.string(),
  is_active: z.boolean().optional(),
  is_deprecated: z.boolean().optional(),
  created_at: z.string().regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/,
    'Invalid ISO timestamp format for createdAt'
  ),
  updated_at: z.string().regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/,
    'Invalid ISO timestamp format for updatedAt'
  ),
})


function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.sku_id,
  })

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
  )
}

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })

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
  )
}

export type Product = z.infer<typeof schema>

const columns: ColumnDef<Product>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.sku_id} />,
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
      <div className="flex items-center justify-center object-fit w-12">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "sku_id",
    header: ({ column }) =>
      <Button
          className="text-[#637381] !px-0"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          SKU ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
  ,
    cell: ({ row }) => <div className='w-20'>{row.original.sku_id}</div>,
    enableHiding: false,
  },
  { accessorKey: 'name', header: 'Name',
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
   },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'dimensions', header: 'Dimensions' },
  { accessorKey: 'weight', header: 'Weight' },
  { accessorKey: 'material', header: 'Material' },
  { accessorKey: 'strength', header: 'Strength' },
  {
    accessorKey: 'is_active',
    header: 'Active',
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  },
  {
    accessorKey: 'is_deprecated',
    header: 'Deprecated',
    cell: info => (info.getValue() ? 'Yes' : 'No'),
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: info => new Date(info.getValue() as string).toLocaleString(),
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
    cell: info => <div className="w-56">{new Date(info.getValue() as string).toLocaleString()}</div>,
  },
  {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger>
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
]

type ProductTableProps = {
  data: Product[]
}

export function ProductTable({ data }: ProductTableProps) {
  const [initialData, setData] = React.useState(() => data)
  const [rowSelection, setRowSelection] = React.useState({})

  const dataIds = React.useMemo<UniqueIdentifier[]>(
      () => initialData?.map(({ sku_id }) => sku_id) || [],
      [initialData]
    )

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
      const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
      )
      const [sorting, setSorting] = React.useState<SortingState>([])
      const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
      })
      const sortableId = React.useId()
      const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
      )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getRowId: row => row.sku_id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event
      if (active && over && active.id !== over.id) {
        setData((initialData) => {
          const oldIndex = dataIds.indexOf(active.id)
          const newIndex = dataIds.indexOf(over.id)
          return arrayMove(initialData, oldIndex, newIndex)
        })
      }
    }

    const [openDialog, setOpenDialog] = React.useState(false)
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Product>()
    const [newProduct, setNewProduct] = React.useState<Product>({
      sku_id: "",
      name: "",
      category: "",
      type: "",
      dimensions: "",
      weight: 0,
      material: "",
      strength: "",
      is_active: true,
      is_deprecated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    

    const addProduct = async (product: Product) => {
      const { data: inserted, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single()
    
      if (error) {
        console.error("Error adding product", error)
        return
      }
    
      setData(prev => [...prev, inserted])
    }

  return (
    <Tabs
      defaultValue="all"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="all">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="acitve">Active</SelectItem>
            <SelectItem value="depricated">Depricated</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">
            Active <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="depricated">
            Depricated <Badge variant="secondary">2</Badge>
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
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddProductDialog
            onAdd={addProduct}
            data={initialData.map(product => ({
              ...product,
              is_active: product.is_active ?? false,
              is_deprecated: product.is_deprecated ?? false,
            }))}
          />
        </div>
      </div>

      <TabsContent
        value="all"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
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
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
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
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
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
  )
}



function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            Showing product details from schema
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="sku_id">SKU ID</Label>
                <Input id="sku_id" defaultValue={item.sku_id} disabled />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={item.name} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
            {/* Type Dropdown */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="type">Type</Label>
              <Select defaultValue={item.type}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Rectangular",
                    "Square",
                    "Round",
                    "Square Slab",
                    "T Beam",
                    "I Beam",
                    "L Beam",
                    "Precast Column",
                    "Precast Wall Panel",
                    "Precast Staircase",
                    "Precast Lintel",
                    "Precast Footing",
                    "Double Tee Slab",
                    "Hollow Core Slab",
                    "Solid Slab",
                    "U Drain",
                    "Box Culvert",
                    "Manhole",
                    "Boundary Wall Panel",
                    "Retaining Wall",
                    "Precast Pile",
                    "Precast Bridge Girder",
                    "Precast Parapet",
                    "Precast Kerb Stone",
                    "Precast Gully",
                    "Precast Bollard",
                    "Precast Pipe",
                    "Precast Road Barrier"
                  ].map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={item.category}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Slab",
                    "Beam",
                    "Column",
                    "Wall Panel",
                    "Staircase",
                    "Foundations",
                    "Drainage",
                    "Bridges",
                    "Utilities",
                    "Barriers",
                    "Miscellaneous"
                  ].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" defaultValue={item.dimensions} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  defaultValue={item.weight}
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="material">Material</Label>
                <Input id="material" defaultValue={item.material} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="strength">Strength</Label>
                <Input id="strength" defaultValue={item.strength} />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  defaultChecked={item.is_active}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_deprecated"
                  defaultChecked={item.is_deprecated}
                />
                <Label htmlFor="is_deprecated">Deprecated</Label>
              </div>
            </div>

            {/* Timestamps (Read-only) */}
            <div className="grid grid-cols-2 gap-4 text-muted-foreground text-xs">
              <div>
                <Label>Created At</Label>
                <div>{item.created_at}</div>
              </div>
              <div>
                <Label>Updated At</Label>
                <div>{item.updated_at}</div>
              </div>
            </div>
          </form>
        </div>

        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}




function getNextSkuId(products: Product[]) {
  if (!products || products.length === 0) return 'SKU001'

  const maxId = products
    .map((p) => Number(p.sku_id.replace('SKU', '')))
    .filter((n) => !isNaN(n))
    .sort((a, b) => b - a)[0]

  const nextNumber = maxId + 1
  return `SKU${String(nextNumber).padStart(3, '0')}` // e.g. SKU010
}


