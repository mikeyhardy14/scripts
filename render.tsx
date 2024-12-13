import React, { useEffect, useState } from 'react';

interface ItemThingProps {
  chartData: any; // Replace 'any' with the actual type of chartData
  filtering: any; // Replace 'any' with the actual type of filtering
  renderFlag: boolean;
  setRenderFlag: (flag: boolean) => void; // Function to update the parent state
}

const ItemThing: React.FC<ItemThingProps> = ({ chartData, filtering, renderFlag, setRenderFlag }) => {
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (renderFlag && !hasRendered) {
      // Run your logic only when renderFlag is true and it hasn't run before
      setHasRendered(true);
      setRenderFlag(false); // Set renderFlag to false after execution

      // Add your logic here (e.g., processing chartData or filtering)
      console.log('Running ItemThing logic');
    }
  }, [renderFlag, hasRendered, setRenderFlag]);

  // If chartData is falsy, return a different div
  if (!chartData) {
    return <div>No chart data available</div>;
  }

  // Main render logic
  return (
    <div>
      <h2>ItemThing Component</h2>
      {/* Your component logic goes here */}
      <pre>{JSON.stringify(chartData, null, 2)}</pre>
    </div>
  );
};

export default ItemThing;