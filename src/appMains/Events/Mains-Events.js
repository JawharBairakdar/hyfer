import { appStore } from "../../Provider";

import { getTeachers } from "../../util";
import {
    timelineStore,
    ALL_TEACHERS_CHAGNED,
    TIMELINE_ITEMS_CHANGED,
    TIMELINE_GROUPS_CHANGED,
    GROUPS_WITH_IDS_CHANGED,
    ALL_POSSIBLE_MODULES_CHANGED,
    ALL_SUNDAYS_CHANGED,
    TODAY_MARKER_REFERENCE,
    ALL_WEEKS_CHANGED,
    INFO_SELECTED_MDOULE_CHANGED,
    SELECTED_MODULE_ID_CHANGED
} from "../../store";

appStore.on('lifeCycle-timeline-ok', function () {
    this.setState(prevState => ({
        timeline: {
            ...prevState.timeline,
            ok: true
        }
    }))
})

appStore.on('Mains-set-latest-App-Component-State', function (data) {
    this.props.globalApp_setState(data)
})

appStore.on('Mains-set-latest-appStore-Update', function (nextState) { 
    const { items, groups } = nextState.timeline

    appStore.set(prevAppState => ({
        timeline_setState: this.timeline_setState,
        timeline: {
            ...prevAppState.timeline,
            ...nextState.timeline,
            groupNumber: this.groupNumber,
            ok: groups.length ? groups.length === Object.keys(items).length : false
        }
    }))
})

appStore.on('Mains-get-teachers', function () {
    getTeachers()
        .then(res => {
            const teachers = res.filter(user => user.role === "teacher")
            timelineStore.setState({
                type: ALL_TEACHERS_CHAGNED,
                payload: {
                    teachers
                }
            })
            return teachers
        })
        .then(teachers => {
            this.setState({
                timeline: {
                    // because it's async and it will never arrive here again 
                    // - we need the current state with the time the request ends
                    ...this.state.timeline,
                    teachers
                }
            })
        })
})

appStore.on('Mains-timelineStore-Progress', function () {
    timelineStore.subscribe(mergedData => {
        const isEmpty = (value, property) => { // we don't need the user to see any stack errors because of something not found

            const nameSpace = property || value
            const content = mergedData.payload[value]
            const errorFound = () => {
                const hasLength = param => {
                    const typer = item => Object.prototype.toString.call(item)
                    const param_type = typer(param)
                    const types = ['[object Object]', '[object Array]', '[object String]']
                    return types.find(type => {
                        return type === param_type
                    })
                }
                if (hasLength(content) && !Object.keys(content).length) return true
            }
            const hasError = errorFound()
            if (hasError) return { [nameSpace]: { error: `No current ${nameSpace} Found!` }, ok: true }
            return {
                [nameSpace]: content
            }
        }
        const timeline_state = (value, propertyName) => {
            this.setState(prevState => {
                return ({
                    timeline: {
                        ...prevState.timeline,
                        ...isEmpty(value, propertyName)
                    }
                })
            })
        }

        if (mergedData.type === TIMELINE_ITEMS_CHANGED) timeline_state('items')
        if (mergedData.type === ALL_TEACHERS_CHAGNED) timeline_state('teachers')
        if (mergedData.type === TIMELINE_GROUPS_CHANGED) timeline_state('groups')
        if (mergedData.type === GROUPS_WITH_IDS_CHANGED) timeline_state('groupsWithIds')
        if (mergedData.type === ALL_POSSIBLE_MODULES_CHANGED) timeline_state('modules')
        if (mergedData.type === ALL_SUNDAYS_CHANGED) timeline_state('allSundays')
        if (mergedData.type === TODAY_MARKER_REFERENCE) timeline_state('todayMarkerRef')
        if (mergedData.type === ALL_WEEKS_CHANGED) timeline_state('allWeeks')
        if (mergedData.type === INFO_SELECTED_MDOULE_CHANGED) timeline_state('allModulesOfGroup', 'infoSelectedModule')
        if (mergedData.type === INFO_SELECTED_MDOULE_CHANGED) console.log(mergedData.payload['allModulesOfGroup'])
        if (mergedData.type === SELECTED_MODULE_ID_CHANGED) timeline_state('selectedModule')
        if (mergedData.type === SELECTED_MODULE_ID_CHANGED) console.log(mergedData.payload['selectedModule'])

    })
})