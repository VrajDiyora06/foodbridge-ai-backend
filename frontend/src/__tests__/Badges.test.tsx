import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DonationStatusBadge } from '../features/donor/components/DonationStatusBadge';
import { ReservationStatusBadge } from '../features/receiver/components/ReservationStatusBadge';
import { RoleBadge } from '../features/admin/components/RoleBadge';

describe('Status & Role Badge Components', () => {
  it('should render DonationStatusBadge correctly', () => {
    render(<DonationStatusBadge status="available" />);
    expect(screen.getByText(/Available/i)).toBeInTheDocument();
  });

  it('should render ReservationStatusBadge correctly', () => {
    render(<ReservationStatusBadge status="accepted" />);
    expect(screen.getByText(/Claim Approved/i)).toBeInTheDocument();
  });

  it('should render RoleBadge correctly', () => {
    render(<RoleBadge role="ngo" />);
    expect(screen.getByText(/NGO/i)).toBeInTheDocument();
  });
});
