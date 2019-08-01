//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React from 'react'
import { connect } from 'react-redux'
import { v4 as createUuid } from 'uuid'

import clone from '@/utils/clone'

import { ThunkDispatch } from '@app/state/types'
import { 
  SheetFilterUpdates,
  createFilter as createFilterAction,
  deleteFilter as deleteFilterAction,
  updateFilter as updateFilterAction 
} from '@app/state/sheet/actions'
import { SheetColumns, SheetFilter, SheetFilters, SheetFilterType } from '@app/state/sheet/types'

import SheetAction from '@app/bundles/Sheet/SheetAction'
import SheetActionDropdown, { SheetActionDropdownOption } from '@app/bundles/Sheet/SheetActionDropdown'
import SheetActionFilterSelectedOption from '@app/bundles/Sheet/SheetActionFilterSelectedOption'

//-----------------------------------------------------------------------------
// Redux
//-----------------------------------------------------------------------------
const mapDispatchToProps = (dispatch: ThunkDispatch, props: SheetActionProps) => ({
  createFilter: (sheetId: string, newFilter: SheetFilter) => dispatch(createFilterAction(props.sheetId, newFilter)),
  deleteFilter: (filterId: string) => dispatch(deleteFilterAction(props.sheetId, filterId)),
  updateFilter: (filterId: string, updates: SheetFilterUpdates) => dispatch(updateFilterAction(props.sheetId, filterId, updates))
})

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const SheetActionFilter = ({
  columns,
  createFilter,
  deleteFilter,
  filters,
  sheetId,
  updateFilter
}: SheetActionProps) => {

  const selectedOptions = filters && filters.map((filter: SheetFilter) => { return { label: columns[filter.columnId].name, value: filter.id }})

  const columnIds = columns ? Object.keys(columns) : []
  const columnNames = columnIds.map(columnId => columns[columnId].name)
  const filterTypes: SheetFilterType[] = ['=', '>', '>=', '<', '<=']

  const isValidFilter = ([
    columnName,
    filterType,
    filterValue
  ]: string[]) => {
    return (
      columnName && filterType && filterValue &&
      columnNames.includes(columnName) && // First string is a column name
      filterTypes.includes(filterType as SheetFilterType) && // Second string is a FilterType
      filterValue[filterValue.length - 1] === ';' // Third string ends with a semicolon
    )
  }

  const handleInputChange = (nextValue: string) => {
    const splitNextValue = nextValue.split(" ")
    const [ columnName, filterType, ...filterValue ] = splitNextValue
    if(isValidFilter([ columnName, filterType, clone(filterValue).join(" ") ])) {
      createFilter(sheetId, {
        id: createUuid(), 
        columnId: columnIds[columnNames.findIndex(_columnName => _columnName === columnName)], 
        value: clone(filterValue).join(" ").slice(0, -1), 
        type: filterTypes.find(_filterType => _filterType === filterType)
      })
    }
  }
  
  return (
    <SheetAction>
      <SheetActionDropdown
        onInputChange={(nextValue: string) => handleInputChange(nextValue)}
        onOptionDelete={(optionToDelete: SheetActionDropdownOption) => deleteFilter(optionToDelete.value)}
        onOptionSelect={null}
        options={null}
        placeholder={"Filter By..."}
        selectedOptions={selectedOptions}
        selectedOptionComponent={({ option }: { option: SheetActionDropdownOption }) => <SheetActionFilterSelectedOption option={option} filters={filters} updateFilter={updateFilter} />}/>
    </SheetAction>
  )
}

//-----------------------------------------------------------------------------
// Props
//-----------------------------------------------------------------------------
interface SheetActionProps {
  columns: SheetColumns
  createFilter?(sheetId: string, newFilter: SheetFilter): void
  deleteFilter?(columnId: string): void
  updateFilter?(filterId: string, updates: SheetFilterUpdates): void
  filters: SheetFilters
  sheetId: string
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default connect(
  null,
  mapDispatchToProps
)(SheetActionFilter)
