import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/FlotationMachineRotor/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-30]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-30';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const FlotationMachineRotorView: React.FC = () => {
  const [data, setData] = useState({
    rotorSpeed: 5,
    wearLevel: 85,
    isReplacing: false,
    vibration: 4.2,
    efficiency: 72,
    clearance: 12.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isReplacing) {
          return {
            ...prev,
            wearLevel: Math.max(0, prev.wearLevel - 5),
            rotorSpeed: 0,
            vibration: 0.1,
            efficiency: 0,
            clearance: 15
          };
        }
        return {
          ...prev,
          rotorSpeed: 5 + Math.random() * 0.5,
          wearLevel: Math.min(100, prev.wearLevel + 0.1),
          vibration: 4.2 + Math.random() * 0.8,
          efficiency: Math.max(0, 72 - Math.random() * 2),
          clearance: 12.5 - Math.random() * 0.2
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReplacement = () => {
    setData(prev => ({ ...prev, isReplacing: !prev.isReplacing }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            浮选机转子定子更换排期
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">FLOTATION MACHINE ROTOR & STATOR REPLACEMENT SCHEDULE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleReplacement}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isReplacing 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isReplacing ? '停止更换作业' : '启动更换作业'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Specs & Schedule */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="设备规格参数" className="h-[300px]">
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">设备型号</span>
                <span className="text-cyan-400 font-mono">KYF-320</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">有效容积</span>
                <span className="text-cyan-400 font-mono">320 m³</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">转子直径</span>
                <span className="text-cyan-400 font-mono">1250 mm</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">定子间隙标准</span>
                <span className="text-cyan-400 font-mono">8-12 mm</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">材质</span>
                <span className="text-cyan-400 font-mono">高耐磨聚氨酯</span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="更换作业流程" className="flex-1">
            <TimelineWidget steps={[
              { time: '08:00', title: '停机与安全隔离', status: data.isReplacing ? 'done' : 'pending' },
              { time: '09:30', title: '排空槽体矿浆', status: data.isReplacing ? 'done' : 'pending' },
              { time: '11:00', title: '拆卸传动部件', status: data.isReplacing ? 'active' : 'pending' },
              { time: '13:30', title: '吊出旧转子定子', status: 'pending' },
              { time: '15:00', title: '安装新转子定子', status: 'pending' },
              { time: '17:30', title: '间隙调整与试车', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>

        {/* Center Column: 3D Hologram */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <SciFiCard title="浮选机核心部件全息投影" className="h-[500px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isReplacing ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isReplacing ? '维修模式' : '运行模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene
                rotorSpeed={data.rotorSpeed}
                wearLevel={data.wearLevel}
                isReplacing={data.isReplacing}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '转子磨损率', value: data.wearLevel.toFixed(1), unit: '%', status: data.wearLevel > 80 ? 'critical' : 'normal' },
              { label: '定转子间隙', value: data.clearance.toFixed(1), unit: 'mm', status: data.clearance > 12 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '主轴振动', value: data.vibration.toFixed(2), unit: 'mm/s', status: data.vibration > 4 ? 'warning' : 'normal' },
              { label: '充气均匀度', value: data.efficiency.toFixed(1), unit: '%', status: data.efficiency < 75 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '电机电流', value: data.isReplacing ? '0' : '145', unit: 'A', status: 'normal' },
              { label: '轴承温度', value: data.isReplacing ? '25' : '68', unit: '°C', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Analysis & Resources */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="磨损趋势预测" className="h-[250px]">
            <ChartWidget 
              type="line" 
              data={[
                { name: '1月', value: 20 }, { name: '2月', value: 35 }, 
                { name: '3月', value: 55 }, { name: '4月', value: 70 }, 
                { name: '5月', value: 85 }, { name: '预测', value: 100 }
              ]} 
              color="#ff3300"
            />
          </SciFiCard>

          <SciFiCard title="作业资源调配" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '机械维修组', allocated: 4, total: 4, unit: '人' },
              { name: '电气工程师', allocated: 1, total: 2, unit: '人' },
              { name: '50T履带吊', allocated: 1, total: 1, unit: '台' },
              { name: '聚氨酯定转子', allocated: 1, total: 1, unit: '套' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '受限空间作业，需持续通风检测' },
              { level: 'high', desc: '大型部件吊装，防坠落防挤压' },
              { level: 'medium', desc: '残余药剂接触，需穿戴防化服' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
