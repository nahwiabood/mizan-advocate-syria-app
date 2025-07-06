
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Case, CaseFee, CasePayment, CaseExpense, CaseBalance } from '@/types';
import { dataStore } from '@/store/dataStore';
import { toast } from "sonner";

interface CaseAccountingDialogProps {
  case_: Case;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeeForm {
  description: string;
  amount: string;
  feeDate: string;
}

interface PaymentForm {
  description: string;
  amount: string;
  paymentDate: string;
}

interface ExpenseForm {
  description: string;
  amount: string;
  expenseDate: string;
}

const CaseAccountingDialog: React.FC<CaseAccountingDialogProps> = ({
  case_,
  isOpen,
  onOpenChange,
}) => {
  const [fees, setFees] = useState<CaseFee[]>([]);
  const [payments, setPayments] = useState<CasePayment[]>([]);
  const [expenses, setExpenses] = useState<CaseExpense[]>([]);
  const [balance, setBalance] = useState<CaseBalance>({ totalFees: 0, totalPayments: 0, totalExpenses: 0, balance: 0 });

  const [feeForm, setFeeForm] = useState<FeeForm>({ description: '', amount: '', feeDate: new Date().toISOString().split('T')[0] });
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({ description: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({ description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });

  const [editingFee, setEditingFee] = useState<CaseFee | null>(null);
  const [editingPayment, setEditingPayment] = useState<CasePayment | null>(null);
  const [editingExpense, setEditingExpense] = useState<CaseExpense | null>(null);

  React.useEffect(() => {
    if (isOpen && case_) {
      loadData();
    }
  }, [isOpen, case_]);

  const loadData = () => {
    const caseFees = dataStore.getCaseFees(case_.id);
    const casePayments = dataStore.getCasePayments(case_.id);
    const caseExpenses = dataStore.getCaseExpenses(case_.id);
    const caseBalance = dataStore.getCaseBalance(case_.id);

    setFees(caseFees);
    setPayments(casePayments);
    setExpenses(caseExpenses);
    setBalance(caseBalance);
  };

  const addFee = () => {
    if (!feeForm.description || !feeForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingFee) {
        dataStore.updateCaseFee(editingFee.id, {
          description: feeForm.description,
          amount: parseFloat(feeForm.amount),
          feeDate: new Date(feeForm.feeDate),
        });
        setEditingFee(null);
        toast.success('تم تحديث الأتعاب بنجاح');
      } else {
        dataStore.addCaseFee({
          caseId: case_.id,
          description: feeForm.description,
          amount: parseFloat(feeForm.amount),
          feeDate: new Date(feeForm.feeDate),
        });
        toast.success('تم إضافة الأتعاب بنجاح');
      }

      setFeeForm({ description: '', amount: '', feeDate: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const addPayment = () => {
    if (!paymentForm.description || !paymentForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingPayment) {
        dataStore.updateCasePayment(editingPayment.id, {
          description: paymentForm.description,
          amount: parseFloat(paymentForm.amount),
          paymentDate: new Date(paymentForm.paymentDate),
        });
        setEditingPayment(null);
        toast.success('تم تحديث الدفعة بنجاح');
      } else {
        dataStore.addCasePayment({
          caseId: case_.id,
          description: paymentForm.description,
          amount: parseFloat(paymentForm.amount),
          paymentDate: new Date(paymentForm.paymentDate),
        });
        toast.success('تم إضافة الدفعة بنجاح');
      }

      setPaymentForm({ description: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const addExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingExpense) {
        dataStore.updateCaseExpense(editingExpense.id, {
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          expenseDate: new Date(expenseForm.expenseDate),
        });
        setEditingExpense(null);
        toast.success('تم تحديث المصروف بنجاح');
      } else {
        dataStore.addCaseExpense({
          caseId: case_.id,
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          expenseDate: new Date(expenseForm.expenseDate),
        });
        toast.success('تم إضافة المصروف بنجاح');
      }

      setExpenseForm({ description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const editFee = (fee: CaseFee) => {
    setEditingFee(fee);
    setFeeForm({
      description: fee.description,
      amount: fee.amount.toString(),
      feeDate: fee.feeDate.toISOString().split('T')[0],
    });
  };

  const editPayment = (payment: CasePayment) => {
    setEditingPayment(payment);
    setPaymentForm({
      description: payment.description,
      amount: payment.amount.toString(),
      paymentDate: payment.paymentDate.toISOString().split('T')[0],
    });
  };

  const editExpense = (expense: CaseExpense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      expenseDate: expense.expenseDate.toISOString().split('T')[0],
    });
  };

  const deleteFee = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البند؟')) {
      dataStore.deleteCaseFee(id);
      loadData();
      toast.success('تم حذف الأتعاب بنجاح');
    }
  };

  const deletePayment = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البند؟')) {
      dataStore.deleteCasePayment(id);
      loadData();
      toast.success('تم حذف الدفعة بنجاح');
    }
  };

  const deleteExpense = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البند؟')) {
      dataStore.deleteCaseExpense(id);
      loadData();
      toast.success('تم حذف المصروف بنجاح');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA').format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>محاسبة القضية: {case_.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">إجمالي الأتعاب</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(balance.totalFees)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">إجمالي المصاريف</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(balance.totalExpenses)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">إجمالي الدفعات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(balance.totalPayments)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الــرصــيــد</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${balance.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(balance.balance))}
                {balance.balance >= 0 ? ' مدين' : ' دائن'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="fees" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fees">الأتعاب</TabsTrigger>
            <TabsTrigger value="expenses">المصاريف</TabsTrigger>
            <TabsTrigger value="payments">الدفعات</TabsTrigger>
          </TabsList>

          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingFee ? 'تعديل الأتعاب' : 'إضافة أتعاب جديدة'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fee-description">الوصف</Label>
                    <Textarea
                      id="fee-description"
                      value={feeForm.description}
                      onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                      placeholder="وصف الأتعاب"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee-amount">المبلغ</Label>
                    <Input
                      id="fee-amount"
                      type="number"
                      step="0.01"
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee-date">التاريخ</Label>
                    <Input
                      id="fee-date"
                      type="date"
                      value={feeForm.feeDate}
                      onChange={(e) => setFeeForm({ ...feeForm, feeDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={addFee}>
                    <Plus className="w-4 h-4 mr-2" />
                    {editingFee ? 'تحديث' : 'إضافة'}
                  </Button>
                  {editingFee && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingFee(null);
                        setFeeForm({ description: '', amount: '', feeDate: new Date().toISOString().split('T')[0] });
                      }}
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>قائمة الأتعاب</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>{formatDate(fee.feeDate)}</TableCell>
                        <TableCell>{fee.description}</TableCell>
                        <TableCell>{formatCurrency(fee.amount)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editFee(fee)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteFee(fee.id)}>
                              <Trash2 className="w-4 h-4" />
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

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Label htmlFor="expense-amount">المبلغ</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      placeholder="0.00"
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
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={addExpense}>
                    <Plus className="w-4 h-4 mr-2" />
                    {editingExpense ? 'تحديث' : 'إضافة'}
                  </Button>
                  {editingExpense && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingExpense(null);
                        setExpenseForm({ description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });
                      }}
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>قائمة المصاريف</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editExpense(expense)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteExpense(expense.id)}>
                              <Trash2 className="w-4 h-4" />
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

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingPayment ? 'تعديل الدفعة' : 'إضافة دفعة جديدة'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="payment-description">الوصف</Label>
                    <Textarea
                      id="payment-description"
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                      placeholder="وصف الدفعة"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-amount">المبلغ</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-date">التاريخ</Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={addPayment}>
                    <Plus className="w-4 h-4 mr-2" />
                    {editingPayment ? 'تحديث' : 'إضافة'}
                  </Button>
                  {editingPayment && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingPayment(null);
                        setPaymentForm({ description: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] });
                      }}
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>قائمة الدفعات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editPayment(payment)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deletePayment(payment.id)}>
                              <Trash2 className="w-4 h-4" />
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CaseAccountingDialog;
