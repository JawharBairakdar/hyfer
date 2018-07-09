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
    update: true,
    scopes: {
        ok: false,
        items: ['public']
    },
    routes: {
        ok: false,
        items: []
    },
    timeline: {
        ok: false, 
        timeline_setState: null
    }
}

class App extends Component {

    state = { ...defaultState }

    routes = {
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
        guest: [
            { exact: true, path: '/userAccount', component: userAccount, label: 'Manage Account' },
            { exact: true, path: '/currentUserProfile', component: currentUserProfile, label: 'My Profile' },
        ],
        public: [
            { exact: true, path: '/timeline', component: TimeLine, name: 'Timeline' },
        ],
        NotFound: { component: NotFound },
    }

    locals = {
        securedRouteProps: [],
        scopes: ['public']
    }

    setUserRouteProps = item => {
        const { securedRouteProps } = this.locals

        const value = securedRouteProps.find(obj => {
            return obj.path === item.path
        })

        if (!value) securedRouteProps.push(item)
        return value
    }

    findRoutes = (localState) => {
        if (!localState) localState = this.state
        const scopes = localState.scopes.items
        scopes.forEach(scope => {
            this.routes[scope].forEach(item => {
                this.setUserRouteProps(item)
            })
        })
        this.setState({
            routes: {
                ok: this.routesCounter(scopes) === this.locals.securedRouteProps.length,
                items: this.locals.securedRouteProps
            },
            update: true
        })
    }

    routesCounter = scopes => {
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

        if (isATeacher) rolled_to_be('teacher')
        if (isStudent) rolled_to_be('student')
        if (isLoggedIn) rolled_to_be('guest')
    }

    visitorDefaultes = () => {
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
                        ok: (i === 3) || this.state.done, // -- IF ANY ROLE HAS BEEN ADJUSTED THIS NUMBER MUST CHANGE
                    },
                    update: true,
                })
            }

            if (mergedData.type === LOGIN_STATE_CHANGED) user_state('isLoggedIn')
            if (mergedData.type === ISTEACHER_STATE_CHANGED) user_state('isATeacher')
            if (mergedData.type === ISSTUDENT_STATE_CHANGED) user_state('isStudent')
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { auth, update } = nextState
        const hasRoles = auth.isStudent || auth.isATeacher || auth.isLoggedIn

        return (auth.ok && hasRoles && update) || (auth.visitor && update)
    }

    componentWillUpdate(nextProps, nextState) {

        if (nextState.auth.visitor) return

        this.setScopes(nextState.auth)

        if (!nextState.scopes.ok) {
            this.setState({
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

        const isOkay = auth.ok && scopes.ok && routes.ok && timeline.ok

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

