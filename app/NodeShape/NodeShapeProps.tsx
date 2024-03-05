import { DefaultColorStyle, DefaultFontStyle, DefaultHorizontalAlignStyle, DefaultSizeStyle,  DefaultVerticalAlignStyle,  ShapeProps, T } from '@tldraw/tldraw'
import { NodeShape } from './NodeShapeType'

// Validation for our custom card shape's props, using one of tldraw's default styles
export const NodeShapeProps: ShapeProps<NodeShape> = {
	w: T.number,
	h: T.number,
	color: T.string,
    size: DefaultSizeStyle,
    text: T.string,
    font: DefaultFontStyle,
    align: DefaultHorizontalAlignStyle,
    verticalAlign: DefaultVerticalAlignStyle,
    growY: T.positiveNumber,
    isPressed: T.boolean,
    isHighlight: T.boolean,
    initSlide: T.boolean,
}
