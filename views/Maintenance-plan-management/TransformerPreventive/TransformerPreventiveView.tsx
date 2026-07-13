import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/TransformerPreventive/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-4]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-4';
import { Calendar, Wrench, Activity, AlertTriangle, CheckCircle, Zap, Thermometer, Droplet, ShieldAlert, Play } from 'lucide-react';

export const TransformerPreventiveView: React.FC = () => {
  const [data, setData] = useState({
    oilTemperature: 65,
    gasConcentration: 0.02,
    moistureContent: 15,
    partialDischarge: 120,
    status: '正常' as '正常' | '预警' | '检修中',
    maintenanceProgress: 0
  });

  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data.status === '正常' || data.status === '预警') {
      interval = setInterval(() => {
        setData(prev => {
          const newTemp = prev.oilTemperature + (Math.random() * 2 - 1);
          const newStatus = newTemp > 75 ? '预警' : '正常';
          return {
            ...prev,
            oilTemperature: Math.max(40, Math.min(90, newTemp)),
            gasConcentration: Math.max(0, Math.min(0.1, prev.gasConcentration + (Math.random() * 0.002 - 0.001))),
            moistureContent: Math.max(5, Math.min(30, prev.moistureContent + (Math.random() * 0.5 - 0.25))),
            partialDischarge: Math.max(50, Math.min(300, prev.partialDischarge + (Math.random() * 10 - 5))),
            status: newStatus
          };
        });
      }, 2000);
    } else if (data.status === '检修中') {
      interval = setInterval(() => {
        setData(prev => {
          if (prev.maintenanceProgress >= 100) {
            clearInterval(interval);
            return { ...prev, status: '正常', maintenanceProgress: 0, oilTemperature: 50, gasConcentration: 0.01, moistureContent: 10, partialDischarge: 60 };
          }
          return { ...prev, maintenanceProgress: prev.maintenanceProgress + 2 };
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [data.status]);

  const handleStartMaintenance = () => {
    setData(prev => ({ ...prev, status: '检修中', maintenanceProgress: 0 }));
  };

  const handleStopMaintenance = () => {
    setData(prev => ({ ...prev, status: '正常', maintenanceProgress: 0 }));
  };

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      <div className="bg-[#0b1221]/90 border border-slate-800 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
              <Zap size={32} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-widest uppercase italic">
                  主变压器预防性检修 <span className="text-cyan-500 text-xl not-italic tracking-normal">// PREVENTIVE_MAINTENANCE</span>
              </h1>
              <div className="flex gap-6 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                 <span className="flex items-center gap-1"><Wrench size={12} className="text-cyan-500"/> 状态: {data.status}</span>
                 <span className="flex items-center gap-1"><Calendar size={12} className="text-cyan-500"/> 计划周期: 12个月</span>
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

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel: 3D Visualization */}
        <div className={`w-full lg:w-1/3 h-full transition-all duration-500 ${show3D ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <SciFiCard title="主变压器内部结构与热场模型" className="h-full flex flex-col overflow-hidden border-indigo-800/30">
            {show3D && <ThreeScene
                  oilTemperature={data.oilTemperature}
                  status={data.status}
                  maintenanceProgress={data.maintenanceProgress}
                />}
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>

        {/* Right Panel: Data & Controls */}
        <div className={`flex flex-col gap-6 transition-all duration-500 ${show3D ? 'w-full lg:w-2/3' : 'w-full'}`}>
          <div className="flex flex-col lg:flex-row gap-6 flex-1">
            <SciFiCard title="DGA (油中溶解气体分析)" className="flex-1 border-indigo-800/30">
              <div className="grid grid-cols-2 gap-4 text-sm h-full content-start">
                <div className="flex flex-col gap-1 p-3 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="text-slate-400">总烃含量</div>
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-indigo-300 text-xl">{data.gasConcentration.toFixed(3)}</span>
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="text-slate-400">微水含量</div>
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-blue-300 text-xl">{data.moistureContent.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">mg/L</span>
                  </div>
                </div>
              </div>
            </SciFiCard>

            <SciFiCard title="电气与物理特性测试" className="flex-1 border-indigo-800/30">
              <div className="flex flex-col gap-4 text-sm h-full justify-center">
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400"><Thermometer size={18} className="text-amber-500" /> 顶层油温</div>
                  <span className="font-mono text-amber-300 text-lg">{data.oilTemperature.toFixed(1)} °C</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400"><Zap size={18} className="text-yellow-500" /> 局部放电量</div>
                  <span className="font-mono text-yellow-300 text-lg">{data.partialDischarge.toFixed(0)} pC</span>
                </div>
              </div>
            </SciFiCard>
          </div>

          <SciFiCard title="预防性试验控制" className="flex-shrink-0 border-indigo-800/30">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                 <div className="flex justify-between text-sm text-slate-400 mb-2">
                   <span>试验进度</span>
                   <span>{data.maintenanceProgress.toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-3">
                   <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${data.maintenanceProgress}%` }}></div>
                 </div>
              </div>
              <div className="flex gap-3 w-full lg:w-auto">
                <button onClick={handleStartMaintenance} className="flex-1 px-4 py-3 rounded bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-700/50 transition duration-300 flex items-center justify-center gap-2 text-indigo-200" disabled={data.status === '检修中'}>
                  <Play size={16} /> 开始试验
                </button>
                <button onClick={handleStopMaintenance} className="flex-1 px-4 py-3 rounded bg-green-900/40 hover:bg-green-800/60 border border-green-700/50 transition duration-300 flex items-center justify-center gap-2 text-green-200" disabled={data.status !== '检修中'}>
                  <CheckCircle size={16} /> 完成/重置
                </button>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
