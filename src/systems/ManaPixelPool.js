/**
 * Объектный пул для пикселей маны - оптимизация производительности
 */

import { ManaPixel } from '../entities/ManaPixel.js';

export class ManaPixelPool {
    constructor(scene, initialSize = 50) {
        this.scene = scene;
        this.pool = [];
        this.activePixels = [];
        
        // Предварительно создаем пиксели
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new ManaPixel(scene, 0, 0, 0));
        }
    }
    
    /**
     * Получить пиксель из пула
     */
    getPixel(worldX, worldY, manaAmount, pickupRadius, attractionRadius, attractionSpeed) {
        let pixel = this.pool.pop();
        
        if (!pixel) {
            // Если пул пуст, создаем новый
            pixel = new ManaPixel(this.scene, 0, 0, 0);
        }
        
        // Переинициализируем пиксель
        pixel.reset(worldX, worldY, manaAmount, pickupRadius, attractionRadius, attractionSpeed);
        this.activePixels.push(pixel);
        
        return pixel;
    }
    
    /**
     * Вернуть пиксель в пул
     */
    returnPixel(pixel) {
        const index = this.activePixels.indexOf(pixel);
        if (index !== -1) {
            this.activePixels.splice(index, 1);
            pixel.destroy();
            this.pool.push(pixel);
        }
    }
    
    /**
     * Обновить все активные пиксели
     */
    update(delta, hero) {
        for (let i = this.activePixels.length - 1; i >= 0; i--) {
            const pixel = this.activePixels[i];
            
            if (!pixel.isAlive) {
                this.returnPixel(pixel);
                continue;
            }
            
            pixel.update(delta, hero);
        }
    }
    
    /**
     * Очистить все пиксели
     */
    clear() {
        this.activePixels.forEach(pixel => this.returnPixel(pixel));
        this.activePixels = [];
    }
    
    /**
     * Получить статистику
     */
    getStats() {
        return {
            poolSize: this.pool.length,
            activeCount: this.activePixels.length,
            totalCapacity: this.pool.length + this.activePixels.length
        };
    }
}


