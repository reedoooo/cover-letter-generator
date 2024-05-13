const originalEnv = process.env;

describe('Configuration Tests', () => {
  beforeEach(() => {
    jest.resetModules();  // Clears the cache of modules
    process.env = { ...originalEnv };  // Reset environment variables
  });

  afterAll(() => {
    process.env = originalEnv;  // Restore original environment
  });

  test('should load development configuration by default', () => {
    const developmentConfig = require('../config/env/development');
    expect(developmentConfig).toMatchObject(require('../config/env/development'));
  });

  test('should load production configuration when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    const productionConfig = require('../config/env/production');
    expect(productionConfig).toMatchObject(require('../config/env/production'));
  });

  test('should include defaults in the configurations', () => {
    const config = require('../config');
    expect(config.api.port).toBeDefined();
    expect(config.api.openAIKey).toEqual(process.env.OPENAI_API_KEY);
  });
});
