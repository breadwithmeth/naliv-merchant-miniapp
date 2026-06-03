import { useQuery } from '@tanstack/react-query';
import { Inbox, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../api/orders';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { OrderCard } from '../components/OrderCard';
import {
  countOrderGroups,
  filterOrders,
  getOrderIdentity,
  ORDER_FILTERS,
  type OrderFilterId,
} from '../lib/orderFilters';
import { notifyNewOrder } from '../lib/orderNotifications';
import { queryKeys } from '../lib/query';
import { useToastStore } from '../store/toasts';

const ORDERS_LIMIT = 50;

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<OrderFilterId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const seenOrderIdsRef = useRef<Set<string> | null>(null);
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  const ordersQuery = useQuery({
    queryKey: queryKeys.orders(page),
    queryFn: () =>
      getOrders({
        page,
        limit: ORDERS_LIMIT,
        dateFrom: '2024-01-01',
      }),
    refetchInterval: 30_000,
  });

  const rawOrders = ordersQuery.data?.orders;
  const orders = useMemo(() => rawOrders ?? [], [rawOrders]);
  const pagination = ordersQuery.data?.pagination;
  const counts = useMemo(() => countOrderGroups(orders), [orders]);
  const visibleOrders = useMemo(
    () => filterOrders(orders, activeFilter, searchQuery),
    [activeFilter, orders, searchQuery],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!orders.length) return;

    const currentIds = new Set(
      orders.map(getOrderIdentity).filter((identity) => identity.length > 0),
    );
    const previousIds = seenOrderIdsRef.current;
    seenOrderIdsRef.current = currentIds;

    if (!previousIds?.size) return;

    const hasNewOrder = Array.from(currentIds).some(
      (identity) => !previousIds.has(identity),
    );

    if (hasNewOrder) {
      notifyNewOrder();
      showToast({
        type: 'info',
        title: 'Новый заказ',
        message: 'В списке появился новый заказ.',
      });
    }
  }, [orders, showToast]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title text-ink">Заказы</h1>
        </div>
        <Button
          variant="secondary"
          onClick={() => void ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Обновить
        </Button>
      </div>

      <section className="space-y-3 border border-line bg-card p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="field w-full pl-10 pr-3 text-sm"
              placeholder="Поиск: ID, клиент, адрес"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className={ordersQuery.isError ? 'text-accent' : 'text-foreground'}>
              API: {ordersQuery.isError ? 'ошибка' : ordersQuery.isFetching ? 'обновление' : 'online'}
            </span>
            <span className="text-muted">
              Обновлено: {formatUpdatedAgo(ordersQuery.dataUpdatedAt, now)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {ORDER_FILTERS.map((filter) => {
            const active = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={
                  active
                    ? 'label-text shrink-0 border border-accent bg-accent px-3 py-2 text-background'
                    : 'label-text shrink-0 border border-line bg-transparent px-3 py-2 text-muted transition hover:border-accent hover:text-accent'
                }
              >
                {filter.label} {counts[filter.id] ?? 0}
              </button>
            );
          })}
        </div>
      </section>

      {ordersQuery.isLoading ? <LoadingState label="Загрузка заказов" /> : null}

      {ordersQuery.isError ? (
        <ErrorState
          message={ordersQuery.error.message}
          onRetry={() => void ordersQuery.refetch()}
        />
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && !orders.length ? (
        <EmptyState
          title="Заказов нет"
          message="Когда появятся новые заказы, они будут здесь."
          icon={<Inbox className="h-6 w-6" />}
        />
      ) : null}

      {!ordersQuery.isLoading &&
      !ordersQuery.isError &&
      orders.length > 0 &&
      !visibleOrders.length ? (
        <EmptyState
          title="Ничего не найдено"
          message="Измените фильтр или поисковый запрос."
          icon={<Search className="h-6 w-6" />}
        />
      ) : null}

      {visibleOrders.length ? (
        <div className="space-y-2">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.order_id ?? order.order_uuid}
              order={order}
              onOpen={() => navigate(`/orders/${order.order_id}`)}
            />
          ))}
        </div>
      ) : null}

      {pagination ? (
        <div className="flex items-center justify-between rounded-none border border-line bg-card px-4 py-3 text-sm">
          <span className="text-muted">
            Страница {pagination.page ?? page}
            {pagination.totalPages ? ` из ${pagination.totalPages}` : ''}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!pagination.hasPrev || page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Назад
            </Button>
            <Button
              variant="secondary"
              disabled={!pagination.hasNext}
              onClick={() => setPage((value) => value + 1)}
            >
              Далее
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatUpdatedAgo(dataUpdatedAt: number, now: number) {
  if (!dataUpdatedAt) return 'нет данных';

  const seconds = Math.max(0, Math.floor((now - dataUpdatedAt) / 1000));
  if (seconds < 5) return 'только что';
  if (seconds < 60) return `${seconds} сек назад`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин назад`;

  const hours = Math.floor(minutes / 60);
  return `${hours} ч назад`;
}
