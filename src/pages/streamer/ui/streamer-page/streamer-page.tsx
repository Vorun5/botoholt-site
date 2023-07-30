import { useEffect } from 'react'
import { Footer, Header } from 'widgets'
import { useSongListNav } from 'widgets/song-list'
import { loadStreamer, selectStreamer } from 'entities/streamer'
import { loadStreamerQueue, loadStreamerTopDjs, loadStreamerTopSongs, SONG_LIMIT } from 'entities/streamer-song-data'
import { useMediaQuery } from 'shared/lib/hooks'
import { useAppDispatch } from 'shared/lib/store'
import { ErrorMessage, Loading, Page, PageContent, PageContentExpanded } from 'shared/ui'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { StreamerPageDesktop } from './desktop/streamer-page-desktop'
import { StreamerPageMobile } from './mobile/streamer-page-mobile'

const StreamerPageLogic = () => {
    const dispatch = useAppDispatch()
    const { streamerName } = useParams()
    const login = streamerName || ''
    const streamer = useSelector(selectStreamer)

    useEffect(() => {
        dispatch(loadStreamer(login))
        dispatch(loadStreamerQueue(login))
    }, [dispatch, streamerName])

    const [tab, period, page] = useSongListNav(login, login.toLowerCase())

    useEffect(() => {
        const dispatchParams = {
            login: login,
            period: period,
            limit: SONG_LIMIT,
            from: page === -1 ? 0 : (page - 1) * SONG_LIMIT,
        }
        if (tab === 'top-songs') dispatch(loadStreamerTopSongs(dispatchParams))
        if (tab === 'top-djs') dispatch(loadStreamerTopDjs(dispatchParams))
    }, [period, tab, page])

    const isDesktop = useMediaQuery('(min-width: 900px)')
    const isMobile = !isDesktop

    return (
        <>
            <PageContentExpanded>
                {streamer.status === 'loading' && <Loading />}
                {streamer.status === 'rejected' && <ErrorMessage>{streamer.error}</ErrorMessage>}
            </PageContentExpanded>
            {streamer.status === 'received' && streamer.streamer.name.length !== 0 && (
                <>
                    {isDesktop && <StreamerPageDesktop tab={tab} period={period} streamer={streamer.streamer} />}
                    {isMobile && <StreamerPageMobile tab={tab} period={period} streamer={streamer.streamer} />}
                </>
            )}
        </>
    )
}

export const StreamerPage = () => {
    return (
        <Page>
            <Header />
            <PageContent>
                <StreamerPageLogic />
            </PageContent>
            <Footer />
        </Page>
    )
}
