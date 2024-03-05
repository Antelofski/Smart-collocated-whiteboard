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
const systemPrompt = `Imagine you are a very smart and experienced teacher that is able to clue students how to group the presented ideas logically. Your task is to generate possible ways of grouping the ideas so that students can explore different groupings. A group is like a thinking aspect of analyzing and clustering the existing ideas. Note that the topic of these ideas is optionally provided.  The explanation of input JSON format is below. Return the text in the provided JSON format.`

const assistantPrompt = `The input JSON format is a list of ideas that could have some logical relationships among them.

The input JSON objects of ideas follow this format:
{
    "ideas": [
        {
            "id": "1",
            "text": "text of the idea"
        },
        {
            ...
        }
    ]
}

The returned JSON objects should follow this format:
{
    "groups": ["group1 name", "group2 name", ...],
}

Note you should use node id provided to you in the input JSON object.

`

export async function recommendGroupDirection (editor, ideas, topic="") {

	// first, we build the prompt that we'll send to openai.
	const prompt = await buildPromptForOpenAi(editor, ideas, topic)

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
        return parsed_res.groups

		// populate the response shape with the html we got back from openai.
		// TODO: populate the edges between selected shapes
	} catch (e) {
		// if something went wrong, get rid of the unnecessary response shape

		// TODO: create effect to hide loading edges
		throw e
	}
}

async function buildPromptForOpenAi (editor, ideas, topic) {

	// the user messages describe what the user has done and what they want to do next. they'll get
	// combined with the system prompt to tell gpt-4 what we'd like it to do.
	const userMessages: MessageContent = [
		{
			type: 'text',
			text: 'Here are ideas created by students, they are presented in a JSON format as described. Please suggest group direction that students can cluster them for further analysis.',
		},
		{
			// send the text of all selected shapes, so that GPT can use it as a reference (if anything is hard to see)
			type: 'text',
			text: ideas.length != 0 ? JSON.stringify(ideas) : 'Oh, it looks like there was no idea.',
		},
        {
            type: 'text',
            text: topic ? 'The topic of these ideas is: ' + topic : 'The topic of these ideas is not provided.'
        }
	]

	// combine the user prompt with the system prompt
	return [
		{ role: 'system', content: systemPrompt },
		{ role: 'user', content: userMessages },
		{ role: 'assistant', content: assistantPrompt },
	]
}