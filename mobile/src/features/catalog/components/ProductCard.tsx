import { memo } from 'react';
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Product } from '@/shared/types/models';
import { formatCurrency } from '@/shared/utils/format';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

export const ProductCard = memo(function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="image-outline" size={60} color="#ccc" />
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {product.name}
        </Text>
        
        {/* Amazon usually shows rating stars here */}
        <View style={styles.ratingRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <MaterialCommunityIcons key={i} name="star" size={16} color="#FFA41C" />
          ))}
          <MaterialCommunityIcons name="star-half-full" size={16} color="#FFA41C" />
          <Text style={styles.ratingCount}> 1.024</Text>
        </View>

        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        
        {/* Prime mockup */}
        <View style={styles.primeRow}>
          <Text style={styles.primeText}>prime</Text>
          <Text style={styles.deliveryText}>Receba amanhã</Text>
        </View>

        <Button 
          mode="contained" 
          buttonColor="#FFD814" 
          textColor="#0F1111" 
          onPress={onAddToCart}
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
        >
          Adicionar ao carrinho
        </Button>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#0F1111',
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#007185',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F1111',
    marginTop: 6,
  },
  primeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  primeText: {
    color: '#00A8E1',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 14,
  },
  deliveryText: {
    fontSize: 12,
    color: '#565959',
  },
  addButton: {
    marginTop: 12,
    borderRadius: 20, // Pill shaped like Amazon
  },
  addButtonLabel: {
    fontSize: 13,
  },
});
