import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PowerTransformerMaintenance/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-65]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-65';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Droplets, ThermometerSun } from 'lucide-react';

export const PowerTransformerMaintenanceView: React.FC = () => {
  const [data, setData] = useState({
    oilLevel: 85, // %
    temperature: 65, // Celsius
    isDraining: false,
    isRefilling: false,
    oilQuality: 98, // %
    gasConcentration: 0.02 // %
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    interval = setInterval(() => {
      setData(prev => {
        let newOilLevel = prev.oilLevel;
        let newTemp = prev.temperature;

        if (prev.isDraining) {
          newOilLevel = Math.max(0, prev.oilLevel - 2);
          newTemp = Math.max(25, prev.temperature - 0.5); // Cools down as oil drains
        } else if (prev.isRefilling) {
          newOilLevel = Math.min(100, prev.oilLevel + 2);
          // Temperature might slightly rise during refill due to friction/pump
          newTemp = Math.min(40, prev.temperature + 0.1); 
        } else {
          // Normal operation simulation
          newTemp = 65 + Math.sin(Date.now() / 5000) * 5; // Fluctuate around 65C
        }

        // Auto-stop draining/refilling when limits reached
        const stopDraining = prev.isDraining && newOilLevel === 0;
        const stopRefilling = prev.isRefilling && newOilLevel === 100;

        return {
          ...prev,
          oilLevel: newOilLevel,
          temperature: newTemp,
          isDraining: stopDraining ? false : prev.isDraining,
          isRefilling: stopRefilling ? false : prev.isRefilling,
          // Simulate quality drop if temp gets too high
          oilQuality: newTemp > 80 ? Math.max(50, prev.oilQuality - 0.1) : prev.oilQuality
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleDrain = () => {
    setData(prev => {
      if (prev.isRefilling) return prev; // Prevent both
      return { ...prev, isDraining: !prev.isDraining };
    });
  };

  const handleRefill = () => {
    setData(prev => {
      if (prev.isDraining) return prev; // Prevent both
      return { ...prev, isRefilling: !prev.isRefilling };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani] flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-indigo-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 tracking-wider uppercase">
            主变压器绝缘油滤油及更换
          </h1>
          <p className="text-indigo-500/70 mt-2 font-mono text-sm">POWER TRANSFORMER OIL FILTRATION & REPLACEMENT</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDrain}
            disabled={data.isRefilling || data.oilLevel === 0}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isDraining 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Droplets size={18} className="rotate-180" />
            {data.isDraining ? '排油中...' : '启动排油程序'}
          </button>
          <button 
            onClick={handleRefill}
            disabled={data.isDraining || data.oilLevel === 100}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isRefilling 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Droplets size={18} />
            {data.isRefilling ? '注油滤油中...' : '启动真空注油'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left: Telemetry Data */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <SciFiCard title="变压器油色谱及状态监测" className="flex-1">
            <div className="flex flex-col h-full justify-around py-4">
              <div className="flex justify-between items-end border-b border-indigo-500/20 pb-2">
                <span className="text-slate-400 text-lg">储油柜油位</span>
                <span className={`text-5xl font-bold ${data.oilLevel < 20 ? 'text-red-500' : 'text-indigo-400'}`}>
                  {data.oilLevel.toFixed(0)} <span className="text-xl">%</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-indigo-500/20 pb-2">
                <span className="text-slate-400 text-lg">顶层油温</span>
                <span className={`text-4xl font-bold ${data.temperature > 85 ? 'text-red-500' : 'text-orange-400'}`}>
                  {data.temperature.toFixed(1)} <span className="text-xl">°C</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-indigo-500/20 pb-2">
                <span className="text-slate-400 text-lg">绝缘油击穿电压</span>
                <span className={`text-4xl font-bold ${data.oilQuality < 80 ? 'text-yellow-500' : 'text-green-400'}`}>
                  {(data.oilQuality * 0.6).toFixed(1)} <span className="text-xl">kV</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-indigo-500/20 pb-2">
                <span className="text-slate-400 text-lg">微水含量</span>
                <span className="text-4xl font-bold text-blue-400">
                  {((100 - data.oilQuality) * 0.5).toFixed(1)} <span className="text-xl">ppm</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-indigo-500/20 pb-2">
                <span className="text-slate-400 text-lg">总烃气体浓度</span>
                <span className="text-4xl font-bold text-purple-400">
                  {data.gasConcentration.toFixed(3)} <span className="text-xl">%</span>
                </span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="滤油作业流程" className="flex-1 overflow-y-auto">
            <TimelineWidget steps={[
              { time: 'Day 1', title: '变压器停电，挂接地线，办理工作票', status: 'done' },
              { time: 'Day 1', title: '连接滤油机及储油罐，开始排油', status: data.oilLevel === 0 ? 'done' : data.isDraining ? 'active' : 'pending' },
              { time: 'Day 2', title: '变压器器身检查，清理内部油泥', status: data.oilLevel === 0 && !data.isDraining && !data.isRefilling ? 'active' : 'pending' },
              { time: 'Day 3', title: '抽真空，真空度达到 133Pa 以下', status: data.isRefilling ? 'done' : 'pending' },
              { time: 'Day 4', title: '真空注油及热油循环过滤 (72小时)', status: data.isRefilling ? 'active' : data.oilLevel === 100 ? 'done' : 'pending' },
              { time: 'Day 7', title: '静置排气，取样进行色谱及耐压试验', status: data.oilLevel === 100 && !data.isRefilling ? 'active' : 'pending' }
            ]} />
          </SciFiCard>
        </div>

        {/* Right: 3D Scene & Widgets */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <SciFiCard title="主变压器 3D 状态监控" className="flex-1 relative min-h-[400px]">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <ThermometerSun size={14} className={data.temperature > 85 ? 'text-red-500' : 'text-indigo-500'} />
                <span className="text-xs text-slate-300">
                  状态: {data.isDraining ? '排油中' : data.isRefilling ? '真空滤油注油中' : '在线监测'}
                </span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 mt-12 border border-indigo-500/20 rounded-lg overflow-hidden bg-[#111827]">
              <ThreeScene 
                oilLevel={data.oilLevel} 
                temperature={data.temperature} 
                isDraining={data.isDraining} 
                isRefilling={data.isRefilling}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="检修物资及设备">
              <ResourceWidget resources={[
                { name: '双级真空滤油机 (9000L/h)', allocated: 1, total: 1, unit: '台' },
                { name: 'KI50X 新型变压器绝缘油', allocated: 45, total: 50, unit: '吨' },
                { name: '储油罐 (20m³)', allocated: 3, total: 3, unit: '个' },
                { name: '高压试验设备套件', allocated: 1, total: 1, unit: '套' }
              ]} />
            </SciFiCard>
            <SciFiCard title="高压电气作业风险">
              <RiskWidget risks={[
                { level: 'high', desc: '触电危险：作业前必须确认高低压侧均已断开并可靠接地，严禁带电作业。' },
                { level: 'high', desc: '火灾风险：绝缘油属易燃品，现场严禁烟火，必须配备干粉灭火器。' },
                { level: 'medium', desc: '缺氧窒息：进入变压器内部检查前，必须进行通风并检测氧气浓度。' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
