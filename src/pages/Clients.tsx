
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus, User, Scale, Layers, Gavel, Search } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, Case, CaseStage, Session } from '@/types';
import { Layout } from '@/components/Layout';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [stages, setStages] = useState<CaseStage[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
    return cases.filter(c => c.clientId === clientId);
  };

  const getCaseStages = (caseId: string) => {
    return stages.filter(s => s.caseId === caseId);
  };

  const getStageSessions = (stageId: string) => {
    return sessions.filter(s => s.stageId === stageId);
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 min-h-screen" dir="rtl">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-right flex items-center gap-2">
                إدارة الموكلين
                <Button
                  onClick={() => {
                    const name = prompt('اسم الموكل:');
                    if (name?.trim()) {
                      const phone = prompt('رقم الهاتف (اختياري):') || '';
                      const email = prompt('البريد الإلكتروني (اختياري):') || '';
                      const address = prompt('العنوان (اختياري):') || '';
                      const nationalId = prompt('الرقم الوطني (اختياري):') || '';
                      const notes = prompt('ملاحظات (اختياري):') || '';
                      
                      const newClient: Client = {
                        id: Date.now().toString(),
                        name: name.trim(),
                        phone: phone.trim() || undefined,
                        email: email.trim() || undefined,
                        address: address.trim() || undefined,
                        nationalId: nationalId.trim() || undefined,
                        notes: notes.trim() || undefined,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      
                      dataStore.addClient(newClient);
                      loadData();
                    }
                  }}
                  className="gap-2"
                >
                  <UserPlus className="h-5 w-5" />
                  إضافة موكل
                </Button>
              </CardTitle>
              
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث عن موكل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 w-full sm:w-80"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد موكلين مضافين بعد'}
                </div>
              ) : (
                filteredClients.map(client => {
                  const clientCases = getClientCases(client.id);
                  const totalStages = clientCases.reduce((acc, c) => acc + getCaseStages(c.id).length, 0);
                  const totalSessions = clientCases.reduce((acc, c) => {
                    const caseStages = getCaseStages(c.id);
                    return acc + caseStages.reduce((stageAcc, stage) => stageAcc + getStageSessions(stage.id).length, 0);
                  }, 0);

                  return (
                    <Card key={client.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-6 w-6 text-blue-600" />
                              <h3 className="font-semibold text-lg">{client.name}</h3>
                            </div>
                            
                            {client.phone && (
                              <p className="text-sm text-muted-foreground">
                                <strong>الهاتف:</strong> {client.phone}
                              </p>
                            )}
                            
                            {client.email && (
                              <p className="text-sm text-muted-foreground">
                                <strong>البريد الإلكتروني:</strong> {client.email}
                              </p>
                            )}
                            
                            {client.nationalId && (
                              <p className="text-sm text-muted-foreground">
                                <strong>الرقم الوطني:</strong> {client.nationalId}
                              </p>
                            )}
                            
                            {client.address && (
                              <p className="text-sm text-muted-foreground">
                                <strong>العنوان:</strong> {client.address}
                              </p>
                            )}
                            
                            {client.notes && (
                              <p className="text-sm text-muted-foreground">
                                <strong>ملاحظات:</strong> {client.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                              <Scale className="h-8 w-8 text-green-600 mb-1" />
                              <span className="text-sm font-medium text-green-800">القضايا</span>
                              <span className="text-lg font-bold text-green-600">{clientCases.length}</span>
                            </div>
                            
                            <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                              <Layers className="h-8 w-8 text-purple-600 mb-1" />
                              <span className="text-sm font-medium text-purple-800">المراحل</span>
                              <span className="text-lg font-bold text-purple-600">{totalStages}</span>
                            </div>
                            
                            <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
                              <Gavel className="h-8 w-8 text-orange-600 mb-1" />
                              <span className="text-sm font-medium text-orange-800">الجلسات</span>
                              <span className="text-lg font-bold text-orange-600">{totalSessions}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Clients;
