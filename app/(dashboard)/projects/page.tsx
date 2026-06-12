"use client";

import { useState } from "react";
import { useActiveProjects } from "@/features/projects/useProjects";
import { useUpdateProject, useDeleteProject } from "@/features/projects/useProjectMutations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Pause, Play, CheckCircle, Pencil, Trash2 } from "lucide-react";
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
import { ProjectForm } from "@/features/projects/ProjectForm";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectStatus, Project } from "@/types";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useActiveProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus: ProjectStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateProject.mutateAsync({ id, status: newStatus });
      toast.success(`Projeto ${newStatus === 'active' ? 'ativado' : 'pausado'}!`);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar projeto.";
      toast.error(errorMessage);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateProject.mutateAsync({ id, status: 'completed' });
      toast.success("Projeto concluído! Parabéns!");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao concluir projeto.";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Projeto removido.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover projeto.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const pausedProjects = projects?.filter(p => p.status === 'paused') || [];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus compromissos e mantenha o foco.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger render={<Button>
            <Plus className="mr-2 size-4" />
            Novo Projeto
          </Button>} />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Projeto</DialogTitle>
              <DialogDescription>
                Lembre-se: o limite é de 3 projetos ativos.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ProjectForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <Dialog open={!!editingProject} onOpenChange={(open) => { if (!open) setEditingProject(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize as informações do projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editingProject && (
              <ProjectForm project={editingProject} onSuccess={() => setEditingProject(null)} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Ativos ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="paused">Pausados ({pausedProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeProjects.map((project) => (
                <Card key={project.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={
                        project.group === 'Sustento' ? 'default' : 
                        project.group === 'Alma' ? 'secondary' : 'outline'
                      }>
                        {project.group}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">Prioridade {project.priority}</span>
                    </div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Meta Final</p>
                        <p className="text-sm">{project.finalGoal}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setEditingProject(project)}>
                      <Pencil className="mr-1 size-3" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(project.id, project.status)}>
                      <Pause className="mr-1 size-3" /> Pausar
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleComplete(project.id)}>
                      <CheckCircle className="mr-1 size-3" /> Concluir
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-destructive ml-auto">
                        <Trash2 className="size-4" />
                      </Button>} />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O projeto &quot;{project.name}&quot; será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(project.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 rounded-lg">
              <Briefcase className="size-12 text-muted-foreground mb-4" />
              <CardTitle>Nenhum Projeto Ativo</CardTitle>
              <CardDescription className="max-w-[400px] mt-2">
                Aproveite para focar em rotinas ou planeje seu próximo passo.
              </CardDescription>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-6">
          {pausedProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pausedProjects.map((project) => (
                <Card key={project.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{project.group}</Badge>
                      <Badge variant="secondary">Pausado</Badge>
                    </div>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setEditingProject(project)}>
                      <Pencil className="mr-1 size-3" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(project.id, project.status)}>
                      <Play className="mr-1 size-3" /> Retomar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-destructive ml-auto">
                        <Trash2 className="size-4" />
                      </Button>} />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O projeto &quot;{project.name}&quot; será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(project.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Não há projetos pausados.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
