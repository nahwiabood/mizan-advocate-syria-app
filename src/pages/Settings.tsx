
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Upload, Trash2, Plus, Settings as SettingsIcon, Database, Users, FileText, Building } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Layout } from '@/components/Layout';

const Settings = () => {
  const [newCourtName, setNewCourtName] = useState('');
  const [newCaseTypeName, setNewCaseTypeName] = useState('');
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleExportData = () => {
    try {
      const data = {
        clients: dataStore.getClients(),
        cases: dataStore.getCases(),
        stages: dataStore.getStages(),
        sessions: dataStore.getSessions(),
        tasks: dataStore.getTasks(),
        appointments: dataStore.getAppointments(),
        courts: dataStore.getCourts(),
        caseTypes: dataStore.getCaseTypes(),
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal_agenda_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      alert('حدث خطأ أثناء تصدير البيانات');
    }
  };

  const handleImportData = () => {
    if (!selectedBackupFile) {
      alert('يرجى اختيار ملف النسخ الاحتياطي');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.clients || !data.cases || !data.stages || !data.sessions) {
          throw new Error('بنية الملف غير صحيحة');
        }

        // Import data
        dataStore.importData(data);
        alert('تم استيراد البيانات بنجاح');
        setIsImportDialogOpen(false);
        setSelectedBackupFile(null);
        
        // Refresh page to show imported data
        window.location.reload();
      } catch (error) {
        console.error('خطأ في استيراد البيانات:', error);
        alert('حدث خطأ أثناء استيراد البيانات. تأكد من صحة الملف.');
      }
    };
    reader.readAsText(selectedBackupFile);
  };

  const handleClearAllData = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      if (window.confirm('تأكيد أخير: سيتم حذف جميع الموكلين والقضايا والجلسات والمهام والمواعيد. هل تريد المتابعة؟')) {
        dataStore.clearAllData();
        alert('تم حذف جميع البيانات');
        window.location.reload();
      }
    }
  };

  const addCourt = () => {
    if (newCourtName.trim()) {
      dataStore.addCourt(newCourtName.trim());
      setNewCourtName('');
    }
  };

  const addCaseType = () => {
    if (newCaseTypeName.trim()) {
      dataStore.addCaseType(newCaseTypeName.trim());
      setNewCaseTypeName('');
    }
  };

  const deleteCourt = (courtId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المحكمة؟')) {
      dataStore.deleteCourt(courtId);
    }
  };

  const deleteCaseType = (typeId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا النوع؟')) {
      dataStore.deleteCaseType(typeId);
    }
  };

  const courts = dataStore.getCourts();
  const caseTypes = dataStore.getCaseTypes();
  const stats = dataStore.getStats();

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 min-h-screen space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <SettingsIcon className="h-6 w-6" />
              إعدادات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="backup" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 h-auto p-1">
                <TabsTrigger value="backup" className="flex items-center gap-2 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Database className="h-4 w-4" />
                  <span>النسخ الاحتياطي</span>
                </TabsTrigger>
                <TabsTrigger value="courts" className="flex items-center gap-2 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Building className="h-4 w-4" />
                  <span>المحاكم</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4" />
                  <span>الإحصائيات</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="backup" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right">إدارة البيانات</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-right">تصدير البيانات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 text-right">
                          قم بتصدير جميع بياناتك لحفظها كنسخة احتياطية
                        </p>
                        <Button onClick={handleExportData} className="w-full gap-2">
                          <Download className="h-4 w-4" />
                          تصدير البيانات
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-right">استيراد البيانات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 text-right">
                          استيراد البيانات من ملف نسخة احتياطية
                        </p>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full gap-2">
                              <Upload className="h-4 w-4" />
                              استيراد البيانات
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl">
                            <DialogHeader>
                              <DialogTitle className="text-right">استيراد البيانات</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-right">
                                <Label htmlFor="backup-file">اختر ملف النسخة الاحتياطية</Label>
                                <Input
                                  id="backup-file"
                                  type="file"
                                  accept=".json"
                                  onChange={(e) => setSelectedBackupFile(e.target.files?.[0] || null)}
                                  className="mt-2"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleImportData} disabled={!selectedBackupFile} className="flex-1">
                                  استيراد
                                </Button>
                                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)} className="flex-1">
                                  إلغاء
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-sm text-red-600 text-right">منطقة الخطر</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 text-right">
                        حذف جميع البيانات نهائياً - لا يمكن التراجع عن هذا الإجراء
                      </p>
                      <Button variant="destructive" onClick={handleClearAllData} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        حذف جميع البيانات
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="courts" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-right">إدارة المحاكم</h3>
                    <div className="flex gap-2 mb-4">
                      <Button onClick={addCourt} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        إضافة
                      </Button>
                      <Input
                        placeholder="اسم المحكمة الجديدة"
                        value={newCourtName}
                        onChange={(e) => setNewCourtName(e.target.value)}
                        className="text-right"
                        dir="rtl"
                        onKeyPress={(e) => e.key === 'Enter' && addCourt()}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {courts.map((court) => (
                        <Badge key={court.id} variant="secondary" className="gap-2 p-2">
                          <span>{court.name}</span>
                          <button
                            onClick={() => deleteCourt(court.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-right">أنواع القضايا</h3>
                    <div className="flex gap-2 mb-4">
                      <Button onClick={addCaseType} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        إضافة
                      </Button>
                      <Input
                        placeholder="نوع القضية الجديد"
                        value={newCaseTypeName}
                        onChange={(e) => setNewCaseTypeName(e.target.value)}
                        className="text-right"
                        dir="rtl"
                        onKeyPress={(e) => e.key === 'Enter' && addCaseType()}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {caseTypes.map((type) => (
                        <Badge key={type.id} variant="secondary" className="gap-2 p-2">
                          <span>{type.name}</span>
                          <button
                            onClick={() => deleteCaseType(type.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right">إحصائيات النظام</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{stats.totalClients}</p>
                        <p className="text-sm text-muted-foreground">الموكلين</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{stats.totalCases}</p>
                        <p className="text-sm text-muted-foreground">القضايا</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Building className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{stats.totalSessions}</p>
                        <p className="text-sm text-muted-foreground">الجلسات</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <SettingsIcon className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{stats.totalTasks}</p>
                        <p className="text-sm text-muted-foreground">المهام</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
