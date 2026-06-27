'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, ExternalLink,
  Copy, Check, Download, ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { translationApi } from '@/lib/api';
import { formatDate, getConfidenceColor, getConfidenceBg, cn } from '@/lib/utils';

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-semibold', getConfidenceColor(value))}>{value.toFixed(1)}%</span>
      </div>
      <Progress value={value} className={cn('h-1.5', getConfidenceBg(value))} />
    </div>
  );
}

export default function TranslationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState<'source' | 'translation' | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['translation', id],
    queryFn: () => translationApi.get(id).then(r => r.data.data),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'PENDING' || s === 'PROCESSING' ? 5000 : false;
    },
  });

  const copy = (text: string, key: 'source' | 'translation') => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportTxt = () => {
    if (!data?.finalTranslation) return;
    const blob = new Blob([data.finalTranslation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_${data.targetLanguage}_${id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    if (!data?.finalTranslation) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const maxW = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('Linguara Translation', margin, margin + 4);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 110, 100);
    doc.text(`${data.targetLanguage.toUpperCase()}  ·  ${formatDate(data.createdAt)}`, margin, margin + 11);
    doc.setDrawColor(200, 195, 185);
    doc.line(margin, margin + 15, doc.internal.pageSize.getWidth() - margin, margin + 15);
    doc.setTextColor(30, 25, 20); doc.setFontSize(10);
    const lines = doc.splitTextToSize(data.finalTranslation, maxW);
    doc.text(lines, margin, margin + 23);
    doc.save(`translation_${data.targetLanguage}_${id.slice(0, 8)}.pdf`);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  if (!data) return (
    <div className="max-w-4xl mx-auto">
      <p className="text-muted-foreground">Translation not found.</p>
    </div>
  );

  const consensus = data.results?.find((r: any) => r.isConsensus);
  const agents = data.results || [];
  const isProcessing = data.status === 'PENDING' || data.status === 'PROCESSING';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/history">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">{data.sourceLanguage || 'auto'}</Badge>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge variant="outline">{data.targetLanguage}</Badge>
          <Badge variant="secondary" className="capitalize">{data.domain}</Badge>
          <Badge variant={data.status === 'COMPLETED' ? 'success' : data.status === 'FAILED' ? 'destructive' : 'warning'}>
            {data.status === 'COMPLETED'
              ? <><CheckCircle2 className="h-3 w-3 mr-1" />Verified</>
              : data.status === 'FAILED'
              ? <><XCircle className="h-3 w-3 mr-1" />Failed</>
              : <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</>}
          </Badge>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{formatDate(data.createdAt)}</span>
      </div>

      {/* Source + Translation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Source text</CardTitle>
            <button onClick={() => copy(data.sourceText, 'source')} className="text-muted-foreground hover:text-foreground">
              {copied === 'source' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-auto">{data.sourceText}</p>
          </CardContent>
        </Card>

        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Translation</CardTitle>
            <div className="flex items-center gap-1">
              {data.finalTranslation && <>
                <button onClick={() => copy(data.finalTranslation, 'translation')} className="text-muted-foreground hover:text-foreground">
                  {copied === 'translation' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button onClick={exportTxt} className="text-muted-foreground hover:text-foreground ml-1" title="Download TXT">
                  <Download className="h-3.5 w-3.5" />
                </button>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={exportPdf}>PDF</Button>
              </>}
            </div>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-xs">Processing on GenLayer…</p>
              </div>
            ) : data.finalTranslation ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-auto">{data.finalTranslation}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No translation available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scores + tx info */}
      {data.status === 'COMPLETED' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quality scores</p>
            <ScoreBar label="Overall confidence" value={data.confidenceScore || 0} />
            {consensus && <>
              <ScoreBar label="Semantic accuracy" value={consensus.semanticScore || 0} />
              <ScoreBar label="Tone preservation" value={consensus.toneScore || 0} />
              <ScoreBar label="Cultural adaptation" value={consensus.culturalScore || 0} />
            </>}
          </Card>

          <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">On-chain proof</p>
            {data.contractTxHash ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transaction hash</p>
                  <code className="text-xs font-mono text-indigo-500 break-all">{data.contractTxHash}</code>
                </div>
                <a
                  href={`https://studio.genlayer.com/tx/${data.contractTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View in GenLayer explorer
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No on-chain reference available.</p>
            )}
            {data.completedAt && (
              <p className="text-xs text-muted-foreground">Completed {formatDate(data.completedAt)}</p>
            )}
          </Card>
        </div>
      )}

      {/* Agent results */}
      {agents.length > 0 && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">AI Validator results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map((agent: any, i: number) => (
              <div key={agent.id || i} className={cn(
                'rounded-xl border p-4 space-y-2',
                agent.isConsensus
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : 'border-[#d4cfc0] bg-white/40'
              )}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Validator {agent.agentId ?? i + 1}</span>
                    {agent.isConsensus && <Badge variant="success" className="text-xs">Consensus</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {agent.confidenceScore != null && (
                      <span className={cn('font-semibold', getConfidenceColor(agent.confidenceScore))}>
                        {agent.confidenceScore.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{agent.translatedText}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
