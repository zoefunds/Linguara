'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, ExternalLink } from 'lucide-react';
import { translationApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const STAGES = [
  { key: 'PENDING',    label: 'Pending',    desc: 'Transaction submitted to GenLayer' },
  { key: 'PROPOSING',  label: 'Proposing',  desc: 'Leader validator generating translation' },
  { key: 'COMMITTING', label: 'Committing', desc: 'Validators committing their votes' },
  { key: 'REVEALING',  label: 'Revealing',  desc: 'Validators revealing results' },
  { key: 'ACCEPTED',   label: 'Accepted',   desc: 'Consensus reached on-chain' },
  { key: 'FINALIZED',  label: 'Finalized',  desc: 'Translation verified and finalized' },
];

const STAGE_INDEX: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

interface Props {
  translationId: string;
  txHash: string | null;
  active: boolean;
}

export function ChainStatusTracker({ translationId, txHash, active }: Props) {
  const [chainStatus, setChainStatus] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!active || !translationId) return;
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        try {
          const { data } = await translationApi.chainStatus(translationId);
          const cs = (data.data?.chainStatus as string | null)?.toUpperCase() ?? null;
          if (!cancelled) {
            setChainStatus(cs);
            setError(false);
            // Stop polling once finalized or accepted
            if (cs === 'FINALIZED' || cs === 'ACCEPTED') break;
          }
        } catch {
          if (!cancelled) setError(true);
        }
        await new Promise(r => setTimeout(r, 5000));
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [translationId, active]);

  const currentIndex = chainStatus ? (STAGE_INDEX[chainStatus] ?? -1) : -1;

  return (
    <div className="rounded-2xl border border-[#d4cfc0] bg-white/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">GenLayer consensus</p>
        {txHash && (
          <a
            href={`https://studio.genlayer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View in explorer
          </a>
        )}
      </div>

      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const pending = i > currentIndex;

          return (
            <div key={stage.key} className="flex items-start gap-3">
              {/* Connector line */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all',
                  done    ? 'border-emerald-500 bg-emerald-500' :
                  active  ? 'border-primary bg-primary' :
                            'border-[#d4cfc0] bg-white'
                )}>
                  {done ? (
                    <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  ) : (
                    <Circle className="h-2 w-2 text-[#d4cfc0]" />
                  )}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={cn(
                    'w-0.5 h-5 mt-0.5 transition-all',
                    done ? 'bg-emerald-400' : 'bg-[#e8e4d8]'
                  )} />
                )}
              </div>

              <div className={cn('pb-1', i < STAGES.length - 1 && 'mb-0')}>
                <p className={cn(
                  'text-sm font-medium leading-tight',
                  done   ? 'text-emerald-600' :
                  active ? 'text-foreground' :
                           'text-muted-foreground'
                )}>
                  {stage.label}
                </p>
                {(done || active) && (
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-muted-foreground">Could not reach explorer — retrying…</p>
      )}

      {!chainStatus && !error && (
        <p className="text-xs text-muted-foreground animate-pulse">Waiting for transaction to appear on-chain…</p>
      )}
    </div>
  );
}
