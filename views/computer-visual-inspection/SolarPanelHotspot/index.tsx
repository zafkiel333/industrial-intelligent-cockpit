import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ThreeScene } from '@/components/computer-visual-inspection/SolarPanelHotspot/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '@/src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[cv-solar-panel]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/cv-solar-panel';
import { HotSpot, SolarFarmState } from '@/components/computer-visual-inspection/SolarPanelHotspot/three-types';
import { SciFiCard } from '@/components/SciFiCard';
import { 
  Sun, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Maximize2, 
  BarChart3,
  History,
  FileText,
  Settings,
  CloudSun,
  Battery
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const MOCK_HOTSPOTS: HotSpot[] = [
  { id: '1', panelId: 'panel_1_2', position: [0, 0, 0], temperature: 78.5, severity: 'high' },
  { id: '2', panelId: 'panel_3_0', position: [0, 0, 0], temperature: 62.1, severity: 'medium' },
];

const POWER_HISTORY = [
  { time: '06:00', power: 120 },
  { time: '08:00', power: 450 },
  { time: '10:00', power: 850 },
  { time: '12:00', power: 1250 },
  { time: '14:00', power: 1150 },
  { time: '16:00', power: 750 },
  { time: '18:00', power: 250 },
];

const LOSS_DATA = [
  { name: '遮挡', value: 12.5 },
  { name: '热斑', value: 8.4 },
  { name: '灰尘', value: 5.2 },
  { name: '线路', value: 2.1 },
];

const SolarPanelHotspotView: React.FC = () => {
  const [state, setState] = useState<SolarFarmState>({
    totalPower: 1245.8,
    efficiency: 84.2,
    irradiance: 785.4
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyan-900/30 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600/20 border border-orange-500/40 rounded flex items-center justify-center">
            <Sun className="text-orange-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">光伏板表面遮挡与热斑识别系统</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-orange-400 font-mono flex items-center gap-1">
                <Battery size={12} /> SOLAR_FARM_ZONE_B
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">UAV Thermal Patrol Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">实时功率</div>
            <div className="text-xl font-black text-white">{state.totalPower} <span className="text-xs">kW</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-mono">光照强度</div>
            <div className="text-xl font-black text-yellow-500">{state.irradiance} <span className="text-xs">W/m²</span></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Thermal Recognition */}
        <div className="col-span-4 flex flex-col space-y-4">
          <SciFiCard title="无人机红外实时流" className="flex-1 relative overflow-hidden">
            <img 
              src="https://picsum.photos/seed/solar/800/600" 
              alt="Solar Thermal" 
              className="w-full h-full object-cover opacity-60 hue-rotate-180"
              referrerPolicy="no-referrer"
            />
            {/* Detection Overlays */}
            <div className="absolute top-1/4 left-1/3 w-24 h-24 border-2 border-red-500/60 bg-red-500/10 rounded-sm">
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-[8px] px-1 font-bold">HOTSPOT: 78.5°C</div>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-32 h-20 border-2 border-yellow-500/60 bg-yellow-500/10 rounded-sm">
              <div className="absolute -top-6 left-0 bg-yellow-500 text-white text-[8px] px-1 font-bold">OBSTRUCT: BIRD_DROPPING</div>
            </div>
            
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 px-2 py-1 rounded border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-slate-300">UAV_PATROL_ALT_15M</span>
            </div>
          </SciFiCard>

          <SciFiCard title="功率损耗构成 (%)">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LOSS_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                    {LOSS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>
        </div>

        {/* Center: 3D Twin */}
        <div className="col-span-5 relative">
          <SciFiCard title="光伏阵列数字孪生" className="h-full relative overflow-hidden">
            <div className="absolute inset-0">
              <ThreeScene hotSpots={MOCK_HOTSPOTS} />
              <div className="absolute bottom-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </div>
            
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-900 border border-slate-700 rounded hover:border-orange-500 transition-all">
                <Maximize2 size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/80 border border-slate-800 rounded backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 uppercase font-mono">阵列转换效率</span>
                <span className="text-sm font-black text-orange-500">{state.efficiency}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${state.efficiency}%` }}
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                />
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Right: Analysis & Maintenance */}
        <div className="col-span-3 flex flex-col space-y-4">
          <SciFiCard title="发电功率曲线">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={POWER_HISTORY}>
                  <defs>
                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="power" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPower)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiCard>

          <SciFiCard title="智能运维建议" className="flex-1">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-red-400">热斑效应预警</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Panel_1_2 发现严重热斑 (78.5°C)，推测为鸟粪遮挡导致的局部过热。长期运行可能导致背板烧穿。
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <div className="text-[10px] text-orange-400 font-bold mb-2 flex items-center gap-1">
                  <FileText size={12} /> 维护指令
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  1. 立即派遣自动清洗机器人前往 Zone B 进行针对性清洗。<br/>
                  2. 检查 Panel_1_2 的旁路二极管是否损坏。<br/>
                  3. 建议在下一维护周期更换老化严重的组件。
                </p>
              </div>

              <button className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                <Settings size={14} />
                启动清洗任务
              </button>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};

export default SolarPanelHotspotView;
