const http = require('http')

const xml = require('xml')

module.exports = (hostAndPort, code) => {
  const payload = xml({
    remote: [{
      key: {
        _attr: {
          code
        }
      }
    }]
  }, {
    declaration: true
  }).replace(/"/g, '\'')

  const [host, port] = hostAndPort.split(/:(\d+$)/)

  const req = http.request({
    host: host.replace(/http[s]*:\/\//, ''),
    port: parseInt(port),
    path: '/apps/SmartCenter',
    method: 'POST',
    headers: {
      'Content-Length': Buffer.byteLength(payload),
      'Content-Type': 'text/plain; charset=ISO-8859-1',
      'Connection': 'keep-alive'
    }
  })

  req.write(payload)

  req.end()
}
