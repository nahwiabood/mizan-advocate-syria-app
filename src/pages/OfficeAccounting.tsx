
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { supabaseStore } from "@/store/supabaseStore";
import { useToast } from "@/hooks/use-toast";
import { formatSyrianDate } from "@/utils/dateUtils";

const OfficeAccounting = () => {
  const { officeIncome, officeExpenses, refetch } = useSupabaseData();
  const { toast } = useToast();
  
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  
  const [newIncome, setNewIncome] = useState({
    amount: "",
    description: "",
    incomeDate: new Date(),
    source: ""
  });
  
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    expenseDate: new Date(),
    category: ""
  });

  const handleAddIncome = async () => {
    if (!newIncome.amount || !newIncome.description || !newIncome.source) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseStore.addOfficeIncome({
        amount: Number(newIncome.amount),
        description: newIncome.description,
        incomeDate: newIncome.incomeDate,
        source: newIncome.source
      });
      
      setNewIncome({ amount: "", description: "", incomeDate: new Date(), source: "" });
      setIsIncomeDialogOpen(false);
      await refetch();
      
      toast({
        title: "تم إضافة الإيراد",
        description: "تم إضافة الإيراد بنجاح"
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الإيراد",
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.category) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseStore.addOfficeExpense({
        amount: Number(newExpense.amount),
        description: newExpense.description,
        expenseDate: newExpense.expenseDate,
        category: newExpense.category
      });
      
      setNewExpense({ amount: "", description: "", expenseDate: new Date(), category: "" });
      setIsExpenseDialogOpen(false);
      await refetch();
      
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

  const totalIncome = officeIncome.reduce((sum, income) => sum + Number(income.amount), 0);
  const totalExpenses = officeExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-right">محاسبة المكتب</h1>
          <div className="flex gap-2">
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" variant="default">
                  <Plus className="h-4 w-4" />
                  إضافة إيراد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة إيراد جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-right">
                    <Label htmlFor="income-amount" className="text-right">المبلغ</Label>
                    <Input
                      id="income-amount"
                      type="number"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="income-source" className="text-right">المصدر</Label>
                    <Input
                      id="income-source"
                      value={newIncome.source}
                      onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                      className="text-right"
                      dir="rtl"
                      placeholder="مثال: أتعاب قضية، استشارة قانونية"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="income-description" className="text-right">الوصف</Label>
                    <Textarea
                      id="income-description"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <Button onClick={handleAddIncome} className="w-full">
                    إضافة الإيراد
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" variant="outline">
                  <Plus className="h-4 w-4" />
                  إضافة مصروف
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة مصروف جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-right">
                    <Label htmlFor="expense-amount" className="text-right">المبلغ</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="expense-category" className="text-right">الفئة</Label>
                    <Input
                      id="expense-category"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="text-right"
                      dir="rtl"
                      placeholder="مثال: مصاريف إدارية، رسوم محكمة، مواصلات"
                    />
                  </div>
                  <div className="text-right">
                    <Label htmlFor="expense-description" className="text-right">الوصف</Label>
                    <Textarea
                      id="expense-description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <Button onClick={handleAddExpense} className="w-full">
                    إضافة المصروف
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي الإيرادات</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 text-right">
                {totalIncome.toLocaleString()} ل.س
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">إجمالي المصروفات</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 text-right">
                {totalExpenses.toLocaleString()} ل.س
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-right">صافي الربح</CardTitle>
              <Calculator className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-right ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit.toLocaleString()} ل.س
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              الإيرادات
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              المصروفات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">سجل الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المصدر</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {officeIncome.map((income) => (
                      <TableRow key={`income-${income.id}`}>
                        <TableCell className="text-right">
                          {formatSyrianDate(income.incomeDate)}
                        </TableCell>
                        <TableCell className="text-right">{income.source}</TableCell>
                        <TableCell className="text-right">{income.description}</TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          {Number(income.amount).toLocaleString()} ل.س
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {officeIncome.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد إيرادات
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">سجل المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {officeExpenses.map((expense) => (
                      <TableRow key={`expense-${expense.id}`}>
                        <TableCell className="text-right">
                          {formatSyrianDate(expense.expenseDate)}
                        </TableCell>
                        <TableCell className="text-right">{expense.category}</TableCell>
                        <TableCell className="text-right">{expense.description}</TableCell>
                        <TableCell className="text-right text-red-600 font-semibold">
                          {Number(expense.amount).toLocaleString()} ل.س
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {officeExpenses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد مصروفات
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OfficeAccounting;
