import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PropellerPolishing/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-44]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-44';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PropellerPolishingView: React.FC = () => {
  const [data, setData] = useState({
    foulingLevel: 85,
    isPolishing: false,
    waterTurbidity: 40,
    propellerEfficiency: 72,
    fuelPenalty: 12.5,
    estimatedTimeLeft: 4.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isPolishing) {
          return {
            ...prev,
            foulingLevel: Math.max(5, prev.foulingLevel - 2),
            waterTurbidity: Math.min(80, prev.waterTurbidity + 5), // Polishing stirs up water
            propellerEfficiency: Math.min(98, prev.propellerEfficiency + 0.5),
            fuelPenalty: Math.max(0.5, prev.fuelPenalty - 0.3),
            estimatedTimeLeft: Math.max(0, prev.estimatedTimeLeft - 0.1)
          };
        }
        return {
          ...prev,
          foulingLevel: Math.min(100, prev.foulingLevel + 0.05),
          waterTurbidity: 40 + (Math.random() - 0.5) * 10,
          propellerEfficiency: Math.max(60, prev.propellerEfficiency - 0.01),
          fuelPenalty: Math.min(20, prev.fuelPenalty + 0.01)
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePolish = () => {
    setData(prev => ({ ...prev, isPolishing: !prev.isPolishing }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-teal-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600 tracking-wider uppercase">
            螺旋桨水下抛光清理计划
          </h1>
          <p className="text-teal-500/70 mt-2 font-mono text-sm">UNDERWATER PROPELLER POLISHING & CLEANING SCHEDULE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleTogglePolish}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isPolishing 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-teal-500/20 text-teal-400 border border-teal-500/50 hover:bg-teal-500/30'
            }`}
          >
            {data.isPolishing ? '完成抛光 (撤离潜水员)' : '启动抛光 (下水作业)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Underwater Scene */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SciFiCard title="水下作业 3D 实时监控" className="flex-1 min-h-[600px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isPolishing ? 'bg-orange-500 animate-pulse' : 'bg-teal-500'}`} />
                <span className="text-xs text-slate-300">{data.isPolishing ? 'ROV/潜水员抛光中' : '航行/待机状态'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-teal-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-[#001122] to-[#000510]">
              <ThreeScene 
                foulingLevel={data.foulingLevel} 
                isPolishing={data.isPolishing} 
                waterTurbidity={data.waterTurbidity}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Data & Schedule */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SciFiCard title="推进效率与能耗评估" className="h-auto">
            <div className="grid grid-cols-2 gap-4">
              <ParameterWidget parameters={[
                { label: '表面海生物附着率', value: data.foulingLevel.toFixed(1), unit: '%', status: data.foulingLevel > 70 ? 'critical' : 'normal' },
                { label: '螺旋桨推进效率', value: data.propellerEfficiency.toFixed(1), unit: '%', status: data.propellerEfficiency < 75 ? 'warning' : 'normal' },
                { label: '燃油消耗惩罚', value: `+${data.fuelPenalty.toFixed(1)}`, unit: '%', status: data.fuelPenalty > 10 ? 'critical' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '水体浊度 (NTU)', value: data.waterTurbidity.toFixed(0), unit: '', status: data.waterTurbidity > 60 ? 'warning' : 'normal' },
                { label: '预计剩余作业时间', value: data.estimatedTimeLeft.toFixed(1), unit: 'h', status: 'normal' },
                { label: '目标粗糙度 (Rubert)', value: 'A级', unit: '', status: 'normal' }
              ]} />
            </div>
          </SciFiCard>

          <SciFiCard title="水下抛光标准作业程序" className="h-[250px]">
            <TimelineWidget steps={[
              { time: '09:00', title: '船舶抛锚、主机锁定 (Lockout/Tagout)', status: data.isPolishing ? 'done' : 'pending' },
              { time: '09:30', title: '潜水员下水、初始录像评估', status: data.isPolishing ? 'done' : 'pending' },
              { time: '10:00', title: '液压旋转刷粗抛光 (去除藤壶)', status: data.isPolishing ? 'active' : 'pending' },
              { time: '13:00', title: '3M柔性磨盘精抛光 (Rubert A级)', status: 'pending' },
              { time: '16:00', title: '最终录像检验、清理桨毂', status: 'pending' },
              { time: '17:00', title: '潜水员出水、解除主机锁定', status: 'pending' }
            ]} />
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <SciFiCard title="作业资源调配" className="h-full">
              <ResourceWidget resources={[
                { name: '水下液压抛光机', allocated: 2, total: 2, unit: '台' },
                { name: '不同目数抛光盘', allocated: 20, total: 20, unit: '片' },
                { name: '商业潜水员', allocated: 3, total: 3, unit: '人' },
                { name: '水下录像设备', allocated: 1, total: 1, unit: '套' }
              ]} />
            </SciFiCard>

            <SciFiCard title="潜水作业安全风险" className="h-full">
              <RiskWidget risks={[
                { level: 'high', desc: '主机误动：必须执行严格的挂牌上锁程序' },
                { level: 'high', desc: '水下缠绕：注意潜水脐带与抛光机管线' },
                { level: 'medium', desc: '能见度低：抛光碎屑导致水体浑浊，注意防撞' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
