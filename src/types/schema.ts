interface Field {
  name: string
  type:FieldType 
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

type FieldType = 'string' | 'int' | 'bool' | 'timestamp' | 'float' | 'date' | 'time' | 'bigint' | 'uuid'

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
