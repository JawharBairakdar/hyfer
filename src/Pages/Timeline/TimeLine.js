import React, { Component } from 'react'
import styles from '../../assets/styles/timeline.css'
import ModuleReadme from '../../components/ModuleReadme/ModuleReadme'
import Attendance from '../../components/Attendance/Attendance'
import TimelineComp from '../../components/timelineComp/Timeline/Timeline'

import {
    READ_ME_CHANGED,
    REPO_NAME_CHANGED,
    HISTORY_CHANGED,
    moduleInfoStore,
    uiStore,
    timelineStore,
    SELECTED_MODULE_ID_CHANGED,
    INFO_SELECTED_MDOULE_CHANGED
} from "../../store/index"

import { errorMessage } from '../../notify'
import { Consumer } from '../../Provider'

export default class TimeLine extends Component {
    state = {
        isLoggedIn: false,
        isATeacher: false,
        tab: "readme",
        readme: null,
        repoName: null,
        group_name: null,
        history: null,
        duration: null,
        students: null,
        todayMarkerRef: null,
        selectedModule: null,
        infoSelectedModule: null
    }

    timelineObserver = mergedData => {
        // Containing the Current file useage Other things?? ~> in the appStore
        switch (mergedData.type) {
            case SELECTED_MODULE_ID_CHANGED:
                this.setState({ selectedModule: mergedData.payload.selectedModule })
                break
            case INFO_SELECTED_MDOULE_CHANGED:
                this.setState({ infoSelectedModule: mergedData.payload.allModulesOfGroup })
                break
            default:
                break
        }
    }

    componentWillMount() {
        timelineStore.subscribe(this.timelineObserver)
    }

    componentDidMount() {
        moduleInfoStore.subscribe(mergedData => {
            if (mergedData.type === REPO_NAME_CHANGED) {
                this.setState({ repoName: mergedData.payload.repoName })
            } else if (mergedData.type === READ_ME_CHANGED) {
                this.setState({ readme: mergedData.payload.readme })
            } else if (mergedData.type === HISTORY_CHANGED) {
                this.setState({
                    history: mergedData.payload.history,
                    students: mergedData.payload.students,
                    duration: mergedData.payload.duration,
                    group_name: mergedData.payload.group_name
                })
            }
        })

        moduleInfoStore.defaultReadme("curriculum").catch(errorMessage)

        if (localStorage.token) {
            uiStore.getUserInfo().catch(errorMessage)
        }
    }

    itemClickHandler = (clickEvent, item) => {
        moduleInfoStore.getHistory(clickEvent, this.state.isATeacher).catch(errorMessage)
        const selectedItemInStore = timelineStore.getState().selectedModule

        const isItem = selectedItemInStore && item.running_module_id === selectedItemInStore.running_module_id

        if (!item || isItem) {
            item = null
        } else if (this.state.isATeacher) {
            // should be a teacher otherwise it will return 403 Fobiden
            // if the clicked module is the same on unselect it
            timelineStore.getSelectedModuleInfo(item)
        }

        timelineStore.setState({
            type: SELECTED_MODULE_ID_CHANGED,
            payload: {
                selectedModule: item
            }
        })
    }

    render() {
        // last item being set in store
        const {
            students,
            group_name,
            duration,
            history,
            repoName,
            readme,
            totalWeeks,
            selectedModule,
            infoSelectedModule,
            tab,
            todayMarkerRef
        } = this.state

        let content = <ModuleReadme readme={readme} repoName={repoName} />
        if (tab === "attendance") {
            content = (
                <Attendance
                    repoName={repoName}
                    history={history}
                    duration={duration}
                    group_name={group_name}
                    students={students}
                />
            )
        }

        return (
            <Consumer>{appStore => {
                // collecting the main state from appStore
                const { auth } = appStore.state.main
                const {
                    items, groups, teachers, modules
                } = appStore.state.timeline

                // setting up the teacher role on the whole page
                if (auth.isATeacher && this.state.isATeacher !== auth.isATeacher) this.setState({ isATeacher: auth.isATeacher })
                // setting up the props for the <TimelineComp /> from the whole page
                const initialProps = {
                    itemWidth: 170,
                    rowHeight: 70,
                    isTeacher: auth.isATeacher,
                    timelineItems: items,
                    groups, totalWeeks,
                    selectedModule, infoSelectedModule,
                    itemClickHandler: this.itemClickHandler,
                    allModules: modules,
                    teachers: auth.isATeacher && teachers,
                    todayMarkerRef
                }
                return (
                    <main>
                        <div style={{ marginBottom: "3rem" }}>
                            <TimelineComp {...initialProps} />
                        </div>
                        {
                            auth.isATeacher &&
                            <div className={styles.tabs}>
                                <button
                                    className={styles.ReadmeTab}
                                    onClick={() => this.setState({ tab: "readme" })}
                                >Readme</button>
                                <button
                                    className={styles.AttendanceTab}
                                    onClick={() => this.setState({ tab: "attendance" })}
                                >Attendance</button>
                            </div>
                        }
                        {content}
                    </main>
                )
            }}</Consumer>
        )
    }
}
