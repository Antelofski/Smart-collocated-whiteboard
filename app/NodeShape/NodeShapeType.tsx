import { TLBaseShape, TLDefaultColorStyle, TLDefaultSizeStyle, TLDefaultHorizontalAlignStyle, TLDefaultFontStyle, TLDefaultVerticalAlignStyle } from '@tldraw/tldraw'

export type NodeShape = TLBaseShape<
	'node',
	{
		color: string
		size: TLDefaultSizeStyle
		text: string
		font: TLDefaultFontStyle
		align: TLDefaultHorizontalAlignStyle
		verticalAlign: TLDefaultVerticalAlignStyle
		growY: number
		w: number
		h: number
		isPressed: boolean
		isHighlight: boolean
		initSlide: boolean
	}
>