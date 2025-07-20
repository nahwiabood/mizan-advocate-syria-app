
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Calendar as CalendarIcon, User, FileText, DollarSign, CreditCard, Receipt } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, ClientFee, ClientPayment, ClientExpense, ClientBalance } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

interface ClientAccountingData {
  fees: ClientFee[];
  payments: ClientPayment[];
  expenses: ClientExpense[];
  balance: ClientBalance;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isAccountingDialogOpen, setIsAccountingDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Client accounting data
  const [clientAccountingData, setClientAccountingData] = useState<ClientAccountingData | null>(null);
  const [accountingLoading, setAccountingLoading] = useState(false);

  // Form states
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Accounting form states
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

  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await dataStore.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClientAccountingData = async (clientId: string): Promise<ClientAccountingData> => {
    const [fees, payments, expenses, balance] = await Promise.all([
      dataStore.getClientFees(clientId),
      dataStore.getClientPayments(clientId),
      dataStore.getClientExpenses(clientId),
      dataStore.getClientBalance(clientId)
    ]);

    return { fees, payments, expenses, balance };
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD operations
  const handleAddClient = async () => {
    if (!clientForm.name) return;

    try {
      const newClient = await dataStore.addClient({
        name: clientForm.name,
        phone: clientForm.phone || undefined,
        email: clientForm.email || undefined,
        address: clientForm.address || undefined,
        notes: clientForm.notes || undefined
      });

      setClients([newClient, ...clients]);
      resetClientForm();
      setIsClientDialogOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleEditClient = async () => {
    if (!editingClient || !clientForm.name) return;

    try {
      const updatedClient = await dataStore.updateClient(editingClient.id, {
        name: clientForm.name,
        phone: clientForm.phone || undefined,
        email: clientForm.email || undefined,
        address: clientForm.address || undefined,
        notes: clientForm.notes || undefined
      });

      if (updatedClient) {
        setClients(clients.map(client => 
          client.id === editingClient.id ? updatedClient : client
        ));
      }

      resetClientForm();
      setIsClientDialogOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
  };

  // Dialog functions
  const openAddClientDialog = () => {
    resetClientForm();
    setEditingClient(null);
    setIsClientDialogOpen(true);
  };

  const openEditClientDialog = (client: Client) => {
    setClientForm({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  const openAccountingDialog = async (client: Client) => {
    setSelectedClient(client);
    setAccountingLoading(true);
    setIsAccountingDialogOpen(true);
    
    try {
      const data = await getClientAccountingData(client.id);
      setClientAccountingData(data);
    } catch (error) {
      console.error('Error loading client accounting data:', error);
    } finally {
      setAccountingLoading(false);
    }
  };

  // Accounting operations
  const handleAddFee = async () => {
    if (!selectedClient || !feeForm.description || !feeForm.amount) return;

    try {
      const newFee = await dataStore.addClientFee({
        clientId: selectedClient.id,
        description: feeForm.description,
        amount: parseFloat(feeForm.amount),
        feeDate: feeForm.feeDate
      });

      if (clientAccountingData) {
        setClientAccountingData({
          ...clientAccountingData,
          fees: [newFee, ...clientAccountingData.fees]
        });
      }

      resetFeeForm();
      setIsFeeDialogOpen(false);
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedClient || !paymentForm.description || !paymentForm.amount) return;

    try {
      const newPayment = await dataStore.addClientPayment({
        clientId: selectedClient.id,
        description: paymentForm.description,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate
      });

      if (clientAccountingData) {
        setClientAccountingData({
          ...clientAccountingData,
          payments: [newPayment, ...clientAccountingData.payments]
        });
      }

      resetPaymentForm();
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedClient || !expenseForm.description || !expenseForm.amount) return;

    try {
      const newExpense = await dataStore.addClientExpense({
        clientId: selectedClient.id,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: expenseForm.expenseDate
      });

      if (clientAccountingData) {
        setClientAccountingData({
          ...clientAccountingData,
          expenses: [newExpense, ...clientAccountingData.expenses]
        });
      }

      resetExpenseForm();
      setIsExpenseDialogOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-right flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                الموكلين
              </CardTitle>
              <Button onClick={openAddClientDialog} className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="h-5 w-5" />
                إضافة موكل جديد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="البحث في الموكلين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-right">{client.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditClientDialog(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAccountingDialog(client)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {client.phone && (
                    <p className="text-sm text-muted-foreground text-right">
                      📱 {client.phone}
                    </p>
                  )}
                  
                  {client.email && (
                    <p className="text-sm text-muted-foreground text-right">
                      ✉️ {client.email}
                    </p>
                  )}
                  
                  {client.address && (
                    <p className="text-sm text-muted-foreground text-right">
                      📍 {client.address}
                    </p>
                  )}
                  
                  {client.notes && (
                    <p className="text-sm text-muted-foreground text-right bg-gray-50 p-2 rounded">
                      {client.notes}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground text-right">
                    تاريخ الإنشاء: {formatSyrianDate(client.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'لم يتم العثور على موكلين يطابقون البحث' : 'لا توجد موكلين مسجلين'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Client Dialog */}
        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">{editingClient ? 'تعديل الموكل' : 'إضافة موكل جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="clientName">الاسم *</Label>
                <Input
                  id="clientName"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="اسم الموكل"
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

        {/* Accounting Dialog */}
        <Dialog open={isAccountingDialogOpen} onOpenChange={setIsAccountingDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-right">محاسبة الموكل: {selectedClient?.name}</DialogTitle>
            </DialogHeader>
            
            {accountingLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : clientAccountingData ? (
              <div className="space-y-6" dir="rtl">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">إجمالي الأتعاب</p>
                        <p className="text-xl font-bold text-blue-600">{clientAccountingData.balance.totalFees.toLocaleString()} ل.س</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">إجمالي المدفوعات</p>
                        <p className="text-xl font-bold text-green-600">{clientAccountingData.balance.totalPayments.toLocaleString()} ل.س</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                        <p className="text-xl font-bold text-red-600">{clientAccountingData.balance.totalExpenses.toLocaleString()} ل.س</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`${clientAccountingData.balance.balance >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'}`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">الرصيد</p>
                        <p className={`text-xl font-bold ${clientAccountingData.balance.balance >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                          {clientAccountingData.balance.balance.toLocaleString()} ل.س
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="fees" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fees">الأتعاب</TabsTrigger>
                    <TabsTrigger value="payments">المدفوعات</TabsTrigger>
                    <TabsTrigger value="expenses">المصروفات</TabsTrigger>
                  </TabsList>

                  {/* Fees Tab */}
                  <TabsContent value="fees">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-right">الأتعاب</CardTitle>
                          <Button onClick={() => setIsFeeDialogOpen(true)} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة أتعاب
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">الوصف</TableHead>
                              <TableHead className="text-right">المبلغ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientAccountingData.fees.map((fee) => (
                              <TableRow key={fee.id}>
                                <TableCell className="text-right">{formatSyrianDate(fee.feeDate)}</TableCell>
                                <TableCell className="text-right">{fee.description}</TableCell>
                                <TableCell className="text-right text-blue-600 font-medium">
                                  {fee.amount.toLocaleString()} ل.س
                                </TableCell>
                              </TableRow>
                            ))}
                            {clientAccountingData.fees.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                  لا توجد أتعاب مسجلة
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Payments Tab */}
                  <TabsContent value="payments">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-right">المدفوعات</CardTitle>
                          <Button onClick={() => setIsPaymentDialogOpen(true)} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة دفعة
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">الوصف</TableHead>
                              <TableHead className="text-right">المبلغ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientAccountingData.payments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell className="text-right">{formatSyrianDate(payment.paymentDate)}</TableCell>
                                <TableCell className="text-right">{payment.description}</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">
                                  {payment.amount.toLocaleString()} ل.س
                                </TableCell>
                              </TableRow>
                            ))}
                            {clientAccountingData.payments.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                  لا توجد مدفوعات مسجلة
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Expenses Tab */}
                  <TabsContent value="expenses">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-right">المصروفات</CardTitle>
                          <Button onClick={() => setIsExpenseDialogOpen(true)} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة مصروف
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">التاريخ</TableHead>
                              <TableHead className="text-right">الوصف</TableHead>
                              <TableHead className="text-right">المبلغ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {clientAccountingData.expenses.map((expense) => (
                              <TableRow key={expense.id}>
                                <TableCell className="text-right">{formatSyrianDate(expense.expenseDate)}</TableCell>
                                <TableCell className="text-right">{expense.description}</TableCell>
                                <TableCell className="text-right text-red-600 font-medium">
                                  {expense.amount.toLocaleString()} ل.س
                                </TableCell>
                              </TableRow>
                            ))}
                            {clientAccountingData.expenses.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                  لا توجد مصروفات مسجلة
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
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
              <DialogTitle className="text-right">إضافة دفعة جديدة</DialogTitle>
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
              <DialogTitle className="text-right">إضافة مصروف جديد</DialogTitle>
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
