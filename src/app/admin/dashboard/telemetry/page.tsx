"use client";

import React, { useEffect } from "react";

export default function AdminDashboardPage() {
  useEffect(() => {
    // Micro-interaction for re-route buttons
    const handleReRoute = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLButtonElement;
      if (target.innerText.includes('Re-route') || target.innerText.includes('Panic Shift')) {
        const originalContent = target.innerHTML;
        target.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span> Shifting...`;
        target.disabled = true;
        setTimeout(() => {
          target.innerHTML = `<span class="material-symbols-outlined text-sm">check</span> Success`;
          setTimeout(() => {
            target.innerHTML = originalContent;
            target.disabled = false;
          }, 1500);
        }, 800);
      }
    };

    document.querySelectorAll('.reroute-btn').forEach(btn => {
      btn.addEventListener('click', handleReRoute as EventListener);
    });

    return () => {
      document.querySelectorAll('.reroute-btn').forEach(btn => {
        btn.removeEventListener('click', handleReRoute as EventListener);
      });
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">System Telemetry</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Real-time infrastructure health and request performance.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container p-1 rounded-lg">
          <button className="px-4 py-2 bg-white shadow-sm rounded-md text-sm font-bold text-primary transition-all">Live View</button>
          <button className="px-4 py-2 hover:bg-surface-variant rounded-md text-sm font-medium text-on-surface-variant transition-all">History</button>
        </div>
      </div>

      {/* Section 1: System Telemetry Bento Grid */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Metrics Bar */}
        <div className="col-span-12 grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-1">Avg Response Time</p>
              <h3 className="text-3xl font-black text-on-surface">142ms</h3>
              <p className="text-xs text-green-600 flex items-center gap-1 font-bold mt-2">
                <span className="material-symbols-outlined text-sm">trending_down</span> -12% vs last hr
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined text-3xl">timer</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-1">Throughput</p>
              <h3 className="text-3xl font-black text-on-surface">1.2k <span className="text-lg font-medium text-on-surface-variant">req/s</span></h3>
              <p className="text-xs text-blue-600 flex items-center gap-1 font-bold mt-2">
                <span className="material-symbols-outlined text-sm">trending_up</span> +5% load increase
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <span className="material-symbols-outlined text-3xl">speed</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-1">Error Rate</p>
              <h3 className="text-3xl font-black text-on-surface">0.04%</h3>
              <p className="text-xs text-green-600 font-bold mt-2">Nominal Performance</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-widest mb-1">Active Sessions</p>
              <h3 className="text-3xl font-black text-on-surface">14,204</h3>
              <p className="text-xs text-on-surface-variant font-bold mt-2">4 Regions Connected</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <span className="material-symbols-outlined text-3xl">person_pin_circle</span>
            </div>
          </div>
        </div>

        {/* Detailed Telemetry Charts */}
        <div className="col-span-8 bg-white p-6 rounded-xl border border-outline-variant shadow-sm" style={{ backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline-md text-headline-md">Traffic &amp; Load Distribution</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span> <span className="text-xs font-bold">API Latency</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-secondary"></span> <span className="text-xs font-bold">Server Load</span></div>
            </div>
          </div>
          <div className="h-64 w-full relative">
            {/* Fake SVG Chart */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 256">
              <style>
                {`
                  .sparkline-animate { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 3s linear forwards; }
                  @keyframes dash { to { stroke-dashoffset: 0; } }
                `}
              </style>
              <path className="sparkline-animate" d="M0,180 L50,160 L100,190 L150,170 L200,140 L250,150 L300,100 L350,120 L400,90 L450,110 L500,80 L550,95 L600,60 L650,75 L700,40 L750,55 L800,30 L850,45 L900,20 L950,35 L1000,15" fill="none" stroke="#004ac6" strokeWidth="3"></path>
              <path d="M0,220 L100,210 L200,230 L300,205 L400,215 L500,190 L600,200 L700,175 L800,185 L900,160 L1000,170" fill="none" stroke="#505f76" strokeDasharray="8 4" strokeWidth="2"></path>
            </svg>
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="w-full h-px bg-black"></div>
              <div className="w-full h-px bg-black"></div>
              <div className="w-full h-px bg-black"></div>
              <div className="w-full h-px bg-black"></div>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">
            <span>14:00</span><span>14:15</span><span>14:30</span><span>14:45</span><span>15:00</span><span>15:15</span><span>Now</span>
          </div>
        </div>

        {/* Regional Health */}
        <div className="col-span-4 space-y-4">
          <style>
            {`
              .status-pulse { animation: pulse 2s infinite; }
              @keyframes pulse { 0% { transform: scale(0.95); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(0.95); opacity: 1; } }
            `}
          </style>
          <div className="bg-white p-5 rounded-xl border border-outline-variant shadow-sm">
            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4 tracking-wider">Regional Services</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 status-pulse"></div>
                  <span className="font-bold text-sm">North America</span>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 status-pulse"></div>
                  <span className="font-bold text-sm">Europe Central</span>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 status-pulse"></div>
                  <span className="font-bold text-sm">Asia Pacific</span>
                </div>
                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded">Degraded</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-transparent hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 status-pulse"></div>
                  <span className="font-bold text-sm">API Gateway</span>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">Healthy</span>
              </div>
            </div>
          </div>
          <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">System Health Score</p>
              <h4 className="text-4xl font-black mb-2">98.4</h4>
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{ width: '98%' }}></div>
              </div>
              <p className="text-[10px] mt-4 opacity-80 italic">Optimized by Kinetic AI Engine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Queue Management */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Queue Management &amp; Re-routing</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Intelligent traffic control for global support centers.</p>
        </div>
        <div className="flex items-center gap-6 bg-white border border-outline-variant px-6 py-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-on-surface-variant">Auto-balancing</span>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-primary-fixed-dim ring-offset-2">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
          <div className="w-px h-6 bg-outline-variant"></div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">bolt</span>
            <span className="text-sm font-bold text-primary">AI Mode Active</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Queue Name</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Priority</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Wait Time</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Agents Online</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant text-center">Depth</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Status</th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest border-b border-outline-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {/* Queue Row 1 */}
            <tr className="hover:bg-surface-container-lowest transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">payments</span>
                  </div>
                  <span className="font-bold text-on-surface">Billing &amp; Accounts</span>
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded">Medium</span></td>
              <td className="px-6 py-4 font-code text-code">00:04:12</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">42</span>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-200"></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-200"></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold">128</span>
                  <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Stable
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="reroute-btn bg-white border border-primary text-primary px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary hover:text-white transition-all duration-200 flex items-center gap-2 ml-auto">
                  <span className="material-symbols-outlined text-sm">shuffle</span>
                  Re-route
                </button>
              </td>
            </tr>
            {/* Queue Row 2 */}
            <tr className="hover:bg-surface-container-lowest transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                  </div>
                  <span className="font-bold text-on-surface">Technical Support</span>
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded">Critical</span></td>
              <td className="px-6 py-4 font-code text-code text-red-600">00:14:55</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-red-600">
                  <span className="font-bold">18</span>
                  <span className="material-symbols-outlined text-sm">warning</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold">342</span>
                  <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 status-pulse"></span>
                  Backlogged
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="reroute-btn bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs hover:shadow-lg hover:brightness-110 transition-all duration-200 flex items-center gap-2 ml-auto shadow-sm">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Panic Shift
                </button>
              </td>
            </tr>
            {/* Queue Row 3 */}
            <tr className="hover:bg-surface-container-lowest transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  </div>
                  <span className="font-bold text-on-surface">Priority Support</span>
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">High</span></td>
              <td className="px-6 py-4 font-code text-code">00:00:15</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">65</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold">8</span>
                  <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                  Fluid
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="reroute-btn bg-white border border-primary text-primary px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary hover:text-white transition-all duration-200 flex items-center gap-2 ml-auto">
                  <span className="material-symbols-outlined text-sm">shuffle</span>
                  Re-route
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="p-6 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant font-medium">Showing 3 of 12 active global queues.</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-outline-variant rounded-md hover:bg-white transition-all"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="p-2 border border-outline-variant rounded-md hover:bg-white transition-all"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
