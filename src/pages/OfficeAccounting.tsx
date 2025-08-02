
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
import { Plus, DollarSign, TrendingDown, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, OfficeIncome, OfficeExpense } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const OfficeAccounting = () => {
  const [income, setIncome] = useState<OfficeIncome[]>([]);
  const [expenses, setExpenses] = useState<OfficeExpense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientPayments, setClientPayments] = useState<any[]>([]);
  const [clientFees, setClientFees] = useState<any[]>([]);
  const [clientExpenses, setClientExpenses] = useState<any[]>([]);
  const [casePayments, setCasePayments] = useState<any[]>([]);
  const [caseFees, setCaseFees] = useState<any[]>([]);
  const [caseExpenses, setCaseExpenses] = useState<any[]>([]);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    incomeDate: new Date()
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    expenseDate: new Date()
  });

  useEffect(() => {
    loadData();
  }, []);

  const fetchCasePayments = async () => {
    const { data, error } = await supabase.from('case_payments').select('*');
    if (error) {
      console.error('Error fetching case payments:', error);
      return [];
    }
    return data || [];
  };

  const fetchCaseFees = async () => {
    const { data, error } = await supabase.from('case_fees').select('*');
    if (error) {
      console.error('Error fetching case fees:', error);
      return [];
    }
    return data || [];
  };

  const fetchCaseExpenses = async () => {
    const { data, error } = await supabase.from('case_expenses').select('*');
    if (error) {
      console.error('Error fetching case expenses:', error);
      return [];
    }
    return data || [];
  };

  const loadData = async () => {
    try {
      const [
        incomeData, 
        expensesData, 
        clientsData, 
        clientPaymentsData,
        clientFeesData,
        clientExpensesData,
        casePaymentsData,
        caseFeesData,
        caseExpensesData
      ] = await Promise.all([
        dataStore.getOfficeIncome(),
        dataStore.getOfficeExpenses(),
        dataStore.getClients(),
        dataStore.getClientPayments(),
        dataStore.getClientFees(),
        dataStore.getClientExpenses(),
        fetchCasePayments(),
        fetchCaseFees(),
        fetchCaseExpenses()
      ]);

      setIncome(incomeData);
      setExpenses(expensesData);
      setClients(clientsData);
      setClientPayments(clientPaymentsData);
      setClientFees(clientFeesData);
      setClientExpenses(clientExpensesData);
      setCasePayments(casePaymentsData);
      setCaseFees(caseFeesData);
      setCaseExpenses(caseExpensesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddIncome = async () => {
    if (!incomeForm.description || !incomeForm.amount) return;

    try {
      await dataStore.addOfficeIncome({
        description: incomeForm.description,
        amount: parseFloat(incomeForm.amount),
        incomeDate: incomeForm.incomeDate,
        source: 'عام' // Default source
      });

      resetIncomeForm();
      setIsIncomeDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) return;

    try {
      await dataStore.addOfficeExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        category: 'عام' // Default category
      });

      resetExpenseForm();
      setIsExpenseDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const resetIncomeForm = () => {
    setIncomeForm({
      description: '',
      amount: '',
      incomeDate: new Date()
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      expenseDate: new Date()
    });
  };

  // Helper function to safely format dates
  const safeFormatDate = (date: any): string => {
    if (!date) return 'غير محدد';
    try {
      // Handle string dates from database
      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return 'تاريخ غير صحيح';
        }
        return formatSyrianDate(parsedDate);
      }
      // Handle Date objects
      if (date instanceof Date) {
        if (isNaN(date.getTime())) {
          return 'تاريخ غير صحيح';
        }
        return formatSyrianDate(date);
      }
      return 'تاريخ غير صحيح';
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'تاريخ غير صحيح';
    }
  };

  // Helper function to get client name by ID
  const getClientNameById = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'موكل غير معروف';
  };

  // Calculate totals including client and case data
  const officeIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const clientIncomeTotal = clientPayments.reduce((sum, item) => sum + item.amount, 0) + 
                           clientFees.reduce((sum, item) => sum + item.amount, 0);
  const caseIncomeTotal = casePayments.reduce((sum, item) => sum + item.amount, 0) + 
                         caseFees.reduce((sum, item) => sum + item.amount, 0);
  
  const totalIncome = officeIncome + clientIncomeTotal + caseIncomeTotal;
  
  const officeExpensesTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const clientExpensesTotal = clientExpenses.reduce((sum, item) => sum + item.amount, 0);
  const caseExpensesTotal = caseExpenses.reduce((sum, item) => sum + item.amount, 0);
  
  const totalExpenses = officeExpensesTotal + clientExpensesTotal + caseExpensesTotal;
  const netProfit = totalIncome - totalExpenses;

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} ل.س</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">إجمالي المصاريف</p>
                  <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} ل.س</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">صافي الربح</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {netProfit.toLocaleString()} ل.س
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-right flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              محاسبة المكتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted rounded-lg p-1">
                <TabsTrigger 
                  value="expenses" 
                  className="text-sm px-4 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  المصاريف
                </TabsTrigger>
                <TabsTrigger 
                  value="income" 
                  className="text-sm px-4 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  الإيرادات
                </TabsTrigger>
              </TabsList>

              {/* Expenses Tab */}
              <TabsContent value="expenses" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-right flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    المصاريف
                  </h3>
                  <Button 
                    onClick={() => setIsExpenseDialogOpen(true)}
                    className="gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-5 w-5" />
                    إضافة مصروف
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                     <TableBody>
                       {/* Office Expenses */}
                       {expenses.map((item) => (
                         <TableRow key={`office-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.expenseDate)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-muted-foreground">مصاريف المكتب العامة</span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-red-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {/* Client Expenses */}
                       {clientExpenses.map((item) => (
                         <TableRow key={`client-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.expense_date)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-blue-600 font-medium">
                                 مصروف في حساب الموكل: {getClientNameById(item.client_id)}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-red-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {/* Case Expenses */}
                       {caseExpenses.map((item) => (
                         <TableRow key={`case-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.expense_date)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-purple-600 font-medium">
                                 مصروف قضية رقم: {item.case_id}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-red-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {(expenses.length === 0 && clientExpenses.length === 0 && caseExpenses.length === 0) && (
                         <TableRow>
                           <TableCell colSpan={3} className="text-center text-muted-foreground">
                             لا توجد مصاريف مسجلة
                           </TableCell>
                         </TableRow>
                       )}
                     </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Income Tab */}
              <TabsContent value="income" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-right flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    الإيرادات
                  </h3>
                  <Button 
                    onClick={() => setIsIncomeDialogOpen(true)}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-5 w-5" />
                    إضافة إيراد
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                     <TableBody>
                       {/* Office Income */}
                       {income.map((item) => (
                         <TableRow key={`office-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.incomeDate)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-muted-foreground">إيرادات المكتب العامة</span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-green-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {/* Client Payments */}
                       {clientPayments.map((item) => (
                         <TableRow key={`client-payment-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.payment_date)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-blue-600 font-medium">
                                 دفعة وارد في حساب الموكل: {getClientNameById(item.client_id)}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-green-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {/* Client Fees */}
                       {clientFees.map((item) => (
                         <TableRow key={`client-fee-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.fee_date)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-blue-600 font-medium">
                                 أتعاب وارد في حساب الموكل: {getClientNameById(item.client_id)}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-green-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {/* Case Payments */}
                       {casePayments.map((item) => (
                         <TableRow key={`case-payment-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.payment_date)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-purple-600 font-medium">
                                 دفعة قضية رقم: {item.case_id}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-green-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {/* Case Fees */}
                       {caseFees.map((item) => (
                         <TableRow key={`case-fee-${item.id}`}>
                           <TableCell className="text-right">{safeFormatDate(item.fee_date)}</TableCell>
                           <TableCell className="text-right">
                             <div className="flex flex-col">
                               <span>{item.description}</span>
                               <span className="text-xs text-purple-600 font-medium">
                                 أتعاب قضية رقم: {item.case_id}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell className="text-right text-green-600 font-medium">
                             {item.amount.toLocaleString()} ل.س
                           </TableCell>
                         </TableRow>
                       ))}
                       
                       {(income.length === 0 && clientPayments.length === 0 && clientFees.length === 0 && casePayments.length === 0 && caseFees.length === 0) && (
                         <TableRow>
                           <TableCell colSpan={3} className="text-center text-muted-foreground">
                             لا توجد إيرادات مسجلة
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
              <DialogTitle className="text-right">إضافة إيراد</DialogTitle>
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
              <Button onClick={handleAddIncome} className="w-full">
                إضافة إيراد
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
