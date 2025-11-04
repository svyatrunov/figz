/**
 * Класс врага для Phaser - противник героя
 * Реализует движение к герою по мировым координатам с масштабированием по уровням
 */

import { GAME_CONFIG, ConfigUtils } from '../config/GameBalance.js';

export class Enemy {
    constructor(scene, worldX, worldY, elapsedTime = 0, enemyType = 'normal', playerLevel = 1) {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.sprite = null;
        
        // Тип врага и уровень игрока
        this.enemyType = enemyType;
        this.playerLevel = playerLevel;
        
        // Получаем характеристики из конфигурации
        const stats = ConfigUtils.getEnemyStats(enemyType, playerLevel);
        this.maxHP = stats.hp;
        this.currentHP = this.maxHP;
        this.speed = this.calculateSpeedFromType();
        
        // Состояние
        this.isAlive = true;
        this.hitRadius = 30; // Радиус попадания в героя
        
        // Эффекты
        this.slowEffect = 0; // Замедление (0 = нет, 1 = полная остановка)
        this.originalSpeed = this.speed;
        
        // Информация о последнем элементе, нанесшем урон
        this.lastDamageElementType = 'default';
        
        // Создаем визуальное представление
        this.create();
        
        // console.log(`Enemy: создан в позиции (${worldX}, ${worldY}) с HP=${this.maxHP}, Speed=${this.speed}`);
    }
    
    /**
     * Вычислить скорость на основе типа врага
     * @returns {number} Скорость врага
     */
    calculateSpeedFromType() {
        const baseSpeeds = {
            weak: 30,
            normal: 40,
            elite: 50,
            boss: 25
        };
        
        const baseSpeed = baseSpeeds[this.enemyType] || 40;
        
        // Небольшое увеличение скорости с уровнем (5% за уровень)
        const levelMultiplier = 1 + (this.playerLevel - 1) * 0.05;
        
        return baseSpeed * levelMultiplier;
    }

    create() {
        // Определяем цвет и размер в зависимости от типа врага
        const enemyConfig = this.getEnemyVisualConfig();
        
        // Создаем спрайт врага
        this.sprite = this.scene.add.rectangle(0, 0, enemyConfig.size, enemyConfig.size, enemyConfig.color);
        this.sprite.setOrigin(0.5, 0.5);
        
        // Добавляем визуальные эффекты для элитных врагов и боссов
        if (this.enemyType === 'elite' || this.enemyType === 'boss') {
            this.addEliteEffects();
        }
        
        // Устанавливаем начальную позицию
        this.updateScreenPosition();
    }
    
    /**
     * Получить визуальную конфигурацию для типа врага
     * @returns {object} Конфигурация {color, size}
     */
    getEnemyVisualConfig() {
        const configs = {
            weak: { color: 0xff6666, size: 15 },      // Светло-красный, маленький
            normal: { color: 0xff0000, size: 20 },    // Красный, средний
            elite: { color: 0xff8800, size: 25 },     // Оранжевый, большой
            boss: { color: 0x8800ff, size: 35 }        // Фиолетовый, очень большой
        };
        
        return configs[this.enemyType] || configs.normal;
    }
    
    /**
     * Добавить визуальные эффекты для элитных врагов
     */
    addEliteEffects() {
        // Добавляем свечение для элитных врагов
        this.sprite.setStrokeStyle(2, 0xffffff);
        
        // Добавляем пульсацию для боссов
        if (this.enemyType === 'boss') {
            this.scene.tweens.add({
                targets: this.sprite,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    /**
     * Вычислить скорость на основе времени игры
     * @param {number} elapsedTime - Время игры в секундах
     * @returns {number} Скорость врага
     */
    calculateSpeed(elapsedTime) {
        return this.baseSpeed * Math.pow(1.05, elapsedTime / 30);
    }

    /**
     * Вычислить HP на основе времени игры
     * @param {number} elapsedTime - Время игры в секундах
     * @returns {number} Максимальное HP врага
     */
    calculateHP(elapsedTime) {
        return this.baseHP * Math.pow(1.15, elapsedTime / 30);
    }

    /**
     * Обновить позицию спрайта на экране
     */
    updateScreenPosition() {
        if (this.sprite) {
            this.sprite.x = this.worldX - this.scene.worldOffset.x;
            this.sprite.y = this.worldY - this.scene.worldOffset.y;
        }
    }


    /**
     * Обновить врага
     * @param {number} delta - Время с последнего кадра в миллисекундах
     * @param {object} hero - Объект героя
     */
    update(delta, hero) {
        if (!this.isAlive) return;

        // Получаем позицию героя в мировых координатах
        const heroPos = hero.getWorldPosition();
        
        // Временная отладка
        // if (Math.random() < 0.01) {
        //     console.log(`=== ENEMY DEBUG ===`);
        //     console.log(`Hero world pos: (${Math.round(heroPos.x)}, ${Math.round(heroPos.y)})`);
        //     console.log(`Enemy world pos: (${Math.round(this.worldX)}, ${Math.round(this.worldY)})`);
        //     console.log(`WorldOffset: (${Math.round(this.scene.worldOffset.x)}, ${Math.round(this.scene.worldOffset.y)})`);
        // }
        
        // Простое движение к герою
        const dx = heroPos.x - this.worldX;
        const dy = heroPos.y - this.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Двигаемся к герою, если не достигли его
        if (distance > 0) {
            const moveSpeed = this.speed * (delta / 1000);
            
            // Нормализуем направление и применяем скорость
            this.worldX += (dx / distance) * moveSpeed;
            this.worldY += (dy / distance) * moveSpeed;
            
            // Обновляем экранную позицию
            this.updateScreenPosition();
            
            // Проверяем попадание в героя
            if (distance < this.hitRadius) {
                console.log("HIT! Враг достиг героя!");
            }
        }
    }

    /**
     * Получить урон
     * @param {number} damage - Количество урона
     * @param {string} elementType - Тип элемента, нанесшего урон
     */
    takeDamage(damage, elementType = 'default') {
        this.currentHP -= damage;
        this.lastDamageElementType = elementType;
        if (this.currentHP <= 0) {
            this.die();
        }
    }

    /**
     * Уничтожить врага
     */
    die() {
        this.isAlive = false;
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    /**
     * Проверить, жив ли враг
     * @returns {boolean} Жив ли враг
     */
    isDead() {
        return !this.isAlive;
    }

    /**
     * Получить мировую позицию врага
     * @returns {object} Позиция {x, y}
     */
    getWorldPosition() {
        return {
            x: this.worldX,
            y: this.worldY
        };
    }

    /**
     * Получить спрайт врага
     * @returns {Phaser.GameObjects.Rectangle} Спрайт врага
     */
    getSprite() {
        return this.sprite;
    }

    /**
     * Применить эффект замедления
     * @param {number} slowAmount - Количество замедления (0-1)
     */
    applySlowEffect(slowAmount) {
        this.slowEffect = Math.max(0, Math.min(1, slowAmount));
        this.speed = this.originalSpeed * (1 - this.slowEffect);
        // console.log(`Enemy: применено замедление ${(this.slowEffect * 100).toFixed(0)}%, скорость: ${this.originalSpeed} → ${this.speed}`);
    }
    
    /**
     * Убрать эффект замедления
     */
    removeSlowEffect() {
        this.slowEffect = 0;
        this.speed = this.originalSpeed;
        // console.log(`Enemy: замедление снято, скорость восстановлена: ${this.speed}`);
    }
    
    /**
     * Проверить, есть ли эффект замедления
     * @returns {boolean} true если есть замедление
     */
    hasSlowEffect() {
        return this.slowEffect > 0;
    }

    /**
     * Уничтожить врага (очистка ресурсов)
     */
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.isAlive = false;
    }
}