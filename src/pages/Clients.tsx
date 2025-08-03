
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2, User, Phone, Mail, MapPin, FileText, Calculator } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, ClientPayment, ClientExpense } from '@/types';
import { AccountingTable } from '@/components/AccountingTable';
import { formatSyrianDate } from '@/utils/dateUtils';
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

interface AddEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  type: 'payment' | 'expense';
  title: string;
}

const AddEntryDialog: React.FC<AddEntryDialogProps> = ({ isOpen, onClose, onSave, type, title }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date()
  });

  const handleSave = async () => {
    await onSave({
      description: formData.description,
      amount: parseFloat(formData.amount),
      [`${type}Date`]: formData.date
    });
    setFormData({ description: '', amount: '', date: new Date() });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">البيان</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف العملية"
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="amount">المبلغ</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="المبلغ بالليرة السورية"
              className="text-right"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={!formData.description || !formData.amount}>
              حفظ
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [clientExpenses, setClientExpenses] = useState<ClientExpense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientFinancials(selectedClient.id);
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

  const loadClientFinancials = async (clientId: string) => {
    try {
      const [payments, expenses] = await Promise.all([
        dataStore.getClientPayments(clientId),
        dataStore.getClientExpenses(clientId)
      ]);
      setClientPayments(payments);
      setClientExpenses(expenses);
    } catch (error) {
      console.error('Error loading client financials:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveClient = async () => {
    try {
      if (editingClient) {
        await dataStore.updateClient(editingClient.id, clientFormData);
      } else {
        await dataStore.addClient(clientFormData);
      }
      await loadClients();
      setShowClientDialog(false);
      setEditingClient(null);
      setClientFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDeleteClient = async () => {
    if (deleteClient) {
      try {
        await dataStore.deleteClient(deleteClient.id);
        await loadClients();
        setDeleteClient(null);
        if (selectedClient?.id === deleteClient.id) {
          setSelectedClient(null);
        }
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleAddPayment = async (paymentData: any) => {
    if (selectedClient) {
      await dataStore.addClientPayment({ ...paymentData, clientId: selectedClient.id });
      await loadClientFinancials(selectedClient.id);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    if (selectedClient) {
      await dataStore.addClientExpense({ ...expenseData, clientId: selectedClient.id });
      await loadClientFinancials(selectedClient.id);
    }
  };

  const handleEditEntry = async (entry: any, type: string) => {
    try {
      if (type === 'client_payment') {
        await dataStore.updateClientPayment(entry.id, entry);
      } else if (type === 'client_expense') {
        await dataStore.updateClientExpense(entry.id, entry);
      }
      if (selectedClient) {
        await loadClientFinancials(selectedClient.id);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string, type: string) => {
    try {
      if (type === 'client_payment') {
        await dataStore.deleteClientPayment(id);
      } else if (type === 'client_expense') {
        await dataStore.deleteClientExpense(id);
      }
      if (selectedClient) {
        await loadClientFinancials(selectedClient.id);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // تحضير البيانات للجدول المحاسبي
  const accountingEntries = [
    ...clientPayments.map(payment => ({
      id: payment.id,
      description: payment.description,
      amount: payment.amount,
      date: payment.paymentDate,
      type: 'payment' as const,
      source: selectedClient?.name || 'غير معروف',
      client_id: payment.clientId,
      entryType: 'client_payment'
    })),
    ...clientExpenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.expenseDate,
      type: 'expense' as const,
      source: selectedClient?.name || 'غير معروف',
      client_id: expense.clientId,
      entryType: 'client_expense'
    }))
  ];

  const openAddClient = () => {
    setEditingClient(null);
    setClientFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setShowClientDialog(true);
  };

  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setShowClientDialog(true);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">إدارة الموكلين</h1>
            <p className="text-muted-foreground">إدارة بيانات الموكلين وحساباتهم المالية</p>
          </div>
          <Button onClick={openAddClient} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 ml-2" />
            إضافة موكل جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة الموكلين */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  قائمة الموكلين ({clients.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="بحث عن موكل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-right pr-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedClient?.id === client.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                      }`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{client.name}</h3>
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditClient(client);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteClient(client);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد موكلون'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل الموكل */}
          <div className="lg:col-span-2">
            {selectedClient ? (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    تفاصيل الموكل
                  </TabsTrigger>
                  <TabsTrigger value="accounting" className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    المحاسبة
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedClient.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedClient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}
                        {selectedClient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedClient.email}</span>
                          </div>
                        )}
                        {selectedClient.address && (
                          <div className="flex items-center gap-2 md:col-span-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedClient.address}</span>
                          </div>
                        )}
                      </div>
                      {selectedClient.notes && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-2">ملاحظات:</h4>
                          <p className="text-muted-foreground">{selectedClient.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="accounting">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>محاسبة الموكل: {selectedClient.name}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowPaymentDialog(true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة دفعة
                          </Button>
                          <Button
                            onClick={() => setShowExpenseDialog(true)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة مصروف
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <AccountingTable
                        entries={accountingEntries}
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">اختر موكلاً</h3>
                  <p className="text-muted-foreground">اختر موكلاً من القائمة لعرض تفاصيله ومحاسبته</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* نافذة إضافة/تعديل موكل */}
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'تعديل الموكل' : 'إضافة موكل جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={clientFormData.name}
                  onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                  placeholder="اسم الموكل"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={clientFormData.phone}
                  onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                  placeholder="رقم الهاتف"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientFormData.email}
                  onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                  placeholder="البريد الإلكتروني"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={clientFormData.address}
                  onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                  placeholder="العنوان"
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={clientFormData.notes}
                  onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  className="text-right resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveClient} 
                  className="flex-1"
                  disabled={!clientFormData.name.trim()}
                >
                  {editingClient ? 'تحديث' : 'حفظ'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowClientDialog(false)} 
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* نوافذ إضافة الدفعات والمصاريف */}
        <AddEntryDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          onSave={handleAddPayment}
          type="payment"
          title="إضافة دفعة جديدة"
        />

        <AddEntryDialog
          isOpen={showExpenseDialog}
          onClose={() => setShowExpenseDialog(false)}
          onSave={handleAddExpense}
          type="expense"
          title="إضافة مصروف جديد"
        />

        {/* نافذة تأكيد الحذف */}
        <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                هل أنت متأكد من حذف الموكل "{deleteClient?.name}"؟ 
                سيؤدي هذا إلى حذف جميع البيانات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.
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
