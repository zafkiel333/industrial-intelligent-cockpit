import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/MooringWinchBrake/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const MooringWinchBrakeView: React.FC = () => {
  const [data, setData] = useState({
    brakeWear: 78,
    isReplacing: false,
    tension: 65,
    holdingCapacity: 45,
    brakeBandThickness: 12.5,
    hydraulicPressure: 180
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isReplacing) {
          return {
            ...prev,
            brakeWear: Math.max(0, prev.brakeWear - 5),
            tension: 0,
            holdingCapacity: Math.min(100, prev.holdingCapacity + 5),
            brakeBandThickness: Math.min(25, prev.brakeBandThickness + 1),
            hydraulicPressure: 0
          };
        }
        return {
          ...prev,
          brakeWear: Math.min(100, prev.brakeWear + 0.05),
          tension: 65 + (Math.random() - 0.5) * 15,
          holdingCapacity: Math.max(30, prev.holdingCapacity - 0.05),
          brakeBandThickness: Math.max(8, prev.brakeBandThickness - 0.01),
          hydraulicPressure: 180 + (Math.random() - 0.5) * 5
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReplace = () => {
    setData(prev => ({ ...prev, isReplacing: !prev.isReplacing }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-amber-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 tracking-wider uppercase">
            系泊绞车刹车片更换排期
          </h1>
          <p className="text-amber-500/70 mt-2 font-mono text-sm">MOORING WINCH BRAKE BAND REPLACEMENT SCHEDULE</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleReplace}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isReplacing 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30'
            }`}
          >
            {data.isReplacing ? '完成更换 (恢复系泊)' : '启动更换 (释放缆绳张力)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Half: 3D Model and Key Params */}
        <div className="lg:col-span-8">
          <SciFiCard title="绞车刹车机构 3D 状态" className="h-[450px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isReplacing ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs text-slate-300">{data.isReplacing ? '刹车带拆卸更换中' : '受力系泊状态'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-amber-500/20 rounded-lg overflow-hidden bg-gradient-to-b from-[#111111] to-[#050505]">
              <ThreeScene 
                brakeWear={data.brakeWear} 
                isReplacing={data.isReplacing} 
                tension={data.tension} 
              />
            </div>
          </SciFiCard>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <SciFiCard title="刹车性能评估" className="flex-1">
            <div className="space-y-4">
              <ParameterWidget parameters={[
                { label: '刹车带磨损率', value: data.brakeWear.toFixed(1), unit: '%', status: data.brakeWear > 75 ? 'critical' : 'normal' },
                { label: '剩余厚度', value: data.brakeBandThickness.toFixed(1), unit: 'mm', status: data.brakeBandThickness < 10 ? 'warning' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '刹车保持力 (BHC)', value: data.holdingCapacity.toFixed(1), unit: 't', status: data.holdingCapacity < 50 ? 'critical' : 'normal' },
                { label: '当前缆绳张力', value: data.tension.toFixed(1), unit: 't', status: data.tension > data.holdingCapacity * 0.8 ? 'warning' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '液压系统压力', value: data.hydraulicPressure.toFixed(0), unit: 'bar', status: 'normal' },
                { label: '更换阈值厚度', value: '8.0', unit: 'mm', status: 'normal' }
              ]} />
            </div>
          </SciFiCard>
        </div>
      </div>

      {/* Bottom Half: Schedule and Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SciFiCard title="刹车带更换作业流程" className="h-[300px]">
            <TimelineWidget steps={[
              { time: '08:00', title: '缆绳移交其他绞车、释放张力', status: data.isReplacing ? 'done' : 'pending' },
              { time: '09:00', title: '断开液压/手动刹车机构', status: data.isReplacing ? 'active' : 'pending' },
              { time: '10:30', title: '拆卸旧刹车带、清洁刹车鼓', status: data.isReplacing ? 'active' : 'pending' },
              { time: '13:00', title: '安装新刹车带、调整间隙', status: 'pending' },
              { time: '15:00', title: '连接机构、进行刹车力测试 (BHC Test)', status: 'pending' },
              { time: '17:00', title: '测试合格、恢复系泊作业', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 flex-1">
            <SciFiCard title="备件与工具" className="h-full">
              <ResourceWidget resources={[
                { name: '无石棉刹车带', allocated: 1, total: 1, unit: '卷' },
                { name: '铜铆钉/螺栓组', allocated: 50, total: 50, unit: '套' },
                { name: '液压千斤顶 (测试用)', allocated: 1, total: 1, unit: '台' },
                { name: '甲板水手/机工', allocated: 3, total: 3, unit: '人' }
              ]} />
            </SciFiCard>

            <SciFiCard title="高风险作业管控" className="h-full">
              <RiskWidget risks={[
                { level: 'high', desc: '缆绳反弹 (Snap-back)：转移张力时清空危险区' },
                { level: 'high', desc: '机械夹伤：操作刹车连杆时严禁手伸入间隙' },
                { level: 'medium', desc: '粉尘吸入：清理旧刹车带时佩戴防尘口罩' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
