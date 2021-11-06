#!/usr/bin/env node

const readline = require('readline')
const { Select } = require('enquirer')

const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("./notes.db")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const main = () => {
  db.run("create table if not exists notes(content)")

  const argv = require('minimist')(process.argv.slice(2))
  if (argv.l) {
    console.log('yes')
    rl.close()
  } else if (argv.r) {
    const contents = []
    db.serialize(() => {
      db.each("select * from notes", (err, row) => {
        contents.push(row.content)
      })
      db.close(err => {
        const prompt = new Select({
          name: 'header',
          message: 'Choose a note you want to see:',
          choices: contents.map(content => content.split('\n')[0]),
          footer() {
            return '\n' + contents[this.index]
          }
        })
        prompt.run()
          .then(note => console.log(note))
          .catch(console.error);
        rl.close()
      })
    })
  } else {
    const content = []
    rl.on('line', (line) => {
      content.push(line)
    })
    rl.on('close', () => {
      db.serialize(() => {
        db.run("insert into notes(content) values(?)", content.join('\n'));
        db.close()
      })
    })
  }
}

main()
