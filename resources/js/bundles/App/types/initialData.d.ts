//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------
import { User } from '@app/state/user/userTypes'

//-----------------------------------------------------------------------------
// Initial Data
//-----------------------------------------------------------------------------
declare global {
	const initialData: InitialData
	interface InitialData {
		user: User
	}
}
export {} // Typescript needs this file to be a module
