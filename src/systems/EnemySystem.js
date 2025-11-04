/**
 * Система управления врагами для Phaser
 * Реализует умный спавн врагов и экспоненциальное увеличение сложности
 */

import { Enemy } from '../entities/Enemy.js';
import { GAME_CONFIG, ConfigUtils } from '../config/GameBalance.js';

export class EnemySystem {
    constructor(scene, hero, worldSystem) {
        this.scene = scene;
        this.hero = hero;
        this.worldSystem = worldSystem;
        
        // Массив врагов
        this.enemies = [];
        
        // Время игры
        this.elapsedTime = 0;
        
        // Параметры спавна
        this.baseSpawnInterval = 2.5; // Базовый интервал спавна в секундах (уменьшено с 5.0 до 2.5)
        this.lastSpawnTime = 0;
        
        // Параметры спавна
        this.spawnDistance = { min: 500, max: 650 }; // Дистанция спавна от героя
        this.directionSpawnChance = 0.7; // 70% шанс спавна по направлению движения
        
        // Глобальные флаги для комбо-эффектов
        this.globalFlags = {
            iceSpikes: false
        };
        
        console.log('EnemySystem: инициализирован');
    }

    /**
     * Обновить систему врагов
     * @param {number} time - Время игры в миллисекундах
     * @param {number} delta - Время с последнего кадра в миллисекундах
     * @param {object} worldOffset - Смещение мира
     */
    update(time, delta, worldOffset) {
        // Обновляем время игры
        this.elapsedTime = time / 1000; // Конвертируем в секунды
        
        // Обновляем интервал спавна (уменьшается со временем)
        const spawnInterval = this.calculateSpawnInterval();
        
        // Проверяем, нужно ли спавнить нового врага
        if (time - this.lastSpawnTime >= spawnInterval * 1000) {
            this.spawnEnemy();
            this.lastSpawnTime = time;
        }
        
        // Обновляем всех врагов
        this.updateEnemies(delta);
        
        // Удаляем мертвых врагов
        this.cleanupDeadEnemies();
    }

    /**
     * Вычислить текущий интервал спавна
     * @returns {number} Интервал спавна в секундах
     */
    calculateSpawnInterval() {
        return this.baseSpawnInterval * Math.pow(0.95, this.elapsedTime / 30);
    }

    /**
     * Спавнить нового врага
     */
    spawnEnemy() {
        const heroPos = this.hero.getWorldPosition();
        let spawnX, spawnY;
        
        // Определяем позицию спавна
        if (Math.random() < this.directionSpawnChance) {
            // 70% шанс: спавн по направлению движения
            spawnX = heroPos.x + this.getDirectionSpawnOffset().x;
            spawnY = heroPos.y + this.getDirectionSpawnOffset().y;
        } else {
            // 30% шанс: случайный спавн по окружности
            const spawnPos = this.getRandomSpawnPosition(heroPos);
            spawnX = spawnPos.x;
            spawnY = spawnPos.y;
        }
        
        // Определяем тип врага на основе уровня героя
        const enemyType = this.determineEnemyType();
        
        // Создаем врага с масштабированием по уровню
        const enemy = new Enemy(this.scene, spawnX, spawnY, this.elapsedTime, enemyType, this.hero.level);
        this.enemies.push(enemy);
        
        // console.log(`EnemySystem: спавн врага в позиции (${Math.round(spawnX)}, ${Math.round(spawnY)})`);
    }
    
    /**
     * Определить тип врага на основе уровня героя
     * @returns {string} Тип врага
     */
    determineEnemyType() {
        const level = this.hero.level;
        const random = Math.random();
        
        // Вероятности спавна разных типов врагов по уровням
        if (level <= 2) {
            // Уровни 1-2: только слабые враги
            return 'weak';
        } else if (level <= 4) {
            // Уровни 3-4: 80% слабые, 20% обычные
            return random < 0.8 ? 'weak' : 'normal';
        } else if (level <= 6) {
            // Уровни 5-6: 60% слабые, 35% обычные, 5% элитные
            if (random < 0.6) return 'weak';
            if (random < 0.95) return 'normal';
            return 'elite';
        } else if (level <= 8) {
            // Уровни 7-8: 40% слабые, 45% обычные, 15% элитные
            if (random < 0.4) return 'weak';
            if (random < 0.85) return 'normal';
            return 'elite';
        } else {
            // Уровни 9-10: 20% слабые, 50% обычные, 25% элитные, 5% боссы
            if (random < 0.2) return 'weak';
            if (random < 0.7) return 'normal';
            if (random < 0.95) return 'elite';
            return 'boss';
        }
    }

    /**
     * Получить смещение для спавна по направлению движения
     * @returns {object} Смещение {x, y}
     */
    getDirectionSpawnOffset() {
        // Получаем направление движения героя из worldOffset
        const directionX = this.scene.worldOffset.x - (this.scene.lastWorldOffset?.x || 0);
        const directionY = this.scene.worldOffset.y - (this.scene.lastWorldOffset?.y || 0);
        
        // Если герой не двигался, используем случайное направление
        if (directionX === 0 && directionY === 0) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.spawnDistance.min + Math.random() * (this.spawnDistance.max - this.spawnDistance.min);
            return {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            };
        }
        
        // Нормализуем направление движения
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedX = directionX / length;
        const normalizedY = directionY / length;
        
        // Добавляем небольшое случайное отклонение (±30 градусов)
        const deviation = (Math.random() - 0.5) * Math.PI / 3;
        const angle = Math.atan2(normalizedY, normalizedX) + deviation;
        
        const distance = this.spawnDistance.min + Math.random() * (this.spawnDistance.max - this.spawnDistance.min);
        
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance
        };
    }

    /**
     * Получить случайную позицию спавна по окружности
     * @param {object} heroPos - Позиция героя {x, y}
     * @returns {object} Позиция спавна {x, y}
     */
    getRandomSpawnPosition(heroPos) {
        const angle = Math.random() * Math.PI * 2;
        const distance = this.spawnDistance.min + Math.random() * (this.spawnDistance.max - this.spawnDistance.min);
        
        return {
            x: heroPos.x + Math.cos(angle) * distance,
            y: heroPos.y + Math.sin(angle) * distance
        };
    }

    /**
     * Обновить всех врагов
     * @param {number} delta - Время с последнего кадра в миллисекундах
     */
    updateEnemies(delta) {
        if (this.enemies && Array.isArray(this.enemies)) {
            this.enemies.forEach(enemy => {
                if (enemy.isAlive) {
                    enemy.update(delta, this.hero);
                }
            });
        }
    }

    /**
     * Удалить мертвых врагов
     */
    cleanupDeadEnemies() {
        const initialCount = this.enemies.length;
        
        // Обрабатываем смерть врагов перед удалением
        if (this.enemies && Array.isArray(this.enemies)) {
            this.enemies.forEach(enemy => {
                if (!enemy.isAlive) {
                    // Создаем эффект смерти
                    this.scene.deathVFXSystem.spawnDeathVFX(enemy.worldX, enemy.worldY, enemy.lastDamageElementType);
                    
                    // Создаем пиксель маны при смерти врага
                    if (!enemy.manaPixelCreated && enemy.worldX !== undefined && enemy.worldY !== undefined) {
                        const manaAmount = GAME_CONFIG.MANA_SYSTEM.manaOnKill[enemy.enemyType] || 0;
                        if (manaAmount > 0 && this.scene.manaPixelSystem) {
                            this.scene.manaPixelSystem.spawnManaPixel(enemy.worldX, enemy.worldY, manaAmount);
                            console.log(`Enemy death: ${enemy.enemyType} killed, created mana pixel +${manaAmount}`);
                            enemy.manaPixelCreated = true;
                        }
                    }
                }
            });
        }
        
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
        
        if (this.enemies.length < initialCount) {
            // console.log(`EnemySystem: удалено ${initialCount - this.enemies.length} мертвых врагов`);
        }
    }

    /**
     * Получить всех живых врагов
     * @returns {Array} Массив живых врагов
     */
    getEnemies() {
        return this.enemies.filter(enemy => enemy.isAlive);
    }

    /**
     * Получить количество живых врагов
     * @returns {number} Количество живых врагов
     */
    getEnemyCount() {
        return this.enemies.filter(enemy => enemy.isAlive).length;
    }

    /**
     * Получить статистику системы
     * @returns {object} Статистика системы врагов
     */
    getStats() {
        return {
            totalEnemies: this.enemies.length,
            aliveEnemies: this.getEnemyCount(),
            elapsedTime: this.elapsedTime,
            spawnInterval: this.calculateSpawnInterval(),
            baseSpawnInterval: this.baseSpawnInterval
        };
    }

    /**
     * Очистить всех врагов
     */
    clear() {
        // console.log('EnemySystem: очистка всех врагов');
        if (this.enemies && Array.isArray(this.enemies)) {
            this.enemies.forEach(enemy => enemy.destroy());
        }
        this.enemies = [];
        this.elapsedTime = 0;
        this.lastSpawnTime = 0;
    }

    /**
     * Найти ближайшего живого врага к герою
     * @param {object} heroWorldPos - Мировая позиция героя {x, y}
     * @returns {Enemy|null} Ближайший враг или null
     */
    getNearestEnemy(heroWorldPos) {
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            const enemyPos = enemy.getWorldPosition();
            const dx = enemyPos.x - heroWorldPos.x;
            const dy = enemyPos.y - heroWorldPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        return nearestEnemy;
    }

    /**
     * Обновить глобальные флаги
     * @param {object} flags - Флаги от RuneCastSystem
     */
    updateGlobalFlags(flags) {
        this.globalFlags = { ...flags };
    }
    
    /**
     * Применить эффект ледяных шипов ко всем врагам
     */
    applyIceSpikesEffect() {
        if (!this.globalFlags.iceSpikes) return;
        
        if (this.enemies && Array.isArray(this.enemies)) {
            this.enemies.forEach(enemy => {
                if (enemy.isAlive) {
                    // Применяем замедление на 40%
                    enemy.applySlowEffect(0.4); // 40% замедление
                }
            });
        }
    }
    
    /**
     * Уничтожить систему (очистка ресурсов)
     */
    destroy() {
        this.clear();
    }
}
