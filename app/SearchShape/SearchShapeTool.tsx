import { StateNode } from '@tldraw/editor'
import { Idle } from './toolStates/Idle'
import { Pointing } from './toolStates/Pointing'

/** @public */
export class SearchTool extends StateNode {
	static override id = 'search'
	static override initial = 'idle'
	static override children = () => [Idle, Pointing]
	override shapeType = 'search'
}