interface Field {
  name: string
  type: 'string' | 'int' | 'bool' | 'timestamp' | 'float' | 'date' | 'time' | 'bigint' | 'uuid'
  isRequired: boolean
  isUnique: boolean
  isFk: boolean
  references?: string
  validations: {
    min?: number
    max?: number
    pattern?: string
    email?: boolean
  }
}

interface Entity {
  name: string
  tableName: string
  fields: Field[]
  timeStamps: boolean
  isSoftDelete: boolean
  audited: boolean
  indexes?: {
    fields: Field[]
    unique: boolean
  }[]
}
