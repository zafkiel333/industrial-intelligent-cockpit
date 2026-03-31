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
  UserCheck,
  UserX,
  Users,
  HardHat,
  ShieldAlert,
  Maximize2,
  Search,
  Layers,
  Map,
  Navigation,
  Clock,
  Trash2,
  Wind,
  Thermometer,
  Fingerprint,
  Camera,
  Scan
} from 'lucide-react';
import { ThreeScene } from '../../../components/computer-visual-inspection/PPECompliance/ThreeScene';
import { PPEStatus } from '../../../components/computer-visual-inspection/PPECompliance/three-types';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

const mockHistoryData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  compliance: 85 + Math.random() * 15,
  violations: Math.floor(Math.random() * 5)
}));

const mockPieData = [
  { name: '安全帽', value: 98, color: '#10b981' },
  { name: '反光背心', value: 95, color: '#3b82f6' },
  { name: '防护手套', value: 88, color: '#f59e0b' },
  { name: '安全鞋', value: 92, color: '#a855f7' }
];

const PPECompliance: React.FC = () => {
  const [status, setStatus] = useState<PPEStatus>({
    personnelCount: 42,
    complianceRate: 95.2,
    violations: 2,
    helmetDetected: true,
    vestDetected: true,
    glovesDetected: false,
    bootsDetected: true,
    isViolation: true,
    violationTypes: ['未佩戴防护手套']
  });

  const [activeTab, setActiveTab] = useState<'realtime' | 'analysis' | 'history'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const isViolation = Math.random() > 0.8;
        const violationTypes = isViolation ? (Math.random() > 0.5 ? ['未佩戴安全帽'] : ['未佩戴反光背心']) : [];
        const helmetDetected = !violationTypes.includes('未佩戴安全帽');
        const vestDetected = !violationTypes.includes('未佩戴反光背心');
        
        return {
          ...prev,
          personnelCount: 40 + Math.floor(Math.random() * 10),
          complianceRate: 90 + Math.random() * 10,
          violations: isViolation ? 1 : 0,
          helmetDetected,
          vestDetected,
          isViolation,
          violationTypes
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans selection:bg-emerald-500/30">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 border-b border-emerald-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <HardHat className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              个人防护装备佩戴合规性检测
            </h1>
            <p className="text-emerald-500/60 text-sm font-mono uppercase tracking-widest">
              PPE Compliance Detection System
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-emerald-500/50 uppercase font-mono">实时合规率</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.complianceRate < 90 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className={`font-bold text-2xl font-mono ${status.complianceRate < 90 ? 'text-red-400' : 'text-emerald-400'}`}>
                {status.complianceRate.toFixed(1)}%
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
                <h3 className="text-xs font-mono text-emerald-500/70 uppercase mb-3 tracking-wider">实时检测目标</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">当前人员 ID</span>
                    <span className="text-lg font-mono text-white">#STAFF-2026-0331</span>
                  </div>
                  <div className="flex justify-between items-center gap-8">
                    <span className="text-sm text-slate-400">检测状态</span>
                    <span className={`text-sm font-bold ${status.isViolation ? 'text-red-400' : 'text-emerald-400'}`}>
                      {status.isViolation ? '违规' : '合规'}
                    </span>
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
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'realtime' ? '实时监控' : tab === 'analysis' ? '合规分析' : '历史记录'}
                  </button>
                ))}
              </div>
            </div>

            <ThreeScene status={status} />

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
              <div className="flex gap-4">
                <div className="bg-black/60 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Scan className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-500/50 uppercase font-mono tracking-widest">视觉检测引擎</div>
                    <div className="text-xl font-bold text-white">AI <span className="text-xs font-normal text-slate-500">PPE-VISION v4.2</span></div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">场内总人数</div>
                    <div className="text-xl font-bold text-white">{status.personnelCount} <span className="text-xs font-normal text-slate-500">PERSONS</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex items-center gap-3">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">CAM-01 ACTIVE</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-2 gap-6">
            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  合规率趋势 (%)
                </h3>
                <RefreshCcw className="w-4 h-4 text-slate-500 cursor-pointer hover:text-emerald-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistoryData}>
                    <defs>
                      <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="compliance" stroke="#10b981" fillOpacity={1} fill="url(#colorCompliance)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SciFiCard>

            <SciFiCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  违规项分布
                </h3>
                <History className="w-4 h-4 text-slate-500 cursor-pointer hover:text-red-400 transition-colors" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Right Column: Stats & Alerts */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* PPE Checklist */}
          <SciFiCard className="p-6">
            <h3 className="text-sm font-mono text-emerald-500/50 uppercase tracking-widest mb-6">当前目标合规清单</h3>
            <div className="space-y-4">
              {[
                { label: '安全帽 (Helmet)', detected: status.helmetDetected, icon: HardHat },
                { label: '反光背心 (Vest)', detected: status.vestDetected, icon: ShieldCheck },
                { label: '防护手套 (Gloves)', detected: status.glovesDetected, icon: Fingerprint },
                { label: '安全鞋 (Boots)', detected: status.bootsDetected, icon: Navigation },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5`}>
                      <item.icon className={`w-5 h-5 ${item.detected ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                  </div>
                  {item.detected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </SciFiCard>

          {/* AI Diagnostic */}
          <SciFiCard className="p-6 bg-gradient-to-br from-[#0f172a] to-[#020617]">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">智能违规诊断</h3>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-xl ${status.isViolation ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex items-center gap-2 text-sm font-bold mb-2 ${status.isViolation ? 'text-red-400' : 'text-emerald-400'}`}>
                  {status.isViolation ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  诊断结果: {status.isViolation ? '发现违规佩戴' : '全项合规'}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {status.isViolation 
                    ? `检测到人员未按规定佩戴：${status.violationTypes.join('、')}。已自动记录违规行为并同步至安全管理平台。` 
                    : '当前检测目标个人防护装备佩戴完整，符合进入作业区标准。'}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">处置建议</h4>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{status.isViolation ? '触发语音播报提醒人员纠正' : '维持常态化视觉巡检'}</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{status.isViolation ? '记录违规人员信息及抓拍图片' : '定期更新PPE识别算法模型'}</span>
                </div>
              </div>
            </div>
          </SciFiCard>

          {/* Summary Stats */}
          <SciFiCard className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">今日总违规</div>
                <div className="text-2xl font-bold text-red-400">12</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">平均合规率</div>
                <div className="text-2xl font-bold text-emerald-400">97.8%</div>
              </div>
            </div>
          </SciFiCard>
        </div>
      </main>
    </div>
  );
};

export default PPECompliance;
