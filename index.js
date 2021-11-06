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
    const headers = []
    db.serialize(() => {
      db.each("select * from posts", (err, row) => {
        headers.push(row.body)
      })
      db.close(err => {
        const prompt = new Select({
          name: 'header',
          message: 'Choose a note you want to see:',
          choices: headers.map(content => content.split('/n')[0]),
          footer() {
            console.log(headers)
            // return '\n' + headers[this.index].value
            // return '\n' + headers[this.index]
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
    rl.on('line', (line) => {　//line変数には標準入力から渡された一行のデータが格納されている
      db.serialize(() => {
        console.log(line)
        db.run("insert into posts(body) values(?)", line);
        db.close(err => {
          rl.close()
        })
      })
    });
    // rl.on('line', (line) => {　//line変数には標準入力から渡された一行のデータが格納されている
    //   db.serialize(() => {
    //     console.log(line)
    //     db.run("insert into posts(body) values(?)", line);
    //     db.close(err => {
    //       rl.close()
    //     })
    //   })
    // });
  }
}

main()
