import { Schema, model, Document, Types } from 'mongoose';

// ── Enums ────────────────────────────────────────────────

export enum UserRole {
  USER = 'user',
  DONOR = 'donor',
  NGO = 'ngo',
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// ── Interface ────────────────────────────────────────────

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isVerified: boolean;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  organizationName?: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  passwordChangedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;

  /**
   * Returns true if the password was changed after the
   * given JWT was issued. Used by the auth middleware to
   * reject tokens minted before a password change.
   */
  isPasswordChangedAfter(jwtIssuedAt: number): boolean;
}

// ── Schema ───────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries unless explicitly requested
    },

    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: 'Role must be one of: user, donor, ngo, volunteer, admin',
      },
      default: UserRole.USER,
    },

    accountStatus: {
      type: String,
      enum: {
        values: Object.values(AccountStatus),
        message: 'Account status must be one of: active, inactive, suspended',
      },
      default: AccountStatus.ACTIVE,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    address: {
      type: String,
      default: null,
      trim: true,
    },

    avatar: {
      type: String,
      default: null,
      trim: true,
    },

    organizationName: {
      type: String,
      default: null,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  },
);

// ── Indexes ──────────────────────────────────────────────

// email unique index is created by `unique: true` above.
// Compound index for filtered listing queries (admin dashboard, etc.)
userSchema.index({ role: 1, accountStatus: 1 });
// Speeds up verification status checks during login
userSchema.index({ email: 1, isVerified: 1 });

// ── Instance methods ─────────────────────────────────────

userSchema.methods.isPasswordChangedAfter = function (jwtIssuedAt: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return changedTimestamp > jwtIssuedAt;
  }
  return false;
};

// ── Export ────────────────────────────────────────────────

const User = model<IUserDocument>('User', userSchema);

export default User;
