#!/usr/bin/env node

const readline = require('readline')
const { Select } = require('enquirer')

const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("./test.db")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const main = () => {
  const argv = require('minimist')(process.argv.slice(2))
  if (argv.l) {
    console.log('yes')
    rl.close()
  } else if (argv.r) {
    const contents = []
    db.serialize(() => {
      db.each("select * from posts", (err, row) => {
        contents.push(row.body)
      })
      db.close(err => {
        const prompt = new Select({
          name: 'header',
          message: 'Choose a note you want to see:',
          choices: contents.map(content => content.split("/n")[0]),
          footer() {
            // console.log(contents)
            // return '\n' + contents[this.index].value
            return '\n' + contents[this.index]
          }
        })
        prompt.run()
          .then(note => console.log(note))
          .catch(console.error);
        // console.log(choices)
        rl.close()
      })
    })
  } else {
    const content = []
    db.serialize(() => {
      rl.on('line', (line) => {
        content.push(line)
      })
      rl.on('close', () => {
        db.run("insert into posts(body) values(?)", content.join('\n'));
        db.close()
      })
    })
  }
}

main()
