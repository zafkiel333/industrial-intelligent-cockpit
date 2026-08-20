import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Camera, FileText, AlertTriangle, Users, Wrench, Package, Clock, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export const TimelineWidget = ({ steps }: { steps: { time: string; title: string; status: 'done' | 'active' | 'pending' }[] }) => (
  <div className="space-y-4">
    {steps.map((step, i) => (
      <div key={i} className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${step.status === 'done' ? 'bg-green-500' : step.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
          {i < steps.length - 1 && <div className={`w-0.5 h-10 ${step.status === 'done' ? 'bg-green-500/50' : 'bg-slate-700'}`} />}
        </div>
        <div className="flex-1 pb-4">
          <p className="text-xs text-slate-400 font-mono">{step.time}</p>
          <p className={`text-sm ${step.status === 'active' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}>{step.title}</p>
        </div>
      </div>
    ))}
  </div>
);

export const ChartWidget = ({ data, type, dataKey, color }: { data: any[]; type: 'line' | 'bar' | 'radar'; dataKey: string; color: string }) => (
  <div className="h-full w-full min-h-[200px]">
    <ResponsiveContainer width="100%" height="100%">
      {type === 'line' ? (
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
          <YAxis stroke="#94a3b8" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} />
        </LineChart>
      ) : type === 'bar' ? (
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
          <YAxis stroke="#94a3b8" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : (
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
          <Radar name="Metrics" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.3} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
        </RadarChart>
      )}
    </ResponsiveContainer>
  </div>
);

export const ResourceWidget = ({ workers, tools, parts, resources }: { workers?: number; tools?: string[]; parts?: { name: string; qty: number }[]; resources?: { name: string; allocated: number; total: number; unit: string }[] }) => {
  if (resources) {
    return (
      <div className="space-y-3">
        {resources.map((r, i) => (
          <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 flex justify-between items-center">
            <span className="text-sm text-slate-300">{r.name}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono text-cyan-400">{r.allocated}</span>
              <span className="text-xs text-slate-500">/ {r.total} {r.unit}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2 text-cyan-400">
        <Users size={16} /> <span className="text-sm font-bold">作业人员</span>
      </div>
      <p className="text-2xl font-mono text-white">{workers || 0} <span className="text-xs text-slate-400">人</span></p>
    </div>
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2 text-amber-400">
        <Wrench size={16} /> <span className="text-sm font-bold">关键工具</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {(tools || []).map(t => <span key={t} className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">{t}</span>)}
      </div>
    </div>
    <div className="col-span-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2 text-emerald-400">
        <Package size={16} /> <span className="text-sm font-bold">备品备件</span>
      </div>
      <div className="space-y-1">
        {(parts || []).map(p => (
          <div key={p.name} className="flex justify-between text-xs">
            <span className="text-slate-300">{p.name}</span>
            <span className="font-mono text-emerald-400">x{p.qty}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)};

export const RiskWidget = ({ risks }: { risks: { level: 'high' | 'medium' | 'low'; desc: string }[] }) => (
  <div className="space-y-2">
    {risks.map((risk, i) => (
      <div key={i} className={`flex items-start gap-3 p-2 rounded border ${
        risk.level === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
        risk.level === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
        'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      }`}>
        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
        <span className="text-sm">{risk.desc}</span>
      </div>
    ))}
  </div>
);

export const DocumentWidget = ({ docs }: { docs: { name?: string; title?: string; type: string; date: string }[] }) => (
  <div className="space-y-2">
    {(docs || []).map((doc, i) => (
      <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-800/80 rounded cursor-pointer transition-colors border border-transparent hover:border-slate-700">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-blue-400" />
          <div>
            <p className="text-sm text-slate-200">{doc.name || doc.title}</p>
            <p className="text-[10px] text-slate-500">{doc.type}</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">{doc.date}</span>
      </div>
    ))}
  </div>
);

export const CameraWidget = ({ name, status }: { name: string; status: 'online' | 'offline' }) => (
  <div className="relative w-full h-full min-h-[150px] bg-black rounded-lg overflow-hidden border border-slate-700/50 flex flex-col">
    <div className="absolute top-2 left-2 flex items-center gap-2 z-10 bg-black/50 px-2 py-1 rounded">
      <Camera size={12} className="text-slate-300" />
      <span className="text-[10px] text-slate-300 font-mono">{name}</span>
    </div>
    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
      <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
      <span className="text-[10px] text-slate-300 font-mono">录像</span>
    </div>
    {status === 'online' ? (
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTEiPjwvcmVjdD4KPC9zdmc+')] opacity-20" />
        <div className="w-full h-0.5 bg-green-500/20 absolute top-1/2 animate-[scan_2s_ease-in-out_infinite]" />
        <Activity className="text-slate-700 w-12 h-12" />
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <span className="text-xs text-slate-600 font-mono">无信号</span>
      </div>
    )}
  </div>
);

export const ParameterWidget = ({ params, parameters }: { params?: { label: string; value: string | number; unit?: string; status?: 'normal' | 'warning' | 'critical' }[], parameters?: { label: string; value: string | number; unit?: string; status?: 'normal' | 'warning' | 'critical' }[] }) => {
  const items = params || parameters || [];
  return (
  <div className="grid grid-cols-2 gap-3">
    {items.map((p, i) => (
      <div key={i} className="bg-slate-800/30 p-2 rounded border border-slate-700/30 flex flex-col">
        <span className="text-[10px] text-slate-400 mb-1">{p.label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-mono font-bold ${
            p.status === 'critical' ? 'text-red-400' :
            p.status === 'warning' ? 'text-amber-400' :
            'text-cyan-400'
          }`}>{p.value}</span>
          {p.unit && <span className="text-[10px] text-slate-500">{p.unit}</span>}
        </div>
      </div>
    ))}
  </div>
)};
