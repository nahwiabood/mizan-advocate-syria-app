
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';

const Settings: React.FC = () => {
  const [lawyerInfo, setLawyerInfo] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    address: '',
  });

  const [printSettings, setPrintSettings] = useState({
    includeLogo: true,
    includeHeader: true,
    includeFooter: true,
    fontSize: 'medium',
  });

  const [displaySettings, setDisplaySettings] = useState({
    showPastSessions: true,
    defaultCalendarView: 'month',
    sessionsColor: '#3b82f6',
    appointmentsColor: '#f59e0b',
    tasksColor: '#10b981',
  });

  const handleSaveLawyerInfo = () => {
    // Save to local storage or API
    toast.success('تم حفظ معلومات المحامي بنجاح');
  };

  const handleSavePrintSettings = () => {
    // Save to local storage or API
    toast.success('تم حفظ إعدادات الطباعة بنجاح');
  };

  const handleSaveDisplaySettings = () => {
    // Save to local storage or API
    toast.success('تم حفظ إعدادات العرض بنجاح');
  };

  const handleResetData = () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      // Clear all data from local storage
      localStorage.removeItem('lawyer-management-data');
      toast.success('تم إعادة تعيين البيانات بنجاح');
    }
  };

  const handleExportData = () => {
    const data = localStorage.getItem('lawyer-management-data');
    if (!data) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mizan-lawyer-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير البيانات بنجاح');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        JSON.parse(data); // Validate JSON
        localStorage.setItem('lawyer-management-data', data);
        toast.success('تم استيراد البيانات بنجاح');
      } catch (error) {
        toast.error('فشل استيراد البيانات. تأكد من صحة الملف');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">الضبط</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="lawyer-info">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="lawyer-info">معلومات المحامي</TabsTrigger>
                <TabsTrigger value="print">إعدادات الطباعة</TabsTrigger>
                <TabsTrigger value="display">إعدادات العرض</TabsTrigger>
                <TabsTrigger value="data">إدارة البيانات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lawyer-info" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="lawyerName">اسم المحامي</Label>
                  <Input
                    id="lawyerName"
                    value={lawyerInfo.name}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, name: e.target.value })}
                    placeholder="أدخل اسم المحامي"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerTitle">المسمى الوظيفي</Label>
                  <Input
                    id="lawyerTitle"
                    value={lawyerInfo.title}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, title: e.target.value })}
                    placeholder="مثال: محامي قانوني"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerPhone">رقم الهاتف</Label>
                  <Input
                    id="lawyerPhone"
                    value={lawyerInfo.phone}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, phone: e.target.value })}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerEmail">البريد الإلكتروني</Label>
                  <Input
                    id="lawyerEmail"
                    value={lawyerInfo.email}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, email: e.target.value })}
                    placeholder="أدخل البريد الإلكتروني"
                    type="email"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerAddress">العنوان</Label>
                  <Input
                    id="lawyerAddress"
                    value={lawyerInfo.address}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, address: e.target.value })}
                    placeholder="أدخل عنوان المكتب"
                  />
                </div>
                <Button onClick={handleSaveLawyerInfo} className="w-full">
                  حفظ المعلومات
                </Button>
              </TabsContent>
              
              <TabsContent value="print" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeLogo">إظهار الشعار في الطباعة</Label>
                  <Switch
                    id="includeLogo"
                    checked={printSettings.includeLogo}
                    onCheckedChange={(checked) => setPrintSettings({ ...printSettings, includeLogo: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeHeader">إظهار الترويسة في الطباعة</Label>
                  <Switch
                    id="includeHeader"
                    checked={printSettings.includeHeader}
                    onCheckedChange={(checked) => setPrintSettings({ ...printSettings, includeHeader: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeFooter">إظهار التذييل في الطباعة</Label>
                  <Switch
                    id="includeFooter"
                    checked={printSettings.includeFooter}
                    onCheckedChange={(checked) => setPrintSettings({ ...printSettings, includeFooter: checked })}
                  />
                </div>
                <div>
                  <Label>حجم الخط في الطباعة</Label>
                  <div className="flex mt-2">
                    <Button
                      variant={printSettings.fontSize === 'small' ? 'default' : 'outline'}
                      className="flex-1 rounded-l-md rounded-r-none"
                      onClick={() => setPrintSettings({ ...printSettings, fontSize: 'small' })}
                    >
                      صغير
                    </Button>
                    <Button
                      variant={printSettings.fontSize === 'medium' ? 'default' : 'outline'}
                      className="flex-1 rounded-none"
                      onClick={() => setPrintSettings({ ...printSettings, fontSize: 'medium' })}
                    >
                      متوسط
                    </Button>
                    <Button
                      variant={printSettings.fontSize === 'large' ? 'default' : 'outline'}
                      className="flex-1 rounded-r-md rounded-l-none"
                      onClick={() => setPrintSettings({ ...printSettings, fontSize: 'large' })}
                    >
                      كبير
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSavePrintSettings} className="w-full">
                  حفظ إعدادات الطباعة
                </Button>
              </TabsContent>
              
              <TabsContent value="display" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPastSessions">إظهار الجلسات السابقة</Label>
                  <Switch
                    id="showPastSessions"
                    checked={displaySettings.showPastSessions}
                    onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, showPastSessions: checked })}
                  />
                </div>
                <div>
                  <Label>عرض التقويم الافتراضي</Label>
                  <div className="flex mt-2">
                    <Button
                      variant={displaySettings.defaultCalendarView === 'day' ? 'default' : 'outline'}
                      className="flex-1 rounded-l-md rounded-r-none"
                      onClick={() => setDisplaySettings({ ...displaySettings, defaultCalendarView: 'day' })}
                    >
                      يوم
                    </Button>
                    <Button
                      variant={displaySettings.defaultCalendarView === 'week' ? 'default' : 'outline'}
                      className="flex-1 rounded-none"
                      onClick={() => setDisplaySettings({ ...displaySettings, defaultCalendarView: 'week' })}
                    >
                      أسبوع
                    </Button>
                    <Button
                      variant={displaySettings.defaultCalendarView === 'month' ? 'default' : 'outline'}
                      className="flex-1 rounded-r-md rounded-l-none"
                      onClick={() => setDisplaySettings({ ...displaySettings, defaultCalendarView: 'month' })}
                    >
                      شهر
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="sessionsColor">لون الجلسات</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="sessionsColor"
                      type="color"
                      value={displaySettings.sessionsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, sessionsColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={displaySettings.sessionsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, sessionsColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appointmentsColor">لون المواعيد</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="appointmentsColor"
                      type="color"
                      value={displaySettings.appointmentsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, appointmentsColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={displaySettings.appointmentsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, appointmentsColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tasksColor">لون المهام</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="tasksColor"
                      type="color"
                      value={displaySettings.tasksColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, tasksColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={displaySettings.tasksColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, tasksColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveDisplaySettings} className="w-full">
                  حفظ إعدادات العرض
                </Button>
              </TabsContent>
              
              <TabsContent value="data" className="mt-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تصدير/استيراد البيانات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        يمكنك تصدير جميع بياناتك كملف JSON للنسخ الاحتياطي أو النقل إلى جهاز آخر.
                      </p>
                      <Button onClick={handleExportData} className="w-full">
                        تصدير البيانات
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        يمكنك استيراد البيانات من ملف JSON سابق. سيؤدي هذا إلى استبدال جميع بياناتك الحالية.
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="importData"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById('importData')?.click()}
                        >
                          استيراد البيانات
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">إعادة تعيين البيانات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      سيؤدي هذا الإجراء إلى حذف جميع بياناتك بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <Button variant="destructive" onClick={handleResetData} className="w-full">
                      إعادة تعيين جميع البيانات
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
