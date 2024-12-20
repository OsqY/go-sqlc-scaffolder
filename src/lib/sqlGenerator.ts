
export function generateSchema(entity: Entity): string {
  const lines: string[] = [
    `CREATE TABLE ${entity.tableName} (`, ` id SERIAL PRIMARY KEY, `]
  entity.fields.forEach(field => {
    let line = ` ${field.name} ${getSqlType(field.type)}`

    if (field.isRequired) line += ' NOT NULL'
    if (field.isUnique) line += ' UNIQUE'
    if (field.isFk) line += ` REFERENCES ${field.references}(id)`

    lines.push(line + ',')
  })

  if (entity.timeStamps) {
    lines.push(' created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,')
    lines.push(' updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,')
  }

  if (entity.isSoftDelete)
    lines.push(' deleted_at TIMESTAMP WITH TIME ZONE,')

  if (entity.audited) {
    lines.push('  created_by INTEGER REFERENCES users(id),');
    lines.push('  updated_by INTEGER REFERENCES users(id),');
    if (entity.isSoftDelete) {
      lines.push('  deleted_by INTEGER REFERENCES users(id),');
    }
  }

  lines[lines.length - 1] = lines[lines.length - 1].replace(',', '');
  lines.push(');');

  if (entity.indexes) {
    entity.indexes.forEach(index => {
      const indexName = `idx_${entity.tableName}_${index.fields.join('_')}`;
      const indexLine = `CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX ${indexName} ` +
        `ON ${entity.tableName}(${index.fields.join(', ')});`;
      lines.push(indexLine);
    });
  }

  return lines.join('\n');

}

export function generateDTO(entity: Entity): string {
  const lines: string[] = [
    'package dto',
    '',
    `type Create${entity.name}Request struct {`
  ];

  entity.fields.forEach(field => {
    const validation = generateValidationTag(field);
    lines.push(`  ${field.name[0].toUpperCase()} ${getGoType(field.type)} \`json:"${field.name}"${validation}\``);
  });

  lines.push('}', '');

  lines.push(`type Update${entity.name}Request struct {`);
  entity.fields.forEach(field => {
    const validation = generateValidationTag(field);
    lines.push(`  ${field.name[0].toUpperCase()} *${getGoType(field.type)} \`json:"${field.name},omitempty"${validation}\``);
  });
  lines.push('}');

  return lines.join('\n');
}

function getGoType(fieldType: string): string {
  switch (fieldType.toLowerCase()) {
    case 'string':
      return 'string'
    case 'int':
      return 'int32'
    case 'bigint':
      return 'int64'
    case 'float':
      return 'float64'
    case 'timestamp':
      return 'Time'
    case 'date':
      return 'Time'
    case 'time':
      return 'Time'
    case 'bool':
      return 'bool'
    case 'uuid':
      return 'uuid.UUID'
    default:
      return 'interface{}'
  }
}

function generateValidationTag(field: Field): string {
  const validations: string[] = [];

  if (field.isRequired) {
    validations.push('required');
  }

  if (field.validations) {
    if (field.validations.min !== undefined) {
      validations.push(`min=${field.validations.min}`);
    }
    if (field.validations.max !== undefined) {
      validations.push(`max=${field.validations.max}`);
    }
    if (field.validations.email) {
      validations.push('email');
    }
    if (field.validations.pattern) {
      validations.push(`regexp="${field.validations.pattern}"`);
    }
  }

  return validations.length > 0 ? ` validate:"${validations.join(',')}"` : '';
}

function getSqlType(fieldType: string): string {
  switch (fieldType) {
    case 'string':
      return 'TEXT'

    case 'int':
      return 'INTEGER'
    case 'timestamp':
      return 'TIMESTAMP'
    case 'float':
      return 'DECIMAL'
    case 'bigint':
      return 'BIGINT'
    case 'date':
      return 'DATE'
    case 'time':
      return 'TIME'
    default:
      return 'UUID'
  }
}
export function generateQueries(entity: Entity): string {
  const lines: string[] = [];
  const entityName = entity.name;
  const tableName = entity.tableName;

  lines.push(`-- name: Create${entityName} :one`);
  const insertFields = entity.fields.map(f => f.name);
  const placeholders = entity.fields.map((_, i) => `$${i + 1}`);

  lines.push(`INSERT INTO ${tableName} (`);
  lines.push(`  ${insertFields.join(', ')}`);
  lines.push(`) VALUES (`);
  lines.push(`  ${placeholders.join(', ')}`);
  lines.push(`) RETURNING *;`);
  lines.push('');

  lines.push(`-- name: Get${entityName}ByID :one`);
  lines.push(`SELECT * FROM ${tableName}`);
  lines.push(`WHERE id = $1`);
  if (entity.isSoftDelete) {
    lines.push(`AND deleted_at IS NULL`);
  }
  lines.push(`;`);
  lines.push('');

  lines.push(`-- name: List${entityName}s :many`);
  lines.push(`SELECT * FROM ${tableName}`);
  if (entity.isSoftDelete) {
    lines.push(`WHERE deleted_at IS NULL`);
  }
  lines.push(`ORDER BY created_at DESC`);
  lines.push(`LIMIT $1 OFFSET $2;`);
  lines.push('');

  lines.push(`-- name: Update${entityName} :one`);
  lines.push(`UPDATE ${tableName}`);
  lines.push(`SET`);

  const updateFields = entity.fields.map((field, index) =>
    `  ${field.name} = COALESCE($${index + 2}, ${field.name})`
  );

  if (entity.timeStamps) {
    updateFields.push(`  updated_at = CURRENT_TIMESTAMP`);
  }

  lines.push(updateFields.join(',\n'));
  lines.push(`WHERE id = $1`);
  if (entity.isSoftDelete) {
    lines.push(`AND deleted_at IS NULL`);
  }
  lines.push(`RETURNING *;`);
  lines.push('');

  if (entity.isSoftDelete) {
    lines.push(`-- name: Delete${entityName} :exec`);
    lines.push(`UPDATE ${tableName}`);
    lines.push(`SET`);
    lines.push(`  deleted_at = CURRENT_TIMESTAMP`);
    if (entity.audited) {
      lines.push(`  ,deleted_by = $2`);
    }
    lines.push(`WHERE id = $1`);
    lines.push(`AND deleted_at IS NULL;`);
    lines.push('');
  }

  entity.fields.forEach(field => {
    if (field.isUnique) {
      lines.push(`-- name: Get${entityName}By${field.name[0].toUpperCase()} :one`);
      lines.push(`SELECT * FROM ${tableName}`);
      lines.push(`WHERE ${field.name} = $1`);
      if (entity.isSoftDelete) {
        lines.push(`AND deleted_at IS NULL`);
      }
      lines.push(`;`);
      lines.push('');
    }
  });

  return lines.join('\n');
}

export function generateTypes(entity: Entity): string {
  const lines: string[] = [
    'package types',
    '',
    'import (',
    '\t"time"',
    '\t"github.com/google/uuid"',
    ')',
    '',
    `type ${entity.name} struct {`,
    '\tID        int64     `json:"id"`'
  ];

  entity.fields.forEach(field => {
    const goType = getGoType(field.type);
    lines.push(`\t${field.name[0].toUpperCase()} ${goType} \`json:"${field.name}"\``);
  });

  if (entity.timeStamps) {
    lines.push('\tCreatedAt time.Time  `json:"created_at"`');
    lines.push('\tUpdatedAt time.Time  `json:"updated_at"`');
  }

  if (entity.isSoftDelete) {
    lines.push('\tDeletedAt *time.Time `json:"deleted_at,omitempty"`');
  }

  if (entity.audited) {
    lines.push('\tCreatedBy *int64    `json:"created_by,omitempty"`');
    lines.push('\tUpdatedBy *int64    `json:"updated_by,omitempty"`');
    if (entity.isSoftDelete) {
      lines.push('\tDeletedBy *int64    `json:"deleted_by,omitempty"`');
    }
  }

  lines.push('}');

  return lines.join('\n');
}
