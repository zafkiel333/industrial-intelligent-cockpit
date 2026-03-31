import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/FlangeBoltLoosening/ThreeScene';
import { FlangeStatus } from '@/components/computer-visual-inspection/FlangeBoltLoosening/three-types';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  Zap, 
  Droplets,
  Wrench,
  History,
  ShieldCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const FlangeBoltLooseningView: React.FC = () => {
  const [status, setStatus] = useState<FlangeStatus>({
    boltCount: 12,
    looseBolts: [],
    pressure: 4.2,
    vibration: 0.1,
    isLeaking: false,
    tightness: 98.5
  });

  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isCritical = Math.random() > 0.8;
        const looseBolts = isCritical ? [Math.floor(Math.random() * 12)] : [];
        const isLeaking = looseBolts.length > 0 && Math.random() > 0.5;
        
        const newStatus = {
          ...prev,
          looseBolts,
          pressure: 4.0 + Math.random() * 0.5 + (isLeaking ? -1.0 : 0),
          vibration: 0.05 + Math.random() * 0.1 + (looseBolts.length > 0 ? 0.3 : 0),
          isLeaking,
          tightness: 100 - (looseBolts.length * 8.5) - (Math.random() * 2)
        };

        setHistoryData(h => [...h.slice(-19), {
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          pressure: newStatus.pressure,
          vibration: newStatus.vibration
        }]);

        return newStatus;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isAlert = status.looseBolts.length > 0 || status.isLeaking;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg bg-[#020617] text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/50">
            <Wrench className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
              管道法兰螺栓松动视觉监测系统
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              Pipe Flange Bolt Loosening Visual Inspection System • v4.0
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isAlert ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-green-500/20 border-green-500/50 text-green-400'} animate-pulse`}>
            <div className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-xs font-bold uppercase tracking-tighter">
              {isAlert ? '系统告警' : '运行正常'}
            </span>
          </div>
          <div className="px-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-mono">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: 3D Scene & Real-time Metrics */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard 
              label="系统压力" 
              value={`${status.pressure.toFixed(2)} MPa`} 
              icon={<Gauge className="w-4 h-4" />} 
              trend={status.isLeaking ? 'down' : 'stable'}
              color="cyan"
            />
            <MetricCard 
              label="振动频率" 
              value={`${status.vibration.toFixed(3)} g`} 
              icon={<Activity className="w-4 h-4" />} 
              trend={status.vibration > 0.2 ? 'up' : 'stable'}
              color="purple"
            />
            <MetricCard 
              label="紧固系数" 
              value={`${status.tightness.toFixed(1)}%`} 
              icon={<ShieldCheck className="w-4 h-4" />} 
              trend={status.looseBolts.length > 0 ? 'down' : 'stable'}
              color="blue"
            />
            <MetricCard 
              label="松动螺栓" 
              value={`${status.looseBolts.length} / ${status.boltCount}`} 
              icon={<AlertTriangle className="w-4 h-4" />} 
              trend="none"
              color={status.looseBolts.length > 0 ? 'red' : 'green'}
            />
          </div>

          <SciFiCard title="3D 数字孪生实时监控" className="h-[500px] relative overflow-hidden group">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <div className="px-3 py-1 bg-black/60 backdrop-blur border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400">
                LOD: HIGH
              </div>
              <div className="px-3 py-1 bg-black/60 backdrop-blur border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400">
                REFRESH: 60FPS
              </div>
            </div>
            
            {/* Visual Overlay for Leakage */}
            <AnimatePresence>
              {status.isLeaking && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none z-0 bg-red-500/5 flex items-center justify-center"
                >
                  <div className="text-red-500/20 text-9xl font-black rotate-12 select-none">LEAKAGE DETECTED</div>
                </motion.div>
              )}
            </AnimatePresence>

            <ThreeScene status={status} />
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="压力趋势监测 (MPa)">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 6]} stroke="#475569" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="pressure" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPressure)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard title="振动能谱分析 (g)">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 1]} stroke="#475569" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Line type="stepAfter" dataKey="vibration" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: AI Diagnostics & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <SciFiCard title="AI 视觉诊断报告">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${isAlert ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isAlert ? <AlertTriangle className="text-red-400" /> : <CheckCircle2 className="text-green-400" />}
                  <span className={`font-bold ${isAlert ? 'text-red-400' : 'text-green-400'}`}>
                    {isAlert ? '发现异常隐患' : '结构完整性良好'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {status.isLeaking 
                    ? '视觉系统检测到法兰结合面存在流体喷溅痕迹，初步判定为密封失效。'
                    : status.looseBolts.length > 0 
                    ? `检测到 ${status.looseBolts.length} 枚螺栓标记线发生位移，存在松动风险。`
                    : '全量程螺栓标记线对齐度 100%，未发现位移或松动迹象。'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">诊断详情</div>
                <DetailItem label="标记线位移" value={status.looseBolts.length > 0 ? '检测到偏移' : '正常'} alert={status.looseBolts.length > 0} />
                <DetailItem label="表面渗漏" value={status.isLeaking ? '疑似渗漏' : '无'} alert={status.isLeaking} />
                <DetailItem label="结构共振" value={status.vibration > 0.3 ? '高频振动' : '正常'} alert={status.vibration > 0.3} />
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="智能运维建议">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="p-2 bg-blue-500/20 rounded border border-blue-500/30">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-400">建议操作</div>
                  <p className="text-xs text-slate-400 mt-1">
                    {status.isLeaking 
                      ? '立即关闭上游阀门，进行泄压处理并更换密封垫片。'
                      : status.looseBolts.length > 0 
                      ? '安排技术人员对 4#、7# 螺栓进行力矩复紧。'
                      : '维持当前巡检频率，建议下一次全面检查时间：2026-04-15'}
                  </p>
                </div>
              </div>
              <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-colors uppercase tracking-widest">
                生成工单
              </button>
            </div>
          </SciFiCard>

          <SciFiCard title="实时告警日志">
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {status.isLeaking && (
                <LogItem type="error" time="10:33:12" msg="法兰结合面检测到流体渗漏" />
              )}
              {status.looseBolts.length > 0 && (
                <LogItem type="warning" time="10:32:45" msg={`螺栓 #${status.looseBolts[0] + 1} 标记线位移超限`} />
              )}
              <LogItem type="info" time="10:30:00" msg="视觉算法模型自动更新完成" />
              <LogItem type="info" time="10:00:00" msg="系统例行自检通过" />
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, trend, color }: any) => {
  const colorMap: any = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
    green: 'text-green-400 border-green-500/30 bg-green-500/5',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]} flex flex-col gap-2 relative overflow-hidden`}>
      <div className="flex justify-between items-center z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</span>
        <div className="p-1 bg-white/10 rounded">{icon}</div>
      </div>
      <div className="text-xl font-black z-10">{value}</div>
      {trend !== 'none' && (
        <div className={`text-[10px] font-bold z-10 flex items-center gap-1 ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-cyan-400' : 'text-slate-500'}`}>
          {trend === 'up' ? '▲ 异常上升' : trend === 'down' ? '▼ 压力下降' : '● 稳定'}
        </div>
      )}
      <div className="absolute -bottom-2 -right-2 opacity-10 transform scale-150">
        {icon}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, alert }: any) => (
  <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded border border-slate-800">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`text-xs font-mono ${alert ? 'text-red-400 font-bold' : 'text-cyan-400'}`}>{value}</span>
  </div>
);

const LogItem = ({ type, time, msg }: any) => {
  const colors: any = {
    error: 'text-red-400 border-red-500/20 bg-red-500/5',
    warning: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
    info: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
  };
  return (
    <div className={`p-2 rounded border text-[10px] ${colors[type]} flex gap-3`}>
      <span className="font-mono opacity-60">{time}</span>
      <span className="font-bold uppercase">[{type}]</span>
      <span className="flex-1">{msg}</span>
    </div>
  );
};

export default FlangeBoltLooseningView;
