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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, ChevronDown, ChevronRight, User, FileText, Calendar as CalendarIcon, Users, Search, DollarSign, Receipt, CreditCard, Wallet } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage, Session, ClientFee, ClientPayment, ClientExpense } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [clientAccountingData, setClientAccountingData] = useState<Record<string, { fees: ClientFee[], payments: ClientPayment[], expenses: ClientExpense[], balance: { totalFees: number, totalPayments: number, totalExpenses: number, balance: number } }>>({});

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
    description: '',
    amount: '',
    feeDate: new Date()
  });

  const [paymentForm, setPaymentForm] = useState({
    description: '',
    amount: '',
    paymentDate: new Date()
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    expenseDate: new Date()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsData, casesData, stagesData, sessionsData] = await Promise.all([
        dataStore.getClients(),
        dataStore.getCases(),
        dataStore.getStages(),
        dataStore.getSessions()
      ]);

      setClients(clientsData);
      setCases(casesData);
      setStages(stagesData);
      setSessions(sessionsData);

      // Load accounting data for all clients
      const accountingData: Record<string, any> = {};
      for (const client of clientsData) {
        const [fees, payments, expenses, balance] = await Promise.all([
          dataStore.getClientFees(client.id),
          dataStore.getClientPayments(client.id),
          dataStore.getClientExpenses(client.id),
          dataStore.getClientBalance(client.id)
        ]);
        accountingData[client.id] = { fees, payments, expenses, balance };
      }
      setClientAccountingData(accountingData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
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
  const handleAddClient = async () => {
    if (!clientForm.name) return;

    try {
      await dataStore.addClient({
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        address: clientForm.address,
        notes: clientForm.notes
      });

      resetClientForm();
      setIsClientDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleEditClient = async () => {
    if (!editingClient || !clientForm.name) return;

    try {
      await dataStore.updateClient(editingClient.id, {
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        address: clientForm.address,
        notes: clientForm.notes
      });

      resetClientForm();
      setIsClientDialogOpen(false);
      setEditingClient(null);
      await loadData();
    } catch (error) {
      console.error('Error editing client:', error);
    }
  };

  const handleAddCase = async () => {
    if (!caseForm.title || !caseForm.subject || !caseForm.opponent || !selectedClientId) return;

    try {
      await dataStore.addCase({
        clientId: selectedClientId,
        title: caseForm.title,
        description: caseForm.description || '',
        opponent: caseForm.opponent,
        subject: caseForm.subject,
        caseType: caseForm.caseType || 'عام',
        status: 'active'
      });

      resetCaseForm();
      setIsCaseDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding case:', error);
    }
  };

  const handleEditCase = async () => {
    if (!editingCase || !caseForm.title || !caseForm.subject || !caseForm.opponent) return;

    try {
      await dataStore.updateCase(editingCase.id, {
        title: caseForm.title,
        description: caseForm.description,
        opponent: caseForm.opponent,
        subject: caseForm.subject,
        caseType: caseForm.caseType
      });

      resetCaseForm();
      setIsCaseDialogOpen(false);
      setEditingCase(null);
      await loadData();
    } catch (error) {
      console.error('Error editing case:', error);
    }
  };

  const handleAddStage = async () => {
    if (!stageForm.courtName || !stageForm.caseNumber || !selectedCaseId) return;

    try {
      await dataStore.addStage({
        caseId: selectedCaseId,
        courtName: stageForm.courtName,
        caseNumber: stageForm.caseNumber,
        stageName: `${stageForm.courtName} - ${stageForm.caseNumber}`,
        notes: stageForm.notes || '',
        firstSessionDate: new Date(),
        status: 'active'
      });

      resetStageForm();
      setIsStageDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding stage:', error);
    }
  };

  const handleEditStage = async () => {
    if (!editingStage || !stageForm.courtName || !stageForm.caseNumber) return;

    try {
      await dataStore.updateStage(editingStage.id, {
        courtName: stageForm.courtName,
        caseNumber: stageForm.caseNumber,
        stageName: `${stageForm.courtName} - ${stageForm.caseNumber}`,
        notes: stageForm.notes || ''
      });

      resetStageForm();
      setIsStageDialogOpen(false);
      setEditingStage(null);
      await loadData();
    } catch (error) {
      console.error('Error editing stage:', error);
    }
  };

  const handleAddSession = async () => {
    if (!sessionForm.firstSessionDate || !selectedStageId) return;

    const stage = stages.find(s => s.id === selectedStageId);
    if (!stage) return;

    const case_ = cases.find(c => c.id === stage.caseId);
    if (!case_) return;

    const client = clients.find(c => c.id === case_.clientId);
    if (!client) return;

    try {
      await dataStore.addSession({
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
      await dataStore.updateStage(selectedStageId, {
        firstSessionDate: sessionForm.firstSessionDate
      });

      resetSessionForm();
      setIsSessionDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  // Accounting CRUD operations
  const handleAddFee = async () => {
    if (!feeForm.description || !feeForm.amount || !selectedClientId) return;

    try {
      await dataStore.addClientFee({
        clientId: selectedClientId,
        description: feeForm.description,
        amount: parseFloat(feeForm.amount),
        feeDate: feeForm.feeDate
      });

      resetFeeForm();
      setIsFeeDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentForm.description || !paymentForm.amount || !selectedClientId) return;

    try {
      await dataStore.addClientPayment({
        clientId: selectedClientId,
        description: paymentForm.description,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate
      });

      resetPaymentForm();
      setIsPaymentDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !selectedClientId) return;

    try {
      await dataStore.addClientExpense({
        clientId: selectedClientId,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate
      });

      resetExpenseForm();
      setIsExpenseDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
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
      description: '',
      amount: '',
      feeDate: new Date()
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      description: '',
      amount: '',
      paymentDate: new Date()
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      expenseDate: new Date()
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

  const openAddFeeDialog = (clientId: string) => {
    resetFeeForm();
    setSelectedClientId(clientId);
    setIsFeeDialogOpen(true);
  };

  const openAddPaymentDialog = (clientId: string) => {
    resetPaymentForm();
    setSelectedClientId(clientId);
    setIsPaymentDialogOpen(true);
  };

  const openAddExpenseDialog = (clientId: string) => {
    resetExpenseForm();
    setSelectedClientId(clientId);
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

  const getClientAccountingData = (clientId: string) => {
    return clientAccountingData[clientId] || { 
      fees: [], 
      payments: [], 
      expenses: [], 
      balance: { totalFees: 0, totalPayments: 0, totalExpenses: 0, balance: 0 } 
    };
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CardTitle className="text-right flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                إدارة الموكلين
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
                const accountingData = getClientAccountingData(client.id);
                
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
                              <span className="font-medium text-sm sm:text-base">{client.name}</span>
                              {(client.phone || client.email) && (
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  {client.phone && <span>{client.phone}</span>}
                                  {client.phone && client.email && <span> • </span>}
                                  {client.email && <span>{client.email}</span>}
                                </div>
                              )}
                              <div className="text-xs sm:text-sm text-green-600 font-medium">
                                الرصيد: {accountingData.balance.balance.toLocaleString()} ل.س
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
                        <Tabs defaultValue="cases" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="cases">القضايا</TabsTrigger>
                            <TabsTrigger value="accounting">المحاسبة</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="cases" className="mt-4">
                            <div className="mr-4 sm:mr-6 space-y-3">
                              {getClientCases(client.id).map((case_) => (
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
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className="text-right">
                                            <span className="font-medium text-sm sm:text-base">{case_.subject}</span>
                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                              ضد: {case_.opponent}
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
                                      <div className="mr-4 sm:mr-6 space-y-3">
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
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="accounting" className="mt-4">
                            <div className="space-y-4">
                              {/* Balance Summary */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <Card className="bg-green-50 border-green-200">
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-green-600" />
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">إجمالي الأتعاب</p>
                                        <p className="font-medium text-green-600">{accountingData.balance.totalFees.toLocaleString()} ل.س</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card className="bg-blue-50 border-blue-200">
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="h-4 w-4 text-blue-600" />
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">إجمالي المدفوعات</p>
                                        <p className="font-medium text-blue-600">{accountingData.balance.totalPayments.toLocaleString()} ل.س</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card className="bg-orange-50 border-orange-200">
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                      <Receipt className="h-4 w-4 text-orange-600" />
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">إجمالي المصاريف</p>
                                        <p className="font-medium text-orange-600">{accountingData.balance.totalExpenses.toLocaleString()} ل.س</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card className={`${accountingData.balance.balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-2">
                                      <Wallet className={`h-4 w-4 ${accountingData.balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                      <div className="text-right">
                                        <p className="text-xs text-muted-foreground">الرصيد</p>
                                        <p className={`font-medium ${accountingData.balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {accountingData.balance.balance.toLocaleString()} ل.س
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 flex-wrap">
                                <Button 
                                  onClick={() => openAddFeeDialog(client.id)}
                                  className="gap-1 bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4" />
                                  إضافة أتعاب
                                </Button>
                                <Button 
                                  onClick={() => openAddPaymentDialog(client.id)}
                                  className="gap-1 bg-blue-600 hover:bg-blue-700"
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4" />
                                  إضافة دفعة
                                </Button>
                                <Button 
                                  onClick={() => openAddExpenseDialog(client.id)}
                                  className="gap-1 bg-orange-600 hover:bg-orange-700"
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4" />
                                  إضافة مصروف
                                </Button>
                              </div>

                              {/* Accounting Tables */}
                              <Tabs defaultValue="fees" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="fees">الأتعاب</TabsTrigger>
                                  <TabsTrigger value="payments">المدفوعات</TabsTrigger>
                                  <TabsTrigger value="expenses">المصاريف</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="fees">
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
                                        {accountingData.fees.map((fee) => (
                                          <TableRow key={fee.id}>
                                            <TableCell className="text-right">{formatSyrianDate(fee.feeDate)}</TableCell>
                                            <TableCell className="text-right">{fee.description}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                              {fee.amount.toLocaleString()} ل.س
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        {accountingData.fees.length === 0 && (
                                          <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                              لا توجد أتعاب مسجلة
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="payments">
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
                                        {accountingData.payments.map((payment) => (
                                          <TableRow key={payment.id}>
                                            <TableCell className="text-right">{formatSyrianDate(payment.paymentDate)}</TableCell>
                                            <TableCell className="text-right">{payment.description}</TableCell>
                                            <TableCell className="text-right text-blue-600 font-medium">
                                              {payment.amount.toLocaleString()} ل.س
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        {accountingData.payments.length === 0 && (
                                          <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                              لا توجد مدفوعات مسجلة
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="expenses">
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
                                        {accountingData.expenses.map((expense) => (
                                          <TableRow key={expense.id}>
                                            <TableCell className="text-right">{formatSyrianDate(expense.expenseDate)}</TableCell>
                                            <TableCell className="text-right">{expense.description}</TableCell>
                                            <TableCell className="text-right text-orange-600 font-medium">
                                              {expense.amount.toLocaleString()} ل.س
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        {accountingData.expenses.length === 0 && (
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
                              </Tabs>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                        !feeForm.feeDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {feeForm.feeDate ? (
                        formatFullSyrianDate(feeForm.feeDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={feeForm.feeDate}
                      onSelect={(date) => setFeeForm({ ...feeForm, feeDate: date || new Date() })}
                      initialFocus
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
                      onSelect={(date) => setPaymentForm({ ...paymentForm, paymentDate: date || new Date() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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

export default Clients;
