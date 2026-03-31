import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/ReservoirDesilting/ThreeScene';
import { Calendar, Wrench, Waves, Map, AlertTriangle, CheckCircle, Navigation, BarChart3, Activity } from 'lucide-react';

export const ReservoirDesiltingView: React.FC = () => {
  const [data, setData] = useState({
    siltLevel: 65, // Percentage
    waterLevel: 125.5, // meters
    turbidity: 45, // NTU
    dredgerStatus: '待命',
    status: '待作业' as '待作业' | '作业中' | '已完成',
    progress: 0
  });

  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data.status === '作业中') {
      interval = setInterval(() => {
        setData(prev => {
          if (prev.progress >= 100) {
            clearInterval(interval);
            return { 
              ...prev, 
              status: '已完成', 
              progress: 100, 
              siltLevel: 15, 
              turbidity: 15,
              dredgerStatus: '返航'
            };
          }
          return { 
            ...prev, 
            progress: prev.progress + 0.5,
            siltLevel: Math.max(15, prev.siltLevel - 0.25),
            turbidity: Math.min(120, prev.turbidity + (Math.random() * 5 - 1)),
            dredgerStatus: '清淤中'
          };
        });
      }, 500);
    } else if (data.status === '待作业' || data.status === '已完成') {
      interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          waterLevel: prev.waterLevel + (Math.random() * 0.1 - 0.05),
          turbidity: Math.max(10, prev.turbidity - (Math.random() * 2))
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [data.status]);

  const handleStart = () => {
    setData(prev => ({ ...prev, status: '作业中', progress: 0, dredgerStatus: '前往作业区' }));
  };

  const handleReset = () => {
    setData(prev => ({ ...prev, status: '待作业', progress: 0, siltLevel: 65, dredgerStatus: '待命' }));
  };

  return (
    <div className="flex flex-col h-full gap-5 text-slate-100 font-[Rajdhani]">
      <div className="bg-[#0b1221]/90 border border-slate-800 p-5 clip-corner shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <Waves size={32} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-widest uppercase italic">
                  水库清淤清障作业计划 <span className="text-blue-500 text-xl not-italic tracking-normal">// RESERVOIR_DESILTING</span>
              </h1>
              <div className="flex gap-6 text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                 <span className="flex items-center gap-1"><Wrench size={12} className="text-blue-500"/> 状态: {data.status}</span>
                 <span className="flex items-center gap-1"><Map size={12} className="text-blue-500"/> 作业区: A-03区</span>
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

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        <div className="w-full lg:w-2/3 flex flex-col gap-5 relative">
           {show3D && (
             <div className="flex-1 bg-[#020617] border border-blue-500/20 rounded-sm relative group overflow-hidden min-h-[400px]">
                <ThreeScene 
                  siltLevel={data.siltLevel} 
                  status={data.status} 
                  progress={data.progress} 
                />
                
                {/* Overlay UI */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-sm">
                    <div className="text-xs text-slate-400 mb-1">当前淤积率</div>
                    <div className={`text-2xl font-bold font-mono ${data.siltLevel > 50 ? 'text-red-400' : 'text-blue-400'}`}>
                      {data.siltLevel.toFixed(1)} %
                    </div>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-sm">
                    <div className="text-xs text-slate-400 mb-1">清淤船状态</div>
                    <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                      <Navigation size={16} />
                      {data.dredgerStatus}
                    </div>
                  </div>
                </div>

                {data.status === '作业中' && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2/3">
                    <div className="bg-slate-900/90 border border-blue-500/50 p-4 rounded-sm backdrop-blur text-center">
                      <div className="text-blue-400 font-bold mb-2">清淤作业进行中</div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-300" 
                          style={{ width: `${data.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-2">预计剩余时间: {((100 - data.progress) * 0.5).toFixed(0)} 分钟</div>
                    </div>
                  </div>
                )}
             </div>
           )}
           
           <div className="grid grid-cols-2 gap-4">
             <SciFiCard title="水文及水质数据" className="flex-1">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Waves size={16} className="text-cyan-400" />
                      <span>水库水位</span>
                    </div>
                    <div className="font-mono text-cyan-400">
                      {data.waterLevel.toFixed(2)} m
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <span>水体浊度</span>
                    </div>
                    <div className={`font-mono ${data.turbidity > 80 ? 'text-red-400' : 'text-amber-400'}`}>
                      {data.turbidity.toFixed(1)} NTU
                    </div>
                  </div>
                </div>
             </SciFiCard>
             <SciFiCard title="作业计划信息" className="flex-1">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <BarChart3 size={16} className="text-emerald-400" />
                      <span>计划清淤量</span>
                    </div>
                    <div className="font-mono text-emerald-400">150,000 m³</div>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={16} className="text-emerald-400" />
                      <span>计划工期</span>
                    </div>
                    <div className="font-mono text-emerald-400">45 天</div>
                  </div>
                </div>
             </SciFiCard>
           </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-5">
           <SciFiCard title="作业控制面板" className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                  <h3 className="text-sm font-bold text-slate-300 mb-2">作业区状态评估</h3>
                  <div className="flex items-center gap-3">
                    {data.status === '待作业' ? (
                      <AlertTriangle className="text-amber-500" size={24} />
                    ) : data.status === '作业中' ? (
                      <Activity className="text-blue-500" size={24} />
                    ) : (
                      <CheckCircle className="text-emerald-500" size={24} />
                    )}
                    <span className={`text-lg font-bold ${
                      data.status === '待作业' ? 'text-amber-400' : 
                      data.status === '作业中' ? 'text-blue-400' : 'text-emerald-400'
                    }`}>
                      {data.status === '待作业' ? '淤积严重，需清淤' : data.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleStart}
                    disabled={data.status !== '待作业'}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation size={18} />
                    启动清淤作业
                  </button>
                  <button 
                    onClick={handleReset}
                    disabled={data.status !== '已完成'}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} />
                    重置计划 (模拟)
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-3">清淤作业流程</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${data.progress > 0 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      清淤船进场就位
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${data.progress > 20 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      排泥管线铺设连接
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${data.progress > 40 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      绞吸式清淤作业
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${data.progress > 80 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      底床平整度检测
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${data.progress >= 100 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      设备撤场及验收
                    </li>
                  </ul>
                </div>
              </div>
           </SciFiCard>
        </div>
      </div>
    </div>
  );
};
