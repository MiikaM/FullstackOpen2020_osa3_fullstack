require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('contents', function (req, res) {
    return JSON.stringify(req.body)
});

app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :contents`))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

// app.get('/info', (req, res) => {
//     const length = persons.length
//     const date = new Date()
//     console.log('length on', length)
//     res.send(`<div>
//     <p>Phonebook has info for ${length} people</p>
//     <p>${date}</p>
//     </div>`)
// })

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    console.log('id on', request.param.id)
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number || body.name.length < 1 || body.number.length < 1) {
        return response.status(400).json({
            error: 'Name and number must be given'
        })
    }

    const personSame = Person.findById(body.name)

    if (personSame.length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})