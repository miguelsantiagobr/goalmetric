import CompetitionsClient from "./CompetitionsClient";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: string }> | { lang: string };
};

export default async function CompetitionPage({ params }: Props) {
  // Apenas garante a resolução dos parâmetros no servidor
  await params; 

  return <CompetitionsClient />;
}