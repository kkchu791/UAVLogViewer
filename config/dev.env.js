'use strict'
const { merge } = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ION_ACCESS_TOKEN: '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjY2U0YmYyZS04NTRjLTQ1N2UtYTEyMS0wMTUwMDllOTA1YWIiLCJpZCI6MzA1MzgzLCJpYXQiOjE3NDc5Mzg3MzR9.jRP1mJknonTz3Govl0ipJVxVClohP3Y0ZCxzfL7aZwo"'
})