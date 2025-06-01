import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus, UserPlus, FileText, FolderOpen, Calendar, Gavel, Search } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage, Session } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    notes: '',
  });

  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    opponent: '',
    subject: '',
    caseType: '',
  });
  const [selectedClientId, setSelectedClientId] = useState('');

  const [showStageDialog, setShowStageDialog] = useState(false);
  const [stageForm, setStageForm] = useState({
    courtName: '',
    caseNumber: '',
    stageName: '',
    firstSessionDate: '',
    notes: '',
  });
  const [selectedCaseId, setSelectedCaseId] = useState('');

  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    sessionDate: '',
    postponementReason: '',
    nextSessionDate: '',
    nextPostponementReason: '',
  });
  const [selectedStageId, setSelectedStageId] = useState('');

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
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.nationalId && client.nationalId.includes(searchTerm))
  );

  const getCasesForClient = (clientId: string) => {
    return cases.filter(case_ => case_.clientId === clientId);
  };

  const getStagesForCase = (caseId: string) => {
    return stages.filter(stage => stage.caseId === caseId);
  };

  const getSessionsForStage = (stageId: string) => {
    return sessions.filter(session => session.stageId === stageId);
  };

  const addClient = () => {
    if (clientForm.name.trim()) {
      const newClient: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
        name: clientForm.name,
        phone: clientForm.phone || undefined,
        email: clientForm.email || undefined,
        address: clientForm.address || undefined,
        nationalId: clientForm.nationalId || undefined,
        notes: clientForm.notes || undefined,
      };
      
      dataStore.addClient(newClient);
      setClientForm({ name: '', phone: '', email: '', address: '', nationalId: '', notes: '' });
      setShowClientDialog(false);
      loadData();
    }
  };

  const addCase = (clientId: string) => {
    if (caseForm.title.trim() && caseForm.opponent.trim()) {
      const newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'> = {
        clientId,
        title: caseForm.title,
        description: caseForm.description,
        opponent: caseForm.opponent,
        subject: caseForm.subject,
        caseType: caseForm.caseType,
        status: 'active' as const,
      };
      
      dataStore.addCase(newCase);
      setCaseForm({ title: '', description: '', opponent: '', subject: '', caseType: '' });
      setShowCaseDialog(false);
      setSelectedClientId('');
      loadData();
    }
  };

  const addStage = (caseId: string) => {
    if (stageForm.courtName.trim() && stageForm.caseNumber.trim() && stageForm.stageName.trim()) {
      const newStage: Omit<CaseStage, 'id' | 'createdAt' | 'updatedAt'> = {
        caseId,
        courtName: stageForm.courtName,
        caseNumber: stageForm.caseNumber,
        stageName: stageForm.stageName,
        firstSessionDate: new Date(stageForm.firstSessionDate),
        status: 'active' as const,
        notes: stageForm.notes || undefined,
      };
      
      dataStore.addStage(newStage);
      setStageForm({ courtName: '', caseNumber: '', stageName: '', firstSessionDate: '', notes: '' });
      setShowStageDialog(false);
      setSelectedCaseId('');
      loadData();
    }
  };

  const addSession = (stageId: string) => {
    if (sessionForm.sessionDate) {
      const stage = stages.find(s => s.id === stageId);
      const case_ = stage ? cases.find(c => c.id === stage.caseId) : null;
      const client = case_ ? clients.find(cl => cl.id === case_.clientId) : null;
      
      if (stage && case_ && client) {
        const newSession: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
          stageId,
          courtName: stage.courtName,
          caseNumber: stage.caseNumber,
          sessionDate: new Date(sessionForm.sessionDate),
          clientName: client.name,
          opponent: case_.opponent,
          postponementReason: sessionForm.postponementReason || undefined,
          nextSessionDate: sessionForm.nextSessionDate ? new Date(sessionForm.nextSessionDate) : undefined,
          nextPostponementReason: sessionForm.nextPostponementReason || undefined,
          isTransferred: !!sessionForm.nextSessionDate,
        };
        
        dataStore.addSession(newSession);
        setSessionForm({ sessionDate: '', postponementReason: '', nextSessionDate: '', nextPostponementReason: '' });
        setShowSessionDialog(false);
        setSelectedStageId('');
        loadData();
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 space-y-4" dir="rtl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-right text-xl sm:text-2xl font-bold text-blue-600">
                إدارة الموكلين
              </CardTitle>
              
              <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4" />
                    إضافة موكل
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة موكل جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-right block mb-2">الاسم</Label>
                      <Input
                        id="name"
                        value={clientForm.name}
                        onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                        className="text-right"
                        placeholder="اسم الموكل"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-right block mb-2">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        className="text-right"
                        placeholder="رقم الهاتف"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-right block mb-2">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clientForm.email}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        className="text-right"
                        placeholder="البريد الإلكتروني"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationalId" className="text-right block mb-2">الرقم الوطني</Label>
                      <Input
                        id="nationalId"
                        value={clientForm.nationalId}
                        onChange={(e) => setClientForm({ ...clientForm, nationalId: e.target.value })}
                        className="text-right"
                        placeholder="الرقم الوطني"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-right block mb-2">العنوان</Label>
                      <Input
                        id="address"
                        value={clientForm.address}
                        onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                        className="text-right"
                        placeholder="العنوان"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-right block mb-2">ملاحظات</Label>
                      <Textarea
                        id="notes"
                        value={clientForm.notes}
                        onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                        className="text-right"
                        placeholder="ملاحظات إضافية"
                      />
                    </div>
                    <Button onClick={addClient} className="w-full bg-blue-600 hover:bg-blue-700">
                      إضافة الموكل
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="البحث عن موكل (الاسم، الهاتف، الرقم الوطني)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right"
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {filteredClients.map((client) => {
                const clientCases = getCasesForClient(client.id);
                
                return (
                  <Card key={client.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-right flex-1">
                          <h3 className="font-bold text-lg text-blue-600">{client.name}</h3>
                          {client.phone && <p className="text-sm text-gray-600">📞 {client.phone}</p>}
                          {client.email && <p className="text-sm text-gray-600">📧 {client.email}</p>}
                          {client.nationalId && <p className="text-sm text-gray-600">🆔 {client.nationalId}</p>}
                          {client.address && <p className="text-sm text-gray-600">📍 {client.address}</p>}
                        </div>
                        
                        <div className="flex gap-2">
                          <Dialog open={showCaseDialog && selectedClientId === client.id} onOpenChange={(open) => {
                            setShowCaseDialog(open);
                            if (!open) setSelectedClientId('');
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedClientId(client.id)}
                                className="bg-green-50 hover:bg-green-100 border-green-300"
                              >
                                <FileText className="h-5 w-5 text-green-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg" dir="rtl">
                              <DialogHeader>
                                <DialogTitle className="text-right">إضافة قضية جديدة</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="title" className="text-right block mb-2">عنوان القضية</Label>
                                  <Input
                                    id="title"
                                    value={caseForm.title}
                                    onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                                    className="text-right"
                                    placeholder="عنوان القضية"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="opponent" className="text-right block mb-2">الخصم</Label>
                                  <Input
                                    id="opponent"
                                    value={caseForm.opponent}
                                    onChange={(e) => setCaseForm({ ...caseForm, opponent: e.target.value })}
                                    className="text-right"
                                    placeholder="الخصم"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="subject" className="text-right block mb-2">الموضوع</Label>
                                  <Input
                                    id="subject"
                                    value={caseForm.subject}
                                    onChange={(e) => setCaseForm({ ...caseForm, subject: e.target.value })}
                                    className="text-right"
                                    placeholder="الموضوع"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="caseType" className="text-right block mb-2">نوع القضية</Label>
                                  <Select onValueChange={(value) => setCaseForm({ ...caseForm, caseType: value })}>
                                    <SelectTrigger className="w-full text-right">
                                      <SelectValue placeholder="نوع القضية" />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                      <SelectItem value="مدنية">مدنية</SelectItem>
                                      <SelectItem value="جزائية">جزائية</SelectItem>
                                      <SelectItem value="أحوال شخصية">أحوال شخصية</SelectItem>
                                      <SelectItem value="تجارية">تجارية</SelectItem>
                                      <SelectItem value="إدارية">إدارية</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="description" className="text-right block mb-2">الوصف</Label>
                                  <Textarea
                                    id="description"
                                    value={caseForm.description}
                                    onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                                    className="text-right"
                                    placeholder="وصف القضية"
                                  />
                                </div>
                                <Button onClick={() => addCase(client.id)} className="w-full bg-green-600 hover:bg-green-700">
                                  إضافة القضية
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 border-blue-300">
                            <Edit className="h-5 w-5 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {clientCases.length > 0 ? (
                        <div className="space-y-4">
                          {clientCases.map((case_) => {
                            const caseStages = getStagesForCase(case_.id);
                            
                            return (
                              <Card key={case_.id} className="border-l-4 border-l-green-500">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1 text-right flex-1">
                                      <h4 className="font-semibold text-md text-green-600">{case_.title}</h4>
                                      <p className="text-sm text-gray-600">⚖️ {case_.caseType}</p>
                                      <p className="text-sm text-gray-600">🆚 {case_.opponent}</p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Dialog open={showStageDialog && selectedCaseId === case_.id} onOpenChange={(open) => {
                                        setShowStageDialog(open);
                                        if (!open) setSelectedCaseId('');
                                      }}>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedCaseId(case_.id)}
                                            className="bg-orange-50 hover:bg-orange-100 border-orange-300"
                                          >
                                            <FolderOpen className="h-5 w-5 text-orange-600" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-lg" dir="rtl">
                                          <DialogHeader>
                                            <DialogTitle className="text-right">إضافة مرحلة جديدة</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="courtName" className="text-right block mb-2">اسم المحكمة</Label>
                                              <Input
                                                id="courtName"
                                                value={stageForm.courtName}
                                                onChange={(e) => setStageForm({ ...stageForm, courtName: e.target.value })}
                                                className="text-right"
                                                placeholder="اسم المحكمة"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="caseNumber" className="text-right block mb-2">رقم الأساس</Label>
                                              <Input
                                                id="caseNumber"
                                                value={stageForm.caseNumber}
                                                onChange={(e) => setStageForm({ ...stageForm, caseNumber: e.target.value })}
                                                className="text-right"
                                                placeholder="رقم الأساس"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="stageName" className="text-right block mb-2">اسم المرحلة</Label>
                                              <Input
                                                id="stageName"
                                                value={stageForm.stageName}
                                                onChange={(e) => setStageForm({ ...stageForm, stageName: e.target.value })}
                                                className="text-right"
                                                placeholder="اسم المرحلة"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="firstSessionDate" className="text-right block mb-2">تاريخ أول جلسة</Label>
                                              <Input
                                                id="firstSessionDate"
                                                type="date"
                                                value={stageForm.firstSessionDate}
                                                onChange={(e) => setStageForm({ ...stageForm, firstSessionDate: e.target.value })}
                                                className="text-right"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="notes" className="text-right block mb-2">ملاحظات</Label>
                                              <Textarea
                                                id="notes"
                                                value={stageForm.notes}
                                                onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })}
                                                className="text-right"
                                                placeholder="ملاحظات إضافية"
                                              />
                                            </div>
                                            <Button onClick={() => addStage(case_.id)} className="w-full bg-orange-600 hover:bg-orange-700">
                                              إضافة المرحلة
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                      
                                      <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 border-blue-300">
                                        <Edit className="h-5 w-5 text-blue-600" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent>
                                  {caseStages.length > 0 ? (
                                    <div className="space-y-4">
                                      {caseStages.map((stage) => {
                                        const stageSessions = getSessionsForStage(stage.id);
                                        
                                        return (
                                          <Card key={stage.id} className="border-l-4 border-l-orange-500">
                                            <CardHeader className="pb-2">
                                              <div className="flex justify-between items-start">
                                                <div className="space-y-1 text-right flex-1">
                                                  <h5 className="font-medium text-md text-orange-600">{stage.stageName}</h5>
                                                  <p className="text-sm text-gray-600">🏛️ {stage.courtName}</p>
                                                  <p className="text-sm text-gray-600">🔢 {stage.caseNumber}</p>
                                                  <p className="text-sm text-gray-600">📅 {formatSyrianDate(stage.firstSessionDate)}</p>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                  <Dialog open={showSessionDialog && selectedStageId === stage.id} onOpenChange={(open) => {
                                                    setShowSessionDialog(open);
                                                    if (!open) setSelectedStageId('');
                                                  }}>
                                                    <DialogTrigger asChild>
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedStageId(stage.id)}
                                                        className="bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
                                                      >
                                                        <Calendar className="h-5 w-5 text-yellow-600" />
                                                      </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-lg" dir="rtl">
                                                      <DialogHeader>
                                                        <DialogTitle className="text-right">إضافة جلسة جديدة</DialogTitle>
                                                      </DialogHeader>
                                                      <div className="space-y-4">
                                                        <div>
                                                          <Label htmlFor="sessionDate" className="text-right block mb-2">تاريخ الجلسة</Label>
                                                          <Input
                                                            id="sessionDate"
                                                            type="date"
                                                            value={sessionForm.sessionDate}
                                                            onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                                                            className="text-right"
                                                          />
                                                        </div>
                                                        <div>
                                                          <Label htmlFor="postponementReason" className="text-right block mb-2">سبب التأجيل</Label>
                                                          <Input
                                                            id="postponementReason"
                                                            value={sessionForm.postponementReason}
                                                            onChange={(e) => setSessionForm({ ...sessionForm, postponementReason: e.target.value })}
                                                            className="text-right"
                                                            placeholder="سبب التأجيل"
                                                          />
                                                        </div>
                                                        <div>
                                                          <Label htmlFor="nextSessionDate" className="text-right block mb-2">تاريخ الجلسة القادمة</Label>
                                                          <Input
                                                            id="nextSessionDate"
                                                            type="date"
                                                            value={sessionForm.nextSessionDate}
                                                            onChange={(e) => setSessionForm({ ...sessionForm, nextSessionDate: e.target.value })}
                                                            className="text-right"
                                                          />
                                                        </div>
                                                        <div>
                                                          <Label htmlFor="nextPostponementReason" className="text-right block mb-2">سبب التأجيل القادم</Label>
                                                          <Input
                                                            id="nextPostponementReason"
                                                            value={sessionForm.nextPostponementReason}
                                                            onChange={(e) => setSessionForm({ ...sessionForm, nextPostponementReason: e.target.value })}
                                                            className="text-right"
                                                            placeholder="سبب التأجيل القادم"
                                                          />
                                                        </div>
                                                        <Button onClick={() => addSession(stage.id)} className="w-full bg-yellow-600 hover:bg-yellow-700">
                                                          إضافة الجلسة
                                                        </Button>
                                                      </div>
                                                    </DialogContent>
                                                  </Dialog>
                                                  
                                                  <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 border-blue-300">
                                                    <Edit className="h-5 w-5 text-blue-600" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </CardHeader>

                                            <CardContent>
                                              {stageSessions.length > 0 ? (
                                                <div className="space-y-2">
                                                  {stageSessions.map((session) => (
                                                    <Badge key={session.id} variant="secondary">
                                                      {formatSyrianDate(session.sessionDate)} - {session.courtName}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              ) : (
                                                <p className="text-sm text-gray-500 text-right">لا توجد جلسات لهذه المرحلة.</p>
                                              )}
                                            </CardContent>
                                          </Card>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 text-right">لا توجد مراحل لهذه القضية.</p>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-right">لا توجد قضايا لهذا الموكل.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              إضافة موكل
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة موكل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-right block mb-2">الاسم</Label>
                <Input
                  id="name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="text-right"
                  placeholder="اسم الموكل"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-right block mb-2">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="text-right"
                  placeholder="رقم الهاتف"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-right block mb-2">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="text-right"
                  placeholder="البريد الإلكتروني"
                />
              </div>
              <div>
                <Label htmlFor="nationalId" className="text-right block mb-2">الرقم الوطني</Label>
                <Input
                  id="nationalId"
                  value={clientForm.nationalId}
                  onChange={(e) => setClientForm({ ...clientForm, nationalId: e.target.value })}
                  className="text-right"
                  placeholder="الرقم الوطني"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-right block mb-2">العنوان</Label>
                <Input
                  id="address"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="text-right"
                  placeholder="العنوان"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-right block mb-2">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  className="text-right"
                  placeholder="ملاحظات إضافية"
                />
              </div>
              <Button onClick={addClient} className="w-full bg-blue-600 hover:bg-blue-700">
                إضافة الموكل
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Clients;
