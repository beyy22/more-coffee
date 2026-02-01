'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { format } from 'date-fns';

export default function InventoryPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [note, setNote] = useState('');
    const [resmitting, setResmitting] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await apiRequest<{ data: { data: any[] } }>('/inventory/logs?per_page=20');
            setLogs(response.data.data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = async () => {
        setShowModal(true);
        // Fetch products for dropdown if not loaded
        if (products.length === 0) {
            try {
                const res = await apiRequest<{ data: { data: any[] } }>('/products?per_page=100'); // simple fetch
                setProducts(res.data.data);
            } catch (e) {
                console.error('Failed to fetch products', e);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResmitting(true);
        try {
            await apiRequest('/inventory/add', {
                method: 'POST',
                body: {
                    product_uuid: selectedProduct,
                    type: 'in', // Force 'in' for Restock button. Later can add 'out' toggle if needed.
                    quantity: parseInt(quantity),
                    note: note
                }
            });
            setShowModal(false);
            setQuantity('');
            setNote('');
            setSelectedProduct('');
            fetchLogs(); // Refresh table
            alert('Stock added successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to add stock');
        } finally {
            setResmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Inventory & Logs</h1>
                <button 
                    onClick={handleOpenModal}
                    className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <span className="material-icons text-sm">add</span>
                    Restock Item
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3 text-right">Qty</th>
                            <th className="px-6 py-3 text-right">Current Stock</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                             <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No inventory history found.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {format(new Date(log.created_at), 'dd MMM yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {log.product?.name || 'Unknown Product'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                            log.type === 'in' ? 'bg-green-100 text-green-700' : 
                                            log.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {log.current_stock}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {log.user?.name || 'System'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 italic truncate max-w-xs block">
                                        {log.note || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Restock Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Restock Inventory</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                                <select 
                                    required
                                    value={selectedProduct}
                                    onChange={e => setSelectedProduct(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                >
                                    <option value="">-- Choose Product --</option>
                                    {products.map(p => (
                                        <option key={p.uuid} value={p.uuid}>{p.name} (Stock: {p.stock})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                    placeholder="e.g. 10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                                <input 
                                    type="text" 
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                    placeholder="e.g. Belanja Pasar Minggu"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={resmitting}
                                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {resmitting ? 'Saving...' : 'Confirm Restock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
