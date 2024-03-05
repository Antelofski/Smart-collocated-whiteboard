import React from 'react';
import { createShapeId } from '@tldraw/tldraw'
import "../style.css";

export const HighlightText = ({ text, keywords, editor }) => {

    function Keyword({text}) {

        const handleClick = (event) => {
            console.log("onDrag", event);
            console.log("Current point:", editor.inputs.currentPagePoint);
            const shapeId = createShapeId()
            editor.createShape({"id": shapeId, "type": "node", "x": editor.inputs.currentPagePoint.x, "y": editor.inputs.currentPagePoint.y, props: {"text": text}})

        }

        return (
            <span onClick={handleClick} className="highlight-keyword">{text}</span>
        );
    }

    // Escape special characters in keywords and create a regex pattern
    const escapedPhrases = keywords.map(keyword => keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedPhrases.join("|")})`, "gi");
    
    // Split the text into segments including the keywords
    const segments = text.split(pattern);

    return (
        <div>
            {segments.map((segment, index) => {
                // Check if the segment matches any keyword (case insensitive)
                const isPhrase = pattern.test(segment);

                // Reset the lastIndex of the regex to ensure the next test starts from the beginning
                pattern.lastIndex = 0;

                // Render the segment with highlight if it's a keyword
                return isPhrase ? <Keyword text={segment} /> : segment;
            })}
        </div> 
    );
};

export default HighlightText;
