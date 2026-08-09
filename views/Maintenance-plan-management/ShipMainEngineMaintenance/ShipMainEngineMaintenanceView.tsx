import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ShipMainEngineMaintenance/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-43]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-43';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ShipMainEngineMaintenanceView: React.FC = () => {
  const [data, setData] = useState({
    cylinderTemp: 350,
    pistonWear: 65,
    isLifting: false,
    scavengeAirPressure: 2.1,
    exhaustGasTemp: 420,
    runningHours: 8500
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isLifting) {
          return {
            ...prev,
            cylinderTemp: Math.max(50, prev.cylinderTemp - 5),
            scavengeAirPressure: 0,
            exhaustGasTemp: Math.max(50, prev.exhaustGasTemp - 10)
          };
        }
        return {
          ...prev,
          cylinderTemp: 350 + (Math.random() - 0.5) * 10,
          pistonWear: Math.min(100, prev.pistonWear + 0.01),
          scavengeAirPressure: 2.1 + (Math.random() - 0.5) * 0.1,
          exhaustGasTemp: 420 + (Math.random() - 0.5) * 15,
          runningHours: prev.runningHours + 0.1
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleLift = () => {
    setData(prev => ({ ...prev, isLifting: !prev.isLifting }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-blue-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 tracking-wider uppercase">
            船舶主机吊缸检修排期
          </h1>
          <p className="text-blue-500/70 mt-2 font-mono text-sm">MARINE MAIN ENGINE CYLINDER OVERHAUL SCHEDULE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleLift}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isLifting 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30'
            }`}
          >
            {data.isLifting ? '复位气缸 (结束检修)' : '启动吊缸 (开始检修)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Blueprint */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SciFiCard title="主机气缸 3D 蓝图透视" className="flex-1 min-h-[600px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isLifting ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
                <span className="text-xs text-slate-300">{data.isLifting ? '吊缸作业中 (Lifting)' : '正常运转 (Running)'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-blue-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-[#051020] to-[#020617]">
              <ThreeScene 
                cylinderTemp={data.cylinderTemp} 
                pistonWear={data.pistonWear} 
                isLifting={data.isLifting}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Engine Data & Schedule */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SciFiCard title="气缸运行参数监测" className="h-auto">
            <div className="grid grid-cols-2 gap-4">
              <ParameterWidget parameters={[
                { label: '气缸壁温度', value: data.cylinderTemp.toFixed(1), unit: '°C', status: data.cylinderTemp > 450 ? 'warning' : 'normal' },
                { label: '扫气压力', value: data.scavengeAirPressure.toFixed(2), unit: 'bar', status: 'normal' },
                { label: '排气温度', value: data.exhaustGasTemp.toFixed(0), unit: '°C', status: data.exhaustGasTemp > 480 ? 'warning' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '活塞环磨损率', value: data.pistonWear.toFixed(1), unit: '%', status: data.pistonWear > 80 ? 'critical' : 'normal' },
                { label: '累计运行时间', value: data.runningHours.toFixed(0), unit: 'h', status: data.runningHours > 8000 ? 'warning' : 'normal' },
                { label: '推荐吊缸周期', value: '8000', unit: 'h', status: 'normal' }
              ]} />
            </div>
          </SciFiCard>

          <SciFiCard title="标准吊缸作业流程" className="h-[250px]">
            <TimelineWidget steps={[
              { time: '08:00', title: '主机停机、盘车冷却', status: data.isLifting ? 'done' : 'pending' },
              { time: '10:00', title: '拆卸高压油管、排气阀', status: data.isLifting ? 'active' : 'pending' },
              { time: '13:00', title: '吊出气缸盖、活塞组件', status: data.isLifting ? 'active' : 'pending' },
              { time: '15:00', title: '清洁检查、测量磨损', status: 'pending' },
              { time: '18:00', title: '更换活塞环、重新组装', status: 'pending' },
              { time: '22:00', title: '盘车试运转、参数确认', status: 'pending' }
            ]} />
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <SciFiCard title="专用工具与备件" className="h-full">
              <ResourceWidget resources={[
                { name: '气缸盖专用吊具', allocated: 1, total: 1, unit: '套' },
                { name: '活塞环套装', allocated: 1, total: 1, unit: '套' },
                { name: '液压拉伸器', allocated: 2, total: 2, unit: '把' },
                { name: '轮机工程师', allocated: 4, total: 4, unit: '人' }
              ]} />
            </SciFiCard>

            <SciFiCard title="安全作业许可" className="h-full">
              <RiskWidget risks={[
                { level: 'high', desc: '高空坠物：吊装区域严禁站人' },
                { level: 'medium', desc: '高温烫伤：确认部件冷却后作业' },
                { level: 'medium', desc: '密闭空间：进入扫气箱前测氧' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
