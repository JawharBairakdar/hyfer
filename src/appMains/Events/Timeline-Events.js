import { appStore } from "../../Provider";
import { errorMessage, success } from "../../notify";
import {
    moduleInfoStore,
    timelineStore,
    SELECTED_MODULE_ID_CHANGED
} from "../../store";


appStore.on('Timeline-TaskComp-Click-Module', function (clickEvent, item) {
    const { hasRole, isATeacher } = appStore.state.main.auth
    moduleInfoStore.getHistory(clickEvent, isATeacher).catch(errorMessage)
    const selectedItemInStore = timelineStore.getState().selectedModule

    const isItem = selectedItemInStore && item.running_module_id === selectedItemInStore.running_module_id

    if (!item || isItem) {
        item = null
    }
    if (hasRole) {
        // should be a teacher or a student otherwise it will return 403 Fobiden
        // if the clicked module is the same on unselect it
        timelineStore.getSelectedModuleInfo(item)
    }

    timelineStore.setState({
        type: SELECTED_MODULE_ID_CHANGED,
        payload: {
            selectedModule: item
        }
    })
})

appStore.on('Timeline-AssignTeacherModal-Click-Save', function (selectedModule, teacher1, teacher2) {
    const firstTeacher = teacher1 ? teacher1 : appStore.state.timeline.infoSelectedModule.teacher1_id
    const secondTeacher = teacher2 ? teacher2 : appStore.state.timeline.infoSelectedModule.teacher2_id
    timelineStore
        .handleAssignTeachers(selectedModule, firstTeacher, secondTeacher)
        .then(() => {
            if (teacher1)
                this.setState({
                    teacher1: firstTeacher,
                    selectedTeacher1: firstTeacher,
                    teacher2: secondTeacher,
                    selectedTeacher2: secondTeacher,
                    local_update: true
                })
        })
        .then(() => {
            const both = teacher1 && teacher2
            if (teacher1 || teacher2)
                success(`Success Assigning teacher${(both && 's') || ''}.`)
        })
        .catch(errorMessage)
})