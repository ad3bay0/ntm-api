const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');
const jwt = require('jsonwebtoken');

const userId =  new mongoose.Types.ObjectId();

const testUser = {
_id:userId,
name:'Test User',
email:'testuser@email.com',
password:'tester01',
token:[{token:jwt.sign({_id:userId},process.env.JWT_TOKEN)}]
};

beforeEach(async ()=>{

await User.deleteMany();

await new User(testUser).save();

});

test('create user with correct credentials',async ()=>{

   const response =  await request(app).post('/users')
    .send({name:"adebayo adeniyan",email:"adebeslick@gmail.com",password:"tester1"})
    .expect(201);

   const user = await User.findById(response.body.user._id);
   expect(user).not.toBeNull();

});

test('should get user profile with correct credentials',async ()=>{

    await request(app).get('/users/profile').set('Authorization',`Bearer ${testUser.token[0].token}`)
    .send()
    .expect(200);

});

test('should DELETE USER',async ()=>{

    await request(app).delete('/users/me').set('Authorization',`Bearer ${testUser.token[0].token}`)
    .send()
    .expect(200);

});