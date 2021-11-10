#!/usr/bin/env node

'use strict'

{
  const { Select } = require('enquirer')

  class NotesApplication {
    constructor () {
      const sqlite3 = require('sqlite3').verbose()
      this.db = new sqlite3.Database('./notes.db')
      this.db.run('create table if not exists notes(id integer primary key, content text)')
      this.rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
    }

    start () {
      const option = require('minimist')(process.argv.slice(2))
      if (option.l) {
        this.list()
      } else if (option.d) {
        this.delete()
      } else if (option.r) {
        this.read()
      } else {
        this.add()
      }
    }

    list () {
      this.db.all('select content from notes', (err, rows) => {
        if (err) {
          return console.error(err.message)
        }
        const headers = rows.map(row => this.getFirstLine(row.content))
        headers.forEach(header => console.log(header))
      })
      this.rl.close()
    }

    delete () {
      this.db.all('select * from notes', (err, rows) => {
        if (err) {
          return console.error(err.message)
        }
        if (!rows.length) {
          this.rl.close()
          return
        }
        const notes = rows.map(row => {
          return { id: row.id, content: row.content }
        })
        const prompt = new Select({
          name: 'noteToDelete',
          message: 'Choose a note you want to delete:\n',
          choices: notes.map(note => {
            return {
              message: this.getFirstLine(note.content),
              value: note.id
            }
          }),
          footer () {
            const contents = notes.map(note => note.content)
            return '\n' + contents[this.index]
          }
        })
        prompt.run()
          .then(answer => {
            this.db.run('delete from notes where id = ?', answer, err => {
              if (err) {
                return console.error(err.message)
              }
            })
          })
          .catch(console.error)
      })
    }

    read () {
      this.db.all('select content from notes', (err, rows) => {
        if (err) {
          return console.error(err.message)
        }
        if (!rows.length) {
          this.rl.close()
          return
        }
        const contents = rows.map(row => row.content)
        const prompt = new Select({
          name: 'noteToSee',
          message: 'Choose a note you want to see:\n',
          choices: contents.map(content => {
            return { message: this.getFirstLine(content), value: content }
          }),
          footer () {
            return '\n' + contents[this.index]
          }
        })
        prompt.run()
          .catch(console.error)
      })
    }

    add () {
      const content = []
      this.rl.on('line', (line) => {
        content.push(line)
      })
      this.rl.on('close', () => {
        this.db.serialize(() => {
          this.db.run('insert into notes(content) values(?)', content.join('\n'))
          this.db.close()
        })
      })
    }

    getFirstLine (text) {
      return text.split('\n')[0]
    }
  }

  new NotesApplication().start()
}
