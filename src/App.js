import React, { Component } from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import './assets/styles/app.css'
import Header from './components/Header/Header'
import TimeLine from './Pages/Timeline/TimeLine'
import Footer from './components/Footer/Footer'
import Modules from './Pages/Modules/Modules'
import Users from './Pages/Users/Users'
import currentUserProfile from './Pages/Users/currentUserProfile'
import userAccount from './Pages/Users/userAccount'
import Profile from './Pages/Users/Profile'
import TrainTicket from './Pages/TrainTicket/TrainTicket'
import Homework from "./Pages/Homework/Homework"
import cookie from 'react-cookies'
import NotFound from './Pages/NotFound'

import loader from "./assets/images/Eclipse.gif"
import classes from "./components/timelineComp/Timeline/timeline.css"

import { appStore } from './Provider'

import {
    LOGIN_STATE_CHANGED,
    ISTEACHER_STATE_CHANGED,
    ISSTUDENT_STATE_CHANGED,
    uiStore,
} from './store'

import { errorMessage } from './notify'

import { Mains } from './appMains'

const defaultState = {
    auth: {
        ok: false,
        visitor: false,
        isLoggedIn: false,
        isATeacher: false,
        isStudent: false,
    },
    done: false,
    update: true, // it's just for the shouldcomponentupdate() available
    scopes: {
        ok: false,
        items: ['public']
    },
    routes: {
        ok: false,
        items: []
    },
    timeline: { // there is no need for this here
        ok: false, // NOT MORE THAN THIS NEEDED
        timeline_setState: null
    }
}

class App extends Component {

    /*** The Roles In Frontend ***/

    state = { ...defaultState }

    // For any new Secure Routes we can adding them here:
    // NOTE: if there is any new scope we wanna add here tell me
    // -- or Figure it your self 😐
    routes = {
        // labels for sub pages or with a functionality
        // -- for more info see Header.js
        teacher: [
            { exact: true, path: '/modules', component: Modules, name: 'Modules' },
            { exact: true, path: '/users', component: Users, name: 'Users' },
            { exact: true, path: '/profile', component: Profile, name: 'Profile' },
            { exact: true, path: '/homework', component: Homework, name: 'Homework' },
            { exact: true, path: '/homework/:classNumber', component: Homework },
            { exact: true, path: '/TrainTicket', component: TrainTicket, name: 'Tickets' },
        ],
        student: [
            { exact: true, path: '/users', component: Users, name: 'Users' },
            { exact: true, path: '/homework', component: Homework, name: 'Homework' },
            { exact: true, path: '/homework/:classNumber', component: Homework },
        ],
        guest: [ // and all of the users can share some stuff
            { exact: true, path: '/userAccount', component: userAccount, label: 'Manage Account' },
            { exact: true, path: '/currentUserProfile', component: currentUserProfile, label: 'My Profile' },
        ],
        public: [
            { exact: true, path: '/timeline', component: TimeLine, name: 'Timeline' },
        ],
        NotFound: { component: NotFound },
    }
    // this will contain the Route props from the user scopes
    // setting locals as a properties is faster than the async state
    // -- then we will move it to the state making sure it will
    // -- be added as a one time not on batches to the state
    locals = {
        securedRouteProps: [],
        scopes: ['public']
    }

    setUserRouteProps = item => {
        const { securedRouteProps } = this.locals
        // Only the Objects that has the same path property
        const value = securedRouteProps.find(obj => {
            return obj.path === item.path
        })
        // - pushing a clean type of the user scopes routes
        // -- if the returned from .find() Method is 'undefined'
        // -- then we need it
        if (!value) securedRouteProps.push(item)
        return value
    }

    findRoutes = (localState) => { // the state ~> depending on the lifecycle the function called in!
        // - this function is responsible on matching in 
        // -- the routes Object and returning the correct 
        // -- result if there is a one
        // the default scope is ['public']
        if (!localState) localState = this.state
        const scopes = localState.scopes.items
        scopes.forEach(scope => {
            this.routes[scope].forEach(item => {
                // - calling setUserRouteProps() method that will assign 
                // -- every route the user has an access to it
                this.setUserRouteProps(item)
            })
        })
        this.setState({ // after the locals.securedRouteProps Did Fill in we will pass them into the state
            routes: {
                ok: this.routesCounter(scopes) === this.locals.securedRouteProps.length,
                items: this.locals.securedRouteProps
            },
            update: true
        })
    }

    routesCounter = scopes => {
        // this function only for counting the complete routes number
        let count = 0
        scopes.forEach(scope => {
            count = count + this.routes[scope].length
        })
        return count
    }

    setScopes = ({ isATeacher, isStudent, isLoggedIn }) => {
        const rolled_to_be = someBody => {
            this.locals.scopes = this.locals.scopes.filter(item => item !== someBody).concat(someBody)
        }
        // what the users role?
        if (isATeacher) rolled_to_be('teacher')
        if (isStudent) rolled_to_be('student')
        if (isLoggedIn) rolled_to_be('guest') // in All loggin cases he is a guest
    }

    visitorDefaultes = () => {
        // this should be called for the visitors only
        // DON'T PUT IT IN shouldComponentUpdate() 
        // -- it will stuck into an infinite loop OR
        // -- it will not set the defaults as they should be
        this.findRoutes(this.state)
        this.setState({
            auth: {
                ...this.state.auth,
                visitor: true,
                ok: true,
            },
            scopes: {
                ...this.state.scopes,
                ok: true
            },
        })
    }

    componentWillMount() {
        let token = cookie.load('token')
        if (token && typeof token !== 'undefined') {
            token = JSON.parse(token)
        } else {
            // if there is no token or it's malformed that means the visitor 
            // is not loggedin the following function is just to put every thing
            // to normal for viewing porposes and set the token as an empty token
            // making sure the token will be empty
            this.visitorDefaultes()
            token = ''
        }
        localStorage.setItem('token', token)

        // this is Only for checking what is the users role
        let i = 0 // countering till the last role index
        uiStore.subscribe(mergedData => {
            const user_state = type => {
                i++ // on every check ~> i + 1
                this.setState({
                    auth: {
                        ...this.state.auth,
                        [type]: mergedData.payload[type],
                        // the maximum number of the roles types is 3 
                        // so we have to check the roles for the 3 types
                        // when ever is done it will be true otherwise it's false
                        ok: (i === 3) || this.state.done, // -- IF ANY ROLE HAS BEEN ADJUSTED THIS NUMBER MUST CHANGE
                        // Offcourse it will never arrive to the done if it wasn't pass this point before
                        // -- BUG Explination: after it's done it's returning to be false because the number is not 3 any more
                    },
                    update: true,
                })
            }
            // checking the roles on 3 types
            if (mergedData.type === LOGIN_STATE_CHANGED) user_state('isLoggedIn')
            if (mergedData.type === ISTEACHER_STATE_CHANGED) user_state('isATeacher')
            if (mergedData.type === ISSTUDENT_STATE_CHANGED) user_state('isStudent')
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        // in the following few lines we are making sure that no one
        // -- isn't loggedIn will pass this lifeCycle OR this lifeCycle  
        // -- will never be called on unnecessary conditions
        const { auth, update } = nextState
        const hasRoles = auth.isStudent || auth.isATeacher || auth.isLoggedIn

        return (auth.ok && hasRoles && update) || (auth.visitor && update)
    }

    componentWillUpdate(nextProps, nextState) {
        // in case a controlled visitor update
        if (nextState.auth.visitor) return

        // NOTE: NO BODY CAN ARRIVE AFTER THIS LINE IF HE IS NOT LOGGED IN

        this.setScopes(nextState.auth) // if the user has a role or even LoggedIn assign the roles
        // -- in this way (nextState) we are setting the roles from the first few renders
        // -- Before even it get into state it self

        if (!nextState.scopes.ok) {
            // making sure that the scopes won't changed on every render
            // otherwise it will be an infinte loop!!
            this.setState({
                // set the scopes on the state after they have excuted
                scopes: {
                    ok: true,
                    items: this.locals.scopes
                },
                update: true,
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { auth, scopes, routes, timeline, done } = this.state
        // making sure that everything is Okay
        const isOkay = auth.ok && scopes.ok && routes.ok && timeline.ok

        // After all of the checking for login and Stuff
        // He need his page!!
        // - NOTE: this function here Only for assigning 
        // -- the user routes to the ( locals.securedRouteProps ) Array
        // - AND NOTE: without this function the user may never
        // -- arrive to his distenation path

        if (!isOkay && !done) return this.setState({ done: false, update: false })
        else if (isOkay && !done) return this.setState({ done: true, update: true })
        else if (!this.findRoutes(prevState)) return this.setState({ update: false })
    }

    globalApp_setState = data => {
        if (typeof data === 'function') {
            this.setState(prevState => {
                const result = data(prevState)
                return { ...result, update: true }
            })
        }
        else this.setState({ ...data, update: true })
    }

    render() {
        const { auth: { isLoggedIn, isATeacher, isStudent, ok }, done, update, timeline } = this.state
        const { securedRouteProps } = this.locals
        const { globalApp_setState } = this

        const hasRole = isStudent || isATeacher

        const mains = {
            // main App Object should contain any thing for using on the whole app level
            globalApp_setState,
            timeline_setState: timeline.timeline_setState,
            main: {
                auth: {
                    ok, isLoggedIn, isATeacher, isStudent, hasRole
                },
                routes: securedRouteProps,
                lifeCycle: {
                    done, update
                }
            },
            timeline: {
                ...timeline,
            }
        }

        appStore.set(mains) // setting up appStore Object Content

        const Header_props = {
            isATeacher,
            isStudent,
            done,
            isLoggedIn
        }

        const Mains_props = {
            globalApp_setState,
            auth: {
                ok,
                hasRole
            }
        }
        // - calling findRoutes() method Here for Initial check for the route
        // -- and assigning it in the ( locals.securedRouteProps ) Array that
        // -- will contain all of the same user scopes paths & props
        this.findRoutes()
        return (
            <BrowserRouter>
                <React.Fragment>
                    <Header {...Header_props} />
                    {ok && <Mains {...Mains_props} />}
                    {
                        (!done) ?
                            <div className={classes.divLoading}>
                                <img src={loader} alt="loader" className={classes.load} />
                            </div>
                            :
                            <div>
                                <Switch>
                                    { // every Route the user has an access scopes to it will be rendered here
                                        securedRouteProps.map(item => <Route key={item.path} {...item} />)
                                    }
                                    <Redirect exact strict from='/' to='/timeline' />
                                    { // the user isn't logged in OR the lifecycle done AND No route found render this Component
                                        (!this.state.isLoggedIn || this.state.done) && <Route {...this.routes.NotFound} />
                                    }
                                </Switch>
                            </div>
                    }
                    <Footer />
                </React.Fragment>
            </BrowserRouter>
        )
    }

    componentDidCatch(error, info) {
        errorMessage(error)
    }
}

export default App

