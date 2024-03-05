import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Stack from '@mui/material/Stack';
import { deepOrange, deepPurple } from '@mui/material/colors';
import { stopEventPropagation } from '@tldraw/tldraw';

export function TopZoneNameBar ({editor}) {
	return (
		<div>
			<button onPointerDown={stopEventPropagation} onClick={() => {
				const userId = editor.user.getId();
				console.log("start following user: ", userId)
				editor.startFollowingUser(userId);
			}}>Follow User</button>
		</div>
	)
}
