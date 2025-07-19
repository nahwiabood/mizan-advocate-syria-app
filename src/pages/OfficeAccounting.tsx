
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from 'lucide-react';
import { formatSyrianDate } from '@/utils/dateUtils';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabaseStore } from '@/store/supabaseStore';
import { OfficeIncome, OfficeExpense } from '@/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const OfficeAccounting = () => {
  const { officeIncome, officeExpenses, loading, refetch } = useSupabaseData();
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<OfficeIncome | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<OfficeExpense | null>(null);
  const [newIncome, setNewIncome] = useState({
    description: '',
    amount: '',
    source: '',
    incomeDate: new Date()
  });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    expenseDate: new Date()
  });

  const totalIncome = officeIncome.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = officeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const handleAddIncome = async () => {
    if (!newIncome.description.trim() || !newIncome.amount || !newIncome.source.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseStore.addOfficeIncome({
        description: newIncome.description.trim(),
        amount: parseFloat(newIncome.amount),
        source: newIncome.source.trim(),
        incomeDate: newIncome.incomeDate
      });

      setNewIncome({
        description: '',
        amount: '',
        source: '',
        incomeDate: new Date()
      });
      setIsIncomeDialogOpen(false);
      await refetch();
      
      toast({
        title: "تم الحفظ",
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
    if (!newExpense.description.trim() || !newExpense.amount || !newExpense.category.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseStore.addOfficeExpense({
        description: newExpense.description.trim(),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category.trim(),
        expenseDate: newExpense.expenseDate
      });

      setNewExpense({
        description: '',
        amount: '',
        category: '',
        expenseDate: new Date()
      });
      setIsExpenseDialogOpen(false);
      await refetch();
      
      toast({
        title: "تم الحفظ",
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

  const handleDeleteIncome = async (id: string) => {
    try {
      await supabaseStore.deleteOfficeIncome(id);
      await refetch();
      toast({
        title: "تم الحذف",
        description: "تم حذف الإيراد بنجاح"
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الإيراد",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await supabaseStore.deleteOfficeExpense(id);
      await refetch();
      toast({
        title: "تم الحذف",
        description: "تم حذف المصروف بنجاح"
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المصروف",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">محاسبة المكتب</h1>
          <p className="text-gray-600">إدارة الإيرادات والمصروفات العامة للمكتب</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-green-600 ml-2" />
                <div className="text-2xl font-bold text-green-600">
                  {totalIncome.toLocaleString()} ل.س
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">إجمالي المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingDown className="h-6 w-6 text-red-600 ml-2" />
                <div className="text-2xl font-bold text-red-600">
                  {totalExpenses.toLocaleString()} ل.س
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                صافي الربح/الخسارة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className={`h-6 w-6 ml-2 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {netProfit.toLocaleString()} ل.س
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">عدد العمليات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {officeIncome.length + officeExpenses.length}
              </div>
              <p className="text-xs text-gray-500">
                {officeIncome.length} إيراد، {officeExpenses.length} مصروف
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-600">الإيرادات</CardTitle>
                <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
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
                        <Label htmlFor="income-description" className="text-right">وصف الإيراد *</Label>
                        <Input
                          id="income-description"
                          value={newIncome.description}
                          onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                          placeholder="وصف الإيراد"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="income-amount" className="text-right">المبلغ *</Label>
                        <Input
                          id="income-amount"
                          type="number"
                          value={newIncome.amount}
                          onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                          placeholder="المبلغ بالليرة السورية"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="income-source" className="text-right">مصدر الإيراد *</Label>
                        <Input
                          id="income-source"
                          value={newIncome.source}
                          onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                          placeholder="مصدر الإيراد"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="text-right">
                        <Label className="text-right">تاريخ الإيراد *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-right font-normal",
                                !newIncome.incomeDate && "text-muted-foreground"
                              )}
                              dir="rtl"
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {formatSyrianDate(newIncome.incomeDate)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newIncome.incomeDate}
                              onSelect={(date) => date && setNewIncome({ ...newIncome, incomeDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button onClick={handleAddIncome} className="w-full">
                        إضافة الإيراد
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {officeIncome.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {officeIncome.map((income) => (
                    <div key={`income-${income.id}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-green-800">{income.description}</div>
                        <div className="text-sm text-green-600">المصدر: {income.source}</div>
                        <div className="text-xs text-gray-500">التاريخ: {formatSyrianDate(income.incomeDate)}</div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-green-600 text-lg">
                          {income.amount.toLocaleString()} ل.س
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIncome(income.id)}
                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد إيرادات مسجلة
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-600">المصروفات</CardTitle>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-red-600 hover:bg-red-700">
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
                        <Label htmlFor="expense-description" className="text-right">وصف المصروف *</Label>
                        <Input
                          id="expense-description"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                          placeholder="وصف المصروف"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="expense-amount" className="text-right">المبلغ *</Label>
                        <Input
                          id="expense-amount"
                          type="number"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          placeholder="المبلغ بالليرة السورية"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="text-right">
                        <Label htmlFor="expense-category" className="text-right">فئة المصروف *</Label>
                        <Input
                          id="expense-category"
                          value={newExpense.category}
                          onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                          placeholder="فئة المصروف"
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                      <div className="text-right">
                        <Label className="text-right">تاريخ المصروف *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-right font-normal",
                                !newExpense.expenseDate && "text-muted-foreground"
                              )}
                              dir="rtl"
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {formatSyrianDate(newExpense.expenseDate)}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newExpense.expenseDate}
                              onSelect={(date) => date && setNewExpense({ ...newExpense, expenseDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button onClick={handleAddExpense} className="w-full">
                        إضافة المصروف
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {officeExpenses.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {officeExpenses.map((expense) => (
                    <div key={`expense-${expense.id}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-red-800">{expense.description}</div>
                        <div className="text-sm text-red-600">الفئة: {expense.category}</div>
                        <div className="text-xs text-gray-500">التاريخ: {formatSyrianDate(expense.expenseDate)}</div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-red-600 text-lg">
                          {expense.amount.toLocaleString()} ل.س
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد مصروفات مسجلة
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficeAccounting;
