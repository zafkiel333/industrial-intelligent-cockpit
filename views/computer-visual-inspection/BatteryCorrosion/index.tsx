import React, { useState, useEffect } from 'react';
import { SciFiCard } from '@/components/SciFiCard';
import { ThreeScene } from '@/components/computer-visual-inspection/BatteryCorrosion/ThreeScene';
import { BatteryStatus } from '@/components/computer-visual-inspection/BatteryCorrosion/three-types';
import { 
  Battery, 
  Thermometer, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Droplets,
  ShieldAlert,
  History,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const BatteryCorrosionView: React.FC = () => {
  const [status, setStatus] = useState<BatteryStatus>({
    voltage: 13.2,
    temperature: 24.5,
    corrosionLevel: 15,
    leakageDetected: false,
    terminalResistance: 0.85,
    healthScore: 92
  });

  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isCritical = Math.random() > 0.85;
        const corrosionLevel = isCritical ? Math.min(100, prev.corrosionLevel + 5) : prev.corrosionLevel;
        const leakageDetected = corrosionLevel > 40 && Math.random() > 0.7;
        
        const newStatus = {
          ...prev,
          voltage: 12.8 + Math.random() * 0.8,
          temperature: 22 + Math.random() * 5 + (corrosionLevel > 50 ? 10 : 0),
          corrosionLevel,
          leakageDetected,
          terminalResistance: 0.8 + (corrosionLevel * 0.05),
          healthScore: Math.max(0, 100 - (corrosionLevel * 0.8) - (leakageDetected ? 20 : 0))
        };

        setHistoryData(h => [...h.slice(-19), {
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          voltage: newStatus.voltage,
          temp: newStatus.temperature
        }]);

        return newStatus;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isAlert = status.corrosionLevel > 30 || status.leakageDetected;

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full tech-grid-bg bg-[#020617] text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/50">
            <Battery className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
              蓄电池端子腐蚀与渗液视觉监测系统
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              Battery Terminal Corrosion & Leakage Visual Inspection • v2.1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isAlert ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-green-500/20 border-green-500/50 text-green-400'} animate-pulse`}>
            <div className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-xs font-bold uppercase tracking-tighter">
              {isAlert ? '风险预警' : '健康运行'}
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
              label="实时电压" 
              value={`${status.voltage.toFixed(2)} V`} 
              icon={<Zap className="w-4 h-4" />} 
              trend={status.voltage < 12.5 ? 'down' : 'stable'}
              color="cyan"
            />
            <MetricCard 
              label="端子温度" 
              value={`${status.temperature.toFixed(1)} °C`} 
              icon={<Thermometer className="w-4 h-4" />} 
              trend={status.temperature > 35 ? 'up' : 'stable'}
              color="orange"
            />
            <MetricCard 
              label="腐蚀指数" 
              value={`${status.corrosionLevel}%`} 
              icon={<ShieldAlert className="w-4 h-4" />} 
              trend={status.corrosionLevel > 50 ? 'up' : 'stable'}
              color={status.corrosionLevel > 30 ? 'red' : 'blue'}
            />
            <MetricCard 
              label="健康评分" 
              value={status.healthScore.toFixed(0)} 
              icon={<Activity className="w-4 h-4" />} 
              trend="none"
              color={status.healthScore > 80 ? 'green' : status.healthScore > 50 ? 'yellow' : 'red'}
            />
          </div>

          <SciFiCard title="3D 数字孪生实时视觉监控" className="h-[500px] relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="px-3 py-1 bg-black/60 backdrop-blur border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400">
                CAM: TERMINAL_ZOOM
              </div>
              <div className="px-3 py-1 bg-black/60 backdrop-blur border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400">
                AI_CONFIDENCE: 98.2%
              </div>
            </div>
            
            <ThreeScene status={status} />

            {/* Visual HUD for Leakage */}
            <AnimatePresence>
              {status.leakageDetected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
                >
                  <div className="p-8 bg-red-500/20 backdrop-blur-md border-2 border-red-500 rounded-full animate-pulse">
                    <Droplets className="w-16 h-16 text-red-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="电压波动曲线 (V)">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[12, 14]} stroke="#475569" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Line type="monotone" dataKey="voltage" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
            <SciFiCard title="温度变化趋势 (°C)">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[20, 50]} stroke="#475569" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                      itemStyle={{ color: '#f97316' }}
                    />
                    <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: AI Diagnostics & Maintenance */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <SciFiCard title="AI 智能诊断报告">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${isAlert ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isAlert ? <AlertCircle className="text-red-400" /> : <CheckCircle2 className="text-green-400" />}
                  <span className={`font-bold ${isAlert ? 'text-red-400' : 'text-green-400'}`}>
                    {isAlert ? '检测到结构性损伤' : '端子状态良好'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {status.leakageDetected 
                    ? '视觉识别到电池盖板边缘存在明显的电解液渗漏痕迹，伴随端子周围大量白色结晶。'
                    : status.corrosionLevel > 30 
                    ? `端子表面出现中度氧化腐蚀，覆盖面积约 ${status.corrosionLevel}%，建议及时清理。`
                    : '端子表面光洁，未发现明显的氧化物堆积或渗液现象。'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">关键指标分析</div>
                <DetailItem label="接触电阻" value={`${status.terminalResistance.toFixed(2)} mΩ`} alert={status.terminalResistance > 2} />
                <DetailItem label="结晶厚度" value={status.corrosionLevel > 50 ? '厚层堆积' : status.corrosionLevel > 10 ? '薄膜覆盖' : '无'} alert={status.corrosionLevel > 50} />
                <DetailItem label="渗液风险" value={status.leakageDetected ? '高危' : '极低'} alert={status.leakageDetected} />
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="预测性维护建议">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="p-2 bg-purple-500/20 rounded border border-purple-500/30">
                  <History className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-purple-400">维护动作</div>
                  <p className="text-xs text-slate-400 mt-1">
                    {status.leakageDetected 
                      ? '立即隔离该电池组，进行中和清洗并检查壳体裂纹。'
                      : status.corrosionLevel > 30 
                      ? '建议在 48 小时内对端子进行除锈处理并涂抹导电防护脂。'
                      : '维持当前自动巡检频率，预计 30 天内无需人工干预。'}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-[10px] text-slate-500 mb-2 uppercase font-bold">预计寿命损耗</div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - status.healthScore}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  />
                </div>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="实时事件流">
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {status.leakageDetected && (
                <EventItem type="critical" time="10:45:22" msg="检测到电解液渗漏，触发紧急预警" />
              )}
              {status.corrosionLevel > 50 && (
                <EventItem type="warning" time="10:40:15" msg="端子腐蚀程度超过 50% 阈值" />
              )}
              <EventItem type="info" time="10:30:00" msg="视觉识别算法完成环境光线补偿" />
              <EventItem type="info" time="10:00:00" msg="系统例行自检：所有传感器在线" />
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
    orange: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
    green: 'text-green-400 border-green-500/30 bg-green-500/5',
    yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
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
          {trend === 'up' ? '▲ 异常上升' : trend === 'down' ? '▼ 异常下降' : '● 稳定'}
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

const EventItem = ({ type, time, msg }: any) => {
  const colors: any = {
    critical: 'text-red-400 border-red-500/20 bg-red-500/5',
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

export default BatteryCorrosionView;
