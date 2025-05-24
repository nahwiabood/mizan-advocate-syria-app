import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar as CalendarIcon, Edit, Trash2, Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Task } from '@/types';
import { dataStore } from '@/store/dataStore';
import { formatSyrianDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface TasksTableProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export const TasksTable: React.FC<TasksTableProps> = ({ tasks, onTaskUpdate }) => {
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

  const completedTasks = tasks.filter(task => task.isCompleted);
  const pendingTasks = tasks.filter(task => !task.isCompleted);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  const handleAddTask = () => {
    if (!newTask.title) {
      return;
    }

    dataStore.addTask({
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate || new Date(),
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
    if (!selectedTask || !newTask.title) {
      return;
    }
    
    dataStore.updateTask(selectedTask.id, {
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate || selectedTask.dueDate,
      priority: newTask.priority,
    });
    
    setNewTask({
      title: '',
      description: '',
      dueDate: undefined,
      priority: 'medium',
    });
    setIsEditDialogOpen(false);
    setSelectedTask(null);
    onTaskUpdate();
  };
  
  const handleDeleteTask = () => {
    if (!selectedTask) return;
    
    dataStore.deleteTask(selectedTask.id);
    setIsDeleteDialogOpen(false);
    setSelectedTask(null);
    onTaskUpdate();
  };

  const handleTaskToggle = (taskId: string, isCompleted: boolean) => {
    const updates: Partial<Task> = {
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    };
    
    dataStore.updateTask(taskId, updates);
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

  const TaskList: React.FC<{ taskList: Task[]; showCompleted?: boolean }> = ({ 
    taskList, 
    showCompleted = false 
  }) => (
    <div className="space-y-3">
      {taskList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {showCompleted ? 'لا توجد مهام مكتملة' : 'لا توجد مهام معلقة'}
        </div>
      ) : (
        taskList.map((task) => (
          <div key={task.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={(checked) => handleTaskToggle(task.id, checked as boolean)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h4 className={`font-medium text-right break-words ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h4>
                    <Badge className={`${getPriorityColor(task.priority)} text-white text-xs px-2 py-1 flex-shrink-0`}>
                      {getPriorityText(task.priority)}
                    </Badge>
                  </div>
                </div>
                {task.description && (
                  <p className={`text-sm mb-2 text-right break-words ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.description}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                  <span className="text-right">موعد الاستحقاق: {formatSyrianDate(task.dueDate)}</span>
                  {task.completedAt && (
                    <span className="text-right">اكتملت في: {formatSyrianDate(task.completedAt)}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(task)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteDialog(task)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

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
                  <Label htmlFor="taskTitle" className="text-right">عنوان المهمة</Label>
                  <Input
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="أدخل عنوان المهمة"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label htmlFor="taskDescription" className="text-right">الوصف</Label>
                  <Textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="أدخل وصف المهمة (اختياري)"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="text-right">
                  <Label className="text-right">موعد الاستحقاق (اختياري)</Label>
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-right">
                  <Label htmlFor="taskPriority" className="text-right">درجة الأهمية</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
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
        <Tabs defaultValue="pending" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="text-right">المهام المعلقة ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-right">المهام المكتملة ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <TaskList taskList={pendingTasks} />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <TaskList taskList={completedTasks} showCompleted />
          </TabsContent>
        </Tabs>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل المهمة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-right">
                <Label htmlFor="edit-taskTitle" className="text-right">عنوان المهمة</Label>
                <Input
                  id="edit-taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="أدخل عنوان المهمة"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label htmlFor="edit-taskDescription" className="text-right">الوصف</Label>
                <Textarea
                  id="edit-taskDescription"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="أدخل وصف المهمة (اختياري)"
                  className="text-right"
                  dir="rtl"
                />
              </div>
              <div className="text-right">
                <Label className="text-right">موعد الاستحقاق (اختياري)</Label>
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
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-right">
                <Label htmlFor="edit-taskPriority" className="text-right">درجة الأهمية</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewTask({ ...newTask, priority: value })
                  }
                >
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
              <Button onClick={handleEditTask} className="w-full">
                حفظ التعديلات
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Task Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">حذف المهمة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-right">
              <p>هل أنت متأكد من رغبتك بحذف هذه المهمة؟</p>
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
