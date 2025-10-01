"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Search, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TableInfo {
  name: string;
  rows: number;
  columns: number;
}

export default function DatabaseStudioPage() {
  return <ClientDatabaseStudio />;
}

// Import and render the client component
import ClientDatabaseStudio from '@/components/database-studio/ClientDatabaseStudio';