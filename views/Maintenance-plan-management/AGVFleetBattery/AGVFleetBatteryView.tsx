import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/AGVFleetBattery/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-42]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-42';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AGVFleetBatteryView: React.FC = () => {
  const [data, setData] = useState({
    batteryLevel: 15,
    isRotating: false,
    temperature: 48,
    chargingCycles: 1250,
    healthStatus: 82,
    voltage: 48.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isRotating) {
          return {
            ...prev,
            batteryLevel: Math.min(100, prev.batteryLevel + 5),
            temperature: Math.max(25, prev.temperature - 1),
            voltage: 54.6 // Fully charged voltage
          };
        }
        return {
          ...prev,
          batteryLevel: Math.max(0, prev.batteryLevel - 0.5),
          temperature: Math.min(60, prev.temperature + Math.random() * 0.5),
          voltage: 48.5 - (100 - prev.batteryLevel) * 0.05,
          chargingCycles: prev.chargingCycles + (Math.random() > 0.9 ? 1 : 0)
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleRotation = () => {
    setData(prev => ({ ...prev, isRotating: !prev.isRotating }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            自动化导引车电池组轮换计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">AGV FLEET BATTERY ROTATION PLAN</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleRotation}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isRotating 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isRotating ? '完成轮换 (恢复调度)' : '启动轮换 (进站换电)'}
          </button>
        </div>
      </div>

      {/* Top Half: 3D Scene and Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8">
          <SciFiCard title="AGV 换电站 3D 实时监控" className="h-[450px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isRotating ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isRotating ? '自动换电作业中' : '场区巡航作业'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                batteryLevel={data.batteryLevel} 
                isRotating={data.isRotating} 
                temperature={data.temperature}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="电池组健康档案 (SOH)" className="flex-1">
            <div className="space-y-4">
              <ParameterWidget parameters={[
                { label: '当前电量 (SOC)', value: data.batteryLevel.toFixed(1), unit: '%', status: data.batteryLevel < 20 ? 'critical' : 'normal' },
                { label: '电池组温度', value: data.temperature.toFixed(1), unit: '°C', status: data.temperature > 50 ? 'warning' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '健康度 (SOH)', value: data.healthStatus.toFixed(1), unit: '%', status: data.healthStatus < 85 ? 'warning' : 'normal' },
                { label: '累计充放电循环', value: data.chargingCycles.toString(), unit: '次', status: 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '总线电压', value: data.voltage.toFixed(1), unit: 'V', status: 'normal' },
                { label: '电芯压差', value: '0.05', unit: 'V', status: 'normal' }
              ]} />
            </div>
          </SciFiCard>
        </div>
      </div>

      {/* Bottom Half: Fleet Grid and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SciFiCard title="车队电池状态矩阵" className="h-[300px]">
            <div className="grid grid-cols-5 gap-4 p-2">
              {[...Array(10)].map((_, i) => {
                const level = i === 0 ? data.batteryLevel : Math.random() * 80 + 20;
                const isCurrent = i === 0;
                return (
                  <div key={i} className={`p-4 rounded border ${isCurrent ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/50'} flex flex-col items-center justify-center gap-2`}>
                    <span className="text-xs text-slate-400 font-mono">AGV-{String(i + 1).padStart(3, '0')}</span>
                    <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                      <div 
                        className={`h-full ${level < 20 ? 'bg-red-500' : level < 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                        style={{ width: `${level}%` }} 
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-200">{level.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </SciFiCard>
        </div>

        <div className="lg:col-span-4">
          <SciFiCard title="轮换调度队列" className="h-[300px]">
             <TimelineWidget steps={[
              { time: '10:00', title: 'AGV-001 触发低电量警报', status: data.isRotating ? 'done' : 'pending' },
              { time: '10:05', title: '调度系统分配换电站 A', status: data.isRotating ? 'done' : 'pending' },
              { time: '10:10', title: 'AGV 驶入换电工位', status: data.isRotating ? 'active' : 'pending' },
              { time: '10:12', title: '机械臂抓取亏电电池', status: 'pending' },
              { time: '10:15', title: '装载满电电池组', status: 'pending' },
              { time: '10:18', title: '自检完成、恢复作业', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
