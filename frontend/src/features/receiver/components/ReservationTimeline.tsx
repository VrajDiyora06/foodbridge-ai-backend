import React from 'react';
import { CheckCircle2, Clock, Truck, Award, AlertCircle } from 'lucide-react';
import type { ReservationStatus } from '../types/receiver.types';

interface ReservationTimelineProps {
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export const ReservationTimeline: React.FC<ReservationTimelineProps> = ({
  status,
  createdAt,
}) => {
  const steps = [
    {
      id: 'created',
      title: 'Claim Submitted',
      description: 'Reservation request sent to donor',
      time: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCompleted: true,
      icon: Clock,
    },
    {
      id: 'approved',
      title: 'Donor Approved',
      description: 'Donor accepted your pickup claim',
      isCompleted: status === 'accepted' || status === 'picked_up' || status === 'completed',
      icon: CheckCircle2,
    },
    {
      id: 'pickup',
      title: 'Food Picked Up',
      description: 'Food retrieved from pickup location',
      isCompleted: status === 'picked_up' || status === 'completed',
      icon: Truck,
    },
    {
      id: 'completed',
      title: 'Donation Delivered',
      description: 'Surplus food delivered to end beneficiaries',
      isCompleted: status === 'completed',
      icon: Award,
    },
  ];

  if (status === 'cancelled' || status === 'rejected' || status === 'expired') {
    return (
      <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-700 text-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-bold uppercase tracking-wider">Status: {status}</p>
          <p className="text-[11px] mt-0.5">This reservation claim is no longer active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
        Reservation Progress Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>

              <div>
                <p
                  className={`text-xs font-bold ${
                    step.isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                {step.time && step.isCompleted && (
                  <span className="text-[10px] text-slate-400 mt-1 block">{step.time}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
