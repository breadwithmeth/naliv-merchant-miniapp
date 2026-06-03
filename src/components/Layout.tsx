import { ClipboardList, LogOut, MapPin, Route, Truck } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/orders';
import { countOrderGroups } from '../lib/orderFilters';
import { queryKeys } from '../lib/query';
import { useAuthStore } from '../store/auth';

const navItems = [
  { to: '/', label: 'Заказы', mobileLabel: 'Заказы', icon: ClipboardList },
  {
    to: '/couriers/locations',
    label: 'Курьеры на карте',
    mobileLabel: 'Карта',
    icon: MapPin,
  },
  {
    to: '/couriers/reports',
    label: 'Отчеты курьеров',
    mobileLabel: 'Отчеты',
    icon: Truck,
  },
  {
    to: '/couriers/shifts',
    label: 'Смены курьеров',
    mobileLabel: 'Смены',
    icon: Route,
  },
];

export function Layout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const orderCountersQuery = useQuery({
    queryKey: queryKeys.orderCounters(),
    queryFn: () =>
      getOrders({
        page: 1,
        limit: 50,
        dateFrom: '2024-01-01',
      }),
    refetchInterval: 30_000,
  });

  const orderCounts = countOrderGroups(orderCountersQuery.data?.orders ?? []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="telegram-safe-shell min-h-screen bg-transparent text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-background lg:block">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <div>
            <p className="label-text text-accent">Рабочее место</p>
            <h1 className="mt-1 text-2xl font-black leading-none text-ink">
              Комплектовщика
            </h1>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex min-h-11 items-center gap-3 rounded-none border-l-2 px-3 py-2.5 text-sm font-bold uppercase transition',
                    isActive
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-transparent text-muted hover:border-foreground hover:bg-mutedSurface hover:text-ink',
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.to === '/' ? (
                  <span className="ml-auto flex shrink-0 gap-1">
                    <span className="border border-line px-1.5 py-0.5 text-[10px] text-muted">
                      Н {orderCounts.new ?? 0}
                    </span>
                    <span className="border border-line px-1.5 py-0.5 text-[10px] text-muted">
                      С {orderCounts.collecting ?? 0}
                    </span>
                  </span>
                ) : null}
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-none border-l-2 border-transparent px-3 py-2.5 text-left text-sm font-bold uppercase text-muted transition hover:border-accent hover:bg-mutedSurface hover:text-accent"
          >
            <LogOut className="h-5 w-5" />
            Выйти
          </button>
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-background/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="label-text truncate text-muted">Рабочее место комплектовщика</p>
              <p className="truncate text-sm font-semibold text-ink">
                Обработка и сборка заказов
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-[calc(5.75rem+var(--app-bottom-inset))] sm:px-6 md:px-12 md:py-8 lg:px-16 lg:pb-[calc(2rem+var(--app-bottom-inset))]">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/95 pb-[calc(0.5rem+var(--app-bottom-inset))] pl-[calc(0.5rem+var(--app-left-inset))] pr-[calc(0.5rem+var(--app-right-inset))] pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'relative flex min-h-14 flex-col items-center justify-center gap-1 border border-transparent px-1 py-1 text-[10px] font-bold uppercase transition',
                    isActive
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'text-muted hover:border-line hover:text-foreground',
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{item.mobileLabel}</span>
                {item.to === '/' && (orderCounts.new || orderCounts.collecting) ? (
                  <span className="absolute right-1 top-1 min-w-4 border border-accent bg-accent px-1 text-center text-[9px] leading-4 text-background">
                    {(orderCounts.new ?? 0) + (orderCounts.collecting ?? 0)}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
