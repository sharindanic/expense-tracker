import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Summary from './Summary';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Analytics from './Analytics';
import AuthPage from './AuthPage';

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState('dashboard');

  const token = () => localStorage.getItem('token');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token()}`,
  });

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
      // Network error — stay on current state
    }
  };

  useEffect(() => {
    const savedToken = token();
    if (!savedToken) return;
    setUser({ loggedIn: true });
    fetchTransactions();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    fetchTransactions();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTransactions([]);
  };

  const handleAdd = async (transaction) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(transaction),
      });
      if (!res.ok) return;
      const newTransaction = await res.json();
      setTransactions(prev => [...prev, newTransaction]);
    } catch {
      // Network error
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) return;
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {
      // Network error
    }
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background">
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
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        <Summary transactions={transactions} />
        {view === 'dashboard' ? (
          <>
            <TransactionForm onAdd={handleAdd} />
            <TransactionList transactions={transactions} onDelete={handleDelete} />
          </>
        ) : (
          <Analytics transactions={transactions} />
        )}
      </div>
    </div>
  );
}

export default App;
