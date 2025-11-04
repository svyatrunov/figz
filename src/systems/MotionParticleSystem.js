/**
 * Система частиц движения для героя
 * Создает минимальные motion-партиклы позади героя при движении
 */

export class MotionParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 20; // Максимальное количество частиц
        this.spawnCooldown = 0;
        this.spawnRate = 50; // Миллисекунды между спавном частиц
    }

    /**
     * Спавн частицы движения
     * @param {number} worldX - Мировая X координата героя
     * @param {number} worldY - Мировая Y координата героя
     * @param {number} dirX - Направление движения по X
     * @param {number} dirY - Направление движения по Y
     */
    spawn(worldX, worldY, dirX, dirY) {
        const time = this.scene.time.now;
        
        // Проверяем кулдаун спавна
        if (time - this.spawnCooldown < this.spawnRate) {
            return;
        }
        
        this.spawnCooldown = time;
        
        // Ограничиваем количество частиц
        if (this.particles.length >= this.maxParticles) {
            // Удаляем самую старую частицу
            const oldestParticle = this.particles.shift();
            if (oldestParticle && oldestParticle.sprite) {
                oldestParticle.sprite.destroy();
            }
        }
        
        // Создаем новую частицу
        const particle = this.createParticle(worldX, worldY, dirX, dirY);
        this.particles.push(particle);
    }

    /**
     * Создание частицы движения
     */
    createParticle(worldX, worldY, dirX, dirY) {
        // Позиция частицы - немного позади героя по направлению движения
        const offsetX = -dirX * 20;
        const offsetY = -dirY * 20;
        
        const screenX = worldX - this.scene.worldOffset.x + offsetX;
        const screenY = worldY - this.scene.worldOffset.y + offsetY;
        
        // Создаем маленький круг как частицу
        const sprite = this.scene.add.circle(screenX, screenY, 2, 0x00ff00, 0.6);
        
        // Настройки частицы
        const particle = {
            sprite: sprite,
            startTime: this.scene.time.now,
            lifetime: 200, // 200мс жизни
            startAlpha: 0.6,
            startScale: 1.0
        };
        
        return particle;
    }

    /**
     * Обновление системы частиц
     */
    update() {
        const time = this.scene.time.now;
        
        // Обновляем все частицы
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const age = time - particle.startTime;
            const lifeProgress = age / particle.lifetime;
            
            if (lifeProgress >= 1) {
                // Частица истекла - удаляем
                if (particle.sprite) {
                    particle.sprite.destroy();
                }
                this.particles.splice(i, 1);
                continue;
            }
            
            // Обновляем визуальные свойства частицы
            this.updateParticle(particle, lifeProgress);
        }
    }

    /**
     * Обновление отдельной частицы
     */
    updateParticle(particle, lifeProgress) {
        if (!particle.sprite) return;
        
        // Уменьшаем альфу со временем
        const alpha = particle.startAlpha * (1 - lifeProgress);
        particle.sprite.setAlpha(alpha);
        
        // Слегка уменьшаем размер
        const scale = particle.startScale * (1 - lifeProgress * 0.3);
        particle.sprite.setScale(scale);
        
        // Обновляем позицию относительно worldOffset
        const worldPos = this.getParticleWorldPosition(particle);
        const screenX = worldPos.x - this.scene.worldOffset.x;
        const screenY = worldPos.y - this.scene.worldOffset.y;
        particle.sprite.setPosition(screenX, screenY);
    }

    /**
     * Получить мировую позицию частицы
     */
    getParticleWorldPosition(particle) {
        // Частицы движутся вместе с миром, но их позиция фиксирована в мировых координатах
        // Это упрощенная версия - в реальности нужно отслеживать изначальную мировую позицию
        return {
            x: particle.sprite.x + this.scene.worldOffset.x,
            y: particle.sprite.y + this.scene.worldOffset.y
        };
    }

    /**
     * Очистка всех частиц
     */
    clear() {
        this.particles.forEach(particle => {
            if (particle.sprite) {
                particle.sprite.destroy();
            }
        });
        this.particles = [];
    }

    /**
     * Создать частицы маны при подборе пикселя
     * @param {number} worldX - Мировая координата X
     * @param {number} worldY - Мировая координата Y
     * @param {number} manaAmount - Количество маны
     */
    spawnManaParticles(worldX, worldY, manaAmount) {
        const particleCount = Math.min(5, Math.max(1, Math.floor(manaAmount / 5)));
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 30;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.spawnParticle(
                worldX, worldY,
                vx, vy,
                0x0088ff, // Синий цвет маны
                0.8,
                1000 + Math.random() * 500
            );
        }
    }
    
    /**
     * Уничтожение системы
     */
    destroy() {
        this.clear();
    }
}
