

// setting up the Store Constructor
// - Store: is a noraml Constructor 
// -- and it's spically to make a huge
// -- Object on the whole Application level
const Store = function () {
    const state = {}
    const events = {}

    return {
        get state() { return state },
        set: function (item) {
            if (typeof item === 'object') {
                const keys = Object.keys(item)
                keys.forEach(key => {
                    state[key] = item[key]
                })
            } else if (typeof item === 'function') {
                const latestState = item(this.state)
                this.set(latestState)
            }
        },
        get events() { return events },
        on: function (event, callback) {
            events[event] = events[event] || []
            events[event].push(callback)
        },
        emit: function (event, objectReference = null, ...args) {
            if (events[event] && events[event].length) {
                events[event].forEach(callback => {
                    callback.apply(objectReference, args)
                })
            }
            return { clearEvent: this.omit.bind(this, event) }
        },
        omit: function (event) {
            const originEvents = events[event]
            if (originEvents) {
                originEvents.forEach((Func, i) => {
                    const eventFunc_string = Func.toString()
                    const originFunc_string = originEvents[i].toString()
                    if (eventFunc_string === originFunc_string) {
                        originEvents.splice(i, 1)
                    }
                })
            }
        }
    }
}

// exporting a Store Inctence for any other use
export const appStore = new Store()
