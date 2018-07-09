import React, { Component } from 'react'

import ClassRowComp from './ClassRowComp/ClassRowComp'
import classes from './classBarRowComp.css'
import { appStore } from '../../../Provider'

export default class ClassBarRowComp extends Component {

    state = {
        timeline: {
            ok: false,
            items: {},
            groups: [],
            groupsWithIds: [],
            groupsWithDetails: {}
        },
    }

    renderAllRowComp = () => {
        const { ok, groups, groupsWithIds, items, groupNumber } = appStore.state.timeline
        if (!ok) return
        return groups.map(group => {
            const initialGroupDetails = groupsWithIds.find(item => item.group_name === group)
            const classNumber = groupNumber(group)
            const groupObjectId = groupsWithIds.find(group => groupNumber(group) === classNumber)

            const ClassRowComp_props = {
                classNumber,
                initialGroupDetails,
                groupObjectId,
                groupNumber,
                height: this.props.rowHeight,
                timeline: {
                    ok,
                    items,
                    groups,
                    groupsWithIds
                }
            }
            return (
                <ClassRowComp
                    key={group}
                    {...ClassRowComp_props}
                />
            )
        })
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
