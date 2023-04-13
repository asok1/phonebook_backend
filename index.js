const http = require('http')
const express = require('express')
const cors = require('cors')
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const app = express()
app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(requestLogger)

const Person = require('./models/person')

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    // response.json(persons)
    Person.find({})
    .then(persons => {
        response.json(persons)
        // mongoose.connection.close()
    })
})

app.get('/info', async (request, response) => {
    var currentdate = new Date(); 
    const phonebookSize = await Person.countDocuments()
    let htmlResponse = `<div>Phonebook has info for ${phonebookSize} people</div>`
    
    var datetime = "Request received on: " + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " at "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    htmlResponse += `<div>${datetime}</div>`
    console.log(htmlResponse)
    response.send(htmlResponse)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).send("The supplied ID does not exist")
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        console.log(result)
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body

    Person.findByIdAndUpdate(
        request.params.id, 
        {name, number}, 
        {new:true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })
    
    person.save()
    .then(result => {
        console.log('person saved!')
        // mongoose.connection.close()
        response.json(person)
    })
    .catch(error => {
        next(error)
    })

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if(error.name === 'ValidationError') {
        return response.status(400).json({error:error.message})
    }

    next(error)
}

// has to be the last loaded middleware
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
