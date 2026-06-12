"use client";

import { useState } from "react";
import { useResources, useCreateResource, Resource } from "@/features/resources/useResources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, FileText, Video, Book, Search, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ResourcesPage() {
  const { data: resources, isLoading } = useResources();
  const createResource = useCreateResource();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<Resource['type']>("link");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createResource.mutateAsync({
        title,
        url,
        type,
        tags: []
      });
      toast.success("Recurso salvo!");
      setTitle("");
      setUrl("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar recurso.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  const filteredResources = resources?.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch(type) {
      case 'link': return <LinkIcon className="size-4" />;
      case 'pdf': return <FileText className="size-4" />;
      case 'video': return <Video className="size-4" />;
      case 'book': return <Book className="size-4" />;
      default: return <LinkIcon className="size-4" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Recursos</h1>
          <p className="text-muted-foreground">
            Sua biblioteca de referências e conhecimentos.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button>
            <Plus className="mr-2 size-4" />
            Novo Recurso
          </Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Recurso</DialogTitle>
              <DialogDescription>
                Guarde links, livros ou referências úteis.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="res-title">Título</Label>
                <Input id="res-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Documentação React" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="res-url">URL / Link (Opcional)</Label>
                <Input id="res-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => v && setType(v as Resource['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="pdf">PDF / Documento</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="book">Livro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createResource.isPending}>
                {createResource.isPending ? "Salvando..." : "Salvar Recurso"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          className="pl-10" 
          placeholder="Pesquisar na biblioteca..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources && filteredResources.length > 0 ? (
          filteredResources.map((res) => (
            <Card key={res.id} className="group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1.5 bg-muted rounded">
                    {getIcon(res.type)}
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase">{res.type}</Badge>
                </div>
                <CardTitle className="text-base line-clamp-1">{res.title}</CardTitle>
              </CardHeader>
              <CardFooter>
                {res.url ? (
                  <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary" render={<a href={res.url} target="_blank" rel="noopener noreferrer">
                    Abrir recurso <ExternalLink className="ml-1 size-3" />
                  </a>} />
                ) : (
                  <span className="text-xs text-muted-foreground italic">Sem link disponível</span>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhum recurso encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
