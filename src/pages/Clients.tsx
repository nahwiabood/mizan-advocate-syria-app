
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, User, Phone, Mail, MapPin, FileText, Eye, Edit, Trash2, Calculator, Receipt, FolderOpen, DollarSign } from "lucide-react";
import { Client, Case, ClientBalance } from '@/types';
import { dataStore } from '@/store/dataStore';
import { toast } from "sonner";
import Layout from '@/components/Layout';
import CaseAccountingDialog from '@/components/CaseAccountingDialog';
import ClientStatementDialog from '@/components/ClientStatementDialog';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isCaseAccountingOpen, setIsCaseAccountingOpen] = useState(false);
  const [isClientStatementOpen, setIsClientStatementOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [clientBalances, setClientBalances] = useState<Map<string, ClientBalance>>(new Map());

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    notes: ''
  });

  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    opponent: '',
    subject: '',
    caseType: '',
    status: 'active' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const clientsData = dataStore.getClients();
    const casesData = dataStore.getCases();
    setClients(clientsData);
    setCases(casesData);
    
    // Load client balances
    const balances = new Map<string, ClientBalance>();
    clientsData.forEach(client => {
      const balance = dataStore.getClientBalance(client.id);
      balances.set(client.id, balance);
    });
    setClientBalances(balances);
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      nationalId: '',
      notes: ''
    });
    setEditingClient(null);
  };

  const resetCaseForm = () => {
    setCaseForm({
      title: '',
      description: '',
      opponent: '',
      subject: '',
      caseType: '',
      status: 'active'
    });
    setEditingCase(null);
  };

  const handleAddClient = () => {
    if (!clientForm.name.trim()) {
      toast.error('يرجى إدخال اسم الموكل');
      return;
    }

    try {
      if (editingClient) {
        dataStore.updateClient(editingClient.id, clientForm);
        toast.success('تم تحديث بيانات الموكل بنجاح');
      } else {
        dataStore.addClient(clientForm);
        toast.success('تم إضافة الموكل بنجاح');
      }
      
      loadData();
      resetClientForm();
      setIsClientDialogOpen(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleAddCase = () => {
    if (!selectedClient || !caseForm.title.trim()) {
      toast.error('يرجى إدخال عنوان القضية');
      return;
    }

    try {
      if (editingCase) {
        dataStore.updateCase(editingCase.id, caseForm);
        toast.success('تم تحديث القضية بنجاح');
      } else {
        dataStore.addCase({
          ...caseForm,
          clientId: selectedClient.id
        });
        toast.success('تم إضافة القضية بنجاح');
      }
      
      loadData();
      resetCaseForm();
      setIsCaseDialogOpen(false);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      nationalId: client.nationalId || '',
      notes: client.notes || ''
    });
    setIsClientDialogOpen(true);
  };

  const handleEditCase = (case_: Case) => {
    setEditingCase(case_);
    setCaseForm({
      title: case_.title,
      description: case_.description,
      opponent: case_.opponent,
      subject: case_.subject,
      caseType: case_.caseType,
      status: case_.status
    });
    setIsCaseDialogOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموكل وجميع قضاياه؟')) {
      try {
        dataStore.deleteClient(clientId);
        loadData();
        toast.success('تم حذف الموكل بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف البيانات');
      }
    }
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      try {
        dataStore.deleteCase(caseId);
        loadData();
        toast.success('تم حذف القضية بنجاح');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف البيانات');
      }
    }
  };

  const handleOpenCaseAccounting = (case_: Case) => {
    setSelectedCase(case_);
    setIsCaseAccountingOpen(true);
  };

  const handleOpenClientStatement = (client: Client) => {
    setSelectedClient(client);
    setIsClientStatementOpen(true);
  };

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'closed': return 'مغلقة';
      case 'pending': return 'معلقة';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">إدارة الموكلين</h1>
          </div>
          <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetClientForm}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة موكل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'تعديل بيانات الموكل' : 'إضافة موكل جديد'}</DialogTitle>
                <DialogDescription>
                  {editingClient ? 'قم بتعديل بيانات الموكل' : 'أدخل بيانات الموكل الجديد'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-name">الاسم *</Label>
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
                  <Label htmlFor="client-nationalId">رقم الهوية</Label>
                  <Input
                    id="client-nationalId"
                    value={clientForm.nationalId}
                    onChange={(e) => setClientForm({ ...clientForm, nationalId: e.target.value })}
                    placeholder="رقم الهوية الوطنية"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="client-address">العنوان</Label>
                  <Input
                    id="client-address"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    placeholder="العنوان"
                  />
                </div>
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
              <DialogFooter>
                <Button onClick={handleAddClient}>
                  {editingClient ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  قائمة الموكلين ({clients.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {clients.map((client) => {
                      const balance = clientBalances.get(client.id);
                      return (
                        <Card 
                          key={client.id} 
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedClient?.id === client.id ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedClient(client)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </div>
                            )}
                            {balance && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">الرصيد:</span>
                                  <span className={`text-sm font-semibold ${balance.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(Math.abs(balance.balance))}
                                    {balance.balance >= 0 ? ' مدين' : ' دائن'}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {getClientCases(client.id).length} قضية
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedClient ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {selectedClient.name}
                      </CardTitle>
                      <CardDescription>تفاصيل الموكل وقضاياه</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleOpenClientStatement(selectedClient)}>
                        <Receipt className="h-4 w-4 mr-2" />
                        كشف الحساب
                      </Button>
                      <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={resetCaseForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            إضافة قضية
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{editingCase ? 'تعديل القضية' : 'إضافة قضية جديدة'}</DialogTitle>
                            <DialogDescription>
                              {editingCase ? 'قم بتعديل بيانات القضية' : 'أدخل بيانات القضية الجديدة'}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div>
                              <Label htmlFor="case-title">عنوان القضية *</Label>
                              <Input
                                id="case-title"
                                value={caseForm.title}
                                onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                                placeholder="عنوان القضية"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="case-opponent">الخصم</Label>
                                <Input
                                  id="case-opponent"
                                  value={caseForm.opponent}
                                  onChange={(e) => setCaseForm({ ...caseForm, opponent: e.target.value })}
                                  placeholder="اسم الخصم"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case-subject">موضوع القضية</Label>
                                <Input
                                  id="case-subject"
                                  value={caseForm.subject}
                                  onChange={(e) => setCaseForm({ ...caseForm, subject: e.target.value })}
                                  placeholder="موضوع القضية"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="case-type">نوع القضية</Label>
                                <Input
                                  id="case-type"
                                  value={caseForm.caseType}
                                  onChange={(e) => setCaseForm({ ...caseForm, caseType: e.target.value })}
                                  placeholder="نوع القضية"
                                />
                              </div>
                              <div>
                                <Label htmlFor="case-status">حالة القضية</Label>
                                <select
                                  id="case-status"
                                  value={caseForm.status}
                                  onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value as any })}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                  <option value="active">نشطة</option>
                                  <option value="pending">معلقة</option>
                                  <option value="closed">مغلقة</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="case-description">وصف القضية</Label>
                              <Textarea
                                id="case-description"
                                value={caseForm.description}
                                onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                                placeholder="وصف تفصيلي للقضية"
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddCase}>
                              {editingCase ? 'تحديث' : 'إضافة'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">بيانات الموكل</TabsTrigger>
                      <TabsTrigger value="cases">القضايا ({getClientCases(selectedClient.id).length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedClient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}
                        {selectedClient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{selectedClient.email}</span>
                          </div>
                        )}
                        {selectedClient.nationalId && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>الهوية: {selectedClient.nationalId}</span>
                          </div>
                        )}
                        {selectedClient.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{selectedClient.address}</span>
                          </div>
                        )}
                      </div>
                      {selectedClient.notes && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">ملاحظات:</h4>
                          <p className="text-gray-700">{selectedClient.notes}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="cases">
                      <div className="space-y-4">
                        {getClientCases(selectedClient.id).map((case_) => (
                          <Card key={case_.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{case_.title}</CardTitle>
                                  <CardDescription>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span>الخصم: {case_.opponent}</span>
                                      <Badge className={`${getStatusColor(case_.status)} text-xs`}>
                                        {getStatusText(case_.status)}
                                      </Badge>
                                    </div>
                                  </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleOpenCaseAccounting(case_)}>
                                    <Calculator className="h-3 w-3 mr-1" />
                                    المحاسبة
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEditCase(case_)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleDeleteCase(case_.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <strong>الموضوع:</strong> {case_.subject}
                                </div>
                                <div>
                                  <strong>نوع القضية:</strong> {case_.caseType}
                                </div>
                              </div>
                              {case_.description && (
                                <div className="mt-3">
                                  <strong>الوصف:</strong>
                                  <p className="text-gray-700 mt-1">{case_.description}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                        {getClientCases(selectedClient.id).length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>لا توجد قضايا لهذا الموكل</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[500px]">
                  <div className="text-center text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">اختر موكلاً لعرض تفاصيله</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Case Accounting Dialog */}
        {selectedCase && (
          <CaseAccountingDialog
            case_={selectedCase}
            isOpen={isCaseAccountingOpen}
            onOpenChange={setIsCaseAccountingOpen}
          />
        )}

        {/* Client Statement Dialog */}
        {selectedClient && (
          <ClientStatementDialog
            client={selectedClient}
            isOpen={isClientStatementOpen}
            onOpenChange={setIsClientStatementOpen}
          />
        )}
      </div>
    </Layout>
  );
};

export default Clients;
