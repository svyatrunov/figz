/**
 * Класс пикселя маны - визуальное представление маны, которую можно подобрать
 */

import { GAME_CONFIG, ConfigUtils } from '../config/GameBalance.js';

export class ManaPixel {
    constructor(scene, worldX, worldY, manaAmount = 10, pickupRadius = 20, attractionRadius = 60, attractionSpeed = 100) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.manaAmount = manaAmount;
        this.sprite = null;
        this.isAlive = true;
        
        // Используем переданные параметры или настройки по умолчанию
        this.pickupRadius = pickupRadius;
        this.attractionRadius = attractionRadius;
        this.attractionSpeed = attractionSpeed;
        
        // Создаем визуальное представление
        this.create();
    }
    
    create() {
        // Создаем пиксель маны (увеличен размер для лучшей видимости)
        this.sprite = this.scene.add.circle(0, 0, 8, 0x0088ff);
        this.sprite.setOrigin(0.5, 0.5);
        
        // Добавляем свечение
        this.sprite.setStrokeStyle(2, 0x00aaff);
        
        // Убеждаемся, что спрайт видим
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
        
        // Делаем спрайт видимым на всех слоях
        this.sprite.setDepth(1000);
        
        // Устанавливаем начальную позицию СРАЗУ после создания
        if (this.scene && this.scene.worldOffset) {
            const screenX = this.worldX - this.scene.worldOffset.x;
            const screenY = this.worldY - this.scene.worldOffset.y;
            this.sprite.setPosition(screenX, screenY);
            console.log(`ManaPixel: создан спрайт в мировых координатах (${this.worldX}, ${this.worldY}), экранные (${screenX.toFixed(1)}, ${screenY.toFixed(1)}), worldOffset (${this.scene.worldOffset.x}, ${this.scene.worldOffset.y})`);
        } else {
            // Если worldOffset еще не определен, устанавливаем позицию позже
            console.warn(`ManaPixel: worldOffset не определен при создании!`);
            this.sprite.setPosition(this.worldX, this.worldY);
        }
        
        // Добавляем пульсацию
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Обновить позицию на экране
     */
    updateScreenPosition() {
        if (!this.sprite) return;
        
        if (this.scene && this.scene.worldOffset) {
            const screenX = this.worldX - this.scene.worldOffset.x;
            const screenY = this.worldY - this.scene.worldOffset.y;
            this.sprite.setPosition(screenX, screenY);
            
            // Убеждаемся, что спрайт видим
            if (!this.sprite.visible) {
                this.sprite.setVisible(true);
            }
        } else {
            // Если worldOffset не определен, используем мировые координаты как экранные (для отладки)
            console.warn(`ManaPixel: worldOffset не определен! Используем мировые координаты`);
            this.sprite.setPosition(this.worldX, this.worldY);
        }
    }
    
    /**
     * Обновить пиксель маны
     * @param {number} delta - Время с последнего кадра
     * @param {object} hero - Герой для проверки подбора
     */
    update(delta, hero) {
        if (!this.isAlive || !this.sprite) return;
        
        // ВСЕГДА обновляем позицию на экране, даже если не на экране
        // Это важно, чтобы спрайт был виден когда игрок приблизится
        this.updateScreenPosition();
        
        // Проверяем, виден ли пиксель на экране (но не выходим, продолжаем обновлять позицию)
        // Логика притяжения и подбора выполняется только если на экране
        if (!this.isOnScreen()) {
            return; // Не обновляем логику, но позиция уже обновлена выше
        }
        
        // Получаем позицию героя в мировых координатах
        const heroPos = hero.getWorldPosition();
        
        // Оптимизированная проверка расстояния (без Math.sqrt)
        const dx = heroPos.x - this.worldX;
        const dy = heroPos.y - this.worldY;
        const distanceSquared = dx * dx + dy * dy;
        const attractionRadiusSquared = this.attractionRadius * this.attractionRadius;
        const pickupRadiusSquared = this.pickupRadius * this.pickupRadius;
        
        // Если герой близко, притягиваем пиксель
        if (distanceSquared <= attractionRadiusSquared) {
            // Избегаем деления на ноль
            if (distanceSquared > 0) {
                const distance = Math.sqrt(distanceSquared);
                const moveSpeed = this.attractionSpeed * (delta / 1000);
                const moveX = (dx / distance) * moveSpeed;
                const moveY = (dy / distance) * moveSpeed;
                
                this.worldX += moveX;
                this.worldY += moveY;
            }
        }
        
        // Проверяем подбор
        if (distanceSquared <= pickupRadiusSquared) {
            this.pickup(hero);
        }
    }
    
    /**
     * Проверить, находится ли пиксель на экране
     * @returns {boolean}
     */
    isOnScreen() {
        const screenX = this.worldX - this.scene.worldOffset.x;
        const screenY = this.worldY - this.scene.worldOffset.y;
        
        return screenX > -50 && screenX < this.scene.cameras.main.width + 50 &&
               screenY > -50 && screenY < this.scene.cameras.main.height + 50;
    }
    
    /**
     * Подобрать пиксель маны
     * @param {object} hero - Герой, который подбирает
     */
    pickup(hero) {
        if (!this.isAlive) return;
        
        // Добавляем ману герою
        hero.addMana(this.manaAmount);
        
        // Создаем эффект подбора
        this.createPickupEffect();
        
        // Уничтожаем пиксель
        this.destroy();
    }
    
    /**
     * Создать эффект подбора
     */
    createPickupEffect() {
        if (!this.sprite) return;
        
        // Анимация исчезновения
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.destroy();
            }
        });
        
        // Создаем частицы
        this.scene.motionParticleSystem.spawnManaParticles(this.worldX, this.worldY, this.manaAmount);
    }
    
    /**
     * Сбросить пиксель для повторного использования
     */
    reset(worldX, worldY, manaAmount, pickupRadius, attractionRadius, attractionSpeed) {
        this.worldX = worldX;
        this.worldY = worldY;
        this.manaAmount = manaAmount;
        this.pickupRadius = pickupRadius;
        this.attractionRadius = attractionRadius;
        this.attractionSpeed = attractionSpeed;
        this.isAlive = true;
        
        // Пересоздаем спрайт если нужно
        if (!this.sprite) {
            this.create();
        } else {
            this.updateScreenPosition();
        }
    }
    
    /**
     * Уничтожить пиксель маны
     */
    destroy() {
        this.isAlive = false;
        
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
    
    /**
     * Получить мировую позицию
     * @returns {object} {x, y}
     */
    getWorldPosition() {
        return { x: this.worldX, y: this.worldY };
    }
}
