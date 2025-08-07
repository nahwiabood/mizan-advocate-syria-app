import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Client, ClientBalance, ClientFee, ClientPayment, ClientExpense } from '@/types';
import { Layout } from '@/components/Layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AccountingTable } from '@/components/AccountingTable';
import { AddClientDialog } from '@/components/AddClientDialog';
import { EditClientDialog } from '@/components/EditClientDialog';
import { AddFeeDialog } from '@/components/AddFeeDialog';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { EditEntryDialog } from '@/components/EditEntryDialog';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientBalances, setClientBalances] = useState<{ [key: string]: ClientBalance }>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isEditEntryDialogOpen, setIsEditEntryDialogOpen] = useState(false);
  const [selectedClientForFee, setSelectedClientForFee] = useState<string | null>(null);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<string | null>(null);
  const [selectedClientForExpense, setSelectedClientForExpense] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [editingEntry, setEditingEntry] = useState<{ id: string, type: 'fee' | 'payment' | 'expense' } | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<{ id: string, type: 'fee' | 'payment' | 'expense' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsData, feesData, paymentsData, expensesData] = await Promise.all([
        dataStore.getClients(),
        dataStore.getAllClientFees(),
        dataStore.getAllClientPayments(),
        dataStore.getAllClientExpenses()
      ]);

      setClients(clientsData);
      
      // Create client balance map
      const balanceMap: { [key: string]: ClientBalance } = {};
      
      clientsData.forEach(client => {
        const clientFees = feesData.filter(f => f.clientId === client.id);
        const clientPayments = paymentsData.filter(p => p.clientId === client.id);
        const clientExpenses = expensesData.filter(e => e.clientId === client.id);

        // Sort by date
        const sortedFees = clientFees.sort((a, b) => new Date(b.feeDate).getTime() - new Date(a.feeDate).getTime());
        const sortedPayments = clientPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        const sortedExpenses = clientExpenses.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());

        balanceMap[client.id] = {
          totalFees: clientFees.reduce((sum, f) => sum + f.amount, 0),
          totalPayments: clientPayments.reduce((sum, p) => sum + p.amount, 0),
          totalExpenses: clientExpenses.reduce((sum, e) => sum + e.amount, 0),
          balance: 0, // Will be calculated
          fees: sortedFees,
          payments: sortedPayments,
          expenses: sortedExpenses
        };
        
        // Calculate balance
        balanceMap[client.id].balance = 
          balanceMap[client.id].totalFees - 
          balanceMap[client.id].totalPayments - 
          balanceMap[client.id].totalExpenses;
      });

      setClientBalances(balanceMap);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleClientAdded = async () => {
    setIsAddDialogOpen(false);
    await loadData();
  };

  const handleClientUpdated = async () => {
    setEditingClient(null);
    await loadData();
  };

  const handleClientDeleted = async () => {
    if (!deletingClient) return;

    try {
      await dataStore.deleteClient(deletingClient.id);
      setDeletingClient(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleFeeAdded = async () => {
    setIsAddFeeDialogOpen(false);
    await loadData();
  };

  const handlePaymentAdded = async () => {
    setIsAddPaymentDialogOpen(false);
    await loadData();
  };

  const handleExpenseAdded = async () => {
    setIsAddExpenseDialogOpen(false);
    await loadData();
  };

  const handleEntryUpdated = async () => {
    setIsEditEntryDialogOpen(false);
    setEditingEntry(null);
    await loadData();
  };

  const handleEntryDeleted = async () => {
    if (!deletingEntry) return;

    try {
      if (deletingEntry.type === 'fee') {
        await dataStore.deleteClientFee(deletingEntry.id);
      } else if (deletingEntry.type === 'payment') {
        await dataStore.deleteClientPayment(deletingEntry.id);
      } else if (deletingEntry.type === 'expense') {
        await dataStore.deleteClientExpense(deletingEntry.id);
      }
      setIsDeleteDialogOpen(false);
      setDeletingEntry(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">إدارة الموكلين</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة موكل جديد
          </Button>
        </div>

        <div className="grid gap-6">
          {clients.map((client) => {
            const balance = clientBalances[client.id];
            if (!balance) return null;

            return (
              <Card key={client.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{client.name}</CardTitle>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{client.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left space-y-2">
                      <Badge 
                        variant={balance.balance >= 0 ? "default" : "destructive"}
                        className="text-lg px-3 py-1"
                      >
                        الرصيد: {balance.balance.toLocaleString()} ل.س
                      </Badge>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingClient(client)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          تعديل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingClient(client)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="fees" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="fees" className="text-green-600">
                        الأتعاب ({balance.fees?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="payments" className="text-blue-600">
                        المقبوضات ({balance.payments?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="expenses" className="text-red-600">
                        المصروفات ({balance.expenses?.length || 0})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="fees" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-green-600">
                          الأتعاب - المجموع: {balance.totalFees.toLocaleString()} ل.س
                        </h3>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClientForFee(client.id);
                            setIsAddFeeDialogOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          إضافة أتعاب
                        </Button>
                      </div>
                      {balance.fees && balance.fees.length > 0 ? (
                        <AccountingTable
                          entries={balance.fees}
                          type="fee"
                          onEdit={(entry) => {
                            setEditingEntry({ ...entry, type: 'fee' });
                            setIsEditEntryDialogOpen(true);
                          }}
                          onDelete={(entry) => {
                            setDeletingEntry({ ...entry, type: 'fee' });
                            setIsDeleteDialogOpen(true);
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          لا توجد أتعاب مسجلة
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-blue-600">
                          المقبوضات - المجموع: {balance.totalPayments.toLocaleString()} ل.س
                        </h3>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClientForPayment(client.id);
                            setIsAddPaymentDialogOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          إضافة مقبوض
                        </Button>
                      </div>
                      {balance.payments && balance.payments.length > 0 ? (
                        <AccountingTable
                          entries={balance.payments}
                          type="payment"
                          onEdit={(entry) => {
                            setEditingEntry({ ...entry, type: 'payment' });
                            setIsEditEntryDialogOpen(true);
                          }}
                          onDelete={(entry) => {
                            setDeletingEntry({ ...entry, type: 'payment' });
                            setIsDeleteDialogOpen(true);
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          لا توجد مقبوضات مسجلة
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="expenses" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-red-600">
                          المصروفات - المجموع: {balance.totalExpenses.toLocaleString()} ل.س
                        </h3>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClientForExpense(client.id);
                            setIsAddExpenseDialogOpen(true);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          إضافة مصروف
                        </Button>
                      </div>
                      {balance.expenses && balance.expenses.length > 0 ? (
                        <AccountingTable
                          entries={balance.expenses}
                          type="expense"
                          onEdit={(entry) => {
                            setEditingEntry({ ...entry, type: 'expense' });
                            setIsEditEntryDialogOpen(true);
                          }}
                          onDelete={(entry) => {
                            setDeletingEntry({ ...entry, type: 'expense' });
                            setIsDeleteDialogOpen(true);
                          }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          لا توجد مصروفات مسجلة
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <AddClientDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onClientAdded={handleClientAdded} />

        <EditClientDialog isOpen={!!editingClient} onClose={() => setEditingClient(null)} client={editingClient} onClientUpdated={handleClientUpdated} />

        <AddFeeDialog isOpen={isAddFeeDialogOpen} onClose={() => setIsAddFeeDialogOpen(false)} clientId={selectedClientForFee} onFeeAdded={handleFeeAdded} />

        <AddPaymentDialog isOpen={isAddPaymentDialogOpen} onClose={() => setIsAddPaymentDialogOpen(false)} clientId={selectedClientForPayment} onPaymentAdded={handlePaymentAdded} />

        <AddExpenseDialog isOpen={isAddExpenseDialogOpen} onClose={() => setIsAddExpenseDialogOpen(false)} clientId={selectedClientForExpense} onExpenseAdded={handleExpenseAdded} />

        <EditEntryDialog isOpen={!!editingEntry} onClose={() => setEditingEntry(null)} entry={editingEntry} onEntryUpdated={handleEntryUpdated} />

        <AlertDialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                هل أنت متأكد من حذف هذا الموكل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleClientDeleted} className="bg-red-600 hover:bg-red-700">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deletingEntry} onOpenChange={() => setIsDeleteDialogOpen(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleEntryDeleted} className="bg-red-600 hover:bg-red-700">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Clients;
