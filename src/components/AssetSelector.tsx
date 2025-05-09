
import { useSeasonax } from "@/context/SeasonaxContext";
import { availableAssets } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AssetSelector() {
  const { asset, setAsset, refreshData } = useSeasonax();

  const handleChange = (value: string) => {
    setAsset(value);
    refreshData();
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="asset-select" className="seasonax-label whitespace-nowrap">
        Asset:
      </label>
      <Select value={asset} onValueChange={handleChange}>
        <SelectTrigger id="asset-select" className="w-[180px]">
          <SelectValue placeholder="Select asset" />
        </SelectTrigger>
        <SelectContent>
          {availableAssets.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
