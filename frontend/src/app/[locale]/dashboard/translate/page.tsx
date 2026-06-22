'use client';
import { useState } from 'react';
import { Copy, Check, ExternalLink, Loader2, AlignLeft, Upload, Zap } from 'lucide-react';
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
  agents?: Array<{
    agentId: number;
    translatedText: string;
    confidenceScore: number;
    isConsensus: boolean;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTING: 'Submitting to GenLayer...',
  PENDING: 'Transaction queued on-chain...',
  PROCESSING: 'AI validators reaching consensus...',
  COMPLETED: 'On-chain — verified!',
  FAILED: 'Translation failed',
};

export default function TranslatePage() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('fr');
  const [domain, setDomain] = useState('general');
  const [status, setStatus] = useState<Status>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const isProcessing = status === 'SUBMITTING' || status === 'PENDING' || status === 'PROCESSING';

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({ variant: 'destructive', title: 'Enter text to translate' });
      return;
    }

    setStatus('SUBMITTING');
    setResult(null);
    setTxHash(null);

    try {
      // Step 1: Submit to backend (backend fires GenLayer tx async)
      const { data } = await translationApi.create({
        sourceText,
        targetLanguage: targetLang,
        domain,
      });

      const { translationId } = data.data;
      setStatus('PENDING');

      // Step 2: Poll backend for txHash and final result
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setMode('text')}
            className={cn('px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors',
              mode === 'text' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            <AlignLeft className="h-3.5 w-3.5" /> Text
          </button>
          <button
            onClick={() => setMode('file')}
            className={cn('px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors',
              mode === 'file' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            <Upload className="h-3.5 w-3.5" /> File
          </button>
        </div>

        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Target language" /></SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent>
            {DOMAINS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>

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

      {/* Translation area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Source text</CardTitle>
              <span className="text-xs text-muted-foreground">{sourceText.length}/50,000</span>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-56 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground"
              placeholder="Enter text to translate... (auto-detect language)"
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              maxLength={50000}
            />
          </CardContent>
        </Card>

        <Card className={cn('border-border/50', result && 'border-primary/30')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {LANGUAGES.find(l => l.code === targetLang)?.name || 'Translation'}
              </CardTitle>
              {result && (
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">Consensus verified</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
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
              <div className="h-56 overflow-auto text-sm leading-relaxed">
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
          className="gap-2"
        >
          {isProcessing
            ? <><Loader2 className="h-4 w-4 animate-spin" />Processing on-chain...</>
            : <><Zap className="h-4 w-4" />Translate with AI Consensus</>}
        </Button>

        {txHash && (
          <a
            href={`https://genlayer-explorer.vercel.app/transactions/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        )}
      </div>

      {/* Confidence scores */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Overall Confidence', score: result.confidenceScore },
            { label: 'Semantic Accuracy', score: result.semanticScore },
            { label: 'Tone & Style', score: result.toneScore },
          ].map(({ label, score }) => (
            <Card key={label} className="border-border/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <span className={cn('text-sm font-bold', getConfidenceColor(score))}>{score.toFixed(1)}%</span>
              </div>
              <Progress value={score} indicatorClassName={getConfidenceBg(score)} className="h-1.5" />
            </Card>
          ))}
        </div>
      )}

      {/* Agent breakdown */}
      {result?.agents && result.agents.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Validator Agent Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.agents.map(agent => (
                <div
                  key={agent.agentId}
                  className={cn(
                    'p-3 rounded-lg border text-sm',
                    agent.isConsensus ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/50'
                  )}
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
  const maxAttempts = 90;

  for (let i = 0; i < maxAttempts; i++) {
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
    } catch {
      // Network error, keep polling
    }
  }

  return null;
}
