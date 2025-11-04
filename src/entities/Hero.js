/**
 * Класс героя для Phaser - главный персонаж игры
 * Реализует фиксированное положение героя с движением мира
 */

import { GAME_CONFIG, ConfigUtils } from '../config/GameBalance.js';

export class Hero {
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;
        
        // Базовые характеристики из конфигурации
        this.baseMoveSpeed = GAME_CONFIG.PLAYER_BASE.baseMove;
        this.baseDamage = GAME_CONFIG.PLAYER_BASE.baseDamage;
        this.baseAttackSpeed = GAME_CONFIG.PLAYER_BASE.baseAS;
        this.autoFireCooldown = 1000 / this.baseAttackSpeed; // Кулдаун в миллисекундах
        this.nextFireTime = 0;
        
        // Система характеристик
        this.level = 1;
        this.health = GAME_CONFIG.PLAYER_BASE.hp;
        this.maxHealth = GAME_CONFIG.PLAYER_BASE.hp;
        this.mana = 0;
        this.maxMana = 100;
        
        // Расширенные игровые параметры
        this.gameStats = { ...ConfigUtils.getGameStats() };
        this.shield = 0; // Текущий щит
        this.overheal = 0; // Избыточное лечение
        
        // Пассивные улучшения от сфер
        this.passiveBonuses = {
            healthRegen: 0,      // Восстановление здоровья от сфер Q
            moveSpeed: 0,        // Скорость передвижения от сфер W
            attackSpeed: 0,      // Скорость атаки от сфер E
            attackDamage: 0      // Урон от атак от сфер E
        };
        
        // Активные сферы (максимум 6)
        this.activeSpheres = [];
        this.maxSpheres = GAME_CONFIG.MAX_SPHERES;
        
        // Визуальные эффекты
        this.visualScale = { x: 1, y: 1 };
        this.lastMovementVector = { x: 0, y: 0 };
        this.isMoving = false;
        
        // Создаем визуальное представление героя
        this.create();
    }

    create() {
        // Создаем зеленый кружок как героя
        this.sprite = this.scene.add.circle(0, 0, 20, 0x00ff00);
        
        // Устанавливаем героя в центр экрана
        this.sprite.setPosition(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
        
        console.log('Hero: создан в центре экрана');
    }

    update(deltaTime, pointerVector) {
        // Герой остается фиксированным в центре
        // Вся логика движения обрабатывается через worldOffset в сцене
        
        // Получаем вектор движения из pointerVector
        const movementVector = pointerVector || { x: 0, y: 0 };
        const movementLength = Math.sqrt(movementVector.x * movementVector.x + movementVector.y * movementVector.y);
        
        // Определяем, движется ли герой
        this.isMoving = movementLength > 0;
        
        // Обновляем здоровье с учетом регенерации
        this.updateHealthRegeneration(deltaTime);
        
        // Обновляем визуальные эффекты
        this.updateVisualEffects(deltaTime, movementVector, movementLength);
        
        // Обновляем позицию героя (он всегда должен быть в центре)
        this.sprite.setPosition(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
    }
    
    /**
     * Обновление визуальных эффектов (временно для placeholder)
     */
    updateVisualEffects(deltaTime, movementVector, movementLength) {
        const time = this.scene.time.now;
        
        // 1. Squash/Stretch эффект при движении
        if (this.isMoving) {
            // Нормализуем вектор движения
            const dirX = movementVector.x / movementLength;
            const dirY = movementVector.y / movementLength;
            
            // Применяем растяжение по направлению движения
            const stretchX = 1 + Math.abs(dirX) * 0.2;
            const stretchY = 1 + Math.abs(dirY) * 0.2;
            
            // Плавно интерполируем к новым значениям
            this.visualScale.x = Phaser.Math.Linear(this.visualScale.x, stretchX, 0.1);
            this.visualScale.y = Phaser.Math.Linear(this.visualScale.y, stretchY, 0.1);
            
            // Сохраняем вектор движения для частиц
            this.lastMovementVector = { x: dirX, y: dirY };
        } else {
            // При остановке плавно возвращаем к нормальному размеру
            this.visualScale.x = Phaser.Math.Linear(this.visualScale.x, 1, 0.1);
            this.visualScale.y = Phaser.Math.Linear(this.visualScale.y, 1, 0.1);
        }
        
        // Применяем масштабирование к спрайту
        this.sprite.setScale(this.visualScale.x, this.visualScale.y);
        
        // 2. Bobbing анимация (легкое покачивание)
        const bobbingOffset = Math.sin(time / 150) * 0.3;
        const currentY = this.scene.cameras.main.height / 2;
        this.sprite.y = currentY + bobbingOffset;
        
        // 3. Спавн частиц движения (если есть система частиц)
        if (this.isMoving && this.scene.motionParticleSystem) {
            const worldPos = this.getWorldPosition();
            this.scene.motionParticleSystem.spawn(worldPos.x, worldPos.y, this.lastMovementVector.x, this.lastMovementVector.y);
        }
    }

    // Получить позицию героя в мировых координатах
    getWorldPosition() {
        // Герой находится в центре экрана, его мировые координаты = worldOffset + центр экрана
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        
        return {
            x: this.scene.worldOffset.x + centerX,
            y: this.scene.worldOffset.y + centerY
        };
    }

    // Получить спрайт героя
    getSprite() {
        return this.sprite;
    }


    // Проверить, готов ли герой к атаке
    canFire(time) {
        return time >= this.nextFireTime;
    }

    // Установить время следующей атаки
    setNextFireTime(time) {
        this.nextFireTime = time + this.autoFireCooldown;
    }

    // Уничтожить героя
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    // ====================================================================
    // КОМБО-СИСТЕМА - методы для работы с комбинациями рун
    // ====================================================================
    
    /**
     * Применить комбо-бафф
     * @param {string} comboType - Тип комбинации
     */
    applyComboBuff(comboType) {
        // Сохраняем оригинальные значения
        this.originalAutoFireCooldown = this.autoFireCooldown;
        this.originalBaseDamage = this.baseDamage;
        
        switch (comboType) {
            case 'ice_spikes':
                // Ледяные шипы - замедление врагов через глобальные флаги
                console.log('Hero: применен бафф ледяных шипов');
                break;
                
            case 'berserker_speed':
                // Бешеная скорость - автоатака в 2 раза быстрее
                this.autoFireCooldown = this.originalAutoFireCooldown / 2;
                console.log(`Hero: скорость автоатаки увеличена с ${this.originalAutoFireCooldown}мс до ${this.autoFireCooldown}мс`);
                break;
                
            case 'explosive_shot':
                // Взрывная атака - через глобальные флаги
                console.log('Hero: применен бафф взрывной атаки');
                break;
                
            case 'universal_mode':
                // Универсальный режим - +15% урон, +15% скорость, +15% AoE
                this.baseDamage = Math.floor(this.originalBaseDamage * 1.15);
                this.autoFireCooldown = Math.floor(this.originalAutoFireCooldown * 0.85); // 15% быстрее
                console.log(`Hero: универсальный режим - урон ${this.originalBaseDamage}→${this.baseDamage}, скорость ${this.originalAutoFireCooldown}мс→${this.autoFireCooldown}мс`);
                break;
                
            case 'standard_buff':
                // Стандартное усиление - +20% урона
                this.baseDamage = Math.floor(this.originalBaseDamage * 1.2);
                console.log(`Hero: стандартный бафф - урон ${this.originalBaseDamage}→${this.baseDamage}`);
                break;
        }
        
        // Устанавливаем флаг активного баффа
        this.hasComboBuff = true;
        this.activeComboType = comboType;
    }
    
    /**
     * Убрать комбо-бафф
     */
    removeComboBuff() {
        if (!this.hasComboBuff) return;
        
        console.log(`Hero: снятие баффа "${this.activeComboType}"`);
        
        // Восстанавливаем оригинальные значения
        if (this.originalAutoFireCooldown !== undefined) {
            this.autoFireCooldown = this.originalAutoFireCooldown;
        }
        if (this.originalBaseDamage !== undefined) {
            this.baseDamage = this.originalBaseDamage;
        }
        
        // Сбрасываем флаги
        this.hasComboBuff = false;
        this.activeComboType = null;
        this.originalAutoFireCooldown = undefined;
        this.originalBaseDamage = undefined;
        
        console.log('Hero: все комбо-баффы сняты');
    }
    
    /**
     * Проверить, есть ли активный комбо-бафф
     * @returns {boolean} true если есть активный бафф
     */
    hasActiveComboBuff() {
        return this.hasComboBuff;
    }
    
    /**
     * Получить тип активного комбо-баффа
     * @returns {string|null} Тип баффа или null
     */
    getActiveComboType() {
        return this.activeComboType;
    }

    // ====================================================================
    // СИСТЕМА ПАССИВНЫХ УЛУЧШЕНИЙ - методы для работы с пассивными бонусами
    // ====================================================================
    
    /**
     * Обновить пассивные улучшения на основе активных сфер
     * @param {Array} activeSpheres - Массив активных сфер ['Q', 'W', 'E']
     */
    updatePassiveBonuses(activeSpheres) {
        // Сбрасываем все бонусы
        this.passiveBonuses = {
            healthRegen: 0,
            moveSpeed: 0,
            attackSpeed: 0,
            attackDamage: 0
        };
        
        // Подсчитываем количество каждой сферы
        const sphereCounts = { Q: 0, W: 0, E: 0 };
        if (activeSpheres && Array.isArray(activeSpheres)) {
            activeSpheres.forEach(sphere => {
                if (sphereCounts.hasOwnProperty(sphere)) {
                    sphereCounts[sphere]++;
                }
            });
        }
        
        // Применяем бонусы от сфер Q (восстановление здоровья)
        if (sphereCounts.Q > 0) {
            const qBonus = ConfigUtils.getPassiveBonus('Q', this.level);
            this.passiveBonuses.healthRegen = sphereCounts.Q * qBonus.regenHP_per_sec;
        }
        
        // Применяем бонусы от сфер W (скорость передвижения)
        if (sphereCounts.W > 0) {
            const wBonus = ConfigUtils.getPassiveBonus('W', this.level);
            this.passiveBonuses.moveSpeed = sphereCounts.W * wBonus.moveSpeed_pct;
        }
        
        // Применяем бонусы от сфер E (скорость атаки и урон)
        if (sphereCounts.E > 0) {
            const eBonus = ConfigUtils.getPassiveBonus('E', this.level);
            this.passiveBonuses.attackSpeed = sphereCounts.E * eBonus.atkSpeed_pct;
            this.passiveBonuses.attackDamage = sphereCounts.E * eBonus.damage_flat;
        }
        
        console.log(`Hero: пассивные бонусы обновлены - Q:${sphereCounts.Q} W:${sphereCounts.W} E:${sphereCounts.E}`);
    }
    
    /**
     * Получить эффективную скорость передвижения с учетом бонусов и диминишинга
     * @returns {number} Скорость передвижения
     */
    getEffectiveMoveSpeed() {
        const totalBonus = this.passiveBonuses.moveSpeed;
        const diminishedBonus = ConfigUtils.applyMoveSpeedDiminishing(totalBonus);
        return this.baseMoveSpeed * (1 + diminishedBonus / 100);
    }
    
    /**
     * Получить эффективный урон с учетом бонусов
     * @returns {number} Урон
     */
    getEffectiveDamage() {
        return this.baseDamage + this.passiveBonuses.attackDamage;
    }
    
    /**
     * Получить эффективный кулдаун атаки с учетом бонусов и капов
     * @returns {number} Кулдаун в миллисекундах
     */
    getEffectiveAttackCooldown() {
        const speedBonus = this.passiveBonuses.attackSpeed / 100; // Преобразуем проценты в множитель
        const totalMultiplier = 1 + speedBonus;
        const cappedMultiplier = ConfigUtils.applyAttackSpeedCap(totalMultiplier);
        return this.autoFireCooldown / cappedMultiplier;
    }
    
    /**
     * Получить эффективную скорость атаки (атак в секунду)
     * @returns {number} Скорость атаки
     */
    getEffectiveAttackSpeed() {
        return 1000 / this.getEffectiveAttackCooldown();
    }
    
    /**
     * Обновить здоровье с учетом регенерации
     * @param {number} deltaTime - Время с последнего обновления в миллисекундах
     */
    updateHealthRegeneration(deltaTime) {
        if (this.healthRegen > 0 && this.health < this.maxHealth) {
            const regenAmount = (this.healthRegen * deltaTime) / 1000; // Преобразуем в секунды
            this.health = Math.min(this.maxHealth, this.health + regenAmount);
        }
    }
    
    /**
     * Получить информацию о пассивных бонусах
     * @returns {Object} Объект с информацией о бонусах
     */
    getPassiveBonusesInfo() {
        return {
            healthRegen: this.passiveBonuses.healthRegen,
            moveSpeed: this.passiveBonuses.moveSpeed,
            attackSpeed: this.passiveBonuses.attackSpeed,
            attackDamage: this.passiveBonuses.attackDamage,
            effectiveMoveSpeed: this.getEffectiveMoveSpeed(),
            effectiveDamage: this.getEffectiveDamage(),
            effectiveAttackCooldown: this.getEffectiveAttackCooldown()
        };
    }
    
    /**
     * Повысить уровень героя
     */
    levelUp() {
        this.level++;
        this.maxHealth += 20; // Увеличиваем максимальное здоровье
        this.health = this.maxHealth; // Восстанавливаем здоровье при повышении уровня
        this.mana = 0; // Сбрасываем ману при повышении уровня
        
        // Обновляем пассивные бонусы с новым уровнем
        this.updatePassiveBonuses(this.activeSpheres);
        
        console.log(`Hero: уровень повышен до ${this.level}`);
    }
    
    /**
     * Добавить ману
     * @param {number} amount - Количество маны
     */
    addMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
        
        // Проверяем, можно ли повысить уровень
        const levelUpCost = ConfigUtils.getLevelUpCost(this.level);
        if (this.mana >= levelUpCost && this.level < 10) {
            this.mana -= levelUpCost;
            this.levelUp();
        }
    }
    
    /**
     * Использовать ману для заклинания
     * @param {string} combo - Тип комбинации
     * @returns {boolean} true если ману хватило
     */
    useManaForSpell(combo) {
        const cost = ConfigUtils.getSpellCost(combo, this.level);
        if (this.mana >= cost) {
            this.mana -= cost;
            return true;
        }
        return false;
    }
    
    /**
     * Получить стоимость заклинания
     * @param {string} combo - Тип комбинации
     * @returns {number} Стоимость в мане
     */
    getSpellCost(combo) {
        return ConfigUtils.getSpellCost(combo, this.level);
    }
    
    /**
     * Получить базовый урон героя (без критических ударов)
     * @returns {number} Базовый урон
     */
    getBaseDamage() {
        let damage = this.baseDamage;
        
        // Добавляем пассивные бонусы от сфер E
        damage += this.passiveBonuses.attackDamage;
        
        // Добавляем бонусы от игровых параметров
        damage += this.gameStats.damage;
        
        return Math.max(1, damage);
    }
    
    /**
     * Получить урон героя (с учетом пассивных бонусов)
     * @returns {number} Урон
     */
    getDamage() {
        const baseDamage = this.getBaseDamage();
        const critResult = ConfigUtils.calculateCritDamage(
            baseDamage, 
            this.gameStats.critChance, 
            this.gameStats.critDamage
        );
        return critResult.damage;
    }
    
    /**
     * Проверить, готов ли герой к атаке (с учетом пассивных бонусов)
     * @param {number} time - Текущее время
     * @returns {boolean} true если готов к атаке
     */
    canFire(time) {
        return time >= this.nextFireTime;
    }
    
    /**
     * Установить время следующей атаки (с учетом пассивных бонусов)
     * @param {number} time - Текущее время
     */
    setNextFireTime(time) {
        this.nextFireTime = time + this.getEffectiveAttackCooldown();
    }

    // ====================================================================
    // LEGACY CANVAS CODE - БУДЕТ ПЕРЕНОСИТЬСЯ ПОЭТАПНО
    // ====================================================================
    
    /*
    ВНИМАНИЕ: Весь код ниже - это старая Canvas-реализация, которая будет
    поэтапно переноситься в Phaser. Код сохранен для справки и постепенной миграции.
    
    СТАТУС: Ожидает переноса в Phaser-системы
    */

    /*
    import { Projectile } from './Projectile.js';

    export class Hero {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 20;
            this.speed = 200;
            this.health = 100;
            this.maxHealth = 100;
            this.mana = 100;
            this.maxMana = 100;
            
            // Движение
            this.velocityX = 0;
            this.velocityY = 0;
            this.isMovingUp = false;
            this.isMovingDown = false;
            this.isMovingLeft = false;
            this.isMovingRight = false;
            
            // Стрельба
            this.shootCooldown = 0;
            this.shootRate = 300; // миллисекунды между выстрелами
            this.projectileSpeed = 400;
            this.projectileDamage = 25;
            
            // Прицеливание
            this.aimAngle = 0;
            this.mouseX = x;
            this.mouseY = y;
            
            // Визуальные эффекты
            this.color = '#00ff00';
            this.borderColor = '#ffffff';
            this.isInvulnerable = false;
            this.invulnerabilityTime = 0;
            
            // Руны и способности
            this.activeRunes = [];
            this.abilities = [];
        }

        update(deltaTime) {
            // Обновляем движение
            this.updateMovement(deltaTime);
            
            // Обновляем кулдаун стрельбы
            if (this.shootCooldown > 0) {
                this.shootCooldown -= deltaTime;
            }
            
            // Обновляем неуязвимость
            if (this.invulnerabilityTime > 0) {
                this.invulnerabilityTime -= deltaTime;
                this.isInvulnerable = this.invulnerabilityTime > 0;
            }
            
            // Обновляем руны
            this.updateRunes(deltaTime);
            
            // Обновляем способности
            this.updateAbilities(deltaTime);
        }

        updateMovement(deltaTime) {
            // Сбрасываем скорость
            this.velocityX = 0;
            this.velocityY = 0;
            
            // Применяем движение
            if (this.isMovingUp) this.velocityY = -this.speed;
            if (this.isMovingDown) this.velocityY = this.speed;
            if (this.isMovingLeft) this.velocityX = -this.speed;
            if (this.isMovingRight) this.velocityX = this.speed;
            
            // Нормализуем диагональное движение
            if (this.velocityX !== 0 && this.velocityY !== 0) {
                const factor = Math.sqrt(2) / 2;
                this.velocityX *= factor;
                this.velocityY *= factor;
            }
            
            // Обновляем позицию
            this.x += this.velocityX * deltaTime / 1000;
            this.y += this.velocityY * deltaTime / 1000;
            
            // Ограничиваем движение границами экрана
            this.x = Math.max(this.radius, Math.min(800 - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(600 - this.radius, this.y));
        }

        updateRunes(deltaTime) {
            this.activeRunes.forEach(rune => {
                rune.update(deltaTime);
            });
            
            // Удаляем истекшие руны
            this.activeRunes = this.activeRunes.filter(rune => !rune.isExpired());
        }

        updateAbilities(deltaTime) {
            this.abilities.forEach(ability => {
                ability.update(deltaTime);
            });
        }

        // Методы движения
        moveUp() {
            this.isMovingUp = true;
        }

        moveDown() {
            this.isMovingDown = true;
        }

        moveLeft() {
            this.isMovingLeft = true;
        }

        moveRight() {
            this.isMovingRight = true;
        }

        stopMoveUp() {
            this.isMovingUp = false;
        }

        stopMoveDown() {
            this.isMovingDown = false;
        }

        stopMoveLeft() {
            this.isMovingLeft = false;
        }

        stopMoveRight() {
            this.isMovingRight = false;
        }

        // Прицеливание
        aimAt(mouseX, mouseY) {
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            this.aimAngle = Math.atan2(dy, dx);
        }

        // Стрельба
        shoot() {
            if (this.shootCooldown <= 0) {
                const projectile = new Projectile(
                    this.x,
                    this.y,
                    this.aimAngle,
                    this.projectileSpeed,
                    this.projectileDamage
                );
                
                this.shootCooldown = this.shootRate;
                return projectile;
            }
            return null;
        }

        // Получение урона
        takeDamage(damage) {
            if (this.isInvulnerable) return;
            
            this.health -= damage;
            this.isInvulnerable = true;
            this.invulnerabilityTime = 1000; // 1 секунда неуязвимости
            
            if (this.health <= 0) {
                this.health = 0;
            }
        }

        // Лечение
        heal(amount) {
            this.health = Math.min(this.maxHealth, this.health + amount);
        }

        // Восстановление маны
        restoreMana(amount) {
            this.mana = Math.min(this.maxMana, this.mana + amount);
        }

        // Использование маны
        useMana(amount) {
            if (this.mana >= amount) {
                this.mana -= amount;
                return true;
            }
            return false;
        }

        // Сбор рун
        collectRune(rune) {
            rune.applyEffect(this);
            this.activeRunes.push(rune);
        }

        // Добавление способности
        addAbility(ability) {
            this.abilities.push(ability);
        }

        // Проверки состояния
        isDead() {
            return this.health <= 0;
        }

        isAlive() {
            return this.health > 0;
        }

        canShoot() {
            return this.shootCooldown <= 0;
        }

        // Отрисовка
        render(ctx) {
            // Сохраняем контекст
            ctx.save();
            
            // Перемещаемся к позиции героя
            ctx.translate(this.x, this.y);
            ctx.rotate(this.aimAngle);
            
            // Отрисовываем тело героя
            if (this.isInvulnerable) {
                // Мигание при неуязвимости
                const alpha = Math.sin(Date.now() / 100) * 0.5 + 0.5;
                ctx.globalAlpha = alpha;
            }
            
            // Основной круг
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Граница
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Направление (стрелка)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(this.radius - 5, 0);
            ctx.lineTo(this.radius + 5, -3);
            ctx.lineTo(this.radius + 5, 3);
            ctx.closePath();
            ctx.fill();
            
            // Полоска здоровья
            this.renderHealthBar(ctx);
            
            // Восстанавливаем контекст
            ctx.restore();
        }

        renderHealthBar(ctx) {
            const barWidth = this.radius * 2;
            const barHeight = 4;
            const barY = -this.radius - 10;
            
            // Фон полоски
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
            
            // Полоска здоровья
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
            ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
            
            // Граница полоски
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
        }
    }
    */
    
    /**
     * Получить эффективное здоровье (с учетом щита и избыточного лечения)
     * @returns {number} Эффективное здоровье
     */
    getEffectiveHealth() {
        return this.health + this.shield + this.overheal;
    }
    
    /**
     * Получить максимальное эффективное здоровье
     * @returns {number} Максимальное эффективное здоровье
     */
    getMaxEffectiveHealth() {
        return this.maxHealth + this.gameStats.overheal;
    }
    
    /**
     * Получить эффективный урон с учетом критических ударов
     * @returns {object} {damage, isCrit}
     */
    getEffectiveDamage() {
        const baseDamage = this.getBaseDamage();
        const critResult = ConfigUtils.calculateCritDamage(
            baseDamage, 
            this.gameStats.critChance, 
            this.gameStats.critDamage
        );
        return critResult;
    }
    
    /**
     * Получить количество снарядов за атаку
     * @returns {number} Количество снарядов
     */
    getProjectileCount() {
        return this.gameStats.projectileCount;
    }
    
    /**
     * Получить скорость снарядов
     * @returns {number} Скорость снарядов
     */
    getProjectileSpeed() {
        return this.gameStats.projectileSpeed;
    }
    
    /**
     * Получить количество отскоков снарядов
     * @returns {number} Количество отскоков
     */
    getProjectileBounces() {
        return this.gameStats.projectileBounces;
    }
    
    /**
     * Получить отталкивание
     * @returns {number} Сила отталкивания
     */
    getKnockBack() {
        return this.gameStats.knockBack;
    }
    
    /**
     * Получить размер персонажа
     * @returns {number} Размер
     */
    getSize() {
        return this.gameStats.size;
    }
    
    /**
     * Получить удачу
     * @returns {number} Значение удачи
     */
    getLuck() {
        return this.gameStats.luck;
    }
    
    /**
     * Получить радиус подбора предметов
     * @returns {number} Радиус подбора
     */
    getPickupRange() {
        return this.gameStats.pickupRange;
    }
    
    /**
     * Получить множитель опыта
     * @returns {number} Множитель опыта
     */
    getXpGain() {
        return this.gameStats.xpGain;
    }
    
    /**
     * Получить множитель золота
     * @returns {number} Множитель золота
     */
    getGoldGain() {
        return this.gameStats.goldGain;
    }
    
    /**
     * Получить множитель серебра
     * @returns {number} Множитель серебра
     */
    getSilverGain() {
        return this.gameStats.silverGain;
    }
    
    /**
     * Получить увеличение спавна элитных врагов
     * @returns {number} Увеличение спавна
     */
    getEliteSpawnIncrease() {
        return this.gameStats.eliteSpawnIncrease;
    }
    
    /**
     * Получить множитель силы усилений
     * @returns {number} Множитель усилений
     */
    getPowerupMultiplier() {
        return this.gameStats.powerupMultiplier;
    }
    
    /**
     * Получить шанс выпадения усилений
     * @returns {number} Шанс выпадения
     */
    getPowerupDropChance() {
        return this.gameStats.powerupDropChance;
    }
    
    /**
     * Получить дополнительный урон по элитным врагам
     * @returns {number} Дополнительный урон
     */
    getDamageToElites() {
        return this.gameStats.damageToElites;
    }
    
    /**
     * Получить длительность эффектов
     * @returns {number} Длительность эффектов
     */
    getDuration() {
        return this.gameStats.duration;
    }
    
    /**
     * Получить сложность игры
     * @returns {number} Сложность
     */
    getDifficulty() {
        return this.gameStats.difficulty;
    }
    
    /**
     * Получить все игровые параметры
     * @returns {object} Все параметры
     */
    getAllGameStats() {
        return { ...this.gameStats };
    }
    
    /**
     * Установить игровой параметр
     * @param {string} statName - Название параметра
     * @param {number} value - Значение
     */
    setGameStat(statName, value) {
        if (this.gameStats.hasOwnProperty(statName)) {
            this.gameStats[statName] = value;
            console.log(`Hero: параметр ${statName} установлен в ${value}`);
        } else {
            console.warn(`Hero: неизвестный параметр ${statName}`);
        }
    }
    
    /**
     * Добавить к игровому параметру
     * @param {string} statName - Название параметра
     * @param {number} value - Значение для добавления
     */
    addToGameStat(statName, value) {
        if (this.gameStats.hasOwnProperty(statName)) {
            this.gameStats[statName] += value;
            console.log(`Hero: к параметру ${statName} добавлено ${value}, новое значение: ${this.gameStats[statName]}`);
        } else {
            console.warn(`Hero: неизвестный параметр ${statName}`);
        }
    }
}