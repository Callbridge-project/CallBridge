import { useTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import {
  Home,
  Store,
  Search,
  ShoppingCart,
  User
} from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const { token } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startTransition] = useTransition();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: 'Home', to: '/', icon: Home },
    { name: 'Pharmacies', to: '/pharmacies', icon: Store },
    { name: 'Search', to: '/search', icon: Search },
    { name: 'Cart', to: '/cart', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { name: 'Profile', to: token ? '/profile' : '/login', icon: User }
  ];

  const handleNavigation = (to: string) => {
    startTransition(() => navigate(to));
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#081C15] border-t border-slate-200 dark:border-[#40916C]/10 flex items-center justify-around px-2 z-50 shadow-lg">
      {/* Loading bar */}
      <div
        className={clsx(
          "absolute top-0 left-0 right-0 h-[2px] bg-[#52B788] transition-opacity duration-300",
          isPending ? "opacity-100" : "opacity-0"
        )}
      />

      {navItems.map((item) => {
        const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
        return (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.to)}
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            {/* Active top indicator line */}
            <span
              className={clsx(
                "absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full transition-all duration-300",
                isActive ? "w-8 bg-[#52B788]" : "w-0 bg-transparent"
              )}
            />
            
            {/* Icon + Label */}
            <span
              className={clsx(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 relative",
                isActive
                  ? "text-[#1B4332] dark:text-[#52B788] bg-emerald-50 dark:bg-[#40916C]/10 font-bold"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
              
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm animate-in zoom-in">
                  {item.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
