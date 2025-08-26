import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-primary-500 animate-spin"></div>
    </div>
  );
};

export default Loader;