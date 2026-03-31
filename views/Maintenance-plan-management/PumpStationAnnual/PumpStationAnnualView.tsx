import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PumpStationAnnual/ThreeScene';
import { Calendar, Wrench, Activity, AlertTriangle, CheckCircle, Droplet, Settings, Gauge } from 'lucide-react';

export const PumpStationAnnualView: React.FC = () => {
  const [data, setData] = useState({
    flowRate: 120,
    vibration: 2.5,
    motorTemp: 65,
    efficiency: 85,
    status: '运行中' as '运行中' | '停机检修' | '测试中',
    maintenanceProgress: 0
  });

  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data.status === '运行中' || data.status === '测试中') {
      interval = setInterval(() => {
        setData(prev => {
          const newFlow = prev.status === '测试中' ? 
            prev.flowRate + (Math.random() * 20 - 10) : 
            prev.flowRate + (Math.random() * 4 - 2);
          
          return {
            ...prev,
            flowRate: Math.max(0, Math.min(150, newFlow)),
            vibration: Math.max(1.0, Math.min(5.0, prev.vibration + (Math.random() * 0.2 - 0.1))),
            motorTemp: Math.max(40, Math.min(90, prev.motorTemp + (Math.random() * 1 - 0.5))),
            efficiency: Math.max(60, Math.min(95, prev.efficiency + (Math.random() * 0.4 - 0.2)))
          };
        });
      }, 2000);
    } else if (data.status === '停机检修') {
      interval = setInterval(() => {
        setData(prev => {
          if (prev.maintenanceProgress >= 100) {
            clearInterval(interval);
            return { ...prev, status: '测试中', maintenanceProgress: 0, flowRate: 50, vibration: 1.5, motorTemp: 45, efficiency: 92 };
          }
          return { ...prev, maintenanceProgress: prev.maintenanceProgress + 1.5, flowRate: 0 };
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [data.status]);

  const handleStartMaintenance = () => {
    setData(prev => ({ ...prev, status: '停机检修', maintenanceProgress: 0, flowRate: 0 }));
  };

  const handleCompleteTest = () => {
    setData(prev => ({ ...prev, status: '运行中', flowRate: 120 }));
  };

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      <div className="bg-[#0b1221]/90 border border-slate-800 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
              <Droplet size={32} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-widest uppercase italic">
                  大型泵站年度检修排程 <span className="text-cyan-500 text-xl not-italic tracking-normal">// ANNUAL_OVERHAUL</span>
              </h1>
              <div className="flex gap-6 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                 <span className="flex items-center gap-1"><Wrench size={12} className="text-cyan-500"/> 状态: {data.status}</span>
                 <span className="flex items-center gap-1"><Calendar size={12} className="text-cyan-500"/> 计划周期: 1年</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShow3D(!show3D)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm transition-colors"
          >
            {show3D ? '隐藏3D视图' : '显示3D视图'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className={`flex flex-col gap-6 transition-all duration-500 ${show3D ? 'w-full lg:w-1/4' : 'w-full'}`}>
          <SciFiCard title="检修控制面板" className="flex-none border-cyan-800/30">
            <div className="flex flex-col gap-3 mb-4">
              <button 
                onClick={handleStartMaintenance}
                disabled={data.status !== '运行中'}
                className="px-3 py-3 rounded bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/50 transition duration-300 flex items-center justify-center gap-2 text-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wrench size={16} /> 开始年度检修
              </button>
              <button 
                onClick={handleCompleteTest}
                disabled={data.status !== '测试中'}
                className="px-3 py-3 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 transition duration-300 flex items-center justify-center gap-2 text-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} /> 测试通过，恢复运行
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-400 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-cyan-500" /> 计划开始:</span>
                <span className="font-mono text-cyan-400">2024-05-01</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-cyan-500" /> 计划结束:</span>
                <span className="font-mono text-slate-300">2024-05-15</span>
              </div>
              <div className="mb-2 mt-2">
                 <div className="flex justify-between text-sm text-slate-400 mb-1">
                   <span>检修进度</span>
                   <span>{data.maintenanceProgress.toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2">
                   <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${data.maintenanceProgress}%` }}></div>
                 </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        <div className={`w-full lg:w-1/2 h-full transition-all duration-500 ${show3D ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
          <SciFiCard title="大型泵站三维模型" className="h-full flex flex-col overflow-hidden border-cyan-800/30">
            {show3D && <ThreeScene 
                  flowRate={data.flowRate} 
                  status={data.status} 
                  maintenanceProgress={data.maintenanceProgress} 
                />}
          </SciFiCard>
        </div>

        <div className={`flex flex-col gap-6 transition-all duration-500 ${show3D ? 'w-full lg:w-1/4' : 'w-full'}`}>
          <SciFiCard title="运行监测数据" className="flex-1 border-cyan-800/30">
            <div className={`grid gap-4 text-sm h-full ${show3D ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-blue-500" /> 轴承振动</div>
                <span className={`font-mono text-2xl ${data.vibration > 4 ? 'text-red-400' : 'text-blue-300'}`}>{data.vibration.toFixed(2)} mm/s</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Gauge size={18} className="text-amber-500" /> 电机温度</div>
                <span className={`font-mono text-2xl ${data.motorTemp > 85 ? 'text-red-400' : 'text-amber-300'}`}>{data.motorTemp.toFixed(1)} °C</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Droplet size={18} className="text-cyan-500" /> 当前流量</div>
                <span className="font-mono text-cyan-300 text-2xl">{data.flowRate.toFixed(1)} m³/s</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-emerald-500" /> 机组效率</div>
                <span className="font-mono text-emerald-300 text-2xl">{data.efficiency.toFixed(1)} %</span>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
