import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ThickenerDriveMaintenance/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ThickenerDriveMaintenanceView: React.FC = () => {
  const [data, setData] = useState({
    rakeSpeed: 0.1,
    torque: 65,
    isLifting: false,
    underflowDensity: 55,
    overflowClarity: 85,
    motorTemp: 62
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isLifting) {
          return {
            ...prev,
            rakeSpeed: 0,
            torque: Math.max(0, prev.torque - 5),
            underflowDensity: Math.max(0, prev.underflowDensity - 2),
            overflowClarity: Math.min(100, prev.overflowClarity + 1),
            motorTemp: Math.max(25, prev.motorTemp - 1)
          };
        }
        return {
          ...prev,
          rakeSpeed: 0.1 + Math.random() * 0.02,
          torque: Math.min(100, prev.torque + Math.random() * 2 - 0.5),
          underflowDensity: 55 + Math.random() * 5,
          overflowClarity: 85 - Math.random() * 2,
          motorTemp: 62 + Math.random() * 3
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
      <div className="mb-8 flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            浓缩机驱动桥检修计划
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">THICKENER DRIVE BRIDGE MAINTENANCE PLAN</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleLift}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isLifting 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {data.isLifting ? '降下耙架 (恢复运行)' : '提耙 (检修模式)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera & Docs */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="现场监控图传" className="h-[250px]">
            <CameraWidget name="浓缩池中心驱动桥摄像头" status={data.isLifting ? 'offline' : 'online'} />
          </SciFiCard>

          <SciFiCard title="技术文档库" className="flex-1">
            <DocumentWidget docs={[
              { title: 'NZ-45浓缩机使用说明书', type: 'pdf', date: '2023-05-12' },
              { title: '中心传动装置检修规程', type: 'doc', date: '2023-08-20' },
              { title: '液压提耙系统故障排查指南', type: 'pdf', date: '2024-01-15' },
              { title: '历史检修记录 (2025)', type: 'xls', date: '2025-12-01' }
            ]} />
          </SciFiCard>
        </div>

        {/* Center Column: 3D Hologram & Parameters */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <SciFiCard title="浓缩机 3D 结构解析" className="h-[500px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isLifting ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-slate-300">{data.isLifting ? '提耙检修中' : '正常浓缩'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-cyan-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900/80 to-[#020617]">
              <ThreeScene 
                rakeSpeed={data.rakeSpeed} 
                torque={data.torque} 
                isLifting={data.isLifting} 
              />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-3 gap-4">
            <ParameterWidget parameters={[
              { label: '中心驱动扭矩', value: data.torque.toFixed(1), unit: '%', status: data.torque > 80 ? 'critical' : data.torque > 60 ? 'warning' : 'normal' },
              { label: '耙架转速', value: data.rakeSpeed.toFixed(3), unit: 'rpm', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '底流浓度', value: data.underflowDensity.toFixed(1), unit: '%', status: data.underflowDensity < 50 ? 'warning' : 'normal' },
              { label: '溢流浊度', value: data.overflowClarity.toFixed(1), unit: 'NTU', status: data.overflowClarity > 90 ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '驱动电机温度', value: data.motorTemp.toFixed(1), unit: '°C', status: data.motorTemp > 75 ? 'warning' : 'normal' },
              { label: '液压站压力', value: data.isLifting ? '15.5' : '8.2', unit: 'MPa', status: 'normal' }
            ]} />
          </div>
        </div>

        {/* Right Column: Torque Analysis & Schedule */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <SciFiCard title="扭矩趋势分析" className="h-[250px]">
            <ChartWidget 
              type="line" 
              data={[
                { name: '00:00', value: 45 }, { name: '04:00', value: 50 }, 
                { name: '08:00', value: 65 }, { name: '12:00', value: 72 }, 
                { name: '16:00', value: 85 }, { name: '当前', value: data.torque }
              ]} 
              color="#ffaa00"
            />
          </SciFiCard>

          <SciFiCard title="检修作业流程" className="flex-1">
            <TimelineWidget steps={[
              { time: '08:00', title: '停止给矿，排空底流', status: data.isLifting ? 'done' : 'pending' },
              { time: '09:30', title: '启动液压提耙', status: data.isLifting ? 'active' : 'pending' },
              { time: '10:00', title: '切断主电机电源，挂牌', status: 'pending' },
              { time: '10:30', title: '拆卸减速机护罩', status: 'pending' },
              { time: '11:30', title: '检查齿轮啮合与润滑', status: 'pending' },
              { time: '14:00', title: '更换密封件与轴承', status: 'pending' },
              { time: '16:30', title: '恢复供电，降耙试车', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
