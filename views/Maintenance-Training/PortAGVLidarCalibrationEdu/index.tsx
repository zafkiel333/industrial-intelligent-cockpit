import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { ThreeScene } from '../../../components/Maintenance-Training/PortAGVLidarCalibrationEdu/ThreeScene';
import { AGVLidarState } from '../../../components/Maintenance-Training/PortAGVLidarCalibrationEdu/three-types';
import { Radar, Crosshair, Settings2, AlertCircle, CheckCircle } from 'lucide-react';

export default function PortAGVLidarCalibrationEdu() {
  const [state, setState] = useState<AGVLidarState>({
    agvPosition: { x: 0, y: 0 },
    lidarAngle: 0,
    scanRadius: 10,
    obstacles: [
      { x: -5, y: -5, detected: false },
      { x: 6, y: -2, detected: false },
      { x: 3, y: 5, detected: false }
    ],
    calibrationMode: false,
    calibrationOffset: -4.5, // Initial error
    isCalibrated: false
  });

  // Lidar Scanning Simulation
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const scan = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      setState(prev => {
        // Rotate lidar (e.g., 360 degrees per second)
        let newAngle = (prev.lidarAngle + (360 * deltaTime / 1000)) % 360;
        
        // Calculate effective angle including offset error
        const effectiveAngle = (newAngle + prev.calibrationOffset + 360) % 360;

        // Simple obstacle detection logic based on effective angle
        const newObstacles = prev.obstacles.map(obs => {
          // Calculate angle to obstacle relative to AGV
          const dx = obs.x - prev.agvPosition.x;
          const dy = obs.y - prev.agvPosition.y;
          let angleToObs = Math.atan2(-dx, -dy) * (180 / Math.PI); // -dx, -dy because 0 deg is -Z in Three.js
          if (angleToObs < 0) angleToObs += 360;

          // If lidar beam is within a small threshold of the obstacle angle, mark detected
          const isDetected = Math.abs(effectiveAngle - angleToObs) < 5;
          
          // Keep it detected for a short while for visual persistence
          return { ...obs, detected: isDetected || (obs.detected && Math.random() > 0.1) };
        });

        return { ...prev, lidarAngle: newAngle, obstacles: newObstacles };
      });

      animationFrame = requestAnimationFrame(scan);
    };

    animationFrame = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const toggleCalibrationMode = () => {
    setState(prev => ({ ...prev, calibrationMode: !prev.calibrationMode }));
  };

  const adjustOffset = (amount: number) => {
    if (!state.calibrationMode) return;
    setState(prev => {
      const newOffset = Math.max(-10, Math.min(10, prev.calibrationOffset + amount));
      // If offset is very close to 0, consider it calibrated
      const isCalib = Math.abs(newOffset) < 0.1;
      return { ...prev, calibrationOffset: newOffset, isCalibrated: isCalib };
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-blue-800/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-wider">港口AGV自动导引车激光雷达标定</h1>
          <p className="text-sm text-slate-400 mt-1">Port AGV Lidar Sensor Calibration</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${state.isCalibrated ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-orange-900/50 border-orange-500 text-orange-400'}`}>
            {state.isCalibrated ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            标定状态: {state.isCalibrated ? '已校准 (Calibrated)' : '存在偏差 (Offset Error)'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          
          <SciFiCard title="雷达参数与标定控制" highlight>
            <div className="space-y-6">
              
              <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex justify-between items-center">
                <span className="text-sm text-slate-400 flex items-center gap-2"><Radar size={16}/> 扫描角度 (Angle)</span>
                <span className="font-mono font-bold text-xl text-blue-400">
                  {state.lidarAngle.toFixed(1)}°
                </span>
              </div>

              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">当前零位偏差 (Offset)</span>
                  <span className={`font-mono font-bold ${Math.abs(state.calibrationOffset) < 0.1 ? 'text-green-400' : 'text-orange-400'}`}>
                    {state.calibrationOffset > 0 ? '+' : ''}{state.calibrationOffset.toFixed(1)}°
                  </span>
                </div>
                
                <button 
                  onClick={toggleCalibrationMode}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${state.calibrationMode ? 'bg-blue-900/50 border border-blue-500 text-blue-400' : 'bg-slate-700 hover:bg-slate-600 border border-slate-500 text-slate-300'}`}
                >
                  <Crosshair size={18} />
                  {state.calibrationMode ? '退出标定模式' : '进入标定模式'}
                </button>

                {state.calibrationMode && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-3">调整软件补偿值，使雷达零度线对准正前方的标准反射靶标。</p>
                    <div className="flex gap-2">
                      <button onClick={() => adjustOffset(-1)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">-1.0°</button>
                      <button onClick={() => adjustOffset(-0.1)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">-0.1°</button>
                      <button onClick={() => adjustOffset(0.1)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+0.1°</button>
                      <button onClick={() => adjustOffset(1)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm">+1.0°</button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </SciFiCard>

          <SciFiCard title="标定原理与影响">
            <div className="space-y-3 text-sm text-slate-300">
              <p><strong>原理：</strong>激光雷达安装时存在机械公差，导致其物理零度与AGV车体正前方（航向角0度）不重合。必须通过软件输入补偿值（Offset）进行修正。</p>
              <p><strong>影响：</strong>如果未正确标定，AGV构建的地图会发生旋转偏移，导致导航轨迹偏离，严重时会引发碰撞事故或无法精准对接岸桥/场桥。</p>
              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded mt-2">
                <h4 className="font-bold text-blue-300 mb-1 flex items-center gap-2"><Settings2 size={14}/> 标定步骤</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400">
                  <li>将AGV停在标定区域，正前方放置标准反射靶标。</li>
                  <li>进入标定模式，观察雷达点云数据。</li>
                  <li>微调Offset值，直到点云中靶标的中心角度读数为0.0°。</li>
                  <li>保存参数，重启导航系统生效。</li>
                </ol>
              </div>
            </div>
          </SciFiCard>

        </div>

        {/* Right Panel - 3D View */}
        <div className="lg:col-span-8 h-full min-h-[500px] border border-slate-700 rounded-xl overflow-hidden relative bg-slate-900/50">
          <ThreeScene state={state} />
          
          <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <h3 className="font-bold text-blue-400 mb-1">AGV雷达扫描透视</h3>
            <p className="text-slate-400">
              蓝色方块为AGV，顶部为激光雷达。<br/>
              正前方的白色圆柱为标定靶标。<br/>
              进入标定模式后，调整偏差值使扫描线精准击中靶标中心。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
