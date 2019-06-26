//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import React from 'react'
import styled from 'styled-components'

import Settings from '@app/bundles/Settings/Settings'
import Sidebar from '@app/bundles/Sidebar/Sidebar'
import Sheets from '@app/bundles/Sheets/Sheets'

//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
const App = () => (
	<Container>
		<Sidebar />
		<Settings />
		<Sheets />
	</Container>
)

//-----------------------------------------------------------------------------
// Styled Components
//-----------------------------------------------------------------------------
const Container = styled.div`
	width: 100vw;
	min-height: 100vh;
`

export default App
