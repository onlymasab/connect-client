import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Warehouse, Plus, Search, AlertCircle, BarChart2, RefreshCw, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Type definitions
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lowStockThreshold: number;
  lastUpdated: string;
}

interface AIAnalysis {
  riskAssessment: string;
  recommendations: string[];
  salesForecast: string;
  suggestedOrder: { sku: string; name: string; quantity: number; reason: string }[];
}

interface AIReport {
  summary: string;
  insights: string[];
  recommendations: string[];
  seasonalSuggestions: string[];
}

// Mock precast inventory data
const initialInventory: InventoryItem[] = [
  {
    id: "SKU-PC001",
    name: "Precast Concrete Beam 6m",
    category: "Structural",
    stock: 50,
    price: 450.0,
    status: "In Stock",
    lowStockThreshold: 10,
    lastUpdated: new Date().toISOString().split("T")[0],
  },
  {
    id: "SKU-PC002",
    name: "Precast Concrete Slab 4x2m",
    category: "Flooring",
    stock: 5,
    price: 300.0,
    status: "Low Stock",
    lowStockThreshold: 5,
    lastUpdated: new Date().toISOString().split("T")[0],
  },
  {
    id: "SKU-PC003",
    name: "Precast Concrete Column 3m",
    category: "Structural",
    stock: 0,
    price: 600.0,
    status: "Out of Stock",
    lowStockThreshold: 3,
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "SKU-PC004",
    name: "Precast Wall Panel 2x3m",
    category: "Wall",
    stock: 30,
    price: 250.0,
    status: "In Stock",
    lowStockThreshold: 5,
    lastUpdated: new Date().toISOString().split("T")[0],
  },
];

// Initialize Gemini 2.0 Flash (for development only)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCl1nCoBO_xwY4OrKOo8wQ6VpYAoMk1g48");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// AI Service
const AIService = {
  analyzeInventory: async (inventory: InventoryItem[], retries = 3): Promise<AIAnalysis> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
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
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
      } catch (error) {
        if (attempt === retries) {
          console.error("AI Analysis Failed:", error);
          throw new Error("Failed to perform AI analysis. Please try again.");
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error("Unexpected error in analyzeInventory");
  },

  generateReport: async (inventory: InventoryItem[], retries = 3): Promise<AIReport> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
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
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
      } catch (error) {
        if (attempt === retries) {
          console.error("Report Generation Failed:", error);
          throw new Error("Failed to generate AI report. Please try again.");
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error("Unexpected error in generateReport");
  },
};

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventory);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiInsightOpen, setAiInsightOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Structural",
    stock: 0,
    price: 0,
    lowStockThreshold: 5,
  });

  // Calculate inventory metrics
  const totalItems = inventoryItems.length;
  const outOfStockItems = inventoryItems.filter(item => item.status === "Out of Stock").length;
  const lowStockItems = inventoryItems.filter(item => item.status === "Low Stock").length;
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.stock * item.price, 0);

  // Memoized filtered inventory
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "in_stock" && item.status === "In Stock") ||
        (selectedStatus === "low_stock" && item.status === "Low Stock") ||
        (selectedStatus === "out_of_stock" && item.status === "Out of Stock");
      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [inventoryItems, selectedCategory, searchQuery, selectedStatus]);

  // Update item status
  useEffect(() => {
    setInventoryItems(prev =>
      prev.map(item => {
        let status: InventoryItem["status"] = "In Stock";
        if (item.stock === 0) status = "Out of Stock";
        else if (item.stock <= item.lowStockThreshold) status = "Low Stock";
        return { ...item, status };
      })
    );
  }, []);

  // AI Functions
  const analyzeInventory = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await AIService.analyzeInventory(inventoryItems);
      setAiAnalysis(analysis);
      setAiInsightOpen(true);
      toast.success("AI Analysis Complete", {
        description: "Inventory recommendations by Gemini 2.0 Flash",
      });
    } catch (error) {
      toast.error("Analysis Failed", {
        description: (error as Error).message,
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
        description: "AI report by Gemini 2.0 Flash",
      });

      const reportContent = `
        ${report.summary}\n\n
        Key Insights:\n${report.insights.map((i: string) => `• ${i}`).join("\n")}\n\n
        Recommendations:\n${report.recommendations.map((r: string) => `• ${r}`).join("\n")}\n\n
        Seasonal Suggestions:\n${report.seasonalSuggestions?.map((s: string) => `• ${s}`).join("\n") || "N/A"}
      `;
      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Report Generation Failed", {
        description: (error as Error).message,
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Inventory Management Functions
  const handleRestock = (sku: string, quantity: number) => {
    setInventoryItems(prev =>
      prev.map(item => {
        if (item.id === sku) {
          const newStock = item.stock + quantity;
          let status: InventoryItem["status"] = "In Stock";
          if (newStock === 0) status = "Out of Stock";
          else if (newStock <= item.lowStockThreshold) status = "Low Stock";
          return { ...item, stock: newStock, status, lastUpdated: new Date().toISOString().split("T")[0] };
        }
        return item;
      })
    );
    toast.success("Restock Successful", { description: `Added ${quantity} units to ${sku}` });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || newProduct.stock < 0 || newProduct.price <= 0) {
      toast.error("Invalid Product Data", { description: "Fill all fields with valid values" });
      return;
    }

    const newId = `SKU-PC${Math.floor(1000 + Math.random() * 9000)}`;
    const status: InventoryItem["status"] =
      newProduct.stock === 0 ? "Out of Stock" : newProduct.stock <= newProduct.lowStockThreshold ? "Low Stock" : "In Stock";

    setInventoryItems(prev => [
      ...prev,
      {
        id: newId,
        name: newProduct.name,
        category: newProduct.category,
        stock: newProduct.stock,
        price: newProduct.price,
        status,
        lowStockThreshold: newProduct.lowStockThreshold,
        lastUpdated: new Date().toISOString().split("T")[0],
      },
    ]);

    setNewProduct({ name: "", category: "Structural", stock: 0, price: 0, lowStockThreshold: 5 });
    setIsAddingProduct(false);
    toast.success("Product Added", { description: `${newProduct.name} added to inventory` });
  };

  // Animation variants
  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 bg-background text-foreground">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6" /> Precast Inventory Management
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" /> Gemini 2.0 Flash
            </Badge>
          </h1>
          <p className="text-muted-foreground">Track and manage precast concrete inventory</p>
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
          { title: "Total Products", value: totalItems, icon: Package, description: "Across all precast categories", trend: "up", trendValue: "12%" },
          { title: "Out of Stock", value: outOfStockItems, icon: AlertCircle, description: "Needs restocking", trend: outOfStockItems > 0 ? "up" : "down", trendValue: outOfStockItems > 0 ? "Attention needed" : "All good" },
          { title: "Low Stock", value: lowStockItems, icon: AlertCircle, description: "Below threshold", trend: lowStockItems > 2 ? "up" : "down", trendValue: lowStockItems > 2 ? "Monitor closely" : "Within limits" },
          { title: "Total Value", value: `$${totalInventoryValue.toLocaleString()}`, icon: BarChart2, description: "Current inventory value", trend: "up", trendValue: "5.2%" },
        ].map((stat, index) => (
          <motion.div key={stat.title} variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: index * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow bg-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
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
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
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
                <h3 className="text-lg font-semibold text-foreground">Add New Precast Product</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsAddingProduct(false)}>✕</Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Product Name</Label>
                  <Input
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Category</Label>
                    <Select value={newProduct.category} onValueChange={value => setNewProduct({ ...newProduct, category: value })}>
                      <SelectTrigger className="text-foreground">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="Structural" className="text-foreground">Structural</SelectItem>
                        <SelectItem value="Flooring" className="text-foreground">Flooring</SelectItem>
                        <SelectItem value="Wall" className="text-foreground">Wall</SelectItem>
                        <SelectItem value="Custom" className="text-foreground">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground">Low Stock Threshold</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newProduct.lowStockThreshold}
                      onChange={e => setNewProduct({ ...newProduct, lowStockThreshold: parseInt(e.target.value) || 0 })}
                      className="text-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Initial Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                      className="text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Price ($)</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                      className="text-foreground"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
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
            className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Gemini 2.0 Flash Insights
                <Badge variant="outline" className="ml-2">Real-time Analysis</Badge>
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setAiInsightOpen(false)}>Close</Button>
            </div>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-foreground">Gemini 2.0 Flash analyzing...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-background dark:bg-card">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                      <AlertCircle className="h-5 w-5 text-orange-500" /> Risk Assessment
                    </h4>
                    <Badge
                      variant={
                        aiAnalysis.riskAssessment?.toLowerCase().includes("high")
                          ? "destructive"
                          : aiAnalysis.riskAssessment?.toLowerCase().includes("medium")
                          ? "secondary"
                          : "default"
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
                    <div className="border rounded-lg p-4 bg-background dark:bg-card">
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                        <BarChart2 className="h-5 w-5 text-blue-500" /> Sales Forecast
                      </h4>
                      <p className="text-sm text-foreground">{aiAnalysis.salesForecast}</p>
                    </div>
                  )}
                </div>
                <div className="border rounded-lg p-4 bg-background dark:bg-card">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                    <Sparkles className="h-5 w-5 text-purple-500" /> Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {aiAnalysis.recommendations?.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full p-1 flex items-center justify-center">
                          <ChevronDown className="h-3 w-3" />
                        </span>
                        <span className="text-sm text-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {aiAnalysis.suggestedOrder?.length > 0 && (
                  <div className="border rounded-lg p-4 bg-background dark:bg-card">
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                      <Package className="h-5 w-5 text-green-500" /> Suggested Order
                    </h4>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted">
                          <TableRow>
                            <TableHead className="text-foreground">Product</TableHead>
                            <TableHead className="text-foreground">SKU</TableHead>
                            <TableHead className="text-right text-foreground">Current Stock</TableHead>
                            <TableHead className="text-right text-foreground">Suggested Qty</TableHead>
                            <TableHead className="text-foreground">Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aiAnalysis.suggestedOrder.map((item: any) => {
                            const product = inventoryItems.find(p => p.id === item.sku);
                            return (
                              <TableRow key={item.sku}>
                                <TableCell className="text-foreground">{item.name}</TableCell>
                                <TableCell className="text-foreground">{item.sku}</TableCell>
                                <TableCell className="text-right text-foreground">{product?.stock || 0}</TableCell>
                                <TableCell className="text-right text-foreground">{item.quantity}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs text-foreground">
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
                        variant="default"
                        onClick={() => toast.success("Order Created", { description: "Suggested order created" })}
                      >
                        Create Purchase Order
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="bg-background dark:bg-card p-6 rounded-lg border">
                  <Sparkles className="h-10 w-10 mx-auto text-blue-500 mb-3" />
                  <h4 className="font-medium mb-2 text-foreground">Gemini 2.0 Flash Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-4">Real-time inventory insights</p>
                  <Button onClick={analyzeInventory} className="gap-2">
                    <Sparkles className="h-4 w-4" /> Run AI Analysis
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <Card className="shadow-sm bg-background">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-foreground">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, SKU, category..."
                  className="pl-9 text-foreground"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all" className="text-foreground">All Categories</SelectItem>
                  <SelectItem value="structural" className="text-foreground">Structural</SelectItem>
                  <SelectItem value="flooring" className="text-foreground">Flooring</SelectItem>
                  <SelectItem value="wall" className="text-foreground">Wall</SelectItem>
                  <SelectItem value="custom" className="text-foreground">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Stock Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all" className="text-foreground">All Statuses</SelectItem>
                  <SelectItem value="in_stock" className="text-foreground">In Stock</SelectItem>
                  <SelectItem value="low_stock" className="text-foreground">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock" className="text-foreground">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-sm bg-background">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-foreground">Product Inventory</CardTitle>
              <CardDescription>
                Showing {filteredItems.length} of {inventoryItems.length} products
                {selectedCategory !== "all" && ` in ${selectedCategory}`}
                {selectedStatus !== "all" && ` (${selectedStatus.replace("_", " ")})`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={analyzeInventory} disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-[120px] text-foreground">SKU</TableHead>
                  <TableHead className="text-foreground">Product Name</TableHead>
                  <TableHead className="text-foreground">Category</TableHead>
                  <TableHead className="text-right text-foreground">Stock</TableHead>
                  <TableHead className="text-right text-foreground">Price</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-right text-foreground">Last Updated</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{item.id}</TableCell>
                      <TableCell className="text-foreground">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-foreground">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-foreground">{item.stock}</TableCell>
                      <TableCell className="text-right text-foreground">${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === "In Stock" ? "default" : item.status === "Low Stock" ? "secondary" : "destructive"}
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
                      <TableCell className="text-right text-sm text-muted-foreground">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-foreground"
                            onClick={() => handleRestock(item.id, item.lowStockThreshold * 2)}
                          >
                            Quick Restock
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-foreground">Edit</Button>
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
        <Button
          variant="outline"
          onClick={() => {
            const csvContent = [
              "SKU,Name,Category,Stock,Price,Status,Last Updated",
              ...inventoryItems.map(item => `${item.id},"${item.name}",${item.category},${item.stock},${item.price},${item.status},${item.lastUpdated}`).join("\n"),
            ].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `inventory-export-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Export Successful", { description: "Inventory exported to CSV" });
          }}
        >
          Export Inventory (CSV)
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Coming Soon", { description: "Bulk import coming soon" })}>
            Import Inventory
          </Button>
          <Button
            onClick={generateReport}
            disabled={isGeneratingReport}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart2 className="mr-2 h-4 w-4" />}
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
            <Card className="border-destructive bg-destructive/10">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="ml-2 text-lg text-foreground">Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  You have <span className="font-semibold">{lowStockItems} low stock</span> and{" "}
                  <span className="font-semibold">{outOfStockItems} out of stock</span> items.
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
                    className="text-destructive border-destructive hover:bg-destructive/10"
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