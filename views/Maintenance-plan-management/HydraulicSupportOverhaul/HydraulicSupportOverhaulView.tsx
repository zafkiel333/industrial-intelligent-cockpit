import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/HydraulicSupportOverhaul/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HydraulicSupportOverhaulView: React.FC = () => {
  const [data, setData] = useState({
    pressure: 31.5,
    height: 85,
    isOverhauling: true,
    leakRate: 0.2,
    valveStatus: '正常',
    cycleCount: 45000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isOverhauling) {
          return {
            ...prev,
            pressure: Math.max(0, prev.pressure - 2),
            height: Math.max(0, prev.height - 5),
            leakRate: 0,
            valveStatus: '检修中'
          };
        }
        return {
          ...prev,
          pressure: 31.5 + Math.random() * 2,
          height: 85 + Math.sin(Date.now() / 1000) * 5,
          leakRate: 0.2 + Math.random() * 0.1,
          valveStatus: '正常',
          cycleCount: prev.cycleCount + 1
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOverhaul = () => {
    setData(prev => ({ ...prev, isOverhauling: !prev.isOverhauling }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            液压支架大修计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">HYDRAULIC SUPPORT OVERHAUL PLAN</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleOverhaul}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isOverhauling 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isOverhauling ? '结束大修 (恢复支撑)' : '启动大修 (降柱卸压)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Hologram & Parameters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="液压支架 3D 结构解析" className="h-[550px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isOverhauling ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isOverhauling ? '大修拆解模式' : '工作面支撑模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                pressure={data.pressure} 
                height={data.height} 
                isOverhauling={data.isOverhauling} 
              />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '立柱工作阻力', value: data.pressure.toFixed(1), unit: 'MPa', status: data.pressure < 25 && !data.isOverhauling ? 'warning' : 'normal' },
              { label: '支护高度', value: data.height.toFixed(1), unit: '%', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '系统泄漏率', value: data.leakRate.toFixed(2), unit: 'L/min', status: data.leakRate > 0.5 ? 'critical' : 'normal' },
              { label: '控制阀组状态', value: data.valveStatus, unit: '', status: data.valveStatus === '正常' ? 'normal' : 'warning' }
            ]} />
            <ParameterWidget parameters={[
              { label: '累计循环次数', value: data.cycleCount.toString(), unit: '次', status: 'normal' },
              { label: '上次大修时间', value: '2022-05', unit: '', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Schedule, Resources & Risks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="大修作业流程" className="h-[300px]">
            <TimelineWidget steps={[
              { time: 'Day 1-2', title: '支架升井与清洗除锈', status: data.isOverhauling ? 'done' : 'pending' },
              { time: 'Day 3-5', title: '立柱千斤顶拆解探伤', status: data.isOverhauling ? 'active' : 'pending' },
              { time: 'Day 6-8', title: '密封件与阀组全面更换', status: 'pending' },
              { time: 'Day 9-10', title: '结构件焊接修复', status: 'pending' },
              { time: 'Day 11-12', title: '整机组装与打压试验', status: 'pending' },
              { time: 'Day 13-14', title: '防腐喷涂与出厂验收', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="大修资源调配" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '液压维修工', allocated: 6, total: 6, unit: '人' },
              { name: '电焊工', allocated: 2, total: 2, unit: '人' },
              { name: '全套密封件', allocated: 120, total: 120, unit: '套' },
              { name: '高压胶管', allocated: 50, total: 50, unit: '根' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '高压液体喷射伤人：拆卸前必须彻底卸压' },
              { level: 'high', desc: '重型部件倾倒挤压：使用专用工装固定' },
              { level: 'medium', desc: '密闭空间焊接有害气体：加强通风排风' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
