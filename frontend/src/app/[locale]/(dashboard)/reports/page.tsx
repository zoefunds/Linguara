'use client';
import { BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { translationApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getConfidenceColor, cn } from '@/lib/utils';

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ['translations-report'],
    queryFn: () => translationApi.list(1, 100).then(r => r.data),
  });

  const translations = data?.data || [];
  const completed = translations.filter((t: any) => t.status === 'COMPLETED');
  const avgConfidence = completed.length
    ? completed.reduce((acc: number, t: any) => acc + (t.confidenceScore || 0), 0) / completed.length
    : 0;

  const byDomain = completed.reduce((acc: Record<string, number>, t: any) => {
    acc[t.domain] = (acc[t.domain] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 p-5">
          <p className="text-sm text-muted-foreground">Total translations</p>
          <p className="text-3xl font-bold mt-1">{translations.length}</p>
        </Card>
        <Card className="border-border/50 p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold mt-1 text-emerald-500">{completed.length}</p>
        </Card>
        <Card className="border-border/50 p-5">
          <p className="text-sm text-muted-foreground">Avg. confidence</p>
          <p className={cn('text-3xl font-bold mt-1', getConfidenceColor(avgConfidence))}>
            {avgConfidence.toFixed(1)}%
          </p>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-sm">By Domain</CardTitle></CardHeader>
        <CardContent>
          {Object.entries(byDomain).length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byDomain).map(([domain, count]) => (
                <div key={domain} className="flex items-center gap-3">
                  <span className="text-sm capitalize w-24">{domain}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count as number / Math.max(...Object.values(byDomain) as number[])) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
