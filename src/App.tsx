import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator } from 'lucide-react';

type MedicationType = 'pills' | 'eye_drops' | 'insulin' | 'inhalers';
type SupplyType = 'weekly' | 'monthly';
type FillType = 'short' | 'long';

interface CalculationResult {
  daysSupply: number;
  quantityPerDay: number;
  quantityPerDose: number;
  totalQuantity?: number;
}

const DaysSupplyCalculator = () => {
  // Basic state
  const [medicationType, setMedicationType] = useState<MedicationType>('pills');
  const [supplyType, setSupplyType] = useState<SupplyType>('weekly');
  const [fillType, setFillType] = useState<FillType>('short');
  const [quantity, setQuantity] = useState('');
  const [timesPerDay, setTimesPerDay] = useState('1');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState('');

  // Calendar/billing state
  const [billDay, setBillDay] = useState('Monday');
  const [billDate, setBillDate] = useState('');
  const [cycleStartDate, setCycleStartDate] = useState('');

  // Medication-specific state
  // Pills
  const [pillsPerDose, setPillsPerDose] = useState('1');
  const [refills, setRefills] = useState('0');

  // Eye drops
  const [dropsPerDose, setDropsPerDose] = useState('1');
  const [numberOfEyes, setNumberOfEyes] = useState('2');
  const [dropPackageSize, setDropPackageSize] = useState('5');

  // Insulin
  const [unitsPerDose, setUnitsPerDose] = useState('');
  const [unitsPerMl, setUnitsPerMl] = useState('100');
  const [insulinPackageSize, setInsulinPackageSize] = useState('10');

  // Inhalers
  const [puffsPerDose, setPuffsPerDose] = useState('');
  const [puffsPerPack, setPuffsPerPack] = useState('200');
  const [inhalerPackageSize, setInhalerPackageSize] = useState('18');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    determineFillType();
  }, [supplyType, billDay, billDate]);

  const determineFillType = () => {
    const currentDate = new Date();
    
    if (supplyType === 'weekly') {
      const currentDayIndex = currentDate.getDay();
      const billDayIndex = daysOfWeek.indexOf(billDay);
      setFillType(currentDayIndex >= billDayIndex ? 'long' : 'short');
    } else {
      if (!billDate) return;
      const currentDayOfMonth = currentDate.getDate();
      const billDayOfMonth = new Date(billDate).getDate();
      setFillType(currentDayOfMonth >= billDayOfMonth ? 'long' : 'short');
    }
  };

  const calculateFillDays = (): number => {
    if (!cycleStartDate) return 0;
    
    const currentDate = new Date();
    const cycleStart = new Date(cycleStartDate);
    
    if (cycleStart < currentDate) {
      setError('Cycle start date cannot be in the past');
      return 0;
    }

    const diffTime = cycleStart.getTime() - currentDate.getTime();
    const shortFillDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (fillType === 'short') return shortFillDays;

    // For long fills, add the full cycle length
    if (supplyType === 'weekly') {
      return shortFillDays + 7;
    } else {
      // For monthly, calculate days until end of month
      const cycleStartDay = cycleStart.getDate();
      const additionalDays = cycleStartDay === 1 
        ? new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, 0).getDate() 
        : 30;
      return shortFillDays + additionalDays;
    }
  };

  const calculateResult = () => {
    setError('');
    let calculatedResult: CalculationResult;

    try {
      const fillDays = calculateFillDays();
      if (fillDays <= 0) {
        setError('Please select valid dates');
        return;
      }

      switch (medicationType) {
        case 'pills': {
          const dailyQty = Number(pillsPerDose) * Number(timesPerDay);
          const totalQty = dailyQty * fillDays;
          
          calculatedResult = {
            daysSupply: fillDays,
            quantityPerDay: dailyQty,
            quantityPerDose: Number(pillsPerDose),
            totalQuantity: totalQty
          };
          break;
        }

        case 'eye_drops': {
          const drops_per_dose = Number(dropsPerDose);
          const times_day = Number(timesPerDay);
          const num_eyes = Number(numberOfEyes);
          const container_volume = Number(dropPackageSize);
          const drops_per_ml = 20; // Standard drops per mL

          const daily_drops = drops_per_dose * times_day * num_eyes;
          const total_drops = container_volume * drops_per_ml;
          const days_supply = Math.floor(total_drops / daily_drops);

          calculatedResult = {
            daysSupply: days_supply,
            quantityPerDay: daily_drops / drops_per_ml,
            quantityPerDose: drops_per_dose / drops_per_ml,
            totalQuantity: container_volume
          };
          break;
        }

        case 'insulin': {
          const units_per_dose = Number(unitsPerDose);
          const times_day = Number(timesPerDay);
          const units_per_ml = Number(unitsPerMl);
          const pack_size = Number(insulinPackageSize);

          const daily_units = units_per_dose * times_day;
          const total_units = units_per_ml * pack_size;
          const days_supply = Math.floor(total_units / daily_units);

          calculatedResult = {
            daysSupply: days_supply,
            quantityPerDay: daily_units / units_per_ml,
            quantityPerDose: units_per_dose / units_per_ml,
            totalQuantity: pack_size
          };
          break;
        }

        case 'inhalers': {
          const puffs_per_dose = Number(puffsPerDose);
          const times_day = Number(timesPerDay);
          const total_puffs = Number(puffsPerPack);
          const pack_size = Number(inhalerPackageSize);

          const daily_puffs = puffs_per_dose * times_day;
          const days_supply = Math.floor(total_puffs / daily_puffs);
          const grams_per_puff = pack_size / total_puffs;

          calculatedResult = {
            daysSupply: days_supply,
            quantityPerDay: daily_puffs * grams_per_puff,
            quantityPerDose: puffs_per_dose * grams_per_puff,
            totalQuantity: pack_size
          };
          break;
        }

        default:
          throw new Error('Invalid medication type');
      }

      setResult(calculatedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating result');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Days Supply Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Medication Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Medication Type
            </label>
            <select
              className="w-full p-2 border rounded"
              value={medicationType}
              onChange={(e) => setMedicationType(e.target.value as MedicationType)}
            >
              <option value="pills">Pills</option>
              <option value="eye_drops">Eye Drops</option>
              <option value="insulin">Insulin</option>
              <option value="inhalers">Inhalers</option>
            </select>
          </div>

          {/* Supply Type and Billing Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supply Type</label>
              <select
                className="w-full p-2 border rounded"
                value={supplyType}
                onChange={(e) => setSupplyType(e.target.value as SupplyType)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {supplyType === 'weekly' ? (
              <div>
                <label className="block text-sm font-medium mb-1">Bill Day</label>
                <select
                  className="w-full p-2 border rounded"
                  value={billDay}
                  onChange={(e) => setBillDay(e.target.value)}
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Bill Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cycle Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={cycleStartDate}
              onChange={(e) => setCycleStartDate(e.target.value)}
            />
          </div>

          {/* Medication-Specific Fields */}
          {medicationType === 'pills' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pills per Dose</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={pillsPerDose}
                  onChange={(e) => setPillsPerDose(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Refills</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={refills}
                  onChange={(e) => setRefills(e.target.value)}
                />
              </div>
            </div>
          )}

          {medicationType === 'eye_drops' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Drops per Dose</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={dropsPerDose}
                  onChange={(e) => setDropsPerDose(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Eyes</label>
                <select
                  className="w-full p-2 border rounded"
                  value={numberOfEyes}
                  onChange={(e) => setNumberOfEyes(e.target.value)}
                >
                  <option value="1">One Eye</option>
                  <option value="2">Both Eyes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Package Size (mL)</label>
                <select
                  className="w-full p-2 border rounded"
                  value={dropPackageSize}
                  onChange={(e) => setDropPackageSize(e.target.value)}
                >
                  <option value="2.5">2.5 mL</option>
                  <option value="5">5 mL</option>
                  <option value="7.5">7.5 mL</option>
                  <option value="10">10 mL</option>
                  <option value="15">15 mL</option>
                </select>
              </div>
            </div>
          )}

          {medicationType === 'insulin' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Units per Dose</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={unitsPerDose}
                  onChange={(e) => setUnitsPerDose(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Units per mL</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={unitsPerMl}
                  onChange={(e) => setUnitsPerMl(e.target.value)}
                  placeholder="Default: 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Package Size (mL)</label>
                <select
                  className="w-full p-2 border rounded"
                  value={insulinPackageSize}
                  onChange={(e) => setInsulinPackageSize(e.target.value)}
                >
                  <option value="3">3 mL</option>
                  <option value="10">10 mL</option>
                  <option value="15">15 mL</option>
                </select>
              </div>
            </div>
          )}

          {medicationType === 'inhalers' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Puffs per Dose</label>
                <input
                type="number"
                className="w-full p-2 border rounded"
                value={puffsPerDose}
                onChange={(e) => setPuffsPerDose(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Puffs per Pack</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={puffsPerPack}
                onChange={(e) => setPuffsPerPack(e.target.value)}
                placeholder="Default: 200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Package Size (g)</label>
              <select
                className="w-full p-2 border rounded"
                value={inhalerPackageSize}
                onChange={(e) => setInhalerPackageSize(e.target.value)}
              >
                <option value="6.7">6.7g</option>
                <option value="8.5">8.5g</option>
                <option value="16">16g</option>
                <option value="18">18g</option>
                <option value="30">30g</option>
              </select>
            </div>
          </div>
        )}

        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium mb-1">Times per Day</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={timesPerDay}
            onChange={(e) => setTimesPerDay(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={calculateResult}
        >
          Calculate
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded space-y-2">
            <div className="font-medium text-blue-600">
              Fill Type: {fillType.toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Days Supply: </span>
              {result.daysSupply}
            </div>
            <div>
              <span className="font-medium">Quantity per Day: </span>
              {result.quantityPerDay.toFixed(3)} 
              {medicationType === 'inhalers' ? 'g' : 
               medicationType === 'pills' ? 'pills' : 'mL'}
            </div>
            <div>
              <span className="font-medium">Quantity per Dose: </span>
              {result.quantityPerDose.toFixed(3)} 
              {medicationType === 'inhalers' ? 'g' : 
               medicationType === 'pills' ? 'pills' : 'mL'}
            </div>
            {result.totalQuantity && (
              <div>
                <span className="font-medium">Total Quantity: </span>
                {result.totalQuantity.toFixed(3)} 
                {medicationType === 'inhalers' ? 'g' : 
                 medicationType === 'pills' ? 'pills' : 'mL'}
              </div>
            )}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
};

export default DaysSupplyCalculator;