// Subscription Plan interfaces
export interface PlanFeature {
  category: string;
  description: string;
  display_name: string;
  feature_id: string;
  feature_key: string;
  flags: Record<string, any>;
  is_active: boolean;
  is_measurable: boolean;
  service_type: string;
  value: boolean | number | string;
  value_type: 'boolean' | 'number' | 'string';
}

export interface CountryAvailability {
  country_code: string;
  currency: string;
  discount_annual_percent: number;
  is_active: boolean;
  is_public: boolean;
  price_annual: number;
  price_monthly: number;
  tax_rate: number;
}

export interface PlanPrice {
  country_code: string;
  created_at: string;
  description: string;
  display_name: string;
  is_active: boolean;
  is_required: boolean;
  plan_id: string;
  price_id: string;
  price_type: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  billing_cycles: string[];
  country_availability: CountryAvailability[];
  created_at: string;
  created_by: string;
  description: string;
  display_name: string;
  display_order: number;
  features_data: PlanFeature[];
  is_active: boolean;
  is_public: boolean;
  name: string;
  plan_id: string;
  prices: PlanPrice[];
  service_type: string;
  trial_days: number;
  updated_at: string;
}

export interface PlanMetadata {
  http_status: number;
  http_status_phrase: string;
  is_error: boolean;
  message: string;
  time: number;
}

export interface PlanPagination {
  current_page: number;
  items_per_page: number;
  total_items: number;
  total_pages: number;
}

export interface GetPlanResponse {
  data: {
    plan: SubscriptionPlan;
  };
  metaData: PlanMetadata;
  pagination: PlanPagination;
}

// Create Subscription interfaces
export interface SubscriptionMetadata {
  source: string;
  campaign?: string;
}

export interface CreateSubscriptionRequest {
  seller_id: number;
  shop_id: number;
  service_type: string;
  plan_id: string;
  card_id: string;
  payment_method: string;
  billing_cycle: string;
  country_code: string;
  currency: string;
  metadata: SubscriptionMetadata;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Current Subscription interfaces
export interface CurrentSubscription {
  cronos_subscription_id: string;
  plan_id: string;
  plan_name?: string;
  billing_cycle: string;
  status: string;
  payment_id?: string;
  trial_ends_at?: string;
  current_period_end?: string;
  created_at?: string;
  payment_provider?: string;
}

export interface CurrentSubscriptionResponse {
  data: {
    plan: SubscriptionPlan;
    subscription: CurrentSubscription;
  };
  metaData?: PlanMetadata;
}

// Subscription Change Preview interfaces
export interface PreviewPrice {
  current_price?: {
    active: boolean;
    amount: number;
    currency: string;
    id: string;
    nickname: string;
    product_id: string;
    usage_type: string;
  };
  new_price: {
    active: boolean;
    amount: number;
    currency: string;
    id: string;
    nickname: string;
    product_id: string;
    usage_type: string;
  };
  execution_date?: string;
  prorated_amount?: number;
  remaining_days?: number;
  metric?: any;
}

export interface SubscriptionChangePreviewResponse {
  data?: {
    preview: {
      code: number;
      datetime: string;
      preview: {
        current_subscription_period: string;
        merchant_id: string;
        new_subscription_period: string;
        plan_type: string;
        prices: PreviewPrice[];
        subscription_id: string;
        total_amount: number;
      };
      status: string;
    };
  };
  metaData?: PlanMetadata;
  message?: string;
}
