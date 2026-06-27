'use client';
import { useState, useRef } from 'react';
import { FileText, Upload, X, Loader2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { translationApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const ACCEPTED = ['.txt', '.pdf'];

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) validateAndSet(f);
  };

  const validateAndSet = (f: File) => {
    const ok = ACCEPTED.some(ext => f.name.toLowerCase().endsWith(ext));
    if (!ok) {
      toast({ variant: 'destructive', title: 'Unsupported file', description: 'Only TXT and PDF files are supported.' });
      return;
    }
    setFile(f);
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    try {
      let text = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = ev => resolve((ev.target?.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const { data } = await translationApi.extractFile({ base64, filename: file.name, mimeType: file.type });
        text = data.data?.text || '';
      }

      if (!text.trim()) {
        toast({ variant: 'destructive', title: 'No text found', description: 'The file appears to be empty or image-based.' });
        return;
      }

      // Store extracted text in sessionStorage and navigate to translate
      sessionStorage.setItem('linguara_doc_text', text);
      sessionStorage.setItem('linguara_doc_name', file.name);
      router.push('/dashboard/translate');
      toast({ title: 'Document loaded', description: `${file.name} ready to translate` });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not extract text from file.';
      toast({ variant: 'destructive', title: 'Extraction failed', description: msg });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !file && inputRef.current?.click()}
        className="border-2 border-dashed border-[#d4cfc0] rounded-2xl p-16 text-center cursor-pointer hover:border-primary/40 hover:bg-white/40 transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf"
          className="hidden"
          onChange={e => e.target.files?.[0] && validateAndSet(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Drop a file here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">Supports TXT and PDF (text-based)</p>
          </div>
        </div>
      </div>

      {file && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-[#e8e4d8]">
            <Button onClick={handleExtract} disabled={extracting} variant="gradient" className="rounded-full gap-2">
              {extracting
                ? <><Loader2 className="h-4 w-4 animate-spin" />Extracting...</>
                : <><ArrowRight className="h-4 w-4" />Extract & Translate</>}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
        {[
          { icon: '📄', label: 'TXT files', desc: 'Plain text, extracted instantly' },
          { icon: '📑', label: 'PDF files', desc: 'Text-based PDFs (not scanned)' },
        ].map(item => (
          <div key={item.label} className="flex items-start gap-3 rounded-xl border border-[#d4cfc0] bg-white/40 p-4">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="text-xs mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
