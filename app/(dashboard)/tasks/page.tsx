"use client";

import { useState } from "react";
import { useTasks, useUpdateTask } from "@/features/tasks/useTasks";
import { useActiveProjects } from "@/features/projects/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckCircle2, Circle, ListTodo, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { TaskForm } from "@/features/tasks/TaskForm";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TasksPage() {
  const [filterProjectId, setFilterProjectId] = useState("all");
  const { data: tasks, isLoading } = useTasks(filterProjectId === "all" ? undefined : filterProjectId);
  const { data: projects } = useActiveProjects();
  const updateTask = useUpdateTask();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await updateTask.mutateAsync({ id, status: newStatus });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar tarefa.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    );
  }

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Ações atômicas para mover o ponteiro.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button>
            <Plus className="mr-2 size-4" />
            Nova Tarefa
          </Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Tarefa Atômica</DialogTitle>
              <DialogDescription>
                Divida grandes objetivos em passos simples.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <TaskForm onSuccess={() => setIsDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          <span>Filtrar por projeto:</span>
        </div>
        <Select value={filterProjectId} onValueChange={(v) => setFilterProjectId(v ?? "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-8">
        {/* Pending Tasks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Circle className="size-5 text-primary" />
            <h2>Pendentes ({pendingTasks.length})</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              {pendingTasks.length > 0 ? (
                <div className="divide-y">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={false} 
                        onCheckedChange={() => handleToggleTask(task.id, task.status)} 
                      />
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.projectId && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            PROJETO: {projects?.find(p => p.id === task.projectId)?.name || "---"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <ListTodo className="size-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma tarefa pendente. Bom trabalho!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold text-lg text-muted-foreground">
              <CheckCircle2 className="size-5" />
              <h2>Concluídas ({completedTasks.length})</h2>
            </div>
            <Card className="opacity-60">
              <CardContent className="p-0">
                <div className="divide-y">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4">
                      <Checkbox 
                        checked={true} 
                        onCheckedChange={() => handleToggleTask(task.id, task.status)} 
                      />
                      <p className="text-sm line-through text-muted-foreground">{task.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
