import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/OverheadCraneTrack/ThreeScene';
// 2026-07-09 新增：模型库跳转链接（场景库测试方案 8.4）
import { ModelLibraryLink } from '../../../src/scenarioLib/ModelLibraryLink';
// MODEL_LIB_LINK[mpm-64]: 2026-07-09 新增，占位模型库地址；
// 模型库正式上线后，只需把下面这一行的 url 改成真实地址即可，其余逻辑不用动。
const MODEL_LIB_URL = 'https://industrial-intelligent-cockpit.example.com/model-lib/models/mpm-64';
import { TimelineWidget, ResourceWidget, RiskWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Ruler, MapPin } from 'lucide-react';

export const OverheadCraneTrackView: React.FC = () => {
  const [data, setData] = useState({
    cranePosition: -30,
    deviation: 0,
    isCalibrating: false,
    leftRailHeight: 10.00,
    rightRailHeight: 10.00,
    span: 15.00
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data.isCalibrating) {
      interval = setInterval(() => {
        setData(prev => {
          const newPos = prev.cranePosition + 0.5;
          if (newPos > 30) {
            return { ...prev, cranePosition: -30, isCalibrating: false, deviation: 0 };
          }
          
          // Simulate finding a deviation around position 10
          let newDev = 0;
          if (newPos > 5 && newPos < 15) {
            newDev = Math.sin((newPos - 5) * Math.PI / 10) * 1.5; // Max deviation 1.5mm
          }

          return {
            ...prev,
            cranePosition: newPos,
            deviation: newDev,
            leftRailHeight: 10.00 + (Math.random() - 0.5) * 0.01,
            rightRailHeight: 10.00 + newDev * 0.01,
            span: 15.00 + (Math.random() - 0.5) * 0.02
          };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [data.isCalibrating]);

  const handleToggleCalibration = () => {
    setData(prev => ({ ...prev, isCalibrating: !prev.isCalibrating, cranePosition: -30, deviation: 0 }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani] flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider uppercase">
            厂房桥式起重机大车轨道校正
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-sm">OVERHEAD CRANE RUNWAY ALIGNMENT & CALIBRATION</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleCalibration}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              data.isCalibrating 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Ruler size={18} />
            {data.isCalibrating ? '激光扫描校正中' : '启动全行程激光扫描'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Data & Controls */}
        <div className="flex flex-col gap-6">
          <SciFiCard title="轨道几何参数实时监测" className="flex-1">
            <div className="flex flex-col h-full justify-around py-4">
              <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 text-lg">当前扫描位置 (X轴)</span>
                <span className="text-4xl font-bold text-cyan-400">
                  {data.cranePosition.toFixed(1)} <span className="text-xl">m</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 text-lg">横向偏差 (Y轴)</span>
                <span className={`text-4xl font-bold ${Math.abs(data.deviation) > 1.0 ? 'text-red-500' : 'text-green-400'}`}>
                  {data.deviation.toFixed(2)} <span className="text-xl">mm</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 text-lg">左轨标高 (Z轴)</span>
                <span className="text-3xl font-bold text-blue-400">
                  {data.leftRailHeight.toFixed(3)} <span className="text-lg">m</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 text-lg">右轨标高 (Z轴)</span>
                <span className={`text-3xl font-bold ${Math.abs(data.rightRailHeight - 10) > 0.01 ? 'text-yellow-500' : 'text-blue-400'}`}>
                  {data.rightRailHeight.toFixed(3)} <span className="text-lg">m</span>
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 text-lg">跨度 (Span)</span>
                <span className="text-3xl font-bold text-purple-400">
                  {data.span.toFixed(3)} <span className="text-lg">m</span>
                </span>
              </div>
            </div>
          </SciFiCard>

          <SciFiCard title="校正作业指导书">
            <TimelineWidget steps={[
              { time: 'T-1', title: '清理轨道表面油污及杂物，安装全站仪反射棱镜', status: data.isCalibrating ? 'done' : 'pending' },
              { time: 'T-2', title: '起重机空载慢速运行，进行全行程激光扫描记录', status: data.isCalibrating ? 'active' : 'pending' },
              { time: 'T-3', title: '分析偏差数据，定位超标区段 (直线度、高低差、跨度)', status: data.cranePosition > 30 ? 'active' : 'pending' },
              { time: 'T-4', title: '松开压板，使用千斤顶及垫片进行物理校正', status: 'pending' },
              { time: 'T-5', title: '紧固压板，复测确认各项参数符合 GB/T 10183 标准', status: 'pending' }
            ]} />
          </SciFiCard>
        </div>

        {/* Center/Right Column: 3D Visualization */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SciFiCard title="轨道三维空间形态分析" className="flex-1 relative min-h-[500px]">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <MapPin size={14} className={Math.abs(data.deviation) > 1.0 ? 'text-red-500' : 'text-cyan-500'} />
                <span className="text-xs text-slate-300">
                  状态: {data.isCalibrating ? '扫描中...' : '待机'} | 最大允许偏差: ±1.5mm
                </span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 mt-12 border border-cyan-500/20 rounded-lg overflow-hidden bg-[#0a101a]">
              <ThreeScene 
                cranePosition={data.cranePosition} 
                deviation={data.deviation} 
                isCalibrating={data.isCalibrating}
              />
            </div>
            <div className="absolute bottom-4 right-4 z-20">
              <ModelLibraryLink url={MODEL_LIB_URL} />
            </div>
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6">
            <SciFiCard title="测量设备及工具">
              <ResourceWidget resources={[
                { name: '高精度全站仪 (Leica TS16)', allocated: 1, total: 1, unit: '套' },
                { name: '激光测距仪', allocated: 2, total: 2, unit: '台' },
                { name: '液压千斤顶 (50T)', allocated: 4, total: 4, unit: '台' },
                { name: '标准调整垫片组', allocated: 100, total: 100, unit: '片' }
              ]} />
            </SciFiCard>
            <SciFiCard title="高空作业安全警示">
              <RiskWidget risks={[
                { level: 'high', desc: '高空坠落风险：作业人员必须全程佩戴双大钩安全带，并挂靠在生命线上。' },
                { level: 'high', desc: '触电风险：滑触线必须断电并挂牌上锁 (LOTO)，验电后方可作业。' },
                { level: 'medium', desc: '交叉作业风险：下方区域必须设置警戒线，禁止人员停留或通行。' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
