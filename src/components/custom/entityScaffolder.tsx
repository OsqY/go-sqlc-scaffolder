import { useState } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

const EntityScaffolder = () => {
  const [entity, setEntity] = useState<Entity>({
    name: '',
    tableName: '',
    fields: [],
    timeStamps: true,
    isSoftDelete: true,
    audited: true,
    indexes: []
  })

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="entityName">Entity Name</Label>
          <Input value={entity.name} onChange={(e) => setEntity({
            ...entity, name: e.target.value
          })} />
        </div>
      </div>
    </div >
  )
}
