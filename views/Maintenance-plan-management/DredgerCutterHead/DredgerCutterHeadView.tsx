import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/DredgerCutterHead/ThreeScene';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Anchor, Settings } from 'lucide-react';

export const DredgerCutterHeadView: React.FC = () => {
  const [data, setData] = useState({
    rpm: 30,
    wearLevel: 85,
    isReplacing: false,
    torque: 450,
    depth: -18.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isReplacing) {
          return {
            ...prev,
            rpm: 0,
            wearLevel: Math.max(0, prev.wearLevel - 2),
            torque: 0,
            depth: 0
          };
        }
        return {
          ...prev,
          rpm: 30 + (Math.random() - 0.5) * 5,
          wearLevel: Math.min(100, prev.wearLevel + 0.1),
          torque: 450 + (Math.random() - 0.5) * 50,
          depth: -18.5 + (Math.random() - 0.5) * 0.2
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReplace = () => {
    setData(prev => ({ ...prev, isReplacing: !prev.isReplacing }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani] flex flex-col">
      <div className="mb-6 flex justify-between items-end border-b border-amber-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 tracking-wider uppercase">
            挖泥船绞刀头齿套更换
          </h1>
          <p className="text-amber-500/70 mt-2 font-mono text-sm">DREDGER CUTTER HEAD TEETH REPLACEMENT</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleReplace}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isReplacing 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Settings size={18} />
            {data.isReplacing ? '水下更换作业中' : '启动水下更换作业'}
          </button>
        </div>
      </div>

      <div className="relative flex-1 rounded-xl overflow-hidden border border-amber-500/30 min-h-[700px]">
        <div className="absolute inset-0 z-0 bg-[#001122]">
          <ThreeScene 
            rpm={data.rpm} 
            wearLevel={data.wearLevel} 
            isReplacing={data.isReplacing} 
          />
        </div>
        
        {/* Top Bar Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-[#001122] to-transparent flex justify-between items-start pointer-events-none">
           <div className="bg-slate-900/80 backdrop-blur border border-amber-500/50 px-4 py-2 rounded text-amber-400 font-bold flex items-center gap-2 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
             <Anchor size={16} />
             当前作业深度: {data.depth.toFixed(1)}m | 海底地质: 中等硬度黏土/砂岩
           </div>
        </div>

        {/* Left Floating Panel */}
        <div className="absolute top-20 left-6 bottom-6 w-80 z-10 flex flex-col gap-4 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur border border-amber-500/30 p-5 rounded-lg flex-1 overflow-y-auto custom-scrollbar shadow-lg shadow-black/50">
            <h3 className="text-lg font-bold text-amber-400 mb-4 border-b border-amber-500/30 pb-2">切削动力参数</h3>
            <ParameterWidget parameters={[
              { label: '绞刀转速', value: data.rpm.toFixed(1), unit: 'rpm', status: data.rpm > 35 ? 'warning' : 'normal' },
              { label: '切削扭矩', value: data.torque.toFixed(0), unit: 'kNm', status: data.torque > 500 ? 'warning' : 'normal' }
            ]} />
            
            <h3 className="text-lg font-bold text-amber-400 mt-6 mb-4 border-b border-amber-500/30 pb-2">齿套磨损评估</h3>
            <ParameterWidget parameters={[
              { label: '平均磨损率', value: data.wearLevel.toFixed(1), unit: '%', status: data.wearLevel > 80 ? 'critical' : 'normal' },
              { label: '预计剩余寿命', value: Math.max(0, 100 - data.wearLevel).toFixed(0), unit: 'h', status: 'normal' }
            ]} />

            <h3 className="text-lg font-bold text-amber-400 mt-6 mb-4 border-b border-amber-500/30 pb-2">水下作业风险</h3>
            <RiskWidget risks={[
              { level: data.wearLevel > 80 ? 'high' : 'medium', desc: `齿套磨损 ${data.wearLevel.toFixed(1)}%，${data.wearLevel > 80 ? '切削效率严重下降，需立即更换' : '持续监测中'}` },
              { level: 'high', desc: '潜水作业风险：水下能见度极低，存在绞缠风险' }
            ]} />
          </div>
        </div>

        {/* Right Floating Panel */}
        <div className="absolute top-20 right-6 bottom-6 w-96 z-10 flex flex-col gap-4 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur border border-amber-500/30 p-5 rounded-lg flex-1 overflow-y-auto custom-scrollbar shadow-lg shadow-black/50">
            <h3 className="text-lg font-bold text-amber-400 mb-4 border-b border-amber-500/30 pb-2">水下更换标准作业程序</h3>
            <TimelineWidget steps={[
              { time: '07:00', title: '停机，绞刀桥架提升至水面或浅水区', status: 'done' },
              { time: '08:30', title: '潜水员下水，清理绞刀头缠绕物及淤泥', status: 'active' },
              { time: '10:00', title: '使用水下液压工具拆卸磨损齿套及销轴', status: 'pending' },
              { time: '13:00', title: '安装新齿套，敲击销轴锁定', status: 'pending' },
              { time: '16:00', title: '潜水员出水，绞刀头空载试转', status: 'pending' },
              { time: '17:30', title: '下放桥架，恢复疏浚作业', status: 'pending' }
            ]} />

            <h3 className="text-lg font-bold text-amber-400 mt-6 mb-4 border-b border-amber-500/30 pb-2">维保资源调配</h3>
            <ResourceWidget resources={[
              { name: '高耐磨合金齿套', allocated: 45, total: 45, unit: '个' },
              { name: '固定销轴及卡环', allocated: 45, total: 50, unit: '套' },
              { name: '水下液压拆装工具', allocated: 2, total: 2, unit: '套' },
              { name: '重装潜水员', allocated: 2, total: 2, unit: '人' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
};
