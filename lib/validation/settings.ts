import { z } from 'zod';

export const publicContactEmailSchema = z.string().trim().email().max(254);
