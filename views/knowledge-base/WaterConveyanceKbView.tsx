
import React, { useState } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LineChart, Line
} from 'recharts';
import { 
  Database, Activity, Search, AlertTriangle, 
  FileText, CheckSquare, Settings, ArrowRight,
  Waves, Ruler, Info, BookOpen, GitCommit,
  ArrowDownToLine, MousePointerClick
} from 'lucide-react';

// --- Types ---
type SectionId = 'intake' | 'tunnel' | 'surge-tank' | 'penstock' | 'valve' | 'tailrace';

interface SectionKnowledge {
  id: SectionId;
  title: string;
  enTitle: string;
  desc: string;
  specs: { label: string; value: string; unit: string }[];
  risks: { title: string; level: 'High' | 'Med' | 'Low'; desc: string }[];
  maintenance: { task: string; cycle: string; standard: string }[];
}

// --- Mock Data ---

const SECTIONS: Record<SectionId, SectionKnowledge> = {
  'intake': {
    id: 'intake',
    title: '进水口 (Intake)',
    enTitle: 'Upper Reservoir Intake',
    desc: '位于上水库的取水设施，设有拦污栅和检修闸门。设计需保证在最低运行水位下不产生有害的吸气旋涡。',
    specs: [
      { label: '底坎高程', value: '820.0', unit: 'm' },
      { label: '进水流量', value: '120.0', unit: 'm³/s' },
      { label: '拦污栅距', value: '50', unit: 'mm' },
      { label: '闸门尺寸', value: '6.0 x 8.0', unit: 'm' },
    ],
    risks: [
      { title: '吸气旋涡', level: 'High', desc: '低水位大流量运行时可能吸入空气，引起机组振动。' },
      { title: '拦污栅堵塞', level: 'Med', desc: '压差过大导致栅体变形或破损。' },
    ],
    maintenance: [
      { task: '拦污栅压差监测', cycle: '实时', standard: 'ΔP < 2.0 m' },
      { task: '闸门启闭试验', cycle: '每月', standard: '动作平稳无卡阻' },
    ]
  },
  'tunnel': {
    id: 'tunnel',
    title: '引水隧洞 (Headrace Tunnel)',
    enTitle: 'Concrete Lined Tunnel',
    desc: '连接进水口与调压井的低压输水通道。通常采用钢筋混凝土衬砌，穿越山体地质结构。',
    specs: [
      { label: '隧洞长度', value: '2450', unit: 'm' },
      { label: '内径', value: '8.5', unit: 'm' },
      { label: '纵坡', value: '3.5', unit: '%' },
      { label: '设计流速', value: '2.5', unit: 'm/s' },
    ],
    risks: [
      { title: '衬砌裂缝', level: 'Med', desc: '围岩变形或内水压力过高导致混凝土开裂渗漏。' },
      { title: '泥沙淤积', level: 'Low', desc: '长期运行可能在底部产生淤积，增加糙率。' },
    ],
    maintenance: [
      { task: '放空检查', cycle: '5年', standard: '无结构性裂缝，无严重剥蚀' },
      { task: '渗漏水量监测', cycle: '每周', standard: '量水堰读数稳定' },
    ]
  },
  'surge-tank': {
    id: 'surge-tank',
    title: '调压井 (Surge Tank)',
    enTitle: 'Hydraulic Surge Chamber',
    desc: '位于引水隧洞末端，用于反射水击波，减小压力管道的水锤压力，改善机组调节保证计算条件。',
    specs: [
      { label: '井筒直径', value: '22.0', unit: 'm' },
      { label: '最高涌浪', value: '895.5', unit: 'm' },
      { label: '最低涌浪', value: '805.2', unit: 'm' },
      { label: '阻抗孔径', value: '3.2', unit: 'm' },
    ],
    risks: [
      { title: '涌浪叠加', level: 'High', desc: '连续负荷变化可能导致涌浪叠加溢井或空气吸入。' },
      { title: '结构稳定性', level: 'Med', desc: '高水位差作用下的井壁应力集中。' },
    ],
    maintenance: [
      { task: '水位计校准', cycle: '半年', standard: '误差 < 1cm' },
      { task: '通气孔检查', cycle: '每月', standard: '无异物堵塞' },
    ]
  },
  'penstock': {
    id: 'penstock',
    title: '高压压力钢管 (Penstock)',
    enTitle: 'Steel Lined Penstock',
    desc: '承受极高内水压力的输水管道，连接调压井与厂房水轮机。通常采用高强钢制造，外包混凝土。',
    specs: [
      { label: '主管直径', value: '4.2', unit: 'm' },
      { label: '最大静水头', value: '540', unit: 'm' },
      { label: '钢板厚度', value: '24-56', unit: 'mm' },
      { label: '钢材牌号', value: '600MPa级', unit: '' },
    ],
    risks: [
      { title: '焊缝缺陷', level: 'High', desc: '疲劳载荷可能导致焊接缺陷扩展。' },
      { title: '钢管外稳', level: 'High', desc: '放空时若排水不畅可能导致钢管失稳压屈。' },
    ],
    maintenance: [
      { task: '焊缝超声探伤', cycle: '10年', standard: '无超标缺陷' },
      { task: '伸缩节检查', cycle: '每年', standard: '无渗漏，位移正常' },
    ]
  },
  'valve': {
    id: 'valve',
    title: '进水主阀 (Main Inlet Valve)',
    enTitle: 'Spherical Valve',
    desc: '位于水轮机蜗壳前的快速截断装置，通常采用球阀。在机组检修或事故时紧急切断水流。',
    specs: [
      { label: '阀门通径', value: '2500', unit: 'mm' },
      { label: '设计压力', value: '6.4', unit: 'MPa' },
      { label: '关闭时间', value: '60', unit: 's' },
      { label: '操作方式', value: '油压驱动', unit: '' },
    ],
    risks: [
      { title: '密封失效', level: 'Med', desc: '工作密封投入不到位导致漏水。' },
      { title: '拒动', level: 'High', desc: '接力器故障或控制系统失灵导致无法关闭。' },
    ],
    maintenance: [
      { task: '动水关闭试验', cycle: '大修', standard: '能在额定流量下可靠关闭' },
      { task: '密封环更换', cycle: '5年', standard: '橡胶无老化破损' },
    ]
  },
  'tailrace': {
    id: 'tailrace',
    title: '尾水系统 (Tailrace)',
    enTitle: 'Draft Tube & Tunnel',
    desc: '包括尾水管、尾水调压室及尾水隧洞。回收转轮出口动能，并将水流平稳排向下游。',
    specs: [
      { label: '尾水管型式', value: '肘管式', unit: '' },
      { label: '出口高程', value: '305.0', unit: 'm' },
      { label: '隧洞长度', value: '850', unit: 'm' },
      { label: '闸门数量', value: '2', unit: '扇' },
    ],
    risks: [
      { title: '尾水管压力脉动', level: 'Med', desc: '部分负荷工况下涡带引起的低频压力脉动。' },
      { title: '倒灌风险', level: 'Med', desc: '检修排水泵故障导致厂房倒灌。' },
    ],
    maintenance: [
      { task: '尾水管补气阀检查', cycle: '每月', standard: '动作灵活' },
      { task: '流道混凝土检查', cycle: '3年', standard: '无气蚀剥落' },
    ]
  }
};

// Water Hammer Simulation Data (Pressure Transient)
const TRANSIENT_DATA = Array.from({length: 60}, (_, i) => {
  // Damped oscillation simulation
  const t = i * 0.5; // seconds
  const damping = Math.exp(-0.05 * t);
  const pressure = 540 + 150 * Math.sin(0.5 * t) * damping; // Oscillate around 540m
  return { time: t.toFixed(1), pressure: pressure };
});

// --- Sub-Components ---

const WaterwaySchematic = ({ activeId, onSelect }: { activeId: string, onSelect: (id: SectionId) => void }) => {
  return (
    <div className="w-full h-full relative bg-[#0a0f18] rounded-lg overflow-hidden select-none border border-cyan-900/30">
        {/* Background Grid */}
        <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.15
        }}></div>

        <svg viewBox="0 0 1000 300" className="w-full h-full relative z-10">
            <defs>
                <linearGradient id="waterFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8"/>
                </linearGradient>
                <filter id="glowSelect">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* --- Topography (simplified) --- */}
            <path d="M0,80 L200,80 L250,50 L400,100 L550,250 L800,250 L1000,280 L1000,300 L0,300 Z" fill="#1e293b" stroke="none" opacity="0.5" />

            {/* --- Waterway Components --- */}

            {/* 1. Intake */}
            <g onClick={() => onSelect('intake')} className="cursor-pointer group">
                <path d="M50,80 L150,80 L150,120 L120,120 L50,100 Z" fill="url(#waterFill)" />
                <rect x="140" y="70" width="20" height="60" fill="#334155" stroke="#94a3b8" />
                <text x="100" y="60" fill={activeId === 'intake' ? '#0ea5e9' : '#64748b'} fontSize="12" fontWeight="bold" textAnchor="middle">进水口</text>
                {activeId === 'intake' && <rect x="135" y="65" width="30" height="70" fill="none" stroke="#0ea5e9" strokeWidth="2" rx="4" filter="url(#glowSelect)" />}
            </g>

            {/* 2. Headrace Tunnel */}
            <g onClick={() => onSelect('tunnel')} className="cursor-pointer group">
                <rect x="150" y="110" width="350" height="20" fill="url(#waterFill)" />
                <line x1="150" y1="110" x2="500" y2="110" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />
                <line x1="150" y1="130" x2="500" y2="130" stroke="#cbd5e1" strokeWidth="2" />
                <text x="325" y="100" fill={activeId === 'tunnel' ? '#0ea5e9' : '#64748b'} fontSize="12" fontWeight="bold" textAnchor="middle">引水隧洞</text>
                {activeId === 'tunnel' && <rect x="150" y="105" width="350" height="30" fill="none" stroke="#0ea5e9" strokeWidth="2" rx="4" filter="url(#glowSelect)" />}
            </g>

            {/* 3. Surge Tank */}
            <g onClick={() => onSelect('surge-tank')} className="cursor-pointer group">
                <rect x="480" y="40" width="40" height="90" fill="url(#waterFill)" />
                <path d="M480,40 L480,130 M520,40 L520,130" stroke="#94a3b8" strokeWidth="2" />
                {/* Oscillating water level animation */}
                <rect x="480" y="60" width="40" height="2" fill="#fff" className="animate-pulse" />
                <text x="500" y="30" fill={activeId === 'surge-tank' ? '#0ea5e9' : '#64748b'} fontSize="12" fontWeight="bold" textAnchor="middle">调压井</text>
                {activeId === 'surge-tank' && <rect x="475" y="35" width="50" height="100" fill="none" stroke="#0ea5e9" strokeWidth="2" rx="4" filter="url(#glowSelect)" />}
            </g>

            {/* 4. Penstock */}
            <g onClick={() => onSelect('penstock')} className="cursor-pointer group">
                <path d="M500,130 L700,250" stroke="url(#waterFill)" strokeWidth="15" fill="none" />
                <path d="M500,130 L700,250" stroke="#cbd5e1" strokeWidth="15" fill="none" opacity="0.2" />
                <text x="600" y="180" fill={activeId === 'penstock' ? '#0ea5e9' : '#64748b'} fontSize="12" fontWeight="bold">压力钢管</text>
                {activeId === 'penstock' && <line x1="500" y1="130" x2="700" y2="250" stroke="#0ea5e9" strokeWidth="18" strokeOpacity="0.4" filter="url(#glowSelect)" />}
            </g>

            {/* 5. Valve & Powerhouse */}
            <g onClick={() => onSelect('valve')} className="cursor-pointer group">
                <rect x="690" y="240" width="20" height="20" fill="#ef4444" rx="2" />
                <text x="700" y="230" fill={activeId === 'valve' ? '#ef4444' : '#64748b'} fontSize="12" fontWeight="bold" textAnchor="middle">主阀</text>
                {activeId === 'valve' && <rect x="685" y="235" width="30" height="30" fill="none" stroke="#ef4444" strokeWidth="2" rx="4" filter="url(#glowSelect)" />}
            </g>
            
            {/* Powerhouse Box */}
            <rect x="710" y="240" width="60" height="40" fill="#1e293b" stroke="#64748b" />
            <text x="740" y="265" fill="#fff" fontSize="10" textAnchor="middle">Powerhouse</text>

            {/* 6. Tailrace */}
            <g onClick={() => onSelect('tailrace')} className="cursor-pointer group">
                <path d="M770,260 L950,260" stroke="url(#waterFill)" strokeWidth="12" fill="none" />
                <text x="860" y="250" fill={activeId === 'tailrace' ? '#0ea5e9' : '#64748b'} fontSize="12" fontWeight="bold" textAnchor="middle">尾水系统</text>
                {activeId === 'tailrace' && <rect x="770" y="250" width="180" height="20" fill="none" stroke="#0ea5e9" strokeWidth="2" rx="4" filter="url(#glowSelect)" />}
            </g>

            {/* Interactive Hint */}
            <g transform="translate(20, 20)">
                <MousePointerClick size={16} className="text-cyan-500 animate-bounce" />
                <text x="20" y="12" fill="#94a3b8" fontSize="10">点击组件查看详情</text>
            </g>
        </svg>
    </div>
  );
};

export const WaterConveyanceKbView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('surge-tank');
  const [searchTerm, setSearchTerm] = useState('');

  const currentData = SECTIONS[activeSection];

  return (
    <div className="h-full flex flex-col gap-5 font-[Rajdhani] text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/50 pb-4 bg-gradient-to-r from-[#0e172a] to-transparent px-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 uppercase tracking-wider">
             <Database size={14} /> Infrastructure Knowledge
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             输水系统 <span className="text-cyan-500">智能知识库</span>
          </h1>
        </div>
        
        <div className="flex gap-4 items-center mt-4 md:mt-0">
            <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
               <input 
                 type="text" 
                 placeholder="Search system codes..." 
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* TOP: Interactive Pipeline Map */}
        <SciFiCard title="全系统纵剖面交互图 (Longitudinal Profile)" subtitle="INTERACTIVE NAVIGATION" className="h-[280px] border-cyan-900/50" noPadding>
            <div className="w-full h-full p-2">
                <WaterwaySchematic activeId={activeSection} onSelect={setActiveSection} />
            </div>
        </SciFiCard>

        {/* BOTTOM: Split Panels */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            {/* Left: Section Details & Parameters */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
                
                {/* Info Card */}
                <SciFiCard title="选定组件档案" subtitle="DETAILS" className="border-cyan-900/50">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold text-white">{currentData.title}</h2>
                            <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700">ID: {currentData.id.toUpperCase()}</span>
                        </div>
                        <div className="text-xs text-cyan-400 mb-2">{currentData.enTitle}</div>
                        <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded border border-slate-800">
                            {currentData.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {currentData.specs.map((spec, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded">
                                <span className="text-xs text-slate-500">{spec.label}</span>
                                <span className="text-sm font-bold text-slate-200 font-mono">{spec.value} <span className="text-[10px] font-normal text-slate-600">{spec.unit}</span></span>
                            </div>
                        ))}
                    </div>
                </SciFiCard>

                {/* Risk Radar */}
                <SciFiCard title="风险与预警" subtitle="RISK" className="flex-1 border-slate-800">
                    <div className="space-y-3">
                        {currentData.risks.map((risk, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-red-900/10 border border-red-900/30 rounded">
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-red-200">{risk.title}</span>
                                        <span className={`text-[10px] px-1.5 rounded font-bold ${risk.level === 'High' ? 'bg-red-500 text-black' : 'bg-yellow-500 text-black'}`}>
                                            {risk.level}
                                        </span>
                                    </div>
                                    <p className="text-xs text-red-200/70">{risk.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SciFiCard>

            </div>

            {/* Center: Knowledge Matrix & Maintenance */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
                
                {/* Maintenance Tasks */}
                <SciFiCard title="标准运维规程" subtitle="MAINTENANCE" className="border-cyan-900/50">
                    <div className="space-y-0.5">
                        {currentData.maintenance.map((task, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 border-b border-slate-800 last:border-0 hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <CheckSquare size={16} className="text-slate-500 group-hover:text-cyan-400" />
                                    <div>
                                        <div className="text-sm font-bold text-slate-300 group-hover:text-white">{task.task}</div>
                                        <div className="text-[10px] text-slate-500">周期: {task.cycle}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-500">标准</div>
                                    <div className="text-xs text-cyan-300 max-w-[120px] truncate" title={task.standard}>{task.standard}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2 bg-slate-800 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500/50 rounded text-xs text-slate-300 transition-colors flex items-center justify-center gap-2">
                            <FileText size={14} /> 检修工艺卡
                        </button>
                        <button className="flex-1 py-2 bg-slate-800 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500/50 rounded text-xs text-slate-300 transition-colors flex items-center justify-center gap-2">
                            <BookOpen size={14} /> 历史缺陷库
                        </button>
                    </div>
                </SciFiCard>

                {/* Additional Tools */}
                <SciFiCard title="工程计算辅助" className="flex-1 border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-cyan-500/50 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all">
                            <Ruler size={20} className="text-cyan-500" />
                            <span className="text-xs text-slate-300">水头损失计算</span>
                        </div>
                        <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-cyan-500/50 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all">
                            <Activity size={20} className="text-orange-500" />
                            <span className="text-xs text-slate-300">钢管应力校核</span>
                        </div>
                        <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-cyan-500/50 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all">
                            <Waves size={20} className="text-blue-500" />
                            <span className="text-xs text-slate-300">最高涌浪估算</span>
                        </div>
                        <div className="p-3 bg-slate-900/50 border border-slate-700 rounded hover:border-cyan-500/50 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all">
                            <Info size={20} className="text-green-500" />
                            <span className="text-xs text-slate-300">充水试验方案</span>
                        </div>
                    </div>
                </SciFiCard>

            </div>

            {/* Right: Transient Analysis Chart */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <SciFiCard title="水力过渡过程分析" subtitle="WATER HAMMER" className="h-full border-cyan-900/50">
                    <div className="flex flex-col h-full">
                        <div className="text-xs text-slate-400 mb-2 leading-relaxed">
                            <strong className="text-white">工况模拟：</strong> 满负荷甩负荷 (Load Rejection 100%)。
                            监测蜗壳进口及压力钢管末端的压力波动情况。
                        </div>
                        
                        <div className="flex-1 min-h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={TRANSIENT_DATA}>
                                    <defs>
                                        <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#666' }} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 10}} domain={[300, 800]} label={{ value: 'Head (m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#666' }} />
                                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#0ea5e9', color: '#fff'}} />
                                    <ReferenceLine y={540} stroke="#64748b" strokeDasharray="3 3" label={{value: 'Static', fill: '#64748b', fontSize: 10}} />
                                    <ReferenceLine y={690} stroke="#ef4444" strokeDasharray="3 3" label={{value: 'Max Limit', fill: '#ef4444', fontSize: 10}} />
                                    <Area type="monotone" dataKey="pressure" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorPressure)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-slate-400">Max Pressure Rise</span>
                                <span className="text-sm font-mono font-bold text-red-400">685.2 m (+27%)</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-red-500 h-full" style={{width: '85%'}}></div>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">Safety Margin: 15.0m to Design Limit</div>
                        </div>
                    </div>
                </SciFiCard>
            </div>

        </div>

      </div>
    </div>
  );
};
