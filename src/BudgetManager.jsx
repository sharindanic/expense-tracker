import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/categories';

function getMonthSpend(transactions, category) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return transactions
    .filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

function ProgressBar({ percent }) {
  const clamped = Math.min(percent, 100);
  const color = percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

function BudgetManager({ transactions, budgets, onSave, onDelete }) {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid budget amount.');
      return;
    }
    onSave({ category: selectedCategory, amount: parseFloat(amount) });
    setAmount('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Monthly Budgets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Set budget form */}
        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1 min-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Budget limit ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="flex-1 min-w-32"
          />
          <Button type="submit">Set Budget</Button>
        </form>

        {/* Budget rows */}
        {budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No budgets set. Add one above to start tracking.
          </p>
        ) : (
          <div className="space-y-3">
            {budgets.map(budget => {
              const spent = getMonthSpend(transactions, budget.category);
              const percent = (spent / budget.amount) * 100;
              const isOver = percent >= 100;
              const isWarning = percent >= 80 && !isOver;

              return (
                <div key={budget.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium">{budget.category}</span>
                      {isOver && <span className="text-red-500 font-semibold">Over budget!</span>}
                      {isWarning && <span className="text-yellow-600 font-semibold">⚠ 80%+ used</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={isOver ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
                        ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onDelete(budget.id)}
                        className="text-muted-foreground hover:text-red-500 text-xs"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                  <ProgressBar percent={percent} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BudgetManager;
