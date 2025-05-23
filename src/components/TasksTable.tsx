
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
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
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
    if (!newTask.title || !newTask.dueDate) {
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

  const handleTaskToggle = (taskId: string, isCompleted: boolean) => {
    const updates: Partial<Task> = {
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    };
    
    dataStore.updateTask(taskId, updates);
    onTaskUpdate();
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
          <div key={task.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.isCompleted}
                onCheckedChange={(checked) => handleTaskToggle(task.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                    {getPriorityText(task.priority)}
                  </Badge>
                </div>
                {task.description && (
                  <p className={`text-sm mb-2 ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>موعد الاستحقاق: {formatSyrianDate(task.dueDate)}</span>
                  {task.completedAt && (
                    <span>اكتملت في: {formatSyrianDate(task.completedAt)}</span>
                  )}
                </div>
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
          <CardTitle>المهام الإدارية</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة مهمة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة مهمة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskTitle">عنوان المهمة</Label>
                  <Input
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="أدخل عنوان المهمة"
                  />
                </div>
                <div>
                  <Label htmlFor="taskDescription">الوصف</Label>
                  <Textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="أدخل وصف المهمة (اختياري)"
                  />
                </div>
                <div>
                  <Label>موعد الاستحقاق</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right font-normal",
                          !newTask.dueDate && "text-muted-foreground"
                        )}
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
                <div>
                  <Label htmlFor="taskPriority">درجة الأهمية</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
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
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">المهام المعلقة ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">المهام المكتملة ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <TaskList taskList={pendingTasks} />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <TaskList taskList={completedTasks} showCompleted />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
