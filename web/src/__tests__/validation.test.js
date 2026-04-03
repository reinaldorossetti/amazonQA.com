import { describe, it, expect } from 'vitest';

describe('Validation - Basic Vitest Functionality', () => {
  it('should pass a basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass a string test', () => {
    expect('hello').toMatch(/hello/);
  });

  it('should pass when values are truthy', () => {
    expect(true).toBeTruthy();
    expect('text').toBeTruthy();
    expect(123).toBeTruthy();
  });
});
