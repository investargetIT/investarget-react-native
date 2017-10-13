import Immutable from 'seamless-immutable'

const msgTpl = {
    base: {
      error: false,
      errorCode: '',
      errorText: '',
      // status 为空将被当做服务端的数据处理，处理成sent
      status: 'sent', // [sending, sent ,fail, read]
      id: '',
      // from 不能删除，决定了房间id
      from: '',
      to: '',
      toJid: '',
      time: '',
      type: '', // chat / groupchat
      body: {},
      ext: {},
      bySelf: false,
    },
    txt: {
      type: 'txt',
      msg: ''
    },
    img: {
      type: 'img',
      file_length: 0,
      filename: '',
      filetype: '',
      length: 0,
      secret: '',
      width: 0,
      height: 0,
      url: '',
      thumb: '',
      thumb_secret: ''
    }
  }

  function copy(message, tpl) {
    let obj = {}
    Object.keys(tpl).forEach((v) => {
      obj[v] = message[v] || tpl[v]
    })
    return obj
  }

const initialState = Immutable({
    byId: {},
    chat: {},
    groupChat: {},
    extra: {}
  })

  // 统一消息格式：服务端
function parseFromServer(message = {}, bodyType) {
    let ext = message.ext || {}
    let obj = copy(message, msgTpl.base)
    // body 包含：所有message实体信息都放到body当中，与base区分开
    // body 包含：ext 存放用户自定义信息，比如图片大小、宽高等
    let body = copy(message, msgTpl[bodyType])
    switch (bodyType) {
      case 'txt':
        return {
          ...obj, status: 'sent',
          body: {
            ...body, ...ext, msg: message.data, type: 'txt',
          }
        }
        break;
      case 'img':
        return {
          ...obj, status: 'sent',
          body: {
            ...body, ...ext, type: 'img'
          }
        }
        break;
    }
  }

const easemob = (state = initialState, action) => {
    let nextState
    switch (action.type) {
        case 'addMessage':
            const {message, bodyType = 'txt'} = action
            console.log('message', message);
            !message.status && (message = parseFromServer(message, bodyType))
            const {username = ''} = state.user || {}
            const {type, id, to, status} = message
            // 消息来源：没有from默认即为当前用户发送
            const from = message.from || username
            // 当前用户：标识为自己发送
            const bySelf = from == username
            // 房间id：自己发送或者不是单聊的时候，是接收人的ID， 否则是发送人的ID
            const chatId = bySelf || type !== 'chat' ? to : from
            state = state.setIn(['byId', id], {
              ...message,
              bySelf,
              time: +new Date(),
              status: 'sent',
            })
            const chatData = state[type] && state[type][chatId] ? state[type][chatId].asMutable() : []
            chatData.push(id)
          
            state = state
              .setIn([type, chatId], chatData)
            nextState = state
            console.log('nextState', nextState);
            break
        default:
            break
    }

    return nextState || state;
}

export default easemob
