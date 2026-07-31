import { toNumber } from './format';

type OrderTotalLike = {
  cost?: unknown;
  deliveryPrice?: unknown;
  delivery_price?: unknown;
  totalCost?: unknown;
  total_cost?: unknown;
  totalSumWithServiceFee?: unknown;
  total_sum_with_service_fee?: unknown;
  totalSum?: unknown;
  total_sum?: unknown;
  orderSumWithoutDeliveryAndServiceFee?: unknown;
  order_sum_without_delivery_and_service_fee?: unknown;
  deliveryServiceFee?: unknown;
  delivery_service_fee?: unknown;
  serviceFee?: unknown;
  service_fee?: unknown;
  costSummary?: {
    totalSum?: unknown;
    total_sum?: unknown;
    deliveryServiceFee?: unknown;
    delivery_service_fee?: unknown;
    serviceFee?: unknown;
    service_fee?: unknown;
  } | null;
  cost_summary?: {
    totalSum?: unknown;
    total_sum?: unknown;
    deliveryServiceFee?: unknown;
    delivery_service_fee?: unknown;
    serviceFee?: unknown;
    service_fee?: unknown;
  } | null;
};

type PaymentTotalLike = {
  totalOrderSum?: unknown;
  total_order_sum?: unknown;
  totalSumWithServiceFee?: unknown;
  total_sum_with_service_fee?: unknown;
  total_amount?: unknown;
  amount?: unknown;
  orderSumWithoutDeliveryAndServiceFee?: unknown;
  order_sum_without_delivery_and_service_fee?: unknown;
  deliveryServiceFee?: unknown;
  delivery_service_fee?: unknown;
  serviceFee?: unknown;
  service_fee?: unknown;
};

export function getOrderServiceFee(order: OrderTotalLike) {
  return order.costSummary?.deliveryServiceFee ??
    order.costSummary?.delivery_service_fee ??
    order.costSummary?.serviceFee ??
    order.costSummary?.service_fee ??
    order.cost_summary?.deliveryServiceFee ??
    order.cost_summary?.delivery_service_fee ??
    order.cost_summary?.serviceFee ??
    order.cost_summary?.service_fee ??
    order.deliveryServiceFee ??
    order.delivery_service_fee ??
    order.serviceFee ??
    order.service_fee;
}

export function getOrderBaseTotal(order: OrderTotalLike) {
  return order.cost_summary?.total_sum ?? toNumber(order.cost)+toNumber(order.delivery_service_fee);
}

export function getOrderTotalWithServiceFee(order: OrderTotalLike) {
  

  return toNumber(getOrderBaseTotal(order));
}

export function getOrderGoodsTotal(order: OrderTotalLike) {
  const explicitGoodsTotal =
    order.orderSumWithoutDeliveryAndServiceFee ??
    order.order_sum_without_delivery_and_service_fee;

  if (explicitGoodsTotal !== null && explicitGoodsTotal !== undefined) {
    return toNumber(explicitGoodsTotal);
  }

  const deliveryPrice = order.deliveryPrice ?? order.delivery_price;
  return Math.max(toNumber(getOrderBaseTotal(order)) - toNumber(deliveryPrice), 0);
}

export function getPaymentTotalWithServiceFee(type: PaymentTotalLike) {
  const explicitTotal = type.totalSumWithServiceFee ?? type.total_sum_with_service_fee;
  if (explicitTotal !== null && explicitTotal !== undefined) {
    return toNumber(explicitTotal);
  }

  const base = type.totalOrderSum ?? type.total_order_sum ?? type.total_amount ?? type.amount;
  return toNumber(base) +
    toNumber(
      type.deliveryServiceFee ??
        type.delivery_service_fee ??
        type.serviceFee ??
        type.service_fee,
    );
}

export function getPaymentGoodsTotal(type: PaymentTotalLike) {
  return toNumber(
    type.orderSumWithoutDeliveryAndServiceFee ??
      type.order_sum_without_delivery_and_service_fee,
  );
}
