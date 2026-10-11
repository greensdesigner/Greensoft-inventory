import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface SecurityShieldProps {
  lang?: string;
}

export const SecurityShield: React.FC<SecurityShieldProps> = ({ lang = 'en' }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'warning'>('warning');

  const showSecurityNotice = (messageBn: string, messageEn: string, type: 'info' | 'warning' = 'warning') => {
    const text = lang === 'bn' ? messageBn : messageEn;
    setToastMessage(text);
    setToastType(type);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    // 1. Console Warning & Clear
    const printSecurityBanner = () => {
      try {
        console.clear();
        console.log(
          '%c🔒 GreensStock Protected Enterprise System\n' +
          '%cThis web application and its source logic are proprietary. Unauthorized inspection, tampering, or extraction of code and resources is strictly prohibited.',
          'color: #dc2626; font-size: 16px; font-weight: bold; padding: 4px 0;',
          'color: #475569; font-size: 12px; line-height: 1.5;'
        );
      } catch (err) {
        // ignore
      }
    };

    printSecurityBanner();
    const consoleInterval = setInterval(printSecurityBanner, 30000);

    // 2. Right-Click Context Menu Prevention
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow right-click inside editable text inputs so user copy/paste workflows remain intact
      const isEditable = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if (!isEditable) {
        e.preventDefault();
        showSecurityNotice(
          '🔒 সোর্স কোড ও উপাদান পরিদর্শন সুরক্ষিত রাখা হয়েছে।',
          '🔒 Source inspection and context menu are restricted for security.',
          'warning'
        );
      }
    };

    // 3. Keyboard Shortcut Guard (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // F12 DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice(
          '⚠️ ডেভেলপার টুলস (F12) অ্যাক্সেস সীমাবদ্ধ করা হয়েছে।',
          '⚠️ Developer Tools (F12) access is restricted.',
          'warning'
        );
        return;
      }

      // Ctrl/Cmd + Shift + I/J/C (Inspect / Console / Element)
      if (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'J' || key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice(
          '⚠️ Inspect Element ও কনসোল পরিদর্শন সীমাবদ্ধ।',
          '⚠️ Inspect Element & Console shortcuts are restricted.',
          'warning'
        );
        return;
      }

      // Ctrl/Cmd + U (View Source)
      if (isCtrlOrMeta && key === 'U') {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice(
          '⚠️ View Page Source অপশন সুরক্ষিত রাখা হয়েছে।',
          '⚠️ View Page Source is restricted.',
          'warning'
        );
        return;
      }

      // Ctrl/Cmd + S (Save Page)
      if (isCtrlOrMeta && key === 'S') {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice(
          '⚠️ পৃষ্ঠা সংরক্ষণ বা সোর্স ডাউনলোড সীমাবদ্ধ।',
          '⚠️ Webpage saving and source download are restricted.',
          'warning'
        );
        return;
      }
    };

    // 4. Prevent Image Dragging
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // 5. DevTools Detection (Window Dimension delta & debugger timing)
    let devtoolsOpen = false;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        printSecurityBanner();
      } else if (!widthThreshold && !heightThreshold && devtoolsOpen) {
        devtoolsOpen = false;
      }
    };

    const devtoolsInterval = setInterval(checkDevTools, 1500);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      clearInterval(consoleInterval);
      clearInterval(devtoolsInterval);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, [lang]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999999] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
        toastType === 'warning'
          ? 'bg-slate-900/90 text-amber-300 border-amber-500/30'
          : 'bg-slate-900/90 text-emerald-300 border-emerald-500/30'
      }`}>
        <div className={`p-1.5 rounded-lg ${toastType === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {toastType === 'warning' ? (
            <ShieldAlert className="w-5 h-5" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
        </div>
        <p className="text-xs sm:text-sm font-medium tracking-wide text-white">
          {toastMessage}
        </p>
      </div>
    </div>
  );
};
