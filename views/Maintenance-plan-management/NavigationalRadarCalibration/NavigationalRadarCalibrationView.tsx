import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-plan-management/NavigationalRadarCalibration/ThreeScene';
import { TimelineWidget, ChartWidget, ResourceWidget, RiskWidget, DocumentWidget, CameraWidget, ParameterWidget } from '../../../components/SciFiWidgets';
import { Settings, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NavigationalRadarCalibrationView: React.FC = () => {
  const [data, setData] = useState({
    rotationSpeed: 24, // RPM
    isCalibrating: false,
    signalStrength: 85,
    bearingError: 1.2,
    rangeError: 0.5,
    magnetronCurrent: 6.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        if (prev.isCalibrating) {
          return {
            ...prev,
            rotationSpeed: 12, // Slow down for calibration
            signalStrength: Math.min(100, prev.signalStrength + 1),
            bearingError: Math.max(0.1, prev.bearingError - 0.1),
            rangeError: Math.max(0.05, prev.rangeError - 0.05)
          };
        }
        return {
          ...prev,
          rotationSpeed: 24 + (Math.random() - 0.5) * 2,
          signalStrength: 85 + (Math.random() - 0.5) * 5,
          bearingError: Math.min(3.0, prev.bearingError + 0.01),
          rangeError: Math.min(1.0, prev.rangeError + 0.01),
          magnetronCurrent: 6.5 + (Math.random() - 0.5) * 0.2
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleCalibration = () => {
    setData(prev => ({ ...prev, isCalibrating: !prev.isCalibrating }));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-[Rajdhani]">
      <div className="mb-8 flex justify-between items-end border-b border-green-500/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-wider uppercase">
            航海雷达系统标定测试
          </h1>
          <p className="text-green-500/70 mt-2 font-mono text-sm">MARINE NAVIGATIONAL RADAR CALIBRATION & TESTING</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleToggleCalibration}
            className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-all duration-300 ${
              data.isCalibrating 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
            }`}
          >
            {data.isCalibrating ? '完成标定 (恢复正常扫描)' : '启动标定程序 (盲区/方位校准)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Radar View */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <SciFiCard title="雷达天线 3D 扫描状态" className="flex-1 min-h-[600px] relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <div className="bg-slate-900/80 border border-slate-700 px-3 py-1 rounded flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isCalibrating ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs text-slate-300">{data.isCalibrating ? '目标回波校准中' : '全天候监视扫描'}</span>
              </div>
            </div>
            <div className="absolute inset-0 m-4 border border-green-500/20 rounded-full overflow-hidden bg-gradient-to-b from-[#000510] to-[#001100]">
              <ThreeScene 
                rotationSpeed={data.rotationSpeed} 
                isCalibrating={data.isCalibrating} 
                signalStrength={data.signalStrength} 
              />
            </div>
          </SciFiCard>
        </div>

        {/* Right Column: Calibration Data & Schedule */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SciFiCard title="雷达收发机性能参数" className="h-auto">
            <div className="grid grid-cols-2 gap-4">
              <ParameterWidget parameters={[
                { label: '天线转速', value: data.rotationSpeed.toFixed(1), unit: 'RPM', status: data.rotationSpeed < 20 && !data.isCalibrating ? 'warning' : 'normal' },
                { label: '磁控管电流', value: data.magnetronCurrent.toFixed(1), unit: 'A', status: data.magnetronCurrent < 5.0 ? 'critical' : 'normal' },
                { label: '回波信号强度', value: data.signalStrength.toFixed(0), unit: '%', status: data.signalStrength < 60 ? 'warning' : 'normal' }
              ]} />
              <ParameterWidget parameters={[
                { label: '方位误差 (Bearing)', value: data.bearingError.toFixed(2), unit: '°', status: data.bearingError > 1.0 ? 'critical' : 'normal' },
                { label: '距离误差 (Range)', value: data.rangeError.toFixed(2), unit: 'NM', status: data.rangeError > 0.5 ? 'critical' : 'normal' },
                { label: '盲区测试 (Blind Sector)', value: 'PASS', unit: '', status: 'normal' }
              ]} />
            </div>
          </SciFiCard>

          <SciFiCard title="年度标定测试流程" className="h-[250px]">
            <TimelineWidget steps={[
              { time: '09:00', title: '断开高压电源、天线外观检查', status: data.isCalibrating ? 'done' : 'pending' },
              { time: '10:00', title: '磁控管老化测试与电流测量', status: data.isCalibrating ? 'active' : 'pending' },
              { time: '11:30', title: '收发机调谐 (Tuning) 优化', status: data.isCalibrating ? 'active' : 'pending' },
              { time: '14:00', title: '利用已知陆标进行方位/距离校准', status: 'pending' },
              { time: '16:00', title: '性能监视器 (PM) 测试', status: 'pending' },
              { time: '17:00', title: '生成标定报告、恢复正常运行', status: 'pending' }
            ]} />
          </SciFiCard>

          <div className="grid grid-cols-2 gap-6 flex-1">
            <SciFiCard title="测试仪器与备件" className="h-full">
              <ResourceWidget resources={[
                { name: 'X波段磁控管', allocated: 1, total: 2, unit: '个' },
                { name: '微波功率计', allocated: 1, total: 1, unit: '台' },
                { name: '频谱分析仪', allocated: 1, total: 1, unit: '台' },
                { name: '通导工程师', allocated: 2, total: 2, unit: '人' }
              ]} />
            </SciFiCard>

            <SciFiCard title="电磁辐射与高压安全" className="h-full">
              <RiskWidget risks={[
                { level: 'high', desc: '微波辐射：天线运转时严禁人员靠近桅杆' },
                { level: 'high', desc: '高压电击：打开收发机前必须放电并接地' },
                { level: 'medium', desc: '高空作业：登桅杆检查需佩戴全身式安全带' }
              ]} />
            </SciFiCard>
          </div>
        </div>
      </div>
    </div>
  );
};
