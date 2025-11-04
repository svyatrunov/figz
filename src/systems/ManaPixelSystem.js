/**
 * Система управления пикселями маны
 * Создает, обновляет и управляет пикселями маны на карте
 */

import { ManaPixel } from '../entities/ManaPixel.js';
import { GAME_CONFIG, ConfigUtils } from '../config/GameBalance.js';

export class ManaPixelSystem {
    constructor(scene) {
        this.scene = scene;
        this.manaPixels = [];
        
        // Получаем настройки из конфигурации
        const config = ConfigUtils.getManaPixelConfig();
        this.maxPixels = config.maxPixels;
        this.cleanupDistance = config.cleanupDistance;
        this.pickupRadius = config.pickupRadius;
        this.attractionRadius = config.attractionRadius;
        this.attractionSpeed = config.attractionSpeed;
        this.spawnDelay = config.spawnDelay;
    }
    
    /**
     * Создать пиксель маны на месте смерти врага
     * @param {number} worldX - Мировая координата X
     * @param {number} worldY - Мировая координата Y
     * @param {number} manaAmount - Количество маны
     */
    spawnManaPixel(worldX, worldY, manaAmount = 10) {
        if (!this.scene) {
            console.error('ManaPixelSystem: сцена не определена!');
            return;
        }
        
        // Ограничиваем количество пикселей
        if (this.manaPixels.length >= this.maxPixels) {
            // Удаляем самый старый пиксель
            const oldestPixel = this.manaPixels.shift();
            if (oldestPixel) {
                oldestPixel.destroy();
            }
        }
        
        // Создаем новый пиксель с текущими настройками радиуса
        const pixel = new ManaPixel(this.scene, worldX, worldY, manaAmount, this.pickupRadius, this.attractionRadius, this.attractionSpeed);
        this.manaPixels.push(pixel);
        
        console.log(`ManaPixelSystem: создан пиксель маны +${manaAmount} в позиции (${worldX}, ${worldY}), всего пикселей: ${this.manaPixels.length}`);
        
        // Проверяем, что спрайт действительно создан
        if (pixel.sprite) {
            console.log(`ManaPixelSystem: спрайт создан, позиция (${pixel.sprite.x.toFixed(1)}, ${pixel.sprite.y.toFixed(1)}), видим: ${pixel.sprite.visible}, глубина: ${pixel.sprite.depth}`);
        } else {
            console.error('ManaPixelSystem: СПРАЙТ НЕ СОЗДАН!');
        }
    }
    
    /**
     * Обновить все пиксели маны
     * @param {number} delta - Время с последнего кадра
     * @param {object} hero - Герой для проверки подбора
     */
    update(delta, hero) {
        if (!this.manaPixels || !Array.isArray(this.manaPixels)) return;
        
        // Обновляем все пиксели
        this.manaPixels.forEach(pixel => {
            if (pixel.isAlive) {
                pixel.update(delta, hero);
            }
        });
        
        // Удаляем мертвые пиксели
        this.cleanupDeadPixels();
        
        // Очищаем пиксели, которые слишком далеко от героя
        this.cleanupDistantPixels(hero);
    }
    
    /**
     * Удалить мертвые пиксели
     */
    cleanupDeadPixels() {
        const initialCount = this.manaPixels.length;
        this.manaPixels = this.manaPixels.filter(pixel => pixel.isAlive);
        
        if (this.manaPixels.length < initialCount) {
            console.log(`ManaPixelSystem: удалено ${initialCount - this.manaPixels.length} мертвых пикселей`);
        }
    }
    
    /**
     * Очистить пиксели, которые слишком далеко от героя
     * @param {object} hero - Герой для проверки расстояния
     */
    cleanupDistantPixels(hero) {
        if (!hero) return;
        
        const cleanupDistanceSquared = this.cleanupDistance * this.cleanupDistance;
        
        // Получаем позицию героя в мировых координатах
        const heroPos = hero.getWorldPosition();
        
        // Безопасное удаление - итерируемся в обратном порядке
        for (let i = this.manaPixels.length - 1; i >= 0; i--) {
            const pixel = this.manaPixels[i];
            if (!pixel.isAlive) continue;
            
            const dx = heroPos.x - pixel.worldX;
            const dy = heroPos.y - pixel.worldY;
            const distanceSquared = dx * dx + dy * dy;
            
            // Если пиксель слишком далеко, удаляем его
            if (distanceSquared > cleanupDistanceSquared) {
                pixel.destroy();
                this.manaPixels.splice(i, 1);
            }
        }
    }
    
    /**
     * Получить статистику системы
     * @returns {object} Статистика пикселей маны
     */
    getStats() {
        const alivePixels = this.manaPixels.filter(pixel => pixel.isAlive);
        const totalMana = alivePixels.reduce((sum, pixel) => sum + pixel.manaAmount, 0);
        
        return {
            totalPixels: this.manaPixels.length,
            alivePixels: alivePixels.length,
            totalMana: totalMana
        };
    }
    
    /**
     * Очистить все пиксели маны
     */
    clear() {
        console.log('ManaPixelSystem: очистка всех пикселей маны');
        
        if (this.manaPixels && Array.isArray(this.manaPixels)) {
            this.manaPixels.forEach(pixel => pixel.destroy());
        }
        
        this.manaPixels = [];
    }
    
    /**
     * Изменить радиус подбора пикселей маны
     * @param {number} newRadius - Новый радиус подбора
     */
    setPickupRadius(newRadius) {
        this.pickupRadius = newRadius;
        console.log(`ManaPixelSystem: радиус подбора изменен на ${newRadius}px`);
    }
    
    /**
     * Изменить радиус притяжения пикселей маны
     * @param {number} newRadius - Новый радиус притяжения
     */
    setAttractionRadius(newRadius) {
        this.attractionRadius = newRadius;
        console.log(`ManaPixelSystem: радиус притяжения изменен на ${newRadius}px`);
    }
    
    /**
     * Уничтожить систему
     */
    destroy() {
        this.clear();
    }
}
