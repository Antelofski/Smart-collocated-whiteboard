import {
	DefaultFontFamilies,
	Editor,
	Rectangle2d,
	ShapeUtil,
	SvgExportContext,
	TLNoteShape,
	TLOnEditEndHandler,
	getDefaultColorTheme,
	noteShapeProps,
	toDomPrecision,
	TLBaseShape,
	TLOnResizeHandler,
	Vec,
	getUserPreferences,
	resizeBox,
} from '@tldraw/editor'
import {
	stopEventPropagation,
	HTMLContainer,
	useEditor,
	createShapeId,
	T,
	DefaultHorizontalAlignStyle,
	DefaultSizeStyle,
	DefaultFontStyle,
} from '@tldraw/tldraw'
import Popover from '@mui/material/Popover'
import { TextLabel } from '../lib/utils/TextLabel'
import { FONT_FAMILIES, LABEL_FONT_SIZES, TEXT_PROPS } from '../lib/utils/default-shape-constants'
import { getFontDefForExport } from '../lib/utils/defaultStyleDefs'
import { getTextLabelSvgElement } from '../lib/utils/getTextLabelSvgElement'
import { OverlayKeyboard } from '../components/OverlayKeyboard'
import 'react-simple-keyboard/build/css/index.css'
import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import { TipsCard } from '../components/TipsCard'
import { deepOrange, blue } from '@mui/material/colors'
import { generateTipsForObject } from '../lib/generateTipsFromOpenAI'
import { generateSubtasks } from '../lib/generateSubtasksFromOpenAI'
import { StyledBadge } from '../components/StyledBadge'
import SafetyDividerIcon from '@mui/icons-material/SafetyDivider'
import DnsIcon from '@mui/icons-material/Dns'
import { SearchBar } from '../components/SearchBar'
import { RefinmentCard } from '../components/RefinementCard'
import Grid from '@mui/material/Grid'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { generateComparisonSummary } from '../lib/contentComparison'
import { SummaryCard } from '../components/SummaryCard'
import { SearchHistory } from '../components/SearchHistory'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation'
import { ComparisonCard } from '../components/ComparisonCard'
import { useKeyboardStatus } from '../lib/utils/keyboardCompatibility'
import { getProportionalColor } from '../lib/utils/colorBlender'
import { NodeShape } from './NodeShapeType'
import { NodeShapeProps } from './NodeShapeProps'
import '../style.css'
import { NodeNestPop } from './NodeNestPop'

const NOTE_SIZE = 220
const PADDING = 10
const TAG_SIZE = 20

const LABEL_PADDING = 16
const MIN_SIZE_WITH_LABEL = 17 * 3

// TEMP: user
const users = [
	{
		bgcolor: deepOrange[500],
		name: 'B',
	},
	{
		bgcolor: blue[500],
		name: 'C',
	},
]

function getLabelSize(editor: Editor, shape: NodeShape) {
	const text = shape.props.text

	if (!text) {
		return { w: 0, h: 0 }
	}

	const minSize = editor.textMeasure.measureText('w', {
		...TEXT_PROPS,
		fontFamily: FONT_FAMILIES[shape.props.font],
		fontSize: LABEL_FONT_SIZES[shape.props.size],
		maxWidth: 100,
	})

	// TODO: Can I get these from somewhere?
	const sizes = {
		s: 2,
		m: 3.5,
		l: 5,
		xl: 10,
	}

	const size = editor.textMeasure.measureText(text, {
		...TEXT_PROPS,
		fontFamily: FONT_FAMILIES[shape.props.font],
		fontSize: LABEL_FONT_SIZES[shape.props.size],
		minWidth: minSize.w + 'px',
		maxWidth: Math.max(
			// Guard because a DOM nodes can't be less 0
			0,
			// A 'w' width that we're setting as the min-width
			Math.ceil(minSize.w + sizes[shape.props.size]),
			// The actual text size
			Math.ceil(shape.props.w - LABEL_PADDING * 2)
		),
	})

	return {
		w: size.w + LABEL_PADDING * 2,
		h: size.h + LABEL_PADDING * 2,
	}
}

/** @public */
export class NodeShapeUtil extends ShapeUtil<NodeShape> {
	static override type = 'node' as const

	override canEdit = () => true
	override canResize = () => true
	// override hideResizeHandles = () => true
	// override hideSelectionBoundsFg = () => true

	override getDefaultProps(): NodeShape {
		return {
			color: '#ffb703',
			size: 'l',
			text: '',
			w: NOTE_SIZE,
			h: NOTE_SIZE,
			font: 'serif',
			align: 'middle',
			verticalAlign: 'middle',
			growY: 0,
			isHighlight: false,
			initSlide: false,
		}
	}

	getHeight(shape: NodeShape) {
		return shape.props.h + shape.props.growY
	}

	getWidth(shape: NodeShape) {
		return shape.props.w
	}

	getGeometry(shape: NodeShape) {
		const height = this.getHeight(shape)
		return new Rectangle2d({ width: shape.props.w, height: height, isFilled: true })
	}

	component(shape: NodeShape) {
		const {
			id,
			type,
			x,
			y,
			props: { color, font, size, align, text, verticalAlign, isHighlight, initSlide },
		} = shape

		const editor = useEditor()

		const history = shape.meta.history

		// States
		const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
		const [lastUser, setLastUser] = useState(null)
		const [userClickCount, setUserClickCount] = useState({})
		const [editHistory, setEditHistory] = useState([])
		const [loadingStatus, setLoadingStatus] = useState('idle')
		const [tips, setTips] = useState([])
		// const [selectedHistory, setSelectedHistory] = useState(null)
		const [curOpenHistory, setCurOpenHistory] = useState(null)
		const [summary, setSummary] = useState({})
		const [searchHistories, setSearchHistories] = useState([])
		const [isSlide, setIsSlide] = useState(null)
		const userPreference = getUserPreferences()
		const userColor = editor.user.color

		useEffect(() => {
			if (!editor.getSelectedShapeIds().includes(id)) {
				editor.updateShapes([
					{
						id,
						type,
						props: {
							isPressed: false,
						},
					},
				])
				setLoadingStatus('idle')
			}
		}, [editor.getSelectedShapeIds()])

		const updateNoteSharedInfo = () => {
			// var historyCopy = [...history]
			// if (history.length > 0) {
			// 	// console.log("Edit history is not empty")
			// 	const lastEdit = history[history.length - 1]
			// 	if (text === lastEdit.text) {
			// 		return
			// 	}
			// 	else {
			// 		// update edit history and increase user click count
			// 		editor.updateShapes([
			// 			{
			// 				id,
			// 				type,
			// 				meta: {
			// 					history: [...history, { text: shape.props.text, color: userColor }],
			// 				},
			// 			},
			// 		])
			// 		historyCopy = [...history, { text: shape.props.text, color: userColor }]

			// 	}
			// } else {
			// 	// console.log("Edit history is empty")
			// 	editor.updateShapes([
			// 		{
			// 			id,
			// 			type,
			// 			// ISSUE: text is not up-to-date, it uses the last text
			// 			meta: {
			// 				history: [{ text: shape.props.text, color: userColor }],
			// 			},
			// 		},
			// 	])
			// 	historyCopy = [{ text: shape.props.text, color: userColor }]
			// }

			// const newColor = getProportionalColor(historyCopy)
			// console.log("newColor: ", newColor)
			editor.updateShapes([
				{
					id,
					type,
					props: {
						color: userColor,
					},
				},
			])
		}

		const handleTips = () => {
			setLoadingStatus('loading')
			generateTipsForObject(editor, shape.id).then((tips) => {
				setTips(tips)
				setLoadingStatus('tip-loaded')
				// console.log('Tips: ', tips)
			})
		}

		const handleSubtasks = () => {
			setLoadingStatus('loading')
			const selectionBounds = editor.getSelectionPageBounds()
			if (!selectionBounds) throw new Error('No selection bounds')
			generateSubtasks(editor, shape.id, text).then((subtasks) => {
				for (const [index, subtask] of subtasks.entries()) {
					const newShapeId = createShapeId()
					editor.createShape({
						id: newShapeId,
						type: 'subtask',
						x: selectionBounds.maxX + 60 + (index % 4) * 220,
						y: selectionBounds.y + Math.floor(index / 4) * 220,
						props: {
							text: subtask.task,
						},
					})
				}
				setLoadingStatus('loaded')
			})
		}

		const handleCompare = () => {
			setLoadingStatus('summary-loaded')
			const summary = {
				text: 'Recent interest in design through the artificial intelligence (AI) lens is rapidly increasing. Designers, as a\
				special user group interacting with AI, have received more attention in the Human-Computer Interaction\
				community',
				keywords: ['user group', 'artificial intelligence', 'Human-Computer Interaction'],
			}
			setSummary(summary)
		}

		useEffect(() => {
			// console.log('isHighlight: ', isHighlight)
		}, [isHighlight])

		return (
			<HTMLContainer
				className={
					isSlide
						? 'slide-rotate-ver-right'
						: isSlide != null
						? 'slide-rotate-ver-right-revert'
						: initSlide
						? 'slide-rotate-ver-right-translate'
						: ''
				}
				id={shape.id}
				style={{
					pointerEvents: 'all',
					display: 'inline-block',
					alignItems: 'center',
					justifyContent: 'center',
					direction: 'ltr',
				}}
			>
				<div
					style={{
						position: 'absolute',
						width: shape.props.w,
						height: this.getHeight(shape),
					}}
				>
					<div
						className="node-user-name"
						style={{
							backgroundColor: color,
							height: TAG_SIZE,
							paddingLeft: 10,
							borderTopLeftRadius: 10,
							borderTopRightRadius: 10,
						}}
					>
						{/* Note Type */}
					</div>
					<div
						className="tl-note__container"
						style={{
							color: color,
							height: this.getHeight(shape) - TAG_SIZE,
							backgroundColor: color,
							borderRadius: 0,
							borderWidth: 2,
							borderColor: isHighlight == true ? 'green' : 'transparent',
						}}
					>
						<div className="tl-note__scrim" />
						<TextLabel
							id={id}
							type={type}
							font={font}
							size={size}
							align={align}
							verticalAlign={verticalAlign}
							text={text}
							labelColor="black"
							setIsKeyboardOpen={setIsKeyboardOpen}
							// updateNoteSharedInfo={updateNoteSharedInfo}
							wrap
						/>
					</div>
					{/* Make sure the device do not have built-in keyboard
					<OverlayKeyboard
						size={NOTE_SIZE}
						type={type}
						id={id}
						isKeyboardOpen={isKeyboardOpen}
						setIsKeyboardOpen={setIsKeyboardOpen}
					/> */}
				</div>
				<div
					style={{
						marginLeft: shape.props.w + PADDING,
					}}
				>
					{loadingStatus == 'idle' && (
						<div>
							<IconButton
								size="small"
								onPointerDown={stopEventPropagation}
								onTouchStart={handleTips}
								onClick={handleTips}
							>
								<DnsIcon />
							</IconButton>
							<IconButton
								size="small"
								onPointerDown={stopEventPropagation}
								onTouchStart={handleSubtasks}
								onClick={handleSubtasks}
							>
								<SafetyDividerIcon />
							</IconButton>
							<IconButton
								onPointerDown={stopEventPropagation}
								onTouchStart={() => {
									setLoadingStatus('search-bar')
								}}
								onClick={() => {
									setLoadingStatus('search-bar')
								}}
							>
								<TipsAndUpdatesIcon />
							</IconButton>
							<IconButton
								onPointerDown={stopEventPropagation}
								onTouchStart={handleCompare}
								onClick={handleCompare}
							>
								<CompareArrowsIcon />
							</IconButton>
							<IconButton
								onPointerDown={stopEventPropagation}
								onTouchStart={() => {
									editor.deleteShape(id)
								}}
								onClick={() => {
									editor.deleteShape(id)
								}}
							>
								<DeleteForeverIcon />
							</IconButton>
							{/* <IconButton
								onPointerDown={stopEventPropagation}
								onClick={() => {
									if (isSlide == null || isSlide == false) {
										setIsSlide(true)
										const maxRepeats = 2;
										var repeatCount = 0;
										const interval = setInterval(() => {
											if (repeatCount < maxRepeats) {
												editor.createShape({
													id: createShapeId(),
													type: 'node',
													x: 200*(repeatCount + 1),
													y: 0,
													parentId: id,
													props: {
														text: text,
														initSlide: true,
														index: repeatCount + 1,
													},
												})
												repeatCount++;
											} else {
												// Clear interval once maxRepeats is reached
												clearInterval(interval);
											}
										}, 500)
									} else if (isSlide == true) {
									setIsSlide(false)
									}
								}}
							>
								<ScreenRotationIcon />
							</IconButton> */}
						</div>
					)}
					{loadingStatus == 'search-bar' && (
						<div style={{ display: 'flex', flexDirection: 'row' }}>
							<div style={{ marginRight: '10px' }}>
								<SearchBar
									setSearchHistories={setSearchHistories}
									searchHistories={searchHistories}
								/>
								<div
									style={{
										display: 'flex',
										marginLeft: '5px',
										alignItems: 'center',
										flexDirection: 'column',
										width: '100%',
									}}
								>
									{searchHistories.map((data, index) => (
										<div key={index}>
											<SearchHistory
												searchHistories={searchHistories}
												setSearchHistories={setSearchHistories}
												curOpenHistory={curOpenHistory}
												setCurOpenHistory={setCurOpenHistory}
												data={data}
												setSelectedHistory={setSelectedHistory}
											/>
										</div>
									))}
								</div>
							</div>
							{/* {selectedHistory != null && (
								<div>
									<Grid container rowSpacing={2} columnSpacing={2} sx={{ width: 800 }}>
										{selectedHistory.result.map((suggestion, index) => (
											<Grid item xs={4} key={index}>
												<RefinmentCard
													index={index}
													srcId={id}
													setLoadingStatus={setLoadingStatus}
													suggestion={suggestion.text}
													editor={editor}
												/>
											</Grid>
										))}
									</Grid>
								</div>
							)} */}
						</div>
					)}
					{loadingStatus == 'loading' && (
						<div style={{ display: 'flex', width: '25px', height: '25px' }}>
							<img src="/loading.png" className="loading-icon" />
						</div>
					)}
					{
						loadingStatus == 'tip-loaded' && <NodeNestPop tips={tips} editor={editor} />
						// (
						// 	<Popover
						// 		id={id}
						// 		open={true}
						// 		// anchorEl={anchorEl}
						// 		// anchorOrigin={{
						// 		// 	vertical: 'bottom',
						// 		// 	horizontal: 'left',
						// 		// }}
						// 	>
						// 		{tips.length > 0 &&
						// 			tips.map((tip, index) => (
						// 				<div key={index}>
						// 					<TipsCard
						// 						srcId={id}
						// 						tarId={tip.dstId}
						// 						text={tip.explanation}
						// 						keywords={tip.keywords}
						// 						editor={editor}
						// 					/>
						// 				</div>
						// 			))}
						// 	</Popover>
						// )
					}
					{loadingStatus == 'summary-loaded' && (
						<div>
							<SummaryCard editor={editor} summary={summary} />
						</div>
					)}
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: NodeShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds

		return (
			<rect rx="7" width={toDomPrecision(bounds.width)} height={toDomPrecision(bounds.height)} />
			// <div></div>
		)
	}

	// override onResize: TLOnResizeHandler<NodeShape> = (
	// 	shape,
	// 	{ handle, newPoint, scaleX, scaleY, initialShape }
	// ) => {
	// 	// use the w/h from props here instead of the initialBounds here,
	// 	// since cloud shapes calculated bounds can differ from the props w/h.
	// 	let w = initialShape.props.w * scaleX
	// 	let h = (initialShape.props.h + initialShape.props.growY) * scaleY
	// 	let overShrinkX = 0
	// 	let overShrinkY = 0

	// 	if (shape.props.text.trim()) {
	// 		let newW = Math.max(Math.abs(w), MIN_SIZE_WITH_LABEL)
	// 		let newH = Math.max(Math.abs(h), MIN_SIZE_WITH_LABEL)

	// 		if (newW < MIN_SIZE_WITH_LABEL && newH === MIN_SIZE_WITH_LABEL) {
	// 			newW = MIN_SIZE_WITH_LABEL
	// 		}

	// 		if (newW === MIN_SIZE_WITH_LABEL && newH < MIN_SIZE_WITH_LABEL) {
	// 			newH = MIN_SIZE_WITH_LABEL
	// 		}

	// 		const labelSize = getLabelSize(this.editor, {
	// 			...shape,
	// 			props: {
	// 				...shape.props,
	// 				w: newW,
	// 				h: newH,
	// 			},
	// 		})

	// 		const nextW = Math.max(Math.abs(w), labelSize.w) * Math.sign(w)
	// 		const nextH = Math.max(Math.abs(h), labelSize.h) * Math.sign(h)
	// 		overShrinkX = Math.abs(nextW) - Math.abs(w)
	// 		overShrinkY = Math.abs(nextH) - Math.abs(h)

	// 		w = nextW
	// 		h = nextH
	// 	}

	// 	const offset = new Vec(0, 0)

	// 	// x offsets

	// 	if (scaleX < 0) {
	// 		offset.x += w
	// 	}

	// 	if (handle === 'left' || handle === 'top_left' || handle === 'bottom_left') {
	// 		offset.x += scaleX < 0 ? overShrinkX : -overShrinkX
	// 	}

	// 	// y offsets

	// 	if (scaleY < 0) {
	// 		offset.y += h
	// 	}

	// 	if (handle === 'top' || handle === 'top_left' || handle === 'top_right') {
	// 		offset.y += scaleY < 0 ? overShrinkY : -overShrinkY
	// 	}

	// 	const { x, y } = offset.rot(shape.rotation).add(newPoint)

	// 	return {
	// 		x,
	// 		y,
	// 		props: {
	// 			w: Math.max(Math.abs(w), 1),
	// 			h: Math.max(Math.abs(h), 1),
	// 			growY: 0,
	// 		},
	// 	}
	// }

	override toSvg(shape: NodeShape, ctx: SvgExportContext) {
		ctx.addExportDef(getFontDefForExport(shape.props.font))
		const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() })
		const bounds = this.editor.getShapeGeometry(shape).bounds

		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

		const adjustedColor = shape.props.color === 'black' ? 'yellow' : shape.props.color

		const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect1.setAttribute('rx', '10')
		rect1.setAttribute('width', NOTE_SIZE.toString())
		rect1.setAttribute('height', bounds.height.toString())
		rect1.setAttribute('fill', adjustedColor)
		rect1.setAttribute('stroke', adjustedColor)
		rect1.setAttribute('stroke-width', '1')
		g.appendChild(rect1)

		const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect2.setAttribute('rx', '10')
		rect2.setAttribute('width', NOTE_SIZE.toString())
		rect2.setAttribute('height', bounds.height.toString())
		rect2.setAttribute('fill', theme.background)
		rect2.setAttribute('opacity', '.28')
		g.appendChild(rect2)

		const textElm = getTextLabelSvgElement({
			editor: this.editor,
			shape,
			font: DefaultFontFamilies[shape.props.font],
			bounds,
		})

		textElm.setAttribute('fill', theme.text)
		textElm.setAttribute('stroke', 'none')
		g.appendChild(textElm)

		return g
	}

	override onBeforeCreate = (next: NodeShape) => {
		return getGrowY(this.editor, next, next.props.growY)
	}

	override onBeforeUpdate = (prev: NodeShape, next: NodeShape) => {
		if (
			prev.props.text === next.props.text &&
			prev.props.font === next.props.font &&
			prev.props.size === next.props.size
		) {
			return
		}

		return getGrowY(this.editor, next, prev.props.growY)
	}

	override onEditEnd: TLOnEditEndHandler<NodeShape> = (shape) => {
		const {
			id,
			type,
			props: { text },
		} = shape

		if (text.trimEnd() !== shape.props.text) {
			this.editor.updateShapes([
				{
					id,
					type,
					props: {
						text: text.trimEnd(),
					},
				},
			])
		}
	}

	override onResize: TLOnResizeHandler<any> = (shape, info) => {
		return resizeBox(shape, info)
	}
}

function getGrowY(editor: Editor, shape: NodeShape, prevGrowY = 0) {
	const PADDING = 17

	const nextTextSize = editor.textMeasure.measureText(shape.props.text, {
		...TEXT_PROPS,
		fontFamily: FONT_FAMILIES[shape.props.font],
		fontSize: LABEL_FONT_SIZES[shape.props.size],
		maxWidth: NOTE_SIZE - PADDING * 2,
	})

	const nextHeight = nextTextSize.h + PADDING * 2

	let growY: number | null = null

	if (nextHeight > NOTE_SIZE) {
		growY = nextHeight - NOTE_SIZE
	} else {
		if (prevGrowY) {
			growY = 0
		}
	}

	if (growY !== null) {
		return {
			...shape,
			props: {
				...shape.props,
				growY,
			},
		}
	}
}
