const EventEmitter = require('events')

const { Client } = require('node-ssdp')
const get = require('lodash.get')
const xmlParser = require('fast-xml-parser')
const request = require('superagent')

const TV = require('./TV')

const ST_URN = 'urn:dial-multiscreen-org:service:dial:1'
const TVDEVICE_URN = 'urn:schemas-upnp-org:device:tvdevice:1'
const WAKEUP_HEADER_REGEX = /MAC=(.*?);Timeout=(.*)/

module.exports = class Search extends EventEmitter {
  constructor() {
    super()

    this._processedAddresses = []

    const client = this._client = new Client()

    client.on('response', this._handleResponse.bind(this))
  }

  start() {
    this._client.search(ST_URN)
  }

  _handleResponse(headers, statusCode, rinfo) {
    if (statusCode !== 200) return

    if (!headers.LOCATION) return

    if (this._processedAddresses.includes(rinfo.address)) return

    this._processedAddresses.push(rinfo.address)

    request
      .get(headers.LOCATION)
      .then(res => {
        return [res.headers, xmlParser.parse(res.body.toString())]
      }).then(([resHeaders, xml]) => {
        if (get(xml, 'root.device.deviceType') !== TVDEVICE_URN) return

        // @todo check if /apps/SmartCenter exists at Application-Url

        const [, mac, timeout] = headers.WAKEUP
          ? headers.WAKEUP.match(WAKEUP_HEADER_REGEX)
          : []

        this.emit('tv', new TV(get(xml, 'root.device.UDN'), {
          name: get(
            xml,
            'root.locale.name',
            get(xml, 'root.device.friendlyName', null)
          ),
          wakeOnLan: mac && timeout
            ? { mac, timeout: parseInt(timeout) }
            : null,
          host: resHeaders['application-url'].match(/.*?:\d+/)[0],
          applicationUrl: resHeaders['application-url']
        }))
      })
  }
}
