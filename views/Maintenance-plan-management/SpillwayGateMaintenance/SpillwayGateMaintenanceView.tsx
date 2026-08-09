import React, { useState, useEffect } from 'react';
import { Shield, Wrench, CalendarCheck, Gauge, Play, Pause, RotateCcw, Info, Droplets } from 'lucide-react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/SpillwayGateMaintenance/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-1]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-1';
import { SpillwayGateMaintenanceProps } from '../../../components/Maintenance-plan-management/SpillwayGateMaintenance/three-types';

const fetchRealTimeData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    gateOpening: Math.random() * 100, // %
    waterLevel: Math.random() * 20 + 100, // m
    flowRate: Math.random() * 1000 + 500, // m³/s
    hydraulicPressure: Math.random() * 15 + 10, // MPa
    status: ['关闭', '部分开启', '全开', '维保中'][Math.floor(Math.random() * 4)],
    nextInspection: '2026-05-10',
    lastInspection: '2025-11-05',
  };
};

export const SpillwayGateMaintenanceView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [is3DVisible, setIs3DVisible] = useState(true);
  const [gateStatus, setGateStatus] = useState('关闭');

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchRealTimeData();
      setData(fetchedData);
      setGateStatus(fetchedData.status);
    };
    loadData();
    const intervalId = setInterval(loadData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAction = (action: string) => {
    switch (action) {
      case 'open':
        setGateStatus('全开');
        break;
      case 'close':
        setGateStatus('关闭');
        break;
      case 'maintain':
        setGateStatus('维保中');
        break;
      case 'reset':
        setGateStatus('关闭');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '全开': return 'text-blue-400';
      case '部分开启': return 'text-cyan-400';
      case '关闭': return 'text-gray-400';
      case '维保中': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const gateProps: SpillwayGateMaintenanceProps = {
    openingLevel: data?.gateOpening || 0,
    status: gateStatus,
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 font-sans">
      <div className="flex justify-between items-center border-b border-cyan-800/50 pb-4">
        <h1 className="text-3xl font-bold text-cyan-400 tracking-wider flex items-center gap-3">
          <Droplets className="text-cyan-500" size={32} />
          泄洪闸门定期维保
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIs3DVisible(!is3DVisible)} className="px-4 py-2 rounded bg-cyan-900/50 hover:bg-cyan-800/50 border border-cyan-700/50 transition duration-300 flex items-center gap-2 text-sm">
            {is3DVisible ? <Pause size={16} /> : <Play size={16} />}
            {is3DVisible ? '隐藏模型' : '显示模型'}
          </button>
          <span className={`text-lg font-semibold px-3 py-1 rounded bg-slate-800/50 border border-slate-700 ${getStatusColor(gateStatus)}`}>
            {gateStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className={`flex flex-col gap-6 transition-all duration-500 ${is3DVisible ? 'w-full lg:w-1/3' : 'w-full'}`}>
          <SciFiCard title="维保控制台" className="flex-none border-cyan-800/30">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => handleAction('open')} className="px-3 py-3 rounded bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 transition duration-300 flex items-center justify-center gap-2 text-blue-200" disabled={gateStatus === '全开' || gateStatus === '维保中'}>
                <Play size={16} /> 开启闸门
              </button>
              <button onClick={() => handleAction('close')} className="px-3 py-3 rounded bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 transition duration-300 flex items-center justify-center gap-2 text-slate-300" disabled={gateStatus === '关闭' || gateStatus === '维保中'}>
                <Pause size={16} /> 关闭闸门
              </button>
              <button onClick={() => handleAction('maintain')} className="px-3 py-3 rounded bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-700/50 transition duration-300 flex items-center justify-center gap-2 text-yellow-200" disabled={gateStatus === '维保中'}>
                <Wrench size={16} /> 进入维保
              </button>
              <button onClick={() => handleAction('reset')} className="px-3 py-3 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 transition duration-300 flex items-center justify-center gap-2 text-red-200" disabled={gateStatus !== '维保中' && gateStatus !== '故障'}>
                <RotateCcw size={16} /> 结束维保
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-400 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><CalendarCheck size={16} className="text-cyan-500" /> 下次定检:</span>
                <span className="font-mono text-cyan-400">{data?.nextInspection ?? '--'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2"><Info size={16} className="text-cyan-500" /> 上次维保:</span>
                <span className="font-mono text-slate-300">{data?.lastInspection ?? '--'}</span>
              </div>
            </div>
          </SciFiCard>

          <div className="flex-1 flex flex-col gap-6">
            <SciFiCard title="实时监测数据" className="flex-1 border-cyan-800/30">
              <div className="flex flex-col gap-4 text-sm h-full justify-center">
                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400"><Gauge size={18} className="text-cyan-500" /> 闸门开度</div>
                  <span className="font-mono text-cyan-300 text-xl">{data?.gateOpening.toFixed(1) ?? '--'} %</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400"><Droplets size={18} className="text-blue-500" /> 上游水位</div>
                  <span className="font-mono text-blue-300 text-xl">{data?.waterLevel.toFixed(2) ?? '--'} m</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400"><Gauge size={18} className="text-teal-500" /> 泄洪流量</div>
                  <span className="font-mono text-teal-300 text-xl">{data?.flowRate.toFixed(0) ?? '--'} m³/s</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400"><Gauge size={18} className="text-indigo-500" /> 液压系统压力</div>
                  <span className="font-mono text-indigo-300 text-xl">{data?.hydraulicPressure.toFixed(2) ?? '--'} MPa</span>
                </div>
              </div>
            </SciFiCard>
          </div>
        </div>

        <div className={`w-full lg:w-2/3 h-full transition-all duration-500 ${is3DVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
          <SciFiCard title="闸门结构与水流动力学模型" className="h-full flex flex-col overflow-hidden border-cyan-800/30">
            {is3DVisible && <ThreeScene {...gateProps} />}
            <div className="absolute top-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
