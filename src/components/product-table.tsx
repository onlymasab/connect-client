import { ProductModel } from "@/models/DataModel";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch"

import { CSS } from "@dnd-kit/utilities";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { IconChevronDown, IconLayoutColumns, IconGripVertical, IconChevronsRight, IconChevronRight, IconChevronLeft, IconChevronsLeft, IconDotsVertical, IconTrendingUp, } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  Row,
  flexRender,
  getPaginationRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFilter,
  ColumnFiltersColumn,
  ColumnFiltersState,
  getExpandedRowModel,
  ExpandedState,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { ArrowUpDown, Minus, Plus } from "lucide-react";
import { productCategories, productMaterials, productTypes } from "@/constants/productOptions";
import { StrengthProgressBar } from "./ui/strength-progress";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Separator } from "./ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { StockProgressBar } from "./ui/stock-progress";


type ProductTableProps = {
  data: ProductModel[];
  tableMeta: TableMeta
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
function DraggableRow({ row }: { row: Row<ProductModel> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.sku_id,
  });

  return (
    <>
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
      
      {row.getIsExpanded() && (
        <TableRow>
          <TableCell colSpan={row.getVisibleCells().length}>
            <div className="p-4 bg-gray-50 rounded-lg">
              {row.original.product_material && row.original.product_material.length > 0 ? (
                row.original.product_material.map((data, index) => (
                  <div key={index} className="text-black">
                    {data.material.name}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 italic">No content</div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}





const columns: ColumnDef<ProductModel>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.sku_id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center w-16">
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
  },{
    header: " ",
    cell: ({ row }) => {
      return row.getCanExpand() ?
        <button
          onClick={row.getToggleExpandedHandler()}
          style={{ cursor: 'pointer' }}
        >
        {row.getIsExpanded() ? <RiArrowUpSLine size={20}/> :  
          <RiArrowDownSLine size={20} />
        }
        </button>
       : '';
    },
  },
  {
    accessorKey: "sku_id",
    header: ({ column }) => (
      <Button
        className="text-[#637381] !px-0 w-24"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <div className="w-full flex flex-row">
          SKU ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      </Button>
    ),
    cell: ({ row }) => <div className="">{row.original.sku_id}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
          <Button 
              className="text-[#637381] !px-0 w-56 text-left"
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div className="w-full flex flex-row align-center items-center">Name <ArrowUpDown className="ml-2 h-4 w-4" /></div>
            
          </Button>
      
    ),
    cell: ({ row }) => 
      <div>
          <TableCellViewer item={row.original} />
          <form
            onSubmit={(e) => {
              e.preventDefault()
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                loading: `Saving ${row.original.dimensions}`,
                success: "Saved successfully!",
                error: "Failed to save.",
              })
            }}
          >
            <Label htmlFor={`${row.original.sku_id}-dimensions`} className="sr-only">
              Dimensions
            </Label>
            <Input
              className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30  px-1 w-full border-transparent bg-transparent text-left shadow-none focus-visible:border dark:bg-transparent"
              defaultValue={row.original.dimensions}
              id={`${row.original.sku_id}-dimensions`}
            />
          </form>
      </div>
    ,
    enableHiding: false,
  }, {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) =>
      <div className="flex flex-col gap-1 w-32">
        <div className="font-medium">{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.original.created_at))}</div>
        <div className="text-gray-500">{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(row.original.created_at)).toLowerCase()}</div>
      </div>
    
  },{
  accessorKey: "category", // 👈 links to row.category
  header: "Category",
  cell: ({ row, table }) => {
    const originalRow = row.original as ProductModel;
    const currentValue = originalRow.category || ""

    const handleCategoryChange = (newCategory: string) => {
      // Update the table row or global state here
      // For example:
      table.getRowModel().rows.forEach((r) => {
        if (r.original.sku_id === originalRow.sku_id) {
          r.original.category = newCategory;
        }
      });
      toast(`Category updated to ${newCategory} for SKU ${originalRow.sku_id}`);
    }

    return (
      <>
        <Label htmlFor={`${originalRow.sku_id}-category`} className="sr-only">
          Category
        </Label>
        <Select
          onValueChange={handleCategoryChange}
          defaultValue={currentValue}
        >
          <SelectTrigger
            className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
            size="sm"
            id={`${originalRow.sku_id}-category`}
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent align="end">
            {productCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    )
  },
},{
  accessorKey: "type", // 👈 links to row.category
  header: "Type",
  cell: ({ row, table }) => {
    const originalRow = row.original as ProductModel;
    const currentValue = originalRow.type|| ""

    const handleTypeChange = (newType: string) => {
      // Update the table row or global state here
      // For example:
      table.getRowModel().rows.forEach((r) => {
        if (r.original.sku_id === originalRow.sku_id) {
          r.original.type = newType;
        }
      });
      toast(`Category updated to ${newType} for SKU ${originalRow.sku_id}`);
    }

    return (
      <>
        <Label htmlFor={`${originalRow.sku_id}-type`} className="sr-only">
          Type
        </Label>
        <Select
          onValueChange={handleTypeChange}
          defaultValue={currentValue}
        >
          <SelectTrigger
            className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
            size="sm"
            id={`${originalRow.sku_id}-type`}
          >
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent align="end">
            {productTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    )
  },
},{
  accessorKey: "price",
  header: () => <div className="w-28 pl-3">Price</div>,
  cell: ({ row }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
          loading: `Saving price ${row.original.price}`,
          success: "Price saved successfully!",
          error: "Failed to save price.",
        })
      }}
    >
      <Label htmlFor={`${row.original.sku_id}-price`} className="sr-only">
        price
      </Label>
      <Input
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-full border-transparent bg-transparent text-left shadow-none focus-visible:border dark:bg-transparent"
        defaultValue={row.original.price}
        id={`${row.original.sku_id}-price`}
        type="number"
        step="0.01"
        min="0"
        
      />
    </form>
  ),
},{
  accessorKey: "weight",
  header: () => <div className="w-28 pl-3">Weight</div>,
  cell: ({ row }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
          loading: `Saving weight ${row.original.weight}`,
          success: "Weight saved successfully!",
          error: "Failed to save weight.",
        })
      }}
    >
      <Label htmlFor={`${row.original.sku_id}-weight`} className="sr-only">
        Weight
      </Label>
      <Input
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-full border-transparent bg-transparent text-left shadow-none focus-visible:border dark:bg-transparent"
        defaultValue={row.original.weight}
        id={`${row.original.sku_id}-weight`}
        type="number"
        step="0.01"
        min="0"
        
      />
    </form>
  ),
},{
  accessorKey: "stock",
  header: ({ column }) => (
    <Button
      className="text-[#637381] !px-0 w-32 text-left align-start"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Stock
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => {
    const stock = row.original.current_stock;
    const minimumRequired = row.original.minimum_req_stock;

    const stockText = stock === 0 ? "Out of stock" : `${stock} in stock`;

    return (
      <div className="w-full">
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {stockText}
        </div>
        <StockProgressBar stock={stock} minimum={minimumRequired} />
      </div>
    );
  },
},{
  accessorKey: "material", // 👈 links to row.category
  header: "Material",
  cell: ({ row, table }) => {
    const originalRow = row.original as ProductModel;
    const currentValue = originalRow.material || ""

    const handleMaterialChange = (newMaterial: string) => {
      // Update the table row or global state here
      // For example:
      table.getRowModel().rows.forEach((r) => {
        if (r.original.sku_id === originalRow.sku_id) {
          r.original.material = newMaterial;
        }
      });
      toast(`Material updated to ${newMaterial} for SKU ${originalRow.sku_id}`);
    }

    return (
      <>
        <Label htmlFor={`${originalRow.sku_id}-type`} className="sr-only">
          Material
        </Label>
        <Select
          onValueChange={handleMaterialChange}
          defaultValue={currentValue}
        >
          <SelectTrigger
            className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
            size="sm"
            id={`${originalRow.sku_id}-type`}
          >
            <SelectValue placeholder="Select Material" />
          </SelectTrigger>
          <SelectContent align="end">
            {productMaterials.map((material) => (
              <SelectItem key={material} value={material}>
                {material}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    )
  },
},{
  accessorKey: "strength",
  header: ({ column }) => (
    <Button
      className="text-[#637381] !px-0 w-32 text-left align-start"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Strength
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => {
    const strength = row.original.strength.toLowerCase()

   

    return (
      <div className="w-full">
        <div className="mb-1 text-xs font-medium">
          {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </div>
        {
          strength === "low" && <StrengthProgressBar strength="Low" />

        }
        {
          strength === "medium" && <StrengthProgressBar strength="Medium" />
        }
        {
          strength === "high" && <StrengthProgressBar strength="High" className="" />
        }
      </div>
    )
  },
}, {
    accessorKey: "is_active",
    header: ({ column }) => (
      <Button
        className="text-[#637381] !px-0"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Active
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const [isActive, setIsActive] = React.useState<boolean>(row.original.is_active)

      const handleToggle = (value: boolean) => {
        setIsActive(value)

        // Optional: update parent table data if meta.updateData exists
        const meta = table.options.meta as TableMeta | undefined;
        if (meta?.updateData) {
          meta.updateData(row.index, "is_active", value)
        }
        // Show toast notification
        toast(`Product ${row.original.sku_id} is now ${value ? "active" : "inactive"}`)
      }

      return (
        <div className="flex items-center justify-center">
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            aria-label="Toggle active status"
          />
        </div>
      )
    },
  },{
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

      const handleEdit = () => {
        // ✅ Replace this with your drawer/modal or form logic
        console.log("Editing product:", product)
        toast(`Editing product ${product.sku_id}`)
      }

      const handleDelete = () => {
        // ✅ Replace this with your delete API call or confirm dialog
        console.log("Deleting product:", product)
        toast.error(`Deleted product ${product.sku_id}`)
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

type TableMeta = {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
};

export function ProductTable({ data: initialData, tableMeta: TableMeta } : ProductTableProps) {

  const data = initialData as ProductModel[];
  const [tab, setTab] = React.useState("all");
  const sortableId = React.useId();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [expanded, setExpanded] = useState<ExpandedState>({})
    // Active count
    const activeCount = React.useMemo(() => {
      return data.filter((p) => p.is_active).length
    }, [data])

    // Inactive count
    const inactiveCount = React.useMemo(() => {
      return data.filter((p) => !p.is_active).length
    }, [data])

    // Filtered list based on tab
    const filteredProducts = React.useMemo(() => {
      if (tab === "active") {
        return data.filter((p) => p.is_active)
      }
      if (tab === "inactive") {
        return data.filter((p) => !p.is_active)
      }
      return data // all
    }, [data, tab])

  const dataIds = React.useMemo(
      () => filteredProducts.map(({ sku_id }) => sku_id) || [],
      [filteredProducts]
  );


  const sensors = useSensors(
      useSensor(MouseSensor, {}),
      useSensor(TouchSensor, {}),
      useSensor(KeyboardSensor, {})
    );

  const table = useReactTable<ProductModel>({
    data : filteredProducts,
    columns,
    state: {
      sorting,
      columnFilters,
       expanded: expanded,

    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        const row = table.getRowModel().rows[rowIndex];
        if (row) {
          const originalRow = row.original as ProductModel;
          (originalRow as any)[columnId] = value;
          // Update your data state here if needed
        }
      },
    },
    //getSubRows: (row) => row.product_material,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getRowId: (row) => row.sku_id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  function handleDragEnd(event: { active: any; over: any; }) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);
      const reorderedProducts = arrayMove(filteredProducts, oldIndex, newIndex);
      console.log("Reordered products:", reorderedProducts);
    }
  }

  return (
     <Tabs value={tab} onValueChange={(value) => setTab(value)} className="w-full flex-col justify-start gap-6">
      {/* Table Top Tabs */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select value={tab} onValueChange={(value) => setTab(value)}>
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="depricated">Depricated</SelectItem>
          </SelectContent>
        </Select>

        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">
            Active <Badge variant="secondary">{activeCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive <Badge variant="secondary">{inactiveCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Input 
            type="text" 
            placeholder="Search product name ...." 
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} 
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            className="border p-2  rounded w-96"
          />
        </div>
        

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
          <Button variant="outline" size="sm" className="hidden @4xl/main:flex" onClick={() => setIsDrawerOpen(true)}>
            <span className="hidden lg:inline">Add Product</span>
            <span className="lg:hidden">New</span>
          </Button>
        </div> 
      </div>

      {/* Drawer for adding new product */}
      {isDrawerOpen && (
        <Drawer direction="right" open onOpenChange={(open) => !open && setIsDrawerOpen(false)}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add Product</DrawerTitle>
              <DrawerDescription>Enter product details.</DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-4 px-4">
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const newProduct = {
                    sku_id: generateNextSkuId(data),
                    name: formData.get("name"),
                    strength: formData.get("strength"),
                    category: formData.get("category"),
                    type: formData.get("type"),
                    dimensions: formData.get("dimension"),
                    weight: parseFloat((formData.get("weight") ?? "0") as string),
                    material: formData.get("material"),
                  };
                  // handleAddProduct(newProduct);
                  setIsDrawerOpen(false);
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="sku_id">SKUID</Label>
                    <Input id="sku_id" value={generateNextSkuId(data)} disabled readOnly />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="strength">Strength</Label>
                    <Select name="strength" defaultValue="">
                      <SelectTrigger id="strength" className="w-full">
                        <SelectValue placeholder="Select strength" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue="" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue="">
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue="">
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="dimension">Dimensions</Label>
                    <Input id="dimension" name="dimension" defaultValue="" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="weight">Weight</Label>
                    <Input type="number" id="weight" name="weight" min={0} step={0.01} defaultValue="" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="material">Material</Label>
                  <Select name="material" defaultValue="">
                    <SelectTrigger id="material" className="w-full">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {productMaterials.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DrawerFooter>
                  <Button type="submit">Save Product</Button>
                  <DrawerClose asChild>
                    <Button variant="outline" type="button" onClick={() => setIsDrawerOpen(false)}>
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      )}

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


 function generateNextSkuId(products : ProductModel[]): string {
  if (!products || products.length === 0) {
    return "SKU0001";
  }

  const lastSku = products
    .map((p) => p.sku_id)
    .filter((id) => /^SKU\d{4}$/.test(id)) // only match SKU format
    .sort()
    .pop(); // get the last one

  const lastNumber = lastSku ? parseInt(lastSku.replace("SKU", ""), 10) : 0;
  const nextNumber = lastNumber + 1;

  return `SKU${nextNumber.toString().padStart(3, "0")}`;
}


 // TableCellViewer component for displaying product details in a drawer
 function TableCellViewer({ item }: { item: ProductModel }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} >
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            Precast poduct details and specifications.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
         
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="sku_id">SKUID</Label>
                  <Input id="sku_id" defaultValue={item.sku_id} disabled readOnly />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="strength">Strength</Label>
                  <Select defaultValue={item.strength}>
                  <SelectTrigger id="strength" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">
                      High
                    </SelectItem>
                    <SelectItem value="Medium">
                      Medium
                    </SelectItem>
                    <SelectItem value="Low">
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" defaultValue={item.name}  />
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={item.category}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                    <SelectContent align="end">
                    {productCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="dimension">Dimensions</Label>
                <Input id="dimension" defaultValue={item.dimensions} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="weight">Weight</Label>
                <Input type="number" id="weight" defaultValue={item.weight} min={0} step={0.01} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="material">Material</Label>
              <Select defaultValue={item.material}>
                <SelectTrigger id="material" className="w-full">
                  <SelectValue placeholder="Select a material" />
                </SelectTrigger>
                <SelectContent>
                  {productMaterials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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