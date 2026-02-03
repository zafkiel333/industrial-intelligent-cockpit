import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { EmergencyThreeScene } from '../../components/emergency/ThreeScene';
import { 
  ShieldAlert, 
  Flame, 
  Truck, 
  UserPlus, 
  MapPin, 
  Zap, 
  Timer, 
  AlertOctagon, 
  ArrowRight,
  PhoneCall,
  Activity,
  History,
  Box,
  Construction
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';

const EMERGENCY_POOL = [
  { id: 'SOS-001', type: '主机过热自燃风险', loc: '3号机房-B区', duration: '08:42', level: 'P1', status: '进行中' },
  { id: 'SOS-004', type: '高压母线绝缘击穿', loc: '2号变电站', duration: '12:15', level: 'P1', status: '待响应' },
  { id: 'SOS-009', type: '主轴承震动越限', loc: '1号水轮机组', duration: '45:30', level: 'P2', status: '处理中' },
];

const RESOURCE_STATUS = [
  { name: '抢修车-01', status: 'En Route', driver: '张师傅', task: 'SOS-001' },
  { name: '抢修车-04', status: 'Standby', driver: '李师傅', task: '-' },
  { name: '特种技师组', status: 'On Site', driver: '王工等3人', task: 'SOS-009' },
];

const RESPONSE_STATS = [
  { time: '00:00', delay: 5 }, { time: '04:00', delay: 4 },
  { time: '08:00', delay: 12 }, { time: '12:00', delay: 8 },
  { time: '16:00', delay: 15 }, { time: '20:00', delay: 6 },
];

export const EmergencyChannelView: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700 font-[Rajdhani]">
      
      {/* 顶部：应急状态条 */}
      <div className={`flex items-center justify-between p-4 rounded border transition-all duration-500
        ${isEmergencyMode 
          ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
          : 'bg-slate-900/60 border-slate-800'}
      `}>
        <div className="flex items-center gap-6">
           <div className={`w-12 h-12 rounded flex items-center justify-center animate-pulse
             ${isEmergencyMode ? 'bg-red-600' : 'bg-slate-800'}
           `}>
             <ShieldAlert size={28} className="text-white" />
           </div>
           <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Emergency Status</div>
              <h2 className={`text-2xl font-bold ${isEmergencyMode ? 'text-red-400' : 'text-slate-300'}`}>
                {isEmergencyMode ? '🚨 绿色通道已开启 - 最高优先级优先' : '系统待命 - 绿色通道未激活'}
              </h2>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="text-right pr-6 border-r border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Avg Response</div>
              <div className="text-xl font-bold font-mono text-cyan-400">8.4 MIN</div>
           </div>
           <button 
             onClick={() => setIsEmergencyMode(!isEmergencyMode)}
             className={`px-8 py-2 rounded font-bold transition-all transform active:scale-95 flex items-center gap-2
               ${isEmergencyMode 
                ? 'bg-slate-800 text-red-500 border border-red-500' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'}
             `}
           >
             <Flame size={18} />
             {isEmergencyMode ? '解除绿色通道' : '启动绿色通道'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：警报列表 */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between text-slate-400 px-1">
              <span className="text-xs font-bold uppercase flex items-center gap-2">
                 <AlertOctagon size={14} className="text-red-500" /> SOS 实时警报池
              </span>
              <span className="text-[10px] bg-red-900/30 text-red-400 px-2 rounded">Active: 3</span>
           </div>

           <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
              {EMERGENCY_POOL.map(sos => (
                <div 
                  key={sos.id}
                  className={`p-4 rounded border transition-all cursor-pointer relative group
                    ${selectedAlert === sos.id ? 'bg-red-950/30 border-red-500' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                  `}
                  onClick={() => setSelectedAlert(sos.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-mono text-slate-500">{sos.id}</div>
                    <div className={`px-1.5 rounded text-[10px] font-bold ${sos.level === 'P1' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>
                      {sos.level}
                    </div>
                  </div>
                  <div className="font-bold text-slate-100 group-hover:text-red-400 transition-colors mb-1">{sos.type}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin size={10} /> {sos.loc}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] text-red-400 font-mono">
                       <Timer size={12} className="animate-spin-slow" /> {sos.duration}
                    </div>
                    <span className="text-[10px] text-slate-500 italic">{sos.status}</span>
                  </div>
                </div>
              ))}
           </div>

           <SciFiCard title="应急物资快览" subtitle="INVENTORY" className="mt-auto">
              <div className="space-y-3">
                 {[
                   { label: '抢修备件 A 类', val: 92, color: 'bg-green-500' },
                   { label: '应急油泵/阀', val: 14, color: 'bg-red-500' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                         <span>{item.label}</span>
                         <span className="text-slate-200">{item.val}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div className={`h-full ${item.color}`} style={{width: `${item.val}%`}}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </SciFiCard>
        </div>

        {/* 中间：3D 响应地图 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-[#020610] border border-slate-800 rounded overflow-hidden group">
              {/* HUD 界面层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-red-500 font-mono text-xs">
                          <Activity size={14} className="animate-pulse" />
                          TACTICAL OPS: ACTIVE
                       </div>
                       <h3 className="text-2xl font-bold text-white uppercase">Site Response Matrix</h3>
                    </div>
                    <div className="bg-red-950/40 border border-red-900/30 p-2 rounded backdrop-blur">
                       <div className="text-[9px] text-red-300 uppercase">Active Units</div>
                       <div className="text-lg font-mono font-bold text-white">05 / 12</div>
                    </div>
                 </div>

                 {/* 响应详情浮动窗 */}
                 {selectedAlert && (
                   <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto w-64">
                      <div className="bg-slate-900/90 border border-red-500 p-4 rounded backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
                         <div className="text-[10px] text-red-400 font-bold mb-1 uppercase tracking-widest">Alert Profile</div>
                         <div className="text-lg font-bold text-white mb-2">{selectedAlert}</div>
                         <div className="space-y-2 mb-4">
                            <div className="text-xs text-slate-400">检测到严重绝缘损坏，需 15min 内抵达现场进行紧急切断操作。</div>
                         </div>
                         <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded flex items-center justify-center gap-2">
                               <PhoneCall size={12} /> 联系组长
                            </button>
                            <button className="flex-1 py-2 bg-slate-800 text-slate-300 text-[10px] font-bold rounded border border-slate-700">
                               调阅图纸
                            </button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              {/* 3D 渲染 */}
              <EmergencyThreeScene onAlertSelect={setSelectedAlert} />

              {/* 扫描纹理装饰 */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020610_80%)] pointer-events-none"></div>
           </div>

           {/* 底部：一键派单逻辑 */}
           <div className="h-28 bg-slate-900/80 border border-slate-800 p-4 rounded flex items-center gap-8">
              <div className="flex items-center gap-4 border-r border-slate-800 pr-8">
                 <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/50 flex items-center justify-center relative">
                    <Zap className="text-red-400 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping"></div>
                 </div>
                 <div>
                    <div className="text-xs font-bold text-slate-200">一键紧急调遣 AI</div>
                    <div className="text-[10px] text-slate-500">基于地理位置与技能自动分配</div>
                 </div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-6">
                 {[
                   { label: '预计抵达', val: '12 min', sub: 'Team Alpha' },
                   { label: '预计修复', val: '45 min', sub: 'Level-2 Fix' },
                   { label: '风险等级', val: 'CRITICAL', sub: 'High Impact' },
                 ].map((kpi, i) => (
                   <div key={i}>
                      <div className="text-[10px] text-slate-600 uppercase font-bold">{kpi.label}</div>
                      <div className="text-xl font-bold text-white font-mono">{kpi.val}</div>
                      <div className="text-[9px] text-slate-500 italic">{kpi.sub}</div>
                   </div>
                 ))}
              </div>
              <button className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-3 rounded text-white font-bold tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-red-900/20">
                 立即派遣 <ArrowRight size={18} />
              </button>
           </div>
        </div>

        {/* 右侧：资源与历史 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
          
          <SciFiCard title="抢修资源分布" subtitle="RESOURCES">
             <div className="space-y-4">
                {RESOURCE_STATUS.map((res, i) => (
                  <div key={i} className="p-3 bg-slate-900/40 border border-slate-800 rounded group hover:border-slate-500 transition-all">
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                           <Truck size={14} className={res.status === 'Standby' ? 'text-green-500' : 'text-amber-500 animate-pulse'} />
                           <span className="text-xs font-bold text-slate-200">{res.name}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 rounded ${res.status === 'Standby' ? 'bg-green-900/30 text-green-500' : 'bg-amber-900/30 text-amber-500'}`}>
                           {res.status}
                        </span>
                     </div>
                     <div className="flex justify-between text-[10px] text-slate-500">
                        <span>负责人: {res.driver}</span>
                        <span>任务: <span className="text-cyan-400 font-mono">{res.task}</span></span>
                     </div>
                  </div>
                ))}
                <button className="w-full py-2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-bold flex items-center justify-center gap-2">
                   <UserPlus size={12} /> 增调外部专家库
                </button>
             </div>
          </SciFiCard>

          <SciFiCard title="响应延迟分析" subtitle="KPI TREND" className="flex-1">
             <div className="h-full w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={RESPONSE_STATS}>
                    <defs>
                      <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 20]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444', color: '#e2e8f0', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="delay" stroke="#ef4444" fill="url(#colorDelay)" strokeWidth={2} />
                    <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'SLA Limit', fill: '#f59e0b', fontSize: 8 }} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </SciFiCard>

          <SciFiCard title="最近处警记录" subtitle="HISTORY">
             <div className="space-y-3">
                {[
                  { time: '昨日 14:20', type: '溢流告警', result: '已修复' },
                  { time: '昨日 09:15', type: '通信中断', result: '已复位' },
                ].map((log, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 border-l-2 border-slate-700 bg-white/5">
                     <div>
                        <div className="text-slate-200 font-bold">{log.type}</div>
                        <div className="text-[10px] text-slate-500">{log.time}</div>
                     </div>
                     <span className="text-green-500"><History size={14} /></span>
                  </div>
                ))}
             </div>
          </SciFiCard>

        </div>
      </div>

    </div>
  );
};