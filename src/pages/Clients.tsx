import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, DollarSign, CreditCard, Receipt, Calendar as CalendarIcon, Edit2, Trash2, Search } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, ClientFee, ClientPayment, ClientExpense, ClientBalance } from '@/types';
import { formatSyrianDate, formatFullSyrianDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientBalance, setClientBalance] = useState<ClientBalance | null>(null);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const [newFee, setNewFee] = useState({
    description: '',
    amount: '',
    feeDate: new Date()
  });

  const [newPayment, setNewPayment] = useState({
    description: '',
    amount: '',
    paymentDate: new Date()
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    expenseDate: new Date()
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientBalance(selectedClient.id);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const clientsData = await dataStore.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadClientBalance = async (clientId: string) => {
    try {
      const balance = await dataStore.getClientBalance(clientId);
      // ترتيب القيود المحاسبية حسب التاريخ
      if (balance) {
        // ترتيب الدفعات
        balance.payments = balance.payments.sort((a, b) => {
          const dateA = new Date(a.payment_date || a.paymentDate).getTime();
          const dateB = new Date(b.payment_date || b.paymentDate).getTime();
          return dateB - dateA;
        });
        
        // ترتيب المصاريف
        balance.expenses = balance.expenses.sort((a, b) => {
          const dateA = new Date(a.expense_date || a.expenseDate).getTime();
          const dateB = new Date(b.expense_date || b.expenseDate).getTime();
          return dateB - dateA;
        });
        
        // ترتيب الأتعاب
        balance.fees = balance.fees.sort((a, b) => {
          const dateA = new Date(a.fee_date || a.feeDate).getTime();
          const dateB = new Date(b.fee_date || b.feeDate).getTime();
          return dateB - dateA;
        });
      }
      setClientBalance(balance);
    } catch (error) {
      console.error('Error loading client balance:', error);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name) return;

    try {
      await dataStore.addClient(newClient);
      resetClientForm();
      setIsAddClientDialogOpen(false);
      await loadClients();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleEditClient = async () => {
    if (!editingClient || !editingClient.name) return;

    try {
      await dataStore.updateClient(editingClient.id, editingClient);
      setEditingClient(null);
      await loadClients();
      if (selectedClient?.id === editingClient.id) {
        setSelectedClient(editingClient);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClient) return;

    try {
      await dataStore.deleteClient(deleteClient.id);
      setDeleteClient(null);
      if (selectedClient?.id === deleteClient.id) {
        setSelectedClient(null);
        setClientBalance(null);
      }
      await loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleAddFee = async () => {
    if (!selectedClient || !newFee.description || !newFee.amount) return;

    try {
      await dataStore.addClientFee({
        clientId: selectedClient.id,
        description: newFee.description,
        amount: parseFloat(newFee.amount),
        feeDate: newFee.feeDate
      });

      resetFeeForm();
      setIsAddFeeDialogOpen(false);
      await loadClientBalance(selectedClient.id);
    } catch (error) {
      console.error('Error adding fee:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedClient || !newPayment.description || !newPayment.amount) return;

    try {
      await dataStore.addClientPayment({
        clientId: selectedClient.id,
        description: newPayment.description,
        amount: parseFloat(newPayment.amount),
        paymentDate: newPayment.paymentDate
      });

      resetPaymentForm();
      setIsAddPaymentDialogOpen(false);
      await loadClientBalance(selectedClient.id);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedClient || !newExpense.description || !newExpense.amount) return;

    try {
      await dataStore.addClientExpense({
        clientId: selectedClient.id,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        expenseDate: newExpense.expenseDate
      });

      resetExpenseForm();
      setIsAddExpenseDialogOpen(false);
      await loadClientBalance(selectedClient.id);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const resetClientForm = () => {
    setNewClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
  };

  const resetFeeForm = () => {
    setNewFee({
      description: '',
      amount: '',
      feeDate: new Date()
    });
  };

  const resetPaymentForm = () => {
    setNewPayment({
      description: '',
      amount: '',
      paymentDate: new Date()
    });
  };

  const resetExpenseForm = () => {
    setNewExpense({
      description: '',
      amount: '',
      expenseDate: new Date()
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: any): string => {
    if (!date) return 'غير محدد';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
      return formatSyrianDate(dateObj);
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 max-w-full" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* قائمة الموكلين */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    الموكلين
                  </CardTitle>
                  <Button onClick={() => setIsAddClientDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة موكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="بحث في الموكلين..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-right pr-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedClient?.id === client.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-right">{client.name}</h3>
                          {client.phone && (
                            <p className="text-sm text-muted-foreground text-right">{client.phone}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingClient(client);
                            }}
                            className="p-1 h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteClient(client);
                            }}
                            className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد موكلين'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل الموكل */}
          <div className="lg:col-span-8">
            {selectedClient ? (
              <div className="space-y-4">
                {/* معلومات الموكل */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-right">{selectedClient.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                      <div>
                        <Label className="font-medium">الهاتف:</Label>
                        <p className="text-muted-foreground">{selectedClient.phone || 'غير محدد'}</p>
                      </div>
                      <div>
                        <Label className="font-medium">البريد الإلكتروني:</Label>
                        <p className="text-muted-foreground">{selectedClient.email || 'غير محدد'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="font-medium">العنوان:</Label>
                        <p className="text-muted-foreground">{selectedClient.address || 'غير محدد'}</p>
                      </div>
                      {selectedClient.notes && (
                        <div className="md:col-span-2">
                          <Label className="font-medium">ملاحظات:</Label>
                          <p className="text-muted-foreground">{selectedClient.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* ملخص مالي */}
                {clientBalance && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">إجمالي الأتعاب</p>
                            <p className="text-xl font-bold text-blue-600">{clientBalance.totalFees.toLocaleString()} ل.س</p>
                          </div>
                          <Receipt className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">إجمالي المدفوعات</p>
                            <p className="text-xl font-bold text-green-600">{clientBalance.totalPayments.toLocaleString()} ل.س</p>
                          </div>
                          <CreditCard className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">إجمالي المصاريف</p>
                            <p className="text-xl font-bold text-red-600">{clientBalance.totalExpenses.toLocaleString()} ل.س</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* تبويبات المعاملات المالية */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>المعاملات المالية</CardTitle>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsAddFeeDialogOpen(true)} size="sm" className="gap-1">
                          <Plus className="h-4 w-4" />
                          أتعاب
                        </Button>
                        <Button onClick={() => setIsAddPaymentDialogOpen(true)} size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4" />
                          دفعة
                        </Button>
                        <Button onClick={() => setIsAddExpenseDialogOpen(true)} size="sm" className="gap-1 bg-red-600 hover:bg-red-700">
                          <Plus className="h-4 w-4" />
                          مصروف
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {clientBalance && (
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
                                  <TableHead className="text-right">البيان</TableHead>
                                  <TableHead className="text-right">المبلغ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {clientBalance.fees.map((fee) => (
                                  <TableRow key={fee.id}>
                                    <TableCell className="text-right">{formatDate(fee.fee_date || fee.feeDate)}</TableCell>
                                    <TableCell className="text-right">{fee.description}</TableCell>
                                    <TableCell className="text-right">
                                      <span className="text-blue-600 font-medium">{fee.amount.toLocaleString()} ل.س</span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {clientBalance.fees.length === 0 && (
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
                                  <TableHead className="text-right">البيان</TableHead>
                                  <TableHead className="text-right">المبلغ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {clientBalance.payments.map((payment) => (
                                  <TableRow key={payment.id}>
                                    <TableCell className="text-right">{formatDate(payment.payment_date || payment.paymentDate)}</TableCell>
                                    <TableCell className="text-right">{payment.description}</TableCell>
                                    <TableCell className="text-right">
                                      <span className="text-green-600 font-medium">{payment.amount.toLocaleString()} ل.س</span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {clientBalance.payments.length === 0 && (
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
                                  <TableHead className="text-right">البيان</TableHead>
                                  <TableHead className="text-right">المبلغ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {clientBalance.expenses.map((expense) => (
                                  <TableRow key={expense.id}>
                                    <TableCell className="text-right">{formatDate(expense.expense_date || expense.expenseDate)}</TableCell>
                                    <TableCell className="text-right">{expense.description}</TableCell>
                                    <TableCell className="text-right">
                                      <span className="text-red-600 font-medium">{expense.amount.toLocaleString()} ل.س</span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {clientBalance.expenses.length === 0 && (
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
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">اختر موكلاً</h3>
                    <p className="text-muted-foreground">اختر موكلاً من القائمة لعرض تفاصيله</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialog إضافة موكل جديد */}
        <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة موكل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="اسم الموكل"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="رقم الهاتف"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="البريد الإلكتروني"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="عنوان الموكل"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Input
                  id="notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  className="text-right"
                />
              </div>
              <Button onClick={handleAddClient} className="w-full">
                إضافة الموكل
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog تعديل موكل */}
        {editingClient && (
          <Dialog open={true} onOpenChange={() => setEditingClient(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل بيانات الموكل</DialogTitle>
              </DialogHeader>
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label htmlFor="edit-name">الاسم *</Label>
                  <Input
                    id="edit-name"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    placeholder="اسم الموكل"
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">الهاتف</Label>
                  <Input
                    id="edit-phone"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address">العنوان</Label>
                  <Input
                    id="edit-address"
                    value={editingClient.address || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                    placeholder="عنوان الموكل"
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes">ملاحظات</Label>
                  <Input
                    id="edit-notes"
                    value={editingClient.notes || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    className="text-right"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditClient} className="flex-1">
                    حفظ التعديلات
                  </Button>
                  <Button variant="outline" onClick={() => setEditingClient(null)} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog إضافة أتعاب */}
        <Dialog open={isAddFeeDialogOpen} onOpenChange={setIsAddFeeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة أتعاب</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="feeDescription">الوصف</Label>
                <Input
                  id="feeDescription"
                  value={newFee.description}
                  onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                  placeholder="وصف الأتعاب"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="feeAmount">المبلغ</Label>
                <Input
                  id="feeAmount"
                  type="number"
                  value={newFee.amount}
                  onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
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
                        !newFee.feeDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newFee.feeDate ? (
                        formatFullSyrianDate(newFee.feeDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newFee.feeDate}
                      onSelect={(date) => setNewFee({ ...newFee, feeDate: date || new Date() })}
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

        {/* Dialog إضافة دفعة */}
        <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة دفعة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="paymentDescription">الوصف</Label>
                <Input
                  id="paymentDescription"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  placeholder="وصف الدفعة"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="paymentAmount">المبلغ</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
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
                        !newPayment.paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newPayment.paymentDate ? (
                        formatFullSyrianDate(newPayment.paymentDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newPayment.paymentDate}
                      onSelect={(date) => setNewPayment({ ...newPayment, paymentDate: date || new Date() })}
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

        {/* Dialog إضافة مصروف */}
        <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة مصروف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" dir="rtl">
              <div>
                <Label htmlFor="expenseDescription">الوصف</Label>
                <Input
                  id="expenseDescription"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="وصف المصروف"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="expenseAmount">المبلغ</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
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
                        !newExpense.expenseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newExpense.expenseDate ? (
                        formatFullSyrianDate(newExpense.expenseDate)
                      ) : (
                        <span>اختر تاريخاً</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newExpense.expenseDate}
                      onSelect={(date) => setNewExpense({ ...newExpense, expenseDate: date || new Date() })}
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

        {/* تأكيد حذف موكل */}
        <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                هل أنت متأكد من حذف هذا الموكل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClient} className="bg-red-600 hover:bg-red-700">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Clients;
