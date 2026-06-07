import { useTranslation } from 'react-i18next'

const TIPS = [
  'Beginne jeden Morgen mit Bismillāh — auch eine kleine Handlung wird zur ʿIbāda.',
  'Wer täglich Ṣalāt ul-Fajr betet, steht unter dem Schutz Allahs den ganzen Tag.',
  'Ein Lächeln gegenüber deinem Bruder ist Ṣadaqa — auch das zählt.',
  'Lies täglich auch nur einen Āya des Qurʾān — Kontinuität ist besser als Menge.',
  'Sage öfter Alḥamdulillāh — Dankbarkeit vermehrt die Gnade Allahs.',
  'Vergib leicht und vergiss schnell — das befreit das Herz mehr als den anderen.',
  'Hüte deine Zunge: Was du nicht sagst, schadet dir nie.',
]

function getTodaysTip(): string {
  const dayOfMonth = new Date().getDate()
  return TIPS[dayOfMonth % TIPS.length]
}

export function DailyTipCard(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div
      className="rounded-card p-4 text-cream-card"
      style={{ background: 'linear-gradient(140deg, var(--color-primary), var(--color-moss))' }}
      role="complementary"
      aria-label={t('azkar.dailyTipLabel')}
    >
      <p className="text-[10px] uppercase tracking-[0.1em] opacity-70 font-medium m-0 mb-2">
        {t('azkar.dailyTipLabel')}
      </p>
      <p className="text-sm leading-relaxed m-0">{getTodaysTip()}</p>
    </div>
  )
}
