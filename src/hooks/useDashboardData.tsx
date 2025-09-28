"use client"

import { useDashboardContext } from '@/context/DashboardContext';

export function useDashboardData() {
  return useDashboardContext();
}