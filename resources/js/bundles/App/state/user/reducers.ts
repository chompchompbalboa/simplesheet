//-----------------------------------------------------------------------------
// Initial
//-----------------------------------------------------------------------------
import defaultInitialData from '@app/state/initialData'
import { User } from '@app/state/user/types'
import { UserActions, UPDATE_USER_ACTIVE, UPDATE_USER_COLOR } from '@app/state/user/actions'

//-----------------------------------------------------------------------------
// Initial
//-----------------------------------------------------------------------------
export const initialUserState: User = initialData !== undefined ? initialData.user : defaultInitialData.user

//-----------------------------------------------------------------------------
// Reducers
//-----------------------------------------------------------------------------
export const userReducer = (state = initialUserState, action: UserActions): User => {
	switch (action.type) {
		case UPDATE_USER_ACTIVE: {
			const { updates } = action
			return { ...state, active: { ...state.active, ...updates } }
		}

		case UPDATE_USER_COLOR: {
			const { updates } = action
			return { ...state, color: { ...state.color, ...updates } }
		}

		default:
			return state
	}
}

export default userReducer
