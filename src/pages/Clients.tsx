import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, User, Folder, FileText, Plus, Edit } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { dataStore } from '@/store/dataStore';
import { Client, Case, Stage, Session } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { TasksTable } from '@/components/TasksTable';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState([]);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [expandedCases, setExpandedCases] = useState<string[]>([]);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    courtName: '',
    caseNumber: '',
    status: 'active' as 'active' | 'closed' | 'pending',
  });
  const [newStage, setNewStage] = useState({
    title: '',
    description: '',
    status: 'active' as 'active' | 'completed' | 'pending',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getStages());
    setSessions(dataStore.getSessions());
    setTasks(dataStore.getTasks());
  };

  const toggleClient = (clientId: string) => {
    // Close all other clients when opening a new one
    if (expandedClients.includes(clientId)) {
      setExpandedClients([]);
      setExpandedCases([]); // Also close all cases
    } else {
      setExpandedClients([clientId]);
      setExpandedCases([]); // Close all cases when switching clients
    }
  };

  const toggleCase = (caseId: string) => {
    setExpandedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleAddClient = () => {
    if (!newClient.name) {
      return;
    }

    dataStore.addClient({
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      address: newClient.address,
      notes: newClient.notes,
    });

    setNewClient({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setIsAddClientDialogOpen(false);
    loadData();
  };

  const handleAddCase = () => {
    if (!selectedClient || !newCase.title || !newCase.courtName || !newCase.caseNumber) {
      return;
    }

    dataStore.addCase({
      clientId: selectedClient.id,
      title: newCase.title,
      description: newCase.description,
      courtName: newCase.courtName,
      caseNumber: newCase.caseNumber,
      status: newCase.status,
    });

    setNewCase({
      title: '',
      description: '',
      courtName: '',
      caseNumber: '',
      status: 'active',
    });
    setIsAddCaseDialogOpen(false);
    loadData();
  };

  const handleAddStage = () => {
    if (!selectedCase || !newStage.title) {
      return;
    }

    dataStore.addStage({
      caseId: selectedCase.id,
      title: newStage.title,
      description: newStage.description,
      status: newStage.status,
    });

    setNewStage({
      title: '',
      description: '',
      status: 'active',
    });
    setIsAddStageDialogOpen(false);
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
                            </div>
                            <div className="text-right">
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                              <p className="text-sm text-gray-600">
                                {clientCases.length} قضية
                              </p>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 space-y-4">
                            {/* Client Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                              {client.phone && (
                                <div>
                                  <span className="font-semibold">الهاتف: </span>
                                  <span>{client.phone}</span>
                                </div>
                              )}
                              {client.email && (
                                <div>
                                  <span className="font-semibold">البريد: </span>
                                  <span>{client.email}</span>
                                </div>
                              )}
                              {client.address && (
                                <div className="md:col-span-2">
                                  <span className="font-semibold">العنوان: </span>
                                  <span>{client.address}</span>
                                </div>
                              )}
                              {client.notes && (
                                <div className="md:col-span-2">
                                  <span className="font-semibold">ملاحظات: </span>
                                  <span>{client.notes}</span>
                                </div>
                              )}
                            </div>

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
                                        <Label htmlFor="caseTitle" className="text-right">عنوان القضية *</Label>
                                        <Input
                                          id="caseTitle"
                                          value={newCase.title}
                                          onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                                          placeholder="عنوان القضية"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="caseDescription" className="text-right">الوصف</Label>
                                        <Textarea
                                          id="caseDescription"
                                          value={newCase.description}
                                          onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                          placeholder="وصف القضية"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="caseCourtName" className="text-right">المحكمة *</Label>
                                        <Input
                                          id="caseCourtName"
                                          value={newCase.courtName}
                                          onChange={(e) => setNewCase({ ...newCase, courtName: e.target.value })}
                                          placeholder="اسم المحكمة"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="caseNumber" className="text-right">رقم القضية *</Label>
                                        <Input
                                          id="caseNumber"
                                          value={newCase.caseNumber}
                                          onChange={(e) => setNewCase({ ...newCase, caseNumber: e.target.value })}
                                          placeholder="رقم القضية"
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
                                              </div>
                                              <div className="text-right">
                                                <h5 className="font-medium">{case_.title}</h5>
                                                <p className="text-sm text-gray-600">
                                                  {case_.courtName} - {case_.caseNumber}
                                                </p>
                                              </div>
                                            </div>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <div className="p-3 space-y-3">
                                              {/* Case Details */}
                                              {case_.description && (
                                                <div className="text-right text-sm">
                                                  <span className="font-semibold">الوصف: </span> 
                                                  <span>{case_.description}</span>
                                                </div>
                                              )}

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
                                                          <Label htmlFor="stageTitle" className="text-right">عنوان المرحلة *</Label>
                                                          <Input
                                                            id="stageTitle"
                                                            value={newStage.title}
                                                            onChange={(e) => setNewStage({ ...newStage, title: e.target.value })}
                                                            placeholder="عنوان المرحلة"
                                                            className="text-right"
                                                            dir="rtl"
                                                          />
                                                        </div>
                                                        <div className="text-right">
                                                          <Label htmlFor="stageDescription" className="text-right">الوصف</Label>
                                                          <Textarea
                                                            id="stageDescription"
                                                            value={newStage.description}
                                                            onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                                                            placeholder="وصف المرحلة"
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
                                                      
                                                      return (
                                                        <div key={stage.id} className="border rounded-sm ml-4 p-2 bg-green-50">
                                                          <div className="flex items-center justify-between mb-2">
                                                            <FileText className="h-4 w-4 text-green-600" />
                                                            <div className="text-right">
                                                              <h6 className="font-medium text-sm">{stage.title}</h6>
                                                              {stage.description && (
                                                                <p className="text-xs text-gray-600">{stage.description}</p>
                                                              )}
                                                            </div>
                                                          </div>
                                                          
                                                          {/* Stage Sessions */}
                                                          {stageSessions.length > 0 && (
                                                            <div className="mt-3 space-y-2">
                                                              <h6 className="font-medium text-xs text-right">الجلسات:</h6>
                                                              {stageSessions.map((session) => (
                                                                <div key={session.id} className="border rounded-lg p-3 bg-white">
                                                                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 text-xs">
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
                                                          )}
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

        {/* Tasks Table */}
        <TasksTable
          tasks={tasks}
          onTaskUpdate={loadData}
        />

        {/* Add Client Dialog */}
        <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
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

        {/* Add Case Dialog */}
        <Dialog open={isAddCaseDialogOpen} onOpenChange={setIsAddCaseDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة قضية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="caseTitle" className="text-right">عنوان القضية *</Label>
                <Input
                  id="caseTitle"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  placeholder="عنوان القضية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="caseDescription" className="text-right">الوصف</Label>
                <Textarea
                  id="caseDescription"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  placeholder="وصف القضية"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="caseCourtName" className="text-right">المحكمة *</Label>
                <Input
                  id="caseCourtName"
                  value={newCase.courtName}
                  onChange={(e) => setNewCase({ ...newCase, courtName: e.target.value })}
                  placeholder="اسم المحكمة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="caseNumber" className="text-right">رقم القضية *</Label>
                <Input
                  id="caseNumber"
                  value={newCase.caseNumber}
                  onChange={(e) => setNewCase({ ...newCase, caseNumber: e.target.value })}
                  placeholder="رقم القضية"
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

        {/* Add Stage Dialog */}
        <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة مرحلة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="stageTitle" className="text-right">عنوان المرحلة *</Label>
                <Input
                  id="stageTitle"
                  value={newStage.title}
                  onChange={(e) => setNewStage({ ...newStage, title: e.target.value })}
                  placeholder="عنوان المرحلة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="stageDescription" className="text-right">الوصف</Label>
                <Textarea
                  id="stageDescription"
                  value={newStage.description}
                  onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                  placeholder="وصف المرحلة"
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
      </div>
    </Layout>
  );
};

export default Clients;
