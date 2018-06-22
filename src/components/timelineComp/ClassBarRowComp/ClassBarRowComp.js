import React, { Component } from 'react'

import ClassRowComp from './ClassRowComp/ClassRowComp'
import classes from './classBarRowComp.css'
import { appStore } from '../../../Provider'

export const onStateChange = function (object, state, args, ...callback) { // TODO NOW moving the event to willMount Method
    for (const key in object) {
        if (state.hasOwnProperty(key)) {
            if (isFilled(key)) {
                if (this && typeof this.setState === 'function') {
                    // if it didn't binded it will be as checker
                    this.setState(prevState => ({
                        ...prevState,
                        [key]: object[key],
                        ...args
                    }))
                }
                if (callback.length) callback.forEach(item => item())
                return true
            }
            else return false
        }
    }
    function isFilled(key, local_object = object, local_state = state) {
        const object_content = local_object[key]
        const state_content = local_state[key]

        const contentType = Object.prototype.toString.call(object_content)
        const stateContentType = Object.prototype.toString.call(state_content)
        const isSameType = stateContentType === contentType

        const is = type => {
            const c_type = contentType === type ? true : false
            const s_type = stateContentType === type ? true : false
            return c_type && s_type
        }

        const is_null_undefined = is('[object Null]') || is('[object Undefined]')
        const is_array_string = is('[object Array]') || is('[object String]')
        const is_boolean_number = is('[object Number]') || is('[object Boolean]')
        // I am not checking for changes I am checking for filling
        if (!isSameType) return false // Applying ('strict mode') on the types
        if (isSameType && is_null_undefined) return false


        if (is_array_string) {
            // if the state_content length is the same as object_content length ~> means it didn't changed
            if (state_content.length === object_content.length) return false
        }

        if (is_boolean_number) {
            if (state_content === object_content) return false
        }

        if (contentType === '[object Object]') {
            for (const prop in local_object) {
                if (!local_state.hasOwnProperty(prop)) {
                    return false
                } else {
                    const local_object_content = local_object[prop]
                    const local_state_content = local_state[prop]
                    isFilled(prop, local_object_content, local_state_content, true)
                }
            }
        }

        // if all of the tests Fails ~>
        return true
    }

}

export default class ClassBarRowComp extends Component {

    state = {
        timeline: {
            ok: false,
            items: {},
            groups: [],
            groupsWithIds: []
        },
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

    renderAllRowComp = () => {
        const { ok, groups, groupsWithIds, items } = appStore.state.timeline
        if (!ok) return
        // console.log(this.state)
        return groups.map(group => (
            <ClassRowComp
                key={group}
                groups={groups}
                groupsWithIds={groupsWithIds}
                items={items}
                classId={this.groupNumber(group)}
                groupNumber={this.groupNumber}
                height={this.props.rowHeight}
            />
        ))
    }
    componentWillMount() {

        const { auth } = appStore.state.main
        const timeline = appStore.state.timeline
        this.setState({
            isATeacher: auth.isATeacher,
            isStudent: auth.isStudent,
            hasRole: auth.hasRole,
            timeline: {
                groups: timeline.groups,
                groupsWithIds: timeline.groupsWithIds,
                items: timeline.items
            }
        })
        // console.log(timeline)

    }

    componentWillUpdate(nextProps, nextState) {
        const timeline = appStore.state.timeline // TODO Splitting them here
        const timelineChange = {
            timeline: {
                ok: timeline.ok,
                groups: timeline.groups,
                items: timeline.items,
                groupsWithIds: timeline.groupsWithIds,
            },
        }
        appStore.on('timelineChange', onStateChange.bind(this, timelineChange, nextState, {}, () => {
            // console.log(timeline.timeline_setState)
            timeline.timeline_setState({
                local_update: true
            })
        }))
    }

    render() {
        // margin top is width of one extra element + the margin on both sides
        const marginTop = +this.props.rowHeight + 8

        // displaying one extra component to fill in the empty place in the top-left corner
        return (
            <div
                ref="groupsRowContainer"
                style={{ marginTop: marginTop + 'px' }}
                className={classes.container}
            >
                {this.renderAllRowComp()}
            </div>
        )
    }
}
