import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Equipment-Point-Inspection/HazardousArea/ThreeScene';
// 2026-07-10 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[ins-6]: 2026-07-10 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/ins-6';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { 
  ShieldAlert, UserCheck, Eye, Thermometer, Radio, 
  MapPin, AlertTriangle, Scan, Camera, Lock, 
  Users, Activity, Zap, Database, Info
} from 'lucide-react';

export const MiningHazardousAreaView: React.FC = () => {
  const [riskIndex, setRiskIndex] = useState(0.12);
  const [intruderDetected, setIntruderDetected] = useState(false);
  const [authorizedPersonnel, setAuthorizedPersonnel] = useState([
    { id: 'STAFF_001', name: '王卫东', role: '高级电工', heartRate: 78, temp: 36.5, status: 'legal' },
    { id: 'STAFF_005', name: '李明', role: '安全员', heartRate: 82, temp: 36.7, status: 'legal' },
  ]);

  const [incidentLogs, setIncidentLogs] = useState([
    { id: 'EV-842', type: '违规进入', zone: '炸药库 B 区', time: '15:20:11', status: '已拦截' },
    { id: 'EV-841', type: '温度过热', zone: '1号变压器', time: '14:55:03', status: '自动降温' },
  ]);

  const [gasData, setGasData] = useState({
    ch4: 0.012,
    co: 0.001,
    h2s: 0.000,
    o2: 20.8
  });

  const [riskTrend, setRiskTrend] = useState<any[]>([]);

  useEffect(() => {
    // 模拟风险指数波动
    const timer = setInterval(() => {
      setRiskIndex(prev => {
        const next = 0.1 + Math.random() * 0.1;
        return next;
      });

      setRiskTrend(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), risk: 10 + Math.random() * 15 }];
        return newData.slice(-15);
      });
      
      // 偶发入侵告警模拟
      if (Math.random() > 0.98) {
          setIntruderDetected(true);
          setTimeout(() => setIntruderDetected(false), 5000);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      
      {/* 顶部：安全指挥态势栏 */}
      <div className={`transition-colors duration-500 border-b p-5 clip-corner relative overflow-hidden ${intruderDetected ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_50px_rgba(244,63,94,0.2)]' : 'bg-[#0b1221]/90 border-violet-500/20 shadow-xl'}`}>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded border transition-all ${intruderDetected ? 'bg-red-500/20 border-red-500 animate-bounce' : 'bg-violet-500/10 border-violet-500/40'}`}>
               <ShieldAlert size={36} className={intruderDetected ? 'text-red-500' : 'text-violet-400'} />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
                  危险区域自律巡检监管中心 <span className={`${intruderDetected ? 'text-red-500' : 'text-violet-500'} text-xl not-italic ml-2 tracking-normal`}>// DANGER_ZONE_MONITOR</span>
               </h1>
               <div className="flex gap-6 text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-violet-500"/> 监测分区: 中央油化库及变电站</span>
                  <span className="flex items-center gap-1 text-green-400"><Zap size={12}/> 系统状态: 全域主动扫描中</span>
                  <span className="flex items-center gap-1"><Database size={12}/> 边缘计算: 32ms 响应延迟</span>
               </div>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">区域实时风险等级</div>
                <div className="flex items-center gap-3">
                   <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${intruderDetected ? 'bg-red-500' : 'bg-violet-500'}`} style={{width: `${riskIndex * 400}%`}}></div>
                   </div>
                   <span className={`text-xl font-mono font-black ${intruderDetected ? 'text-red-500' : 'text-white'}`}>{(riskIndex * 100).toFixed(1)} <span className="text-xs">RSK</span></span>
                </div>
             </div>
             <div className="w-[1px] h-12 bg-white/5"></div>
             <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">合法授权在场</div>
                <div className="text-3xl font-mono font-black text-violet-400">02 <span className="text-xs text-slate-600 font-normal">PER</span></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* 左侧：访问控制与人员体征 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           <SciFiCard title="授权访问人员监控" className="bg-[#0f172a]/60 border-violet-900/40">
              <div className="flex flex-col gap-4 py-2">
                 {authorizedPersonnel.map(person => (
                    <div key={person.id} className="p-3 bg-slate-900/80 rounded border border-white/5 hover:border-violet-500/40 transition-all cursor-pointer group">
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                                <UserCheck size={16} className="text-violet-400" />
                             </div>
                             <div>
                                <div className="text-xs font-bold text-white">{person.name}</div>
                                <div className="text-[8px] text-slate-500 uppercase">{person.role}</div>
                             </div>
                          </div>
                          <span className="text-[9px] bg-green-900/30 text-green-400 px-2 rounded font-black uppercase">Authorized</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-[9px] text-slate-400 font-mono">
                             心率: <span className="text-violet-300">{person.heartRate} bpm</span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                             体温: <span className="text-violet-300">{person.temp} °C</span>
                          </div>
                       </div>
                    </div>
                 ))}
                 <div className="mt-2 p-3 border border-dashed border-slate-700 rounded text-center">
                    <button className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-black transition-colors">
                       查看全域访问令牌审计
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="危险气体环境阈值" className="flex-1 border-violet-900/30">
              <div className="flex flex-col gap-4">
                 {[
                    { label: '瓦斯 (CH4)', val: gasData.ch4, limit: 0.5, unit: '%' },
                    { label: '一氧化碳 (CO)', val: gasData.co, limit: 0.02, unit: '%' },
                    { label: '氧气 (O2)', val: gasData.o2, limit: 23, unit: '%' },
                 ].map((gas, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-400 uppercase">{gas.label}</span>
                          <span className="text-white font-mono">{gas.val}{gas.unit}</span>
                       </div>
                       <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full transition-all duration-1000 ${gas.val > gas.limit * 0.8 ? 'bg-orange-500' : 'bg-violet-500'}`} 
                             style={{width: `${(gas.val / gas.limit) * 100}%`}}
                          ></div>
                       </div>
                    </div>
                 ))}
                 
                 <div className="mt-auto bg-violet-950/20 p-4 border border-violet-500/20 rounded">
                    <div className="flex items-center gap-2 mb-2">
                       <Thermometer size={16} className="text-orange-400" />
                       <span className="text-xs font-black text-white uppercase">红外感烟巡检</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tighter">24.8 <span className="text-xs">°C</span></div>
                    <div className="text-[9px] text-slate-500 mt-1 uppercase">Ambient Thermal Stability: OK</div>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中部：3D 数字孪生 & 激光围栏 */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-5 relative">
           <div className={`flex-1 relative border rounded-sm overflow-hidden transition-all duration-500 ${intruderDetected ? 'border-red-500/50 bg-red-950/10' : 'border-violet-500/20 bg-black/40'}`}>
              {/* HUD 覆盖层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-6">
                 <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-violet-500/20 m-4"></div>
                 
                 <div className="absolute top-10 left-10 flex flex-col gap-4">
                    <div className="bg-black/60 backdrop-blur-md p-4 border border-violet-500/30 rounded flex items-center gap-4">
                       <Scan size={24} className="text-violet-400 animate-pulse" />
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">激光围栏状态</div>
                          <div className={`text-xl font-mono font-bold ${intruderDetected ? 'text-red-500' : 'text-white'}`}>
                             {intruderDetected ? '!! INTRUSION !!' : 'ACTIVE_SECURE'}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* AI 视觉快照预览 */}
                 <div className="absolute bottom-10 left-10 w-48 aspect-video bg-black/80 border border-white/10 rounded overflow-hidden group">
                    <div className="absolute top-2 left-2 bg-violet-600 px-1 text-[8px] font-bold">RESTRICTED_CAM_01</div>
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                       <Camera size={32} className="text-slate-500" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-violet-900/40 text-[8px] p-1 text-center font-bold italic uppercase tracking-tighter">
                       AI：行为识别模式已启动
                    </div>
                 </div>
              </div>

              <ThreeScene isAlert={intruderDetected} />
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
           </div>

           {/* 安全指数趋势图 */}
           <div className="h-44">
              <SciFiCard title="全域安全指数 (24H 趋势)" noPadding className="h-full border-violet-900/30">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskTrend} margin={{top: 20, right: 30, left: 10, bottom: 10}}>
                       <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3}/>
                       <XAxis dataKey="time" hide />
                       <YAxis stroke="#64748b" fontSize={10} hide />
                       <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                       <Area type="stepAfter" dataKey="risk" stroke="#8b5cf6" fill="url(#colorRisk)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </SciFiCard>
           </div>
        </div>

        {/* 右侧：AI 识别快照与事件流 */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
           
           <SciFiCard title="AI 异常识别发现流" className="bg-[#0f172a]/40 border-violet-900/30">
              <div className="flex flex-col gap-4">
                 {incidentLogs.map(log => (
                    <div key={log.id} className="flex gap-4 p-3 bg-slate-900/40 border border-white/5 rounded-sm hover:border-violet-500/30 transition-all cursor-pointer group">
                       <div className="w-16 h-16 bg-slate-800 border border-white/10 rounded flex items-center justify-center relative overflow-hidden">
                          <Eye size={24} className="text-slate-600 group-hover:text-violet-500 transition-colors" />
                          <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-transparent transition-all"></div>
                       </div>
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">{log.type}</span>
                             <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <div className="text-xs font-bold text-white my-1 leading-tight">{log.zone}</div>
                          <div className="flex items-center gap-2">
                             <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${log.status === '已拦截' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{log.status}</div>
                             <Info size={10} className="text-slate-600" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="巡检应急响应控制" className="flex-1 border-violet-900/30">
              <div className="flex flex-col h-full">
                 <div className="space-y-4">
                    <div className="p-3 bg-orange-600/10 border-l-4 border-orange-500 rounded-r">
                       <div className="text-xs font-black text-orange-200 uppercase mb-1">当前预防措施: 建议巡回</div>
                       <p className="text-[10px] text-orange-300 leading-relaxed font-bold uppercase">
                          AI 检测到 B 区访问记录缺失。巡检机器人 #04 已被派往现场核实。
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900/80 p-3 border border-white/5 rounded text-center">
                          <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">门禁锁止</div>
                          <Lock size={16} className="mx-auto text-green-400" />
                       </div>
                       <div className="bg-slate-900/80 p-3 border border-white/5 rounded text-center">
                          <div className="text-[9px] text-slate-500 uppercase mb-1 font-bold">扩音告警</div>
                          <Radio size={16} className="mx-auto text-slate-600" />
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto space-y-3">
                    <button className="w-full py-4 bg-violet-600 hover:bg-violet-700 transition-all font-black uppercase italic tracking-[0.3em] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                       发起全域清场锁定
                    </button>
                    <div className="bg-black/60 border border-white/5 p-4 rounded flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Activity size={16} className="text-violet-500" />
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">多因子验证</div>
                       </div>
                       <span className="text-xs font-mono font-black text-green-500 uppercase">Passed</span>
                    </div>
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

    </div>
  );
};
