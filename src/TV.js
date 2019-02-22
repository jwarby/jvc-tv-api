const EventEmitter = require('events')

const fill = require('lodash.fill')
const wol = require('wol')

const keys = require('./keys')
const sendRequest = require('./sendRequest')

const SEND_REQUEST_THROTTLE = 100

class TV extends EventEmitter {
  constructor(udn, options) {
    super()

    this.udn = udn
    this.name = options.name || null
    this.wakeOnLan = options.wakeOnLan
    this.host = options.host
    this.applicationUrl = options.applicationUrl.replace(/^http[s]*:\/\//, '')
    this.power = true

    this._drain = this._drain.bind(this)
    this._queue = []

    // Alias
    this.pressKeys = this.pressKey

    setInterval(this._drain, SEND_REQUEST_THROTTLE)
  }

  _drain() {
    const command = this._queue.shift()

    if (!command) return

    sendRequest(this.host, command)
  }

  turnOn() {
    if (!this.wakeOnLan) {
      throw new TypeError('this device does not support WoL/WoWLAN')
    }

    wol.wake(this.wakeOnLan.mac.toUpperCase(), (err, res) => {
      if (err) {
        throw new Error(`Wakeup error: ${err}`)
      }

      this.power = true
    })
  }

  turnOff() {
    this.pressKey(keys.BUTTON_POWER)
    this.power = false
  }

  togglePower() {
    if (this.power) {
      this.turnOff()
    } else {
      this.turnOn()
    }
  }

  changeVolume(amount) {
    const command = amount < 0
      ? keys.BUTTON_VOL_DOWN
      : keys.BUTTON_VOL_UP

    this.pressKey(...fill(Array(Math.abs(amount)), command))
  }

  pressKey(...commands) {
    this._queue.push(...commands)
  }

  selectSource(number) {
    this.pressKeys(
      keys.BUTTON_SOURCE,
      keys[`BUTTON_${number}`]
    )

    this.emit('source', number)
  }

  set power(newPower) {
    this._power = newPower
    this.emit('power', newPower)
  }

  get power() {
    return this._power
  }
}

Object.assign(TV, keys)

module.exports = TV
