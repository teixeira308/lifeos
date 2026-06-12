"use client";

import { useState } from "react";
import { useActiveSeason } from "@/features/seasons/useSeasons";
import { useDeleteSeason } from "@/features/seasons/useSeasonMutations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Target, Ban, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { SeasonForm } from "@/features/seasons/SeasonForm";
import { Season } from "@/types";
import { toast } from "sonner";

export default function SeasonsPage() {
  const { data: season, isLoading } = useActiveSeason();
  const deleteSeason = useDeleteSeason();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteSeason.mutateAsync(id);
      toast.success("Temporada removida.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover temporada.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Temporadas</h1>
          <p className="text-muted-foreground">
            Planeje seu trimestre e defina seus limites.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger render={<Button>
            <Plus className="mr-2 size-4" />
            Nova Temporada
          </Button>} />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Temporada</DialogTitle>
              <DialogDescription>
                Defina o foco para os próximos 3 meses.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <SeasonForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Dialog open={!!editingSeason} onOpenChange={(open) => { if (!open) setEditingSeason(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Temporada</DialogTitle>
            <DialogDescription>
              Atualize os dados da temporada atual.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editingSeason && (
              <SeasonForm season={editingSeason} onSuccess={() => setEditingSeason(null)} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {season ? (
        <div className="grid gap-6">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge>Temporada Ativa</Badge>
                  <span className="text-sm text-muted-foreground">Q{season.trimestre} {season.year}</span>
                </div>
                <CardTitle className="text-4xl font-bold pt-2">{season.name}</CardTitle>
                <CardDescription className="text-lg">{season.theme}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingSeason(season)}>
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="size-4" />
                  </Button>} />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir temporada?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{season.name}&quot; será removida permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(season.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2 pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Target className="size-5 text-green-500" />
                  <h3>Objetivos Principais</h3>
                </div>
                <ul className="space-y-3">
                  {season.objectives?.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                      <ArrowRight className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                      {obj}
                    </li>
                  ))}
                  {(!season.objectives || season.objectives.length === 0) && (
                    <li className="text-sm text-muted-foreground italic">Nenhum objetivo definido.</li>
                  )}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Ban className="size-5 text-destructive" />
                  <h3>Não Fazer (Limites)</h3>
                </div>
                <ul className="space-y-3">
                  {season.notToDo?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                      <div className="size-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                  {(!season.notToDo || season.notToDo.length === 0) && (
                    <li className="text-sm text-muted-foreground italic">Nenhum limite definido.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2">
          <Calendar className="size-12 text-muted-foreground mb-4" />
          <CardTitle>Nenhuma Temporada Ativa</CardTitle>
          <CardDescription className="max-w-[400px] mt-2 mb-6">
            Temporadas são blocos de 3 meses focados em objetivos específicos. Comece planejando seu próximo trimestre.
          </CardDescription>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Começar Agora
          </Button>
        </Card>
      )}
    </div>
  );
}
