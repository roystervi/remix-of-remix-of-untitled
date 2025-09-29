"use client"

import { Download, Upload, MoreHorizontal, Wifi } from 'lucide-react';

export const WiFiRouterStats = () => (
  <div className="border-card-ring bg-card rounded-xl p-2 sm:p-4 flex flex-col flex-1 min-h-[120px] sm:min-h-[150px]">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
      <h3 className="text-base sm:text-lg font-semibold text-foreground text-center sm:text-left">Tp-Link Wifi Router</h3>
      <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground ml-auto" />
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center flex-1">
      <div className="flex flex-col justify-center">
        <p className="text-xl sm:text-2xl font-bold text-green-500 mb-1">162.68 Mbps</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Download className="w-3 h-3" />
          Download
        </p>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xl sm:text-2xl font-bold text-orange-500 mb-1">198.53 Mbps</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Upload className="w-3 h-3" />
          Upload
        </p>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-base sm:text-2xl font-bold mb-1 text-foreground">9ms</p>
        <p className="text-xs text-muted-foreground">Idle Latency</p>
      </div>
    </div>
  </div>
);