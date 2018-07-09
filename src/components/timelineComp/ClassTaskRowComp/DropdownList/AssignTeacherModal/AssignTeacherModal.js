import React, { Component } from 'react'

import Modal from '../../../../../Helpers/Modal/Modal'
import classes from './assignTeacherModal.css'
import { appStore } from '../../../../../Provider';
import { timelineStore } from '../../../../../store';
import { success, errorMessage } from '../../../../../notify';

export default class AssignTeacherModal extends Component {
    state = {
        selectedTeacher1: null,
        selectedTeacher2: null,
        toggle: { // true ~> teacher avaliable
            teacher1: false,
            edit1: false,
            teacher2: false,
            edit2: false,
        }
    }

    handleAssignTeachers = () => {
        const { teacher1, teacher2 } = this.state
        const { selectedModule } = appStore.state.timeline
        // appStore.emit('Timeline-AssignTeacherModal-Click-Save', this, selectedModule, teacher1, teacher2)
        const firstTeacher = teacher1 ? teacher1 : appStore.state.timeline.infoSelectedModule.teacher1_id
        const secondTeacher = teacher2 ? teacher2 : appStore.state.timeline.infoSelectedModule.teacher2_id
        timelineStore
            .handleAssignTeachers(selectedModule, firstTeacher, secondTeacher)
            .then(() => {
                if (teacher1)
                    this.setState({
                        selectedTeacher1: firstTeacher,
                        selectedTeacher2: secondTeacher,
                        toggle: {
                            teacher1: firstTeacher ? true : false,
                            teacher2: secondTeacher ? true : false,
                        }
                    })
                // if (teacher2)
                //     this.setState({
                //     })
            }) // it's a good idea to show the user his latest changes
            // .then(() => this.setState({ selectedTeacher1: firstTeacher, selectedTeacher2: secondTeacher }))
            .then(() => {
                const both = teacher1 && teacher2
                if (teacher1 || teacher2)
                    success(`Success Assigning teacher${(both && 's') || ''}.`)
            })
            .catch(errorMessage)
    }

    handleChangeTeacher = (value, num) => {
        if (num === 1 || num === 2) this.setState({ [`teacher${num}`]: value })
    }

    renderSelectTeacher = num => {
        const { teachers } = appStore.state.timeline

        return (
            <select
                className={classes.select}
                name={`teacherSelect${num}`}
                value={this.state[`teacher${num}`] || ''}
                onChange={e => this.handleChangeTeacher(e.target.value, num)}
            >
                <option value="" />
                {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                        {teacher.username}
                    </option>
                ))}
            </select>
        )
    }

    unAssignTeacher = num => {
        this.setState(prevState => ({
            ...prevState,
            [`selectedTeacher${num}`]: null,
            toggle: {
                ...prevState.toggle,
                [`teacher${num}`]: false,
            }
        }))
    }

    filterTeacher = (teachers, id) => teachers.find(teacher => teacher.id === id)

    renderAssignedTeacher = (teacher, num) => {
        return (
            <span className={classes.assignedTeacherWrapper}>
                <span
                    onClick={() => this.unAssignTeacher(num)}
                    className={classes.unAssignTeacher}
                >x</span>

                <span className={classes.teachersName}>{teacher && teacher.username}</span>
            </span>
        )
    }

    // componentDidMount = () => {
    //     const { teachers, selectedModule, infoSelectedModule } = appStore.state.timeline
    //     console.log(selectedModule)
    //     if (teachers.length && infoSelectedModule) {
    //         const { teacher1_id, teacher2_id } = infoSelectedModule

    //         this.setState({
    //             selectedTeacher1: teacher1_id,
    //             selectedTeacher2: teacher2_id,
    //             toggle: {
    //                 teacher1: teacher1_id ? true : false,
    //                 teacher2: teacher2_id ? true : false,
    //             }
    //         })
    //     }

    // }

    componentWillUpdate(nextProps, nextState) {
        console.log(nextState)
        const { teachers, selectedModule, infoSelectedModule } = appStore.state.timeline

        const { toggle, selectedTeacher1, selectedTeacher2 } = nextState

        if (teachers.length) {
            const { teacher1_id, teacher2_id } = infoSelectedModule

            if (!toggle.teacher1 && toggle.edit1) { // if teacher1 toggle it
                // do something...
                return
            }

            if (!toggle.teacher2 && toggle.edit2) { // if teacher1 toggle it
                // do something...
                return
            }


            if (teacher1_id && !selectedTeacher1) { // before this line it should be checked if it's toggled or not
                this.setState(prevState => ({
                    selectedTeacher1: teacher1_id,
                    toggle: {
                        ...prevState.toggle,
                        teacher1: teacher1_id ? true : false,
                    }
                }))
            }

            if (teacher2_id && !selectedTeacher2) {
                this.setState(prevState =>({
                    selectedTeacher2: teacher2_id,
                    toggle: {
                        ...prevState.toggle,
                        teacher2: teacher2_id ? true : false,
                    }
                }))
            }

            //     // console.log('this.props.visible,', nextState.selectedTeacher1, nextState.teacher1 , teacher1_id )

            //     if (!nextState.teacher1 && !nextState.selectedTeacher1 && nextState.local_update) return

            //     if (nextState.teacher1 && nextState.selectedTeacher1 !== nextState.teacher1 && local_update) this.setState({ selectedTeacher1: nextState.teacher1 })
            //     else if (teacher1_id && !nextState.selectedTeacher1) this.setState({ selectedTeacher1: teacher1_id })
            //     else if (!teacher1_id && nextState.selectedTeacher1) this.setState({ selectedTeacher1: null })

            //     if (nextState.teacher2 && nextState.selectedTeacher2 !== nextState.teacher2 && local_update) this.setState({ selectedTeacher2: nextState.teacher2 })
            //     else if (teacher2_id && !nextState.selectedTeacher2) this.setState({ selectedTeacher2: teacher2_id })
            //     else if (!teacher2_id && nextState.selectedTeacher2) this.setState({ selectedTeacher2: null })
            /*
                if (teacher1_id && !nextState.selectedTeacher1) this.setState({ selectedTeacher1: teacher1_id })
                else if (!teacher1_id && nextState.selectedTeacher1) this.setState({ selectedTeacher1: null })
                
                if (teacher2_id && !nextState.selectedTeacher2) this.setState({ selectedTeacher2: teacher2_id })
                else if (!teacher2_id && nextState.selectedTeacher2) this.setState({ selectedTeacher2: null })
            */
        }
    }

    // componentDidUpdate(prevProps, prevState) {
    //     if (this.state.local_update && this.state.teacher1) {
    //         this.setState({ local_update: false })
    //     }
    // }

    closeModal = () => {
        const { infoSelectedModule } = appStore.state.timeline
        if (!infoSelectedModule) return function () { }
        const { teacher1_id, teacher2_id } = infoSelectedModule
        const { selectedTeacher1, selectedTeacher2 } = this.state
        if (teacher1_id && !selectedTeacher1) this.setState({ selectedTeacher1: teacher1_id })
        if (teacher2_id && !selectedTeacher2) this.setState({ selectedTeacher2: teacher2_id })
        return this.props.closeModal
    }

    render() {
        const { selectedModule, teachers, infoSelectedModule } = appStore.state.timeline
        let title
        if (selectedModule) {
            const { module_name, group_name } = selectedModule
            title = `Assign teachers to teach ${group_name} ${module_name} module`
        }

        const { selectedTeacher1, selectedTeacher2, toggle } = this.state

        const isSelected = selectedModule && infoSelectedModule
        const validSelect = isSelected && this.props.id === selectedModule.running_module_id
        const finalSelectCheck = teachers.length && validSelect

        const firstTeacher = finalSelectCheck && selectedTeacher1 && this.filterTeacher(teachers, selectedTeacher1)
        const secondTeacher = finalSelectCheck && selectedTeacher2 && this.filterTeacher(teachers, selectedTeacher2)

        return (
            <Modal
                visible={this.props.visible}
                closeModal={this.closeModal()}
                title={title}
            >
                <div className={classes.formWrapper}>
                    <Former title='Teacher 1'>
                        <ChosenTeacher num={1} toggled={toggle.teacher1} teacher={firstTeacher} unAssignTeacher={this.unAssignTeacher} />
                    </Former>
                    <Former title='Teacher 2'>
                        <ChosenTeacher num={2} toggled={toggle.teacher2} teacher={secondTeacher} unAssignTeacher={this.unAssignTeacher} />
                    </Former>
                    <div className={classes.btnWrapper}>
                        <span>{this.state.warningMessage}</span>
                        <div>
                            <button
                                className={`${classes.btn} ${classes.cancel}`}
                                onClick={this.props.closeModal}
                            >
                                Done!
               </button>
                            <button
                                className={`${classes.btn} ${classes.ok}`}
                                onClick={this.handleAssignTeachers}
                            >
                                Save...
               </button>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}
const ChosenTeacher =
    props => {
        return (
            props.toggled ?
                <AssignedTeacher
                    num={props.num}
                    {...props.teacher}
                    unAssignTeacher={props.unAssignTeacher} />
                : <Selector />
        )
    }
// class ChosenTeacher extends Component {
//     render() {
//         return (
//             this.props.teacher ?
//                 <AssignedTeacher
//                     {...this.props.teacher}
//                     unAssignTeacher={this.props.unAssignTeacher} />
//                 : <Selector />
//         )
//     }
// }
const Former = props => {
    return (
        <React.Fragment>
            <label className={classes.label} htmlFor={props.title.toLowerCase().replace(' ', '')}>
                {props.title}
            </label>
            {props.children}
        </React.Fragment>
    )
}

const Selector = props => {
    const { teachers } = appStore.state.timeline

    const teacherState = {
        teacher: '',
    }
    const setTeacher = param => teacherState.teacher = param
    return (
        <React.Fragment>
            <select
                className={classes.select}
                value={teacherState.teacher || ''}
                onChange={e => setTeacher(e.target.value)}
            >
                <option value="" />
                {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                        {teacher.username}
                    </option>
                ))}
            </select>
        </React.Fragment>
    )
}

const AssignedTeacher = props => {
    return (
        <React.Fragment>
            <span className={classes.assignedTeacherWrapper}>
                <span
                    className={classes.unAssignTeacher}
                    onClick={() => props.unAssignTeacher(props.num)}
                >x</span>
                <span className={classes.teachersName}>{props.full_name || props.username}</span>
            </span>
        </React.Fragment>
    )
}