'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import SolutionForm from '@/app/components/admin/solutions/SolutionForm';
import { solutionService } from '@/app/lib/api/services/solution.service';
import type { SolutionAdminDetail } from '@/app/lib/api/types';

export default function EditSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [solution, setSolution] = useState<SolutionAdminDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    solutionService
      .getAdmin(id)
      .then((data) => active && setSolution(data))
      .catch((err) => active && setError(err?.message || 'Could not load this solution'));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-red-300">
        {error}{' '}
        <Link href="/admin/solutions" prefetch={false} className="font-semibold underline">
          Back to solutions
        </Link>
      </div>
    );
  }
  if (!solution) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }
  return <SolutionForm initial={solution} />;
}
