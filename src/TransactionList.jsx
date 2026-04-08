import { useState } from 'react'
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const categories = ["food", "housing", "utilities", "transport", "entertainment", "salary", "other"];

function TransactionList({ transactions, onDelete, onEdit }) {
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [confirmId, setConfirmId] = useState(null);
  const [editTransaction, setEditTransaction] = useState(null);

  const handleEditSave = () => {
    if (!editTransaction.description.trim()) {
      toast.error('Description cannot be empty.');
      return;
    }
    if (!editTransaction.amount || parseFloat(editTransaction.amount) <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    onEdit(editTransaction);
    setEditTransaction(null);
  };

  let filteredTransactions = transactions;
  if (filterType !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
  }
  if (filterCategory !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">Transactions</CardTitle>
          <div className="flex gap-2" data-testid="filters">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No transactions found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{t.date}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.category}</Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "income" ? "+" : "-"}${parseFloat(t.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTransaction({ ...t })}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setConfirmId(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit modal */}
      <Dialog open={editTransaction !== null} onOpenChange={(open) => { if (!open) setEditTransaction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details below.</DialogDescription>
          </DialogHeader>
          {editTransaction && (
            <div className="space-y-3">
              <Input
                value={editTransaction.description}
                onChange={e => setEditTransaction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
              />
              <Input
                type="number"
                value={editTransaction.amount}
                onChange={e => setEditTransaction(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount"
                min="0"
                step="0.01"
              />
              <Select value={editTransaction.type} onValueChange={val => setEditTransaction(prev => ({ ...prev, type: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editTransaction.category} onValueChange={val => setEditTransaction(prev => ({ ...prev, category: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={editTransaction.date}
                onChange={e => setEditTransaction(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation modal */}
      <Dialog open={confirmId !== null} onOpenChange={(open) => { if (!open) setConfirmId(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => { onDelete(confirmId); setConfirmId(null); }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default TransactionList;
