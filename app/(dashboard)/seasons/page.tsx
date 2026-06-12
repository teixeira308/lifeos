"use client";

import { useState } from "react";
import { useActiveSeason } from "@/features/seasons/useSeasons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Target, Ban, ArrowRight } from "lucide-react";
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
import { SeasonForm } from "@/features/seasons/SeasonForm";

export default function SeasonsPage() {
  const { data: season, isLoading } = useActiveSeason();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <SeasonForm onSuccess={() => setIsDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </header>

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
              <Calendar className="size-12 text-primary/20" />
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Começar Agora
          </Button>
        </Card>
      )}
    </div>
  );
}
