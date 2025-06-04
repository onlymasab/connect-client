



import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import React from "react";

export default function InvoicePage() {
  // Pre-cast products data
  const products = [
    { id: "1", name: "Website Design", price: 1200, quantity: 1 },
    { id: "2", name: "SEO Package", price: 800, quantity: 1 },
    { id: "3", name: "Hosting (Annual)", price: 300, quantity: 1 },
  ];

  const subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const discount = 150; // Fixed discount amount (could be percentage)
  const tax = (subtotal - discount) * 0.1; // 10% tax after discount
  const total = subtotal - discount + tax;

  // Date range state
  type DateRange = { from: Date | undefined; to: Date | undefined };
  const [period, setPeriod] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 30)),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* From - Enhanced Address */}
            <div className="space-y-2">
              <Label>From</Label>
              <Input defaultValue="Acme Inc." />
              <Input defaultValue="123 Business St." />
              <div className="grid grid-cols-2 gap-2">
                <Input defaultValue="San Francisco" placeholder="City" />
                <Select defaultValue="CA">
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input defaultValue="94103" placeholder="ZIP Code" />
                <Select defaultValue="US">
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* To - Enhanced Address */}
            <div className="space-y-2">
              <Label>Bill To</Label>
              <Input placeholder="Client Name" />
              <Input placeholder="Street Address" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City" />
                <Input placeholder="State/Province" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="ZIP/Postal Code" />
                <Input placeholder="Country" />
              </div>
              <Input placeholder="Email" type="email" />
              <Input placeholder="Phone" type="tel" />
            </div>
          </div>

          {/* Invoice Details with Period */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Invoice #</Label>
              <Input defaultValue="INV-001" />
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Service Period</Label>
              <Popover>
                <PopoverTrigger>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {period.from ? (
                      period.to ? (
                        <>
                          {format(period.from, "MMM dd")} - {format(period.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(period.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Select period</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    onSelect={(range) => setPeriod(range as { from: Date | undefined; to: Date | undefined })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="w-[300px]">Product/Service</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Input defaultValue={product.name} />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        defaultValue={product.quantity} 
                        className="w-20" 
                        min="1" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        defaultValue={product.price} 
                        className="w-32" 
                        min="0" 
                        step="0.01" 
                      />
                    </TableCell>
                    <TableCell>
                      ${(product.price * product.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Product Button */}
          <Button variant="outline" className="mb-6">
            + Add Product/Service
          </Button>

          {/* Summary with Discount */}
          <div className="ml-auto w-full md:w-72 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <span>Discount:</span>
                <Input 
                  type="number" 
                  defaultValue={discount} 
                  className="w-20 h-8" 
                  min="0" 
                  step="0.01"
                />
              </div>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Terms & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select defaultValue="net30">
                <SelectTrigger>
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due">Due on receipt</SelectItem>
                  <SelectItem value="net7">Net 7 days</SelectItem>
                  <SelectItem value="net15">Net 15 days</SelectItem>
                  <SelectItem value="net30">Net 30 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input 
                placeholder="Thank you for your business!" 
                defaultValue="Payment due within 30 days."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-8">
            <Button variant="outline">Save Draft</Button>
            <Button>Preview Invoice</Button>
            <Button variant="secondary">Send to Client</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}