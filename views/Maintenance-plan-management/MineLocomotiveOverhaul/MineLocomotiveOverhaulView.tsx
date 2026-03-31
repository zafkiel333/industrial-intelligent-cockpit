import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/MineLocomotiveOverhaul/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const MineLocomotiveOverhaulView: React.FC = () => {
  const [data, setData] = useState({
    batteryLevel: 45,
    motorTemp: 85,
    isOverhauling: true,
    tractionForce: 12.5,
    brakePressure: 0.8,
    mileage: 15420
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isOverhauling) {
          return {
            ...prev,
            batteryLevel: Math.min(100, prev.batteryLevel + 2),
            motorTemp: Math.max(25, prev.motorTemp - 1),
            tractionForce: 0,
            brakePressure: 0
          };
        }
        return {
          ...prev,
          batteryLevel: Math.max(0, prev.batteryLevel - 0.5),
          motorTemp: Math.min(120, prev.motorTemp + Math.random() * 2),
          tractionForce: 10 + Math.random() * 5,
          brakePressure: 0.6 + Math.random() * 0.4,
          mileage: prev.mileage + 0.1
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
            井下电机车大修排期
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">UNDERGROUND MINE LOCOMOTIVE OVERHAUL SCHEDULE</p>
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
            {data.isOverhauling ? '结束大修 (恢复运行)' : '启动大修 (升井检修)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Hologram & Parameters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="电机车 3D 结构解析" className="h-[550px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isOverhauling ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isOverhauling ? '大修拆解模式' : '正常运行模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                batteryLevel={data.batteryLevel} 
                motorTemp={data.motorTemp} 
                isOverhauling={data.isOverhauling} 
              />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '牵引电机温度', value: data.motorTemp.toFixed(1), unit: '°C', status: data.motorTemp > 90 ? 'critical' : data.motorTemp > 75 ? 'warning' : 'normal' },
              { label: '电池组电量', value: data.batteryLevel.toFixed(1), unit: '%', status: data.batteryLevel < 20 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '牵引力', value: data.tractionForce.toFixed(1), unit: 'kN', status: 'normal' },
              { label: '制动系统压力', value: data.brakePressure.toFixed(2), unit: 'MPa', status: data.brakePressure < 0.5 ? 'critical' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '累计运行里程', value: data.mileage.toFixed(0), unit: 'km', status: 'normal' },
              { label: '上次大修时间', value: '2023-11', unit: '', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Schedule, Resources & Risks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="大修作业流程" className="h-[300px]">
            <TimelineWidget steps={[
              { time: 'Day 1', title: '电机车升井与清洗', status: data.isOverhauling ? 'done' : 'pending' },
              { time: 'Day 2', title: '车体解体与探伤', status: data.isOverhauling ? 'active' : 'pending' },
              { time: 'Day 3-4', title: '牵引电机抽芯大修', status: 'pending' },
              { time: 'Day 5', title: '电池组均衡充电与测试', status: 'pending' },
              { time: 'Day 6', title: '制动系统管路更换', status: 'pending' },
              { time: 'Day 7', title: '整车组装与空载试车', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="大修资源调配" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '机修钳工', allocated: 3, total: 3, unit: '人' },
              { name: '电气检修工', allocated: 2, total: 2, unit: '人' },
              { name: '牵引电机备件', allocated: 1, total: 1, unit: '台' },
              { name: '制动闸瓦', allocated: 8, total: 8, unit: '块' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '电池组高压触电风险：严格执行断电挂牌' },
              { level: 'medium', desc: '车体解体吊装风险：确认吊具承载力' },
              { level: 'low', desc: '清洗废水排放：需经隔油池处理' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
