//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import { groupBy, orderBy } from 'lodash'

import { 
  Sheet,
  IAllSheetCells,
  IAllSheetRows,
  SheetFilters, SheetFilterType,
  SheetGroup, SheetGroups, 
  SheetSorts, 
} from '@app/state/sheet/types'

//-----------------------------------------------------------------------------
// Resolve Filter
//-----------------------------------------------------------------------------
export const resolveFilter = (cellValue: string, filterValue: string, type: SheetFilterType) => {
  
  const filterValues = filterValue.split('|').map(untrimmedFilterValue => untrimmedFilterValue.trim())
  
  switch (type) {
    case '=': {
      return filterValues.some(currentFilterValue => resolveValue(cellValue) == resolveValue(currentFilterValue))
    }
    case '!=': {
      return filterValues.every(currentFilterValue => resolveValue(cellValue) != resolveValue(currentFilterValue))
    }
    case '>': {
      return filterValues.some(currentFilterValue => resolveValue(cellValue) > resolveValue(currentFilterValue))
    }
    case '>=': {
      return filterValues.some(currentFilterValue => resolveValue(cellValue) >= resolveValue(currentFilterValue))
    }
    case '<': {
      return filterValues.some(currentFilterValue => resolveValue(cellValue) < resolveValue(currentFilterValue))
    }
    case '<=': {
      return filterValues.some(currentFilterValue => resolveValue(cellValue) <= resolveValue(currentFilterValue))
    }
  }
}

//-----------------------------------------------------------------------------
// Resolve Value
//-----------------------------------------------------------------------------
export const resolveValue = (value: string) => {
  const filteredValue = value !== null ? value.replace('%', '') : ""
  return isNaN(Number(filteredValue)) ? filteredValue : Number(filteredValue)
}

//-----------------------------------------------------------------------------
// Resolve Visible Rows
//-----------------------------------------------------------------------------
export const resolveVisibleRows = (sheet: Sheet, rows: IAllSheetRows, cells: IAllSheetCells, filters: SheetFilters, groups: SheetGroups, sorts: SheetSorts) => {
  const rowIds: string[] = sheet.rows
  const filterIds: string[] = sheet.filters
  const groupIds: string[] = sheet.groups
  const sortIds: string[] = sheet.sorts

  // Filter
  const filteredRowIds: string[] = !filters ? rowIds : rowIds.map(rowId => {
    const row = rows[rowId]
    return filterIds.every(filterId => {
      const filter = filters[filterId]
      const cell = cells[row.cells[filter.columnId]]
      return resolveFilter(cell.value, filter.value, filter.type)
    }) ? row.id : undefined
  }).filter(Boolean)

  // Sort
  const sortBy = sortIds && sortIds.map(sortId => {
    const sort = sorts[sortId]
    return (rowId: string) => {
      const cell = cells[rows[rowId].cells[sort.columnId]]
      return resolveValue(cell.value)
    }
  })
  const sortOrder = sortIds && sortIds.map(sortId => sorts[sortId].order === 'ASC' ? 'asc' : 'desc')
  const filteredSortedRowIds = orderBy(filteredRowIds, sortBy, sortOrder)
  
  // Group
  if(groupIds.length === 0) {
    return filteredSortedRowIds
  }
  else {
    const groupedRowIds = groupBy(filteredSortedRowIds, (rowId: string) => {
      const getValue = (group: SheetGroup) => {
        const cell = rows[rowId] && cells[rows[rowId].cells[group.columnId]]
        return cell && cell.value
      }
      return groupIds.map(groupId => getValue(groups[groupId])).reduce((combined: string, current: string) => combined + (current ? current.toLowerCase() : '') + '-')
    })
    const filteredSortedGroupedRowIds: string[] = []
    const orderedGroups = groups[groupIds[0]].order === 'ASC' ? Object.keys(groupedRowIds).sort() : Object.keys(groupedRowIds).sort().reverse()
    orderedGroups.forEach(groupName => {
      const group = groupedRowIds[groupName]
      filteredSortedGroupedRowIds.push(...group)
      filteredSortedGroupedRowIds.push('ROW_BREAK')
    })
    return filteredSortedGroupedRowIds
  }
}