import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
	BaseBoxShapeUtil,
	DefaultSpinner,
	HTMLContainer,
	Icon,
	TLBaseShape,
	stopEventPropagation,
	toDomPrecision,
	useIsEditing,
	useToasts,
} from '@tldraw/tldraw'

export type QuilEditorShape = TLBaseShape<
	'quil-editor',
	{
		html: string
		w: number
		h: number
	}
>

export class QuilEditorShapeUtil extends BaseBoxShapeUtil<QuilEditorShape> {
	static override type = 'quil-editor' as const

	getDefaultProps (): QuilEditorShape['props'] {
		return {
			html: '',
			w: 600,
			h: 400,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = () => false
	override canResize = () => true
	override canBind = () => false
	override canUnmount = () => false

	override component (shape: QuilEditorShape) {

		// Kind of a hack—we're preventing user's from pinching-zooming into the iframe
        const htmlToUse = shape.props.html.replace(
            `</body>`,
            `<script>document.body.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); return }, { passive: false })</script>
</body>`
        )

		return (
			<HTMLContainer className='tl-embed-container' id={shape.id} style={{
				width: shape.props.w,
				height: shape.props.h,
				overflow: 'hidden',
				border: '1px solid var(--color-muted-1)',
			}}>
				{htmlToUse ? (
					<ReactQuill
						theme='snow'
						value={shape.props.html}
						style={{
							width: '100%',
							height: '100%',
							overflow: 'auto',
						}}
						onChange={html => {
                            editor.updateShape<QuilEditorShape>({
                                id: shape.id,
                                type: 'quil-editor',
                                props: { html },
                            })
						}}
					/>
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-muted-2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid var(--color-muted-1)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
			</HTMLContainer>
		)
	}

	indicator (shape: QuilEditorShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
