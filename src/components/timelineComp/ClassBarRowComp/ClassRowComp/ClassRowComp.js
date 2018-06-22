import React, { Component } from 'react'
import classes from './classRowComp.css'
import { errorMessage, success } from '../../../../notify'
import popUpStyle from './archivingPopUp.css'
import { appStore } from '../../../../Provider'

const token = localStorage.getItem("token")

export default class ClassRowComp extends Component {

    state = {
        popUp: false,
        isATeacher: false,
        isStudent: false,
        hasRole: false,
        timeline: {
            ok: false,
            items: {},
            groups: [],
            groupsWithIds: []
        }
    }

    confirmArchiving = () => {
        const { classId } = this.props
        this.handleClassArchive(classId)
        this.setState({
            popUp: false
        })
    }

    cancelArchiving = () => {
        this.setState({
            popUp: false
        })
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
        appStore.emit('timelineChange')
    }
    componentWillUnmount() {
        appStore.omit('timelineChange')
    }

    popUpDiv = () => {
        const group = this.state.timeline.groupsWithIds.find(group => this.props.groupNumber(group) === this.props.classId)

        // TODO the (group|teachers|Module) Details PopUp the close is ~> ((((( this.cancelArchiving )))))

        return (
            <div>
                <div className={popUpStyle.backDrop}>
                    <div className={popUpStyle.popUp_window}>
                        <p className={popUpStyle.confirm_q}>{`Are you sure you want to delete ${group.group_name} ??`}</p>
                        <button className={popUpStyle.button_cancel} onClick={() => this.cancelArchiving()}>No</button>
                        <button className={popUpStyle.button_yes} onClick={() => this.confirmArchiving()}>Yes</button>
                    </div>
                </div>
                {this.rowButton()}
            </div>
        )
    }

    rowButton = () => {
        const { classId, height } = this.props

        return (
            <div style={{ height: height + 'px' }} className={classes.container}>
                <button onClick={() => this.archivingPopUp()} className={this.props.classId && classes.groupId}>{classId}</button>
            </div>
        )
    }

    handleClassArchive = async (id) => {
        const group = this.state.timeline.groupsWithIds.find(group => this.props.groupNumber(group) === id)

        try {
            await fetch(`http://localhost:3005/api/groups/${group.id}`, {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    'archived': 1
                })
            })
            this.removeRow(group)
            success(`${group.group_name} has been successfully Archived`)
        } catch (err) {
            errorMessage(err)
        }
    }

    archivingPopUp = () => {
        if (this.state.isATeacher) {
            this.setState({
                popUp: true
            })
        }
    }

    removeRow = row => {
        this.timeline_setState(prevState => ({
            timeline: {
                ...prevState.timeline,
                groups: this.state.timeline.groups.filter(item => item !== row.group_name),
                groupsWithIds: this.state.timeline.groupsWithIds.filter(item => item.group_name !== row.group_name),
                items: this.state.timeline.groups.reduce((curr, group) => {
                    const key = this.state.timeline.items[group]
                    if (group === row.group_name) return curr
                    curr[group] = key
                    return curr
                }, {})
            },
            local_update: true
        }))
    }

    timeline_setState = null

    // componentWillMount() {
    //     const greeting = 'hello world!'
    //     console.log(greeting)
    //     // it should be Okay
    // }

    render() {

        const { auth } = appStore.state.main
        const timeline = appStore.state.timeline // TODO Splitting them here

        if (auth.isATeacher && this.state.isATeacher !== auth.isATeacher) this.setState({ isATeacher: auth.isATeacher })
        if (auth.isStudent && this.state.isStudent !== auth.isStudent) this.setState({ isStudent: auth.isStudent })
        if (auth.hasRole && this.state.hasRole !== auth.hasRole) this.setState({ hasRole: auth.hasRole })

        if (timeline.groups && JSON.stringify(this.state.timeline.groups) !== JSON.stringify(timeline.groups))
            this.setState(prevState => ({ timeline: { ...prevState.timeline, groups: timeline.groups } }))
        if (timeline.groupsWithIds && JSON.stringify(this.state.timeline.groupsWithIds) !== JSON.stringify(timeline.groupsWithIds))
            this.setState(prevState => ({ timeline: { ...prevState.timeline, groupsWithIds: timeline.groupsWithIds } }))
        if (timeline.items && JSON.stringify(this.state.timeline.items) !== JSON.stringify(timeline.items))
            this.setState(prevState => ({ timeline: { ...prevState.timeline, items: timeline.items } }))
        this.timeline_setState = timeline.timeline_setState


        if (this.state.popUp) {
            return (
                this.popUpDiv() // TODO adding a student popUp here
            )
        }
        return this.rowButton()
    }
}
