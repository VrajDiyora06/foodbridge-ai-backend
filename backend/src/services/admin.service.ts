import User, { UserRole, AccountStatus } from '../models/user.model';
import Food, { FoodStatus } from '../models/food.model';
import Reservation, { ReservationStatus } from '../models/reservation.model';
import { FoodRepository, FoodFilters, PaginationOptions as FoodPaginationOptions } from '../repositories/food.repository';
import { ReservationRepository, ReservationFilters, PaginationOptions as ReservationPaginationOptions } from '../repositories/reservation.repository';

export interface DashboardStats {
  users: {
    total: number;
    donors: number;
    ngos: number;
    volunteers: number;
    regularUsers: number;
    admins: number;
  };
  food: {
    total: number;
    available: number;
    reserved: number;
    completed: number;
    expired: number;
    cancelled: number;
  };
  reservations: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    cancelled: number;
    expired: number;
  };
}

export interface AnalyticsStats {
  donationsOverTime: {
    daily: { _id: string; count: number }[];
    monthly: { _id: string; count: number }[];
  };
  categoryDistribution: { _id: string; count: number }[];
  userGrowth: { _id: string; count: number }[];
  completionRatePercentage: number;
}

export class AdminService {
  private foodRepo: FoodRepository;
  private reservationRepo: ReservationRepository;

  constructor() {
    this.foodRepo = new FoodRepository();
    this.reservationRepo = new ReservationRepository();
  }

  /**
   * Aggregate high-level platform statistics for the Admin Dashboard.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalDonors,
      totalNGOs,
      totalVolunteers,
      totalAdmins,

      totalFood,
      availableFood,
      reservedFood,
      completedFood,
      expiredFood,
      cancelledFood,

      totalReservations,
      pendingReservations,
      acceptedReservations,
      rejectedReservations,
      completedReservations,
      cancelledReservations,
      expiredReservations,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ role: UserRole.DONOR, isDeleted: { $ne: true } }),
      User.countDocuments({ role: UserRole.NGO, isDeleted: { $ne: true } }),
      User.countDocuments({ role: UserRole.VOLUNTEER, isDeleted: { $ne: true } }),
      User.countDocuments({ role: UserRole.ADMIN, isDeleted: { $ne: true } }),

      Food.countDocuments(),
      Food.countDocuments({ status: FoodStatus.AVAILABLE }),
      Food.countDocuments({ status: FoodStatus.RESERVED }),
      Food.countDocuments({ status: FoodStatus.DELIVERED }),
      Food.countDocuments({ status: FoodStatus.EXPIRED }),
      Food.countDocuments({ status: FoodStatus.CANCELLED }),

      Reservation.countDocuments(),
      Reservation.countDocuments({ status: ReservationStatus.PENDING }),
      Reservation.countDocuments({ status: ReservationStatus.ACCEPTED }),
      Reservation.countDocuments({ status: ReservationStatus.REJECTED }),
      Reservation.countDocuments({ status: ReservationStatus.COMPLETED }),
      Reservation.countDocuments({ status: ReservationStatus.CANCELLED }),
      Reservation.countDocuments({ status: ReservationStatus.EXPIRED }),
    ]);

    return {
      users: {
        total: totalUsers,
        donors: totalDonors,
        ngos: totalNGOs,
        volunteers: totalVolunteers,
        regularUsers: Math.max(0, totalUsers - (totalDonors + totalNGOs + totalVolunteers + totalAdmins)),
        admins: totalAdmins,
      },
      food: {
        total: totalFood,
        available: availableFood,
        reserved: reservedFood,
        completed: completedFood,
        expired: expiredFood,
        cancelled: cancelledFood,
      },
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        accepted: acceptedReservations,
        rejected: rejectedReservations,
        completed: completedReservations,
        cancelled: cancelledReservations,
        expired: expiredReservations,
      },
    };
  }

  /**
   * Aggregate detailed analytics (donation trends, category breakdown, user growth, completion rate).
   */
  async getAnalyticsStats(): Promise<AnalyticsStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [dailyDonations, monthlyDonations, categoryDistribution, userGrowth, totalRes, completedRes] =
      await Promise.all([
        Food.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        Food.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        Food.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        User.aggregate([
          { $match: { isDeleted: { $ne: true } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        Reservation.countDocuments(),
        Reservation.countDocuments({ status: ReservationStatus.COMPLETED }),
      ]);

    const completionRatePercentage = totalRes > 0 ? parseFloat(((completedRes / totalRes) * 100).toFixed(2)) : 0;

    return {
      donationsOverTime: {
        daily: dailyDonations,
        monthly: monthlyDonations,
      },
      categoryDistribution,
      userGrowth,
      completionRatePercentage,
    };
  }

  /**
   * Reuses FoodRepository for admin food listing and moderation.
   */
  async getAllFood(filters: FoodFilters = {}, options: FoodPaginationOptions = {}) {
    return this.foodRepo.findAll(filters, options);
  }

  /**
   * Reuses ReservationRepository for admin reservation monitoring.
   */
  async getAllReservations(filters: ReservationFilters = {}, options: ReservationPaginationOptions = {}) {
    return this.reservationRepo.findAll(filters, options);
  }
}

export const adminService = new AdminService();
