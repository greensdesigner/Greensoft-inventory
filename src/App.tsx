import React, { useState, useEffect, FormEvent, useRef, ChangeEvent, ReactNode, Component } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// --- SAFETY WRAPPER ---
class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || (
        <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
          <div className="text-red-500 mb-4 flex justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Something went wrong</h1>
          <p className="text-red-600 mb-6">The application encountered a critical error. Please try refreshing.</p>
          <pre className="text-xs bg-white p-4 rounded-xl border border-red-100 max-w-lg overflow-auto text-left mb-6">
            {error?.message || String(error)}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            Refresh App
          </button>
        </div>
      );
    }
    return children;
  }
}
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
  QrCode,
  Zap,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  Key,
  Facebook,
  Lock,
  Unlock,
  ShieldAlert,
  Clock,
  Phone,
  AlertTriangle,
  UserCheck,
  UserX,
  Camera
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
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
  Bar,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- BRAND CONFIGURATION ---
const BRAND_CONFIG = {
  name: "GreensStock",
  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9smqCpJW5Ix_xU5CAi1C5N01TqRAh76jKsg&s",
  color: "emerald-600"
};

// --- TRANSLATIONS ---
const translations: any = {
  en: {
    dashboard: "Dashboard",
    inventory: "Inventory",
    sales: "Sales",
    returns: "Returns",
    suppliers: "Suppliers",
    customers: "Customers",
    expenses: "Expenses",
    reports: "Reports",
    settings: "Settings",
    subscription: "Subscription",
    netRevenue: "Net Revenue",
    currentProfit: "Current Profit",
    currentLoss: "Current Loss",
    profitVsLossTrend: "Profit vs Loss Trend",
    netProfit: "Net Profit",
    profit: "Profit",
    loss: "Loss",
    revenue7Days: "Revenue (Last 7 Days)",
    noSalesData: "No sales data for reporting.",
    inventoryStatus: "Inventory Status",
    stockHealth: "Stock Health",
    totalExpenses: "Total Expenses",
    totalRefunds: "Total Refunds",
    totalReplacements: "Total Replacements",
    totalSales: "Total Sales",
    today: "Today",
    last7Days: "7 Days",
    last30Days: "30 Days",
    logout: "Logout",
    search: "Search anything...",
    searchInvoice: "Search Invoice",
    newSale: "New Sale",
    addItem: "Add Item",
    lowStock: "Low Stock Items",
    recentSales: "Recent Sales",
    recentRecords: "Recent Records",
    daysLeft: "Days Left",
    expired: "Expired",
    businessPerformance: "Business performance metrics and analytics.",
    dashboardOverview: "Dashboard Overview",
    totalReturn: "Full Return",
    replaceItem: "Replace Item",
    reasonFor: "Reason for",
    process: "Process",
    adjustmentAmount: "Adjustment Amount",
    replacementProduct: "Replacement Product details",
    refund: "Refund",
    extra: "Extra",
    welcome: "Welcome",
    softwareOnline: "Your software is online",
    softwareOffline: "Your software is offline, please do not put data",
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    loginDesc: "Enter your credentials to access your business dashboard.",
    signupDesc: "Start managing your local business more efficiently today.",
    businessNameLabel: "Business Name",
    fullNameLabel: "Full Name",
    phoneLabel: "Phone Number",
    emailLabel: "Email Address",
    addressLabel: "Address",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    signIn: "Sign In",
    createAccountBtn: "Create Account",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signup: "Sign up",
    login: "Log in",
    processing: "Processing...",
    softwareLoading: "Software is loading...",
    brandName: "Brand Name",
    team: "Team",
    role: "Role",
    permissions: "Permissions",
    addEmployee: "Add Employee",
    editEmployee: "Edit Employee",
    employeeName: "Employee Name",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    savePermissions: "Save Permissions",
    accessDenied: "Access Denied",
    managerOnly: "This section is restricted",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    sendResetCode: "Send Reset Code",
    enterResetEmail: "Enter your email address to recover your password.",
    resetCodeLabel: "6-Digit Reset Code",
    newPasswordLabel: "New Password",
    confirmNewPasswordLabel: "Confirm New Password",
    backToLogin: "Back to Login Page",
    customDate: "Custom Date",
    startDate: "Start Date",
    endDate: "End Date",
    downloadPDF: "Download PDF",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    inventory: "ইনভেন্টরি",
    sales: "বিক্রয়",
    returns: "রিটার্ন",
    suppliers: "সরবরাহকারী",
    customers: "গ্রাহক",
    expenses: "খরচ",
    reports: "রিপোর্ট",
    settings: "সেটিংস",
    subscription: "সাবস্ক্রিপশন",
    netRevenue: "নিট রাজস্ব",
    currentProfit: "বর্তমান লাভ",
    currentLoss: "বর্তমান ক্ষতি",
    profitVsLossTrend: "লাভ বনাম ক্ষতি ট্রেন্ড",
    netProfit: "নিট লাভ",
    profit: "লাভ",
    loss: "ক্ষতি",
    revenue7Days: "রাজস্ব (শেষ ৭ দিন)",
    noSalesData: "রিপোর্টের জন্য কোন বিক্রয়ের তথ্য নেই।",
    inventoryStatus: "ইনভেন্টরি অবস্থা",
    stockHealth: "স্টক হেলথ",
    totalExpenses: "মোট খরচ",
    totalRefunds: "মোট ফেরত",
    totalReplacements: "মোট পরিবর্তন",
    totalSales: "মোট বিক্রয়",
    today: "আজ",
    last7Days: "৭ দিন",
    last30Days: "৩০ দিন",
    logout: "লগআউট",
    search: "যেকোন কিছু খুঁজুন...",
    searchInvoice: "ইনভয়েস খুঁজুন",
    newSale: "নতুন বিক্রয়",
    addItem: "পণ্য যোগ করুন",
    lowStock: "স্বল্প স্টকের পণ্য",
    recentSales: "সাম্প্রতিক বিক্রয়",
    recentRecords: "সাম্প্রতিক রেকর্ড",
    daysLeft: "দিন বাকি",
    expired: "মেয়াদ শেষ",
    businessPerformance: "ব্যবসায়িক পারফরম্যান্স মেট্রিক্স এবং বিশ্লেষণ।",
    dashboardOverview: "ড্যাশবোর্ড ওভারভিউ",
    totalReturn: "সম্পূর্ণ রিটার্ন",
    replaceItem: "পণ্য পরিবর্তন",
    reasonFor: "কারণ",
    process: "প্রসেস করুন",
    adjustmentAmount: "মূল্য সমন্বয়",
    replacementProduct: "নতুন প্রোডাক্টের বিবরণ",
    refund: "ফেরত",
    extra: "অতিরিক্ত",
    welcome: "স্বাগতম",
    softwareOnline: "আপনার সফটওয়্যার অনলাইন আছে",
    softwareOffline: "আপনার সফটওয়্যার অফলাইন, দয়া করে ডাটা এন্ট্রি করবেন না",
    welcomeBack: "স্বাগতম",
    createAccount: "অ্যাকাউন্ট তৈরি করুন",
    loginDesc: "আপনার ড্যাশবোর্ডে প্রবেশের জন্য লগইন করুন।",
    signupDesc: "আজই আপনার ব্যবসা ম্যানেজ করা শুরু করুন।",
    businessNameLabel: "ব্যবসার নাম",
    fullNameLabel: "পুরো নাম",
    phoneLabel: "ফোন নম্বর",
    emailLabel: "ইমেইল ঠিকানা",
    addressLabel: "ঠিকানা",
    passwordLabel: "পাসওয়ার্ড",
    confirmPasswordLabel: "পাসওয়ার্ড নিশ্চিত করুন",
    signIn: "সাইন ইন",
    createAccountBtn: "অ্যাকাউন্ট তৈরি করুন",
    noAccount: "অ্যাকাউন্ট নেই?",
    haveAccount: "অ্যাকাউন্ট আছে?",
    signup: "সাইন আপ",
    login: "লগইন",
    processing: "প্রসেসিং...",
    softwareLoading: "সফটওয়্যার লোড হচ্ছে...",
    brandName: "ব্র্যান্ড নেম",
    team: "টিম",
    role: "রোল",
    permissions: "পারমিশন",
    addEmployee: "কর্মচারী যোগ করুন",
    editEmployee: "কর্মচারী এডিট",
    employeeName: "কর্মচারীর নাম",
    view: "ভিউ",
    edit: "এডিট",
    delete: "ডিলিট",
    savePermissions: "পারমিশন সেভ করুন",
    accessDenied: "এক্সেস ডিনাইড",
    managerOnly: "এই সেকশনটি মালিক দ্বারা সংরক্ষিত",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    resetPassword: "পাসওয়ার্ড রিসেট করুন",
    sendResetCode: "রিসেট কোড পাঠান",
    enterResetEmail: "পাসওয়ার্ড পুনরায় ফিরে পেতে আপনার ইমেইল এড্রেসটি লিখুন।",
    resetCodeLabel: "৬-ডিজিটের রিসেট কোড",
    newPasswordLabel: "নতুন পাসওয়ার্ড",
    confirmNewPasswordLabel: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
    backToLogin: "লগইন পেজে ফিরে যান",
    customDate: "কাস্টম ডেট",
    startDate: "শুরুর তারিখ",
    endDate: "শেষের তারিখ",
    downloadPDF: "পিডিএফ ডাউনলোড করুন",
  },
  es: {
    dashboard: "Tablero",
    inventory: "Inventario",
    sales: "Ventas",
    returns: "Devoluciones",
    suppliers: "Proveedores",
    customers: "Clientes",
    expenses: "Gastos",
    reports: "Informes",
    settings: "Configuración",
    subscription: "Suscripción",
    netRevenue: "Ingresos Netos",
    currentProfit: "Ganancia Actual",
    currentLoss: "Pérdida Actual",
    profitVsLossTrend: "Tendencia de Pérdidas y Ganancias",
    netProfit: "Ganancia Neta",
    profit: "Ganancia",
    loss: "Pérdida",
    revenue7Days: "Ingresos (Últimos 7 Días)",
    noSalesData: "No hay datos de ventas para informes.",
    inventoryStatus: "Estado del Inventario",
    stockHealth: "Salud del Stock",
    totalExpenses: "Gastos Totales",
    totalRefunds: "Reembolsos Totales",
    totalReplacements: "Reemplazos Totales",
    totalSales: "Ventas Totales",
    today: "Hoy",
    last7Days: "7 Días",
    last30Days: "30 Días",
    logout: "Cerrar sesión",
    search: "Buscar algo...",
    searchInvoice: "Buscar factura",
    newSale: "Nueva venta",
    addItem: "Añadir artículo",
    lowStock: "Artículos con poco stock",
    recentSales: "Ventas recientes",
    recentRecords: "Registros recientes",
    daysLeft: "Días restantes",
    expired: "Expirado",
    businessPerformance: "Métricas y análisis del rendimiento empresarial.",
    dashboardOverview: "Resumen del Tablero",
    totalReturn: "Devolución total",
    replaceItem: "Reemplazar artículo",
    reasonFor: "Razón de",
    process: "Procesar",
    adjustmentAmount: "Monto de ajuste",
    replacementProduct: "Detalles del producto de reemplazo",
    refund: "Reembolso",
    extra: "Extra",
    welcome: "Bienvenido",
    softwareOnline: "Tu software está en línea",
    softwareOffline: "Tu software está fuera de línea, por favor no ingreses datos",
    welcomeBack: "Bienvenido de nuevo",
    createAccount: "Crea tu cuenta",
    loginDesc: "Ingrese sus credenciales para acceder a su tablero de negocios.",
    signupDesc: "Comience a administrar su negocio local de manera más eficiente hoy.",
    businessNameLabel: "Nombre del negocio",
    fullNameLabel: "Nombre completo",
    phoneLabel: "Número de teléfono",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    confirmPasswordLabel: "Confirmar contraseña",
    signIn: "Iniciar sesión",
    createAccountBtn: "Crear cuenta",
    noAccount: "¿No tienes una cuenta?",
    haveAccount: "¿Ya tienes una cuenta?",
    signup: "Regístrate",
    login: "Iniciar sesión",
    processing: "Procesando...",
    softwareLoading: "El software se está cargando...",
    brandName: "Nombre de la marca",
    customDate: "Fecha Personalizada",
    startDate: "Fecha de Inicio",
    endDate: "Fecha de Fin",
    downloadPDF: "Descargar PDF",
  }
};

const LanguageContext = React.createContext({
  lang: 'en',
  setLang: (l: string) => {},
  t: (key: string) => key
});

const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useTranslation = () => React.useContext(LanguageContext);

// --- HELPERS ---
const banglaToEnglishDigits = (str: any): string => {
  if (str === null || str === undefined) return '';
  const banglaToEnglishMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.toString().replace(/[০-৯]/g, (digit: string) => banglaToEnglishMap[digit] || digit);
};

const parseBanglaInt = (val: any, fallback = 0): number => {
  if (val === undefined || val === null) return fallback;
  const cleaned = banglaToEnglishDigits(val).replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? fallback : parsed;
};

const parseBanglaFloat = (val: any, fallback = 0): number => {
  if (val === undefined || val === null) return fallback;
  const cleaned = banglaToEnglishDigits(val).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

const f2 = (num: any) => (Number(num) || 0).toFixed(2);

const useCurrency = () => {
  const { lang } = useTranslation();
  
  const toBengaliNumber = (num: string | number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
  };

  const formatCurrency = (amount: number | string, decimals: number = 2) => {
    const num = Number(amount) || 0;
    const formatted = num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    if (lang === 'bn') {
      return `৳${toBengaliNumber(formatted)}`;
    }
    return `$${formatted}`;
  };

  return { formatCurrency, toBengaliNumber };
};

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const WHATSAPP_NUM = "01720150101";

// --- SUBSCRIPTION HOOK ---
const useSubscription = (user: any) => {
  const [subscription, setSubscription] = useState<{ 
    active: boolean, 
    expiryDate: string | null, 
    loading: boolean,
    isLocked: boolean,
    lockReason?: string,
    subscriptionFee: number 
  }>({
    active: true,
    expiryDate: null,
    loading: true,
    isLocked: false,
    lockReason: '',
    subscriptionFee: 500
  });

  const checkStatus = async () => {
    const checkId = user?.ownerId || user?.id;
    if (!checkId) {
      setSubscription(prev => ({ ...prev, loading: false }));
      return { active: false };
    }
    try {
      const res = await fetch(`/api/subscription/status?userId=${checkId}`);
      const data = await res.json();
      setSubscription({ 
        active: !data.isLocked && !!data.active, 
        expiryDate: data.expiryDate, 
        isLocked: !!data.isLocked,
        lockReason: data.lockReason || '',
        subscriptionFee: data.subscriptionFee !== undefined ? Number(data.subscriptionFee) : 500,
        loading: false 
      });
      return data;
    } catch (e) {
      setSubscription(prev => ({ ...prev, loading: false }));
      return { active: false };
    }
  };

  useEffect(() => {
    if (user?.id) {
      checkStatus();
      
      // Handle Stripe Redirect Success
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('stripe_session_id');
      if (sessionId) {
        confirmStripePayment(sessionId);
      }
    } else {
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id]);

  const confirmStripePayment = async (sessionId: string) => {
    setSubscription(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/subscription/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (data.success) {
        setSubscription({ active: true, expiryDate: data.expiryDate, loading: false });
        alert('Payment successful! Your subscription has been extended by 30 days.');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        alert('Payment confirmation failed. Please contact support.');
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    } catch (e) {
      console.error('Confirm Payment Error:', e);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  const createStripeSession = async () => {
    const checkId = user?.ownerId || user?.id;
    if (!checkId) return alert('Please login first');
    
    try {
      const res = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: checkId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Could not create checkout session');
      }
    } catch (e) {
      console.error('Stripe error:', e);
      alert('Error connecting to payment gateway.');
    }
  };

  const activate = async (code: string) => {
    const checkId = user?.ownerId || user?.id;
    if (!checkId) return { success: false, error: 'User not authenticated' };
    try {
      const res = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId: checkId })
      });
      const data = await res.json();
      if (data.success) {
        setSubscription({ active: true, expiryDate: data.expiryDate, loading: false });
        
        // Update local user data with new expiry
        const savedUser = localStorage.getItem('greensoft_user');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          u.expiryDate = data.expiryDate;
          localStorage.setItem('greensoft_user', JSON.stringify(u));
        }
        
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return { ...subscription, checkStatus, activate, createStripeSession };
};

// --- REAL AUTH HOOK ---
const useAuth = () => {
  const [user, setUser] = useState<{ 
    id: number; 
    email: string; 
    businessName: string; 
    logo?: string; 
    name?: string; 
    phoneNumber?: string; 
    address?: string; 
    expiryDate?: string;
    role?: 'OWNER' | 'MANAGER';
    ownerId?: number;
    permissions?: any;
  } | null>(() => {
    try {
      const savedUser = localStorage.getItem('greensoft_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (!parsed.role) parsed.role = 'OWNER';
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const hasPermission = (module: string, action: 'view' | 'edit' | 'delete' = 'view') => {
    // Only restrict if explicitly a MANAGER
    if (user && user.role === 'MANAGER') {
      if (!user.permissions) return false;
      const modPerms = user.permissions[module];
      if (!modPerms) return false;
      return modPerms[action] === true;
    }
    // OWNER or unassigned has full access
    return true;
  };

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        const savedUser = localStorage.getItem('greensoft_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (!parsed.role) parsed.role = 'OWNER';
          setUser(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('greensoft_user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);

    // Initial check
    handleUserUpdate();

    return () => {
      window.removeEventListener('greensoft_user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
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
        const userData = { ...data.user, role: data.user.role || 'OWNER' };
        localStorage.setItem('greensoft_user', JSON.stringify(userData));
        setUser(userData);
        window.dispatchEvent(new Event('greensoft_user_updated'));
        return { success: true };
      }
      if (data.error === 'email_not_verified') {
        return { success: false, error: 'email_not_verified', email: data.email, message: data.message };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData: any) => {
    try {
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        return { success: false, error: 'অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস দিন (যেমন: example@mail.com)' };
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        if (data.needsVerification) {
          return { success: true, needsVerification: true, email: data.email, message: data.message };
        }
        const userObj = { ...data.user, role: data.user.role || 'OWNER' };
        localStorage.setItem('greensoft_user', JSON.stringify(userObj));
        setUser(userObj);
        window.dispatchEvent(new Event('greensoft_user_updated'));
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (data.success) {
        const userObj = { ...data.user, role: data.user.role || 'OWNER' };
        localStorage.setItem('greensoft_user', JSON.stringify(userObj));
        setUser(userObj);
        window.dispatchEvent(new Event('greensoft_user_updated'));
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'ভেরিফিকেশন কোডটি সঠিক নয়!' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resendCode = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to resend code' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      console.log('--- UPDATING PROFILE ---', profileData);
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, userId: user?.id })
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        console.log('--- UPDATE RESPONSE ---', data);
        if (data.success) {
          const updatedUser = {
            ...user,
            ...data.user,
            role: data.user?.role || user?.role || 'OWNER'
          };
          try {
            localStorage.setItem('greensoft_user', JSON.stringify(updatedUser));
          } catch (storageErr) {
            console.warn('LocalStorage save failed:', storageErr);
          }
          setUser(updatedUser);
          window.dispatchEvent(new Event('greensoft_user_updated'));
          return { success: true };
        }
        return { success: false, error: data.error || 'Update failed' };
      } else {
        const text = await res.text();
        console.error('--- NON-JSON RESPONSE ---', text);
        return { success: false, error: 'Server returned an invalid response. This may be due to large file size (Logo).' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('greensoft_user');
    setUser(null);
    window.dispatchEvent(new Event('greensoft_user_updated'));
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to send reset code' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Password reset failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return { user, loading, login, signup, verifyEmail, resendCode, updateProfile, logout, hasPermission, forgotPassword, resetPassword };
};

// --- DATA HOOK ---
const useData = (user: any) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sanitization helper
  const n = (v: any) => parseBanglaFloat(v);

  const sanitizeItem = (key: string, item: any) => {
    if (key === 'inventory') {
      return {
        ...item,
        quantity: n(item.quantity),
        price: n(item.price),
        minStock: n(item.minStock)
      };
    }
    if (key === 'sales') {
      return {
        ...item,
        total: n(item.total),
        paid: n(item.paid)
      };
    }
    if (key === 'expenses') {
      return {
        ...item,
        amount: n(item.amount)
      };
    }
    if (key === 'returns') {
      return {
        ...item,
        totalAmount: n(item.totalAmount)
      };
    }
    if (key === 'customers') {
      return {
        ...item,
        orders: n(item.orders),
        spent: n(item.spent)
      };
    }
    return item;
  };

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoaded(true);
      return;
    }
    try {
      const entities = ['inventory', 'sales', 'suppliers', 'customers', 'expenses', 'returns'];
      const setters: any = {
        inventory: setInventory,
        sales: setSales,
        suppliers: setSuppliers,
        customers: setCustomers,
        expenses: setExpenses,
        returns: setReturns
      };

      for (const entity of entities) {
        try {
          const res = await fetch(`/api/${entity}?userId=${user.id}&role=${user.role || 'OWNER'}&ownerId=${user.ownerId || ''}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const sanitizedData = data.map(item => sanitizeItem(entity, item));
              
              if (entity === 'sales') {
                const formattedSales = sanitizedData.map((s: any) => {
                  let items = [];
                  try {
                    items = typeof s.items === 'string' ? JSON.parse(s.items) : (s.items || []);
                  } catch (e) { items = []; }
                  return { ...s, items: Array.isArray(items) ? items : [] };
                });
                setSales(formattedSales);
              } else {
                setters[entity](sanitizedData);
              }
            }
          }
        } catch (e) {
          console.error(`Field to parse ${entity}:`, e);
        }
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const saveData = (key: string, data: any) => {
    localStorage.setItem(`greensoft_${key}_${user?.id || 'guest'}`, JSON.stringify(data));
  };

  const addItem = async (key: string, item: any, setter: any) => {
    if (!user?.id) return;
    const newItem = { 
      ...item, 
      userId: user.id,
      id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    };
    const sanitizedItem = sanitizeItem(key, newItem);
    
    try {
      const res = await fetch(`/api/${key}?userId=${user.id}&role=${user.role || 'OWNER'}&ownerId=${user.ownerId || ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedItem)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server rejected the data');
      }
    } catch (error: any) {
      console.error(`[SYNC ERROR] ${key}:`, error.message);
    }

    setter((prev: any[]) => {
      const newData = [sanitizedItem, ...prev];
      saveData(key, newData);
      return newData;
    });
  };

  const editItem = async (key: string, id: string, updatedFields: any, setter: any) => {
    if (!user?.id) return;
    setter((prev: any[]) => {
      const item = prev.find((i: any) => i.id === id);
      if (!item) return prev;
      
      const fullUpdatedItem = sanitizeItem(key, { ...item, ...updatedFields, userId: user.id });
      
      fetch(`/api/${key}?userId=${user.id}&role=${user.role || 'OWNER'}&ownerId=${user.ownerId || ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullUpdatedItem)
      }).catch(err => console.error(`Error syncing edit for ${key}:`, err));

      const newData = prev.map((i: any) => i.id === id ? fullUpdatedItem : i);
      saveData(key, newData);
      return newData;
    });
  };

  const deleteItem = async (key: string, id: string, setter: any) => {
    if (!user?.id) return;
    try {
      await fetch(`/api/${key}/${id}?userId=${user.id}&role=${user.role || 'OWNER'}&ownerId=${user.ownerId || ''}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Error deleting ${key}:`, error);
    }
    setter((prev: any[]) => {
      const newData = prev.filter((item: any) => item.id !== id);
      saveData(key, newData);
      return newData;
    });
  };

  return {
    inventory, setInventory: (d: any) => { setInventory(d); saveData('inventory', d); },
    sales, setSales: (d: any) => { setSales(d); saveData('sales', d); },
    suppliers, setSuppliers: (d: any) => { setSuppliers(d); saveData('suppliers', d); },
    customers, setCustomers: (d: any) => { setCustomers(d); saveData('customers', d); },
    expenses, setExpenses: (d: any) => { setExpenses(d); saveData('expenses', d); },
    returns, setReturns: (d: any) => { setReturns(d); saveData('returns', d); },
    addInventory: (item: any) => addItem('inventory', item, setInventory),
    addSale: (item: any) => addItem('sales', item, setSales),
    addSupplier: (item: any) => addItem('suppliers', item, setSuppliers),
    addCustomer: (item: any) => addItem('customers', item, setCustomers),
    addExpense: (item: any) => addItem('expenses', item, setExpenses),
    addReturn: (item: any) => addItem('returns', item, setReturns),
    deleteItem,
    editItem,
    isLoaded,
    fetchData
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

const Layout = ({ children, user, logout, subscription }: any) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();
  const { t, lang, setLang } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isSubscribed = subscription?.active;
  const { hasPermission } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), to: '/', module: 'dashboard' },
    { icon: Package, label: t('inventory'), to: '/inventory', module: 'inventory' },
    { icon: ShoppingCart, label: t('sales'), to: '/sales', module: 'sales' },
    { icon: Truck, label: t('suppliers'), to: '/suppliers', module: 'suppliers' },
    { icon: Users, label: t('customers'), to: '/customers', module: 'customers' },
    { icon: Receipt, label: t('expenses'), to: '/expenses', module: 'expenses' },
    { icon: RotateCcw, label: t('returns'), to: '/returns', module: 'returns' },
    { icon: BarChart3, label: t('reports'), to: '/reports', module: 'reports' },
    { icon: ShieldCheck, label: t('subscription'), to: '/subscription', module: 'subscription' },
    { icon: SettingsIcon, label: t('settings'), to: '/settings', module: 'settings' },
  ];

  // If not subscribed, only allow access to Subscription page
  const filteredNavItems = navItems.filter(item => {
    // 1. Subscription check
    if (!isSubscribed && item.to !== '/subscription') return false;
    
    // 2. Manager permission check
    if (user?.role === 'MANAGER') {
      if (item.module === 'subscription') return false; // Managers can't see subscription
      if (item.module === 'dashboard' || item.module === 'settings') return true; // Allowed by default
      return hasPermission(item.module, 'view');
    }
    
    return true;
  });

  const subscriptionDays = subscription?.expiryDate 
    ? Math.ceil((new Date(subscription.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {!isSubscribed && location.pathname !== '/subscription' && (
        <Navigate to="/subscription" replace />
      )}
      
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
              ) : BRAND_CONFIG.logo ? (
                <img src={BRAND_CONFIG.logo} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
              ) : (
                <div className={`w-8 h-8 bg-${BRAND_CONFIG.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                  {BRAND_CONFIG.name.charAt(0)}
                </div>
              )}
              {!collapsed && <span className="text-xl font-bold text-slate-900">{user?.businessName || BRAND_CONFIG.name}</span>}
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
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
                    isSubscribed ? "text-emerald-500" : "text-red-500"
                  )} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {isSubscribed ? "Active Plan" : "Inactive"}
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
                title={t('logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Connection Status Bar */}
        <div className={cn(
          "px-4 py-2 text-center text-sm sm:text-base font-extrabold uppercase tracking-wide transition-all duration-300 z-50",
          isOnline 
            ? "bg-emerald-500 text-white shadow-md" 
            : "bg-red-600 text-white animate-pulse shadow-lg"
        )}>
          <div className="flex items-center justify-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full border border-white/20",
              isOnline ? "bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" : "bg-white animate-ping"
            )} />
            {isOnline 
              ? t('softwareOnline') 
              : t('softwareOffline')
            }
          </div>
        </div>

        {isSubscribed && subscriptionDays <= 7 && subscriptionDays > 0 && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 text-xs sm:text-sm font-medium z-30">
            <Bell size={16} className="animate-bounce shrink-0" />
            Only {subscriptionDays} {t('daysLeft')} until your subscription expires. Please renew.
            <Link to="/subscription" className="underline font-bold ml-2 whitespace-nowrap">Renew Now</Link>
          </div>
        )}
        {!isSubscribed && (
          <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between gap-4 z-50 shadow-xl overflow-hidden animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="shrink-0" />
              <div>
                <p className="font-bold text-sm sm:text-base">Pay your subscription fee and activate your software</p>
                <p className="text-xs opacity-90">Please contact the owner to receive your activation code.</p>
              </div>
            </div>
            <a 
              href={`https://wa.me/${WHATSAPP_NUM}?text=Hello, I want to pay my subscription fee for GreensStock.`} 
              target="_blank" 
              rel="noreferrer"
              className="bg-white text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shrink-0"
            >
              Contact Owner
            </a>
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
                {location.pathname === '/' ? t('dashboard') : t(location.pathname.substring(1))}
              </h1>
              {subscriptionDays !== null && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100 w-fit">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                      {subscriptionDays > 0 ? `${subscriptionDays} ${t('daysLeft')}` : t('expired')}
                      {subscriptionDays > 0 && subscriptionDays <= 30 && ` • Day ${31 - subscriptionDays}/30`}
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
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl mr-2">
              <button 
                onClick={() => setLang('en')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                  lang === 'en' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                )}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('bn')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                  lang === 'bn' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                )}
              >
                বাংলা
              </button>
              <button 
                onClick={() => setLang('es')}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                  lang === 'es' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                )}
              >
                ES
              </button>
            </div>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t('search')}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-48 lg:w-64"
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

const Dashboard = ({ data, user: propUser }: any) => {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser;

  const hasPermission = (module: string, action: 'view' | 'edit' | 'delete' = 'view') => {
    // Only restrict if explicitly a MANAGER
    if (currentUser && currentUser.role === 'MANAGER') {
      if (!currentUser.permissions) return false;
      const modPerms = currentUser.permissions[module];
      if (!modPerms) return false;
      return modPerms[action] === true;
    }
    // OWNER or any user has full dashboard visibility
    return true;
  };

  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'custom'>('30days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useTranslation();
  const { formatCurrency, toBengaliNumber } = useCurrency();

  // --- CALCULATION LOGIC ---
  const isWithinRange = (dateStr: string) => {
    if (!dateStr) return false;
    
    // Parse YYYY-MM-DD as local date to avoid timezone shift issues with new Date(dateStr)
    const parts = dateStr.split('-');
    let date: Date;
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      date = new Date(dateStr);
    }
    date.setHours(0, 0, 0, 0);
    
    if (timeFilter === 'custom') {
      if (!startDate && !endDate) return true;
      const start = startDate ? new Date(startDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      
      if (start && end) {
        return date >= start && date <= end;
      } else if (start) {
        return date >= start;
      } else if (end) {
        return date <= end;
      }
      return true;
    }
    
    const rangeDate = new Date();
    rangeDate.setHours(0, 0, 0, 0);
    
    if (timeFilter === '7days') rangeDate.setDate(rangeDate.getDate() - 7);
    else if (timeFilter === '30days') rangeDate.setDate(rangeDate.getDate() - 30);
    // for 'today', rangeDate is already today at 00:00:00
    
    return date >= rangeDate;
  };

  const filteredSales = (data.sales || []).filter((s: any) => isWithinRange(s?.date));
  const filteredExpenses = (data.expenses || []).filter((e: any) => isWithinRange(e?.date));
  const filteredReturns = (data.returns || []).filter((r: any) => isWithinRange(r?.date));

  // 1. Calculate Sales Profit/Loss for the filtered range
  let totalSalesProfit = 0;
  let totalSalesLoss = 0;
  let totalSalesGross = 0;

  filteredSales.forEach((s: any) => {
    totalSalesGross += (Number(s.total) || 0);
    const items = Array.isArray(s.items) ? s.items : [];
    if (items.length > 0) {
      items.forEach((item: any) => {
        const cost = (Number(item.buyPrice) || 0) * (Number(item.quantity) || 1);
        const profit = (Number(item.total) || 0) - cost;
        if (profit > 0) totalSalesProfit += profit;
        else if (profit < 0) totalSalesLoss += Math.abs(profit);
      });
    } else {
      const cost = (Number(s.buyPrice) || 0) * (Number(s.quantity) || 1);
      const profit = (Number(s.total) || 0) - cost;
      if (profit > 0) totalSalesProfit += profit;
      else if (profit < 0) totalSalesLoss += Math.abs(profit);
    }
  });

  // 2. Calculate Expenses and Returns
  const totalExpenses = filteredExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  const totalRefunds = Math.abs(filteredReturns.filter((r: any) => r.type === 'Return' || (r.type === 'Replace' && Number(r.totalAmount) < 0)).reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0));
  const totalExtraIncome = filteredReturns.filter((r: any) => r.type === 'Replace' && Number(r.totalAmount) > 0).reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0);
  
  const totalReturnsNet = filteredReturns.reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0);
  const netRevenue = totalSalesGross + totalReturnsNet;

  // 3. Net values logic (Net Profit: Sales Profit - Loss - Expenses - Refunds)
  const finalNetResult = (totalSalesProfit - totalSalesLoss) + totalExtraIncome - totalExpenses - totalRefunds;
  
  const displayProfit = Math.max(0, finalNetResult);
  const displayLoss = finalNetResult < 0 ? Math.abs(finalNetResult) : 0;
  
  const netProfitTotal = finalNetResult;

  // Calculate Daily Stats for Chart
  let chartDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }).reverse();

  if (timeFilter === 'custom' && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dates: string[] = [];
    const current = new Date(start);
    const maxDays = Math.min(diffDays + 1, 31);
    for (let i = 0; i < maxDays; i++) {
      dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
      current.setDate(current.getDate() + 1);
    }
    chartDates = dates;
  } else if (timeFilter === 'today') {
    chartDates = [getTodayStr()];
  } else if (timeFilter === '30days') {
    chartDates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }).reverse();
  }

  const dailyStats = chartDates.map(date => {
    let dProfit = 0;
    let dLoss = 0;

    (data.sales || []).filter((s: any) => s.date === date).forEach((s: any) => {
      const items = Array.isArray(s.items) ? s.items : [];
      if (items.length > 0) {
        items.forEach((item: any) => {
          const cost = (Number(item.buyPrice) || 0) * (Number(item.quantity) || 1);
          const profit = (Number(item.total) || 0) - cost;
          if (profit > 0) dProfit += profit;
          else if (profit < 0) dLoss += Math.abs(profit);
        });
      } else {
        const cost = (Number(s.buyPrice) || 0) * (Number(s.quantity) || 1);
        const profit = (Number(s.total) || 0) - cost;
        if (profit > 0) dProfit += profit;
        else if (profit < 0) dLoss += Math.abs(profit);
      }
    });

    const dExpenses = (data.expenses || []).filter((e: any) => e.date === date).reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
    const dReturnsList = (data.returns || []).filter((r: any) => r.date === date);
    const dRefunds = Math.abs(dReturnsList.filter((r: any) => r.type === 'Return' || (r.type === 'Replace' && Number(r.totalAmount) < 0)).reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0));
    const dExtraInc = dReturnsList.filter((r: any) => r.type === 'Replace' && Number(r.totalAmount) > 0).reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0);

    // Gross Daily Profit vs Gross Daily Loss
    const dayProfitDisplay = dProfit + dExtraInc;
    const dayLossDisplay = dLoss + dExpenses + dRefunds;
    const netDay = dayProfitDisplay - dayLossDisplay;

    return {
      date: date.split('-').slice(1).join('/'),
      profit: parseFloat(dayProfitDisplay.toFixed(2)),
      loss: -parseFloat(dayLossDisplay.toFixed(2)),
      net: parseFloat(netDay.toFixed(2)),
    };
  });

  const stats = [
    { key: 'sales', label: t('netRevenue'), value: formatCurrency(netRevenue, 0), icon: DollarSign, color: 'bg-indigo-500' },
    { key: 'sales', label: t('currentProfit'), value: formatCurrency(displayProfit), icon: TrendingUp, color: 'bg-emerald-500' },
    { key: 'sales', label: t('currentLoss'), value: formatCurrency(displayLoss), icon: ArrowDownRight, color: 'bg-red-500' },
    { key: 'expenses', label: t('totalExpenses'), value: formatCurrency(totalExpenses, 0), icon: Receipt, color: 'bg-orange-500' },
    { key: 'returns', label: t('totalRefunds'), value: formatCurrency(totalRefunds, 0), icon: RotateCcw, color: 'bg-slate-500' },
    { key: 'returns', label: t('totalReplacements'), value: formatCurrency(totalExtraIncome, 0), icon: RefreshCw, color: 'bg-indigo-400' },
    { key: 'sales', label: t('totalSales'), value: lang === 'bn' ? toBengaliNumber(filteredSales.length) : filteredSales.length.toString(), icon: ShoppingCart, color: 'bg-blue-500' },
  ].filter(stat => hasPermission(stat.key as any, 'view'));

  const lowStockItems = (data?.inventory || []).filter((item: any) => item.quantity <= (item.minStock || 5));

  const exportPDF = async () => {
    if (!dashboardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const element = dashboardRef.current;
      
      const buttonsToHide = element.querySelectorAll('.no-pdf-export');
      buttonsToHide.forEach((btn: any) => {
        btn.setAttribute('data-original-display', btn.style.display);
        btn.style.setProperty('display', 'none', 'important');
      });

      await new Promise(resolve => setTimeout(resolve, 80));

      let pdfSaved = false;

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc',
          allowTaint: false,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        const fileName = `Dashboard-Report-${timeFilter === 'custom' ? `${startDate || 'Start'}_to_${endDate || 'End'}` : timeFilter}.pdf`;
        pdf.save(fileName);
        pdfSaved = true;
      } catch (canvasErr) {
        console.warn("Canvas capture fallback triggered for Dashboard:", canvasErr);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, 28, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(currentUser?.businessName || 'Business Dashboard Report', 14, 14);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated: ${new Date().toLocaleString()} | Filter: ${timeFilter.toUpperCase()}`, 14, 21);
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Financial Summary', 14, 38);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Net Revenue: $${Number(netRevenue || 0).toFixed(2)}`, 14, 46);
        pdf.text(`Current Profit: $${Number(displayProfit || 0).toFixed(2)}`, 14, 53);
        pdf.text(`Current Loss: $${Number(displayLoss || 0).toFixed(2)}`, 14, 60);
        pdf.text(`Total Sales Count: ${filteredSales.length}`, 14, 67);

        const fileName = `Dashboard-Report-${timeFilter === 'custom' ? `${startDate || 'Start'}_to_${endDate || 'End'}` : timeFilter}.pdf`;
        pdf.save(fileName);
        pdfSaved = true;
      }

      buttonsToHide.forEach((btn: any) => {
        const orig = btn.getAttribute('data-original-display');
        btn.style.display = orig || '';
      });

      if (pdfSaved) {
        setTimeout(() => {
          alert("PDF downloaded successfully");
        }, 250);
      }
    } catch (error) {
      console.error("Dashboard PDF Export Error:", error);
      try {
        const fallbackPdf = new jsPDF('p', 'mm', 'a4');
        fallbackPdf.setFontSize(16);
        fallbackPdf.text(`${currentUser?.businessName || 'Business'} - Dashboard Report`, 14, 20);
        fallbackPdf.setFontSize(10);
        fallbackPdf.text(`Generated: ${new Date().toLocaleString()} | Filter: ${timeFilter.toUpperCase()}`, 14, 30);
        fallbackPdf.text(`Net Revenue: $${Number(netRevenue || 0).toFixed(2)}`, 14, 40);
        fallbackPdf.text(`Profit: $${Number(displayProfit || 0).toFixed(2)}`, 14, 50);
        fallbackPdf.save(`Dashboard-Report-${timeFilter}.pdf`);
        setTimeout(() => {
          alert("PDF downloaded successfully");
        }, 250);
      } catch (e) {
        alert("PDF download failed. Please try again.");
      }
    } finally {
      setIsExporting(false);
      if (dashboardRef.current) {
        const buttonsToHide = dashboardRef.current.querySelectorAll('.no-pdf-export');
        buttonsToHide.forEach((btn: any) => {
          const orig = btn.getAttribute('data-original-display');
          btn.style.display = orig || '';
        });
      }
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-8 p-2 bg-[#f8fafc]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('dashboardOverview')}</h2>
          <p className="text-sm text-slate-500">{t('businessPerformance')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 no-pdf-export">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            <button 
              onClick={() => setTimeFilter('today')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === 'today' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('today')}
            </button>
            <button 
              onClick={() => setTimeFilter('7days')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === '7days' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('last7Days')}
            </button>
            <button 
              onClick={() => setTimeFilter('30days')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === '30days' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('last30Days')}
            </button>
            <button 
              onClick={() => setTimeFilter('custom')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === 'custom' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('customDate')}
            </button>
          </div>
        </div>
      </div>

      {timeFilter === 'custom' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-4 no-pdf-export">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t('startDate')}:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t('endDate')}:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      )}

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
          {hasPermission('sales', 'view') && (
            <Card>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{t('profitVsLossTrend')}</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-500">{t('profit')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-500">{t('loss')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-slate-500">{t('netProfit')} ({lang === 'bn' ? 'নেট রিভিউ' : 'Net Review'})</span>
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
                      tickFormatter={(value) => {
                        const absValue = Math.abs(value);
                        const formatted = lang === 'bn' ? `৳${toBengaliNumber(absValue)}` : `৳${absValue.toLocaleString()}`;
                        return value < 0 ? `-${formatted}` : formatted;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any, name: any) => {
                        const absValue = Math.abs(Number(value));
                        let displayName = name;
                        if (name === 'profit') displayName = t('profit') || 'Profit';
                        else if (name === 'loss') displayName = t('loss') || 'Loss';
                        else if (name === 'net') displayName = `${t('netProfit')} (${lang === 'bn' ? 'নেট রিভিউ' : 'Net Review'})`;
                        
                        if (name === 'net') {
                          return [value < 0 ? `-${formatCurrency(absValue)}` : formatCurrency(absValue), displayName];
                        }
                        return [formatCurrency(absValue), displayName];
                      }}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
                    <Bar 
                      dataKey="profit" 
                      fill="#10b981" 
                      stackId="a"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                    <Bar 
                      dataKey="loss" 
                      fill="#ef4444" 
                      stackId="a"
                      radius={[0, 0, 4, 4]}
                      maxBarSize={24}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#6366f1" 
                      strokeWidth={3.5} 
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {hasPermission('sales', 'view') && (
            <Card>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Recent Sales</h3>
                <Link to="/sales" className="text-sm text-emerald-600 font-medium hover:underline">View all</Link>
              </div>
              {(data?.sales || []).length > 0 ? (
                <Table headers={['Customer', 'Date', 'Sales Price', 'Status']}>
                  {(data?.sales || []).slice(-5).reverse().map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.customerName}</div>
                        <div className="text-xs text-slate-500">INV-{item.id.slice(-4)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(item.total)}</td>
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
          )}
        </div>

        <div className="space-y-6">
          {hasPermission('inventory', 'view') && (
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
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {item.brand && <span className="text-[10px] text-slate-400 font-medium mr-1">{item.brand}</span>}
                        {item.name}
                      </p>
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
        )}
      </div>
    </div>
  </div>
);
};

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pleasant beep
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    console.log("Audio beep failed: ", e);
  }
};

const playErrorBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(120, audioCtx.currentTime); // Low buzz
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.22);
  } catch (e) {
    console.log("Audio beep failed: ", e);
  }
};

const QRScanner = ({ onScan, onClose, inventory }: { onScan: (data: string) => string, onClose: () => void, inventory: any[] }) => {
  const [scanMessage, setScanMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2 || state === 3) { // SCANNING or PAUSED
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn("Stop scanner error:", e);
      } finally {
        scannerRef.current = null;
        setIsCameraActive(false);
        setIsLoading(false);
      }
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  const startBackCamera = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Make sure any previous scanner instance is stopped cleanly
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2 || state === 3) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (_) {}
      }

      const qr = new Html5Qrcode("qr-reader");
      scannerRef.current = qr;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const onScanSuccess = (decodedText: string) => {
        const now = Date.now();
        // Cool-down to prevent double scan within 1.5 seconds
        if (lastScanRef.current.code === decodedText && now - lastScanRef.current.time < 1500) {
          return;
        }

        lastScanRef.current = { code: decodedText, time: now };

        const product = inventory.find((p: any) => 
          String(p.id) === String(decodedText) || 
          p.serialNumber === decodedText || 
          p.modelNumber === decodedText
        );

        if (!product) {
          setErrorMessage("Product not found in Inventory!");
          setScanMessage('');
          playErrorBeep();
          return;
        }

        if (product.quantity <= 0) {
          setErrorMessage(`${product.name} is out of stock!`);
          setScanMessage('');
          playErrorBeep();
          return;
        }

        const status = onScan(decodedText);
        if (status === 'out_of_stock_exceeded') {
          setErrorMessage(`Cannot exceed available stock of ${product.quantity} units for ${product.name}`);
          setScanMessage('');
          playErrorBeep();
          return;
        } else if (status === 'not_found' || status === 'out_of_stock') {
          setErrorMessage(`${product.name} is out of stock or not found`);
          setScanMessage('');
          playErrorBeep();
          return;
        }

        // Success feedback
        playBeep();
        setErrorMessage('');
        const actionText = status === 'updated' ? 'Quantity +1' : 'Added to list';
        setScanMessage(`Scanned: ${product.name} (${actionText})`);

        // Clear message after 2.5 seconds
        setTimeout(() => {
          setScanMessage(prev => prev.includes(product.name) ? '' : prev);
        }, 2500);
      };

      // Request Back Camera specifically using facingMode: "environment"
      try {
        await qr.start(
          { facingMode: "environment" }, // Specifically Back Camera
          config,
          onScanSuccess,
          () => {} // Silent frame scan
        );
      } catch (errEnvironment) {
        console.warn("Direct facingMode: environment failed, checking cameras list...", errEnvironment);
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Select back camera if available by label, else default to rear/last or first camera
          const backCam = cameras.find(c => {
            const label = (c.label || '').toLowerCase();
            return label.includes('back') || label.includes('rear') || label.includes('environment');
          }) || (cameras.length > 1 ? cameras[cameras.length - 1] : cameras[0]);

          await qr.start(
            backCam.id,
            config,
            onScanSuccess,
            () => {}
          );
        } else {
          throw errEnvironment;
        }
      }

      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Failed to start back camera:", err);
      const isPermissionErr = err?.name === 'NotAllowedError' || String(err).includes('Permission') || String(err).includes('NotAllowedError');
      setErrorMessage(
        isPermissionErr
          ? "Camera permission was denied. Please allow camera access in your browser."
          : "Could not activate back camera. Please verify your camera is connected."
      );
      setIsCameraActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2 || state === 3) {
            scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
            }).catch(() => {});
          } else {
            scannerRef.current.clear();
          }
        } catch (_) {}
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl border border-slate-100">
        <button 
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full z-20 transition-colors cursor-pointer"
          title="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-1 text-center">Scan Product QR Code</h3>
          <p className="text-xs text-slate-500 text-center mb-4">Continuous scanning is active. Items add automatically.</p>
          
          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative min-h-[300px] flex items-center justify-center shadow-inner">
            {/* The mounting container for Html5Qrcode video */}
            <div 
              id="qr-reader" 
              className="w-full"
              style={{ minHeight: '300px' }}
            />

            {/* Clean Initial UI: Only Request Camera Permissions (No Scan Image File, No Info icon, No clutter) */}
            {!isCameraActive && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-5 text-slate-700">
                  <Smartphone size={36} className="text-slate-700 stroke-[1.75]" />
                </div>

                <button
                  type="button"
                  id="btn-request-camera-permissions"
                  onClick={startBackCamera}
                  disabled={isLoading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Starting Back Camera...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      <span>Request Camera Permissions</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Active Status & Stop Controller */}
          {isCameraActive && (
            <div className="mt-3 px-3 py-2 bg-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Back Camera Active</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Stop Camera
              </button>
            </div>
          )}

          {/* Status Feedback Popups */}
          {scanMessage && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs font-semibold animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <span>{scanMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-2xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span>{errorMessage}</span>
            </div>
          )}
          
          <p className="mt-4 text-xs text-slate-400 text-center font-medium">
            Point camera at a product QR code to scan. Use [X] at the top to exit.
          </p>
        </div>
      </div>
    </div>
  );
};

const Inventory = ({ data }: any) => {
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRItem, setSelectedQRItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '', price: '', minStock: '5', modelNumber: '', brand: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const { formatCurrency, toBengaliNumber } = useCurrency();
  const { t } = useTranslation();

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      data.editItem('inventory', editingItem.id, {
        ...newItem,
        quantity: parseBanglaInt(newItem.quantity),
        price: parseBanglaFloat(newItem.price),
        minStock: parseBanglaInt(newItem.minStock)
      }, data.setInventory);
    } else {
      data.addInventory({
        ...newItem,
        quantity: parseBanglaInt(newItem.quantity),
        price: parseBanglaFloat(newItem.price),
        minStock: parseBanglaInt(newItem.minStock)
      });
    }
    setNewItem({ name: '', category: '', quantity: '', price: '', minStock: '5', modelNumber: '', brand: '' });
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setNewItem({
      name: item.name || '',
      category: item.category || '',
      quantity: (item.quantity !== undefined && item.quantity !== null) ? item.quantity.toString() : '0',
      price: (item.price !== undefined && item.price !== null) ? item.price.toString() : '0',
      minStock: (item.minStock !== undefined && item.minStock !== null) ? item.minStock.toString() : '5',
      modelNumber: item.modelNumber || '',
      brand: item.brand || ''
    });
    setIsModalOpen(true);
  };

  const openQR = (item: any) => {
    setSelectedQRItem(item);
    setIsQRModalOpen(true);
  };

  const categories = ['All', ...new Set((data.inventory || []).map((item: any) => item.category || 'General'))];

  const filteredInventory = (data.inventory || []).filter((item: any) => {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = name.includes(query) || category.includes(query);
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Management" 
        description="Track and manage your stock levels." 
        action={hasPermission('inventory', 'edit') ? "Add Item" : null} 
        onAction={() => { setEditingItem(null); setNewItem({ name: '', category: '', quantity: '', price: '', minStock: '5', modelNumber: '', brand: '' }); setIsModalOpen(true); }}
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
                  <div className="flex flex-col gap-0.5">
                    {item.brand && <div className="text-[10px] text-slate-500 font-medium">Brand: {item.brand}</div>}
                    {item.modelNumber && <div className="text-[10px] text-emerald-600 font-bold uppercase">Model: {item.modelNumber}</div>}
                    <div className="text-xs text-slate-500">SKU-{item.id.slice(-4)}</div>
                  </div>
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
                <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(item.price)}</td>
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
                    {hasPermission('inventory', 'edit') && (
                      <button 
                        onClick={() => openEdit(item)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                    )}
                    {hasPermission('inventory', 'delete') && (
                      <button 
                        onClick={() => data.deleteItem('inventory', item.id, data.setInventory)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    )}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('brandName')}</label>
            <input 
              type="text" 
              value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              placeholder="Enter brand name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model / Serial Number</label>
            <input 
              type="text" 
              value={newItem.modelNumber} onChange={e => setNewItem({...newItem, modelNumber: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              placeholder="Enter model or serial number"
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
              <p className="text-lg font-bold text-emerald-600 mt-2">{formatCurrency(selectedQRItem.price)}</p>
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

const InvoiceContent = ({ sale, user, contentRef }: { sale: any, user: any, contentRef?: any }) => {
  const { formatCurrency } = useCurrency();
  return (
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
    <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-6">
      <div className="flex items-center gap-4">
        {user?.logo && <img src={user.logo} alt="Logo" className="w-16 h-16 object-contain" />}
        <div>
          <h3 className="text-2xl font-black" style={{ color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>{user?.businessName || 'GreensStock'}</h3>
          <div className="text-[12px] font-semibold text-slate-600 mt-2 uppercase tracking-tight leading-relaxed">
            {user?.address && <div><span className="text-slate-400 font-bold">Address:</span> {user.address}</div>}
            <div className="flex flex-wrap gap-x-4">
              {user?.email && <span><span className="text-slate-400 font-bold">Email:</span> {user.email}</span>}
              {user?.phoneNumber && <span><span className="text-slate-400 font-bold">Phone:</span> {user.phoneNumber}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-3xl font-black mb-1" style={{ color: '#0f172a', margin: 0 }}>INVOICE</h2>
        <p className="font-bold text-sm" style={{ color: '#64748b', margin: 0 }}>#INV-{sale.id.slice(-6).toUpperCase()}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8 mb-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-slate-100 pb-1 w-fit" style={{ color: '#94a3b8' }}>Bill To:</h4>
        <div className="font-black text-slate-900" style={{ fontSize: '1.4rem', marginBottom: '0.45rem' }}>{sale.customerName}</div>
        <div className="text-[13px] font-semibold text-slate-600 space-y-1">
          {sale.customerPhone && <div className="flex items-center gap-1"><span className="text-slate-400 font-bold">Phone:</span> {sale.customerPhone}</div>}
          {sale.customerEmail && <div className="flex items-center gap-1"><span className="text-slate-400 font-bold">Email:</span> {sale.customerEmail}</div>}
          {sale.customerAddress && <div className="flex items-start gap-1 pt-1 leading-snug max-w-[250px]"><span className="text-slate-400 font-bold">Address:</span> {sale.customerAddress}</div>}
        </div>
      </div>
      <div className="text-right flex flex-col items-end justify-center">
        <div className="pt-4 flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Invoice Date</span>
          <span className="font-bold text-slate-700">{(sale.date || '').split('T')[0]}</span>
        </div>
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
            sale.items.map((item: any, idx: number) => {
              const itemQty = Number(item.quantity) || 1;
              const unitPrice = itemQty > 0 ? (Number(item.total) / itemQty) : (Number(item.buyPrice) || Number(item.total));
              return (
                <tr key={idx} style={{ borderBottom: idx !== sale.items.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <div className="font-bold" style={{ color: '#0f172a' }}>
                      {item.brand && <span className="text-[10px] text-slate-400 font-medium block leading-none mb-0.5">{item.brand}</span>}
                      {item.productName}
                    </div>
                    <div className="text-xs" style={{ color: '#64748b', fontSize: '0.75rem' }}>Category: {item.productCategory}</div>
                    {item.serialNumber && <div className="text-xs font-mono" style={{ color: '#059669', fontSize: '0.75rem' }}>SN: {item.serialNumber}</div>}
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'center', color: '#334155', fontWeight: 'bold' }}>{itemQty}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', color: '#334155' }}>{formatCurrency(unitPrice)}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontStyle: 'normal', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(item.total)}</td>
                </tr>
              );
            })
          ) : (
            (() => {
              const saleQty = Number(sale.quantity) || 1;
              const unitPrice = saleQty > 0 ? (Number(sale.total) / saleQty) : (Number(sale.buyPrice) || Number(sale.total));
              return (
                <tr>
                  <td style={{ padding: '1rem 0' }}>
                    <div className="font-bold" style={{ color: '#0f172a' }}>
                      {sale.brand && <span className="text-[10px] text-slate-400 font-medium block leading-none mb-0.5">{sale.brand}</span>}
                      {sale.productName}
                    </div>
                    <div className="text-xs" style={{ color: '#64748b', fontSize: '0.75rem' }}>Category: {sale.productCategory}</div>
                    {sale.serialNumber && <div className="text-xs font-mono" style={{ color: '#059669', fontSize: '0.75rem' }}>SN: {sale.serialNumber}</div>}
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'center', color: '#334155', fontWeight: 'bold' }}>{saleQty}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', color: '#334155' }}>{formatCurrency(unitPrice)}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontStyle: 'normal', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(sale.total)}</td>
                </tr>
              );
            })()
          )}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: '250px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: '0.5rem' }}>
          <span>Subtotal</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: '0.5rem' }}>
          <span>Tax (0%)</span>
          <span>{formatCurrency(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
          <span>Total</span>
          <span style={{ color: '#059669' }}>{formatCurrency(sale.total)}</span>
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
        <p className="text-[10px] uppercase tracking-tighter" style={{ color: '#94a3b8', fontSize: '0.625rem', marginTop: '0.25rem', margin: 0 }}>Generated by {user?.businessName || 'GreensStock'}</p>
      </div>
    </div>
  </div>
);
};

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
      setError("Printing issue. Please use the browser's print option.");
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
        setError('PDF download issue. Please use the print button and select "Save as PDF".');
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
      alert("Pop-up blocked. Please allow pop-ups in your browser.");
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
      setError('Image download issue.');
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
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const { t, lang } = useTranslation();
  const { formatCurrency, toBengaliNumber } = useCurrency();
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
      productName: '',
      brand: ''
    }],
    date: getTodayStr() 
  });

  const handleScan = (decodedText: string): string => {
    const product = data.inventory.find((p: any) => 
      String(p.id) === String(decodedText) || 
      p.serialNumber === decodedText || 
      p.modelNumber === decodedText
    );
    if (!product) {
      return 'not_found';
    }
    if (product.quantity <= 0) {
      return 'out_of_stock';
    }
    
    const existingIndex = newSale.items.findIndex((item: any) => item.productId === product.id);
    if (existingIndex !== -1) {
      const currentQty = parseInt(newSale.items[existingIndex].quantity) || 0;
      const newQty = currentQty + 1;
      if (newQty > product.quantity) {
        return 'out_of_stock_exceeded';
      }
      const updatedItems = [...newSale.items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: newQty.toString(),
        total: (product.price * newQty).toString()
      };
      setNewSale({ ...newSale, items: updatedItems });
      return 'updated';
    } else {
      const newItemEntry = {
        productId: product.id,
        productCategory: product.category,
        productName: product.name,
        brand: product.brand || '',
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
      return 'added';
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
        productName: '',
        brand: ''
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

    if (field === 'productCategory') {
      item.brand = '';
      item.productId = '';
      item.productName = '';
      item.total = '0';
      item.buyPrice = 0;
    } else if (field === 'brand') {
      item.productId = '';
      item.productName = '';
      item.total = '0';
      item.buyPrice = 0;
    } else if (field === 'productId') {
      const product = data.inventory.find((p: any) => p.id === value);
      if (product) {
        item.productName = product.name;
        item.brand = product.brand || '';
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
      customerName: newSale.customerName.trim() || (lang === 'bn' ? 'তৎক্ষণাৎ ক্রেতা' : 'Walk-in Customer'),
      customerPhone: newSale.customerPhone,
      customerEmail: newSale.customerEmail,
      customerAddress: newSale.customerAddress,
      items: newSale.items.map(item => ({
        ...item,
        quantity: parseBanglaInt(item.quantity) || 1,
        total: parseBanglaFloat(item.total)
      })),
      quantity: newSale.items.reduce((acc, item) => acc + (parseBanglaInt(item.quantity) || 1), 0),
      total: totalAmount,
      date: newSale.date
    });

    // 2. Update Inventory for each item
    newSale.items.forEach(item => {
      const product = data.inventory.find((p: any) => p.id === item.productId);
      if (product) {
        data.editItem('inventory', item.productId, {
          quantity: (Number(product.quantity) || 0) - (parseBanglaInt(item.quantity) || 0)
        }, data.setInventory);
      }
    });

    // 3. Update/Add Customer (Strong focus on Name for distinctness)
    const custName = newSale.customerName.trim();
    if (custName) {
      const searchName = custName.toLowerCase();
      
      // Match by Name only to ensure "Sam" and "jean" with same phone stay separate
      const existingCustomer = data.customers.find((c: any) => 
        (c.name || '').trim().toLowerCase() === searchName
      );

      if (existingCustomer) {
        data.editItem('customers', existingCustomer.id, {
          orders: (Number(existingCustomer.orders) || 0) + 1,
          spent: (Number(existingCustomer.spent) || 0) + totalAmount,
          phone: newSale.customerPhone || existingCustomer.phone,
          email: newSale.customerEmail || existingCustomer.email,
          address: newSale.customerAddress || existingCustomer.address
        }, data.setCustomers);
      } else {
        data.addCustomer({
          name: custName,
          email: newSale.customerEmail,
          phone: newSale.customerPhone,
          address: newSale.customerAddress,
          orders: 1,
          spent: totalAmount
        });
      }
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
        productName: '',
        brand: ''
      }],
      date: getTodayStr() 
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales History" 
        description="View and manage your business transactions." 
        action={hasPermission('sales', 'edit') ? "New Sale" : null} 
        onAction={() => setIsModalOpen(true)}
      />
      <Card>
        {data.sales.length > 0 ? (
          <Table headers={['Invoice', 'Customer', 'Items', 'Date', 'Total Amount', 'Actions']}>
            {[...data.sales].sort((a: any, b: any) => b.id.localeCompare(a.id)).map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">#INV-{item.id.slice(-4)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium">{item.customerName}</div>
                  {item.customerPhone && <div className="text-xs text-slate-400">{item.customerPhone}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.items ? (
                    (() => {
                      const totalQty = item.items.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);
                      const qtyLabel = lang === 'bn' 
                        ? `${toBengaliNumber(totalQty)} টি পণ্য` 
                        : `${totalQty} ${totalQty === 1 ? 'Product' : 'Products'}`;
                      const detailText = item.items.map((i: any) => {
                        const name = i.brand ? `${i.brand} ${i.productName}` : i.productName;
                        const q = Number(i.quantity) || 1;
                        return `${name}${q > 1 ? ` (x${q})` : ''}`;
                      }).join(', ');
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-emerald-600">{qtyLabel}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={detailText}>
                            {detailText}
                          </span>
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const totalQty = Number(item.quantity) || 1;
                      const qtyLabel = lang === 'bn' 
                        ? `${toBengaliNumber(totalQty)} টি পণ্য` 
                        : `${totalQty} ${totalQty === 1 ? 'Product' : 'Products'}`;
                      const name = item.brand ? `${item.brand} ${item.productName}` : item.productName;
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-emerald-600">{qtyLabel}</span>
                          <span className="text-[10px] text-slate-400">
                            {name}{totalQty > 1 ? ` (x${totalQty})` : ''}
                          </span>
                        </div>
                      );
                    })()
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{(item.date || '').split('T')[0]}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(item.total)}</td>
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
                    {hasPermission('sales', 'delete') && (
                      <button 
                        onClick={() => data.deleteItem('sales', item.id, data.setSales)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    )}
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
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {lang === 'bn' ? 'ক্রেতার নাম (ঐচ্ছিক)' : 'Customer Name (Optional)'}
                </label>
                <input 
                  type="text" 
                  value={newSale.customerName} onChange={e => setNewSale({...newSale, customerName: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                  placeholder={lang === 'bn' ? 'তৎক্ষণাৎ ক্রেতা' : 'Walk-in Customer'}
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('brandName')}</label>
                      <select 
                        value={item.brand}
                        onChange={(e) => updateItem(index, 'brand', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        <option value="">Select Brand</option>
                        {Array.from(new Set(data.inventory
                          .filter((p: any) => !item.productCategory || p.category === item.productCategory)
                          .map((p: any) => p.brand)
                          .filter(Boolean)
                        )).map((brand: any) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product</label>
                      <input 
                        list={`product-list-${index}`}
                        type="text"
                        required
                        placeholder="Search product..."
                        value={item.productName || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(index, 'productName', val);
                          const product = data.inventory.find((p: any) => p.name === val);
                          if (product) {
                            updateItem(index, 'productId', product.id);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                      <datalist id={`product-list-${index}`}>
                        {data.inventory
                          .filter((p: any) => (!item.productCategory || p.category === item.productCategory) && (!item.brand || p.brand === item.brand))
                          .map((p: any) => (
                            <option key={p.id} value={p.name}>
                              {p.name} ({formatCurrency(p.price)}) - Stock: {p.quantity}
                            </option>
                          ))
                        }
                      </datalist>
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
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Serial Number (Optional)</label>
                      <input 
                        type="text"
                        list="serial-list"
                        value={item.serialNumber}
                        onChange={(e) => updateItem(index, 'serialNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="SN-XXXXX"
                      />
                      <datalist id="serial-list">
                        {Array.from(new Set(data.sales.flatMap((s: any) => (s.items || []).map((i: any) => i.serialNumber)).filter(Boolean))).map((sn: any) => (
                          <option key={sn} value={sn} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="font-bold text-emerald-800">Grand Total</span>
              <span className="text-2xl font-black text-emerald-600">{formatCurrency(totalAmount)}</span>
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
        <QRScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} inventory={data.inventory} />
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
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', category: '', contact: '', address: '' });
  const { formatCurrency } = useCurrency();

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    data.addSupplier(newSupplier);
    setNewSupplier({ name: '', category: '', contact: '', address: '' });
    setIsModalOpen(false);
  };

  const handleView = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Suppliers" 
        description="Manage your supply chain partners." 
        action={hasPermission('suppliers', 'edit') ? "Add Supplier" : null} 
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
                {hasPermission('suppliers', 'delete') && (
                  <button 
                    onClick={() => data.deleteItem('suppliers', item.id, data.setSuppliers)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
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
              <div className="flex items-center gap-2 mt-6">
                <button 
                  onClick={() => handleView(item)}
                  className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  View Details
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState 
            icon={Truck} 
            title="No suppliers yet" 
            description="Keep track of your vendors and supply chain partners here."
            action={hasPermission('suppliers', 'edit') ? "Add Supplier" : null}
            onAction={() => setIsModalOpen(true)}
          />
        </Card>
      )}

      {/* View Supplier Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Supplier Details">
        {selectedSupplier && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                <Truck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedSupplier.name}</h3>
                <p className="text-sm text-slate-500">{selectedSupplier.category}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Information</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Users size={16} className="text-blue-500" />
                  <span>{selectedSupplier.contact}</span>
                </div>
              </div>
              
              {selectedSupplier.address && (
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Office Address</p>
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin size={16} className="text-blue-500 mt-1" />
                    <span>{selectedSupplier.address}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

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
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '', orders: '0', spent: '0' });
  const { t, lang } = useTranslation();
  const { formatCurrency, toBengaliNumber } = useCurrency();

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
        action={hasPermission('customers', 'edit') ? "Add Customer" : null} 
        onAction={() => setIsModalOpen(true)}
      />
      <Card>
        {data.customers.length > 0 ? (
          <Table headers={['Customer Name', 'Contact Info', 'Total Orders', 'Total Spent', 'Actions']}>
            {[...data.customers].sort((a: any, b: any) => b.id.localeCompare(a.id)).map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{(item.name || 'U')[0]}</div>
                    <div className="font-medium text-slate-900">{item.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div>{item.email}</div>
                  <div>{item.phone}</div>
                  {item.address && <div className="text-xs text-slate-400 italic">{item.address}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.orders}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(item.spent)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleView(item)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                      View
                    </button>
                    {hasPermission('customers', 'delete') && (
                      <button 
                        onClick={() => data.deleteItem('customers', item.id, data.setCustomers)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    )}
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
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedCustomer.spent)}</p>
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
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(sale.total)}</p>
                        <p className="text-[10px] text-slate-400">
                          {sale.items 
                            ? sale.items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0)
                            : (Number(sale.quantity) || 1)} {lang === 'bn' ? 'টি পণ্য' : 'items'}
                        </p>
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
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatCurrency } = useCurrency();
  const [newExpense, setNewExpense] = useState({ 
    category: '', 
    description: '', 
    amount: '', 
    date: getTodayStr(),
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
      date: getTodayStr(),
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
        action={hasPermission('expenses', 'edit') ? "Add Expense" : null} 
        onAction={() => setIsModalOpen(true)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {data.expenses.length > 0 ? (
              <Table headers={['Date', 'Category', 'Description', 'Amount', 'Actions']}>
                {[...data.expenses].sort((a: any, b: any) => b.id.localeCompare(a.id)).map((item: any) => (
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
                    <td className="px-6 py-4 font-semibold text-red-600">-{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4">
                      {hasPermission('expenses', 'delete') && (
                        <button 
                          onClick={() => data.deleteItem('expenses', item.id, data.setExpenses)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      )}
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
                <span className="text-lg font-bold text-red-600">-{formatCurrency(data.expenses.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0))}</span>
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
                      <span className="font-semibold text-slate-900">{formatCurrency(amount)}</span>
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

const Returns = ({ data }: any) => {
  const { t, lang } = useTranslation();
  const { hasPermission } = useAuth();
  const [invoiceNo, setInvoiceNo] = useState('');
  const [foundSale, setFoundSale] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [returnType, setReturnType] = useState<'Return' | 'Replace'>('Return');
  const [reason, setReason] = useState('');
  const [replaceAmount, setReplaceAmount] = useState('0');
  const [replacementProduct, setReplacementProduct] = useState('');
  const [replacementSerial, setReplacementSerial] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { formatCurrency, toBengaliNumber } = useCurrency();

  const handleSearch = () => {
    setSearchError('');
    setFoundSale(null);
    const cleanInp = invoiceNo.replace('INV-', '').toUpperCase();
    const sale = data.sales.find((s: any) => 
      (s.invoiceNo && s.invoiceNo.toUpperCase().includes(cleanInp)) || 
      s.id.toUpperCase().endsWith(cleanInp) ||
      s.id === invoiceNo
    );
    if (sale) {
      setFoundSale(sale);
    } else {
      setSearchError('Invoice not found. Search by last 4-6 digits of Invoice #');
    }
  };

  const handleProcess = async () => {
    if (!foundSale) return;
    setIsProcessing(true);
    
    try {
      const returnId = `${Date.now()}`;
      // Negative for money out (Refund), Positive for money in (Extra)
      const amount = returnType === 'Return' ? -foundSale.total : parseFloat(replaceAmount);
      
      const returnData = {
        id: returnId,
        invoiceNo: foundSale.invoiceNo || foundSale.id,
        customerName: foundSale.customerName,
        totalAmount: amount,
        reason,
        type: returnType,
        replacementProduct: returnType === 'Replace' ? replacementProduct : '',
        replacementSerial: returnType === 'Replace' ? replacementSerial : '',
        date: getTodayStr()
      };

      await data.addReturn(returnData);

      alert(`${returnType} processed successfully! Full refund of ${formatCurrency(amount)} has been recorded.`);
      setFoundSale(null);
      setInvoiceNo('');
      setReason('');
      setReplaceAmount('0');
      setReplacementProduct('');
      setReplacementSerial('');
      if (data.fetchData) data.fetchData();
    } catch (e) {
      alert('Error processing return.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('returns')} 
        description="Handle customer returns and product replacements." 
      />
      
      {!foundSale && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 flex items-center gap-3 text-blue-700">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">
            {lang === 'bn' 
              ? "ইনভয়েস নম্বর দিয়ে সার্চ করুন - এরপর আপনি রিটার্ন বা রিপ্লেস অপশনগুলো দেখতে পাবেন।" 
              : t('searchInvoice') + " to see return/replace options."}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">{t('searchInvoice')}</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('searchInvoice') + "..."} 
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                {t('process')}
              </button>
            </div>
            {searchError && <p className="text-xs text-red-500 mt-2 font-medium">{searchError}</p>}
          </Card>

          {foundSale && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{foundSale.customerName}</h3>
                    <p className="text-sm text-slate-500">Invoice: #{foundSale.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">Date: {foundSale.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Sale Amount</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(foundSale.total)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setReturnType('Return')}
                      className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                        returnType === 'Return' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t('totalReturn')}
                    </button>
                    <button 
                      onClick={() => setReturnType('Replace')}
                      className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                        returnType === 'Replace' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t('replaceItem')}
                    </button>
                  </div>

                  {returnType === 'Replace' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('adjustmentAmount')}
                        </label>
                        
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-3">
                          <button 
                            type="button"
                            onClick={() => {
                              const mag = Math.abs(parseFloat(replaceAmount) || 0);
                              setReplaceAmount(mag.toString());
                            }}
                            className={cn(
                              "flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1",
                              parseFloat(replaceAmount) >= 0 ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                            )}
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            {t('extra')} (+)
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              const mag = Math.abs(parseFloat(replaceAmount) || 0);
                              setReplaceAmount((mag * -1).toString());
                            }}
                            className={cn(
                              "flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1",
                              parseFloat(replaceAmount) < 0 ? "bg-white text-red-600 shadow-sm" : "text-slate-500"
                            )}
                          >
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            {t('refund')} (-)
                          </button>
                        </div>

                        <div className="relative">
                          <input 
                            type="number" step="0.01"
                            value={Math.abs(parseFloat(replaceAmount))}
                            onChange={(e) => {
                              const mag = Math.abs(parseFloat(e.target.value) || 0);
                              const currentSign = parseFloat(replaceAmount) < 0 ? -1 : 1;
                              setReplaceAmount((mag * currentSign).toString());
                            }}
                            className={cn(
                              "w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 font-bold text-lg",
                              parseFloat(replaceAmount) < 0 
                                ? "bg-red-50/30 border-red-200 focus:ring-red-500/20 text-red-700" 
                                : "bg-emerald-50/30 border-emerald-200 focus:ring-emerald-500/20 text-emerald-700"
                            )}
                            placeholder="0.00"
                          />
                          <div className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 font-black text-xs uppercase",
                            parseFloat(replaceAmount) < 0 ? "text-red-500" : "text-emerald-500"
                          )}>
                            {parseFloat(replaceAmount) < 0 ? t('refund') : t('extra')}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {lang === 'bn' 
                            ? (parseFloat(replaceAmount) < 0 
                              ? "গ্রাহককে টাকা ফেরত দিলে (Refund) অপশনটি ব্যবহার করুন।" 
                              : "গ্রাহক বাড়তি টাকা দিলে (Extra) অপশনটি ব্যবহার করুন।")
                            : (parseFloat(replaceAmount) < 0
                              ? "Select Refund if you are returning money to the customer."
                              : "Select Extra if the customer is paying an additional amount.")
                          }
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('replacementProduct')}</label>
                        <input 
                          type="text"
                          list="replace-product-list"
                          value={replacementProduct}
                          onChange={(e) => setReplacementProduct(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder={t('replacementProduct')}
                        />
                        <datalist id="replace-product-list">
                          {data.inventory.map((p: any) => (
                            <option key={p.id} value={p.name}>
                              {p.name} - Stock: {p.quantity}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Replacement Serial Number (Optional)</label>
                        <input 
                          type="text"
                          list="replace-serial-list"
                          value={replacementSerial}
                          onChange={(e) => setReplacementSerial(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="SN-XXXXX"
                        />
                        <datalist id="replace-serial-list">
                          {Array.from(new Set(data.sales.flatMap((s: any) => (s.items || []).map((i: any) => i.serialNumber)).filter(Boolean))).map((sn: any) => (
                            <option key={sn} value={sn} />
                          ))}
                        </datalist>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('reasonFor')} {returnType}</label>
                    <textarea 
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                      placeholder={`Why is the customer ${returnType.toLowerCase()}ing?`}
                    />
                  </div>

                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing || !reason || !hasPermission('returns', 'edit')}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : `${t('process')} ${returnType}`}
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6">{t('recentRecords')}</h3>
            {data.returns.length > 0 ? (
              <div className="space-y-4">
                {[...data.returns].sort((a,b) => b.id.localeCompare(a.id)).slice(0, 10).map((ret: any) => (
                  <div key={ret.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{ret.customerName}</span>
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-black rounded-full uppercase",
                          ret.type === 'Return' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        )}>{ret.type}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Inv: #{(ret.invoiceNo || '').slice(-6)} • {ret.date}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic">"{ret.reason}"</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className={cn(
                        "font-bold",
                        ret.totalAmount < 0 ? "text-red-500" : "text-emerald-500"
                      )}>
                        {ret.totalAmount < 0 ? '-' : '+'}{formatCurrency(Math.abs(ret.totalAmount))}
                      </p>
                      {hasPermission('returns', 'delete') && (
                        <button 
                          onClick={() => data.deleteItem('returns', ret.id, data.setReturns)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <RotateCcw className="mx-auto mb-3 opacity-20" size={48} />
                <p>No records found.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const Reports = ({ data, user: propUser }: any) => {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser;
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'custom'>('30days');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useTranslation();
  const { formatCurrency, toBengaliNumber } = useCurrency();

  // Helper to filter by date
  const isWithinRange = (dateStr: string) => {
    if (!dateStr) return false;
    
    // Parse YYYY-MM-DD as local date to avoid timezone shift issues with new Date(dateStr)
    const parts = dateStr.split('-');
    let date: Date;
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      date = new Date(dateStr);
    }
    date.setHours(0, 0, 0, 0);
    
    if (timeFilter === 'custom') {
      if (!startDate && !endDate) return true;
      const start = startDate ? new Date(startDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      
      if (start && end) {
        return date >= start && date <= end;
      } else if (start) {
        return date >= start;
      } else if (end) {
        return date <= end;
      }
      return true;
    }
    
    const rangeDate = new Date();
    rangeDate.setHours(0, 0, 0, 0);
    
    if (timeFilter === '7days') rangeDate.setDate(rangeDate.getDate() - 7);
    else if (timeFilter === '30days') rangeDate.setDate(rangeDate.getDate() - 30);
    // else if 'today', rangeDate is already today at 00:00:00
    
    return date >= rangeDate;
  };

  const filteredSales = data.sales.filter((s: any) => isWithinRange(s.date));
  const filteredExpenses = data.expenses.filter((e: any) => isWithinRange(e.date));
  const filteredReturns = (data.returns || []).filter((r: any) => isWithinRange(r.date));

  // Consistent calculations matching Dashboard
  let totalSalesProfit = 0;
  let totalSalesLoss = 0;
  let totalSalesGross = 0;

  filteredSales.forEach((s: any) => {
    totalSalesGross += (s.total || 0);
    if (s.items) {
      s.items.forEach((item: any) => {
        const cost = (item.buyPrice || 0) * item.quantity;
        const profit = item.total - cost;
        if (profit > 0) totalSalesProfit += profit;
        else if (profit < 0) totalSalesLoss += Math.abs(profit);
      });
    } else {
      const cost = (s.buyPrice || 0) * (s.quantity || 1);
      const profit = (s.total || 0) - cost;
      if (profit > 0) totalSalesProfit += profit;
      else if (profit < 0) totalSalesLoss += Math.abs(profit);
    }
  });

  const totalExpenses = filteredExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  const totalRefunds = Math.abs(filteredReturns.filter((r: any) => r.type === 'Return' || (r.type === 'Replace' && Number(r.totalAmount) < 0)).reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0));
  const totalExtraIncome = filteredReturns.filter((r: any) => r.type === 'Replace' && Number(r.totalAmount) > 0).reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0);
  
  const totalReturnsNet = filteredReturns.reduce((acc: number, r: any) => acc + (Number(r.totalAmount) || 0), 0);
  const totalRevenue = totalSalesGross + totalReturnsNet;

  // Consistent calculation reflecting Net Profit (Profit - Loss - Expenses - Refunds)
  const finalNet = (totalSalesProfit - totalSalesLoss) + totalExtraIncome - totalExpenses - totalRefunds;
  
  const currentProfit = Math.max(0, finalNet);
  const currentLoss = finalNet < 0 ? Math.abs(finalNet) : 0;
  const netProfit = finalNet;

  // Group sales by date for a simple chart
  const salesByDate = data.sales.reduce((acc: any, s: any) => {
    acc[s.date] = (acc[s.date] || 0) + s.total;
    return acc;
  }, {});

  const chartData = Object.entries(salesByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-7);

  const exportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const bName = currentUser?.businessName || 'GreensDesigner';
      const bPhone = currentUser?.phone || '';
      const bEmail = currentUser?.email || '';
      const bAddress = currentUser?.address || '';

      const periodLabel = timeFilter === 'custom' 
        ? `${startDate || 'Start'} to ${endDate || 'End'}` 
        : timeFilter === 'today' ? 'Today' 
        : timeFilter === '7days' ? 'Last 7 Days' 
        : 'Last 30 Days';

      const safeRevenue = Number(totalRevenue || 0);
      const safeNetProfit = Number(netProfit || 0);
      const safeCurrentProfit = Number(currentProfit || 0);
      const safeCurrentLoss = Number(currentLoss || 0);
      const safeExpenses = Number(totalExpenses || 0);
      const safeSalesCount = filteredSales?.length || 0;
      const safeExpensesCount = filteredExpenses?.length || 0;
      const safeInventoryTotal = data?.inventory?.length || 0;
      const safeLowStock = (data?.inventory || []).filter((i: any) => Number(i.quantity || 0) <= Number(i.minStock || 5)).length;
      const safeAdequateStock = Math.max(0, safeInventoryTotal - safeLowStock);
      const safeExpenseRatio = safeRevenue > 0 ? ((safeExpenses / safeRevenue) * 100).toFixed(1) : '0';

      const fileName = `Statement-${bName.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}-${timeFilter}.pdf`;

      let generated = false;

      // Primary visual capture with html2canvas if DOM element exists
      if (reportsRef.current) {
        try {
          const element = reportsRef.current;
          const buttonsToHide = element.querySelectorAll('.no-pdf-export');
          buttonsToHide.forEach((btn: any) => {
            btn.setAttribute('data-original-display', btn.style.display);
            btn.style.setProperty('display', 'none', 'important');
          });

          await new Promise(resolve => setTimeout(resolve, 80));

          const h2c = typeof html2canvas === 'function' ? html2canvas : (html2canvas as any)?.default;
          if (typeof h2c === 'function') {
            const canvas = await h2c(element, {
              scale: 1.5,
              useCORS: true,
              backgroundColor: '#f8fafc',
              allowTaint: false,
              logging: false
            });

            buttonsToHide.forEach((btn: any) => {
              const orig = btn.getAttribute('data-original-display');
              btn.style.display = orig || '';
            });

            if (canvas && canvas.width > 0 && canvas.height > 0) {
              const imgData = canvas.toDataURL('image/jpeg', 0.95);
              const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
              });
              pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
              pdf.save(fileName);
              generated = true;
            }
          }
        } catch (captureErr) {
          console.warn("Visual capture fallback triggered, generating Vector Statement PDF:", captureErr);
        }
      }

      // If visual capture was not generated, build the clean vector Business Statement PDF
      if (!generated) {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Dark banner header
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(0, 0, pageWidth, 34, 'F');

        // Business Name
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(bName, 14, 14);

        // Header Subtitles
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(203, 213, 225);
        pdf.text(`Statement Period: ${periodLabel}   |   Generated: ${new Date().toLocaleString()}`, 14, 22);

        const contactParts = [bPhone ? `Phone: ${bPhone}` : '', bEmail ? `Email: ${bEmail}` : '', bAddress ? `Address: ${bAddress}` : ''].filter(Boolean);
        if (contactParts.length > 0) {
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(contactParts.join('   |   '), 14, 28);
        }

        // Section Title
        let currentY = 44;
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Financial Statement Summary', 14, currentY);

        currentY += 6;
        const summaryCards = [
          { label: 'Net Profit / Balance', val: `${safeNetProfit >= 0 ? '+$' : '-$'}${Math.abs(safeNetProfit).toFixed(2)}`, bg: [236, 253, 245], textCol: [5, 150, 105] },
          { label: 'Net Revenue (Sales)', val: `$${safeRevenue.toFixed(2)}`, bg: [248, 250, 252], textCol: [15, 23, 42] },
          { label: 'Current Profit', val: `$${safeCurrentProfit.toFixed(2)}`, bg: [236, 253, 245], textCol: [5, 150, 105] },
          { label: 'Current Loss', val: `$${safeCurrentLoss.toFixed(2)}`, bg: [254, 242, 242], textCol: [220, 38, 38] },
          { label: 'Total Expenses', val: `$${safeExpenses.toFixed(2)}`, bg: [248, 250, 252], textCol: [15, 23, 42] },
          { label: 'Expense Ratio', val: `${safeExpenseRatio}%`, bg: [248, 250, 252], textCol: [15, 23, 42] },
        ];

        const cardWidth = (pageWidth - 28 - 10) / 2;
        summaryCards.forEach((c, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = 14 + col * (cardWidth + 10);
          const y = currentY + row * 20;

          pdf.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
          pdf.roundedRect(x, y, cardWidth, 16, 2, 2, 'F');

          pdf.setFontSize(8.5);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 116, 139);
          pdf.text(c.label, x + 5, y + 5.5);

          pdf.setFontSize(11.5);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(c.textCol[0], c.textCol[1], c.textCol[2]);
          pdf.text(c.val, x + 5, y + 12.5);
        });

        currentY += Math.ceil(summaryCards.length / 2) * 20 + 8;

        // Activity Overview
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Activity & Performance Metrics', 14, currentY);

        currentY += 6;
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'F');

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);
        pdf.text(`Total Sales / Invoices: ${safeSalesCount} orders   |   Expenses Recorded: ${safeExpensesCount} items`, 20, currentY + 8);
        pdf.text(`Total Inventory Items: ${safeInventoryTotal}   |   Adequate Stock: ${safeAdequateStock}   |   Low Stock Alerts: ${safeLowStock}`, 20, currentY + 15);

        currentY += 28;

        // Recent Sales Table for Statement
        const recentSales = (filteredSales || []).slice(0, 10);
        if (recentSales.length > 0) {
          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Statement Transactions Breakdown (Recent)', 14, currentY);

          currentY += 5;

          // Table Header
          pdf.setFillColor(241, 245, 249); // slate-100
          pdf.rect(14, currentY, pageWidth - 28, 7, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(71, 85, 105);
          pdf.text('Date', 18, currentY + 5);
          pdf.text('Invoice #', 42, currentY + 5);
          pdf.text('Customer', 82, currentY + 5);
          pdf.text('Payment', 135, currentY + 5);
          pdf.text('Total ($)', pageWidth - 22, currentY + 5, { align: 'right' });

          currentY += 7;

          recentSales.forEach((sale: any, idx: number) => {
            if (currentY > pageHeight - 20) return;
            const isEven = idx % 2 === 0;
            if (isEven) {
              pdf.setFillColor(255, 255, 255);
            } else {
              pdf.setFillColor(248, 250, 252);
            }
            pdf.rect(14, currentY, pageWidth - 28, 6.5, 'F');

            pdf.setFontSize(7.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(51, 65, 85);

            pdf.text(String(sale.date || '').slice(0, 10), 18, currentY + 4.5);
            pdf.text(String(sale.invoiceNumber || sale.id || 'N/A').slice(0, 14), 42, currentY + 4.5);
            pdf.text(String(sale.customerName || 'Walk-in Customer').slice(0, 24), 82, currentY + 4.5);
            pdf.text(String(sale.paymentMethod || 'Cash'), 135, currentY + 4.5);
            pdf.text(Number(sale.total || 0).toFixed(2), pageWidth - 22, currentY + 4.5, { align: 'right' });

            currentY += 6.5;
          });
        }

        // Footer
        pdf.setFontSize(7.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`This is a system-generated statement report for ${bName}. All rights reserved.`, 14, pageHeight - 8);

        pdf.save(fileName);
        generated = true;
      }

      // Success notification as requested by user in English
      setDownloadSuccessMessage("PDF downloaded successfully");
      setTimeout(() => setDownloadSuccessMessage(null), 5000);
      setTimeout(() => {
        alert("PDF downloaded successfully");
      }, 250);

    } catch (error) {
      console.error("Reports PDF Export Error:", error);
      // Failsafe direct download
      try {
        const fallbackPdf = new jsPDF('p', 'mm', 'a4');
        fallbackPdf.setFontSize(16);
        fallbackPdf.text(`${currentUser?.businessName || 'Business'} - Statement`, 14, 20);
        fallbackPdf.setFontSize(10);
        fallbackPdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        fallbackPdf.text(`Net Revenue: $${Number(totalRevenue || 0).toFixed(2)}`, 14, 40);
        fallbackPdf.text(`Net Profit: $${Number(netProfit || 0).toFixed(2)}`, 14, 50);
        fallbackPdf.save(`Statement-${timeFilter}.pdf`);
        
        setDownloadSuccessMessage("PDF downloaded successfully");
        setTimeout(() => setDownloadSuccessMessage(null), 5000);
        setTimeout(() => {
          alert("PDF downloaded successfully");
        }, 250);
      } catch (fallbackError) {
        alert("PDF download failed. Please try again.");
      }
    } finally {
      setIsExporting(false);
      if (reportsRef.current) {
        const buttonsToHide = reportsRef.current.querySelectorAll('.no-pdf-export');
        buttonsToHide.forEach((btn: any) => {
          const orig = btn.getAttribute('data-original-display');
          btn.style.display = orig || '';
        });
      }
    }
  };

  return (
    <div ref={reportsRef} className="space-y-6 p-2 bg-[#f8fafc]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title={t('reports')} description="Analyze your business performance over time." />
        <div className="flex flex-wrap items-center gap-3 no-pdf-export">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit shrink-0">
            <button 
              onClick={() => setTimeFilter('today')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === 'today' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('today')}
            </button>
            <button 
              onClick={() => setTimeFilter('7days')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === '7days' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('last7Days')}
            </button>
            <button 
              onClick={() => setTimeFilter('30days')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === '30days' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('last30Days')}
            </button>
            <button 
              onClick={() => setTimeFilter('custom')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                timeFilter === 'custom' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t('customDate')}
            </button>
          </div>

          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/10 transition-all cursor-pointer"
          >
            <Download size={14} />
            {isExporting ? t('processing') : t('downloadPDF')}
          </button>
        </div>
      </div>

      {timeFilter === 'custom' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-4 no-pdf-export">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t('startDate')}:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{t('endDate')}:</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      )}
      
      {/* Business Statement Info Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {currentUser?.logo ? (
            <img 
              src={currentUser.logo} 
              alt="Logo" 
              className="w-12 h-12 rounded-xl object-contain border border-slate-100 bg-slate-50 p-1 shrink-0" 
              crossOrigin="anonymous" 
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20 shrink-0">
              {(currentUser?.businessName || 'GS').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {currentUser?.businessName || 'Business Statement Report'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser?.phone ? `${currentUser.phone} • ` : ''}
              {currentUser?.email || 'Statement generated from POS & Inventory'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Statement: {timeFilter === 'custom' ? `${startDate || 'Start'} to ${endDate || 'End'}` : timeFilter === 'today' ? 'Today' : timeFilter === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Net Profit</p>
          <h3 className={cn("text-2xl font-bold mt-1", netProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
            {netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(netProfit))}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Final Balance
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">{t('netRevenue')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalRevenue)}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Total Sales
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium text-emerald-600">{t('currentProfit')}</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(currentProfit)}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Profit from Sales
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium text-red-600">{t('currentLoss')}</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(currentLoss)}
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Sales Loss + Expenses
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Expense Ratio</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {totalRevenue > 0 ? (((totalExpenses || 0) / totalRevenue) * 100).toFixed(1) : '0'}%
          </h3>
          <div className="mt-2 text-xs text-slate-400">
            Expenses vs Revenue
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">{t('revenue7Days')}</h3>
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
                      {formatCurrency(amount, 0)}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{date.split('-').slice(1).join('/')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>{t('noSalesData')}</p>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-6">{t('inventoryStatus')}</h3>
          {data.inventory.length > 0 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{t('stockHealth')}</span>
                  <span className="font-bold">{data.inventory.length > 0 ? ((data.inventory.filter((i: any) => i.quantity > i.minStock).length / data.inventory.length) * 100).toFixed(0) : '0'}%</span>
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

      {downloadSuccessMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
          <span className="text-sm font-semibold">{downloadSuccessMessage}</span>
        </div>
      )}
    </div>
  );
};

const Subscription = ({ subscription }: any) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { formatCurrency, toBengaliNumber } = useCurrency();

  const handleActivate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await subscription.activate(code);
    if (result.success) {
      alert('Software successfully activated! All features are now available.');
      setCode('');
    } else {
      alert(result.error || 'Invalid activation code. Please contact WhatsApp Support.');
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = !subscription.active;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subscription & Activation" 
        description="Manage your software license and monthly payments." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!subscription.active && (
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex items-center gap-4 animate-bounce">
              <ShieldCheck className="text-red-500 shrink-0" size={32} />
              <div>
                <h4 className="font-bold text-red-800">Pay your subscription fee and activate your software</h4>
                <p className="text-sm text-red-600">Your software plan has expired. Please activate to continue.</p>
              </div>
            </div>
          )}

          {/* Status Card */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">License Status</h3>
                <p className="text-sm text-slate-500">Your current software activation details</p>
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2",
                subscription.active 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : "bg-red-50 text-red-600 border border-red-100"
              )}>
                {subscription.active ? (
                  <><CheckCircle2 size={16} /> Active</>
                ) : (
                  <><X size={16} /> Inactive / Expired</>
                )}
              </div>
            </div>

            {subscription.active ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium mb-1 uppercase tracking-wider">Expiry Date</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {new Date(subscription.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Plan Type</p>
                  <p className="text-lg font-bold text-slate-900">Monthly Standard</p>
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
                <h4 className="font-bold mb-2">Online Payment (Stripe)</h4>
                <p className="text-xs text-emerald-100 mb-4 tracking-normal">Pay instantly with Card/Wallet and activate automatically.</p>
                <button 
                  onClick={() => subscription.createStripeSession()}
                  className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} /> Pay Online Now
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-700/50 rounded-2xl text-xs leading-relaxed">
              <p className="font-bold mb-1 underline">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-emerald-50">
                <li>Monthly fee: {formatCurrency(subscription.subscriptionFee !== undefined ? subscription.subscriptionFee : 500, 0)}.</li>
                <li>Pay online using Stripe to get activated automatically.</li>
                <li>If you have an activation code, enter it on the left panel.</li>
              </ol>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" /> Support
            </h4>
            <div className="space-y-3">
              <a href="https://wa.me/8801838086276" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">WhatsApp Support</p>
                  <p className="text-xs text-slate-500">+8801838-086276</p>
                </div>
              </a>

              <a href="https://www.facebook.com/GreensDesigner" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Facebook size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Facebook Page</p>
                  <p className="text-xs text-slate-500">GreensDesigner</p>
                </div>
              </a>

              <a href="mailto:greenlabtechnology.ceo@gmail.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Email Support</p>
                  <p className="text-xs text-slate-500 select-all">greenlabtechnology.ceo@gmail.com</p>
                </div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const TeamManagement = ({ user }: any) => {
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<any>(null);
  const { t } = useTranslation();

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/managers?ownerId=${user.id}`);
      const data = await res.json();
      setManagers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch managers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this employee?')) {
      await fetch(`/api/managers/${id}`, { method: 'DELETE' });
      fetchManagers();
    }
  };

  const defaultPermissions = {
    inventory: { view: true, edit: false, delete: false },
    sales: { view: true, edit: false, delete: false },
    expenses: { view: true, edit: false, delete: false },
    returns: { view: true, edit: false, delete: false },
    suppliers: { view: true, edit: false, delete: false },
    customers: { view: true, edit: false, delete: false },
    reports: { view: true },
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: defaultPermissions
  });

  const handleOpenModal = (manager: any = null) => {
    if (manager) {
      setEditingManager(manager);
      setFormData({
        name: manager.name,
        email: manager.email,
        password: '',
        permissions: manager.permissions || defaultPermissions
      });
    } else {
      setEditingManager(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        permissions: defaultPermissions
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingManager ? 'PATCH' : 'POST';
      const url = editingManager ? `/api/managers/${editingManager.id}` : '/api/managers';
      
      const payload = editingManager 
        ? { name: formData.name, permissions: formData.permissions, password: formData.password }
        : { ...formData, ownerId: user.id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchManagers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save manager');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (module: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module][action]
        }
      }
    }));
  };

  const modules = [
    { id: 'inventory', label: t('inventory') },
    { id: 'sales', label: t('sales') },
    { id: 'expenses', label: t('expenses') },
    { id: 'returns', label: t('returns') },
    { id: 'suppliers', label: t('suppliers') },
    { id: 'customers', label: t('customers') },
    { id: 'reports', label: t('reports') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">{t('team')}</h3>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} /> {t('addEmployee')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.map(manager => (
          <Card key={manager.id} className="p-6 relative group border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                {manager.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{manager.name}</h4>
                <p className="text-xs text-slate-500 truncate">{manager.email}</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2">
              <button 
                onClick={() => handleOpenModal(manager)}
                className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                {t('edit')}
              </button>
              <button 
                onClick={() => handleDelete(manager.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
        {managers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No team members added yet.</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingManager ? t('editEmployee') : t('addEmployee')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('employeeName')}</label>
              <input 
                type="text" required 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('emailLabel')}</label>
              <input 
                type="email" required 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={!!editingManager}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none disabled:opacity-50" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {editingManager ? "New Password (Leave blank to keep current)" : t('passwordLabel')}
              </label>
              <input 
                type="password" required={!editingManager}
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">{t('permissions')}</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {modules.map(mod => (
                <div key={mod.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{mod.label}</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.permissions[mod.id as keyof typeof formData.permissions]?.view} 
                          onChange={() => togglePermission(mod.id, 'view')}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{t('view')}</span>
                      </label>
                      {mod.id !== 'reports' && (
                        <>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.permissions[mod.id as keyof typeof formData.permissions]?.edit} 
                              onChange={() => togglePermission(mod.id, 'edit')}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{t('edit')}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.permissions[mod.id as keyof typeof formData.permissions]?.delete} 
                              onChange={() => togglePermission(mod.id, 'delete')}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{t('delete')}</span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
            {editingManager ? t('savePermissions') : t('addEmployee')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

const Settings = ({ user, data, updateProfile }: any) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [logo, setLogo] = useState(user?.logo || '');
  const [isRefreshingDB, setIsRefreshingDB] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const { t } = useTranslation();

  // Sync state with props if user changesExternally (e.g. after update or re-login)
  useEffect(() => {
    if (user) {
      console.log('--- SETTINGS SYNCING WITH USER PROP ---', user);
      setBusinessName(user.businessName || '');
      setEmail(user.email || '');
      setName(user.name || '');
      setPhone(user.phoneNumber || '');
      setAddress(user.address || '');
      setLogo(user.logo || '');
    }
  }, [user]);

  const checkDatabaseConnection = async () => {
    setIsRefreshingDB(true);
    setDbStatus(null);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const payload = await res.json();
        if (payload.useLocalFallback) {
          setDbStatus('Database: LOCAL FALLBACK MOTHERBOARD (The remote Hostinger database is blocking connections from Google Cloud Run. We have automatically activated local secured file-system storage so you can registration, login, and save inventory beautifully!)');
        } else {
          setDbStatus('Database Connection: OK (Connected & Synced with Remote MySQL)');
        }
      } else {
        setDbStatus('Database Connection: FAILED (Server returned error)');
      }
    } catch (err) {
      setDbStatus('Database Connection: ERROR (Server connection failure)');
    } finally {
      setIsRefreshingDB(false);
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন (PNG, JPG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400; // Optimal size for crisp header, invoice & reports
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/png');
            setLogo(compressedDataUrl);
          } else {
            setLogo(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    
    // Ensure all fields are sent as strings or nulls to avoid SQL issues
    const payload = {
      businessName: businessName || '',
      email: email || '',
      fullName: name || '',
      phoneNumber: phone || '',
      address: address || '',
      logo: logo || ''
    };

    console.log('--- SENDING UPDATE PAYLOAD ---', payload);
    
    const result = await updateProfile(payload);
    setIsUpdating(false);
    
    if (result.success) {
      alert('Profile updated successfully!');
    } else {
      setUpdateError(result.error || 'Failed to update profile.');
      alert('Failed: ' + (result.error || 'Check console tracker'));
    }
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
      <PageHeader title={t('settings')} description="Manage your business profile and team." />
      
      {user?.role === 'OWNER' && (
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={cn(
              "px-8 py-4 text-sm font-bold transition-all relative",
              activeTab === 'profile' ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Profile
            {activeTab === 'profile' && <motion.div layoutId="settingTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('team')} 
            className={cn(
              "px-8 py-4 text-sm font-bold transition-all relative",
              activeTab === 'team' ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t('team')} Management
            {activeTab === 'team' && <motion.div layoutId="settingTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>
        </div>
      )}

      {activeTab === 'profile' ? (
        <>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  System Debugger
                </h3>
                <p className="text-sm text-slate-500 mt-1">If your data isn't saving or you see a white screen, click the button below to check.</p>
              </div>
              <button 
                onClick={checkDatabaseConnection}
                disabled={isRefreshingDB}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isRefreshingDB ? 'Checking...' : 'Check Connection'}
              </button>
            </div>
            {dbStatus && (
              <div className={cn(
                "mt-4 p-4 rounded-xl font-bold text-sm",
                dbStatus.includes('OK') ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              )}>
                {dbStatus}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-6 font-primary text-lg">Business Profile</h3>
                {updateError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={18} /> {updateError}
                  </div>
                )}
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('phoneLabel')}</label>
                        <input 
                          type="tel" required 
                          value={phone} onChange={e => setPhone(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('addressLabel')}</label>
                        <textarea 
                          required 
                          value={address} onChange={e => setAddress(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none" 
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isUpdating} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50">
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </Card>

              {user?.role === 'OWNER' && (
                <Card className="p-6 border-red-100">
                  <h3 className="font-bold text-red-600 mb-2 font-primary text-lg">Danger Zone</h3>
                  <p className="text-sm text-slate-500 mb-6">Permanently delete all your business data. This action is irreversible.</p>
                  <button 
                    onClick={clearAllData}
                    className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-600 hover:text-white transition-all"
                  >
                    Clear All Data
                  </button>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : (
        <TeamManagement user={user} />
      )}
    </div>
  );
};

const AccountLockedScreen = ({ user, logout, onRefreshStatus, lockReason }: any) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshStatus) await onRefreshStatus();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="w-20 h-20 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={38} />
        </div>

        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block border border-red-500/30">
          সফটওয়্যার অ্যাক্সেস সাময়িক স্থগিত (Locked)
        </span>

        <h2 className="text-2xl font-black mb-2 text-white font-primary">
          {user?.businessName || 'আপনার প্রতিষ্ঠান'}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          কর্তৃপক্ষের নির্দেশনায় আপনার সফটওয়্যারটির ব্যবহার সাময়িকভাবে লক করা হয়েছে।
        </p>

        {lockReason && (
          <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-2xl text-left mb-6">
            <p className="text-[11px] font-bold text-red-400 uppercase tracking-wide mb-1">লক করার কারণ:</p>
            <p className="text-sm text-red-200">{lockReason}</p>
          </div>
        )}

        <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-left mb-6 space-y-2">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">সফটওয়্যারটি আনলক করতে যোগাযোগ করুন:</p>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Phone size={15} className="text-emerald-400 shrink-0" />
            <a href={`tel:${WHATSAPP_NUM}`} className="hover:text-emerald-400 underline font-mono">{WHATSAPP_NUM}</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Mail size={15} className="text-emerald-400 shrink-0" />
            <span className="font-mono text-xs">GreenlabTechnology.Ceo@gmail.com</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? 'স্ট্যাটাস যাচাই হচ্ছে...' : 'স্ট্যাটাস রিফ্রেশ করুন'}</span>
          </button>
          <button
            onClick={logout}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
          >
            লগআউট করুন
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPortal = () => {
  const [adminSecret, setAdminSecret] = useState(() => sessionStorage.getItem('greensstock_admin_auth') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(sessionStorage.getItem('greensstock_admin_auth')));
  const [inputKey, setInputKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Authenticated State
  const [activeTab, setActiveTab] = useState<'users' | 'codes'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'LOCKED'>('ALL');
  const [updatingUserId, setUpdatingUserId] = useState<number | string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Per-user edited values
  const [feeInputs, setFeeInputs] = useState<Record<string, number>>({});
  const [expiryInputs, setExpiryInputs] = useState<Record<string, string>>({});

  // Lock Confirmation Modal
  const [lockingUser, setLockingUser] = useState<any | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState('বিল বকেয়া রয়েছে / Payment Pending');

  // Activation Codes State
  const [codesCount, setCodesCount] = useState(5);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [codeGenError, setCodeGenError] = useState<string | null>(null);

  // Notification helper
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Fetch Users
  const fetchUsers = async (secretToUse?: string) => {
    const key = secretToUse || adminSecret;
    if (!key) return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        headers: { 'x-admin-secret': key }
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
        // Initialize inputs
        const initialFees: Record<string, number> = {};
        const initialExpiries: Record<string, string> = {};
        data.users.forEach((u: any) => {
          initialFees[u.id] = u.subscriptionFee !== undefined ? Number(u.subscriptionFee) : 500;
          if (u.expiryDate) {
            const d = new Date(u.expiryDate);
            if (!isNaN(d.getTime())) {
              initialExpiries[u.id] = d.toISOString().split('T')[0];
            }
          }
        });
        setFeeInputs(initialFees);
        setExpiryInputs(initialExpiries);
      } else {
        if (res.status === 403) {
          sessionStorage.removeItem('greensstock_admin_auth');
          setIsAuthenticated(false);
          setAuthError('অথেন্টিকেশন কী বাতিল বা পরিবর্তন করা হয়েছে। দয়া করে পুনরায় দিন।');
        }
      }
    } catch (e: any) {
      console.error('Fetch users error:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && adminSecret) {
      fetchUsers();
    }
  }, [isAuthenticated, adminSecret]);

  // Handle Login to Admin Portal
  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) {
      setAuthError('দয়া করে অথেন্টিকেশন কী প্রদান করুন');
      return;
    }
    setIsVerifying(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: cleanKey })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('greensstock_admin_auth', cleanKey);
        setAdminSecret(cleanKey);
        setIsAuthenticated(true);
        setInputKey('');
        fetchUsers(cleanKey);
      } else {
        setAuthError(data.error || 'ভুল অথেন্টিকেশন কী! অনুগ্রহ করে সঠিক কী দিন।');
      }
    } catch (err: any) {
      setAuthError(err.message || 'সার্ভারে সংযোগ করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Logout / Lock Portal
  const handleLockPortal = () => {
    sessionStorage.removeItem('greensstock_admin_auth');
    setAdminSecret('');
    setIsAuthenticated(false);
    setUsers([]);
    setInputKey('');
  };

  // Update User Fee
  const handleUpdateFee = async (userId: number | string) => {
    const feeToSet = feeInputs[userId] !== undefined ? feeInputs[userId] : 500;
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({ subscriptionFee: feeToSet })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionFee: feeToSet } : u));
        showToast(`ইউজারের সাবস্ক্রিপশন ফি ৳${feeToSet} সফলভাবে আপডেট হয়েছে!`);
      } else {
        alert(data.error || 'আপডেট ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      alert(e.message || 'নেটওয়ার্ক ত্রুটি');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Adjust Fee quickly (+/-)
  const adjustFeeQuick = (userId: number | string, delta: number) => {
    const current = feeInputs[userId] !== undefined ? feeInputs[userId] : 500;
    const next = Math.max(0, current + delta);
    setFeeInputs(prev => ({ ...prev, [userId]: next }));
  };

  // Update User Expiry Date
  const handleUpdateExpiry = async (userId: number | string, customIso?: string) => {
    let newIso = customIso;
    if (!newIso) {
      const dateStr = expiryInputs[userId];
      if (!dateStr) return alert('দয়া করে একটি সঠিক তারিখ নির্বাচন করুন');
      newIso = new Date(`${dateStr}T23:59:59.000Z`).toISOString();
    }
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({ expiryDate: newIso })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, expiryDate: newIso } : u));
        const dateObj = new Date(newIso);
        setExpiryInputs(prev => ({ ...prev, [userId]: dateObj.toISOString().split('T')[0] }));
        showToast('ইউজারের মেয়াদ সফলভাবে আপডেট করা হয়েছে!');
      } else {
        alert(data.error || 'মেয়াদ আপডেট ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      alert(e.message || 'নেটওয়ার্ক ত্রুটি');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Quick Extend Expiry (+30, +60, +90, +365 days)
  const quickExtendExpiry = (user: any, daysToAdd: number) => {
    const baseDate = (user.expiryDate && new Date(user.expiryDate) > new Date())
      ? new Date(user.expiryDate)
      : new Date();
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    const newIso = baseDate.toISOString();
    handleUpdateExpiry(user.id, newIso);
  };

  // Toggle User Lock
  const handleLockConfirm = async () => {
    if (!lockingUser) return;
    const userId = lockingUser.id;
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({
          isLocked: true,
          lockReason: lockReasonInput.trim() || 'প্রশাসনিক নির্দেশনায় সফটওয়্যার লক করা হয়েছে'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? {
          ...u,
          isLocked: true,
          lockReason: lockReasonInput.trim() || 'প্রশাসনিক নির্দেশনায় সফটওয়্যার লক করা হয়েছে'
        } : u));
        showToast('সফটওয়্যারটি সফলভাবে লক করা হয়েছে!');
        setLockingUser(null);
      } else {
        alert(data.error || 'লক ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      alert(e.message || 'নেটওয়ার্ক ত্রুটি');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUnlockUser = async (userId: number | string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify({
          isLocked: false,
          lockReason: ''
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked: false, lockReason: '' } : u));
        showToast('সফটওয়্যারটি সফলভাবে আনলক করা হয়েছে!');
      } else {
        alert(data.error || 'আনলক ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      alert(e.message || 'নেটওয়ার্ক ত্রুটি');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Activation Code Generator Handler
  const generateCodes = async () => {
    setIsGeneratingCodes(true);
    setCodeGenError(null);
    try {
      const res = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: codesCount, secret: adminSecret })
      });
      const data = await res.json();
      if (res.ok && data.codes) {
        setGeneratedCodes(data.codes);
        showToast(`${data.codes.length}টি লাইসেন্স কোড তৈরি হয়েছে!`);
      } else {
        setCodeGenError(data.error || 'কোড তৈরিতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      setCodeGenError(err.message || 'কানেকশন এরর');
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAllCodes = () => {
    if (generatedCodes.length === 0) return;
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Filter and Search Users
  const filteredUsers = users.filter(u => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (u.businessName && u.businessName.toLowerCase().includes(q)) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    // Status filter
    const isExpired = !u.expiryDate || new Date(u.expiryDate) < new Date();
    const isLocked = Boolean(u.isLocked);

    if (statusFilter === 'LOCKED') return isLocked;
    if (statusFilter === 'ACTIVE') return !isLocked && !isExpired;
    if (statusFilter === 'EXPIRED') return !isLocked && isExpired;
    return true;
  });

  const totalUsersCount = users.length;
  const lockedUsersCount = users.filter(u => Boolean(u.isLocked)).length;
  const activeUsersCount = users.filter(u => !u.isLocked && u.expiryDate && new Date(u.expiryDate) > new Date()).length;
  const expiredUsersCount = users.filter(u => !u.isLocked && (!u.expiryDate || new Date(u.expiryDate) <= new Date())).length;

  // ==========================================
  // VIEW 1: SECURITY GATE (BEFORE AUTHENTICATION)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full max-w-md p-8 bg-slate-900 text-white border-slate-800 shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 shadow-inner">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              GreensStock Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ইউজার ম্যানেজমেন্ট ও সফটওয়্যার কন্ট্রোল প্রবেশদ্বার
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Authentication Key
                </label>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={inputKey}
                  autoFocus
                  onChange={e => {
                    setInputKey(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter Authentication Key"
                  className="w-full pl-5 pr-12 py-3.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-white text-base font-mono transition-all placeholder:text-slate-600" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isVerifying || !inputKey.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-sm"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>প্রবেশ করুন (Access Portal)</span>
                </>
              )}
            </button>
          </form>
        </Card>

        <p className="mt-8 text-slate-600 text-[10px] font-mono uppercase tracking-[0.3em]">
          GreensStock Master License Controller
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: FULL ADMIN PORTAL (AFTER AUTHENTICATION)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border border-emerald-400/30"
          >
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">GreensStock Admin Console</h1>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">সফটওয়্যার ইউজার, সাবস্ক্রিপশন ফি ও মেয়াদ ব্যবস্থাপনা</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tabs */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center">
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === 'users'
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Users size={15} />
                <span>ইউজার ও সাবস্ক্রিপশন ({users.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('codes')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === 'codes'
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Zap size={15} />
                <span>অ্যাক্টিভেশন কোড</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchUsers()}
              disabled={isLoadingUsers}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw size={16} className={cn(isLoadingUsers && "animate-spin text-emerald-400")} />
            </button>

            {/* Lock / Logout Button */}
            <button
              onClick={handleLockPortal}
              className="flex items-center gap-2 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors"
              title="পোর্টাল লক করুন"
            >
              <Lock size={14} />
              <span>লক করুন (Exit)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-8">
        {activeTab === 'users' ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">মোট ইউজার</span>
                  <Users size={18} className="text-slate-400" />
                </div>
                <p className="text-2xl font-black text-white">{totalUsersCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">সকল রেজিস্টার্ড প্রতিষ্ঠান</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">সচল একাউন্ট</span>
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-2xl font-black text-emerald-400">{activeUsersCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">মেয়াদ কার্যকর আছে</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">মেয়াদোত্তীর্ণ</span>
                  <Clock size={18} />
                </div>
                <p className="text-2xl font-black text-amber-400">{expiredUsersCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">নবায়ন প্রয়োজন</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-red-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">লক করা সফটওয়্যার</span>
                  <Lock size={18} />
                </div>
                <p className="text-2xl font-black text-red-400">{lockedUsersCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">এক্সেস ব্লক করা</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full md:w-96">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="দোকানের নাম, মালিকের নাম, মোবাইল বা ইমেইল..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {(['ALL', 'ACTIVE', 'EXPIRED', 'LOCKED'] as const).map(tab => {
                  const labels = {
                    ALL: `সব (${totalUsersCount})`,
                    ACTIVE: `সচল (${activeUsersCount})`,
                    EXPIRED: `মেয়াদ শেষ (${expiredUsersCount})`,
                    LOCKED: `লকড (${lockedUsersCount})`
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                        statusFilter === tab
                          ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User List */}
            {isLoadingUsers ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-medium">ইউজার লিস্ট লোড হচ্ছে...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                <Users size={48} className="mx-auto text-slate-700 mb-3" />
                <h3 className="text-base font-bold text-slate-300">কোন ইউজার পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map(userItem => {
                  const isLocked = Boolean(userItem.isLocked);
                  const isExpired = !userItem.expiryDate || new Date(userItem.expiryDate) < new Date();
                  const currentFee = feeInputs[userItem.id] !== undefined ? feeInputs[userItem.id] : (userItem.subscriptionFee || 500);
                  const currentExpiryVal = expiryInputs[userItem.id] || (userItem.expiryDate ? new Date(userItem.expiryDate).toISOString().split('T')[0] : '');

                  // Days Remaining
                  let remainingDaysText = 'মেয়াদ নেই';
                  if (userItem.expiryDate) {
                    const target = new Date(userItem.expiryDate).getTime();
                    const now = new Date().getTime();
                    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
                    if (diffDays > 0) {
                      remainingDaysText = `${diffDays} দিন বাকি`;
                    } else if (diffDays === 0) {
                      remainingDaysText = 'আজ মেয়াদ শেষ';
                    } else {
                      remainingDaysText = `${Math.abs(diffDays)} দিন আগে শেষ`;
                    }
                  }

                  const isUpdating = updatingUserId === userItem.id;

                  return (
                    <div 
                      key={userItem.id} 
                      className={cn(
                        "bg-slate-900 rounded-2xl border transition-all p-5 lg:p-6 space-y-5",
                        isLocked 
                          ? "border-red-500/40 bg-red-950/10 shadow-lg shadow-red-950/20" 
                          : "border-slate-800 hover:border-slate-700/80"
                      )}
                    >
                      {/* User Header Info */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                        <div className="flex items-start gap-3.5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 border",
                            isLocked 
                              ? "bg-red-500/20 text-red-400 border-red-500/30" 
                              : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                          )}>
                            {userItem.businessName ? userItem.businessName.charAt(0).toUpperCase() : 'B'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="text-base font-bold text-white font-primary">{userItem.businessName || 'প্রতিষ্ঠান'}</h3>
                              
                              {/* Status Badge */}
                              {isLocked ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                                  <Lock size={10} /> সফটওয়্যার লকড
                                </span>
                              ) : !isExpired ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 size={10} /> সচল (Active)
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                  <AlertCircle size={10} /> মেয়াদ শেষ
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                              <span>মালিক: <strong className="text-slate-300">{userItem.fullName || 'N/A'}</strong></span>
                              <span>•</span>
                              <span>মোবাইল: <strong className="text-slate-300 font-mono">{userItem.phoneNumber || 'N/A'}</strong></span>
                              <span>•</span>
                              <span>ইমেইল: <strong className="text-slate-300 font-mono text-[11px]">{userItem.email || 'N/A'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Top Action / Lock Status Pill */}
                        <div>
                          {isLocked ? (
                            <button
                              onClick={() => handleUnlockUser(userItem.id)}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
                            >
                              <Unlock size={14} />
                              <span>সফটওয়্যার আনলক করুন</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setLockingUser(userItem);
                                setLockReasonInput('বিল বকেয়া রয়েছে / Payment Pending');
                              }}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <Lock size={14} />
                              <span>সফটওয়্যার লক করুন</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Locked Notice if applicable */}
                      {isLocked && (
                        <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
                          <AlertTriangle size={15} className="text-red-400 shrink-0" />
                          <span>
                            <strong>সতর্কতা:</strong> এই সফটওয়্যারটি লক অবস্থায় রয়েছে। ব্যবহারকারী কোনো ফিচার ব্যবহার করতে পারবেন না। 
                            {userItem.lockReason && ` (কারণ: ${userItem.lockReason})`}
                          </span>
                        </div>
                      )}

                      {/* Controls Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        {/* Control 1: Subscription Fee */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                              <DollarSign size={14} className="text-emerald-400" />
                              সাবস্ক্রিপশন ফি নির্ধারণ
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              বর্তমান: ৳{userItem.subscriptionFee !== undefined ? userItem.subscriptionFee : 500} / মাস
                            </span>
                          </div>

                          {/* Quick Add / Subtract Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => adjustFeeQuick(userItem.id, -500)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              -500
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustFeeQuick(userItem.id, -100)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              -100
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustFeeQuick(userItem.id, 100)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              +100
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustFeeQuick(userItem.id, 500)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              +500
                            </button>
                          </div>

                          {/* Amount Input and Save Button */}
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">৳</span>
                              <input
                                type="number"
                                min="0"
                                value={currentFee}
                                onChange={e => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setFeeInputs(prev => ({ ...prev, [userItem.id]: val }));
                                }}
                                className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                                placeholder="যেকোনো ফি বসান"
                              />
                            </div>
                            <button
                              onClick={() => handleUpdateFee(userItem.id)}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
                            >
                              {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                              <span>ফি সেভ করুন</span>
                            </button>
                          </div>
                        </div>

                        {/* Control 2: Subscription Expiry Date */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                              <Calendar size={14} className="text-cyan-400" />
                              মেয়াদ নির্ধারণ ও বৃদ্ধি
                            </span>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-md font-mono",
                              !isExpired ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            )}>
                              {remainingDaysText}
                            </span>
                          </div>

                          {/* Quick Duration Add Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => quickExtendExpiry(userItem, 30)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              +৩০ দিন
                            </button>
                            <button
                              type="button"
                              onClick={() => quickExtendExpiry(userItem, 60)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              +৬০ দিন
                            </button>
                            <button
                              type="button"
                              onClick={() => quickExtendExpiry(userItem, 90)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              +৯০ দিন
                            </button>
                            <button
                              type="button"
                              onClick={() => quickExtendExpiry(userItem, 365)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                            >
                              +১ বছর
                            </button>
                          </div>

                          {/* Custom Date Input and Save Button */}
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={currentExpiryVal}
                              onChange={e => {
                                setExpiryInputs(prev => ({ ...prev, [userItem.id]: e.target.value }));
                              }}
                              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold font-mono text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              onClick={() => handleUpdateExpiry(userItem.id)}
                              disabled={isUpdating || !expiryInputs[userItem.id]}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
                            >
                              {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : <Calendar size={12} />}
                              <span>মেয়াদ সেভ করুন</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Tab 2: Activation Code Generator */
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 lg:p-8 bg-slate-900 border-slate-800 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
                  <Zap size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">লাইসেন্স অ্যাক্টিভেশন কোড জেনারেটর</h2>
                  <p className="text-xs text-slate-400">এক ক্লিকে নতুন অফলাইন/অনলাইন অ্যাক্টিভেশন কোড তৈরি করুন</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    একবারে কতটি কোড তৈরি করবেন (১-৫০)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={codesCount}
                    onChange={e => setCodesCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 50))}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={generateCodes}
                  disabled={isGeneratingCodes}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
                >
                  {isGeneratingCodes ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>কোড তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>কোড তৈরি করুন (Generate Codes)</span>
                    </>
                  )}
                </button>

                {codeGenError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{codeGenError}</span>
                  </div>
                )}
              </div>

              {/* Generated Codes List */}
              {generatedCodes.length > 0 && (
                <div className="mt-8 space-y-4 border-t border-slate-800 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      তৈরি হওয়া কোড সমূহ ({generatedCodes.length}টি)
                    </span>
                    <button
                      onClick={copyAllCodes}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {copiedAll ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                      <span>{copiedAll ? 'সব কপি হয়েছে!' : 'সব কোড কপি করুন'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {generatedCodes.map((codeItem, idx) => {
                      const isThisCopied = copiedCode === codeItem;
                      return (
                        <div
                          key={idx}
                          onClick={() => copyToClipboard(codeItem)}
                          className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all group"
                        >
                          <span className="font-mono text-sm tracking-wider font-bold text-emerald-400">
                            {codeItem}
                          </span>
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1",
                            isThisCopied 
                              ? "bg-emerald-500 text-white" 
                              : "bg-slate-800 text-slate-400 group-hover:text-emerald-400"
                          )}>
                            {isThisCopied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                            <span>{isThisCopied ? 'Copied' : 'Copy'}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setGeneratedCodes([])}
                    className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
                  >
                    তালিকা পরিষ্কার করুন
                  </button>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Lock Confirmation Modal */}
      <AnimatePresence>
        {lockingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLockingUser(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 text-white shadow-2xl z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                <Lock size={24} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">সফটওয়্যার লক নিশ্চিতকরণ</h3>
                <p className="text-xs text-slate-400 mt-1">
                  আপনি কি নিশ্চিত যে <strong className="text-white font-primary">{lockingUser.businessName}</strong>-এর সফটওয়্যার লক করতে চান?
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  লক করার কারণ (ইউজারকে প্রদর্শন করা হবে):
                </label>
                <input
                  type="text"
                  value={lockReasonInput}
                  onChange={e => setLockReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                  placeholder="যেমন: মাসিক সাবস্ক্রিপশন বিল বকেয়া"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLockingUser(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleLockConfirm}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-red-950/40"
                >
                  হ্যাঁ, লক করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthPage = ({ type, login, signup, verifyEmail, resendCode, forgotPassword, resetPassword }: any) => {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSuccessMessage, setVerificationSuccessMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [debugCode, setDebugCode] = useState('');

  // Forgot Password state variables
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetCodeSent, setIsResetCodeSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState('');
  const [resetDebugCode, setResetDebugCode] = useState('');

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setResetStatus('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetEmail || !emailRegex.test(resetEmail)) {
      setError('Please enter a valid email address (e.g. customer@mail.com)');
      setIsSubmitting(false);
      return;
    }

    const result = await forgotPassword(resetEmail);
    if (result.success) {
      setIsResetCodeSent(true);
      setResetStatus('The password reset code has been sent to your email address.');
    } else {
      setError(result.error || 'Failed to send reset code.');
    }
    setIsSubmitting(false);
  };

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setResetStatus('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match!');
      setIsSubmitting(false);
      return;
    }

    const result = await resetPassword(resetEmail, resetCode, newPassword);
    if (result.success) {
      setIsForgotPassword(false);
      setIsResetCodeSent(false);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setError('');
      setVerificationSuccessMessage('Password reset successfully! Please log in with your new password.');
    } else {
      setError(result.error || 'Password reset failed. Please check the code.');
    }
    setIsSubmitting(false);
  };

  const handleFetchResetDebugCode = async () => {
    setError('');
    setResetStatus('কোড রিট্রিভ করা হচ্ছে...');
    try {
      const response = await fetch(`/api/auth/get-verification-code?email=${encodeURIComponent(resetEmail)}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setResetDebugCode(data.code);
        setResetStatus(`আপনার রিসেট কোডটি সফলভাবে উদ্ধার করা হয়েছে: ${data.code}`);
      } else {
        setError(data.error || 'কোডটি পাওয়া যায়নি।');
        setResetStatus('');
      }
    } catch (err: any) {
      setError('সার্ভার সংযোগে ত্রুটি ঘটেছে।');
      setResetStatus('');
    }
  };

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (type === 'signup') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setError('অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস দিন (যেমন: customer@mail.com)');
        setIsSubmitting(false);
        return;
      }

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
        if (result.needsVerification) {
          setVerifyingEmail(result.email);
          setIsVerifying(true);
          setVerificationSuccessMessage('Registration successful! A verification code has been sent to your email.');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        if (result.error === 'email_not_verified') {
          setVerifyingEmail(result.email);
          setIsVerifying(true);
          setVerificationSuccessMessage('Your email has not been verified yet. Please complete verification.');
        } else {
          setError(result.error);
        }
      }
    }
    
    setIsSubmitting(false);
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setResendStatus('');

    const result = await verifyEmail(verifyingEmail, verificationCode);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Verification failed. Please check the code and try again.');
    }
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    setError('');
    setResendStatus('Sending code...');
    const result = await resendCode(verifyingEmail);
    if (result.success) {
      setResendStatus('A new verification code has been sent to your email.');
    } else {
      setError(result.error || 'Failed to send verification code. Please try again later.');
      setResendStatus('');
    }
  };

  const handleFetchDebugCode = async () => {
    setError('');
    setResendStatus('কোড রিট্রিভ করা হচ্ছে...');
    try {
      const response = await fetch(`/api/auth/get-verification-code?email=${encodeURIComponent(verifyingEmail)}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setDebugCode(data.code);
        setResendStatus(`আপনার ভেরিফিকেশন কোডটি সফলভাবে উদ্ধার করা হয়েছে: ${data.code}`);
      } else {
        setError(data.error || 'কোডটি পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন আবার চেষ্টা করুন।');
        setResendStatus('');
      }
    } catch (err: any) {
      setError('সার্ভার সংযোগে ত্রুটি ঘটেছে।');
      setResendStatus('');
    }
  };

  const handleInstantBypass = async () => {
    setError('');
    setIsSubmitting(true);
    setResendStatus('');
    setVerificationCode('123456');

    const result = await verifyEmail(verifyingEmail, '123456');
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'ভেরিফিকেশন ব্যর্থ হয়েছে।');
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
        {isVerifying ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-emerald-500/20">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Email Verification
              </h2>
              <p className="text-slate-500 text-center mt-2 text-sm leading-relaxed">
                We have sent a 6-digit verification code to your email address <strong>{verifyingEmail}</strong>. Enter the code below to activate your account.
              </p>
            </div>

            {verificationSuccessMessage && !error && !resendStatus && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl text-center font-medium">
                {verificationSuccessMessage}
              </div>
            )}

            {resendStatus && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-xl text-center font-medium">
                {resendStatus}
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 text-center">Enter 6-digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-center text-3xl font-bold tracking-[0.4em] font-mono transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || verificationCode.length !== 6}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('processing')}
                  </span>
                ) : (
                  'Verify Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center space-y-3">
              <p className="text-sm text-slate-500">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-emerald-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Resend Code
                </button>
              </p>
              <p className="text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setError('');
                    setResendStatus('');
                    setVerificationCode('');
                  }}
                  className="text-slate-400 hover:text-slate-600 hover:underline"
                >
                  Back to Login Page
                </button>
              </p>
            </div>
          </>
        ) : isForgotPassword ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-emerald-500/20">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reset Password
              </h2>
              <p className="text-slate-500 text-center mt-2 text-sm leading-relaxed">
                {isResetCodeSent 
                  ? `We have sent a 6-digit verification code to your email address ${resetEmail}.`
                  : "Enter your email address to recover your password."}
              </p>
            </div>

            {resetStatus && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-xl text-center font-medium">
                {resetStatus}
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            {!isResetCodeSent ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

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
                    "Send Reset Code"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit Reset Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-center text-2xl font-mono font-bold tracking-wider transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || resetCode.length !== 6 || !newPassword || !confirmNewPassword}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsResetCodeSent(false);
                  setResetEmail('');
                  setResetCode('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setError('');
                  setResetStatus('');
                  setResetDebugCode('');
                }}
                className="text-emerald-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-sm"
              >
                Back to Login Page
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              {BRAND_CONFIG.logo ? (
                <div className="w-20 h-20 mb-4 flex items-center justify-center">
                  <img 
                    src={BRAND_CONFIG.logo} 
                    alt={BRAND_CONFIG.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className={`w-12 h-12 bg-${BRAND_CONFIG.color} rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-emerald-500/20`}>
                  {BRAND_CONFIG.name.charAt(0)}
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {type === 'login' ? t('welcomeBack') : t('createAccount')}
              </h2>
              <p className="text-slate-500 text-center mt-2">
                {type === 'login' 
                  ? t('loginDesc') 
                  : t('signupDesc')}
              </p>
            </div>

            {verificationSuccessMessage && !error && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl text-center font-medium">
                {verificationSuccessMessage}
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('businessNameLabel')}</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('fullNameLabel')}</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('phoneLabel')}</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('emailLabel')}</label>
                <div className="relative">
                  <input
                    type={showEmail ? "text" : "email"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmail(!showEmail)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    title={showEmail ? "Hide email" : "Show email"}
                  >
                    {showEmail ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">{t('passwordLabel')}</label>
                  {type === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                        setResetStatus('');
                      }}
                      className="text-xs text-emerald-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      {t('forgotPassword')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {type === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('confirmPasswordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
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
                    {t('processing')}
                  </span>
                ) : (
                  type === 'login' ? t('signIn') : t('createAccountBtn')
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {type === 'login' ? t('noAccount') : t('haveAccount')}{' '}
                <Link
                  to={type === 'login' ? '/signup' : '/login'}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  {type === 'login' ? t('signup') : t('login')}
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

// --- MAIN APP CONTENT ---
const MainApp = () => {
  const { user, loading, login, signup, verifyEmail, resendCode, updateProfile, logout, forgotPassword, resetPassword } = useAuth();
  const data = useData(user);
  const subscription = useSubscription(user);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "GreensStock";
  }, []);

  if (loading || !data.isLoaded || subscription.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-600 animate-pulse mb-2" />
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">{t('softwareLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center"><div className="bg-white p-10 rounded-3xl border border-red-100 shadow-xl max-w-md"><h2 className="text-xl font-bold text-red-600">A critical error has occurred.</h2><p className="text-slate-500 mt-4">There may be an error with the database or browser data. Use the buttons below to return or reset.</p><div className="flex flex-col gap-3 mt-8"><button onClick={() => window.location.href='/'} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">Go to Home</button><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Reset Data (Logout)</button></div></div></div>}>
        <Routes>
          <Route path="/login" element={!user ? <AuthPage type="login" login={login} signup={signup} verifyEmail={verifyEmail} resendCode={resendCode} forgotPassword={forgotPassword} resetPassword={resetPassword} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <AuthPage type="signup" login={login} signup={signup} verifyEmail={verifyEmail} resendCode={resendCode} forgotPassword={forgotPassword} resetPassword={resetPassword} /> : <Navigate to="/" />} />
          <Route path="/admin-portal" element={<AdminPortal />} />
          <Route
            path="/*"
            element={
              user ? (
                subscription.isLocked ? (
                  <AccountLockedScreen
                    user={user}
                    logout={logout}
                    onRefreshStatus={subscription.checkStatus}
                    lockReason={subscription.lockReason}
                  />
                ) : (
                  <Layout user={user} logout={logout} subscription={subscription}>
                    <Routes>
                      <Route path="/" element={subscription.active ? <Dashboard data={data} user={user} /> : <Navigate to="/subscription" />} />
                      <Route path="/inventory" element={subscription.active ? <Inventory data={data} /> : <Navigate to="/subscription" />} />
                      <Route path="/sales" element={subscription.active ? <Sales data={data} /> : <Navigate to="/subscription" />} />
                      <Route path="/returns" element={subscription.active ? <Returns data={data} /> : <Navigate to="/subscription" />} />
                      <Route path="/suppliers" element={subscription.active ? <Suppliers data={data} /> : <Navigate to="/subscription" />} />
                      <Route path="/customers" element={subscription.active ? <Customers data={data} /> : <Navigate to="/subscription" />} />
                      <Route path="/expenses" element={subscription.active ? <Expenses data={data} /> : <Navigate to="/subscription" />} />
                      <Route path="/reports" element={subscription.active ? <Reports data={data} user={user} /> : <Navigate to="/subscription" />} />
                      <Route path="/subscription" element={<Subscription subscription={subscription} />} />
                      <Route path="/settings" element={subscription.active ? <Settings user={user} data={data} updateProfile={updateProfile} /> : <Navigate to="/subscription" />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
