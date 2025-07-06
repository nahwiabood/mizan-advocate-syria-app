
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import { Client, ClientStatement } from '@/types';
import { dataStore } from '@/store/dataStore';

interface ClientStatementDialogProps {
  client: Client;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientStatementDialog: React.FC<ClientStatementDialogProps> = ({
  client,
  isOpen,
  onOpenChange,
}) => {
  const [statement, setStatement] = useState<ClientStatement | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && client) {
      const clientStatement = dataStore.getClientStatement(client.id);
      setStatement(clientStatement);
    }
  }, [isOpen, client]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = `
        <html>
          <head>
            <title>كشف حساب - ${client.name}</title>
            <style>
              body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .client-info { margin-bottom: 20px; }
              .balance-summary { margin-bottom: 30px; }
              .case-section { margin-bottom: 40px; page-break-inside: avoid; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
              th { background-color: #f5f5f5; }
              .total-row { font-weight: bold; background-color: #f9f9f9; }
              .balance-positive { color: #dc2626; }
              .balance-negative { color: #16a34a; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `;

      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA').format(date);
  };

  if (!statement) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>كشف حساب الموكل</DialogTitle>
          </DialogHeader>
          <div className="text-center p-8">
            <p>جاري تحميل البيانات...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            كشف حساب الموكل: {client.name}
            <Button onClick={handlePrint} className="no-print">
              <Printer className="w-4 h-4 mr-2" />
              طباعة
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef}>
          <div className="header">
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>كشف حساب موكل</h1>
            <p style={{ fontSize: '14px', color: '#666' }}>تاريخ الإصدار: {formatDate(new Date())}</p>
          </div>

          <div className="client-info">
            <Card>
              <CardHeader>
                <CardTitle>بيانات الموكل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>الاسم:</strong> {statement.client.name}
                  </div>
                  <div>
                    <strong>الهاتف:</strong> {statement.client.phone || 'غير محدد'}
                  </div>
                  <div>
                    <strong>البريد الإلكتروني:</strong> {statement.client.email || 'غير محدد'}
                  </div>
                  <div>
                    <strong>الهوية الوطنية:</strong> {statement.client.nationalId || 'غير محدد'}
                  </div>
                  {statement.client.address && (
                    <div className="col-span-2">
                      <strong>العنوان:</strong> {statement.client.address}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="balance-summary">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الحساب العام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">إجمالي الأتعاب</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(statement.totalBalance.totalFees)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">إجمالي المصاريف</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(statement.totalBalance.totalExpenses)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">إجمالي الدفعات</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(statement.totalBalance.totalPayments)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">الرصيد النهائي</p>
                    <p className={`text-xl font-bold ${statement.totalBalance.balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                      {formatCurrency(Math.abs(statement.totalBalance.balance))}
                      {statement.totalBalance.balance >= 0 ? ' مدين' : ' دائن'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          <div className="cases-section">
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>تفاصيل القضايا</h2>

            {statement.cases.map((caseStatement, index) => (
              <div key={caseStatement.case.id} className="case-section">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      القضية {index + 1}: {caseStatement.case.title}
                    </CardTitle>
                    <div className="text-sm text-gray-600">
                      <p><strong>الخصم:</strong> {caseStatement.case.opponent}</p>
                      <p><strong>الموضوع:</strong> {caseStatement.case.subject}</p>
                      <p><strong>نوع القضية:</strong> {caseStatement.case.caseType}</p>
                      <p><strong>الحالة:</strong> {
                        caseStatement.case.status === 'active' ? 'نشطة' :  
                        caseStatement.case.status === 'closed' ? 'مغلقة' : 'معلقة'
                      }</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">الأتعاب</p>
                        <p className="font-bold text-blue-600">{formatCurrency(caseStatement.balance.totalFees)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">المصاريف</p>
                        <p className="font-bold text-orange-600">{formatCurrency(caseStatement.balance.totalExpenses)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">الدفعات</p>
                        <p className="font-bold text-green-600">{formatCurrency(caseStatement.balance.totalPayments)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">رصيد القضية</p>
                        <p className={`font-bold ${caseStatement.balance.balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(caseStatement.balance.balance))}
                          {caseStatement.balance.balance >= 0 ? ' مدين' : ' دائن'}
                        </p>
                      </div>
                    </div>

                    {/* الأتعاب */}
                    {caseStatement.fees.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">الأتعاب:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>التاريخ</TableHead>
                              <TableHead>الوصف</TableHead>
                              <TableHead>المبلغ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {caseStatement.fees.map((fee) => (
                              <TableRow key={fee.id}>
                                <TableCell>{formatDate(fee.feeDate)}</TableCell>
                                <TableCell>{fee.description}</TableCell>
                                <TableCell>{formatCurrency(fee.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* المصاريف */}
                    {caseStatement.expenses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">المصاريف:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>التاريخ</TableHead>
                              <TableHead>الوصف</TableHead>
                              <TableHead>المبلغ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {caseStatement.expenses.map((expense) => (
                              <TableRow key={expense.id}>
                                <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* الدفعات */}
                    {caseStatement.payments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">الدفعات:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>التاريخ</TableHead>
                              <TableHead>الوصف</TableHead>
                              <TableHead>المبلغ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {caseStatement.payments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                <TableCell>{payment.description}</TableCell>
                                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
            <p>تم إنشاء هذا الكشف بواسطة نظام إدارة المكاتب القانونية</p>
            <p>{formatDate(new Date())}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientStatementDialog;
