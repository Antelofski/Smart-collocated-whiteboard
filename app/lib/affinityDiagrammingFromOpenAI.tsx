import { Editor, TLShapeId, createShapeId } from '@tldraw/tldraw'
import { ResponseShape } from '../ResponseShape/ResponseShape'
import { getSelectionAsImageDataUrl } from './getSelectionAsImageDataUrl'
import {
	GPT4CompletionResponse,
	GPT4Message,
	MessageContent,
	fetchFromOpenAi,
} from './fetchFromOpenAi'

// the system prompt explains to gpt-4 what we want it to do and how it should behave.
const systemPrompt = `Imagine you are a very smart and experienced team leader that is able to identify the common interesting themes behind a group of ideas from different people. Your task is to identify the common underlying themes among ideas, and then group them based on your proposed themes. You need to propose differents ways of grouping these items from diverse thinking perspectives. Plus, please also explain the brief rules of thumb of each way of grouping, as well as the short name of this grouping. Note that user may provide some instructions as grouping direction, we should follow it if provided. Be creative and logical. Think different ways of grouping first, then create the rules of thumb for each group, then create themes, then group ideas based on themes within each group. Note that an idea may be already assigned to a topic group ("pre_topic", otherwise it is undefined). In this case, you need to include the old group name in the returned JSON as "pre_topic" of the idea. The explanation of input JSON format is below. Do not use the same group topic as the original ones. Be creative and logical. Return the grouping results in the required list format.`
const assistantPrompt = `For example, for ideas "Plan a trip to the Miami beach" (under group "trip schedule") and "Book flights from Chicago to Miami" (under group "travel"), the common themes could include "Cost", "Time", "Comfort".

The input JSON format is a list of ideas that you are going to conduct affinity diagramming upon.

The input JSON objects of ideas follow this format:
{
    "ideas": [
        {
            "id": "1",
            "text": "text of the idea",
			"pre_topic": "topic name",
			"color": "color of the note"
		},
		{
			...
        },
        {
            ...
        }
    ]
}

The output list should follow this format:
{
	"group_1": { 
		"principle": "brief rules of thumb you used to create the themes",
		"name": "short name of this grouping",
		"themes": {
			"name of theme 1": [{"text": "idea 1 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, {"text": "idea 2 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, ...],
			"name of theme 2": [{"text": "idea 1 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, {"text": "idea 2 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, ...],
			, ...}
	},
	"group_2": {
		"principle": "brief rules of thumb you used to create the themes",
		"name": "short name of this grouping",
		"themes": {
			"name of theme 1": [{"text": "idea 1 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, {"text": "idea 2 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, ...],
			"name of theme 2": [{"text": "idea 1 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, {"text": "idea 2 content", "pre_topic": "prior parent topic", "color": "color of the original note"}, ...],
			, ...}
	},
	...
}

Note it is possible that an idea is classified into multiple themes. In this case, you should include the idea in each theme it belongs to.

`

// The ideas and groups are optional. If they are not provided, we will do global affinity diagramming.
export async function getAffinityDiagramming({editor, ideas = [], instruction = ""}) {

	// first, we build the prompt that we'll send to openai.
	console.log("Calling getAffinityDiagramming")
	// console.log("Ideas: ", ideas)
	const prompt = await buildPromptForOpenAi(editor, ideas, instruction)

	// TODO: create effect to show loading edges

	try {
		// If you're using the API key input, we preference the key from there.
		// It's okay if this is undefined—it will just mean that we'll use the
		// one in the .env file instead.
		const apiKeyFromDangerousApiKeyInput = (
			document.body.querySelector('#openai_key_risky_but_cool') as HTMLInputElement
		)?.value

		// make a request to openai. `fetchFromOpenAi` is a next.js server action,
		// so our api key is hidden.
		const openAiResponse = await fetchFromOpenAi(apiKeyFromDangerousApiKeyInput, {
			model: 'gpt-4-1106-preview',
			response_format: { type: 'json_object' },
			max_tokens: 4096,
			temperature: 0,
			messages: prompt,
		})

		if (openAiResponse.error) {
			throw new Error(openAiResponse.error.message)
		}

		const response = openAiResponse.choices[0].message.content

		console.log('openAiResponse: ', response)
		const parsed_res = JSON.parse(response)
		return parsed_res

		// populate the response shape with the html we got back from openai.
		// TODO: populate the edges between selected shapes
	} catch (e) {
		// if something went wrong, get rid of the unnecessary response shape

		// TODO: create effect to hide loading edges
		throw e
	}
}


// groups: group ids
async function buildPromptForOpenAi(editor, ideas, instruction) {

	// If no group provided, get the parent topic, text of each note

	let user_ideas = []
	if (ideas !== undefined && ideas.length != 0) {
		user_ideas = ideas
	} else {
		user_ideas = getIdeas(editor)
	}

	const userMessages: MessageContent = [
		{
			type: 'text',
			text: 'Here are ideas created by teams, they are presented in a JSON format as described. Please suggest themes of those ideas for further analysis.',
		},
		{
			// send the text of all selected shapes, so that GPT can use it as a reference (if anything is hard to see)
			type: 'text',
			text: user_ideas.length != 0 ? JSON.stringify(user_ideas) : 'Oh, it looks like there was no idea.',
		},
		{
			type: 'text',
			text: instruction !== '' ? "Following is user instruction for creating groups: " + instruction : 'No instruction is provided, you should generate groups based on your own insight.'
		}
	]

	// combine the user prompt with the system prompt
	return [
		{ role: 'system', content: systemPrompt },
		{ role: 'user', content: userMessages },
		{ role: 'assistant', content: assistantPrompt },
	]
}
function getIdeas(editor: Editor, ideas: any[], groups: any[]) {
	const allShapes = editor.getCurrentPageShapes()

	let json = []
	if (ideas !== undefined && ideas.length != 0) {
		console.log("Selected ideas are provided")
		json = ideas.map(idea => {
			const topic = editor.getShape(idea.parentId)?.props.name
			return {
				text: idea.text,
				id: idea.id,
				pre_topic: topic !== undefined ? topic : '',
				color: idea.color
			}
		})
	} else {
		// when ideas are not provided, we get all the nodes
		json = Array.from(allShapes)
			.map(shape => {
				if (
					shape.type === 'node'
				) {

					const parentId = shape.parentId
					const topic = editor.getShape(parentId)?.props.name
					if (groups !== undefined && groups.length != 0) {
						if (groups.includes(parentId)) {
							return {
								text: shape.props.text,
								id: shape.id,
								pre_topic: topic !== undefined ? topic : '',
								color: shape.props.color
							}
						} else {
							return { text: null, id: null }
						}
					}

					return {
						text: shape.props.text,
						id: shape.id,
						pre_topic: topic !== undefined ? topic : '',
						color: shape.props.color
					}
				}
				return { text: null, id: null }
			})
			.filter(v => v.text !== null && v.text !== '')
	}

	const res = {
		"ideas": json
	}

	return JSON.stringify(res)
}