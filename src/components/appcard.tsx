import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AppCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

const AppCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}: AppCardProps): JSX.Element => {
  return (
    <button onClick={onClick} className="block w-full text-left">
      <Card className="h-full transition-all hover:shadow-lg hover:scale-105">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Icon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
};

export default AppCard;
