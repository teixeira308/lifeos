"use client";

import { useState } from "react";
import { useJournalEntry, useSaveJournalEntry, useDeleteJournalEntry, JournalEntry } from "@/features/journal/useJournal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, addDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Save, Smile, Zap, Heart, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

function JournalEditor({ entry, date, onSave, onDelete, isSaving }: { 
  entry: JournalEntry | null; 
  date: Date; 
  onSave: (data: Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  isSaving: boolean;
}) {
  const [content, setContent] = useState(entry?.content || "");
  const [mood, setMood] = useState(entry?.mood || 3);
  const [energy, setEnergy] = useState(entry?.energy || 3);
  const [gratitude, setGratitude] = useState(entry?.gratitude || "");

  const handleSave = async () => {
    try {
      await onSave({
        date: format(date, "yyyy-MM-dd"),
        content,
        mood,
        energy,
        gratitude
      });
      toast.success("Diário salvo!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar diário.");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Diário</h1>
          <p className="text-muted-foreground">
            Reflexão diária para clareza e gratidão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entry && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" size="icon" className="text-destructive">
                <Trash2 className="size-4" />
              </Button>} />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir entrada do diário?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 size-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </header>

      <div className="grid gap-6">
        {/* Mood & Energy */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Smile className="size-4 text-yellow-500" />
                Humor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider 
                value={[mood]} 
                min={1} 
                max={5} 
                step={1} 
                onValueChange={(v) => setMood(v[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Péssimo</span>
                <span>Incrível</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                Energia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Slider 
                value={[energy]} 
                min={1} 
                max={5} 
                step={1} 
                onValueChange={(v) => setEnergy(v[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Exausto</span>
                <span>Radiante</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gratitude */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="size-4 text-red-500" />
              Gratidão
            </CardTitle>
            <CardDescription>Pelo que você é grato hoje?</CardDescription>
          </CardHeader>
          <CardContent>
            <Input 
              value={gratitude} 
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Uma pequena coisa..."
              className="bg-transparent border-none text-lg italic focus-visible:ring-0 px-0"
            />
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">O que aconteceu hoje?</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seus pensamentos, vitórias e desafios..."
              className="min-h-[300px] resize-none border-none focus-visible:ring-0 p-0 text-base leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: entry, isLoading } = useJournalEntry(selectedDate);
  const saveEntry = useSaveJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
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

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <JournalEditor 
          key={format(selectedDate, "yyyy-MM-dd")}
          entry={entry ?? null} 
          date={selectedDate}
          onSave={(data) => saveEntry.mutateAsync(data)}
          onDelete={async () => {
            await deleteEntry.mutateAsync(format(selectedDate, "yyyy-MM-dd"));
            toast.success("Entrada removida.");
          }}
          isSaving={saveEntry.isPending}
        />
      )}
    </div>
  );
}
