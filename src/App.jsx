import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Summary from './Summary';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import AuthPage from './AuthPage';

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const token = () => localStorage.getItem('token');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token()}`,
  });

  useEffect(() => {
    const savedToken = token();
    if (!savedToken) return;
    // Validate token by fetching transactions
    fetch('/api/transactions', { headers: { 'Authorization': `Bearer ${savedToken}` } })
      .then(res => {
        if (!res.ok) { localStorage.removeItem('token'); return; }
        return res.json();
      })
      .then(data => {
        if (data) {
          setTransactions(data);
          setUser({ loggedIn: true });
        }
      });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    fetch('/api/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setTransactions(data));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTransactions([]);
  };

  const handleAdd = async (transaction) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(transaction),
    });
    const newTransaction = await res.json();
    setTransactions(prev => [...prev, newTransaction]);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    setTransactions(prev => prev.filter(t => t.id !== id));
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
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
        <Summary transactions={transactions} />
        <TransactionForm onAdd={handleAdd} />
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default App;
