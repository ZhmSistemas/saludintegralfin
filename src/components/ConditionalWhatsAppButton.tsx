'use client';

import { usePathname } from 'next/navigation';
import WhatsAppButton from './WhatsAppButton';

export default function ConditionalWhatsAppButton() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return <WhatsAppButton />;
}
