import React from 'react'
import { FlatList, LayoutAnimation, ScrollView, View } from 'react-native'
import PropTypes from 'prop-types'

type Props = {
  data: PropTypes.array.isRequired,
  groupSpacing: PropTypes.number,
  initialGroups: PropTypes.array,
  renderGroup: PropTypes.element.isRequired,
  renderChild: PropTypes.element.isRequired,
  allOpen: PropTypes.bool
};

export class ExpandableListView extends React.Component<Props> {

  constructor (props) {
    super(props)
    this.state = {
      groupStatus: this.initGroupStatus()
    }
    this.closeAll = this.closeAll.bind(this)
    this.toggleStatus = this.toggleStatus.bind(this)
    this.renderItem = this.renderItem.bind(this)
  }

  initGroupStatus () {
    const {initialGroups = [], data = [], allOpen = null} = this.props
    return allOpen === null ? new Array(data.length).fill(false).map((item, index) => {
      return initialGroups.indexOf(index) !== -1
    }) : new Array(data.length).fill(allOpen)
  }

  componentWillUpdate (nextProps, nextState, nextContext) {
    LayoutAnimation.easeInEaseOut()
  }

  closeAll () {
    this.setState({groupStatus: this.state.groupStatus.map(() => false)})
  }

  /**
   * 切换父级状态
   * @param index
   * @param count
   * @param closeOthers
   */
  toggleStatus (index, count, closeOthers) {
    const {initialGroups = [], data = []} = this.props
    let newGroupStatus
    if (data.length !== this.state.groupStatus.length) {
      // supports users passing a array storing those rows they wanna keep open at first
      newGroupStatus = new Array(data.length).fill(false).map((item, index) => {
        return initialGroups.indexOf(index) !== -1
      }).map((status, idx) => {
        return idx !== index ? (closeOthers ? false : status) : !status
      })
    } else {
      // closeOthers is optional. If it is true, all other list items will be closed when opening a list item.
      newGroupStatus = this.state.groupStatus.map((status, idx) => {
        return idx !== index ? (closeOthers ? false : status) : !status
      })
    }

    this.setState({
      groupStatus: newGroupStatus
    })
  }

  render () {
    const {data = [], style} = this.props
    return <FlatList data={data} style={style} extraData={this.state} showsVerticalScrollIndicator={false}
                     keyExtractor={(item, index) => 'fl' + index}
                     renderItem={({item, index}) => this.renderItem(item, index)}/>
  }

  renderItem (groupItem, groupId) {
    const status = this.state.groupStatus[groupId]
    const {data: childData} = groupItem
    const {renderGroup, renderChild, groupSpacing} = this.props

    return (<View key={`group-${groupId}`} style={[groupId && groupSpacing && {marginTop: groupSpacing}]}>
        {renderGroup && renderGroup({
          item: groupItem, groupId, status, toggleStatus: this.toggleStatus.bind(this, groupId, groupItem.length)
        })}
        {childData.length > 0 && status && this.renderChildView(childData, groupId, renderChild, status)}
      </View>
    )
  }

  renderChildView = (childData, groupId, renderChild) => childData.length > 10
    ? <ScrollView bounces={false}>
      {childData.map((item, index) => (
        <View key={`gid:${groupId}-rid:${index}`}>
          {renderChild && renderChild({item, childId: index, groupId})}
        </View>))}
    </ScrollView> : <FlatList data={childData}
                              showsVerticalScrollIndicator={false}
                              keyExtractor={(item, index) => `gid:${groupId}-rid:${index}`}
                              renderItem={({item, index}) => renderChild && renderChild({
                                item,
                                childId: index,
                                groupId
                              })}/>
}