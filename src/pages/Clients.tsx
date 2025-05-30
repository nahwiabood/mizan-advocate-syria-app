
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, CalendarIcon, Users, Briefcase, Scale } from 'lucide-react';
import { Client, Case, CaseStage } from '@/types';
import { dataStore } from '@/store/dataStore';
import { formatSyrianDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedStage, setSelectedStage] = useState<CaseStage | null>(null);
  const [openClients, setOpenClients] = useState<Set<string>>(new Set());
  const [openCases, setOpenCases] = useState<Set<string>>(new Set());

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    notes: '',
  });

  const [newCase, setNewCase] = useState({
    description: '',
    opponent: '',
    subject: '',
  });

  const [newStage, setNewStage] = useState({
    courtName: '',
    caseNumber: '',
    stageName: '',
    firstSessionDate: undefined as Date | undefined,
    notes: '',
    resolvedAt: undefined as Date | undefined,
    decisionNumber: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getCaseStages());
  };

  const handleAddClient = () => {
    if (!newClient.name) return;

    dataStore.addClient({
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      address: newClient.address,
      nationalId: newClient.nationalId,
      notes: newClient.notes,
    });

    setNewClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      nationalId: '',
      notes: '',
    });
    setIsClientDialogOpen(false);
    loadData();
  };

  const handleAddCase = () => {
    if (!selectedClient || !newCase.description || !newCase.opponent) return;

    dataStore.addCase({
      clientId: selectedClient.id,
      title: '',
      description: newCase.description,
      opponent: newCase.opponent,
      subject: newCase.subject,
      caseType: '',
      status: 'active',
    });

    setNewCase({
      description: '',
      opponent: '',
      subject: '',
    });
    setIsCaseDialogOpen(false);
    setSelectedClient(null);
    loadData();
  };

  const handleAddStage = () => {
    if (!selectedCase || !newStage.courtName || !newStage.caseNumber || !newStage.stageName || !newStage.firstSessionDate) return;

    dataStore.addCaseStage({
      caseId: selectedCase.id,
      courtName: newStage.courtName,
      caseNumber: newStage.caseNumber,
      stageName: newStage.stageName,
      firstSessionDate: newStage.firstSessionDate,
      status: 'active',
      notes: newStage.notes,
      resolvedAt: newStage.resolvedAt,
      decisionNumber: newStage.decisionNumber,
    });

    setNewStage({
      courtName: '',
      caseNumber: '',
      stageName: '',
      firstSessionDate: undefined,
      notes: '',
      resolvedAt: undefined,
      decisionNumber: '',
    });
    setIsStageDialogOpen(false);
    setSelectedCase(null);
    loadData();
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`هل أنت متأكد من حذف الموكل ${client.name}؟`)) {
      dataStore.deleteClient(client.id);
      loadData();
    }
  };

  const handleDeleteCase = (caseItem: Case) => {
    if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      dataStore.deleteCase(caseItem.id);
      loadData();
    }
  };

  const handleDeleteStage = (stage: CaseStage) => {
    if (confirm('هل أنت متأكد من حذف هذه المرحلة؟')) {
      dataStore.deleteCaseStage(stage.id);
      loadData();
    }
  };

  const toggleClient = (clientId: string) => {
    const newOpenClients = new Set(openClients);
    if (newOpenClients.has(clientId)) {
      newOpenClients.delete(clientId);
    } else {
      newOpenClients.add(clientId);
    }
    setOpenClients(newOpenClients);
  };

  const toggleCase = (caseId: string) => {
    const newOpenCases = new Set(openCases);
    if (newOpenCases.has(caseId)) {
      newOpenCases.delete(caseId);
    } else {
      // Close all other cases
      newOpenCases.clear();
      newOpenCases.add(caseId);
    }
    setOpenCases(newOpenCases);
  };

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getCaseStages = (caseId: string) => {
    return stages.filter(stage => stage.caseId === caseId);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-right">
                <Users className="h-5 w-5" />
                إدارة الموكلين والقضايا
              </CardTitle>
              <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة موكل جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة موكل جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-right">
                      <Label htmlFor="clientName">الاسم الكامل</Label>
                      <Input
                        id="clientName"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="أدخل الاسم الكامل"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="clientPhone">رقم الهاتف</Label>
                      <Input
                        id="clientPhone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="رقم الهاتف"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="clientEmail">البريد الإلكتروني</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="البريد الإلكتروني"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="clientAddress">العنوان</Label>
                      <Input
                        id="clientAddress"
                        value={newClient.address}
                        onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                        placeholder="العنوان"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="clientNationalId">الرقم الوطني</Label>
                      <Input
                        id="clientNationalId"
                        value={newClient.nationalId}
                        onChange={(e) => setNewClient({ ...newClient, nationalId: e.target.value })}
                        placeholder="الرقم الوطني"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="clientNotes">ملاحظات</Label>
                      <Textarea
                        id="clientNotes"
                        value={newClient.notes}
                        onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                        placeholder="ملاحظات إضافية"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <Button onClick={handleAddClient} className="w-full">
                      إضافة الموكل
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا يوجد موكلين مسجلين
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <Card key={client.id} className="border-r-4 border-r-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Collapsible
                          open={openClients.has(client.id)}
                          onOpenChange={() => toggleClient(client.id)}
                          className="flex-1"
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between text-right p-2"
                            >
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="font-semibold">{client.name}</span>
                                {client.phone && (
                                  <span className="text-sm text-muted-foreground">
                                    - {client.phone}
                                  </span>
                                )}
                              </div>
                              {openClients.has(client.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-2 py-4 space-y-2 text-right">
                              {client.email && (
                                <p><span className="font-medium">البريد الإلكتروني:</span> {client.email}</p>
                              )}
                              {client.address && (
                                <p><span className="font-medium">العنوان:</span> {client.address}</p>
                              )}
                              {client.nationalId && (
                                <p><span className="font-medium">الرقم الوطني:</span> {client.nationalId}</p>
                              )}
                              {client.notes && (
                                <p><span className="font-medium">ملاحظات:</span> {client.notes}</p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        <div className="flex gap-2">
                          <Dialog open={isCaseDialogOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
                            setIsCaseDialogOpen(open);
                            if (open) setSelectedClient(client);
                            else setSelectedClient(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Plus className="h-3 w-3" />
                                قضية
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md" dir="rtl">
                              <DialogHeader>
                                <DialogTitle className="text-right">إضافة قضية جديدة</DialogTitle>
                                <p className="text-sm text-muted-foreground text-right">
                                  للموكل: {client.name}
                                </p>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="text-right">
                                  <Label htmlFor="caseDescription">وصف القضية</Label>
                                  <Textarea
                                    id="caseDescription"
                                    value={newCase.description}
                                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                    placeholder="وصف مفصل للقضية"
                                    className="text-right"
                                    dir="rtl"
                                  />
                                </div>
                                <div className="text-right">
                                  <Label htmlFor="caseOpponent">الخصم</Label>
                                  <Input
                                    id="caseOpponent"
                                    value={newCase.opponent}
                                    onChange={(e) => setNewCase({ ...newCase, opponent: e.target.value })}
                                    placeholder="اسم الخصم أو الجهة المقاضية"
                                    className="text-right"
                                    dir="rtl"
                                  />
                                </div>
                                <div className="text-right">
                                  <Label htmlFor="caseSubject">موضوع القضية</Label>
                                  <Input
                                    id="caseSubject"
                                    value={newCase.subject}
                                    onChange={(e) => setNewCase({ ...newCase, subject: e.target.value })}
                                    placeholder="موضوع القضية"
                                    className="text-right"
                                    dir="rtl"
                                  />
                                </div>
                                <Button onClick={handleAddCase} className="w-full">
                                  إضافة القضية
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClient(client)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {getClientCases(client.id).length === 0 ? (
                        <p className="text-muted-foreground text-right">لا توجد قضايا لهذا الموكل</p>
                      ) : (
                        <div className="space-y-3">
                          {getClientCases(client.id).map((caseItem) => (
                            <Card key={caseItem.id} className="border-r-4 border-r-green-500">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <Collapsible
                                    open={openCases.has(caseItem.id)}
                                    onOpenChange={() => toggleCase(caseItem.id)}
                                    className="flex-1"
                                  >
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-between text-right p-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Briefcase className="h-4 w-4" />
                                          <span className="font-medium">
                                            {caseItem.subject || caseItem.description.substring(0, 50)}...
                                          </span>
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            ضد {caseItem.opponent}
                                          </span>
                                        </div>
                                        {openCases.has(caseItem.id) ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="px-2 py-3 space-y-2 text-right">
                                        <p><span className="font-medium">الوصف:</span> {caseItem.description}</p>
                                        <p><span className="font-medium">الخصم:</span> {caseItem.opponent}</p>
                                        {caseItem.subject && (
                                          <p><span className="font-medium">الموضوع:</span> {caseItem.subject}</p>
                                        )}
                                        <p>
                                          <span className="font-medium">الحالة:</span>{' '}
                                          <span className={`px-2 py-1 rounded text-xs ${
                                            caseItem.status === 'active' ? 'bg-green-100 text-green-800' :
                                            caseItem.status === 'closed' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {caseItem.status === 'active' ? 'نشطة' :
                                             caseItem.status === 'closed' ? 'مغلقة' : 'معلقة'}
                                          </span>
                                        </p>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                  <div className="flex gap-2">
                                    <Dialog open={isStageDialogOpen && selectedCase?.id === caseItem.id} onOpenChange={(open) => {
                                      setIsStageDialogOpen(open);
                                      if (open) setSelectedCase(caseItem);
                                      else setSelectedCase(null);
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1">
                                          <Plus className="h-3 w-3" />
                                          مرحلة
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-lg" dir="rtl">
                                        <DialogHeader>
                                          <DialogTitle className="text-right">إضافة مرحلة جديدة</DialogTitle>
                                          <p className="text-sm text-muted-foreground text-right">
                                            للقضية: {caseItem.subject || caseItem.description.substring(0, 30)}...
                                          </p>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="text-right">
                                            <Label htmlFor="stageCourtName">اسم المحكمة</Label>
                                            <Input
                                              id="stageCourtName"
                                              value={newStage.courtName}
                                              onChange={(e) => setNewStage({ ...newStage, courtName: e.target.value })}
                                              placeholder="اسم المحكمة"
                                              className="text-right"
                                              dir="rtl"
                                            />
                                          </div>
                                          <div className="text-right">
                                            <Label htmlFor="stageCaseNumber">رقم الأساس</Label>
                                            <Input
                                              id="stageCaseNumber"
                                              value={newStage.caseNumber}
                                              onChange={(e) => setNewStage({ ...newStage, caseNumber: e.target.value })}
                                              placeholder="رقم الأساس"
                                              className="text-right"
                                              dir="rtl"
                                            />
                                          </div>
                                          <div className="text-right">
                                            <Label htmlFor="stageName">اسم المرحلة</Label>
                                            <Input
                                              id="stageName"
                                              value={newStage.stageName}
                                              onChange={(e) => setNewStage({ ...newStage, stageName: e.target.value })}
                                              placeholder="مثل: الاستئناف، التمييز، البداءة"
                                              className="text-right"
                                              dir="rtl"
                                            />
                                          </div>
                                          <div className="text-right">
                                            <Label>تاريخ أول جلسة</Label>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  className={cn(
                                                    "w-full justify-start text-right font-normal",
                                                    !newStage.firstSessionDate && "text-muted-foreground"
                                                  )}
                                                  dir="rtl"
                                                >
                                                  <CalendarIcon className="ml-2 h-4 w-4" />
                                                  {newStage.firstSessionDate ? (
                                                    formatSyrianDate(newStage.firstSessionDate)
                                                  ) : (
                                                    <span>اختر التاريخ</span>
                                                  )}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                  mode="single"
                                                  selected={newStage.firstSessionDate}
                                                  onSelect={(date) => setNewStage({ ...newStage, firstSessionDate: date })}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                          <div className="text-right">
                                            <Label>تاريخ الحسم</Label>
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  className={cn(
                                                    "w-full justify-start text-right font-normal",
                                                    !newStage.resolvedAt && "text-muted-foreground"
                                                  )}
                                                  dir="rtl"
                                                >
                                                  <CalendarIcon className="ml-2 h-4 w-4" />
                                                  {newStage.resolvedAt ? (
                                                    formatSyrianDate(newStage.resolvedAt)
                                                  ) : (
                                                    <span>اختر التاريخ (اختياري)</span>
                                                  )}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                  mode="single"
                                                  selected={newStage.resolvedAt}
                                                  onSelect={(date) => setNewStage({ ...newStage, resolvedAt: date })}
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                          <div className="text-right">
                                            <Label htmlFor="decisionNumber">رقم القرار</Label>
                                            <Input
                                              id="decisionNumber"
                                              value={newStage.decisionNumber}
                                              onChange={(e) => setNewStage({ ...newStage, decisionNumber: e.target.value })}
                                              placeholder="رقم القرار (اختياري)"
                                              className="text-right"
                                              dir="rtl"
                                            />
                                          </div>
                                          <div className="text-right">
                                            <Label htmlFor="stageNotes">ملاحظات</Label>
                                            <Textarea
                                              id="stageNotes"
                                              value={newStage.notes}
                                              onChange={(e) => setNewStage({ ...newStage, notes: e.target.value })}
                                              placeholder="ملاحظات حول المرحلة"
                                              className="text-right"
                                              dir="rtl"
                                            />
                                          </div>
                                          <Button onClick={handleAddStage} className="w-full">
                                            إضافة المرحلة
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteCase(caseItem)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              {openCases.has(caseItem.id) && (
                                <CardContent>
                                  {getCaseStages(caseItem.id).length === 0 ? (
                                    <p className="text-muted-foreground text-right">لا توجد مراحل لهذه القضية</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {getCaseStages(caseItem.id).map((stage) => (
                                        <Card key={stage.id} className="border-r-4 border-r-orange-500 bg-gray-50">
                                          <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                              <div className="text-right flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <Scale className="h-4 w-4" />
                                                  <span className="font-medium">{stage.stageName}</span>
                                                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                                                    {stage.courtName}
                                                  </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                  رقم الأساس: {stage.caseNumber}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                  أول جلسة: {formatSyrianDate(stage.firstSessionDate)}
                                                </p>
                                                {stage.resolvedAt && (
                                                  <p className="text-sm text-green-600">
                                                    تاريخ الحسم: {formatSyrianDate(stage.resolvedAt)}
                                                  </p>
                                                )}
                                                {stage.decisionNumber && (
                                                  <p className="text-sm text-muted-foreground">
                                                    رقم القرار: {stage.decisionNumber}
                                                  </p>
                                                )}
                                                {stage.notes && (
                                                  <p className="text-sm mt-1">{stage.notes}</p>
                                                )}
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteStage(stage)}
                                                className="text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Clients;
