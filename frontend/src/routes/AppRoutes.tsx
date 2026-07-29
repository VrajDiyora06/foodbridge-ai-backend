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
  NotFoundPage,
} from '../pages/public';

// Donor Pages
import {
  DonorDashboardPage,
  DonateFoodPage,
  MyDonationsPage,
  EditDonationPage,
  DonorProfilePage,
} from '../pages/donor';

// Receiver Pages
import {
  ReceiverDashboardPage,
  AvailableFoodPage,
  MyReservationsPage,
  ClaimedFoodPage,
  ReceiverProfilePage,
} from '../pages/receiver';

// Admin Pages
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminFoodPage,
  AdminReservationsPage,
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
      </Route>

      {/* Protected Donor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['donor', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/donor" element={<DonorDashboardPage />} />
          <Route path="/donor/donate" element={<DonateFoodPage />} />
          <Route path="/donor/donations" element={<MyDonationsPage />} />
          <Route path="/donor/donations/:id/edit" element={<EditDonationPage />} />
          <Route path="/donor/profile" element={<DonorProfilePage />} />
        </Route>
      </Route>

      {/* Protected Receiver Routes (NGO / Volunteer / Receiver) */}
      <Route element={<ProtectedRoute allowedRoles={['receiver', 'ngo', 'volunteer', 'user', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/receiver" element={<ReceiverDashboardPage />} />
          <Route path="/receiver/available" element={<AvailableFoodPage />} />
          <Route path="/receiver/reservations" element={<MyReservationsPage />} />
          <Route path="/receiver/claimed" element={<ClaimedFoodPage />} />
          <Route path="/receiver/profile" element={<ReceiverProfilePage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/food" element={<AdminFoodPage />} />
          <Route path="/admin/reservations" element={<AdminReservationsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
