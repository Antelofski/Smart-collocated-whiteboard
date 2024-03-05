import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import Card from '@mui/material/Card'
import { useMemo, useState } from 'react'
import { TipsCard } from '../components/TipsCard'

export const NodeNestPop = ({ tips, editor }: { tips: any[]; editor: any }) => {
	const [step, setStep] = useState<number>(1)
	const [ideaList, setIdeaList] = useState<any[]>([])
	const [ideaDetail, setIdeaDetail] = useState({})

	const typeAssets = useMemo(() => {
		const result: any = {}
		tips.forEach((tip) => {
			if (result[tip.relation]) {
				result[tip.relation].push(tip)
			} else {
				result[tip.relation] = [tip]
			}
		})
		return result
	}, [tips])

	const showIdeaList = (tips: any[]) => {
		console.log(tips)
		setIdeaList(tips)
		setTimeout(() => {
			setStep(2)
		}, 0)
	}

	const showIdeaDetail = (idea: any) => {
		setIdeaDetail(idea)
		setTimeout(() => {
			setStep(3)
		}, 0)
	}

	return (
		<Card style={{ width: '300px', padding: '10px' }}>
			<h2>Relation Analysis</h2>
			{step === 1 &&
				Object.entries(typeAssets).map(([key, value]) => (
					<div key={key}>
						<Badge badgeContent={value.length} color="primary" style={{ marginBottom: '5px' }}>
							<Button
								onMouseDown={(e) => {
									showIdeaList(value)
									e.stopPropagation()
								}}
								variant="outlined"
							>
								{key}
							</Button>
						</Badge>
					</div>
				))}
			{step === 2 &&
				ideaList.map((idea) => (
					<Button
            style={{display: 'block', marginBottom: '5px'}}
						key={idea.target_note}
						onMouseDown={(e) => {
							e.stopPropagation()
							showIdeaDetail(idea)
						}}
						variant="outlined"
					>
						#{idea.target_note}
					</Button>
				))}
			{step === 3 && (
				<TipsCard
					srcId={ideaDetail.dstId}
					tarId={ideaDetail.dstId}
					text={ideaDetail.explanation}
					keywords={ideaDetail.keywords}
					editor={editor}
				/>
			)}
		</Card>
	)
}
