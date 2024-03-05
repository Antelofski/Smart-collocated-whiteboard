import { BaseBoxShapeUtil, stopEventPropagation, Rectangle2d, useEditor, HTMLContainer, createShapeId } from "@tldraw/tldraw";
import { IconButton } from "@mui/material";
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { useEffect, useState } from "react";

export type ResultShape = TLBaseShape<
	'result',
	{
		text: string,
		w: number,
		h: number,
		growX: number,
		font: string,
		size: string,
	}
>

const PADDING = 10

export class ResultShapeUtil extends BaseBoxShapeUtil<ResultShape> {
	static override type = 'result' as const

	getDefaultProps(): ResultShape['props'] {
		return {
			text: '',
			w: 200,
			h: 120,
			growX: 0,
			font: 'sans',
			size: 's',
		}
	}

	override canEdit = () => true
	override canBind = () => false
	override canUnmount = () => false

	override getGeometry(shape: ResultShape) {
		return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })
	}

	override component(shape: ResultShape) {
		const { id, type, x, y, props: { text, w, h } } = shape
		const editor = useEditor()
		const [isSelected, setIsSelected] = useState(false)

		useEffect(() => {
			if (!editor.getSelectedShapeIds().includes(id)) {
				setIsSelected(false)
			} else {
				setIsSelected(true)
			}
		}, [editor.getSelectedShapeIds()])

		const handleExpand = () => {
			const newFrameShapeId = createShapeId()
			const selectionBounds = editor.getShapePageBounds(shape)!
			editor.createShape({
				id: newFrameShapeId,
				type: 'new_frame',
				x: selectionBounds.x,
				y: selectionBounds.y,
				props: {
					w: 500,
					h: 600,
					name: shape.props.text
				},
			})
			editor.deleteShapes([shape.id])
		}

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
				<div className="result-card" style={{ width: w, height: h }}>
					{text}
				</div>
				{
					isSelected && (
						<div style={{ marginLeft: w + PADDING, marginTop: -h-5 }}>
							<IconButton onPointerDown={stopEventPropagation} onClick={handleExpand} onTouchStart={handleExpand}>
								<AspectRatioIcon />
							</IconButton>
						</div>
					)
				}
			</HTMLContainer>

		)
	}

	override indicator(shape: ResultShape) {
		return (
			<div></div>
		)
	}
}