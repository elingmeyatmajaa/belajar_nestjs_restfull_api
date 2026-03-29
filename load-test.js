import autocannon from 'autocannon'
import fs from 'fs'

const tokens = fs.readFileSync('tokens.txt', 'utf-8')
  .split('\n')
  .filter(Boolean)

function randomToken() {
  return tokens[Math.floor(Math.random() * tokens.length)]
}

autocannon({
  url: 'http://localhost:3000/api/users/current',
  connections: 100,
  duration: 20,
  setupClient: (client) => {
    client.setHeaders({
      Authorization: randomToken()
    })
  }
}, console.log)
