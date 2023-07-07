import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { SONG_LIMIT, loadStreamerHistorySongs, selectStreamerHistorySongs } from 'entities/streamer-song-data'
import FeelsOkayMan from 'shared/assets/emotes/FeelsOkayMan.png'
import { HyperinkIcon } from 'shared/assets/icons'
import { capitalize } from 'shared/lib/helpers'
import i18n from 'shared/lib/i18n/i18n'
import { useAppDispatch } from 'shared/lib/store'
import { StreamerHistorySong } from 'shared/types'
import { ErrorMessage, Loading, Pagination } from 'shared/ui'
import { SongDataList, SongListItem } from 'shared/ui/song-data-list'
import { getYtPlaylistLink, usePageSearchParam } from '../lib'
import { ListStatusNotification } from './list-status-notification/list-status-notification'

interface HistoryProps {
    streamerName: string
}

export const History = ({ streamerName }: HistoryProps) => {
    const login = streamerName.toLocaleLowerCase()
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const history = useSelector(selectStreamerHistorySongs)
    const total = Math.ceil(history.total / SONG_LIMIT)
    const dispatch = useAppDispatch()
    const [historyList, setHistoryList] = useState<StreamerHistorySong[]>(history.list)
    const ytPlaylistLink = getYtPlaylistLink(historyList.map((song) => song.link))
    const [searchStr, setSearchStr] = useState('')
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let page = usePageSearchParam({
            from: history.from,
            searchParams,
        })
        setSearchParams({ page: page.toString() })
        dispatch(
            loadStreamerHistorySongs({
                login: login,
                limit: SONG_LIMIT,
                from: (page - 1) * SONG_LIMIT,
            }),
        )
    }, [])

    const search = (str: string) => {
        setSearchStr(str)
        setHistoryList(
            history.list.filter(
                (song) =>
                    song.name.toLowerCase().includes(str.toLowerCase()) ||
                    song.sender.toLowerCase().includes(str.toLowerCase()),
            ),
        )
    }

    useEffect(() => {
        setHistoryList(history.list)
        search(searchStr)
    }, [history])

    const changePage = (page: number) => {
        window.scrollTo(0, ref.current!.offsetTop - 20)
        dispatch(loadStreamerHistorySongs({ login, limit: SONG_LIMIT, from: SONG_LIMIT * (page - 1) }))
        setSearchParams({ page: page.toString() })
    }

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
                searchFun={search}
            >
                {history.status === 'loading' && <Loading />}
                {history.status === 'rejected' && <ErrorMessage>{history.error}</ErrorMessage>}
                {history.status === 'received' && history.list.length === 0 && (
                    <ListStatusNotification
                        emote={FeelsOkayMan}
                        altEmote="FeelsOkayMan"
                        title={t('streamer-page.list-is-empty.history')}
                        text={t('streamer-page.list-is-empty.fix')}
                    />
                )}
                {history.status === 'received' && (
                    <>
                        {historyList.map((song, index) => {
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
                                    key={index + 1 + history.from}
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
                        <Pagination total={total} page={history.from / SONG_LIMIT + 1} changePage={changePage} />
                    </>
                )}
            </SongDataList>
        </>
    )
}
