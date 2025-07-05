
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, DollarSign, Receipt, CreditCard, Calendar as CalendarIcon, Eye, Calculator } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseFee, Payment, Expense, ClientAccountSummary, CaseAccountSummary } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const Accounting = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [caseFees, setCaseFees] = useState<CaseFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  // Dialog states
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<CaseFee | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingAccount, setViewingAccount] = useState<'client' | 'case' | null>(null);

  // Form states
  const [feeForm, setFeeForm] = useState({
    amount: '',
    description: '',
    type: 'consultation' as CaseFee['type'],
    dateSet: undefined as Date | undefined,
    isPaid: false
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    description: '',
    paymentMethod: 'cash' as Payment['paymentMethod'],
    paymentDate: undefined as Date | undefined,
    receiptNumber: '',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    type: 'court_fees' as Expense['type'],
    expenseDate: undefined as Date | undefined,
    receiptNumber: '',
    isReimbursable: false,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setCaseFees(dataStore.getCaseFees());
    setPayments(dataStore.getPayments());
    setExpenses(dataStore.getExpenses());
  };

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const toggleCase = (caseId: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseId)) {
      newExpanded.delete(caseId);
    } else {
      newExpanded.add(caseId);
    }
    setExpandedCases(newExpanded);
  };

  // Fee CRUD operations
  const handleAddFee = () => {
    if (!feeForm.amount || !feeForm.description || !selectedCaseId || !feeForm.dateSet) return;

    dataStore.addCaseFee({
      caseId: selectedCaseId,
      amount: parseFloat(feeForm.amount),
      description: feeForm.description,
      type: feeForm.type,
      dateSet: feeForm.dateSet,
      isPaid: feeForm.isPaid
    });

    resetFeeForm();
    setIsFeeDialogOpen(false);
    loadData();
  };

  const handleEditFee = () => {
    if (!editingFee || !feeForm.amount || !feeForm.description || !feeForm.dateSet) return;

    dataStore.updateCaseFee(editingFee.id, {
      amount: parseFloat(feeForm.amount),
      description: feeForm.description,
      type: feeForm.type,
      dateSet: feeForm.dateSet,
      isPaid: feeForm.isPaid
    });

    resetFeeForm();
    setIsFeeDialogOpen(false);
    setEditingFee(null);
    loadData();
  };

  // Payment CRUD operations
  const handleAddPayment = () => {
    if (!paymentForm.amount || !paymentForm.description || !selectedCaseId || !paymentForm.paymentDate) return;

    const case_ = cases.find(c => c.id === selectedCaseId);
    if (!case_) return;

    dataStore.addPayment({
      caseId: selectedCaseId,
      clientId: case_.clientId,
      amount: parseFloat(paymentForm.amount),
      description: paymentForm.description,
      paymentMethod: paymentForm.paymentMethod,
      paymentDate: paymentForm.paymentDate,
      receiptNumber: paymentForm.receiptNumber,
      notes: paymentForm.notes
    });

    resetPaymentForm();
    setIsPaymentDialogOpen(false);
    loadData();
  };

  const handleEditPayment = () => {
    if (!editingPayment || !paymentForm.amount || !paymentForm.description || !paymentForm.paymentDate) return;

    dataStore.updatePayment(editingPayment.id, {
      amount: parseFloat(paymentForm.amount),
      description: paymentForm.description,
      paymentMethod: paymentForm.paymentMethod,
      paymentDate: paymentForm.paymentDate,
      receiptNumber: paymentForm.receiptNumber,
      notes: paymentForm.notes
    });

    resetPaymentForm();
    setIsPaymentDialogOpen(false);
    setEditingPayment(null);
    loadData();
  };

  // Expense CRUD operations
  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description || !selectedCaseId || !expenseForm.expenseDate) return;

    dataStore.addExpense({
      caseId: selectedCaseId,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      type: expenseForm.type,
      expenseDate: expenseForm.expenseDate,
      receiptNumber: expenseForm.receiptNumber,
      isReimbursable: expenseForm.isReimbursable,
      notes: expenseForm.notes
    });

    resetExpenseForm();
    setIsExpenseDialogOpen(false);
    loadData();
  };

  const handleEditExpense = () => {
    if (!editingExpense || !expenseForm.amount || !expenseForm.description || !expenseForm.expenseDate) return;

    dataStore.updateExpense(editingExpense.id, {
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      type: expenseForm.type,
      expenseDate: expenseForm.expenseDate,
      receiptNumber: expenseForm.receiptNumber,
      isReimbursable: expenseForm.isReimbursable,
      notes: expenseForm.notes
    });

    resetExpenseForm();
    setIsExpenseDialogOpen(false);
    setEditingExpense(null);
    loadData();
  };

  // Reset form functions
  const resetFeeForm = () => {
    setFeeForm({
      amount: '',
      description: '',
      type: 'consultation',
      dateSet: undefined,
      isPaid: false
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      description: '',
      paymentMethod: 'cash',
      paymentDate: undefined,
      receiptNumber: '',
      notes: ''
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      amount: '',
      description: '',
      type: 'court_fees',
      expenseDate: undefined,
      receiptNumber: '',
      isReimbursable: false,
      notes: ''
    });
  };

  // Open dialog functions
  const openAddFeeDialog = (caseId: string) => {
    resetFeeForm();
    setSelectedCaseId(caseId);
    setEditingFee(null);
    setIsFeeDialogOpen(true);
  };

  const openEditFeeDialog = (fee: CaseFee) => {
    setFeeForm({
      amount: fee.amount.toString(),
      description: fee.description,
      type: fee.type,
      dateSet: fee.dateSet,
      isPaid: fee.isPaid
    });
    setEditingFee(fee);
    setIsFeeDialogOpen(true);
  };

  const openAddPaymentDialog = (caseId: string) => {
    resetPaymentForm();
    setSelectedCaseId(caseId);
    setEditingPayment(null);
    setIsPaymentDialogOpen(true);
  };

  const openEditPaymentDialog = (payment: Payment) => {
    setPaymentForm({
      amount: payment.amount.toString(),
      description: payment.description,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      receiptNumber: payment.receiptNumber || '',
      notes: payment.notes || ''
    });
    setEditingPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  const openAddExpenseDialog = (caseId: string) => {
    resetExpenseForm();
    setSelectedCaseId(caseId);
    setEditingExpense(null);
    setIsExpenseDialogOpen(true);
  };

  const openEditExpenseDialog = (expense: Expense) => {
    setExpenseForm({
      amount: expense.amount.toString(),
      description: expense.description,
      type: expense.type,
      expenseDate: expense.expenseDate,
      receiptNumber: expense.receiptNumber || '',
      isReimbursable: expense.isReimbursable,
      notes: expense.notes || ''
    });
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  const openClientAccountDialog = (clientId: string) => {
    setSelectedClientId(clientId);
    setViewingAccount('client');
    setIsAccountDialogOpen(true);
  };

  const openCaseAccountDialog = (caseId: string) => {
    setSelectedCaseId(caseId);
    setViewingAccount('case');
    setIsAccountDialogOpen(true);
  };

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getCaseFees = (caseId: string) => {
    return caseFees.filter(fee => fee.caseId === caseId);
  };

  const getCasePayments = (caseId: string) => {
    return payments.filter(payment => payment.caseId === caseId);
  };

  const getCaseExpenses = (caseId: string) => {
    return expenses.filter(expense => expense.caseId === caseId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getFeeTypeLabel = (type: CaseFee['type']) => {
    const labels = {
      consultation: 'استشارة',
      representation: 'توكيل',
      court_appearance: 'حضور جلسة',
      document_preparation: 'إعداد وثائق',
      other: 'أخرى'
    };
    return labels[type];
  };

  const getPaymentMethodLabel = (method: Payment['paymentMethod']) => {
    const labels = {
      cash: 'نقدي',
      bank_transfer: 'تحويل بنكي',
      check: 'شيك',
      other: 'أخرى'
    };
    return labels[method];
  };

  const getExpenseTypeLabel = (type: Expense['type']) => {
    const labels = {
      court_fees: 'رسوم محكمة',
      document_fees: 'رسوم وثائق',
      travel: 'سفر',
      communication: 'اتصالات',
      other: 'أخرى'
    };
    return labels[type];
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2 text-lg sm:text-xl">
              <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              نظام المحاسبة
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="border-2 border-green-200 rounded-lg bg-green-50">
                  <Collapsible 
                    open={expandedClients.has(client.id)} 
                    onOpenChange={() => toggleClient(client.id)}
                  >
                    <CollapsibleTrigger className="w-full p-3 sm:p-4 text-right hover:bg-green-100 transition-colors rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openClientAccountDialog(client.id);
                            }}
                            className="p-2"
                            title="عرض كشف حساب الموكل"
                          >
                            <Eye className="h-5 w-5 text-blue-600" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-medium text-sm sm:text-base">{client.name}</span>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              الرصيد: {formatCurrency(dataStore.getClientAccountSummary(client.id).balance)}
                            </div>
                          </div>
                          <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                          {expandedClients.has(client.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="mr-4 sm:mr-6 space-y-3">
                        {getClientCases(client.id).map((case_) => (
                          <div key={case_.id} className="border-2 border-blue-200 rounded-md bg-blue-50">
                            <Collapsible
                              open={expandedCases.has(case_.id)}
                              onOpenChange={() => toggleCase(case_.id)}
                            >
                              <CollapsibleTrigger className="w-full p-3 text-right hover:bg-blue-100 transition-colors rounded-md">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openCaseAccountDialog(case_.id);
                                      }}
                                      className="p-2"
                                      title="عرض كشف حساب القضية"
                                    >
                                      <Eye className="h-5 w-5 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddFeeDialog(case_.id);
                                      }}
                                      className="p-2"
                                      title="إضافة أتعاب"
                                    >
                                      <Plus className="h-5 w-5 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddPaymentDialog(case_.id);
                                      }}
                                      className="p-2"
                                      title="إضافة دفعة"
                                    >
                                      <CreditCard className="h-5 w-5 text-purple-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAddExpenseDialog(case_.id);
                                      }}
                                      className="p-2"
                                      title="إضافة مصروف"
                                    >
                                      <Receipt className="h-5 w-5 text-red-600" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <span className="font-medium text-sm sm:text-base">{case_.subject}</span>
                                      <div className="text-xs sm:text-sm text-muted-foreground">
                                        الرصيد: {formatCurrency(dataStore.getCaseAccountSummary(case_.id).balance)}
                                      </div>
                                    </div>
                                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    {expandedCases.has(case_.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent className="px-3 pb-3">
                                <div className="mr-4 sm:mr-6 space-y-4">
                                  {/* Fees Table */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-2 text-green-700">الأتعاب</h4>
                                    {getCaseFees(case_.id).length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-green-50">
                                              <TableHead className="text-right text-green-700 text-xs">المبلغ</TableHead>
                                              <TableHead className="text-right text-green-700 text-xs">الوصف</TableHead>
                                              <TableHead className="text-right text-green-700 text-xs">النوع</TableHead>
                                              <TableHead className="text-right text-green-700 text-xs">التاريخ</TableHead>
                                              <TableHead className="text-right text-green-700 text-xs">الحالة</TableHead>
                                              <TableHead className="text-right text-green-700 text-xs">إجراءات</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {getCaseFees(case_.id).map((fee) => (
                                              <TableRow key={fee.id}>
                                                <TableCell className="text-right text-xs font-medium">
                                                  {formatCurrency(fee.amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-xs">{fee.description}</TableCell>
                                                <TableCell className="text-right text-xs">{getFeeTypeLabel(fee.type)}</TableCell>
                                                <TableCell className="text-right text-xs">{formatSyrianDate(fee.dateSet)}</TableCell>
                                                <TableCell className="text-right text-xs">
                                                  <span className={`px-2 py-1 rounded text-xs ${fee.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {fee.isPaid ? 'مدفوع' : 'غير مدفوع'}
                                                  </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  <div className="flex gap-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => openEditFeeDialog(fee)}
                                                      className="p-1"
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => {
                                                        dataStore.deleteCaseFee(fee.id);
                                                        loadData();
                                                      }}
                                                      className="p-1 text-red-600"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-muted-foreground text-xs">
                                        لا توجد أتعاب حتى الآن
                                      </div>
                                    )}
                                  </div>

                                  {/* Payments Table */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-2 text-purple-700">الدفعات</h4>
                                    {getCasePayments(case_.id).length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-purple-50">
                                              <TableHead className="text-right text-purple-700 text-xs">المبلغ</TableHead>
                                              <TableHead className="text-right text-purple-700 text-xs">الوصف</TableHead>
                                              <TableHead className="text-right text-purple-700 text-xs">طريقة الدفع</TableHead>
                                              <TableHead className="text-right text-purple-700 text-xs">التاريخ</TableHead>
                                              <TableHead className="text-right text-purple-700 text-xs">إجراءات</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {getCasePayments(case_.id).map((payment) => (
                                              <TableRow key={payment.id}>
                                                <TableCell className="text-right text-xs font-medium text-green-600">
                                                  {formatCurrency(payment.amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-xs">{payment.description}</TableCell>
                                                <TableCell className="text-right text-xs">{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                                                <TableCell className="text-right text-xs">{formatSyrianDate(payment.paymentDate)}</TableCell>
                                                <TableCell className="text-right">
                                                  <div className="flex gap-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => openEditPaymentDialog(payment)}
                                                      className="p-1"
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => {
                                                        dataStore.deletePayment(payment.id);
                                                        loadData();
                                                      }}
                                                      className="p-1 text-red-600"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-muted-foreground text-xs">
                                        لا توجد دفعات حتى الآن
                                      </div>
                                    )}
                                  </div>

                                  {/* Expenses Table */}
                                  <div>
                                    <h4 className="font-medium text-sm mb-2 text-red-700">المصاريف</h4>
                                    {getCaseExpenses(case_.id).length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-red-50">
                                              <TableHead className="text-right text-red-700 text-xs">المبلغ</TableHead>
                                              <TableHead className="text-right text-red-700 text-xs">الوصف</TableHead>
                                              <TableHead className="text-right text-red-700 text-xs">النوع</TableHead>
                                              <TableHead className="text-right text-red-700 text-xs">التاريخ</TableHead>
                                              <TableHead className="text-right text-red-700 text-xs">قابل للاسترداد</TableHead>
                                              <TableHead className="text-right text-red-700 text-xs">إجراءات</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {getCaseExpenses(case_.id).map((expense) => (
                                              <TableRow key={expense.id}>
                                                <TableCell className="text-right text-xs font-medium text-red-600">
                                                  {formatCurrency(expense.amount)}
                                                </TableCell>
                                                <TableCell className="text-right text-xs">{expense.description}</TableCell>
                                                <TableCell className="text-right text-xs">{getExpenseTypeLabel(expense.type)}</TableCell>
                                                <TableCell className="text-right text-xs">{formatSyrianDate(expense.expenseDate)}</TableCell>
                                                <TableCell className="text-right text-xs">
                                                  {expense.isReimbursable ? 'نعم' : 'لا'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                  <div className="flex gap-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => openEditExpenseDialog(expense)}
                                                      className="p-1"
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => {
                                                        dataStore.deleteExpense(expense.id);
                                                        loadData();
                                                      }}
                                                      className="p-1 text-red-600"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-muted-foreground text-xs">
                                        لا توجد مصاريف حتى الآن
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Dialog */}
        <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">{editingFee ? 'تعديل أتعاب' : 'إضافة أتعاب جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feeAmount">المبلغ</Label>
                <Input
                  id="feeAmount"
                  type="number"
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  placeholder="مبلغ الأتعاب"
                  className="text-right"
                />
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
                <Label htmlFor="feeType">نوع الأتعاب</Label>
                <Select value={feeForm.type} onValueChange={(value: CaseFee['type']) => setFeeForm({ ...feeForm, type: value })}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع الأتعاب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">استشارة</SelectItem>
                    <SelectItem value="representation">توكيل</SelectItem>
                    <SelectItem value="court_appearance">حضور جلسة</SelectItem>
                    <SelectItem value="document_preparation">إعداد وثائق</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>تاريخ تحديد الأتعاب</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !feeForm.dateSet && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {feeForm.dateSet ? (
                        formatSyrianDate(feeForm.dateSet)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={feeForm.dateSet}
                      onSelect={(date) => setFeeForm({ ...feeForm, dateSet: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={feeForm.isPaid}
                  onChange={(e) => setFeeForm({ ...feeForm, isPaid: e.target.checked })}
                />
                <Label htmlFor="isPaid">مدفوع</Label>
              </div>
              <Button 
                onClick={editingFee ? handleEditFee : handleAddFee} 
                className="w-full"
              >
                {editingFee ? 'تحديث الأتعاب' : 'إضافة أتعاب'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">{editingPayment ? 'تعديل دفعة' : 'إضافة دفعة جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount">المبلغ</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="مبلغ الدفعة"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="paymentDescription">الوصف</Label>
                <Input
                  id="paymentDescription"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="وصف الدفعة"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select value={paymentForm.paymentMethod} onValueChange={(value: Payment['paymentMethod']) => setPaymentForm({ ...paymentForm, paymentMethod: value })}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>تاريخ الدفع</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !paymentForm.paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {paymentForm.paymentDate ? (
                        formatSyrianDate(paymentForm.paymentDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentForm.paymentDate}
                      onSelect={(date) => setPaymentForm({ ...paymentForm, paymentDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="receiptNumber">رقم الإيصال</Label>
                <Input
                  id="receiptNumber"
                  value={paymentForm.receiptNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
                  placeholder="رقم الإيصال (اختياري)"
                  className="text-right"
                />
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
              <Button 
                onClick={editingPayment ? handleEditPayment : handleAddPayment} 
                className="w-full"
              >
                {editingPayment ? 'تحديث الدفعة' : 'إضافة دفعة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expense Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">{editingExpense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expenseAmount">المبلغ</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="مبلغ المصروف"
                  className="text-right"
                />
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
                <Label htmlFor="expenseType">نوع المصروف</Label>
                <Select value={expenseForm.type} onValueChange={(value: Expense['type']) => setExpenseForm({ ...expenseForm, type: value })}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع المصروف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="court_fees">رسوم محكمة</SelectItem>
                    <SelectItem value="document_fees">رسوم وثائق</SelectItem>
                    <SelectItem value="travel">سفر</SelectItem>
                    <SelectItem value="communication">اتصالات</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>تاريخ المصروف</Label>
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
                        formatSyrianDate(expenseForm.expenseDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expenseForm.expenseDate}
                      onSelect={(date) => setExpenseForm({ ...expenseForm, expenseDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="expenseReceiptNumber">رقم الإيصال</Label>
                <Input
                  id="expenseReceiptNumber"
                  value={expenseForm.receiptNumber}
                  onChange={(e) => setExpenseForm({ ...expenseForm, receiptNumber: e.target.value })}
                  placeholder="رقم الإيصال (اختياري)"
                  className="text-right"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isReimbursable"
                  checked={expenseForm.isReimbursable}
                  onChange={(e) => setExpenseForm({ ...expenseForm, isReimbursable: e.target.checked })}
                />
                <Label htmlFor="isReimbursable">قابل للاسترداد</Label>
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
              <Button 
                onClick={editingExpense ? handleEditExpense : handleAddExpense} 
                className="w-full"
              >
                {editingExpense ? 'تحديث المصروف' : 'إضافة مصروف'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Account Statement Dialog */}
        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">
                {viewingAccount === 'client' 
                  ? `كشف حساب الموكل: ${clients.find(c => c.id === selectedClientId)?.name}`
                  : `كشف حساب القضية: ${cases.find(c => c.id === selectedCaseId)?.subject}`
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {viewingAccount === 'client' && selectedClientId && (
                <div>
                  {(() => {
                    const summary = dataStore.getClientAccountSummary(selectedClientId);
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-lg font-bold text-green-600">{formatCurrency(summary.totalFees)}</div>
                              <div className="text-sm text-muted-foreground">إجمالي الأتعاب</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-lg font-bold text-blue-600">{formatCurrency(summary.totalPayments)}</div>
                              <div className="text-sm text-muted-foreground">إجمالي المدفوعات</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-lg font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
                              <div className="text-sm text-muted-foreground">إجمالي المصاريف</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className={`text-lg font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.balance)}
                              </div>
                              <div className="text-sm text-muted-foreground">الرصيد النهائي</div>
                            </CardContent>
                          </Card>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-3">تفاصيل القضايا</h3>
                          <div className="space-y-3">
                            {summary.caseSummaries.map((caseSummary) => {
                              const case_ = cases.find(c => c.id === caseSummary.caseId);
                              return (
                                <Card key={caseSummary.caseId}>
                                  <CardContent className="p-4">
                                    <h4 className="font-medium mb-2">{case_?.subject}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                      <div>أتعاب: {formatCurrency(caseSummary.totalFees)}</div>
                                      <div>مدفوعات: {formatCurrency(caseSummary.totalPayments)}</div>
                                      <div>مصاريف: {formatCurrency(caseSummary.totalExpenses)}</div>
                                      <div className={caseSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        رصيد: {formatCurrency(caseSummary.balance)}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {viewingAccount === 'case' && selectedCaseId && (
                <div>
                  {(() => {
                    const summary = dataStore.getCaseAccountSummary(selectedCaseId);
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-lg font-bold text-green-600">{formatCurrency(summary.totalFees)}</div>
                              <div className="text-sm text-muted-foreground">إجمالي الأتعاب</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-lg font-bold text-blue-600">{formatCurrency(summary.totalPayments)}</div>
                              <div className="text-sm text-muted-foreground">إجمالي المدفوعات</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-lg font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
                              <div className="text-sm text-muted-foreground">إجمالي المصاريف</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className={`text-lg font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.balance)}
                              </div>
                              <div className="text-sm text-muted-foreground">الرصيد النهائي</div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Accounting;
