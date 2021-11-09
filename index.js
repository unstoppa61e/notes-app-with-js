#!/usr/bin/env node

const readline = require('readline')
const { Select } = require('enquirer')

const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("./notes.db")

//TODO: rl のスコープは狭められるのでは？
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function hoge() {
  console.log('hoge')
}

const main = () => {
  db.run("create table if not exists notes(content)")

  const argv = require('minimist')(process.argv.slice(2))
  if (argv.l) {
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


















    // 前のバージョン
    // db.serialize(() => {
    //   db.all("select * from notes", (err, rows) => {
    //     const contents = rows.map(row => row.content)
    //     const prompt = new Select({
    //       name: 'header',
    //       message: 'Choose a note you want to delete:',
    //       choices: contents.map(content => {
    //         // const obj = {}
    //         // return { message: content.split('\n')[0], value: 'hoge'}
    //         content.split('\n')[0]
    //       //   obj[content] = content
    //       //   message: content.split('\n')[0], value: 'hoge'
    //       }),
    //       // footer() {
    //       //   return '\n' + contents[this.index]
    //       // }
    //     })
    //     prompt.run()
    //       .then(answer => console.log(answer))
    //       .catch(console.error);
    //     // rl.close()
    //   })
    //   db.close()
    // })







    // const promise = new Promise(resolve => {
    //   const contents = []
    //   db.each("select * from notes", (err, row) => {
    //     contents.push(row.content)
    //   })
    //   resolve(contents)
    // })
    // promise.then(contents => {
    //   const prompt = new Select({
    //     name: 'header',
    //     message: 'Choose a note you want to delete:',
    //     choices: contents.map(content => content.split('\n')[0])
    //   })
    //   prompt.run()
    //     .then(note => console.log(note))
    //     .catch(console.error);
    //   rl.close()
    // })
    // Promise.resolve(() => {
    //   const contents = []
    //   db.each("select * from notes", (err, row) => {
    //     contents.push(row.content)
    //   })
    //   return contents
    // }).then(contents => {
    //   const prompt = new Select({
    //     name: 'header',
    //     message: 'Choose a note you want to delete:',
    //     choices: contents.map(content => content.split('\n')[0])
    //   })
    //   prompt.run()
    //     .then(note => console.log(note))
    //     .catch(console.error);
    //   rl.close()
    //   db.serialize(() => {
    //   Promise.resolve(() => {
    //     const contents = []
    //     db.each("select * from notes", (err, row) => {
    //       contents.push(row.content)
    //     })
    //     return contents
    //   }).then(contents => {
    //     const prompt = new Select({
    //       name: 'header',
    //       message: 'Choose a note you want to delete:',
    //       choices: contents.map(content => content.split('\n')[0])
    //       // result () {
    //       //   return this.focused.content
    //       // }
    //     })
    //     prompt.run()
    //       .then(note => console.log(note))
    //       .catch(console.error);
    //     rl.close()
    //   }).then(() => {
    //     db.close()
    //
    //   })
    //   db.close(err => {
    //     const prompt = new Select({
    //       name: 'header',
    //       message: 'Choose a note you want to delete:',
    //       choices: contents.map(content => content.split('\n')[0]),
    //       // result () {
    //       //   return this.focused.content
    //       // }
    //     })
    //     prompt.run()
    //       .then(note => console.log(note))
    //       .catch(console.error);
    //     rl.close()
    //   })
    // })
  } else if (argv.r) {
    db.serialize(() => {
      db.all("select * from notes", (err, rows) => {
        const contents = rows.map(row => row.content)
        const prompt = new Select({
          name: 'header',
          message: 'Choose a note you want to see:',
          choices: contents.map(content => content.split('\n')[0]),
          footer() {
            return '\n' + contents[this.index]
          }
        })
        prompt.run()
          .catch(console.error);
        rl.close()
      })
      db.close()
    })

    // 前のバージョン
    // const contents = []
    // db.serialize(() => {
    //   db.each("select * from notes", (err, row) => {
    //     contents.push(row.content)
    //   })
    //   db.close(err => {
    //     const prompt = new Select({
    //       name: 'header',
    //       message: 'Choose a note you want to see:',
    //       choices: contents.map(content => content.split('\n')[0]),
    //       footer() {
    //         return '\n' + contents[this.index]
    //       }
    //     })
    //     prompt.run()
    //       .then(note => console.log(note))
    //       .catch(console.error);
    //     rl.close()
    //   })
    // })
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
