
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, Calculator, Users } from 'lucide-react';
import { formatSyrianDate } from '@/utils/dateUtils';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabaseStore } from '@/store/supabaseStore';
import { Client, ClientBalance } from '@/types';
import { toast } from '@/hooks/use-toast';

const Clients = () => {
  const { clients, cases, loading, refetch } = useSupabaseData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientBalances, setClientBalances] = useState<Record<string, ClientBalance>>({});
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseStore.addClient({
        name: newClient.name.trim(),
        phone: newClient.phone.trim() || undefined,
        email: newClient.email.trim() || undefined,
        address: newClient.address.trim() || undefined,
        notes: newClient.notes.trim() || undefined
      });

      setNewClient({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
      setIsAddDialogOpen(false);
      await refetch();
      
      toast({
        title: "تم الحفظ",
        description: "تم إضافة العميل بنجاح"
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل",
        variant: "destructive"
      });
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient || !newClient.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم العميل",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await supabaseStore.updateClient(selectedClient.id, {
        name: newClient.name.trim(),
        phone: newClient.phone.trim() || undefined,
        email: newClient.email.trim() || undefined,
        address: newClient.address.trim() || undefined,
        notes: newClient.notes.trim() || undefined
      });
      
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      setNewClient({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
      await refetch();
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات العميل بنجاح"
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث العميل",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      await supabaseStore.deleteClient(selectedClient.id);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      await refetch();
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح"
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setNewClient({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const fetchClientBalance = async (clientId: string) => {
    try {
      const balance = await supabaseStore.getClientBalance(clientId);
      setClientBalances(prev => ({
        ...prev,
        [clientId]: balance
      }));
    } catch (error) {
      console.error('Error fetching client balance:', error);
    }
  };

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
            <p className="text-gray-600 mt-2">إدارة بيانات العملاء وقضاياهم</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة عميل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة عميل جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-right">
                  <Label htmlFor="name" className="text-right">اسم العميل *</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="اسم العميل"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="phone" className="text-right">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="address" className="text-right">العنوان</Label>
                  <Input
                    id="address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="العنوان"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="notes" className="text-right">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <Button onClick={handleAddClient} className="w-full">
                  إضافة العميل
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const clientCases = getClientCases(client.id);
            const balance = clientBalances[client.id];
            
            return (
              <Card key={client.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                        {client.name}
                      </CardTitle>
                      <div className="space-y-1 text-sm text-gray-600">
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{client.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(client)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="cases" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="cases">القضايا ({clientCases.length})</TabsTrigger>
                      <TabsTrigger 
                        value="balance"
                        onClick={() => !balance && fetchClientBalance(client.id)}
                      >
                        الرصيد
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="cases" className="mt-4">
                      {clientCases.length > 0 ? (
                        <div className="space-y-2">
                          {clientCases.slice(0, 3).map((case_) => (
                            <div key={case_.id} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{case_.title}</div>
                              <div className="text-gray-600">{case_.status}</div>
                            </div>
                          ))}
                          {clientCases.length > 3 && (
                            <div className="text-sm text-gray-500 text-center">
                              و {clientCases.length - 3} قضايا أخرى
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          لا توجد قضايا مسجلة
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="balance" className="mt-4">
                      {balance ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>إجمالي الأتعاب:</span>
                            <span className="font-medium text-green-600">
                              {balance.totalFees.toLocaleString()} ل.س
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>إجمالي المدفوعات:</span>
                            <span className="font-medium text-blue-600">
                              {balance.totalPayments.toLocaleString()} ل.س
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>إجمالي المصروفات:</span>
                            <span className="font-medium text-orange-600">
                              {balance.totalExpenses.toLocaleString()} ل.س
                            </span>
                          </div>
                          <hr />
                          <div className="flex justify-between font-bold">
                            <span>الرصيد النهائي:</span>
                            <span className={balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {balance.balance.toLocaleString()} ل.س
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchClientBalance(client.id)}
                            className="gap-2"
                          >
                            <Calculator className="h-4 w-4" />
                            حساب الرصيد
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  {client.notes && (
                    <div className="mt-4 p-2 bg-yellow-50 rounded text-sm">
                      <div className="font-medium text-yellow-800 mb-1">ملاحظات:</div>
                      <div className="text-yellow-700">{client.notes}</div>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-gray-500">
                    تاريخ الإضافة: {formatSyrianDate(client.createdAt)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {clients.length === 0 && (
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد عملاء</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة عميل جديد لإدارة قضاياه وحساباته</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة أول عميل
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل بيانات العميل</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-name" className="text-right">اسم العميل *</Label>
                <Input
                  id="edit-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="اسم العميل"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-phone" className="text-right">رقم الهاتف</Label>
                <Input
                  id="edit-phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="رقم الهاتف"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-email" className="text-right">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="البريد الإلكتروني"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-address" className="text-right">العنوان</Label>
                <Input
                  id="edit-address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="العنوان"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-notes" className="text-right">ملاحظات</Label>
                <Textarea
                  id="edit-notes"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <Button onClick={handleEditClient} className="w-full">
                حفظ التعديلات
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-right">
              <p>هل أنت متأكد من رغبتك في حذف العميل "{selectedClient?.name}"؟</p>
              <p className="text-sm text-red-600">
                سيتم حذف جميع البيانات المرتبطة بهذا العميل بما في ذلك القضايا والحسابات.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteClient}
                  className="flex-1"
                >
                  حذف
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Clients;
