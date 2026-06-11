"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useUserProfile } from "@/features/seasons/useSeasons";
import { useUpdateProfile } from "@/features/auth/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { User, Sun, Moon, Bell, BellOff, Save } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [notifications, setNotifications] = useState(
    profile?.settings?.notifications ?? true
  );
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        displayName,
        settings: { theme: theme as 'dark' | 'light', notifications },
      });
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e preferências.
        </p>
      </header>

      {/* Avatar & Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
              <AvatarFallback className="text-lg">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle>{user?.displayName || "Usuário"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Informações Pessoais</CardTitle>
          </div>
          <CardDescription>
            Seu nome aparece no dashboard e no menu do usuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Nome de Exibição</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Missão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missão de Vida</CardTitle>
          <CardDescription>
            Sua declaração de propósito que aparece no dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            {profile?.mission || "Nenhuma missão definida ainda."}
          </p>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferências</CardTitle>
          <CardDescription>
            Personalize sua experiência no LifeOS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Tema</Label>
              <p className="text-xs text-muted-foreground">
                Alternar entre tema claro e escuro.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Notificações</Label>
              <p className="text-xs text-muted-foreground">
                Receber alertas sobre prazos e lembretes.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 size-4" />
        {saving ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </div>
  );
}
