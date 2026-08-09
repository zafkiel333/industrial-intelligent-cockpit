import React from 'react';
export default function ChillerRefrigerantRecoverySim() {
  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-cyan-800 pb-4">
          <h1 className="text-3xl font-bold text-cyan-400">离心式冷水机组冷媒回收与加注实操</h1>
          <p className="text-slate-400 mt-2 text-sm">模块：通用设备 | 虚拟实训</p>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">实训任务目标</h2>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li>▹ 掌握核心部件结构与拆装规范</li>
              <li>▹ 学习典型故障排查与诊断方法</li>
              <li>▹ 熟悉专用维修工器具安全标准</li>
            </ul>
          </section>
          <section className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-4"></div>
            <h3 className="text-xl text-cyan-400">实训环境加载中...</h3>
          </section>
        </main>
      </div>
    </div>
  );
}
