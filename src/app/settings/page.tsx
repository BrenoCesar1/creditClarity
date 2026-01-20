'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings /> Configurações</CardTitle>
                    <CardDescription>Gerencie as configurações da sua conta e perfil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm />
                </CardContent>
            </Card>
        </div>
    );
}
