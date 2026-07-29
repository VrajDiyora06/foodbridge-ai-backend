import { Schema, model, Document, Types } from 'mongoose';

// ── Enums ────────────────────────────────────────────────

export enum ReservationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum ClaimerRole {
  NGO = 'ngo',
  VOLUNTEER = 'volunteer',
}

// ── Interfaces ───────────────────────────────────────────

export interface IReservation {
  food: Types.ObjectId;
  claimer: Types.ObjectId;
  claimerRole: ClaimerRole;
  status: ReservationStatus;
  pickupTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservationDocument extends IReservation, Document {
  id: string;
  isActive: boolean;
  canCancel(): boolean;
}

// ── Schema ───────────────────────────────────────────────

const reservationSchema = new Schema<IReservationDocument>(
  {
    food: {
      type: Schema.Types.ObjectId,
      ref: 'Food',
      required: [true, 'Food listing reference is required'],
      index: true,
    },

    claimer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimer user reference is required'],
      index: true,
    },

    claimerRole: {
      type: String,
      enum: {
        values: Object.values(ClaimerRole),
        message: 'Claimer role must be either ngo or volunteer',
      },
      required: [true, 'Claimer role is required'],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(ReservationStatus),
        message: 'Invalid reservation status',
      },
      default: ReservationStatus.PENDING,
      index: true,
    },

    pickupTime: {
      type: Date,
      required: false,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      required: false,
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

reservationSchema.index({ food: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ claimer: 1 });
reservationSchema.index({ food: 1, status: 1 });
reservationSchema.index({ claimer: 1, status: 1 });

// ── Virtuals ─────────────────────────────────────────────

reservationSchema.virtual('isActive').get(function (this: IReservationDocument): boolean {
  return (
    this.status === ReservationStatus.PENDING ||
    this.status === ReservationStatus.ACCEPTED ||
    this.status === ReservationStatus.PICKED_UP
  );
});

// ── Instance Methods ─────────────────────────────────────

reservationSchema.methods.canCancel = function (this: IReservationDocument): boolean {
  return (
    this.status === ReservationStatus.PENDING ||
    this.status === ReservationStatus.ACCEPTED
  );
};

// ── Export ────────────────────────────────────────────────

const Reservation = model<IReservationDocument>('Reservation', reservationSchema);

export default Reservation;
