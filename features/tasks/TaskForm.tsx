"use client";

import { useState } from "react";
import { useCreateTask, useUpdateTask } from "./useTasks";
import { useActiveProjects } from "../projects/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Task } from "@/types";

export function TaskForm({ onSuccess, defaultProjectId, task }: { onSuccess: () => void, defaultProjectId?: string, task?: Task }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [projectId, setProjectId] = useState(task?.projectId ?? defaultProjectId ?? "none");
  const { data: projects } = useActiveProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const wordCount = title.trim().split(/\s+/).length;
    if (wordCount < 2) {
      toast.warning("Tente ser mais específico na sua tarefa (pelo menos 2 palavras).");
      return;
    }

    try {
      if (task) {
        await updateTask.mutateAsync({
          id: task.id,
          title,
          projectId: projectId === "none" ? undefined : projectId,
        });
        toast.success("Tarefa atualizada!");
      } else {
        await createTask.mutateAsync({
          title,
          projectId: projectId === "none" ? undefined : projectId,
          status: 'pending',
          isAtomic: true,
          date: Timestamp.now(),
        });
        toast.success("Tarefa adicionada!");
      }
      setTitle("");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar tarefa.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">O que precisa ser feito?</Label>
        <Input 
          id="task-title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Ex: Assistir aula 1 de Go" 
          required 
        />
        <p className="text-[10px] text-muted-foreground italic">
          Dica: Toda tarefa deve ser pequena e acionável.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Vincular a um Projeto (Opcional)</Label>
        <Select value={projectId} onValueChange={(v) => setProjectId(v ?? "none")}>
          <SelectTrigger>
            <SelectValue>
              {projectId === "none" ? "Sem projeto" : projects?.find(p => p.id === projectId)?.name || "Selecionar"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem projeto</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={createTask.isPending || updateTask.isPending}>
        {task ? (updateTask.isPending ? "Salvando..." : "Atualizar Tarefa") : (createTask.isPending ? "Adicionando..." : "Adicionar Tarefa")}
      </Button>
    </form>
  );
}
