import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { stopEventPropagation } from '@tldraw/tldraw'
import { IconButton } from '@mui/material'
import { improveContent } from '../lib/refineContentFromOpenAI'
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare'

export function RefinmentCard ({ srcId, suggestion, editor, setLoadingStatus, index }) {
	const handleClick = () => {
		console.log('You clicked the Suggestion.')
		const shape = editor.getShape(srcId)
		setLoadingStatus('loading')
		improveContent(shape.text, suggestion).then(res => {
			editor.updateShape({ id: shape.id, type: shape.type, props: { text: res } })
			setLoadingStatus('idle')
		})
	}

	return (
		<Card
			className='refinement-card'
			style={{ animationDelay: `${0.1 * index}s` }}
			sx={{ width: '100%' }}
			onPointerDown={stopEventPropagation}
			onClick={handleClick}
		>
			<CardContent>
				<Typography variant='body2'>{suggestion}</Typography>
				<IconButton aria-label='share' onClick={handleClick}>
					<MobileScreenShareIcon />
				</IconButton>
			</CardContent>
		</Card>
	)
}
