import {
  ClipboardList,
  LogOut,
  MapPin,
  Menu,
  Route,
  Truck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '../store/auth';
import { Button } from './Button';

const navItems = [
  { to: '/', label: 'Заказы', icon: ClipboardList },
  { to: '/couriers/locations', label: 'Курьеры на карте', icon: MapPin },
  { to: '/couriers/reports', label: 'Отчеты курьеров', icon: Truck },
  { to: '/couriers/shifts', label: 'Смены курьеров', icon: Route },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="telegram-safe-shell min-h-screen bg-transparent text-ink">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-line bg-background transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <div>
            <p className="label-text text-accent">Рабочее место</p>
            <h1 className="mt-1 text-2xl font-black leading-none text-ink">
              Комплектовщика
            </h1>
          </div>
          <Button
            variant="ghost"
            className="h-9 w-9 px-0 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
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
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {mobileOpen ? (
        <button
          className="fixed inset-0 z-30 bg-background/80 lg:hidden"
          type="button"
          aria-label="Закрыть меню"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-background/95 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-10 w-10 px-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Открыть меню"
              icon={<Menu className="h-5 w-5" />}
            />
            <div>
              <p className="label-text text-muted">Рабочее место комплектовщика</p>
              <p className="text-sm font-semibold text-ink">Обработка и сборка заказов</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            icon={<LogOut className="h-4 w-4" />}
          >
            Выйти
          </Button>
        </header>

        <main className="mx-auto w-full max-w-7xl px-6 py-8 pb-[calc(2rem+var(--app-content-safe-bottom,0px))] md:px-12 lg:px-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
