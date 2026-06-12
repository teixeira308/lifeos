"use client";

import { useState } from "react";
import { useLearningItems, useCreateLearningItem, useUpdateLearningItem, LearningItem } from "@/features/learning/useLearning";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, GraduationCap, Book, Video, FileText, ExternalLink, PlayCircle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LearningPage() {
  const { data: items, isLoading } = useLearningItems();
  const createItem = useCreateLearningItem();
  const updateItem = useUpdateLearningItem();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<LearningItem['category']>("Software");
  const [type, setType] = useState<LearningItem['type']>("course");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createItem.mutateAsync({
        title,
        category,
        type,
        progress: 0,
        status: 'to_start'
      });
      toast.success("Item de aprendizado adicionado!");
      setTitle("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar item.");
    }
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    try {
      const status = newProgress >= 100 ? 'finished' : newProgress > 0 ? 'in_progress' : 'to_start';
      await updateItem.mutateAsync({ id, progress: newProgress, status });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar progresso.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: LearningItem['type']) => {
    switch(type) {
      case 'course': return <GraduationCap className="size-4" />;
      case 'book': return <Book className="size-4" />;
      case 'video': return <PlayCircle className="size-4" />;
      case 'article': return <FileText className="size-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Aprendizado</h1>
          <p className="text-muted-foreground">
            Acompanhe seus cursos, livros e estudos técnicos.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button>
            <Plus className="mr-2 size-4" />
            Novo Estudo
          </Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>O que você vai estudar?</DialogTitle>
              <DialogDescription>
                Mantenha seu pilar de Sustento e Alma atualizado.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="study-title">Título</Label>
                <Input id="study-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Curso de Go Avançado" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={(v) => v && setCategory(v as LearningItem['category'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="English">Inglês</SelectItem>
                      <SelectItem value="Music">Música</SelectItem>
                      <SelectItem value="Theology">Teologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v) => v && setType(v as LearningItem['type'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Curso</SelectItem>
                      <SelectItem value="book">Livro</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="article">Artigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createItem.isPending}>
                {createItem.isPending ? "Adicionando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs defaultValue="in_progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="in_progress">Em Progresso</TabsTrigger>
          <TabsTrigger value="to_start">Para Iniciar</TabsTrigger>
          <TabsTrigger value="finished">Concluídos</TabsTrigger>
        </TabsList>

        {['in_progress', 'to_start', 'finished'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {items?.filter(item => item.status === status).map((item) => (
                <Card key={item.id} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {getTypeIcon(item.type)}
                        <span className="text-[10px] uppercase tracking-wider font-bold">{item.category}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-1.5" />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    {item.status !== 'finished' && (
                      <div className="flex w-full gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => handleUpdateProgress(item.id, Math.min(100, item.progress + 10))}
                        >
                          +10%
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => handleUpdateProgress(item.id, 100)}
                        >
                          Concluir
                        </Button>
                      </div>
                    )}
                    {item.status === 'finished' && (
                      <div className="flex items-center gap-2 text-xs text-green-500 font-medium py-1 w-full justify-center">
                        <CheckCircle2 className="size-3" /> Concluído
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
              {items?.filter(item => item.status === status).length === 0 && (
                <div className="md:col-span-2 py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Nada por aqui.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
