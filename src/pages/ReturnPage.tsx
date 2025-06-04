import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PackageCheck, PackageX, RotateCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { format } from "date-fns";

export default function ReturnPage() {
  // Sample return data
  const returns = [
    {
      id: "RET-001",
      orderId: "ORD-1001",
      customer: "Alex Johnson",
      product: "Wireless Headphones Pro",
      reason: "Defective product",
      status: "Processing",
      date: new Date(2023, 9, 15),
      refundAmount: 99.99,
      items: 1
    },
    {
      id: "RET-002",
      orderId: "ORD-1002",
      customer: "Sarah Williams",
      product: "Smart Watch Series 5",
      reason: "Wrong size",
      status: "Approved",
      date: new Date(2023, 9, 12),
      refundAmount: 199.99,
      items: 1
    },
    {
      id: "RET-003",
      orderId: "ORD-1003",
      customer: "Michael Brown",
      product: "Bluetooth Speaker",
      reason: "Changed mind",
      status: "Completed",
      date: new Date(2023, 9, 5),
      refundAmount: 59.99,
      items: 1
    }
  ];

  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PackageX className="h-6 w-6" /> Returns Management
          </h1>
          <p className="text-muted-foreground">Process and track product returns</p>
        </div>
        <Button>
          <RotateCw className="mr-2 h-4 w-4" /> New Return
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input placeholder="Return ID, Order ID, Customer..." />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Return Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="defective">Defective Product</SelectItem>
                  <SelectItem value="wrong">Wrong Item</SelectItem>
                  <SelectItem value="size">Wrong Size</SelectItem>
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
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Returns</CardTitle>
            <RotateCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 awaiting inspection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">5 refunds pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,245.75</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Returns</CardTitle>
          <CardDescription>Last 15 return requests</CardDescription>
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
                <TableHead>Refund Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell className="font-medium">{returnItem.id}</TableCell>
                  <TableCell>{returnItem.orderId}</TableCell>
                  <TableCell>{returnItem.customer}</TableCell>
                  <TableCell>{returnItem.product}</TableCell>
                  <TableCell>{returnItem.reason}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        returnItem.status === "Completed" ? "default" :
                        returnItem.status === "Approved" ? "secondary" :
                        returnItem.status === "Processing" ? "outline" : "destructive"
                      }
                    >
                      {returnItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${returnItem.refundAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Process</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Return Processing Modal would go here */}
      {/* Sample Return Detail Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Process Return</CardTitle>
          <CardDescription>Return ID: RET-001</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Customer Information</Label>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Alex Johnson</p>
                  <p>alex.johnson@example.com</p>
                  <p>(555) 123-4567</p>
                </div>
              </div>
              
              <div>
                <Label>Return Reason</Label>
                <p className="mt-2 text-sm">Defective product - Right earbud not working</p>
              </div>
              
              <div>
                <Label>Additional Notes</Label>
                <Textarea 
                  placeholder="Add inspection notes or comments..."
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Product Details</Label>
                <div className="mt-2 space-y-2">
                  <p className="font-medium">Wireless Headphones Pro</p>
                  <p className="text-sm">SKU: WHP-2023-BLK</p>
                  <p className="text-sm">Purchased: Oct 10, 2023</p>
                  <p className="text-sm">Order Total: $99.99</p>
                </div>
              </div>
              
              <div>
                <Label>Resolution</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent className="mt-2">
                    <SelectItem value="refund">Full Refund</SelectItem>
                    <SelectItem value="replace">Replacement</SelectItem>
                    <SelectItem value="partial">Partial Refund</SelectItem>
                    <SelectItem value="reject">Reject Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Refund Amount</Label>
                <Input 
                  type="number" 
                  defaultValue="99.99" 
                  className="mt-2 w-32" 
                  min="0" 
                  step="0.01" 
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline">Request More Info</Button>
                <Button>Approve Return</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}