import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/RoadheaderCutterReplacement/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const RoadheaderCutterReplacementView: React.FC = () => {
  const [data, setData] = useState({
    cutterSpeed: 45,
    wearLevel: 88,
    isReplacing: false,
    vibration: 12.5,
    motorCurrent: 245,
    cuttingForce: 180
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isReplacing) {
          return {
            ...prev,
            wearLevel: Math.max(0, prev.wearLevel - 5),
            cutterSpeed: 0,
            vibration: 0.5,
            motorCurrent: 0,
            cuttingForce: 0
          };
        }
        return {
          ...prev,
          cutterSpeed: 45 + Math.random() * 2,
          wearLevel: Math.min(100, prev.wearLevel + 0.2),
          vibration: 12.5 + Math.random() * 2,
          motorCurrent: 245 + Math.random() * 10,
          cuttingForce: 180 + Math.random() * 15
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
            掘进机截割头更换计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">ROADHEADER CUTTER HEAD REPLACEMENT SCHEDULE</p>
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
            {data.isReplacing ? '完成更换 (恢复掘进)' : '启动更换作业'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Specs & Schedule */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="截割头规格参数" className="h-[300px]">
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">设备型号</span>
                <span className="text-cyan-400 font-mono">EBZ-260</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">截割头直径</span>
                <span className="text-cyan-400 font-mono">1100 mm</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">截齿数量</span>
                <span className="text-cyan-400 font-mono">48 把</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">截齿型号</span>
                <span className="text-cyan-400 font-mono">U94 镐型齿</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">额定转速</span>
                <span className="text-cyan-400 font-mono">46 r/min</span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="更换作业流程" className="flex-1">
            <TimelineWidget steps={[
              { time: '08:00', title: '掘进机退机与断电闭锁', status: data.isReplacing ? 'done' : 'pending' },
              { time: '09:00', title: '截割臂支撑与固定', status: data.isReplacing ? 'done' : 'pending' },
              { time: '10:00', title: '拆卸旧截割头及截齿', status: data.isReplacing ? 'active' : 'pending' },
              { time: '13:00', title: '清理花键轴及密封件', status: 'pending' },
              { time: '14:30', title: '吊装新截割头', status: 'pending' },
              { time: '16:00', title: '安装新截齿及紧固', status: 'pending' },
              { time: '17:30', title: '解锁送电与空载试车', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>

        {/* Center Column: 3D Hologram */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <SciFiCard title="截割头 3D 全息投影" className="h-[500px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isReplacing ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isReplacing ? '更换模式' : '掘进模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                cutterSpeed={data.cutterSpeed} 
                wearLevel={data.wearLevel} 
                isReplacing={data.isReplacing} 
              />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '截齿综合磨损率', value: data.wearLevel.toFixed(1), unit: '%', status: data.wearLevel > 85 ? 'critical' : data.wearLevel > 70 ? 'warning' : 'normal' },
              { label: '截割头转速', value: data.cutterSpeed.toFixed(1), unit: 'rpm', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '截割臂振动烈度', value: data.vibration.toFixed(2), unit: 'mm/s', status: data.vibration > 15 ? 'warning' : 'normal' },
              { label: '截割电机电流', value: data.motorCurrent.toFixed(0), unit: 'A', status: data.motorCurrent > 300 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '实时截割阻力', value: data.cuttingForce.toFixed(0), unit: 'kN', status: 'normal' },
              { label: '冷却水压', value: data.isReplacing ? '0' : '2.5', unit: 'MPa', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Analysis & Resources */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="磨损趋势预测" className="h-[250px]">
            <ChartWidget 
              type="line" 
              data={[
                { name: '第1周', value: 10 }, { name: '第2周', value: 25 }, 
                { name: '第3周', value: 45 }, { name: '第4周', value: 65 }, 
                { name: '第5周', value: 88 }, { name: '预测', value: 100 }
              ]} 
              color="#ff3300"
            />
          </SciFiCard>

          <SciFiCard title="作业资源调配" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '机修班组', allocated: 5, total: 5, unit: '人' },
              { name: '防爆起重机', allocated: 1, total: 1, unit: '台' },
              { name: '新截割头总成', allocated: 1, total: 1, unit: '套' },
              { name: 'U94截齿', allocated: 50, total: 50, unit: '把' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '顶板冒落风险：需提前进行临时支护' },
              { level: 'high', desc: '重物挤压风险：吊装区域严禁站人' },
              { level: 'medium', desc: '误操作启动：严格执行停电闭锁挂牌' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
