import React, { useState, useEffect } from 'react';
import { Droplet, Wrench, CalendarCheck, Activity, Play, Pause, AlertTriangle, CheckCircle } from 'lucide-react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PenstockAntiCorrosion/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-3]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-3';
import { PenstockAntiCorrosionProps } from '../../../components/Maintenance-plan-management/PenstockAntiCorrosion/three-types';

const fetchRealTimeData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    corrosionLevel: Math.random() * 30 + 10, // %
    thickness: Math.random() * 5 + 15, // mm
    pressure: Math.random() * 2 + 8, // MPa
    coatingIntegrity: Math.random() * 40 + 60, // %
    status: ['正常', '警告', '处理中', '评估中'][Math.floor(Math.random() * 4)],
    treatmentProgress: Math.random() * 100, // %
    lastTreatment: '2023-05-20',
  };
};

export const PenstockAntiCorrosionView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [is3DVisible, setIs3DVisible] = useState(true);
  const [pipeStatus, setPipeStatus] = useState('正常');

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchRealTimeData();
      setData(fetchedData);
      setPipeStatus(fetchedData.status);
    };
    loadData();
    const intervalId = setInterval(loadData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAction = (action: string) => {
    switch (action) {
      case 'treat':
        setPipeStatus('处理中');
        break;
      case 'assess':
        setPipeStatus('评估中');
        break;
      case 'complete':
        setPipeStatus('正常');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '正常': return 'text-emerald-400';
      case '警告': return 'text-amber-400';
      case '处理中': return 'text-blue-400';
      case '评估中': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const pipeProps: PenstockAntiCorrosionProps = {
    corrosionLevel: data?.corrosionLevel || 0,
    status: pipeStatus,
    treatmentProgress: data?.treatmentProgress || 0,
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6 bg-[#0a0f1c] text-slate-200 font-sans">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-emerald-400 tracking-wider flex items-center gap-3">
          <Droplet className="text-emerald-500" size={32} />
          压力钢管防腐处理计划
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIs3DVisible(!is3DVisible)} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition duration-300 flex items-center gap-2 text-sm">
            {is3DVisible ? <Pause size={16} /> : <Play size={16} />}
            {is3DVisible ? '隐藏模型' : '显示模型'}
          </button>
          <span className={`text-lg font-semibold px-3 py-1 rounded bg-slate-900 border border-slate-800 ${getStatusColor(pipeStatus)}`}>
            {pipeStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className={`flex flex-col gap-6 transition-all duration-500 ${is3DVisible ? 'w-full lg:w-1/4' : 'w-full'}`}>
          <SciFiCard title="防腐处理指挥台" className="flex-none border-emerald-900/30">
            <div className="flex flex-col gap-3 mb-4">
              <button onClick={() => handleAction('assess')} className="px-3 py-3 rounded bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 transition duration-300 flex items-center justify-center gap-2 text-purple-200" disabled={pipeStatus === '评估中' || pipeStatus === '处理中'}>
                <AlertTriangle size={16} /> 腐蚀评估
              </button>
              <button onClick={() => handleAction('treat')} className="px-3 py-3 rounded bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 transition duration-300 flex items-center justify-center gap-2 text-blue-200" disabled={pipeStatus === '处理中'}>
                <Wrench size={16} /> 开始防腐
              </button>
              <button onClick={() => handleAction('complete')} className="px-3 py-3 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 transition duration-300 flex items-center justify-center gap-2 text-emerald-200" disabled={pipeStatus !== '处理中' && pipeStatus !== '评估中'}>
                <CheckCircle size={16} /> 完成/重置
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-400 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><CalendarCheck size={16} className="text-emerald-500" /> 上次防腐处理:</span>
                <span className="font-mono text-emerald-400">{data?.lastTreatment ?? '--'}</span>
              </div>
              <div className="mb-2">
                 <div className="flex justify-between text-sm text-slate-400 mb-1">
                   <span>处理进度</span>
                   <span>{data?.treatmentProgress.toFixed(0) ?? 0}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2">
                   <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${data?.treatmentProgress ?? 0}%` }}></div>
                 </div>
              </div>
            </div>
          </SciFiCard>
        </div>

        <div className={`w-full lg:w-1/2 h-full transition-all duration-500 ${is3DVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
          <SciFiCard title="压力钢管腐蚀分析模型" className="h-full flex flex-col overflow-hidden border-emerald-900/30">
            {is3DVisible && <ThreeScene {...pipeProps} />}
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>

        <div className={`flex flex-col gap-6 transition-all duration-500 ${is3DVisible ? 'w-full lg:w-1/4' : 'w-full'}`}>
          <SciFiCard title="管道状态监测" className="flex-1 border-emerald-900/30">
            <div className={`grid gap-4 text-sm h-full ${is3DVisible ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-amber-500" /> 腐蚀程度</div>
                <span className="font-mono text-amber-300 text-2xl">{data?.corrosionLevel.toFixed(1) ?? '--'} %</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-rose-500" /> 管壁厚度</div>
                <span className="font-mono text-rose-300 text-2xl">{data?.thickness.toFixed(2) ?? '--'} mm</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Activity size={18} className="text-cyan-500" /> 内部压力</div>
                <span className="font-mono text-cyan-300 text-2xl">{data?.pressure.toFixed(2) ?? '--'} MPa</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-slate-900/50 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400"><Droplet size={18} className="text-emerald-500" /> 涂层完整度</div>
                <span className="font-mono text-emerald-300 text-2xl">{data?.coatingIntegrity.toFixed(1) ?? '--'} %</span>
              </div>
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
