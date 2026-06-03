import { buildAddressText, safeText, toInt } from './format';
import type { OrderSummary } from '../types/api';

export type OrderFilterId =
  | 'all'
  | 'new'
  | 'accepted'
  | 'collecting'
  | 'ready'
  | 'problem';

export type OrderFilter = {
  id: OrderFilterId;
  label: string;
  statuses?: number[];
};

export const ORDER_FILTERS: OrderFilter[] = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новые', statuses: [0] },
  { id: 'accepted', label: 'Принятые', statuses: [1, 11] },
  { id: 'collecting', label: 'Сборка', statuses: [12] },
  { id: 'ready', label: 'Готовые', statuses: [2] },
  {
    id: 'problem',
    label: 'Проблемные',
    statuses: [5, 50, 51, 52, 53, 54, 6, 66, 67, 68],
  },
];

export function getOrderStatus(order: OrderSummary) {
  return toInt(order.current_status?.status, -1);
}

export function getOrderIdentity(order: OrderSummary) {
  return String(order.order_id ?? order.order_uuid ?? '');
}

export function getOrderSearchText(order: OrderSummary) {
  return [
    order.order_id,
    order.order_uuid,
    order.user?.name,
    order.user?.login,
    buildAddressText(order.delivery_address),
    order.payment_type?.name,
    order.extra,
    order.current_status?.status_name,
  ]
    .map((value) => safeText(value, ''))
    .join(' ')
    .toLowerCase();
}

export function filterOrders(
  orders: OrderSummary[],
  filterId: OrderFilterId,
  searchQuery: string,
) {
  const filter = ORDER_FILTERS.find((item) => item.id === filterId);
  const statuses = filter?.statuses;
  const query = searchQuery.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesStatus =
      !statuses || statuses.includes(getOrderStatus(order));
    const matchesSearch =
      !query || getOrderSearchText(order).includes(query);
    return matchesStatus && matchesSearch;
  });
}

export function countOrderGroups(orders: OrderSummary[]) {
  return ORDER_FILTERS.reduce<Record<OrderFilterId, number>>((acc, filter) => {
    acc[filter.id] =
      filter.id === 'all'
        ? orders.length
        : orders.filter((order) =>
            filter.statuses?.includes(getOrderStatus(order)),
          ).length;
    return acc;
  }, {} as Record<OrderFilterId, number>);
}
