import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CATEGORY_COLORS = {
  food:          '#f97316',
  housing:       '#8b5cf6',
  utilities:     '#06b6d4',
  transport:     '#3b82f6',
  entertainment: '#ec4899',
  salary:        '#22c55e',
  other:         '#94a3b8',
};

function formatMonth(dateStr) {
  const [year, month] = dateStr.split('-');
  return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
}

function SpendingByCategory({ transactions }) {
  const expenses = transactions.filter(t => t.type === 'expense');

  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No expense data yet.</p>;
  }

  const totals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
    return acc;
  }, {});

  const data = Object.entries(totals).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function IncomeVsExpensesByMonth({ transactions }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>;
  }

  const monthMap = {};
  transactions.forEach(t => {
    const month = t.date.slice(0, 7); // "YYYY-MM"
    if (!monthMap[month]) monthMap[month] = { month, income: 0, expenses: 0 };
    if (t.type === 'income') monthMap[month].income += parseFloat(t.amount);
    else monthMap[month].expenses += parseFloat(t.amount);
  });

  const data = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({
      month: formatMonth(d.month),
      Income: parseFloat(d.income.toFixed(2)),
      Expenses: parseFloat(d.expenses.toFixed(2)),
    }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} width={60} />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BalanceOverTime({ transactions }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>;
  }

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  const data = sorted.map(t => {
    running += t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount);
    return {
      date: t.date,
      Balance: parseFloat(running.toFixed(2)),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} width={60} />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Line
          type="monotone"
          dataKey="Balance"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Analytics({ transactions }) {
  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-base font-semibold">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingByCategory transactions={transactions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income vs Expenses by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeVsExpensesByMonth transactions={transactions} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Balance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <BalanceOverTime transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Analytics;
