'use client';
import { useQuery } from '@tanstack/react-query';
import { translationApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getConfidenceColor, cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#7c6f5e', '#a09880', '#c4b99a', '#d4cfc0', '#e8e4d8', '#b5a898'];

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ['translations-report'],
    queryFn: () => translationApi.list(1, 100).then(r => r.data),
  });

  const translations = data?.data || [];
  const completed = translations.filter((t: any) => t.status === 'COMPLETED');
  const failed = translations.filter((t: any) => t.status === 'FAILED');
  const avgConfidence = completed.length
    ? completed.reduce((acc: number, t: any) => acc + (t.confidenceScore || 0), 0) / completed.length
    : 0;

  // By domain
  const byDomain = completed.reduce((acc: Record<string, number>, t: any) => {
    acc[t.domain] = (acc[t.domain] || 0) + 1;
    return acc;
  }, {});
  const domainData = Object.entries(byDomain).map(([name, value]) => ({ name, value }));

  // By language
  const byLang = completed.reduce((acc: Record<string, number>, t: any) => {
    const key = t.targetLanguage?.toUpperCase() || 'UNK';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const langData = Object.entries(byLang)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 8);

  // Confidence over time (last 20 completed)
  const confidenceOverTime = [...completed]
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-20)
    .map((t: any, i: number) => ({
      i: i + 1,
      confidence: parseFloat((t.confidenceScore || 0).toFixed(1)),
    }));

  // Status pie
  const statusData = [
    { name: 'Completed', value: completed.length },
    { name: 'Failed', value: failed.length },
    { name: 'In progress', value: translations.length - completed.length - failed.length },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: translations.length, color: 'text-foreground' },
          { label: 'Completed', value: completed.length, color: 'text-emerald-600' },
          { label: 'Failed', value: failed.length, color: 'text-red-500' },
          { label: 'Avg confidence', value: `${avgConfidence.toFixed(1)}%`, color: getConfidenceColor(avgConfidence) },
        ].map(k => (
          <Card key={k.label} className="border-[#d4cfc0] bg-white/60 rounded-2xl p-5">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={cn('text-3xl font-bold mt-1', k.color)}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Confidence over time */}
      {confidenceOverTime.length > 1 && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardHeader><CardTitle className="text-sm">Confidence over time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={confidenceOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4d8" />
                <XAxis dataKey="i" tick={{ fontSize: 11 }} label={{ value: 'Translation #', position: 'insideBottom', offset: -2, fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Confidence']} contentStyle={{ borderRadius: 12, border: '1px solid #d4cfc0', background: '#f7f5ef' }} />
                <Line type="monotone" dataKey="confidence" stroke="#7c6f5e" strokeWidth={2} dot={{ r: 3, fill: '#7c6f5e' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By language bar chart */}
        {langData.length > 0 && (
          <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
            <CardHeader><CardTitle className="text-sm">By target language</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={langData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={36} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4cfc0', background: '#f7f5ef' }} />
                  <Bar dataKey="count" fill="#7c6f5e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* By domain pie */}
        {domainData.length > 0 && (
          <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
            <CardHeader><CardTitle className="text-sm">By domain</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={domainData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {domainData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4cfc0', background: '#f7f5ef' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status breakdown */}
      {statusData.length > 0 && translations.length > 0 && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl">
          <CardHeader><CardTitle className="text-sm">Status breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #d4cfc0', background: '#f7f5ef' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.name === 'Completed' ? '#10b981' : entry.name === 'Failed' ? '#ef4444' : '#a09880'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {translations.length === 0 && (
        <Card className="border-[#d4cfc0] bg-white/60 rounded-2xl p-12 text-center">
          <p className="text-muted-foreground text-sm">No translations yet — run your first to see reports.</p>
        </Card>
      )}
    </div>
  );
}
