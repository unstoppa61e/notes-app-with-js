#!/usr/bin/env node

const readline = require('readline')
// const { Select } = require('enquirer')

const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("./notes.db")

//TODO: rl のスコープは狭められるのでは？
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const { Select } = require('enquirer');

const prompt = new Select({
  name: 'color',
  message: 'Pick a color',
  choices: [
    { message: 'Red', value: 'hoge' },
    { message: 'Green', value: 'fuga' },
    { message: 'Blue', value: 'peko' }
  ]
});

prompt.run()
  .then(answer => console.log('Answer:', answer))
  .catch(console.error);
