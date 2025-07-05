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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, ChevronDown, ChevronRight, User, FileText, Calendar as CalendarIcon, Users, Search, DollarSign, Receipt, CreditCard, TrendingUp } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage, Session, CaseFee, Payment, Expense } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [caseFees, setCaseFees] = useState<CaseFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editingStage, setEditingStage] = useState<CaseStage | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  // Form states
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    opponent: '',
    subject: '',
    caseType: ''
  });

  const [stageForm, setStageForm] = useState({
    courtName: '',
    caseNumber: '',
    notes: ''
  });

  const [sessionForm, setSessionForm] = useState({
    firstSessionDate: undefined as Date | undefined,
    postponementReason: ''
  });

  const [feeForm, setFeeForm] = useState({
    amount: '',
    description: '',
    type: 'consultation' as 'consultation' | 'representation' | 'court_appearance' | 'document_preparation' | 'other',
    dateSet: undefined as Date | undefined
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    description: '',
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'check' | 'other',
    paymentDate: undefined as Date | undefined,
    receiptNumber: '',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    type: 'court_fees' as 'court_fees' | 'document_fees' | 'travel' | 'communication' | 'other',
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
    setStages(dataStore.getStages());
    setSessions(dataStore.getSessions());
    setCaseFees(dataStore.getCaseFees());
    setPayments(dataStore.getPayments());
    setExpenses(dataStore.getExpenses());
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
      setExpandedCases(new Set());
      setExpandedStages(new Set());
    } else {
      newExpanded.clear();
      newExpanded.add(clientId);
      setExpandedCases(new Set());
      setExpandedStages(new Set());
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
    setExpandedStages(new Set());
  };

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  // CRUD operations
  const handleAddClient = () => {
    if (!clientForm.name) return;

    dataStore.addClient({
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone,
      address: clientForm.address,
      notes: clientForm.notes
    });

    resetClientForm();
    setIsClientDialogOpen(false);
    loadData();
  };

  const handleEditClient = () => {
    if (!editingClient || !clientForm.name) return;

    dataStore.updateClient(editingClient.id, {
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone,
      address: clientForm.address,
      notes: clientForm.notes
    });

    resetClientForm();
    setIsClientDialogOpen(false);
    setEditingClient(null);
    loadData();
  };

  const handleAddCase = () => {
    if (!caseForm.opponent || !caseForm.subject || !selectedClientId) return;

    dataStore.addCase({
      clientId: selectedClientId,
      title: caseForm.title || caseForm.subject,
      description: caseForm.description || '',
      opponent: caseForm.opponent,
      subject: caseForm.subject,
      caseType: caseForm.caseType || 'عام',
      status: 'active'
    });

    resetCaseForm();
    setIsCaseDialogOpen(false);
    loadData();
  };

  const handleEditCase = () => {
    if (!editingCase || !caseForm.opponent || !caseForm.subject) return;

    dataStore.updateCase(editingCase.id, {
      title: caseForm.title || caseForm.subject,
      description: caseForm.description,
      opponent: caseForm.opponent,
      subject: caseForm.subject,
      caseType: caseForm.caseType
    });

    resetCaseForm();
    setIsCaseDialogOpen(false);
    setEditingCase(null);
    loadData();
  };

  const handleAddStage = () => {
    if (!stageForm.courtName || !stageForm.caseNumber || !selectedCaseId) return;

    dataStore.addStage({
      caseId: selectedCaseId,
      courtName: stageForm.courtName,
      caseNumber: stageForm.caseNumber,
      stageName: `${stageForm.courtName} - ${stageForm.caseNumber}`,
      notes: stageForm.notes,
      firstSessionDate: null,
      status: 'active'
    });

    resetStageForm();
    setIsStageDialogOpen(false);
    loadData();
  };

  const handleEditStage = () => {
    if (!editingStage || !stageForm.courtName || !stageForm.caseNumber) return;

    dataStore.updateStage(editingStage.id, {
      courtName: stageForm.courtName,
      caseNumber: stageForm.caseNumber,
      stageName: `${stageForm.courtName} - ${stageForm.caseNumber}`,
      notes: stageForm.notes
    });

    resetStageForm();
    setIsStageDialogOpen(false);
    setEditingStage(null);
    loadData();
  };

  const handleAddSession = () => {
    if (!sessionForm.firstSessionDate || !selectedStageId) return;

    const stage = stages.find(s => s.id === selectedStageId);
    if (!stage) return;

    const case_ = cases.find(c => c.id === stage.caseId);
    if (!case_) return;

    const client = clients.find(c => c.id === case_.clientId);
    if (!client) return;

    dataStore.addSession({
      stageId: selectedStageId,
      courtName: stage.courtName,
      caseNumber: stage.caseNumber,
      sessionDate: sessionForm.firstSessionDate,
      clientName: client.name,
      opponent: case_.opponent,
      postponementReason: sessionForm.postponementReason,
      isTransferred: false
    });

    // Update stage with first session date
    dataStore.updateStage(selectedStageId, {
      firstSessionDate: sessionForm.firstSessionDate
    });

    resetSessionForm();
    setIsSessionDialogOpen(false);
    loadData();
  };

  const handleAddFee = () => {
    if (!feeForm.amount || !feeForm.description || !selectedCaseId || !feeForm.dateSet) return;

    dataStore.addCaseFee({
      caseId: selectedCaseId,
      amount: parseFloat(feeForm.amount),
      description: feeForm.description,
      type: feeForm.type,
      dateSet: feeForm.dateSet,
      isPaid: false
    });

    resetFeeForm();
    setIsFeeDialogOpen(false);
    loadData();
  };

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

  // Reset form functions
  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  const resetCaseForm = () => {
    setCaseForm({
      title: '',
      description: '',
      opponent: '',
      subject: '',
      caseType: ''
    });
  };

  const resetStageForm = () => {
    setStageForm({
      courtName: '',
      caseNumber: '',
      notes: ''
    });
  };

  const resetSessionForm = () => {
    setSessionForm({
      firstSessionDate: undefined,
      postponementReason: ''
    });
  };

  const resetFeeForm = () => {
    setFeeForm({
      amount: '',
      description: '',
      type: 'consultation',
      dateSet: undefined
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
  const openAddClientDialog = () => {
    resetClientForm();
    setEditingClient(null);
    setIsClientDialogOpen(true);
  };

  const openEditClientDialog = (client: Client) => {
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  const openAddCaseDialog = (clientId: string) => {
    resetCaseForm();
    setSelectedClientId(clientId);
    setEditingCase(null);
    setIsCaseDialogOpen(true);
  };

  const openEditCaseDialog = (case_: Case) => {
    setCaseForm({
      title: case_.title,
      description: case_.description,
      opponent: case_.opponent,
      subject: case_.subject,
      caseType: case_.caseType
    });
    setEditingCase(case_);
    setIsCaseDialogOpen(true);
  };

  const openAddStageDialog = (caseId: string) => {
    resetStageForm();
    setSelectedCaseId(caseId);
    setEditingStage(null);
    setIsStageDialogOpen(true);
  };

  const openEditStageDialog = (stage: CaseStage) => {
    setStageForm({
      courtName: stage.courtName,
      caseNumber: stage.caseNumber,
      notes: stage.notes || ''
    });
    setEditingStage(stage);
    setIsStageDialogOpen(true);
  };

  const openAddSessionDialog = (stageId: string) => {
    resetSessionForm();
    setSelectedStageId(stageId);
    setIsSessionDialogOpen(true);
  };

  const openAddFeeDialog = (caseId: string) => {
    resetFeeForm();
    setSelectedCaseId(caseId);
    setIsFeeDialogOpen(true);
  };

  const openAddPaymentDialog = (caseId: string) => {
    resetPaymentForm();
    setSelectedCaseId(caseId);
    setIsPaymentDialogOpen(true);
  };

  const openAddExpenseDialog = (caseId: string) => {
    resetExpenseForm();
    setSelectedCaseId(caseId);
    setIsExpenseDialogOpen(true);
  };

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getCaseStages = (caseId: string) => {
    return stages.filter(stage => stage.caseId === caseId);
  };

  const getStageSessions = (stageId: string) => {
    return sessions.filter(session => session.stageId === stageId);
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

  const getCaseAccountSummary = (caseId: string) => {
    return dataStore.getCaseAccountSummary(caseId);
  };

  const getClientAccountSummary = (clientId: string) => {
    return dataStore.getClientAccountSummary(clientId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CardTitle className="text-right flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                إدارة الموكلين والمحاسبة
              </CardTitle>
              <Button onClick={openAddClientDialog} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5" />
                إضافة موكل
              </Button>
            </div>
            
            {/* Search input */}
            <div className="relative w-full max-w-md mx-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="البحث عن موكل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right pr-10"
              />
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {filteredClients.map((client) => {
                const clientSummary = getClientAccountSummary(client.id);
                return (
                  <div key={client.id} className="border-2 border-blue-200 rounded-lg bg-blue-50">
                    <Collapsible 
                      open={expandedClients.has(client.id)} 
                      onOpenChange={() => toggleClient(client.id)}
                    >
                      <CollapsibleTrigger className="w-full p-3 sm:p-4 text-right hover:bg-blue-100 transition-colors rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditClientDialog(client);
                              }}
                              className="p-2"
                              title="تعديل الموكل"
                            >
                              <Edit className="h-5 w-5 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddCaseDialog(client.id);
                              }}
                              className="p-2"
                              title="إضافة قضية"
                            >
                              <Plus className="h-5 w-5 text-green-600" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className="font-medium text-sm sm:text-base">{client.name}</span>
                                  {(client.phone || client.email) && (
                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                      {client.phone && <span>{client.phone}</span>}
                                      {client.phone && client.email && <span> • </span>}
                                      {client.email && <span>{client.email}</span>}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm bg-white p-2 rounded border">
                                  <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">كشف الحساب</span>
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div>الأتعاب: {formatCurrency(clientSummary.totalFees)}</div>
                                    <div>الدفعات: {formatCurrency(clientSummary.totalPayments)}</div>
                                    <div className={`font-medium ${clientSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      الرصيد: {formatCurrency(clientSummary.balance)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
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
                          {getClientCases(client.id).map((case_) => {
                            const caseSummary = getCaseAccountSummary(case_.id);
                            return (
                              <div key={case_.id} className="border-2 border-green-200 rounded-md bg-green-50">
                                <Collapsible
                                  open={expandedCases.has(case_.id)}
                                  onOpenChange={() => toggleCase(case_.id)}
                                >
                                  <CollapsibleTrigger className="w-full p-3 text-right hover:bg-green-100 transition-colors rounded-md">
                                    <div className="flex items-center justify-between">
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditCaseDialog(case_);
                                          }}
                                          className="p-2"
                                          title="تعديل القضية"
                                        >
                                          <Edit className="h-5 w-5 text-green-600" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openAddStageDialog(case_.id);
                                          }}
                                          className="p-2"
                                          title="إضافة مرحلة"
                                        >
                                          <Plus className="h-5 w-5 text-yellow-600" />
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
                                          <DollarSign className="h-5 w-5 text-blue-600" />
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
                                          <Receipt className="h-5 w-5 text-orange-600" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <div className="flex items-center gap-4">
                                            <div>
                                              <span className="font-medium text-sm sm:text-base">{case_.subject}</span>
                                              <div className="text-xs sm:text-sm text-muted-foreground">
                                                ضد: {case_.opponent}
                                              </div>
                                            </div>
                                            <div className="text-xs bg-white p-2 rounded border">
                                              <div className="space-y-1">
                                                <div>الأتعاب: {formatCurrency(caseSummary.totalFees)}</div>
                                                <div>الدفعات: {formatCurrency(caseSummary.totalPayments)}</div>
                                                <div>المصاريف: {formatCurrency(caseSummary.totalExpenses)}</div>
                                                <div className={`font-medium ${caseSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                  الرصيد: {formatCurrency(caseSummary.balance)}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
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
                                      {/* Accounting Tables */}
                                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {/* Fees */}
                                        <div className="bg-blue-50 p-3 rounded border">
                                          <h4 className="font-medium text-sm mb-2 text-blue-800">الأتعاب</h4>
                                          <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {getCaseFees(case_.id).map((fee) => (
                                              <div key={fee.id} className="text-xs bg-white p-2 rounded">
                                                <div className="font-medium">{fee.description}</div>
                                                <div className="text-muted-foreground">
                                                  {formatCurrency(fee.amount)} - {formatSyrianDate(fee.dateSet)}
                                                </div>
                                                <div className={`text-xs ${fee.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                  {fee.isPaid ? 'مدفوع' : 'غير مدفوع'}
                                                </div>
                                              </div>
                                            ))}
                                            {getCaseFees(case_.id).length === 0 && (
                                              <div className="text-xs text-muted-foreground text-center py-2">لا توجد أتعاب</div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Payments */}
                                        <div className="bg-purple-50 p-3 rounded border">
                                          <h4 className="font-medium text-sm mb-2 text-purple-800">الدفعات</h4>
                                          <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {getCasePayments(case_.id).map((payment) => (
                                              <div key={payment.id} className="text-xs bg-white p-2 rounded">
                                                <div className="font-medium">{payment.description}</div>
                                                <div className="text-muted-foreground">
                                                  {formatCurrency(payment.amount)} - {formatSyrianDate(payment.paymentDate)}
                                                </div>
                                                <div className="text-xs">{payment.paymentMethod}</div>
                                              </div>
                                            ))}
                                            {getCasePayments(case_.id).length === 0 && (
                                              <div className="text-xs text-muted-foreground text-center py-2">لا توجد دفعات</div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Expenses */}
                                        <div className="bg-orange-50 p-3 rounded border">
                                          <h4 className="font-medium text-sm mb-2 text-orange-800">المصاريف</h4>
                                          <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {getCaseExpenses(case_.id).map((expense) => (
                                              <div key={expense.id} className="text-xs bg-white p-2 rounded">
                                                <div className="font-medium">{expense.description}</div>
                                                <div className="text-muted-foreground">
                                                  {formatCurrency(expense.amount)} - {formatSyrianDate(expense.expenseDate)}
                                                </div>
                                                <div className={`text-xs ${expense.isReimbursable ? 'text-blue-600' : 'text-gray-600'}`}>
                                                  {expense.isReimbursable ? 'قابل للاسترداد' : 'غير قابل للاسترداد'}
                                                </div>
                                              </div>
                                            ))}
                                            {getCaseExpenses(case_.id).length === 0 && (
                                              <div className="text-xs text-muted-foreground text-center py-2">لا توجد مصاريف</div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Stages */}
                                      {getCaseStages(case_.id).map((stage) => (
                                        <div key={stage.id} className="border-2 border-yellow-200 rounded-md bg-yellow-50">
                                          <Collapsible
                                            open={expandedStages.has(stage.id)}
                                            onOpenChange={() => toggleStage(stage.id)}
                                          >
                                            <CollapsibleTrigger className="w-full p-3 text-right hover:bg-yellow-100 transition-colors rounded-md">
                                              <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openEditStageDialog(stage);
                                                    }}
                                                    className="p-2"
                                                    title="تعديل المرحلة"
                                                  >
                                                    <Edit className="h-5 w-5 text-yellow-600" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openAddSessionDialog(stage.id);
                                                    }}
                                                    className="p-2"
                                                    title="إضافة جلسة"
                                                  >
                                                    <Plus className="h-5 w-5 text-purple-600" />
                                                  </Button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  <div className="text-right">
                                                    <span className="font-medium text-sm sm:text-base">{stage.courtName}</span>
                                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                                      رقم الأساس: {stage.caseNumber}
                                                    </div>
                                                  </div>
                                                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                                                  {expandedStages.has(stage.id) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                  ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                  )}
                                                </div>
                                              </div>
                                            </CollapsibleTrigger>
                                            
                                            <CollapsibleContent className="px-3 pb-3">
                                              <div className="mr-4 sm:mr-6">
                                                {getStageSessions(stage.id).length > 0 ? (
                                                  <div className="overflow-x-auto">
                                                    <Table>
                                                      <TableHeader>
                                                        <TableRow className="bg-purple-50">
                                                          <TableHead className="text-right text-purple-700 text-xs sm:text-sm">تاريخ الجلسة</TableHead>
                                                          <TableHead className="text-right text-purple-700 text-xs sm:text-sm">الجلسة القادمة</TableHead>
                                                          <TableHead className="text-right text-purple-700 text-xs sm:text-sm">سبب التأجيل</TableHead>
                                                        </TableRow>
                                                      </TableHeader>
                                                      <TableBody>
                                                        {getStageSessions(stage.id).map((session) => (
                                                          <TableRow key={session.id} className="bg-purple-25">
                                                            <TableCell className="text-right text-xs sm:text-sm">
                                                              {formatSyrianDate(session.sessionDate)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs sm:text-sm">
                                                              {session.nextSessionDate ? formatSyrianDate(session.nextSessionDate) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs sm:text-sm">
                                                              {session.postponementReason || '-'}
                                                            </TableCell>
                                                          </TableRow>
                                                        ))}
                                                      </TableBody>
                                                    </Table>
                                                  </div>
                                                ) : (
                                                  <div className="text-center py-4 text-muted-foreground text-xs sm:text-sm">
                                                    لا توجد جلسات حتى الآن
                                                  </div>
                                                )}
                                              </div>
                                            </CollapsibleContent>
                                          </Collapsible>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        {/* Client Dialog */}
        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">{editingClient ? 'تعديل موكل' : 'إضافة موكل جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="clientName">الاسم</Label>
                <Input
                  id="clientName"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="اسم الموكل"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">البريد الإلكتروني</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="البريد الإلكتروني"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">رقم الهاتف</Label>
                <Input
                  id="clientPhone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="رقم الهاتف"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">العنوان</Label>
                <Input
                  id="clientAddress"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  placeholder="العنوان"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="clientNotes">ملاحظات</Label>
                <Textarea
                  id="clientNotes"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  className="text-right"
                />
              </div>
              <Button 
                onClick={editingClient ? handleEditClient : handleAddClient} 
                className="w-full"
              >
                {editingClient ? 'تحديث الموكل' : 'إضافة موكل'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Case Dialog */}
        <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">{editingCase ? 'تعديل قضية' : 'إضافة قضية جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="caseTitle">عنوان القضية</Label>
                <Input
                  id="caseTitle"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                  placeholder="عنوان القضية"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="caseSubject">موضوع القضية</Label>
                <Input
                  id="caseSubject"
                  value={caseForm.subject}
                  onChange={(e) => setCaseForm({ ...caseForm, subject: e.target.value })}
                  placeholder="موضوع القضية"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="caseOpponent">الخصم</Label>
                <Input
                  id="caseOpponent"
                  value={caseForm.opponent}
                  onChange={(e) => setCaseForm({ ...caseForm, opponent: e.target.value })}
                  placeholder="اسم الخصم"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="caseType">نوع القضية</Label>
                <Input
                  id="caseType"
                  value={caseForm.caseType}
                  onChange={(e) => setCaseForm({ ...caseForm, caseType: e.target.value })}
                  placeholder="نوع القضية"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="caseDescription">وصف القضية</Label>
                <Textarea
                  id="caseDescription"
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  placeholder="وصف تفصيلي للقضية"
                  className="text-right"
                />
              </div>
              <Button 
                onClick={editingCase ? handleEditCase : handleAddCase} 
                className="w-full"
              >
                {editingCase ? 'تحديث القضية' : 'إضافة قضية'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stage Dialog */}
        <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">{editingStage ? 'تعديل مرحلة' : 'إضافة مرحلة جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="stageCourt">المحكمة</Label>
                <Input
                  id="stageCourt"
                  value={stageForm.courtName}
                  onChange={(e) => setStageForm({ ...stageForm, courtName: e.target.value })}
                  placeholder="اسم المحكمة"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="stageCaseNumber">رقم الأساس</Label>
                <Input
                  id="stageCaseNumber"
                  value={stageForm.caseNumber}
                  onChange={(e) => setStageForm({ ...stageForm, caseNumber: e.target.value })}
                  placeholder="رقم الأساس"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="stageNotes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="stageNotes"
                  value={stageForm.notes}
                  onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  className="text-right"
                />
              </div>
              <Button 
                onClick={editingStage ? handleEditStage : handleAddStage} 
                className="w-full"
              >
                {editingStage ? 'تحديث المرحلة' : 'إضافة مرحلة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Session Dialog */}
        <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة جلسة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label>تاريخ الجلسة الأولى</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-end text-right font-normal",
                        !sessionForm.firstSessionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {sessionForm.firstSessionDate ? (
                        formatFullSyrianDate(sessionForm.firstSessionDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={sessionForm.firstSessionDate}
                      onSelect={(date) => setSessionForm({ ...sessionForm, firstSessionDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="sessionReason">سبب التأجيل</Label>
                <Textarea
                  id="sessionReason"
                  value={sessionForm.postponementReason}
                  onChange={(e) => setSessionForm({ ...sessionForm, postponementReason: e.target.value })}
                  placeholder="سبب التأجيل"
                  className="text-right"
                />
              </div>
              <Button onClick={handleAddSession} className="w-full">
                إضافة جلسة
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fee Dialog */}
        <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة أتعاب</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
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
                <Select value={feeForm.type} onValueChange={(value: any) => setFeeForm({ ...feeForm, type: value })}>
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
                        formatFullSyrianDate(feeForm.dateSet)
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
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleAddFee} className="w-full">
                إضافة أتعاب
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة دفعة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
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
                <Select value={paymentForm.paymentMethod} onValueChange={(value: any) => setPaymentForm({ ...paymentForm, paymentMethod: value })}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقد</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>تاريخ الدفعة</Label>
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
                        formatFullSyrianDate(paymentForm.paymentDate)
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
                      className="pointer-events-auto"
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
              <DialogTitle className="text-right">إضافة مصروف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
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
                <Select value={expenseForm.type} onValueChange={(value: any) => setExpenseForm({ ...expenseForm, type: value })}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر نوع المصروف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="court_fees">رسوم المحكمة</SelectItem>
                    <SelectItem value="document_fees">رسوم الوثائق</SelectItem>
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
                      onSelect={(date) => setExpenseForm({ ...expenseForm, expenseDate: date })}
                      initialFocus
                      className="pointer-events-auto"
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
                <Label htmlFor="isReimbursable">قابل للاسترداد من الموكل</Label>
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
      </div>
    </Layout>
  );
};

export default Clients;
