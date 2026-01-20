'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { Settings } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

export default function SettingsPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
          <div className="flex items-center justify-center h-screen">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        );
    }

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
