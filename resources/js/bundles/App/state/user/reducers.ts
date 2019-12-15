//-----------------------------------------------------------------------------
// Initial
//-----------------------------------------------------------------------------
import defaultInitialData from '@app/state/initialData'
import { IUser } from '@app/state/user/types'
import { 
  IUserActions, 
  UPDATE_USER,
  UPDATE_USER_ACTIVE, 
  UPDATE_USER_COLOR,
  UPDATE_USER_SUBSCRIPTION
} from '@app/state/user/actions'

//-----------------------------------------------------------------------------
// Initial
//-----------------------------------------------------------------------------
export const initialUserState: IUser = typeof initialData !== 'undefined' ? initialData.user : defaultInitialData.user

//-----------------------------------------------------------------------------
// Reducers
//-----------------------------------------------------------------------------
export const userReducer = (state = initialUserState, action: IUserActions): IUser => {
	switch (action.type) {
    
		case UPDATE_USER: {
			const { updates } = action
			return { ...state, ...updates }
		}

		case UPDATE_USER_ACTIVE: {
			const { updates } = action
			return { ...state, active: { ...state.active, ...updates } }
		}

		case UPDATE_USER_COLOR: {
			const { updates } = action
			return { ...state, color: { ...state.color, ...updates } }
		}

		case UPDATE_USER_SUBSCRIPTION: {
			const { updates } = action
			return { ...state, subscription: { ...state.subscription, ...updates } }
		}

		default:
			return state
	}
}

export default userReducer
