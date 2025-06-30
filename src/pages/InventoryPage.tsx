"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Warehouse, Plus, Search, AlertCircle, BarChart2, RefreshCw, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini 2.0 Flash
const genAI = new GoogleGenerativeAI(process.env.VITE_PUBLIC_GEMINI_API_KEY || "AIzaSyCl1nCoBO_xwY4OrKOo8wQ6VpYAoMk1g48");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// AI Service with real Gemini integration
const AIService = {
  analyzeInventory: async (inventory: any[]) => {
    try {
      const prompt = `
      Analyze this inventory data and provide recommendations:
      ${JSON.stringify(inventory, null, 2)}
      
      Provide:
      1. Risk assessment (High/Medium/Low)
      2. Specific recommendations for restocking
      3. Sales forecast insights based on current stock levels
      4. Suggested order quantities for low/out of stock items
      
      Format your response as JSON with these fields:
      {
        "riskAssessment": "string",
        "recommendations": ["string"],
        "salesForecast": "string",
        "suggestedOrder": [{
          "sku": "string",
          "name": "string",
          "quantity": number,
          "reason": "string"
        }]
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw error;
    }
  },
  
  generateReport: async (inventory: any[]) => {
    try {
      const prompt = `
      Generate a comprehensive inventory analysis report based on this data:
      ${JSON.stringify(inventory, null, 2)}
      
      Include:
      1. Summary of current inventory status
      2. Key insights about product performance
      3. Recommendations for inventory optimization
      4. Seasonal suggestions if applicable
      
      Format your response as JSON with these fields:
      {
        "summary": "string",
        "insights": ["string"],
        "recommendations": ["string"],
        "seasonalSuggestions": ["string"]
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Report Generation Error:", error);
      throw error;
    }
  }
};

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: "SKU-1001",
      name: "Wireless Headphones Pro",
      category: "Electronics",
      stock: 42,
      price: 99.99,
      status: "In Stock",
      lowStockThreshold: 10,
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    {
      id: "SKU-1002",
      name: "Smart Watch Series 5",
      category: "Electronics",
      stock: 8,
      price: 199.99,
      status: "Low Stock",
      lowStockThreshold: 5,
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    {
      id: "SKU-1003",
      name: "Bluetooth Speaker",
      category: "Electronics",
      stock: 0,
      price: 59.99,
      status: "Out of Stock",
      lowStockThreshold: 3,
      lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      id: "SKU-2001",
      name: "Yoga Mat",
      category: "Fitness",
      stock: 25,
      price: 29.99,
      status: "In Stock",
      lowStockThreshold: 5,
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    {
      id: "SKU-2002",
      name: "Dumbbell Set",
      category: "Fitness",
      stock: 3,
      price: 89.99,
      status: "Low Stock",
      lowStockThreshold: 2,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  ]);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiInsightOpen, setAiInsightOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Electronics",
    stock: 0,
    price: 0,
    lowStockThreshold: 5
  });

  // Calculate inventory metrics
  const totalItems = inventoryItems.length;
  const outOfStockItems = inventoryItems.filter(item => item.status === "Out of Stock").length;
  const lowStockItems = inventoryItems.filter(item => item.status === "Low Stock").length;
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.stock * item.price), 0);

  // Filtered inventory
  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "in_stock" && item.status === "In Stock") ||
                         (selectedStatus === "low_stock" && item.status === "Low Stock") ||
                         (selectedStatus === "out_of_stock" && item.status === "Out of Stock");
    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Update item status based on stock levels
  useEffect(() => {
    setInventoryItems(prev => prev.map(item => {
      let status = "In Stock";
      if (item.stock === 0) {
        status = "Out of Stock";
      } else if (item.stock <= item.lowStockThreshold) {
        status = "Low Stock";
      }
      return { ...item, status };
    }));
  }, []);

  // AI Functions
  const analyzeInventory = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await AIService.analyzeInventory(inventoryItems);
      setAiAnalysis(analysis);
      setAiInsightOpen(true);
      toast.success("AI Analysis Complete", {
        description: "Gemini has provided inventory recommendations",
      });
    } catch (error) {
      toast.error("Analysis Failed", {
        description: "Could not complete AI analysis",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await AIService.generateReport(inventoryItems);
      toast.success("Report Generated", {
        description: "AI inventory report is ready",
      });
      
      // Create a downloadable report
      const reportContent = `
        ${report.summary}\n\n
        Key Insights:\n${report.insights.map((i: string) => `• ${i}`).join('\n')}\n\n
        Recommendations:\n${report.recommendations.map((r: string) => `• ${r}`).join('\n')}\n\n
        Seasonal Suggestions:\n${report.seasonalSuggestions?.map((s: string) => `• ${s}`).join('\n') || 'N/A'}
      `;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast.error("Report Generation Failed", {
        description: "Could not generate the report",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Inventory Management Functions
  const handleRestock = (sku: string, quantity: number) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === sku) {
        const newStock = item.stock + quantity;
        let status = item.status;
        if (newStock === 0) {
          status = "Out of Stock";
        } else if (newStock <= item.lowStockThreshold) {
          status = "Low Stock";
        } else {
          status = "In Stock";
        }
        return { 
          ...item, 
          stock: newStock,
          status,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
    toast.success("Restock Successful", {
      description: `Added ${quantity} units to ${sku}`,
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.stock < 0 || newProduct.price <= 0) {
      toast.error("Invalid Product Data", {
        description: "Please fill all required fields with valid values",
      });
      return;
    }

    const newId = `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const status = newProduct.stock === 0 ? "Out of Stock" : 
                  newProduct.stock <= newProduct.lowStockThreshold ? "Low Stock" : "In Stock";

    setInventoryItems(prev => [...prev, {
      id: newId,
      name: newProduct.name,
      category: newProduct.category,
      stock: newProduct.stock,
      price: newProduct.price,
      status,
      lowStockThreshold: newProduct.lowStockThreshold,
      lastUpdated: new Date().toISOString().split('T')[0]
    }]);

    setNewProduct({
      name: "",
      category: "Electronics",
      stock: 0,
      price: 0,
      lowStockThreshold: 5
    });
    setIsAddingProduct(false);
    toast.success("Product Added", {
      description: `${newProduct.name} has been added to inventory`,
    });
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6" /> Inventory Management
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" /> Powered by Gemini Flash
            </Badge>
          </h1>
          <p className="text-muted-foreground">Track and manage your product inventory with AI insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAiInsightOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Insights
          </Button>
          <Button onClick={() => setIsAddingProduct(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: "Total Products", 
            value: totalItems, 
            icon: Package, 
            description: "Across all categories",
            trend: "up",
            trendValue: "12%"
          },
          { 
            title: "Out of Stock", 
            value: outOfStockItems, 
            icon: AlertCircle, 
            description: "Needs restocking",
            trend: outOfStockItems > 0 ? "up" : "down",
            trendValue: outOfStockItems > 0 ? "Attention needed" : "All good"
          },
          { 
            title: "Low Stock", 
            value: lowStockItems, 
            icon: AlertCircle, 
            description: "Below threshold",
            trend: lowStockItems > 2 ? "up" : "down",
            trendValue: lowStockItems > 2 ? "Monitor closely" : "Within limits"
          },
          { 
            title: "Total Value", 
            value: `$${totalInventoryValue.toLocaleString()}`, 
            icon: BarChart2, 
            description: "Current inventory value",
            trend: "up",
            trendValue: "5.2%"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="flex items-center gap-1">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  {stat.trend === "up" ? (
                    <span className="text-xs text-green-500">↑ {stat.trendValue}</span>
                  ) : (
                    <span className="text-xs text-red-500">↓ {stat.trendValue}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsAddingProduct(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background p-6 rounded-lg w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Product</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsAddingProduct(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input 
                    placeholder="Enter product name" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={newProduct.category}
                      onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Low Stock Threshold</Label>
                    <Input 
                      type="number" 
                      min="1"
                      value={newProduct.lowStockThreshold}
                      onChange={(e) => setNewProduct({...newProduct, lowStockThreshold: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Initial Stock</Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Price ($)</Label>
                    <Input 
                      type="number" 
                      min="0.01"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {aiInsightOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Gemini Inventory Insights
                <Badge variant="outline" className="ml-2">
                  Real-time Analysis
                </Badge>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setAiInsightOpen(false)}>
                Close
              </Button>
            </div>
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2">Gemini is analyzing your inventory...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Risk Assessment
                    </h4>
                    <Badge 
                      variant={
                        aiAnalysis.riskAssessment?.toLowerCase().includes("high") ? "destructive" :
                        aiAnalysis.riskAssessment?.toLowerCase().includes("medium") ? "secondary" : "default"
                      }
                      className="text-sm py-1 px-3 rounded-full"
                    >
                      {aiAnalysis.riskAssessment || "Low"} Risk
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {aiAnalysis.riskAssessment?.toLowerCase().includes("high") 
                        ? "Immediate action recommended" 
                        : aiAnalysis.riskAssessment?.toLowerCase().includes("medium") 
                          ? "Monitor closely and plan restocking"
                          : "Inventory levels are healthy"}
                    </p>
                  </div>
                  
                  {aiAnalysis.salesForecast && (
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-blue-500" />
                        Sales Forecast
                      </h4>
                      <p className="text-sm">{aiAnalysis.salesForecast}</p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {aiAnalysis.recommendations?.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full p-1 flex items-center justify-center">
                          <ChevronDown className="h-3 w-3" />
                        </span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {aiAnalysis.suggestedOrder?.length > 0 && (
                  <div className="border rounded-lg p-4 bg-white">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-500" />
                      Suggested Order
                    </h4>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="text-right">Suggested Qty</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aiAnalysis.suggestedOrder.map((item: any) => {
                            const product = inventoryItems.find(p => p.id === item.sku);
                            return (
                              <TableRow key={item.sku}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.sku}</TableCell>
                                <TableCell className="text-right">{product?.stock || 0}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {item.reason || "Restock needed"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          toast.success("Order Created", {
                            description: "Suggested order has been created",
                          });
                        }}
                      >
                        Create Purchase Order
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="bg-white p-6 rounded-lg border">
                  <Sparkles className="h-10 w-10 mx-auto text-blue-500 mb-3" />
                  <h4 className="font-medium mb-2">AI-Powered Inventory Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get real-time recommendations and insights to optimize your inventory management
                  </p>
                  <Button onClick={analyzeInventory} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Run AI Analysis
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, SKU, category..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stock Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Showing {filteredItems.length} of {inventoryItems.length} products
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
                {selectedStatus !== "all" && ` (${selectedStatus.replace('_', ' ')})`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={analyzeInventory} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI Analysis
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[120px]">SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "In Stock" ? "default" :
                            item.status === "Low Stock" ? "secondary" : "destructive"
                          }
                          className="flex items-center gap-1 w-fit"
                        >
                          {item.status === "In Stock" ? (
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                          ) : item.status === "Low Stock" ? (
                            <span className="h-2 w-2 rounded-full bg-yellow-500" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                          )}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {item.lastUpdated}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => handleRestock(item.id, item.lowStockThreshold * 2)}
                          >
                            Quick Restock
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No products found</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCategory("all");
                            setSelectedStatus("all");
                            setSearchQuery("");
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Actions */}
      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={() => {
          const csvContent = [
            "SKU,Name,Category,Stock,Price,Status,Last Updated",
            ...inventoryItems.map(item => 
              `${item.id},"${item.name}",${item.category},${item.stock},${item.price},${item.status},${item.lastUpdated}`
            ).join('\n')
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast.success("Export Successful", {
            description: "Inventory data has been exported to CSV",
          });
        }}>
          Export Inventory (CSV)
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            toast.info("Coming Soon", {
              description: "Bulk import feature will be available soon",
            });
          }}>
            Import Inventory
          </Button>
          <Button 
            onClick={generateReport} 
            disabled={isGeneratingReport}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isGeneratingReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BarChart2 className="mr-2 h-4 w-4" />
            )}
            Generate AI Report
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      <AnimatePresence>
        {(lowStockItems > 0 || outOfStockItems > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Card className="border-destructive bg-red-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="ml-2 text-lg">Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  You have <span className="font-semibold">{lowStockItems} low stock</span> and 
                  <span className="font-semibold"> {outOfStockItems} out of stock</span> items that need attention.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                      setSelectedStatus("out_of_stock");
                    }}
                  >
                    View Out of Stock
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive border-destructive hover:bg-red-100"
                    onClick={() => {
                      setAiInsightOpen(true);
                      analyzeInventory();
                    }}
                  >
                    Get AI Restocking Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}