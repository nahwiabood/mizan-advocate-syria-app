
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus, Clock, MapPin, Calendar } from 'lucide-react';
import { Appointment } from '@/types';
import { formatSyrianTime, formatSyrianDate } from '@/utils/dateUtils';
import { dataStore } from '@/store/dataStore';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { EditAppointmentDialog } from './EditAppointmentDialog';

interface AppointmentsTableProps {
  appointments: Appointment[];
  onAppointmentUpdate: () => void;
  selectedDate?: Date;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onAppointmentUpdate,
  selectedDate
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      try {
        await dataStore.deleteAppointment(id);
        onAppointmentUpdate();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleEditComplete = () => {
    setEditingAppointment(null);
    onAppointmentUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          إضافة موعد جديد
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
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
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatSyrianDate(appointment.appointmentDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {appointment.time ? (
                    <div className="flex items-center gap-1 justify-end">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatSyrianTime(appointment.time)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">غير محدد</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {appointment.location ? (
                    <div className="flex items-center gap-1 justify-end">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.location}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">غير محدد</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {appointment.description ? (
                    <span className="text-sm">{appointment.description}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(appointment)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(appointment.id)}
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
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  لا توجد مواعيد في هذا التاريخ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddAppointmentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAppointmentAdded={onAppointmentUpdate}
      />

      {editingAppointment && (
        <EditAppointmentDialog
          isOpen={true}
          onClose={() => setEditingAppointment(null)}
          appointment={editingAppointment}
          onAppointmentUpdated={handleEditComplete}
        />
      )}
    </div>
  );
};
