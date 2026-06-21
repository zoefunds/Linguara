'use client';
import { useState, useCallback } from 'react';
import { Copy, Check, ExternalLink, Loader2, Upload, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translationApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn, getConfidenceColor, getConfidenceBg } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

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

interface TranslationResult {
  translationId: string;
  finalTranslation: string;
  confidenceScore: number;
  semanticScore: number;
  toneScore: number;
  txHash?: string;
  agents?: any[];
}

export default function TranslatePage() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('fr');
  const [domain, setDomain] = useState('general');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const pollForResult = async (id: string): Promise<void> => {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const { data } = await translationApi.get(id);
        const t = data.data;
        if (t.status === 'COMPLETED') {
          const consensus = t.results?.find((r: any) => r.isConsensus);
          setResult({
            translationId: id,
            finalTranslation: t.finalTranslation || consensus?.translatedText || '',
            confidenceScore: t.confidenceScore || consensus?.confidenceScore || 0,
            semanticScore: consensus?.semanticScore || 0,
            toneScore: consensus?.toneScore || 0,
            txHash: t.contractTxHash,
            agents: t.results,
          });
          return;
        }
        if (t.status === 'FAILED') throw new Error('Translation failed');
      } catch (e: any) {
        if (e.message === 'Translation failed') throw e;
      }
    }
    throw new Error('Timed out');
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({ variant: 'destructive', title: 'Enter text to translate' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await translationApi.create({ sourceText, targetLanguage: targetLang, domain });
      setLoading(false);
      setPolling(true);
      await pollForResult(data.data.translationId);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Translation failed', description: err.message });
    } finally {
      setLoading(false);
      setPolling(false);
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
          <button onClick={() => setMode('text')} className={cn('px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors', mode === 'text' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            <AlignLeft className="h-3.5 w-3.5" />Text
          </button>
          <button onClick={() => setMode('file')} className={cn('px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors', mode === 'file' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            <Upload className="h-3.5 w-3.5" />File
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
              onChange={(e) => setSourceText(e.target.value)}
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
            {(loading || polling) ? (
              <div className="h-56 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm">{loading ? 'Submitting to GenLayer...' : 'AI agents translating...'}</p>
                <p className="text-xs">Consensus verification in progress</p>
              </div>
            ) : result ? (
              <div className="h-56 overflow-auto text-sm leading-relaxed">
                {result.finalTranslation}
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                Translation will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={handleTranslate} variant="gradient" size="lg" disabled={loading || polling || !sourceText.trim()} className="gap-2">
          {(loading || polling) ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : 'Translate with AI Consensus'}
        </Button>

        {result && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Tx:</span>
            <code className="font-mono">{result.txHash ? result.txHash.slice(0, 18) + '...' : 'pending'}</code>
          </div>
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
            <CardTitle className="text-sm">Agent Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.agents.map((agent: any) => (
                <div key={agent.agentId} className={cn('p-3 rounded-lg border text-sm', agent.isConsensus ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/50')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Agent {agent.agentId}</span>
                    <div className="flex items-center gap-2">
                      {agent.isConsensus && <Badge variant="success" className="text-xs">Selected</Badge>}
                      <span className={cn('font-semibold', getConfidenceColor(agent.confidence))}>{agent.confidence?.toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2">{agent.translation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
