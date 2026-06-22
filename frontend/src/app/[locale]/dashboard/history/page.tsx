'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle2, XCircle, Loader2, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
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

function TranslationCard({ t }: { t: any }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl hover:border-primary/30 transition-colors overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        <div className="mt-0.5">
          <StatusIcon status={t.status} />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs capitalize">{t.sourceLanguage || 'auto'}</Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">{t.targetLanguage}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{t.domain}</Badge>
            {t.documentType && t.documentType !== 'TEXT' && (
              <Badge variant="info" className="text-xs">{t.documentType}</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {t.sourceText?.slice(0, 120)}{t.sourceText?.length > 120 ? '…' : ''}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>{formatDate(t.createdAt)}</span>
            {t.confidenceScore != null && (
              <span className={cn('font-semibold', getConfidenceColor(t.confidenceScore))}>
                {t.confidenceScore.toFixed(1)}% confidence
              </span>
            )}
            {t.contractTxHash && (
              <a
                href={`https://explorer-studio.genlayer.com/transactions/${t.contractTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-indigo-500 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {t.contractTxHash.slice(0, 8)}…{t.contractTxHash.slice(-6)}
              </a>
            )}
          </div>

          {/* Expandable translation */}
          {t.status === 'COMPLETED' && t.finalTranslation && (
            <div>
              <button
                onClick={() => setExpanded(p => !p)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {expanded ? 'Hide translation' : 'Show translation'}
              </button>

              {expanded && (
                <div className="mt-3 rounded-xl border border-[#d4cfc0] bg-[#efece4]/60 p-4 relative">
                  <button
                    onClick={() => handleCopy(t.finalTranslation)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap pr-6">{t.finalTranslation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

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
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-12 text-center space-y-3">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No translations yet</p>
          <Link href="/dashboard/translate" className="text-primary hover:underline text-sm">
            Start your first translation →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {translations.map((t: any) => (
            <TranslationCard key={t.id} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
