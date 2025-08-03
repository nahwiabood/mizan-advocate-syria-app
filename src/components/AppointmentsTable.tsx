
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus, MapPin, Clock } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { formatSyrianTime } from '@/utils/dateUtils';
import { AddAppointmentDialog } from './AddAppointmentDialog';
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

interface Appointment {
  id: string;
  title: string;
  description?: string;
  appointmentDate: Date;
  time?: string;
  duration: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentsTableProps {
  appointments: Appointment[];
  onAppointmentUpdate: () => Promise<void>;
  selectedDate: Date;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onAppointmentUpdate,
  selectedDate
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null);

  const handleAddAppointment = async (appointmentData: any) => {
    try {
      await dataStore.addAppointment(appointmentData);
      await onAppointmentUpdate();
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const handleDeleteAppointment = async () => {
    if (deleteAppointment) {
      try {
        await dataStore.deleteAppointment(deleteAppointment.id);
        await onAppointmentUpdate();
        setDeleteAppointment(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة موعد جديد
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الوقت</TableHead>
              <TableHead className="text-right">المكان</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="text-right font-medium">
                  {appointment.title}
                </TableCell>
                <TableCell className="text-right">
                  {appointment.time ? (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {formatSyrianTime(appointment.time)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">غير محدد</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {appointment.location ? (
                    <div className="flex items-center gap-1 justify-end">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{appointment.location}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">غير محدد</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="max-w-xs truncate">
                    {appointment.description || 'لا يوجد وصف'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAppointment(appointment)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  لا توجد مواعيد في هذا التاريخ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddAppointmentDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleAddAppointment}
        selectedDate={selectedDate}
      />

      <AlertDialog open={!!deleteAppointment} onOpenChange={() => setDeleteAppointment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
