const Person = require('../models/person')

const initialPersons = [
  {
    name: 'Arto Vihavainen',
    number: '111-32344',
  },
  {
    name: 'Jon Doe',
    number: '123-231212',
  },
]

const nonExistingId = async () => {
  const person = new Person({ name: 'willremovethissoon', number: '123-4543' })
  await person.save()
  await person.deleteOne()

  return person._id.toString()
}

const personsInDb = async () => {
  const persons = await Person.find({})
  return persons.map(person => person.toJSON())
}

module.exports = {
  initialPersons, nonExistingId, personsInDb
}