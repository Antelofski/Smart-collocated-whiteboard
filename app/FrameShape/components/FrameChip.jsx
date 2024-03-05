import React, { useEffect, useState } from 'react'
import Chip from '@mui/material/Chip'
import FaceIcon from '@mui/icons-material/Face'
import { styled } from '@mui/material/styles'
import { stopEventPropagation } from '@tldraw/tldraw'

// Styled chip for animation
const CustomizedChip = styled(Chip)(({ theme, width }) => ({
	// transition: 'width 1s ease',
	width: "auto",
	overflow: 'hidden',
}))

export const FrameChip = ({ curChip, id, eventHandler , icon, label}) => {

	return (
		<CustomizedChip
			icon={icon}
			onPointerDown={stopEventPropagation}
			label={label}
			onClick={eventHandler}
            onTouchStart={eventHandler}
			variant = {curChip == id ? 'filled' : 'outlined'}
			// Apply dynamic width based on collapse state
			// sx={{ width: "auto" }} // Adjust widths as needed
		/>
	)
}
