import {
	computed,
	toRaw,
	ref,
	onBeforeMount,
	watch,
	unref,
	nextTick,
	isRef,
	provide,
	readonly
} from 'vue'
import {
	memo,
	findIndex,
	find,
	s8,
	routePathToPageName,
	delUrlParams
} from '@jrag/utils'
import type { Ref, ComputedRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'

type PageI = {
	from?: string
	name: string
	id?: string
	path: string
	lock?: boolean
	noCache?: boolean
}

type CachePageI = {
	id: string
	path: string
	component?: string
}

type pageHooksI = {
	pages: Ref<PageI[]>
	cachePages: Ref<CachePageI[]>
	initPage: (page: PageI[] | PageI) => void
	openPage: (page: PageI) => void
	closePage: (page: PageI) => void
	closeAllPage: () => void
	closeOtherPage: (page: PageI) => void
	switchPage: (page: PageI) => void
	activePageId: Ref<string>
	activePage: ComputedRef<PageI>
	isInCache: (page: PageI | Ref<PageI>) => boolean
	routerCache: Ref<string[]>
	shouldRefreshRouter: Ref<boolean>
	refreshPage: () => void
	replacePage: (page: PageI[] | PageI) => void
}

export type PageTabI = {
	openPage: (page: PageI) => void
	closePage: (page: PageI) => void
	closeAllPage: () => void
	closeOtherPage: (page: PageI) => void
	switchPage: (page: PageI) => void
	refreshPage: () => void
	replacePage: (page: PageI[] | PageI) => void
}

export const usePage: () => pageHooksI = memo(() => {
	// 打开的页面列表
	const pages: Ref<PageI[]> = ref([])
	// 缓存页面列表
	const cachePages: Ref<CachePageI[]> = ref([])
	// 当前页面id
	const activePageId: Ref<string> = ref('')
	// 路由刷新标志
	const shouldRefreshRouter: Ref<boolean> = ref(true)

	const router = useRouter()
	const route = useRoute()
	// {path: name}
	const pathMap = {}

	// 当前页面对象
	const activePage = computed<{path?: string}>(() => {
		const pagesData = toRaw(pages.value)
		const activeId = unref(activePageId)
		return find(pagesData, { id: activeId }) || {}
	})

	// router类型缓存
	const routerCache = computed(() => {
		return cachePages.value.map((cache) => cache.component)
	})

	onBeforeMount(() => {
		provide(
			'pageTab',
			readonly({
				openPage,
				closePage,
				closeAllPage,
				closeOtherPage,
				switchPage,
				refreshPage,
				replacePage
			} as PageTabI)
		)
	})

	watch(
		() => activePageId.value,
		() => {
			router.push(activePage.value.path)
		}
	)

	watch(
		() => route.fullPath,
		(val) => {
			const pathInPage = pages.value.find((item) => item.path === val)
			if (pathInPage) {
				if (activePage.value.path !== val) {
					switchPage(pathInPage)
				}
			} else {
				openPage({
					path: val,
					name: pathMap[val]
				})
			}
		}
	)

	const isSamePagePath = (pagePath1: string, pagePath2: string) => {
		const excludeParamKeys = ['_navId', '_from']
		const path1 = delUrlParams(pagePath1, excludeParamKeys)
		const path2 = delUrlParams(pagePath2, excludeParamKeys)
		return path1 === path2
	}

	const needCache = (page: PageI | Ref<PageI>) => {
		const pageData = isRef(page) ? unref(page) : page
		// cache标志为true，才加入缓存列表
		return !pageData.noCache
	}

	// 添加页面至缓存列表
	const addCachePage = (page: PageI, replace: boolean = false) => {
		if (needCache(page)) {
			// 缓存中不存在该页面时才加入
			if (!isInCache(page)) {
				const cachePage: CachePageI = {
					id: page.id,
					path: page.path
				}
				// 当页面为路由类型时设置页面对应的组件名，用于keep-alive缓存
				cachePage.component = routePathToPageName(page.path)
				if (replace) {
					const cacheIndex = findIndex(toRaw(cachePages.value), {
						id: activePageId.value
					})
					cachePages.value.splice(cacheIndex, 1, cachePage)
				} else {
					cachePages.value.push(cachePage)
				}
			}
		}
	}

	// 移除缓存
	const removeCachePage = (page: PageI) => {
		const cachePageData = toRaw(cachePages.value)
		const cacheIndex = findIndex(cachePageData, { id: page.id })
		if (cacheIndex !== -1) cachePages.value.splice(cacheIndex, 1)
	}

	// 添加页面至页面列表
	const addPage = (page: PageI) => {
		if (!getSamePage(page)) {
			pathMap[page.path] = page.name
			pages.value.push(page)
		}
		addCachePage(page)
	}

	// 初始化页面
	const initPage = (page: PageI[] | PageI) => {
		const initialPages: PageI[] = Array.isArray(page) ? page : [page]
		if (initialPages.length === 0) return
		initialPages.forEach((p) => {
			if (!p.id) p.id = s8()
			addPage(p)
		})
		if (!toRaw(activePageId.value)) switchPage(initialPages[0])
	}

	// 打开页面
	const openPage = (page: PageI) => {
		if (!page.id) page.id = s8()
		addPage(page)
		switchPage(page)
	}

	// 切换页面
	const switchPage = (page: PageI) => {
		const finalPage = getSamePage(page) || page
		activePageId.value = finalPage.id
		addCachePage(finalPage)
	}

	// 关闭页面
	const closePage = (page: PageI) => {
		const pagesData = toRaw(pages.value)
		const pageIndex = findIndex(pagesData, { id: page.id })
		if (pageIndex >= 0) {
			pages.value.splice(pageIndex, 1)
			removeCachePage(page)
			if (page.from && find(pages.value, { id: page.from })) {
				// 从某个页签跳转到子页签，关闭子页签后，返回原副页签
				activePageId.value = page.from
				const fromPage = find(pages.value, { id: activePageId.value })
				switchPage(fromPage)
			} else if (pages.value.length > 0) {
				if (page.id === activePageId.value) {
					// 关闭的是当前页签时，显示前一个页签
					const toIndex = Math.min(pages.value.length - 1, pageIndex)
					switchPage(pages.value[toIndex])
				}
			} else {
				activePageId.value = ''
			}
		}
	}

	// 关闭所有页面
	const closeAllPage = () => {
		pages.value = pages.value.filter((page) => page.lock)
		activePageId.value = pages.value.length > 0 ? pages.value[0].id : ''
		cachePages.value = []
	}

	// 关闭其他页面
	const closeOtherPage = (page: PageI) => {
		const lockPages = pages.value.filter((page) => page.lock)
		const isInPage = find(lockPages, { id: page.id })
		pages.value = isInPage ? lockPages : lockPages.concat(page)
		const cachePageData = toRaw(cachePages.value)
		const cachePage = find(cachePageData, { id: page.id })
		cachePages.value = cachePage ? [cachePage] : []
		switchPage(page)
	}

	// 当前页面是否在缓存中
	const isInCache = (page: PageI | Ref<PageI>) => {
		const pageData = isRef(page) ? unref(page) : page
		const cachePageData = toRaw(cachePages.value)
		const result =
			!!find(cachePageData, { id: pageData.id }) ||
			cachePageData.some((cachePage) =>
				isSamePagePath(cachePage.path, pageData.path)
			)
		return result
	}

	const getSamePage = (page: PageI | Ref<PageI>) => {
		const pageData = isRef(page) ? unref(page) : page
		const openedPages = toRaw(pages.value)
		const samePageById = find(openedPages, { id: pageData.id })
		const samePageByPath = openedPages.filter((p) =>
			isSamePagePath(p.path, pageData.path)
		)
		return samePageByPath.length > 0 ? samePageByPath[0] : samePageById
	}

	// 刷新页面
	const refreshPage = () => {
		shouldRefreshRouter.value = false
		const index = findIndex(toRaw(cachePages.value), {
			id: activePageId.value
		})
		let cacheData: CachePageI | null = null
		if (index !== -1) {
			cacheData = cachePages.value[index]
			cachePages.value.splice(index, 1)
		}
		nextTick(() => {
			shouldRefreshRouter.value = true
			if (index !== -1 && cacheData) {
				cachePages.value.splice(index, 0, cacheData)
			}
		})
	}

	const replacePage = (page: PageI) => {
		if (!page.id) page.id = s8()
		const index = findIndex(toRaw(pages.value), {
			id: activePageId.value
		})
		pages.value.splice(index, 1, page)
		pathMap[page.path] = page.name
		addCachePage(page, true)
		activePageId.value = page.id
	}

	return {
		routerCache,
		activePageId,
		shouldRefreshRouter,
		pages,
		initPage,
		switchPage,
		closePage,
		closeAllPage,
		closeOtherPage,
		refreshPage,
		replacePage
	}
})
