import React, { useState } from 'react';
import ScreenerTable from '@/components/ScreenerTable';

const ScreenerPage = () => {
  const [filters] = useState({
    market_group: ['NFLX', 'AMZN', 'AAPL'], // esempio tickers NASDAQ, puoi sostituire con il gruppo reale
    start_date: '2025-05-12',
    pattern_length_days: 60,
    years_back: 15,
    min_win_ratio: 0.55,
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Screener Asset Stagionali</h1>
      <ScreenerTable filters={filters} />
    </div>
  );
};

export default ScreenerPage;
