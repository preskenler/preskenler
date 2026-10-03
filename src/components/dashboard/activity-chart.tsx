'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';

export type ActivityPoint = {
  /** ISO date (`YYYY-MM-DD`). */
  date: string;
  value: number;
};

function formatDay(value: string, options: Intl.DateTimeFormatOptions) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

/** Daily activity for the last 30 days, role-aware title/description. */
export function ActivityChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: ActivityPoint[];
}) {
  const t = useTranslations('Dashboard');

  const chartConfig = {
    value: {
      label: t('nav.overview'),
      color: 'var(--primary)',
    },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t('chart.empty')}</EmptyTitle>
              <EmptyDescription>{t('chart.emptyHint')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data} margin={{ left: 12, right: 12 }}>
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) =>
                  formatDay(value, { day: 'numeric', month: 'short' })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) =>
                      formatDay(String(value), { dateStyle: 'medium' })
                    }
                  />
                }
              />
              <Area
                dataKey="value"
                type="natural"
                fill="url(#fillValue)"
                stroke="var(--color-value)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
