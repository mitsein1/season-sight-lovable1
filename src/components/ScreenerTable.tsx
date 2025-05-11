
import React, { useEffect, useState } from 'react';
// Fix the import path to use the correct services folder
import { fetchScreenerResults } from '@/services/api';
import { Table, TableHeader, TableCell, TableRow } from '@/components/ui/table';

const ScreenerTable = ({filters}) => {
  const [data, setData] = useState([]);
  const [sortKey, setSortKey] = useState('Annualized return');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchScreenerResults(
      filters.market_group,
      filters.start_date,
      filters.pattern_length_days,
      filters.years_back,
      filters.min_win_ratio
    ).then(setData).catch(console.error);
  }, [filters]);

  const sortedData = [...data].sort((a, b) => {
    const valA = parseFloat(a[sortKey]);
    const valB = parseFloat(b[sortKey]);
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  return (
    <Table>
      <thead>
        <tr>
          {Object.keys(data[0] || {}).map((col) => (
            <TableHeader key={col} onClick={() => {
              setSortKey(col);
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}>
              {col}
            </TableHeader>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, idx) => (
          <TableRow key={idx}>
            {Object.values(row).map((val, i) => (
              <TableCell key={i}>{val}</TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default ScreenerTable;
