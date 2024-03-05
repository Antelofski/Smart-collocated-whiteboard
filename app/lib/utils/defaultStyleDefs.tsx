import {
	DefaultColorThemePalette,
	DefaultFontFamilies,
	DefaultFontStyle,
	SvgExportDef,
	TLDefaultColorTheme,
	TLDefaultFillStyle,
	TLDefaultFontStyle,
	TLShapeUtilCanvasSvgDef,
	useEditor,
} from '@tldraw/editor'
import { useEffect, useMemo, useRef, useState } from 'react'

/** @public */
export function getFontDefForExport(fontStyle: TLDefaultFontStyle): SvgExportDef {
	return {
		key: `${DefaultFontStyle.id}:${fontStyle}`,
		getElement: async () => {
			const font = findFont(fontStyle)
			if (!font) return null

			const url = (font as any).$$_url
			const fontFaceRule = (font as any).$$_fontface
			if (!url || !fontFaceRule) return null

			const fontFile = await (await fetch(url)).blob()
			const base64FontFile = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => resolve(reader.result as string)
				reader.onerror = reject
				reader.readAsDataURL(fontFile)
			})

			const newFontFaceRule = fontFaceRule.replace(url, base64FontFile)
			const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
			style.textContent = newFontFaceRule
			return style
		},
	}
}

function findFont(name: TLDefaultFontStyle): FontFace | null {
	const fontFamily = DefaultFontFamilies[name]
	for (const font of document.fonts) {
		if (fontFamily.includes(font.family)) {
			return font
		}
	}
	return null
}