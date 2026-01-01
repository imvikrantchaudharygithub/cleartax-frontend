'use client';

import DynamicListInput from './DynamicListInput';

export default function ServiceFormStep3() {
  return (
    <div className="space-y-6">
      <DynamicListInput
        name="features"
        label="Features *"
        placeholder="Enter a feature"
        addButtonText="Add Feature"
        minItems={1}
      />

      <DynamicListInput
        name="benefits"
        label="Benefits *"
        placeholder="Enter a benefit"
        addButtonText="Add Benefit"
        minItems={1}
      />
    </div>
  );
}

