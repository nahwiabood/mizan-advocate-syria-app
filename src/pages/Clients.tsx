
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin, FileText, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage, Session, ClientFee, ClientPayment, ClientExpense, ClientBalance } from '@/types';
import { toast } from 'sonner';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    caseType: '',
    caseSubject: '',
    opponent: '',
    notes: ''
  });

  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    opponent: '',
    subject: '',
    caseType: ''
  });

  const [feeForm, setFeeForm] = useState({
    description: '',
    amount: '',
    feeDate: new Date().toISOString().split('T')[0]
  });

  const [paymentForm, setPaymentForm] = useState({
    description: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = async () => {
    if (!clientForm.name) {
      toast.error('يرجى إدخال اسم الموكل');
      return;
    }

    try {
      const newClient = await dataStore.addClient({
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email,
        address: clientForm.address,
        notes: clientForm.notes
      });

      // Add case if provided
      if (clientForm.caseSubject) {
        await dataStore.addCase({
          clientId: newClient.id,
          title: clientForm.caseSubject,
          description: clientForm.notes,
          opponent: clientForm.opponent,
          subject: clientForm.caseSubject,
          caseType: clientForm.caseType,
          status: 'active'
        });
        
        const updatedCases = await dataStore.getCases();
        setCases(updatedCases);
      }

      const updatedClients = await dataStore.getClients();
      setClients(updatedClients);
      setClientForm({ name: '', phone: '', email: '', address: '', nationalId: '', caseType: '', caseSubject: '', opponent: '', notes: '' });
      setIsClientDialogOpen(false);
      toast.success('تم إضافة الموكل بنجاح');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('فشل في إضافة الموكل');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      nationalId: '',
      caseType: '',
      caseSubject: '',
      opponent: '',
      notes: client.notes || ''
    });
    setIsClientDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!editingClient || !clientForm.name) {
      toast.error('يرجى إدخال اسم الموكل');
      return;
    }

    try {
      await dataStore.updateClient(editingClient.id, {
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email,
        address: clientForm.address,
        notes: clientForm.notes
      });

      const updatedClients = await dataStore.getClients();
      setClients(updatedClients);
      setClientForm({ name: '', phone: '', email: '', address: '', nationalId: '', caseType: '', caseSubject: '', opponent: '', notes: '' });
      setEditingClient(null);
      setIsClientDialogOpen(false);
      toast.success('تم تحديث بيانات الموكل بنجاح');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('فشل في تحديث بيانات الموكل');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموكل؟ سيتم حذف جميع القضايا والبيانات المرتبطة به.')) {
      try {
        await dataStore.deleteClient(id);
        const updatedClients = await dataStore.getClients();
        const updatedCases = await dataStore.getCases();
        setClients(updatedClients);
        setCases(updatedCases);
        toast.success('تم حذف الموكل بنجاح');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('فشل في حذف الموكل');
      }
    }
  };

  const handleAddCase = async () => {
    if (!selectedClient || !caseForm.title) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await dataStore.addCase({
        clientId: selectedClient.id,
        title: caseForm.title,
        description: caseForm.description,
        opponent: caseForm.opponent,
        subject: caseForm.subject,
        caseType: caseForm.caseType,
        status: 'active'
      });

      const updatedCases = await dataStore.getCases();
      setCases(updatedCases);
      setCaseForm({ title: '', description: '', opponent: '', subject: '', caseType: '' });
      setIsCaseDialogOpen(false);
      toast.success('تم إضافة القضية بنجاح');
    } catch (error) {
      console.error('Error adding case:', error);
      toast.error('فشل في إضافة القضية');
    }
  };

  const handleAddFee = async () => {
    if (!selectedClient || !feeForm.description || !feeForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await dataStore.addClientFee({
        clientId: selectedClient.id,
        description: feeForm.description,
        amount: parseFloat(feeForm.amount),
        feeDate: new Date(feeForm.feeDate)
      });

      setFeeForm({ description: '', amount: '', feeDate: new Date().toISOString().split('T')[0] });
      setIsFeeDialogOpen(false);
      toast.success('تم إضافة الأتعاب بنجاح');
    } catch (error) {
      console.error('Error adding fee:', error);
      toast.error('فشل في إضافة الأتعاب');
    }
  };

  const handleAddPayment = async () => {
    if (!selectedClient || !paymentForm.description || !paymentForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await dataStore.addClientPayment({
        clientId: selectedClient.id,
        description: paymentForm.description,
        amount: parseFloat(paymentForm.amount),
        paymentDate: new Date(paymentForm.paymentDate)
      });

      setPaymentForm({ description: '', amount: '', paymentDate: new Date().toISOString().split('T')[0] });
      setIsPaymentDialogOpen(false);
      toast.success('تم إضافة الدفعة بنجاح');
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('فشل في إضافة الدفعة');
    }
  };

  const handleAddExpense = async () => {
    if (!selectedClient || !expenseForm.description || !expenseForm.amount) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await dataStore.addClientExpense({
        clientId: selectedClient.id,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: new Date(expenseForm.expenseDate)
      });

      setExpenseForm({ description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });
      setIsExpenseDialogOpen(false);
      toast.success('تم إضافة المصروف بنجاح');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('فشل في إضافة المصروف');
    }
  };

  // Get client cases
  const getClientCases = (clientId: string) => {
    return cases.filter(c => c.clientId === clientId);
  };

  // Get client balance
  const getClientBalance = async (clientId: string): Promise<ClientBalance> => {
    try {
      return await dataStore.getClientBalance(clientId);
    } catch (error) {
      console.error('Error getting client balance:', error);
      return {
        totalFees: 0,
        totalPayments: 0,
        totalExpenses: 0,
        balance: 0
      };
    }
  };

  // Get client fees
  const getClientFees = async (clientId: string): Promise<ClientFee[]> => {
    try {
      return await dataStore.getClientFees(clientId);
    } catch (error) {
      console.error('Error getting client fees:', error);
      return [];
    }
  };

  // Get client payments
  const getClientPayments = async (clientId: string): Promise<ClientPayment[]> => {
    try {
      return await dataStore.getClientPayments(clientId);
    } catch (error) {
      console.error('Error getting client payments:', error);
      return [];
    }
  };

  // Get client expenses
  const getClientExpenses = async (clientId: string): Promise<ClientExpense[]> => {
    try {
      return await dataStore.getClientExpenses(clientId);
    } catch (error) {
      console.error('Error getting client expenses:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">إدارة الموكلين</h1>
          <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingClient(null); setClientForm({ name: '', phone: '', email: '', address: '', nationalId: '', caseType: '', caseSubject: '', opponent: '', notes: '' }); }}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة موكل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-name">الاسم الكامل *</Label>
                  <Input
                    id="client-name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="اسم الموكل"
                  />
                </div>
                <div>
                  <Label htmlFor="client-phone">رقم الهاتف</Label>
                  <Input
                    id="client-phone"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                  />
                </div>
                <div>
                  <Label htmlFor="client-email">البريد الإلكتروني</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                  />
                </div>
                <div>
                  <Label htmlFor="client-address">العنوان</Label>
                  <Input
                    id="client-address"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    placeholder="العنوان"
                  />
                </div>
                {!editingClient && (
                  <>
                    <div>
                      <Label htmlFor="case-subject">موضوع القضية</Label>
                      <Input
                        id="case-subject"
                        value={clientForm.caseSubject}
                        onChange={(e) => setClientForm({ ...clientForm, caseSubject: e.target.value })}
                        placeholder="موضوع القضية"
                      />
                    </div>
                    <div>
                      <Label htmlFor="case-type">نوع القضية</Label>
                      <Select value={clientForm.caseType} onValueChange={(value) => setClientForm({ ...clientForm, caseType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع القضية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="مدنية">مدنية</SelectItem>
                          <SelectItem value="جزائية">جزائية</SelectItem>
                          <SelectItem value="تجارية">تجارية</SelectItem>
                          <SelectItem value="عمالية">عمالية</SelectItem>
                          <SelectItem value="إدارية">إدارية</SelectItem>
                          <SelectItem value="أحوال شخصية">أحوال شخصية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="opponent">الخصم</Label>
                      <Input
                        id="opponent"
                        value={clientForm.opponent}
                        onChange={(e) => setClientForm({ ...clientForm, opponent: e.target.value })}
                        placeholder="اسم الخصم"
                      />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <Label htmlFor="client-notes">ملاحظات</Label>
                  <Textarea
                    id="client-notes"
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={editingClient ? handleUpdateClient : handleAddClient}>
                  {editingClient ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <Input
            placeholder="البحث في الموكلين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              cases={getClientCases(client.id)}
              onEdit={() => handleEditClient(client)}
              onDelete={() => handleDeleteClient(client.id)}
              onSelect={() => setSelectedClient(client)}
              getClientBalance={getClientBalance}
            />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد موكلون بعد'}
          </div>
        )}

        {/* Client Details Dialog */}
        {selectedClient && (
          <ClientDetailsDialog
            client={selectedClient}
            cases={getClientCases(selectedClient.id)}
            onClose={() => setSelectedClient(null)}
            getClientBalance={getClientBalance}
            getClientFees={getClientFees}
            getClientPayments={getClientPayments}
            getClientExpenses={getClientExpenses}
            onAddCase={() => setIsCaseDialogOpen(true)}
            onAddFee={() => setIsFeeDialogOpen(true)}
            onAddPayment={() => setIsPaymentDialogOpen(true)}
            onAddExpense={() => setIsExpenseDialogOpen(true)}
          />
        )}

        {/* Add Case Dialog */}
        <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة قضية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="case-title">عنوان القضية</Label>
                <Input
                  id="case-title"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                  placeholder="عنوان القضية"
                />
              </div>
              <div>
                <Label htmlFor="case-description">وصف القضية</Label>
                <Textarea
                  id="case-description"
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  placeholder="وصف تفصيلي للقضية"
                />
              </div>
              <div>
                <Label htmlFor="case-opponent">الخصم</Label>
                <Input
                  id="case-opponent"
                  value={caseForm.opponent}
                  onChange={(e) => setCaseForm({ ...caseForm, opponent: e.target.value })}
                  placeholder="اسم الخصم"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCaseDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddCase}>
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Fee Dialog */}
        <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة أتعاب</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fee-description">الوصف</Label>
                <Input
                  id="fee-description"
                  value={feeForm.description}
                  onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                  placeholder="وصف الأتعاب"
                />
              </div>
              <div>
                <Label htmlFor="fee-amount">المبلغ (ل.س)</Label>
                <Input
                  id="fee-amount"
                  type="number"
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  placeholder="0"
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsFeeDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddFee}>
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة دفعة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-description">الوصف</Label>
                <Input
                  id="payment-description"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="وصف الدفعة"
                />
              </div>
              <div>
                <Label htmlFor="payment-amount">المبلغ (ل.س)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0"
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddPayment}>
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Expense Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مصروف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expense-description">الوصف</Label>
                <Input
                  id="expense-description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="وصف المصروف"
                />
              </div>
              <div>
                <Label htmlFor="expense-amount">المبلغ (ل.س)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0"
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddExpense}>
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

// Client Card Component
const ClientCard = ({ 
  client, 
  cases, 
  onEdit, 
  onDelete, 
  onSelect,
  getClientBalance 
}: { 
  client: Client; 
  cases: Case[]; 
  onEdit: () => void; 
  onDelete: () => void; 
  onSelect: () => void;
  getClientBalance: (clientId: string) => Promise<ClientBalance>;
}) => {
  const [balance, setBalance] = useState<ClientBalance | null>(null);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const clientBalance = await getClientBalance(client.id);
        setBalance(clientBalance);
      } catch (error) {
        console.error('Error loading client balance:', error);
      }
    };

    loadBalance();
  }, [client.id, getClientBalance]);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {client.name}
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {client.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            {client.phone}
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            {client.email}
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {client.address}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          <span>{cases.length} قضية</span>
        </div>
        {balance && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            <span className={balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
              {balance.balance.toLocaleString()} ل.س
              {balance.balance >= 0 ? ' (مستحق للمكتب)' : ' (مستحق للموكل)'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Client Details Dialog Component
const ClientDetailsDialog = ({
  client,
  cases,
  onClose,
  getClientBalance,
  getClientFees,
  getClientPayments,
  getClientExpenses,
  onAddCase,
  onAddFee,
  onAddPayment,
  onAddExpense
}: {
  client: Client;
  cases: Case[];
  onClose: () => void;
  getClientBalance: (clientId: string) => Promise<ClientBalance>;
  getClientFees: (clientId: string) => Promise<ClientFee[]>;
  getClientPayments: (clientId: string) => Promise<ClientPayment[]>;
  getClientExpenses: (clientId: string) => Promise<ClientExpense[]>;
  onAddCase: () => void;
  onAddFee: () => void;
  onAddPayment: () => void;
  onAddExpense: () => void;
}) => {
  const [balance, setBalance] = useState<ClientBalance | null>(null);
  const [fees, setFees] = useState<ClientFee[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [expenses, setExpenses] = useState<ClientExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        const [balanceData, feesData, paymentsData, expensesData] = await Promise.all([
          getClientBalance(client.id),
          getClientFees(client.id),
          getClientPayments(client.id),
          getClientExpenses(client.id)
        ]);
        
        setBalance(balanceData);
        setFees(feesData);
        setPayments(paymentsData);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Error loading client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [client.id, getClientBalance, getClientFees, getClientPayments, getClientExpenses]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{client.name}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-4">جاري التحميل...</div>
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="info">المعلومات</TabsTrigger>
              <TabsTrigger value="cases">القضايا</TabsTrigger>
              <TabsTrigger value="fees">الأتعاب</TabsTrigger>
              <TabsTrigger value="payments">الدفعات</TabsTrigger>
              <TabsTrigger value="expenses">المصاريف</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>بيانات الموكل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>الاسم:</strong> {client.name}</div>
                  {client.phone && <div><strong>الهاتف:</strong> {client.phone}</div>}
                  {client.email && <div><strong>البريد الإلكتروني:</strong> {client.email}</div>}
                  {client.address && <div><strong>العنوان:</strong> {client.address}</div>}
                  {client.notes && <div><strong>ملاحظات:</strong> {client.notes}</div>}
                </CardContent>
              </Card>
              
              {balance && (
                <Card>
                  <CardHeader>
                    <CardTitle>الرصيد المالي</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>إجمالي الأتعاب:</span>
                      <span className="font-mono text-blue-600">{balance.totalFees.toLocaleString()} ل.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي المصاريف:</span>
                      <span className="font-mono text-orange-600">{balance.totalExpenses.toLocaleString()} ل.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي الدفعات:</span>
                      <span className="font-mono text-green-600">{balance.totalPayments.toLocaleString()} ل.س</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>الرصيد النهائي:</span>
                      <span className={`font-mono ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {balance.balance.toLocaleString()} ل.س
                        {balance.balance >= 0 ? ' (مستحق للمكتب)' : ' (مستحق للموكل)'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cases" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">القضايا ({cases.length})</h3>
                <Button onClick={onAddCase}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة قضية
                </Button>
              </div>
              {cases.length > 0 ? (
                <div className="space-y-2">
                  {cases.map((case_) => (
                    <Card key={case_.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{case_.title}</h4>
                            {case_.description && <p className="text-sm text-gray-600 mt-1">{case_.description}</p>}
                            {case_.opponent && <p className="text-sm"><strong>الخصم:</strong> {case_.opponent}</p>}
                          </div>
                          <Badge variant={case_.status === 'active' ? 'default' : 'secondary'}>
                            {case_.status === 'active' ? 'نشطة' : 'مغلقة'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">لا توجد قضايا بعد</div>
              )}
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">الأتعاب ({fees.length})</h3>
                <Button onClick={onAddFee}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة أتعاب
                </Button>
              </div>
              {fees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.description}</TableCell>
                        <TableCell className="font-mono text-blue-600">{fee.amount.toLocaleString()} ل.س</TableCell>
                        <TableCell>{fee.feeDate.toLocaleDateString('ar-SY')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-gray-500 py-8">لا توجد أتعاب بعد</div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">الدفعات ({payments.length})</h3>
                <Button onClick={onAddPayment}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة دفعة
                </Button>
              </div>
              {payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="font-mono text-green-600">{payment.amount.toLocaleString()} ل.س</TableCell>
                        <TableCell>{payment.paymentDate.toLocaleDateString('ar-SY')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-gray-500 py-8">لا توجد دفعات بعد</div>
              )}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">المصاريف ({expenses.length})</h3>
                <Button onClick={onAddExpense}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مصروف
                </Button>
              </div>
              {expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="font-mono text-red-600">{expense.amount.toLocaleString()} ل.س</TableCell>
                        <TableCell>{expense.expenseDate.toLocaleDateString('ar-SY')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-gray-500 py-8">لا توجد مصاريف بعد</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Clients;
