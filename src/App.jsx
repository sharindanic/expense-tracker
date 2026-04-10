import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sun, Moon } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import Summary from './Summary';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Analytics from './Analytics';
import AuthPage from './AuthPage';
import BudgetManager from './BudgetManager';

function App() {
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [view, setView] = useState('dashboard');

  const token = () => localStorage.getItem('token');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token()}`,
  });

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets', {
        headers: { 'Authorization': `Bearer ${token()}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setBudgets(data);
    } catch {
      toast.error('Could not load budgets. Check your connection.');
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token()}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
        }
        return;
      }
      const data = await res.json();
      setTransactions(data);
    } catch {
      toast.error('Could not load transactions. Check your connection.');
    }
  };

  useEffect(() => {
    const savedToken = token();
    if (!savedToken) return;
    setUser({ loggedIn: true });
    fetchTransactions();
    fetchBudgets();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    fetchTransactions();
    fetchBudgets();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTransactions([]);
    setBudgets([]);
  };

  const handleAdd = async (transaction) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(transaction),
      });
      if (!res.ok) {
        toast.error('Failed to add transaction. Please try again.');
        return;
      }
      const newTransaction = await res.json();
      setTransactions(prev => [...prev, newTransaction]);
      toast.success('Transaction added.');
    } catch {
      toast.error('Could not reach the server. Check your connection.');
    }
  };

  const handleEdit = async (transaction) => {
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(transaction),
      });
      if (!res.ok) {
        toast.error('Failed to update transaction. Please try again.');
        return;
      }
      const updated = await res.json();
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success('Transaction updated.');
    } catch {
      toast.error('Could not reach the server. Check your connection.');
    }
  };

  const handleSaveBudget = async ({ category, amount }) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ category, amount }),
      });
      if (!res.ok) {
        toast.error('Failed to save budget. Please try again.');
        return;
      }
      const saved = await res.json();
      setBudgets(prev => {
        const exists = prev.find(b => b.category === saved.category);
        return exists
          ? prev.map(b => b.category === saved.category ? saved : b)
          : [...prev, saved];
      });
      toast.success(`Budget set for ${category}.`);
    } catch {
      toast.error('Could not reach the server. Check your connection.');
    }
  };

  const handleChangePassword = async () => {
    setChangePasswordError('');
    if (!currentPassword || !newPassword) {
      setChangePasswordError('Both fields are required.');
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChangePasswordError(data.error || 'Something went wrong.');
        return;
      }
      toast.success('Password changed successfully.');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setChangePasswordError('Could not reach the server.');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        toast.error('Failed to remove budget.');
        return;
      }
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Budget removed.');
    } catch {
      toast.error('Could not reach the server. Check your connection.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        toast.error('Failed to delete transaction. Please try again.');
        return;
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted.');
    } catch {
      toast.error('Could not reach the server. Check your connection.');
    }
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Finance Tracker</h1>
            <p className="text-muted-foreground">Track your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant={view === 'analytics' ? 'default' : 'outline'}
              onClick={() => setView('analytics')}
            >
              Analytics
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={() => { setChangePasswordError(''); setShowChangePassword(true); }}>
              Change password
            </Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <Dialog open={showChangePassword} onOpenChange={(open) => { if (!open) { setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setChangePasswordError(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              {changePasswordError && <p className="text-sm text-red-600">{changePasswordError}</p>}
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={handleChangePassword}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Summary transactions={transactions} />
        {view === 'dashboard' ? (
          <>
            <TransactionForm onAdd={handleAdd} />
            <BudgetManager
              transactions={transactions}
              budgets={budgets}
              onSave={handleSaveBudget}
              onDelete={handleDeleteBudget}
            />
            <TransactionList transactions={transactions} onDelete={handleDelete} onEdit={handleEdit} />
          </>
        ) : (
          <Analytics transactions={transactions} />
        )}
      </div>
    </div>
  );
}

export default App;
