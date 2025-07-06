
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, Receipt, TrendingUp, TrendingDown, Calendar as CalendarIcon, Building2 } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { OfficeIncome, OfficeExpense } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const OfficeAccounting = () => {
  const [officeIncome, setOfficeIncome] = useState<OfficeIncome[]>([]);
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>([]);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    source: '',
    incomeDate: new Date()
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    expenseDate: new Date()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOfficeIncome(dataStore.getOfficeIncome());
    setOfficeExpenses(dataStore.getOfficeExpenses());
  };

  const handleAddIncome = () => {
    if (!incomeForm.description || !incomeForm.amount) return;

    dataStore.addOfficeIncome({
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      source: incomeForm.source || 'أخرى',
      incomeDate: incomeForm.incomeDate
    });

    resetIncomeForm();
    setIsIncomeDialogOpen(false);
    loadData();
  };

  const handleAddExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) return;

    dataStore.addOfficeExpense({
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category || 'أخرى',
      expenseDate: expenseForm.expenseDate
    });

    resetExpenseForm();
    setIsExpenseDialogOpen(false);
    loadData();
  };

  const resetIncomeForm = () => {
    setIncomeForm({
      description: '',
      amount: '',
      source: '',
      incomeDate: new Date()
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      category: '',
      expenseDate: new Date()
    });
  };

  const openAddIncomeDialog = () => {
    resetIncomeForm();
    setIsIncomeDialogOpen(true);
  };

  const openAddExpenseDialog = () => {
    resetExpenseForm();
    setIsExpenseDialogOpen(true);
  };

  // Calculate totals
  const totalIncome = officeIncome.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = officeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Get all client accounting data for comprehensive view
  const clients = dataStore.getClients();
  const clientsAccounting = clients.map(client => ({
    client,
    balance: dataStore.getClientBalance(client.id)
  }));

  const totalClientFees = clientsAccounting.reduce((sum, ca) => sum + ca.balance.totalFees, 0);
  const totalClientPayments = clientsAccounting.reduce((sum, ca) => sum + ca.balance.totalPayments, 0);
  const totalClientExpensesSpent = clientsAccounting.reduce((sum, ca) => sum + ca.balance.totalExpenses, 0);
  const totalClientBalances = clientsAccounting.reduce((sum, ca) => sum + ca.balance.balance, 0);

  const overallIncome = totalIncome + totalClientPayments;
  const overallExpenses = totalExpenses + totalClientExpensesSpent;
  const overallBalance = overallIncome - overallExpenses + totalClientBalances;

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2 text-lg sm:text-xl">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              حسابات المكتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">إجمالي الواردات</p>
                      <p className="text-lg font-bold text-green-600">{overallIncome.toLocaleString()} ل.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                      <p className="text-lg font-bold text-red-600">{overallExpenses.toLocaleString()} ل.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">مستحقات الموكلين</p>
                      <p className="text-lg font-bold text-blue-600">{totalClientBalances.toLocaleString()} ل.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`${overallBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Receipt className={`h-5 w-5 ${overallBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">الرصيد الإجمالي</p>
                      <p className={`text-lg font-bold ${overallBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {overallBalance.toLocaleString()} ل.س
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">ملخص</TabsTrigger>
                <TabsTrigger value="income">الواردات</TabsTrigger>
                <TabsTrigger value="expenses">المصروفات</TabsTrigger>
                <TabsTrigger value="clients">حسابات الموكلين</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right text-lg">واردات المكتب</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-green-600">{totalIncome.toLocaleString()} ل.س</span>
                          <span>واردات مباشرة</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-600">{totalClientPayments.toLocaleString()} ل.س</span>
                          <span>دفعات من الموكلين</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-bold">
                          <span className="text-green-600">{overallIncome.toLocaleString()} ل.س</span>
                          <span>إجمالي الواردات</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right text-lg">مصروفات المكتب</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-red-600">{totalExpenses.toLocaleString()} ل.س</span>
                          <span>مصروفات مباشرة</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-orange-600">{totalClientExpensesSpent.toLocaleString()} ل.س</span>
                          <span>مصروفات الموكلين</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-bold">
                          <span className="text-red-600">{overallExpenses.toLocaleString()} ل.س</span>
                          <span>إجمالي المصروفات</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="income" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <Button onClick={openAddIncomeDialog} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                    إضافة وارد
                  </Button>
                  <h3 className="text-lg font-semibold">واردات المكتب</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">المصدر</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {officeIncome.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="text-right">{formatSyrianDate(income.incomeDate)}</TableCell>
                          <TableCell className="text-right">{income.description}</TableCell>
                          <TableCell className="text-right">{income.source}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {income.amount.toLocaleString()} ل.س
                          </TableCell>
                        </TableRow>
                      ))}
                      {officeIncome.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            لا توجد واردات مسجلة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="expenses" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <Button onClick={openAddExpenseDialog} className="gap-2 bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4" />
                    إضافة مصروف
                  </Button>
                  <h3 className="text-lg font-semibold">مصروفات المكتب</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">الفئة</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {officeExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-right">{formatSyrianDate(expense.expenseDate)}</TableCell>
                          <TableCell className="text-right">{expense.description}</TableCell>
                          <TableCell className="text-right">{expense.category}</TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            {expense.amount.toLocaleString()} ل.س
                          </TableCell>
                        </TableRow>
                      ))}
                      {officeExpenses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            لا توجد مصروفات مسجلة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="clients" className="mt-4">
                <h3 className="text-lg font-semibold mb-4 text-right">ملخص حسابات الموكلين</h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">اسم الموكل</TableHead>
                        <TableHead className="text-right">الأتعاب</TableHead>
                        <TableHead className="text-right">المدفوعات</TableHead>
                        <TableHead className="text-right">المصاريف</TableHead>
                        <TableHead className="text-right">الرصيد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientsAccounting.map(({ client, balance }) => (
                        <TableRow key={client.id}>
                          <TableCell className="text-right font-medium">{client.name}</TableCell>
                          <TableCell className="text-right text-green-600">
                            {balance.totalFees.toLocaleString()} ل.س
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {balance.totalPayments.toLocaleString()} ل.س
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            {balance.totalExpenses.toLocaleString()} ل.س
                          </TableCell>
                          <TableCell className={`text-right font-medium ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {balance.balance.toLocaleString()} ل.س
                          </TableCell>
                        </TableRow>
                      ))}
                      {clientsAccounting.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            لا توجد حسابات موكلين
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Income Dialog */}
        <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة وارد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="incomeDescription">الوصف</Label>
                <Input
                  id="incomeDescription"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  placeholder="وصف الوارد"
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
                <Label htmlFor="incomeSource">المصدر</Label>
                <Input
                  id="incomeSource"
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                  placeholder="مصدر الوارد"
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
              <Button onClick={handleAddIncome} className="w-full">
                إضافة وارد
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expense Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة مصروف</DialogTitle>
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
                <Label htmlFor="expenseCategory">الفئة</Label>
                <Input
                  id="expenseCategory"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  placeholder="فئة المصروف"
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
              <Button onClick={handleAddExpense} className="w-full">
                إضافة مصروف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default OfficeAccounting;
