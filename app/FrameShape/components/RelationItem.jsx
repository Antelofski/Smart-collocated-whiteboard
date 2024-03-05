import React from 'react'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'
import CommentIcon from '@mui/icons-material/Comment'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import { LoadingAnimations } from './RelationPanel'
import { stopEventPropagation } from '@tldraw/tldraw'
import { Box, Stack, Grid } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'

function RelationArrow ({ label }) {
	const textRef = useRef(null)
	const [textWidth, setTextWidth] = useState(0)
	const maxTextWidth = 100 // Maximum width for the text
	const realTextWidth = Math.min(textWidth, maxTextWidth)
	const arrowLength = Math.min(textWidth, maxTextWidth) + 70

	useEffect(() => {
		if (textRef.current) {
			setTextWidth(textRef.current.getBBox().width)
		}
	}, [label])

	return (
		<svg width={arrowLength + 30} height='60'>
			<text
				ref={textRef}
				x='50%'
				y='10'
				dominantBaseline='middle'
				textAnchor='middle'
				style={{
					width: { realTextWidth },
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					// textAlign: 'center',
				}}
			>
				{label}
			</text>
			<line x1='10' y1='20' x2={arrowLength} y2='20' stroke='black' strokeWidth='2' />
			<polygon points={`${arrowLength},15 ${arrowLength + 10},20 ${arrowLength},25`} fill='black' />
		</svg>
	)
}

export function RelationItem ({ editor, rel }) {
	const startShape = editor.getShape(rel.props.start.boundShapeId)
	const endShape = editor.getShape(rel.props.end.boundShapeId)

	const [open, setOpen] = useState(false)

	const handleExpand = () => {
		setOpen(!open)
	}

	const handleIdeaSpaceRelationship = () => {
		setLoading(true)
	}

	return (
		<div>
			<div>
				<Grid container>
					<Grid item xs={2}>
						<Chip
							// variant='h6'
							style={{
								width: '100%', // Set a fixed width to trigger overflow
								whiteSpace: 'nowrap', // Prevent text from wrapping to the next line
								overflow: 'hidden', // Hide overflowed content
								textOverflow: 'ellipsis', // Show ellipsis for overflowed content
							}}
							label={startShape.type == 'new_frame' ? startShape.props.name : startShape.props.text}
						/>
					</Grid>
					<Grid item xs={5}>
						{/* <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							<Typography variant='h6' align='center'>
								{rel.props.text}
							</Typography>
						</div> */}
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
							<RelationArrow label={rel.props.text} />
						</div>
					</Grid>
					<Grid item xs={2}>
						<Chip
							// variant='h6'
							style={{
								width: '100%', // Set a fixed width to trigger overflow
								whiteSpace: 'nowrap', // Prevent text from wrapping to the next line
								overflow: 'hidden', // Hide overflowed content
								textOverflow: 'ellipsis', // Show ellipsis for overflowed content
							}}
							label={endShape.type == 'new_frame' ? endShape.props.name : endShape.props.text}
						/>
					</Grid>
				</Grid>
			</div>
			{/* <Collapse in={open} timeout='auto' unmountOnExit>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
			</Collapse> */}
		</div>
	)
}
