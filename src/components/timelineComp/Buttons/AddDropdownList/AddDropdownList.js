import React, { Component } from 'react'
import Dropdown from '../../../../Helpers/Dropdown/Dropdown'
import classes from './addDropdownList.css'
import AddClassModal from './AddClassModal/AddClassModal'
import AddNewModuleModal from './AddNewModuleModal/AddNewModuleModal'

export default class AddDrodownList extends Component {
  state = {
    classModalIsToggled: false,
    newModuleModalIsToggled: false
  }

  toggleClassModal = e => {
    this.setState({ classModalIsToggled: true })
  }

  closeClassModal = e => {
    this.setState({ classModalIsToggled: false })
  }

  toggleNewModuleModal = e => {
    this.setState({ newModuleModalIsToggled: true })
  }

  closeNewModuleModal = e => {
    this.setState({ newModuleModalIsToggled: false })
  }

  render() {
    return (
      <div>
        <Dropdown
          isToggled={this.props.isToggled}
          className={classes.dropdownWrapper}
        >
          <div>
            <ul>
              <li className={classes.listItem} onClick={this.toggleClassModal}>
                <span>Add a new class</span>
              </li>
              <li
                className={classes.listItem}
                onClick={this.toggleNewModuleModal}
              >
                <span>Add a new module</span>
              </li>
            </ul>
          </div>
        </Dropdown>
        <AddClassModal
          isToggled={this.state.classModalIsToggled}
          closeModal={this.closeClassModal}
        />
        <AddNewModuleModal
          isToggled={this.state.newModuleModalIsToggled}
          closeModal={this.closeNewModuleModal}
        />
      </div>
    )
  }
}
