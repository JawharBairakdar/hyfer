import React, { Component, Fragment } from 'react'

import { getWeeksBeforeAndAfter } from '../../../util'
import TaskComp from './TaskComp/TaskComp'
import EmptyTaskCell from './EmptyTaskCell/EmptyTaskCell'
import { appStore } from '../../../Provider';

export default class ClassTaskRowComp extends Component {
    renderAllTaskComps = () => {
        const { width, height, group } = this.props
        const {
            timeline,
            timeline: {
                selectedModule, allWeeks
            }
        } = appStore.state
        const items = timeline.items[group]

        const { weeksBefore, weeksAfter } = getWeeksBeforeAndAfter(allWeeks, items)
        let rowCells = []
        if (weeksBefore.length !== 0) {
            rowCells = weeksBefore.map(week => (
                <EmptyTaskCell key={week} week={week} width={width} height={height} />
            ))
            rowCells.pop()
        }

        const taskRowItems = items.map(item => {
            let active = false
            if (selectedModule) {
                active = item.running_module_id === selectedModule.running_module_id
            }
            return (
                <TaskComp
                    teachers={this.props.teachers}
                    active={active}
                    key={item.running_module_id}
                    item={{ ...item }}
                    allModules={items}
                    width={width}
                    height={height}
                />
            )
        })
        rowCells = [...rowCells, ...taskRowItems]
        if (weeksAfter.length === 0) return rowCells

        const cellsAfter = weeksAfter.map(week => (
            <EmptyTaskCell key={week} width={width} height={height} />
        ))

        return [...rowCells, ...cellsAfter]
    }
    render() {
        return <Fragment>{this.renderAllTaskComps()}</Fragment>
    }
}
