'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';

export function DeleteInquiryForm({ action }: { action: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() => {
        if (confirm('Are you sure you want to delete this inquiry?')) {
          startTransition(() => {
            action();
          });
        }
      }}
    >
      <Button
        type="submit"
        variant="destructive"
        disabled={isPending}
      >
        {isPending ? 'Deleting...' : 'Delete Inquiry'}
      </Button>
    </form>
  );
}
