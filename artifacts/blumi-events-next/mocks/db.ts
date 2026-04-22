import { INITIAL_DATA } from './data'

export type MockDB = Record<string, any[]>

// Singleton em memória — persiste entre requests no mesmo processo Node.js de dev
let _db: MockDB | null = null

export function getMockDb(): MockDB {
  if (!_db) _db = deepClone(INITIAL_DATA)
  return _db
}

export function resetMockDb(): void {
  _db = deepClone(INITIAL_DATA)
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function genId(): string {
  return `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
