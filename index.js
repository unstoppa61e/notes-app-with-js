#!/usr/bin/env node

const { Select } = require('enquirer')
const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("./notes.db")
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const main = () => {
  db.run("create table if not exists notes(id INTEGER PRIMARY KEY, content TEXT)")
  const argv = require('minimist')(process.argv.slice(2))
  if (argv.l) {
    // 前のバージョン
    const contents = []
    db.serialize(() => {
      db.each("select * from notes", (err, row) => {
        contents.push(row.content)
      })
      db.close(err => {
        console.log(contents.map(content => content.split('\n')[0]).join('\n'))
        rl.close()
      })
    })
    rl.close()
  } else if (argv.d) {
      db.all("select * from notes", (err, rows) => {
        const notes = rows.map(row => {
          return { id: row.id, content: row.content }
        })
        const prompt = new Select({
          name: 'header',
          message: 'Choose a note you want to delete:\n',
          choices: notes.map(note => {
              return {message: note.content.split('\n')[0], value: note.id}
          }),
          footer() {
            return '\n' + notes.map(note => note.content)[this.index]
          }
        })
        prompt.run()
          .then(answer => {
            db.run('DELETE FROM notes WHERE id = ?', answer, err => {
              if (err) {
                return console.error(err.message);
              }
            })
          })
          .catch(console.error);
      })
  } else if (argv.r) {
      db.all("select * from notes", (err, rows) => {
        const contents = rows.map(row => row.content)
        const prompt = new Select({
          name: 'header',
          message: 'Choose a note you want to see:\n',
          choices: contents.map(
            content => {
              return {message: content.split('\n')[0], value: content}
            }
          ),
          footer() {
            return '\n' + contents[this.index]
          }
        })
        prompt.run()
          .catch(console.error);
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
