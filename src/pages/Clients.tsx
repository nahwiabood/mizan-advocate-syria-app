
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ChevronDown, ChevronLeft, Plus, Search, User, FileText, Folder, Calendar as CalendarLucide } from 'lucide-react';
import { Client, Case, CaseStage, Session } from '@/types';
import { dataStore } from '@/store/dataStore';
import { formatSyrianDate } from '@/utils/dateUtils';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<{
    clients: Set<string>;
    cases: Set<string>;
    stages: Set<string>;
  }>({
    clients: new Set(),
    cases: new Set(),
    stages: new Set(),
  });

  // Dialog states
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);

  // Form states
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    notes: '',
  });

  const [newCase, setNewCase] = useState({
    clientId: '',
    title: '',
    description: '',
    opponent: '',
    status: 'active' as const,
  });

  const [newStage, setNewStage] = useState({
    caseId: '',
    courtName: '',
    caseNumber: '',
    firstSessionDate: undefined as Date | undefined,
    status: 'active' as const,
  });

  const [newSession, setNewSession] = useState({
    stageId: '',
    courtName: '',
    caseNumber: '',
    sessionDate: undefined as Date | undefined,
    clientName: '',
    opponent: '',
    postponementReason: '',
  });

  // Selected items for adding related records
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedStage, setSelectedStage] = useState<CaseStage | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getStages());
    setSessions(dataStore.getSessions());
  };

  const toggleNode = (type: 'clients' | 'cases' | 'stages', id: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { ...prev, [type]: newSet };
    });
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClient = () => {
    if (!newClient.name || !newClient.phone) return;

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

  const handleAddCase = () => {
    if (!newCase.title || !newCase.clientId) return;

    dataStore.addCase({
      ...newCase,
    });

    setNewCase({
      clientId: '',
      title: '',
      description: '',
      opponent: '',
      status: 'active',
    });
    setIsAddCaseDialogOpen(false);
    loadData();
  };

  const handleAddStage = () => {
    if (!newStage.courtName || !newStage.caseNumber || !newStage.firstSessionDate) return;

    dataStore.addStage({
      ...newStage,
    });

    setNewStage({
      caseId: '',
      courtName: '',
      caseNumber: '',
      firstSessionDate: undefined,
      status: 'active',
    });
    setIsAddStageDialogOpen(false);
    loadData();
  };

  const handleAddSession = () => {
    if (!newSession.courtName || !newSession.caseNumber || !newSession.sessionDate) return;

    dataStore.addSession({
      ...newSession,
      isTransferred: false,
    });

    setNewSession({
      stageId: '',
      courtName: '',
      caseNumber: '',
      sessionDate: undefined,
      clientName: '',
      opponent: '',
      postponementReason: '',
    });
    setIsAddSessionDialogOpen(false);
    loadData();
  };

  const openAddCaseDialog = (client: Client) => {
    setSelectedClient(client);
    setNewCase({
      ...newCase,
      clientId: client.id,
    });
    setIsAddCaseDialogOpen(true);
  };

  const openAddStageDialog = (case_: Case) => {
    setSelectedCase(case_);
    setNewStage({
      ...newStage,
      caseId: case_.id,
    });
    setIsAddStageDialogOpen(true);
  };

  const openAddSessionDialog = (stage: CaseStage) => {
    const case_ = cases.find(c => c.id === stage.caseId);
    const client = case_ ? clients.find(c => c.id === case_.clientId) : null;

    setSelectedStage(stage);
    setNewSession({
      ...newSession,
      stageId: stage.id,
      courtName: stage.courtName,
      caseNumber: stage.caseNumber,
      clientName: client ? client.name : '',
      opponent: case_ ? case_.opponent : '',
    });
    setIsAddSessionDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 min-h-screen">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-2xl">الموكلين</CardTitle>
              <div className="flex w-full md:w-auto gap-4">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="بحث عن موكل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-2 pr-8"
                  />
                </div>
                <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة موكل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>إضافة موكل جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="clientName">اسم الموكل</Label>
                        <Input
                          id="clientName"
                          value={newClient.name}
                          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                          placeholder="أدخل اسم الموكل"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientPhone">رقم الهاتف</Label>
                        <Input
                          id="clientPhone"
                          value={newClient.phone}
                          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                          placeholder="أدخل رقم الهاتف"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientEmail">البريد الإلكتروني</Label>
                        <Input
                          id="clientEmail"
                          value={newClient.email}
                          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                          placeholder="أدخل البريد الإلكتروني (اختياري)"
                          type="email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientAddress">العنوان</Label>
                        <Textarea
                          id="clientAddress"
                          value={newClient.address}
                          onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                          placeholder="أدخل العنوان (اختياري)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientNationalId">الرقم الوطني</Label>
                        <Input
                          id="clientNationalId"
                          value={newClient.nationalId}
                          onChange={(e) => setNewClient({ ...newClient, nationalId: e.target.value })}
                          placeholder="أدخل الرقم الوطني (اختياري)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientNotes">ملاحظات</Label>
                        <Textarea
                          id="clientNotes"
                          value={newClient.notes}
                          onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                          placeholder="أدخل ملاحظات إضافية (اختياري)"
                        />
                      </div>
                      <Button onClick={handleAddClient} className="w-full">
                        إضافة الموكل
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا يوجد موكلين. قم بإضافة موكل جديد.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => {
                  const isClientExpanded = expandedNodes.clients.has(client.id);
                  const clientCases = cases.filter(case_ => case_.clientId === client.id);

                  return (
                    <div key={client.id} className="border rounded-lg">
                      <div 
                        className="p-4 cursor-pointer flex items-center justify-between bg-muted/30 hover:bg-muted"
                        onClick={() => toggleNode('clients', client.id)}
                      >
                        <div className="flex items-center">
                          {isClientExpanded ? (
                            <ChevronDown className="h-5 w-5 ml-2 text-muted-foreground" />
                          ) : (
                            <ChevronLeft className="h-5 w-5 ml-2 text-muted-foreground" />
                          )}
                          <User className="h-5 w-5 ml-2 text-blue-600" />
                          <div className="mr-2">
                            <span className="font-medium text-lg">{client.name}</span>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              <span>هاتف: {client.phone}</span>
                              {client.email && <span>| {client.email}</span>}
                              {client.nationalId && <span>| رقم وطني: {client.nationalId}</span>}
                              {client.address && <span>| {client.address}</span>}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddCaseDialog(client);
                          }}
                        >
                          <Plus className="h-4 w-4 ml-1" />
                          إضافة قضية
                        </Button>
                      </div>

                      {isClientExpanded && (
                        <div className="p-4 border-t">
                          {client.notes && (
                            <div className="mb-4">
                              <span className="text-sm text-muted-foreground">ملاحظات:</span>
                              <p>{client.notes}</p>
                            </div>
                          )}

                          <div className="mt-4">
                            <h3 className="font-medium mb-2">القضايا:</h3>
                            
                            {clientCases.length === 0 ? (
                              <p className="text-muted-foreground text-sm">لا توجد قضايا لهذا الموكل.</p>
                            ) : (
                              <div className="space-y-2 pr-6">
                                {clientCases.map((case_) => {
                                  const isCaseExpanded = expandedNodes.cases.has(case_.id);
                                  const caseStages = stages.filter(stage => stage.caseId === case_.id);

                                  return (
                                    <div key={case_.id} className="border rounded-lg">
                                      <div 
                                        className="p-3 cursor-pointer flex items-center justify-between bg-muted/20 hover:bg-muted"
                                        onClick={() => toggleNode('cases', case_.id)}
                                      >
                                        <div className="flex items-center">
                                          {isCaseExpanded ? (
                                            <ChevronDown className="h-5 w-5 ml-2 text-muted-foreground" />
                                          ) : (
                                            <ChevronLeft className="h-5 w-5 ml-2 text-muted-foreground" />
                                          )}
                                          <FileText className="h-5 w-5 ml-2 text-green-600" />
                                          <div className="mr-2">
                                            <span className="font-medium">{case_.title}</span>
                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                              <span>الخصم: {case_.opponent}</span>
                                              <span>| الحالة: {case_.status === 'active' ? 'نشط' : case_.status === 'closed' ? 'مغلق' : 'معلق'}</span>
                                              {case_.description && <span>| {case_.description}</span>}
                                            </div>
                                          </div>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openAddStageDialog(case_);
                                          }}
                                        >
                                          <Plus className="h-4 w-4 ml-1" />
                                          إضافة مرحلة
                                        </Button>
                                      </div>

                                      {isCaseExpanded && (
                                        <div className="p-3 border-t">
                                          <div className="mt-4">
                                            <h4 className="font-medium mb-2">المراحل:</h4>
                                            
                                            {caseStages.length === 0 ? (
                                              <p className="text-muted-foreground text-sm">لا توجد مراحل لهذه القضية.</p>
                                            ) : (
                                              <div className="space-y-2 pr-6">
                                                {caseStages.map((stage) => {
                                                  const isStageExpanded = expandedNodes.stages.has(stage.id);
                                                  const stageSessions = sessions.filter(session => session.stageId === stage.id);

                                                  return (
                                                    <div key={stage.id} className="border rounded-lg">
                                                      <div 
                                                        className="p-3 cursor-pointer flex items-center justify-between bg-muted/10 hover:bg-muted"
                                                        onClick={() => toggleNode('stages', stage.id)}
                                                      >
                                                        <div className="flex items-center">
                                                          {isStageExpanded ? (
                                                            <ChevronDown className="h-5 w-5 ml-2 text-muted-foreground" />
                                                          ) : (
                                                            <ChevronLeft className="h-5 w-5 ml-2 text-muted-foreground" />
                                                          )}
                                                          <Folder className="h-5 w-5 ml-2 text-orange-600" />
                                                          <div className="mr-2">
                                                            <span className="font-medium">{stage.courtName} - {stage.caseNumber}</span>
                                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                              <span>الجلسة الأولى: {formatSyrianDate(stage.firstSessionDate)}</span>
                                                              <span>| الحالة: {stage.status === 'active' ? 'نشط' : 'مكتمل'}</span>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <Button 
                                                          size="sm" 
                                                          variant="outline"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            openAddSessionDialog(stage);
                                                          }}
                                                        >
                                                          <Plus className="h-4 w-4 ml-1" />
                                                          إضافة جلسة
                                                        </Button>
                                                      </div>

                                                      {isStageExpanded && (
                                                        <div className="p-3 border-t">
                                                          <div className="mt-4">
                                                            <h5 className="font-medium mb-2">الجلسات:</h5>
                                                            
                                                            {stageSessions.length === 0 ? (
                                                              <p className="text-muted-foreground text-sm">لا توجد جلسات لهذه المرحلة.</p>
                                                            ) : (
                                                              <div className="space-y-2">
                                                                {stageSessions.map((session) => (
                                                                  <div key={session.id} className="border rounded-lg p-3">
                                                                    <div className="flex items-center mb-2">
                                                                      <CalendarLucide className="h-4 w-4 ml-1 text-purple-600" />
                                                                      <span className="text-sm font-medium">جلسة {formatSyrianDate(session.sessionDate)}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                      {session.postponementReason && (
                                                                        <div>
                                                                          <span className="text-sm text-muted-foreground">سبب التأجيل:</span>
                                                                          <p>{session.postponementReason}</p>
                                                                        </div>
                                                                      )}
                                                                      {session.nextSessionDate && (
                                                                        <>
                                                                          <div>
                                                                            <span className="text-sm text-muted-foreground">الجلسة القادمة:</span>
                                                                            <p>{formatSyrianDate(session.nextSessionDate)}</p>
                                                                          </div>
                                                                          {session.nextPostponementReason && (
                                                                            <div>
                                                                              <span className="text-sm text-muted-foreground">سبب التأجيل القادم:</span>
                                                                              <p>{session.nextPostponementReason}</p>
                                                                            </div>
                                                                          )}
                                                                        </>
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          {/* Add Case Dialog */}
          <Dialog open={isAddCaseDialogOpen} onOpenChange={setIsAddCaseDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة قضية جديدة لـ {selectedClient?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="caseTitle">عنوان القضية</Label>
                  <Input
                    id="caseTitle"
                    value={newCase.title}
                    onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                    placeholder="أدخل عنوان القضية"
                  />
                </div>
                <div>
                  <Label htmlFor="caseDescription">وصف القضية</Label>
                  <Textarea
                    id="caseDescription"
                    value={newCase.description}
                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                    placeholder="أدخل وصف القضية"
                  />
                </div>
                <div>
                  <Label htmlFor="caseOpponent">الخصم</Label>
                  <Input
                    id="caseOpponent"
                    value={newCase.opponent}
                    onChange={(e) => setNewCase({ ...newCase, opponent: e.target.value })}
                    placeholder="أدخل اسم الخصم"
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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة مرحلة جديدة لقضية {selectedCase?.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stageCourtName">المحكمة</Label>
                  <Input
                    id="stageCourtName"
                    value={newStage.courtName}
                    onChange={(e) => setNewStage({ ...newStage, courtName: e.target.value })}
                    placeholder="أدخل اسم المحكمة"
                  />
                </div>
                <div>
                  <Label htmlFor="stageCaseNumber">رقم الأساس</Label>
                  <Input
                    id="stageCaseNumber"
                    value={newStage.caseNumber}
                    onChange={(e) => setNewStage({ ...newStage, caseNumber: e.target.value })}
                    placeholder="أدخل رقم الأساس"
                  />
                </div>
                <div>
                  <Label>تاريخ الجلسة الأولى</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right font-normal",
                          !newStage.firstSessionDate && "text-muted-foreground"
                        )}
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleAddStage} className="w-full">
                  إضافة المرحلة
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Session Dialog */}
          <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة جلسة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sessionCourtName">المحكمة</Label>
                  <Input
                    id="sessionCourtName"
                    value={newSession.courtName}
                    onChange={(e) => setNewSession({ ...newSession, courtName: e.target.value })}
                    placeholder="أدخل اسم المحكمة"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionCaseNumber">رقم الأساس</Label>
                  <Input
                    id="sessionCaseNumber"
                    value={newSession.caseNumber}
                    onChange={(e) => setNewSession({ ...newSession, caseNumber: e.target.value })}
                    placeholder="أدخل رقم الأساس"
                  />
                </div>
                <div>
                  <Label>تاريخ الجلسة</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right font-normal",
                          !newSession.sessionDate && "text-muted-foreground"
                        )}
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="sessionClientName">الموكل</Label>
                  <Input
                    id="sessionClientName"
                    value={newSession.clientName}
                    onChange={(e) => setNewSession({ ...newSession, clientName: e.target.value })}
                    placeholder="أدخل اسم الموكل"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionOpponent">الخصم</Label>
                  <Input
                    id="sessionOpponent"
                    value={newSession.opponent}
                    onChange={(e) => setNewSession({ ...newSession, opponent: e.target.value })}
                    placeholder="أدخل اسم الخصم"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionPostponementReason">سبب التأجيل</Label>
                  <Textarea
                    id="sessionPostponementReason"
                    value={newSession.postponementReason}
                    onChange={(e) => setNewSession({ ...newSession, postponementReason: e.target.value })}
                    placeholder="أدخل سبب التأجيل (اختياري)"
                  />
                </div>
                <Button onClick={handleAddSession} className="w-full">
                  إضافة الجلسة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </Layout>
  );
};

export default Clients;
