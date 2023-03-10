const { query } = require('express')
const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/', async (request, response) => {
  const persons = await Person.find({})
  response.json(persons)
})

personsRouter.get('/:id', async (request, response, next) => {
  const person = await Person.findById(request.params.id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

personsRouter.delete('/:id', async (request, response, next) => {
  await Person.findByIdAndRemove(request.params.id)
  response.status(204).end()

})

personsRouter.post('/', async (request, response, next) => {
  const body = request.body
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  const savedPerson = await person.save()
  response.status(201).json(savedPerson)
})

personsRouter.put('/:id', async (request, response, next) => {
  const { name, number } = request.body
  const updatedPerson = await Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: query }
  )
  response.json(updatedPerson)

})

module.exports = personsRouter
