import { toNumber } from './format';

type OrderTotalLike = {
  cost?: unknown;
  total_cost?: unknown;
  total_sum?: unknown;
  delivery_service_fee?: unknown;
  service_fee?: unknown;
  cost_summary?: {
    total_sum?: unknown;
    delivery_service_fee?: unknown;
    service_fee?: unknown;
  } | null;
};

type PaymentTotalLike = {
  totalOrderSum?: unknown;
  total_order_sum?: unknown;
  total_amount?: unknown;
  amount?: unknown;
  deliveryServiceFee?: unknown;
  delivery_service_fee?: unknown;
};

export function getOrderServiceFee(order: OrderTotalLike) {
  return order.cost_summary?.delivery_service_fee ??
    order.cost_summary?.service_fee ??
    order.delivery_service_fee ??
    order.service_fee;
}

export function getOrderBaseTotal(order: OrderTotalLike) {
  return order.cost_summary?.total_sum ?? order.total_cost ?? order.total_sum ?? order.cost;
}

export function getOrderTotalWithServiceFee(order: OrderTotalLike) {
  return toNumber(getOrderBaseTotal(order)) + toNumber(getOrderServiceFee(order));
}

export function getPaymentTotalWithServiceFee(type: PaymentTotalLike) {
  const base = type.totalOrderSum ?? type.total_order_sum ?? type.total_amount ?? type.amount;
  return toNumber(base) + toNumber(type.deliveryServiceFee ?? type.delivery_service_fee);
}
