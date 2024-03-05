function mixColors (colors, weights) {
	var rgbs = []
	colors.forEach((color, index) => {
		rgbs.push(hexToRgb(color))
	})

	var blendedRgb = blend(rgbs, weights)

	return rgbToHex(blendedRgb)
}

export function getProportionalColor (history) {
	console.log("history: ", history)
	const color = history[history.length - 1].color
	const weight = 0.2
	var times = 1
	for (let i = history.length - 1; i >= 0; i--) {
		if (history[i].color === color) {
			times += 1
		} else {
			break
		}
	}

	var rgb = hexToRgb(color)
	rgb = rgb.map(x => Math.round(x * weight * times))
	console.log("rgb: ", rgb)
	return rgbToHex(rgb)
}

// Convert hex color to RGB
function hexToRgb (hex) {
	var bigint = parseInt(hex.replace('#', ''), 16)
	var r = (bigint >> 16) & 255
	var g = (bigint >> 8) & 255
	var b = bigint & 255

	return [r, g, b]
}

function zip (arr1, arr2) {
	return arr1.map((item, index) => [item, arr2[index]])
}

// Mix two RGB colors
function blend (rgbs, weights) {
	var totalWeight = weights.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
	const zipArr = zip(rgbs, weights)

	var r = 0
	var b = 0
	var g = 0

	zipArr.forEach((item, index) => {
		r += (item[0][0] * item[1]) / totalWeight
		g += (item[0][1] * item[1]) / totalWeight
		b += (item[0][2] * item[1]) / totalWeight
	})

	r = r / totalWeight
	g = g / totalWeight
	b = b / totalWeight

	return [Math.round(r), Math.round(g), Math.round(b)]
}

// Convert RGB to hex
function rgbToHex (rgb) {
	return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('')
}
