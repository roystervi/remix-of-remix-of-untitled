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
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTables();
  }, [router]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/database-studio/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    try {
      const res = await fetch(`/api/database-studio/table/${tableName}`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching table data:', err);
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Studio</h1>
          <p className="text-muted-foreground">Manage and explore your database tables</p>
        </div>
        <Button onClick={fetchTables} variant="outline">
          <Database className="mr-2 h-4 w-4" />
          Refresh Tables
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Search Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tables ({filteredTables.length})</CardTitle>
            <CardDescription>Browse available tables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center p-8">Loading tables...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTables.map((table) => (
                  <Button
                    key={table.name}
                    variant={selectedTable === table.name ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedTable(selectedTable === table.name ? null : table.name);
                      if (selectedTable !== table.name) fetchTableData(table.name);
                    }}
                  >
                    <Table className="mr-2 h-4 w-4" />
                    {table.name}
                    <Badge className="ml-auto">{table.rows} rows</Badge>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTable && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedTable} Data</CardTitle>
              <CardDescription>View and manage records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tableData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-muted">
                    <thead>
                      <tr className="bg-muted/50">
                        {Object.keys(tableData[0]).map((key) => (
                          <th key={key} className="border border-muted p-2 text-left">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-accent">
                          {Object.values(row).map((val, i) => (
                            <td key={i} className="border border-muted p-2">
                              {JSON.stringify(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Import and render the client component
import ClientDatabaseStudio from '@/components/database-studio/ClientDatabaseStudio';

export default function DatabaseStudioPage() {
  return <ClientDatabaseStudio />;
}