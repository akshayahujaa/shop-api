import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app.js';

let mongoServer;

beforeAll(async () => {
  // Spin up an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set test JWT secret keys
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_which_is_long_enough';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_which_is_long_enough';
  process.env.NODE_ENV = 'test';

  // Disconnect from existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Connect mongoose to in-memory DB
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication API Integration Tests', () => {
  const registerPayload = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password1!',
    phone: '1234567890',
  };

  it('should fail registration if fields are missing (Validation test)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Jane' }); // missing email/password

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validation failed');
  });

  it('should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.accessToken).toBeDefined();
    
    // Check if refresh token cookie is set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('refreshToken');
  });

  it('should fail registration if email already exists', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exists');
  });

  it('should successfully login user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should fail login if password is incorrect', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: registerPayload.email,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
