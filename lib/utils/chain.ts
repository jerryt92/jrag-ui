import { find } from './lodash'

export type ChainFuncI<T = any> = (arg: T) => T

export type ChainFuncAsyncI<T = any> = (arg: T) => Promise<T>

export enum ChainFuncTypeEnum {
	sync,
	async
}

export interface ChainsI {
	type: ChainFuncTypeEnum
	func: ChainFuncI | ChainFuncAsyncI
}

export class Chain {
	chains: ChainsI[] = []
	use(func: ChainFuncI) {
		const isExsit = find(this.chains, {
			type: ChainFuncTypeEnum.sync,
			func: func
		})
		if (!isExsit) {
			this.chains.push({
				type: ChainFuncTypeEnum.sync,
				func: func
			})
		}
	}
	useAsync(func: ChainFuncAsyncI) {
		const isExsit = find(this.chains, {
			type: ChainFuncTypeEnum.async,
			func: func
		})
		if (!isExsit) {
			this.chains.push({
				type: ChainFuncTypeEnum.async,
				func: func
			})
		}
	}
	async execute(arg: any) {
		let data = arg
		for (let i = 0; i < this.chains.length; i++) {
			const chainFunc = this.chains[i]
			if (chainFunc.type === ChainFuncTypeEnum.async) {
				data = await chainFunc.func(data)
			} else {
				data = chainFunc.func(data)
			}
		}
		return data
	}
}
