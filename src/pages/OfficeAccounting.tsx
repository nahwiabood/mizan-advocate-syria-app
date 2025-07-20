import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { OfficeIncome, OfficeExpense, Client } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const OfficeAccounting = () => {
  const [officeIncome, setOfficeIncome] = useState<OfficeIncome[]>([]);
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<OfficeIncome | null>(null);
  const [editingExpense, setEditingExpense] = useState<OfficeExpense | null>(null);

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    incomeDate: new Date(),
    source: 'client_fees'
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    expenseDate: new Date(),
    category: 'office'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [incomeData, expensesData, clientsData] = await Promise.all([
        dataStore.getOfficeIncome(),
        dataStore.getOfficeExpenses(),
        dataStore.getClients()
      ]);

      setOfficeIncome(incomeData);
      setOfficeExpenses(expensesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading office accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalIncome = officeIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = officeExpenses.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // CRUD operations
  const handleAddIncome = async () => {
    if (!incomeForm.description || !incomeForm.amount) return;

    try {
      const newIncome = await dataStore.addOfficeIncome({
        description: incomeForm.description,
        amount: parseFloat(incomeForm.amount),
        incomeDate: incomeForm.incomeDate
      });

      setOfficeIncome([newIncome, ...officeIncome]);
      resetIncomeForm();
      setIsIncomeDialogOpen(false);
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleEditIncome = async () => {
    if (!editingIncome || !incomeForm.description || !incomeForm.amount) return;

    try {
      const updatedIncome = await dataStore.updateOfficeIncome(editingIncome.id, {
        description: incomeForm.description,
        amount: parseFloat(incomeForm.amount),
        incomeDate: incomeForm.incomeDate
      });

      if (updatedIncome) {
        setOfficeIncome(officeIncome.map(item => 
          item.id === editingIncome.id ? updatedIncome : item
        ));
      }

      resetIncomeForm();
      setIsIncomeDialogOpen(false);
      setEditingIncome(null);
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) return;

    try {
      const newExpense = await dataStore.addOfficeExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate
      });

      setOfficeExpenses([newExpense, ...officeExpenses]);
      resetExpenseForm();
      setIsExpenseDialogOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEditExpense = async () => {
    if (!editingExpense || !expenseForm.description || !expenseForm.amount) return;

    try {
      const updatedExpense = await dataStore.updateOfficeExpense(editingExpense.id, {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate
      });

      if (updatedExpense) {
        setOfficeExpenses(officeExpenses.map(item => 
          item.id === editingExpense.id ? updatedExpense : item
        ));
      }

      resetExpenseForm();
      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const resetIncomeForm = () => {
    setIncomeForm({
      description: '',
      amount: '',
      incomeDate: new Date(),
      source: 'client_fees'
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      expenseDate: new Date(),
      category: 'office'
    });
  };

  // Open dialog functions
  const openAddIncomeDialog = () => {
    resetIncomeForm();
    setEditingIncome(null);
    setIsIncomeDialogOpen(true);
  };

  const openEditIncomeDialog = (income: OfficeIncome) => {
    setIncomeForm({
      description: income.description,
      amount: income.amount.toString(),
      incomeDate: income.incomeDate,
      source: 'client_fees'
    });
    setEditingIncome(income);
    setIsIncomeDialogOpen(true);
  };

  const openAddExpenseDialog = () => {
    resetExpenseForm();
    setEditingExpense(null);
    setIsExpenseDialogOpen(true);
  };

  const openEditExpenseDialog = (expense: OfficeExpense) => {
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      expenseDate: expense.expenseDate,
      category: 'office'
    });
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                  <p className="text-xl font-bold text-green-600">{totalIncome.toLocaleString()} ل.س</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                  <p className="text-xl font-bold text-red-600">{totalExpenses.toLocaleString()} ل.س</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${netBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wallet className={`h-8 w-8 ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">صافي الربح</p>
                  <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {netBalance.toLocaleString()} ل.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">عدد الموكلين</p>
                  <p className="text-xl font-bold text-purple-600">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-right flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                الإيرادات
              </CardTitle>
              <Button onClick={openAddIncomeDialog} className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-5 w-5" />
                إضافة إيراد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officeIncome.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell className="text-right">{formatSyrianDate(income.incomeDate)}</TableCell>
                      <TableCell className="text-right">{income.description}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {income.amount.toLocaleString()} ل.س
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditIncomeDialog(income)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {officeIncome.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        لا توجد إيرادات مسجلة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-right flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-red-600" />
                المصروفات
              </CardTitle>
              <Button onClick={openAddExpenseDialog} className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus className="h-5 w-5" />
                إضافة مصروف
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officeExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-right">{formatSyrianDate(expense.expenseDate)}</TableCell>
                      <TableCell className="text-right">{expense.description}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {expense.amount.toLocaleString()} ل.س
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditExpenseDialog(expense)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {officeExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        لا توجد مصروفات مسجلة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Income Dialog */}
        <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">{editingIncome ? 'تعديل إيراد' : 'إضافة إيراد جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="incomeDescription">الوصف</Label>
                <Input
                  id="incomeDescription"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  placeholder="وصف الإيراد"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="incomeAmount">المبلغ</Label>
                <Input
                  id="incomeAmount"
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  placeholder="المبلغ"
                  className="text-right"
                />
              </div>
              <div>
                <Label>التاريخ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !incomeForm.incomeDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {incomeForm.incomeDate ? (
                        formatFullSyrianDate(incomeForm.incomeDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={incomeForm.incomeDate}
                      onSelect={(date) => setIncomeForm({ ...incomeForm, incomeDate: date || new Date() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                onClick={editingIncome ? handleEditIncome : handleAddIncome} 
                className="w-full"
              >
                {editingIncome ? 'تحديث الإيراد' : 'إضافة إيراد'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expense Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">{editingExpense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="expenseDescription">الوصف</Label>
                <Input
                  id="expenseDescription"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="وصف المصروف"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="expenseAmount">المبلغ</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="المبلغ"
                  className="text-right"
                />
              </div>
              <div>
                <Label>التاريخ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !expenseForm.expenseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {expenseForm.expenseDate ? (
                        formatFullSyrianDate(expenseForm.expenseDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expenseForm.expenseDate}
                      onSelect={(date) => setExpenseForm({ ...expenseForm, expenseDate: date || new Date() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                onClick={editingExpense ? handleEditExpense : handleAddExpense} 
                className="w-full"
              >
                {editingExpense ? 'تحديث المصروف' : 'إضافة مصروف'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default OfficeAccounting;
