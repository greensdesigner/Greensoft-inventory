import { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Bell,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  MapPin,
  Printer,
  FileText,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Copy,
  CheckCircle2,
  Trash2,
  PlusCircle,
  QrCode
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  Navigate,
  useNavigate
} from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- REAL AUTH HOOK ---
const useAuth = () => {
  const [user, setUser] = useState<{ email: string; businessName: string; logo?: string; name?: string; phone?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('greensoft_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('greensoft_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('greensoft_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('greensoft_user');
    setUser(null);
  };

  return { user, loading, login, signup, logout };
};

// --- DATA HOOK ---
const useData = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch initial data from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const entities = ['inventory', 'sales', 'suppliers', 'customers', 'expenses'];
        const setters: any = {
          inventory: setInventory,
          sales: setSales,
          suppliers: setSuppliers,
          customers: setCustomers,
          expenses: setExpenses
        };

        for (const entity of entities) {
          const res = await fetch(`/api/${entity}`);
          if (res.ok) {
            const data = await res.json();
            // Handle JSON items for sales
            if (entity === 'sales') {
              const formattedSales = data.map((s: any) => ({
                ...s,
                items: typeof s.items === 'string' ? JSON.parse(s.items) : s.items
              }));
              setSales(formattedSales);
            } else {
              setters[entity](data);
            }
          }
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoaded(true);
      }
    };

    fetchData();
  }, []);

  const saveData = (key: string, data: any) => {
    localStorage.setItem(`greensoft_${key}`, JSON.stringify(data));
  };

  const addItem = async (key: string, item: any, setter: any, currentData: any) => {
    const newItem = { ...item, id: item.id || Date.now().toString() };
    
    try {
      const res = await fetch(`/api/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error('Failed to sync with database');
      
      const newData = [...currentData, newItem];
      setter(newData);
      saveData(key, newData);
    } catch (error) {
      console.error(`Error syncing ${key}:`, error);
      // Fallback to local storage if API fails
      const newData = [...currentData, newItem];
      setter(newData);
      saveData(key, newData);
    }
  };

  return {
    inventory, setInventory: (d: any) => { setInventory(d); saveData('inventory', d); },
    sales, setSales: (d: any) => { setSales(d); saveData('sales', d); },
    suppliers, setSuppliers: (d: any) => { setSuppliers(d); saveData('suppliers', d); },
    customers, setCustomers: (d: any) => { setCustomers(d); saveData('customers', d); },
    expenses, setExpenses: (d: any) => { setExpenses(d); saveData('expenses', d); },
    addInventory: (item: any) => addItem('inventory', item, setInventory, inventory),
    addSale: (item: any) => addItem('sales', item, setSales, sales),
    addSupplier: (item: any) => addItem('suppliers', item, setSuppliers, suppliers),
    addCustomer: (item: any) => addItem('customers', item, setCustomers, customers),
    addExpense: (item: any) => addItem('expenses', item, setExpenses, expenses),
    deleteItem: async (key: string, id: string, setter: any, currentData: any) => {
      try {
        await fetch(`/api/${key}/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error(`Error deleting ${key}:`, error);
      }
      const newData = currentData.filter((item: any) => item.id !== id);
      setter(newData);
      saveData(key, newData);
    },
    editItem: async (key: string, id: string, updatedItem: any, setter: any, currentData: any) => {
      const item = currentData.find((i: any) => i.id === id);
      const fullUpdatedItem = { ...item, ...updatedItem };
      
      try {
        await fetch(`/api/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullUpdatedItem)
        });
      } catch (error) {
        console.error(`Error editing ${key}:`, error);
      }

      const newData = currentData.map((i: any) => i.id === id ? fullUpdatedItem : i);
      setter(newData);
      saveData(key, newData);
    },
    isLoaded
  };
};

// --- REUSABLE UI COMPONENTS ---

const EmptyState = ({ icon: Icon, title, description, action, onAction }: any) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={32} />
    </div>
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="text-slate-500 max-w-xs mt-1 mb-6">{description}</p>
    {action && (
      <button 
        onClick={onAction}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
      >
        <Plus size={20} />
        {action}
      </button>
    )}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col max-h-[90vh]",
            maxWidth
          )}
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Card = ({ children, className }: any) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const PageHeader = ({ title, description, action, onAction }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {description && <p className="text-slate-500">{description}</p>}
    </div>
    {action && (
      <button 
        onClick={onAction}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
      >
        <Plus size={20} />
        {action}
      </button>
    )}
  </div>
);

const Table = ({ headers, children }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
          {headers.map((header: string) => (
            <th key={header} className="px-6 py-4 font-semibold">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {children}
      </tbody>
    </table>
  </div>
);

const SidebarItem = ({ icon: Icon, label, to, active, collapsed }: any) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative",
      active 
        ? "bg-emerald-50 text-emerald-700 font-medium" 
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon size={20} className={cn(active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
    {!collapsed && <span>{label}</span>}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

const Layout = ({ children, user, logout }: any) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subscriptionDays, setSubscriptionDays] = useState<number | null>(null);
  const [subscriptionDay, setSubscriptionDay] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkSubscription = () => {
      const savedStatus = localStorage.getItem('greensoft_subscription');
      if (savedStatus) {
        const status = JSON.parse(savedStatus);
        if (status.active && status.expiryDate) {
          const expiry = new Date(status.expiryDate);
          const now = new Date();
          const diffTime = expiry.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setSubscriptionDays(diffDays);

          if (status.activatedAt) {
            const start = new Date(status.activatedAt);
            const elapsed = now.getTime() - start.getTime();
            const currentDay = Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1;
            setSubscriptionDay(currentDay > 30 ? 30 : currentDay);
          }
        } else {
          setSubscriptionDays(0);
          setSubscriptionDay(null);
        }
      } else {
        setSubscriptionDays(0);
        setSubscriptionDay(null);
      }
    };

    checkSubscription();
  }, [location.pathname]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Package, label: 'Inventory', to: '/inventory' },
    { icon: ShoppingCart, label: 'Sales', to: '/sales' },
    { icon: Truck, label: 'Suppliers', to: '/suppliers' },
    { icon: Users, label: 'Customers', to: '/customers' },
    { icon: Receipt, label: 'Expenses', to: '/expenses' },
    { icon: BarChart3, label: 'Reports', to: '/reports' },
    { icon: ShieldCheck, label: 'Subscription', to: '/subscription' },
    { icon: SettingsIcon, label: 'Settings', to: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {user?.logo ? (
                <img src={user.logo} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                  G
                </div>
              )}
              {!collapsed && <span className="text-xl font-bold text-slate-900">{user?.businessName || 'Greensoft'}</span>}
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                active={location.pathname === item.to}
                collapsed={collapsed}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            {!collapsed && (
              <Link to="/subscription" className="mb-4 block p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscription</span>
                  <ShieldCheck size={12} className={cn(
                    localStorage.getItem('greensoft_subscription') ? "text-emerald-500" : "text-red-500"
                  )} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {localStorage.getItem('greensoft_subscription') ? "Active Plan" : "Inactive"}
                  </span>
                  <ChevronRight size={12} className="text-slate-400" />
                </div>
              </Link>
            )}
            <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-2")}>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.businessName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              )}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {subscriptionDays !== null && subscriptionDays <= 7 && subscriptionDays > 0 && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 text-xs sm:text-sm font-medium z-30">
            <Bell size={16} className="animate-bounce shrink-0" />
            আপনার সাবস্ক্রিপশন শেষ হতে আর মাত্র {subscriptionDays} দিন বাকি আছে। দয়া করে রিনিউ করুন।
            <Link to="/subscription" className="underline font-bold ml-2 whitespace-nowrap">রিনিউ করুন</Link>
          </div>
        )}
        {subscriptionDays !== null && subscriptionDays <= 0 && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center justify-center gap-2 text-red-800 text-xs sm:text-sm font-medium z-30">
            <ShieldCheck size={16} className="shrink-0" />
            আপনার সাবস্ক্রিপশন শেষ হয়ে গেছে। দয়া করে রিনিউ করুন।
            <Link to="/subscription" className="underline font-bold ml-2 whitespace-nowrap">রিনিউ করুন</Link>
          </div>
        )}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg hidden lg:block"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4">
              <h1 className="text-lg font-semibold text-slate-800 capitalize leading-none">
                {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
              </h1>
              {subscriptionDays !== null && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100 w-fit">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                      {subscriptionDays > 0 ? `${subscriptionDays} Days Left` : 'Expired'}
                      {subscriptionDay !== null && ` • Day ${subscriptionDay}/30`}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100 w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-700 whitespace-nowrap">
                      {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-64"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium text-sm">
              {user?.businessName?.[0] || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- PAGES ---

const Dashboard = ({ data }: any) => {
  // Calculate Profit and Loss
  let totalSalesProfit = 0;
  let totalSalesLoss = 0;

  data.sales.forEach((s: any) => {
    if (s.items) {
      s.items.forEach((item: any) => {
        const buyPrice = item.buyPrice || 0;
        const cost = buyPrice * item.quantity;
        const profit = item.total - cost;
        if (profit > 0) totalSalesProfit += profit;
        else if (profit < 0) totalSalesLoss += Math.abs(profit);
      });
    } else {
      const buyPrice = s.buyPrice || 0;
      const cost = buyPrice * s.quantity;
      const profit = s.total - cost;
      if (profit > 0) totalSalesProfit += profit;
      else if (profit < 0) totalSalesLoss += Math.abs(profit);
    }
  });

  const totalExpenses = data.expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  const rawProfit = totalSalesProfit;
  const rawLoss = totalSalesLoss + totalExpenses;
  
  const currentProfit = rawProfit >= rawLoss ? rawProfit - rawLoss : 0;
  const currentLoss = rawLoss > rawProfit ? rawLoss - rawProfit : 0;

  // Calculate Daily Profit and Loss for Chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const dailyStats = last7Days.map(date => {
    let dailyProfit = 0;
    let dailyLoss = 0;

    data.sales.filter((s: any) => s.date === date).forEach((s: any) => {
      if (s.items) {
        s.items.forEach((item: any) => {
          const buyPrice = item.buyPrice || 0;
          const cost = buyPrice * item.quantity;
          const profit = item.total - cost;
          if (profit > 0) dailyProfit += profit;
          else if (profit < 0) dailyLoss += Math.abs(profit);
        });
      } else {
        const buyPrice = s.buyPrice || 0;
        const cost = buyPrice * s.quantity;
        const profit = s.total - cost;
        if (profit > 0) dailyProfit += profit;
        else if (profit < 0) dailyLoss += Math.abs(profit);
      }
    });

    const dailyExpenses = data.expenses
      .filter((e: any) => e.date === date)
      .reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

    return {
      date: date.split('-').slice(1).join('/'),
      profit: parseFloat(dailyProfit.toFixed(2)),
      loss: parseFloat((dailyLoss + dailyExpenses).toFixed(2)),
      net: parseFloat((dailyProfit - (dailyLoss + dailyExpenses)).toFixed(2)),
    };
  });

  const stats = [
    { 
      label: 'Total Revenue', 
      value: `$${data.sales.reduce((acc: number, s: any) => acc + (s.total || 0), 0).toLocaleString()}`, 
      change: '0%', 
      icon: DollarSign, 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Current Profit', 
      value: `$${currentProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: 'Profit', 
      icon: TrendingUp, 
      color: 'bg-emerald-600' 
    },
    { 
      label: 'Current Loss', 
      value: `$${currentLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: 'Loss', 
      icon: ArrowDownRight, 
      color: 'bg-red-500' 
    },
    { 
      label: 'Total Sales', 
      value: data.sales.length.toString(), 
      change: '0%', 
      icon: ShoppingCart, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Inventory Items', 
      value: data.inventory.length.toString(), 
      change: '0%', 
      icon: Package, 
      color: 'bg-orange-500' 
    },
    { 
      label: 'Active Customers', 
      value: data.customers.length.toString(), 
      change: '0%', 
      icon: Users, 
      color: 'bg-purple-500' 
    },
  ];

  const lowStockItems = data.inventory.filter((item: any) => item.quantity <= (item.minStock || 5));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl text-white", stat.color)}>
                <stat.icon size={24} />
              </div>
              {stat.label === 'Current Profit' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Income</span>}
              {stat.label === 'Current Loss' && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Expense</span>}
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Profit vs Loss Trend</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-500">Profit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-500">Loss</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-slate-500">Net Profit</span>
                </div>
              </div>
            </div>
            <div className="p-6 h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorLoss)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Recent Sales</h3>
              <Link to="/sales" className="text-sm text-emerald-600 font-medium hover:underline">View all</Link>
            </div>
            {data.sales.length > 0 ? (
              <Table headers={['Customer', 'Date', 'Sales Price', 'Status']}>
                {data.sales.slice(-5).reverse().map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.customerName}</div>
                      <div className="text-xs text-slate-500">INV-{item.id.slice(-4)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">${item.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">Completed</span>
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <EmptyState 
                icon={ShoppingCart} 
                title="No sales yet" 
                description="Your recent transactions will appear here once you start selling."
              />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6">Low Stock Alerts</h3>
            {lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-orange-700 font-medium">Only {item.quantity} units left</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">All stock levels are healthy.</p>
              </div>
            )}
            <Link to="/inventory" className="block w-full mt-6 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors">
              View Inventory
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

const QRScanner = ({ onScan, onClose }: { onScan: (data: string) => void, onClose: () => void }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scanner.render(onScan, (error) => {
      // console.warn(error);
    });

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full z-10"
        >
          <X size={20} />
        </button>
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Scan Product QR Code</h3>
          <div id="qr-reader" className="w-full"></div>
          <p className="mt-4 text-sm text-slate-500 text-center">
            Point your camera at a product QR code to scan.
          </p>
        </div>
      </div>
    </div>
  );
};

const Inventory = ({ data }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRItem, setSelectedQRItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '', price: '', minStock: '5' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      data.editItem('inventory', editingItem.id, {
        ...newItem,
        quantity: parseInt(newItem.quantity),
        price: parseFloat(newItem.price),
        minStock: parseInt(newItem.minStock)
      }, data.setInventory, data.inventory);
    } else {
      data.addInventory({
        ...newItem,
        quantity: parseInt(newItem.quantity),
        price: parseFloat(newItem.price),
        minStock: parseInt(newItem.minStock)
      });
    }
    setNewItem({ name: '', category: '', quantity: '', price: '', minStock: '5' });
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      minStock: item.minStock.toString()
    });
    setIsModalOpen(true);
  };

  const openQR = (item: any) => {
    setSelectedQRItem(item);
    setIsQRModalOpen(true);
  };

  const categories = ['All', ...new Set(data.inventory.map((item: any) => item.category))];

  const filteredInventory = data.inventory.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Management" 
        description="Track and manage your stock levels." 
        action="Add Item" 
        onAction={() => { setEditingItem(null); setNewItem({ name: '', category: '', quantity: '', price: '', minStock: '5' }); setIsModalOpen(true); }}
      />
      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {categories.map(cat => (
                <option key={cat as string} value={cat as string}>{cat as string}</option>
              ))}
            </select>
          </div>
        </div>
        {filteredInventory.length > 0 ? (
          <Table headers={['Item Details', 'Category', 'Stock', 'Buy Price', 'QR Code', 'Actions']}>
            {filteredInventory.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">SKU-{item.id.slice(-4)}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-semibold",
                      item.quantity <= item.minStock ? "text-orange-600" : "text-slate-900"
                    )}>{item.quantity}</span>
                    <span className="text-xs text-slate-400">units</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => openQR(item)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="View QR Code"
                  >
                    <QrCode size={18} className="text-slate-600" />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => openEdit(item)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => data.deleteItem('inventory', item.id, data.setInventory, data.inventory)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState 
            icon={Package} 
            title={searchQuery || filterCategory !== 'All' ? "No matching items" : "Your inventory is empty"} 
            description={searchQuery || filterCategory !== 'All' ? "Try adjusting your search or filters." : "Add your first product to start tracking your stock levels."}
            action={searchQuery || filterCategory !== 'All' ? null : "Add First Item"}
            onAction={() => { setEditingItem(null); setIsModalOpen(true); }}
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Item" : "Add New Item"}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input 
              type="text" required 
              value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input 
              type="text" required 
              value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input 
                type="number" required 
                value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Buy Price</label>
              <input 
                type="number" step="0.01" required 
                value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all mt-4">
            {editingItem ? "Update Product" : "Save Product"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="Product QR Code">
        {selectedQRItem && (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
              <QRCodeCanvas 
                value={selectedQRItem.id} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">{selectedQRItem.name}</h3>
              <p className="text-sm text-slate-500">SKU: SKU-{selectedQRItem.id.slice(-4)}</p>
              <p className="text-lg font-bold text-emerald-600 mt-2">${selectedQRItem.price.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              <Printer size={18} /> Print Label
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

const InvoiceContent = ({ sale, user, contentRef }: { sale: any, user: any, contentRef?: any }) => (
  <div 
    ref={contentRef} 
    className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm invoice-content" 
    style={{ 
      backgroundColor: '#ffffff', 
      color: '#0f172a',
      fontFamily: 'Inter, sans-serif',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto'
    }}
  >
    <div className="flex justify-between items-start mb-8">
      <div>
        <h2 className="text-3xl font-bold mb-1" style={{ color: '#0f172a', margin: 0 }}>INVOICE</h2>
        <p className="font-medium" style={{ color: '#64748b', margin: 0 }}>#INV-{sale.id.slice(-4)}</p>
      </div>
      <div className="text-right">
        <h3 className="text-xl font-bold" style={{ color: '#059669', margin: 0 }}>{user?.businessName || 'Greensoft'}</h3>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8 mb-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Bill To:</h4>
        <div className="font-bold text-lg" style={{ color: '#0f172a', fontSize: '1.125rem' }}>{sale.customerName}</div>
        {sale.customerPhone && <div style={{ color: '#475569' }}>{sale.customerPhone}</div>}
        {sale.customerEmail && <div style={{ color: '#475569' }}>{sale.customerEmail}</div>}
        {sale.customerAddress && <div className="italic mt-1" style={{ color: '#475569' }}>{sale.customerAddress}</div>}
      </div>
      <div className="text-right">
        <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Invoice Details:</h4>
        <div style={{ color: '#475569' }}><span className="font-medium">Date:</span> {sale.date}</div>
        <div style={{ color: '#475569' }}><span className="font-medium">Status:</span> <span style={{ color: '#059669', fontWeight: 'bold' }}>PAID</span></div>
      </div>
    </div>

    <div className="py-4 mb-8" style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
      <table className="w-full text-left" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            <th style={{ paddingBottom: '1rem', textAlign: 'left' }}>Description</th>
            <th style={{ paddingBottom: '1rem', textAlign: 'center' }}>Qty</th>
            <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Price</th>
            <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items ? (
            sale.items.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: idx !== sale.items.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <td style={{ padding: '1rem 0' }}>
                  <div className="font-bold" style={{ color: '#0f172a' }}>{item.productName}</div>
                  <div className="text-xs" style={{ color: '#64748b', fontSize: '0.75rem' }}>Category: {item.productCategory}</div>
                  {item.serialNumber && <div className="text-xs font-mono" style={{ color: '#059669', fontSize: '0.75rem' }}>SN: {item.serialNumber}</div>}
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'center', color: '#334155' }}>{item.quantity}</td>
                <td style={{ padding: '1rem 0', textAlign: 'right', color: '#334155' }}>${(item.total / item.quantity).toFixed(2)}</td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>${item.total.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={{ padding: '1rem 0' }}>
                <div className="font-bold" style={{ color: '#0f172a' }}>{sale.productName}</div>
                <div className="text-xs" style={{ color: '#64748b', fontSize: '0.75rem' }}>Category: {sale.productCategory}</div>
                {sale.serialNumber && <div className="text-xs font-mono" style={{ color: '#059669', fontSize: '0.75rem' }}>SN: {sale.serialNumber}</div>}
              </td>
              <td style={{ padding: '1rem 0', textAlign: 'center', color: '#334155' }}>{sale.quantity}</td>
              <td style={{ padding: '1rem 0', textAlign: 'right', color: '#334155' }}>${(sale.total / sale.quantity).toFixed(2)}</td>
              <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>${sale.total.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '250px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: '0.5rem' }}>
          <span>Subtotal</span>
          <span>${sale.total.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: '0.5rem' }}>
          <span>Tax (0%)</span>
          <span>$0.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
          <span>Total</span>
          <span style={{ color: '#059669' }}>${sale.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="mt-16" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '180px', borderBottom: '1px solid #cbd5e1', marginBottom: '0.5rem' }}></div>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Customer Signature</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '180px', borderBottom: '1px solid #cbd5e1', marginBottom: '0.5rem' }}></div>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Seller Signature</p>
      </div>
    </div>

    <div className="mt-12 text-center" style={{ marginTop: '3rem', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', padding: '1rem 2rem', backgroundColor: '#f8fafc', borderRadius: '1rem' }}>
        <p className="font-medium" style={{ color: '#475569', margin: 0 }}>Thank you for your business!</p>
        <p className="text-[10px] uppercase tracking-tighter" style={{ color: '#94a3b8', fontSize: '0.625rem', marginTop: '0.25rem', margin: 0 }}>Generated by {user?.businessName || 'Greensoft'}</p>
      </div>
    </div>
  </div>
);

const InvoiceModal = ({ isOpen, onClose, sale }: { isOpen: boolean, onClose: () => void, sale: any }) => {
  const { user } = useAuth();
  const componentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = () => {
    if (!componentRef.current) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const content = componentRef.current.innerHTML;
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(style => style.outerHTML)
        .join('\n');

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice-${sale?.id?.slice(-4) || '0000'}</title>
              ${styles}
              <style>
                body { background: white !important; margin: 0; padding: 20px; color: #0f172a !important; }
                .no-print { display: none !important; }
                .invoice-content { border: none !important; box-shadow: none !important; width: 100% !important; max-width: none !important; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              </style>
            </head>
            <body>
              ${content}
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 800);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback for blocked popups
        const printContainer = document.createElement('div');
        printContainer.id = 'print-mode-container';
        printContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:999999;padding:40px;overflow:auto;';
        
        const clone = componentRef.current.cloneNode(true) as HTMLElement;
        printContainer.appendChild(clone);
        document.body.appendChild(printContainer);
        document.body.classList.add('is-printing');

        setTimeout(() => {
          window.print();
          document.body.removeChild(printContainer);
          document.body.classList.remove('is-printing');
        }, 1000);
      }
    } catch (err) {
      console.error("Print error:", err);
      setError("প্রিন্ট করতে সমস্যা হচ্ছে। অনুগ্রহ করে ব্রাউজারের প্রিন্ট অপশন ব্যবহার করুন।");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!componentRef.current || isGenerating) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const element = componentRef.current;
      
      // @ts-ignore
      const h2pdf = window.html2pdf || html2pdf;
      
      if (!h2pdf) {
        throw new Error("PDF library not loaded");
      }

      const opt = {
        margin: 10,
        filename: `Invoice-${sale?.id?.slice(-4) || '0000'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 3, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff',
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await h2pdf().from(element).set(opt).output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${sale?.id?.slice(-4) || '0000'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      console.error('PDF Generation Error:', err);
      
      // Fallback to manual capture
      try {
        const canvas = await html2canvas(componentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          allowTaint: true
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
        
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${sale?.id?.slice(-4) || '0000'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (fallbackErr) {
        console.error('Fallback PDF Error:', fallbackErr);
        setError('PDF ডাউনলোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে প্রিন্ট বাটনটি ব্যবহার করে "Save as PDF" সিলেক্ট করুন।');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const openInNewTab = () => {
    if (!componentRef.current) return;
    
    const content = componentRef.current.innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Invoice-${sale?.id?.slice(-4) || '0000'}</title>
            ${styles}
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            <style>
              body { background: white !important; margin: 0; padding: 40px; color: #0f172a !important; font-family: sans-serif; }
              .no-print-window { display: none !important; }
              .invoice-content { border: none !important; box-shadow: none !important; width: 100% !important; max-width: 800px !important; margin: 0 auto !important; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @media print {
                body { padding: 0; }
                .invoice-content { max-width: none !important; }
                .no-print-window-ui { display: none !important; }
              }
              .btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-right: 10px; transition: opacity 0.2s; }
              .btn:hover { opacity: 0.9; }
              .btn-print { background: #059669; color: white; }
              .btn-pdf { background: #0284c7; color: white; }
              .btn-img { background: #7c3aed; color: white; }
              .btn-close { background: #64748b; color: white; }
            </style>
          </head>
          <body>
            <div class="no-print-window-ui" style="margin-bottom: 30px; text-align: center; padding: 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100;">
              <button onclick="window.print()" class="btn btn-print">Print Invoice</button>
              <button id="download-pdf-btn" class="btn btn-pdf">Download PDF</button>
              <button id="download-img-btn" class="btn btn-img">Download Image</button>
              <button onclick="window.close()" class="btn btn-close">Close Tab</button>
            </div>
            <div id="invoice-to-download">
              ${content}
            </div>
            <script>
              document.getElementById('download-pdf-btn').onclick = function() {
                const element = document.getElementById('invoice-to-download');
                const opt = {
                  margin: 10,
                  filename: 'Invoice-${sale?.id?.slice(-4) || '0000'}.pdf',
                  image: { type: 'jpeg', quality: 1.0 },
                  html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff' },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().from(element).set(opt).save();
              };

              document.getElementById('download-img-btn').onclick = function() {
                const element = document.getElementById('invoice-to-download');
                html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
                  const link = document.createElement('a');
                  link.href = canvas.toDataURL('image/png');
                  link.download = 'Invoice-${sale?.id?.slice(-4) || '0000'}.png';
                  link.click();
                });
              };
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      alert("পপ-আপ ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অ্যালাউ করুন।");
    }
  };

  const downloadImage = async () => {
    if (!componentRef.current || isGenerating) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const canvas = await html2canvas(componentRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${sale?.id?.slice(-4) || '0000'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Image Generation Error:', err);
      setError('ইমেজ ডাউনলোড করতে সমস্যা হচ্ছে।');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!sale) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sales Invoice" maxWidth="max-w-3xl">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6 no-print">
          <button 
            onClick={openInNewTab}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-xl shadow-emerald-100 scale-105 active:scale-100"
          >
            <Printer size={24} /> Open in New Tab & Print/Download
          </button>
        </div>

        <InvoiceContent sale={sale} user={user} contentRef={componentRef} />
      </div>
    </Modal>
  );
};

const Sales = ({ data }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [newSale, setNewSale] = useState({ 
    customerName: '', 
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    items: [{ 
      productId: '', 
      productCategory: '', 
      serialNumber: '', 
      quantity: '1', 
      total: '0',
      buyPrice: 0,
      productName: ''
    }],
    date: new Date().toISOString().split('T')[0] 
  });

  const handleScan = (decodedText: string) => {
    const product = data.inventory.find((p: any) => p.id === decodedText);
    if (product) {
      if (product.quantity <= 0) {
        alert("Product out of stock!");
        return;
      }
      
      const newItemEntry = {
        productId: product.id,
        productCategory: product.category,
        productName: product.name,
        serialNumber: '',
        quantity: '1',
        buyPrice: product.price,
        total: product.price.toString()
      };
      
      const lastItem = newSale.items[newSale.items.length - 1];
      if (!lastItem.productId) {
        const newItems = [...newSale.items];
        newItems[newSale.items.length - 1] = newItemEntry;
        setNewSale({ ...newSale, items: newItems });
      } else {
        setNewSale({ ...newSale, items: [...newSale.items, newItemEntry] });
      }
      
      setIsScannerOpen(false);
    }
  };

  const categories = ['All', ...new Set(data.inventory.map((item: any) => item.category))];

  const addItem = () => {
    setNewSale({
      ...newSale,
      items: [...newSale.items, { 
        productId: '', 
        productCategory: '', 
        serialNumber: '', 
        quantity: '1', 
        total: '0',
        buyPrice: 0,
        productName: ''
      }]
    });
  };

  const removeItem = (index: number) => {
    if (newSale.items.length > 1) {
      const newItems = [...newSale.items];
      newItems.splice(index, 1);
      setNewSale({ ...newSale, items: newItems });
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...newSale.items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      const product = data.inventory.find((p: any) => p.id === value);
      if (product) {
        item.productName = product.name;
        item.productCategory = product.category;
        item.buyPrice = product.price;
        item.total = (product.price * (parseInt(item.quantity) || 0)).toString();
      }
    } else if (field === 'quantity') {
      const product = data.inventory.find((p: any) => p.id === item.productId);
      if (product) {
        // Only auto-update total if it was 0 or matches previous calculation
        const prevQty = parseInt(newItems[index].quantity) || 0;
        const prevTotal = parseFloat(newItems[index].total) || 0;
        if (prevTotal === 0 || prevTotal === product.price * prevQty) {
          item.total = (product.price * (parseInt(value) || 0)).toString();
        }
      }
    }

    newItems[index] = item;
    setNewSale({ ...newSale, items: newItems });
  };

  const totalAmount = newSale.items.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    for (const item of newSale.items) {
      if (!item.productId) {
        alert('Please select a product for all items');
        return;
      }
      const product = data.inventory.find((p: any) => p.id === item.productId);
      const qty = parseInt(item.quantity);
      if (qty > product.quantity) {
        alert(`Not enough stock for ${product.name}. Only ${product.quantity} units available.`);
        return;
      }
    }

    // 1. Add Sale
    data.addSale({
      customerName: newSale.customerName,
      customerPhone: newSale.customerPhone,
      customerEmail: newSale.customerEmail,
      customerAddress: newSale.customerAddress,
      items: newSale.items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity),
        total: parseFloat(item.total)
      })),
      total: totalAmount,
      date: newSale.date
    });

    // 2. Update Inventory for each item
    newSale.items.forEach(item => {
      const product = data.inventory.find((p: any) => p.id === item.productId);
      data.editItem('inventory', item.productId, {
        quantity: product.quantity - parseInt(item.quantity)
      }, data.setInventory, data.inventory);
    });

    // 3. Update/Add Customer
    const existingCustomer = data.customers.find((c: any) => 
      c.name.toLowerCase() === newSale.customerName.toLowerCase() || 
      (newSale.customerPhone && c.phone === newSale.customerPhone)
    );

    if (existingCustomer) {
      data.editItem('customers', existingCustomer.id, {
        orders: existingCustomer.orders + 1,
        spent: existingCustomer.spent + totalAmount,
        phone: existingCustomer.phone || newSale.customerPhone,
        email: existingCustomer.email || newSale.customerEmail,
        address: existingCustomer.address || newSale.customerAddress
      }, data.setCustomers, data.customers);
    } else {
      data.addCustomer({
        name: newSale.customerName,
        email: newSale.customerEmail,
        phone: newSale.customerPhone,
        address: newSale.customerAddress,
        orders: 1,
        spent: totalAmount
      });
    }

    setNewSale({ 
      customerName: '', 
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      items: [{ 
        productId: '', 
        productCategory: '', 
        serialNumber: '', 
        quantity: '1', 
        total: '0',
        buyPrice: 0,
        productName: ''
      }],
      date: new Date().toISOString().split('T')[0] 
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales History" 
        description="View and manage your business transactions." 
        action="New Sale" 
        onAction={() => setIsModalOpen(true)}
      />
      <Card>
        {data.sales.length > 0 ? (
          <Table headers={['Invoice', 'Customer', 'Items', 'Date', 'Total Amount', 'Actions']}>
            {data.sales.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">#INV-{item.id.slice(-4)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium">{item.customerName}</div>
                  {item.customerPhone && <div className="text-xs text-slate-400">{item.customerPhone}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.items ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-emerald-600">{item.items.length} Products</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {item.items.map((i: any) => i.productName).join(', ')}
                      </span>
                    </div>
                  ) : (
                    <div className="font-medium">{item.productName}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">${item.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setSelectedSale(item);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                    >
                      <FileText size={14} /> Invoice
                    </button>
                    <button 
                      onClick={() => data.deleteItem('sales', item.id, data.setSales, data.sales)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState 
            icon={ShoppingCart} 
            title="No sales recorded" 
            description="Track your business revenue by recording your first sale."
            action="Add New Sale"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Sale">
        <form onSubmit={handleAdd} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Customer Info Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name</label>
                <input 
                  type="text" required 
                  value={newSale.customerName} onChange={e => setNewSale({...newSale, customerName: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newSale.customerPhone} onChange={e => setNewSale({...newSale, customerPhone: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                  placeholder="017XXXXXXXX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
                <input 
                  type="text" 
                  value={newSale.customerAddress} onChange={e => setNewSale({...newSale, customerAddress: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                  placeholder="Customer address"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sale Items</h4>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <QrCode size={14} /> Scan QR
                </button>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PlusCircle size={14} /> Add Item
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {newSale.items.map((item, index) => (
                <div key={index} className="p-4 border border-slate-100 rounded-2xl relative group bg-white shadow-sm">
                  {newSale.items.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeItem(index)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-50 text-red-500 rounded-full border border-red-100 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                      <select 
                        required
                        value={item.productCategory}
                        onChange={(e) => updateItem(index, 'productCategory', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        <option value="">Select Category</option>
                        {categories.filter(c => c !== 'All').map(cat => (
                          <option key={cat as string} value={cat as string}>{cat as string}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product</label>
                      <select 
                        required
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        <option value="">Select Product</option>
                        {data.inventory
                          .filter((p: any) => !item.productCategory || p.category === item.productCategory)
                          .map((p: any) => (
                            <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                              {p.name} (${p.price.toFixed(2)}) - Stock: {p.quantity}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                      <input 
                        type="number" required min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sales Price (Total)</label>
                      <input 
                        type="number" required step="0.01"
                        value={item.total}
                        onChange={(e) => updateItem(index, 'total', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-emerald-600"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Serial Number (Optional)</label>
                      <input 
                        type="text"
                        value={item.serialNumber}
                        onChange={(e) => updateItem(index, 'serialNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="SN-XXXXX"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-800">Grand Total</span>
              <span className="text-2xl font-black text-emerald-600">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                <input 
                  type="date" required 
                  value={newSale.date} onChange={e => setNewSale({...newSale, date: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10">
                  Confirm Sale
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {isScannerOpen && (
        <QRScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
      )}

      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        sale={selectedSale} 
      />
    </div>
  );
};

const Suppliers = ({ data }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', category: '', contact: '', address: '' });

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    data.addSupplier(newSupplier);
    setNewSupplier({ name: '', category: '', contact: '', address: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Suppliers" 
        description="Manage your supply chain partners." 
        action="Add Supplier" 
        onAction={() => setIsModalOpen(true)}
      />
      {data.suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.suppliers.map((item: any) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <button 
                  onClick={() => data.deleteItem('suppliers', item.id, data.setSuppliers, data.suppliers)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <h4 className="font-bold text-lg text-slate-900">{item.name}</h4>
              <p className="text-sm text-slate-500 mb-4">{item.category}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={14} className="shrink-0" /> <span>Contact: {item.contact}</span>
                </div>
                {item.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="mt-1 shrink-0" /> 
                    <span>{item.address}</span>
                  </div>
                )}
              </div>
              <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                View Details
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState 
            icon={Truck} 
            title="No suppliers yet" 
            description="Keep track of your vendors and supply chain partners here."
            action="Add Supplier"
            onAction={() => setIsModalOpen(true)}
          />
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Supplier">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
            <input 
              type="text" required 
              value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              placeholder="Enter supplier name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <input 
              type="text" required 
              value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              placeholder="e.g. Electronics, Furniture"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Info</label>
            <input 
              type="text" required 
              value={newSupplier.contact} onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              placeholder="Phone or Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea 
              rows={3}
              value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none" 
              placeholder="Enter supplier address"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all mt-4">
            Save Supplier
          </button>
        </form>
      </Modal>
    </div>
  );
};

const Customers = ({ data }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '', orders: '0', spent: '0' });

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    data.addCustomer({
      ...newCustomer,
      orders: parseInt(newCustomer.orders),
      spent: parseFloat(newCustomer.spent)
    });
    setNewCustomer({ name: '', email: '', phone: '', address: '', orders: '0', spent: '0' });
    setIsModalOpen(false);
  };

  const handleView = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const customerSales = selectedCustomer 
    ? data.sales.filter((s: any) => s.customerName === selectedCustomer.name || s.customerPhone === selectedCustomer.phone)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        description="Build and maintain customer relationships." 
        action="Add Customer" 
        onAction={() => setIsModalOpen(true)}
      />
      <Card>
        {data.customers.length > 0 ? (
          <Table headers={['Customer Name', 'Contact Info', 'Total Orders', 'Total Spent', 'Actions']}>
            {data.customers.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{item.name[0]}</div>
                    <div className="font-medium text-slate-900">{item.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div>{item.email}</div>
                  <div>{item.phone}</div>
                  {item.address && <div className="text-xs text-slate-400 italic">{item.address}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.orders}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">${item.spent.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleView(item)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => data.deleteItem('customers', item.id, data.setCustomers, data.customers)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState 
            icon={Users} 
            title="No customers yet" 
            description="Your customer database will grow as you record more sales."
            action="Add Customer"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </Card>

      {/* View Customer Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Customer Details">
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                {selectedCustomer.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-500">{selectedCustomer.email}</p>
                <p className="text-sm text-slate-500">{selectedCustomer.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">{selectedCustomer.orders}</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-emerald-600">${selectedCustomer.spent.toFixed(2)}</p>
              </div>
            </div>

            {selectedCustomer.address && (
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm text-slate-600">{selectedCustomer.address}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase History</h4>
              {customerSales.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {customerSales.map((sale: any) => (
                    <div key={sale.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Invoice #{sale.id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-slate-500">{sale.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">${sale.total.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">{sale.items?.length || 1} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No purchase history found.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input 
              type="text" required 
              value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" required 
              value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input 
              type="text" required 
              value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input 
              type="text" 
              value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              placeholder="Enter customer address"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all mt-4">
            Save Customer
          </button>
        </form>
      </Modal>
    </div>
  );
};

const Expenses = ({ data }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ 
    category: '', 
    description: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    employeePhone: ''
  });

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    data.addExpense({
      ...newExpense,
      amount: parseFloat(newExpense.amount)
    });
    setNewExpense({ 
      category: '', 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      employeeName: '',
      employeePhone: ''
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expenses" 
        description="Track your business spending and overhead." 
        action="Add Expense" 
        onAction={() => setIsModalOpen(true)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {data.expenses.length > 0 ? (
              <Table headers={['Date', 'Category', 'Description', 'Amount', 'Actions']}>
                {data.expenses.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{item.description}</div>
                      {item.category === 'Salaries' && (item.employeeName || item.employeePhone) && (
                        <div className="text-xs text-slate-400 mt-1">
                          {item.employeeName && <span>Emp: {item.employeeName}</span>}
                          {item.employeePhone && <span className="ml-2">({item.employeePhone})</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-red-600">-${item.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => data.deleteItem('expenses', item.id, data.setExpenses, data.expenses)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <EmptyState 
                icon={Receipt} 
                title="No expenses recorded" 
                description="Keep your finances in check by tracking your business overhead."
                action="Add Expense"
                onAction={() => setIsModalOpen(true)}
              />
            )}
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Expense Breakdown</h3>
          {data.expenses.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600 font-medium">Total Expenses</span>
                <span className="text-lg font-bold text-red-600">-${data.expenses.reduce((acc: number, e: any) => acc + e.amount, 0).toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold mb-3 tracking-wider">By Category</p>
                <div className="space-y-3">
                  {Object.entries(
                    data.expenses.reduce((acc: any, e: any) => {
                      acc[e.category] = (acc[e.category] || 0) + e.amount;
                      return acc;
                    }, {})
                  ).map(([category, amount]: [string, any]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-slate-600">{category}</span>
                      <span className="font-semibold text-slate-900">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No data to display.</p>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Expense">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              required 
              value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
            >
              <option value="">Select Category</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Salaries">Salaries</option>
              <option value="Supplies">Supplies</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input 
              type="text" required 
              value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              placeholder={newExpense.category === 'Salaries' ? "e.g. March Salary" : "Expense description"}
            />
          </div>
          {newExpense.category === 'Salaries' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee Name</label>
                <input 
                  type="text" required={newExpense.category === 'Salaries'}
                  value={newExpense.employeeName} onChange={e => setNewExpense({...newExpense, employeeName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee Phone</label>
                <input 
                  type="tel" 
                  value={newExpense.employeePhone} onChange={e => setNewExpense({...newExpense, employeePhone: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input 
                type="number" step="0.01" required 
                value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date" required 
                value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all mt-4">
            Save Expense
          </button>
        </form>
      </Modal>
    </div>
  );
};

const Reports = ({ data }: any) => {
  const totalRevenue = data.sales.reduce((acc: number, s: any) => acc + s.total, 0);
  
  let totalSalesProfit = 0;
  let totalSalesLoss = 0;

  data.sales.forEach((s: any) => {
    if (s.items) {
      s.items.forEach((item: any) => {
        const buyPrice = item.buyPrice || 0;
        const cost = buyPrice * item.quantity;
        const profit = item.total - cost;
        if (profit > 0) totalSalesProfit += profit;
        else if (profit < 0) totalSalesLoss += Math.abs(profit);
      });
    } else {
      const buyPrice = s.buyPrice || 0;
      const cost = buyPrice * s.quantity;
      const profit = s.total - cost;
      if (profit > 0) totalSalesProfit += profit;
      else if (profit < 0) totalSalesLoss += Math.abs(profit);
    }
  });

  const totalExpenses = data.expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const rawProfit = totalSalesProfit;
  const rawLoss = totalSalesLoss + totalExpenses;
  
  const currentProfit = rawProfit >= rawLoss ? rawProfit - rawLoss : 0;
  const currentLoss = rawLoss > rawProfit ? rawLoss - rawProfit : 0;
  const netProfit = rawProfit - rawLoss;

  // Group sales by date for a simple chart
  const salesByDate = data.sales.reduce((acc: any, s: any) => {
    acc[s.date] = (acc[s.date] || 0) + s.total;
    return acc;
  }, {});

  const chartData = Object.entries(salesByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7);

  return (
    <div className="space-y-6">
      <PageHeader title="Business Reports" description="Analyze your business performance over time." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Net Profit</p>
          <h3 className={cn("text-2xl font-bold mt-1", netProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
            {netProfit >= 0 ? '' : '-'}${Math.abs(netProfit).toFixed(2)}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Final Balance
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ${totalRevenue.toFixed(2)}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Total Sales
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium text-emerald-600">Current Profit</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            ${currentProfit.toFixed(2)}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Profit from Sales
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium text-red-600">Current Loss</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">
            ${currentLoss.toFixed(2)}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Sales Loss + Expenses
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Expense Ratio</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0'}%
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Expenses vs Revenue
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue (Last 7 Days)</h3>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end gap-4 px-4">
              {chartData.map(([date, amount]: [string, any]) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div 
                    className="w-full bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600" 
                    style={{ height: `${(amount / Math.max(...Object.values(salesByDate) as number[])) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${amount.toFixed(2)}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{date.split('-').slice(1).join('/')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>No sales data for reporting.</p>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-6">Inventory Status</h3>
          {data.inventory.length > 0 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Stock Health</span>
                  <span className="font-bold">{((data.inventory.filter((i: any) => i.quantity > i.minStock).length / data.inventory.length) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(data.inventory.filter((i: any) => i.quantity > i.minStock).length / data.inventory.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 font-medium mb-1">Total Items</p>
                  <p className="text-xl font-bold text-slate-900">{data.inventory.length}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <p className="text-xs text-orange-600 font-medium mb-1">Low Stock</p>
                  <p className="text-xl font-bold text-orange-700">{data.inventory.filter((i: any) => i.quantity <= i.minStock).length}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No inventory data for reporting.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const Subscription = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const savedStatus = localStorage.getItem('greensoft_subscription');
    if (savedStatus) {
      setStatus(JSON.parse(savedStatus));
    }
  }, []);

  const handleActivate = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple mock activation logic: code must be 8 characters
    setTimeout(() => {
      if (code.length >= 8) {
        const newStatus = {
          active: true,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          activatedAt: new Date().toISOString(),
          code: code
        };
        localStorage.setItem('greensoft_subscription', JSON.stringify(newStatus));
        setStatus(newStatus);
        alert('Software successfully activated for 30 days!');
      } else {
        alert('Invalid activation code. Please contact the provider.');
      }
      setLoading(false);
      setCode('');
    }, 1500);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = status?.expiryDate ? new Date(status.expiryDate) < new Date() : true;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subscription & Activation" 
        description="Manage your software license and monthly payments." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">License Status</h3>
                <p className="text-sm text-slate-500">Your current software activation details</p>
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2",
                status?.active && !isExpired 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : "bg-red-50 text-red-600 border border-red-100"
              )}>
                {status?.active && !isExpired ? (
                  <><CheckCircle2 size={16} /> Active</>
                ) : (
                  <><X size={16} /> Inactive / Expired</>
                )}
              </div>
            </div>

            {status?.active && !isExpired ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Activated On</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(status.activatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium mb-1 uppercase tracking-wider">Expiry Date</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {new Date(status.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
                <h4 className="text-lg font-bold text-slate-900">No Active Subscription</h4>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                  Please follow the payment instructions to get your activation code.
                </p>
              </div>
            )}
          </Card>

          {/* Activation Form */}
          <Card className="p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Activate Software</h3>
            <p className="text-sm text-slate-500 mb-6">Enter the 8-digit activation code provided after payment.</p>
            
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter Activation Code"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-mono tracking-widest text-lg"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShieldCheck size={20} /> Activate Now</>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Payment Instructions */}
        <div className="space-y-6">
          <Card className="p-6 bg-emerald-600 text-white border-none">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Smartphone size={20} /> Payment Methods
            </h3>
            <p className="text-emerald-100 text-sm mb-6">
              Pay your monthly fee to get the activation code.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">bKash (Personal)</span>
                  <button onClick={() => copyToClipboard('01720-150101', 'bkash')} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    {copied === 'bkash' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-2xl font-mono font-bold tracking-wider">01720-150101</p>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Nagad (Personal)</span>
                  <button onClick={() => copyToClipboard('01720-150101', 'nagad')} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                    {copied === 'nagad' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-2xl font-mono font-bold tracking-wider">01720-150101</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-700/50 rounded-2xl text-xs leading-relaxed">
              <p className="font-bold mb-1 underline">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-emerald-50">
                <li>Send Money to any of the numbers above.</li>
                <li>Monthly fee: 1500 BDT.</li>
                <li>After payment, send a screenshot to our WhatsApp.</li>
                <li>We will provide you the 8-digit activation code.</li>
              </ol>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" /> Support
            </h4>
            <div className="space-y-3">
              <a href="https://wa.me/8801XXXXXXXXX" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">WhatsApp Support</p>
                  <p className="text-xs text-slate-500">Fastest response</p>
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Settings = ({ user, data }: any) => {
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [logo, setLogo] = useState(user?.logo || '');

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, businessName, email, logo, name, phone };
    localStorage.setItem('greensoft_user', JSON.stringify(updatedUser));
    window.location.reload(); 
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      const keys = ['inventory', 'sales', 'suppliers', 'customers', 'expenses'];
      keys.forEach(key => localStorage.removeItem(`greensoft_${key}`));
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your business profile and application preferences." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6">Business Profile</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                    {logo ? (
                      <img src={logo} alt="Business Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <Plus size={24} />
                        <span className="text-[10px] font-bold uppercase mt-1">Logo</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-xs font-bold">
                      Change
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Business Logo</p>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                    <input 
                      type="text" required 
                      value={businessName} onChange={e => setBusinessName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" required 
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" required 
                      value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" required 
                      value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all">
                Update Profile
              </button>
            </form>
          </Card>

          <Card className="p-6 border-red-100">
            <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-6">Permanently delete all your business data. This action is irreversible.</p>
            <button 
              onClick={clearAllData}
              className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-600 hover:text-white transition-all"
            >
              Clear All Data
            </button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">About Greensoft</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Greensoft is a comprehensive business management solution designed for small to medium enterprises. 
              Track your inventory, sales, and expenses all in one place.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400">Version 1.0.0</p>
              <p className="text-xs text-slate-400 mt-1">© {new Date().getFullYear()} {user?.businessName || 'Greensoft'}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AuthPage = ({ type, login, signup }: any) => {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (type === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match!');
        setIsSubmitting(false);
        return;
      }
      
      const result = await signup({
        businessName,
        fullName: name,
        phoneNumber: phone,
        email,
        password
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4">
            G
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {type === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-slate-500 text-center mt-2">
            {type === 'login' 
              ? 'Enter your credentials to access your business dashboard.' 
              : 'Start managing your local business more efficiently today.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Green Garden Supplies"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@business.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              type === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link
              to={type === 'login' ? '/signup' : '/login'}
              className="text-emerald-600 font-bold hover:underline"
            >
              {type === 'login' ? 'Sign up' : 'Log in'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();
  const data = useData();

  if (loading || !data.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <AuthPage type="login" login={login} signup={signup} /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <AuthPage type="signup" login={login} signup={signup} /> : <Navigate to="/" />} />
        
        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user} logout={logout}>
                <Routes>
                  <Route path="/" element={<Dashboard data={data} />} />
                  <Route path="/inventory" element={<Inventory data={data} />} />
                  <Route path="/sales" element={<Sales data={data} />} />
                  <Route path="/suppliers" element={<Suppliers data={data} />} />
                  <Route path="/customers" element={<Customers data={data} />} />
                  <Route path="/expenses" element={<Expenses data={data} />} />
                  <Route path="/reports" element={<Reports data={data} />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/settings" element={<Settings user={user} data={data} />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
