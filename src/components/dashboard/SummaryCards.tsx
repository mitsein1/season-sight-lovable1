
import { useSeasonax } from "@/context/SeasonaxContext";
import { Card, CardContent } from "@/components/ui/card";

export default function SummaryCards() {
  const { asset } = useSeasonax();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">Return</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-seasonax-primary">+124.98%</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Annualized return
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-seasonax-primary">+75.18%</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Annualized Rest
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-seasonax-positive">+3.64%</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Average return
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-seasonax-positive">+2.58%</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Median return
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">Profit</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-seasonax-positive">+11.45 pts</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Total profit
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-seasonax-positive">+1.15 pts</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Average profit
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-800">Gains</h3>
                <div className="text-2xl font-bold text-seasonax-positive">7</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Gains
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
                <div className="mt-2 text-base font-semibold text-seasonax-positive">+10.27%</div>
                <div className="text-xs text-slate-500">Profit</div>
                <div className="mt-1 text-base font-semibold text-seasonax-positive">+21.39%</div>
                <div className="text-xs text-slate-500">Max profit</div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-slate-800">Losses</h3>
                <div className="text-2xl font-bold text-seasonax-negative">3</div>
                <div className="text-xs text-slate-500 flex items-center">
                  Losses
                  <span className="ml-1 text-seasonax-info rounded-full bg-blue-50 w-4 h-4 inline-flex items-center justify-center">i</span>
                </div>
                <div className="mt-2 text-base font-semibold text-seasonax-negative">-10.32%</div>
                <div className="text-xs text-slate-500">Profit</div>
                <div className="mt-1 text-base font-semibold text-seasonax-negative">-15.57%</div>
                <div className="text-xs text-slate-500">Max loss</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
