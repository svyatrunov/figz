/**
 * Система рун - управляет магическими рунами и их эффектами
 */

export class RuneSystem {
    constructor() {
        this.initialized = false;
        
        // Руны
        this.runes = [];
        this.maxRunes = 5;
        this.runeSpawnTimer = 0;
        this.runeSpawnInterval = 15000; // 15 секунд между спавнами рун
        
        // Типы рун
        this.runeTypes = [
            {
                type: 'damage',
                name: 'Руна Силы',
                color: '#ff4400',
                duration: 10000,
                effect: (hero) => {
                    hero.projectileDamage *= 1.5;
                }
            },
            {
                type: 'speed',
                name: 'Руна Скорости',
                color: '#ffff00',
                duration: 8000,
                effect: (hero) => {
                    hero.speed *= 1.3;
                }
            },
            {
                type: 'health',
                name: 'Руна Жизни',
                color: '#00ff00',
                duration: 0,
                effect: (hero) => {
                    hero.heal(50);
                }
            },
            {
                type: 'mana',
                name: 'Руна Маны',
                color: '#0088ff',
                duration: 0,
                effect: (hero) => {
                    hero.restoreMana(50);
                }
            },
            {
                type: 'piercing',
                name: 'Руна Пробивания',
                color: '#8800ff',
                duration: 12000,
                effect: (hero) => {
                    hero.projectilesPiercing = true;
                }
            },
            {
                type: 'multishot',
                name: 'Руна Мультивыстрела',
                color: '#ff8800',
                duration: 10000,
                effect: (hero) => {
                    hero.multishot = true;
                }
            }
        ];
        
        // Активные эффекты
        this.activeEffects = [];
    }

    init() {
        this.initialized = true;
    }

    update(deltaTime, gameScene) {
        if (!this.initialized) return;
        
        this.runeSpawnTimer += deltaTime;
        
        // Обновляем руны
        this.updateRunes(deltaTime);
        
        // Обновляем эффекты
        this.updateEffects(deltaTime);
        
        // Спавним новые руны
        this.updateRuneSpawning(deltaTime, gameScene);
    }

    updateRunes(deltaTime) {
        this.runes.forEach(rune => {
            rune.update(deltaTime);
        });
        
        // Удаляем истекшие руны
        this.runes = this.runes.filter(rune => !rune.isExpired());
    }

    updateEffects(deltaTime) {
        this.activeEffects.forEach(effect => {
            effect.update(deltaTime);
        });
        
        // Удаляем истекшие эффекты
        this.activeEffects = this.activeEffects.filter(effect => !effect.isExpired());
    }

    updateRuneSpawning(deltaTime, gameScene) {
        if (this.runes.length >= this.maxRunes) return;
        
        if (this.runeSpawnTimer >= this.runeSpawnInterval) {
            this.spawnRune(gameScene);
            this.runeSpawnTimer = 0;
        }
    }

    spawnRune(gameScene) {
        const runeType = this.selectRuneType();
        const position = this.getRandomPosition();
        
        const rune = new Rune(position.x, position.y, runeType);
        this.runes.push(rune);
    }

    selectRuneType() {
        const availableTypes = this.runeTypes;
        const randomIndex = Math.floor(Math.random() * availableTypes.length);
        return availableTypes[randomIndex];
    }

    getRandomPosition() {
        return {
            x: Math.random() * 700 + 50,
            y: Math.random() * 500 + 50
        };
    }

    // Применение руны к герою
    applyRune(hero, rune) {
        const runeType = this.runeTypes.find(type => type.type === rune.type);
        if (!runeType) return;
        
        // Применяем эффект
        runeType.effect(hero);
        
        // Если эффект временный, добавляем его в активные
        if (runeType.duration > 0) {
            const effect = new RuneEffect(runeType, hero);
            this.activeEffects.push(effect);
        }
        
        console.log(`Применена руна: ${runeType.name}`);
    }

    // Получение информации о системе
    getRunes() {
        return this.runes;
    }

    getActiveEffects() {
        return this.activeEffects;
    }

    getRuneCount() {
        return this.runes.length;
    }

    getMaxRunes() {
        return this.maxRunes;
    }
}

// Класс руны
class Rune {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 20;
        this.life = 30000; // 30 секунд жизни
        this.maxLife = 30000;
        this.pulse = 0;
        this.destroyed = false;
        
        // Визуальные эффекты
        this.color = type.color;
        this.glowIntensity = 1;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        this.pulse += deltaTime * 0.005;
        this.glowIntensity = 0.5 + Math.sin(this.pulse) * 0.5;
    }

    isExpired() {
        return this.life <= 0 || this.destroyed;
    }

    destroy() {
        this.destroyed = true;
    }

    render(ctx) {
        if (this.destroyed) return;
        
        const alpha = this.life / this.maxLife;
        const scale = 1 + Math.sin(this.pulse) * 0.2;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.scale(scale, scale);
        
        // Эффект свечения
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20 * this.glowIntensity;
        
        // Основной круг
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Граница
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Символ руны
        this.renderRuneSymbol(ctx);
        
        ctx.restore();
    }

    renderRuneSymbol(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const symbol = this.getRuneSymbol();
        ctx.fillText(symbol, this.x, this.y);
    }

    getRuneSymbol() {
        const symbols = {
            'damage': '⚔',
            'speed': '⚡',
            'health': '❤',
            'mana': '💧',
            'piercing': '➡',
            'multishot': '↗'
        };
        return symbols[this.type] || '?';
    }
}

// Класс эффекта руны
class RuneEffect {
    constructor(runeType, hero) {
        this.runeType = runeType;
        this.hero = hero;
        this.duration = runeType.duration;
        this.maxDuration = runeType.duration;
        this.applied = false;
    }

    update(deltaTime) {
        this.duration -= deltaTime;
        
        if (!this.applied) {
            this.applyEffect();
            this.applied = true;
        }
    }

    applyEffect() {
        this.runeType.effect(this.hero);
    }

    isExpired() {
        return this.duration <= 0;
    }

    getProgress() {
        return this.duration / this.maxDuration;
    }
}
