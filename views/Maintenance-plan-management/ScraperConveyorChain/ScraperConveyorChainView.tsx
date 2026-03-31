import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ScraperConveyorChain/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ScraperConveyorChainView: React.FC = () => {
  const [data, setData] = useState({
    chainSpeed: 1.2,
    tension: 65,
    isMaintaining: false,
    motorPower: 240,
    coalLoad: 850,
    wearLevel: 15
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isMaintaining) {
          return {
            ...prev,
            tension: Math.min(100, prev.tension + 5),
            chainSpeed: 0,
            motorPower: 0,
            coalLoad: 0
          };
        }
        return {
          ...prev,
          chainSpeed: 1.2 + Math.random() * 0.1,
          tension: Math.max(0, prev.tension - 0.5),
          motorPower: 240 + Math.random() * 20,
          coalLoad: 850 + Math.random() * 50,
          wearLevel: Math.min(100, prev.wearLevel + 0.1)
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMaintenance = () => {
    setData(prev => ({ ...prev, isMaintaining: !prev.isMaintaining }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            刮板输送机链条维护
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">SCRAPER CONVEYOR CHAIN MAINTENANCE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleMaintenance}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isMaintaining 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isMaintaining ? '完成紧链 (恢复运输)' : '启动维护 (停机紧链)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Hologram & Parameters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="输送机链条 3D 状态监测" className="h-[550px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isMaintaining ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isMaintaining ? '停机紧链模式' : '正常运输模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                chainSpeed={data.chainSpeed} 
                tension={data.tension} 
                isMaintaining={data.isMaintaining} 
              />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '链条张紧度', value: data.tension.toFixed(1), unit: '%', status: data.tension < 70 ? 'warning' : 'normal' },
              { label: '运行链速', value: data.chainSpeed.toFixed(2), unit: 'm/s', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '驱动电机功率', value: data.motorPower.toFixed(0), unit: 'kW', status: data.motorPower > 300 ? 'warning' : 'normal' },
              { label: '实时运煤量', value: data.coalLoad.toFixed(0), unit: 't/h', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '链环磨损率', value: data.wearLevel.toFixed(1), unit: '%', status: data.wearLevel > 20 ? 'warning' : 'normal' },
              { label: '上次断链时间', value: '180天前', unit: '', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Schedule, Resources & Risks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="维护作业流程" className="h-[300px]">
            <TimelineWidget steps={[
              { time: 'T-0', title: '输送机停机、断电闭锁', status: data.isMaintaining ? 'done' : 'pending' },
              { time: 'T+15m', title: '清理机头机尾积煤', status: data.isMaintaining ? 'active' : 'pending' },
              { time: 'T+30m', title: '检查链条磨损及变形', status: 'pending' },
              { time: 'T+45m', title: '操作液压张紧装置紧链', status: 'pending' },
              { time: 'T+60m', title: '更换损坏刮板及连接环', status: 'pending' },
              { time: 'T+90m', title: '解锁送电、空转试车', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="维护资源调配" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '输送机司机', allocated: 2, total: 2, unit: '人' },
              { name: '机修工', allocated: 4, total: 4, unit: '人' },
              { name: '高强度圆环链', allocated: 10, total: 10, unit: '节' },
              { name: '标准刮板', allocated: 5, total: 5, unit: '块' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '断链伤人风险：紧链时人员必须撤离机道' },
              { level: 'high', desc: '误启动风险：严格执行停电闭锁制度' },
              { level: 'medium', desc: '挤压碰撞：搬运重型链条需多人配合' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
