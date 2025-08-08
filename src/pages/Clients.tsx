import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, FileText, DollarSign } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, ClientFee, ClientPayment, ClientExpense, ClientBalance } from '@/types';
import { useToast } from '@/hooks/use-toast';
import AddClientDialog from '@/components/AddClientDialog';
import EditClientDialog from '@/components/EditClientDialog';
import AddFeeDialog from '@/components/AddFeeDialog';
import AddPaymentDialog from '@/components/AddPaymentDialog';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import { AccountingTable } from '@/components/AccountingTable';
import { EditEntryDialog } from '@/components/EditEntryDialog';

interface AccountingEntry {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: 'fee' | 'payment' | 'expense';
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientFees, setClientFees] = useState<ClientFee[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [clientExpenses, setClientExpenses] = useState<ClientExpense[]>([]);
  const [clientBalance, setClientBalance] = useState<ClientBalance>({
    totalFees: 0,
    totalPayments: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [editingEntry, setEditingEntry] = useState<{ id: string; type: 'fee' | 'payment' | 'expense' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientData(selectedClient.id);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const clientsData = await dataStore.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadClientData = async (clientId: string) => {
    try {
      const [fees, payments, expenses, balance] = await Promise.all([
        dataStore.getClientFees(clientId),
        dataStore.getClientPayments(clientId),
        dataStore.getClientExpenses(clientId),
        dataStore.getClientBalance(clientId)
      ]);

      // Sort by date (newest first)
      const sortedFees = fees.sort((a, b) => new Date(b.feeDate).getTime() - new Date(a.feeDate).getTime());
      const sortedPayments = payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      const sortedExpenses = expenses.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());

      setClientFees(sortedFees);
      setClientPayments(sortedPayments);
      setClientExpenses(sortedExpenses);
      setClientBalance(balance);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموكل؟')) {
      try {
        await dataStore.deleteClient(clientId);
        toast({
          title: 'نجح',
          description: 'تم حذف الموكل بنجاح'
        });
        loadClients();
        if (selectedClient?.id === clientId) {
          setSelectedClient(null);
        }
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في حذف الموكل',
          variant: 'destructive'
        });
      }
    }
  };

  const handleEditEntry = async (entry: any, type: string) => {
    const updatedData = { ...entry };
    delete updatedData.id;

    try {
      if (type === 'fee') {
        await dataStore.updateClientFee(entry.id, updatedData);
      } else if (type === 'payment') {
        await dataStore.updateClientPayment(entry.id, updatedData);
      } else if (type === 'expense') {
        await dataStore.updateClientExpense(entry.id, updatedData);
      }
      
      if (selectedClient) {
        await loadClientData(selectedClient.id);
      }
      
      toast({
        title: 'نجح',
        description: 'تم تحديث القيد بنجاح'
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث القيد',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEntry = async (id: string, type: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القيد؟')) {
      try {
        if (type === 'fee') {
          await dataStore.deleteClientFee(id);
        } else if (type === 'payment') {
          await dataStore.deleteClientPayment(id);
        } else if (type === 'expense') {
          await dataStore.deleteClientExpense(id);
        }
        
        if (selectedClient) {
          await loadClientData(selectedClient.id);
        }
        
        toast({
          title: 'نجح',
          description: 'تم حذف القيد بنجاح'
        });
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل في حذف القيد',
          variant: 'destructive'
        });
      }
    }
  };

  // Transform data for AccountingTable
  const transformToAccountingEntries = (
    items: (ClientFee | ClientPayment | ClientExpense)[],
    type: 'fee' | 'payment' | 'expense'
  ): AccountingEntry[] => {
    return items.map(item => ({
      id: item.id,
      description: item.description,
      amount: item.amount,
      date: type === 'fee' 
        ? (item as ClientFee).feeDate 
        : type === 'payment' 
        ? (item as ClientPayment).paymentDate 
        : (item as ClientExpense).expenseDate,
      type
    }));
  };

  if (!selectedClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">الموكلين</h1>
          <AddClientDialog onClientAdded={loadClients} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{client.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingClient(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.phone && (
                  <div className="text-sm text-muted-foreground mb-2">
                    هاتف: {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="text-sm text-muted-foreground mb-2">
                    بريد إلكتروني: {client.email}
                  </div>
                )}
                <Button
                  onClick={() => setSelectedClient(client)}
                  className="w-full mt-4"
                >
                  <FileText className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingClient && (
          <EditClientDialog
            client={editingClient}
            isOpen={!!editingClient}
            onClose={() => setEditingClient(null)}
            onClientUpdated={() => {
              loadClients();
              setEditingClient(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedClient(null)}
          >
            ← العودة للقائمة
          </Button>
          <h1 className="text-3xl font-bold">{selectedClient.name}</h1>
        </div>
        <div className="flex gap-2">
          <AddFeeDialog clientId={selectedClient.id} onFeeAdded={() => loadClientData(selectedClient.id)} />
          <AddPaymentDialog clientId={selectedClient.id} onPaymentAdded={() => loadClientData(selectedClient.id)} />
          <AddExpenseDialog clientId={selectedClient.id} onExpenseAdded={() => loadClientData(selectedClient.id)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأتعاب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clientBalance.totalFees.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {clientBalance.totalPayments.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {clientBalance.totalExpenses.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الرصيد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${clientBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {clientBalance.balance.toLocaleString()} ر.س
            </div>
            <Badge variant={clientBalance.balance >= 0 ? 'default' : 'destructive'} className="mt-1">
              {clientBalance.balance >= 0 ? 'دائن' : 'مدين'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fees">الأتعاب</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="expenses">المصروفات</TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>الأتعاب</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountingTable
                entries={transformToAccountingEntries(clientFees, 'fee')}
                type="fee"
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>المدفوعات</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountingTable
                entries={transformToAccountingEntries(clientPayments, 'payment')}
                type="payment"
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountingTable
                entries={transformToAccountingEntries(clientExpenses, 'expense')}
                type="expense"
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingEntry && (
        <EditEntryDialog
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          entry={editingEntry}
        />
      )}
    </div>
  );
}
