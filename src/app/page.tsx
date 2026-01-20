'use client';

import { DashboardOverview } from '@/components/dashboard/overview';
import { Suspense, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function Home() {
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
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}
