
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Users, FileText } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, Payment, Expense, Fee } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';

const Accounting = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setPayments(dataStore.getPayments());
    setExpenses(dataStore.getExpenses());
    setFees(dataStore.getFees());
  };

  const getFilteredData = () => {
    let filteredPayments = payments;
    let filteredExpenses = expenses;
    let filteredFees = fees;

    if (selectedClient !== 'all') {
      filteredPayments = payments.filter(p => p.clientId === selectedClient);
      filteredExpenses = expenses.filter(e => e.clientId === selectedClient);
      filteredFees = fees.filter(f => f.clientId === selectedClient);
    }

    if (selectedCase !== 'all') {
      filteredExpenses = filteredExpenses.filter(e => e.caseId === selectedCase);
      filteredFees = filteredFees.filter(f => f.caseId === selectedCase);
    }

    return { filteredPayments, filteredExpenses, filteredFees };
  };

  const calculateTotals = () => {
    const { filteredPayments, filteredExpenses, filteredFees } = getFilteredData();
    
    const totalPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalFees = filteredFees.reduce((sum, fee) => sum + fee.amount, 0);
    const balance = totalPayments - totalExpenses - totalFees;

    return { totalPayments, totalExpenses, totalFees, balance };
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'غير محدد';
  };

  const getCaseName = (caseId: string) => {
    const case_ = cases.find(c => c.id === caseId);
    return case_ ? case_.subject : 'غير محدد';
  };

  const getFilteredCases = () => {
    if (selectedClient === 'all') return cases;
    return cases.filter(c => c.clientId === selectedClient);
  };

  const { filteredPayments, filteredExpenses, filteredFees } = getFilteredData();
  const { totalPayments, totalExpenses, totalFees, balance } = calculateTotals();

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">الحسابات المالية</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">اختر الموكل</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الموكلين" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الموكلين</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">اختر القضية</label>
          <Select value={selectedCase} onValueChange={setSelectedCase}>
            <SelectTrigger>
              <SelectValue placeholder="جميع القضايا" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع القضايا</SelectItem>
              {getFilteredCases().map((case_) => (
                <SelectItem key={case_.id} value={case_.id}>
                  {case_.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              إجمالي الدفعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalPayments.toLocaleString()} ل.س
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              إجمالي المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalExpenses.toLocaleString()} ل.س
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              إجمالي الأتعاب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalFees.toLocaleString()} ل.س
            </div>
          </CardContent>
        </Card>

        <Card className={`${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${balance >= 0 ? 'text-blue-700' : 'text-purple-700'} flex items-center gap-2`}>
              <DollarSign className="h-4 w-4" />
              الرصيد النهائي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-purple-600'}`}>
              {balance.toLocaleString()} ل.س
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              الدفعات المستلمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموكل</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-right">
                        {getClientName(payment.clientId)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {payment.amount.toLocaleString()} ل.س
                      </TableCell>
                      <TableCell className="text-right">
                        {formatSyrianDate(payment.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموكل</TableHead>
                    <TableHead className="text-right">القضية</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-right">
                        {getClientName(expense.clientId)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getCaseName(expense.caseId)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {expense.amount.toLocaleString()} ل.س
                      </TableCell>
                      <TableCell className="text-right">
                        {formatSyrianDate(expense.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        {expense.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            الأتعاب المستحقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموكل</TableHead>
                  <TableHead className="text-right">القضية</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="text-right">
                      {getClientName(fee.clientId)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getCaseName(fee.caseId)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-orange-600">
                      {fee.amount.toLocaleString()} ل.س
                    </TableCell>
                    <TableCell className="text-right">
                      {formatSyrianDate(fee.date)}
                    </TableCell>
                    <TableCell className="text-right">
                      {fee.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={fee.isPaid ? 'text-green-600' : 'text-red-600'}>
                        {fee.isPaid ? 'مدفوع' : 'مستحق'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounting;
