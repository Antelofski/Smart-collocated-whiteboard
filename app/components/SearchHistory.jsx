import * as React from 'react'
import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import { stopEventPropagation } from '@tldraw/tldraw'
import { Typography } from '@mui/material'
import '../style.css'

export function SearchHistory ({
	curOpenHistory,
	setCurOpenHistory,
	data,
	setSelectedHistory,
	searchHistories,
	setSearchHistories,
}) {
	const [isOpen, setIsOpen] = React.useState(null)

	const toggle = () => {
		if (isOpen == null || isOpen == false) {
			setIsOpen(true)
		} else {
			setIsOpen(false)
		}
		if (!isOpen) {
			console.log('selected history: ', data)
			setSelectedHistory(data)
			setCurOpenHistory(data)
		} else {
			setSelectedHistory(null)
		}
	}

	const handleClose = () => {
		setSearchHistories(searchHistories.filter(history => history.query != data.query))
		setSelectedHistory(null)
		if (curOpenHistory == data) {
			setCurOpenHistory(null)
		}
	}

	useEffect(() => {
		if (curOpenHistory != null && curOpenHistory != data && isOpen) {
			setIsOpen(null)
		}
	}, [curOpenHistory])

	return (
		<div
			className={`progress-search-history${data.status == 'loading' ? '-loading' : ''}`}
			onPointerDown={stopEventPropagation}
		>
			<Typography className='search-text' variant='body2'>
				{data.query}
			</Typography>
			<div style={{ display: 'flex', flexDirection: 'row' }}>
				{data.status == 'done' && (
					<div
						onClick={toggle}
						style={{
							border: 'none',
							background: 'none',
							cursor: 'pointer',
							display: 'flex',
							width: '20px',
							height: '20px',
						}}
					>
						<img src='/right.png' className={`history-arrow-button ${isOpen ? 'open' : isOpen != null ? 'close': ''}`} />
					</div>
				)}
				<div onClick={handleClose}>
					<img src='/close.png' className='close-icon' />
				</div>
			</div>
		</div>
	)
}
