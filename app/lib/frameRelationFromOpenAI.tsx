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
const systemPrompt = `You are a very smart and experienced group work planner that is able to discover how two groups of idea are connected to each other. You are given a primary groups of ideas and the group name. Besides, you are also given several other groups of ideas that may have some logical relationships with the primary group. Your task is to generate the relationship description between the primary group and other groups. Besides, you need to identify the claimed relationships by showing how ideas in two groups can demonstrate this kind of relationship. Return the text in the provided JSON format.`

const assistantPrompt = `The input JSON format is as follow:

The input JSON objects of ideas and topics follow this format:
{
    "primary group": {
        "name": "primary group name",
        "ideas": [
            {
                "id": "idea 1 id of primary group",
                "text": "text of the idea 1"
            },
            {
                "id": "idea 2 id of primary group",
                "text": "text of the idea 2"
            },
            ...
        ]
    },
    "group 1": {
        "name": "group 1 name",
        "ideas": [
            {
                "id": "idea 1 id of group 1",
                "text": "text of the idea 3"
            },
            {
                "id": "idea 2 id of group 1",
                "text": "text of the idea 2"
            },
            ...
        ]
    },
    "group 2": {
        "name": "group 2 name",
        "ideas": [
            {
                "id": "idea 1 id of group 2",
                "text": "text of the idea 4"
            },
            {
                "id": "idea 2 id of group 2",
                "text": "text of the idea 5"
            },
            ...
        ]
    },
    ...
}

The returned JSON objects called "frame_rels" should follow this format:
[
    {
        "name": "Name of the group that you are generating the relationship for",
        "relationship": "text describing the relationship between the primary group and the group",
        "idea-relationship": [
            {
                "srcId": "src idea id",
                "dstId": "dst idea id",
                "relation": "text describing the relationship between the two ideas" 
            },
            {
                ...
            }
        ]
    },
    {
        same for other related groups ...
    }
]

Note you should use group name and idea id provided to you in the input JSON object.
`

// Given frame name and correpsonding ideas, this function will return the relationship between the frames and how to merge two frames
export async function generateFrameRelation (editor, input) {

    console.log('generateFrameRelation input: ', input)

	// first, we build the prompt that we'll send to openai.
	const prompt = await buildPromptForOpenAi(editor, input)

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

		const parsed_res = JSON.parse(response)
        return parsed_res.frame_rels
		// populate the response shape with the html we got back from openai.
		// TODO: populate the edges between selected shapes
	} catch (e) {
		// if something went wrong, get rid of the unnecessary response shape

		// TODO: create effect to hide loading edges
		throw e
	}
}

async function buildPromptForOpenAi (editor, input) {

	// the user messages describe what the user has done and what they want to do next. they'll get
	// combined with the system prompt to tell gpt-4 what we'd like it to do.
	const userMessages: MessageContent = [
		{
			type: 'text',
			text: 'Here are the input json objects of ideas and groups',
		},
		{
			// send the text of all selected shapes, so that GPT can use it as a reference (if anything is hard to see)
			type: 'text',
			text: input !== null ? JSON.stringify(input) : 'Oh, it looks like there was no input group and idea.',
		}
	]

	// combine the user prompt with the system prompt
	return [
		{ role: 'system', content: systemPrompt },
		{ role: 'user', content: userMessages },
		{ role: 'assistant', content: assistantPrompt },
	]
}