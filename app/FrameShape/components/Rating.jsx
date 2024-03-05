import * as React from 'react'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Rating from '@mui/material/Rating'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Typography from '@mui/material/Typography'
import { stopEventPropagation } from '@tldraw/tldraw'

const StyledRating = styled(Rating)({
	'& .MuiRating-iconFilled': {
		color: '#ff6d75',
	},
	'& .MuiRating-iconHover': {
		color: '#ff3d47',
	},
})

export function CustomizedRating () {
	return (
		<Box
			sx={{
				'& > legend': { mt: 2 },
			}}
		>
			<StyledRating
				onPointerDown={stopEventPropagation}
				name='customized-color'
				defaultValue={2}
				getLabelText={value => `${value} Heart${value !== 1 ? 's' : ''}`}
				precision={0.5}
				// icon={<FavoriteIcon fontSize='inherit' />}
				// emptyIcon={<FavoriteBorderIcon fontSize='inherit' />}
			/>
			{/* <Typography component='legend'>10 stars</Typography> */}
		</Box>
	)
}
