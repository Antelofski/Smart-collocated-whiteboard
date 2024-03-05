import React from 'react'
import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { generateFrameRelation } from '../lib/frameRelationFromOpenAI'

export const callFrameRelationAPI = async (editor, cur_frame_id) => {
	const frame = editor.getShape(cur_frame_id)
	const children = editor.getSortedChildIdsForParent(cur_frame_id)
	const frameName = frame.props.name
	const ideas = []
	for (let i = 0; i < children.length; i++) {
		const child = editor.getShape(children[i])
		ideas.push({ "id": child.id, "text": child.props.text })
	}

	// get all other frames and their idea children, note we need to ignore those frames whose parent is the primary one considered
	const allShapes = editor.getCurrentPageShapes()

	const otherFrames = allShapes.filter(shape => shape.type === "new_frame" && shape.id !== cur_frame_id && shape.parentId !== cur_frame_id)

	const otherFramesIdeas = otherFrames.map(frame => {
		const children = editor.getSortedChildIdsForParent(frame.id)
		const ideas = []
		for (let i = 0; i < children.length; i++) {
			const child = editor.getShape(children[i])
			if (child.type !== "node") {
				continue
			}
			ideas.push({ "id": child.id, "text": child.props.text })
		}
		return { "name": frame.props.name, "ideas": ideas }
	})


	let input = {
		"primary group": {
			"name": frameName,
			"ideas": ideas
		}
	}

	otherFramesIdeas.forEach( (frameIdeas, index) => {
		input["group " + (index + 1)] = frameIdeas
	})

	const response = await generateFrameRelation(editor, input)
	return response
}

export const ClickableText = styled('span')({
	textDecoration: 'underline',
	cursor: 'pointer',
	fontSize: '14px',
	color: 'black', // Style as needed
	marginLeft: '5px', // Adjust spacing as needed
	fontWeight: 'bold',
})