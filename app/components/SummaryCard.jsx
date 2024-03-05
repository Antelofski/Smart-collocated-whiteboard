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
import { HighlightText } from './HighlightText'

export function SummaryCard ({ summary, editor }) {

	return (
		<Card sx={{ minWidth: 300 }} onPointerDown={stopEventPropagation}>
			<CardContent>
				<HighlightText editor={editor} text={summary.text} keywords={summary.keywords} />
			</CardContent>
		</Card>
	)
}
