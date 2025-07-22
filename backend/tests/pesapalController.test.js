import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import sinon from 'sinon';
import axios from 'axios';
import * as pesapalController from '../controllers/pesapalController.js';
import Order from '../models/Order.js';

const app = express();
app.use(bodyParser.json());

// Mock routes for testing
app.post('/pesapal', pesapalController.initiatePesapalPayment);
app.post('/pesapal/callback', pesapalController.handlePesapalCallback);
app.post('/pesapal/mock-callback', pesapalController.mockPesapalCallback);
app.get('/pesapal/status/:orderId', pesapalController.checkPesapalPaymentStatus);

describe('Pesapal Controller', () => {
  let orderFindByIdStub;
  let axiosGetStub;

  beforeEach(() => {
    orderFindByIdStub = sinon.stub(Order, 'findById');
    axiosGetStub = sinon.stub(axios, 'get');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('initiatePesapalPayment', () => {
    it('should return 500 if environment variables are missing', async () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.PESAPAL_CONSUMER_KEY;
      delete process.env.PESAPAL_CONSUMER_SECRET;
      delete process.env.PESAPAL_CALLBACK_URL;

      const res = await request(app).post('/pesapal').send({ orderId: '123' });
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Missing environment variables/);

      process.env = originalEnv;
    });

    it('should return 400 if orderId is missing', async () => {
      process.env.PESAPAL_CONSUMER_KEY = 'key';
      process.env.PESAPAL_CONSUMER_SECRET = 'secret';
      process.env.PESAPAL_CALLBACK_URL = 'callback';

      const res = await request(app).post('/pesapal').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Order ID is required');
    });

    it('should return 404 if order not found', async () => {
      orderFindByIdStub.resolves(null);

      const res = await request(app).post('/pesapal').send({ orderId: '123' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Order not found');
    });

    it('should return 400 if order not payable', async () => {
      orderFindByIdStub.resolves({ status: 'Completed' });

      const res = await request(app).post('/pesapal').send({ orderId: '123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Order is not in a payable state');
    });

    it('should return paymentUrl on success', async () => {
      const mockOrder = {
        _id: '123',
        status: 'Awaiting Payment',
        items: [],
        total: 100,
      };
      orderFindByIdStub.resolves(mockOrder);

      const res = await request(app).post('/pesapal').send({ orderId: '123' });
      expect(res.status).toBe(200);
      expect(res.body.paymentUrl).toBeDefined();
    });
  });

  describe('handlePesapalCallback', () => {
    it('should return 400 if required query params missing', async () => {
      const res = await request(app).post('/pesapal/callback').query({});
      expect(res.status).toBe(400);
    });

    it('should update order status based on payment status', async () => {
      const mockOrder = {
        _id: '123',
        save: sinon.stub().resolves(),
      };
      orderFindByIdStub.resolves(mockOrder);
      axiosGetStub.resolves({ data: 'COMPLETED' });

      const res = await request(app).post('/pesapal/callback').query({
        pesapal_merchant_reference: '123',
        pesapal_transaction_tracking_id: 'abc',
      });
      expect(res.status).toBe(200);
      sinon.assert.calledWith(mockOrder.save);
      expect(mockOrder.status).toBe('Paid');
    });
  });

  describe('mockPesapalCallback', () => {
    it('should return 400 if orderId missing', async () => {
      const res = await request(app).post('/pesapal/mock-callback').send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 if order not found', async () => {
      orderFindByIdStub.resolves(null);
      const res = await request(app).post('/pesapal/mock-callback').send({ orderId: '123' });
      expect(res.status).toBe(404);
    });

    it('should update order status and return message', async () => {
      const mockOrder = {
        _id: '123',
        save: sinon.stub().resolves(),
      };
      orderFindByIdStub.resolves(mockOrder);
      const res = await request(app).post('/pesapal/mock-callback').send({ orderId: '123', status: 'Paid' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Order status updated to Paid');
      sinon.assert.calledWith(mockOrder.save);
    });
  });

  describe('checkPesapalPaymentStatus', () => {
    it('should return 404 if order not found', async () => {
      orderFindByIdStub.resolves(null);
      const res = await request(app).get('/pesapal/status/123');
      expect(res.status).toBe(404);
    });

    it('should return order status', async () => {
      const mockOrder = { status: 'Paid' };
      orderFindByIdStub.resolves(mockOrder);
      const res = await request(app).get('/pesapal/status/123');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Paid');
    });
  });
});