'use client';
import { FileText, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DocumentsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-border/50 p-12 text-center space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
        <div>
          <h2 className="text-xl font-semibold">Document Translation</h2>
          <p className="text-muted-foreground text-sm mt-1">Upload PDF or DOCX files for AI consensus translation</p>
        </div>
        <Link href="/dashboard/translate">
          <Button variant="gradient" className="gap-2"><Upload className="h-4 w-4" />Upload Document</Button>
        </Link>
      </Card>
    </div>
  );
}
