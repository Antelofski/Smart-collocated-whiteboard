import React, { useEffect, useState } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import CommentIcon from '@mui/icons-material/Comment'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Paper from '@mui/material/Paper'
import { stopEventPropagation } from '@tldraw/tldraw'
import { Button, Stack, Chip, Avatar, Skeleton, Box } from '@mui/material'
import { ClickableText } from '../utils'
import { callFrameRelationAPI } from '../utils'

export function LoadingAnimations () {
	return (
		<Box sx={{ width: '80%' }}>
			<Skeleton />
			<Skeleton animation='wave' />
			<Skeleton animation={false} />
		</Box>
	)
}

export const RelationPanel = ({ editor, shape }) => {
	const [selectedDependencies, setSelectedDependencies] = useState([])
	const arrows = editor.getCurrentPageShapes().filter(shape => shape.type === 'arrow')

	const handleAISuggestion = async () => {
		editor.updateShape({
			id: shape.id,
			meta: { ...shape.meta, relationLoadingStatus: 'loading' },
		})
		callFrameRelationAPI(editor, shape.id).then(response => {
			console.log('generateFrameRelation Response: ', response)

			editor.updateShape({
				id: shape.id,
				meta: { ...shape.meta, betweenFrameRelations: response, relationLoadingStatus: 'loaded' },
			})
		})
	}

	const handleDepChipClick = dep => {
		if (selectedDependencies.includes(dep)) {
			setSelectedDependencies(selectedDependencies.filter(item => item !== dep))
		} else {
			setSelectedDependencies([...selectedDependencies, dep])
		}

		let depRelations = []
		let preRelations = []

		arrows.map(arrow => {
			if (arrow.props.end.boundShapeId == shape.id) {
				preRelations.push(arrow)
			} else if (arrow.props.start.boundShapeId == shape.id) {
				depRelations.push(arrow)
			}
		})

		console.log('depRelations: ', depRelations)
		console.log('preRelations: ', preRelations)
		// update arrow relations
		editor.updateShape({
			id: shape.id,
			meta: { ...shape.meta, depRelations: depRelations, preRelations: preRelations },
		})
	}

	return (
		<div>
			<div style={{ marginBottom: 30 }}>
				<Stack direction='row' spacing={1}>
					<Chip
						icon={<img src='alert.png' style={{ height: "50%" }} />}
						label='Warning'
						onClick={() => handleDepChipClick('dep')}
						onTouchStart={() => handleDepChipClick('dep')}
						onPointerDown={stopEventPropagation}
					/>
					<Chip
						label='Prerequisite'
						onClick={() => handleDepChipClick('pre')}
						onTouchStart={() => handleDepChipClick('pre')}
						onPointerDown={stopEventPropagation}
					/>
				</Stack>
				<div>
					{selectedDependencies.includes('dep') && (
						<div>
							{shape.meta.depRelations.map((relation, index) => {
								return (
									<Paper elevation={1} sx={{ backgroundColor: "rgba(252, 191, 73)" }}>

									</Paper>
								)
							})}
						</div>
					)}
					{selectedDependencies.includes('pre') && (
						<div>
							{shape.meta.preRelations.map((relation, index) => {
								return (
									<Chip
										key={index}
										label={relation.props.text}
										onPointerDown={stopEventPropagation}
									/>
								)
							})}
						</div>
					)}
				</div>
			</div>
			{/* <div style={{ marginBottom: 30 }}>
				<ClickableText
					onPointerDown={stopEventPropagation}
					onClick={handleAISuggestion}
					style={{ marginRight: 20 }}
				>
					See what AI suggests...
				</ClickableText>
			</div>
			{shape.meta.relationLoadingStatus == 'loading' ? (
				<LoadingAnimations />
			) : (
				shape.meta.betweenFrameRelations != null &&
				shape.meta.relationLoadingStatus == 'loaded' && (
					<List sx={{ width: '100%', maxWidth: '100%', bgcolor: 'background.paper' }}>
						{shape.meta.betweenFrameRelations.map((group, index) => {
							return (
								<div>
								</div>
							)
						})}
					</List>
				)
			)} */}
		</div>
	)
}
