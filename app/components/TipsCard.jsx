import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { stopEventPropagation } from '@tldraw/tldraw'
import { IconButton } from '@mui/material';
import MobileScreenShareIcon from '@mui/icons-material/MobileScreenShare';
import { HighlightText } from './HighlightText'

export function TipsCard({ srcId, tarId, text, keywords, editor  }) {

  const handleClick = () => {
    console.log('You clicked the Chip.');
    const shape = editor.getShape(tarId)
    console.log("Selected shape: ", shape)
    editor.updateShapes([
      {
        id: shape.id,
        type: shape.type,
        props: {
          isHighlight: true,
        },
      },
    ])
  }

  const handleShapeAlignEvent = (e) => {
    e.stopPropagation()
    const shape = editor.getShape(tarId)
    const bounds = editor.getShapePageBounds(srcId)
    editor.animateShapes([{ id: shape.id, type: shape.type, x: bounds.x, y: bounds.maxY + 40}], { duration: 1000 })
  }

  return (
    <Card sx={{ minWidth: 275 }} onPointerDown={stopEventPropagation} onClick={handleClick}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Note: {tarId}
        </Typography>
        <HighlightText editor={editor} text={text} keywords={keywords} />
        <IconButton aria-label="share" onClick={handleShapeAlignEvent}>
          <MobileScreenShareIcon />
        </IconButton>
      </CardContent>
      {/* <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions> */}
    </Card>
  );
}