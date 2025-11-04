/**
 * Система визуальных эффектов попадания снарядов
 * Создает кратковременные эффекты при попадании снаряда во врага
 */

export class ImpactVFXSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];
        
        console.log('ImpactVFXSystem: инициализирован');
    }
    
    /**
     * Создать эффект попадания
     * @param {number} worldX - Мировая координата X
     * @param {number} worldY - Мировая координата Y
     * @param {string} elementType - Тип элемента ('Q', 'W', 'E', 'QWE', 'default')
     */
    spawnImpactVFX(worldX, worldY, elementType) {
        const effect = {
            worldX: worldX,
            worldY: worldY,
            elementType: elementType,
            lifetime: 0,
            maxLifetime: 300 + Math.random() * 100, // 300-400мс
            graphics: null,
            particles: []
        };
        
        // Создаем основной эффект
        this.createMainEffect(effect);
        
        // Создаем частицы
        this.createParticles(effect);
        
        this.activeEffects.push(effect);
    }
    
    /**
     * Создать основной эффект (вспышка)
     * @param {object} effect - Объект эффекта
     */
    createMainEffect(effect) {
        const graphics = this.scene.add.graphics();
        effect.graphics = graphics;
        
        // Определяем цвет по типу элемента
        const color = this.getElementColor(effect.elementType);
        
        // Рисуем круг-вспышку
        graphics.fillStyle(color, 0.8);
        graphics.fillCircle(0, 0, 15);
        
        // Устанавливаем позицию
        graphics.x = effect.worldX;
        graphics.y = effect.worldY;
    }
    
    /**
     * Создать частицы
     * @param {object} effect - Объект эффекта
     */
    createParticles(effect) {
        const particleCount = 6 + Math.floor(Math.random() * 5); // 6-10 частиц
        const color = this.getElementColor(effect.elementType);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.graphics();
            
            // Определяем форму частицы по типу элемента
            this.drawParticleShape(particle, effect.elementType, color);
            
            // Случайное направление
            const angle = (Math.PI * 2 * i / particleCount) + Math.random() * 0.5;
            const speed = 50 + Math.random() * 100; // 50-150 пикселей/сек
            
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.lifetime = 0;
            particle.maxLifetime = 200 + Math.random() * 200; // 200-400мс
            
            // Устанавливаем позицию
            particle.x = effect.worldX;
            particle.y = effect.worldY;
            
            effect.particles.push(particle);
        }
    }
    
    /**
     * Нарисовать форму частицы
     * @param {Phaser.GameObjects.Graphics} particle - Графика частицы
     * @param {string} elementType - Тип элемента
     * @param {number} color - Цвет
     */
    drawParticleShape(particle, elementType, color) {
        const size = 3 + Math.random() * 3; // 3-6 пикселей
        
        switch (elementType) {
            case 'Q': // Лед - осколки
                particle.fillStyle(color, 0.9);
                particle.fillRect(-size/2, -size/2, size, size);
                break;
                
            case 'W': // Молния - искры
                particle.fillStyle(color, 0.8);
                particle.fillCircle(0, 0, size/2);
                break;
                
            case 'E': // Огонь - угольки
                particle.fillStyle(color, 0.7);
                particle.fillCircle(0, 0, size);
                break;
                
            case 'QWE': // Универсальный - радужные частицы
                const rainbowColors = [0x66ccff, 0xaa66ff, 0xff6633, 0xffff00, 0x00ff00];
                const randomColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
                particle.fillStyle(randomColor, 0.8);
                particle.fillCircle(0, 0, size);
                break;
                
            default: // Обычные частицы
                particle.fillStyle(color, 0.6);
                particle.fillCircle(0, 0, size/2);
                break;
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
            default: return 0xffffff; // Белый (по умолчанию)
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


