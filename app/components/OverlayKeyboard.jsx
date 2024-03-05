import Keyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import { useEffect, useState } from 'react'
import { track, useEditor, stopEventPropagation } from '@tldraw/tldraw'

export const OverlayKeyboard = track(({ size, id, type, isKeyboardOpen, setIsKeyboardOpen }) => {
	const editor = useEditor()

	// const editing_shape_id = editor.getEditingShapeId()

	// const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

	// useEffect(() => {
	// 	if (id === editing_shape_id) {
	// 		setIsKeyboardOpen(true)
	// 	}
	// }, [editing_shape_id])

	const onKeyPress = button => {
		var text = null
		if (type == 'new_frame') {
			text = editor.getShape(id).props.name
		} else {
			text = editor.getShape(id).props.text
		}
		// console.log('button pressed', button)
		// console.log('text: ', text)

		if (button === '{bksp}') {
			text = text.slice(0, -1)
		} else if (button === '{space}') {
			text = text + ' '
		} else if (button === '{enter}') {
			text = text + '\n'
		} else {
			text = text + button
		}
		if (type == 'new_frame') {
			editor.updateShapes([
				{
					id,
					type,
					props: {
						name: text,
					},
				},
			])
		} else {
			editor.updateShapes([
				{
					id,
					type,
					props: {
						text: text,
					},
				},
			])
		}
	}

	// const keyboard = new Keyboard({
	// 	// onChange: input => onChange(input),
	// 	onPointerDown: e => e.stopPropagation(),
	// 	onKeyPress: button => onKeyPress(button),
	// })

	return (
		<div
			style={{
				position: 'absolute',
				width: 600,
				left: -300 + size / 2,
				marginTop: 10,
			}}
		>
			{isKeyboardOpen && (
				<Keyboard
					stopMouseDownPropagation={true}
					autoUseTouchEvents={true}
					// onPointerDown={e => {
					// 	e.stopPropagation()
					// }}
					onKeyPress={onKeyPress}
					disableButtonHold={true}
				/>
			)}
		</div>
	)
})
