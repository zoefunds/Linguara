'use client';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DocumentsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-16 text-center space-y-3">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="font-medium text-foreground">Document upload coming soon</p>
        <p className="text-sm text-muted-foreground">Paste your text directly into the translation workspace for now.</p>
      </Card>
    </div>
  );
}
