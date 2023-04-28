import clsx from 'clsx'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ConnectIcon, NoteIcon, SupportIcon } from 'shared/assets/icons'
import { useElementSize, useMediaQuery } from 'shared/lib/hooks'
import { InfoCard } from '../info-card/info-card'
import styles from './about-botoholt.module.scss'

export const AboutBotoholt = () => {
    const ref = useRef(null)
    const { width } = useElementSize(ref)
    const { t } = useTranslation()
    const isMobile = !useMediaQuery('(min-width: 420px)')

    return (
        <div ref={ref} className={clsx(styles.about, width < 1000 && styles.aboutCompact)}>
            <InfoCard mobile={isMobile} icon={<NoteIcon />} title={t('about.botoholt')}>
                {t('about.botoholt-text')}
            </InfoCard>
            <InfoCard mobile={isMobile} icon={<ConnectIcon />} title={t('about.connect')}>
                {t('about.connect-text')}
            </InfoCard>
            <InfoCard mobile={isMobile} icon={<SupportIcon />} title={t('about.support')}>
                {t('about.support-text')}
                <a href="https://fantalks.io/r/botoholt">{t('about.support-link-text')}</a>
            </InfoCard>
        </div>
    )
}
