/**
 * Система маны - управляет магической энергией игрока
 */

export class ManaSystem {
    constructor() {
        this.initialized = false;
        
        // Мана
        this.currentMana = 100;
        this.maxMana = 100;
        this.manaRegenRate = 10; // мана в секунду
        this.manaRegenDelay = 2000; // задержка перед регенерацией
        this.lastManaUse = 0;
        
        // Способности
        this.abilities = [];
        this.abilityCooldowns = new Map();
        
        // Магические эффекты
        this.magicEffects = [];
        
        // Визуальные эффекты
        this.manaBar = {
            x: 10,
            y: 120,
            width: 200,
            height: 20
        };
    }

    init() {
        this.initialized = true;
        this.setupAbilities();
    }

    setupAbilities() {
        this.abilities = [
            {
                name: 'Огненный шар',
                cost: 20,
                cooldown: 1000,
                effect: (hero) => this.fireball(hero)
            },
            {
                name: 'Ледяная стена',
                cost: 30,
                cooldown: 2000,
                effect: (hero) => this.iceWall(hero)
            },
            {
                name: 'Молния',
                cost: 25,
                cooldown: 1500,
                effect: (hero) => this.lightning(hero)
            },
            {
                name: 'Телепорт',
                cost: 40,
                cooldown: 3000,
                effect: (hero) => this.teleport(hero)
            }
        ];
    }

    update(deltaTime, gameScene) {
        if (!this.initialized) return;
        
        // Обновляем регенерацию маны
        this.updateManaRegeneration(deltaTime);
        
        // Обновляем кулдауны способностей
        this.updateAbilityCooldowns(deltaTime);
        
        // Обновляем магические эффекты
        this.updateMagicEffects(deltaTime);
    }

    updateManaRegeneration(deltaTime) {
        const timeSinceLastUse = Date.now() - this.lastManaUse;
        
        if (timeSinceLastUse >= this.manaRegenDelay && this.currentMana < this.maxMana) {
            this.currentMana += this.manaRegenRate * deltaTime / 1000;
            this.currentMana = Math.min(this.maxMana, this.currentMana);
        }
    }

    updateAbilityCooldowns(deltaTime) {
        for (const [abilityName, cooldown] of this.abilityCooldowns) {
            if (cooldown > 0) {
                this.abilityCooldowns.set(abilityName, cooldown - deltaTime);
            }
        }
    }

    updateMagicEffects(deltaTime) {
        this.magicEffects.forEach(effect => {
            effect.update(deltaTime);
        });
        
        // Удаляем истекшие эффекты
        this.magicEffects = this.magicEffects.filter(effect => !effect.isExpired());
    }

    // Использование маны
    useMana(amount) {
        if (this.currentMana >= amount) {
            this.currentMana -= amount;
            this.lastManaUse = Date.now();
            return true;
        }
        return false;
    }

    // Восстановление маны
    restoreMana(amount) {
        this.currentMana = Math.min(this.maxMana, this.currentMana + amount);
    }

    // Использование способности
    useAbility(abilityName, hero) {
        const ability = this.abilities.find(ability => ability.name === abilityName);
        if (!ability) return false;
        
        // Проверяем кулдаун
        if (this.abilityCooldowns.get(abilityName) > 0) return false;
        
        // Проверяем ману
        if (!this.useMana(ability.cost)) return false;
        
        // Применяем способность
        ability.effect(hero);
        
        // Устанавливаем кулдаун
        this.abilityCooldowns.set(abilityName, ability.cooldown);
        
        return true;
    }

    // Способности
    fireball(hero) {
        console.log('Огненный шар!');
        // Здесь можно добавить логику создания огненного шара
        this.addMagicEffect(new FireballEffect(hero.x, hero.y, hero.aimAngle));
    }

    iceWall(hero) {
        console.log('Ледяная стена!');
        // Здесь можно добавить логику создания ледяной стены
        this.addMagicEffect(new IceWallEffect(hero.x, hero.y));
    }

    lightning(hero) {
        console.log('Молния!');
        // Здесь можно добавить логику создания молнии
        this.addMagicEffect(new LightningEffect(hero.x, hero.y, hero.aimAngle));
    }

    teleport(hero) {
        console.log('Телепорт!');
        // Телепортируем героя в случайное место
        hero.x = Math.random() * 700 + 50;
        hero.y = Math.random() * 500 + 50;
    }

    // Добавление магического эффекта
    addMagicEffect(effect) {
        this.magicEffects.push(effect);
    }

    // Получение информации о системе
    getCurrentMana() {
        return this.currentMana;
    }

    getMaxMana() {
        return this.maxMana;
    }

    getManaPercent() {
        return this.currentMana / this.maxMana;
    }

    getAbilities() {
        return this.abilities;
    }

    getAbilityCooldown(abilityName) {
        return this.abilityCooldowns.get(abilityName) || 0;
    }

    canUseAbility(abilityName) {
        const ability = this.abilities.find(ability => ability.name === abilityName);
        if (!ability) return false;
        
        return this.currentMana >= ability.cost && 
               this.getAbilityCooldown(abilityName) <= 0;
    }

    // Отрисовка
    render(ctx) {
        this.renderManaBar(ctx);
        this.renderMagicEffects(ctx);
    }

    renderManaBar(ctx) {
        const bar = this.manaBar;
        const manaPercent = this.getManaPercent();
        
        // Фон полоски
        ctx.fillStyle = '#333';
        ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
        
        // Полоска маны
        ctx.fillStyle = '#0088ff';
        ctx.fillRect(bar.x, bar.y, bar.width * manaPercent, bar.height);
        
        // Граница
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(bar.x, bar.y, bar.width, bar.height);
        
        // Текст
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`Мана: ${Math.floor(this.currentMana)}/${this.maxMana}`, bar.x, bar.y - 5);
    }

    renderMagicEffects(ctx) {
        this.magicEffects.forEach(effect => effect.render(ctx));
    }
}

// Классы магических эффектов
class FireballEffect {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 300;
        this.radius = 15;
        this.damage = 50;
        this.life = 2000;
        this.maxLife = 2000;
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.velocityX * deltaTime / 1000;
        this.y += this.velocityY * deltaTime / 1000;
    }

    isExpired() {
        return this.life <= 0;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Эффект огня
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#ff4400');
        gradient.addColorStop(0.5, '#ff8800');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class IceWallEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 20;
        this.life = 5000;
        this.maxLife = 5000;
    }

    update(deltaTime) {
        this.life -= deltaTime;
    }

    isExpired() {
        return this.life <= 0;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        ctx.restore();
    }
}

class LightningEffect {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = 200;
        this.life = 500;
        this.maxLife = 500;
        this.segments = [];
        this.generateSegments();
    }

    generateSegments() {
        const segmentCount = 10;
        for (let i = 0; i < segmentCount; i++) {
            this.segments.push({
                x: this.x + Math.cos(this.angle) * (this.length / segmentCount) * i + (Math.random() - 0.5) * 20,
                y: this.y + Math.sin(this.angle) * (this.length / segmentCount) * i + (Math.random() - 0.5) * 20
            });
        }
    }

    update(deltaTime) {
        this.life -= deltaTime;
    }

    isExpired() {
        return this.life <= 0;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        
        this.segments.forEach(segment => {
            ctx.lineTo(segment.x, segment.y);
        });
        
        ctx.stroke();
        ctx.restore();
    }
}
