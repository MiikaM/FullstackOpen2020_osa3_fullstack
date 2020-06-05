require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())


morgan.token('contents', function (req) {
  return JSON.stringify(req.body)
})

//Logs the request info
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :contents'))

//Front page without the frontend
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

//info pages: counts the documents in the collection
app.get('/info', (req, res) => {
  Person.countDocuments().then(length => {
    const date = new Date()
    res.send(`
        <div>
            <p>Phonebook has info for ${length} people</p>
            <p>${date}</p>
        </div>
    `)
  })
})

//Finds all the persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

//Shows the persons id page
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

//Allows for a deletion of a person based on ID
app.delete('/api/persons/:id', (request, response, next) => {
  console.log('id on', request.param.id)
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//Posts inserted person and checks for validation
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number || body.name.length < 1 || body.number.length < 1) {
    next()
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))

})

//Updates persons number and checks for validation
app.put('/api/persons/:id', (request, response, next) => {
  console.log('id on', request.params)
  console.log('id on', request.body)

  Person.findByIdAndUpdate(request.params.id,
    {
      $set: {
        number: request.body.number
      }
    }
  ).then(() => {
    response.json(request.body)
    response.status(204).end()
  })
    .catch(error => next(error))
})

//If there is nothing inserted but trying to add
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown person' })
}

app.use(unknownEndpoint)


//Handles all errors
const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})