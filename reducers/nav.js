import { NavigationActions } from 'react-navigation'
import { DrawerApp as AppNavigator } from '../AppNavigator'

const initialNavState = AppNavigator.router.getStateForAction(
    NavigationActions.navigate({
        routerName: 'Home',
        action: NavigationActions.navigate({ routeName: 'project' })
    })
)

const nav = (state = initialNavState, action) => {
    let nextState
    switch (action.type) {
        default:
            nextState = AppNavigator.router.getStateForAction(action, state)
            break
    }

    return nextState || state;
}

export default nav
