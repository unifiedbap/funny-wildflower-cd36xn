import React, { useState } from "react";
import NavHeader from "./NavHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface CalculatorProps {
  onBack: () => void;
}

const DaysSupplyCalculator = ({ onBack }: CalculatorProps): JSX.Element => {
  const [quantity, setQuantity] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("1");
  const [doseAmount, setDoseAmount] = useState<string>("1");
  const [result, setResult] = useState<number | null>(null);

  const calculateDaysSupply = (): void => {
    const qty = parseFloat(quantity);
    const freq = parseFloat(frequency);
    const dose = parseFloat(doseAmount);
    const daysSupply = qty / (freq * dose);
    setResult(Math.floor(daysSupply));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <NavHeader onBack={onBack} />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Days Supply Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={quantity}
                onChange={(e): void => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Amount per Dose
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={doseAmount}
                onChange={(e): void => setDoseAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Times per Day
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={frequency}
                onChange={(e): void => setFrequency(e.target.value)}
              />
            </div>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={calculateDaysSupply}
            >
              Calculate
            </button>

            {result !== null && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <span className="font-medium">Days Supply: </span>
                {result} days
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DaysSupplyCalculator;
