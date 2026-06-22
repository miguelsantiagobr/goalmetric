import CompetitionDetail from "./CompetitionDetail";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ lang: string; slug: string }> | { lang: string; slug: string };
};

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  
  return (
    <CompetitionDetail 
      lang={resolvedParams.lang} 
      slug={resolvedParams.slug} 
    />
  );
}