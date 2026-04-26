import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gift } from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const OccasionProducts = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Convert slug back to readable occasion name
        const occasionName = name?.replace(/-/g, ' ') || '';
        
        const response = await productService.getAll({
          occasion: occasionName,
        });

        setProducts(response?.data?.data || []);
        
        if (response?.data?.data?.length === 0) {
          toast('No products found for this occasion', { icon: '🎁' });
        }
      } catch (error) {
        console.error('Error loading occasion products:', error);
        toast.error('Failed to load occasion products');
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      loadProducts();
    }
  }, [name]);

  // Format display name (convert slug to readable format)
  const getDisplayName = () => {
    if (!name) return 'Occasion';
    return name
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Back</span>
        </button>

        {/* Heading Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Gift size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-heading">
            {getDisplayName()}
          </h1>
          <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full" />
          <p className="text-sm text-muted uppercase tracking-widest mt-4">
            {products.length} {products.length === 1 ? 'Product' : 'Products'} Curated For You
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, i) => <CardSkeleton key={i} />)
          }
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/20 flex items-center justify-center">
              <Gift size={48} className="text-muted/40" />
            </div>
            <h3 className="text-2xl font-black text-heading mb-2">No Products Found</h3>
            <p className="text-muted mb-6">
              We couldn't find any products for {getDisplayName()}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OccasionProducts;