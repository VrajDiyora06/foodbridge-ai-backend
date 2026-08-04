import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { PublicLayout, DashboardLayout } from '../layouts';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import {
  HomePage,
  BrowseFoodPage,
  FoodDetailsPage,
  AboutPage,
  ContactPage,
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
  NotFoundPage,
} from '../pages/public';

// Donor Pages
import {
  DonorDashboardPage,
  DonateFoodPage,
  MyDonationsPage,
  EditDonationPage,
  DonationDetailsPage,
  DonationStatsPage,
  DonorProfilePage,
} from '../pages/donor';

// Receiver Pages
import {
  ReceiverDashboardPage,
  AvailableFoodPage,
  NearbyFoodPage,
  FoodDetailPage,
  MyReservationsPage,
  ReservationDetailsPage,
  ReceiverStatsPage,
  ClaimedFoodPage,
  ReceiverProfilePage,
} from '../pages/receiver';

// Notifications Pages
import { NotificationsPage, NotificationDetailPage } from '../pages/notifications';

// Profile Pages
import {
  ProfilePage,
  EditProfilePage,
  SecurityPage,
  AccountSettingsPage,
} from '../pages/profile';

// Map Pages
import { NearbyMapPage, FoodLocationPage } from '../pages/maps';

// Admin Pages
import {
  AdminDashboardPage,
  UserManagementPage,
  FoodModerationPage,
  ReservationMonitoringPage,
  AnalyticsPage,
  BroadcastNotificationPage,
} from '../pages/admin';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowseFoodPage />} />
        <Route path="/food/:id" element={<FoodDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Shared Authenticated Routes (Notifications, Profile & Maps) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/notifications/:id" element={<NotificationDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/security" element={<SecurityPage />} />
          <Route path="/profile/settings" element={<AccountSettingsPage />} />
          <Route path="/map/nearby" element={<NearbyMapPage />} />
          <Route path="/map/location/:id" element={<FoodLocationPage />} />
        </Route>
      </Route>

      {/* Protected Donor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['donor', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/donor" element={<DonorDashboardPage />} />
          <Route path="/donor/donate" element={<DonateFoodPage />} />
          <Route path="/donor/donations" element={<MyDonationsPage />} />
          <Route path="/donor/donations/:id" element={<DonationDetailsPage />} />
          <Route path="/donor/donations/:id/edit" element={<EditDonationPage />} />
          <Route path="/donor/statistics" element={<DonationStatsPage />} />
          <Route path="/donor/profile" element={<DonorProfilePage />} />
        </Route>
      </Route>

      {/* Protected Receiver Routes (NGO / Volunteer / Receiver) */}
      <Route element={<ProtectedRoute allowedRoles={['receiver', 'ngo', 'volunteer', 'user', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/receiver" element={<ReceiverDashboardPage />} />
          <Route path="/receiver/available" element={<AvailableFoodPage />} />
          <Route path="/receiver/nearby" element={<NearbyFoodPage />} />
          <Route path="/receiver/food/:id" element={<FoodDetailPage />} />
          <Route path="/receiver/reservations" element={<MyReservationsPage />} />
          <Route path="/receiver/reservations/:id" element={<ReservationDetailsPage />} />
          <Route path="/receiver/statistics" element={<ReceiverStatsPage />} />
          <Route path="/receiver/claimed" element={<ClaimedFoodPage />} />
          <Route path="/receiver/profile" element={<ReceiverProfilePage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/food" element={<FoodModerationPage />} />
          <Route path="/admin/reservations" element={<ReservationMonitoringPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/broadcast" element={<BroadcastNotificationPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
