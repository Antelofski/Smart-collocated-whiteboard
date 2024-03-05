import { useState } from 'react'
import { groupNotes, setLayoutForFrame } from '../lib/utils/groupUtil'
import { createShapeId, stopEventPropagation } from '@tldraw/tldraw'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import RestoreIcon from '@mui/icons-material/Restore'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ArchiveIcon from '@mui/icons-material/Archive'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import Chip from '@mui/material/Chip'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import { Typography } from '@mui/material'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import { getAffinityDiagramming } from '../lib/affinityDiagrammingFromOpenAI'
import '../style.css'

export const GlobalMenu = ({ editor }) => {
	const createAndArrangeAffinityDiagram = res_list => {
		const startingX = -600
		const startingY = -600
		let lastWidth = 0
		let lastHeight = 0

		res_list.forEach(theme_obj => {
			const { theme, ideas } = theme_obj
			const group = ideas.map(idea => {
				const { text, pre_topic, color } = idea
				const noteId = createShapeId()
				editor.createShape({
					id: noteId,
					type: 'node',
					x: 0,
					y: 0,
					props: {
						text: text,
						w: 200,
						h: 200,
						color: color,
					},
				})
				return noteId
			})

			// we need to set a tiny timeout (0.1s) for the shapes to be created, otherwise the groupNotes function will not work
			setTimeout(() => {
				const { frame_id, parentWidth, parentHeight } = groupNotes(
					editor,
					group,
					theme,
					startingX + lastWidth,
					startingY
				)
				lastWidth += parentWidth + 200
				lastHeight += parentHeight
				setLayoutForFrame(editor, frame_id)
			}, 100)
		})
	}

	const handleGrouping = e => {
		e.stopPropagation()

		const shapes = editor.getCurrentPageShapes().filter(shape => shape.type === 'node')

		console.log('Shapes: ', shapes)

		groupNotes(editor, shapes, 'Group', 200, 200)
	}
	const [value, setValue] = useState(-1)

	const handleGlobalGrouping = e => {
		getAffinityDiagramming(editor).then(res_list => {
			createAndArrangeAffinityDiagram(res_list)
		})
	}

	const handleGroupingWithSelection = e => {
		// const shapes = editor.getSelectedShapes().filter(shape => shape.type === 'node')
		const shapes = editor.getSelectedShapes()

		// recursively retrieve all the nodes from the selected shapes
		const getNodes = (shapes, nodes = []) => {
			shapes.forEach(shape => {
				if (shape.type === 'node') {
					nodes.push(shape)
				} else if (shape.type === 'new_frame') {
					const children = editor
						.getSortedChildIdsForParent(shape.id)
						.map(id => editor.getShape(id))
					getNodes(children, nodes)
				}
			})
			return nodes
		}

		let nodes = []
		nodes = getNodes(shapes, nodes)

		console.log('Nodes: ', nodes)

		getAffinityDiagramming(editor, { ideas: nodes }).then(res_list => {
			createAndArrangeAffinityDiagram(res_list)
		})
	}

	const handleUseExistingGroup = e => {
		setSelectedItem('use-group')
	}

	const [selectedItem, setSelectedItem] = useState('')

	return (
		<Box>
			<Box>
				<BottomNavigation
					sx={{ backgroundColor: 'rgba(249,250,251,255)' }}
					showLabels
					value={value}
					onChange={(event, newValue) => {
						setSelectedItem('')
						setValue(newValue)
					}}
				>
					<BottomNavigationAction
						label='Group'
						icon={<img style={{ width: 20, height: 20 }} src='affinity.png' alt='Affinity' />}
					/>
					<BottomNavigationAction
						label='Library'
						icon={<img style={{ width: 20, height: 20 }} src='inbox.png' alt='History' />}
					/>
					<BottomNavigationAction label='Archive' icon={<ArchiveIcon />} />
				</BottomNavigation>
			</Box>
			{value === 0 && selectedItem == '' && (
				<Box sx={{ display: 'flex', flexDirection: 'column', marginRight: 2 }}>
					<Box
						onPointerDown={stopEventPropagation}
						// onTouchStart={handleGroupingWithSelection}
						// onClick={handleGroupingWithSelection}
						className={`menu-item ${value === 0 ? 'active' : ''}`}
						style={{
							animationDelay: `${0 * 100}ms`,
							marginTop: 10,
							width: 'auto',
							marginLeft: 50,
							display: 'inline-flex',
							border: '1px solid black',
							borderRadius: '10px',
							whiteSpace: 'nowrap',
							padding: '5px 20px',
							height: 'auto',
							flexDirection: 'row',
							justifyContent: 'start',
							alignItems: 'start',
							backgroundColor: 'rgba(237,237,233,0.7)',
							cursor: 'pointer',
						}}
					>
						<img style={{ width: 20, height: 20 }} src='grouping.png' alt='grouping' />
						<Typography sx={{ color: 'black', marginLeft: 2 }} variant='body2'>
							Global grouping
						</Typography>
					</Box>
					<Box
						onPointerDown={stopEventPropagation}
						// onTouchStart={handleGroupingWithSelection}
						// onClick={handleGroupingWithSelection}
						className={`menu-item ${value === 0 ? 'active' : ''}`}
						style={{
							animationDelay: `${1 * 100}ms`,
							marginTop: 10,
							width: 'auto',
							marginLeft: 50,
							display: 'inline-flex',
							border: '1px solid black',
							borderRadius: '10px',
							whiteSpace: 'nowrap',
							padding: '5px 20px',
							height: 'auto',
							flexDirection: 'row',
							justifyContent: 'start',
							alignItems: 'start',
							backgroundColor: 'rgba(237,237,233,0.7)',
							cursor: 'pointer',
						}}
					>
						<img
							style={{ width: 20, height: 20 }}
							src='selected_grouping.png'
							alt='Selected grouping'
						/>
						<Typography sx={{ color: 'black', marginLeft: 2 }} variant='body2'>
							Selected grouping
						</Typography>
					</Box>
					<Box
						onPointerDown={stopEventPropagation}
						// onTouchStart={handleGroupingWithSelection}
						// onClick={handleGroupingWithSelection}
						className={`menu-item ${value === 0 ? 'active' : ''}`}
						style={{
							animationDelay: `${2 * 100}ms`,
							marginTop: 10,
							width: 'auto',
							marginLeft: 50,
							display: 'inline-flex',
							border: '1px solid black',
							borderRadius: '10px',
							whiteSpace: 'nowrap',
							padding: '5px 20px',
							height: 'auto',
							flexDirection: 'row',
							justifyContent: 'start',
							alignItems: 'start',
							backgroundColor: 'rgba(237,237,233,0.7)',
							cursor: 'pointer',
						}}
					>
						<img
							style={{ width: 20, height: 20 }}
							src='conditional_cluster.png'
							alt='conditional grouping'
						/>
						<Typography sx={{ color: 'black', marginLeft: 2 }} variant='body2'>
							Customized grouping
						</Typography>
					</Box>
				</Box>
			)}
			{value === 1 && selectedItem == '' && (
				<Box sx={{ display: 'flex', flexDirection: 'column', marginRight: 2 }}>
					<Box
						onPointerDown={stopEventPropagation}
						// onTouchStart={handleGroupingWithSelection}
						// onClick={handleGroupingWithSelection}
						className={`menu-item ${value === 1 ? 'active' : ''}`}
						style={{
							animationDelay: `${0 * 100}ms`,
							marginTop: 10,
							width: 'auto',
							marginLeft: 50,
							display: 'inline-flex',
							border: '1px solid black',
							borderRadius: '10px',
							whiteSpace: 'nowrap',
							padding: '5px 20px',
							height: 'auto',
							flexDirection: 'row',
							justifyContent: 'start',
							alignItems: 'start',
							backgroundColor: 'rgba(237,237,233,0.7)',
							cursor: 'pointer',
						}}
					>
						<img style={{ width: 20, height: 20 }} src='grouping.png' alt='grouping' />
						<Typography sx={{ color: 'black', marginLeft: 2 }} variant='body2'>
							Save group
						</Typography>
					</Box>
					<Box
						onPointerDown={stopEventPropagation}
						onTouchStart={handleUseExistingGroup}
						onClick={handleUseExistingGroup}
						className={`menu-item ${value === 1 ? 'active' : ''}`}
						style={{
							animationDelay: `${1 * 100}ms`,
							marginTop: 10,
							width: 'auto',
							marginLeft: 50,
							display: 'inline-flex',
							border: '1px solid black',
							borderRadius: '10px',
							whiteSpace: 'nowrap',
							padding: '5px 20px',
							height: 'auto',
							flexDirection: 'row',
							justifyContent: 'start',
							alignItems: 'start',
							backgroundColor: 'rgba(237,237,233,0.7)',
							cursor: 'pointer',
						}}
					>
						<img
							style={{ width: 20, height: 20 }}
							src='selected_grouping.png'
							alt='Selected grouping'
						/>
						<Typography sx={{ color: 'black', marginLeft: 2 }} variant='body2'>
							Use created groups
						</Typography>
					</Box>
					<Box
						onPointerDown={stopEventPropagation}
						// onTouchStart={handleGroupingWithSelection}
						// onClick={handleGroupingWithSelection}
						className={`menu-item ${value === 1 ? 'active' : ''}`}
						style={{
							animationDelay: `${2 * 100}ms`,
							marginTop: 10,
							width: 'auto',
							marginLeft: 50,
							display: 'inline-flex',
							border: '1px solid black',
							borderRadius: '10px',
							whiteSpace: 'nowrap',
							padding: '5px 20px',
							height: 'auto',
							flexDirection: 'row',
							justifyContent: 'start',
							alignItems: 'start',
							backgroundColor: 'rgba(237,237,233,0.7)',
							cursor: 'pointer',
						}}
					>
						<img
							style={{ width: 20, height: 20 }}
							src='conditional_cluster.png'
							alt='conditional grouping'
						/>
						<Typography sx={{ color: 'black', marginLeft: 2 }} variant='body2'>
							Save idea snapshot
						</Typography>
					</Box>
				</Box>
			)}
			{selectedItem == 'use-group' && (
				<Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
					<Paper
						elevation={2}
						sx={{
							width: '220px',
							padding: 1,
							borderRadius: '5px',
							marginRight: '0px',
							cursor: 'pointer',
						}}
					>
						<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', flexWrap: 'wrap' }}>
							<Typography
								sx={{ fontWeight: 'bold', color: 'black', margin: '2.5px 5px 5px 5px' }}
								variant='body2'
							>
								Groups:
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
								<Box sx={{ marginRight: 1, marginBottom: 1 }}>
									<Chip size='small' label='Group 1' />
								</Box>
								<Box sx={{ marginRight: 1, marginBottom: 1 }}>
									<Chip size='small' label='Group 1' />
								</Box>
								<Box sx={{ marginRight: 1, marginBottom: 1 }}>
									<Chip size='small' label='Group 1' />
								</Box>
								<Box sx={{ marginRight: 1, marginBottom: 1 }}>
									<Chip size='small' label='Group 1' />
								</Box>
							</Box>
						</Box>
						<Box sx={{ marginTop: 2 }}>
							<Typography sx={{ fontWeight: 'bold' }} variant='body2'>
								Rationale:
							</Typography>
							<Typography variant='body2'>Fix the rationale of the generation</Typography>
						</Box>
					</Paper>
				</Box>
			)}
		</Box>
	)
}
