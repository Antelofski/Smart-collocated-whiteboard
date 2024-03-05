import {
	StateNode,
	TLEventHandlers,
	TLInterruptEvent,
	TLPointerEventInfo,
	createShapeId,
} from '@tldraw/editor'
import { SearchShape } from '../SearchShape'

export class Pointing extends StateNode {
	static override id = 'pointing'

	dragged = false

	info = {} as TLPointerEventInfo

	wasFocusedOnEnter = false

	markId = ''

	shape = {} as SearchShape


	override onEnter = () => {

		console.log('Search Pointing: onEnter')

		this.wasFocusedOnEnter = !this.editor.getIsMenuOpen()
		if (this.wasFocusedOnEnter) {
			this.shape = this.createShape()
		}
	}

	override onPointerDown: TLEventHandlers['onPointerDown'] = (info) => {
		console.log('Search Pointing: onPointerDown')

	}

	override onPointerMove: TLEventHandlers['onPointerMove'] = (info) => {

		console.log('Search Pointing: onPointerMove')

		if (this.editor.inputs.isDragging) {
			if (!this.wasFocusedOnEnter) {
				this.shape = this.createShape()
			}

			this.editor.setCurrentTool('select.translating', {
				...info,
				target: 'shape',
				shape: this.shape,
				isCreating: true,
				editAfterComplete: true,
				onInteractionEnd: 'node',
			})
		}
	}

	override onPointerUp: TLEventHandlers['onPointerUp'] = () => {
		console.log('Search Pointing: onPointerUp')
		this.complete()
	}

	override onRightClick: TLEventHandlers['onRightClick'] = () => {
		console.log('Search Pointing: onRightClick')
	}

	override onInterrupt: TLInterruptEvent = () => {
		this.cancel()
	}

	override onComplete: TLEventHandlers['onComplete'] = () => {
		this.complete()
	}

	override onCancel: TLEventHandlers['onCancel'] = () => {
		this.cancel()
	}

	private complete() {
		if (this.wasFocusedOnEnter) {
			if (this.editor.getInstanceState().isToolLocked) {
				this.parent.transition('idle')
			} else {
				this.editor.setEditingShape(this.shape.id)
				this.editor.setCurrentTool('select.editing_shape', {
					...this.info,
					target: 'shape',
					shape: this.shape,
				})
			}
		}

		this.parent.transition('idle')
	}

	private cancel() {
		this.editor.bailToMark(this.markId)
		this.parent.transition('idle', this.info)
	}

	private createShape() {
		const {
			inputs: { originPagePoint },
		} = this.editor

		const id = createShapeId()
		this.markId = `creating:${id}`
		this.editor.mark(this.markId)

		this.editor
			.createShapes([
				{
					id,
					type: 'search',
					x: originPagePoint.x,
					y: originPagePoint.y,
				},
			])
			.select(id)

		const shape = this.editor.getShape<SearchShape>(id)!
		const bounds = this.editor.getShapeGeometry(shape).bounds

		// Center the text around the created point
		this.editor.updateShapes([
			{
				id,
				type: 'node',
				x: shape.x - bounds.width / 2,
				y: shape.y - bounds.height / 2,
			},
		])

		return this.editor.getShape<SearchShape>(id)!
	}
}