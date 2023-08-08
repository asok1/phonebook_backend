const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const password = process.env.mongoPwd
const url = `mongodb+srv://sok:${password}@phonebook.aoxivbo.mongodb.net/phonebookApp?retryWrites=true&w=majority`

console.log(process.env)
// const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: function(v) {
                return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im
                    .test(v)

            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: true,
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)