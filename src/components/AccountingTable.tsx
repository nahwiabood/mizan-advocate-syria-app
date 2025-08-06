
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Search } from 'lucide-react';
import { EditEntryDialog } from './EditEntryDialog';
import { formatSyrianDate } from '@/utils/dateUtils';
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

interface AccountingEntry {
  id: string;
  description: string;
  amount: number;
  date: string | Date;
  type: 'payment' | 'expense';
  source?: string;
  client_id?: string;
  case_id?: string;
  entryType?: string;
}

interface AccountingTableProps {
  entries: AccountingEntry[];
  onEdit: (entry: any, type: string) => Promise<void>;
  onDelete: (id: string, type: string) => Promise<void>;
  getClientName?: (clientId: string) => string;
}

export const AccountingTable: React.FC<AccountingTableProps> = ({
  entries,
  onEdit,
  onDelete,
  getClientName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [deleteEntry, setDeleteEntry] = useState<any>(null);

  const filteredEntries = entries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.source && entry.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
    entry.amount.toString().includes(searchTerm) ||
    (entry.client_id && getClientName && getClientName(entry.client_id).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = async (updatedEntry: any) => {
    await onEdit(updatedEntry, editingEntry.entryType);
    setEditingEntry(null);
  };

  const handleDelete = async () => {
    if (deleteEntry) {
      await onDelete(deleteEntry.id, deleteEntry.entryType);
      setDeleteEntry(null);
    }
  };

  const safeFormatDate = (date: any): string => {
    if (!date) return 'غير محدد';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
      return formatSyrianDate(dateObj);
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  const getEntrySource = (entry: AccountingEntry): string => {
    if (entry.client_id && getClientName) {
      const clientName = getClientName(entry.client_id);
      return clientName || entry.source || '-';
    }
    return entry.source || '-';
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="بحث في المحاسبة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-right pr-10"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">البيان</TableHead>
              <TableHead className="text-right">الموكل/المصدر</TableHead>
              <TableHead className="text-right">الدفعات</TableHead>
              <TableHead className="text-right">المصاريف</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={`${entry.type}-${entry.id}`}>
                <TableCell className="text-right">{safeFormatDate(entry.date)}</TableCell>
                <TableCell className="text-right">{entry.description}</TableCell>
                <TableCell className="text-right font-medium text-blue-600">
                  {getEntrySource(entry)}
                </TableCell>
                <TableCell className="text-right">
                  {entry.type === 'payment' ? (
                    <span className="text-green-600 font-medium">
                      {entry.amount.toLocaleString()} ل.س
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {entry.type === 'expense' ? (
                    <span className="text-red-600 font-medium">
                      {entry.amount.toLocaleString()} ل.س
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingEntry({ ...entry, entryType: entry.entryType || entry.type })}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteEntry({ ...entry, entryType: entry.entryType || entry.type })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد قيود محاسبية'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingEntry && (
        <EditEntryDialog
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          entry={editingEntry}
          onSave={handleEdit}
          type={editingEntry.entryType}
        />
      )}

      <AlertDialog open={!!deleteEntry} onOpenChange={() => setDeleteEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا القيد المحاسبي؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
