import React, { Component } from 'react'
import cookie from 'react-cookies'
import Notifications from 'react-notify-toast'

import Popup from '../components/Popup'

import { appStore } from '../Provider'

import {
    timelineStore,
} from '../store'

class Mains extends Component {
    state = {
        local_update: true,
        timeline: {
            ok: false,
            items: {},
            groups: [],
            teachers: [],
            groupsWithIds: [],
            modules: [],
            allSundays: [],
            allWeeks: [],
            moduleWithTeachers: {},
            selectedModule: null,
            infoSelectedModule: null
        }
    }

    groupNumber = group => {
        const validator = new RegExp(/^Class\s*(\d+).*/, 'i')
        if (typeof group === 'string') {
            if (validator.test(group))
                return group.replace(validator, '$1')
        } else if (typeof group === 'object') {
            if (validator.test(group.group_name))
                return group.group_name.replace(validator, '$1')
        }
    }

    componentWillMount() {
        const token = cookie.load('token')
        if (!token) this.setState({
            local_update: true,
            timeline: { 
                // we need the render to be done...
                ...this.state.timeline,
                teachers: null,
            }
        })

        if (this.props.auth.hasRole && !this.state.timeline.ok) {
            appStore.emit('Mains-get-teachers', this).clearEvent()
        }
        appStore.emit('Mains-timelineStore-Progress', this)
    }

    componentDidMount() {
        timelineStore.fetchItems()
    }

    componentWillUpdate(nextProps, nextState) {
        const { lifeCycle } = appStore.state.main

        appStore.emit('Mains-set-latest-appStore-Update', this, nextState)

        if (nextState.timeline.ok && !lifeCycle.done && nextState.local_update) {
            appStore.emit('Mains-set-latest-App-Component-State', this, {
                timeline: {
                    timeline_setState: this.timeline_setState,
                    ok: true
                },
                update: true
            })
        }
    }

    timeline_setState = data => {
        this.setState(data)
        appStore.set(data)
        this.props.globalApp_setState({ update: true })
    }

    render() {
        if (appStore.state.timeline.ok) {
            appStore.emit('lifeCycle-timeline-ok', this).clearEvent()
        }

        return (
            <React.Fragment>
                <Popup />
                <Notifications />
            </React.Fragment>
        )
    }
}

export default Mains