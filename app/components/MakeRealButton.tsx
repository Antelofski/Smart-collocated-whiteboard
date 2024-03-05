import { useEditor, useToasts } from '@tldraw/tldraw'
import { useCallback } from 'react'
import { makeReal } from '../makeReal'
import { makeRealText } from '../lib/generateTextFromOpenAI'
import { createGrouping } from '../lib/createGroupingFromOpenAI'

export function MakeRealButton () {
	const editor = useEditor()
	const { addToast } = useToasts()

	const handleMakeGroupClick = useCallback(async () => {
		console.log('create groups')
		try {
			await createGrouping(editor)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		}
	}, [editor, addToast])

	const handleMakeRealImageClick = useCallback(async () => {
		console.log('create groups')
		try {
			await makeReal(editor)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		}
	}, [editor, addToast])

	const handleMakeRealTextClick = useCallback(async () => {
		console.log('create groups')
		try {
			await makeRealText(editor)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'cross-2',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		}
	}, [editor, addToast])

	return (
		<div>
			<button className='makeRealButton' onClick={handleMakeGroupClick}>
				Create Grouping
			</button>
			<button className='makeRealButton' onClick={handleMakeRealImageClick}>Make Real Image</button>
			<button className='makeRealButton' onClick={handleMakeRealTextClick}> Make Real Text</button>
		</div>
	)
}
