import {
	createRouter,
	createWebHashHistory,
	createWebHistory
} from 'vue-router'
import {
	deepForEach,
	isFunction,
	joinUrl,
	routePathToPageName
} from '@jrag/utils'
import { t } from '@jrag/locale'
import type { Router, RouteRecordRaw } from 'vue-router'

function optimizeRoutes(routes: RouteRecordRaw[]) {
	deepForEach(routes, (route, level, isLeaf, parent) => {
		route.path = parent ? joinUrl(parent.path, route.path) : route.path
		if (route.component) {
			if (isFunction(route.component)) {
				const componentLoader = route.component
				route.component = async () => {
					const module = await componentLoader()
					const component = module.default ? module.default : module
					component.name = component.name ?? routePathToPageName(route.path)
					return component
				}
			} else {
				route.component.name = routePathToPageName(route.path)
			}
		}
	})
}

export function createWebRouter({ routes, routeBase, routeType }): Router {
	if (routes) optimizeRoutes(routes)
	const router = createRouter({
		history:
			routeType === 'hash'
				? createWebHashHistory(routeBase)
				: createWebHistory(routeBase),
		routes: routes || []
	})

	router.beforeEach((to) => {
		if (to.meta.title) {
			document.title = `${t(to.meta.title as string)}`
		} else {
			document.title = `${t('APP_HOME', '', document.title)}`
		}
	})

	router.afterEach((to) => {
		if (to.meta.title) {
			document.title = `${t(to.meta.title as string)}`
		} else {
			document.title = `${t('APP_HOME', '', document.title)}`
		}
	})

	return router
}
