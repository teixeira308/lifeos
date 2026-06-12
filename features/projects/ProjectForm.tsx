"use client";

import { useState } from "react";
import { useCreateProject } from "./useProjectMutations";
import { useActiveSeason } from "../seasons/useSeasons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { ProjectGroup, ProjectStatus } from "@/types";

export function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState<ProjectGroup>("Sustento");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [finalGoal, setFinalGoal] = useState("");
  const [priority, setPriority] = useState("1");
  
  const { data: season } = useActiveSeason();
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!season) {
      toast.error("Você precisa de uma temporada ativa para criar um projeto.");
      return;
    }
    
    try {
      await createProject.mutateAsync({
        name,
        description,
        group,
        status,
        finalGoal,
        seasonId: season.id,
        priority: parseInt(priority),
        startDate: Timestamp.now(),
        endDate: Timestamp.now(), // Placeholder
      });
      
      toast.success("Projeto criado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar projeto.";
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Grupo (Vida em M)</Label>
          <Select value={group} onValueChange={(v) => setGroup(v as ProjectGroup)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sustento">Sustento (Trabalho/Carreira)</SelectItem>
              <SelectItem value="Alma">Alma (Hobbies/Saúde/Fé)</SelectItem>
              <SelectItem value="Curiosidade">Curiosidade (Interesses)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status Inicial</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
            <SelectTrigger>
              <SelectValue />
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

      <Button type="submit" className="w-full" disabled={createProject.isPending}>
        {createProject.isPending ? "Criando..." : "Salvar Projeto"}
      </Button>
    </form>
  );
}
