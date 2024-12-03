import { initializeZapt } from '@zapt/zapt-js';

export const { createEvent } = initializeZapt(import.meta.env.VITE_PUBLIC_APP_ID);