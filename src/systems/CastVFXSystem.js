/**
 * Система визуальных эффектов для комбинаций рун
 * Создает временные VFX эффекты при активации комбинаций
 */

export class CastVFXSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];
        
        console.log('CastVFXSystem: инициализирован');
    }
    
    /**
     * Запустить эффект комбинации
     * @param {string} comboType - Тип комбинации
     * @param {object} heroWorldPos - Мировые координаты героя {x, y}
     */
    playComboEffect(comboType, heroWorldPos) {
        console.log(`CastVFXSystem: запуск эффекта "${comboType}" в позиции (${heroWorldPos.x}, ${heroWorldPos.y})`);
        
        switch (comboType) {
            case 'ice_spikes':
                this.createIceEffect(heroWorldPos);
                break;
            case 'berserker_speed':
                this.createLightningEffect(heroWorldPos);
                break;
            case 'explosive_shot':
                this.createFireEffect(heroWorldPos);
                break;
            case 'universal_mode':
                this.createUniversalEffect(heroWorldPos);
                break;
            case 'standard_buff':
                this.createStandardEffect(heroWorldPos);
                break;
        }
    }
    
    /**
     * Создать ледяной эффект (QQQ)
     * @param {object} pos - Позиция эффекта
     */
    createIceEffect(pos) {
        // Основное ледяное кольцо
        const iceRing = this.scene.add.graphics();
        iceRing.setDepth(1000);
        
        const effect = {
            type: 'ice_ring',
            graphics: iceRing,
            startTime: this.scene.time.now,
            duration: 1000,
            scale: 0.5,
            alpha: 1.0,
            pos: { ...pos }
        };
        
        this.activeEffects.push(effect);
        
        // Снежинки
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 40 + Math.random() * 30;
            const snowflake = this.scene.add.circle(
                pos.x + Math.cos(angle) * distance,
                pos.y + Math.sin(angle) * distance,
                2,
                0x87CEEB,
                0.8
            );
            snowflake.setDepth(1001);
            
            const snowflakeEffect = {
                type: 'snowflake',
                graphics: snowflake,
                startTime: this.scene.time.now,
                duration: 800 + Math.random() * 400,
                angle: angle,
                distance: distance,
                pos: { ...pos }
            };
            
            this.activeEffects.push(snowflakeEffect);
        }
    }
    
    /**
     * Создать эффект молнии (WWW)
     * @param {object} pos - Позиция эффекта
     */
    createLightningEffect(pos) {
        // Вращающееся энергокольцо
        const energyRing = this.scene.add.graphics();
        energyRing.setDepth(1000);
        
        const effect = {
            type: 'lightning_ring',
            graphics: energyRing,
            startTime: this.scene.time.now,
            duration: 1000,
            scale: 0.3,
            alpha: 1.0,
            rotation: 0,
            pos: { ...pos }
        };
        
        this.activeEffects.push(effect);
        
        // Искры молний
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            const spark = this.scene.add.circle(
                pos.x + Math.cos(angle) * distance,
                pos.y + Math.sin(angle) * distance,
                3,
                0x9370DB,
                0.9
            );
            spark.setDepth(1001);
            
            const sparkEffect = {
                type: 'lightning_spark',
                graphics: spark,
                startTime: this.scene.time.now,
                duration: 600 + Math.random() * 300,
                angle: angle,
                distance: distance,
                pos: { ...pos }
            };
            
            this.activeEffects.push(sparkEffect);
        }
    }
    
    /**
     * Создать огненный эффект (EEE)
     * @param {object} pos - Позиция эффекта
     */
    createFireEffect(pos) {
        // Огненный взрыв
        const fireExplosion = this.scene.add.graphics();
        fireExplosion.setDepth(1000);
        
        const effect = {
            type: 'fire_explosion',
            graphics: fireExplosion,
            startTime: this.scene.time.now,
            duration: 1000,
            scale: 0.2,
            alpha: 1.0,
            pos: { ...pos }
        };
        
        this.activeEffects.push(effect);
        
        // Вылетающие искры
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const distance = 80 + Math.random() * 40;
            const ember = this.scene.add.circle(
                pos.x + Math.cos(angle) * distance,
                pos.y + Math.sin(angle) * distance,
                2,
                0xFF4500,
                0.8
            );
            ember.setDepth(1001);
            
            const emberEffect = {
                type: 'fire_ember',
                graphics: ember,
                startTime: this.scene.time.now,
                duration: 700 + Math.random() * 500,
                angle: angle,
                distance: distance,
                pos: { ...pos }
            };
            
            this.activeEffects.push(emberEffect);
        }
    }
    
    /**
     * Создать универсальный эффект (QWE)
     * @param {object} pos - Позиция эффекта
     */
    createUniversalEffect(pos) {
        // Многоцветный радиальный импульс
        const universalPulse = this.scene.add.graphics();
        universalPulse.setDepth(1000);
        
        const effect = {
            type: 'universal_pulse',
            graphics: universalPulse,
            startTime: this.scene.time.now,
            duration: 1200,
            scale: 0.1,
            alpha: 1.0,
            pos: { ...pos }
        };
        
        this.activeEffects.push(effect);
        
        // Цветные частицы
        const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFFEAA7];
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 50 + Math.random() * 60;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particle = this.scene.add.circle(
                pos.x + Math.cos(angle) * distance,
                pos.y + Math.sin(angle) * distance,
                3,
                color,
                0.7
            );
            particle.setDepth(1001);
            
            const particleEffect = {
                type: 'universal_particle',
                graphics: particle,
                startTime: this.scene.time.now,
                duration: 800 + Math.random() * 600,
                angle: angle,
                distance: distance,
                pos: { ...pos }
            };
            
            this.activeEffects.push(particleEffect);
        }
    }
    
    /**
     * Создать стандартный эффект
     * @param {object} pos - Позиция эффекта
     */
    createStandardEffect(pos) {
        // Простое золотое кольцо
        const standardRing = this.scene.add.graphics();
        standardRing.setDepth(1000);
        
        const effect = {
            type: 'standard_ring',
            graphics: standardRing,
            startTime: this.scene.time.now,
            duration: 800,
            scale: 0.4,
            alpha: 1.0,
            pos: { ...pos }
        };
        
        this.activeEffects.push(effect);
    }
    
    /**
     * Обновить все активные эффекты
     * @param {number} delta - Время с последнего обновления
     * @param {object} worldOffset - Смещение мира
     */
    update(delta, worldOffset) {
        const currentTime = this.scene.time.now;
        
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            const elapsed = currentTime - effect.startTime;
            const progress = Math.min(elapsed / effect.duration, 1.0);
            
            // Обновляем позицию с учетом смещения мира
            const worldX = effect.pos.x - worldOffset.x;
            const worldY = effect.pos.y - worldOffset.y;
            
            switch (effect.type) {
                case 'ice_ring':
                    this.updateIceRing(effect, progress, worldX, worldY);
                    break;
                case 'snowflake':
                    this.updateSnowflake(effect, progress, worldX, worldY);
                    break;
                case 'lightning_ring':
                    this.updateLightningRing(effect, progress, worldX, worldY);
                    break;
                case 'lightning_spark':
                    this.updateLightningSpark(effect, progress, worldX, worldY);
                    break;
                case 'fire_explosion':
                    this.updateFireExplosion(effect, progress, worldX, worldY);
                    break;
                case 'fire_ember':
                    this.updateFireEmber(effect, progress, worldX, worldY);
                    break;
                case 'universal_pulse':
                    this.updateUniversalPulse(effect, progress, worldX, worldY);
                    break;
                case 'universal_particle':
                    this.updateUniversalParticle(effect, progress, worldX, worldY);
                    break;
                case 'standard_ring':
                    this.updateStandardRing(effect, progress, worldX, worldY);
                    break;
            }
            
            // Удаляем завершенные эффекты
            if (progress >= 1.0) {
                effect.graphics.destroy();
                this.activeEffects.splice(i, 1);
            }
        }
    }
    
    /**
     * Обновить ледяное кольцо
     */
    updateIceRing(effect, progress, worldX, worldY) {
        effect.scale = 0.5 + progress * 1.5;
        effect.alpha = 1.0 - progress;
        
        effect.graphics.clear();
        effect.graphics.lineStyle(4, 0x87CEEB, effect.alpha);
        effect.graphics.strokeCircle(worldX, worldY, 30 * effect.scale);
    }
    
    /**
     * Обновить снежинку
     */
    updateSnowflake(effect, progress, worldX, worldY) {
        const currentDistance = effect.distance + progress * 20;
        const currentAngle = effect.angle + progress * Math.PI;
        const alpha = 1.0 - progress;
        
        effect.graphics.setPosition(
            worldX + Math.cos(currentAngle) * currentDistance,
            worldY + Math.sin(currentAngle) * currentDistance
        );
        effect.graphics.setAlpha(alpha);
    }
    
    /**
     * Обновить энергокольцо молнии
     */
    updateLightningRing(effect, progress, worldX, worldY) {
        effect.scale = 0.3 + progress * 1.7;
        effect.alpha = 1.0 - progress;
        effect.rotation += 0.1;
        
        effect.graphics.clear();
        effect.graphics.lineStyle(3, 0x9370DB, effect.alpha);
        effect.graphics.strokeCircle(worldX, worldY, 25 * effect.scale);
        
        // Добавляем внутренние линии
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + effect.rotation;
            const radius = 15 * effect.scale;
            effect.graphics.lineStyle(2, 0x9370DB, effect.alpha * 0.7);
            effect.graphics.beginPath();
            effect.graphics.moveTo(worldX, worldY);
            effect.graphics.lineTo(
                worldX + Math.cos(angle) * radius,
                worldY + Math.sin(angle) * radius
            );
            effect.graphics.strokePath();
        }
    }
    
    /**
     * Обновить искру молнии
     */
    updateLightningSpark(effect, progress, worldX, worldY) {
        const currentDistance = effect.distance + progress * 30;
        const currentAngle = effect.angle + progress * Math.PI * 0.5;
        const alpha = 1.0 - progress;
        
        effect.graphics.setPosition(
            worldX + Math.cos(currentAngle) * currentDistance,
            worldY + Math.sin(currentAngle) * currentDistance
        );
        effect.graphics.setAlpha(alpha);
    }
    
    /**
     * Обновить огненный взрыв
     */
    updateFireExplosion(effect, progress, worldX, worldY) {
        effect.scale = 0.2 + progress * 2.8;
        effect.alpha = 1.0 - progress;
        
        effect.graphics.clear();
        effect.graphics.fillStyle(0xFF4500, effect.alpha);
        effect.graphics.fillCircle(worldX, worldY, 20 * effect.scale);
        
        // Внешнее кольцо
        effect.graphics.lineStyle(3, 0xFF6347, effect.alpha * 0.8);
        effect.graphics.strokeCircle(worldX, worldY, 25 * effect.scale);
    }
    
    /**
     * Обновить огненную искру
     */
    updateFireEmber(effect, progress, worldX, worldY) {
        const currentDistance = effect.distance + progress * 40;
        const currentAngle = effect.angle + progress * Math.PI * 0.3;
        const alpha = 1.0 - progress;
        
        effect.graphics.setPosition(
            worldX + Math.cos(currentAngle) * currentDistance,
            worldY + Math.sin(currentAngle) * currentDistance
        );
        effect.graphics.setAlpha(alpha);
    }
    
    /**
     * Обновить универсальный импульс
     */
    updateUniversalPulse(effect, progress, worldX, worldY) {
        effect.scale = 0.1 + progress * 2.9;
        effect.alpha = 1.0 - progress;
        
        effect.graphics.clear();
        
        // Многослойный эффект
        const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1];
        for (let i = 0; i < 3; i++) {
            const layerProgress = Math.max(0, progress - i * 0.2);
            const layerScale = effect.scale * (1 - i * 0.2);
            const layerAlpha = effect.alpha * (1 - i * 0.3);
            
            effect.graphics.lineStyle(4 - i, colors[i], layerAlpha);
            effect.graphics.strokeCircle(worldX, worldY, 30 * layerScale);
        }
    }
    
    /**
     * Обновить универсальную частицу
     */
    updateUniversalParticle(effect, progress, worldX, worldY) {
        const currentDistance = effect.distance + progress * 50;
        const currentAngle = effect.angle + progress * Math.PI;
        const alpha = 1.0 - progress;
        
        effect.graphics.setPosition(
            worldX + Math.cos(currentAngle) * currentDistance,
            worldY + Math.sin(currentAngle) * currentDistance
        );
        effect.graphics.setAlpha(alpha);
    }
    
    /**
     * Обновить стандартное кольцо
     */
    updateStandardRing(effect, progress, worldX, worldY) {
        effect.scale = 0.4 + progress * 1.6;
        effect.alpha = 1.0 - progress;
        
        effect.graphics.clear();
        effect.graphics.lineStyle(3, 0xFFD700, effect.alpha);
        effect.graphics.strokeCircle(worldX, worldY, 20 * effect.scale);
    }
    
    /**
     * Очистить все эффекты
     */
    clearAllEffects() {
        this.activeEffects.forEach(effect => {
            effect.graphics.destroy();
        });
        this.activeEffects = [];
    }
}


