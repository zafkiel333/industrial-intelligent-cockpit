import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ShearerDrumMaintenance/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ShearerDrumMaintenanceView: React.FC = () => {
  const [data, setData] = useState({
    drumSpeed: 35,
    toothWear: 75,
    isMaintaining: false,
    cuttingCurrent: 180,
    sprayPressure: 3.2,
    coalOutput: 1200
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isMaintaining) {
          return {
            ...prev,
            toothWear: Math.max(0, prev.toothWear - 10),
            drumSpeed: 0,
            cuttingCurrent: 0,
            sprayPressure: 0
          };
        }
        return {
          ...prev,
          drumSpeed: 35 + Math.random() * 2,
          toothWear: Math.min(100, prev.toothWear + 0.5),
          cuttingCurrent: 180 + Math.random() * 20,
          sprayPressure: 3.2 + Math.random() * 0.2,
          coalOutput: prev.coalOutput + 5
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
            采煤机滚筒及截齿维保
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">SHEARER DRUM & CUTTING TEETH MAINTENANCE</p>
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
            {data.isMaintaining ? '完成维保 (恢复割煤)' : '启动维保 (停机检查)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Hologram & Parameters */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SciFiCard title="采煤机滚筒 3D 状态监测" className="h-[550px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isMaintaining ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isMaintaining ? '维保检查模式' : '割煤作业模式'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                drumSpeed={data.drumSpeed} 
                toothWear={data.toothWear} 
                isMaintaining={data.isMaintaining} 
              />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '截齿平均磨损率', value: data.toothWear.toFixed(1), unit: '%', status: data.toothWear > 80 ? 'critical' : data.toothWear > 60 ? 'warning' : 'normal' },
              { label: '滚筒转速', value: data.drumSpeed.toFixed(1), unit: 'rpm', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '截割电机电流', value: data.cuttingCurrent.toFixed(0), unit: 'A', status: data.cuttingCurrent > 220 ? 'warning' : 'normal' },
              { label: '内外喷雾水压', value: data.sprayPressure.toFixed(2), unit: 'MPa', status: data.sprayPressure < 2.0 ? 'critical' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '累计割煤量', value: data.coalOutput.toFixed(0), unit: 't', status: 'normal' },
              { label: '上次换齿时间', value: '48小时前', unit: '', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Schedule, Resources & Risks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="维保作业流程" className="h-[300px]">
            <TimelineWidget steps={[
              { time: 'T-0', title: '采煤机停机、断电闭锁', status: data.isMaintaining ? 'done' : 'pending' },
              { time: 'T+10m', title: '清理滚筒及煤壁浮煤', status: data.isMaintaining ? 'active' : 'pending' },
              { time: 'T+30m', title: '检查齿座磨损及裂纹', status: 'pending' },
              { time: 'T+60m', title: '更换磨损严重截齿', status: 'pending' },
              { time: 'T+90m', title: '疏通内外喷雾水路', status: 'pending' },
              { time: 'T+120m', title: '解锁送电、空转试车', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="维保资源调配" className="h-[200px]">
            <ResourceWidget resources={[
              { name: '采煤机司机', allocated: 2, total: 2, unit: '人' },
              { name: '机修工', allocated: 3, total: 3, unit: '人' },
              { name: '镐型截齿', allocated: 30, total: 50, unit: '把' },
              { name: '喷雾喷嘴', allocated: 10, total: 20, unit: '个' }
            ]} />
          </SciFiCard>

          <SciFiCard title="安全风险管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '煤壁片帮风险：必须打好护帮板' },
              { level: 'high', desc: '误启动风险：严格执行停电闭锁制度' },
              { level: 'medium', desc: '敲击火花：使用铜锤或防爆工具' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
