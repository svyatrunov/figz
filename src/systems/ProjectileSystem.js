/**
 * Система управления снарядами для Phaser
 * Реализует создание, обновление и проверку попаданий снарядов
 */

import { Projectile } from '../entities/Projectile.js';

export class ProjectileSystem {
    constructor(scene, enemySystem) {
        this.scene = scene;
        this.enemySystem = enemySystem;
        
        // Массив снарядов
        this.projectiles = [];
        
        // Параметры снарядов
        this.projectileSpeed = 400; // Скорость снаряда в пикселях в секунду
        this.projectileLifetime = 3000; // Время жизни снаряда в миллисекундах
        
        // Комбо-эффекты
        this.comboFlags = {
            iceSpikes: false,
            berserkerSpeed: false,
            explosiveShot: false,
            universalMode: false,
            standardBuff: false
        };
        
        // console.log('ProjectileSystem: инициализирован');
    }

    /**
     * Создать снаряд
     * @param {object} heroPos - Позиция героя {x, y}
     * @param {object} enemyPos - Позиция цели {x, y}
     * @param {number} damage - Урон снаряда
     */
    spawnProjectile(heroPos, enemyPos, damage) {
        // Вычисляем направление к цели
        const dx = enemyPos.x - heroPos.x;
        const dy = enemyPos.y - heroPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если цель слишком близко, не создаем снаряд
        if (distance < 10) {
            return;
        }
        
        // Нормализуем направление
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;
        
        // Вычисляем скорость с учетом комбо-эффектов
        let projectileSpeed = this.projectileSpeed;
        if (this.comboFlags.berserkerSpeed) {
            projectileSpeed *= 1.5; // Увеличиваем скорость полета для бешеной скорости
        }
        if (this.comboFlags.universalMode) {
            projectileSpeed *= 1.15; // +15% скорость для универсального режима
        }
        
        const velocityX = normalizedX * projectileSpeed;
        const velocityY = normalizedY * projectileSpeed;
        
        // Получаем текущий тип элемента
        const elementType = this.scene.getCurrentElementType();
        
        // Создаем снаряд с комбо-флагами
        const projectile = new Projectile(
            this.scene,
            heroPos.x,
            heroPos.y,
            velocityX,
            velocityY,
            damage,
            this.projectileLifetime,
            this.comboFlags,
            elementType
        );
        
        this.projectiles.push(projectile);
        
        // console.log(`ProjectileSystem: создан снаряд в направлении (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)}) со скоростью ${projectileSpeed}`);
    }

    /**
     * Обновить систему снарядов
     * @param {number} delta - Время с последнего кадра в миллисекундах
     * @param {object} worldOffset - Смещение мира
     * @param {Array} enemies - Массив врагов
     */
    update(delta, worldOffset, enemies) {
        // Обновляем все снаряды
        this.updateProjectiles(delta, worldOffset);
        
        // Проверяем попадания
        this.checkHits(enemies);
        
        // Удаляем мертвые снаряды
        this.cleanupDeadProjectiles();
    }

    /**
     * Обновить все снаряды
     * @param {number} delta - Время с последнего кадра в миллисекундах
     * @param {object} worldOffset - Смещение мира
     */
    updateProjectiles(delta, worldOffset) {
        if (this.projectiles && Array.isArray(this.projectiles)) {
            this.projectiles.forEach(projectile => {
                if (projectile.isAlive) {
                    projectile.update(delta, worldOffset);
                }
            });
        }
    }

    /**
     * Проверить попадания снарядов в врагов
     * @param {Array} enemies - Массив врагов
     */
    checkHits(enemies) {
        if (this.projectiles && Array.isArray(this.projectiles)) {
            this.projectiles.forEach(projectile => {
                if (!projectile.isAlive) return;
                
                if (enemies && Array.isArray(enemies)) {
                    enemies.forEach(enemy => {
                if (!enemy.isAlive) return;
                
                if (projectile.checkHit(enemy)) {
                    // Обрабатываем взрывную атаку
                    if (this.comboFlags.explosiveShot) {
                        this.handleExplosiveHit(projectile, enemies);
                    }
                    
                    // Создаем эффект попадания
                    const elementType = this.scene.getCurrentElementType();
                    this.scene.impactVFXSystem.spawnImpactVFX(enemy.worldX, enemy.worldY, elementType);
                    
                    projectile.hitEnemy(enemy);
                }
                    });
                }
            });
        }
    }
    
    /**
     * Обработать взрывную атаку при попадании
     * @param {Projectile} projectile - Снаряд, который попал
     * @param {Array} enemies - Массив всех врагов
     */
    handleExplosiveHit(projectile, enemies) {
        const explosionRadius = 100; // Радиус взрыва
        const explosionDamage = projectile.damage * 0.5; // 50% от урона снаряда
        
        // console.log(`ProjectileSystem: взрывная атака в радиусе ${explosionRadius}px`);
        
        if (enemies && Array.isArray(enemies)) {
            enemies.forEach(enemy => {
                if (!enemy.isAlive) return;
            
            // Вычисляем расстояние от точки взрыва до врага
            const dx = enemy.getWorldPosition().x - projectile.x;
            const dy = enemy.getWorldPosition().y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если враг в радиусе взрыва
            if (distance <= explosionRadius) {
                // Наносим урон (уменьшается с расстоянием)
                const damageMultiplier = 1 - (distance / explosionRadius);
                const finalDamage = Math.floor(explosionDamage * damageMultiplier);
                
                if (finalDamage > 0) {
                    enemy.takeDamage(finalDamage);
                    // console.log(`ProjectileSystem: взрыв нанес ${finalDamage} урона врагу на расстоянии ${distance.toFixed(1)}px`);
                }
            }
            });
        }
    }

    /**
     * Удалить мертвые снаряды
     */
    cleanupDeadProjectiles() {
        const initialCount = this.projectiles.length;
        this.projectiles = this.projectiles.filter(projectile => projectile.isAlive);
        
        if (this.projectiles.length < initialCount) {
            // console.log(`ProjectileSystem: удалено ${initialCount - this.projectiles.length} мертвых снарядов`);
        }
    }

    /**
     * Получить все живые снаряды
     * @returns {Array} Массив живых снарядов
     */
    getProjectiles() {
        return this.projectiles.filter(projectile => projectile.isAlive);
    }

    /**
     * Получить количество живых снарядов
     * @returns {number} Количество живых снарядов
     */
    getProjectileCount() {
        return this.projectiles.filter(projectile => projectile.isAlive).length;
    }

    /**
     * Получить статистику системы
     * @returns {object} Статистика системы снарядов
     */
    getStats() {
        return {
            totalProjectiles: this.projectiles.length,
            aliveProjectiles: this.getProjectileCount(),
            projectileSpeed: this.projectileSpeed,
            projectileLifetime: this.projectileLifetime
        };
    }

    /**
     * Очистить все снаряды
     */
    clear() {
        // console.log('ProjectileSystem: очистка всех снарядов');
        if (this.projectiles && Array.isArray(this.projectiles)) {
            this.projectiles.forEach(projectile => projectile.destroy());
        }
        this.projectiles = [];
    }

    /**
     * Обновить комбо-флаги из RuneCastSystem
     * @param {object} globalFlags - Глобальные флаги от RuneCastSystem
     */
    updateComboFlags(globalFlags) {
        this.comboFlags = { ...globalFlags };
    }
    
    /**
     * Получить текущие комбо-флаги
     * @returns {object} Копия комбо-флагов
     */
    getComboFlags() {
        return { ...this.comboFlags };
    }
    
    /**
     * Уничтожить систему (очистка ресурсов)
     */
    destroy() {
        this.clear();
    }
}
