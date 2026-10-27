import { revalidatePath } from 'next/cache';

/**
 * Revalidates public pages across all supported locales (en, am, om).
 */
export function revalidatePublicContent(options: {
  paths?: string[];
  includeHome?: boolean;
}) {
  if (options.includeHome ?? true) {
    revalidatePath('/');
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'page');
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/am');
    revalidatePath('/om');
  }

  if (options.paths) {
    for (const p of options.paths) {
      revalidatePath(p);
      revalidatePath(`/[locale]${p}`, 'page');
      revalidatePath(`/am${p}`);
      revalidatePath(`/om${p}`);
    }
  }
}
