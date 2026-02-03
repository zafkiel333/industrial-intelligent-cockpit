
import React, { useState, useEffect } from 'react';
import { SciFiCard } from '../../components/SciFiCard';
import { 
  Camera, 
  Mic, 
  Video, 
  Thermometer, 
  Scan, 
  Zap, 
  Activity, 
  Maximize2, 
  FileText, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Share2, 
  Trash2, 
  CheckCircle2, 
  Crosshair,
  Volume2,
  Waves,
  Eye,
  Info,
  ChevronRight,
  Focus,
  Film,
  AlertTriangle,
  Target
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis 
} from 'recharts';

// --- 模拟音频频谱数据 ---
const generateSpectrumData = () => Array.from({ length: 30 }, (_, i) => ({
  freq: i,
  val: 10 + Math.random() * 40
}));

// --- 模拟已采集媒体数据 ---
const CAPTURED_GALLERY = [
  { id: 'IMG_001', type: 'image', thumb: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200', time: '14:20:05', tags: ['油污', '腐蚀'] },
  { id: 'REC_002', type: 'audio', thumb: null, time: '14:21:12', tags: ['异响', '高频'] },
  { id: 'THM_003', type: 'thermal', thumb: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=200', time: '14:22:45', tags: ['过热', '85°C'] },
  { id: 'VID_004', type: 'video', thumb: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200', time: '14:25:30', tags: ['震动'] },
];

export const MediaCaptureView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'photo' | 'video' | 'audio' | 'thermal'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [spectrum, setSpectrum] = useState(generateSpectrumData());
  const [metadata, setMetadata] = useState({
    gps: '31.2304 N, 121.4737 E',
    lux: '420 lx',
    db: '65 dB',
    asset: 'P-101A PUMP'
  });

  // 模拟频谱动画
  useEffect(() => {
    if (isRecording || activeMode === 'audio') {
      const timer = setInterval(() => setSpectrum(generateSpectrumData()), 150);
      return () => clearInterval(timer);
    }
  }, [isRecording, activeMode]);

  return (
    <div className="flex flex-col h-full gap-6 font-[Rajdhani] text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 顶部：会话控制与加密状态 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 bg-gradient-to-r from-cyan-950/20 to-transparent p-4 rounded-t-lg">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 bg-cyan-600 rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Camera size={28} className="text-white" />
           </div>
           <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[10px] tracking-[0.3em] uppercase mb-1 font-bold">
                 <ShieldCheck size={14} /> Encrypted Media Session: Secure
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tighter">
                 故障现场 <span className="text-cyan-500 italic">多媒体取证控制台</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/80 px-8 py-3 rounded border border-slate-800">
           <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">存储空间可用</div>
              <div className="text-xl font-mono font-bold text-white">42.8 <span className="text-xs text-slate-600">GB</span></div>
           </div>
           <div className="w-[1px] h-10 bg-slate-700"></div>
           <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded text-xs font-bold transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2 uppercase tracking-widest">
              <Share2 size={14} /> 同步至云端
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧：采集模式与参数 */}
        <div className="xl:col-span-3 flex flex-col gap-6">
           <SciFiCard title="采集模式选择" subtitle="SENSING_MODES" highlight>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { id: 'photo', label: '超清摄影', icon: <Camera />, desc: '8K 细节采集' },
                   { id: 'video', label: '动态摄录', icon: <Video />, desc: '高速流存储' },
                   { id: 'audio', label: '声纹检测', icon: <Mic />, desc: '音频频率分析' },
                   { id: 'thermal', label: '热能成像', icon: <Thermometer />, desc: '温差视觉映射' },
                 ].map(mode => (
                   <button
                     key={mode.id}
                     onClick={() => setActiveMode(mode.id as any)}
                     className={`p-3 rounded border flex flex-col gap-2 transition-all group
                        ${activeMode === mode.id 
                          ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                     `}
                   >
                      <div className={activeMode === mode.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>
                         {mode.icon}
                      </div>
                      <div className="text-left">
                         <div className={`text-xs font-bold ${activeMode === mode.id ? 'text-white' : 'text-slate-400'}`}>{mode.label}</div>
                         <div className="text-[9px] text-slate-600 uppercase font-mono">{mode.desc}</div>
                      </div>
                   </button>
                 ))}
              </div>
           </SciFiCard>

           <SciFiCard title="AI 元数据提取" subtitle="METADATA_EXTRACTOR" className="flex-1">
              <div className="space-y-4">
                 {[
                   { label: '设备识别码', val: metadata.asset, icon: <Zap size={14}/> },
                   { label: '地理空间坐标', val: metadata.gps, icon: <MapPin size={14}/> },
                   { label: '光环境强度', val: metadata.lux, icon: <Eye size={14}/> },
                   { label: '环境噪声', val: metadata.db, icon: <Volume2 size={14}/> },
                 ].map((item, i) => (
                    <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-2">
                          {item.icon} {item.label}
                       </div>
                       <div className="text-sm font-mono text-cyan-100">{item.val}</div>
                    </div>
                 ))}
                 
                 <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 rounded flex items-start gap-3">
                    <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-normal">
                       已自动为所有媒体文件嵌入时间戳水印与生物识别签名，确保证据链不可篡改。
                    </p>
                 </div>
              </div>
           </SciFiCard>
        </div>

        {/* 中间：虚拟取景器主视窗 */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="flex-1 relative bg-black border border-slate-800 rounded-sm overflow-hidden group">
              
              {/* 取景器背景图 (模拟) */}
              <div className="absolute inset-0 opacity-40">
                 <img 
                    src={activeMode === 'thermal' 
                       ? "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=1200" 
                       : "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200"
                    } 
                    alt="viewfinder" 
                    className={`w-full h-full object-cover transition-all duration-1000 ${activeMode === 'thermal' ? 'hue-rotate-180 saturate-200' : ''}`}
                 />
                 {/* 扫描纹理装饰 */}
                 <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%'}}></div>
              </div>

              {/* AR HUD 界面叠加层 */}
              <div className="absolute inset-0 pointer-events-none z-10 p-8 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 bg-black/60 px-3 py-1 border border-cyan-500/40 rounded text-[10px] text-cyan-400 font-bold uppercase tracking-widest backdrop-blur-sm">
                          <Focus size={14} className="animate-pulse" /> 自动对焦: 锁定 (Focus Locked)
                       </div>
                       <div className="text-[10px] text-white/50 font-mono tracking-tighter">RES: 7680 x 4320 // FPS: 60</div>
                    </div>
                    <div className="text-right">
                       <div className="text-red-500 flex items-center justify-end gap-2 text-sm font-bold animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          REC 00:12:45
                       </div>
                    </div>
                 </div>

                 {/* 动态取景框 */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 relative border border-white/10">
                       <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500"></div>
                       <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500"></div>
                       <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500"></div>
                       <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500"></div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <Crosshair size={32} className="text-cyan-500 opacity-40" />
                       </div>
                    </div>
                    {/* AI 标记框 */}
                    <div className="absolute top-[30%] left-[20%] w-32 h-20 border-2 border-red-500/40 bg-red-500/5 rounded flex flex-col justify-end p-1">
                       <div className="text-[8px] bg-red-500 text-white px-1 font-bold w-fit">疑似渗漏点 (Leak Detected)</div>
                    </div>
                 </div>

                 <div className="flex justify-between items-end">
                    <div className="flex gap-4">
                       <div className="bg-black/60 p-3 rounded border border-white/5 backdrop-blur-sm w-48">
                          <div className="text-[9px] text-slate-500 uppercase font-bold mb-2">音频监测 (Acoustic Monitoring)</div>
                          <div className="h-10 w-full flex items-end gap-0.5">
                             {spectrum.map((s, i) => (
                               <div key={i} className="flex-1 bg-cyan-500/40 transition-all duration-100" style={{ height: `${s.val}%` }}></div>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 pointer-events-auto">
                       <button className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-all">
                          <Maximize2 size={20} />
                       </button>
                       <button 
                        onClick={() => setIsRecording(!isRecording)}
                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all transform active:scale-90
                          ${isRecording ? 'border-red-500/50 bg-red-600' : 'border-white/20 bg-white shadow-xl shadow-white/10'}
                        `}
                       >
                          {isRecording ? <div className="w-6 h-6 bg-white rounded-sm"></div> : <div className="w-6 h-6 bg-red-600 rounded-full"></div>}
                       </button>
                       <button className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-all">
                          <Film size={20} />
                       </button>
                    </div>
                 </div>
              </div>

              {/* 四角坐标 */}
              <div className="absolute top-2 left-2 text-[8px] text-slate-600 font-mono">X: 142.42 Y: 88.02</div>
              <div className="absolute bottom-2 right-2 text-[8px] text-slate-600 font-mono">SENSOR_ID: CAM_TACTICAL_09</div>
           </div>

           {/* 底部：波形分析展示 */}
           <div className="h-32 bg-slate-900/40 border border-slate-800 rounded p-4 flex gap-6">
              <div className="flex-1">
                 <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                    <Activity size={12} /> 实时信号震荡 (Signal Oscillation)
                 </div>
                 <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={spectrum}>
                          <defs>
                             <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="url(#colorWave)" strokeWidth={1} isAnimationActive={false} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="w-64 border-l border-slate-800 pl-6 flex flex-col justify-center">
                 <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase">峰值强度</div>
                 <div className="text-3xl font-mono font-bold text-white tracking-tighter">142.4 <span className="text-xs text-cyan-600 font-normal">mV</span></div>
                 <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Normal Range</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右侧：证据长廊与分析 */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-hidden">
           
           <SciFiCard title="证据长廊" subtitle="EVIDENCE_STREAM" className="flex-1 overflow-hidden">
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {CAPTURED_GALLERY.map((item, i) => (
                      <div key={i} className="bg-slate-950/50 border border-slate-800 rounded p-2 group hover:border-cyan-500/50 transition-all cursor-pointer">
                         <div className="relative aspect-video bg-slate-900 rounded-sm overflow-hidden mb-2">
                            {item.thumb ? (
                               <img src={item.thumb} alt="thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-cyan-900">
                                  <Waves size={32} className="animate-pulse" />
                               </div>
                            )}
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] text-slate-300 font-mono">
                               {item.type.toUpperCase()}
                            </div>
                         </div>
                         <div className="flex justify-between items-center px-1">
                            <div className="text-[10px] text-slate-400 font-mono">{item.time}</div>
                            <div className="flex gap-1">
                               {item.tags.map(t => <span key={t} className="text-[8px] bg-slate-800 text-slate-500 px-1 rounded">{t}</span>)}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700 rounded transition-all flex items-center justify-center gap-2">
                       <FileText size={12} /> 生成取证报告
                    </button>
                 </div>
              </div>
           </SciFiCard>

           <SciFiCard title="证据流概况" subtitle="SUMMARY">
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 mb-1 uppercase">全景影像</div>
                       <div className="text-xl font-bold text-white font-mono">12</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                       <div className="text-[10px] text-slate-500 mb-1 uppercase">异常音频</div>
                       <div className="text-xl font-bold text-cyan-400 font-mono">03</div>
                    </div>
                 </div>
                 <div className="p-3 bg-red-900/10 border border-red-900/20 rounded flex items-center gap-4">
                    {/* Fixed: AlertTriangle was previously missing from imports */}
                    <AlertTriangle className="text-red-500" size={24} />
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase font-bold">高危异常发现</div>
                       <div className="text-sm font-bold text-red-200">02 处需立即介入</div>
                    </div>
                    <ChevronRight className="ml-auto text-slate-700" size={16} />
                 </div>
              </div>
           </SciFiCard>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.4);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8);
        }
      `}</style>
    </div>
  );
};
