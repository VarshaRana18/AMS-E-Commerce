import React from 'react';
import { Checkbox, CheckboxGroup } from '@heroui/react';

const Sidebar = () => {
  return (
    <div className="absolute left-0 w-64 p-6 bg-white border-r border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Components Selected</h2>
      <CheckboxGroup defaultValue={[]} label="Select components">
        <Checkbox value="motherboard">Motherboard</Checkbox>
        <Checkbox value="processor">Processor</Checkbox>
        <Checkbox value="graphics-card">Graphics Card</Checkbox>
        <Checkbox value="power-supply">Power Supply</Checkbox>
        <Checkbox value="ram">RAM</Checkbox>
        <Checkbox value="storage">Storage</Checkbox>
        <Checkbox value="cooling">Cooling</Checkbox>
        <Checkbox value="case">Case</Checkbox>
      </CheckboxGroup>
    </div>
  );
};

export default Sidebar;
