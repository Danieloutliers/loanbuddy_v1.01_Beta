import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLoanContext } from '@/context/LoanContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#14b8a6', '#22c55e', '#eab308', '#ef4444'];

export default function LoanStatusChart() {
  const { calculateStatusDistribution } = useLoanContext();
  const [timeRange, setTimeRange] = React.useState('30');
  
  const statusDistribution = calculateStatusDistribution();
  
  // Format data for chart
  const data = [
    { name: 'Ativos', value: statusDistribution.active, color: COLORS[0] },
    { name: 'Pagos', value: statusDistribution.paid, color: COLORS[1] },
    { name: 'Vencidos', value: statusDistribution.overdue, color: COLORS[2] },
    { name: 'Inadimplentes', value: statusDistribution.defaulted, color: COLORS[3] }
  ].filter(item => item.value > 0);
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900">Status dos Empréstimos</h3>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 text-sm">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-64">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-500">Nenhum dado disponível</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-2" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-slate-600">
                {entry.name} ({((entry.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
