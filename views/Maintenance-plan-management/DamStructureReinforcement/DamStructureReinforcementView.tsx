import React, { useState, useEffect } from 'react';
import { Shield, Wrench, CalendarCheck, Activity, Play, Pause, AlertTriangle, CheckCircle } from 'lucide-react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/DamStructureReinforcement/ThreeScene';
import { DamStructureReinforcementProps } from '../../../components/Maintenance-plan-management/DamStructureReinforcement/three-types';

const fetchRealTimeData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    stressLevel: Math.random() * 5 + 2, // MPa
    displacement: Math.random() * 10, // mm
    seepageRate: Math.random() * 50 + 10, // L/min
    structuralIntegrity: Math.random() * 20 + 80, // %
    status: ['正常', '警告', '加固中', '评估中'][Math.floor(Math.random() * 4)],
    reinforcementProgress: Math.random() * 100, // %
    lastAssessment: '2025-12-10',
  };
};

export const DamStructureReinforcementView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [is3DVisible, setIs3DVisible] = useState(true);
  const [damStatus, setDamStatus] = useState('正常');

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchRealTimeData();
      setData(fetchedData);
      setDamStatus(fetchedData.status);
    };
    loadData();
    const intervalId = setInterval(loadData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAction = (action: string) => {
    switch (action) {
      case 'reinforce':
        setDamStatus('加固中');
        break;
      case 'assess':
        setDamStatus('评估中');
        break;
      case 'complete':
        setDamStatus('正常');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '正常': return 'text-emerald-400';
      case '警告': return 'text-amber-400';
      case '加固中': return 'text-blue-400';
      case '评估中': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const damProps: DamStructureReinforcementProps = {
    stressLevel: data?.stressLevel || 0,
    status: damStatus,
    reinforcementProgress: data?.reinforcementProgress || 0,
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6 bg-[#0a0f1c] text-slate-200 font-sans">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-emerald-400 tracking-wider flex items-center gap-3">
          <Shield className="text-emerald-500" size={32} />
          大坝主体结构加固排期
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIs3DVisible(!is3DVisible)} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition duration-300 flex items-center gap-2 text-sm">
            {is3DVisible ? <Pause size={16} /> : <Play size={16} />}
            {is3DVisible ? '隐藏模型' : '显示模型'}
          </button>
          <span className={`text-lg font-semibold px-3 py-1 rounded bg-slate-900 border border-slate-800 ${getStatusColor(damStatus)}`}>
            {damStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {/* Top Row: 3D Visualization */}
        <div className={`w-full transition-all duration-500 ${is3DVisible ? 'h-2/3 opacity-100 scale-100' : 'h-0 opacity-0 scale-95 pointer-events-none'}`}>
          <SciFiCard title="大坝应力与结构完整性分析" className="h-full flex flex-col overflow-hidden border-emerald-900/30">
            {is3DVisible && <ThreeScene {...damProps} />}
          </SciFiCard>
        </div>

        {/* Bottom Row: Data & Controls */}
        <div className={`flex flex-col lg:flex-row gap-6 transition-all duration-500 ${is3DVisible ? 'h-1/3' : 'h-full'}`}>
          <SciFiCard title="结构健康监测" className="flex-1 border-emerald-900/30">
            <div className={`grid gap-4 text-sm h-full ${is3DVisible ? 'grid-cols-2 lg:grid-cols-4 items-center' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center'}`}>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-amber-500" /> 最大应力</div>
                <span className="font-mono text-amber-300 text-2xl">{data?.stressLevel.toFixed(1) ?? '--'} MPa</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-rose-500" /> 坝体位移</div>
                <span className="font-mono text-rose-300 text-2xl">{data?.displacement.toFixed(2) ?? '--'} mm</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-cyan-500" /> 渗漏量</div>
                <span className="font-mono text-cyan-300 text-2xl">{data?.seepageRate.toFixed(1) ?? '--'} L/s</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Shield size={18} className="text-emerald-500" /> 结构完整性</div>
                <span className="font-mono text-emerald-300 text-2xl">{data?.structuralIntegrity.toFixed(1) ?? '--'} %</span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="加固工程指挥" className="w-full lg:w-1/3 border-emerald-900/30">
            <div className="flex flex-col gap-4 h-full justify-center">
              <div className="mb-2">
                 <div className="flex justify-between text-sm text-slate-400 mb-1">
                   <span>加固进度</span>
                   <span>{data?.reinforcementProgress.toFixed(0) ?? 0}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2">
                   <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${data?.reinforcementProgress ?? 0}%` }}></div>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleAction('assess')} className="px-3 py-3 rounded bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 transition duration-300 flex items-center justify-center gap-2 text-purple-200" disabled={damStatus === '评估中' || damStatus === '加固中'}>
                  <AlertTriangle size={16} /> 风险评估
                </button>
                <button onClick={() => handleAction('reinforce')} className="px-3 py-3 rounded bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 transition duration-300 flex items-center justify-center gap-2 text-blue-200" disabled={damStatus === '加固中'}>
                  <Wrench size={16} /> 开始加固
                </button>
                <button onClick={() => handleAction('complete')} className="px-3 py-3 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 transition duration-300 flex items-center justify-center gap-2 text-emerald-200" disabled={damStatus !== '加固中' && damStatus !== '评估中'}>
                  <CheckCircle size={16} /> 完成验收
                </button>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-2"><CalendarCheck size={16} className="text-emerald-500" /> 上次全面评估:</span>
                <span className="font-mono text-emerald-400">{data?.lastAssessment ?? '--'}</span>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
