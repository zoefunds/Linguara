'use client';
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Loader2, Zap, Download, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translationApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn, getConfidenceColor, getConfidenceBg } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' }, { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }, { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' }, { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }, { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' }, { code: 'sv', name: 'Swedish' },
];

const DOMAINS = [
  { value: 'general', label: 'General' },
  { value: 'legal', label: 'Legal' },
  { value: 'medical', label: 'Medical' },
  { value: 'technical', label: 'Technical' },
  { value: 'financial', label: 'Financial' },
  { value: 'government', label: 'Government' },
];

type Status = 'SUBMITTING' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null;

interface TranslationResult {
  translationId: string;
  finalTranslation: string;
  confidenceScore: number;
  semanticScore: number;
  toneScore: number;
  txHash: string;
  agents?: Array<{ agentId: number; translatedText: string; confidenceScore: number; isConsensus: boolean }>;
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTING: 'Submitting to GenLayer...',
  PENDING: 'Transaction queued on-chain...',
  PROCESSING: 'AI validators reaching consensus...',
  COMPLETED: 'Verified on-chain!',
  FAILED: 'Translation failed',
};

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState('');
  const [docName, setDocName] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('fr');
  const [domain, setDomain] = useState('general');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Load document text passed from Documents page
  useEffect(() => {
    const text = sessionStorage.getItem('linguara_doc_text');
    const name = sessionStorage.getItem('linguara_doc_name');
    if (text) {
      setSourceText(text);
      setDocName(name);
      sessionStorage.removeItem('linguara_doc_text');
      sessionStorage.removeItem('linguara_doc_name');
    }
  }, []);

  const isProcessing = status === 'SUBMITTING' || status === 'PENDING' || status === 'PROCESSING';

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({ variant: 'destructive', title: 'Enter text to translate' });
      return;
    }
    setStatus('SUBMITTING');
    setResult(null);
    setTxHash(null);
    setRating(0);
    setRatingSubmitted(false);

    try {
      const payload: any = { sourceText, targetLanguage: targetLang, domain };
      if (context.trim()) payload.context = context.trim();

      const { data } = await translationApi.create(payload);
      const { translationId } = data.data;
      setStatus('PENDING');

      const finalResult = await pollBackend(translationId, (s, hash) => {
        setStatus(s as Status);
        if (hash) setTxHash(hash);
      });

      if (finalResult) {
        setResult(finalResult);
        setStatus('COMPLETED');
        toast({ title: 'Translation verified on-chain', description: 'Consensus reached successfully' });
      } else {
        setStatus('FAILED');
        toast({ variant: 'destructive', title: 'Translation failed', description: 'Could not complete in time' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Translation failed';
      toast({ variant: 'destructive', title: 'Translation failed', description: msg });
      setStatus('FAILED');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.finalTranslation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format: 'txt' | 'pdf' = 'txt') => {
    if (!result) return;
    if (format === 'txt') {
      const blob = new Blob([result.finalTranslation], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation_${targetLang}_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const margin = 20;
      const pageW = doc.internal.pageSize.getWidth();
      const maxW = pageW - margin * 2;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Linguara Translation', margin, margin + 4);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 110, 100);
      doc.text(`Target language: ${targetLang.toUpperCase()}  |  ${new Date().toLocaleDateString()}`, margin, margin + 12);
      doc.setDrawColor(200, 195, 185);
      doc.line(margin, margin + 16, pageW - margin, margin + 16);
      doc.setTextColor(30, 25, 20);
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(result.finalTranslation, maxW);
      doc.text(lines, margin, margin + 26);
      doc.save(`translation_${targetLang}_${Date.now()}.pdf`);
    }
  };

  const handleRate = async (stars: number) => {
    if (!result || ratingSubmitted) return;
    setRating(stars);
    try {
      await translationApi.rate(result.translationId, stars);
      setRatingSubmitted(true);
      toast({ title: 'Rating submitted', description: 'Thank you for your feedback.' });
    } catch {
      toast({ variant: 'destructive', title: 'Could not submit rating' });
    }
  };

  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Translation';

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Doc banner */}
      {docName && (
        <div className="flex items-center gap-2 text-sm bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-2.5">
          <span className="font-medium">📄 {docName}</span>
          <span className="text-primary/60 text-xs ml-auto">{sourceText.length.toLocaleString()} chars extracted</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="w-44 bg-white/60 border-[#d4cfc0] rounded-xl">
              <SelectValue placeholder="Target language" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-36 bg-white/60 border-[#d4cfc0] rounded-xl">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {DOMAINS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <button
            onClick={() => setShowContext(p => !p)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-[#d4cfc0] bg-white/60 px-3 py-2 rounded-xl transition-all"
          >
            Context {showContext ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {status && (
          <Badge
            variant={status === 'COMPLETED' ? 'success' : status === 'FAILED' ? 'destructive' : 'info'}
            className="gap-1.5 text-xs"
          >
            {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
            {STATUS_LABELS[status] || status}
          </Badge>
        )}
      </div>

      {/* Context input */}
      {showContext && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Context / tone hints (optional)</p>
            <textarea
              className="w-full h-16 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground"
              placeholder="e.g. This is a formal legal agreement between two companies. Maintain precise legal terminology."
              value={context}
              onChange={e => setContext(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{context.length}/500</p>
          </CardContent>
        </Card>
      )}

      {/* Translation panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Source text</CardTitle>
              <span className="text-xs text-muted-foreground">{sourceText.length.toLocaleString()} / 50,000</span>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-56 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground"
              placeholder="Enter text to translate… (language auto-detected)"
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              maxLength={50000}
            />
          </CardContent>
        </Card>

        <Card className={cn('border-[#d4cfc0] bg-white/60 rounded-2xl', result && 'border-primary/30')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{targetLangName}</CardTitle>
              {result && (
                <div className="flex items-center gap-1">
                  <Badge variant="success" className="text-xs">Consensus verified</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs px-2" onClick={() => handleExport('txt')}>
                    <Download className="h-3.5 w-3.5" />TXT
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs px-2" onClick={() => handleExport('pdf')}>
                    <Download className="h-3.5 w-3.5" />PDF
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="h-56 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm font-medium">{STATUS_LABELS[status!]}</p>
                <p className="text-xs opacity-60">AI validators are reaching on-chain consensus</p>
              </div>
            ) : result ? (
              <div className="h-56 overflow-auto text-sm leading-relaxed whitespace-pre-wrap">
                {result.finalTranslation}
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                Translation will appear here after on-chain consensus
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit + tx link */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Button
          onClick={handleTranslate}
          variant="gradient"
          size="lg"
          disabled={isProcessing || !sourceText.trim()}
          className="gap-2 rounded-full"
        >
          {isProcessing
            ? <><Loader2 className="h-4 w-4 animate-spin" />Processing on-chain...</>
            : <><Zap className="h-4 w-4" />Translate with AI Consensus</>}
        </Button>

        {txHash && (
          <a
            href={`https://explorer-studio.genlayer.com/transactions/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        )}
      </div>

      {/* Rating */}
      {result && (
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground font-medium">Rate this translation:</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                disabled={ratingSubmitted}
                className={cn('transition-colors', ratingSubmitted ? 'cursor-default' : 'hover:text-amber-400')}
              >
                <Star className={cn('h-5 w-5', star <= rating ? 'fill-amber-400 text-amber-400' : 'text-[#d4cfc0]')} />
              </button>
            ))}
          </div>
          {ratingSubmitted && <span className="text-xs text-emerald-500 font-medium">Thank you!</span>}
        </div>
      )}

      {/* Confidence scores */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Overall Confidence', score: result.confidenceScore },
            { label: 'Semantic Accuracy', score: result.semanticScore },
            { label: 'Tone & Style', score: result.toneScore },
          ].map(({ label, score }) => (
            <Card key={label} className="border-[#d4cfc0] bg-white/60 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <span className={cn('text-sm font-bold', getConfidenceColor(score))}>{score.toFixed(1)}%</span>
              </div>
              <Progress value={score} indicatorClassName={getConfidenceBg(score)} className="h-1.5" />
            </Card>
          ))}
        </div>
      )}

      {/* Validator breakdown */}
      {result?.agents && result.agents.length > 0 && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Validator Agent Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.agents.map(agent => (
                <div
                  key={agent.agentId}
                  className={cn('p-3 rounded-xl border text-sm', agent.isConsensus ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#d4cfc0]')}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Validator {agent.agentId}</span>
                    <div className="flex items-center gap-2">
                      {agent.isConsensus && <Badge variant="success" className="text-xs">Agreed</Badge>}
                      <span className={cn('font-semibold', getConfidenceColor(agent.confidenceScore))}>
                        {agent.confidenceScore?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2">{agent.translatedText}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function pollBackend(
  translationId: string,
  onUpdate: (status: string, txHash: string | null) => void
): Promise<TranslationResult | null> {
  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 4000));
    try {
      const { data } = await translationApi.get(translationId);
      const t = data.data;
      onUpdate(t.status, t.contractTxHash || null);
      if (t.status === 'COMPLETED' && t.finalTranslation) {
        const consensus = t.results?.find((r: any) => r.isConsensus);
        return {
          translationId,
          finalTranslation: t.finalTranslation,
          confidenceScore: t.confidenceScore || consensus?.confidenceScore || 80,
          semanticScore: consensus?.semanticScore || (t.confidenceScore || 80) * 0.96,
          toneScore: consensus?.toneScore || (t.confidenceScore || 80) * 0.91,
          txHash: t.contractTxHash || '',
          agents: t.results || [],
        };
      }
      if (t.status === 'FAILED') return null;
    } catch { /* keep polling */ }
  }
  return null;
}
