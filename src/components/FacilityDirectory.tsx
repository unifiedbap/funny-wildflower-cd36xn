import React, { useState, useEffect } from "react";
import NavHeader from "./NavHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Search } from "lucide-react";
import * as XLSX from "xlsx";

interface Facility {
  "Facility Name": string;
  Phone: string;
  "License number": string;
  "Room number": string;
  Address: string;
  [key: string]: string;
}

interface FacilityDirectoryProps {
  onBack: () => void;
}

const FacilityDirectory = ({ onBack }: FacilityDirectoryProps): JSX.Element => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadInitialData = async (): Promise<void> => {
      try {
        const response = await window.fs.readFile("MedExamples.xlsx");
        const workbook = XLSX.read(response, { type: "array" });
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

export default FacilityDirectory;
