export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CAPTURED'
  | 'REJECTED'
  | 'FAILED';

export type OrderExecutionMode =
  | 'AUTO_APPROVED'
  | 'MANUAL_APPROVED'
  | 'REJECTED'
  | 'PENDING';

export interface CatalogItem {
  id: string;
  merchantName: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  shippingCost: number;
  deliveryDays: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  specs: Record<string, string | number | boolean>;
  description?: string;
  imageUrl?: string;
}

export interface FinancialPolicy {
  maxPerTransaction: number; // default $150
  dailyCumulativeLimit: number; // default $500
  autoApproveThreshold: number; // default $75
  allowedCategories: string[];
  blockedMerchants: string[];
  requireStrictSpecsMatch: boolean;
}

export interface GuardrailResult {
  allowed: boolean;
  requiresApproval: boolean;
  autoApproved: boolean;
  riskScore: number; // 0-100
  reasons: string[];
  policyViolations: string[];
}

export interface IntentVerificationPayload {
  customId: string;
  amount: number;
  currency: string;
  itemId: string;
  itemTitle: string;
  merchantName: string;
  userPrompt: string;
  timestamp: number;
}

export interface Order {
  id: string;
  customId: string;
  intentHash: string;
  status: OrderStatus;
  executionMode: OrderExecutionMode;
  item: CatalogItem;
  amount: {
    total: number;
    currency: string;
    itemTotal: number;
    shipping: number;
    tax?: number;
  };
  paypalOrderId?: string;
  paypalCaptureId?: string;
  approvalToken?: string;
  approvalExpiresAt?: number;
  rejectionReason?: string;
  riskScore: number;
  guardrailNotes: string[];
  evaluationReasoning?: string;
  userPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export type AgentStepPhase =
  | 'DECOMPOSITION'
  | 'SEARCH'
  | 'EVALUATION'
  | 'GUARDRAIL'
  | 'ORDER_CREATION'
  | 'COMPLETED'
  | 'FAILED';

export interface AgentStep {
  id: string;
  phase: AgentStepPhase;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'error';
  timestamp: number;
  thought?: string;
  toolCall?: {
    toolName: string;
    input: any;
    output?: any;
  };
  data?: any;
}

export interface GoalDecomposition {
  itemName: string;
  targetPrice: number;
  maxBudget: number;
  currency: string;
  preferredSpecs: Record<string, string>;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface ProductCandidateEvaluation {
  itemId: string;
  merchantName: string;
  title: string;
  totalPrice: number;
  pros: string[];
  cons: string[];
  score: number; // 0-100
}

export interface ProductComparison {
  candidates: ProductCandidateEvaluation[];
  selectedItem: {
    id: string;
    title: string;
    merchantName: string;
    price: number;
    shippingCost: number;
    total: number;
  };
  selectionRationale: string;
}

export interface GuardrailAudit {
  riskScore: number; // 0-100
  policyCompliant: boolean;
  requiresHumanSignOff: boolean;
  riskFactors: string[];
  mitigations: string[];
  recommendedAction: 'AUTO_APPROVE' | 'REQUIRE_APPROVAL' | 'REJECT';
}

export interface AgentFinalAction {
  actionType: 'CREATE_ORDER' | 'REQUEST_APPROVAL' | 'ABORT';
  explanation: string;
  orderPayload?: Partial<Order>;
  rejectionReason?: string;
}

export interface AgentRunResponse {
  runId: string;
  success: boolean;
  steps: AgentStep[];
  goal?: GoalDecomposition;
  comparison?: ProductComparison;
  guardrailAudit?: GuardrailAudit;
  order?: Order;
  finalAction?: AgentFinalAction;
  error?: string;
}

export interface LedgerStats {
  totalSpend: number;
  totalOrders: number;
  autoApprovedCount: number;
  humanApprovedCount: number;
  rejectedCount: number;
  dailySpendToday: number;
  dailyLimit: number;
}
