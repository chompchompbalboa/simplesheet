//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React, { memo, MouseEvent, useEffect, useRef, useState } from 'react'
import { areEqual } from 'react-window'
import styled from 'styled-components'

import { SheetCell, SheetColumnType, SheetCellUpdates, SheetRow } from '@app/state/sheet/types'

import SheetCellBoolean from '@app/bundles/Sheet/SheetCellBoolean'
import SheetCellDatetime from '@app/bundles/Sheet/SheetCellDatetime'
import SheetCellNumber from '@app/bundles/Sheet/SheetCellNumber'
import SheetCellString from '@app/bundles/Sheet/SheetCellString'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const SheetCell = memo(({
  cell,
  clearTimeoutBatchedSheetCellUpdates,
  highlightColor,
  row,
  sheetId,
  style,
  type,
  updateSheetCell,
}: SheetCellProps) => {
  
  const cellContainer = useRef(null)
  const [ cellValue, setCellValue ] = useState(cell ? cell.value : null)
  const [ isHighlighted, setIsHighlighted ] = useState(localStorage.getItem(sheetId) === cell.id)
  
  useEffect(() => {
    if(isHighlighted) {
      window.addEventListener('mousedown', removeHighlightOnClickOutside)
    }
    else {
      window.removeEventListener('mousedown', removeHighlightOnClickOutside)
    }
    return () => {
      window.removeEventListener('mousedown', removeHighlightOnClickOutside)
    }
  }, [ isHighlighted ])

  const handleClick = (e: MouseEvent) => {
    setIsHighlighted(true)
    localStorage.setItem(sheetId, cell.id)
  }

  const removeHighlightOnClickOutside = (e: Event) => {
    if(!cellContainer.current.contains(e.target)) {
      setIsHighlighted(false)
      localStorage.setItem(sheetId, null)
    }
  }

  useEffect(() => {
    let updateSheetCellTimer: number = null
    if(cell && cellValue !== cell.value) {
      clearTimeout(updateSheetCellTimer)
      updateSheetCellTimer = setTimeout(() => {
        updateSheetCell(sheetId, row.id, cell.id, { value: cellValue })
      }, 2500);
    }
    return () => clearTimeout(updateSheetCellTimer);
  }, [ cellValue ])
  
  const sheetCellTypes = {
    STRING: SheetCellString,
    NUMBER: SheetCellNumber,
    BOOLEAN: SheetCellBoolean,
    DATETIME: SheetCellDatetime,
  }
  
  const SheetCellType = sheetCellTypes[type]
  return (
    <Container
      ref={cellContainer}
      highlightColor={highlightColor}
      isHighlighted={isHighlighted}
      onClick={handleClick}
      style={style}>
      <SheetCellType
        cellId={cell.id}
        clearTimeoutBatchedSheetCellUpdates={clearTimeoutBatchedSheetCellUpdates}
        updateCellValue={setCellValue}
        value={cellValue}/>
    </Container>
  )
}, areEqual)

//-----------------------------------------------------------------------------
// Props
//-----------------------------------------------------------------------------
interface SheetCellProps {
  cell: SheetCell
  clearTimeoutBatchedSheetCellUpdates(): void
  highlightColor: string
  row: SheetRow
  sheetId: string
  style: {}
  type: SheetColumnType
  updateSheetCell(sheetId: string, rowId: string, cellId: string, updates: SheetCellUpdates): void
}

//-----------------------------------------------------------------------------
// Styled Components
//-----------------------------------------------------------------------------
const Container = styled.div`
  position: relative;
  cursor: default;
  padding: 0.15rem 0.25rem;
  font-size: 0.9rem;
  border-right: 0.5px solid rgb(180, 180, 180);
  border-bottom: 0.5px solid rgb(180, 180, 180);
  box-shadow: ${ ({ highlightColor, isHighlighted }: ContainerProps ) => isHighlighted ? 'inset 0px 0px 0px 2px ' + highlightColor : 'none' };
  user-select: none;
  background-color: ${ ({ isHighlighted }: ContainerProps ) => isHighlighted ? 'rgb(245, 245, 245)' : 'white' };
  &:hover {
    background-color: rgb(245, 245, 245);
  }
`
interface ContainerProps {
  highlightColor: string
  isHighlighted: boolean
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default SheetCell
