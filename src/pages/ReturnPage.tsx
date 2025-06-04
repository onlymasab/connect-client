import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PackageCheck, PackageX, RotateCw, ArrowLeft, CheckCircle2, Search, Plus, Filter, Download, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type ReturnItem = {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  phone: string;
  product: string;
  sku: string;
  reason: string;
  status: "Requested" | "Processing" | "Approved" | "Rejected" | "Completed";
  date: Date;
  refundAmount: number;
  items: number;
  resolution?: "Refund" | "Replacement" | "Partial Refund" | "Rejected";
  notes?: string;
  purchaseDate: Date;
  orderTotal: number;
};

export default function ReturnPage() {
  // State for filters and data
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [newReturn, setNewReturn] = useState<Partial<ReturnItem>>({
    status: "Requested",
    resolution: "Refund"
  });

  // Sample return data with more fields
  const [returns, setReturns] = useState<ReturnItem[]>([
    {
      id: "RET-001",
      orderId: "ORD-1001",
      customer: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "(555) 123-4567",
      product: "Wireless Headphones Pro",
      sku: "WHP-2023-BLK",
      reason: "Defective product",
      status: "Processing",
      date: new Date(2023, 9, 15),
      refundAmount: 99.99,
      items: 1,
      resolution: "Refund",
      notes: "Right earbud not working",
      purchaseDate: new Date(2023, 8, 10),
      orderTotal: 99.99
    },
    {
      id: "RET-002",
      orderId: "ORD-1002",
      customer: "Sarah Williams",
      email: "sarah.williams@example.com",
      phone: "(555) 234-5678",
      product: "Smart Watch Series 5",
      sku: "SWS-2023-SLV",
      reason: "Wrong size",
      status: "Approved",
      date: new Date(2023, 9, 12),
      refundAmount: 199.99,
      items: 1,
      resolution: "Replacement",
      purchaseDate: new Date(2023, 8, 15),
      orderTotal: 199.99
    },
    {
      id: "RET-003",
      orderId: "ORD-1003",
      customer: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "(555) 345-6789",
      product: "Bluetooth Speaker",
      sku: "BTS-2023-BLK",
      reason: "Changed mind",
      status: "Completed",
      date: new Date(2023, 9, 5),
      refundAmount: 59.99,
      items: 1,
      resolution: "Refund",
      purchaseDate: new Date(2023, 8, 20),
      orderTotal: 59.99
    },
    {
      id: "RET-004",
      orderId: "ORD-1004",
      customer: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "(555) 456-7890",
      product: "Fitness Tracker",
      sku: "FT-2023-BLU",
      reason: "Defective product",
      status: "Requested",
      date: new Date(2023, 9, 18),
      refundAmount: 79.99,
      items: 1,
      purchaseDate: new Date(2023, 9, 1),
      orderTotal: 79.99
    }
  ]);

  // Filtered returns
  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = 
      returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;
    const matchesReason = reasonFilter === "all" || returnItem.reason.toLowerCase().includes(reasonFilter.toLowerCase());
    const matchesDate = !dateFilter || 
      (returnItem.date && 
       format(returnItem.date, "yyyy-MM-dd") === format(dateFilter, "yyyy-MM-dd"));

    return matchesSearch && matchesStatus && matchesReason && matchesDate;
  });

  // Stats calculations
  const todaysReturns = returns.filter(r => 
    format(r.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;

  const processingCount = returns.filter(r => r.status === "Processing").length;
  const approvedCount = returns.filter(r => r.status === "Approved").length;
  const totalRefunds = returns
    .filter(r => r.status === "Completed" || r.status === "Approved")
    .reduce((sum, r) => sum + r.refundAmount, 0);

  // Create new return
  const handleCreateReturn = () => {
    const newId = `RET-${(returns.length + 1001).toString().padStart(4, '0')}`;
    const returnToAdd: ReturnItem = {
      id: newId,
      orderId: newReturn.orderId || `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      customer: newReturn.customer || "New Customer",
      email: newReturn.email || "",
      phone: newReturn.phone || "",
      product: newReturn.product || "New Product",
      sku: newReturn.sku || "SKU-0000",
      reason: newReturn.reason || "Other",
      status: newReturn.status || "Requested",
      date: newReturn.date || new Date(),
      refundAmount: newReturn.refundAmount || 0,
      items: newReturn.items || 1,
      resolution: newReturn.resolution,
      notes: newReturn.notes,
      purchaseDate: newReturn.purchaseDate || new Date(),
      orderTotal: newReturn.orderTotal || 0
    };
    
    setReturns([...returns, returnToAdd]);
    setIsDialogOpen(false);
    setNewReturn({});
  };

  // Update return status
  const updateReturnStatus = (id: string, newStatus: ReturnItem["status"]) => {
    setReturns(returns.map(r => 
      r.id === id ? { ...r, status: newStatus } : r
    ));
  };

  // Update return resolution
  const updateReturnResolution = (id: string, resolution: ReturnItem["resolution"]) => {
    setReturns(returns.map(r => 
      r.id === id ? { ...r, resolution } : r
    ));
  };

  // Update refund amount
  const updateRefundAmount = (id: string, amount: number) => {
    setReturns(returns.map(r => 
      r.id === id ? { ...r, refundAmount: amount } : r
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PackageX className="h-6 w-6" /> Returns Management
          </h1>
          <p className="text-muted-foreground">Process and track product returns</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Return
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Return</DialogTitle>
                <DialogDescription>
                  Enter the details for the product return.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input 
                      id="orderId" 
                      value={newReturn.orderId || ""}
                      onChange={(e) => setNewReturn({...newReturn, orderId: e.target.value})}
                      placeholder="ORD-1001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input 
                      id="customer" 
                      value={newReturn.customer || ""}
                      onChange={(e) => setNewReturn({...newReturn, customer: e.target.value})}
                      placeholder="Customer Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newReturn.email || ""}
                      onChange={(e) => setNewReturn({...newReturn, email: e.target.value})}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={newReturn.phone || ""}
                      onChange={(e) => setNewReturn({...newReturn, phone: e.target.value})}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Input 
                    id="product" 
                    value={newReturn.product || ""}
                    onChange={(e) => setNewReturn({...newReturn, product: e.target.value})}
                    placeholder="Product Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input 
                      id="sku" 
                      value={newReturn.sku || ""}
                      onChange={(e) => setNewReturn({...newReturn, sku: e.target.value})}
                      placeholder="SKU-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="items">Items</Label>
                    <Input 
                      id="items" 
                      type="number"
                      value={newReturn.items || ""}
                      onChange={(e) => setNewReturn({...newReturn, items: parseInt(e.target.value)})}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Select 
                      value={newReturn.reason}
                      onValueChange={(value) => setNewReturn({...newReturn, reason: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Defective product">Defective</SelectItem>
                        <SelectItem value="Wrong size">Wrong Size</SelectItem>
                        <SelectItem value="Wrong item">Wrong Item</SelectItem>
                        <SelectItem value="Changed mind">Changed Mind</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newReturn.status}
                      onValueChange={(value) => setNewReturn({...newReturn, status: value as ReturnItem["status"]})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Requested">Requested</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newReturn.purchaseDate ? format(newReturn.purchaseDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReturn.purchaseDate}
                          onSelect={(date) => setNewReturn({...newReturn, purchaseDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderTotal">Order Total</Label>
                    <Input 
                      id="orderTotal" 
                      type="number"
                      value={newReturn.orderTotal || ""}
                      onChange={(e) => setNewReturn({...newReturn, orderTotal: parseFloat(e.target.value)})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newReturn.notes || ""}
                    onChange={(e) => setNewReturn({...newReturn, notes: e.target.value})}
                    placeholder="Additional notes about the return"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleCreateReturn}>Create Return</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards with Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Returns</CardTitle>
            <RotateCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysReturns}</div>
            <p className="text-xs text-muted-foreground">New requests</p>
            <Progress value={(todaysReturns / 10) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting inspection</p>
            <Progress value={(processingCount / 20) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Ready for refund</p>
            <Progress value={(approvedCount / 15) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRefunds.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
            <Progress value={(totalRefunds / 5000) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Return ID, Order ID, Customer, Product..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Requested">Requested</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="defective">Defective</SelectItem>
                  <SelectItem value="wrong">Wrong Item/Size</SelectItem>
                  <SelectItem value="changed">Changed Mind</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Return Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Return Requests</CardTitle>
              <CardDescription>{filteredReturns.length} returns found</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Refund</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.map((returnItem) => (
                <TableRow key={returnItem.id} className="group">
                  <TableCell className="font-medium">{returnItem.id}</TableCell>
                  <TableCell>{returnItem.orderId}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{returnItem.customer}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{returnItem.product}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{returnItem.reason}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        returnItem.status === "Completed" ? "default" :
                        returnItem.status === "Approved" ? "secondary" :
                        returnItem.status === "Processing" ? "outline" : 
                        returnItem.status === "Rejected" ? "destructive" : "outline"
                      }
                      className="flex items-center gap-1"
                    >
                      {returnItem.status === "Processing" && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                      {returnItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${returnItem.refundAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedReturn(returnItem)}
                          >
                            Process
                          </Button>
                        </DialogTrigger>
                        {selectedReturn && (
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Process Return</DialogTitle>
                              <DialogDescription>
                                {selectedReturn.id} - {selectedReturn.orderId}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label>Customer Information</Label>
                                    <div className="mt-2 space-y-1 text-sm">
                                      <p>{selectedReturn.customer}</p>
                                      <p>{selectedReturn.email}</p>
                                      <p>{selectedReturn.phone}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Return Reason</Label>
                                    <p className="mt-2 text-sm">{selectedReturn.reason}</p>
                                  </div>
                                  
                                  <div>
                                    <Label>Additional Notes</Label>
                                    <Textarea 
                                      value={selectedReturn.notes || ""}
                                      onChange={(e) => {
                                        setReturns(returns.map(r => 
                                          r.id === selectedReturn.id 
                                            ? { ...r, notes: e.target.value } 
                                            : r
                                        ));
                                      }}
                                      placeholder="Add inspection notes or comments..."
                                      className="mt-2"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label>Product Details</Label>
                                    <div className="mt-2 space-y-2">
                                      <p className="font-medium">{selectedReturn.product}</p>
                                      <p className="text-sm">SKU: {selectedReturn.sku}</p>
                                      <p className="text-sm">Purchased: {format(selectedReturn.purchaseDate, "MMM dd, yyyy")}</p>
                                      <p className="text-sm">Order Total: ${selectedReturn.orderTotal.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Resolution</Label>
                                    <Select 
                                      value={selectedReturn.resolution}
                                      onValueChange={(value) => updateReturnResolution(selectedReturn.id, value as ReturnItem["resolution"])}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select resolution" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Refund">Full Refund</SelectItem>
                                        <SelectItem value="Replacement">Replacement</SelectItem>
                                        <SelectItem value="Partial Refund">Partial Refund</SelectItem>
                                        <SelectItem value="Rejected">Reject Return</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label>Refund Amount</Label>
                                    <Input 
                                      type="number" 
                                      value={selectedReturn.refundAmount}
                                      onChange={(e) => updateRefundAmount(selectedReturn.id, parseFloat(e.target.value))}
                                      className="mt-2 w-32" 
                                      min="0" 
                                      step="0.01" 
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label>Status</Label>
                                    <Select 
                                      value={selectedReturn.status}
                                      onValueChange={(value) => updateReturnStatus(selectedReturn.id, value as ReturnItem["status"])}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Requested">Requested</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <Button variant="outline">Request More Info</Button>
                              <Button>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReturns.length}</span> of{' '}
            <span className="font-medium">{returns.length}</span> returns
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}