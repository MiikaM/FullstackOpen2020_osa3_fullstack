const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

morgan.token('contents', function (req, res) {
    return JSON.stringify(req.body)
});


app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :contents`))


let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
    const length = persons.length
    const date = new Date()
    console.log('length on', length)
    res.send(`<div>
    <p>Phonebook has info for ${length} people</p>
    <p>${date}</p>
    </div>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    console.log(id)
    const note = persons.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number || body.name.length < 1 || body.number.length < 1) {
        return response.status(400).json({
            error: 'Name and number must be given'
        })
    }

    const personSame = persons.filter(person => person.name === body.name)

    if (personSame.length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const note = {
        name: body.name,
        number: body.number,
        id: generateId
    }

    persons = persons.concat(note)

    response.json(note)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})