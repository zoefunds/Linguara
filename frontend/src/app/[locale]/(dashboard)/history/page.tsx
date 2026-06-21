'use client';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { translationApi } from '@/lib/api';
import { formatDate, getConfidenceColor, cn } from '@/lib/utils';

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'COMPLETED') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === 'FAILED') return <XCircle className="h-4 w-4 text-destructive" />;
  return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
};

export default function HistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: () => translationApi.list(1, 50).then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const translations = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.pagination?.total || 0} translations</p>
      </div>

      {translations.length === 0 ? (
        <Card className="border-border/50 p-12 text-center space-y-3">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No translations yet</p>
          <Link href="/dashboard/translate" className="text-primary hover:underline text-sm">
            Start your first translation →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {translations.map((t: any) => (
            <Card key={t.id} className="border-border/50 hover:border-primary/30 transition-colors">
              <div className="p-4 flex items-start gap-4">
                <StatusIcon status={t.status} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">{t.sourceLanguage}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">{t.targetLanguage}</Badge>
                    <Badge variant="secondary" className="text-xs capitalize">{t.domain}</Badge>
                    {t.documentType !== 'TEXT' && <Badge variant="info" className="text-xs">{t.documentType}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{t.sourceText?.slice(0, 120)}...</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(t.createdAt)}</span>
                    {t.confidenceScore && (
                      <span className={cn('font-semibold', getConfidenceColor(t.confidenceScore))}>
                        {t.confidenceScore.toFixed(1)}% confidence
                      </span>
                    )}
                    {t.contractTxHash && (
                      <span className="font-mono text-indigo-400">
                        {t.contractTxHash.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
