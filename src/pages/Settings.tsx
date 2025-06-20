import React, { useState, useEffect } from 'react';
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

  // Load settings from localStorage on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedLawyerInfo = localStorage.getItem('lawyer-info');
    const savedPrintSettings = localStorage.getItem('print-settings');
    const savedDisplaySettings = localStorage.getItem('display-settings');

    if (savedLawyerInfo) {
      try {
        const parsed = JSON.parse(savedLawyerInfo);
        setLawyerInfo(parsed);
      } catch (error) {
        console.error('Error parsing lawyer info:', error);
      }
    }

    if (savedPrintSettings) {
      try {
        const parsed = JSON.parse(savedPrintSettings);
        setPrintSettings(parsed);
      } catch (error) {
        console.error('Error parsing print settings:', error);
      }
    }

    if (savedDisplaySettings) {
      try {
        const parsed = JSON.parse(savedDisplaySettings);
        setDisplaySettings(parsed);
      } catch (error) {
        console.error('Error parsing display settings:', error);
      }
    }
  };

  const handleSaveLawyerInfo = () => {
    try {
      localStorage.setItem('lawyer-info', JSON.stringify(lawyerInfo));
      toast.success('تم حفظ معلومات المحامي بنجاح');
    } catch (error) {
      toast.error('فشل في حفظ معلومات المحامي');
      console.error('Error saving lawyer info:', error);
    }
  };

  const handleSavePrintSettings = () => {
    try {
      localStorage.setItem('print-settings', JSON.stringify(printSettings));
      toast.success('تم حفظ إعدادات الطباعة بنجاح');
    } catch (error) {
      toast.error('فشل في حفظ إعدادات الطباعة');
      console.error('Error saving print settings:', error);
    }
  };

  const handleSaveDisplaySettings = () => {
    try {
      localStorage.setItem('display-settings', JSON.stringify(displaySettings));
      toast.success('تم حفظ إعدادات العرض بنجاح');
    } catch (error) {
      toast.error('فشل في حفظ إعدادات العرض');
      console.error('Error saving display settings:', error);
    }
  };

  const handleResetData = () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      // Clear all data from local storage
      localStorage.removeItem('lawyer-management-data');
      localStorage.removeItem('lawyer-info');
      localStorage.removeItem('print-settings');
      localStorage.removeItem('display-settings');
      
      // Reset state
      setLawyerInfo({
        name: '',
        title: '',
        phone: '',
        email: '',
        address: '',
      });
      setPrintSettings({
        includeLogo: true,
        includeHeader: true,
        includeFooter: true,
        fontSize: 'medium',
      });
      setDisplaySettings({
        showPastSessions: true,
        defaultCalendarView: 'month',
        sessionsColor: '#3b82f6',
        appointmentsColor: '#f59e0b',
        tasksColor: '#10b981',
      });
      
      toast.success('تم إعادة تعيين البيانات بنجاح');
      
      // Reload the page to refresh the application
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleExportData = () => {
    const allData = {
      lawyerData: localStorage.getItem('lawyer-management-data'),
      lawyerInfo: localStorage.getItem('lawyer-info'),
      printSettings: localStorage.getItem('print-settings'),
      displaySettings: localStorage.getItem('display-settings')
    };

    if (!allData.lawyerData && !allData.lawyerInfo) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    const dataString = JSON.stringify(allData);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const fileName = `mizan-lawyer-data-${new Date().toISOString().split('T')[0]}.json`;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`تم تصدير البيانات بنجاح. سيتم حفظ الملف في مجلد التحميلات باسم: ${fileName}`);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Import all data
        if (data.lawyerData) {
          localStorage.setItem('lawyer-management-data', data.lawyerData);
        }
        if (data.lawyerInfo) {
          localStorage.setItem('lawyer-info', data.lawyerInfo);
          setLawyerInfo(JSON.parse(data.lawyerInfo));
        }
        if (data.printSettings) {
          localStorage.setItem('print-settings', data.printSettings);
          setPrintSettings(JSON.parse(data.printSettings));
        }
        if (data.displaySettings) {
          localStorage.setItem('display-settings', data.displaySettings);
          setDisplaySettings(JSON.parse(data.displaySettings));
        }
        
        toast.success('تم استيراد البيانات بنجاح');
        
        // Reload the page to refresh the application
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error('فشل استيراد البيانات. تأكد من صحة الملف');
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    e.target.value = '';
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 min-h-screen" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-right">الضبط</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="lawyer-info" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted rounded-lg p-1">
                <TabsTrigger 
                  value="lawyer-info" 
                  className="text-sm px-2 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  معلومات المحامي
                </TabsTrigger>
                <TabsTrigger 
                  value="print" 
                  className="text-sm px-2 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  إعدادات الطباعة
                </TabsTrigger>
                <TabsTrigger 
                  value="display" 
                  className="text-sm px-2 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  إعدادات العرض
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="text-sm px-2 py-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  إدارة البيانات
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="lawyer-info" className="mt-6 space-y-6">
                <div>
                  <Label htmlFor="lawyerName" className="block mb-2 text-right">اسم المحامي</Label>
                  <Input
                    id="lawyerName"
                    value={lawyerInfo.name}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, name: e.target.value })}
                    placeholder="أدخل اسم المحامي"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerTitle" className="block mb-2 text-right">المسمى الوظيفي</Label>
                  <Input
                    id="lawyerTitle"
                    value={lawyerInfo.title}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, title: e.target.value })}
                    placeholder="مثال: محامي قانوني"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerPhone" className="block mb-2 text-right">رقم الهاتف</Label>
                  <Input
                    id="lawyerPhone"
                    value={lawyerInfo.phone}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, phone: e.target.value })}
                    placeholder="أدخل رقم الهاتف"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerEmail" className="block mb-2 text-right">البريد الإلكتروني</Label>
                  <Input
                    id="lawyerEmail"
                    value={lawyerInfo.email}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, email: e.target.value })}
                    placeholder="أدخل البريد الإلكتروني"
                    type="email"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="lawyerAddress" className="block mb-2 text-right">العنوان</Label>
                  <Input
                    id="lawyerAddress"
                    value={lawyerInfo.address}
                    onChange={(e) => setLawyerInfo({ ...lawyerInfo, address: e.target.value })}
                    placeholder="أدخل عنوان المكتب"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <Button onClick={handleSaveLawyerInfo} className="w-full">
                  حفظ المعلومات
                </Button>
              </TabsContent>
              
              <TabsContent value="print" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeLogo" className="text-right">إظهار الشعار في الطباعة</Label>
                  <Switch
                    id="includeLogo"
                    checked={printSettings.includeLogo}
                    onCheckedChange={(checked) => setPrintSettings({ ...printSettings, includeLogo: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeHeader" className="text-right">إظهار الترويسة في الطباعة</Label>
                  <Switch
                    id="includeHeader"
                    checked={printSettings.includeHeader}
                    onCheckedChange={(checked) => setPrintSettings({ ...printSettings, includeHeader: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeFooter" className="text-right">إظهار التذييل في الطباعة</Label>
                  <Switch
                    id="includeFooter"
                    checked={printSettings.includeFooter}
                    onCheckedChange={(checked) => setPrintSettings({ ...printSettings, includeFooter: checked })}
                  />
                </div>
                <div>
                  <Label className="block mb-3 text-right">حجم الخط في الطباعة</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={printSettings.fontSize === 'small' ? 'default' : 'outline'}
                      onClick={() => setPrintSettings({ ...printSettings, fontSize: 'small' })}
                      className="text-sm"
                    >
                      صغير
                    </Button>
                    <Button
                      variant={printSettings.fontSize === 'medium' ? 'default' : 'outline'}
                      onClick={() => setPrintSettings({ ...printSettings, fontSize: 'medium' })}
                      className="text-sm"
                    >
                      متوسط
                    </Button>
                    <Button
                      variant={printSettings.fontSize === 'large' ? 'default' : 'outline'}
                      onClick={() => setPrintSettings({ ...printSettings, fontSize: 'large' })}
                      className="text-sm"
                    >
                      كبير
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSavePrintSettings} className="w-full">
                  حفظ إعدادات الطباعة
                </Button>
              </TabsContent>
              
              <TabsContent value="display" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPastSessions" className="text-right">إظهار الجلسات السابقة</Label>
                  <Switch
                    id="showPastSessions"
                    checked={displaySettings.showPastSessions}
                    onCheckedChange={(checked) => setDisplaySettings({ ...displaySettings, showPastSessions: checked })}
                  />
                </div>
                <div>
                  <Label className="block mb-3 text-right">عرض التقويم الافتراضي</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={displaySettings.defaultCalendarView === 'day' ? 'default' : 'outline'}
                      onClick={() => setDisplaySettings({ ...displaySettings, defaultCalendarView: 'day' })}
                      className="text-sm"
                    >
                      يوم
                    </Button>
                    <Button
                      variant={displaySettings.defaultCalendarView === 'week' ? 'default' : 'outline'}
                      onClick={() => setDisplaySettings({ ...displaySettings, defaultCalendarView: 'week' })}
                      className="text-sm"
                    >
                      أسبوع
                    </Button>
                    <Button
                      variant={displaySettings.defaultCalendarView === 'month' ? 'default' : 'outline'}
                      onClick={() => setDisplaySettings({ ...displaySettings, defaultCalendarView: 'month' })}
                      className="text-sm"
                    >
                      شهر
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="sessionsColor" className="block mb-2 text-right">لون الجلسات</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sessionsColor"
                      type="color"
                      value={displaySettings.sessionsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, sessionsColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={displaySettings.sessionsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, sessionsColor: e.target.value })}
                      className="flex-1 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appointmentsColor" className="block mb-2 text-right">لون المواعيد</Label>
                  <div className="flex gap-2">
                    <Input
                      id="appointmentsColor"
                      type="color"
                      value={displaySettings.appointmentsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, appointmentsColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={displaySettings.appointmentsColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, appointmentsColor: e.target.value })}
                      className="flex-1 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tasksColor" className="block mb-2 text-right">لون المهام</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tasksColor"
                      type="color"
                      value={displaySettings.tasksColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, tasksColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={displaySettings.tasksColor}
                      onChange={(e) => setDisplaySettings({ ...displaySettings, tasksColor: e.target.value })}
                      className="flex-1 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveDisplaySettings} className="w-full">
                  حفظ إعدادات العرض
                </Button>
              </TabsContent>
              
              <TabsContent value="data" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-right">تصدير/استيراد البيانات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 text-right">
                        يمكنك تصدير جميع بياناتك كملف JSON للنسخ الاحتياطي أو النقل إلى جهاز آخر. سيتم حفظ الملف في مجلد التحميلات الخاص بك.
                      </p>
                      <Button onClick={handleExportData} className="w-full">
                        تصدير البيانات إلى مجلد التحميلات
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 text-right">
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
                          استيراد البيانات من ملف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-right">إعادة تعيين البيانات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 text-right">
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
