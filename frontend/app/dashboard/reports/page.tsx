'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { format, subDays } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

export default function ReportsPage() {
    const [salesData, setSalesData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // days

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const endDate = new Date();
            const startDate = subDays(endDate, parseInt(dateRange));
            
            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');

            const [salesRes, productRes] = await Promise.all([
                apiRequest<{ data: any[] }>(`/reports/sales?start_date=${startStr}&end_date=${endStr}`),
                apiRequest<{ data: any[] }>(`/reports/top-products?start_date=${startStr}&end_date=${endStr}`)
            ]);

            setSalesData(salesRes.data);
            setTopProducts(productRes.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const endDate = new Date();
        const startDate = subDays(endDate, parseInt(dateRange));
        const startStr = format(startDate, 'yyyy-MM-dd');
        const endStr = format(endDate, 'yyyy-MM-dd');
        
        // Direct download link
        const token = localStorage.getItem('token');
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/reports/export?start_date=${startStr}&end_date=${endStr}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `sales_report_${startStr}_${endStr}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Sales Reports</h1>
              <div className="flex gap-2">
                 <select 
                    value={dateRange} 
                    onChange={e => setDateRange(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                 >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                 </select>
                 <button onClick={handleExport} className="btn-primary flex items-center gap-2">
                    <span className="material-icons text-sm">download</span>
                    Export CSV
                 </button>
              </div>
           </div>

           {loading ? (
               <div className="h-64 flex items-center justify-center text-gray-500">Loading charts...</div>
           ) : (
               <>
                   {/* Sales Chart */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h2 className="text-lg font-bold mb-4">Revenue Trend</h2>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                    tick={{fontSize: 12}}
                                />
                                <YAxis 
                                    tickFormatter={(val) => `Rp ${val/1000}k`}
                                    tick={{fontSize: 12}}
                                />
                                <Tooltip 
                                    formatter={(val: any) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val), 'Revenue']}
                                    labelFormatter={(label) => format(new Date(label), 'dd MMMM yyyy')}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Top Products Table */}
                       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <h2 className="text-lg font-bold mb-4">Top Products</h2>
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left text-gray-500">
                                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                      <tr>
                                          <th className="px-4 py-3">Product</th>
                                          <th className="px-4 py-3 text-right">Sold</th>
                                          <th className="px-4 py-3 text-right">Revenue</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {topProducts.map((item, idx) => (
                                          <tr key={idx} className="border-b last:border-0">
                                              <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                                              <td className="px-4 py-3 text-right">{item.quantity}</td>
                                              <td className="px-4 py-3 text-right font-bold text-orange-600">
                                                  {new Intl.NumberFormat('id-ID').format(item.revenue)}
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                       </div>

                       {/* Summary Stats or Another Chart */}
                       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center space-y-4">
                           <div className="p-4 bg-orange-50 rounded-full">
                               <span className="material-icons text-4xl text-orange-600">payments</span>
                           </div>
                           <div>
                               <p className="text-gray-500 text-sm">Total Revenue (Selected Period)</p>
                               <h3 className="text-3xl font-extrabold text-gray-900">
                                   {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                                       salesData.reduce((acc, curr) => acc + Number(curr.revenue), 0)
                                   )}
                               </h3>
                           </div>
                           <div className="text-sm text-gray-400">
                               From {salesData.length} days of activity
                           </div>
                       </div>
                   </div>
               </>
           )}
        </div>
    );
}
