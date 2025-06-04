import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, Warehouse, Plus, Search, AlertCircle, BarChart2, RefreshCw } from "lucide-react"

export default function InventoryPage() {
  // Sample inventory data
  const inventoryItems = [
    {
      id: "SKU-1001",
      name: "Wireless Headphones Pro",
      category: "Electronics",
      stock: 42,
      price: 99.99,
      status: "In Stock",
      lowStockThreshold: 10
    },
    {
      id: "SKU-1002",
      name: "Smart Watch Series 5",
      category: "Electronics",
      stock: 8,
      price: 199.99,
      status: "Low Stock",
      lowStockThreshold: 5
    },
    {
      id: "SKU-1003",
      name: "Bluetooth Speaker",
      category: "Electronics",
      stock: 0,
      price: 59.99,
      status: "Out of Stock",
      lowStockThreshold: 3
    },
    {
      id: "SKU-2001",
      name: "Yoga Mat",
      category: "Fitness",
      stock: 25,
      price: 29.99,
      status: "In Stock",
      lowStockThreshold: 5
    },
    {
      id: "SKU-2002",
      name: "Dumbbell Set",
      category: "Fitness",
      stock: 3,
      price: 89.99,
      status: "Low Stock",
      lowStockThreshold: 2
    }
  ]

  // Calculate inventory metrics
  const totalItems = inventoryItems.length
  const outOfStockItems = inventoryItems.filter(item => item.status === "Out of Stock").length
  const lowStockItems = inventoryItems.filter(item => item.status === "Low Stock").length
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.stock * item.price), 0)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6" /> Inventory Management
          </h1>
          <p className="text-muted-foreground">Track and manage your product inventory</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Needs restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Below threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, SKU, category..." className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="home">Home Goods</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stock Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>Current stock levels and product details</CardDescription>
            </div>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.stock}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        item.status === "In Stock" ? "default" :
                        item.status === "Low Stock" ? "secondary" : "destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="mr-2">Edit</Button>
                    <Button variant="ghost" size="sm">Restock</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inventory Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Export Inventory</Button>
        <Button>Generate Stock Report</Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 || outOfStockItems > 0 ? (
        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="ml-2 text-lg">Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {lowStockItems} low stock and {outOfStockItems} out of stock items that need attention.
            </p>
            <Button variant="link" className="text-destructive pl-0 mt-2">
              View items needing restock
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}