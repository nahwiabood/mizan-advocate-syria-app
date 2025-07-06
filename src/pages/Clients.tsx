import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Eye, Calculator, DollarSign } from 'lucide-react';
import { useDataStore } from '@/hooks/useDataStore';
import { Client, Case, CaseFee, Payment, Expense } from '@/types';

const Clients = () => {
  const { 
    clients, 
    cases, 
    caseFees,
    payments,
    expenses,
    addClient, 
    updateClient, 
    addCase, 
    updateCase,
    addCaseFee,
    addPayment,
    addExpense
  } = useDataStore();

  const [showClientForm, setShowClientForm] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    notes: ''
  });
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    opponent: '',
    subject: '',
    caseType: '',
    status: 'active' as 'active' | 'closed' | 'pending'
  });

  // Accounting form states
  const [showAccountingDialog, setShowAccountingDialog] = useState(false);
  const [accountingType, setAccountingType] = useState<'fee' | 'payment' | 'expense'>('fee');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [accountingForm, setAccountingForm] = useState({
    amount: '',
    description: '',
    type: '',
    paymentMethod: 'cash',
    isReimbursable: false
  });

  const handleInputChangeClient = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewClient(prevClient => ({
      ...prevClient,
      [id]: value
    }));
  };

  const handleInputChangeCase = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewCase(prevCase => ({
      ...prevCase,
      [id]: value
    }));
  };

  const handleInputChangeAccounting = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setAccountingForm(prevForm => ({
      ...prevForm,
      [id]: value
    }));
  };

  const handleSubmitClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, {
        ...newClient,
        updatedAt: new Date()
      });
      toast({ title: 'تم تحديث بيانات الموكل بنجاح' });
    } else {
      addClient({
        ...newClient,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({ title: 'تم إضافة الموكل بنجاح' });
    }
    resetClientForm();
  };

  const handleSubmitCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase) {
      updateCase(editingCase.id, {
        ...newCase,
        updatedAt: new Date()
      });
      toast({ title: 'تم تحديث بيانات القضية بنجاح' });
    } else {
      addCase({
        ...newCase,
        id: crypto.randomUUID(),
        clientId: selectedClientId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({ title: 'تم إضافة القضية بنجاح' });
    }
    resetCaseForm();
  };

  const handleSubmitAccounting = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(accountingForm.amount);
    
    if (accountingType === 'fee') {
      addCaseFee({
        id: crypto.randomUUID(),
        caseId: selectedCaseId,
        amount,
        description: accountingForm.description,
        type: accountingForm.type as any,
        dateSet: new Date(),
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({ title: 'تم إضافة الأتعاب بنجاح' });
    } else if (accountingType === 'payment') {
      const selectedCase = cases.find(c => c.id === selectedCaseId);
      addPayment({
        id: crypto.randomUUID(),
        caseId: selectedCaseId,
        clientId: selectedCase?.clientId || '',
        amount,
        description: accountingForm.description,
        paymentMethod: accountingForm.paymentMethod as any,
        paymentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({ title: 'تم إضافة الدفعة بنجاح' });
    } else if (accountingType === 'expense') {
      addExpense({
        id: crypto.randomUUID(),
        caseId: selectedCaseId,
        amount,
        description: accountingForm.description,
        type: accountingForm.type as any,
        expenseDate: new Date(),
        isReimbursable: accountingForm.isReimbursable,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast({ title: 'تم إضافة المصروف بنجاح' });
    }
    
    resetAccountingForm();
  };

  const resetClientForm = () => {
    setNewClient({ name: '', phone: '', email: '', address: '', nationalId: '', notes: '' });
    setEditingClient(null);
    setShowClientForm(false);
  };

  const resetCaseForm = () => {
    setNewCase({ title: '', description: '', opponent: '', subject: '', caseType: '', status: 'active' });
    setEditingCase(null);
    setShowCaseForm(false);
    setSelectedClientId('');
  };

  const resetAccountingForm = () => {
    setAccountingForm({ amount: '', description: '', type: '', paymentMethod: 'cash', isReimbursable: false });
    setShowAccountingDialog(false);
    setSelectedCaseId('');
  };

  const editClient = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      nationalId: client.nationalId || '',
      notes: client.notes || ''
    });
    setShowClientForm(true);
  };

  const editCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setNewCase({
      title: caseItem.title,
      description: caseItem.description,
      opponent: caseItem.opponent,
      subject: caseItem.subject,
      caseType: caseItem.caseType,
      status: caseItem.status
    });
    setShowCaseForm(true);
  };

  const getClientCases = (clientId: string) => {
    return cases.filter(c => c.clientId === clientId);
  };

  const getCaseAccounting = (caseId: string) => {
    const fees = caseFees.filter(f => f.caseId === caseId);
    const casePayments = payments.filter(p => p.caseId === caseId);
    const caseExpenses = expenses.filter(e => e.caseId === caseId);
    
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPayments = casePayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = caseExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalPayments - totalFees;
    
    return { fees, payments: casePayments, expenses: caseExpenses, totalFees, totalPayments, totalExpenses, balance };
  };

  const getClientAccounting = (clientId: string) => {
    const clientCases = getClientCases(clientId);
    let totalFees = 0;
    let totalPayments = 0;
    let totalExpenses = 0;
    
    clientCases.forEach(caseItem => {
      const accounting = getCaseAccounting(caseItem.id);
      totalFees += accounting.totalFees;
      totalPayments += accounting.totalPayments;
      totalExpenses += accounting.totalExpenses;
    });
    
    const balance = totalPayments - totalFees;
    return { totalFees, totalPayments, totalExpenses, balance };
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">الموكلين</h1>
          <Button onClick={() => setShowClientForm(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة موكل جديد
          </Button>
        </div>

        <div className="grid gap-6">
          {clients.map((client) => {
            const clientCases = getClientCases(client.id);
            const clientAccounting = getClientAccounting(client.id);
            
            return (
              <Card key={client.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        {client.phone && <p>الهاتف: {client.phone}</p>}
                        {client.email && <p>البريد: {client.email}</p>}
                        {client.nationalId && <p>الرقم الوطني: {client.nationalId}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editClient(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setShowCaseForm(true);
                        }}
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        قضية جديدة
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="cases" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="cases">القضايا ({clientCases.length})</TabsTrigger>
                      <TabsTrigger value="accounting">
                        <Calculator className="h-4 w-4 ml-1" />
                        الحساب الكلي
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cases" className="space-y-4">
                      {clientCases.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">لا توجد قضايا لهذا الموكل</p>
                      ) : (
                        clientCases.map((caseItem) => {
                          const caseAccounting = getCaseAccounting(caseItem.id);
                          
                          return (
                            <Card key={caseItem.id} className="border-l-4 border-l-primary">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant={
                                        caseItem.status === 'active' ? 'default' : 
                                        caseItem.status === 'closed' ? 'secondary' : 'outline'
                                      }>
                                        {caseItem.status === 'active' ? 'نشطة' : 
                                         caseItem.status === 'closed' ? 'مغلقة' : 'معلقة'}
                                      </Badge>
                                      <Badge variant="outline">{caseItem.caseType}</Badge>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => editCase(caseItem)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>

                              <CardContent>
                                <Tabs defaultValue="info" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">معلومات القضية</TabsTrigger>
                                    <TabsTrigger value="accounting">
                                      <DollarSign className="h-4 w-4 ml-1" />
                                      المحاسبة
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="info" className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div><strong>الخصم:</strong> {caseItem.opponent}</div>
                                      <div><strong>الموضوع:</strong> {caseItem.subject}</div>
                                    </div>
                                    {caseItem.description && (
                                      <div className="text-sm">
                                        <strong>الوصف:</strong>
                                        <p className="mt-1 text-muted-foreground">{caseItem.description}</p>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent value="accounting" className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-semibold">محاسبة القضية</h4>
                                      <Button 
                                        size="sm" 
                                        onClick={() => {
                                          setSelectedCaseId(caseItem.id);
                                          setShowAccountingDialog(true);
                                        }}
                                      >
                                        <Plus className="h-4 w-4 ml-1" />
                                        إضافة عملية
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                          {caseAccounting.totalFees.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-blue-600">إجمالي الأتعاب</div>
                                      </div>
                                      <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                          {caseAccounting.totalPayments.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-green-600">إجمالي الدفعات</div>
                                      </div>
                                      <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">
                                          {caseAccounting.totalExpenses.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-red-600">إجمالي المصاريف</div>
                                      </div>
                                      <div className={`text-center p-3 rounded-lg ${
                                        caseAccounting.balance >= 0 ? 'bg-green-50' : 'bg-red-50'
                                      }`}>
                                        <div className={`text-2xl font-bold ${
                                          caseAccounting.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {caseAccounting.balance.toLocaleString()}
                                        </div>
                                        <div className={`text-sm ${
                                          caseAccounting.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          الرصيد
                                        </div>
                                      </div>
                                    </div>

                                    {(caseAccounting.fees.length > 0 || caseAccounting.payments.length > 0 || caseAccounting.expenses.length > 0) && (
                                      <div className="space-y-4">
                                        {caseAccounting.fees.length > 0 && (
                                          <div>
                                            <h5 className="font-medium mb-2">الأتعاب</h5>
                                            <div className="space-y-2">
                                              {caseAccounting.fees.map(fee => (
                                                <div key={fee.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                                  <span className="text-sm">{fee.description}</span>
                                                  <span className="font-medium text-blue-600">
                                                    {fee.amount.toLocaleString()} ل.س
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {caseAccounting.payments.length > 0 && (
                                          <div>
                                            <h5 className="font-medium mb-2">الدفعات</h5>
                                            <div className="space-y-2">
                                              {caseAccounting.payments.map(payment => (
                                                <div key={payment.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                                                  <span className="text-sm">{payment.description}</span>
                                                  <span className="font-medium text-green-600">
                                                    {payment.amount.toLocaleString()} ل.س
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {caseAccounting.expenses.length > 0 && (
                                          <div>
                                            <h5 className="font-medium mb-2">المصاريف</h5>
                                            <div className="space-y-2">
                                              {caseAccounting.expenses.map(expense => (
                                                <div key={expense.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                                  <span className="text-sm">{expense.description}</span>
                                                  <span className="font-medium text-red-600">
                                                    {expense.amount.toLocaleString()} ل.س
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </TabsContent>

                    <TabsContent value="accounting" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">
                            {clientAccounting.totalFees.toLocaleString()}
                          </div>
                          <div className="text-sm text-blue-600">إجمالي الأتعاب</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">
                            {clientAccounting.totalPayments.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-600">إجمالي الدفعات</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-3xl font-bold text-red-600">
                            {clientAccounting.totalExpenses.toLocaleString()}
                          </div>
                          <div className="text-sm text-red-600">إجمالي المصاريف</div>
                        </div>
                        <div className={`text-center p-4 rounded-lg ${
                          clientAccounting.balance >= 0 ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          <div className={`text-3xl font-bold ${
                            clientAccounting.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {clientAccounting.balance.toLocaleString()}
                          </div>
                          <div className={`text-sm ${
                            clientAccounting.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            الرصيد الإجمالي
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground text-center">
                        كشف حساب شامل لجميع قضايا {client.name}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Client Form Dialog */}
        <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitClient} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الموكل *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nationalId">الرقم الوطني</Label>
                <Input
                  id="nationalId"
                  value={newClient.nationalId}
                  onChange={(e) => setNewClient({ ...newClient, nationalId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingClient ? 'حفظ التعديلات' : 'إضافة الموكل'}
                </Button>
                <Button type="button" variant="outline" onClick={resetClientForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Case Form Dialog */}
        <Dialog open={showCaseForm} onOpenChange={setShowCaseForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCase ? 'تعديل بيانات القضية' : 'إضافة قضية جديدة'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCase} className="space-y-4">
              {!editingCase && (
                <div>
                  <Label htmlFor="client">الموكل *</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموكل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="title">عنوان القضية *</Label>
                <Input
                  id="title"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="opponent">الخصم *</Label>
                <Input
                  id="opponent"
                  value={newCase.opponent}
                  onChange={(e) => setNewCase({ ...newCase, opponent: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">موضوع القضية *</Label>
                <Input
                  id="subject"
                  value={newCase.subject}
                  onChange={(e) => setNewCase({ ...newCase, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="caseType">نوع القضية *</Label>
                <Input
                  id="caseType"
                  value={newCase.caseType}
                  onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">حالة القضية</Label>
                <Select value={newCase.status} onValueChange={(value: 'active' | 'closed' | 'pending') => setNewCase({ ...newCase, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="pending">معلقة</SelectItem>
                    <SelectItem value="closed">مغلقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">وصف القضية</Label>
                <Textarea
                  id="description"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingCase ? 'حفظ التعديلات' : 'إضافة القضية'}
                </Button>
                <Button type="button" variant="outline" onClick={resetCaseForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Accounting Dialog */}
        <Dialog open={showAccountingDialog} onOpenChange={setShowAccountingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة عملية محاسبية</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAccounting} className="space-y-4">
              <div>
                <Label htmlFor="accountingType">نوع العملية *</Label>
                <Select value={accountingType} onValueChange={(value) => setAccountingType(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fee">أتعاب</SelectItem>
                    <SelectItem value="payment">دفعة</SelectItem>
                    <SelectItem value="expense">مصروف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">المبلغ *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={accountingForm.amount}
                  onChange={(e) => setAccountingForm({ ...accountingForm, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف *</Label>
                <Input
                  id="description"
                  value={accountingForm.description}
                  onChange={(e) => setAccountingForm({ ...accountingForm, description: e.target.value })}
                  required
                />
              </div>
              {accountingType === 'fee' && (
                <div>
                  <Label htmlFor="feeType">نوع الأتعاب</Label>
                  <Select value={accountingForm.type} onValueChange={(value) => setAccountingForm({ ...accountingForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الأتعاب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">استشارة</SelectItem>
                      <SelectItem value="representation">تمثيل</SelectItem>
                      <SelectItem value="court_appearance">حضور جلسة</SelectItem>
                      <SelectItem value="document_preparation">إعداد وثائق</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {accountingType === 'payment' && (
                <div>
                  <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                  <Select value={accountingForm.paymentMethod} onValueChange={(value) => setAccountingForm({ ...accountingForm, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقداً</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {accountingType === 'expense' && (
                <>
                  <div>
                    <Label htmlFor="expenseType">نوع المصروف</Label>
                    <Select value={accountingForm.type} onValueChange={(value) => setAccountingForm({ ...accountingForm, type: value })}>
                      <SelectTrigger>
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isReimbursable"
                      checked={accountingForm.isReimbursable}
                      onChange={(e) => setAccountingForm({ ...accountingForm, isReimbursable: e.target.checked })}
                    />
                    <Label htmlFor="isReimbursable">قابل للاسترداد</Label>
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  إضافة
                </Button>
                <Button type="button" variant="outline" onClick={resetAccountingForm}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Clients;
