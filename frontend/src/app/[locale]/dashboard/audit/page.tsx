'use client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Loader2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translationApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const eventColors: Record<string, string> = {
  TRANSLATION_CREATED: 'info',
  TRANSLATION_PROCESSING_STARTED: 'warning',
  TRANSLATION_COMPLETED: 'success',
  TRANSLATION_FAILED: 'destructive',
  WALLET_KEY_EXPORTED: 'warning',
};

export default function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => translationApi.audit(1, 100).then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const logs = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <p className="text-sm text-muted-foreground">{logs.length} audit events</p>

      {logs.length === 0 ? (
        <Card className="border-border/50 p-12 text-center space-y-3">
          <Shield className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No audit events yet</p>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4 pl-12">
            {logs.map((log: any) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-7 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                <Card className="border-border/50 p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant={(eventColors[log.eventType] as any) || 'secondary'} className="text-xs">
                      {log.eventType.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                  </div>
                  {log.onChainRef && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">On-chain:</span>
                      <code className="font-mono text-indigo-400">{log.onChainRef.slice(0, 24)}...</code>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  {log.payload && (
                    <pre className="text-xs text-muted-foreground bg-muted/30 rounded p-2 overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
