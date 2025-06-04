import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { formatSyrianDate } from '@/utils/dateUtils';
import { Task } from '@/types';
import { dataStore } from '@/store/dataStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TasksTableProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  onTaskUpdate
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: undefined as Date | undefined,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleAddTask = () => {
    if (!newTask.title) {
      return;
    }

    dataStore.addTask({
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      isCompleted: false,
    });

    setNewTask({
      title: '',
      description: '',
      dueDate: undefined,
      priority: 'medium',
    });
    setIsAddDialogOpen(false);
    onTaskUpdate();
  };

  const handleEditTask = () => {
    if (!selectedTask) return;
    
    dataStore.updateTask(selectedTask.id, {
      title: newTask.title || selectedTask.title,
      description: newTask.description || selectedTask.description,
      dueDate: newTask.dueDate || selectedTask.dueDate,
      priority: newTask.priority || selectedTask.priority,
    });
    
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: undefined,
      priority: 'medium',
    });
    onTaskUpdate();
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;
    
    dataStore.updateTask(taskId, { isCompleted: !task.isCompleted });
    onTaskUpdate();
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    
    dataStore.deleteTask(selectedTask.id);
    setIsDeleteDialogOpen(false);
    setSelectedTask(null);
    onTaskUpdate();
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
      priority: task.priority,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setNewTask({ ...newTask, [field]: e.target.value });
  };

  const handleSelectChange = (value: 'low' | 'medium' | 'high') => {
    setNewTask({ ...newTask, priority: value });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return 'متوسطة';
    }
  };

  const incompleteTasks = tasks.filter(task => !task.isCompleted);
  const completedTasks = tasks.filter(task => task.isCompleted);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-right">المهام الإدارية</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة مهمة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة مهمة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-right">
                  <Label htmlFor="title" className="text-right">عنوان المهمة</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                    placeholder="عنوان المهمة"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="description" className="text-right">الوصف (اختياري)</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                    placeholder="وصف المهمة"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label className="text-right">تاريخ الاستحقاق (اختياري)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right font-normal",
                          !newTask.dueDate && "text-muted-foreground"
                        )}
                        dir="rtl"
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {newTask.dueDate ? (
                          formatSyrianDate(newTask.dueDate)
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTask.dueDate}
                        onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-right">
                  <Label className="text-right">درجة الأهمية</Label>
                  <Select value={newTask.priority} onValueChange={handleSelectChange}>
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  إضافة المهمة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Incomplete Tasks */}
          {incompleteTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-right">المهام المعلقة</h3>
              <div className="space-y-3">
                {incompleteTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.isCompleted}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(task)}
                          className="gap-1 h-8"
                        >
                          <Edit className="h-4 w-4" />
                          تعديل
                        </Button>
                      </div>
                      
                      <div className="flex-1 text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                            {getPriorityText(task.priority)}
                          </Badge>
                          <h4 className="font-semibold text-lg">{task.title}</h4>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                            <span>{formatSyrianDate(task.dueDate)}</span>
                            <CalendarIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-right text-green-700">المهام المكتملة</h3>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.isCompleted}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                        />
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      
                      <div className="flex-1 text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            مكتملة
                          </Badge>
                          <h4 className="font-semibold text-lg line-through text-gray-600">{task.title}</h4>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-500 text-sm line-through">{task.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مهام
            </div>
          )}
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل المهمة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-title" className="text-right">عنوان المهمة</Label>
                <Input
                  id="edit-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="عنوان المهمة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-description" className="text-right">الوصف (اختياري)</Label>
                <Textarea
                  id="edit-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="وصف المهمة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label className="text-right">تاريخ الاستحقاق (اختياري)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right font-normal",
                        !newTask.dueDate && "text-muted-foreground"
                      )}
                      dir="rtl"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {newTask.dueDate ? (
                        formatSyrianDate(newTask.dueDate)
                      ) : (
                        <span>اختر التاريخ</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate}
                      onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label className="text-right">درجة الأهمية</Label>
                <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger className="text-right" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditTask} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="flex-1 gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-right">
              <p>هل أنت متأكد من رغبتك في حذف هذه المهمة؟</p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteTask}
                  className="flex-1"
                >
                  حذف
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
