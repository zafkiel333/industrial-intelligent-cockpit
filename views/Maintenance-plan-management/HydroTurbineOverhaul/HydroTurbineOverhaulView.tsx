import React, { useState, useEffect } from 'react';
import { Shield, Wrench, CalendarCheck, Gauge, Play, Pause, RotateCcw, Info } from 'lucide-react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/HydroTurbineOverhaul/ThreeScene';
import { HydroTurbineOverhaulProps } from '../../../components/Maintenance-plan-management/HydroTurbineOverhaul/three-types';

// Placeholder for real-time data fetching
const fetchRealTimeData = async () => {
  // Simulate fetching data
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    turbineSpeed: Math.random() * 100 + 50, // RPM
    waterFlow: Math.random() * 500 + 200, // m³/s
    vibrationLevel: Math.random() * 5, // mm/s
    temperature: Math.random() * 20 + 40, // °C
    pressure: Math.random() * 10 + 5, // bar
    status: ['运行中', '待机', '检修中', '故障'][Math.floor(Math.random() * 4)],
    maintenanceSchedule: '2026-08-15',
    lastMaintenance: '2025-11-20',
  };
};

export const HydroTurbineOverhaulView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [is3DVisible, setIs3DVisible] = useState(true);
  const [turbineStatus, setTurbineStatus] = useState('待机'); // '待机', '运行中', '检修中', '故障'

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchRealTimeData();
      setData(fetchedData);
      setTurbineStatus(fetchedData.status);
    };
    loadData();
    const intervalId = setInterval(loadData, 5000); // Refresh data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  const handleAction = (action: string) => {
    console.log(`Performing action: ${action}`);
    // In a real app, this would trigger API calls
    switch (action) {
      case 'start':
        setTurbineStatus('运行中');
        break;
      case 'stop':
        setTurbineStatus('待机');
        break;
      case 'overhaul':
        setTurbineStatus('检修中');
        break;
      case 'reset':
        setTurbineStatus('待机');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '运行中': return 'text-green-400';
      case '待机': return 'text-yellow-400';
      case '检修中': return 'text-blue-400';
      case '故障': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const turbineProps: HydroTurbineOverhaulProps = {
    speed: data?.turbineSpeed || 0,
    status: turbineStatus,
    // Add other props as needed for 3D visualization
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6 bg-gradient-to-br from-gray-900 to-black text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-teal-400 tracking-wide">水轮发电机组大修计划</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIs3DVisible(!is3DVisible)} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 transition duration-300 flex items-center gap-2">
            {is3DVisible ? <Pause size={18} /> : <Play size={18} />}
            {is3DVisible ? '暂停3D' : '恢复3D'}
          </button>
          <span className={`text-xl font-semibold ${getStatusColor(turbineStatus)}`}>状态: {turbineStatus}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel: Operational Data & Maintenance */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          {/* Real-time Data Card */}
          <SciFiCard title="实时运行数据" className="flex-1">
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center justify-between border-b border-teal-800/30 pb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Gauge size={18} className="text-teal-400" />
                  <span>转速</span>
                </div>
                <span className="font-mono text-teal-300 text-lg">{data?.turbineSpeed.toFixed(1) ?? 'N/A'} RPM</span>
              </div>
              <div className="flex items-center justify-between border-b border-teal-800/30 pb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Gauge size={18} className="text-teal-400" />
                  <span>水流</span>
                </div>
                <span className="font-mono text-teal-300 text-lg">{data?.waterFlow.toFixed(1) ?? 'N/A'} m³/s</span>
              </div>
              <div className="flex items-center justify-between border-b border-teal-800/30 pb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Gauge size={18} className="text-teal-400" />
                  <span>振动</span>
                </div>
                <span className="font-mono text-teal-300 text-lg">{data?.vibrationLevel.toFixed(2) ?? 'N/A'} mm/s</span>
              </div>
              <div className="flex items-center justify-between border-b border-teal-800/30 pb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Gauge size={18} className="text-teal-400" />
                  <span>温度</span>
                </div>
                <span className="font-mono text-teal-300 text-lg">{data?.temperature.toFixed(1) ?? 'N/A'} °C</span>
              </div>
              <div className="flex items-center justify-between border-b border-teal-800/30 pb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Gauge size={18} className="text-teal-400" />
                  <span>压力</span>
                </div>
                <span className="font-mono text-teal-300 text-lg">{data?.pressure.toFixed(1) ?? 'N/A'} bar</span>
              </div>
            </div>
          </SciFiCard>
        </div>

        {/* Middle Panel: 3D Visualization */}
        <div className={`w-full lg:w-1/2 h-full transition-all duration-500 ${is3DVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <SciFiCard title="发电机组三维模型" className="h-full flex flex-col overflow-hidden">
            {is3DVisible && <ThreeScene {...turbineProps} />}
          </SciFiCard>
        </div>

        {/* Right Panel: Controls */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <SciFiCard title="操作与计划" className="flex-1">
            <div className="flex flex-col gap-3">
              <button onClick={() => handleAction('start')} className="px-3 py-3 rounded-lg bg-green-600/20 hover:bg-green-500/40 border border-green-500/50 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-green-400" disabled={turbineStatus === '运行中' || turbineStatus === '检修中'}>
                <Play size={18} /> 启动机组
              </button>
              <button onClick={() => handleAction('stop')} className="px-3 py-3 rounded-lg bg-yellow-600/20 hover:bg-yellow-500/40 border border-yellow-500/50 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-400" disabled={turbineStatus === '待机' || turbineStatus === '检修中'}>
                <Pause size={18} /> 停止机组
              </button>
              <button onClick={() => handleAction('overhaul')} className="px-3 py-3 rounded-lg bg-blue-600/20 hover:bg-blue-500/40 border border-blue-500/50 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-blue-400" disabled={turbineStatus === '检修中'}>
                <Wrench size={18} /> 开始大修
              </button>
              <button onClick={() => handleAction('reset')} className="px-3 py-3 rounded-lg bg-red-600/20 hover:bg-red-500/40 border border-red-500/50 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-red-400" disabled={turbineStatus === '运行中' || turbineStatus === '检修中'}>
                <RotateCcw size={18} /> 故障重置
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-3 text-sm text-gray-300 border-t border-teal-800/30 pt-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><CalendarCheck size={16} className="text-teal-400" /> 下次计划维护</span>
                <span className="font-mono text-teal-300">{data?.maintenanceSchedule ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><Info size={16} className="text-teal-400" /> 上次维护记录</span>
                <span className="font-mono text-teal-300">{data?.lastMaintenance ?? 'N/A'}</span>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
