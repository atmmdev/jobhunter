/**
 * Base domain error for typed application failures.
 */
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

/**
 * Raised when an entity lookup fails.
 */
export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super('NOT_FOUND', id ? `${entity} not found: ${id}` : `${entity} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Raised when credentials or session are invalid.
 */
export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Raised when a unique business constraint would be violated.
 */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super('CONFLICT', message);
    this.name = 'ConflictError';
  }
}

/**
 * Raised when input fails validation after Zod parsing.
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}
