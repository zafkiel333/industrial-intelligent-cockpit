import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/TailingsDamReinforcement/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const TailingsDamReinforcementView: React.FC = () => {
  const [data, setData] = useState({
    progress: 35,
    seepageLevel: 45,
    isReinforcing: true,
    stabilityFactor: 1.15,
    settlement: 12.4,
    porePressure: 145
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isReinforcing) {
          return {
            ...prev,
            progress: Math.min(100, prev.progress + 0.5),
            seepageLevel: Math.max(10, prev.seepageLevel - 0.2),
            stabilityFactor: Math.min(1.5, prev.stabilityFactor + 0.01),
            settlement: prev.settlement + Math.random() * 0.1,
            porePressure: Math.max(100, prev.porePressure - 0.5)
          };
        }
        return {
          ...prev,
          seepageLevel: Math.min(80, prev.seepageLevel + 0.1),
          stabilityFactor: Math.max(1.0, prev.stabilityFactor - 0.005),
          settlement: prev.settlement + Math.random() * 0.05,
          porePressure: Math.min(200, prev.porePressure + 0.2)
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReinforce = () => {
    setData(prev => ({ ...prev, isReinforcing: !prev.isReinforcing }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            尾矿库坝体加固培厚计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">TAILINGS DAM REINFORCEMENT & THICKENING PLAN</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleReinforce}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isReinforcing 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {data.isReinforcing ? '暂停加固作业' : '恢复加固作业'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Hologram & Progress */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="坝体剖面 3D 演化模型" className="h-[550px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isReinforcing ? 'bg-cyan-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-xs text-slate-300">{data.isReinforcing ? '培厚作业中' : '作业暂停'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                progress={data.progress} 
                seepageLevel={data.seepageLevel} 
                isReinforcing={data.isReinforcing} 
              />
            </div>
            
            {/* Overlay Progress Bar */}
            <div className="absolute bottom-8 left-8 right-8 bg-slate-900/80 p-4 rounded border border-slate-700 backdrop-blur-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-cyan-400 font-bold">培厚工程总进度</span>
                <span className="text-cyan-400 font-mono">{data.progress.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '坝体安全系数 (Fs)', value: data.stabilityFactor.toFixed(2), unit: '', status: data.stabilityFactor < 1.15 ? 'critical' : data.stabilityFactor < 1.3 ? 'warning' : 'normal' },
              { label: '浸润线埋深', value: (100 - data.seepageLevel).toFixed(1), unit: 'm', status: data.seepageLevel > 60 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '坝顶沉降量', value: data.settlement.toFixed(1), unit: 'mm', status: data.settlement > 50 ? 'warning' : 'normal' },
              { label: '孔隙水压力', value: data.porePressure.toFixed(1), unit: 'kPa', status: data.porePressure > 180 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '干滩长度', value: '125.5', unit: 'm', status: 'normal' },
              { label: '库水位标高', value: '452.3', unit: 'm', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Analysis & Resources */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="安全系数演变趋势" className="h-[250px]">
            <ChartWidget 
              type="line" 
              data={[
                { name: '加固前', value: 1.05 }, { name: '一期', value: 1.12 }, 
                { name: '二期', value: 1.18 }, { name: '三期', value: 1.25 }, 
                { name: '当前', value: data.stabilityFactor }, { name: '目标', value: 1.35 }
              ]} 
              color="#00ffcc"
            />
          </SciFiCard>

          <SciFiCard title="施工资源调配" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '推土机/压路机', allocated: 8, total: 10, unit: '台' },
              { name: '自卸卡车', allocated: 25, total: 30, unit: '辆' },
              { name: '土工布铺设组', allocated: 2, total: 2, unit: '组' },
              { name: '安全监测人员', allocated: 4, total: 4, unit: '人' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '暴雨预警：需加强排洪设施巡查' },
              { level: 'medium', desc: '局部渗漏异常：已安排注浆封堵' },
              { level: 'low', desc: '施工车辆扬尘：增加洒水频次' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
