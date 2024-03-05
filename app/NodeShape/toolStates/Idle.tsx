import { StateNode, TLEventHandlers } from '@tldraw/editor'

export class Idle extends StateNode {
	static override id = 'idle'

	override onPointerDown: TLEventHandlers['onPointerDown'] = (info) => {
		console.log('Node Idle: onPointerDown')
		this.parent.transition('pointing', info)
	}

	override onEnter = () => {
		console.log('Node Idle: onEnter')
		this.editor.setCursor({ type: 'cross', rotation: 0 })
	}

	override onCancel = () => {
		this.editor.setCurrentTool('select')
	}

	override onRightClick: TLEventHandlers['onRightClick'] = () => {
		console.log('Node: onRightClick')
	}
}