import React from 'react'
import { useState } from 'react'
import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import '../../style.css'

export const UserPreference = ({ editor, text, color }) => {
    return (
        <div className="user-preference" style={{ backgroundColor: color }}>
            <div variant="h6">{text}</div>
        </div>
    )
}