import React from "react";
import { ArrowLeft } from "lucide-react";

interface NavHeaderProps {
  onBack: () => void;
}

const NavHeader = ({ onBack }: NavHeaderProps): JSX.Element => {
  return (
    <div className="bg-white shadow-sm p-4 flex items-center gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>
    </div>
  );
};

export default NavHeader;
