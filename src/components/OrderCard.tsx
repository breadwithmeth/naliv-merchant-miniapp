import { CalendarClock, CreditCard, MapPin, MessageSquare, User } from 'lucide-react';
import type { OrderSummary } from '../types/api';
import { buildAddressText, formatDateTime, formatMoney, safeText, toInt } from '../lib/format';
import { StatusBadge } from './StatusBadge';

export function OrderCard({
  order,
  onOpen,
}: {
  order: OrderSummary;
  onOpen: () => void;
}) {
  const status = order.current_status?.status ?? null;
  const total = order.total_cost ?? order.total_sum ?? order.cost;
  const serviceFee = order.delivery_service_fee ?? order.service_fee;
  const hasServiceFee = serviceFee !== null && serviceFee !== undefined && serviceFee !== '';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-none border border-line bg-card px-3 py-2.5 text-left shadow-none transition duration-150 ease-out hover:border-accent hover:bg-mutedSurface focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background md:px-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black leading-none text-ink">
              Заказ #{toInt(order.order_id)}
            </h2>
            <StatusBadge status={status} label={order.current_status?.status_name} />
          </div>
          <div className="mt-2 grid gap-x-4 gap-y-1 text-xs text-muted md:grid-cols-2">
            <span className="flex min-w-0 items-center gap-2">
              <User className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate">{safeText(order.user?.name)}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span>{formatDateTime(order.delivery_date)}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2 md:col-span-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate">{buildAddressText(order.delivery_address)}</span>
            </span>
          </div>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xl font-black leading-none text-ink">{formatMoney(total)}</p>
          {hasServiceFee ? (
            <p className="mt-1 text-xs font-semibold text-foreground">
              Сбор: {formatMoney(serviceFee)}
            </p>
          ) : null}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted sm:justify-end">
            <CreditCard className="h-3.5 w-3.5" />
            {safeText(order.payment_type?.name, 'Оплата не указана')}
          </p>
        </div>
      </div>

      {order.extra ? (
        <div className="mt-2 flex gap-2 rounded-none bg-accent/10 px-2.5 py-1.5 text-xs text-accent">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{order.extra}</span>
        </div>
      ) : null}
    </button>
  );
}
