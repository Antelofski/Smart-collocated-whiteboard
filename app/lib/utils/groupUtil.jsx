import { createShapeId } from '@tldraw/tldraw'

export function groupNotes (editor, input_notes, groupName, x, y) {

	let notes = input_notes

	if (notes.length > 0 && typeof notes[0] === 'string') {
		notes = notes.map(id => editor.getShape(id))
	}

	const { parentWidth, parentHeight, maxHeight } = calculateParentBoxSize(notes)

	// we assume three notes per row, the space between notes is

	let curRowWidth = 0

	const animatedShapes = notes.map((note, i) => {
		const row = Math.floor(i / 3)
		const col = i % 3
		if (col == 0) {
			curRowWidth = 40
		}
		const dx = curRowWidth + (col - 1) * 40 // 40 is the space between notes
		curRowWidth += note.props.w
		let dy = 0
		if (row == 0) {
			dy = 20
		} else {
			dy = maxHeight.slice(0, row).reduce((acc, curr) => acc + curr, 0) + 40 * row
		}
		return {
			id: note.id,
			type: note.type,
			x: dx + 50, // 50 is the padding to the left frame border
			y: dy + 30, // 30 is the padding to the upper frame border
		}
	})

	//Create frame shape to group the notes
	const frame_id = createShapeId()
	editor.createShape({
		id: frame_id,
		type: 'new_frame',
		x: x,
		y: y,
		props: {
			name: groupName,
			w: parentWidth + 40,
			h: parentHeight + 40,
		},
	})

	// console.log(`[groupNote] notes: ${JSON.stringify(notes)}, group name: ${JSON.stringify(groupName)}`)

	// Add notes to the frame
	editor.updateShapes(
		notes.map(note => {
			return {
				id: note.id,
				parentId: frame_id,
			}
		})
	)

	editor.animateShapes(animatedShapes, { duration: 200 })

	return { frame_id: frame_id, parentWidth: parentWidth + 40, parentHeight: parentHeight + 40 }
}

function calculateParentBoxSize (noteShapes) {
	let parentWidth = 0
	let parentHeight = 0
	let maxHeight = []

	// Process each row of three notes
	for (let i = 0; i < noteShapes.length; i += 3) {
		let rowWidth = 0
		let rowMaxHeight = 0

		// Calculate total width and max height for each row
		for (let j = i; j < i + 3 && j < noteShapes.length; j++) {
			console.log(`noteShapes[${j}].props.w: `, noteShapes[j].props.w)
			rowWidth += noteShapes[j].props.w + 20 // spacing between shapes
			let height =
				noteShapes[j].type == 'node'
					? noteShapes[j].props.h + noteShapes[j].props.growY
					: noteShapes[j].props.h
			rowMaxHeight = Math.max(rowMaxHeight, height)
		}

		// Update overall max width and total height
		parentWidth = Math.max(parentWidth, rowWidth) + 100 // Add 100 for padding
		maxHeight.push(rowMaxHeight)
		parentHeight += rowMaxHeight + 100 // Add 100 for padding
	}

	return { parentWidth, parentHeight, maxHeight }
}

export function setLayoutForFrame (editor, frame_id) {
	const children = editor.getSortedChildIdsForParent(frame_id)

	let frameChildren = []
	let noteChildren = []

	children.forEach(child => {
		const shape = editor.getShape(child)
		if (shape.type == 'new_frame') {
			frameChildren.push(shape)
		} else if (shape.type == 'node') {
			noteChildren.push(shape)
		} else {
			console.log('Unknown shape type: ', shape.type)
		}
	})

	//get the notes whose parent is the root frame (which means those notes are not in any group yet)

	noteChildren = noteChildren.filter(note => {
		return frame_id == note.parentId
	})

	let parentWidth = 0
	let parentHeight = 100 // 60 is the initial padding to the upper frame border
	let maxHeight = []

	let targetPos = {}
	const spacing = 60

	// We assume two frames in a row and three notes in a row
	// Process each row of two frames
	for (let i = 0; i < frameChildren.length; i += 2) {
		let rowWidth = spacing
		let rowMaxHeight = 0

		// Calculate total width and max height for each row
		for (let j = i; j < i + 2 && j < frameChildren.length; j++) {
			targetPos[frameChildren[j].id] = {
				x: rowWidth,
				y: parentHeight,
			}
			rowWidth += frameChildren[j].props.w + spacing // spacing between shapes
			rowMaxHeight = Math.max(rowMaxHeight, frameChildren[j].props.h)
		}

		// Update overall max width and total height
		parentWidth = Math.max(parentWidth, rowWidth) // Add 100 for padding
		maxHeight.push(rowMaxHeight)
		parentHeight += rowMaxHeight + spacing // Add 100 for padding
	}

	// Process each row of three notes
	for (let i = 0; i < noteChildren.length; i += 3) {
		let rowWidth = spacing
		let rowMaxHeight = 0

		// Calculate total width and max height for each row
		for (let j = i; j < i + 3 && j < noteChildren.length; j++) {
			targetPos[noteChildren[j].id] = {
				x: rowWidth,
				y: parentHeight,
			}
			rowWidth += noteChildren[j].props.w + spacing // spacing between shapes
			let height = noteChildren[j].props.h + noteChildren[j].props.growY
			rowMaxHeight = Math.max(rowMaxHeight, height)
		}

		// Update overall max width and total height
		parentWidth = Math.max(parentWidth, rowWidth) // Add 100 for padding
		maxHeight.push(rowMaxHeight)
		parentHeight += rowMaxHeight + spacing // Add 100 for padding
	}

	let animiatedParams = []

	// console.log("targetPos: ", targetPos)

	for (const [id, pos] of Object.entries(targetPos)) {
		animiatedParams.push({
			id: id,
			x: pos.x,
			y: pos.y,
		})
	}

	// console.log('parentWidth: ', parentWidth)
	// console.log('parentHeight: ', parentHeight)
	// console.log('animiatedParams: ', animiatedParams)

	editor.updateShape({
		id: frame_id,
		props: {
			w: parentWidth + 40,
			h: parentHeight + 40,
		},
	})
	editor.animateShapes(animiatedParams, { duration: 500 })
}
