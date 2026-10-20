import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { initialProducts, categoriesData } from '../data/menu';
import { getProductImage } from '../lib/utils';

describe('Sistema Integral de Imágenes de CHAVES BURGUER', () => {
  const publicImagesDir = path.resolve(process.cwd(), 'public/images');
  const availableImageFiles = fs.readdirSync(publicImagesDir);

  it('1. Debe existir el directorio public/images con archivos reales descargados', () => {
    expect(fs.existsSync(publicImagesDir)).toBe(true);
    expect(availableImageFiles.length).toBeGreaterThanOrEqual(20);
  });

  it('2. Ningún archivo de imagen debe tener tamaño 0 o estar vacío', () => {
    availableImageFiles.forEach((filename) => {
      const fullPath = path.join(publicImagesDir, filename);
      const stat = fs.statSync(fullPath);
      expect(stat.size, `El archivo ${filename} está vacío`).toBeGreaterThan(1000);
    });
  });

  it('3. Todos los 110 productos del catálogo deben tener propiedad image definida', () => {
    expect(initialProducts.length).toBe(110);
    initialProducts.forEach((p) => {
      expect(p.image, `Producto ${p.name} carece de image`).toBeDefined();
      expect(p.image).toMatch(/^\/images\/[\w-]+\.jpg$/);
    });
  });

  it('4. Cada ruta de imagen en el catálogo debe corresponder a un archivo real existente en disco', () => {
    initialProducts.forEach((p) => {
      const filename = (p.image || '').replace('/images/', '');
      const exists = availableImageFiles.includes(filename);
      expect(exists, `La imagen ${p.image} del producto "${p.name}" no existe en ${publicImagesDir}`).toBe(true);
    });
  });

  it('5. getProductImage debe retornar imágenes válidas existentes para todas las categorías', () => {
    categoriesData.forEach((cat) => {
      const resolved = getProductImage({ categoryId: cat.id, name: '' });
      const filename = resolved.replace('/images/', '');
      expect(availableImageFiles.includes(filename), `Categoría ${cat.id} generó imagen inexistente ${resolved}`).toBe(true);
    });
  });

  it('6. getProductImage debe curar y sustituir referencias obsoletas o con patrón ajedrez (burger-sample.png)', () => {
    const cured = getProductImage({
      categoryId: 'burgers',
      name: 'Hamburguesa Clásica',
      image: '/images/burger-sample.png',
    });
    expect(cured).not.toContain('burger-sample.png');
    expect(cured).toMatch(/^\/images\/burger-.*\.jpg$/);
  });

  it('7. Detección contextual por nombre asigna imágenes diferenciadas para platos emblemáticos', () => {
    const alitas = getProductImage({ categoryId: 'asados', name: 'Alitas a la BBQ' });
    expect(alitas).toBe('/images/alitas.jpg');

    const papas = getProductImage({ categoryId: 'adiciones', name: 'Porción de Papas Francesas' });
    expect(papas).toBe('/images/papas-francesas.jpg');

    const pizzaPepperoni = getProductImage({ categoryId: 'pizzas', name: 'Pizza Pepperoni' });
    expect(pizzaPepperoni).toBe('/images/pizza-pepperoni.jpg');

    const jugo = getProductImage({ categoryId: 'bebidas', name: 'Jugo Natural en Agua' });
    expect(jugo).toBe('/images/jugos-naturales.jpg');
  });
});
