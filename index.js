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
  }
  if (argv.r) {
    const choices = []
    db.serialize(() => {
      db.each("select * from posts", (err, row) => {
        choices.push(row.body)
      })
      db.close(err => {
        const prompt = new Select({
          name: 'first_row',
          message: 'Choose a note you want to see:',
          choices: choices
        })
        prompt.run()
          .then(note => console.log(note))
          .catch(console.error);
        console.log(choices)
        rl.close()
      })
    })
  }
}

main()
