/**
 * Система визуальных эффектов смерти врагов
 * Создает эффекты при уничтожении врага в зависимости от элементального типа
 */

export class DeathVFXSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];
        
        console.log('DeathVFXSystem: инициализирован');
    }
    
    /**
     * Создать эффект смерти врага
     * @param {number} worldX - Мировая координата X
     * @param {number} worldY - Мировая координата Y
     * @param {string} elementType - Тип элемента ('Q', 'W', 'E', 'QWE', 'default')
     */
    spawnDeathVFX(worldX, worldY, elementType) {
        const effect = {
            worldX: worldX,
            worldY: worldY,
            elementType: elementType,
            lifetime: 0,
            maxLifetime: 500 + Math.random() * 300, // 500-800мс
            graphics: null,
            particles: []
        };
        
        // Создаем основной эффект
        this.createMainEffect(effect);
        
        // Создаем частицы в зависимости от типа элемента
        this.createElementParticles(effect);
        
        this.activeEffects.push(effect);
    }
    
    /**
     * Создать основной эффект
     * @param {object} effect - Объект эффекта
     */
    createMainEffect(effect) {
        const graphics = this.scene.add.graphics();
        effect.graphics = graphics;
        
        // Определяем цвет по типу элемента
        const color = this.getElementColor(effect.elementType);
        
        // Рисуем основную вспышку
        graphics.fillStyle(color, 0.6);
        graphics.fillCircle(0, 0, 20);
        
        // Добавляем внешнее кольцо
        graphics.lineStyle(3, color, 0.8);
        graphics.strokeCircle(0, 0, 25);
        
        // Устанавливаем позицию
        graphics.x = effect.worldX;
        graphics.y = effect.worldY;
    }
    
    /**
     * Создать частицы в зависимости от типа элемента
     * @param {object} effect - Объект эффекта
     */
    createElementParticles(effect) {
        switch (effect.elementType) {
            case 'Q': // Лед - осколки
                this.createIceShards(effect);
                break;
            case 'W': // Молния - искры
                this.createLightningSparks(effect);
                break;
            case 'E': // Огонь - угольки
                this.createFireEmbers(effect);
                break;
            case 'QWE': // Универсальный - радужные частицы
                this.createRainbowParticles(effect);
                break;
            default: // Обычные частицы
                this.createDefaultParticles(effect);
                break;
        }
    }
    
    /**
     * Создать ледяные осколки (Q)
     * @param {object} effect - Объект эффекта
     */
    createIceShards(effect) {
        const shardCount = 8;
        const color = 0x66ccff; // Голубой
        
        for (let i = 0; i < shardCount; i++) {
            const shard = this.scene.add.graphics();
            
            // Рисуем осколок (треугольник)
            shard.fillStyle(color, 0.9);
            shard.beginPath();
            shard.moveTo(0, -6);
            shard.lineTo(-4, 4);
            shard.lineTo(4, 4);
            shard.closePath();
            shard.fill();
            
            // Случайное направление
            const angle = (Math.PI * 2 * i / shardCount) + Math.random() * 0.3;
            const speed = 80 + Math.random() * 120; // 80-200 пикселей/сек
            
            shard.vx = Math.cos(angle) * speed;
            shard.vy = Math.sin(angle) * speed;
            shard.lifetime = 0;
            shard.maxLifetime = 400 + Math.random() * 200; // 400-600мс
            shard.rotation = angle;
            
            // Устанавливаем позицию
            shard.x = effect.worldX;
            shard.y = effect.worldY;
            
            effect.particles.push(shard);
        }
    }
    
    /**
     * Создать искры молнии (W)
     * @param {object} effect - Объект эффекта
     */
    createLightningSparks(effect) {
        const sparkCount = 6;
        const color = 0xaa66ff; // Фиолетовый
        
        for (let i = 0; i < sparkCount; i++) {
            const spark = this.scene.add.graphics();
            
            // Рисуем искру (линия)
            spark.lineStyle(2, color, 0.9);
            spark.beginPath();
            spark.moveTo(-3, -3);
            spark.lineTo(3, 3);
            spark.strokePath();
            
            // Быстрое движение
            const angle = Math.random() * Math.PI * 2;
            const speed = 150 + Math.random() * 200; // 150-350 пикселей/сек
            
            spark.vx = Math.cos(angle) * speed;
            spark.vy = Math.sin(angle) * speed;
            spark.lifetime = 0;
            spark.maxLifetime = 200 + Math.random() * 200; // 200-400мс
            
            // Устанавливаем позицию
            spark.x = effect.worldX;
            spark.y = effect.worldY;
            
            effect.particles.push(spark);
        }
    }
    
    /**
     * Создать угольки огня (E)
     * @param {object} effect - Объект эффекта
     */
    createFireEmbers(effect) {
        const emberCount = 10;
        const color = 0xff6633; // Оранжевый
        
        for (let i = 0; i < emberCount; i++) {
            const ember = this.scene.add.graphics();
            
            // Рисуем уголь (круг)
            ember.fillStyle(color, 0.8);
            ember.fillCircle(0, 0, 2 + Math.random() * 3);
            
            // Движение с гравитацией
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 100; // 60-160 пикселей/сек
            
            ember.vx = Math.cos(angle) * speed;
            ember.vy = Math.sin(angle) * speed - 50; // Начальная скорость вверх
            ember.gravity = 200; // Гравитация
            ember.lifetime = 0;
            ember.maxLifetime = 300 + Math.random() * 300; // 300-600мс
            
            // Устанавливаем позицию
            ember.x = effect.worldX;
            ember.y = effect.worldY;
            
            effect.particles.push(ember);
        }
    }
    
    /**
     * Создать радужные частицы (QWE)
     * @param {object} effect - Объект эффекта
     */
    createRainbowParticles(effect) {
        const particleCount = 12;
        const colors = [0x66ccff, 0xaa66ff, 0xff6633, 0xffff00, 0x00ff00, 0xff00ff];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.graphics();
            
            // Случайный цвет
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.fillStyle(color, 0.8);
            particle.fillCircle(0, 0, 3 + Math.random() * 2);
            
            // Спиральное движение
            const angle = (Math.PI * 2 * i / particleCount) + (i * 0.5);
            const speed = 40 + Math.random() * 80; // 40-120 пикселей/сек
            
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.lifetime = 0;
            particle.maxLifetime = 400 + Math.random() * 400; // 400-800мс
            particle.spiralSpeed = 0.1; // Скорость спирали
            
            // Устанавливаем позицию
            particle.x = effect.worldX;
            particle.y = effect.worldY;
            
            effect.particles.push(particle);
        }
    }
    
    /**
     * Создать обычные частицы (default)
     * @param {object} effect - Объект эффекта
     */
    createDefaultParticles(effect) {
        const particleCount = 6;
        const color = 0xcccccc; // Серый
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.graphics();
            
            // Простой круг
            particle.fillStyle(color, 0.7);
            particle.fillCircle(0, 0, 2 + Math.random() * 2);
            
            // Случайное направление
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100; // 50-150 пикселей/сек
            
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.lifetime = 0;
            particle.maxLifetime = 300 + Math.random() * 300; // 300-600мс
            
            // Устанавливаем позицию
            particle.x = effect.worldX;
            particle.y = effect.worldY;
            
            effect.particles.push(particle);
        }
    }
    
    /**
     * Получить цвет элемента
     * @param {string} elementType - Тип элемента
     * @returns {number} Цвет в hex
     */
    getElementColor(elementType) {
        switch (elementType) {
            case 'Q': return 0x66ccff; // Голубой (лед)
            case 'W': return 0xaa66ff; // Фиолетовый (молния)
            case 'E': return 0xff6633; // Оранжевый (огонь)
            case 'QWE': return 0xffffff; // Белый (универсальный)
            default: return 0xcccccc; // Серый (по умолчанию)
        }
    }
    
    /**
     * Обновить все активные эффекты
     * @param {number} delta - Время с последнего кадра
     * @param {object} worldOffset - Смещение мира
     */
    update(delta, worldOffset) {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.lifetime += delta;
            
            // Обновляем позицию основного эффекта
            if (effect.graphics) {
                effect.graphics.x = effect.worldX - worldOffset.x;
                effect.graphics.y = effect.worldY - worldOffset.y;
            }
            
            // Обновляем частицы
            effect.particles.forEach(particle => {
                particle.lifetime += delta;
                
                // Движение частиц
                particle.x += particle.vx * delta / 1000;
                particle.y += particle.vy * delta / 1000;
                
                // Гравитация для угольков огня
                if (particle.gravity) {
                    particle.vy += particle.gravity * delta / 1000;
                }
                
                // Спиральное движение для радужных частиц
                if (particle.spiralSpeed) {
                    const angle = Math.atan2(particle.vy, particle.vx) + particle.spiralSpeed * delta / 1000;
                    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                    particle.vx = Math.cos(angle) * speed;
                    particle.vy = Math.sin(angle) * speed;
                }
                
                // Обновляем позицию с учетом worldOffset
                particle.x = particle.x - worldOffset.x;
                particle.y = particle.y - worldOffset.y;
                
                // Затухание
                const alpha = Math.max(0, 1 - (particle.lifetime / particle.maxLifetime));
                particle.alpha = alpha;
                
                // Уменьшение размера
                const scale = Math.max(0.1, 1 - (particle.lifetime / particle.maxLifetime));
                particle.scaleX = scale;
                particle.scaleY = scale;
            });
            
            // Затухание основного эффекта
            if (effect.graphics) {
                const alpha = Math.max(0, 1 - (effect.lifetime / effect.maxLifetime));
                effect.graphics.alpha = alpha;
                
                const scale = Math.max(0.1, 1 - (effect.lifetime / effect.maxLifetime));
                effect.graphics.scaleX = scale;
                effect.graphics.scaleY = scale;
            }
            
            // Удаляем истекшие эффекты
            if (effect.lifetime >= effect.maxLifetime) {
                this.destroyEffect(effect);
                this.activeEffects.splice(i, 1);
            }
        }
    }
    
    /**
     * Уничтожить эффект
     * @param {object} effect - Объект эффекта
     */
    destroyEffect(effect) {
        if (effect.graphics) {
            effect.graphics.destroy();
        }
        
        effect.particles.forEach(particle => {
            particle.destroy();
        });
    }
    
    /**
     * Очистить все эффекты
     */
    clear() {
        this.activeEffects.forEach(effect => {
            this.destroyEffect(effect);
        });
        this.activeEffects = [];
    }
    
    /**
     * Уничтожить систему
     */
    destroy() {
        this.clear();
    }
}


