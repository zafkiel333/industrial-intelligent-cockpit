import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../components/SciFiCard';
import { ThreeScene } from '../components/ThreeScene';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';
import { 
  Camera, ShieldAlert, CheckCircle2, Clock, 
  MapPin, User, Activity, Scan, AlertTriangle, Eye
} from 'lucide-react';

interface InspectionViewProps {
  title: string;
}

export const InspectionView: React.FC<InspectionViewProps> = ({ title }) => {
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());
  const [riskLevel, setRiskLevel] = useState('Low');
  
  const radarData = [
    { subject: '结构安全', A: 95, fullMark: 100 },
    { subject: '电气合规', A: 88, fullMark: 100 },
    { subject: '环境指标', A: 92, fullMark: 100 },
    { subject: '设备性能', A: 90, fullMark: 100 },
    { subject: '消防安全', A: 98, fullMark: 100 },
  ];

  const pieData = [
    { name: '已通过', value: 12, color: '#10b981' },
    { name: '待检查', value: 3, color: '#64748b' },
    { name: '异常', value: 1, color: '#f43f5e' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000);
    // Random risk simulation
    if (Math.random() > 0.95) setRiskLevel('Medium');
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 font-[Rajdhani]">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-500 mb-1 uppercase tracking-widest">
            <Scan size={14} className="animate-pulse" />
            Autonomous Smart Inspection / 智能点巡检系统
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{title}</h1>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded text-right">
              <div className="text-[10px] text-slate-500 uppercase">Risk Assessment</div>
              <div className={`text-xl font-bold ${riskLevel === 'Low' ? 'text-green-400' : 'text-orange-500'}`}>
                {riskLevel.toUpperCase()} RISK
              </div>
           </div>
           <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded text-right">
              <div className="text-[10px] text-slate-500 uppercase">Last Sync</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">{timestamp}</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Left: Visual Feed & AI Vision */}
        <div className="w-full lg:w-2/3 flex flex-col gap-5">
          <div className="flex-1 min-h-[400px] relative bg-[#020617] border border-slate-800 rounded-sm overflow-hidden">
            {/* Visual HUD */}
            <div className="absolute inset-0 pointer-events-none z-10 border-[20px] border-transparent border-t-white/5 border-l-white/5"></div>
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
               <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-cyan-500/30 flex items-center gap-2">
                  <Camera size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-white tracking-widest">AI VISION FEED: LIVE</span>
               </div>
               <div className="bg-red-500/20 backdrop-blur px-3 py-1 rounded border border-red-500/30 flex items-center gap-2">
                  <Eye size={14} className="text-red-400" />
                  <span className="text-[10px] font-bold text-red-200">DEFECT DETECTION: ACTIVE</span>
               </div>
            </div>

            <ThreeScene type="default" color="#0891b2" />

            {/* AI Bounding Box Simulation */}
            <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-red-500/50 animate-pulse pointer-events-none">
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-1 font-bold">POSSIBLE ANOMALY 78%</div>
            </div>
          </div>

          <div className="h-48 grid grid-cols-1 md:grid-cols-3 gap-5">
             <SciFiCard title="巡检实时轨迹" className="bg-slate-900/40">
                <div className="flex flex-col gap-2 h-full justify-center">
                   <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-cyan-500" />
                      <div className="text-sm font-mono text-slate-300 tracking-wider">SEC_04 {"->"} TWR_09 {"->"} END_01</div>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full mt-2">
                      <div className="h-full bg-cyan-500 w-[65%] animate-pulse"></div>
                   </div>
                   <div className="text-[10px] text-right text-slate-500">EST. COMPLETION: 14 MIN</div>
                </div>
             </SciFiCard>
             <SciFiCard title="环境传感器" className="bg-slate-900/40">
                <div className="grid grid-cols-2 gap-2 h-full content-center">
                   <div>
                      <div className="text-[10px] text-slate-500">TEMP</div>
                      <div className="text-xl font-mono">24.5°C</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-slate-500">HUMID</div>
                      <div className="text-xl font-mono">42%</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-slate-500">GAS</div>
                      <div className="text-xl font-mono text-green-400">SAFE</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-slate-500">O2</div>
                      <div className="text-xl font-mono">20.9%</div>
                   </div>
                </div>
             </SciFiCard>
             <SciFiCard title="巡检员信息" className="bg-slate-900/40">
                <div className="flex items-center gap-3 h-full">
                   <div className="w-12 h-12 bg-cyan-950 rounded-full flex items-center justify-center border border-cyan-500/30">
                      <User className="text-cyan-400" />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-white font-mono tracking-wider">AI_BOT_V4</div>
                      <div className="text-[10px] text-slate-500 uppercase">Robotic Inspection Unit</div>
                   </div>
                </div>
             </SciFiCard>
          </div>
        </div>

        {/* Right: Data Analysis */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
          <SciFiCard title="健康度雷达图" className="h-64">
             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Current" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.2} />
                    </RadarChart>
                </ResponsiveContainer>
             </div>
          </SciFiCard>

          <SciFiCard title="检查清单进度" className="flex-1">
             <div className="flex flex-col gap-4">
                <div className="h-40">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={pieData} innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                         <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <div className="text-lg font-bold">80%</div>
                      <div className="text-[8px] text-slate-500 uppercase">DONE</div>
                   </div>
                </div>
                
                <div className="space-y-2">
                   {['外观完整性', '紧固件检查', '润滑状态', '异响分贝测试'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900/30 rounded border border-slate-800">
                         <div className="flex items-center gap-2">
                            {i === 3 ? <AlertTriangle size={12} className="text-orange-400" /> : <CheckCircle2 size={12} className="text-green-500" />}
                            <span className="text-xs text-slate-300">{item}</span>
                         </div>
                         <span className={`text-[10px] font-bold ${i === 3 ? 'text-orange-400' : 'text-green-500'}`}>
                            {i === 3 ? '异常待确认' : '已通过'}
                         </span>
                      </div>
                   ))}
                </div>
             </div>
          </SciFiCard>

          <SciFiCard title="巡检结论与记录">
             <div className="flex flex-col gap-3">
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded">
                   <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                      <ShieldAlert size={14} /> 严重缺陷警告
                   </div>
                   <p className="text-[11px] text-red-200">
                      在支护结构左侧发现微量渗水及裂缝，建议立即停机进行人工复检并加固。
                   </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                   <div className="flex items-center gap-1"><Clock size={10} /> 巡检时长: 42分15秒</div>
                   <div className="flex items-center gap-1"><CheckCircle2 size={10} /> 任务编号: #INS-20241021</div>
                </div>
             </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};