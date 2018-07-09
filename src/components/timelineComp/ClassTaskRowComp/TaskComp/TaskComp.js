import React, { Component } from 'react'

import DropdownList from '../DropdownList/DropdownList'
import classes from './taskComp.css'
import AssignTeacherModal from '../DropdownList/AssignTeacherModal/AssignTeacherModal'
import { appStore } from '../../../../Provider';

export default class TaskComp extends Component {
    state = {
        assignTeacherModalIsToggled: false,
    }

    showAssignTeacherModal = e => {
        e.stopPropagation()
        this.setState({ assignTeacherModalIsToggled: true })
    }

    hideAssignTeacherModal = () => {
        this.setState({ assignTeacherModalIsToggled: false })
    }

    handleClickItem = e => {
        const { item } = this.props
        appStore.emit('Timeline-TaskComp-Click-Module', null, e, item)
    }

    render() {
        let { width, height, active, item } = this.props

        const {
            module_name, running_module_id, duration,
            git_repo, color, starting_date, ending_date,
            id, group_name
        } = item
        const { selectedModule, infoSelectedModule } = appStore.state.timeline
        const isSelected = infoSelectedModule && selectedModule
        const validSelectedModule = isSelected && selectedModule.running_module_id === running_module_id
        if (duration > 1) {
            // add extra times width as much as needed but for the margin add all - 1 (for the first item it doesn't need any margin)
            width = width * duration + 16 * (duration - 1)
        }
        const className = `${classes.flexWrapper} ${(active && classes.active) || ''}`

        const dropdownList = (
            <div className={classes.dropdownListContainer}>
                <DropdownList
                    showModal={this.showAssignTeacherModal}
                />
            </div>
        )

        const theStart = starting_date

        return (
            <div>
                {validSelectedModule && <AssignTeacherModal
                    teachers={this.props.teachers}
                    id={selectedModule.running_module_id} //
                    visible={this.state.assignTeacherModalIsToggled} //
                    closeModal={this.hideAssignTeacherModal} //
                />}
                <div
                    className={classes.container}
                    style={{ width: width + 'px', height: height + 'px' }}
                >
                    <div
                        className={className}
                        style={{ backgroundColor: color }}
                        title={module_name}
                        data-repo={git_repo}
                        data-group={group_name}
                        data-module_name={module_name}
                        data-start={starting_date.toString()}
                        data-end={ending_date.toString()}
                        data-duration={duration}
                        data-group_id={id}
                        data-running_module_id={running_module_id}
                        onClick={this.handleClickItem}
                    >
                        <div className="taskComp__inner">
                            <p className="taskComp__info">{module_name}</p>
                            <p className={classes.dates + ' taskComp__info'}>
                                {theStart.format('DD MMMM')} - {ending_date.format('DD MMMM')}
                            </p>
                        </div>

                        {(validSelectedModule && dropdownList) || null}
                    </div>
                </div>
            </div>
        )
    }
}
