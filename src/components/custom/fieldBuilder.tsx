import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";

interface FieldBuilderProps {
  field: Field;
  onFieldChange: (field: Field) => void;
}

const FieldBuilder = ({ field, onFieldChange }: FieldBuilderProps) => {
  const handleTypeChange = (newType: string) => {
    onFieldChange({ ...field, type: newType as FieldType });
  };
  const [validation, setValidation] = useState(false);

  const updateValidation = (
    key: keyof typeof field.validations,
    value: any
  ) => {
    onFieldChange({
      ...field,
      validations: { ...field.validations, [key]: value },
    });
  };
  return (
    <div className="p-2">
      <div>
        <Label className="text-lg" htmlFor="fieldName">Field Name</Label>
        <Input
          className="my-4"
          onChange={(e) => onFieldChange({ ...field, name: e.target.value })}
        />
      </div>
      <div>
        <DropdownMenu >
          <DropdownMenuTrigger className="my-4 text-lg">Field Type</DropdownMenuTrigger>
          <DropdownMenuRadioGroup
            value={field.type}
            onValueChange={handleTypeChange}
          >
            <DropdownMenuContent >
              <DropdownMenuRadioItem value="string">
                String
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="int">Integer</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bool">
                Boolean
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="timestamp">
                Timestamp
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="float">Float</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="time">Time</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bigint">
                Big integer
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="uuid">
                Unique identifier
              </DropdownMenuRadioItem>
            </DropdownMenuContent>
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      </div>
      <div>
        <Label className="text-lg" htmlFor="fieldIsRequired">Is field required?</Label>
        <Checkbox
          className="ml-2"
          checked={field.isRequired}
          onCheckedChange={(checked) =>
            onFieldChange({ ...field, isRequired: !!checked })
          }
        />
      </div>
      <div>
        <Label className="text-lg" htmlFor="fieldIsFk">Is field a Foreign Key?</Label>
        <Checkbox
          className="ml-2"
          checked={field.isFk}
          onCheckedChange={(checked) =>
            onFieldChange({ ...field, isFk: !!checked })
          }
        />
      </div>
      <div>
        <Label className="text-lg" htmlFor="fieldIsUnique">Is field unique?</Label>
        <Checkbox
          className="ml-2"
          checked={field.isUnique}
          onCheckedChange={(checked) =>
            onFieldChange({ ...field, isUnique: !!checked })
          }
        />
      </div>
      <div>
        <Label className="text-lg" htmlFor="fieldHasReferences">References (optional)</Label>
        <Input
          className="my-4"
          onChange={(e) =>
            onFieldChange({ ...field, references: e.target.value })
          }
        />
      </div>
      <div>
        <Label className="text-lg" htmlFor="fieldHasValidations">
          Does the field has validations?
        </Label>
        <Checkbox
          className="ml-2"
          checked={validation}
          onCheckedChange={(checked) => setValidation(!!checked)}
        />
      </div>
      {validation && (
        <div className="py-4">
          <div>
            <Label className="text-base" htmlFor="fieldMinLength">Min length</Label>
            <Input
              className="my-4"
              type="number"
              value={field.validations.min}
              onChange={(e) =>
                updateValidation("min", parseInt(e.target.value))
              }
            />
          </div>
          <div>
            <Label className="text-base" htmlFor="fieldMaxLength">Max length</Label>
            <Input
              className="my-4"
              type="number"
              value={field.validations.max}
              onChange={(e) =>
                updateValidation("max", parseInt(e.target.value))
              }
            />
          </div>

          {field.type === "string" && (
            <div>
              <div>
                <Label className="text-base" htmlFor="fieldRegex">Pattern (Regex)</Label>
                <Input
                  className="my-4"
                  value={field.validations.pattern}
                  onChange={(e) => updateValidation("pattern", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-base" htmlFor="fieldIsEmail">Is Field Email?</Label>
                <Checkbox
                  className="ml-2"
                  checked={field.validations.email}
                  onCheckedChange={(checked) =>
                    updateValidation("email", !!checked)
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldBuilder;
