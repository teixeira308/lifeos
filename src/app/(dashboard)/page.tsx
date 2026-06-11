"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useActiveSeason, useUserProfile } from "@/features/seasons/useSeasons";
import { useActiveProjects } from "@/features/projects/useProjects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, Briefcase, Zap, CheckCircle2, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useUpdateProfile } from "@/features/auth/useProfile";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useUserProfile();
  const { data: season, isLoading: loadingSeason } = useActiveSeason();
  const { data: projects, isLoading: loadingProjects } = useActiveProjects();

  const [missionInput, setMissionInput] = useState("");
  const [isMissionDialogOpen, setIsMissionDialogOpen] = useState(false);
  const updateProfile = useUpdateProfile();

  const handleUpdateMission = async () => {
    try {
      await updateProfile.mutateAsync({ mission: missionInput });
      toast.success("Missão de vida atualizada!");
      setIsMissionDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar missão.");
    }
  };

  const isLoading = loadingProfile || loadingSeason || loadingProjects;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu centro de comando, {user?.displayName || "Usuário"}.
        </p>
      </header>

      {/* Top Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mission Card */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missão de Vida</CardTitle>
            <Dialog open={isMissionDialogOpen} onOpenChange={(open) => {
              setIsMissionDialogOpen(open);
              if (open) setMissionInput(profile?.mission || "");
            }}>
              <DialogTrigger render={<Button variant="ghost" size="icon" className="size-8">
                <Pencil className="size-3" />
              </Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sua Missão de Vida</DialogTitle>
                  <DialogDescription>
                    O que guia suas escolhas e define quem você quer se tornar?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea 
                    value={missionInput} 
                    onChange={(e) => setMissionInput(e.target.value)}
                    placeholder="Ex: Ser um desenvolvedor excepcional e um marido dedicado..."
                    className="min-h-[100px]"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMissionDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdateMission} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Salvando..." : "Salvar Missão"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold leading-snug">
              {profile?.mission || "Defina sua missão pessoal para manter o foco no que realmente importa."}
            </p>
          </CardContent>
        </Card>

        {/* Current Season Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temporada Atual</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {season ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{season.name}</p>
                <p className="text-xs text-muted-foreground">{season.theme}</p>
                <div className="pt-2">
                  <Badge variant="secondary">Q{season.trimestre} {season.year}</Badge>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground italic">Nenhuma temporada ativa.</p>
                <p className="text-xs">Planeje seu próximo trimestre.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Focus Project Card */}
        <Card className="border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projeto em Foco</CardTitle>
            <Zap className="size-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xl font-bold truncate">{projects[0].name}</p>
                <Badge variant={projects[0].group === 'Sustento' ? 'default' : 'outline'}>
                  {projects[0].group}
                </Badge>
                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-1" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground italic">Nenhum projeto ativo.</p>
                <p className="text-xs">O foco é a chave para a execução.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Content (Projects & Actions) */}
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Projetos Ativos</CardTitle>
                <CardDescription>Você tem {projects?.length || 0} projetos em execução nesta temporada.</CardDescription>
              </div>
              <Briefcase className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center gap-4">
                    <div className={`p-2 rounded-md ${
                      project.group === 'Sustento' ? 'bg-primary/10 text-primary' : 
                      project.group === 'Alma' ? 'bg-secondary/10 text-secondary' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Briefcase className="size-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.group}</p>
                    </div>
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Nenhum projeto ativo no momento.</p>
                <p className="text-xs max-w-[200px]">Adicione um projeto para começar a acompanhar seu progresso.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secondary Content (Routine & Review) */}
        <div className="space-y-6 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rotinas e Revisões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <CheckCircle2 className="size-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Revisão Semanal</p>
                  <p className="text-xs text-muted-foreground">Última realizada: Sábado passado</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <Zap className="size-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Hábitos de Hoje</p>
                  <p className="text-xs text-muted-foreground">3 de 5 concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Dica do Jarvis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "O sucesso é a soma de pequenos esforços repetidos dia após dia. Foque no seu projeto de Sustento hoje."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
