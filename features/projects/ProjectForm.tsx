"use client";

import { useState } from "react";
import { useCreateProject, useUpdateProject } from "./useProjectMutations";
import { useActiveSeason } from "../seasons/useSeasons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Project, ProjectGroup, ProjectStatus } from "@/types";

export function ProjectForm({ onSuccess, project }: { onSuccess: () => void; project?: Project }) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [group, setGroup] = useState<ProjectGroup>(project?.group ?? "Sustento");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [finalGoal, setFinalGoal] = useState(project?.finalGoal ?? "");
  const [priority, setPriority] = useState(project?.priority?.toString() ?? "1");
  
  const { data: season } = useActiveSeason();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedPriority = parseInt(priority);
    if (!name.trim() || isNaN(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }

    try {
      if (project) {
        await updateProject.mutateAsync({
          id: project.id,
          name,
          description,
          group,
          status,
          finalGoal,
          priority: parsedPriority,
        });
        toast.success("Projeto atualizado!");
      } else {
        if (!season) {
          toast.error("Você precisa de uma temporada ativa para criar um projeto.");
          return;
        }
        await createProject.mutateAsync({
          name,
          description,
          group,
          status,
          finalGoal,
          seasonId: season.id,
          priority: parsedPriority,
          startDate: Timestamp.now(),
          endDate: Timestamp.fromDate(new Date(season.year, season.trimestre * 3, 0)),
        });
        toast.success("Projeto criado com sucesso!");
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar projeto.";
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="proj-name">Nome do Projeto</Label>
        <Input id="proj-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Estudar Node.js" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proj-desc">Descrição / Por que este projeto é importante?</Label>
        <Textarea id="proj-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Explique a motivação..." required />
      </div>

      <div className="space-y-2">
        <Label>Grupo (Vida em M)</Label>
        <Select value={group} onValueChange={(v) => setGroup(v as ProjectGroup)}>
          <SelectTrigger>
            <SelectValue>{group}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sustento">Sustento</SelectItem>
            <SelectItem value="Alma">Alma</SelectItem>
            <SelectItem value="Curiosidade">Curiosidade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status Inicial</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
            <SelectTrigger>
              <SelectValue>{status === 'active' ? 'Ativo' : 'Pausado'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proj-goal">Resultado Esperado (Como saberá que terminou?)</Label>
        <Input id="proj-goal" value={finalGoal} onChange={e => setFinalGoal(e.target.value)} placeholder="Ex: 2 projetos no portfólio" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proj-priority">Prioridade (1-5)</Label>
        <Input id="proj-priority" type="number" min="1" max="5" value={priority} onChange={e => setPriority(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={createProject.isPending || updateProject.isPending}>
        {project ? (updateProject.isPending ? "Salvando..." : "Atualizar Projeto") : (createProject.isPending ? "Criando..." : "Salvar Projeto")}
      </Button>
    </form>
  );
}
