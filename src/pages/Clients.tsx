import { useState } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, User, DollarSign, FileText, CreditCard, Receipt } from "lucide-react";
import { supabaseStore } from "@/store/supabaseStore";
import { useToast } from "@/components/ui/use-toast";
import { formatSyrianDate } from "@/utils/dateUtils";

const Clients = () => {
  const { clients, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: ""
  });

  const [clientFees, setClientFees] = useState<any[]>([]);
  const [clientPayments, setClientPayments] = useState<any[]>([]);
  const [clientExpenses, setClientExpenses] = useState<any[]>([]);
  const [clientBalance, setClientBalance] = useState({
    totalFees: 0,
    totalPayments: 0,
    totalExpenses: 0,
    balance: 0
  });

  const [newFee, setNewFee] = useState({ amount: "", description: "", feeDate: new Date() });
  const [newPayment, setNewPayment] = useState({ amount: "", description: "", paymentDate: new Date() });
  const [newExpense, setNewExpense] = useState({ amount: "", description: "", expenseDate: new Date() });

  const handleAddClient = async () => {
    if (!newClient.name) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الموكل",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseStore.addClient(newClient);
      setNewClient({ name: "", phone: "", email: "", address: "", notes: "" });
      setIsAddDialogOpen(false);
      await refetch();
      
      toast({
        title: "تم إضافة الموكل",
        description: "تم إضافة الموكل بنجاح"
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الموكل",
        variant: "destructive"
      });
    }
  };

  const loadClientData = async (clientId: string) => {
    try {
      const [fees, payments, expenses, balance] = await Promise.all([
        supabaseStore.getClientFees(clientId),
        supabaseStore.getClientPayments(clientId),
        supabaseStore.getClientExpenses(clientId),
        supabaseStore.getClientBalance(clientId)
      ]);
      
      setClientFees(fees);
      setClientPayments(payments);
      setClientExpenses(expenses);
      setClientBalance(balance);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    loadClientData(client.id);
  };

  const handleAddFee = async () => {
    if (!selectedClient || !newFee.amount) return;
    
    try {
      await supabaseStore.addClientFee({
        clientId: selectedClient.id,
        amount: Number(newFee.amount),
        description: newFee.description,
        feeDate: newFee.feeDate
      });
      
      setNewFee({ amount: "", description: "", feeDate: new Date() });
      await loadClientData(selectedClient.id);
      
      toast({
        title: "تم إضافة الرسوم",
        description: "تم إضافة الرسوم بنجاح"
      });
    } catch (error) {
      console.error('Error adding fee:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الرسوم",
        variant: "destructive"
      });
    }
  };

  const handleAddPayment = async () => {
    if (!selectedClient || !newPayment.amount) return;
    
    try {
      await supabaseStore.addClientPayment({
        clientId: selectedClient.id,
        amount: Number(newPayment.amount),
        description: newPayment.description,
        paymentDate: newPayment.paymentDate
      });
      
      setNewPayment({ amount: "", description: "", paymentDate: new Date() });
      await loadClientData(selectedClient.id);
      
      toast({
        title: "تم إضافة الدفعة",
        description: "تم إضافة الدفعة بنجاح"
      });
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الدفعة",
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = async () => {
    if (!selectedClient || !newExpense.amount) return;
    
    try {
      await supabaseStore.addClientExpense({
        clientId: selectedClient.id,
        amount: Number(newExpense.amount),
        description: newExpense.description,
        expenseDate: newExpense.expenseDate
      });
      
      setNewExpense({ amount: "", description: "", expenseDate: new Date() });
      await loadClientData(selectedClient.id);
      
      toast({
        title: "تم إضافة المصروف",
        description: "تم إضافة المصروف بنجاح"
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المصروف",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-right">الموكلون</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  <Label htmlFor="name" className="text-right">الاسم</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clients List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <User className="h-5 w-5" />
                قائمة الموكلين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedClient?.id === client.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="text-right">
                      <h3 className="font-semibold">{client.name}</h3>
                      {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                      {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا يوجد موكلون
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Details */}
          {selectedClient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تفاصيل الموكل: {selectedClient.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">المعلومات</TabsTrigger>
                    <TabsTrigger value="fees">الرسوم</TabsTrigger>
                    <TabsTrigger value="payments">الدفعات</TabsTrigger>
                    <TabsTrigger value="expenses">المصروفات</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="space-y-2 text-right">
                      <p><strong>الاسم:</strong> {selectedClient.name}</p>
                      {selectedClient.phone && <p><strong>الهاتف:</strong> {selectedClient.phone}</p>}
                      {selectedClient.email && <p><strong>الإيميل:</strong> {selectedClient.email}</p>}
                      {selectedClient.address && <p><strong>العنوان:</strong> {selectedClient.address}</p>}
                      {selectedClient.notes && <p><strong>ملاحظات:</strong> {selectedClient.notes}</p>}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-right mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        الرصيد المالي
                      </h4>
                      <div className="space-y-1 text-right text-sm">
                        <p>إجمالي الرسوم: {clientBalance.totalFees.toLocaleString()} ل.س</p>
                        <p>إجمالي الدفعات: {clientBalance.totalPayments.toLocaleString()} ل.س</p>
                        <p>إجمالي المصروفات: {clientBalance.totalExpenses.toLocaleString()} ل.س</p>
                        <p className={`font-semibold ${clientBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          الرصيد: {clientBalance.balance.toLocaleString()} ل.س
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="fees" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="المبلغ"
                        value={newFee.amount}
                        onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                        className="text-right"
                        dir="rtl"
                      />
                      <Input
                        placeholder="الوصف"
                        value={newFee.description}
                        onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                        className="text-right"
                        dir="rtl"
                      />
                      <Button onClick={handleAddFee}>إضافة</Button>
                    </div>
                    <div className="space-y-2">
                      {clientFees.map((fee) => (
                        <div key={fee.id} className="p-3 border rounded-lg text-right">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{Number(fee.amount).toLocaleString()} ل.س</span>
                            <span className="text-sm text-gray-500">{formatSyrianDate(fee.feeDate)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{fee.description}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="المبلغ"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                        className="text-right"
                        dir="rtl"
                      />
                      <Input
                        placeholder="الوصف"
                        value={newPayment.description}
                        onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                        className="text-right"
                        dir="rtl"
                      />
                      <Button onClick={handleAddPayment}>إضافة</Button>
                    </div>
                    <div className="space-y-2">
                      {clientPayments.map((payment) => (
                        <div key={payment.id} className="p-3 border rounded-lg text-right">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-green-600">{Number(payment.amount).toLocaleString()} ل.س</span>
                            <span className="text-sm text-gray-500">{formatSyrianDate(payment.paymentDate)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{payment.description}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="expenses" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="المبلغ"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="text-right"
                        dir="rtl"
                      />
                      <Input
                        placeholder="الوصف"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className="text-right"
                        dir="rtl"
                      />
                      <Button onClick={handleAddExpense}>إضافة</Button>
                    </div>
                    <div className="space-y-2">
                      {clientExpenses.map((expense) => (
                        <div key={expense.id} className="p-3 border rounded-lg text-right">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-red-600">{Number(expense.amount).toLocaleString()} ل.س</span>
                            <span className="text-sm text-gray-500">{formatSyrianDate(expense.expenseDate)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{expense.description}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Clients;
