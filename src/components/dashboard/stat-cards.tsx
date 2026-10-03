import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export type StatCard = {
  title: string;
  value: ReactNode;
  hint?: string;
};

/** Overview metrics shown at the top of the dashboard, one card per metric. */
export function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
          </CardHeader>
          {card.hint ? (
            <CardContent className="text-sm text-muted-foreground">
              {card.hint}
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
