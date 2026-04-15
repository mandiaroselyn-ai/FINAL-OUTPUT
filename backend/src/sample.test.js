import * as userController from './controllers/userController.js';
import * as announcementController from './controllers/announcementController.js';
import * as dtrLogController from './controllers/dtrLogController.js';
import * as holidayController from './controllers/holidayController.js';
import * as leaveController from './controllers/leaveController.js';
import * as travelOrderController from './controllers/travelOrderController.js';
import * as auth from './middleware/auth.js';
import User from './models/User.js';
import announcementModel from './models/announcementModel.js';
import dtrLogModel from './models/dtrLogModel.js';
import holidayModel from './models/holidayModel.js';
import leaveModel from './models/leaveModel.js';
import travelOrderModel from './models/travelOrderModel.js';
import userRoutes from './routes/userRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import dtrLogRoutes from './routes/dtrLogRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import travelOrderRoutes from './routes/travelOrderRoutes.js';
import jwt from 'jsonwebtoken';

// ==================== HELPER ====================
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ==================== AUTH MIDDLEWARE ====================
describe('Middleware - auth', () => {
  test('auth exists', () => expect(auth).toBeDefined());

  test('authenticateJWT - no token returns 401', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    auth.authenticateJWT(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('authenticateJWT - valid token calls next', () => {
    process.env.JWT_SECRET = 'testsecret';
    const token = jwt.sign({ userId: '123', role: 'employee' }, 'testsecret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    auth.authenticateJWT(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('authenticateJWT - invalid token returns 401', () => {
    process.env.JWT_SECRET = 'testsecret';
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = mockRes();
    const next = jest.fn();
    auth.authenticateJWT(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('authorizeRoles - correct role calls next', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();
    auth.authorizeRoles('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('authorizeRoles - wrong role returns 403', () => {
    const req = { user: { role: 'employee' } };
    const res = mockRes();
    const next = jest.fn();
    auth.authorizeRoles('admin')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ==================== ANNOUNCEMENT CONTROLLER ====================
describe('Announcement Controller', () => {
  test('announcementController exists', () => expect(announcementController).toBeDefined());

  test('getAllAnnouncements - success', async () => {
    const req = {};
    const res = mockRes();
    announcementModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ title: 'Test' }])
    });
    await announcementController.getAllAnnouncements(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('getAllAnnouncements - error', async () => {
    const req = {};
    const res = mockRes();
    announcementModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB error'))
    });
    await announcementController.getAllAnnouncements(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('createAnnouncement - success', async () => {
    const req = { body: { title: 'New', content: 'Test' } };
    const res = mockRes();
    announcementModel.prototype.save = jest.fn().mockResolvedValue({});
    await announcementController.createAnnouncement(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('deleteAnnouncement - success', async () => {
    const req = { params: { announcementId: '123' } };
    const res = mockRes();
    announcementModel.findByIdAndDelete = jest.fn().mockResolvedValue({});
    await announcementController.deleteAnnouncement(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});

// ==================== USER CONTROLLER ====================
describe('User Controller', () => {
  test('userController exists', () => expect(userController).toBeDefined());

  test('getAllUsers - success', async () => {
    const req = {};
    const res = mockRes();
    User.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ name: 'Test User' }])
      })
    });
    await userController.getAllUsers(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test('deleteUser - success', async () => {
    const req = { params: { id: '123' } };
    const res = mockRes();
    User.findByIdAndDelete = jest.fn().mockResolvedValue({});
    await userController.deleteUser(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
  });

  test('getProfile - user not found', async () => {
    const req = { user: { userId: '123' } };
    const res = mockRes();
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });
    await userController.getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ==================== OTHER CONTROLLERS ====================
describe('Other Controllers', () => {
  test('dtrLogController exists', () => expect(dtrLogController).toBeDefined());
  test('holidayController exists', () => expect(holidayController).toBeDefined());
  test('leaveController exists', () => expect(leaveController).toBeDefined());
  test('travelOrderController exists', () => expect(travelOrderController).toBeDefined());
});

// ==================== MODELS ====================
describe('Models', () => {
  test('User model exists', () => expect(User).toBeDefined());
  test('announcementModel exists', () => expect(announcementModel).toBeDefined());
  test('dtrLogModel exists', () => expect(dtrLogModel).toBeDefined());
  test('holidayModel exists', () => expect(holidayModel).toBeDefined());
  test('leaveModel exists', () => expect(leaveModel).toBeDefined());
  test('travelOrderModel exists', () => expect(travelOrderModel).toBeDefined());
});

// ==================== ROUTES ====================
describe('Routes', () => {
  test('userRoutes exists', () => expect(userRoutes).toBeDefined());
  test('announcementRoutes exists', () => expect(announcementRoutes).toBeDefined());
  test('dtrLogRoutes exists', () => expect(dtrLogRoutes).toBeDefined());
  test('holidayRoutes exists', () => expect(holidayRoutes).toBeDefined());
  test('leaveRoutes exists', () => expect(leaveRoutes).toBeDefined());
  test('travelOrderRoutes exists', () => expect(travelOrderRoutes).toBeDefined());
});