
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { dataStore } from '@/store/dataStore';
import { OfficeIncome, OfficeExpense, ClientBalance } from '@/types';
import { toast } from 'sonner';

const OfficeAccounting = () => {
  const [incomes, setIncomes] = useState<OfficeIncome[]>(dataStore.getOfficeIncome());
  const [expenses, setExpenses] = useState<OfficeExpense[]>(dataStore.getOfficeExpenses());
  const [clients] = useState(dataStore.getClients());
  
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    incomeDate: new Date().toISOString().split('T')[0],
    source: 'أخرى'
  });
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'أخرى'
  });

  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<OfficeIncome | null>(null);
  const [editingExpense, setEditingExpense] = useState<OfficeExpense | null>(null);

  // Calculate totals
  const totalOfficeIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalOfficeExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate client balances - Updated logic: positive balance means client owes money
  const clientBalances: (ClientBalance & { clientName: string; clientId: string })[] = clients.map(client => {
    const balance = dataStore.getClientBalance(client.id);
    return {
      ...balance,
      clientName: client.name,
      clientId: client.id
    };
  });

  const totalClientFees = clientBalances.reduce((sum, cb) => sum + cb.totalFees, 0);
  const totalClientPayments = clientBalances.reduce((sum, cb) => sum + cb.totalPayments, 0);
  const totalClientExpenses = clientBalances.reduce((sum, cb) => sum + cb.totalExpenses, 0);
  const totalClientBalances = clientBalances.reduce((sum, cb) => sum + cb.balance, 0);

  // Net office balance: office income - office expenses + client payments - client expenses
  const netOfficeBalance = totalOfficeIncome - totalOfficeExpenses + totalClientPayments - totalClientExpenses;

  const handleAddIncome = () => {
    if (!incomeForm.description || !incomeForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const newIncome = dataStore.addOfficeIncome({
        description: incomeForm.description,
        amount: parseFloat(incomeForm.amount),
        incomeDate: new Date(incomeForm.incomeDate),
        source: incomeForm.source
      });

      setIncomes([...incomes, newIncome]);
      setIncomeForm({ description: '', amount: '', incomeDate: new Date().toISOString().split('T')[0], source: 'أخرى' });
      setIsIncomeDialogOpen(false);
      toast.success('تم إضافة الإيراد بنجاح');
    } catch (error) {
      toast.error('فشل في إضافة الإيراد');
    }
  };

  const handleEditIncome = (income: OfficeIncome) => {
    setEditingIncome(income);
    setIncomeForm({
      description: income.description,
      amount: income.amount.toString(),
      incomeDate: income.incomeDate.toISOString().split('T')[0],
      source: income.source
    });
    setIsIncomeDialogOpen(true);
  };

  const handleUpdateIncome = () => {
    if (!editingIncome || !incomeForm.description || !incomeForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const updatedIncome = dataStore.updateOfficeIncome(editingIncome.id, {
        description: incomeForm.description,
        amount: parseFloat(incomeForm.amount),
        incomeDate: new Date(incomeForm.incomeDate),
        source: incomeForm.source
      });

      if (updatedIncome) {
        setIncomes(incomes.map(i => i.id === updatedIncome.id ? updatedIncome : i));
        setIncomeForm({ description: '', amount: '', incomeDate: new Date().toISOString().split('T')[0], source: 'أخرى' });
        setEditingIncome(null);
        setIsIncomeDialogOpen(false);
        toast.success('تم تحديث الإيراد بنجاح');
      }
    } catch (error) {
      toast.error('فشل في تحديث الإيراد');
    }
  };

  const handleDeleteIncome = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإيراد؟')) {
      try {
        dataStore.deleteOfficeIncome(id);
        setIncomes(incomes.filter(i => i.id !== id));
        toast.success('تم حذف الإيراد بنجاح');
      } catch (error) {
        toast.error('فشل في حذف الإيراد');
      }
    }
  };

  const handleAddExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const newExpense = dataStore.addOfficeExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: new Date(expenseForm.expenseDate),
        category: expenseForm.category
      });

      setExpenses([...expenses, newExpense]);
      setExpenseForm({ description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0], category: 'أخرى' });
      setIsExpenseDialogOpen(false);
      toast.success('تم إضافة المصروف بنجاح');
    } catch (error) {
      toast.error('فشل في إضافة المصروف');
    }
  };

  const handleEditExpense = (expense: OfficeExpense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      expenseDate: expense.expenseDate.toISOString().split('T')[0],
      category: expense.category
    });
    setIsExpenseDialogOpen(true);
  };

  const handleUpdateExpense = () => {
    if (!editingExpense || !expenseForm.description || !expenseForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const updatedExpense = dataStore.updateOfficeExpense(editingExpense.id, {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: new Date(expenseForm.expenseDate),
        category: expenseForm.category
      });

      if (updatedExpense) {
        setExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
        setExpenseForm({ description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0], category: 'أخرى' });
        setEditingExpense(null);
        setIsExpenseDialogOpen(false);
        toast.success('تم تحديث المصروف بنجاح');
      }
    } catch (error) {
      toast.error('فشل في تحديث المصروف');
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      try {
        dataStore.deleteOfficeExpense(id);
        setExpenses(expenses.filter(e => e.id !== id));
        toast.success('تم حذف المصروف بنجاح');
      } catch (error) {
        toast.error('فشل في حذف المصروف');
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">حسابات المكتب</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي إيرادات المكتب</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalOfficeIncome.toLocaleString()} ل.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي مصروفات المكتب</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalOfficeExpenses.toLocaleString()} ل.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مديونية الموكلين</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalClientBalances >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalClientBalances.toLocaleString()} ل.س
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalClientBalances >= 0 ? 'مستحق للمكتب' : 'مستحق للموكلين'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">صافي رصيد المكتب</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netOfficeBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netOfficeBalance.toLocaleString()} ل.س
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="office-income" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="office-income">إيرادات المكتب</TabsTrigger>
            <TabsTrigger value="office-expenses">مصروفات المكتب</TabsTrigger>
            <TabsTrigger value="client-balances">أرصدة الموكلين</TabsTrigger>
            <TabsTrigger value="summary">الملخص المالي</TabsTrigger>
          </TabsList>

          {/* Office Income Tab */}
          <TabsContent value="office-income" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">إيرادات المكتب</h2>
              <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingIncome(null); setIncomeForm({ description: '', amount: '', incomeDate: new Date().toISOString().split('T')[0], source: 'أخرى' }); }}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة إيراد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingIncome ? 'تعديل الإيراد' : 'إضافة إيراد جديد'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="income-description">الوصف</Label>
                      <Textarea
                        id="income-description"
                        value={incomeForm.description}
                        onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                        placeholder="وصف الإيراد"
                      />
                    </div>
                    <div>
                      <Label htmlFor="income-amount">المبلغ (ل.س)</Label>
                      <Input
                        id="income-amount"
                        type="number"
                        value={incomeForm.amount}
                        onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="income-date">التاريخ</Label>
                      <Input
                        id="income-date"
                        type="date"
                        value={incomeForm.incomeDate}
                        onChange={(e) => setIncomeForm({ ...incomeForm, incomeDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="income-source">المصدر</Label>
                      <Select value={incomeForm.source} onValueChange={(value) => setIncomeForm({ ...incomeForm, source: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="أتعاب">أتعاب</SelectItem>
                          <SelectItem value="استشارات">استشارات</SelectItem>
                          <SelectItem value="خدمات أخرى">خدمات أخرى</SelectItem>
                          <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={editingIncome ? handleUpdateIncome : handleAddIncome}>
                        {editingIncome ? 'تحديث' : 'إضافة'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المصدر</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>{income.description}</TableCell>
                        <TableCell className="font-mono text-green-600">
                          {income.amount.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell>{income.incomeDate.toLocaleDateString('ar-SY')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{income.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditIncome(income)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIncome(income.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Office Expenses Tab */}
          <TabsContent value="office-expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">مصروفات المكتب</h2>
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingExpense(null); setExpenseForm({ description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0], category: 'أخرى' }); }}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مصروف
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="expense-description">الوصف</Label>
                      <Textarea
                        id="expense-description"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        placeholder="وصف المصروف"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expense-amount">المبلغ (ل.س)</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expense-date">التاريخ</Label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={expenseForm.expenseDate}
                        onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expense-category">الفئة</Label>
                      <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="إيجار">إيجار</SelectItem>
                          <SelectItem value="مواصلات">مواصلات</SelectItem>
                          <SelectItem value="اتصالات">اتصالات</SelectItem>
                          <SelectItem value="كهرباء">كهرباء</SelectItem>
                          <SelectItem value="قرطاسية">قرطاسية</SelectItem>
                          <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={editingExpense ? handleUpdateExpense : handleAddExpense}>
                        {editingExpense ? 'تحديث' : 'إضافة'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="font-mono text-red-600">
                          {expense.amount.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell>{expense.expenseDate.toLocaleDateString('ar-SY')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Balances Tab */}
          <TabsContent value="client-balances" className="space-y-4">
            <h2 className="text-xl font-semibold">أرصدة الموكلين</h2>
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الموكل</TableHead>
                      <TableHead>إجمالي الأتعاب</TableHead>
                      <TableHead>إجمالي المصاريف</TableHead>
                      <TableHead>إجمالي الدفعات</TableHead>
                      <TableHead>الرصيد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientBalances.map((balance) => (
                      <TableRow key={balance.clientId}>
                        <TableCell className="font-medium">{balance.clientName}</TableCell>
                        <TableCell className="font-mono text-blue-600">
                          {balance.totalFees.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell className="font-mono text-orange-600">
                          {balance.totalExpenses.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell className="font-mono text-green-600">
                          {balance.totalPayments.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell className={`font-mono font-bold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance.balance.toLocaleString()} ل.س
                          {balance.balance >= 0 ? ' (مستحق للمكتب)' : ' (مستحق للموكل)'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <h2 className="text-xl font-semibold">الملخص المالي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إيرادات المكتب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>إيرادات مباشرة:</span>
                    <span className="font-mono text-green-600">{totalOfficeIncome.toLocaleString()} ل.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>دفعات الموكلين:</span>
                    <span className="font-mono text-green-600">{totalClientPayments.toLocaleString()} ل.س</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>إجمالي الإيرادات:</span>
                    <span className="font-mono text-green-600">{(totalOfficeIncome + totalClientPayments).toLocaleString()} ل.س</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>مصروفات المكتب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>مصروفات مباشرة:</span>
                    <span className="font-mono text-red-600">{totalOfficeExpenses.toLocaleString()} ل.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مصاريف الموكلين:</span>
                    <span className="font-mono text-red-600">{totalClientExpenses.toLocaleString()} ل.س</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>إجمالي المصروفات:</span>
                    <span className="font-mono text-red-600">{(totalOfficeExpenses + totalClientExpenses).toLocaleString()} ل.س</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>النتيجة النهائية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>مديونية الموكلين (أتعاب + مصاريف - دفعات):</span>
                    <span className={`font-mono font-bold ${totalClientBalances >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalClientBalances.toLocaleString()} ل.س
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-4">
                    <span>صافي رصيد المكتب:</span>
                    <span className={`font-mono ${netOfficeBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netOfficeBalance.toLocaleString()} ل.س
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    صافي الرصيد = إيرادات المكتب - مصروفات المكتب + دفعات الموكلين - مصاريف الموكلين
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OfficeAccounting;
