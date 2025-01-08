import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Calculator, Building2, ArrowLeft, Search } from "lucide-react";
import * as XLSX from "xlsx";

// Type definitions
type ViewType = "home" | "directory" | "calculator";

type DoseType = "pills" | "drops" | "units" | "puffs";

interface Facility {
  "Facility Name": string;
  Phone: string;
  "License number": string;
  "Room number": string;
  Address: string;
  [key: string]: string;
}

interface AppCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

interface NavHeaderProps {
  onBack: () => void;
}

interface CalculatorProps {
  onBack: () => void;
}

interface FacilityDirectoryProps {
  onBack: () => void;
}

// Components
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

function DaysSupplyCalculator({ onBack }: CalculatorProps): JSX.Element {
  const [quantity, setQuantity] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("1");
  const [doseType, setDoseType] = useState<DoseType>("pills");
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
                Dose Type
              </label>
              <select
                className="w-full p-2 border rounded"
                value={doseType}
                onChange={(e): void => setDoseType(e.target.value as DoseType)}
              >
                <option value="pills">Pills</option>
                <option value="drops">Drops</option>
                <option value="units">Units</option>
                <option value="puffs">Puffs</option>
              </select>
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
}

const FacilityDirectory = ({ onBack }: FacilityDirectoryProps): JSX.Element => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadInitialData = async (): Promise<void> => {
      try {
        const response = await window.fs.readFile("MedExamples.xlsx");
        const workbook = XLSX.read(response, {
          type: "array",
          cellDates: true,
          cellNF: true,
          cellText: true,
        });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Facility>(firstSheet);
        setFacilities(jsonData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const filteredFacilities = facilities.filter((facility) =>
    Object.values(facility).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <NavHeader onBack={onBack} />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Facility Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                className="w-full pl-10 p-2 border rounded"
                value={searchTerm}
                onChange={(e): void => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">Loading facilities...</div>
            ) : (
              <div className="grid gap-2">
                {filteredFacilities.map((facility) => (
                  <div
                    key={facility["Facility Name"]}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium">{facility["Facility Name"]}</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500">Phone: </span>
                        {facility["Phone"]}
                      </div>
                      <div>
                        <span className="text-gray-500">License: </span>
                        {facility["License number"]}
                      </div>
                      <div>
                        <span className="text-gray-500">Room: </span>
                        {facility["Room number"]}
                      </div>
                      <div>
                        <span className="text-gray-500">Address: </span>
                        {facility["Address"]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const App = (): JSX.Element => {
  const [currentView, setCurrentView] = useState<ViewType>("home");

  const handleNavigate = (view: ViewType): void => {
    setCurrentView(view);
  };

  const handleBack = (): void => {
    setCurrentView("home");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === "home" && (
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-8">Pharmacy Toolbox</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppCard
              icon={Building2}
              title="Facility Directory"
              description="Search and manage facility information"
              onClick={(): void => handleNavigate("directory")}
            />
            <AppCard
              icon={Calculator}
              title="Days Supply Calculator"
              description="Calculate medication days supply"
              onClick={(): void => handleNavigate("calculator")}
            />
          </div>
        </div>
      )}
      {currentView === "directory" && <FacilityDirectory onBack={handleBack} />}
      {currentView === "calculator" && (
        <DaysSupplyCalculator onBack={handleBack} />
      )}
    </div>
  );
};

export default App;
