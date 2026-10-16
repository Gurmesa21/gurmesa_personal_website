'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

export function BlogSearch({ placeholder, defaultValue }: { placeholder: string; defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(defaultValue || '');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="mb-12 max-w-xl mx-auto group">
      <div className="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-sm hover:shadow-md">
        <div className="pl-4 pr-2 flex items-center pointer-events-none">
          {isPending ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          )}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 py-3 px-2 text-base rounded-r-full"
        />
      </div>
    </div>
  );
}
