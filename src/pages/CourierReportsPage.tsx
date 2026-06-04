import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { getCourierReports } from '../api/couriers';
import { Button } from '../components/Button';
import { DateTimeValue } from '../components/DateTimeValue';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoneyValue } from '../components/MoneyValue';
import { StatusBadge } from '../components/StatusBadge';
import {
  buildAddressText,
  formatDateTimeWithTimezoneForApi,
  formatDateTimeInput,
  getClientTimeZone,
  safeText,
  toInt,
  toNumber,
} from '../lib/format';
import {
  getOrderGoodsTotal,
  getOrderServiceFee,
  getOrderTotalWithServiceFee,
  getPaymentTotalWithServiceFee,
} from '../lib/orderTotals';
import { queryKeys } from '../lib/query';
import type { CourierReportData, CourierReportOrder, PaymentTypeSummary } from '../types/api';

type CourierBucket = {
  courierId: string;
  name: string;
  orders: number;
  firstOrderAt: number | null;
  lastOrderAt: number | null;
  deliveryRevenue: number;
  deliveryServiceFee: number;
  totalOrderSum: number;
  orderSumWithoutDelivery: number;
  cashGoodsRevenue: number;
  otherPaymentsDeliveryRevenue: number;
  courierPayment: number;
  paymentTypes: PaymentTypeSummary[];
  reportOrders: CourierReportOrder[];
};

export function CourierReportsPage() {
  const todayRange = makeDayRange(new Date());
  const [startDate, setStartDate] = useState(todayRange.start);
  const [endDate, setEndDate] = useState(todayRange.end);
  const [expandedCourierIds, setExpandedCourierIds] = useState<Set<string>>(
    () => new Set(),
  );

  const timeZone = getClientTimeZone();
  const startApi = formatDateTimeWithTimezoneForApi(startDate);
  const endApi = formatDateTimeWithTimezoneForApi(endDate);

  const reportQuery = useQuery({
    queryKey: queryKeys.courierReports(startApi, endApi, timeZone),
    queryFn: () =>
      getCourierReports({ startDate: startApi, endDate: endApi, timeZone }),
  });

  const grouped = useMemo(() => groupByCourier(reportQuery.data), [reportQuery.data]);
  const summary = makeSummary(reportQuery.data, grouped);

  const toggleCourier = (courierId: string) => {
    setExpandedCourierIds((current) => {
      const next = new Set(current);
      if (next.has(courierId)) {
        next.delete(courierId);
      } else {
        next.add(courierId);
      }
      return next;
    });
  };

  const applyPreset = (preset: 'today' | 'yesterday') => {
    const base = new Date();
    if (preset === 'yesterday') base.setDate(base.getDate() - 1);
    const range = makeDayRange(base);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="page-title text-ink">Отчет по курьерам</h1>
          <p className="mt-1 text-sm text-muted">
            Период, суммы доставки, заказы и разрез по типам оплаты.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void reportQuery.refetch()}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Обновить
        </Button>
      </div>

      <section className="rounded-none border border-line bg-card p-4 shadow-none">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => applyPreset('today')}>
              Сегодня
            </Button>
            <Button variant="secondary" onClick={() => applyPreset('yesterday')}>
              Вчера
            </Button>
          </div>
          <DateTimeField
            label="Начало"
            value={startDate}
            onChange={setStartDate}
          />
          <DateTimeField
            label="Конец"
            value={endDate}
            onChange={setEndDate}
          />
        </div>
      </section>

      {reportQuery.isLoading ? <LoadingState label="Загрузка отчета" /> : null}

      {reportQuery.isError ? (
        <ErrorState
          message={reportQuery.error.message}
          onRetry={() => void reportQuery.refetch()}
        />
      ) : null}

      {!reportQuery.isLoading && !reportQuery.isError ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <SummaryTile label="Доставлено" value={summary.totalDeliveredOrders} />
            <SummaryTile label="С курьером" value={summary.ordersWithCourier} />
            <SummaryTile label="Без курьера" value={summary.ordersWithoutCourier} />
            <SummaryTile
              label="Итого"
              value={<MoneyValue value={summary.totalRevenueWithServiceFee} />}
            />
            <SummaryTile
              label="Сумма доставки"
              value={<MoneyValue value={summary.totalDeliveryRevenue} />}
            />
            <SummaryTile
              label="Сервисный сбор"
              value={<MoneyValue value={summary.totalDeliveryServiceFee} />}
            />
          </section>

          {grouped.length ? (
            <section className="overflow-hidden rounded-none border border-line bg-card shadow-none">
              <div className="border-b border-line px-4 py-3">
                <h2 className="section-title text-ink">Группировка по курьерам</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line text-sm">
                  <thead className="bg-mutedSurface text-left label-text text-muted">
                    <tr>
                      <th className="px-4 py-3">Курьер</th>
                      <th className="px-4 py-3">Заказы</th>
                      <th className="px-4 py-3">Время</th>
                      <th className="px-4 py-3">Доставка</th>
                      <th className="px-4 py-3">Сервисный сбор</th>
                      <th className="px-4 py-3">Итого</th>
                      <th className="px-4 py-3">Расчет с курьером</th>
                      <th className="px-4 py-3">Товары и сервисный сбор</th>
                      <th className="px-4 py-3">Типы оплаты</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {grouped.map((courier) => {
                      const isExpanded = expandedCourierIds.has(courier.courierId);

                      return (
                        <Fragment key={courier.courierId}>
                          <tr className="align-top">
                            <td className="px-4 py-3 font-semibold text-ink">
                              <button
                                type="button"
                                onClick={() => toggleCourier(courier.courierId)}
                                aria-expanded={isExpanded}
                                className="flex min-w-56 items-center gap-2 text-left font-semibold text-ink transition hover:text-accent"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 shrink-0" />
                                )}
                                <span>{courier.name}</span>
                              </button>
                              <div className="mt-2 space-y-1 text-xs font-semibold text-foreground lg:hidden">
                                <CourierPaymentValue value={courier.courierPayment} />
                                <p className="text-muted">
                                  Итого: <MoneyValue value={courier.totalOrderSum} />
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">{courier.orders}</td>
                            <td className="px-4 py-3">{formatTimeRange(courier)}</td>
                            <td className="px-4 py-3"><MoneyValue value={courier.deliveryRevenue} /></td>
                            <td className="px-4 py-3">
                              <MoneyValue value={courier.deliveryServiceFee} />
                            </td>
                            <td className="px-4 py-3"><MoneyValue value={courier.totalOrderSum} /></td>
                            <td className="px-4 py-3 font-semibold text-ink">
                              <CourierPaymentValue value={courier.courierPayment} />
                            </td>
                            <td className="px-4 py-3">
                              <MoneyValue value={courier.orderSumWithoutDelivery} />
                            </td>
                            <td className="min-w-72 px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {courier.paymentTypes.map((type) => (
                                  <span
                                    key={`${courier.courierId}-${type.name}`}
                                    className="rounded-none bg-mutedSurface px-2 py-1 text-xs text-foreground"
                                  >
                                    {safeText(type.name)}: {toNumber(type.orders)} /{' '}
                                    <MoneyValue value={getPaymentTotalWithServiceFee(type)} />{' '}
                                    / сбор{' '}
                                    <MoneyValue
                                      value={
                                        type.deliveryServiceFee ??
                                        type.delivery_service_fee ??
                                        type.serviceFee ??
                                        type.service_fee
                                      }
                                    />
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                          {isExpanded ? (
                            <tr>
                              <td colSpan={9} className="bg-background px-4 py-4">
                                <CourierOrdersTable orders={courier.reportOrders} />
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <EmptyState
              title="Нет данных за период"
              message="Выберите другой период или обновите отчет."
              icon={<CalendarDays className="h-6 w-6" />}
            />
          )}
        </>
      ) : null}
    </div>
  );
}

function CourierOrdersTable({ orders }: { orders: CourierReportOrder[] }) {
  return (
    <div className="overflow-hidden rounded-none border border-line bg-card">
      <div className="border-b border-line px-3 py-2">
        <p className="label-text text-muted">Заказы курьера</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-xs">
          <thead className="bg-mutedSurface text-left label-text text-muted">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Время</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Оплата</th>
              <th className="px-3 py-2">Доставка</th>
              <th className="px-3 py-2">Сбор</th>
              <th className="px-3 py-2">Товары и сервисный сбор</th>
              <th className="px-3 py-2">Итого</th>
              <th className="px-3 py-2">Адрес</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order, index) => {
              const status = toInt(order.current_status?.status, -1);
              const serviceFee = toNumber(getOrderServiceFee(order));
              const goodsTotal = getOrderGoodsTotal(order) + serviceFee;
              const totalSumWithServiceFee = getOrderTotalWithServiceFee(order);

              return (
                <tr key={`${order.order_id ?? 'order'}-${index}`} className="align-top">
                  <td className="px-3 py-2 font-semibold text-ink">
                    <p>#{safeText(order.order_id, '-')}</p>
                    <div className="mt-1 space-y-0.5 text-[11px] font-semibold text-foreground lg:hidden">
                      <p>
                        Итого: <MoneyValue value={totalSumWithServiceFee} />
                      </p>
                      <p>
                        Товары и сервисный сбор: <MoneyValue value={goodsTotal} />
                      </p>
                      <p className="text-muted">
                        Сбор: <MoneyValue value={serviceFee} />
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <DateTimeValue value={readOrderDateValue(order)} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={status} label={order.current_status?.status_name} />
                  </td>
                  <td className="px-3 py-2">{safeText(order.payment_type?.name, 'Не указан')}</td>
                  <td className="px-3 py-2"><MoneyValue value={order.delivery_price} /></td>
                  <td className="px-3 py-2"><MoneyValue value={serviceFee} /></td>
                  <td className="px-3 py-2"><MoneyValue value={goodsTotal} /></td>
                  <td className="px-3 py-2 font-semibold text-ink">
                    <MoneyValue value={totalSumWithServiceFee} />
                  </td>
                  <td className="min-w-72 px-3 py-2 text-foreground">
                    {buildAddressText(order.delivery_address)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <input
        type="datetime-local"
        step="60"
        value={formatDateTimeInput(value)}
        onChange={(event) => onChange(parseDateTimeInput(event.target.value, value))}
        className="field mt-2 block min-h-10 px-3 py-2 text-sm"
      />
    </label>
  );
}

function SummaryTile({ label, value }: { label: string; value: number | JSX.Element }) {
  return (
    <div className="rounded-none border border-line bg-card p-4 shadow-none">
      <p className="label-text text-muted">{label}</p>
      <p className="mt-2 page-title text-ink">{value}</p>
    </div>
  );
}

function CourierPaymentValue({ value }: { value: number }) {
  if (value > 0) {
    return (
      <p>
        Курьер отдаст: <MoneyValue value={value} />
      </p>
    );
  }

  if (value < 0) {
    return (
      <p>
        Заплатить курьеру: <MoneyValue value={Math.abs(value)} />
      </p>
    );
  }

  return <p className="text-muted">Расчет закрыт: <MoneyValue value={0} /></p>;
}

function groupByCourier(data?: CourierReportData): CourierBucket[] {
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const buckets = new Map<string, CourierBucket & { paymentMap: Map<string, PaymentTypeSummary> }>();

  for (const order of orders) {
    const courier = order.courier;
    const courierId = courier?.courier_id ?? courier?.id ?? -1;
    const key = String(courierId);
    const deliveryRevenue = toNumber(order.delivery_price);
    const deliveryServiceFee = toNumber(getOrderServiceFee(order));
    const goodsTotal = getOrderGoodsTotal(order) + deliveryServiceFee;
    const totalOrderSum = getOrderTotalWithServiceFee(order);
    const orderSumWithoutDelivery = goodsTotal;
    const paymentName = safeText(order.payment_type?.name, 'Не указан');
    const isCash = isCashPayment(order.payment_type);
    const orderTime = readOrderTimestamp(order);

    const bucket =
      buckets.get(key) ??
      {
        courierId: key,
        name: courier ? safeText(courier.name ?? courier.login, 'Курьер') : 'Без курьера',
        orders: 0,
        firstOrderAt: null,
        lastOrderAt: null,
        deliveryRevenue: 0,
        deliveryServiceFee: 0,
        totalOrderSum: 0,
        orderSumWithoutDelivery: 0,
        cashGoodsRevenue: 0,
        otherPaymentsDeliveryRevenue: 0,
        courierPayment: 0,
        paymentTypes: [],
        reportOrders: [],
        paymentMap: new Map<string, PaymentTypeSummary>(),
      };

    bucket.orders += 1;
    if (orderTime !== null) {
      bucket.firstOrderAt =
        bucket.firstOrderAt === null ? orderTime : Math.min(bucket.firstOrderAt, orderTime);
      bucket.lastOrderAt =
        bucket.lastOrderAt === null ? orderTime : Math.max(bucket.lastOrderAt, orderTime);
    }
    bucket.deliveryRevenue += deliveryRevenue;
    bucket.deliveryServiceFee += deliveryServiceFee;
    bucket.totalOrderSum += totalOrderSum;
    bucket.orderSumWithoutDelivery += orderSumWithoutDelivery;
    if (isCash) {
      bucket.cashGoodsRevenue += orderSumWithoutDelivery;
    } else {
      bucket.otherPaymentsDeliveryRevenue += deliveryRevenue;
    }
    bucket.courierPayment =
      bucket.cashGoodsRevenue - bucket.otherPaymentsDeliveryRevenue;
    bucket.reportOrders.push(order);

    const payment = bucket.paymentMap.get(paymentName) ?? {
      name: paymentName,
      orders: 0,
      deliveryRevenue: 0,
      totalOrderSum: 0,
      totalSumWithServiceFee: 0,
      orderSumWithoutDelivery: 0,
    };

    payment.orders = toNumber(payment.orders) + 1;
    payment.deliveryRevenue = toNumber(payment.deliveryRevenue) + deliveryRevenue;
    payment.deliveryServiceFee = toNumber(payment.deliveryServiceFee) + deliveryServiceFee;
    payment.totalOrderSum = toNumber(payment.totalOrderSum) + totalOrderSum;
    payment.totalSumWithServiceFee =
      toNumber(payment.totalSumWithServiceFee) + totalOrderSum;
    payment.orderSumWithoutDelivery =
      toNumber(payment.orderSumWithoutDelivery) + orderSumWithoutDelivery;
    bucket.paymentMap.set(paymentName, payment);
    buckets.set(key, bucket);
  }

  return Array.from(buckets.values())
    .map(({ paymentMap, ...bucket }) => ({
      ...bucket,
      paymentTypes: Array.from(paymentMap.values()),
      reportOrders: bucket.reportOrders.sort(
        (a, b) => (readOrderTimestamp(b) ?? 0) - (readOrderTimestamp(a) ?? 0),
      ),
    }))
    .sort((a, b) => b.deliveryRevenue - a.deliveryRevenue);
}

function makeSummary(data: CourierReportData | undefined, grouped: CourierBucket[]) {
  const summary = data?.summary;
  const totalOrders = grouped.reduce((sum, courier) => sum + courier.orders, 0);
  const withoutCourier = grouped.find((courier) => courier.courierId === '-1')?.orders ?? 0;
  const fallbackDeliveryServiceFee = grouped.reduce(
    (sum, courier) => sum + courier.deliveryServiceFee,
    0,
  );
  const totalDeliveryServiceFee = toNumber(
    summary?.total_delivery_service_fee ?? summary?.total_service_fee,
    fallbackDeliveryServiceFee,
  );
  const groupedTotalRevenueWithServiceFee = grouped.reduce(
    (sum, courier) => sum + courier.totalOrderSum,
    0,
  );
  let totalRevenueWithServiceFee = groupedTotalRevenueWithServiceFee;
  if (grouped.length === 0 && summary?.total_revenue_with_service_fee !== undefined) {
    totalRevenueWithServiceFee = toNumber(summary.total_revenue_with_service_fee);
  } else if (grouped.length === 0 && summary?.total_revenue !== undefined) {
    totalRevenueWithServiceFee = toNumber(summary.total_revenue) + totalDeliveryServiceFee;
  }

  return {
    totalDeliveredOrders: toNumber(summary?.total_delivered_orders, totalOrders),
    ordersWithCourier: toNumber(summary?.orders_with_courier, totalOrders - withoutCourier),
    ordersWithoutCourier: toNumber(summary?.orders_without_courier, withoutCourier),
    totalRevenueWithServiceFee,
    totalDeliveryRevenue: toNumber(
      summary?.total_delivery_revenue,
      grouped.reduce((sum, courier) => sum + courier.deliveryRevenue, 0),
    ),
    totalDeliveryServiceFee,
  };
}

function parseDateTimeInput(value: string, fallback: Date) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : fallback;
}

function readOrderTimestamp(order: {
  order_created?: string | null;
  created_at?: string | null;
  log_timestamp?: string | null;
  delivery_date?: string | null;
}) {
  const value = readOrderDateValue(order);
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function readOrderDateValue(order: {
  order_created?: string | null;
  created_at?: string | null;
  log_timestamp?: string | null;
  delivery_date?: string | null;
}) {
  return order.order_created ?? order.created_at ?? order.log_timestamp ?? order.delivery_date;
}

function isCashPayment(paymentType?: {
  payment_type_id?: number | string | null;
  id?: number | string | null;
  name?: string | null;
} | null) {
  const paymentId = toNumber(paymentType?.payment_type_id ?? paymentType?.id, Number.NaN);
  if (paymentId === 6) return true;

  const paymentName = paymentType?.name?.toLocaleLowerCase('ru-RU') ?? '';
  return paymentName.includes('налич') || paymentName.includes('cash');
}

function formatTimeRange(courier: Pick<CourierBucket, 'firstOrderAt' | 'lastOrderAt'>) {
  if (courier.firstOrderAt === null || courier.lastOrderAt === null) return 'Не указано';

  const formatTime = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format;
  const first = formatTime(courier.firstOrderAt);
  const last = formatTime(courier.lastOrderAt);
  return first === last ? first : `${first}–${last}`;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function makeDayRange(date: Date) {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}
