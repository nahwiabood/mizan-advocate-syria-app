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
import { CalendarIcon, Plus, Edit, Trash2, ChevronDown, ChevronRight, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false);
  const [isEditCaseDialogOpen, setIsEditCaseDialogOpen] = useState(false);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedStage, setSelectedStage] = useState<CaseStage | null>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());

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
    status: 'active' as 'active' | 'closed' | 'pending',
  });

  const [newStage, setNewStage] = useState({
    courtName: '',
    caseNumber: '',
    stageName: '',
    firstSessionDate: undefined as Date | undefined,
    status: 'active' as 'active' | 'completed',
    notes: '',
    resolutionDate: undefined as Date | undefined,
    decisionNumber: '',
  });

  const [newSession, setNewSession] = useState({
    sessionDate: undefined as Date | undefined,
    postponementReason: '',
    nextSessionDate: undefined as Date | undefined,
    nextPostponementReason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getStages());
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
    setIsAddClientDialogOpen(false);
    loadData();
  };

  const handleEditClient = () => {
    if (!selectedClient) return;

    dataStore.updateClient(selectedClient.id, {
      name: newClient.name || selectedClient.name,
      phone: newClient.phone || selectedClient.phone,
      email: newClient.email || selectedClient.email,
      address: newClient.address || selectedClient.address,
      nationalId: newClient.nationalId || selectedClient.nationalId,
      notes: newClient.notes || selectedClient.notes,
    });

    setIsEditClientDialogOpen(false);
    setSelectedClient(null);
    setNewClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      nationalId: '',
      notes: '',
    });
    loadData();
  };

  const handleAddCase = () => {
    if (!selectedClient || !newCase.description || !newCase.opponent) return;

    dataStore.addCase({
      clientId: selectedClient.id,
      title: newCase.description,
      description: newCase.description,
      opponent: newCase.opponent,
      subject: newCase.subject,
      caseType: 'عام',
      status: newCase.status,
    });

    setNewCase({
      description: '',
      opponent: '',
      subject: '',
      status: 'active',
    });
    setIsAddCaseDialogOpen(false);
    loadData();
  };

  const handleEditCase = () => {
    if (!selectedCase) return;

    dataStore.updateCase(selectedCase.id, {
      title: newCase.description || selectedCase.title,
      description: newCase.description || selectedCase.description,
      opponent: newCase.opponent || selectedCase.opponent,
      subject: newCase.subject || selectedCase.subject,
      status: newCase.status,
    });

    setIsEditCaseDialogOpen(false);
    setSelectedCase(null);
    setNewCase({
      description: '',
      opponent: '',
      subject: '',
      status: 'active',
    });
    loadData();
  };

  const handleAddStage = () => {
    if (!selectedCase || !newStage.courtName || !newStage.caseNumber || !newStage.firstSessionDate) return;

    dataStore.addStage({
      caseId: selectedCase.id,
      courtName: newStage.courtName,
      caseNumber: newStage.caseNumber,
      stageName: newStage.stageName,
      firstSessionDate: newStage.firstSessionDate,
      status: newStage.status,
      notes: newStage.notes,
      resolutionDate: newStage.resolutionDate,
      decisionNumber: newStage.decisionNumber,
    });

    setNewStage({
      courtName: '',
      caseNumber: '',
      stageName: '',
      firstSessionDate: undefined,
      status: 'active',
      notes: '',
      resolutionDate: undefined,
      decisionNumber: '',
    });
    setIsAddStageDialogOpen(false);
    loadData();
  };

  const handleEditStage = () => {
    if (!selectedStage) return;

    dataStore.updateStage(selectedStage.id, {
      courtName: newStage.courtName || selectedStage.courtName,
      caseNumber: newStage.caseNumber || selectedStage.caseNumber,
      stageName: newStage.stageName || selectedStage.stageName,
      firstSessionDate: newStage.firstSessionDate || selectedStage.firstSessionDate,
      status: newStage.status,
      notes: newStage.notes || selectedStage.notes,
      resolutionDate: newStage.resolutionDate,
      decisionNumber: newStage.decisionNumber || selectedStage.decisionNumber,
    });

    setIsEditStageDialogOpen(false);
    setSelectedStage(null);
    setNewStage({
      courtName: '',
      caseNumber: '',
      stageName: '',
      firstSessionDate: undefined,
      status: 'active',
      notes: '',
      resolutionDate: undefined,
      decisionNumber: '',
    });
    loadData();
  };

  const handleAddSession = () => {
    if (!selectedStage || !newSession.sessionDate) return;

    const client = clients.find(c => 
      cases.find(case_ => case_.clientId === c.id && 
        stages.find(stage => stage.caseId === case_.id && stage.id === selectedStage.id)
      )
    );
    const case_ = cases.find(c => stages.find(stage => stage.caseId === c.id && stage.id === selectedStage.id));

    if (!client || !case_) return;

    dataStore.addSession({
      stageId: selectedStage.id,
      courtName: selectedStage.courtName,
      caseNumber: selectedStage.caseNumber,
      sessionDate: newSession.sessionDate,
      clientName: client.name,
      opponent: case_.opponent,
      postponementReason: newSession.postponementReason,
      nextSessionDate: newSession.nextSessionDate,
      nextPostponementReason: newSession.nextPostponementReason,
      isTransferred: false,
    });

    setNewSession({
      sessionDate: undefined,
      postponementReason: '',
      nextSessionDate: undefined,
      nextPostponementReason: '',
    });
    setIsAddSessionDialogOpen(false);
    loadData();
  };

  const toggleClientExpansion = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
      // Also collapse all cases for this client
      const clientCases = cases.filter(c => c.clientId === clientId);
      clientCases.forEach(case_ => {
        const newExpandedCases = new Set(expandedCases);
        newExpandedCases.delete(case_.id);
        setExpandedCases(newExpandedCases);
      });
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const toggleCaseExpansion = (caseId: string) => {
    const newExpanded = new Set(expandedCases);
    
    // If opening this case, close all other cases
    if (!newExpanded.has(caseId)) {
      newExpanded.clear();
      newExpanded.add(caseId);
    } else {
      newExpanded.delete(caseId);
    }
    
    setExpandedCases(newExpanded);
  };

  const openEditClientDialog = (client: Client) => {
    setSelectedClient(client);
    setNewClient({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      nationalId: client.nationalId || '',
      notes: client.notes || '',
    });
    setIsEditClientDialogOpen(true);
  };

  const openAddCaseDialog = (client: Client) => {
    setSelectedClient(client);
    setIsAddCaseDialogOpen(true);
  };

  const openEditCaseDialog = (case_: Case) => {
    setSelectedCase(case_);
    setNewCase({
      description: case_.description,
      opponent: case_.opponent,
      subject: case_.subject,
      status: case_.status,
    });
    setIsEditCaseDialogOpen(true);
  };

  const openAddStageDialog = (case_: Case) => {
    setSelectedCase(case_);
    setIsAddStageDialogOpen(true);
  };

  const openEditStageDialog = (stage: CaseStage) => {
    setSelectedStage(stage);
    setNewStage({
      courtName: stage.courtName,
      caseNumber: stage.caseNumber,
      stageName: stage.stageName,
      firstSessionDate: stage.firstSessionDate,
      status: stage.status,
      notes: stage.notes || '',
      resolutionDate: stage.resolutionDate,
      decisionNumber: stage.decisionNumber || '',
    });
    setIsEditStageDialogOpen(true);
  };

  const openAddSessionDialog = (stage: CaseStage) => {
    setSelectedStage(stage);
    setIsAddSessionDialogOpen(true);
  };

  const getCasesForClient = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getStagesForCase = (caseId: string) => {
    return stages.filter(stage => stage.caseId === caseId);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-right flex items-center gap-2">
                <Users className="h-5 w-5" />
                إدارة الموكلين والقضايا
              </CardTitle>
              <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
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
                      <Label htmlFor="name" className="text-right">الاسم *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="اسم الموكل"
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
                      <Label htmlFor="nationalId" className="text-right">الرقم الوطني</Label>
                      <Input
                        id="nationalId"
                        value={newClient.nationalId}
                        onChange={(e) => setNewClient({ ...newClient, nationalId: e.target.value })}
                        placeholder="الرقم الوطني"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="address" className="text-right">العنوان</Label>
                      <Textarea
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
                لا يوجد موكلين مسجلين بعد
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <Card key={client.id} className="border">
                    <Collapsible>
                      <CollapsibleTrigger
                        className="w-full"
                        onClick={() => toggleClientExpansion(client.id)}
                      >
                        <div className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                          <div className="flex items-center gap-3">
                            {expandedClients.has(client.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <User className="h-4 w-4" />
                            <div className="text-right">
                              <h3 className="font-semibold">{client.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {client.phone && `هاتف: ${client.phone}`}
                                {client.email && ` • إيميل: ${client.email}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditClientDialog(client)}
                              className="gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              تعديل
                            </Button>
                            <Dialog open={isAddCaseDialogOpen} onOpenChange={setIsAddCaseDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAddCaseDialog(client)}
                                  className="gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  قضية جديدة
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        {expandedClients.has(client.id) && (
                          <div className="px-4 pb-4 border-t">
                            <div className="mt-4 space-y-3">
                              {client.address && (
                                <p><strong>العنوان:</strong> {client.address}</p>
                              )}
                              {client.nationalId && (
                                <p><strong>الرقم الوطني:</strong> {client.nationalId}</p>
                              )}
                              {client.notes && (
                                <p><strong>ملاحظات:</strong> {client.notes}</p>
                              )}
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="font-semibold mb-3">القضايا المرتبطة:</h4>
                              {getCasesForClient(client.id).length === 0 ? (
                                <p className="text-muted-foreground text-sm">لا توجد قضايا مرتبطة</p>
                              ) : (
                                <div className="space-y-2">
                                  {getCasesForClient(client.id).map((case_) => (
                                    <Card key={case_.id} className="bg-muted/50">
                                      <Collapsible>
                                        <CollapsibleTrigger
                                          className="w-full"
                                          onClick={() => toggleCaseExpansion(case_.id)}
                                        >
                                          <div className="flex items-center justify-between p-3">
                                            <div className="flex items-center gap-2 text-right">
                                              {expandedCases.has(case_.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4" />
                                              )}
                                              <div>
                                                <h5 className="font-medium">{case_.description}</h5>
                                                <p className="text-sm text-muted-foreground">
                                                  الخصم: {case_.opponent} • الحالة: {
                                                    case_.status === 'active' ? 'نشطة' :
                                                    case_.status === 'closed' ? 'مغلقة' : 'معلقة'
                                                  }
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditCaseDialog(case_)}
                                                className="gap-1"
                                              >
                                                <Edit className="h-4 w-4" />
                                                تعديل
                                              </Button>
                                              <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
                                                <DialogTrigger asChild>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openAddStageDialog(case_)}
                                                    className="gap-1"
                                                  >
                                                    <Plus className="h-4 w-4" />
                                                    مرحلة جديدة
                                                  </Button>
                                                </DialogTrigger>
                                              </Dialog>
                                            </div>
                                          </div>
                                        </CollapsibleTrigger>
                                        
                                        <CollapsibleContent>
                                          {expandedCases.has(case_.id) && (
                                            <div className="px-3 pb-3 border-t bg-white/50">
                                              <div className="mt-3 space-y-2">
                                                {case_.subject && (
                                                  <p><strong>الموضوع:</strong> {case_.subject}</p>
                                                )}
                                              </div>
                                              
                                              <div className="mt-4">
                                                <h6 className="font-medium mb-2">المراحل:</h6>
                                                {getStagesForCase(case_.id).length === 0 ? (
                                                  <p className="text-muted-foreground text-sm">لا توجد مراحل</p>
                                                ) : (
                                                  <div className="space-y-2">
                                                    {getStagesForCase(case_.id).map((stage) => (
                                                      <div key={stage.id} className="bg-white p-3 rounded border">
                                                        <div className="flex items-start justify-between">
                                                          <div className="text-right flex-1">
                                                            <h6 className="font-medium">{stage.stageName || 'مرحلة غير محددة'}</h6>
                                                            <p className="text-sm text-muted-foreground">
                                                              {stage.courtName} - {stage.caseNumber}
                                                            </p>
                                                            <p className="text-sm">
                                                              تاريخ الجلسة الأولى: {formatSyrianDate(stage.firstSessionDate)}
                                                            </p>
                                                            {stage.resolutionDate && (
                                                              <p className="text-sm text-green-600">
                                                                تاريخ الحسم: {formatSyrianDate(stage.resolutionDate)}
                                                              </p>
                                                            )}
                                                            {stage.decisionNumber && (
                                                              <p className="text-sm">
                                                                رقم القرار: {stage.decisionNumber}
                                                              </p>
                                                            )}
                                                            {stage.notes && (
                                                              <p className="text-sm mt-1">
                                                                <strong>ملاحظات:</strong> {stage.notes}
                                                              </p>
                                                            )}
                                                          </div>
                                                          <div className="flex gap-2">
                                                            <Button
                                                              variant="ghost"
                                                              size="sm"
                                                              onClick={() => openEditStageDialog(stage)}
                                                              className="gap-1"
                                                            >
                                                              <Edit className="h-4 w-4" />
                                                              تعديل
                                                            </Button>
                                                            <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
                                                              <DialogTrigger asChild>
                                                                <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  onClick={() => openAddSessionDialog(stage)}
                                                                  className="gap-1"
                                                                >
                                                                  <Plus className="h-4 w-4" />
                                                                  جلسة جديدة
                                                                </Button>
                                                              </DialogTrigger>
                                                            </Dialog>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Client Dialog */}
        <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل بيانات الموكل</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-name" className="text-right">الاسم *</Label>
                <Input
                  id="edit-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="اسم الموكل"
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
                <Label htmlFor="edit-nationalId" className="text-right">الرقم الوطني</Label>
                <Input
                  id="edit-nationalId"
                  value={newClient.nationalId}
                  onChange={(e) => setNewClient({ ...newClient, nationalId: e.target.value })}
                  placeholder="الرقم الوطني"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-address" className="text-right">العنوان</Label>
                <Textarea
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
              <div className="flex gap-2">
                <Button onClick={handleEditClient} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Dialog open={isAddCaseDialogOpen} onOpenChange={setIsAddCaseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => openAddCaseDialog(selectedClient!)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      قضية جديدة
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Case Dialog */}
        <Dialog open={isAddCaseDialogOpen} onOpenChange={setIsAddCaseDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة قضية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="case-description" className="text-right">وصف القضية *</Label>
                <Textarea
                  id="case-description"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  placeholder="وصف القضية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="case-opponent" className="text-right">الخصم *</Label>
                <Input
                  id="case-opponent"
                  value={newCase.opponent}
                  onChange={(e) => setNewCase({ ...newCase, opponent: e.target.value })}
                  placeholder="اسم الخصم"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="case-subject" className="text-right">الموضوع</Label>
                <Input
                  id="case-subject"
                  value={newCase.subject}
                  onChange={(e) => setNewCase({ ...newCase, subject: e.target.value })}
                  placeholder="موضوع القضية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="case-status" className="text-right">الحالة</Label>
                <Select value={newCase.status} onValueChange={(value: 'active' | 'closed' | 'pending') => setNewCase({ ...newCase, status: value })}>
                  <SelectTrigger className="text-right" dir="rtl">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="pending">معلقة</SelectItem>
                    <SelectItem value="closed">مغلقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddCase} className="w-full">
                إضافة القضية
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Case Dialog */}
        <Dialog open={isEditCaseDialogOpen} onOpenChange={setIsEditCaseDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل القضية</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-case-description" className="text-right">وصف القضية *</Label>
                <Textarea
                  id="edit-case-description"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  placeholder="وصف القضية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-case-opponent" className="text-right">الخصم *</Label>
                <Input
                  id="edit-case-opponent"
                  value={newCase.opponent}
                  onChange={(e) => setNewCase({ ...newCase, opponent: e.target.value })}
                  placeholder="اسم الخصم"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-case-subject" className="text-right">الموضوع</Label>
                <Input
                  id="edit-case-subject"
                  value={newCase.subject}
                  onChange={(e) => setNewCase({ ...newCase, subject: e.target.value })}
                  placeholder="موضوع القضية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-case-status" className="text-right">الحالة</Label>
                <Select value={newCase.status} onValueChange={(value: 'active' | 'closed' | 'pending') => setNewCase({ ...newCase, status: value })}>
                  <SelectTrigger className="text-right" dir="rtl">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="pending">معلقة</SelectItem>
                    <SelectItem value="closed">مغلقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditCase} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => openAddStageDialog(selectedCase!)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      مرحلة جديدة
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Stage Dialog */}
        <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة مرحلة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="stage-name" className="text-right">اسم المرحلة</Label>
                <Input
                  id="stage-name"
                  value={newStage.stageName}
                  onChange={(e) => setNewStage({ ...newStage, stageName: e.target.value })}
                  placeholder="اسم المرحلة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="stage-court" className="text-right">المحكمة *</Label>
                <Input
                  id="stage-court"
                  value={newStage.courtName}
                  onChange={(e) => setNewStage({ ...newStage, courtName: e.target.value })}
                  placeholder="اسم المحكمة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="stage-case-number" className="text-right">رقم الأساس *</Label>
                <Input
                  id="stage-case-number"
                  value={newStage.caseNumber}
                  onChange={(e) => setNewStage({ ...newStage, caseNumber: e.target.value })}
                  placeholder="رقم الأساس"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label className="text-right">تاريخ الجلسة الأولى *</Label>
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
                <Label className="text-right">تاريخ الحسم</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !newStage.resolutionDate && "text-muted-foreground"
                      )}
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newStage.resolutionDate ? (
                        formatSyrianDate(newStage.resolutionDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newStage.resolutionDate}
                      onSelect={(date) => setNewStage({ ...newStage, resolutionDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label htmlFor="stage-decision-number" className="text-right">رقم القرار</Label>
                <Input
                  id="stage-decision-number"
                  value={newStage.decisionNumber}
                  onChange={(e) => setNewStage({ ...newStage, decisionNumber: e.target.value })}
                  placeholder="رقم القرار"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="stage-status" className="text-right">الحالة</Label>
                <Select value={newStage.status} onValueChange={(value: 'active' | 'completed') => setNewStage({ ...newStage, status: value })}>
                  <SelectTrigger className="text-right" dir="rtl">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right">
                <Label htmlFor="stage-notes" className="text-right">ملاحظات</Label>
                <Textarea
                  id="stage-notes"
                  value={newStage.notes}
                  onChange={(e) => setNewStage({ ...newStage, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
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

        {/* Edit Stage Dialog */}
        <Dialog open={isEditStageDialogOpen} onOpenChange={setIsEditStageDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل المرحلة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-stage-name" className="text-right">اسم المرحلة</Label>
                <Input
                  id="edit-stage-name"
                  value={newStage.stageName}
                  onChange={(e) => setNewStage({ ...newStage, stageName: e.target.value })}
                  placeholder="اسم المرحلة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-stage-court" className="text-right">المحكمة *</Label>
                <Input
                  id="edit-stage-court"
                  value={newStage.courtName}
                  onChange={(e) => setNewStage({ ...newStage, courtName: e.target.value })}
                  placeholder="اسم المحكمة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-stage-case-number" className="text-right">رقم الأساس *</Label>
                <Input
                  id="edit-stage-case-number"
                  value={newStage.caseNumber}
                  onChange={(e) => setNewStage({ ...newStage, caseNumber: e.target.value })}
                  placeholder="رقم الأساس"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label className="text-right">تاريخ الجلسة الأولى *</Label>
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
                <Label className="text-right">تاريخ الحسم</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !newStage.resolutionDate && "text-muted-foreground"
                      )}
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newStage.resolutionDate ? (
                        formatSyrianDate(newStage.resolutionDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newStage.resolutionDate}
                      onSelect={(date) => setNewStage({ ...newStage, resolutionDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label htmlFor="edit-stage-decision-number" className="text-right">رقم القرار</Label>
                <Input
                  id="edit-stage-decision-number"
                  value={newStage.decisionNumber}
                  onChange={(e) => setNewStage({ ...newStage, decisionNumber: e.target.value })}
                  placeholder="رقم القرار"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-stage-status" className="text-right">الحالة</Label>
                <Select value={newStage.status} onValueChange={(value: 'active' | 'completed') => setNewStage({ ...newStage, status: value })}>
                  <SelectTrigger className="text-right" dir="rtl">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right">
                <Label htmlFor="edit-stage-notes" className="text-right">ملاحظات</Label>
                <Textarea
                  id="edit-stage-notes"
                  value={newStage.notes}
                  onChange={(e) => setNewStage({ ...newStage, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditStage} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => openAddSessionDialog(selectedStage!)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      جلسة جديدة
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Session Dialog */}
        <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة جلسة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label className="text-right">تاريخ الجلسة *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !newSession.sessionDate && "text-muted-foreground"
                      )}
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newSession.sessionDate ? (
                        formatSyrianDate(newSession.sessionDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newSession.sessionDate}
                      onSelect={(date) => setNewSession({ ...newSession, sessionDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label htmlFor="session-postponement" className="text-right">سبب التأجيل</Label>
                <Textarea
                  id="session-postponement"
                  value={newSession.postponementReason}
                  onChange={(e) => setNewSession({ ...newSession, postponementReason: e.target.value })}
                  placeholder="سبب التأجيل"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label className="text-right">تاريخ الجلسة القادمة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !newSession.nextSessionDate && "text-muted-foreground"
                      )}
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newSession.nextSessionDate ? (
                        formatSyrianDate(newSession.nextSessionDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newSession.nextSessionDate}
                      onSelect={(date) => setNewSession({ ...newSession, nextSessionDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label htmlFor="session-next-postponement" className="text-right">سبب التأجيل القادم</Label>
                <Textarea
                  id="session-next-postponement"
                  value={newSession.nextPostponementReason}
                  onChange={(e) => setNewSession({ ...newSession, nextPostponementReason: e.target.value })}
                  placeholder="سبب التأجيل القادم"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <Button onClick={handleAddSession} className="w-full">
                إضافة الجلسة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Clients;
