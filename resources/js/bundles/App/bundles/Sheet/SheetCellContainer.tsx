//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React, { useEffect, useRef } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { IAppState } from '@app/state'
import { 
  ISheetCell, 
  ISheetStyles 
} from '@app/state/sheet/types'
import {
  updateSheetCell as updateSheetCell,
  updateSheetSelectionFromArrowKey
} from '@app/state/sheet/actions'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const SheetCellContainer = ({
  sheetId,
  cell,
  cellId,
  children,
  focusCell,
  onCloseCell,
  onlyRenderChildren,
  value,
  testId = null
}: SheetCellContainerProps) => {
  
  const dispatch = useDispatch()

  const activeSheetId = useSelector((state: IAppState) => state.folder.files[state.tab.activeTab] && state.folder.files[state.tab.activeTab].typeId)
  const isSelectedCellEditingPrevented = useSelector((state: IAppState) => state.sheet.allSheets[sheetId].selections.isSelectedCellEditingPrevented)
  const isSelectedCellNavigationPrevented = useSelector((state: IAppState) => state.sheet.allSheets[sheetId].selections.isSelectedCellNavigationPrevented)
  const sheetStyles = useSelector((state: IAppState) => state.sheet.allSheets && state.sheet.allSheets[sheetId] && state.sheet.allSheets[sheetId].styles)

  const container = useRef(null)

  const isActiveSheet = sheetId === activeSheetId
  const isCellEditing = cell.isCellEditing && isActiveSheet
  const isCellSelected = cell.isCellSelectedSheetIds.has(sheetId) && isActiveSheet
  
  useEffect(() => {
    if(isCellSelected && !isCellEditing) {
      addEventListener('keydown', handleKeydownWhileCellIsSelected)
    }
    else {
      removeEventListener('keydown', handleKeydownWhileCellIsSelected)
    }
    return () => {
      removeEventListener('keydown', handleKeydownWhileCellIsSelected)
    }
  }, [ isCellSelected, isCellEditing, isSelectedCellEditingPrevented, isSelectedCellNavigationPrevented ])
  
  useEffect(() => {
    if(isCellEditing) {
      focusCell && focusCell()
      addEventListener('keydown', handleKeydownWhileCellIsEditing)
      addEventListener('mousedown', handleMousedownWhileCellIsEditing)
    }
    else {
      removeEventListener('keydown', handleKeydownWhileCellIsEditing)
      removeEventListener('mousedown', handleMousedownWhileCellIsEditing)
    }
    return () => {
      removeEventListener('keydown', handleKeydownWhileCellIsEditing)
      removeEventListener('mousedown', handleMousedownWhileCellIsEditing)
    }
  }, [ isCellEditing, isSelectedCellNavigationPrevented ])

  const openOnDoubleClick = (e: any) => {
    e.preventDefault()
    dispatch(updateSheetCell(cellId, { isCellEditing: true }, null, true))
  }
  
  const handleMousedownWhileCellIsEditing = (e: MouseEvent) => {
    if(!container.current.contains(e.target)) {
      dispatch(updateSheetCell(cellId, { isCellEditing: false }, null, true))
      onCloseCell && onCloseCell()
    }
  }

  const handleKeydownWhileCellIsEditing = (e: KeyboardEvent) => {
    if(e.key === "Enter" && !isSelectedCellNavigationPrevented) {
      batch(() => {
        dispatch(updateSheetCell(cellId, { isCellEditing: false }, null, true))
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'DOWN', e.shiftKey))
      })
      onCloseCell && onCloseCell()
    }
    if(!isSelectedCellNavigationPrevented) {
      if(e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        dispatch(updateSheetCell(cellId, { isCellEditing: false }, null, true))
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'DOWN', e.shiftKey))
      }
      if(e.key === 'Tab') {
        e.preventDefault()
        dispatch(updateSheetCell(cellId, { isCellEditing: false }, null, true))
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'RIGHT', e.shiftKey))
      }
      if(e.key === 'ArrowUp') {
        e.preventDefault()
        dispatch(updateSheetCell(cellId, { isCellEditing: false }, null, true))
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'UP', e.shiftKey))
      }
    }
  }

  const handleKeydownWhileCellIsSelected = (e: KeyboardEvent) => {
    // If a character key is pressed, start editing the cell
    if(e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !isSelectedCellEditingPrevented) {
      e.preventDefault()
      const updates = { value: e.key, isCellEditing: true }
      const undoUpdates = { value: value }
      dispatch(updateSheetCell(cellId, updates, undoUpdates))
    }
    if(!isSelectedCellNavigationPrevented) {
      // Otherwise, navigate to an adjacent cell on an arrow or enter press
      if(e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'DOWN', e.shiftKey))
      }
      if(e.key === 'Tab' || e.key === 'ArrowRight') {
        e.preventDefault()
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'RIGHT', e.shiftKey))
      }
      if(e.key === 'ArrowLeft') {
        e.preventDefault()
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'LEFT', e.shiftKey))
      }
      if(e.key === 'ArrowUp') {
        e.preventDefault()
        dispatch(updateSheetSelectionFromArrowKey(sheetId, cellId, 'UP', e.shiftKey))
      }
      if(e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        const updates = { value: '', isCellEditing: true}
        const undoUpdates = { value: value }
        dispatch(updateSheetCell(cellId, updates, undoUpdates))
      }
    }
  }
  
  return (
    <Container
      data-testid={testId}
      ref={container}
      cellId={cellId}
      isCellEditing={isCellEditing}
      onDoubleClick={(e) => openOnDoubleClick(e)}
      styles={sheetStyles}>
        {isCellEditing || onlyRenderChildren
          ? children
          : value === null ? " " : value}
    </Container>
  )

}

//-----------------------------------------------------------------------------
// Props
//-----------------------------------------------------------------------------
interface SheetCellContainerProps {
  sheetId: string
  cell: ISheetCell
  cellId: string
  children?: any
  focusCell?(): void
  isCellEditing?: boolean
  isCellSelected: boolean
  onCloseCell?(...args: any): void
  onlyRenderChildren?: boolean
  testId?: string
  updateCellValue(nextCellValue: string): void
  value: string
}

//-----------------------------------------------------------------------------
// Styled Components
//-----------------------------------------------------------------------------
const Container = styled.div`
  z-index: ${ ({ isCellEditing }: IContainer ) => isCellEditing ? '10' : '5' };
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0.15rem 0.25rem;
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: ${ ({ cellId, styles }: IContainer ) => styles.bold.has(cellId) ? 'bold' : 'normal' };
  font-style: ${ ({ cellId, styles }: IContainer ) => styles.italic.has(cellId) ? 'italic' : 'normal' };
  overflow: hidden;
`
interface IContainer {
  cellId: ISheetCell['id']
  isCellEditing: boolean
  styles: ISheetStyles
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default SheetCellContainer
