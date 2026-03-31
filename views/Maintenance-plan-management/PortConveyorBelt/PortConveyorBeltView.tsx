import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/PortConveyorBelt/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PortConveyorBeltView: React.FC = () => {
  const [data, setData] = useState({
    beltSpeed: 4.5, // m/s
    isOverhauling: false,
    rollerWear: 68,
    beltTension: 120, // kN
    motorTemp: 65,
    throughput: 4500 // t/h
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isOverhauling) {
          return {
            ...prev,
            beltSpeed: 0,
            throughput: 0,
            rollerWear: Math.max(0, prev.rollerWear - 2),
            motorTemp: Math.max(25, prev.motorTemp - 2),
            beltTension: 0 // Tension released
          };
        }
        return {
          ...prev,
          beltSpeed: 4.5 + (Math.random() - 0.5) * 0.2,
          throughput: 4500 + (Math.random() - 0.5) * 200,
          rollerWear: Math.min(100, prev.rollerWear + 0.05),
          motorTemp: 65 + (Math.random() - 0.5) * 3,
          beltTension: 120 + (Math.random() - 0.5) * 5
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOverhaul = () => {
    setData(prev => ({ ...prev, isOverhauling: !prev.isOverhauling }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-indigo-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 tracking-wider uppercase">
            港口散货输送带大修计划
          </h1>
          <p className="text-indigo-500/70 mt-2 font-mono text-sm">PORT BULK CONVEYOR BELT MAJOR OVERHAUL PLAN</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleOverhaul}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isOverhauling 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30'
            }`}
          >
            {data.isOverhauling ? '完成大修 (恢复输送)' : '启动大修 (停机挂牌)'}
          </button>
        </div>
      </div>

      {/* Top Half: Wide 3D View */}
      <div className="mb-6">
        <SciFiCard title="输送带系统 3D 状态监控" className="h-[400px] relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data.isOverhauling ? 'bg-orange-500 animate-pulse' : 'bg-indigo-500'}`} />
              <span className="text-xs text-slate-300">{data.isOverhauling ? '托辊/皮带更换作业中' : '全速散货输送作业'}</span>
            </div>
          </div>
          <div className="absolute inset-0 m-4 border border-indigo-500/20 rounded-lg overflow-hidden bg-[#1a1a1a]">
            <ThreeScene 
              beltSpeed={data.beltSpeed} 
              isOverhauling={data.isOverhauling} 
              rollerWear={data.rollerWear} 
            />
          </div>
        </SciFiCard>
      </div>

      {/* Bottom Half: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SciFiCard title="输送机运行核心参数" className="h-full">
          <div className="space-y-4">
            <ParameterWidget parameters={[
              { label: '皮带运行速度', value: data.beltSpeed.toFixed(2), unit: 'm/s', status: data.beltSpeed < 4.0 && !data.isOverhauling ? 'warning' : 'normal' },
              { label: '实时吞吐量', value: data.throughput.toFixed(0), unit: 't/h', status: 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '托辊平均磨损率', value: data.rollerWear.toFixed(1), unit: '%', status: data.rollerWear > 75 ? 'critical' : 'normal' },
              { label: '皮带张紧力', value: data.beltTension.toFixed(0), unit: 'kN', status: data.beltTension < 100 && !data.isOverhauling ? 'warning' : 'normal' }
            ]} />
            <ParameterWidget parameters={[
              { label: '驱动电机温度', value: data.motorTemp.toFixed(1), unit: '°C', status: data.motorTemp > 85 ? 'warning' : 'normal' },
              { label: '皮带跑偏量', value: '12', unit: 'mm', status: 'normal' }
            ]} />
          </div>
        </SciFiCard>

        <SciFiCard title="大修作业标准流程" className="h-full">
          <TimelineWidget steps={[
            { time: 'Day 1', title: '系统停机、清空物料、挂牌上锁', status: data.isOverhauling ? 'done' : 'pending' },
            { time: 'Day 2', title: '释放张紧装置、顶升皮带', status: data.isOverhauling ? 'active' : 'pending' },
            { time: 'Day 3-5', title: '批量更换重载段磨损托辊', status: data.isOverhauling ? 'active' : 'pending' },
            { time: 'Day 6-7', title: '驱动滚筒包胶修复、减速机换油', status: 'pending' },
            { time: 'Day 8', title: '皮带接头硫化探伤检查', status: 'pending' },
            { time: 'Day 9', title: '恢复张紧、空载试车与跑偏调整', status: 'pending' }
          ]} />
        </SciFiCard>

        <div className="flex flex-col gap-6">
          <SciFiCard title="大修物料与设备" className="flex-1">
            <ResourceWidget resources={[
              { name: '承载槽形托辊组', allocated: 200, total: 200, unit: '套' },
              { name: '回程平托辊', allocated: 50, total: 50, unit: '根' },
              { name: '皮带硫化机', allocated: 1, total: 1, unit: '台' },
              { name: '机械维修工', allocated: 8, total: 8, unit: '人' }
            ]} />
          </SciFiCard>

          <SciFiCard title="现场安全管控" className="flex-1">
            <RiskWidget risks={[
              { level: 'high', desc: '机械卷入：严禁在未停机时跨越或清理皮带' },
              { level: 'high', desc: '意外启动：严格执行 LOTO (挂牌上锁) 制度' },
              { level: 'medium', desc: '粉尘爆炸：煤炭/矿石粉尘区域严禁违规动火' }
            ]} />
          </SciFiCard>
        </div>
      </div>
    </div>
  );
};
