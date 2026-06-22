// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redireciona automaticamente para português (você pode mudar para 'en' se preferir)
  redirect('/br');
}