
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, Edit2, Trash2, Calendar, AlertCircle, Clock } from 'lucide-react';
import { Task } from '@/types';
import { formatSyrianDate } from '@/utils/dateUtils';
import { EditTaskDialog } from './EditTaskDialog';
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

interface TasksTableProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (updatedTask: Task) => Promise<void>;
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const completedTasks = tasks.filter(task => task.isCompleted);
  const pendingTasks = tasks.filter(task => !task.isCompleted);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Circle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    await onUpdateTask(updatedTask);
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (deleteTask) {
      onDeleteTask(deleteTask.id);
      setDeleteTask(null);
    }
  };

  const TaskRow = ({ task }: { task: Task }) => (
    <TableRow key={task.id}>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleComplete(task.id)}
          className="p-1"
        >
          {task.isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" />
          )}
        </Button>
      </TableCell>
      <TableCell className="text-right">
        <div className={task.isCompleted ? 'line-through text-gray-500' : ''}>
          {task.title}
        </div>
        {task.description && (
          <div className="text-sm text-muted-foreground mt-1">
            {task.description}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {task.dueDate ? (
          <div className="flex items-center gap-1 justify-end">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatSyrianDate(task.dueDate)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">غير محدد</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Badge variant="outline" className={`${getPriorityColor(task.priority)} flex items-center gap-1 w-fit`}>
          {getPriorityIcon(task.priority)}
          {getPriorityText(task.priority)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {task.completedAt ? (
          <span className="text-sm text-muted-foreground">
            {formatSyrianDate(task.completedAt)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingTask(task)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteTask(task)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2" dir="rtl">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Circle className="h-4 w-4" />
            المهام المعلقة ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            المهام المنجزة ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-12"></TableHead>
                  <TableHead className="text-right">المهمة</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">تاريخ الإنجاز</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {pendingTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد مهام معلقة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-12"></TableHead>
                  <TableHead className="text-right">المهمة</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">تاريخ الإنجاز</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {completedTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد مهام منجزة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {editingTask && (
        <EditTaskDialog
          isOpen={true}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onSave={handleEditTask}
        />
      )}

      <AlertDialog open={!!deleteTask} onOpenChange={() => setDeleteTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
