import React from 'react';
import { Badge } from '../ui/Badge';
import type { BadgeProps } from '../ui/Badge';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();

  let variant: BadgeProps['variant'] = 'slate';
  let label = status;

  switch (normalizedStatus) {
    case 'available':
    case 'active':
    case 'completed':
    case 'delivered':
      variant = 'emerald';
      label = status.toUpperCase();
      break;
    case 'pending':
    case 'reserved':
      variant = 'amber';
      label = status.toUpperCase();
      break;
    case 'accepted':
    case 'picked_up':
      variant = 'teal';
      label = status.replace('_', ' ').toUpperCase();
      break;
    case 'expired':
    case 'cancelled':
    case 'rejected':
    case 'suspended':
      variant = 'rose';
      label = status.toUpperCase();
      break;
    default:
      variant = 'slate';
      label = status.toUpperCase();
  }

  return <Badge variant={variant}>{label}</Badge>;
};
