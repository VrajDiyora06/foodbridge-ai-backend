import { Schema, model, Document, Types } from 'mongoose';

// ── Enums ────────────────────────────────────────────────

export enum FoodCategory {
  COOKED = 'cooked',
  RAW = 'raw',
  PACKAGED = 'packaged',
  BAKERY = 'bakery',
  DAIRY = 'dairy',
  BEVERAGES = 'beverages',
  FRUITS = 'fruits',
  VEGETABLES = 'vegetables',
  GRAINS = 'grains',
  SNACKS = 'snacks',
  OTHER = 'other',
}

export enum FoodStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

// ── Interfaces ───────────────────────────────────────────

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface ILocation {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: ICoordinates;
}

export interface IFood {
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  quantityUnit: string;
  images: string[];

  preparedAt: Date;
  expiresAt: Date;
  isVegetarian: boolean;
  isVegan: boolean;
  containsAllergens: boolean;
  allergens: string[];

  donor: Types.ObjectId;

  location: ILocation;
  pickupStartTime: Date;
  pickupEndTime: Date;

  status: FoodStatus;

  createdAt: Date;
  updatedAt: Date;
}

export interface IFoodDocument extends IFood, Document {
  _id: Types.ObjectId;
  isExpired: boolean;
  canBeReserved(): boolean;
}

// ── Location Sub-schema ──────────────────────────────────

const locationSchema = new Schema<ILocation>(
  {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
  },
  { _id: false },
);

// ── Food Schema ──────────────────────────────────────────

const foodSchema = new Schema<IFoodDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: Object.values(FoodCategory),
        message: 'Invalid food category',
      },
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    quantityUnit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },

    preparedAt: {
      type: Date,
      required: [true, 'Preparation time is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration time is required'],
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    containsAllergens: {
      type: Boolean,
      default: false,
    },
    allergens: {
      type: [String],
      default: [],
    },

    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
    },

    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    pickupStartTime: {
      type: Date,
      required: [true, 'Pickup start time is required'],
    },
    pickupEndTime: {
      type: Date,
      required: [true, 'Pickup end time is required'],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(FoodStatus),
        message: 'Invalid food status',
      },
      default: FoodStatus.AVAILABLE,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ── Indexes ──────────────────────────────────────────────

foodSchema.index({ donor: 1 });
foodSchema.index({ status: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ expiresAt: 1 });
foodSchema.index({ 'location.coordinates': '2dsphere' });
foodSchema.index({ status: 1, expiresAt: 1 });

// ── Virtuals ─────────────────────────────────────────────

foodSchema.virtual('isExpired').get(function (this: IFoodDocument): boolean {
  return new Date() > this.expiresAt;
});

// ── Instance Methods ─────────────────────────────────────

foodSchema.methods.canBeReserved = function (this: IFoodDocument): boolean {
  return this.status === FoodStatus.AVAILABLE && !this.isExpired;
};

// ── Export ────────────────────────────────────────────────

const Food = model<IFoodDocument>('Food', foodSchema);

export default Food;
