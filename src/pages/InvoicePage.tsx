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

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function InvoicePage() {
  // Form state
  const [from, setFrom] = React.useState({
    name: "Acme Inc.",
    street: "123 Business St.",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    country: "US"
  });

  const [to, setTo] = React.useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    email: "",
    phone: ""
  });

  const [invoiceDetails, setInvoiceDetails] = React.useState({
    number: "INV-001",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    terms: "net30",
    notes: "Payment due within 30 days."
  });

  const [products, setProducts] = React.useState<Product[]>([
    { id: "1", name: "Website Design", price: 1200, quantity: 1 },
    { id: "2", name: "SEO Package", price: 800, quantity: 1 },
    { id: "3", name: "Hosting (Annual)", price: 300, quantity: 1 },
  ]);

  const [period, setPeriod] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 30)),
  });

  const [discount, setDiscount] = React.useState(150);
  const [taxRate, setTaxRate] = React.useState(0.1); // 10%

  // Calculations
  const subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

  // Handlers
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFrom(prev => ({ ...prev, [name]: value }));
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTo(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoiceDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (id: string, field: string, value: string | number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id 
          ? { ...product, [field]: typeof value === 'string' && field !== 'name' ? Number(value) : value } 
          : product
      )
    );
  };

  const addProduct = () => {
    const newId = (products.length + 1).toString();
    setProducts([...products, { id: newId, name: "", price: 0, quantity: 1 }]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to an API
    console.log({
      from,
      to,
      invoiceDetails,
      period,
      products,
      discount,
      taxRate,
      subtotal,
      tax,
      total
    });
    alert("Invoice saved successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* From - Enhanced Address */}
              <div className="space-y-2">
                <Label>From</Label>
                <Input 
                  name="name"
                  value={from.name}
                  onChange={handleFromChange}
                />
                <Input 
                  name="street"
                  value={from.street}
                  onChange={handleFromChange}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    name="city"
                    value={from.city}
                    onChange={handleFromChange}
                    placeholder="City"
                  />
                  <Select 
                    name="state"
                    value={from.state}
                    onValueChange={(value) => handleFromChange({ target: { name: 'state', value } } as any)}
                  >
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
                  <Input 
                    name="zip"
                    value={from.zip}
                    onChange={handleFromChange}
                    placeholder="ZIP Code"
                  />
                  <Select 
                    name="country"
                    value={from.country}
                    onValueChange={(value) => handleFromChange({ target: { name: 'country', value } } as any)}
                  >
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
                <Input 
                  name="name"
                  value={to.name}
                  onChange={handleToChange}
                  placeholder="Client Name"
                  required
                />
                <Input 
                  name="street"
                  value={to.street}
                  onChange={handleToChange}
                  placeholder="Street Address"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    name="city"
                    value={to.city}
                    onChange={handleToChange}
                    placeholder="City"
                    required
                  />
                  <Input 
                    name="state"
                    value={to.state}
                    onChange={handleToChange}
                    placeholder="State/Province"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    name="zip"
                    value={to.zip}
                    onChange={handleToChange}
                    placeholder="ZIP/Postal Code"
                    required
                  />
                  <Input 
                    name="country"
                    value={to.country}
                    onChange={handleToChange}
                    placeholder="Country"
                    required
                  />
                </div>
                <Input 
                  name="email"
                  type="email"
                  value={to.email}
                  onChange={handleToChange}
                  placeholder="Email"
                  required
                />
                <Input 
                  name="phone"
                  type="tel"
                  value={to.phone}
                  onChange={handleToChange}
                  placeholder="Phone"
                />
              </div>
            </div>

            {/* Invoice Details with Period */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Invoice #</Label>
                <Input 
                  name="number"
                  value={invoiceDetails.number}
                  onChange={handleInvoiceDetailsChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input 
                  name="issueDate"
                  type="date"
                  value={invoiceDetails.issueDate}
                  onChange={handleInvoiceDetailsChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  name="dueDate"
                  type="date"
                  value={invoiceDetails.dueDate}
                  onChange={handleInvoiceDetailsChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Service Period</Label>
                <Popover>
                  <PopoverTrigger asChild>
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
                      selected={period}
                      onSelect={(range) => setPeriod(range as DateRange)}
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
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Input 
                          value={product.name}
                          onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={product.quantity}
                          onChange={(e) => handleProductChange(product.id, 'quantity', e.target.value)}
                          className="w-20" 
                          min="1" 
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={product.price}
                          onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                          className="w-32" 
                          min="0" 
                          step="0.01" 
                          required
                        />
                      </TableCell>
                      <TableCell>
                        ${(product.price * product.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                        >
                          ×
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Add Product Button */}
            <Button 
              type="button"
              variant="outline" 
              className="mb-6"
              onClick={addProduct}
            >
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
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 h-8" 
                    min="0" 
                    step="0.01"
                  />
                </div>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span>Tax Rate:</span>
                  <Input 
                    type="number" 
                    value={taxRate * 100}
                    onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                    className="w-20 h-8" 
                    min="0" 
                    step="0.1"
                  />
                  <span>%</span>
                </div>
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
                <Select 
                  value={invoiceDetails.terms}
                  onValueChange={(value) => handleInvoiceDetailsChange({ target: { name: 'terms', value } } as any)}
                >
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
                  name="notes"
                  value={invoiceDetails.notes}
                  onChange={handleInvoiceDetailsChange}
                  placeholder="Thank you for your business!" 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="button" variant="secondary">Preview Invoice</Button>
              <Button type="submit">Send to Client</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}