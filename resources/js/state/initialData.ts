import { IFolderPermission } from '@/state/folder/types'
import { 
  IUser, 
  IUserActive, 
  IUserColor, 
  IUserTasksheetSubscription 
} from '@/state/user/types'

const initalData: IInitialData = {
	user: <IUser> {
		id: 'uuid',
		name: '',
		email: '',
		active: <IUserActive> {
			id: 'uuid',
			tabs: [],
			tab: null,
		},
		color: <IUserColor> {
			primary: '',
			secondary: '',
    },
    tasksheetSubscription: <IUserTasksheetSubscription> {
      id: 'userSubscriptionId',
      type: 'LIFETIME',
      nextBillingDate: '2020-02-05 12:00:00',
      subscriptionStartDate: '2019-01-05 12:00:00',
      subscriptionEndDate: '2020-01-01 12:00:00',
      trialStartDate: '2020-01-01 12:00:00',
      trialEndDate: '2020-01-01 12:00:00',
      stripeSetupIntentClientSecret: null
    }
  },
	folders: [
		{
			id: 'uuid',
			name: 'name',
      role: 'OWNER',
			permissions: <IFolderPermission[]>[],
		},
  ],
  files: []
}

export default initalData
