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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Edit, Trash2, Eye, Users, FileText, Gavel } from 'lucide-react';
import { formatSyrianDate } from '@/utils/dateUtils';
import { Client, Case, CaseStage, Session } from '@/types';
import { dataStore } from '@/store/dataStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = useState(false);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
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
    description: '',
    opponent: '',
    subject: '',
    status: 'active' as const,
  });
  const [newStage, setNewStage] = useState({
    caseId: '',
    courtName: '',
    caseNumber: '',
    stageName: '',
    firstSessionDate: undefined as Date | undefined,
    status: 'active' as const,
    notes: '',
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(dataStore.getClients());
    setCases(dataStore.getCases());
    setStages(dataStore.getStages());
    setSessions(dataStore.getSessions());
  };

  const handleAddClient = () => {
    if (!newClient.name) return;
    
    dataStore.addClient(newClient);
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
    if (!newCase.clientId || !newCase.description || !newCase.opponent || !newCase.subject) return;
    
    dataStore.addCase(newCase);
    setNewCase({
      clientId: '',
      description: '',
      opponent: '',
      subject: '',
      status: 'active',
    });
    setIsAddCaseDialogOpen(false);
    loadData();
  };

  const handleAddStage = () => {
    if (!newStage.caseId || !newStage.courtName || !newStage.caseNumber || !newStage.stageName || !newStage.firstSessionDate) return;
    
    dataStore.addStage(newStage);
    setNewStage({
      caseId: '',
      courtName: '',
      caseNumber: '',
      stageName: '',
      firstSessionDate: undefined,
      status: 'active',
      notes: '',
    });
    setIsAddStageDialogOpen(false);
    loadData();
  };

  const handleAddSession = () => {
    if (!newSession.stageId || !newSession.sessionDate || !newSession.clientName || !newSession.opponent) return;

    dataStore.addSession({
      stageId: newSession.stageId,
      courtName: newSession.courtName,
      caseNumber: newSession.caseNumber,
      sessionDate: newSession.sessionDate,
      clientName: newSession.clientName,
      opponent: newSession.opponent,
      postponementReason: newSession.postponementReason,
      isTransferred: false,
      isResolved: false,
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

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getCaseStages = (caseId: string) => {
    return stages.filter(stage => stage.caseId === caseId);
  };

  const getStageSessions = (stageId: string) => {
    return sessions.filter(session => session.stageId === stageId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-right">إدارة العملاء والقضايا</h1>
          <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
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
                  <Label htmlFor="name" className="text-right">الاسم *</Label>
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

        {/* Client List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Users className="h-5 w-5" />
              قائمة العملاء ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا يوجد عملاء مسجلين بعد
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {clients.map((client) => {
                  const clientCases = getClientCases(client.id);
                  return (
                    <AccordionItem key={client.id} value={client.id}>
                      <AccordionTrigger className="text-right">
                        <div className="flex items-center justify-between w-full ml-4">
                          <div className="text-right">
                            <div className="font-semibold">{client.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {client.phone && `${client.phone} • `}
                              {clientCases.length} قضية
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {clientCases.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {/* Client Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="text-right">
                              <strong>الهاتف:</strong> {client.phone || 'غير محدد'}
                            </div>
                            <div className="text-right">
                              <strong>البريد:</strong> {client.email || 'غير محدد'}
                            </div>
                            <div className="text-right">
                              <strong>العنوان:</strong> {client.address || 'غير محدد'}
                            </div>
                            <div className="text-right">
                              <strong>الرقم الوطني:</strong> {client.nationalId || 'غير محدد'}
                            </div>
                            {client.notes && (
                              <div className="text-right md:col-span-2">
                                <strong>ملاحظات:</strong> {client.notes}
                              </div>
                            )}
                          </div>

                          {/* Add Case Button */}
                          <div className="flex justify-start">
                            <Dialog open={isAddCaseDialogOpen} onOpenChange={setIsAddCaseDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2"
                                  onClick={() => {
                                    setSelectedClient(client.id);
                                    setNewCase({ ...newCase, clientId: client.id });
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                  إضافة قضية جديدة
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md" dir="rtl">
                                <DialogHeader>
                                  <DialogTitle className="text-right">إضافة قضية جديدة</DialogTitle>
                                  <p className="text-sm text-muted-foreground text-right">
                                    للعميل: {client.name}
                                  </p>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="text-right">
                                    <Label htmlFor="description" className="text-right">وصف القضية *</Label>
                                    <Textarea
                                      id="description"
                                      value={newCase.description}
                                      onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                      placeholder="وصف تفصيلي للقضية"
                                      className="text-right"
                                      dir="rtl"
                                    />
                                  </div>
                                  <div className="text-right">
                                    <Label htmlFor="opponent" className="text-right">الطرف المقابل *</Label>
                                    <Input
                                      id="opponent"
                                      value={newCase.opponent}
                                      onChange={(e) => setNewCase({ ...newCase, opponent: e.target.value })}
                                      placeholder="اسم الطرف المقابل"
                                      className="text-right"
                                      dir="rtl"
                                    />
                                  </div>
                                  <div className="text-right">
                                    <Label htmlFor="subject" className="text-right">موضوع القضية *</Label>
                                    <Input
                                      id="subject"
                                      value={newCase.subject}
                                      onChange={(e) => setNewCase({ ...newCase, subject: e.target.value })}
                                      placeholder="موضوع القضية"
                                      className="text-right"
                                      dir="rtl"
                                    />
                                  </div>
                                  <div className="text-right">
                                    <Label htmlFor="status" className="text-right">حالة القضية</Label>
                                    <Select value={newCase.status} onValueChange={(value: 'active' | 'closed' | 'pending') => setNewCase({ ...newCase, status: value })}>
                                      <SelectTrigger className="text-right" dir="rtl">
                                        <SelectValue placeholder="اختر حالة القضية" />
                                      </SelectTrigger>
                                      <SelectContent dir="rtl">
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
                          </div>

                          {/* Cases List */}
                          {clientCases.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-right flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                القضايا ({clientCases.length})
                              </h4>
                              <Accordion type="single" collapsible className="w-full">
                                {clientCases.map((case_) => {
                                  const caseStages = getCaseStages(case_.id);
                                  return (
                                    <AccordionItem key={case_.id} value={case_.id}>
                                      <AccordionTrigger className="text-right">
                                        <div className="flex items-center justify-between w-full ml-4">
                                          <div className="text-right">
                                            <div className="font-medium">{case_.description}</div>
                                            <div className="text-sm text-muted-foreground">
                                              ضد: {case_.opponent} • {caseStages.length} مرحلة
                                            </div>
                                          </div>
                                          <Badge className={getStatusBadgeColor(case_.status)}>
                                            {case_.status === 'active' ? 'نشطة' : case_.status === 'closed' ? 'مغلقة' : 'معلقة'}
                                          </Badge>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="space-y-4 pt-4">
                                          {/* Case Details */}
                                          <div className="p-4 bg-muted/30 rounded-lg text-right">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                              <div><strong>موضوع القضية:</strong> {case_.subject}</div>
                                              <div><strong>الطرف المقابل:</strong> {case_.opponent}</div>
                                            </div>
                                            <div className="mt-2">
                                              <strong>الوصف:</strong> {case_.description}
                                            </div>
                                          </div>

                                          {/* Add Stage Button */}
                                          <div className="flex justify-start">
                                            <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
                                              <DialogTrigger asChild>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  className="gap-2"
                                                  onClick={() => {
                                                    setSelectedCase(case_.id);
                                                    setNewStage({ ...newStage, caseId: case_.id });
                                                  }}
                                                >
                                                  <Plus className="h-4 w-4" />
                                                  إضافة مرحلة جديدة
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="max-w-md" dir="rtl">
                                                <DialogHeader>
                                                  <DialogTitle className="text-right">إضافة مرحلة جديدة</DialogTitle>
                                                </DialogHeader>
                                                {/* ... keep existing stage dialog content */}
                                              </DialogContent>
                                            </Dialog>
                                          </div>

                                          {/* Stages List */}
                                          {caseStages.length > 0 && (
                                            <div className="space-y-3">
                                              <h5 className="font-medium text-right flex items-center gap-2">
                                                <Gavel className="h-4 w-4" />
                                                المراحل ({caseStages.length})
                                              </h5>
                                              {caseStages.map((stage) => {
                                                const stageSessions = getStageSessions(stage.id);
                                                return (
                                                  <div key={stage.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                      <div className="text-right">
                                                        <div className="font-medium">{stage.stageName}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                          {stage.courtName} • {stage.caseNumber}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                          تاريخ الجلسة الأولى: {formatSyrianDate(stage.firstSessionDate)}
                                                        </div>
                                                      </div>
                                                      <Badge className={getStatusBadgeColor(stage.status)}>
                                                        {stage.status === 'active' ? 'نشطة' : 'مكتملة'}
                                                      </Badge>
                                                    </div>

                                                    {stage.notes && (
                                                      <div className="text-sm text-muted-foreground text-right">
                                                        <strong>ملاحظات:</strong> {stage.notes}
                                                      </div>
                                                    )}

                                                    {/* Add Session Button */}
                                                    <div className="flex justify-start">
                                                      <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
                                                        <DialogTrigger asChild>
                                                          <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="gap-2"
                                                            onClick={() => {
                                                              setSelectedStage(stage.id);
                                                              setNewSession({ 
                                                                ...newSession, 
                                                                stageId: stage.id,
                                                                courtName: stage.courtName,
                                                                caseNumber: stage.caseNumber,
                                                                clientName: client.name,
                                                                opponent: case_.opponent,
                                                              });
                                                            }}
                                                          >
                                                            <Plus className="h-4 w-4" />
                                                            إضافة جلسة
                                                          </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-md" dir="rtl">
                                                          <DialogHeader>
                                                            <DialogTitle className="text-right">إضافة جلسة جديدة</DialogTitle>
                                                          </DialogHeader>
                                                          {/* ... keep existing session dialog content */}
                                                        </DialogContent>
                                                      </Dialog>
                                                    </div>

                                                    {/* Sessions List */}
                                                    {stageSessions.length > 0 && (
                                                      <div className="space-y-2">
                                                        <h6 className="text-sm font-medium text-right">الجلسات ({stageSessions.length})</h6>
                                                        {stageSessions.map((session) => (
                                                          <div key={session.id} className="bg-muted/30 rounded p-3 text-right text-sm">
                                                            <div className="font-medium">
                                                              {formatSyrianDate(session.sessionDate)}
                                                            </div>
                                                            {session.postponementReason && (
                                                              <div className="text-muted-foreground">
                                                                سبب التأجيل: {session.postponementReason}
                                                              </div>
                                                            )}
                                                            {session.nextSessionDate && (
                                                              <div className="text-muted-foreground">
                                                                الجلسة القادمة: {formatSyrianDate(session.nextSessionDate)}
                                                              </div>
                                                            )}
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
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}
                              </Accordion>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Clients;
