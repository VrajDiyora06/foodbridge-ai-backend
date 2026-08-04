export type FoodCategory =
  | 'cooked_meals'
  | 'fresh_produce'
  | 'bakery'
  | 'packaged_food'
  | 'beverages'
  | 'dairy'
  | 'canned_goods'
  | 'other';

export type FoodStatus =
  | 'available'
  | 'reserved'
  | 'picked_up'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface LocationData {
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface FoodItem {
  _id: string;
  donor: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    organizationName?: string;
  } | string;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: {
    amount: number;
    unit: string;
  };
  location: LocationData;
  expiresAt: string;
  pickupWindow: {
    startTime: string;
    endTime: string;
  };
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal?: boolean;
  containsAllergens?: string[];
  imageUrl?: string;
  status: FoodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FoodFilters {
  page?: number;
  limit?: number;
  status?: FoodStatus;
  category?: FoodCategory;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedFoodResponse {
  data: FoodItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface DonorStats {
  totalDonations: number;
  availableCount: number;
  reservedCount: number;
  deliveredCount: number;
  expiredCount: number;
  cancelledCount: number;
  totalQuantityKg?: number;
  peopleFedEstimate?: number;
  categoryBreakdown?: Array<{ category: string; count: number }>;
}

export interface CreateFoodInput {
  title: string;
  description: string;
  category: FoodCategory;
  quantity: {
    amount: number;
    unit: string;
  };
  location: LocationData;
  expiresAt: string;
  pickupWindow: {
    startTime: string;
    endTime: string;
  };
  isVegetarian?: boolean;
  isVegan?: boolean;
  isHalal?: boolean;
  containsAllergens?: string[];
  imageUrl?: string;
}

export type UpdateFoodInput = Partial<CreateFoodInput>;
