/* eslint-disable react-hooks/rules-of-hooks */
import {
	BaseBoxShapeUtil,
	DefaultSpinner,
	HTMLContainer,
	Icon,
	TLBaseShape,
	stopEventPropagation,
	toDomPrecision,
	useIsEditing,
	useToasts,
	useEditor,
	createShapeId
} from '@tldraw/tldraw'
import { useState, useEffect } from 'react'
import IconButton from '@mui/material/IconButton'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'

export type TaskSplitResponseShape = TLBaseShape<
	'task_split',
	{
		w: number
		h: number
	}
>

export type SubTaskShape = TLBaseShape<
	'subtask',
	{
		text: string
		w: number
		h: number
		isPressed: boolean
	}
>

const SIZE = 200
const PADDING = 10

export class TaskSplitResponseShapeUtil extends BaseBoxShapeUtil<TaskSplitResponseShape> {
	static override type = 'task_split' as const

	getDefaultProps (): TaskSplitResponseShape['props'] {
		return {
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = () => false
	override canResize = () => true
	override canBind = () => false
	override canUnmount = () => false

	override component (shape: TaskSplitResponseShape) {
		return (
			<HTMLContainer className='tl-embed-container' id={shape.id}>
				<div
					style={{
						width: '100%',
						height: '100%',
						backgroundColor: 'var(--color-muted-2)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						border: '1px solid var(--color-muted-1)',
					}}
				>
					<DefaultSpinner />
				</div>
			</HTMLContainer>
		)
	}

	indicator (shape: TaskSplitResponseShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

export class SubTaskShapeUtil extends BaseBoxShapeUtil<SubTaskShape> {
	static override type = 'subtask' as const

	getDefaultProps (): SubTaskShape['props'] {
		return {
			text: '',
			w: SIZE,
			h: SIZE,
			isPressed: false,
		}
	}

	override canEdit = () => false
	override isAspectRatioLocked = () => false
	override canResize = () => false
	override canBind = () => false
	override canUnmount = () => false

	override component (shape: SubTaskShape) {
		const { text } = shape.props
		const editor = useEditor()

		useEffect(() => {
			console.log('Current page shape ids: ', editor.getSelectedShapeIds())

			if (!editor.getSelectedShapeIds().includes(shape.id)) {
				console.log('gonna close th tips')
				editor.updateShapes([
					{
						id: shape.id,
						type: shape.type,
						props: {
							isPressed: false,
						},
					},
				])
			}
		}, [editor.getSelectedShapeIds()])

		return (
			<HTMLContainer
				className='tl-embed-container'
				id={shape.id}
				style={{
					pointerEvents: 'all',
					display: 'inline-block',
					alignItems: 'center',
					justifyContent: 'center',
					direction: 'ltr',
				}}
			>
				<div>
					<div
						style={{
							width: SIZE,
							height: SIZE,
							position: 'absolute',
							backgroundColor: '#e5e5e5',
							display: "flex",
							alignItems: "center",
							textAlign: 'center',
							verticalAlign: 'middle',
						}}
					>
						{text}
					</div>
					<div
						style={{
							marginLeft: SIZE + PADDING,
						}}
					>
						{shape.props.isPressed && (
							<div>
								<IconButton size='small' onPointerDown={stopEventPropagation} onClick={() => {
									const newFrameShapeId = createShapeId()
									const selectionBounds = editor.getSelectionPageBounds()
									editor.createShape({
										id: newFrameShapeId,
										type: 'frame',
										x: selectionBounds.x,
										y: selectionBounds.y,
										props: {
											w: 500,
											h: 600,
											name: shape.props.text
										},
									})
									editor.deleteShapes([shape.id])
								}}>
									<AspectRatioIcon />
								</IconButton>
							</div>
						)}
					</div>
				</div>
			</HTMLContainer>
		)
	}

	indicator (shape: SubTaskShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
