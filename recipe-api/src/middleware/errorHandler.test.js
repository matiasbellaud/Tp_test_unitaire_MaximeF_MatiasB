const errorHandler = require('./errorHandler.js');

describe('errorHandler middleware', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // Mock console.error pour éviter les logs dans les tests (aide de l'ia pour éviter les logs dans les tests)
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('retourne le statut personnalisé et le message d\'erreur', () => {
    const err = new Error('Test error 400');
    err.status = 400;
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Test error 400',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 500 par défaut si le statut n\'est pas défini et le message d\'erreur personnalisé', () => {
    const err = new Error('Test error 500');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Test error 500',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne le message par défaut si err.message est absent', () => {
    const err = { status: 400, stack: 'stack trace' };
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('accepte un status inconnu et un message non standard', () => {
    const err = { status: 999, message: ['bad', 'request'], stack: 'stack trace' };
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(999);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: ['bad', 'request'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 500 si err.status est 0 ou null et message par défaut si err.message est null', () => {
    const err = { status: 0, message: null, stack: 'stack trace' };
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('logge err.stack via console.error', () => {
    const err = new Error('Test error');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith(err.stack);
    expect(next).not.toHaveBeenCalled();
  });
});