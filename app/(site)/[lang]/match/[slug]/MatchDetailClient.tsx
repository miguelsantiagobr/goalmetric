'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Target, Lock, ExternalLink, TrendingUp, Star } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';
import GeoBanner from '@/components/GeoBanner';

interface MatchDetailClientProps {
  match: any;
  lang: string;
  currentLang: string;
}

export default function MatchDetailClient({ match, lang, currentLang }: MatchDetailClientProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [enrichedOdds, setEnrichedOdds] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setLoadingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ======================== ENRIQUECE AS ODDS ========================
  useEffect(() => {
    const enrichOdds = async () => {
      const odds = match.odds || [];
      if (odds.length === 0) return;

      if (odds[0].bet_name && odds[0].bet_logo) {
        setEnrichedOdds(odds);
        return;
      }

      const betIds = odds.map((o: any) => o.bet_id).filter(Boolean);
      if (betIds.length === 0) return;

      const { data: bets } = await supabase
        .from('bets')
        .select('id, name, logo_url')
        .in('id', betIds);

      const betMap = new Map(bets?.map(b => [b.id, b]) || []);

      const enriched = odds.map((odd: any) => {
        const bet = betMap.get(odd.bet_id);
        return {
          ...odd,
          bet_name: bet?.name || 'Casa de Aposta',
          bet_logo: bet?.logo_url || ''
        };
      });

      setEnrichedOdds(enriched);
    };

    enrichOdds();
  }, [match.odds]);

  // ======================== FUNÇÃO DE TEXTO ========================
  const getText = (obj: any, baseField: string) => {
    if (!obj) return '';
    return (
      obj[`${baseField}_${currentLang}`] ||
      obj[`${baseField}_pt`] ||
      obj[baseField] ||
      ''
    );
  };

  const homeName = getText(match.home_team, 'name');
  const awayName = getText(match.away_team, 'name');
  const homeSlug = match.home_team?.slug;
  const awaySlug = match.away_team?.slug;

  // ======================== TRADUÇÕES DO FAQ ========================
  const faqTranslations = {
    pt: {
      q1: `Qual é a melhor aposta para ${homeName} x ${awayName}?`,
      a1: getText(match, 'best_bet') 
        ? `A melhor aposta é ${getText(match, 'best_bet')}.` 
        : `Baseada nas estatísticas recentes, gols esperados e características das equipes.`,
      q2: `Qual o placar previsto para ${homeName} x ${awayName}?`,
      a2: match.predicted_score 
        ? `O placar previsto é ${match.predicted_score}.` 
        : `Ainda em análise.`,
      q3: `Qual a probabilidade de ambas as equipes marcarem?`,
      a3: match.both_teams_score_pct 
        ? `A probabilidade de ambas marcarem é de ${match.both_teams_score_pct}%.` 
        : `Em torno de 55-60% conforme estatísticas recentes.`,
      q4: `Quem é o jogador com maior destaque na partida?`,
      a4: match.key_player 
        ? `${match.key_player} é o principal destaque da partida.` 
        : `O destaque fica por conta dos principais atacantes das duas equipes.`,
      q5: `Quantos gols são esperados para ${homeName} x ${awayName}?`,
      a5: match.expected_goals 
        ? `A previsão é de ${match.expected_goals} gols esperados.` 
        : `Entre 2.3 e 2.8 gols no total.`
    },
    en: {
      q1: `What is the best bet for ${homeName} vs ${awayName}?`,
      a1: getText(match, 'best_bet') 
        ? `The best bet is ${getText(match, 'best_bet')}.` 
        : `Based on recent statistics, expected goals and team characteristics.`,
      q2: `What is the predicted score for ${homeName} vs ${awayName}?`,
      a2: match.predicted_score 
        ? `The predicted score is ${match.predicted_score}.` 
        : `Still under analysis.`,
      q3: `What is the probability that both teams will score?`,
      a3: match.both_teams_score_pct 
        ? `The probability that both teams score is ${match.both_teams_score_pct}%.` 
        : `Around 55-60% according to recent statistics.`,
      q4: `Who is the standout player in the match?`,
      a4: match.key_player 
        ? `${match.key_player} is the main standout player.` 
        : `The highlight goes to the main attackers of both teams.`,
      q5: `How many goals are expected in ${homeName} vs ${awayName}?`,
      a5: match.expected_goals 
        ? `The forecast is ${match.expected_goals} expected goals.` 
        : `Between 2.3 and 2.8 goals in total.`
    },
    es: {
      q1: `¿Cuál es la melhor apuesta para ${homeName} x ${awayName}?`,
      a1: getText(match, 'best_bet') 
        ? `La mejor aposta es ${getText(match, 'best_bet')}.` 
        : `Basada en estadísticas recientes, goles esperados y características de los equipos.`,
      q2: `¿Cuál es el marcador previsto para ${homeName} x ${awayName}?`,
      a2: match.predicted_score 
        ? `El marcador previsto es ${match.predicted_score}.` 
        : `Todavía en análisis.`,
      q3: `¿Cuál es la probabilidad de que ambos equipos marquen?`,
      a3: match.both_teams_score_pct 
        ? `La probabilidad de que ambos marquen es del ${match.both_teams_score_pct}%.` 
        : `Alrededor del 55-60% según estadísticas recientes.`,
      q4: `¿Quién es el jugador más destacado del partido?`,
      a4: match.key_player 
        ? `${match.key_player} es el principal destacado.` 
        : `El destaque está en los principales delanteros de ambos equipos.`,
      q5: `¿Cuántos goles se esperan en ${homeName} x ${awayName}?`,
      a5: match.expected_goals 
        ? `La previsión es de ${match.expected_goals} goles esperados.` 
        : `Entre 2.3 y 2.8 goles en total.`
    },
    fr: {
      q1: `Quelle est la meilleure cote pour ${homeName} x ${awayName}?`,
      a1: getText(match, 'best_bet') 
        ? `Le meilleur pari est ${getText(match, 'best_bet')}.` 
        : `Basé sur les statistiques récentes, les buts attendus et les caractéristiques des équipes.`,
      q2: `Quel est le score prévu pour ${homeName} x ${awayName}?`,
      a2: match.predicted_score 
        ? `Le score prévu est ${match.predicted_score}.` 
        : `Encore en analyse.`,
      q3: `Quelle est la probabilité que les deux équipes marquent ?`,
      a3: match.both_teams_score_pct 
        ? `La probabilité que les deux équipes marquent est de ${match.both_teams_score_pct}%.` 
        : `Autour de 55-60% selon les statistiques récentes.`,
      q4: `Qui est le joueur le plus en vue du match ?`,
      a4: match.key_player 
        ? `${match.key_player} est le principal joueur en vue.` 
        : `Le highlight est pour les principaux attaquants des deux équipes.`,
      q5: `Combien de buts sont attendus pour ${homeName} x ${awayName} ?`,
      a5: match.expected_goals 
        ? `La prévision est de ${match.expected_goals} buts attendus.` 
        : `Entre 2.3 et 2.8 buts au total.`
    }
  };

  const faq = faqTranslations[currentLang as keyof typeof faqTranslations] || faqTranslations.pt;

  // ======================== JSON-LD FAQPage ========================
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": faq.q1, "acceptedAnswer": { "@type": "Answer", "text": faq.a1 } },
      { "@type": "Question", "name": faq.q2, "acceptedAnswer": { "@type": "Answer", "text": faq.a2 } },
      { "@type": "Question", "name": faq.q3, "acceptedAnswer": { "@type": "Answer", "text": faq.a3 } },
      { "@type": "Question", "name": faq.q4, "acceptedAnswer": { "@type": "Answer", "text": faq.a4 } },
      { "@type": "Question", "name": faq.q5, "acceptedAnswer": { "@type": "Answer", "text": faq.a5 } }
    ]
  };

  // ======================== DATA ========================
  const formatMatchDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(`${dateString}T12:00:00`);
      const localeMap: Record<string, string> = {
        pt: 'pt-BR', en: 'en-US', es: 'es-ES', fr: 'fr-FR',
      };
      const locale = localeMap[currentLang] || 'pt-BR';
      return date.toLocaleDateString(locale, {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch {
      return 'Data inválida';
    }
  };

  // ======================== HORÁRIO ========================
  const formatMatchTime = (time: string, date: string) => {
    if (!time || !date) return time || '';
    try {
      const cleanTime = time.substring(0, 5);
      const matchDateTime = new Date(`${date}T${cleanTime}:00-03:00`);
      if (isNaN(matchDateTime.getTime())) return time;
      return matchDateTime.toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit', hour12: false,
      });
    } catch {
      return time;
    }
  };

  const t = {
    pt: { 
      gol1: "Gol no 1º Tempo", golmais: "+ de 0.5 Gols", ambos: "Ambos Marcam", 
      totalgol: "Previsão de Gols", totalcard: "Previsão de Cartões", totalcanto: "Previsão de Escanteios", 
      bestBet: "Melhor Aposta da Partida", stats: "Estatísticas Esperadas", 
      playerTitle: "JOGADOR COM +0.5 CHUTE NO GOL", previsaoplacar: "Placar Previsto",
      analysis: "Análise da Partida", agora: "Apostar Agora", chancegol: "Chance de Marcar",
      titulologinpremium: "Análise de Especialista", facalogin: "Faça login para desbloquear a aposta recomendada, previsão exata de gols e o jogador com maior chance de sucesso.",
      entraragora: "Revelar Palpite Exclusivo", avisopremium: "EXCLUSIVO", revelarjogador: "Descubra o Jogador Destaque", jogadordestaque: "Jogador Destaque", jogadordestaqueinfo: "Desbloqueie para ver qual jogador tem as melhores chances estatísticas nesta partida", textoh1: "Previsão, Estatísticas e Melhor Aposta", oddsTitle: "Odds Disponíveis"
    },
    en: { 
      gol1: "Goal in 1st Half", golmais: "Over 0.5 Goals", ambos: "Both Teams Score", 
      totalgol: "Expected Goals", totalcard: "Card Prediction", totalcanto: "Corner Prediction", 
      bestBet: "Best Bet", stats: "Expected Statistics", 
      playerTitle: "PLAYER WITH +0.5 SHOT ON GOAL", previsaoplacar: "Predicted Score",
      analysis: "Match Analysis", agora: "Bet Now", chancegol: "Scoring Chance",
      titulologinpremium: "Expert Analysis", facalogin: "Sign in to unlock the recommended bet, exact goal prediction, and the player with the highest chance of success.",
      entraragora: "Reveal Exclusive Pick", avisopremium: "EXCLUSIVE", revelarjogador: "Discover the Key Player",  jogadordestaque: "Standout Player", jogadordestaqueinfo: "Unlock to see which player has the best statistical chances in this match", textoh1: "Match Prediction, Statistics and Best Bet", oddsTitle: "Available Odds"
    },
    es: { 
      gol1: "Gol en la 1ª Parte", golmais: "Más de 0.5 Goles", ambos: "Ambos Marcan", 
      totalgol: "Goles Esperados", totalcard: "Predicción de Tarjetas", totalcanto: "Predicción de Córners", 
      bestBet: "Mejor Apuesta", stats: "Estadísticas Esperadas", 
      playerTitle: "JUGADOR CON +0.5 TIRO AL GOL", previsaoplacar: "Marcador Previsto",
      analysis: "Análisis del Partido", agora: "Apostar Ahora", chancegol: "Probabilidad",
      titulologinpremium: "Análisis de Experto", facalogin: "Inicia sesión para desbloquear la apuesta recomendada, la predicción exacta de goles y el jogador con mayor probabilidad de éxito.",
      entraragora: "Revelar Pronóstico Exclusivo", avisopremium: "EXCLUSIVO", revelarjogador: "Descubre al Jugador Destacado",  jogadordestaque: "Jugador Destacado", jogadordestaqueinfo: "Desbloquea para ver qué jugador tiene las mejores probabilidades estadísticas en este partido", textoh1: "Pronóstico del Partido, Estadísticas y Mejor Apuesta", oddsTitle: "Cuotas Disponibles"
    },
    fr: { 
      gol1: "But en 1ère Mi-Temps", golmais: "Plus de 0,5 But", ambos: "Les Deux Marquent", 
      totalgol: "Buts Attendus", totalcard: "Prévision de Cartons", totalcanto: "Prévision de Corners", 
      bestBet: "Meilleur Pari", stats: "Statistiques Attendues", 
      playerTitle: "JOUEUR AVEC +0.5 TIR AU BUT", previsaoplacar: "Score Prévu",
      analysis: "Analyse du Match", agora: "Parier Maintenant", chancegol: "Probabilité",
      titulologinpremium: "Analyse d'Expert", facalogin: "Connectez-vous pour débloquer le pari recommandé, la prévision exacte des buts et le joueur ayant la plus grande probabilité de succès.",
      entraragora: "Révéler le Pronostic Exclusif", avisopremium: "EXCLUSIF", revelarjogador: "Découvrez le Joueur Clé",  jogadordestaque: "Joueur Clé", jogadordestaqueinfo: "Débloquez pour voir quel joueur a les meilleures chances statistiques dans ce match", textoh1: "Pronostic du Match, Statistiques et Meilleur Pari", oddsTitle: "Cotes Disponibles"
    },
  }[currentLang] || t.pt;

  const handleLockedClick = () => {
    window.location.href = `/${lang}/login`;
  };

  const isPremiumVisible = isLoggedIn;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 selection:bg-emerald-500/30">
      {/* ==================== FAQ JSON-LD ==================== */}
      <Script
        id="json-ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Banner */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <GeoBanner 
            position="top" 
            defaultBanner={{
              country: 'DEFAULT',
              imageUrl: 'https://azwbalsmxgoiomapkcyk.supabase.co/storage/v1/object/public/bet-logos/1781563067030.jpg',
              link: 'https://amzn.to/4uB7smA',
              alt: 'Banner Lego'
            }}
          />
        </div>

        {/* ==================== BREADCRUMB ==================== */}
        <nav className="text-xs lg:text-sm text-zinc-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href={`/${lang}`} className="hover:text-emerald-400 transition-colors">Home</Link>
          <span className="text-zinc-700 select-none">›</span>
          <Link href={`/${lang}/competitions/${match.competition?.slug || ''}`} className="hover:text-emerald-400 transition-colors truncate max-w-[150px] sm:max-w-none">
            {getText(match.competition, 'name')}
          </Link>
          <span className="text-zinc-700 select-none">›</span>
          <span className="text-zinc-300 font-medium truncate max-w-[200px] sm:max-w-none">
            {homeName} vs {awayName}
          </span>
        </nav>

        {/* JSON-LD BREADCRUMBLIST */}
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "@position": 1, "name": "Home", "item": `https://goalmetric.online/${lang}` },
                { "@type": "ListItem", "@position": 2, "name": getText(match.competition, 'name'), "item": `https://goalmetric.online/${lang}/competitions/${match.competition?.slug || ''}` },
                { "@type": "ListItem", "@position": 3, "name": `${homeName} vs ${awayName}`, "item": `https://goalmetric.online/${lang}/match/${match.slug || ''}` }
              ]
            })
          }}
        />

        {/* Título Principal */}
        <div className="text-center mb-10">
          {match.competition?.logo_url && (
            <img
              src={match.competition.logo_url}
              alt={`Logo ${getText(match.competition, 'name')}`}
              className="h-16 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-emerald-400 font-semibold text-xl tracking-wide uppercase">
            {homeName} x {awayName}<br/>
            <span className="text-zinc-400 text-sm font-normal tracking-normal normal-case mt-2 block">{t.textoh1}</span>
          </h1>
        </div>

        {/* ==================== TIMES COM LINKS (CARDS) ==================== */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 max-w-5xl mx-auto mb-14">
          
          {/* Time da Casa - Clicável */}
          <Link 
            href={`/${lang}/teams/${homeSlug}`} 
            className="group flex-1 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative w-36 h-36 flex items-center justify-center mb-5">
              <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {match.home_team?.logo_url && (
                <img 
                  src={match.home_team.logo_url} 
                  alt={homeName} 
                  className="relative z-10 w-32 h-32 object-contain drop-shadow-2xl transition-transform group-hover:scale-110" 
                />
              )}
            </div>
            <div className=" px-8 py-3 rounded-2xl transition-all">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                {homeName}
              </p>
            </div>
          </Link>

          {/* VS + Placar Previsto */}
          <div className="flex flex-col items-center justify-center px-4">
            <div className="text-3xl font-black text-zinc-700 tracking-[3px] mb-2">VS</div>
            {match.predicted_score && (
              <div className="mt-2 text-center">
                <p className="text-xs text-emerald-400/80 tracking-[2px] mb-1">{t.previsaoplacar}</p>
                <p className="text-6xl font-black text-white tracking-[12px]">{match.predicted_score}</p>
              </div>
            )}
          </div>

          {/* Time Visitante - Clicável */}
          <Link 
            href={`/${lang}/teams/${awaySlug}`} 
            className="group flex-1 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative w-36 h-36 flex items-center justify-center mb-5">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {match.away_team?.logo_url && (
                <img 
                  src={match.away_team.logo_url} 
                  alt={awayName} 
                  className="relative z-10 w-32 h-32 object-contain drop-shadow-2xl transition-transform group-hover:scale-110" 
                />
              )}
            </div>
            <div className=" px-8 py-3 rounded-2xl transition-all">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                {awayName}
              </p>
            </div>
          </Link>

        </div>

        {/* Data e Horário */}
        <div className="flex flex-wrap justify-center gap-6 text-zinc-400 mb-16">
          <div className="flex items-center gap-3 bg-zinc-900/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 shadow-lg">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">{formatMatchDate(match.match_date)}</span>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 shadow-lg">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">{formatMatchTime(match.match_time, match.match_date)}</span>
          </div>
        </div>

        {/* ==================== MELHOR APOSTA (Bloqueio A) ==================== */}
        <div className="relative rounded-[2.5rem] mb-14 overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className={`relative px-8 py-16 sm:px-12 text-center transition-all duration-700 bg-gradient-to-br from-emerald-900/30 via-zinc-900 to-zinc-950 ${!isPremiumVisible ? 'blur-md opacity-40 scale-[0.98] select-none' : ''}`}>
            <div className="absolute inset-0 bg-[radial-gradient(at_top_center,#10b98115_0%,transparent_70%)]" />
            
            <div className="relative z-10 flex justify-center mb-8">
              <div className="bg-emerald-500/10 backdrop-blur-md px-8 py-3 rounded-2xl flex items-center gap-3 border border-emerald-500/20">
                <Target className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400 font-bold tracking-[0.25em] text-sm uppercase">
                  {t.bestBet}
                </span>
              </div>
            </div>
            
            <p className="relative z-10 text-2xl sm:text-3xl text-white leading-relaxed text-center font-medium max-w-3xl mx-auto">
              {getText(match, 'best_bet') || 'Analise Premium Oculta'}
            </p>
          </div>

          {/* Overlay Premium */}
          {!isPremiumVisible && (
            <div 
              onClick={handleLockedClick}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-[8px] cursor-pointer hover:bg-zinc-950/70 transition-all duration-300"
            >
              <div className="bg-emerald-500/20 p-5 rounded-full mb-5 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Lock className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white mb-2">{t.titulologinpremium}</p>
              <p className="text-zinc-400 mb-8 max-w-md text-center text-sm px-6">{t.facalogin}</p>
              <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-bold px-8 py-3.5 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                {t.entraragora}
              </button>
            </div>
          )}
        </div>

        {/* ==================== ODDS ==================== */}
        {enrichedOdds.length > 0 && (
          <div className="mb-16">
            <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              {t.oddsTitle}
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrichedOdds.map((odd: any, index: number) => (
                <a
                  key={index}
                  href={odd.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(16,185,129,0.1)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {odd.bet_logo && (
                    <div className="relative z-10 mb-6 h-16 flex items-center justify-center">
                      <img src={odd.bet_logo} alt={odd.bet_name} className="max-h-16 object-contain brightness-110 drop-shadow-md" />
                    </div>
                  )}
                  <p className="relative z-10 font-medium text-lg text-zinc-300 mb-4">{odd.bet_name}</p>
                  <div className="relative z-10 text-5xl font-black text-white mb-2 tracking-tighter group-hover:text-emerald-400 transition-colors">
                    {odd.odd_value}
                  </div>
                  <p className="relative z-10 text-[10px] uppercase tracking-[4px] text-zinc-500 mb-8">ODD</p>
                  
                  <div className="relative z-10 mt-auto w-full bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-zinc-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                    {t.agora} <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ==================== ESTATÍSTICAS ==================== */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
            {t.stats}
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Gol no 1º Tempo */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 sm:p-8 text-center flex flex-col justify-center">
              <div className="text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wider mb-4 uppercase">{t.gol1}</div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2">{match.first_half_goals_pct || '-'}%</div>
              <div className="text-zinc-500 text-xs">{t.golmais}</div>
            </div>

            {/* Ambos Marcam */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 sm:p-8 text-center flex flex-col justify-center">
              <div className="text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wider mb-4 uppercase">{t.ambos}</div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2">{match.both_teams_score_pct || '-'}%</div>
            </div>

            {/* Previsão de Gols (Bloqueado) */}
            <div className="relative bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-center">
              <div className={`p-6 sm:p-8 text-center transition-all duration-500 ${!isPremiumVisible ? 'blur-md opacity-20 select-none' : ''}`}>
                <div className="text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wider mb-4 uppercase">{t.totalgol}</div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-2">{match.expected_goals || '-'}</div>
              </div>
              
              {!isPremiumVisible && (
                <div onClick={handleLockedClick} className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-[4px] cursor-pointer hover:bg-zinc-950/70 transition-all border border-emerald-500/20 rounded-3xl">
                  <Lock className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wider mb-4 uppercase">{t.totalgol}</div>
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 px-3 py-1 rounded-full">{t.avisopremium}</span>
                </div>
              )}
            </div>

            {/* Previsão Cartões */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 sm:p-8 text-center flex flex-col justify-center">
              <div className="text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wider mb-4 uppercase">{t.totalcard}</div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2">{match.cards_avg || '-'}</div>
            </div>

            {/* Previsão Escanteios */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 sm:p-8 text-center flex flex-col justify-center">
              <div className="text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wider mb-4 uppercase">{t.totalcanto}</div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2">{match.corners_avg || '-'}</div>
            </div>
          </div>
        </div>

        {/* ==================== JOGADOR DESTAQUE ==================== */}
        {match.key_player && (
          <div className="relative mb-16 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            <div className={`relative bg-gradient-to-br from-zinc-900 to-zinc-950 p-12 sm:p-16 text-center transition-all duration-700 ${!isPremiumVisible ? 'blur-md opacity-30 select-none scale-[0.99]' : ''}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Star className="w-32 h-32 text-emerald-500" />
              </div>
              
              <div className="relative z-10 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold tracking-[3px] px-6 py-2.5 rounded-full mb-8 border border-emerald-500/20">
                {t.playerTitle}
              </div>
              <p className="relative z-10 text-4xl sm:text-6xl font-black text-white leading-tight mb-10 tracking-tight">
                {match.key_player}
              </p>

              <div className="relative z-10 inline-flex flex-col sm:flex-row items-center gap-4 bg-zinc-950/50 border border-white/5 rounded-2xl px-10 py-6">
                <span className="text-zinc-400 font-medium uppercase tracking-widest text-sm">{t.chancegol}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-emerald-400 tracking-tighter">
                    {match.key_player_chance ? `${match.key_player_chance}` : '65'}
                  </span>
                  <span className="text-2xl text-emerald-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {!isPremiumVisible && (
              <div onClick={handleLockedClick} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/70 backdrop-blur-[6px] cursor-pointer hover:bg-zinc-950/80 transition-all duration-300">
                <div className="bg-emerald-500/20 p-4 rounded-full mb-4">
                  <Lock className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white mb-2">{t.jogadordestaque}</p>
                <p className="text-zinc-400 mb-6 max-w-sm text-center text-sm px-4">{t.jogadordestaqueinfo}.</p>
                <button className="bg-white text-zinc-950 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
                  {t.revelarjogador}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== ANÁLISE DA PARTIDA ==================== */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 flex items-center gap-4">
            {t.analysis}
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
          </h2>
          
          <div className="text-zinc-300 leading-relaxed whitespace-pre-line text-[16px] sm:text-[17.5px] max-w-none font-light">
            {getText(match, 'analysis') || 'Análise detalhada da partida em elaboração.'}
          </div>
        </div>
      </div>
    </div>
  );
}