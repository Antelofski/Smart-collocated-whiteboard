import {
	BaseBoxShapeUtil,
	Geometry2d,
	Rectangle2d,
	SVGContainer,
	SelectionEdge,
	stopEventPropagation,
	FrameShape,
	TLGroupShape,
	TLOnResizeEndHandler,
	TLOnResizeHandler,
	TLShape,
	TLShapeId,
	canonicalizeRotation,
	frameShapeMigrations,
	frameShapeProps,
	getDefaultColorTheme,
	last,
	useEditor,
	HTMLContainer,
	TLBaseShape,
	resizeBox,
	toDomPrecision,
	useIsEditing,
	useValue,
} from '@tldraw/editor'
import classNames from 'classnames'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { Typography, Box, Divider, IconButton } from '@mui/material'
import { useDefaultColorTheme } from '../lib/utils/ShapeFill'
import { createTextSvgElementFromSpans } from '../lib/utils/createTextSvgElementFromSpans'
import { FrameHeading } from './components/FrameHeading'
import { FrameChip } from './components/FrameChip'
import { GroupPanel } from './components/GroupPanel'
import { MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import '../style.css'
import { useEffect, useState } from 'react'
import { RelationPanel } from './components/RelationPanel'

export type FrameShape = TLBaseShape<
	'new_frame',
	{
		w: number,
		h: number,
		name: string,
		backgroundColor: string,
	}
>

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`full-width-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
					{children}
					{/* <button onPointerDown={stopEventPropagation} onClick={() => console.log("Requirement")}>Requirement</button> */}
				</Box>
			)}
		</div>
	);
}

export function defaultEmptyAs(str: string, dflt: string) {
	if (str.match(/^\s*$/)) {
		return dflt
	}
	return str
}

const PADDING = 20
const PANEL_WIDTH = 800

/** @public */
export class FrameShapeUtil extends BaseBoxShapeUtil<FrameShape> {
	static override type = 'new_frame' as const
	static override migrations = frameShapeMigrations

	override canBind = () => true

	override canEdit = () => true

	override getDefaultProps(): FrameShape {
		return { w: 80 * 2, h: 50 * 2, name: '', backgroundColor: "#f0f0f0" }
	}

	override getGeometry(shape: FrameShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: false,
		})
	}

	override component(shape: FrameShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const theme = useDefaultColorTheme()
		const editor = useEditor()
		const [isSelected, setIsSelected] = useState(false)
		const children = editor.getSortedChildIdsForParent(shape.id)
		// const [isPanelOpen, setIsPanelOpen] = useState(false)
		const [tabValue, setTabValue] = useState(0);
		const handleChange = (event, newValue) => {
			setTabValue(newValue);

			// tabValue == 1 means the relation analysis tab is selected
			if (newValue === 1) {

			}
		};
		const { id, type, meta } = shape

		const togglePanel = (tab_value=-1) => {
			console.log("Toggle Panel")
			// set isPanelOpen in meta property to sync the open/close state of the panel among all the users
			editor.updateShapes([{
				id: id,
				meta: { ...meta, isPanelOpen: !meta.isPanelOpen, tabValue: tab_value}
			}])


		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		const isCreating = useValue(
			'is creating this shape',
			() => {
				const resizingState = this.editor.getStateDescendant('select.resizing')
				if (!resizingState) return false
				if (!resizingState.getIsActive()) return false
				const info = (resizingState as typeof resizingState & { info: { isCreating: boolean } })
					?.info
				if (!info) return false
				return info.isCreating && this.editor.getOnlySelectedShape()?.id === shape.id
			},
			[shape.id]
		)


		useEffect(() => {
			if (!editor.getSelectedShapeIds().includes(shape.id)) {
				setIsSelected(false)
			} else {
				setIsSelected(true)
			}
		}, [editor.getSelectedShapeIds()])

		return (
			<div>
				<HTMLContainer style={{ pointerEvents: 'all' }}>
					<SVGContainer className='bulletin' style={{ backgroundColor: shape.props.backgroundColor }} >
					</SVGContainer>
					{isCreating ? null : (
						<div className='frame-heading'>
							<FrameHeading
								id={shape.id}
								name={shape.props.name}
								width={bounds.width}
								height={bounds.height}
							/>
						</div>
					)}
					{/* <div style={{ marginTop: shape.props.h + PADDING }}>
						<Stack direction="row" spacing={1}>
							<FrameChip icon={<SubjectIcon />} eventHandler={handleReqClick} label="Requirement" id="requirement" curChip={curChip} />
							<FrameChip icon={<LightbulbIcon />} onPointerDown={stopEventPropagation} eventHandler={handleIdeaClick} label="Create new ideas" id="idea" curChip={curChip} />
						</Stack>
					</div> */}
				</HTMLContainer>
				{
					!meta.isPanelOpen ? (
						<div className="frame-handler" style={{ paddingTop: 30, display: "flex", justifyContent: "center", cursor: 'pointer', alignItems: "begin", marginLeft: shape.props.w, height: shape.props.h + 3, width: 70 }}>
							<div>
								<Stack>
									<IconButton onPointerDown={stopEventPropagation} onClick={() => togglePanel(0)} style={{ pointerEvents: "all" }}>
										<img src="two_group.png" alt="Icon" style={{ width: 30, height: 30 }} />
									</IconButton>
									<IconButton onPointerDown={stopEventPropagation} onClick={() => togglePanel(1)} style={{ pointerEvents: "all" }}>
										<img src="review.png" alt="Icon" style={{ width: 30, height: 30 }} />
									</IconButton>
								</Stack>
							</div>
							{/* <MdOutlineKeyboardDoubleArrowRight /> */}
						</div>
					) : (
						<div className={`frame-panel ${meta.isPanelOpen ? 'frame-panel-open' : ''}`} style={{ display: "flex", padding: 0, flexDirection: "row", marginLeft: shape.props.w, height: shape.props.h, width: PANEL_WIDTH }}>
							<div style={{ width: "100%", padding: 20 }}>
								{/* <Tabs
									onPointerDown={stopEventPropagation}
									onChange={handleChange}
									value={tabValue}
									aria-label="Tabs where selection follows focus"
									selectionFollowsFocus
								>
									<Tab label="Grouping" />
									<Divider orientation="vertical" flexItem />
									<Tab label="Suggestion" />
									<Divider orientation="vertical" flexItem />
									<Tab label="Item Three" />
								</Tabs>
								<TabPanel value={tabValue} index={0}>
									<GroupPanel editor={editor} shape={shape} />
								</TabPanel>
								<TabPanel value={tabValue} index={1}>
									<RelationPanel editor={editor} shape={shape} />
								</TabPanel> */}
								{
									meta.tabValue == 0 && (
										<GroupPanel editor={editor} shape={shape} />
									)
								}
								{
									meta.tabValue == 1 && (
										<RelationPanel editor={editor} shape={shape} />
									)
								}
							</div>    
							<div className="frame-handler" onPointerDown={stopEventPropagation} onClick={() => togglePanel()} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
								<MdOutlineKeyboardDoubleArrowLeft />
							</div>
						</div>
					)
				}
			</div>

		)
	}

	override toSvg(shape: FrameShape): SVGElement | Promise<SVGElement> {
		const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() })
		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect.setAttribute('width', shape.props.w.toString())
		rect.setAttribute('height', shape.props.h.toString())
		rect.setAttribute('fill', theme.solid)
		rect.setAttribute('stroke', theme.black.solid)
		rect.setAttribute('stroke-width', '1')
		rect.setAttribute('rx', '1')
		rect.setAttribute('ry', '1')
		g.appendChild(rect)

		// Text label
		const pageRotation = canonicalizeRotation(
			this.editor.getShapePageTransform(shape.id)!.rotation()
		)
		// rotate right 45 deg
		const offsetRotation = pageRotation + Math.PI / 4
		const scaledRotation = (offsetRotation * (2 / Math.PI) + 4) % 4
		const labelSide: SelectionEdge = (['top', 'left', 'bottom', 'right'] as const)[
			Math.floor(scaledRotation)
		]

		let labelTranslate: string
		switch (labelSide) {
			case 'top':
				labelTranslate = ``
				break
			case 'right':
				labelTranslate = `translate(${toDomPrecision(shape.props.w)}px, 0px) rotate(90deg)`
				break
			case 'bottom':
				labelTranslate = `translate(${toDomPrecision(shape.props.w)}px, ${toDomPrecision(
					shape.props.h
				)}px) rotate(180deg)`
				break
			case 'left':
				labelTranslate = `translate(0px, ${toDomPrecision(shape.props.h)}px) rotate(270deg)`
				break
			default:
				labelTranslate = ``
		}

		// Truncate with ellipsis
		const opts = {
			fontSize: 12,
			fontFamily: 'serif',
			textAlign: 'start' as const,
			width: shape.props.w,
			height: 32,
			padding: 0,
			lineHeight: 1,
			fontStyle: 'normal',
			fontWeight: 'normal',
			overflow: 'truncate-ellipsis' as const,
			verticalTextAlign: 'middle' as const,
		}

		const spans = this.editor.textMeasure.measureTextSpans(
			defaultEmptyAs(shape.props.name, 'Frame') + String.fromCharCode(8203),
			opts
		)

		const firstSpan = spans[0]
		const lastSpan = last(spans)!
		const labelTextWidth = lastSpan.box.w + lastSpan.box.x - firstSpan.box.x
		const text = createTextSvgElementFromSpans(this.editor, spans, {
			offsetY: -opts.height - 2,
			...opts,
		})
		text.style.setProperty('transform', labelTranslate)

		const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		textBg.setAttribute('x', '-8px')
		textBg.setAttribute('y', -opts.height - 4 + 'px')
		textBg.setAttribute('width', labelTextWidth + 16 + 'px')
		textBg.setAttribute('height', `${opts.height}px`)
		textBg.setAttribute('rx', 4 + 'px')
		textBg.setAttribute('ry', 4 + 'px')
		textBg.setAttribute('fill', theme.background)

		g.appendChild(textBg)
		g.appendChild(text)

		return g
	}

	indicator(shape: FrameShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds

		const isEditing = useIsEditing(shape.id)

		if (isEditing) {
			return null
		}

		return (
			<rect
				width={toDomPrecision(bounds.width)}
				height={toDomPrecision(bounds.height)}
				className={`bulletin-indicator`}
				style={{ zIndex: 'auto' }}
			/>
		)
	}

	override canReceiveNewChildrenOfType = (shape: TLShape, _type: TLShape['type']) => {
		return !shape.isLocked
	}

	override providesBackgroundForChildren(): boolean {
		return true
	}

	override canDropShapes = (shape: FrameShape, _shapes: TLShape[]): boolean => {
		return !shape.isLocked
	}

	override onDragShapesOver = (frame: FrameShape, shapes: TLShape[]): { shouldHint: boolean } => {
		if (!shapes.every(child => child.parentId === frame.id)) {
			this.editor.reparentShapes(
				shapes.map(shape => shape.id),
				frame.id
			)
			return { shouldHint: true }
		}
		return { shouldHint: false }
	}

	override onDragShapesOut = (_shape: FrameShape, shapes: TLShape[]): void => {
		const parent = this.editor.getShape(_shape.parentId)
		const isInGroup = parent && this.editor.isShapeOfType<TLGroupShape>(parent, 'group')

		// If frame is in a group, keep the shape
		// moved out in that group

		if (isInGroup) {
			this.editor.reparentShapes(shapes, parent.id)
		} else {
			this.editor.reparentShapes(shapes, this.editor.getCurrentPageId())
		}
	}

	override onResizeEnd: TLOnResizeEndHandler<FrameShape> = shape => {
		const bounds = this.editor.getShapePageBounds(shape)!
		const children = this.editor.getSortedChildIdsForParent(shape.id)

		const shapesToReparent: TLShapeId[] = []

		for (const childId of children) {
			const childBounds = this.editor.getShapePageBounds(childId)!
			if (!bounds.includes(childBounds)) {
				shapesToReparent.push(childId)
			}
		}

		if (shapesToReparent.length > 0) {
			this.editor.reparentShapes(shapesToReparent, this.editor.getCurrentPageId())
		}
	}

	override onResize: TLOnResizeHandler<any> = (shape, info) => {
		return resizeBox(shape, info)
	}

}