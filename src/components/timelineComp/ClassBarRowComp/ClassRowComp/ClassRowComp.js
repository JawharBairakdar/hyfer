import React, { Component } from 'react'
import classes from './classRowComp.css'
import { errorMessage, success } from '../../../../notify'
import popUpStyle from './archivingPopUp.css'
import { appStore } from '../../../../Provider'
import { getModulesOfGroup } from '../../../../util'

export default class ClassRowComp extends Component {

    state = {
        toggle_details: false,
        toggle_archive: false,
        popUp: false,
        isATeacher: false,
        isStudent: false,
        moduleWithTeachers: [],
    }

    componentDidMount() {
        const { groupObjectId } = this.props

        getModulesOfGroup(this.props.initialGroupDetails.id)
            .then(details => {
                const moduleWithTeachers = this.props.timeline.items[groupObjectId.group_name]
                    .reduce((curr, item, i) => {
                        const container = {}
                        container[item.module_name || item.display_name] = {
                            duration: details[i].duration,
                            teacher1: {
                                ...appStore.state.timeline.teachers.find(teacher => {
                                    return details[i].teacher1_id === teacher.id
                                })
                            },
                            teacher2: {
                                ...appStore.state.timeline.teachers.find(teacher => {
                                    return details[i].teacher2_id === teacher.id
                                })
                            },
                        }
                        curr.push(container)
                        return curr
                    }, [])
                return moduleWithTeachers
            })
            .then(moduleWithTeachers => {
                this.setState({ moduleWithTeachers })
            })
    }

    timeline_setState = null
    componentWillMount() {
        this.timeline_setState = appStore.state.timeline_setState

        const { isATeacher, isStudent } = appStore.state.main.auth
        this.setState({
            isATeacher, isStudent
        })
    }

    confirmArchiving = () => {
        this.handleClassArchive()
        this.setState({
            popUp: false
        })
    }

    cancelArchiving = () => {
        this.setState({
            popUp: false
        })
    }
    toggle_details = () => {
        this.setState(prevState => ({
            toggle_details: !prevState.toggle_details,
            popUp: false
        }))
    }
    toggle_archive = () => {
        this.setState(prevState => ({
            toggle_archive: !prevState.toggle_archive,
            popUp: false
        }))
    }

    archivingPopUp = () => {
        if (this.state.isATeacher) {
            this.setState({
                popUp: true
            })
        }
        if (this.state.isStudent) {
            this.setState({
                toggle_details: true
            })
        }
    }

    Tamplate = props => (
        <div>
            <div className={popUpStyle.backDrop}>
                <div className={popUpStyle.popUp_window}>
                    {props.children}
                </div>
            </div>
            {this.rowButton()}
        </div>
    )


    popUpDetails = () => (
        <this.Tamplate>
            {
                this.state.moduleWithTeachers.reduce((container, item) => {
                    const [moduleName] = Object.keys(item)
                    const moduleContent = item[moduleName]
                    const providedTeachers = [moduleContent.teacher1.full_name, moduleContent.teacher2.full_name]
                    const teachers = 'with: ' && providedTeachers.filter(Boolean).join(' and ')

                    const moduleTemplate = (
                        <p key={moduleName}>
                            {moduleName} for {moduleContent.duration} weeks, {teachers || 'No teachers provided for this module.'}
                        </p>
                    )

                    container.push(moduleTemplate)
                    return container
                }, [])
            }
            <button className={popUpStyle.button_yes} onClick={() => this.toggle_details()}>Done!</button>
        </this.Tamplate>
    )

    popUpArchiving = group => (
        <this.Tamplate>
            <p className={popUpStyle.confirm_q}>{`Are you sure you want to delete ${group.group_name} ??`}</p>
            <button className={popUpStyle.button_cancel} onClick={() => this.toggle_archive()}>No</button>
            <button className={popUpStyle.button_yes} onClick={() => this.confirmArchiving()}>Yes</button>
        </this.Tamplate>
    )

    popUpDiv = group => {

        if (this.state.isStudent) {
            return this.popUpDetails()
        }

        return (
            <this.Tamplate>
                <p className={popUpStyle.confirm_q}>{`Class ${group.group_name} options`}</p>
                <button className={popUpStyle.button_cancel} onClick={() => this.cancelArchiving()}>Close</button>
                <button className={popUpStyle.button_cancel} onClick={() => this.toggle_archive()}>Archive</button>
                <button className={popUpStyle.button_yes} onClick={() => this.toggle_details()}>About</button>
            </this.Tamplate>
        )
    }

    rowButton = () => {
        const { classNumber, height } = this.props

        return (
            <div style={{ height: height + 'px' }} className={classes.container}>
                <button onClick={() => this.archivingPopUp()} className={classNumber && classes.groupId}>{classNumber}</button>
            </div>
        )
    }

    handleClassArchive = async () => {
        const { groupObjectId } = this.props

        if (!this.state.isATeacher) return errorMessage()
        try {
            const token = localStorage.getItem("token")

            await fetch(`http://localhost:3005/api/groups/${groupObjectId.id}`, {
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
            this.removeRow(groupObjectId)
            success(`${groupObjectId.group_name} has been successfully Archived`)
        } catch (err) {
            errorMessage(err)
        }
    }

    removeRow = row => {
        const {
            groups, groupsWithIds, items
        } = this.props.timeline

        this.timeline_setState(prevState => ({
            timeline: {
                ...prevState.timeline,
                groups: groups.filter(item => item !== row.group_name),
                groupsWithIds: groupsWithIds.filter(item => item.group_name !== row.group_name),
                items: groups.reduce((curr, group) => {
                    const key = items[group]
                    if (group === row.group_name) return curr
                    curr[group] = key
                    return curr
                }, {})
            }
        }))
    }

    render() {
       
        const { groupObjectId } = this.props

        if (this.state.popUp) return this.popUpDiv(groupObjectId)
        if (this.state.toggle_archive) return this.popUpArchiving(groupObjectId)
        if (this.state.toggle_details) return this.popUpDetails()
        return this.rowButton()
    }
}
