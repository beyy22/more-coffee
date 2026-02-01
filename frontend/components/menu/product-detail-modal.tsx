'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Product {
  uuid: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: { name: string };
  stock: number;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  // Reset quantity when product changes
  useEffect(() => {
    if (isOpen) {
        setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handleIncrement = () => {
    if (quantity < product.stock) {
        setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
        setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-2xl overflow-hidden max-w-md mx-auto h-[85vh] flex flex-col"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) {
                onClose();
              }
            }}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing bg-white z-10">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 pb-24 hide-scrollbar">
                {/* Image Header */}
                <div className="relative aspect-square w-full bg-gray-100">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="material-icons text-6xl opacity-50">coffee</span>
                        </div>
                    )}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-900 z-20"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Info Text */}
                <div className="px-6 py-6">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                             <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                                {product.category?.name || 'Menu'}
                             </span>
                             <h2 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h2>
                        </div>
                        <div className="text-right">
                             <p className="text-xl font-black text-gray-900">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                             </p>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {product.description || 'Nikmati rasa kopi premium terbaik dengan bahan pilihan berkualitas. Cocok untuk menemani harimu.'}
                    </p>


                </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button 
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-900 disabled:opacity-50 disabled:shadow-none"
                        >
                            <span className="material-icons text-sm">remove</span>
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                        <button 
                            onClick={handleIncrement}
                            disabled={quantity >= product.stock}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-900 disabled:opacity-50 disabled:shadow-none"
                        >
                            <span className="material-icons text-sm">add</span>
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-gray-900 text-white h-12 rounded-full font-bold flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
                    >
                        <span>Add to Cart</span>
                        <span>•</span>
                        <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price * quantity)}</span>
                    </button>
                </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
