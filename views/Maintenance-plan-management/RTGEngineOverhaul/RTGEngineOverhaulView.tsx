import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/RTGEngineOverhaul/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const RTGEngineOverhaulView: React.FC = () => {
  const [data, setData] = useState({
    rpm: 1500,
    temperature: 85,
    isOverhauling: false,
    oilPressure: 4.5,
    fuelConsumption: 25.4,
    runningHours: 12450
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isOverhauling) {
          return {
            ...prev,
            rpm: Math.max(0, prev.rpm - 100),
            temperature: Math.max(25, prev.temperature - 2),
            oilPressure: 0,
            fuelConsumption: 0
          };
        }
        return {
          ...prev,
          rpm: 1500 + (Math.random() - 0.5) * 50,
          temperature: 85 + Math.random() * 2,
          oilPressure: 4.5 + (Math.random() - 0.5) * 0.2,
          fuelConsumption: 25.4 + (Math.random() - 0.5) * 1,
          runningHours: prev.runningHours + 0.1
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
            场桥柴油发电机组大修
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">RTG DIESEL ENGINE GENERATOR OVERHAUL</p>
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
            {data.isOverhauling ? '完成大修 (恢复发电)' : '启动大修 (停机解体)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Full height 3D */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SciFiCard title="发电机组 3D 结构透视" className="flex-1 min-h-[600px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isOverhauling ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isOverhauling ? '解体检修模式' : '正常发电模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                rpm={data.rpm} 
                temperature={data.temperature} 
                isOverhauling={data.isOverhauling} 
              />
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Stacked Cards */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SciFiCard title="机组运行核心参数" className="h-auto">
            <div className="grid grid-cols-2 gap-4">
              <ParameterWidget parameters={[
                { label: '发动机转速', value: data.rpm.toFixed(0), unit: 'RPM', status: 'normal' },
                { label: '冷却水温', value: data.temperature.toFixed(1), unit: '°C', status: data.temperature > 95 ? 'warning' : 'normal' },
                { label: '机油压力', value: data.oilPressure.toFixed(2), unit: 'bar', status: data.oilPressure < 3.0 && !data.isOverhauling ? 'critical' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '燃油消耗率', value: data.fuelConsumption.toFixed(1), unit: 'L/h', status: 'normal' },
                { label: '累计运行时间', value: data.runningHours.toFixed(0), unit: 'h', status: data.runningHours > 12000 ? 'warning' : 'normal' },
                { label: '大修周期', value: '12000', unit: 'h', status: 'normal' }
              ]} />
            </div>
          </SciFiCard>

          <SciFiCard title="大修作业进度" className="h-[250px]">
            <TimelineWidget steps={[
              { time: 'Day 1', title: '机组停机、排空油水', status: data.isOverhauling ? 'done' : 'pending' },
              { time: 'Day 2-3', title: '缸盖、活塞连杆组拆卸', status: data.isOverhauling ? 'active' : 'pending' },
              { time: 'Day 4-5', title: '曲轴探伤与轴瓦更换', status: 'pending' },
              { time: 'Day 6-7', title: '喷油器校验与涡轮增压器维保', status: 'pending' },
              { time: 'Day 8-9', title: '整机组装与间隙调整', status: 'pending' },
              { time: 'Day 10', title: '加注油水、磨合试车', status: 'pending' }
            ]} />
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <SciFiCard title="备件与资源" className="h-full">
              <ResourceWidget resources={[
                { name: '发动机大修包', allocated: 1, total: 1, unit: '套' },
                { name: '主轴瓦/连杆瓦', allocated: 1, total: 1, unit: '套' },
                { name: '高级柴机油', allocated: 200, total: 200, unit: 'L' },
                { name: '内燃机修工', allocated: 3, total: 3, unit: '人' }
              ]} />
            </SciFiCard>

            <SciFiCard title="安全与环保" className="h-full">
              <RiskWidget risks={[
                { level: 'high', desc: '重物吊装：使用专用吊架，严禁斜拉' },
                { level: 'medium', desc: '废油液处理：必须回收至指定废油桶' },
                { level: 'low', desc: '噪音危害：试车期间佩戴防噪音耳罩' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
