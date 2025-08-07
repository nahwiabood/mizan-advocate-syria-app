import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, DollarSign, TrendingDown, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, OfficeIncome, OfficeExpense, Case } from '@/types';
import { formatFullSyrianDate } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';
import { AccountingTable } from '@/components/AccountingTable';

const OfficeAccounting = () => {
  const [income, setIncome] = useState<OfficeIncome[]>([]);
  const [expenses, setExpenses] = useState<OfficeExpense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clientPayments, setClientPayments] = useState<any[]>([]);
  const [clientExpenses, setClientExpenses] = useState<any[]>([]);
  const [casePayments, setCasePayments] = useState<any[]>([]);
  const [caseExpenses, setCaseExpenses] = useState<any[]>([]);
  const [caseFees, setCaseFees] = useState<any[]>([]);
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

  const fetchCaseExpenses = async () => {
    const { data, error } = await supabase.from('case_expenses').select('*');
    if (error) {
      console.error('Error fetching case expenses:', error);
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

  const loadData = async () => {
    try {
      const [
        incomeData, 
        expensesData, 
        clientsData,
        casesData,
        clientPaymentsData,
        clientExpensesData,
        casePaymentsData,
        caseExpensesData,
        caseFeesData
      ] = await Promise.all([
        dataStore.getOfficeIncome(),
        dataStore.getOfficeExpenses(),
        dataStore.getClients(),
        dataStore.getCases(),
        dataStore.getClientPayments(),
        dataStore.getClientExpenses(),
        fetchCasePayments(),
        fetchCaseExpenses(),
        fetchCaseFees()
      ]);

      console.log('Loaded data:', {
        clients: clientsData.length,
        cases: casesData.length,
        clientPayments: clientPaymentsData.length,
        casePayments: casePaymentsData.length,
        clientExpenses: clientExpensesData.length,
        caseExpenses: caseExpensesData.length
      });

      setIncome(incomeData);
      setExpenses(expensesData);
      setClients(clientsData);
      setCases(casesData);
      setClientPayments(clientPaymentsData);
      setClientExpenses(clientExpensesData);
      setCasePayments(casePaymentsData);
      setCaseExpenses(caseExpensesData);
      setCaseFees(caseFeesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getClientName = (clientId: string): string => {
    if (!clientId) return 'موكل غير محدد';
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'موكل غير محدد';
  };

  const getCaseTitle = (caseId: string): string => {
    if (!caseId) return 'قضية غير محددة';
    const caseData = cases.find(c => c.id === caseId);
    return caseData ? caseData.title : 'قضية غير محددة';
  };

  const getClientIdFromCase = (caseId: string): string => {
    if (!caseId) return '';
    const caseData = cases.find(c => c.id === caseId);
    return caseData ? caseData.clientId : '';
  };

  const handleEditEntry = async (entry: any, type: string) => {
    try {
      switch (type) {
        case 'office_income':
          await dataStore.updateOfficeIncome(entry.id, entry);
          break;
        case 'office_expense':
          await dataStore.updateOfficeExpense(entry.id, entry);
          break;
        case 'client_payment':
          await dataStore.updateClientPayment(entry.id, entry);
          break;
        case 'client_expense':
          await dataStore.updateClientExpense(entry.id, entry);
          break;
        case 'case_payment':
          await supabase.from('case_payments').update(entry).eq('id', entry.id);
          break;
        case 'case_expense':
          await supabase.from('case_expenses').update(entry).eq('id', entry.id);
          break;
        case 'case_fee':
          await supabase.from('case_fees').update(entry).eq('id', entry.id);
          break;
      }
      await loadData();
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string, type: string) => {
    try {
      switch (type) {
        case 'office_income':
          await dataStore.deleteOfficeIncome(id);
          break;
        case 'office_expense':
          await dataStore.deleteOfficeExpense(id);
          break;
        case 'client_payment':
          await dataStore.deleteClientPayment(id);
          break;
        case 'client_expense':
          await dataStore.deleteClientExpense(id);
          break;
        case 'case_payment':
          await supabase.from('case_payments').delete().eq('id', id);
          break;
        case 'case_expense':
          await supabase.from('case_expenses').delete().eq('id', id);
          break;
        case 'case_fee':
          await supabase.from('case_fees').delete().eq('id', id);
          break;
      }
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleAddIncome = async () => {
    if (!incomeForm.description || !incomeForm.amount) return;

    try {
      await dataStore.addOfficeIncome({
        description: incomeForm.description,
        amount: parseFloat(incomeForm.amount),
        incomeDate: incomeForm.incomeDate,
        source: 'عام'
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
        category: 'عام'
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

  const allEntries = [
    // إيرادات المكتب
    ...income.map(item => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      date: item.incomeDate,
      type: 'payment' as const,
      source: 'إيرادات المكتب العامة',
      entryType: 'office_income'
    })),
    // دفعات الموكلين
    ...clientPayments.map(item => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      date: item.payment_date || item.paymentDate,
      type: 'payment' as const,
      source: getClientName(item.client_id || item.clientId),
      client_id: item.client_id || item.clientId,
      entryType: 'client_payment'
    })),
    // دفعات القضايا
    ...casePayments.map(item => {
      const clientId = getClientIdFromCase(item.case_id);
      const clientName = getClientName(clientId);
      const caseTitle = getCaseTitle(item.case_id);
      return {
        id: item.id,
        description: item.description,
        amount: item.amount,
        date: item.payment_date || item.paymentDate,
        type: 'payment' as const,
        source: `${clientName} - ${caseTitle}`,
        case_id: item.case_id,
        client_id: clientId,
        entryType: 'case_payment'
      };
    }),
    // مصاريف المكتب
    ...expenses.map(item => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      date: item.expenseDate,
      type: 'expense' as const,
      source: 'مصاريف المكتب العامة',
      entryType: 'office_expense'
    })),
    // مصاريف الموكلين
    ...clientExpenses.map(item => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      date: item.expense_date || item.expenseDate,
      type: 'expense' as const,
      source: getClientName(item.client_id || item.clientId),
      client_id: item.client_id || item.clientId,
      entryType: 'client_expense'
    })),
    // مصاريف القضايا
    ...caseExpenses.map(item => {
      const clientId = getClientIdFromCase(item.case_id);
      const clientName = getClientName(clientId);
      const caseTitle = getCaseTitle(item.case_id);
      return {
        id: item.id,
        description: item.description,
        amount: item.amount,
        date: item.expense_date || item.expenseDate,
        type: 'expense' as const,
        source: `${clientName} - ${caseTitle}`,
        case_id: item.case_id,
        client_id: clientId,
        entryType: 'case_expense'
      };
    })
  ].sort((a, b) => {
    // ترتيب تنازلي حسب التاريخ (الأحدث أولاً)
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  console.log('Final accounting entries (sorted):', allEntries);

  // حساب الإيرادات (بدون اتفاقات الأتعاب غير المحصلة)
  const officeIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const clientIncomeTotal = clientPayments.reduce((sum, item) => sum + item.amount, 0);
  const caseIncomeTotal = casePayments.reduce((sum, item) => sum + item.amount, 0);
  
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
                  <p className="text-sm text-muted-foreground">إجمالي الإيرادات المحصلة</p>
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

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-right flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
                محاسبة المكتب
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsIncomeDialogOpen(true)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-5 w-5" />
                  إضافة إيراد
                </Button>
                <Button 
                  onClick={() => setIsExpenseDialogOpen(true)}
                  className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-5 w-5" />
                  إضافة مصروف
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AccountingTable
              entries={allEntries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              getClientName={getClientName}
            />
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
