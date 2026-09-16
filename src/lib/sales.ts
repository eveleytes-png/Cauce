export type OrderStatus = "Pendiente" | "Cerrada";

export type OrderLine = {
  name: string;
  provider: string;
  qty: number;
};

export type Order = {
  id: string;
  client: string;
  provider: string;
  createdAt: string;
  closedAt: string | null;
  status: OrderStatus;
  totalAmount: number;
  lines: OrderLine[];
};

export function productCount(order: Order) {
  return order.lines.reduce((sum, line) => sum + line.qty, 0);
}

export function formatARS(amount: number) {
  return `ARS ${amount.toLocaleString("es-AR")}`;
}

export function formatCompactARS(amount: number) {
  if (amount <= 0) {
    return "0";
  }
  if (amount >= 10_000_000) {
    return `${(amount / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} M`;
  }
  return `${Math.round(amount / 1_000).toLocaleString("es-AR")} mil`;
}

export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function monthName(date: Date) {
  return date.toLocaleDateString("es-AR", { month: "long" });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function currentMonthEnd(now: Date) {
  const today = endOfDay(now);
  const lastDay = endOfMonth(now);
  return today.getTime() < lastDay.getTime() ? today : lastDay;
}

function isClosedInRange(order: Order, start: Date, end: Date) {
  if (order.status !== "Cerrada" || !order.closedAt) {
    return false;
  }
  const closed = new Date(order.closedAt);
  return closed >= start && closed <= end;
}

export function currentMonthSales(orders: Order[], now = new Date()) {
  const start = startOfMonth(now);
  const end = currentMonthEnd(now);
  return orders
    .filter((order) => isClosedInRange(order, start, end))
    .reduce((sum, order) => sum + order.totalAmount, 0);
}

function splitOrderByProvider(order: Order) {
  if (order.lines.length === 0) {
    return order.provider ? ([[order.provider, order.totalAmount]] as [string, number][]) : [];
  }

  const qtyByProvider = new Map<string, number>();
  let totalQty = 0;
  for (const line of order.lines) {
    qtyByProvider.set(line.provider, (qtyByProvider.get(line.provider) ?? 0) + line.qty);
    totalQty += line.qty;
  }
  if (totalQty === 0) {
    const fallback = order.provider || order.lines[0]?.provider || "";
    return [[fallback, order.totalAmount]] as [string, number][];
  }

  const entries = [...qtyByProvider.entries()];
  const shares: [string, number][] = [];
  let allocated = 0;
  entries.forEach(([provider, qty], index) => {
    const amount =
      index === entries.length - 1
        ? order.totalAmount - allocated
        : Math.round(order.totalAmount * (qty / totalQty));
    allocated += amount;
    shares.push([provider, amount]);
  });
  return shares;
}

export type MonthSales = {
  label: string;
  total: number;
  byProvider: Record<string, number>;
};

export function last12MonthsSales(orders: Order[], now = new Date()): MonthSales[] {
  return Array.from({ length: 12 }, (_, index) => {
    const offset = 11 - index;
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const start = startOfMonth(monthDate);
    const isCurrentMonth =
      monthDate.getFullYear() === now.getFullYear() &&
      monthDate.getMonth() === now.getMonth();
    const end = isCurrentMonth ? currentMonthEnd(now) : endOfMonth(monthDate);
    const byProvider: Record<string, number> = {};
    let total = 0;

    for (const order of orders) {
      if (!isClosedInRange(order, start, end)) continue;
      total += order.totalAmount;
      for (const [provider, amount] of splitOrderByProvider(order)) {
        byProvider[provider] = (byProvider[provider] ?? 0) + amount;
      }
    }

    return {
      label: monthDate
        .toLocaleDateString("es-AR", { month: "short" })
        .replace(".", ""),
      total,
      byProvider,
    };
  });
}

export const CHART_PROVIDER_COLORS = [
  "#2563EB",
  "#F97316",
  "#DC2626",
  "#0891B2",
  "#DB2777",
  "#D97706",
  "#1E3A8A",
  "#BE123C",
  "#92400E",
  "#475569",
  "#0284C7",
  "#EA580C",
  "#9F1239",
  "#A16207",
  "#64748B",
  "#0F172A",
] as const;

export const CHART_OTHER_COLOR = "#94A3B8";
export const CHART_PROVIDER_LIMIT = 7;

export const CHART_MARKERS = ["circle", "square", "triangle", "diamond", "plus", "star", "hex"] as const;
export type ChartMarkerKind = (typeof CHART_MARKERS)[number];

export type ChartSeries = {
  name: string;
  color: string;
  marker: ChartMarkerKind;
  isOther?: boolean;
};

function providerNames(months: MonthSales[]) {
  const names = new Set<string>();
  for (const month of months) {
    for (const name of Object.keys(month.byProvider)) names.add(name);
  }
  return [...names].sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
}

export function chartProviders(months: MonthSales[]) {
  return providerNames(months);
}

export function providerColorMap(names: string[]) {
  const sorted = [...names].sort((left, right) => left.localeCompare(right, "es", { sensitivity: "base" }));
  return Object.fromEntries(
    sorted.map((name, index) => [name, CHART_PROVIDER_COLORS[index % CHART_PROVIDER_COLORS.length]]),
  ) as Record<string, string>;
}

export function buildChartSeries(months: MonthSales[]): { series: ChartSeries[]; months: MonthSales[] } {
  const totals: Record<string, number> = {};
  for (const month of months) {
    for (const [name, amount] of Object.entries(month.byProvider)) {
      totals[name] = (totals[name] ?? 0) + amount;
    }
  }
  const ranked = Object.keys(totals).sort(
    (left, right) =>
      (totals[right] ?? 0) - (totals[left] ?? 0) || left.localeCompare(right, "es", { sensitivity: "base" }),
  );
  const top = ranked.slice(0, CHART_PROVIDER_LIMIT);
  const rest = ranked.slice(CHART_PROVIDER_LIMIT);
  const series: ChartSeries[] = top.map((name, index) => ({
    name,
    color: CHART_PROVIDER_COLORS[index % CHART_PROVIDER_COLORS.length] ?? "#2563EB",
    marker: CHART_MARKERS[index % CHART_MARKERS.length] ?? "circle",
  }));
  if (rest.length > 0) {
    series.push({
      name: "Otros",
      color: CHART_OTHER_COLOR,
      marker: "hex",
      isOther: true,
    });
  }

  const grouped = months.map((month) => {
    const byProvider: Record<string, number> = {};
    for (const name of top) {
      const amount = month.byProvider[name] ?? 0;
      if (amount > 0) byProvider[name] = amount;
    }
    if (rest.length > 0) {
      const other = rest.reduce((sum, name) => sum + (month.byProvider[name] ?? 0), 0);
      if (other > 0) byProvider["Otros"] = other;
    }
    return { ...month, byProvider };
  });

  return { series, months: grouped };
}

export function last3MonthsCaption(now = new Date()) {
  const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1));
  const startText = start.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  const endText = now.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  return `Productos de los últimos 3 meses. Del ${startText} al ${endText}`;
}

export function topSoldProducts(orders: Order[], now = new Date(), limit = 3) {
  const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1));
  const end = currentMonthEnd(now);
  const totals = new Map<string, { name: string; provider: string; qty: number }>();

  for (const order of orders) {
    if (!isClosedInRange(order, start, end)) continue;
    for (const line of order.lines) {
      const current = totals.get(line.name) ?? {
        name: line.name,
        provider: line.provider,
        qty: 0,
      };
      current.qty += line.qty;
      totals.set(line.name, current);
    }
  }

  return [...totals.values()].sort((left, right) => right.qty - left.qty).slice(0, limit);
}
