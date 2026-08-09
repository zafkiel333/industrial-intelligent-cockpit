import React, { useState, useMemo } from 'react';
import { SciFiCard } from '../../../components/SciFiCard';
import { Unit1ThreeScene } from '../../../components/cockpit/unit1-predictive/ThreeScene';
import { unifiedData, HISTORY_DIVIDER_INDEX } from '../../../src/data/unit1-predictive/data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, ReferenceArea, Brush, Legend, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Activity, AlertTriangle, Cpu, TrendingUp, Thermometer, ShieldAlert, Zap, Layers, CheckCircle } from 'lucide-react';

const differenceInHours = (dateLeft: Date, dateRight: Date) => {
  return Math.round((dateLeft.getTime() - dateRight.getTime()) / 3600000);
};

const formatTime = (isoString: string) => {
  const d = new Date(isoString);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day} ${h}:${min}`;
};

const formatTimeShort = (isoString: string) => {
  const d = new Date(isoString);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${m}-${day}`;
};

export const Unit1PredictiveView: React.FC = () => {
  // Start at exactly the division line between history and prediction
  const [scrubberIndex, setScrubberIndex] = useState(HISTORY_DIVIDER_INDEX); 
  
  const currentData = unifiedData[scrubberIndex];
  const isPrediction = scrubberIndex > HISTORY_DIVIDER_INDEX;
  
  // Format data for time-series charts, splitting into historical and predicted lines
  const chartData = useMemo(() => {
    return unifiedData.map((d, i) => {
       const maxTemp = Math.max(...d.pads);
       const avgTemp = d.pads.reduce((a, b) => a + b, 0) / 16;
       const hotSpotId = d.pads.findIndex(t => t === maxTemp) + 1;
       const isHist = i <= HISTORY_DIVIDER_INDEX;
       
       return {
          time: d.time,
          index: i,
          hotSpotId,
          activePower: d.activePower,
          
          histPower: isHist ? d.activePower : (i === HISTORY_DIVIDER_INDEX + 1 ? unifiedData[HISTORY_DIVIDER_INDEX].activePower : null), // overlap 1 point for connection
          predPower: !isHist || i === HISTORY_DIVIDER_INDEX ? d.activePower : null,

          histMaxTemp: isHist ? maxTemp : (i === HISTORY_DIVIDER_INDEX + 1 ? Math.max(...unifiedData[HISTORY_DIVIDER_INDEX].pads) : null),
          predMaxTemp: !isHist || i === HISTORY_DIVIDER_INDEX ? maxTemp : null,

          histAvgTemp: isHist ? avgTemp : (i === HISTORY_DIVIDER_INDEX + 1 ? unifiedData[HISTORY_DIVIDER_INDEX].pads.reduce((a, b) => a + b, 0) / 16 : null),
          predAvgTemp: !isHist || i === HISTORY_DIVIDER_INDEX ? avgTemp : null,
       };
    });
  }, []);

  // Format data for radar (current snapshot of all pads)
  const radarData = useMemo(() => {
    return currentData.pads.map((temp, i) => ({
      subject: `${i+1}#`,
      temp: temp,
      fullMark: 80
    }));
  }, [currentData]);

  const timeLabel = formatTime(currentData.time);

  // Analyze the upcoming prediction window to detect anomalies and when they happen
  const analysis = useMemo(() => {
     let breachTime = null;
     let breachIndex = null;
     let breachPadId = null;
     const PREDICT_WINDOW_HOURS = 168; // 1 week
     
     for(let i = HISTORY_DIVIDER_INDEX + 1; i < unifiedData.length; i++) {
        const pData = unifiedData[i];
        const maxT = Math.max(...pData.pads);
        if (maxT > 70) {
           breachTime = pData.time;
           breachIndex = i;
           breachPadId = pData.pads.findIndex(t => t === maxT) + 1;
           break;
        }
     }
     
     const currentMaxPadIndex = currentData.pads.findIndex(t => t === Math.max(...currentData.pads)) + 1;
     
     if (breachTime) {
         const diffHours = differenceInHours(new Date(breachTime), new Date(unifiedData[HISTORY_DIVIDER_INDEX].time));
         return {
            hasAnomaly: diffHours <= PREDICT_WINDOW_HOURS,
            breachTime,
            breachIndex,
            breachPadId,
            diffHours,
            currentMaxPadIndex
         }
     } else {
         return { hasAnomaly: false, currentMaxPadIndex };
     }
  }, [currentData]);

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-4 p-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            1号机组异常预测分析 (全维推力瓦监控)
          </h2>
          <p className="text-slate-400 text-sm mt-1">融合物理信息神经网络与退化分析模型，通过时序数据综合预测未来趋势</p>
        </div>
        <div className="px-4 py-3 bg-slate-900 rounded border border-slate-700 flex flex-col gap-1 items-end shadow-inner">
           <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">预测推演中枢结论</span>
           {analysis.hasAnomaly ? (
              <span className="text-red-400 font-bold bg-red-900/30 px-2 py-0.5 rounded border border-red-500/50 flex items-center gap-2">
                 <AlertTriangle size={14}/> 发现异常: 预计 {analysis.diffHours} 小时后达到红线
              </span>
           ) : (
              <span className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-2">
                 <CheckCircle size={14}/> 一周内未见异常风险
              </span>
           )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 flex-none xl:h-[45vh] min-h-[400px]">
        {/* 3D Model View */}
        <div className="xl:w-1/3 border border-slate-800 rounded-lg overflow-hidden relative shadow-lg min-h-[300px] xl:min-h-0">
           <Unit1ThreeScene padsTemp={currentData.pads} isPrediction={isPrediction} />
           <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
             <div className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 text-xs shadow flex items-center gap-2">
                当前检视: <span className={isPrediction ? 'text-amber-400 font-mono' : 'text-blue-400 font-mono'}>{timeLabel}</span>
             </div>
           </div>
           
           <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 p-3 rounded border border-slate-700/50 shadow-xl pointer-events-auto">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] text-slate-400 tracking-wider">时间轴: 拖拉以穿越历史与预测域</span>
                 <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isPrediction ? 'bg-amber-900/50 text-amber-500 border border-amber-700/50' : 'bg-blue-900/50 text-blue-400 border border-blue-700/50'}`}>
                    {scrubberIndex} / 1439
                 </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1439" 
                value={scrubberIndex} 
                onChange={(e) => setScrubberIndex(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                 <span>历史起</span>
                 <span className="text-slate-300">当前计算 ({HISTORY_DIVIDER_INDEX})</span>
                 <span className="text-amber-600/80">预测末</span>
              </div>
           </div>
        </div>

        {/* Dashboard Status */}
        <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Radar / Matrix View for Spatial Distribution */}
           <SciFiCard title="16维推力瓦阵列热场雷图" icon={<Layers className="text-blue-400" />}>
              {isPrediction && (
                 <div className="absolute top-2 right-2 text-[10px] text-amber-500 bg-amber-900/30 px-2 py-0.5 border border-amber-700/50 rounded z-10 w-auto">预测态渲染</div>
              )}
              <div className="w-full h-[350px] xl:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[30, 80]} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar name="温度矩阵" dataKey="temp" stroke={isPrediction ? "#f59e0b" : "#0ea5e9"} fill={isPrediction ? "#f59e0b" : "#0ea5e9"} fillOpacity={isPrediction ? 0.4 : 0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
              </div>
           </SciFiCard>

           {/* Diagnostics Log */}
           <SciFiCard title={`耦合推演 | ${isPrediction ? '[预测阶段]' : '[历史阶段]'}`} icon={<Cpu className="text-purple-400" />} className="flex flex-col h-full min-h-[300px] xl:min-h-0">
             <div className="flex-1 overflow-y-auto space-y-3 text-sm pr-2 absolute inset-x-4 inset-y-12 pb-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                        <div className="text-[10px] uppercase text-slate-400 mb-1">机组功率</div>
                        <div className={`text-2xl font-mono font-bold ${currentData.activePower < 100 && isPrediction ? 'text-red-400' : 'text-blue-400'}`}>
                           {currentData.activePower.toFixed(2)} <span className="text-sm">MW</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                        <div className="text-[10px] uppercase text-slate-400 mb-1">极热点 ({analysis.currentMaxPadIndex}#)</div>
                        <div className={`text-2xl font-mono font-bold ${Math.max(...currentData.pads) > 65 ? 'text-red-500' : 'text-emerald-400'}`}>
                           {Math.max(...currentData.pads).toFixed(1)} <span className="text-sm">°C</span>
                        </div>
                    </div>
                </div>

                {/* Always retain the Alert Box as requested, but adapt text based on analysis */}
                <div className={`p-4 rounded border ${analysis.hasAnomaly ? 'bg-red-900/10 border-red-900/50' : 'bg-emerald-900/10 border-emerald-900/50'}`}>
                   <div className={`font-bold flex items-center gap-2 mb-2 ${analysis.hasAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                      {analysis.hasAnomaly ? <ShieldAlert size={16} /> : <TrendingUp size={16}/>} 
                      故障演进预测报警引擎
                   </div>
                   
                   {analysis.hasAnomaly ? (
                     <div className="text-red-200/80 leading-relaxed text-[13px] tracking-wide space-y-2">
                        <p>
                          基于回归算法的未来168小时演进推演中，检测到 <strong>{analysis.breachPadId}# 瓦</strong> 附近出现不可逆的解耦升温。
                        </p>
                        <p>
                          系统预计在 <strong>约 {analysis.diffHours} 小时后</strong> 该区域温度将突破70°C安全红线，随即将触发振动保护强制关机。
                        </p>
                     </div>
                   ) : (
                     <p className="text-emerald-200/80 leading-relaxed text-[13px] tracking-wide">
                        基于时序历史回溯与物理引擎演化，未来168小时内的16组推力瓦数据演化路线位于安全包络线内。各测点温度均随功率呈正常规律波动，<strong>未来一周内未见红线突破风险，无需报警</strong>。
                     </p>
                   )}
                </div>
             </div>
           </SciFiCard>
        </div>
      </div>

      {/* Main Charts: Interactive Timeline with Brushing */}
      <div className="w-full min-h-[400px]">
         <SciFiCard title="连续时序域：有功功率与核心瓦温趋势 (实线: 历史测量 / 虚线: 算法预测)">
            <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} syncId="timeline">
                  <defs>
                    <linearGradient id="powerHistColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="powerPredColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  
                  <XAxis 
                    dataKey="index" 
                    tickFormatter={(val) => {
                      if (val % 100 === 0) return formatTimeShort(chartData[val]?.time || chartData[0].time);
                      return '';
                    }} 
                    stroke="#475569" 
                  />
                  <YAxis yAxisId="power" orientation="left" stroke="#3b82f6" domain={[0, 300]} tick={{fontSize: 10}} />
                  <YAxis yAxisId="temp" orientation="right" stroke="#ef4444" domain={[30, 80]} tick={{fontSize: 10}} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }}
                    labelFormatter={(label) => formatTime(chartData[label as number]?.time || chartData[0].time)}
                  />
                  
                  {/* Visually distinguishing Future/Predictive area with a light shaded background */}
                  <ReferenceArea x1={HISTORY_DIVIDER_INDEX} x2={1439} yAxisId="power" fill="#f59e0b" fillOpacity={0.03} />
                  
                  {/* Absolute Timeline Divider */}
                  <ReferenceLine x={HISTORY_DIVIDER_INDEX} yAxisId="power" stroke="#94a3b8" strokeDasharray="6 6" strokeWidth={2} label={{ position: 'top', value: 'NOW / 当前时刻 (预测分割线)', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                  
                  {/* Current Viewing point Scrubber */}
                  <ReferenceLine x={scrubberIndex} yAxisId="power" stroke="#f8fafc" strokeDasharray="2 2" />

                  {/* Historical Lines (Solid) */}
                  <Area isAnimationActive={false} yAxisId="power" type="monotone" dataKey="histPower" stroke="#3b82f6" fillOpacity={1} fill="url(#powerHistColor)" name="历史: 有功功率 (MW)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="histMaxTemp" stroke="#ef4444" dot={false} strokeWidth={2} name="历史: 阵列最高温 (°C)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="histAvgTemp" stroke="#10b981" dot={false} strokeWidth={1} name="历史: 阵列均温 (°C)" />
                  
                  {/* Predicted Lines (Dashed) */}
                  <Area isAnimationActive={false} yAxisId="power" type="stepAfter" dataKey="predPower" stroke="#f59e0b" strokeDasharray="4 4" fillOpacity={1} fill="url(#powerPredColor)" name="预测: 有功功率 (MW)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="predMaxTemp" stroke="#f87171" strokeDasharray="4 4" dot={false} strokeWidth={2} name="预测: 阵列最高温 (°C)" />
                  <Line isAnimationActive={false} yAxisId="temp" type="monotone" dataKey="predAvgTemp" stroke="#34d399" strokeDasharray="4 4" dot={false} strokeWidth={1} name="预测: 阵列均温 (°C)" />
                  
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  
                  {/* Brush for zooming and detail browsing */}
                  <Brush dataKey="index" height={30} stroke="#334155" fill="#0f172a" 
                         tickFormatter={(val) => formatTimeShort(chartData[val]?.time || chartData[0].time)}
                         startIndex={800}
                         endIndex={1439}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </SciFiCard>
      </div>

    </div>
  );
};
