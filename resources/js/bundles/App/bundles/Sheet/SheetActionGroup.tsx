//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React from 'react'
import { connect } from 'react-redux'
import { v4 as createUuid } from 'uuid'

import { ISheetColumn, IAllSheetColumns, ISheetGroup, IAllSheetGroups } from '@app/state/sheet/types'

import { IThunkDispatch } from '@app/state/types'
import { ISheetGroupUpdates } from '@app/state/sheet/types'
import { 
  createSheetGroup as createSheetGroupAction,
  deleteSheetGroup as deleteSheetGroupAction,
  updateSheetGroup as updateSheetGroupAction 
} from '@app/state/sheet/actions'

import SheetAction from '@app/bundles/Sheet/SheetAction'
import SheetActionDropdown, { SheetActionDropdownOption } from '@app/bundles/Sheet/SheetActionDropdown'
import SheetActionGroupSelectedOption from '@app/bundles/Sheet/SheetActionGroupSelectedOption'

//-----------------------------------------------------------------------------
// Redux
//-----------------------------------------------------------------------------
const mapDispatchToProps = (dispatch: IThunkDispatch, props: SheetActionGroupProps) => ({
  createSheetGroup: (newGroup: ISheetGroup) => dispatch(createSheetGroupAction(props.sheetId, newGroup)),
  deleteSheetGroup: (columnId: string) => dispatch(deleteSheetGroupAction(props.sheetId, columnId)),
  updateSheetGroup: (sheetId: string, groupId: string, updates: ISheetGroupUpdates, skipVisibleRowsUpdate?: boolean) => dispatch(updateSheetGroupAction(sheetId, groupId, updates, skipVisibleRowsUpdate))
})

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const SheetActionGroup = ({
  sheetId,
  columns,
  createSheetGroup,
  deleteSheetGroup,
  groups,
  sheetGroups,
  sheetVisibleColumns,
  updateSheetGroup
}: SheetActionGroupProps) => {

  const options = sheetVisibleColumns && sheetVisibleColumns.map((columnId: string) => {
    if(columns && columns[columnId]) {
      return { label: columns[columnId].name, value: columnId }
    }
  }).filter(Boolean)

  const selectedOptions = sheetGroups && sheetGroups.map((groupId: ISheetGroup['id']) => { 
    const group = groups[groupId]
    return { label: columns[group.columnId].name, value: group.id, isLocked: group.isLocked }
  })

  return (
    <SheetAction>
      <SheetActionDropdown
        sheetId={sheetId}
        onOptionDelete={(optionToDelete: SheetActionDropdownOption) => deleteSheetGroup(optionToDelete.value)}
        onOptionSelect={(selectedOption: SheetActionDropdownOption) => createSheetGroup({ id: createUuid(), sheetId: sheetId, columnId: selectedOption.value, order: 'ASC', isLocked: false })}
        onOptionUpdate={(groupId, updates) => updateSheetGroup(sheetId, groupId, updates, true)}
        options={options}
        placeholder={"Group By..."}
        selectedOptions={selectedOptions}
        selectedOptionComponent={({ option }: { option: SheetActionDropdownOption }) => <SheetActionGroupSelectedOption option={option} groups={groups} updateSheetGroup={(...args) => updateSheetGroup(sheetId, ...args)} />}/>
    </SheetAction>
  )
}

//-----------------------------------------------------------------------------
// Props
//-----------------------------------------------------------------------------
interface SheetActionGroupProps {
  columns: IAllSheetColumns
  createSheetGroup?(newGroup: ISheetGroup): void
  deleteSheetGroup?(columnId: string): void
  updateSheetGroup?(sheetId: string, groupId: string, updates: ISheetGroupUpdates, skipVisibleRowsUpdate?: boolean): void
  groups: IAllSheetGroups
  sheetGroups: ISheetGroup['id'][]
  sheetVisibleColumns: ISheetColumn['id'][]
  sheetId: string
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default connect(
  null,
  mapDispatchToProps
)(SheetActionGroup)
