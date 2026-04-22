// IndexedDB wrapper para modo offline do terminal de check-in
// Funciona apenas no cliente (browser)

export type InscricaoOffline = {
  qr_token: string
  participante_nome: string
  participante_email: string
  checkin_feito: boolean
  evento_id: string
}

export type FilaCheckin = {
  id: string
  qr_token: string
  origem: 'camera' | 'usb' | 'manual'
  dispositivo_id: string | null
  subevento_id: string | null  // não-nulo = Modo B
  timestamp: number
  synced: boolean
}

const DB_NAME = 'blumi-checkin-v1'
const DB_VERSION = 1
let _db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('inscricoes')) {
        const store = db.createObjectStore('inscricoes', { keyPath: 'qr_token' })
        store.createIndex('evento_id', 'evento_id', { unique: false })
      }
      if (!db.objectStoreNames.contains('fila')) {
        db.createObjectStore('fila', { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function salvarInscricoesOffline(inscricoes: InscricaoOffline[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inscricoes', 'readwrite')
    const store = tx.objectStore('inscricoes')
    inscricoes.forEach((i) => store.put(i))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function buscarInscricaoLocal(qrToken: string): Promise<InscricaoOffline | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction('inscricoes', 'readonly').objectStore('inscricoes').get(qrToken)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function marcarCheckinLocal(qrToken: string): Promise<void> {
  const db = await openDB()
  const inscricao = await buscarInscricaoLocal(qrToken)
  if (!inscricao) return
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inscricoes', 'readwrite')
    tx.objectStore('inscricoes').put({ ...inscricao, checkin_feito: true })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function enfileirarCheckin(
  item: Omit<FilaCheckin, 'id' | 'synced'>
): Promise<void> {
  const db = await openDB()
  const completo: FilaCheckin = { ...item, id: crypto.randomUUID(), synced: false }
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fila', 'readwrite')
    tx.objectStore('fila').put(completo)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function obterFilaPendente(): Promise<FilaCheckin[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction('fila', 'readonly').objectStore('fila').getAll()
    req.onsuccess = () =>
      resolve((req.result as FilaCheckin[]).filter((i) => !i.synced))
    req.onerror = () => reject(req.error)
  })
}

export async function marcarSincronizado(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fila', 'readwrite')
    const store = tx.objectStore('fila')
    const req = store.get(id)
    req.onsuccess = () => {
      if (req.result) store.put({ ...req.result, synced: true })
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
