import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartControlsProps {
  mediaList: string[];
  activeMedia: string;
}

const ChartControls: React.FC<ChartControlsProps> = ({ mediaList }) => {
  return (
    <div className="sticky top-0 z-10 bg-black">
      <TabsList className="mb-4 bg-gray-900 p-2 flex flex-wrap justify-center gap-2">
        {mediaList.map((media) => (
          <TabsTrigger
            key={media}
            value={media}
            className="px-4 py-2 text-base text-white data-[state=active]:bg-blue-600 
                      rounded-md flex-shrink-0 
                      hover:bg-gray-700 transition-colors duration-200"
          >
            {media}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default ChartControls;
