"use client";

import { useState } from "react";
import { useCreateSeason, useUpdateSeason } from "./useSeasonMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Season } from "@/types";

export function SeasonForm({ onSuccess, season }: { onSuccess: () => void; season?: Season }) {
  const [name, setName] = useState(season?.name ?? "");
  const [theme, setTheme] = useState(season?.theme ?? "");
  const [trimestre, setTrimestre] = useState(season?.trimestre?.toString() ?? "1");
  const [year, setYear] = useState(season?.year?.toString() ?? new Date().getFullYear().toString());
  const [objectives, setObjectives] = useState<string[]>(season?.objectives?.length ? season.objectives : [""]);
  const [notToDo, setNotToDo] = useState<string[]>(season?.notToDo?.length ? season.notToDo : [""]);
  
  const createSeason = useCreateSeason();
  const updateSeason = useUpdateSeason();

  const handleAddObjective = () => setObjectives([...objectives, ""]);
  const handleRemoveObjective = (index: number) => setObjectives(objectives.filter((_, i) => i !== index));
  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const handleAddNotToDo = () => setNotToDo([...notToDo, ""]);
  const handleRemoveNotToDo = (index: number) => setNotToDo(notToDo.filter((_, i) => i !== index));
  const handleNotToDoChange = (index: number, value: string) => {
    const newNotToDo = [...notToDo];
    newNotToDo[index] = value;
    setNotToDo(newNotToDo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedYear = parseInt(year);
    const parsedTrimestre = parseInt(trimestre);

    if (!name.trim() || !theme.trim() || isNaN(parsedYear) || parsedYear < 1900) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }

    try {
      const data = {
        name,
        theme,
        trimestre: parsedTrimestre,
        year: parsedYear,
        objectives: objectives.filter(o => o.trim() !== ""),
        notToDo: notToDo.filter(n => n.trim() !== ""),
      };

      if (season) {
        await updateSeason.mutateAsync({ id: season.id, ...data });
        toast.success("Temporada atualizada!");
      } else {
        await createSeason.mutateAsync({
          ...data,
          startDate: Timestamp.fromDate(new Date(parsedYear, (parsedTrimestre - 1) * 3, 1)),
          endDate: Timestamp.fromDate(new Date(parsedYear, parsedTrimestre * 3, 0))
        });
        toast.success("Temporada criada com sucesso!");
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar temporada:", error);
      toast.error("Erro ao salvar temporada. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome (ex: 2026-Q3)</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="2026-Q3" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="theme">Tema Central</Label>
          <Input id="theme" value={theme} onChange={e => setTheme(e.target.value)} placeholder="Migração para Dev" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Trimestre</Label>
          <Select value={trimestre} onValueChange={(v) => setTrimestre(v ?? "1")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o trimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1º Trimestre</SelectItem>
              <SelectItem value="2">2º Trimestre</SelectItem>
              <SelectItem value="3">3º Trimestre</SelectItem>
              <SelectItem value="4">4º Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input id="year" type="number" value={year} onChange={e => setYear(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Objetivos Principais</Label>
        {objectives.map((obj, i) => (
          <div key={i} className="flex gap-2">
            <Input 
              value={obj} 
              onChange={e => handleObjectiveChange(i, e.target.value)} 
              placeholder="O que você quer alcançar?" 
            />
            {objectives.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveObjective(i)}>
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={handleAddObjective}>
          <Plus className="size-4 mr-2" /> Adicionar Objetivo
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Não Fazer (Limites)</Label>
        {notToDo.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input 
              value={item} 
              onChange={e => handleNotToDoChange(i, e.target.value)} 
              placeholder="O que você vai evitar?" 
            />
            {notToDo.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveNotToDo(i)}>
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={handleAddNotToDo}>
          <Plus className="size-4 mr-2" /> Adicionar Limite
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={createSeason.isPending || updateSeason.isPending}>
        {season ? (updateSeason.isPending ? "Salvando..." : "Atualizar Temporada") : (createSeason.isPending ? "Criando..." : "Salvar Temporada")}
      </Button>
    </form>
  );
}
