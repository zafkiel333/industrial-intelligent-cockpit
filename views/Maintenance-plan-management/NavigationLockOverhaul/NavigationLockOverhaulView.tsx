import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/NavigationLockOverhaul/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-7]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-7';
import { Calendar, Wrench, Ship, Anchor, AlertTriangle, CheckCircle, Waves, Clock } from 'lucide-react';

export const NavigationLockOverhaulView: React.FC = () => {
  const [data, setData] = useState({
    waterLevel: 45.5, // meters
    upstreamLevel: 65.0,
    downstreamLevel: 30.0,
    gateStatus: '开启' as '开启' | '关闭' | '检修中',
    maintenanceProgress: 0,
    waitingShips: 12
  });

  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data.gateStatus === '检修中') {
      interval = setInterval(() => {
        setData(prev => {
          if (prev.maintenanceProgress >= 100) {
            clearInterval(interval);
            return { 
              ...prev, 
              gateStatus: '关闭', 
              maintenanceProgress: 0,
              waterLevel: prev.downstreamLevel
            };
          }
          return { 
            ...prev, 
            maintenanceProgress: prev.maintenanceProgress + 0.8,
            waterLevel: Math.max(0, prev.waterLevel - 0.5) // Drain lock during maintenance
          };
        });
      }, 500);
    } else if (data.gateStatus === '开启' || data.gateStatus === '关闭') {
      interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          waitingShips: Math.max(0, prev.waitingShips + (Math.random() > 0.7 ? 1 : (Math.random() > 0.8 ? -1 : 0)))
        }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [data.gateStatus]);

  const handleStartMaintenance = () => {
    setData(prev => ({ ...prev, gateStatus: '检修中', maintenanceProgress: 0 }));
  };

  const handleCompleteMaintenance = () => {
    setData(prev => ({ ...prev, gateStatus: '关闭', waterLevel: prev.downstreamLevel }));
  };

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      <div className="bg-[#0b1221]/90 border border-slate-800 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded">
              <Ship size={32} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-widest uppercase italic">
                  通航船闸大修停航计划 <span className="text-indigo-500 text-xl not-italic tracking-normal">// LOCK_OVERHAUL</span>
              </h1>
              <div className="flex gap-6 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                 <span className="flex items-center gap-1"><Wrench size={12} className="text-indigo-500"/> 状态: {data.gateStatus}</span>
                 <span className="flex items-center gap-1"><Calendar size={12} className="text-indigo-500"/> 计划周期: 30天</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShow3D(!show3D)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm transition-colors"
          >
            {show3D ? '隐藏3D视图' : '显示3D视图'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {/* Top Row: 3D Model and Key Stats */}
        <div className="flex flex-col lg:flex-row gap-6 h-[50%]">
          <div className={`w-full lg:w-2/3 h-full transition-all duration-500 ${show3D ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
            <SciFiCard title="船闸大修三维仿真" className="h-full flex flex-col overflow-hidden border-indigo-800/30">
              {show3D && <ThreeScene
                    waterLevel={data.waterLevel}
                    gateStatus={data.gateStatus}
                    maintenanceProgress={data.maintenanceProgress}
                  />}
              <div className="absolute top-4 right-4 z-20">
                <ModelLibraryLink url={MODEL_LIB_URL} />
              </div>
            </SciFiCard>
          </div>

          <div className={`flex flex-col gap-6 transition-all duration-500 ${show3D ? 'w-full lg:w-1/3' : 'w-full'}`}>
            <SciFiCard title="水位与通航状态" className="flex-1 border-indigo-800/30">
              <div className="flex flex-col gap-4 justify-center h-full">
                <div className="bg-slate-900/50 p-4 rounded border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Waves size={24} className="text-cyan-500" />
                    <span className="text-lg">闸室水位</span>
                  </div>
                  <span className="font-mono text-3xl text-cyan-300">{data.waterLevel.toFixed(1)} m</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Ship size={24} className="text-emerald-500" />
                    <span className="text-lg">待闸船舶</span>
                  </div>
                  <span className={`font-mono text-3xl ${data.waitingShips > 20 ? 'text-red-400' : 'text-emerald-300'}`}>{data.waitingShips} 艘</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-slate-400">
                    {data.gateStatus === '检修中' ? <AlertTriangle size={24} className="text-amber-500" /> : <CheckCircle size={24} className="text-emerald-500" />}
                    <span className="text-lg">通航状态</span>
                  </div>
                  <span className={`font-bold text-xl ${data.gateStatus === '检修中' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {data.gateStatus === '检修中' ? '停航检修' : '正常通航'}
                  </span>
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        {/* Bottom Row: Controls and Schedule */}
        <div className="flex flex-col lg:flex-row gap-6 h-[50%]">
          <SciFiCard title="大修控制面板" className="w-full lg:w-1/2 border-indigo-800/30">
            <div className="flex flex-col h-full justify-between">
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>大修总进度</span>
                  <span className="font-mono text-lg text-indigo-300">{data.maintenanceProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-4 border border-slate-700">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500 relative overflow-hidden" style={{ width: `${data.maintenanceProgress}%` }}>
                    <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleStartMaintenance}
                  disabled={data.gateStatus === '检修中'}
                  className="flex-1 py-4 rounded bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/50 transition duration-300 flex items-center justify-center gap-2 text-amber-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  <Anchor size={20} /> 发布停航通告并开始大修
                </button>
                <button 
                  onClick={handleCompleteMaintenance}
                  disabled={data.gateStatus !== '检修中'}
                  className="flex-1 py-4 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 transition duration-300 flex items-center justify-center gap-2 text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  <Ship size={20} /> 大修完成，恢复通航
                </button>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="停航排程与项目" className="w-full lg:w-1/2 border-indigo-800/30">
            <div className="flex flex-col md:flex-row gap-6 h-full">
              <div className="flex-1 flex flex-col justify-center gap-4 border-r border-slate-700/50 pr-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400"><Clock size={16} className="text-amber-500" /> 计划停航</div>
                  <span className="font-mono text-slate-300">2024-10-01 08:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400"><Clock size={16} className="text-emerald-500" /> 预计复航</div>
                  <span className="font-mono text-slate-300">2024-10-31 18:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400"><Waves size={16} className="text-cyan-500" /> 上游水位</div>
                  <span className="font-mono text-cyan-300">{data.upstreamLevel.toFixed(2)} m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400"><Waves size={16} className="text-blue-500" /> 下游水位</div>
                  <span className="font-mono text-blue-300">{data.downstreamLevel.toFixed(2)} m</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                    <div className={`w-3 h-3 rounded-full ${data.maintenanceProgress > 10 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
                    闸室抽水及清淤
                  </li>
                  <li className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                    <div className={`w-3 h-3 rounded-full ${data.maintenanceProgress > 30 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
                    人字门底枢轴承更换
                  </li>
                  <li className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                    <div className={`w-3 h-3 rounded-full ${data.maintenanceProgress > 50 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
                    闸门止水橡皮全面更换
                  </li>
                  <li className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                    <div className={`w-3 h-3 rounded-full ${data.maintenanceProgress > 70 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
                    液压启闭机油缸大修
                  </li>
                  <li className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                    <div className={`w-3 h-3 rounded-full ${data.maintenanceProgress > 90 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
                    无水调试及充水试验
                  </li>
                </ul>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
