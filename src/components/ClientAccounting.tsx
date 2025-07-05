
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, DollarSign, Receipt, Calendar as CalendarIcon, CreditCard } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, Payment, Expense, Fee } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientAccountingProps {
  client: Client;
  cases: Case[];
}

const ClientAccounting = ({ client, cases }: ClientAccountingProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [balance, setBalance] = useState(0);

  // Dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date(),
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    date: new Date(),
    caseId: '',
    description: '',
    notes: ''
  });

  const [feeForm, setFeeForm] = useState({
    amount: '',
    date: new Date(),
    caseId: '',
    description: '',
    notes: ''
  });

  useEffect(() => {
    loadAccountingData();
  }, [client.id]);

  const loadAccountingData = () => {
    const clientPayments = dataStore.getPayments().filter(p => p.clientId === client.id);
    const clientExpenses = dataStore.getExpenses().filter(e => e.clientId === client.id);
    const clientFees = dataStore.getFees().filter(f => f.clientId === client.id);
    
    setPayments(clientPayments);
    setExpenses(clientExpenses);
    setFees(clientFees);
    setBalance(dataStore.getClientBalance(client.id));
  };

  const handleAddPayment = () => {
    if (!paymentForm.amount) return;

    dataStore.addPayment({
      clientId: client.id,
      amount: parseFloat(paymentForm.amount),
      date: paymentForm.date,
      notes: paymentForm.notes
    });

    resetPaymentForm();
    setIsPaymentDialogOpen(false);
    loadAccountingData();
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.caseId || !expenseForm.description) return;

    dataStore.addExpense({
      clientId: client.id,
      caseId: expenseForm.caseId,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
      description: expenseForm.description,
      notes: expenseForm.notes
    });

    resetExpenseForm();
    setIsExpenseDialogOpen(false);
    loadAccountingData();
  };

  const handleAddFee = () => {
    if (!feeForm.amount || !feeForm.caseId || !feeForm.description) return;

    dataStore.addFee({
      clientId: client.id,
      caseId: feeForm.caseId,
      amount: parseFloat(feeForm.amount),
      date: feeForm.date,
      description: feeForm.description,
      isPaid: false,
      notes: feeForm.notes
    });

    resetFeeForm();
    setIsFeeDialogOpen(false);
    loadAccountingData();
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      date: new Date(),
      notes: ''
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      amount: '',
      date: new Date(),
      caseId: '',
      description: '',
      notes: ''
    });
  };

  const resetFeeForm = () => {
    setFeeForm({
      amount: '',
      date: new Date(),
      caseId: '',
      description: '',
      notes: ''
    });
  };

  const getCaseName = (caseId: string) => {
    const case_ = cases.find(c => c.id === caseId);
    return case_ ? case_.subject : 'غير محدد';
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2">
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            رصيد الحساب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center">
            <span className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
              {balance.toLocaleString()} ل.س
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-5 w-5" />
          إضافة دفعة
        </Button>
        <Button onClick={() => setIsExpenseDialogOpen(true)} className="gap-2 bg-red-600 hover:bg-red-700">
          <Plus className="h-5 w-5" />
          إضافة مصروف
        </Button>
        <Button onClick={() => setIsFeeDialogOpen(true)} className="gap-2 bg-orange-600 hover:bg-orange-700">
          <Plus className="h-5 w-5" />
          إضافة أتعاب
        </Button>
      </div>

      {/* Accounting Tables */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            الدفعات
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <Receipt className="h-4 w-4" />
            المصروفات
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-2">
            <DollarSign className="h-4 w-4" />
            الأتعاب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الدفعات المستلمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
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
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">القضية</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">الملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-right font-medium text-red-600">
                          {expense.amount.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell className="text-right">
                          {formatSyrianDate(expense.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getCaseName(expense.caseId)}
                        </TableCell>
                        <TableCell className="text-right">
                          {expense.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {expense.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الأتعاب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">القضية</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="text-right font-medium text-orange-600">
                          {fee.amount.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell className="text-right">
                          {formatSyrianDate(fee.date)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getCaseName(fee.caseId)}
                        </TableCell>
                        <TableCell className="text-right">
                          {fee.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={fee.isPaid ? 'text-green-600' : 'text-red-600'}>
                            {fee.isPaid ? 'مدفوع' : 'مستحق'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {fee.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة دفعة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" dir="rtl">
            <div>
              <Label htmlFor="paymentAmount">المبلغ</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
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
                      !paymentForm.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {paymentForm.date ? (
                      formatSyrianDate(paymentForm.date)
                    ) : (
                      <span>اختر تاريخاً</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentForm.date}
                    onSelect={(date) => setPaymentForm({ ...paymentForm, date: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="paymentNotes">ملاحظات</Label>
              <Textarea
                id="paymentNotes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
                className="text-right"
              />
            </div>
            <Button onClick={handleAddPayment} className="w-full">
              إضافة دفعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة مصروف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" dir="rtl">
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
                      !expenseForm.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {expenseForm.date ? (
                      formatSyrianDate(expenseForm.date)
                    ) : (
                      <span>اختر تاريخاً</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expenseForm.date}
                    onSelect={(date) => setExpenseForm({ ...expenseForm, date: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="expenseCase">القضية</Label>
              <Select onValueChange={(value) => setExpenseForm({ ...expenseForm, caseId: value })}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر القضية" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((case_) => (
                    <SelectItem key={case_.id} value={case_.id}>
                      {case_.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="expenseNotes">ملاحظات</Label>
              <Textarea
                id="expenseNotes"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
                className="text-right"
              />
            </div>
            <Button onClick={handleAddExpense} className="w-full">
              إضافة مصروف
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fee Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة أتعاب جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" dir="rtl">
            <div>
              <Label htmlFor="feeAmount">المبلغ</Label>
              <Input
                id="feeAmount"
                type="number"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
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
                      !feeForm.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {feeForm.date ? (
                      formatSyrianDate(feeForm.date)
                    ) : (
                      <span>اختر تاريخاً</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={feeForm.date}
                    onSelect={(date) => setFeeForm({ ...feeForm, date: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="feeCase">القضية</Label>
              <Select onValueChange={(value) => setFeeForm({ ...feeForm, caseId: value })}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر القضية" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((case_) => (
                    <SelectItem key={case_.id} value={case_.id}>
                      {case_.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feeDescription">الوصف</Label>
              <Input
                id="feeDescription"
                value={feeForm.description}
                onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                placeholder="وصف الأتعاب"
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="feeNotes">ملاحظات</Label>
              <Textarea
                id="feeNotes"
                value={feeForm.notes}
                onChange={(e) => setFeeForm({ ...feeForm, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
                className="text-right"
              />
            </div>
            <Button onClick={handleAddFee} className="w-full">
              إضافة أتعاب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAccounting;
