import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  Zap, 
  Gauge, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Thermometer, 
  RotateCw, 
  TrendingUp, 
  Settings2, 
  Stamp,
  Fingerprint,
  MonitorCheck,
  ClipboardCheck,
  Waves
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ComposedChart, ReferenceLine, Legend
} from 'recharts';

// --- 模拟试机动态数据 ---
const TEST_CYCLE_DATA = [
  { time: '0s', speed: 0, load: 0, temp: 25 },
  { time: '10s', speed: 300, load: 15, temp: 28 },
  { time: '20s', speed: 800, load: 45, temp: 35 },
  { time: '30s', speed: 1500, load: 85, temp: 48 },
  { time: '40s', speed: 1500, load: 95, temp: 58 },
  { time: '50s', speed: 1510, load: 92, temp: 62 },
  { time: '60s', speed: 1500, load: 90, temp: 64 },
  { time: '70s', speed: 800, load: 40, temp: 60 },
  { time: '80s', speed: 0, load: 0, temp: 52 },
];

const VERIFICATION_MATRIX = [
  { id: 1, item: '轴承径向振动 (X/Y)', standard: '< 2.8mm/s', actual: '1.24mm/s', result: 'Pass' },
  { id: 2, item: '润滑系统启动压力', standard: '≥ 0.40 MPa', actual: '0.42 MPa', result: 'Pass' },
  { id: 3, item: '静密封面渗漏率', standard: '无可见泄漏', actual: '合格', result: 'Pass' },
  { id: 4, item: '电机启动浪涌电流', standard: '< 450 A', actual: '412 A', result: 'Pass' },
  { id: 5, item: '整机声功率级', standard: '≤ 85 dB(A)', actual: '82.4 dB', result: 'Pass' },
];

export const TestRunRecordView: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVerifying(false), 2500);
    const ticker = setInterval(() => setCurrentTime(prev => (prev + 1) % 80), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(ticker);
    };
  }, []);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 顶部：认证状态与标题 */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-6 bg-gradient-to-r from-emerald-950/20 to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-emerald-600/20 border-2 border-emerald-500 rounded flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <MonitorCheck size={36} className="text-emerald-400" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs tracking-[0.4em] uppercase mb-1 font-bold">
                 Post-Maintenance Certification
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 维修后 <span className="text-emerald-500 italic">试机数据核销终端</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-3 rounded border border-slate-800 relative overflow-hidden group">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">测试批次</div>
              <div className="text-lg font-mono font-bold text-white">TR-202404-09</div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">设备位号</div>
              <div className="text-lg font-mono font-bold text-cyan-400">P-101A/X</div>
           </div>

           {/* 状态印章动画 */}
           <div className="relative w-20 h-20">
              {!isVerifying && (
                <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-150 duration-500">
                   <div className="w-16 h-16 rounded-full border-2 border-emerald-500/50 flex items-center justify-center transform rotate-[-15deg] bg-emerald-500/10 backdrop-blur-sm">
                      <span className="text-emerald-500 font-bold text-xl border-4 border-emerald-500 px-2 py-0.5 rounded leading-none">合格</span>
                   </div>
                   <div className="absolute inset-0 border border-dashed border-emerald-500 rounded-full animate-[spin_10s_linear_infinite]"></div>
                </div>
              )}
              {isVerifying && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <Activity size={24} className="text-cyan-500 animate-pulse" />
                </div>
              )}
           </div>
        </div>

        {/* 顶部装饰网格 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：实时性能遥测 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           <SciFiCard title="试机实时参数快照" subtitle="TELEMETRY" highlight className="border-emerald-500/20">
              <div className="space-y-4">
                 {[
                   { label: '稳态转速', val: '1502', unit: 'RPM', icon: <RotateCw size={14}/>, color: 'text-white' },
                   { label: '有功功率', val: '24.5', unit: 'kW', icon: <Zap size={14}/>, color: 'text-amber-400' },
                   { label: '最高温升', val: '64.2', unit: '°C', icon: <Thermometer size={14}/>, color: 'text-orange-500' },
                   { label: '振动峰值', val: '1.24', unit: 'mm/s', icon: <Waves size={14}/>, color: 'text-emerald-400' },
                 ].map((kpi, i) => (
                    <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded group hover:border-emerald-500/30 transition-all">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2">
                             {kpi.icon} {kpi.label}
                          </span>
                          {i === 3 && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>}
                       </div>
                       <div className="flex justify-between items-baseline">
                          <span className={`text-2xl font-mono font-bold ${kpi.color}`}>{kpi.val}</span>
                          <span className="text-[10px] text-slate-600 font-mono italic">{kpi.unit}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="启动特性评估" subtitle="STARTUP_ANALYSIS" className="flex-1">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-blue-900/10 border-l-2 border-blue-500 rounded-r flex flex-col gap-2">
                    <div className="text-[10px] text-blue-400 uppercase font-bold">加速曲线评估</div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                       电机从静止加速至额定转速耗时 8.2s，曲线平滑度 98.4%，未发现突发性力矩波动。
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                       <div className="text-[9px] text-slate-500 uppercase">启动电流倍数</div>
                       <div className="text-sm font-bold text-white font-mono">5.2x</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                       <div className="text-[9px] text-slate-500 uppercase">稳态恢复时长</div>
                       <div className="text-sm font-bold text-white font-mono">2.4s</div>
                    </div>
                 </div>
                 
                 <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center gap-2">
                    <Settings2 size={12} /> 重新标定传感器
                 </button>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：动态性能主图表 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <SciFiCard title="试机全程动态响应曲线" subtitle="DYNAMIC_RESPONSE" className="flex-1 bg-[#050810]/50">
              <div className="flex flex-col h-full">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">转速轨迹 (RPM)</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-1 bg-cyan-400 rounded-full"></div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">负载负荷 (%)</span>
                       </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-500 font-mono">
                       <Timer size={12} className="inline mr-1" /> TEST_DURATION: 80s
                    </div>
                 </div>

                 <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={TEST_CYCLE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                             <linearGradient id="colorSpeedRecord" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="left" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '12px' }}
                             itemStyle={{ color: '#e2e8f0' }}
                             cursor={{ stroke: '#334155' }}
                          />
                          <Area yAxisId="left" type="monotone" dataKey="speed" stroke="#10b981" fill="url(#colorSpeedRecord)" strokeWidth={2} name="转速" isAnimationActive={true} />
                          <Line yAxisId="right" type="step" dataKey="load" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} name="负荷" />
                          <ReferenceLine y={1500} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Rated', fill: '#ef4444', fontSize: 10 }} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/5">
                    <div className="text-center group cursor-pointer">
                       <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">滑跑降速时长</div>
                       <div className="text-2xl font-bold text-white font-mono">15.8 <span className="text-xs text-slate-600">s</span></div>
                    </div>
                    <div className="text-center group cursor-pointer">
                       <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">稳态运行能效</div>
                       <div className="text-2xl font-bold text-emerald-400 font-mono">92.4 <span className="text-xs text-slate-600">%</span></div>
                    </div>
                    <div className="text-center group cursor-pointer">
                       <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">油压响应时延</div>
                       <div className="text-2xl font-bold text-white font-mono">0.42 <span className="text-xs text-slate-600">s</span></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <div className="h-32 bg-slate-900/60 border border-slate-800 rounded p-4 flex items-center justify-between relative overflow-hidden group">
              <div className="flex items-center gap-5 z-10">
                 <div className="w-12 h-12 rounded bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-500">
                    <AlertCircle size={24} className="animate-pulse" />
                 </div>
                 <div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                       自诊断异常过滤层 <span className="text-[10px] bg-slate-800 px-2 rounded text-slate-400">AI Active</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">系统已自动排查频谱中 0.5X 及其余非同步谐波。未检测到油膜涡动迹象。</div>
                 </div>
              </div>
              <div className="text-right z-10">
                 <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">健康一致性</div>
                 <div className="text-2xl font-mono font-bold text-white">99.85%</div>
              </div>
              {/* 背景装饰波形 */}
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <TrendingUp size={120} />
              </div>
           </div>
        </div>

        {/* 右侧：核查矩阵与签署核销 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="技术标准比对矩阵" subtitle="VERIFICATION" className="flex-1 overflow-hidden border-emerald-900/40">
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 py-2">
                    {VERIFICATION_MATRIX.map(item => (
                       <div key={item.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded group hover:border-emerald-500/40 transition-all cursor-default">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{item.item}</span>
                             <CheckCircle2 size={14} className="text-emerald-500" />
                          </div>
                          <div className="flex justify-between items-end">
                             <div className="text-[10px] text-slate-500 font-mono space-y-1">
                                <div>Standard: <span className="text-slate-300">{item.standard}</span></div>
                                <div>Measured: <span className="text-emerald-400 font-bold">{item.actual}</span></div>
                             </div>
                             <div className="px-2 py-0.5 bg-emerald-900/20 text-emerald-400 rounded text-[9px] font-bold uppercase tracking-tighter">Verified</div>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded flex items-start gap-3 relative overflow-hidden">
                       <ShieldCheck size={20} className="text-blue-400 shrink-0" />
                       <div className="text-[10px] text-blue-100 leading-normal relative z-10">
                          基于 <span className="font-bold">GB/T 8564-2003</span> 检修标准核验通过。试机运行平稳，所有受控参数均处于 A 级标准区间。
                       </div>
                       <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-blue-500"><FileText size={40}/></div>
                    </div>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="数字化签署与关闭" subtitle="CERTIFICATION">
              <div className="space-y-4">
                 <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">综合评估结论</span>
                       <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Optimal Performance</span>
                    </div>
                    
                    {/* 签名占位区 */}
                    <div className="p-4 bg-slate-950 border border-dashed border-slate-800 rounded flex flex-col items-center gap-3 relative group overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all">
                       <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <Fingerprint size={48} className="text-slate-800 group-hover:text-emerald-500/40 transition-colors" />
                       <div className="text-center">
                          <div className="text-xs font-bold text-slate-300">王利民 (主责检修师)</div>
                          <div className="text-[9px] text-slate-600 font-mono tracking-tighter">DIGITAL_ID: CRT-9221-X9</div>
                       </div>
                       <div className="absolute top-2 right-2 text-[8px] text-slate-700 font-mono uppercase">Unsigned</div>
                    </div>
                    
                    <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold tracking-[0.4em] rounded-sm shadow-xl shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-emerald-400/30">
                       <Stamp size={20} />
                       确认签署并关闭工单
                    </button>
                    
                    <div className="flex justify-center gap-4 pt-2">
                       <button className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
                          <FileText size={12} className="text-slate-700" /> 预览PDF存证
                       </button>
                       <span className="text-slate-800">|</span>
                       <button className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
                          <ChevronRight size={12} className="text-slate-700" /> 异常挂号
                       </button>
                    </div>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
};
