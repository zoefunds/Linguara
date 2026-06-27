'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, BookOpen, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { glossaryApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' }, { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }, { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' }, { code: 'nl', name: 'Dutch' },
];

const DOMAINS = ['general', 'legal', 'medical', 'technical', 'financial', 'government'];

export default function GlossaryPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sourceTerm: '', targetTerm: '', sourceLang: 'en', targetLang: 'fr', domain: 'general', notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['glossary'],
    queryFn: () => glossaryApi.list().then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => glossaryApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['glossary'] });
      setForm({ sourceTerm: '', targetTerm: '', sourceLang: 'en', targetLang: 'fr', domain: 'general', notes: '' });
      setShowForm(false);
      toast({ title: 'Term added to glossary' });
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Failed to add term', description: err?.response?.data?.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => glossaryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['glossary'] });
      toast({ title: 'Term removed' });
    },
  });

  const terms = data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{terms.length} term{terms.length !== 1 ? 's' : ''}</p>
        <Button variant="gradient" className="rounded-full gap-2 h-9 px-4 text-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? <><X className="h-4 w-4" />Cancel</> : <><Plus className="h-4 w-4" />Add term</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-foreground">New glossary entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source term</Label>
              <Input
                placeholder="e.g. force majeure"
                value={form.sourceTerm}
                onChange={e => setForm(f => ({ ...f, sourceTerm: e.target.value }))}
                className="rounded-xl border-[#d4cfc0] bg-white/70"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Translation</Label>
              <Input
                placeholder="e.g. force majeure"
                value={form.targetTerm}
                onChange={e => setForm(f => ({ ...f, targetTerm: e.target.value }))}
                className="rounded-xl border-[#d4cfc0] bg-white/70"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source language</Label>
              <Select value={form.sourceLang} onValueChange={v => setForm(f => ({ ...f, sourceLang: v }))}>
                <SelectTrigger className="rounded-xl border-[#d4cfc0] bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#f7f5ef] border-[#d4cfc0] z-[9999]">
                  {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Target language</Label>
              <Select value={form.targetLang} onValueChange={v => setForm(f => ({ ...f, targetLang: v }))}>
                <SelectTrigger className="rounded-xl border-[#d4cfc0] bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#f7f5ef] border-[#d4cfc0] z-[9999]">
                  {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Domain</Label>
              <Select value={form.domain} onValueChange={v => setForm(f => ({ ...f, domain: v }))}>
                <SelectTrigger className="rounded-xl border-[#d4cfc0] bg-white/70"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#f7f5ef] border-[#d4cfc0] z-[9999]">
                  {DOMAINS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes (optional)</Label>
              <Input
                placeholder="Context or usage notes"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="rounded-xl border-[#d4cfc0] bg-white/70"
              />
            </div>
          </div>
          <Button
            variant="gradient"
            className="rounded-full gap-2"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.sourceTerm.trim() || !form.targetTerm.trim()}
          >
            {createMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : 'Save term'}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : terms.length === 0 ? (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-16 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-medium text-foreground">No glossary terms yet</p>
          <p className="text-sm text-muted-foreground">Add terms to ensure consistent translations across your documents.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {terms.map((term: any) => (
            <Card key={term.id} className="border-[#d4cfc0] bg-white/60 rounded-2xl px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                      {LANGUAGES.find(l => l.code === term.sourceLang)?.name || term.sourceLang}
                    </p>
                    <p className="font-medium text-foreground">{term.sourceTerm}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                      {LANGUAGES.find(l => l.code === term.targetLang)?.name || term.targetLang}
                    </p>
                    <p className="font-medium text-foreground">{term.targetTerm}</p>
                  </div>
                  {term.notes && (
                    <p className="text-xs text-muted-foreground sm:col-span-2 mt-1 italic">{term.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs capitalize hidden sm:inline-flex">{term.domain}</Badge>
                  <button
                    onClick={() => deleteMutation.mutate(term.id)}
                    disabled={deleteMutation.isPending}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
