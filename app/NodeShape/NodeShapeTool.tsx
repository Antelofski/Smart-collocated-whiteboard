import { StateNode } from '@tldraw/editor'
import { Idle } from './toolStates/Idle'
import { Pointing } from './toolStates/Pointing'

/** @public */
export class NodeShapeTool extends StateNode {
	static override id = 'node'
	static override initial = 'idle'
	static override children = () => [Idle, Pointing]
	override shapeType = 'node'
}