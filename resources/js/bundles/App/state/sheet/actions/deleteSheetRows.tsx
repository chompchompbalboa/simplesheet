//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import { batch } from 'react-redux'

import { mutation } from '@app/api'

import { IAppState } from '@app/state'
import { IThunkAction, IThunkDispatch } from '@app/state/types'

import { ISheetCell, ISheetRow, ISheetRowToDatabase } from '@app/state/sheet/types'

import { createHistoryStep } from '@app/state/history/actions'
import { updateSheet } from '@app/state/sheet/actions'
import { resolveSheetRowLeaders } from '@app/state/sheet/resolvers'

//-----------------------------------------------------------------------------
// Delete Sheet Row
//-----------------------------------------------------------------------------
export const deleteSheetRows = (sheetId: string): IThunkAction => {
	return async (dispatch: IThunkDispatch, getState: () => IAppState) => {
    
    const {
      allSheets: {
        [sheetId]: {
          rows: sheetRows,
          selections: sheetSelections,
          visibleRows: sheetVisibleRows,
          visibleRowLeaders: sheetVisibleRowLeaders
        }
      },
      allSheetCells,
      allSheetRows
    } = getState().sheet
    
    const sheetRowsForUndoActionsDatabaseUpdate: ISheetRowToDatabase[] = []
    let nextSheetRows = [ ...sheetRows ]
    let nextSheetVisibleRows = [ ...sheetVisibleRows ]
    let rowIdsToDelete: ISheetRow['id'][] = []
    
    const firstSelectedRowIdVisibleRowsIndex = sheetVisibleRows.indexOf(sheetSelections.rangeStartRowId)
    const lastSelectedRowIdVisibleRowsIndex = sheetVisibleRows.indexOf(sheetSelections.rangeEndRowId)
    
    if(lastSelectedRowIdVisibleRowsIndex > -1) {
      for(let currentIndex = firstSelectedRowIdVisibleRowsIndex; currentIndex <= lastSelectedRowIdVisibleRowsIndex; currentIndex++) {
        rowIdsToDelete.push(sheetVisibleRows[currentIndex])
      }
    }
    else {
      rowIdsToDelete.push(sheetSelections.rangeStartRowId)
    }
    
    rowIdsToDelete.forEach(rangeRowId => {
      const sheetRow = allSheetRows[rangeRowId]
      const sheetRowCellsForUndoActionsDatabaseUpdate: ISheetCell[] = Object.keys(sheetRow.cells).map(columnId => allSheetCells[sheetRow.cells[columnId]])
      sheetRowsForUndoActionsDatabaseUpdate.push({
        ...sheetRow,
        cells: sheetRowCellsForUndoActionsDatabaseUpdate
      })
      nextSheetRows = nextSheetRows.filter(sheetRowId => sheetRowId !== rangeRowId)
      nextSheetVisibleRows = nextSheetVisibleRows.filter(visibleRowId => visibleRowId !== rangeRowId)
    })
    
    const nextSheetVisibleRowLeaders = resolveSheetRowLeaders(nextSheetVisibleRows)
    
    const actions = () => {
      batch(() => {
        dispatch(updateSheet(sheetId, {
          rows: nextSheetRows,
          visibleRows: nextSheetVisibleRows,
          visibleRowLeaders: nextSheetVisibleRowLeaders,
        }, true))
      })
      mutation.deleteSheetRows(rowIdsToDelete)
    }
    
    const undoActions = () => {
      batch(() => {
        dispatch(updateSheet(sheetId, {
          rows: sheetRows,
          visibleRows: sheetVisibleRows,
          visibleRowLeaders: sheetVisibleRowLeaders
        }, true))
        mutation.createSheetRows(sheetRowsForUndoActionsDatabaseUpdate)
      })
    }
    dispatch(createHistoryStep({ actions, undoActions }))
    actions()
	}
}