import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Settings, 
  Eye, 
  BarChart3, 
  ShieldCheck,
  Zap,
  RefreshCcw,
  History,
  Cpu,
  Maximize2,
  Search,
  ShieldAlert,
  Navigation,
  Clock,
  Trash2,
  Shield,
  Lock,
  UserCheck,
  UserX,
  Construction,
  Hammer,
  Wrench,
  Radio,
  Wifi,
  Signal,
  AlertCircle,
  Scan,
  Camera,
  Box,
  LayoutGrid,
  Database,
  EyeOff,
  Video,
  Bell,
  Fingerprint,
  Key,
  MapPin,
  Target
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/WarehouseSecurity/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-warehouse-security]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-warehouse-security';
import { SecurityStatus } from '../../../components/computer-visual-inspection/WarehouseSecurity/three-types';
import { SciFiCard } from '../../../components/SciFiCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  intrusions: Math.floor(Math.random() * 5),
  movements: Math.floor(Math.random() * 10),
  threat: 10 + Math.random() * 40
}));

const mockPieData = [
  { name: '人员入侵', value: 45, color: '#ef4444' },
  { name: '物资移动', value: 35, color: '#3b82f6' },
  { name: '车辆异常', value: 20, color: '#f59e0b' }
];

const WarehouseSecurity: React.FC = () => {
  const [status, setStatus] = useState<SecurityStatus>({
    intrusionCount: 0,
    unauthorizedMovements: 2,
    securityLevel: 'medium',
    activeSensors: 124,
    lastEventTime: '2026-03-31 10:00:00',
    detectedObjects: [
      { type: 'person', x: -10, y: 0, z: 5 },
      { type: 'object', x: 5, y: 0, z: -8 }
    ]
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const intrusionCount = Math.floor(Math.random() * 3);
        const unauthorizedMovements = Math.floor(Math.random() * 10);
        const securityLevel = intrusionCount > 1 ? 'critical' : unauthorizedMovements > 5 ? 'high' : 'medium';
        
        const detectedObjects = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => ({
          type: Math.random() > 0.5 ? 'person' : 'object' as any,
          x: (Math.random() - 0.5) * 25,
          y: 0,
          z: (Math.random() - 0.5) * 25
        }));

        return {
          ...prev,
          intrusionCount,
          unauthorizedMovements,
          securityLevel,
          detectedObjects,
          lastEventTime: new Date().toLocaleString()
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-red-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-red-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
              仓库周界入侵与物资移动监测
            </h1>
            <p className="text-red-500/60 text-sm font-mono uppercase tracking-widest">
              Warehouse Perimeter & Assets Security Monitoring
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-red-500/50 uppercase font-mono">当前威胁等级</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.securityLevel === 'critical' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : status.securityLevel === 'high' ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.securityLevel === 'critical' ? 'text-red-400' : status.securityLevel === 'high' ? 'text-orange-400' : 'text-emerald-400'}`}>
                {status.securityLevel.toUpperCase()}
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Left Column: 3D Visualization */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <SciFiCard className="h-[600px] relative overflow-hidden group">
            {/* 3D Scene Overlay */}
            <div className="absolute top-6 left-6 z-10 space-y-2">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                <h3 className="text-xs font-mono text-red-500/70 uppercase mb-3 tracking-wider">周界数字孪生</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">活跃传感器</span>
                    <span className="text-lg font-mono text-white">{status.activeSensors} <span className="text-xs text-slate-500">NODES</span></span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">检测目标</span>
                    <span className="text-lg font-mono text-white">{status.detectedObjects.length} <span className="text-xs text-slate-500">OBJECTS</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <div className="flex gap-2">
                {['realtime', 'analysis', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      activeTab === tab 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '威胁分析' : '历史趋势'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-red-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <Target className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-red-500/50 uppercase font-mono tracking-widest">入侵次数 (24h)</div>
                    <div className="text-xl font-bold text-white">{status.intrusionCount} <span className="text-xs font-normal text-slate-500">EVENTS</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Box className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">非法物资移动</div>
                    <div className="text-xl font-bold text-white">{status.unauthorizedMovements} <span className="text-xs font-normal text-slate-500">ITEMS</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Scan className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">SEC-SCAN ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-400" />
                  威胁指数波动
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-red-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Area type="monotone" dataKey="threat" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreat)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  异常事件分布
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              <div className="h-48 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mockPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 ml-4">
                  {mockPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-slate-400 font-mono">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Stats & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Real-time Metrics */}
          <SciFiCard className="p-6">
            <h3 className="text-sm font-mono text-red-500/50 uppercase tracking-widest mb-6">核心安防指标</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: '周界入侵', value: status.intrusionCount, unit: '次', icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: '物资异动', value: status.unauthorizedMovements, unit: '件', icon: Box, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '活跃探头', value: status.activeSensors, unit: '个', icon: Video, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: '最后预警', value: status.lastEventTime.split(' ')[1], unit: '', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                      <div className="text-xl font-bold font-mono">{item.value} <span className="text-xs font-normal text-slate-500">{item.unit}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* AI Diagnostic */}
          <SciFiCard className="p-6 bg-gradient-to-br from-[#0f172a] to-[#020617]">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold">智能威胁诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.securityLevel === 'critical' ? 'bg-red-500/5 border-red-500/20' : status.securityLevel === 'high' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.securityLevel === 'critical' ? 'text-red-400' : status.securityLevel === 'high' ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {status.securityLevel === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.securityLevel === 'critical' ? '检测到高危入侵' : status.securityLevel === 'high' ? '发现物资异常移动' : '周界安防稳固'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.securityLevel === 'critical' 
                    ? '视觉AI识别到周界围栏有攀爬及剪断行为，且有不明身份人员进入核心库区。请立即启动二级响应，通知安保人员拦截。' 
                    : status.securityLevel === 'high' 
                    ? '检测到非作业时间内库区物资发生位移，且未匹配到授权作业单据。疑似发生物资盗窃行为，请锁定相关监控画面。' 
                    : '周界围栏完整，各监控点位运行正常。未发现非法入侵及物资异动迹象，库区处于安全受控状态。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">安全建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>{status.intrusionCount > 0 ? '加强夜间红外补光，增加无人机巡检频次' : '定期测试周界电子围栏灵敏度'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>{status.unauthorizedMovements > 0 ? '对高价值物资区域进行二次加锁' : '核对物资出入库RFID记录'}</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Recent Alerts */}
          <SciFiCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                实时告警日志
              </h3>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                {status.securityLevel !== 'medium' ? '1 NEW' : '0 NEW'}
              </span>
            </div>
            
            <div className="space-y-3">
              {status.securityLevel !== 'medium' ? (
                <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs text-slate-300">
                      {status.securityLevel === 'critical' ? '周界围栏破坏告警' : '物资非法位移预警'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Critical</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic text-center py-4">
                  暂无异常预警记录
                </div>
              )}
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default WarehouseSecurity;
