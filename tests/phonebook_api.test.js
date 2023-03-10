const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')


const api = supertest(app)

const Person = require('../models/person')

beforeEach(async () => {
  await Person.deleteMany({})
  await Person.insertMany(helper.initialPersons)
})

describe('when there is initially some persons saved', () => {
  test('persons are returned as json', async () => {
    await api
      .get('/api/persons')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all persons are returned', async () => {
    const personsFromDb = await helper.personsInDb()
    expect(personsFromDb).toHaveLength(helper.initialPersons.length)
  })

  test('a specific person is in the returned names', async () => {
    const personsFromDb = await helper.personsInDb()
    const names = personsFromDb.map(p => p.name)
    expect(names).toContain('Arto Vihavainen')
  })
})

describe('viewing a specific person', () => {
  test('succeeds with a specific id', async () => {
    const personsAtStart = await helper.personsInDb()

    const personToView = personsAtStart[0]

    const resultPerson = await api
      .get(`/api/persons/${personToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultPerson.body).toEqual(personToView)
  })

  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/persons/${invalidId}`)
      .expect(400)
  })

  test('fails with status code 404 if person does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    console.log(validNonexistingId)
    await api
      .get(`/api/persons/${validNonexistingId}`)
      .expect(404)
  })
})

describe('addition of a new person', () => {
  test('succeeds with valid data', async () => {
    const newPerson = {
      name: 'Test Person',
      number: '123-45654'
    }

    await api
      .post('/api/persons')
      .send(newPerson)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const personsFromDb = await helper.personsInDb()
    expect(personsFromDb).toHaveLength(helper.initialPersons.length + 1)

    const names = personsFromDb.map(p => p.name)
    expect(names).toContain(newPerson.name)
  })

  test('person without name is not created', async () => {
    const newPerson = {
      number: '123-3232'
    }

    await api
      .post('/api/persons')
      .send(newPerson)
      .expect(400)

    const personsFromDb = await helper.personsInDb()
    expect(personsFromDb).toHaveLength(helper.initialPersons.length)
  })

  test('person without number is not created', async () => {
    const newPerson = {
      name: 'Test'
    }

    await api
      .post('/api/persons')
      .send(newPerson)
      .expect(400)

    const personsFromDb = await helper.personsInDb()
    expect(personsFromDb).toHaveLength(helper.initialPersons.length)
  })
})

describe('deletion of a person', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    console.log('this is executed')
    const personsAtStart = await helper.personsInDb()
    const personToDelete = personsAtStart[0]

    await api
      .delete(`/api/persons/${personToDelete.id}`)
      .expect(204)

    const personsAtEnd = await helper.personsInDb()
    expect(personsAtEnd).toHaveLength(helper.initialPersons.length - 1)

    const names = personsAtEnd.map(p => p.names)
    expect(names).not.toContain(personToDelete.name)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

