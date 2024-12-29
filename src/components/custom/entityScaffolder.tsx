import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  generateDTO,
  generateQueries,
  generateSchema,
} from "@/lib/sqlGenerator";
import { Checkbox } from "../ui/checkbox";
import FieldBuilder from "./fieldBuilder";
import { Textarea } from "../ui/textarea";

const EntityScaffolder = () => {
  const [entity, setEntity] = useState<Entity>({
    name: "",
    tableName: "",
    fields: [],
    timeStamps: true,
    isSoftDelete: true,
    audited: true,
    indexes: [],
  });

  const addField = () => {
    const newField: Field = {
      name: "",
      type: "string",
      isRequired: false,
      isFk: false,
      isUnique: false,
      references: "",
      validations: {},
    };

    setEntity((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const updateField = (index: number, fieldToUpdate: Field) => {
    setEntity((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) =>
        i === index ? fieldToUpdate : field
      ),
    }));
  };

  const removeField = (index: number) => {
    setEntity((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const [schema, setSchema] = useState("");
  const [queries, setQueries] = useState("");
  const [dto, setDTO] = useState("");

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div>
          <Label className="text-xl my-4" htmlFor="entityName">Entity Name</Label>
          <Input className="my-2"
            value={entity.name}
            onChange={(e) =>
              setEntity({
                ...entity,
                name: e.target.value,
              })
            }
          />
        </div>
        <div>
          <Label className="text-xl my-4" htmlFor="entityTableName">Table Name</Label>
          <Input className="my-2"
            value={entity.tableName}
            onChange={(e) =>
              setEntity({
                ...entity,
                tableName: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg" htmlFor="entityFields">Fields</Label>
            <Button className="text-lg p-6" onClick={addField}>Add Field</Button>
          </div>

          <div className="space-y-4">
            {entity.fields.map((field, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Field {index + 1}</h3>
                  <Button
                    className="text-lg p-5"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    Remove
                  </Button>
                </div>

                <FieldBuilder
                  field={field}
                  onFieldChange={(updatedField) =>
                    updateField(index, updatedField)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={entity.timeStamps}
              onCheckedChange={(checked) =>
                setEntity((prev) => ({ ...prev, timeStamps: !!checked }))
              }
            />
            <Label className="text-lg">Include Timestamps</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={entity.isSoftDelete}
              onCheckedChange={(checked) =>
                setEntity((prev) => ({ ...prev, isSoftDelete: !!checked }))
              }
            />
            <Label className="text-lg">Enable Soft Delete</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={entity.audited}
              onCheckedChange={(checked) =>
                setEntity((prev) => ({ ...prev, audited: !!checked }))
              }
            />
            <Label className="text-lg">Enable Audit Fields</Label>
          </div>
        </div>

        <Button
          className="w-full text-lg p-6"
          onClick={() => {
            setSchema(generateSchema(entity));
          }}
        >
          Generate Schema
        </Button>
        <Button
          className="w-full text-lg p-6"
          onClick={() => {
            setQueries(generateQueries(entity));
          }}
        >
          Generate Queries
        </Button>
        <Button
          className="w-full text-lg p-6"
          onClick={() => {
            setDTO(generateDTO(entity));
          }}
        >
          Generate DTO
        </Button>
        <Textarea value={schema} />
        <Textarea value={queries} />
        <Textarea value={dto} />
      </div>
    </div>
  );
};

export default EntityScaffolder;
