//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React, { useState } from 'react'
import styled from 'styled-components'

import { SETTINGS_BACKGROUND_COLOR } from '@app/assets/colors'
import { SETTINGS } from '@app/assets/icons'

import Icon from '@/components/Icon'
import SettingsUserColor from './SettingsUserColor'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const Settings = () => {

  const [ isVisible, setIsVisible ] = useState(false)

  return (
    <>
      <SettingsLink
        data-testid="settingsLink"
        isVisible={isVisible}
        onClick={() => setIsVisible(!isVisible)}>
        <Icon
          icon={SETTINGS} 
          size="1.5rem" />
      </SettingsLink>
      <SettingsContainer
        data-testid="settingsContainer"
        isVisible={isVisible}>
        <SettingsHeader>Settings</SettingsHeader>
        <SettingsUserColor />
      </SettingsContainer>
    </>
  )
}

//-----------------------------------------------------------------------------
// Styled Components
//-----------------------------------------------------------------------------
const SettingsLink = styled.div`
  z-index: 3;
  position: fixed;
  top: 0;
  right: 0;
  cursor: pointer;
  padding: 0.375rem;
  color: ${ ({ isVisible }: SettingsLinkProps) => isVisible ? 'rgb(40, 40, 40)' : 'rgb(80, 80, 80)'};
  transform: ${ ({ isVisible }: SettingsLinkProps) => isVisible ? 'none' : 'scale(-1, 1)'};
  &:hover {
    color: rgb(40, 40, 40);
  }
  transition: transform 0.25s;
`
type SettingsLinkProps = {
  isVisible: boolean
}

const SettingsContainer = styled.div`
  z-index: 2;
  position: fixed;
  background-color: ${ SETTINGS_BACKGROUND_COLOR };
  opacity: ${ ({ isVisible }: SettingsContainerProps) => isVisible ? '1' : '0'};
  top: 0;
  left: ${ ({ isVisible }: SettingsContainerProps) => isVisible ? '75vw' : '100vw'};
  height: 100vh;
  width: 25vw;
  padding: 1rem;
  transition: all 0.25s;
`
type SettingsContainerProps = {
  isVisible: boolean
}

const SettingsHeader = styled.h2`
  margin-left: 0.25rem;
  margin-bottom: 1rem;
`

export default Settings
