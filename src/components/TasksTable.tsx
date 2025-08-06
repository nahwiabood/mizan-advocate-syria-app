
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Trash2, Plus, CheckCircle2, Clock } from 'lucide-react';
import { Task } from '@/types';
import { formatSyrianDate, isDatePast } from '@/utils/dateUtils';
import { dataStore } from '@/store/dataStore';
import { AddTaskDialog } from './AddTaskDialog';

interface TasksTableProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  onTaskUpdate
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleToggleTask = async (id: string, isCompleted: boolean) => {
    try {
      await dataStore.updateTask(id, { isCompleted: !isCompleted });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      try {
        await dataStore.deleteTask(id);
        onTaskUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  const TaskRow = ({ task }: { task: Task }) => (
    <TableRow key={task.id}>
      <TableCell className="text-right">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleToggleTask(task.id, task.isCompleted)}
            className={`p-1 rounded-full transition-colors ${
              task.isCompleted
                ? 'text-green-600 hover:bg-green-100'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <span className={task.isCompleted ? 'line-through text-muted-foreground' : ''}>
            {task.title}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        {task.dueDate ? (
          <div className="flex items-center gap-1 justify-end">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={isDatePast(new Date(task.dueDate)) && !task.isCompleted ? 'text-red-600' : ''}>
              {formatSyrianDate(task.dueDate)}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">غير محدد</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Badge variant={
          task.priority === 'high' ? 'destructive' :
          task.priority === 'medium' ? 'default' : 'secondary'
        }>
          {task.priority === 'high' ? 'عالية' :
           task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(task.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2 bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          إضافة مهمة جديدة
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            المهام غير المنجزة ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            المهام المنجزة ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المهمة</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {pendingTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      لا توجد مهام غير منجزة
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
                  <TableHead className="text-right">المهمة</TableHead>
                  <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {completedTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      لا توجد مهام منجزة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <AddTaskDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onTaskAdded={onTaskUpdate}
      />
    </div>
  );
};
