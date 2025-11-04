/**
 * Централизованная конфигурация баланса игры
 * Все числовые параметры игры в одном месте для легкой настройки
 */

export const GAME_CONFIG = {
    // Основные константы
    MAX_SPHERES: 6,
    
    // Базовые характеристики игрока
    PLAYER_BASE: {
        hp: 100,
        baseDamage: 10,        // урон за снаряд до бонусов
        baseAS: 1.0,           // атак в секунду
        baseMove: 100          // пикселей в секунду
    },
    
    // Пассивные бонусы за сферу (по уровням 1-10)
    PASSIVES_PER_SPHERE: {
        Q: {
            regenHP_per_sec: (level) => level  // 1..10 HP/сек за сферу Q
        },
        W: {
            moveSpeed_pct: (level) => [0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4, 6.0][level - 1]  // % за сферу W
        },
        E: {
            atkSpeed_pct: (level) => 5 * level,    // 5..50% за сферу E
            damage_flat: (level) => 2 * level      // 2..20 урона за сферу E
        }
    },
    
    // Ограничения и капы
    DIMINISHING_RETURNS: {
        maxASMultiplier: 2.0,      // Максимальный множитель скорости атаки
        moveSpeedSoftCap: 40,       // Мягкий кап скорости движения в %
        moveSpeedDiminishing: 0.5   // Эффективность превышения капа (50%)
    },
    
    // Система маны
    MANA_SYSTEM: {
        manaOnKill: {
            weak: 5,
            normal: 10,
            elite: 20,
            boss: 60
        },
        levelUpCost: (level) => Math.round(60 * Math.pow(level, 1.55)),  // Стоимость повышения уровня
        spellBaseCost: {
            QQQ: 40,
            WWW: 40,
            EEE: 50,
            QWE: 60
        },
        spellCost: (combo, level) => Math.round(GAME_CONFIG.MANA_SYSTEM.spellBaseCost[combo] * (1 + 0.12 * (level - 1)))
    },
    
    // Масштабирование врагов
    ENEMY_SCALING: {
        ttkTarget: {
            minShots: 3,
            maxShots: 6
        },
        hpBase: {
            weak: 30,
            normal: 60,
            elite: 150,
            boss: 1200
        },
        dpsBase: {
            weak: 5,
            normal: 10,
            elite: 18,
            boss: 45
        },
        hpMultiplier: (level) => 1 + 0.35 * (level - 1),
        dpsMultiplier: (level) => 1 + 0.22 * (level - 1)
    },
    
    // Бюджет угрозы (action economy)
    ENCOUNTER_BUDGET: {
        threatPoints: {
            easy: 0.7,
            standard: 1.0,
            hard: 1.4,
            boss: 2.2
        },
        maxMeleeAttackers: 3
    },
    
    // Настройки баланса
    TUNING_HOOKS: {
        passiveTuner: {
            regen: 1.0,
            move: 1.0,
            atkSpeed: 1.0,
            dmgFlat: 1.0
        },
        zoneScalar: {
            hp: 1.0,
            dps: 1.0,
            manaDrop: 1.0
        }
    },
    
    // Настройки пикселей маны
    MANA_PIXEL: {
        pickupRadius: 20, // Радиус подбора пикселей маны
        attractionRadius: 60, // Радиус притяжения к герою
        attractionSpeed: 100, // Скорость притяжения
        maxPixels: 50, // Максимальное количество пикселей на карте
        cleanupDistance: 200, // Расстояние для очистки невидимых пикселей
        spawnDelay: 500 // Задержка создания пикселя после смерти врага (мс)
    },
    
    // Расширенные игровые параметры
    GAME_STATS: {
        // Здоровье и защита
        maxHP: 100, // Максимальное здоровье
        hpRegen: 0, // Регенерация здоровья в секунду
        overheal: 0, // Избыточное лечение (бонус к максимальному здоровью)
        shield: 0, // Щит (дополнительная защита)
        armor: 0, // Броня (снижение урона)
        evasion: 0, // Уклонение (шанс избежать урона)
        lifeSteal: 0, // Вампиризм (восстановление здоровья от урона)
        
        // Урон и атака
        damage: 10, // Базовый урон
        critChance: 0, // Шанс критического урона
        critDamage: 0, // Дополнительный урон от критического удара
        attackSpeed: 1.0, // Скорость атаки (атак в секунду)
        projectileCount: 1, // Количество снарядов за атаку
        projectileBounces: 0, // Количество отскоков снарядов
        projectileSpeed: 200, // Скорость снарядов
        duration: 0, // Длительность эффектов
        damageToElites: 0, // Дополнительный урон по элитным врагам
        knockBack: 0, // Отталкивание врагов
        
        // Движение и размер
        movementSpeed: 100, // Скорость передвижения
        size: 1.0, // Размер персонажа
        
        // Удача и ресурсы
        luck: 0, // Удача (влияет на дроп)
        difficulty: 1.0, // Сложность игры
        pickupRange: 20, // Радиус подбора предметов
        xpGain: 1.0, // Множитель опыта
        goldGain: 1.0, // Множитель золота
        silverGain: 1.0, // Множитель серебра
        
        // Спавн и дроп
        eliteSpawnIncrease: 0, // Увеличение спавна элитных врагов
        powerupMultiplier: 1.0, // Множитель силы усилений
        powerupDropChance: 1.0 // Шанс выпадения усилений
    },
    
    // Комбинации (эффекты остаются как в оригинале)
    COMBOS: {
        QQQ: {
            name: 'Ice Spikes',
            duration: 6000,
            effects: {
                globalSlow: 0.4,
                projectileColor: '#66ccff',
                projectileRadius: 10
            }
        },
        WWW: {
            name: 'Berserker Speed',
            duration: 6000,
            effects: {
                attackSpeedMultiplier: 2.0,
                projectileSpeedBonus: 0.5,
                projectileRadius: 6
            }
        },
        EEE: {
            name: 'Explosive Shot',
            duration: 6000,
            effects: {
                aoeOnHit: true,
                projectileRadius: 12
            }
        },
        QWE: {
            name: 'Universal Mode',
            duration: 6000,
            effects: {
                damageBonus: 0.15,
                attackSpeedBonus: 0.15,
                projectileSpeedBonus: 0.15,
                projectileRadius: 9
            }
        }
    }
};

/**
 * Утилиты для работы с конфигурацией
 */
export class ConfigUtils {
    /**
     * Получить пассивный бонус для сферы определенного типа и уровня
     */
    static getPassiveBonus(sphereType, level) {
        const config = GAME_CONFIG.PASSIVES_PER_SPHERE[sphereType];
        if (!config) return 0;
        
        const result = {};
        for (const [key, fn] of Object.entries(config)) {
            result[key] = fn(level);
        }
        return result;
    }
    
    /**
     * Применить диминишинг к скорости движения
     */
    static applyMoveSpeedDiminishing(totalBonus) {
        const { moveSpeedSoftCap, moveSpeedDiminishing } = GAME_CONFIG.DIMINISHING_RETURNS;
        
        if (totalBonus <= moveSpeedSoftCap) {
            return totalBonus;
        }
        
        const excess = totalBonus - moveSpeedSoftCap;
        return moveSpeedSoftCap + (excess * moveSpeedDiminishing);
    }
    
    /**
     * Применить кап к скорости атаки
     */
    static applyAttackSpeedCap(totalMultiplier) {
        const { maxASMultiplier } = GAME_CONFIG.DIMINISHING_RETURNS;
        return Math.min(totalMultiplier, maxASMultiplier);
    }
    
    /**
     * Вычислить характеристики врага для уровня
     */
    static getEnemyStats(tier, level) {
        const { hpBase, dpsBase, hpMultiplier, dpsMultiplier } = GAME_CONFIG.ENEMY_SCALING;
        
        return {
            hp: Math.round(hpBase[tier] * hpMultiplier(level)),
            dps: Math.round(dpsBase[tier] * dpsMultiplier(level))
        };
    }
    
    /**
     * Вычислить стоимость заклинания для уровня
     */
    static getSpellCost(combo, level) {
        return GAME_CONFIG.MANA_SYSTEM.spellCost(combo, level);
    }
    
    /**
     * Вычислить стоимость повышения уровня
     */
    static getLevelUpCost(level) {
        return GAME_CONFIG.MANA_SYSTEM.levelUpCost(level);
    }
    
    /**
     * Получить настройки пикселей маны
     */
    static getManaPixelConfig() {
        return GAME_CONFIG.MANA_PIXEL;
    }
    
    /**
     * Получить игровые параметры
     */
    static getGameStats() {
        return GAME_CONFIG.GAME_STATS;
    }
    
    /**
     * Применить броню к урону
     * @param {number} damage - Исходный урон
     * @param {number} armor - Значение брони
     * @returns {number} Финальный урон
     */
    static applyArmor(damage, armor) {
        if (armor <= 0) return damage;
        // Формула: урон * (100 / (100 + броня))
        return Math.max(1, Math.floor(damage * (100 / (100 + armor))));
    }
    
    /**
     * Проверить уклонение
     * @param {number} evasion - Значение уклонения
     * @returns {boolean} Успешно ли уклонился
     */
    static checkEvasion(evasion) {
        if (evasion <= 0) return false;
        return Math.random() * 100 < evasion;
    }
    
    /**
     * Вычислить критический урон
     * @param {number} baseDamage - Базовый урон
     * @param {number} critChance - Шанс критического урона
     * @param {number} critDamage - Дополнительный урон от критического удара
     * @returns {object} {damage, isCrit}
     */
    static calculateCritDamage(baseDamage, critChance, critDamage) {
        const isCrit = Math.random() * 100 < critChance;
        if (isCrit) {
            const critMultiplier = 1 + (critDamage / 100);
            return {
                damage: Math.floor(baseDamage * critMultiplier),
                isCrit: true
            };
        }
        return {
            damage: baseDamage,
            isCrit: false
        };
    }
    
    /**
     * Вычислить вампиризм
     * @param {number} damage - Нанесенный урон
     * @param {number} lifeSteal - Значение вампиризма
     * @returns {number} Восстановленное здоровье
     */
    static calculateLifeSteal(damage, lifeSteal) {
        if (lifeSteal <= 0) return 0;
        return Math.floor(damage * (lifeSteal / 100));
    }
}
