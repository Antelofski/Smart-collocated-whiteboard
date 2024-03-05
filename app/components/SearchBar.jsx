import * as React from 'react'
import { useState } from 'react'
import { styled, alpha } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import { generateRefinementSuggestion } from '../lib/refineContentFromOpenAI'
import Keyboard from 'react-simple-keyboard'

export const Search = styled('div')(({ theme }) => ({
	position: 'relative',
	display: 'flex',
	direction: 'row',
	marginLeft: 0,
	width: '100%',
	alignItems: 'center',
	justifyContent: 'center',
	[theme.breakpoints.up('sm')]: {
		marginLeft: theme.spacing(1),
		width: 'auto',
	},
	borderRadius: '6px',
	backgroundColor: alpha('#adb5bd', 0.25),
	'&:hover': {
		backgroundColor: alpha('#adb5bd', 0.5),
	},
}))

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: 'inherit',
	width: '90%',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `1em`,
		transition: theme.transitions.create('width'),
	},
}))

export function SearchBar ({ searchHistories, setSearchHistories, width = 300 }) {
	const [input, setInput] = useState('')
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

	const onKeyPress = button => {
		var text = input

		if (button === '{bksp}') {
			text = text.slice(0, -1)
		} else if (button === '{space}') {
			text = text + ' '
		} else if (button === '{enter}') {
			setIsKeyboardOpen(false)
			return
		} else {
			text = text + button
		}

		setInput(text)
	}

	const handleSearch = () => {
		const text = input
		setIsKeyboardOpen(false)
		console.log('Generation button clicked')
		setSearchHistories([{ query: input, status: 'loading', result: null }, ...searchHistories])
		// setLoadingStatus('loading')
		generateRefinementSuggestion(input).then(suggestions => {
			setSearchHistories([
				{ query: input, status: 'done', result: suggestions },
				...searchHistories,
			])
		})
	}

	return (
		<div>
			<Box sx={{ flexGrow: 1, width: width, height: 50, mb: 3 }}>
				<Search>
					<StyledInputBase
						onFocus={() => setIsKeyboardOpen(true)}
						placeholder='What AI should do…'
						inputProps={{ 'aria-label': 'search' }}
						value={input}
						onChange={e => setInput(e.target.value)}
					/>
					<IconButton onPointerDown={e => e.stopPropagation()} onTouchStart={handleSearch} onClick={handleSearch}>
						<TipsAndUpdatesIcon />
					</IconButton>
				</Search>
			</Box>
			{isKeyboardOpen && (
				<div
					style={{
						position: 'absolute',
						width: 600,
						zIndex: 1000,
					}}
				>
					<Keyboard
						autoUseTouchEvents={true}
						onPointerDown={e => e.stopPropagation()}
						onKeyPress={onKeyPress}
						disableButtonHold={true}
						onBlur={() => setIsKeyboardOpen(false)}
					/>
				</div>
			)}
		</div>
	)
}
