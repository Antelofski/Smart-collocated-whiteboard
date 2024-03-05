import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import PhoneIcon from '@mui/icons-material/Phone'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { stopEventPropagation } from '@tldraw/tldraw'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'

export function ComparisonCard () {
	const [value, setValue] = React.useState('1')

	const handleChange = (event, newValue) => {
		console.log("handle Change called")
		setValue(newValue)
	}

	return (
		<div style={{ width: '300px' }}>
			<TabContext value={value}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
					<TabList onChange={handleChange}>
						<Tab icon={<PhoneIcon />} value='1' />
						<Tab icon={<FavoriteIcon />} value='2' />
					</TabList>
				</Box>
				<TabPanel value='1'>Item One</TabPanel>
				<TabPanel value='2'>Item Two</TabPanel>
			</TabContext>
		</div>
	)
}
