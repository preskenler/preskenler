import type { ProblemReport } from '@/generated/prisma/client';

import { prisma } from '@/lib/prisma';
import { generateReference } from '@/lib/reference';
import {
  isProblemCategory,
  isProblemStatus,
  serviceForCategory,
  type ProblemCategory,
  type ProblemReportView,
  type ProblemStatus,
} from '@/lib/reports';

function toProblemCategory(value: string): ProblemCategory {
  return isProblemCategory(value) ? value : 'other';
}

function toProblemStatus(value: string): ProblemStatus {
  return isProblemStatus(value) ? value : 'new';
}

function toReportView(report: ProblemReport): ProblemReportView {
  return {
    id: report.id,
    reference: report.reference,
    service: report.service,
    category: toProblemCategory(report.category),
    location: report.location,
    description: report.description,
    status: toProblemStatus(report.status),
    createdAt: report.createdAt.toISOString(),
  };
}

export async function createProblemReport(input: {
  userId: string | null;
  name: string;
  email: string;
  category: ProblemCategory;
  location: string;
  description: string;
}): Promise<ProblemReportView> {
  const report = await prisma.problemReport.create({
    data: {
      reference: generateReference('PR'),
      userId: input.userId,
      name: input.name,
      email: input.email,
      service: serviceForCategory(input.category),
      category: input.category,
      location: input.location,
      description: input.description,
    },
  });

  return toReportView(report);
}

export async function getUserProblemReports(
  userId: string,
): Promise<ProblemReportView[]> {
  const reports = await prisma.problemReport.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return reports.map(toReportView);
}

export type StaffProblemReport = ProblemReportView & {
  name: string;
  email: string;
};

export async function getStaffProblemReports(): Promise<StaffProblemReport[]> {
  const reports = await prisma.problemReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return reports.map((report) => ({
    ...toReportView(report),
    name: report.name,
    email: report.email,
  }));
}

export async function setProblemReportStatus(
  id: string,
  status: ProblemStatus,
): Promise<void> {
  await prisma.problemReport.update({ where: { id }, data: { status } });
}
