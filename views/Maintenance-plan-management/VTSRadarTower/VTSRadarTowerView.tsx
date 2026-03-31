import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/VTSRadarTower/ThreeScene';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Radio, Wind } from 'lucide-react';

export const VTSRadarTowerView: React.FC = () => {
  const [data, setData] = useState({
    rpm: 15,
    windSpeed: 12,
    isInspecting: false,
    signalStrength: 95,
    tiltAngle: 0.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isInspecting) {
          return {
            ...prev,
            rpm: 0,
            signalStrength: 0,
            tiltAngle: 0
          };
        }
        return {
          ...prev,
          rpm: 15 + (Math.random() - 0.5) * 2,
          windSpeed: 12 + (Math.random() - 0.5) * 5,
          signalStrength: Math.min(100, Math.max(80, prev.signalStrength + (Math.random() - 0.5) * 5)),
          tiltAngle: 0.5 + (Math.random() - 0.5) * 0.2
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleInspect = () => {
    setData(prev => ({ ...prev, isInspecting: !prev.isInspecting }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-6 flex justify-between items-end border-b border-indigo-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 tracking-wider uppercase">
            VTS 雷达塔天线维保计划
          </h1>
          <p className="text-indigo-500/70 mt-2 font-mono text-sm">VTS RADAR TOWER ANTENNA MAINTENANCE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleInspect}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isInspecting 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Radio size={18} />
            {data.isInspecting ? '高空维保模式已开启' : '开启高空维保模式'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="天线运行参数" className="flex-none">
            <ParameterWidget parameters={[
              { label: '天线转速', value: data.rpm.toFixed(1), unit: 'rpm', status: 'normal' },
              { label: '信号发射强度', value: data.signalStrength.toFixed(1), unit: '%', status: data.signalStrength < 85 ? 'warning' : 'normal' }
            ]} />
          </SciFiCard>
          
          <SciFiCard title="环境与结构监测" className="flex-none">
            <ParameterWidget parameters={[
              { label: '塔顶实时风速', value: data.windSpeed.toFixed(1), unit: 'm/s', status: data.windSpeed > 15 ? 'warning' : 'normal' },
              { label: '塔身倾斜度', value: data.tiltAngle.toFixed(2), unit: '°', status: 'normal' }
            ]} />
          </SciFiCard>

          <SciFiCard title="高风险作业管控" className="flex-1">
            <RiskWidget risks={[
              { level: data.windSpeed > 15 ? 'high' : 'medium', desc: `当前风速 ${data.windSpeed.toFixed(1)}m/s，${data.windSpeed > 15 ? '风力过大，禁止高空作业' : '适合进行维保'}` },
              { level: 'high', desc: '高空坠落风险：必须全程双钩挂载安全带' },
              { level: 'high', desc: '电磁辐射风险：作业前必须切断发射机电源并挂牌' }
            ]} />
          </SciFiCard>
        </div>

        <SciFiCard title="雷达塔 3D 实时监控" className="h-full relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
              <Wind size={14} className={data.windSpeed > 15 ? 'text-orange-500' : 'text-indigo-500'} />
              <span className="text-xs text-slate-300">{data.windSpeed.toFixed(1)} m/s</span>
            </div>
          </div>
          <div className="absolute inset-0 m-4 mt-12 border border-indigo-500/20 rounded-lg overflow-hidden bg-[#0a1122]">
            <ThreeScene 
              rpm={data.rpm} 
              windSpeed={data.windSpeed} 
              isInspecting={data.isInspecting} 
            />
          </div>
        </SciFiCard>

        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <SciFiCard title="高空维保作业流程" className="flex-1">
            <TimelineWidget steps={[
              { time: '08:00', title: '申请停机，切断雷达发射机及电机电源', status: 'done' },
              { time: '09:00', title: '维保人员登塔，检查安全带及防坠器', status: 'active' },
              { time: '10:30', title: '检查天线阵列外观及波导管连接处', status: 'pending' },
              { time: '13:00', title: '清理天线罩表面盐雾及鸟粪附着物', status: 'pending' },
              { time: '15:00', title: '检查旋转电机齿轮箱及加注润滑脂', status: 'pending' },
              { time: '17:00', title: '人员撤离，恢复供电，进行系统联调', status: 'pending' }
            ]} />
          </SciFiCard>

          <SciFiCard title="特种作业资源" className="flex-none">
            <ResourceWidget resources={[
              { name: '防盐雾清洁剂', allocated: 5, total: 5, unit: '桶' },
              { name: '低温极压润滑脂', allocated: 2, total: 2, unit: '罐' },
              { name: '全身式安全带', allocated: 2, total: 2, unit: '套' },
              { name: '高空作业资质人员', allocated: 2, total: 2, unit: '人' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
