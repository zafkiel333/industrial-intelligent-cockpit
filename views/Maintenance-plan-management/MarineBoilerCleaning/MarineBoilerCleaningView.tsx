import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/MarineBoilerCleaning/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-57]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-57';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Flame, Droplets } from 'lucide-react';

export const MarineBoilerCleaningView: React.FC = () => {
  const [data, setData] = useState({
    pressure: 8.5,
    temperature: 180,
    isCleaning: false,
    phValue: 9.5,
    scaleThickness: 2.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isCleaning) {
          return {
            ...prev,
            pressure: 1.5 + (Math.random() - 0.5) * 0.2, // Low pressure during cleaning
            temperature: 65 + (Math.random() - 0.5) * 2, // Cleaning temp
            phValue: 3.5 + (Math.random() - 0.5) * 0.5, // Acidic cleaning solution
            scaleThickness: Math.max(0, prev.scaleThickness - 0.1) // Scale dissolving
          };
        }
        return {
          ...prev,
          pressure: 8.5 + (Math.random() - 0.5) * 0.5,
          temperature: 180 + (Math.random() - 0.5) * 5,
          phValue: 9.5 + (Math.random() - 0.5) * 0.2,
          scaleThickness: Math.min(5, prev.scaleThickness + 0.01)
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleClean = () => {
    setData(prev => ({ ...prev, isCleaning: !prev.isCleaning }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-6 flex justify-between items-end border-b border-rose-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600 tracking-wider uppercase">
            船用辅锅炉化学清洗排期
          </h1>
          <p className="text-rose-500/70 mt-2 font-mono text-sm">MARINE AUXILIARY BOILER CHEMICAL CLEANING</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleClean}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isCleaning 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {data.isCleaning ? <Droplets size={18} /> : <Flame size={18} />}
            {data.isCleaning ? '化学酸洗循环中' : '启动化学清洗程序'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        <SciFiCard title="锅炉内部 3D 状态监控" className="lg:col-span-7 h-full relative">
          <div className="absolute inset-0 m-4 border border-rose-500/20 rounded-lg overflow-hidden bg-[#1a0a0a]">
            <ThreeScene
              pressure={data.pressure}
              temperature={data.temperature}
              isCleaning={data.isCleaning}
            />
          </div>
          <div className="absolute top-4 right-4 z-20">
            <ModelLibraryLink url={MODEL_LIB_URL} />
          </div>
        </SciFiCard>

        <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className={`bg-slate-900/80 p-4 rounded-lg border flex flex-col justify-center items-center text-center transition-colors ${data.isCleaning ? 'border-yellow-500/30' : 'border-rose-500/30'}`}>
              <span className="text-slate-400 text-sm">蒸汽压力</span>
              <span className={`text-3xl font-bold ${data.isCleaning ? 'text-yellow-500' : 'text-rose-500'}`}>
                {data.pressure.toFixed(2)} <span className="text-sm">bar</span>
              </span>
            </div>
            <div className={`bg-slate-900/80 p-4 rounded-lg border flex flex-col justify-center items-center text-center transition-colors ${data.isCleaning ? 'border-yellow-500/30' : 'border-rose-500/30'}`}>
              <span className="text-slate-400 text-sm">炉水/药液温度</span>
              <span className={`text-3xl font-bold ${data.temperature > 150 ? 'text-red-500' : data.isCleaning ? 'text-yellow-500' : 'text-rose-500'}`}>
                {data.temperature.toFixed(1)} <span className="text-sm">°C</span>
              </span>
            </div>
            <div className={`bg-slate-900/80 p-4 rounded-lg border flex flex-col justify-center items-center text-center transition-colors ${data.isCleaning ? 'border-yellow-500/30' : 'border-rose-500/30'}`}>
              <span className="text-slate-400 text-sm">系统 pH 值</span>
              <span className={`text-3xl font-bold ${data.phValue < 7 && !data.isCleaning ? 'text-red-500' : data.isCleaning ? 'text-yellow-500' : 'text-emerald-500'}`}>
                {data.phValue.toFixed(2)}
              </span>
            </div>
            <div className={`bg-slate-900/80 p-4 rounded-lg border flex flex-col justify-center items-center text-center transition-colors ${data.isCleaning ? 'border-yellow-500/30' : 'border-rose-500/30'}`}>
              <span className="text-slate-400 text-sm">结垢厚度评估</span>
              <span className={`text-3xl font-bold ${data.scaleThickness > 2.0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {data.scaleThickness.toFixed(2)} <span className="text-sm">mm</span>
              </span>
            </div>
          </div>

          <SciFiCard title="化学清洗标准作业程序" className="flex-1">
            <TimelineWidget steps={[
              { time: '08:00', title: '停炉冷却，排空炉水，安装临时清洗管路', status: 'done' },
              { time: '10:00', title: '水压检漏，注入清水进行系统冷态循环', status: 'active' },
              { time: '11:30', title: '加入缓蚀剂及酸洗液，升温至65°C循环', status: 'pending' },
              { time: '14:00', title: '监测酸液浓度及铁离子含量，直至稳定', status: 'pending' },
              { time: '16:00', title: '排空酸液，大量清水冲洗至pH值中性', status: 'pending' },
              { time: '18:00', title: '加入钝化液进行表面钝化处理，恢复管路', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="清洗药剂与设备" className="flex-none">
            <ResourceWidget resources={[
              { name: '氨基磺酸除垢剂', allocated: 200, total: 200, unit: 'kg' },
              { name: '金属专用缓蚀剂', allocated: 15, total: 15, unit: 'L' },
              { name: '耐酸循环泵', allocated: 1, total: 1, unit: '台' },
              { name: '化学清洗工程师', allocated: 2, total: 2, unit: '人' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
