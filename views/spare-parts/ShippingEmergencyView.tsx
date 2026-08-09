
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { ShippingTacticalScene } from '../../components/shipping_emergency/ShippingTacticalScene';
import { 
  Siren, 
  Truck, 
  Plane, 
  MapPin, 
  Timer, 
  ShieldAlert, 
  Radio, 
  PhoneCall, 
  PackageCheck,
  ArrowRight,
  Zap,
  Activity,
  Box,
  LocateFixed,
  Send,
  Navigation,
  FileText,
  BadgeCheck,
  CheckCircle2,
  Database,
  Anchor,
  Search,
  Clock,
  Globe,
  RotateCw,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- 模拟数据 ---
const EMERGENCY_SHIPMENTS = [
  { id: 'SOS-MAR-922', ship: 'Ocean Voyager', pos: '马六甲海峡', issue: '主机燃油泵失效', part: '高压级柱塞 (X7)', eta: '4.5h', status: 'In-Transit', level: 'Critical' },
  { id: 'SOS-MAR-884', ship: 'Cosco Glory', pos: '洋山港外锚地', issue: '控制模块烧毁', part: 'PLC-CPU (v4)', eta: '1.2h', status: 'Drone_Launched', level: 'High' },
];

const GEO_NODES: any[] = [
  { id: 'HUB-SGP', name: '新加坡保税库', type: 'hub', position: [1.3, 103.8, 15], status: 'active' },
  { id: 'SOS-MAR-922', name: 'Ocean Voyager', type: 'ship', position: [5.2, 95.4, 15], status: 'warning' },
  { id: 'DRONE-01', name: '应急无人机', type: 'drone', position: [3, 100, 16], status: 'active' },
];

const ROUTES: any[] = [
  { id: 'R-01', from: 'HUB-SGP', to: 'SOS-MAR-922', progress: 0.6, type: 'air' }
];

const PERFORMANCE_METRICS = [
  { month: 'Jan', velocity: 85, accuracy: 98 },
  { month: 'Feb', velocity: 88, accuracy: 99 },
  { month: 'Mar', velocity: 82, accuracy: 97 },
  { month: 'Apr', velocity: 94, accuracy: 99 },
];

export const ShippingEmergencyView: React.FC = () => {
  const [activeShipId, setActiveShipId] = useState<string | null>('SOS-MAR-922');

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in duration-1000 bg-[#02040a] overflow-hidden">
      
      {/* 顶部：应急指挥控制台 */}
      <div className="flex items-center justify-between border-b border-orange-500/30 pb-4 bg-gradient-to-r from-orange-950/20 via-transparent to-transparent p-4 rounded-t-lg relative">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-900 rounded flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border-2 border-orange-400/50 relative group">
              <Siren size={36} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-2 border border-dashed border-orange-500/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
           </div>
           <div>
              <div className="flex items-center gap-2 text-orange-400 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">
                 Maritime Emergency Logistics & Supply Chain
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase leading-none">
                 航运应急抢修 <span className="text-orange-500 italic">快速供应服务</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/60 px-8 py-3 rounded border border-slate-800 backdrop-blur-md relative overflow-hidden">
           <div className="text-center z-10">
              <div className="text-[10px] text-orange-500 uppercase tracking-widest mb-1">平均交付 TTV</div>
              <div className="text-2xl font-mono font-bold text-white">4.2 <span className="text-sm font-normal text-slate-600">HRS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <div className="text-center z-10">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">全球保税库就绪</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">18 <span className="text-sm font-normal text-slate-600">HUBS</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700 z-10"></div>
           <button 
             onClick={() => alert("闪电速递已在当前选定位置启动！")}
             className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white px-8 py-2 rounded-sm font-bold transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest"
           >
              <Zap size={16} /> 发起闪电速递
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：SOS 任务监控 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Anchor size={14} className="text-orange-500" /> 实时遇险备件单</span>
              <button className="p-1 hover:bg-slate-800 rounded transition-colors"><Search size={14}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 px-1 pb-4">
              {EMERGENCY_SHIPMENTS.map(sos => (
                <div 
                  key={sos.id}
                  onClick={() => setActiveShipId(sos.id)}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${activeShipId === sos.id 
                      ? 'bg-orange-950/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-orange-400 font-bold">{sos.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${sos.level === 'Critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-600 text-white'}`}>
                       {sos.level}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">{sos.ship}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-3"><MapPin size={10} /> {sos.pos}</div>
                  <div className="bg-black/30 p-2 rounded text-[10px] mb-3">
                     <div className="flex justify-between text-slate-400 mb-1">
                        <span>急需部件:</span>
                        <span className="text-white font-bold">{sos.part}</span>
                     </div>
                     <div className="flex justify-between text-slate-400">
                        <span>故障模式:</span>
                        <span className="text-red-400">{sos.issue}</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-t border-slate-800 pt-3">
                     <span className="text-slate-500 flex items-center gap-1"><Clock size={10}/> ETA: <span className="text-cyan-400 font-bold">{sos.eta}</span></span>
                     <span className="text-[9px] font-bold uppercase text-slate-400">{sos.status}</span>
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="绿色通关实时核验" subtitle="CUSTOMS_CLEARANCE">
              <div className="space-y-3">
                 {[
                   { label: '海关编码识别 (HS Code)', status: 'Verified' },
                   { label: '港口停靠许可证 (PL)', status: 'Approved' },
                   { label: '本安防爆证书核对', status: 'Passed' },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                       <span className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</span>
                       <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中枢：3D 全球战术沙盘 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020306] border border-cyan-900/20 rounded-lg overflow-hidden group shadow-[inset_0_0_100px_rgba(6,182,212,0.05)]">
              {/* HUD 界面叠加 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs mb-1 uppercase tracking-widest">
                          <Globe size={14} className="animate-spin-slow" />
                          Planetary Logistics Mesh: ACTIVE
                       </div>
                       <h2 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
                          全球应急 <span className="text-cyan-500 italic">投送沙盘</span>
                       </h2>
                    </div>
                    <div className="bg-black/60 border border-cyan-500/30 p-3 rounded backdrop-blur-md text-right">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">海况综合等级</div>
                       <div className="text-3xl font-mono font-bold text-white leading-none mt-1">SEA_04 <span className="text-sm font-normal text-slate-600 uppercase">Moderate</span></div>
                    </div>
                 </div>

                 {/* 底部详细交互条 */}
                 <div className="flex justify-between items-end">
                    <div className="flex gap-4 pointer-events-auto">
                       <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center gap-4 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Navigation size={20} className="text-cyan-500" />
                          <div>
                             <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">目标经纬度</div>
                             <div className="text-sm font-bold text-white font-mono uppercase tracking-widest">31.23°N, 121.47°E</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 pointer-events-auto">
                       <button className="px-6 py-3 bg-slate-900 border border-cyan-500/50 text-cyan-400 font-bold rounded-sm text-xs uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all">无人机投送</button>
                       <button className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-sm text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-900/30">启动急速海运</button>
                    </div>
                 </div>
              </div>

              {/* 3D 渲染组件 */}
              <div className="absolute inset-0">
                 <ShippingTacticalScene 
                    nodes={GEO_NODES} 
                    routes={ROUTES} 
                    activeShipId={activeShipId}
                    onNodeSelect={setActiveShipId}
                    seaState={0.4}
                 />
              </div>

              {/* 背景格线装饰 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           </div>

           {/* 底部：供应时效分析图 */}
           <SciFiCard title="全球供应网络效能趋势" subtitle="VELOCITY_METRICS" className="h-56 border-cyan-900/30" noPadding>
              <div className="h-full w-full p-4 pt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={PERFORMANCE_METRICS}>
                       <defs>
                          <linearGradient id="colorVelUE" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis hide />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
                       <Area type="monotone" dataKey="velocity" stroke="#0ea5e9" fill="url(#colorVelUE)" strokeWidth={2} name="平均交付速率" />
                       <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{r: 4}} name="预测 ETA 准确率" />
                       <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </SciFiCard>
        </div>

        {/* 右翼：最后一公里决策与补货建议 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden pr-2">
           
           <SciFiCard title="最后一公里投送决策" subtitle="FINAL_MILE">
              <div className="space-y-4">
                 <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded-r flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center gap-2">
                       <Plane size={16} className="text-blue-400 animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">推荐投送模式</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “由于洋山港外锚地当前风力 4 级，水流平稳。建议启用 <span className="text-white font-bold">重载无人机 (Drone-X8)</span> 进行直接空投，预计投送耗时 18 分钟。”
                    </p>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                       <Zap size={60} className="text-blue-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                       <PackageCheck size={12} className="text-emerald-500" /> 投送清单就绪检查
                    </div>
                    {[
                      { label: '零件指纹唯一性核验', status: 'done' },
                      { label: '防水抗震封装审计', status: 'done' },
                      { label: '海关离岸申报同步', status: 'pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                         <span className="text-[10px] text-slate-300">{step.label}</span>
                         {step.status === 'done' ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse"></div>}
                      </div>
                    ))}
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="AI 应急库存调度" subtitle="REORDER_AI" className="flex-1 overflow-hidden border-orange-900/30 bg-orange-950/5">
              <div className="flex flex-col h-full gap-4">
                 <div className="p-3 bg-orange-900/20 border-l-4 border-orange-500 rounded-r flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <RotateCw size={16} className="text-orange-400 animate-spin" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">动态重分配</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic">
                       “识别到红海航线持续受阻，建议将新加坡枢纽的 <span className="text-white font-bold">磁控管库存</span> 等级上调至 HIGH，并向马赛中心库申请紧急调拨。”
                    </p>
                 </div>
                 
                 <div className="mt-auto pt-4 border-t border-slate-800">
                    <button className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded shadow-lg shadow-orange-900/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                       <FileText size={16} /> 导出应急保障白皮书
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <div className="p-4 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-800 rounded"><Database size={16} className="text-slate-500" /></div>
                 <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">关联船级社备件库</div>
                    <div className="text-xs font-bold text-white">MAR_PARTS_v5.db</div>
                 </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
           </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.3); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.6); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}} />
    </div>
  );
};
