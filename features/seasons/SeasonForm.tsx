"use client";

import { useState } from "react";
import { useCreateSeason } from "./useSeasonMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export function SeasonForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [trimestre, setTrimestre] = useState("1");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [notToDo, setNotToDo] = useState<string[]>([""]);
  
  const createSeason = useCreateSeason();

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
    
    try {
      await createSeason.mutateAsync({
        name,
        theme,
        trimestre: parseInt(trimestre),
        year: parseInt(year),
        objectives: objectives.filter(o => o.trim() !== ""),
        notToDo: notToDo.filter(n => n.trim() !== ""),
        startDate: Timestamp.now(), // Simplified
        endDate: Timestamp.now(),   // Simplified
        status: 'active'
      });
      
      toast.success("Temporada criada com sucesso!");
      onSuccess();
    } catch (error) {
      toast.error("Erro ao criar temporada.");
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
          <Select value={trimestre} onValueChange={(v) => setTrimestre(v ?? "")}>
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

      <Button type="submit" className="w-full" disabled={createSeason.isPending}>
        {createSeason.isPending ? "Criando..." : "Salvar Temporada"}
      </Button>
    </form>
  );
}
