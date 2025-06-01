import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Plus, CalendarIcon, Edit, Trash2, Search } from 'lucide-react';
import { Client, Case, CaseStage, Session } from '@/types';
import { dataStore } from '@/store/dataStore';
import { formatSyrianDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedStage, setSelectedStage] = useState<CaseStage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  // Form data
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    notes: '',
  });

  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    opponent: '',
    subject: '',
    caseType: '',
    status: 'active' as 'active' | 'closed' | 'pending',
  });

  const [stageForm, setStageForm] = useState({
    courtName: '',
    caseNumber: '',
    stageName: '',
    firstSessionDate: undefined as Date | undefined,
    notes: '',
  });

  const [sessionForm, setSessionForm] = useState({
    sessionDate: undefined as Date | undefined,
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nationalId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClientCases = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getCaseStages = (caseId: string) => {
    return stages.filter(stage => stage.caseId === caseId);
  };

  const getStageSessions = (stageId: string) => {
    return sessions.filter(session => session.stageId === stageId);
  };

  const handleAddClient = () => {
    dataStore.addClient({
      name: clientForm.name,
      phone: clientForm.phone,
      email: clientForm.email,
      address: clientForm.address,
      nationalId: clientForm.nationalId,
      notes: clientForm.notes,
    });
    setClientForm({
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

  const handleAddCase = (clientId: string) => {
    dataStore.addCase({
      clientId: clientId,
      title: caseForm.title,
      description: caseForm.description,
      opponent: caseForm.opponent,
      subject: caseForm.subject,
      caseType: caseForm.caseType,
      status: caseForm.status,
    });
    setCaseForm({
      title: '',
      description: '',
      opponent: '',
      subject: '',
      caseType: '',
      status: 'active',
    });
    setIsCaseDialogOpen(false);
    loadData();
  };

  const handleAddStage = (caseId: string) => {
    dataStore.addStage({
      caseId: caseId,
      courtName: stageForm.courtName,
      caseNumber: stageForm.caseNumber,
      stageName: stageForm.stageName,
      firstSessionDate: stageForm.firstSessionDate!,
      notes: stageForm.notes,
    });
    setStageForm({
      courtName: '',
      caseNumber: '',
      stageName: '',
      firstSessionDate: undefined,
      notes: '',
    });
    setIsStageDialogOpen(false);
    loadData();
  };

  const handleAddSession = (stageId: string) => {
    dataStore.addSession({
      stageId: stageId,
      courtName: '',
      caseNumber: '',
      sessionDate: sessionForm.sessionDate!,
      clientName: '',
      opponent: '',
      postponementReason: sessionForm.postponementReason,
      isTransferred: false,
    });
    setSessionForm({
      sessionDate: undefined,
      postponementReason: '',
    });
    setIsSessionDialogOpen(false);
    loadData();
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">إدارة الموكلين</h1>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث عن موكل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
            
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-5 w-5" />
                  إضافة موكل
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة موكل جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-right">
                    <Label htmlFor="name" className="text-right">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder="أدخل الاسم الكامل"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right">
                      <Label htmlFor="phone" className="text-right">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        placeholder="رقم الهاتف"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                    
                    <div className="text-right">
                      <Label htmlFor="nationalId" className="text-right">الرقم الوطني</Label>
                      <Input
                        id="nationalId"
                        value={clientForm.nationalId}
                        onChange={(e) => setClientForm({ ...clientForm, nationalId: e.target.value })}
                        placeholder="الرقم الوطني"
                        className="text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="البريد الإلكتروني"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="text-right">
                    <Label htmlFor="address" className="text-right">العنوان</Label>
                    <Textarea
                      id="address"
                      value={clientForm.address}
                      onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                      placeholder="أدخل العنوان"
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="text-right">
                    <Label htmlFor="notes" className="text-right">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      value={clientForm.notes}
                      onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
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
        </div>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">قائمة الموكلين ({filteredClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد موكلين مضافين بعد'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClients.map((client) => {
                  const clientCases = getClientCases(client.id);
                  return (
                    <Card key={client.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-blue-700">{client.name}</h3>
                              <span className="text-sm text-gray-500">
                                {client.phone && `هاتف: ${client.phone}`}
                                {client.nationalId && ` | هوية: ${client.nationalId}`}
                              </span>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              {client.email && <div>البريد: {client.email}</div>}
                              {client.address && <div>العنوان: {client.address}</div>}
                            </div>

                            {/* Cases */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-green-700">القضايا ({clientCases.length})</h4>
                                <Dialog open={isCaseDialogOpen && selectedClient?.id === client.id} onOpenChange={(open) => {
                                  setIsCaseDialogOpen(open);
                                  if (open) setSelectedClient(client);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}>
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md" dir="rtl">
                                    <DialogHeader>
                                      <DialogTitle className="text-right">إضافة قضية جديدة</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="text-right">
                                        <Label htmlFor="title" className="text-right">عنوان القضية</Label>
                                        <Input
                                          id="title"
                                          value={caseForm.title}
                                          onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                                          placeholder="أدخل عنوان القضية"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="description" className="text-right">وصف القضية</Label>
                                        <Textarea
                                          id="description"
                                          value={caseForm.description}
                                          onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                                          placeholder="أدخل وصف القضية"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="opponent" className="text-right">الخصم</Label>
                                        <Input
                                          id="opponent"
                                          value={caseForm.opponent}
                                          onChange={(e) => setCaseForm({ ...caseForm, opponent: e.target.value })}
                                          placeholder="أدخل اسم الخصم"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="subject" className="text-right">الموضوع</Label>
                                        <Input
                                          id="subject"
                                          value={caseForm.subject}
                                          onChange={(e) => setCaseForm({ ...caseForm, subject: e.target.value })}
                                          placeholder="أدخل موضوع القضية"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="caseType" className="text-right">نوع القضية</Label>
                                        <Input
                                          id="caseType"
                                          value={caseForm.caseType}
                                          onChange={(e) => setCaseForm({ ...caseForm, caseType: e.target.value })}
                                          placeholder="أدخل نوع القضية"
                                          className="text-right"
                                          dir="rtl"
                                        />
                                      </div>
                                      <div className="text-right">
                                        <Label htmlFor="status" className="text-right">الحالة</Label>
                                        <Select onValueChange={(value) => setCaseForm({ ...caseForm, status: value as 'active' | 'closed' | 'pending' })}>
                                          <SelectTrigger className="w-full text-right">
                                            <SelectValue placeholder="اختر الحالة" />
                                          </SelectTrigger>
                                          <SelectContent dir="rtl">
                                            <SelectItem value="active">نشطة</SelectItem>
                                            <SelectItem value="closed">مغلقة</SelectItem>
                                            <SelectItem value="pending">معلقة</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button onClick={() => handleAddCase(client.id)} className="w-full">
                                        إضافة القضية
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>

                              {clientCases.map((case_) => {
                                const caseStages = getCaseStages(case_.id);
                                return (
                                  <Card key={case_.id} className="border-l-4 border-l-green-500 ml-4">
                                    <CardContent className="p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <h5 className="font-medium text-green-700">{case_.title}</h5>
                                          <p className="text-sm text-muted-foreground">{case_.description}</p>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            الخصم: {case_.opponent} | النوع: {case_.caseType}
                                          </div>
                                        </div>
                                        <Dialog open={isStageDialogOpen && selectedCase?.id === case_.id} onOpenChange={(open) => {
                                          setIsStageDialogOpen(open);
                                          if (open) setSelectedCase(case_);
                                        }}>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedCase(case_)}>
                                              <Plus className="h-4 w-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md" dir="rtl">
                                            <DialogHeader>
                                              <DialogTitle className="text-right">إضافة مرحلة جديدة</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div className="text-right">
                                                <Label htmlFor="courtName" className="text-right">اسم المحكمة</Label>
                                                <Input
                                                  id="courtName"
                                                  value={stageForm.courtName}
                                                  onChange={(e) => setStageForm({ ...stageForm, courtName: e.target.value })}
                                                  placeholder="أدخل اسم المحكمة"
                                                  className="text-right"
                                                  dir="rtl"
                                                />
                                              </div>
                                              <div className="text-right">
                                                <Label htmlFor="caseNumber" className="text-right">رقم القضية</Label>
                                                <Input
                                                  id="caseNumber"
                                                  value={stageForm.caseNumber}
                                                  onChange={(e) => setStageForm({ ...stageForm, caseNumber: e.target.value })}
                                                  placeholder="أدخل رقم القضية"
                                                  className="text-right"
                                                  dir="rtl"
                                                />
                                              </div>
                                              <div className="text-right">
                                                <Label htmlFor="stageName" className="text-right">اسم المرحلة</Label>
                                                <Input
                                                  id="stageName"
                                                  value={stageForm.stageName}
                                                  onChange={(e) => setStageForm({ ...stageForm, stageName: e.target.value })}
                                                  placeholder="أدخل اسم المرحلة"
                                                  className="text-right"
                                                  dir="rtl"
                                                />
                                              </div>
                                              <div className="text-right">
                                                <Label className="text-right">تاريخ الجلسة الأولى</Label>
                                                <Popover>
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant="outline"
                                                      className={cn(
                                                        "w-full justify-start text-right font-normal",
                                                        !stageForm.firstSessionDate && "text-muted-foreground"
                                                      )}
                                                      dir="rtl"
                                                    >
                                                      <CalendarIcon className="ml-2 h-4 w-4" />
                                                      {stageForm.firstSessionDate ? (
                                                        formatSyrianDate(stageForm.firstSessionDate)
                                                      ) : (
                                                        <span>اختر التاريخ</span>
                                                      )}
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                      mode="single"
                                                      selected={stageForm.firstSessionDate}
                                                      onSelect={(date) => setStageForm({ ...stageForm, firstSessionDate: date })}
                                                      initialFocus
                                                      className="pointer-events-auto"
                                                    />
                                                  </PopoverContent>
                                                </Popover>
                                              </div>
                                              <div className="text-right">
                                                <Label htmlFor="notes" className="text-right">ملاحظات</Label>
                                                <Textarea
                                                  id="notes"
                                                  value={stageForm.notes}
                                                  onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })}
                                                  placeholder="أدخل ملاحظات"
                                                  className="text-right"
                                                  dir="rtl"
                                                />
                                              </div>
                                              <Button onClick={() => handleAddStage(case_.id)} className="w-full">
                                                إضافة المرحلة
                                              </Button>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>

                                      {/* Stages */}
                                      <div className="space-y-2">
                                        <h6 className="text-sm font-medium text-yellow-700">المراحل ({caseStages.length})</h6>
                                        {caseStages.map((stage) => {
                                          const stageSessions = getStageSessions(stage.id);
                                          return (
                                            <Card key={stage.id} className="border-l-4 border-l-yellow-500 ml-4">
                                              <CardContent className="p-2">
                                                <div className="flex justify-between items-start mb-1">
                                                  <div>
                                                    <div className="text-sm font-medium text-yellow-700">
                                                      {stage.courtName} - {stage.caseNumber}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                      المرحلة: {stage.stageName}
                                                    </div>
                                                  </div>
                                                  <Dialog open={isSessionDialogOpen && selectedStage?.id === stage.id} onOpenChange={(open) => {
                                                    setIsSessionDialogOpen(open);
                                                    if (open) setSelectedStage(stage);
                                                  }}>
                                                    <DialogTrigger asChild>
                                                      <Button variant="outline" size="sm" onClick={() => setSelectedStage(stage)}>
                                                        <Plus className="h-3 w-3" />
                                                      </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md" dir="rtl">
                                                      <DialogHeader>
                                                        <DialogTitle className="text-right">إضافة جلسة جديدة</DialogTitle>
                                                      </DialogHeader>
                                                      <div className="space-y-4">
                                                        <div className="text-right">
                                                          <Label className="text-right">تاريخ الجلسة</Label>
                                                          <Popover>
                                                            <PopoverTrigger asChild>
                                                              <Button
                                                                variant="outline"
                                                                className={cn(
                                                                  "w-full justify-start text-right font-normal",
                                                                  !sessionForm.sessionDate && "text-muted-foreground"
                                                                )}
                                                                dir="rtl"
                                                              >
                                                                <CalendarIcon className="ml-2 h-4 w-4" />
                                                                {sessionForm.sessionDate ? (
                                                                  formatSyrianDate(sessionForm.sessionDate)
                                                                ) : (
                                                                  <span>اختر التاريخ</span>
                                                                )}
                                                              </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                              <Calendar
                                                                mode="single"
                                                                selected={sessionForm.sessionDate}
                                                                onSelect={(date) => setSessionForm({ ...sessionForm, sessionDate: date })}
                                                                initialFocus
                                                                className="pointer-events-auto"
                                                              />
                                                            </PopoverContent>
                                                          </Popover>
                                                        </div>
                                                        <div className="text-right">
                                                          <Label htmlFor="postponementReason" className="text-right">سبب التأجيل</Label>
                                                          <Textarea
                                                            id="postponementReason"
                                                            value={sessionForm.postponementReason}
                                                            onChange={(e) => setSessionForm({ ...sessionForm, postponementReason: e.target.value })}
                                                            placeholder="أدخل سبب التأجيل"
                                                            className="text-right"
                                                            dir="rtl"
                                                          />
                                                        </div>
                                                        <Button onClick={() => handleAddSession(stage.id)} className="w-full">
                                                          إضافة الجلسة
                                                        </Button>
                                                      </div>
                                                    </DialogContent>
                                                  </Dialog>
                                                </div>
                                                
                                                {/* Sessions */}
                                                <div className="space-y-1">
                                                  <div className="text-xs font-medium text-purple-700">الجلسات ({stageSessions.length})</div>
                                                  {stageSessions.map((session) => (
                                                    <div key={session.id} className="text-xs p-1 bg-purple-50 rounded border-l-2 border-l-purple-400">
                                                      {formatSyrianDate(session.sessionDate)}
                                                      {session.postponementReason && (
                                                        <span className="text-muted-foreground"> - {session.postponementReason}</span>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              </CardContent>
                                            </Card>
                                          );
                                        })}
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Clients;
