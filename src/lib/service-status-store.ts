import type { ServiceStatus } from '@/generated/prisma/client';

import { prisma } from '@/lib/prisma';
import {
  defaultServiceStatus,
  isServiceAvailabilityStatus,
  type ServiceStatusView,
} from '@/lib/service-status';

function toServiceStatusView(record: ServiceStatus): ServiceStatusView {
  return {
    service: record.service,
    status: isServiceAvailabilityStatus(record.status)
      ? record.status
      : defaultServiceStatus,
    message: record.message,
    expectedReturn: record.expectedReturn?.toISOString() ?? null,
    alternative: record.alternative,
  };
}

/** Statuses keyed by service slug; missing services are simply "available". */
export async function getServiceStatusMap(): Promise<
  Map<string, ServiceStatusView>
> {
  const records = await prisma.serviceStatus.findMany();
  return new Map(
    records.map((record) => [record.service, toServiceStatusView(record)]),
  );
}

export async function getServiceStatus(
  service: string,
): Promise<ServiceStatusView | null> {
  const record = await prisma.serviceStatus.findUnique({
    where: { service },
  });
  return record ? toServiceStatusView(record) : null;
}

export async function upsertServiceStatus(input: {
  service: string;
  status: ServiceStatusView['status'];
  message: string | null;
  expectedReturn: Date | null;
  alternative: string | null;
  updatedById: string | null;
}): Promise<void> {
  const data = {
    status: input.status,
    message: input.message,
    expectedReturn: input.expectedReturn,
    alternative: input.alternative,
    updatedById: input.updatedById,
  };

  await prisma.serviceStatus.upsert({
    where: { service: input.service },
    create: { service: input.service, ...data },
    update: data,
  });
}
