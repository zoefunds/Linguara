'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, ExternalLink } from 'lucide-react';
import { translationApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const STAGES = [
  { key: 'PENDING',    label: 'Pending',    desc: 'Transaction submitted to GenLayer' },
  { key: 'PROPOSING',  label: 'Proposing',  desc: 'Validators generating translations' },
  { key: 'COMMITTING', label: 'Committing', desc: 'Validators committing their votes' },
  { key: 'REVEALING',  label: 'Revealing',  desc: 'Validators revealing results' },
  { key: 'ACCEPTED',   label: 'Accepted',   desc: 'Consensus reached on-chain' },
  { key: 'FINALIZED',  label: 'Finalized',  desc: 'Translation verified and finalized' },
];

const CHAIN_STAGE_INDEX: Record<string, number> = {
  PENDING: 0, PROPOSING: 1, COMMITTING: 2, REVEALING: 3, ACCEPTED: 4, FINALIZED: 5,
};

// Map DB status → minimum stage index so the tracker always shows progress
// even when the chain-status call fails or returns null.
const DB_STATUS_STAGE: Record<string, number> = {
  PENDING: 0,
  PROCESSING: 1, // tx submitted, validators working
  COMPLETED: 5,  // finalized
  FAILED: -1,
};

interface Props {
  translationId: string;
  txHash: string | null;
  dbStatus: string | null;
  active: boolean;
}

export function ChainStatusTracker({ translationId, txHash, dbStatus, active }: Props) {
  const [chainStage, setChainStage] = useState<number | null>(null);

  // Animated stage cycling for PROCESSING — steps through Proposing → Committing → Revealing
  const [animStage, setAnimStage] = useState(1);
  useEffect(() => {
    if (dbStatus !== 'PROCESSING' || chainStage !== null) return;
    const id = setInterval(() => setAnimStage(s => s >= 3 ? 1 : s + 1), 4000);
    return () => clearInterval(id);
  }, [dbStatus, chainStage]);

  useEffect(() => {
    if (!active || !translationId) return;
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        try {
          const { data } = await translationApi.chainStatus(translationId);
          const cs = (data.data?.chainStatus as string | null)?.toUpperCase() ?? null;
          if (!cancelled && cs && cs in CHAIN_STAGE_INDEX) {
            setChainStage(CHAIN_STAGE_INDEX[cs]);
            if (cs === 'FINALIZED' || cs === 'ACCEPTED') break;
          }
        } catch {
          // silently retry — DB-based fallback keeps tracker useful
        }
        await new Promise(r => setTimeout(r, 5000));
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [translationId, active]);

  // Resolve current stage index: prefer live chain data, fall back to DB status
  let currentIndex: number;
  if (chainStage !== null) {
    currentIndex = chainStage;
  } else if (dbStatus === 'PROCESSING') {
    currentIndex = animStage; // animated 1→2→3
  } else {
    currentIndex = DB_STATUS_STAGE[dbStatus ?? ''] ?? 0;
  }

  if (currentIndex < 0) return null; // FAILED — don't show tracker

  return (
    <div className="rounded-2xl border border-[#d4cfc0] bg-white/60 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          GenLayer consensus
        </p>
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
          const done   = i < currentIndex;
          const isActive = i === currentIndex;

          return (
            <div key={stage.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500',
                  done      ? 'border-emerald-500 bg-emerald-500' :
                  isActive  ? 'border-primary bg-primary' :
                              'border-[#d4cfc0] bg-white'
                )}>
                  {done ? (
                    <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
                  ) : isActive ? (
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  ) : (
                    <Circle className="h-2 w-2 text-[#d4cfc0]" />
                  )}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={cn(
                    'w-0.5 h-5 mt-0.5 transition-all duration-500',
                    done ? 'bg-emerald-400' : 'bg-[#e8e4d8]'
                  )} />
                )}
              </div>

              <div className="pb-1">
                <p className={cn(
                  'text-sm font-medium leading-tight transition-colors duration-300',
                  done      ? 'text-emerald-600' :
                  isActive  ? 'text-foreground' :
                              'text-muted-foreground'
                )}>
                  {stage.label}
                </p>
                {(done || isActive) && (
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {currentIndex >= 4
          ? 'Consensus reached — saving result…'
          : 'Consensus takes 10–20 min — keep this tab open'}
      </p>
    </div>
  );
}
