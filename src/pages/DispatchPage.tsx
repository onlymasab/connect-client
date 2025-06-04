import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Truck, Package, MapPin, User, ClipboardList, Search, Plus, Filter, Download, Printer, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type Dispatch = {
  id: string;
  orderId: string;
  customer: string;
  destination: string;
  carrier: string;
  status: "Ready" | "In Transit" | "Delivered" | "Delayed" | "Returned";
  estimatedDelivery: Date;
  actualDelivery?: Date;
  items: number;
  weight: string;
  trackingNumber: string;
  shippingMethod: string;
  notes?: string;
};

export default function DispatchPage() {
  // State for filters and data
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDispatch, setNewDispatch] = useState<Partial<Dispatch>>({
    status: "Ready",
    carrier: "FedEx",
    shippingMethod: "Ground"
  });

  // Sample dispatch data with more fields
  const [dispatches, setDispatches] = useState<Dispatch[]>([
    {
      id: "DISP-001",
      orderId: "ORD-1001",
      customer: "Acme Corporation",
      destination: "123 Business Park, San Francisco, CA 94103",
      carrier: "FedEx",
      status: "In Transit",
      estimatedDelivery: new Date(2023, 10, 15),
      actualDelivery: undefined,
      items: 3,
      weight: "12.5 kg",
      trackingNumber: "FX123456789",
      shippingMethod: "Ground"
    },
    {
      id: "DISP-002",
      orderId: "ORD-1002",
      customer: "Globex Inc.",
      destination: "456 Industrial Ave, Chicago, IL 60601",
      carrier: "UPS",
      status: "Ready",
      estimatedDelivery: new Date(2023, 10, 18),
      items: 5,
      weight: "8.2 kg",
      trackingNumber: "UP987654321",
      shippingMethod: "Standard"
    },
    {
      id: "DISP-003",
      orderId: "ORD-1003",
      customer: "Initech LLC",
      destination: "789 Tech Blvd, Austin, TX 78701",
      carrier: "DHL",
      status: "Delivered",
      estimatedDelivery: new Date(2023, 10, 12),
      actualDelivery: new Date(2023, 10, 11),
      items: 2,
      weight: "5.7 kg",
      trackingNumber: "DH112233445",
      shippingMethod: "Express"
    },
    {
      id: "DISP-004",
      orderId: "ORD-1004",
      customer: "Umbrella Corp",
      destination: "100 Laboratory Rd, Raccoon City, RC 12345",
      carrier: "USPS",
      status: "Delayed",
      estimatedDelivery: new Date(2023, 10, 10),
      items: 1,
      weight: "2.1 kg",
      trackingNumber: "US556677889",
      shippingMethod: "Priority",
      notes: "Weather delay - rescheduled delivery"
    }
  ]);

  // Filtered dispatches
  const filteredDispatches = dispatches.filter(dispatch => {
    const matchesSearch = 
      dispatch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || dispatch.status === statusFilter;
    const matchesCarrier = carrierFilter === "all" || dispatch.carrier === carrierFilter;
    const matchesDate = !dateFilter || 
      (dispatch.estimatedDelivery && 
       format(dispatch.estimatedDelivery, "yyyy-MM-dd") === format(dateFilter, "yyyy-MM-dd"));

    return matchesSearch && matchesStatus && matchesCarrier && matchesDate;
  });

  // Stats calculations
  const todaysDispatches = dispatches.filter(d => 
    format(d.estimatedDelivery, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;

  const inTransitCount = dispatches.filter(d => d.status === "In Transit").length;
  const readyCount = dispatches.filter(d => d.status === "Ready").length;
  const delayedCount = dispatches.filter(d => d.status === "Delayed").length;

  // Create new dispatch
  const handleCreateDispatch = () => {
    const newId = `DISP-${(dispatches.length + 1001).toString().padStart(4, '0')}`;
    const dispatchToAdd: Dispatch = {
      id: newId,
      orderId: newDispatch.orderId || `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      customer: newDispatch.customer || "New Customer",
      destination: newDispatch.destination || "123 Main St, Anytown, USA",
      carrier: newDispatch.carrier || "FedEx",
      status: newDispatch.status || "Ready",
      estimatedDelivery: newDispatch.estimatedDelivery || new Date(),
      items: newDispatch.items || 1,
      weight: newDispatch.weight || "1.0 kg",
      trackingNumber: newDispatch.trackingNumber || `${newDispatch.carrier?.slice(0,2)}${Math.floor(Math.random() * 1000000000)}`,
      shippingMethod: newDispatch.shippingMethod || "Ground"
    };
    
    setDispatches([...dispatches, dispatchToAdd]);
    setIsDialogOpen(false);
    setNewDispatch({});
  };

  // Update dispatch status
  const updateDispatchStatus = (id: string, newStatus: Dispatch["status"]) => {
    setDispatches(dispatches.map(d => 
      d.id === id ? { ...d, status: newStatus } : d
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6" /> Dispatch Management
          </h1>
          <p className="text-muted-foreground">Track and manage outgoing shipments</p>
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
                Create Dispatch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Dispatch</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new shipment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input 
                      id="orderId" 
                      value={newDispatch.orderId || ""}
                      onChange={(e) => setNewDispatch({...newDispatch, orderId: e.target.value})}
                      placeholder="ORD-1001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input 
                      id="customer" 
                      value={newDispatch.customer || ""}
                      onChange={(e) => setNewDispatch({...newDispatch, customer: e.target.value})}
                      placeholder="Customer Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input 
                    id="destination" 
                    value={newDispatch.destination || ""}
                    onChange={(e) => setNewDispatch({...newDispatch, destination: e.target.value})}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrier">Carrier</Label>
                    <Select 
                      value={newDispatch.carrier}
                      onValueChange={(value) => setNewDispatch({...newDispatch, carrier: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FedEx">FedEx</SelectItem>
                        <SelectItem value="UPS">UPS</SelectItem>
                        <SelectItem value="DHL">DHL</SelectItem>
                        <SelectItem value="USPS">USPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Shipping Method</Label>
                    <Select 
                      value={newDispatch.shippingMethod}
                      onValueChange={(value) => setNewDispatch({...newDispatch, shippingMethod: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ground">Ground</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newDispatch.status}
                      onValueChange={(value) => setNewDispatch({...newDispatch, status: value as Dispatch["status"]})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ready">Ready</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="items">Items</Label>
                    <Input 
                      id="items" 
                      type="number" 
                      value={newDispatch.items || ""}
                      onChange={(e) => setNewDispatch({...newDispatch, items: parseInt(e.target.value)})}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input 
                      id="weight" 
                      value={newDispatch.weight || ""}
                      onChange={(e) => setNewDispatch({...newDispatch, weight: e.target.value})}
                      placeholder="1.0 kg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Est. Delivery</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newDispatch.estimatedDelivery ? format(newDispatch.estimatedDelivery, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newDispatch.estimatedDelivery}
                          onSelect={(date) => setNewDispatch({...newDispatch, estimatedDelivery: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleCreateDispatch}>Create Dispatch</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards with Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Dispatches</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysDispatches}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
            <Progress value={(todaysDispatches / 10) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitCount}</div>
            <p className="text-xs text-muted-foreground">Active shipments</p>
            <Progress value={(inTransitCount / 20) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting carrier</p>
            <Progress value={(readyCount / 10) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{delayedCount}</div>
            <p className="text-xs text-muted-foreground">Needing attention</p>
            <Progress value={delayedCount > 0 ? 100 : 0} className="h-2 mt-2 bg-red-100" indicatorClassName="bg-red-500" />
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
                  placeholder="Dispatch ID, Order ID, Customer, Tracking..." 
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
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Carrier</Label>
              <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Carriers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Carriers</SelectItem>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="DHL">DHL</SelectItem>
                  <SelectItem value="USPS">USPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dispatch Date</Label>
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

      {/* Dispatch Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Shipment Tracking</CardTitle>
              <CardDescription>{filteredDispatches.length} shipments found</CardDescription>
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
                <TableHead>Dispatch ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDispatches.map((dispatch) => (
                <TableRow key={dispatch.id} className="group">
                  <TableCell className="font-medium">{dispatch.id}</TableCell>
                  <TableCell>{dispatch.orderId}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{dispatch.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {dispatch.carrier} {dispatch.shippingMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        dispatch.status === "Delivered" ? "default" :
                        dispatch.status === "In Transit" ? "secondary" :
                        dispatch.status === "Ready" ? "outline" : "destructive"
                      }
                      className="flex items-center gap-1"
                    >
                      {dispatch.status === "In Transit" && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                      {dispatch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(dispatch.estimatedDelivery, "MMM dd")}</span>
                      {dispatch.actualDelivery && (
                        <span className="text-xs text-muted-foreground">
                          Delivered: {format(dispatch.actualDelivery, "MMM dd")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">View</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Dispatch Details</DialogTitle>
                            <DialogDescription>
                              {dispatch.id} - {dispatch.orderId}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label>Customer</Label>
                                <p>{dispatch.customer}</p>
                              </div>
                              <div className="space-y-1">
                                <Label>Destination</Label>
                                <p>{dispatch.destination}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <Label>Carrier</Label>
                                <p>{dispatch.carrier} {dispatch.shippingMethod}</p>
                              </div>
                              <div className="space-y-1">
                                <Label>Tracking Number</Label>
                                <p>{dispatch.trackingNumber}</p>
                              </div>
                              <div className="space-y-1">
                                <Label>Weight</Label>
                                <p>{dispatch.weight}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <Label>Status</Label>
                                <Select 
                                  value={dispatch.status}
                                  onValueChange={(value) => updateDispatchStatus(dispatch.id, value as Dispatch["status"])}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Ready">Ready</SelectItem>
                                    <SelectItem value="In Transit">In Transit</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Delayed">Delayed</SelectItem>
                                    <SelectItem value="Returned">Returned</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label>Items</Label>
                                <p>{dispatch.items}</p>
                              </div>
                              <div className="space-y-1">
                                <Label>Est. Delivery</Label>
                                <p>{format(dispatch.estimatedDelivery, "PPP")}</p>
                              </div>
                            </div>
                            {dispatch.notes && (
                              <div className="space-y-1">
                                <Label>Notes</Label>
                                <p className="text-sm text-muted-foreground">{dispatch.notes}</p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Track Shipment</Button>
                            <Button>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredDispatches.length}</span> of{' '}
            <span className="font-medium">{dispatches.length}</span> shipments
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