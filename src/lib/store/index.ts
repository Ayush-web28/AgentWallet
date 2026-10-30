import { FinancialPolicy, Order, LedgerStats } from '@/types';
import { getSeedOrders } from './seed';

// Default financial policy
export const DEFAULT_POLICY: FinancialPolicy = {
  maxPerTransaction: 150, // purchases > $150 strictly blocked or flagged
  dailyCumulativeLimit: 500, // max $500 total in a single day
  autoApproveThreshold: 75, // <= $75 can be auto-approved if risk < 30
  allowedCategories: [
    'Electronics',
    'Office Supplies',
    'Cloud Software',
    'Developer Tools',
    'Peripherals',
    'Productivity',
  ],
  blockedMerchants: ['ShadyElectronicsCorp', 'UnverifiedDropshipper'],
  requireStrictSpecsMatch: true,
};

// Global in-memory storage (singleton across server module reloads)
interface GlobalStore {
  orders: Map<string, Order>;
  policy: FinancialPolicy;
}

const globalForStore = globalThis as unknown as {
  __agentWalletStore?: GlobalStore;
};

if (!globalForStore.__agentWalletStore) {
  const initialMap = new Map<string, Order>();
  // Pre-seed realistic transactions for immediate demo and audit visualization
  for (const order of getSeedOrders()) {
    initialMap.set(order.id, order);
  }

  globalForStore.__agentWalletStore = {
    orders: initialMap,
    policy: { ...DEFAULT_POLICY },
  };
}

export const store = globalForStore.__agentWalletStore;

export function getPolicy(): FinancialPolicy {
  return store.policy;
}

export function updatePolicy(newPolicy: Partial<FinancialPolicy>): FinancialPolicy {
  store.policy = {
    ...store.policy,
    ...newPolicy,
  };
  return store.policy;
}

export function getOrder(id: string): Order | undefined {
  return store.orders.get(id);
}

export function getAllOrders(): Order[] {
  return Array.from(store.orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveOrder(order: Order): Order {
  store.orders.set(order.id, {
    ...order,
    updatedAt: new Date().toISOString(),
  });
  return store.orders.get(order.id)!;
}

export function calculateDailySpend(): number {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  let total = 0;
  for (const order of Array.from(store.orders.values())) {
    if (order.status === 'CAPTURED' || order.status === 'APPROVED') {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= startOfDay) {
        total += order.amount.total;
      }
    }
  }
  return Number(total.toFixed(2));
}

export function getLedgerStats(): LedgerStats {
  const all = getAllOrders();
  let totalSpend = 0;
  let autoApprovedCount = 0;
  let humanApprovedCount = 0;
  let rejectedCount = 0;

  for (const o of all) {
    if (o.status === 'CAPTURED') {
      totalSpend += o.amount.total;
    }
    if (o.executionMode === 'AUTO_APPROVED') autoApprovedCount++;
    if (o.executionMode === 'MANUAL_APPROVED') humanApprovedCount++;
    if (o.executionMode === 'REJECTED' || o.status === 'REJECTED') rejectedCount++;
  }

  return {
    totalSpend: Number(totalSpend.toFixed(2)),
    totalOrders: all.length,
    autoApprovedCount,
    humanApprovedCount,
    rejectedCount,
    dailySpendToday: calculateDailySpend(),
    dailyLimit: store.policy.dailyCumulativeLimit,
  };
}
