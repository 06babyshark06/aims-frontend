import { Product } from '@/types/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
// import { formatCurrency } from '@/lib/utils'; 

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Giả lập ảnh dựa trên loại sản phẩm
  const placeholderImage = `https://placehold.co/400x600?text=${product.productType.toUpperCase()}`;

  const handleAddToCart = () => {
    // Gọi API POST /cart/items
    console.log('Add to cart:', product.id);
    alert(`Đã thêm ${product.title} vào giỏ!`);
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg bg-gray-100">
         <img 
            src={placeholderImage} 
            alt={product.title}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
         />
         {product.quantity === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Hết hàng
            </Badge>
         )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
          {product.category}
        </div>
        <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
          {product.title}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)}
          </span>
          {product.originalValue > product.currentPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalValue)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2" 
          onClick={handleAddToCart}
          disabled={product.quantity === 0}
        >
          <ShoppingCart size={16} />
          {product.quantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
        </Button>
      </CardFooter>
    </Card>
  );
}