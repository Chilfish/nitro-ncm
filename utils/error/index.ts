import { H3Error } from 'h3'

// the handled error codes
const errorCodes = [

] as const

export type ErrorCode = typeof errorCodes[number]

export interface MyErrorType {
  message: string
  code: ErrorCode
  statusCode: number
}

export class MyError extends H3Error {
  code: ErrorCode

  constructor(input: Partial<MyErrorType>) {
    super(input.message)
    this.code = input.code
    this.statusCode = input.statusCode
  }
}
