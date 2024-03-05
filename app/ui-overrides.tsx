
import { TLUiMenuGroup, TLUiOverrides, menuItem, toolbarItem, menuGroup, findMenuItem } from '@tldraw/tldraw'

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		tools.node = {
			id: 'node',
			icon: 'node',
			label: 'Node' as any,
			kbd: 'c',
			readonlyOk: false,
			onSelect: () => {
				editor.setCurrentTool('node')
			},
		}
		tools.new_frame = {
			id: 'new_frame',
			icon: 'new_frame',
			label: 'New Frame' as any,
			readonlyOk: false,
			onSelect: () => {
				editor.setCurrentTool('new_frame')
			},
		}
		tools.search = {
			id: 'search',
			icon: 'search',
			label: 'Search' as any,
			readonlyOk: false,
			onSelect: () => {
				editor.setCurrentTool('search')
			},
		}
		return tools
	},
	toolbar(_app, toolbar, { tools }) {
		toolbar.splice(4, 0, toolbarItem(tools.node))
		toolbar.splice(5, 0, toolbarItem(tools.new_frame))
		toolbar.splice(6, 0, toolbarItem(tools.search))
		return toolbar
	},
	actions(editor, actions) {
		// Create a new action or replace an existing one
		actions['my-new-action'] = {
			id: 'my-new-action',
			label: 'My new action',
			readonlyOk: true,
			kbd: '$u',
			onSelect(source: any) {
				window.alert('My new action just happened!')
			},
		}

		return actions
	},
	contextMenu(editor, contextMenu, { actions }) {
		const newMenuItem = menuItem(actions['my-new-action'])
		// const newMenuGroup = menuGroup('my-items', newMenuItem)
		contextMenu.unshift(newMenuItem)
		return contextMenu
	},
	menu(editor, menu, { actions }) {
		// using the findMenuItem helper
		const fileMenu = findMenuItem(menu, ['menu', 'file'])
		if (fileMenu.type === 'submenu') {
			// add the new item to the file menu's children
			const newMenuItem = menuItem(actions['my-new-action'])
			fileMenu.children.unshift(newMenuItem)
		}
		return menu
	},
	// keyboardShortcutsMenu(_app, keyboardShortcutsMenu, { tools }) {
	// 	const toolsGroup = keyboardShortcutsMenu.find(
	// 		(group) => group.id === 'shortcuts-dialog.tools'
	// 	) as TLUiMenuGroup
	// 	toolsGroup.children.push(menuItem(tools.card))
	// 	return keyboardShortcutsMenu
	// },
}