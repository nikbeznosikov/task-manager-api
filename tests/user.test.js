const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {
  userOneId,
  userOne,
  setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('should sign up a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'Nikita test',
    email: 'nikitatest@example.com',
    password: 'Nikita39',
  }).expect(201);

  // Assert that the databse was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Nikita test',
      email: 'nikitatest@example.com',
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe('Nikita39');
});

test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password,
  }).expect(200);

  const user = await User.findById(response.body.user._id);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexisting user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: 'asdfasdfasd',
  }).expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unatuh user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test('Should not delete account is user unauth', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Shoould upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'New name' })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual('New name');
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ location: 'location' })
    .expect(400);
});