//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React, { MouseEvent } from 'react'
import styled from 'styled-components'

import { SheetColumn } from '@app/state/sheet/types'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const SheetHeader = ({
  column: {
    id,
    name,
    width
  },
  handleContextMenu,
  isLast
}: SheetHeaderProps) => {

  return (
    <Container
      containerWidth={width}
      isLast={isLast}
      onContextMenu={(e: MouseEvent) => handleContextMenu(e, 'COLUMN', id)}>
      {name}
    </Container>
  )
}

//-----------------------------------------------------------------------------
// Props
//-----------------------------------------------------------------------------
interface SheetHeaderProps {
  column: SheetColumn
  handleContextMenu(e: MouseEvent, type: string, id: string): void
  isLast: boolean
}

//-----------------------------------------------------------------------------
// Styled Components
//-----------------------------------------------------------------------------
const Container = styled.div`
  cursor: default;
  display: inline-block;
  overflow: hidden;
  text-overflow: hidden;
  width: ${ ({ containerWidth }: ContainerProps ) => containerWidth + 'px'};
  padding: 0.28rem;
  text-align: left;
  background-color: rgb(250, 250, 250);
  box-shadow: inset 0 -1px 0px 0px rgba(180,180,180,1);
  border-right: ${ ({ isLast }: ContainerProps ) => isLast ? '1px solid rgb(180, 180, 180)' : 'none'};
  font-size: 0.875rem;
  font-weight: bold;
`
interface ContainerProps {
  containerWidth: number
  isLast: boolean
}

//-----------------------------------------------------------------------------
// Export
//-----------------------------------------------------------------------------
export default SheetHeader
