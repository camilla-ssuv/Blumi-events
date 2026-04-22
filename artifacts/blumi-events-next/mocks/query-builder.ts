import { getMockDb, genId, type MockDB } from './db'

// ---------------------------------------------------------------------------
// Relationship map — define como cada tabela se conecta às outras
// ---------------------------------------------------------------------------
type RelDef = { table: string; type: 'one' | 'many'; localKey: string; foreignKey: string }

const RELATIONS: Record<string, Record<string, RelDef>> = {
  eventos: {
    tenants:          { table: 'tenants',          type: 'one',  localKey: 'tenant_id',       foreignKey: 'id' },
    perguntas_triagem:{ table: 'perguntas_triagem', type: 'many', localKey: 'id',              foreignKey: 'evento_id' },
    subeventos:       { table: 'subeventos',        type: 'many', localKey: 'id',              foreignKey: 'evento_id' },
    tipos_ingresso:   { table: 'tipos_ingresso',    type: 'many', localKey: 'id',              foreignKey: 'evento_id' },
    inscricoes:       { table: 'inscricoes',        type: 'many', localKey: 'id',              foreignKey: 'evento_id' },
  },
  inscricoes: {
    participantes:    { table: 'participantes',     type: 'one',  localKey: 'participante_id', foreignKey: 'id' },
    tipos_ingresso:   { table: 'tipos_ingresso',    type: 'one',  localKey: 'tipo_ingresso_id',foreignKey: 'id' },
    checkins:         { table: 'checkins',          type: 'many', localKey: 'id',              foreignKey: 'inscricao_id' },
    subeventos:       { table: 'subeventos',        type: 'one',  localKey: 'subevento_id',    foreignKey: 'id' },
    eventos:          { table: 'eventos',           type: 'one',  localKey: 'evento_id',       foreignKey: 'id' },
    respostas_triagem:{ table: 'respostas_triagem', type: 'many', localKey: 'id',              foreignKey: 'inscricao_id' },
  },
  dispositivos: {
    subeventos: { table: 'subeventos', type: 'one', localKey: 'subevento_id', foreignKey: 'id' },
    eventos:    { table: 'eventos',    type: 'one', localKey: 'evento_id',    foreignKey: 'id' },
  },
  visitas_subevento: {
    inscricoes: { table: 'inscricoes', type: 'one', localKey: 'inscricao_id', foreignKey: 'id' },
    subeventos: { table: 'subeventos', type: 'one', localKey: 'subevento_id', foreignKey: 'id' },
  },
  links_expositor: {
    subeventos: { table: 'subeventos', type: 'one', localKey: 'subevento_id', foreignKey: 'id' },
  },
  respostas_triagem: {
    inscricoes: { table: 'inscricoes', type: 'one', localKey: 'inscricao_id', foreignKey: 'id' },
  },
  subeventos: {
    eventos: { table: 'eventos', type: 'one', localKey: 'evento_id', foreignKey: 'id' },
  },
  checkins: {
    inscricoes: { table: 'inscricoes', type: 'one', localKey: 'inscricao_id', foreignKey: 'id' },
  },
}

// ---------------------------------------------------------------------------
// Parser de select string no estilo PostgREST
// Ex: "id, nome, tenants(nome, cor_primaria), subeventos(*)"
// ---------------------------------------------------------------------------
interface ParsedSelect {
  plain: string   // campos simples: "id, nome" ou "*"
  nested: { name: string; parsed: ParsedSelect }[]
}

function parseSelect(select: string): ParsedSelect {
  const nested: { name: string; parsed: ParsedSelect }[] = []
  const plainParts: string[] = []
  let i = 0

  while (i < select.length) {
    while (i < select.length && (select[i] === ',' || select[i] === ' ')) i++
    if (i >= select.length) break

    let token = ''
    while (i < select.length && select[i] !== ',' && select[i] !== '(' && select[i] !== ')' && select[i] !== ' ') {
      token += select[i++]
    }
    while (i < select.length && select[i] === ' ') i++

    // Strip !inner, !left, etc.
    const name = token.split('!')[0]

    if (i < select.length && select[i] === '(') {
      i++ // skip '('
      let depth = 1
      let inner = ''
      while (i < select.length && depth > 0) {
        if (select[i] === '(') depth++
        else if (select[i] === ')') { depth--; if (depth === 0) { i++; break } }
        if (depth > 0) inner += select[i]
        i++
      }
      if (name) nested.push({ name, parsed: parseSelect(inner.trim()) })
    } else {
      if (name) plainParts.push(name)
    }
  }

  return { plain: plainParts.length > 0 ? plainParts.join(', ') : '*', nested }
}

// Aplica a select shape a uma row, resolvendo joins recursivamente
function applySelect(row: any, parsed: ParsedSelect, table: string, db: MockDB): any {
  const result: any = {}

  if (parsed.plain === '*') {
    Object.assign(result, row)
  } else {
    for (const field of parsed.plain.split(',').map(s => s.trim()).filter(Boolean)) {
      result[field] = row[field]
    }
  }

  for (const rel of parsed.nested) {
    const relDef = RELATIONS[table]?.[rel.name]
    if (!relDef) { result[rel.name] = null; continue }

    const relRows: any[] = db[relDef.table] ?? []

    if (relDef.type === 'one') {
      const found = relRows.find(r => r[relDef.foreignKey] === row[relDef.localKey]) ?? null
      result[rel.name] = found ? applySelect(found, rel.parsed, relDef.table, db) : null
    } else {
      const found = relRows.filter(r => r[relDef.foreignKey] === row[relDef.localKey])
      result[rel.name] = found.map(r => applySelect(r, rel.parsed, relDef.table, db))
    }
  }

  return result
}

// Resolve um campo possivelmente dotted (ex: "inscricoes.evento_id")
function resolveField(row: any, field: string, table: string, db: MockDB): any {
  if (!field.includes('.')) return row[field]

  const [relName, ...rest] = field.split('.')
  const relDef = RELATIONS[table]?.[relName]
  if (!relDef) return undefined

  const relRows: any[] = db[relDef.table] ?? []
  const related = relDef.type === 'one'
    ? relRows.find(r => r[relDef.foreignKey] === row[relDef.localKey])
    : relRows.filter(r => r[relDef.foreignKey] === row[relDef.localKey])

  if (!related) return undefined
  const subPath = rest.join('.')
  if (Array.isArray(related)) return related.map(r => r[subPath])
  return related[subPath]
}

// ---------------------------------------------------------------------------
// Mock Query Builder
// ---------------------------------------------------------------------------
type FilterOp = 'eq' | 'neq' | 'is' | 'in' | 'gte' | 'lte'
type Filter = { field: string; op: FilterOp; value: any }
type Operation = 'select' | 'insert' | 'update' | 'upsert' | 'delete'

export class MockQueryBuilder {
  private _table: string
  private _filters: Filter[] = []
  private _orderField?: string
  private _orderAsc = true
  private _limitN?: number
  private _operation: Operation = 'select'
  private _selectStr?: string
  private _afterMutationSelect?: string
  private _insertData?: any | any[]
  private _updateData?: any
  private _onConflict?: string
  private _isSingle = false

  constructor(table: string) {
    this._table = table
  }

  select(fields?: string) {
    if (this._operation === 'insert' || this._operation === 'update' || this._operation === 'upsert') {
      this._afterMutationSelect = fields ?? '*'
    } else {
      this._operation = 'select'
      this._selectStr = fields ?? '*'
    }
    return this
  }

  eq(field: string, value: any)    { this._filters.push({ field, op: 'eq', value }); return this }
  neq(field: string, value: any)   { this._filters.push({ field, op: 'neq', value }); return this }
  is(field: string, value: any)    { this._filters.push({ field, op: 'is', value }); return this }
  in(field: string, values: any[]) { this._filters.push({ field, op: 'in', value: values }); return this }
  gte(field: string, value: any)   { this._filters.push({ field, op: 'gte', value }); return this }
  lte(field: string, value: any)   { this._filters.push({ field, op: 'lte', value }); return this }

  order(field: string, opts?: { ascending?: boolean }) {
    this._orderField = field
    this._orderAsc = opts?.ascending !== false
    return this
  }

  limit(n: number) { this._limitN = n; return this }

  single() { this._isSingle = true; return this }

  insert(data: any | any[]) { this._operation = 'insert'; this._insertData = data; return this }

  update(data: any) { this._operation = 'update'; this._updateData = data; return this }

  upsert(data: any | any[], opts?: { onConflict?: string }) {
    this._operation = 'upsert'
    this._insertData = Array.isArray(data) ? data : [data]
    this._onConflict = opts?.onConflict
    return this
  }

  delete() { this._operation = 'delete'; return this }

  // Thenable — permite `await builder` e `await builder.single()`
  then(resolve: (v: any) => any, reject?: (r: any) => any) {
    return Promise.resolve(this._exec()).then(resolve, reject)
  }

  private _exec(): { data: any; error: null } {
    const db = getMockDb()
    const rows: any[] = db[this._table] ?? []

    switch (this._operation) {
      case 'select': {
        let result = rows.filter(r => this._match(r, db))

        if (this._orderField) {
          const f = this._orderField; const asc = this._orderAsc
          result = [...result].sort((a, b) => a[f] < b[f] ? (asc ? -1 : 1) : a[f] > b[f] ? (asc ? 1 : -1) : 0)
        }
        if (this._limitN) result = result.slice(0, this._limitN)

        const sel = this._selectStr ?? '*'
        const shaped = sel === '*' ? result : result.map(r => applySelect(r, parseSelect(sel), this._table, db))

        if (this._isSingle) return { data: shaped[0] ?? null, error: null }
        return { data: shaped, error: null }
      }

      case 'insert': {
        const newRows = (Array.isArray(this._insertData) ? this._insertData : [this._insertData]).map(r => ({
          id: r.id ?? genId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...r,
        }))
        db[this._table] = [...rows, ...newRows]

        const returned = this._isSingle ? newRows[0] ?? null : newRows
        if (this._afterMutationSelect && returned) {
          const sel = this._afterMutationSelect
          if (this._isSingle) return { data: applySelect(returned, parseSelect(sel), this._table, db), error: null }
          return { data: (returned as any[]).map(r => applySelect(r, parseSelect(sel), this._table, db)), error: null }
        }
        return { data: returned, error: null }
      }

      case 'update': {
        db[this._table] = rows.map(r =>
          this._match(r, db) ? { ...r, ...this._updateData, updated_at: new Date().toISOString() } : r
        )
        if (this._afterMutationSelect) {
          const updated = (db[this._table] as any[]).filter(r => this._match(r, db))
          const sel = this._afterMutationSelect
          const shaped = updated.map(r => applySelect(r, parseSelect(sel), this._table, db))
          return { data: this._isSingle ? shaped[0] ?? null : shaped, error: null }
        }
        return { data: null, error: null }
      }

      case 'upsert': {
        const conflictKey = this._onConflict ?? 'id'
        const incoming = this._insertData as any[]
        db[this._table] = [...rows]
        for (const row of incoming) {
          const idx = (db[this._table] as any[]).findIndex(r => r[conflictKey] === row[conflictKey])
          if (idx >= 0) {
            ;(db[this._table] as any[])[idx] = { ...(db[this._table] as any[])[idx], ...row, updated_at: new Date().toISOString() }
          } else {
            ;(db[this._table] as any[]).push({ id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...row })
          }
        }
        return { data: null, error: null }
      }

      case 'delete': {
        db[this._table] = rows.filter(r => !this._match(r, db))
        return { data: null, error: null }
      }

      default:
        return { data: null, error: null }
    }
  }

  private _match(row: any, db: MockDB): boolean {
    return this._filters.every(({ field, op, value }) => {
      const actual = resolveField(row, field, this._table, db)
      switch (op) {
        case 'eq':  return actual === value
        case 'neq': return actual !== value
        case 'is':  return value === null ? (actual === null || actual === undefined) : actual === value
        case 'in':  return Array.isArray(value) && value.includes(actual)
        case 'gte': return actual >= value
        case 'lte': return actual <= value
        default:    return true
      }
    })
  }
}
