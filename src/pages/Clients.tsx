
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, User, Folder, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { dataStore } from '@/store/dataStore';
import { Client, Case, Stage, Session } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [expandedCases, setExpandedCases] = useState<string[]>([]);
  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false);
  const [isEditCaseDialogOpen, setIsEditCaseDialogOpen] = useState(false);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [newCase, setNewCase] = useState({
    opponent: '',
    title: '',
  });
  const [newStage, setNewStage] = useState({
    courtName: '',
    caseNumber: '',
    notes: '',
  });
  const [newSession, setNewSession] = useState({
    sessionDate: '',
    postponementReason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getStages());
    setSessions(dataStore.getSessions());
  };

  const toggleClient = (clientId: string) => {
    // Close all other clients when opening a new one
    if (expandedClients.includes(clientId)) {
      setExpandedClients([]);
      setExpandedCases([]); // Also close all cases
      setExpandedStages([]); // Also close all stages
    } else {
      setExpandedClients([clientId]);
      setExpandedCases([]); // Close all cases when switching clients
      setExpandedStages([]); // Close all stages when switching clients
    }
  };

  const toggleCase = (caseId: string) => {
    setExpandedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
    setExpandedStages([]); // Close all stages when switching cases
  };

  const toggleStage = (stageId: string) => {
    setExpandedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleAddClient = () => {
    if (!newClient.name) return;

    dataStore.addClient({
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      address: newClient.address,
      notes: newClient.notes,
    });

    setNewClient({ name: '', phone: '', email: '', address: '', notes: '' });
    setIsAddClientDialogOpen(false);
    loadData();
  };

  const handleEditClient = () => {
    if (!editingClient) return;

    dataStore.updateClient(editingClient.id, {
      name: editingClient.name,
      phone: editingClient.phone,
      email: editingClient.email,
      address: editingClient.address,
      notes: editingClient.notes,
    });

    setEditingClient(null);
    setIsEditClientDialogOpen(false);
    loadData();
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموكل؟')) {
      dataStore.deleteClient(clientId);
      loadData();
    }
  };

  const handleAddCase = () => {
    if (!selectedClient || !newCase.opponent || !newCase.title) return;

    dataStore.addCase({
      clientId: selectedClient.id,
      title: newCase.title,
      description: '',
      opponent: newCase.opponent,
      caseType: '',
      status: 'active',
    });

    setNewCase({ opponent: '', title: '' });
    setIsAddCaseDialogOpen(false);
    loadData();
  };

  const handleEditCase = () => {
    if (!editingCase) return;

    dataStore.updateCase(editingCase.id, {
      title: editingCase.title,
      opponent: editingCase.opponent,
    });

    setEditingCase(null);
    setIsEditCaseDialogOpen(false);
    loadData();
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      dataStore.deleteCase(caseId);
      loadData();
    }
  };

  const handleAddStage = () => {
    if (!selectedCase || !newStage.courtName || !newStage.caseNumber) return;

    dataStore.addStage({
      caseId: selectedCase.id,
      courtName: newStage.courtName,
      caseNumber: newStage.caseNumber,
      firstSessionDate: new Date(),
      status: 'active',
      notes: newStage.notes,
    });

    setNewStage({ courtName: '', caseNumber: '', notes: '' });
    setIsAddStageDialogOpen(false);
    loadData();
  };

  const handleEditStage = () => {
    if (!editingStage) return;

    dataStore.updateStage(editingStage.id, {
      courtName: editingStage.courtName,
      caseNumber: editingStage.caseNumber,
      notes: editingStage.notes,
    });

    setEditingStage(null);
    setIsEditStageDialogOpen(false);
    loadData();
  };

  const handleDeleteStage = (stageId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المرحلة؟')) {
      dataStore.deleteStage(stageId);
      loadData();
    }
  };

  const handleAddSession = () => {
    if (!selectedStage || !newSession.sessionDate) return;

    const client = clients.find(c => cases.find(case_ => case_.id === selectedStage.caseId)?.clientId === c.id);
    const case_ = cases.find(c => c.id === selectedStage.caseId);

    dataStore.addSession({
      stageId: selectedStage.id,
      courtName: selectedStage.courtName,
      caseNumber: selectedStage.caseNumber,
      sessionDate: new Date(newSession.sessionDate),
      clientName: client?.name || '',
      opponent: case_?.opponent || '',
      postponementReason: newSession.postponementReason,
      isTransferred: false,
    });

    setNewSession({ sessionDate: '', postponementReason: '' });
    setIsAddSessionDialogOpen(false);
    loadData();
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

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 min-h-screen space-y-4" dir="rtl">
        <Card className="p-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-right">الموكلين</CardTitle>
              <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة موكل
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة موكل جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-right">
                      <Label htmlFor="clientName" className="text-right">اسم الموكل *</Label>
                      <Input
                        id="clientName"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="اسم الموكل"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    <div className="text-right">
                      <Label htmlFor="clientPhone" className="text-right">رقم الهاتف</Label>
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
                      <Label htmlFor="clientEmail" className="text-right">البريد الإلكتروني</Label>
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
                      <Label htmlFor="clientAddress" className="text-right">العنوان</Label>
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
                      <Label htmlFor="clientNotes" className="text-right">ملاحظات</Label>
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
                {clients.map((client) => {
                  const clientCases = getClientCases(client.id);
                  const isClientExpanded = expandedClients.includes(client.id);
                  
                  return (
                    <div key={client.id} className="border rounded-lg overflow-hidden">
                      <Collapsible open={isClientExpanded} onOpenChange={() => toggleClient(client.id)}>
                        <CollapsibleTrigger className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isClientExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <User className="h-5 w-5 text-blue-600" />
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingClient(client);
                                    setIsEditClientDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClient(client.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-right">
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                              <div className="text-sm text-gray-600 space-y-1">
                                {client.phone && <div>الهاتف: {client.phone}</div>}
                                {client.email && <div>البريد: {client.email}</div>}
                                {client.address && <div>العنوان: {client.address}</div>}
                                <div>{clientCases.length} قضية</div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 space-y-4">
                            {/* Cases */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Dialog open={isAddCaseDialogOpen && selectedClient?.id === client.id} onOpenChange={setIsAddCaseDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="gap-2"
                                      onClick={() => setSelectedClient(client)}
                                    >
                                      <Plus className="h-4 w-4" />
                                      إضافة قضية
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md" dir="rtl">
                                    <DialogHeader>
                                      <DialogTitle className="text-right">إضافة قضية جديدة</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="text-right">
                                        <Label htmlFor="caseOpponent" className="text-right">الخصم *</Label>
                                        <Input
                                          id="caseOpponent"
                                          value={newCase.opponent}
                                          onChange={(e) => setNewCase({ ...newCase, opponent: e.target.value })}
                                          placeholder="اسم الخصم"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="caseTitle" className="text-right">موضوع القضية *</Label>
                                        <Input
                                          id="caseTitle"
                                          value={newCase.title}
                                          onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
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
                                <h4 className="font-semibold text-right">القضايا</h4>
                              </div>

                              {clientCases.length === 0 ? (
                                <p className="text-center text-gray-500">لا توجد قضايا</p>
                              ) : (
                                <div className="space-y-2">
                                  {clientCases.map((case_) => {
                                    const caseStages = getCaseStages(case_.id);
                                    const isCaseExpanded = expandedCases.includes(case_.id);
                                    
                                    return (
                                      <div key={case_.id} className="border rounded-md ml-4">
                                        <Collapsible open={isCaseExpanded} onOpenChange={() => toggleCase(case_.id)}>
                                          <CollapsibleTrigger className="w-full p-3 bg-blue-50 hover:bg-blue-100 transition-colors">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                {isCaseExpanded ? (
                                                  <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                  <ChevronRight className="h-4 w-4" />
                                                )}
                                                <Folder className="h-4 w-4 text-yellow-600" />
                                                <div className="flex gap-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingCase(case_);
                                                      setIsEditCaseDialogOpen(true);
                                                    }}
                                                  >
                                                    <Edit className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteCase(case_.id);
                                                    }}
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <h5 className="font-medium">{case_.title}</h5>
                                                <p className="text-sm text-gray-600">الخصم: {case_.opponent}</p>
                                              </div>
                                            </div>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <div className="p-3 space-y-3">
                                              {/* Stages */}
                                              <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <Dialog open={isAddStageDialogOpen && selectedCase?.id === case_.id} onOpenChange={setIsAddStageDialogOpen}>
                                                    <DialogTrigger asChild>
                                                      <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="gap-2"
                                                        onClick={() => setSelectedCase(case_)}
                                                      >
                                                        <Plus className="h-4 w-4" />
                                                        إضافة مرحلة
                                                      </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md" dir="rtl">
                                                      <DialogHeader>
                                                        <DialogTitle className="text-right">إضافة مرحلة جديدة</DialogTitle>
                                                      </DialogHeader>
                                                      <div className="space-y-4">
                                                        <div className="text-right">
                                                          <Label htmlFor="stageCourtName" className="text-right">المحكمة *</Label>
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
                                                          <Label htmlFor="stageCaseNumber" className="text-right">رقم الأساس *</Label>
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
                                                          <Label htmlFor="stageNotes" className="text-right">ملاحظات</Label>
                                                          <Textarea
                                                            id="stageNotes"
                                                            value={newStage.notes}
                                                            onChange={(e) => setNewStage({ ...newStage, notes: e.target.value })}
                                                            placeholder="ملاحظات (غير إلزامية)"
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
                                                  <h6 className="font-medium text-right">المراحل</h6>
                                                </div>

                                                {caseStages.length === 0 ? (
                                                  <p className="text-center text-gray-500 text-sm">لا توجد مراحل</p>
                                                ) : (
                                                  <div className="space-y-2">
                                                    {caseStages.map((stage) => {
                                                      const stageSessions = getStageSessions(stage.id);
                                                      const isStageExpanded = expandedStages.includes(stage.id);
                                                      
                                                      return (
                                                        <div key={stage.id} className="border rounded-sm ml-4">
                                                          <Collapsible open={isStageExpanded} onOpenChange={() => toggleStage(stage.id)}>
                                                            <CollapsibleTrigger className="w-full p-2 bg-green-50 hover:bg-green-100 transition-colors">
                                                              <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                  {isStageExpanded ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                  ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                  )}
                                                                  <FileText className="h-4 w-4 text-green-600" />
                                                                  <div className="flex gap-2">
                                                                    <Button
                                                                      variant="ghost"
                                                                      size="sm"
                                                                      onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingStage(stage);
                                                                        setIsEditStageDialogOpen(true);
                                                                      }}
                                                                    >
                                                                      <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                      variant="ghost"
                                                                      size="sm"
                                                                      onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteStage(stage.id);
                                                                      }}
                                                                    >
                                                                      <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                  </div>
                                                                </div>
                                                                <div className="text-right">
                                                                  <h6 className="font-medium text-sm">{stage.courtName} - {stage.caseNumber}</h6>
                                                                  {stage.notes && (
                                                                    <p className="text-xs text-gray-600">{stage.notes}</p>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                              <div className="p-3 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                  <Dialog open={isAddSessionDialogOpen && selectedStage?.id === stage.id} onOpenChange={setIsAddSessionDialogOpen}>
                                                                    <DialogTrigger asChild>
                                                                      <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        className="gap-2"
                                                                        onClick={() => setSelectedStage(stage)}
                                                                      >
                                                                        <Plus className="h-4 w-4" />
                                                                        إضافة جلسة
                                                                      </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-md" dir="rtl">
                                                                      <DialogHeader>
                                                                        <DialogTitle className="text-right">إضافة جلسة جديدة</DialogTitle>
                                                                      </DialogHeader>
                                                                      <div className="space-y-4">
                                                                        <div className="text-right">
                                                                          <Label htmlFor="sessionDate" className="text-right">الجلسة الأولى *</Label>
                                                                          <Input
                                                                            id="sessionDate"
                                                                            type="date"
                                                                            value={newSession.sessionDate}
                                                                            onChange={(e) => setNewSession({ ...newSession, sessionDate: e.target.value })}
                                                                            className="text-right"
                                                                            dir="rtl"
                                                                          />
                                                                        </div>
                                                                        <div className="text-right">
                                                                          <Label htmlFor="sessionReason" className="text-right">سبب التأجيل</Label>
                                                                          <Input
                                                                            id="sessionReason"
                                                                            value={newSession.postponementReason}
                                                                            onChange={(e) => setNewSession({ ...newSession, postponementReason: e.target.value })}
                                                                            placeholder="سبب التأجيل"
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
                                                                  <h6 className="font-medium text-xs text-right">الجلسات:</h6>
                                                                </div>
                                                                
                                                                {/* Stage Sessions */}
                                                                {stageSessions.length > 0 && (
                                                                  <div className="overflow-x-auto">
                                                                    <div className="min-w-[800px]">
                                                                      {stageSessions.map((session) => (
                                                                        <div key={session.id} className="border rounded-lg p-3 bg-white mb-2">
                                                                          <div className="grid grid-cols-5 gap-3 text-xs">
                                                                            <div className="text-right">
                                                                              <span className="font-bold block text-gray-700">تاريخ الجلسة</span>
                                                                              <span>{formatSyrianDate(session.sessionDate)}</span>
                                                                            </div>
                                                                            
                                                                            <div className="text-right">
                                                                              <span className="font-bold block text-gray-700">المحكمة</span>
                                                                              <div className="break-words">{session.courtName}</div>
                                                                              <div className="text-xs text-gray-600">{session.caseNumber}</div>
                                                                            </div>
                                                                            
                                                                            <div className="text-right">
                                                                              <span className="font-bold block text-gray-700">الموكل</span>
                                                                              <span className="break-words">{session.clientName}</span>
                                                                            </div>
                                                                            
                                                                            <div className="text-right">
                                                                              <span className="font-bold block text-gray-700">الخصم</span>
                                                                              <span className="break-words">{session.opponent}</span>
                                                                            </div>
                                                                            
                                                                            <div className="text-right">
                                                                              {session.nextSessionDate ? (
                                                                                <>
                                                                                  <span className="font-bold block text-gray-700">القادمة</span>
                                                                                  <span>{formatSyrianDate(session.nextSessionDate)}</span>
                                                                                  {session.nextPostponementReason && (
                                                                                    <div className="mt-1">
                                                                                      <span className="font-bold text-xs block text-gray-700">السبب القادم</span>
                                                                                      <span className="break-words">{session.nextPostponementReason}</span>
                                                                                    </div>
                                                                                  )}
                                                                                </>
                                                                              ) : (
                                                                                <>
                                                                                  <span className="font-bold block text-gray-700">سبب التأجيل</span>
                                                                                  <span className="break-words">{session.postponementReason || '-'}</span>
                                                                                </>
                                                                              )}
                                                                            </div>
                                                                          </div>
                                                                        </div>
                                                                      ))}
                                                                    </div>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </CollapsibleContent>
                                                          </Collapsible>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })}
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
            {editingClient && (
              <div className="space-y-4">
                <div className="text-right">
                  <Label htmlFor="editClientName" className="text-right">اسم الموكل *</Label>
                  <Input
                    id="editClientName"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    placeholder="اسم الموكل"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="editClientPhone" className="text-right">رقم الهاتف</Label>
                  <Input
                    id="editClientPhone"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="editClientEmail" className="text-right">البريد الإلكتروني</Label>
                  <Input
                    id="editClientEmail"
                    type="email"
                    value={editingClient.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="editClientAddress" className="text-right">العنوان</Label>
                  <Input
                    id="editClientAddress"
                    value={editingClient.address || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                    placeholder="العنوان"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="editClientNotes" className="text-right">ملاحظات</Label>
                  <Textarea
                    id="editClientNotes"
                    value={editingClient.notes || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <Button onClick={handleEditClient} className="w-full">
                  حفظ التعديلات
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Case Dialog */}
        <Dialog open={isEditCaseDialogOpen} onOpenChange={setIsEditCaseDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل بيانات القضية</DialogTitle>
            </DialogHeader>
            {editingCase && (
              <div className="space-y-4">
                <div className="text-right">
                  <Label htmlFor="editCaseOpponent" className="text-right">الخصم *</Label>
                  <Input
                    id="editCaseOpponent"
                    value={editingCase.opponent}
                    onChange={(e) => setEditingCase({ ...editingCase, opponent: e.target.value })}
                    placeholder="اسم الخصم"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="editCaseTitle" className="text-right">موضوع القضية *</Label>
                  <Input
                    id="editCaseTitle"
                    value={editingCase.title}
                    onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                    placeholder="موضوع القضية"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <Button onClick={handleEditCase} className="w-full">
                  حفظ التعديلات
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Stage Dialog */}
        <Dialog open={isEditStageDialogOpen} onOpenChange={setIsEditStageDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل بيانات المرحلة</DialogTitle>
            </DialogHeader>
            {editingStage && (
              <div className="space-y-4">
                <div className="text-right">
                  <Label htmlFor="editStageCourtName" className="text-right">المحكمة *</Label>
                  <Input
                    id="editStageCourtName"
                    value={editingStage.courtName}
                    onChange={(e) => setEditingStage({ ...editingStage, courtName: e.target.value })}
                    placeholder="اسم المحكمة"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="editStageCaseNumber" className="text-right">رقم الأساس *</Label>
                  <Input
                    id="editStageCaseNumber"
                    value={editingStage.caseNumber}
                    onChange={(e) => setEditingStage({ ...editingStage, caseNumber: e.target.value })}
                    placeholder="رقم الأساس"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="editStageNotes" className="text-right">ملاحظات</Label>
                  <Textarea
                    id="editStageNotes"
                    value={editingStage.notes || ''}
                    onChange={(e) => setEditingStage({ ...editingStage, notes: e.target.value })}
                    placeholder="ملاحظات (غير إلزامية)"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <Button onClick={handleEditStage} className="w-full">
                  حفظ التعديلات
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Clients;
