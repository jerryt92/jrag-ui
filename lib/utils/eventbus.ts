import mitt from 'mitt'

type Events = {
	foo: string;
	bar?: string;
}
const eventbus:any = {}
const emitters = mitt<Events>()
eventbus.$on = emitters.on
eventbus.$off = emitters.off
eventbus.$emit = emitters.emit

export  { eventbus}