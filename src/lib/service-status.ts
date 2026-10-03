/**
 * Availability of a municipal service — maintenance or an incident (demande
 * F38). DB-free so both the public directory and staff forms can share the
 * status values and labels.
 */

export const serviceAvailabilityStatuses = [
  'available',
  'maintenance',
  'incident',
] as const;

export type ServiceAvailabilityStatus =
  (typeof serviceAvailabilityStatuses)[number];

export const defaultServiceStatus: ServiceAvailabilityStatus = 'available';

export function isServiceAvailabilityStatus(
  value: unknown,
): value is ServiceAvailabilityStatus {
  return (
    typeof value === 'string' &&
    (serviceAvailabilityStatuses as readonly string[]).includes(value)
  );
}

export type ServiceStatusView = {
  service: string;
  status: ServiceAvailabilityStatus;
  message: string | null;
  expectedReturn: string | null;
  alternative: string | null;
};

export function isServiceUnavailable(status: ServiceAvailabilityStatus) {
  return status !== 'available';
}
