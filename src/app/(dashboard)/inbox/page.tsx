"use client";

import { useState } from "react";
import { useInboxItems, useCreateInboxItem, useDeleteInboxItem, InboxItem } from "@/features/inbox/useInbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Inbox, Plus, Trash2, Rocket, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ProjectForm } from "@/features/projects/ProjectForm";

export default function InboxPage() {
  const { data: items, isLoading } = useInboxItems();
  const createItem = useCreateInboxItem();
  const deleteItem = useDeleteInboxItem();
  
  const [newTitle, setNewTitle] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createItem.mutateAsync({ title: newTitle });
      toast.success("Capturado!");
      setNewTitle("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao capturar.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Item removido.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover.");
    }
  };

  const handleTransform = (item: InboxItem) => {
    setSelectedItemId(item.id);
    setIsProjectDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          Capture ideias rapidamente. Processe-as depois.
        </p>
      </header>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input 
          value={newTitle} 
          onChange={e => setNewTitle(e.target.value)} 
          placeholder="Tenho uma ideia sobre..." 
          className="flex-1"
        />
        <Button type="submit" disabled={createItem.isPending}>
          <Plus className="mr-2 size-4" />
          Capturar
        </Button>
      </form>

      <div className="grid gap-4">
        {items && items.length > 0 ? (
          items.map((item) => (
            <Card key={item.id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Inbox className="size-4 text-muted-foreground" />
                  </div>
                  <p className="font-medium">{item.title}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" onClick={() => handleTransform(item)}>
                    <Rocket className="mr-2 size-3 text-primary" />
                    Virar Projeto
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <Inbox className="size-12 mx-auto mb-4 text-muted-foreground opacity-10" />
            <p className="text-muted-foreground italic">Seu inbox está limpo. Capture algo!</p>
          </div>
        )}
      </div>

      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transformar em Projeto</DialogTitle>
            <DialogDescription>
              Isso vai criar um novo projeto baseado na sua ideia.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm 
              onSuccess={() => {
                setIsProjectDialogOpen(false);
                handleDelete(selectedItemId);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
