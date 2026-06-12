"use client";

import { useState } from "react";
import { useHabits, useHabitLogs, useToggleHabit, useCreateHabit, useUpdateHabit, useDeleteHabit, Habit } from "@/features/habits/useHabits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Zap, Flame, Trophy, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays, subDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function HabitsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: habits, isLoading: loadingHabits } = useHabits();
  const { data: logs, isLoading: loadingLogs } = useHabitLogs(selectedDate);
  const toggleHabit = useToggleHabit();
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  
  const [newHabitName, setNewHabitName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editName, setEditName] = useState("");

  const handleToggle = async (habitId: string, currentCompleted: boolean) => {
    try {
      await toggleHabit.mutateAsync({
        habitId,
        date: selectedDate,
        completed: !currentCompleted
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar hábito.");
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHabit.mutateAsync(newHabitName);
      toast.success("Hábito criado!");
      setNewHabitName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar hábito.");
    }
  };

  const handleEditHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editName.trim()) return;
    try {
      await updateHabit.mutateAsync({ id: editingHabit.id, name: editName });
      toast.success("Hábito atualizado!");
      setEditingHabit(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar hábito.");
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await deleteHabit.mutateAsync(id);
      toast.success("Hábito removido.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover hábito.");
    }
  };

  const isLoading = loadingHabits || loadingLogs;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Hábitos</h1>
          <p className="text-muted-foreground">
            A consistência é o que transforma esforço em resultado.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button>
            <Plus className="mr-2 size-4" />
            Novo Hábito
          </Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Hábito</DialogTitle>
              <DialogDescription>
                Escolha algo pequeno que você possa repetir diariamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateHabit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="habit-name">Nome do Hábito</Label>
                <Input 
                  id="habit-name" 
                  value={newHabitName} 
                  onChange={e => setNewHabitName(e.target.value)} 
                  placeholder="Ex: Ler Bíblia, Praticar Inglês..." 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={createHabit.isPending}>
                {createHabit.isPending ? "Criando..." : "Salvar Hábito"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Dialog open={!!editingHabit} onOpenChange={(open) => { if (!open) setEditingHabit(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Hábito</DialogTitle>
            <DialogDescription>
              Atualize o nome do hábito.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditHabit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Hábito</Label>
              <Input 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateHabit.isPending}>
              {updateHabit.isPending ? "Salvando..." : "Atualizar Hábito"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold capitalize">
            {isToday(selectedDate) ? "Hoje" : format(selectedDate, "EEEE", { locale: ptBR })}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {habits && habits.length > 0 ? (
          habits.map((habit) => {
            const log = logs?.find(l => l.habitId === habit.id);
            const isCompleted = log?.completed || false;
            
            return (
              <Card key={habit.id} className={`${isCompleted ? 'bg-primary/5 border-primary/20' : ''} transition-colors group`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox 
                    id={`habit-${habit.id}`}
                    checked={isCompleted}
                    onCheckedChange={() => handleToggle(habit.id, isCompleted)}
                    className="size-6"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`habit-${habit.id}`}
                      className={`text-lg font-medium cursor-pointer ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {habit.name}
                    </Label>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="size-4 fill-orange-500" />
                    <span className="text-sm font-bold">{habit.streak || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-xs" onClick={() => { setEditName(habit.name); setEditingHabit(habit); }}>
                      <Pencil className="size-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon-xs" className="text-destructive">
                        <Trash2 className="size-3" />
                      </Button>} />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir hábito?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{habit.name}&quot; será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteHabit(habit.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <Zap className="size-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">Você ainda não tem hábitos cadastrados.</p>
            <Button variant="link" onClick={() => setIsDialogOpen(true)}>Começar agora</Button>
          </div>
        )}
      </div>

      {/* Stats Summary (Optional) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="size-4 text-yellow-500" />
              Melhor Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12 dias</p>
            <p className="text-xs text-muted-foreground">Prática de Inglês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Taxa de Conclusão (Semana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">85%</p>
            <Progress value={85} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
