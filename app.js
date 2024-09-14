const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const startServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server started')
    })
  } catch (e) {
    console.log(`got error of ${e.messege}`)
    process.exit(1)
  }
}

startServer()

const movieObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const director = direct => {
  return {
    directorId: direct.director_id,
    directorName: direct.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const api1 = `select
  movie_name
  from
  Movie`
  let data1 = await db.all(api1)
  response.send(data1.map(i => ({movieName: i.movie_name})))
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const api2 = `insert into
  movie (director_id,Movie_name,lead_actor)
  values
  ('${directorId}',
  '${movieName}',
  '${leadActor}')`
  let data2 = await db.run(api2)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const api3 = `select
  *
  from
  movie
  where
  movie_id=${movieId};`
  const data3 = await db.get(api3)
  response.send(movieObject(data3))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetials = request.body
  const {directorId, movieName, leadActor} = movieDetials
  const api4 = `update
  movie
  set
  director_id='${directorId}',
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  where movie_id='${movieId}';`
  const data4 = await db.run(api4)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const api5 = `delete
  from
  movie
  where
  movie_id=${movieId};`
  const data5 = await db.run(api5)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const api6 = `select
  *
  from
  director;`
  const data6 = await db.all(api6)
  response.send(data6.map(i => director(i)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const api7 = `select
  movie_name 
  from
  movie
  where
  director_id='${directorId}';`
  const data7 = await db.all(api7)
  response.send(data7.map(i => ({movieName: i.movie_name})))
})

module.exports = app
