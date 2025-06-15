import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from "@/assets/logo.png" // Assuming this path is correct in your project
import { 
  LayoutDashboard, 
  Box, 
  Factory, 
  Package, 
  FileText, 
  Truck, 
  RefreshCw, 
  Warehouse,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function App() { // Renamed to App as per React code generation guidelines
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/products', icon: <Package size={18} />, label: 'Products' },
    { path: '/production', icon: <Factory size={18} />, label: 'Production' },
    { path: '/materials', icon: <Box size={18} />, label: 'Materials' },
    { path: '/invoices', icon: <FileText size={18} />, label: 'Invoices' },
    { path: '/dispatch', icon: <Truck size={18} />, label: 'Dispatch' },
    { path: '/returns', icon: <RefreshCw size={18} />, label: 'Returns' },
    { path: '/inventory', icon: <Warehouse size={18} />, label: 'Inventory' },
  ];

  const handleLogout = async () => {
    try {
      // In a real application, you would implement your authentication logout logic here.
      // For this example, we'll simulate a logout.
      // await authService.logout(); 
      navigate('/auth'); // Redirect to auth page after logout
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  return (
    // Main container for the entire layout. Uses flexbox for vertical arrangement.
    <div className="flex flex-col h-screen font-inter bg-gray-100 text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-br from-indigo-600 to-purple-600 border-b border-gray-200 shadow-md z-20 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* Added responsive padding */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile Menu Button - visible only on small screens */}
              <button 
                className="md:hidden text-gray-600 hover:text-indigo-600 mr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Logo and Brand Name */}
              <Link to="/" className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-900 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg p-1">
                  {/* Using an inline SVG for the logo as a fallback/alternative to an image asset */}
                  {/* Replace with <img src={logo} alt="Connect Logo" className="w-full h-full object-contain" /> if your logo asset is reliable */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-extrabold text-xl text-white hidden sm:inline-block">Connect</span> {/* Larger and bolder font */}
              </Link>
            </div>

            {/* Primary Navigation (Horizontal) - hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out
                    ${location.pathname === item.path
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' // Active state styling
                      : 'text-white hover:bg-gray-100 hover:text-indigo-600' // Inactive state styling
                    }`}
                >
                  <span className="text-current">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Profile Dropdown */}
            <div className="relative z-30"> {/* Increased z-index to ensure dropdown is above other content */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full py-1 pr-2 pl-1 transition-all duration-200 ease-in-out hover:bg-gray-50"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                  <User size={16} className="text-indigo-600" />
                </div>
                <span className="font-medium text-white hover:text-gray-800 hidden md:inline-block">Admin</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-xl border border-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the dropdown
                  >
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-t-lg"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={16} className="mr-3 text-gray-500" />
                        Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-b-lg"
                      >
                        <LogOut size={16} className="mr-3 text-red-500" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (Dropdown) - visible only on mobile when menu is open */}
        <AnimatePresence>
          {mobileMenuOpen && isMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white shadow-lg border-t border-gray-200"
            >
              <nav className="px-4 pt-3 pb-4 space-y-2"> {/* Adjusted padding and spacing */}
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-4 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out
                      ${location.pathname === item.path
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-current">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="border-t border-gray-200 mt-4 pt-4"> {/* Added top margin and padding */}
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={16} className="mr-4 text-gray-500" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut size={16} className="mr-4 text-red-500" />
                    Logout
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animated-gradient bg-[linear-gradient(135deg,_#ecf0f1,_#fdfbfb,_#d6eaf8,_#e8f8f5,_#fef9e7,_#fbeee6)] bg-[length:400%_400%]">
            <Outlet />
      </main>
    </div>
  );
}
