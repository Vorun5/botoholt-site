import { useEffect, useRef, useState } from 'react'
import { SONG_LIMIT, useStreamerHistoryQuery } from 'entities/streamer-song-data'
import FeelsOkayMan from 'shared/assets/emotes/FeelsOkayMan.png'
import { HyperinkIcon } from 'shared/assets/icons'
import { capitalize } from 'shared/lib/helpers'
import i18n from 'shared/lib/i18n/i18n'
import { Dropdown, ErrorMessage, Loading, Pagination, SearchField } from 'shared/ui'
import { SongDataList, SongListItem } from 'shared/ui/song-data-list'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { debounce } from 'underscore'

import { getYtPlaylistLink } from '../../lib'
import { ListStatusNotification } from '../list-status-notification/list-status-notification'

import styles from './history.module.scss'

export const History = ({
    login: streamerName,
    from,
    by,
    name,
}: {
    login: string
    from: number
    by: string
    name: string
}) => {
    const login = streamerName.toLocaleLowerCase()
    const { t } = useTranslation()
    const [_, setSearchParams] = useSearchParams()
    const [searchStr, setSearchStr] = useState(name)
    const [searchType, setSearchType] = useState<'by-name' | 'by-sender'>('by-name')

    useEffect(() => {
        if (!name && by) {
            setSearchStr(by)
            setSearchType('by-sender')
        }
    }, [])

    const {
        data: history,
        isSuccess,
        isLoading,
        isError,
        fetchStatus,
    } = useStreamerHistoryQuery({
        login,
        from: from,
        limit: SONG_LIMIT,
        name: name,
        by: by,
    })

    const ytPlaylistLink = getYtPlaylistLink(isSuccess ? history.list.map((song) => song.link) : [])

    const ref = useRef<HTMLDivElement>(null)

    const handlerSearchByNameOrSender = debounce((searchStr: string) => {
        setSearchStr(searchStr)
        setSearchParams({ page: '1', ...getNewNameAndBySearchParams() })
    }, 1000)

    const getNewNameAndBySearchParams = (): { name: string } | { by: string } | {} => {
        if (!searchStr) return {}
        return searchType === 'by-name' ? { name: searchStr } : { by: searchStr }
    }

    const changePage = (page: number) => {
        window.scrollTo(0, ref.current!.offsetTop - 20)
        setSearchParams({
            page: page.toString(),
            ...getNewNameAndBySearchParams(),
        })
    }

    // TODO: допилить после того как добавлю возможно менять limit
    useEffect(() => {
        if (!isSuccess) return
        if (history.total - 1 < from) {
            setSearchParams({
                page: '1',
                ...getNewNameAndBySearchParams(),
            })
        }
    }, [history])

    return (
        <>
            <div ref={ref} />
            <SongDataList
                title={
                    ytPlaylistLink !== null ? (
                        <a target="_blank" href={ytPlaylistLink}>
                            {t('streamer-page.tab-titles.history')} <HyperinkIcon />
                        </a>
                    ) : (
                        t('streamer-page.tab-titles.history')
                    )
                }
            >
                <div className={styles.searchContainer}>
                    <div className={styles.search}>
                        <SearchField defaultValue={name ? name : by} onChange={handlerSearchByNameOrSender} />
                    </div>
                    <Dropdown
                        items={['Search by name', 'Search by sender']}
                        selectedItem={searchType === 'by-name' ? 'Search by name' : 'Search by sender'}
                        onSelect={(type) => {
                            setSearchType(type === 'Search by name' ? 'by-name' : 'by-sender')
                        }}
                    />
                </div>
                {isLoading && <Loading />}
                {isError && <ErrorMessage>{`Error status: ${fetchStatus}`}</ErrorMessage>}
                {isSuccess && history.list.length === 0 && (
                    <ListStatusNotification
                        emote={FeelsOkayMan}
                        altEmote="FeelsOkayMan"
                        title={t('streamer-page.list-is-empty.history')}
                        text={t('streamer-page.list-is-empty.fix')}
                    />
                )}
                {isSuccess && (
                    <>
                        {history.list.map((song, index) => {
                            const date = new Date(song.date)
                            const formatDateWeek = new Intl.DateTimeFormat(i18n.language, {
                                weekday: 'short',
                            }).format(date)
                            const formatDateTime = new Intl.DateTimeFormat(i18n.language, {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: false,
                            }).format(date)
                            const formatDate = new Intl.DateTimeFormat(i18n.language).format(date)

                            return (
                                <SongListItem
                                    key={song.id}
                                    songName={song.name}
                                    songLink={song.link}
                                    sender={song.sender}
                                    number={history.list.findIndex((i) => i === song) + 1 + history.from}
                                    extraInfo={
                                        <>
                                            {`${formatDateTime} ${capitalize(formatDateWeek)}`}
                                            <br />
                                            {formatDate}
                                        </>
                                    }
                                />
                            )
                        })}
                        <Pagination
                            total={Math.ceil(history.total / SONG_LIMIT)}
                            page={history.from / SONG_LIMIT + 1}
                            changePage={changePage}
                        />
                    </>
                )}
            </SongDataList>
        </>
    )
}
