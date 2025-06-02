
import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dataStore } from '@/store/dataStore';
import { Client } from '@/types';
import { Layout } from '@/components/Layout';
import { format } from 'date-fns';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationalId: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.nationalId && client.nationalId.includes(searchTerm))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const loadClients = () => {
    const clientsData = dataStore.getClients();
    setClients(clientsData);
    setFilteredClients(clientsData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('يجب إدخال اسم الموكل');
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      nationalId: formData.nationalId.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dataStore.addClient(newClient);
    loadClients();
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      nationalId: '',
      notes: ''
    });
    
    setIsAddDialogOpen(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">إدارة الموكلين</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة موكل جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة موكل جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم الموكل *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="أدخل اسم الموكل"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="أدخل البريد الإلكتروني"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="nationalId">رقم الهوية</Label>
                      <Input
                        id="nationalId"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        placeholder="أدخل رقم الهوية"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="أدخل العنوان"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">ملاحظات</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="أدخل أي ملاحظات إضافية"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        حفظ
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Search box */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث عن موكل (الاسم، الهاتف، البريد الإلكتروني، رقم الهوية)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد موكلين مسجلين'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">رقم الهوية</TableHead>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">تاريخ الإضافة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{client.nationalId || '-'}</TableCell>
                        <TableCell>{client.address || '-'}</TableCell>
                        <TableCell>{format(client.createdAt, 'yyyy/MM/dd')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {searchTerm && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                عدد النتائج: {filteredClients.length} من أصل {clients.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Clients;
