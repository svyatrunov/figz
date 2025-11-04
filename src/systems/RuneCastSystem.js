/**
 * Система активации комбинаций рун
 * Управляет активацией ультимейт-способностей через комбинации QWE-рун
 */

export class RuneCastSystem {
    constructor(scene, hero, enemySystem, projectileSystem, castVFXSystem) {
        this.scene = scene;
        this.hero = hero;
        this.enemySystem = enemySystem;
        this.projectileSystem = projectileSystem;
        this.castVFXSystem = castVFXSystem;
        
        // Состояние комбинации
        this.activeCombo = null;
        this.comboEndTime = null;
        this.comboDuration = 6000; // 6 секунд
        
        // Глобальные флаги для эффектов
        this.globalFlags = {
            iceSpikes: false,      // QQQ - ледяные шипы
            berserkerSpeed: false, // WWW - бешеная скорость
            explosiveShot: false,  // EEE - взрывная атака
            universalMode: false,  // QWE - универсальный режим
            standardBuff: false    // любая другая комбинация
        };
        
        console.log('RuneCastSystem: инициализирован');
    }
    
    /**
     * Активировать комбинацию рун
     * @param {Array} runesArray - Массив рун ['Q', 'W', 'E']
     * @param {number} time - Текущее время
     */
    activateCombo(runesArray, time) {
        if (runesArray.length !== 3) {
            console.log('RuneCastSystem: требуется ровно 3 руны для активации');
            return false;
        }
        
        // Преобразуем массив в отсортированную строку
        const comboString = runesArray.slice().sort().join('');
        console.log(`RuneCastSystem: активация комбинации "${comboString}"`);
        
        // Определяем тип комбинации
        const comboType = this.determineComboType(comboString);
        
        // Применяем эффект
        this.applyComboEffect(comboType);
        
        // Запускаем визуальный эффект
        if (this.castVFXSystem) {
            const heroWorldPos = this.hero.getWorldPosition();
            this.castVFXSystem.playComboEffect(comboType, heroWorldPos);
        }
        
        // Устанавливаем время окончания
        this.activeCombo = comboType;
        this.comboEndTime = time + this.comboDuration;
        
        // Очищаем массив рун
        runesArray.length = 0;
        
        console.log(`RuneCastSystem: активирована комбинация "${comboType}" на ${this.comboDuration}мс`);
        return true;
    }
    
    /**
     * Определить тип комбинации по строке
     * @param {string} comboString - Строка комбинации
     * @returns {string} Тип комбинации
     */
    determineComboType(comboString) {
        switch (comboString) {
            case 'QQQ':
                return 'ice_spikes';
            case 'WWW':
                return 'berserker_speed';
            case 'EEE':
                return 'explosive_shot';
            case 'EQW':
            case 'EWQ':
            case 'QEW':
            case 'QWE':
            case 'WEQ':
            case 'WQE':
                return 'universal_mode';
            default:
                return 'standard_buff';
        }
    }
    
    /**
     * Применить эффект комбинации
     * @param {string} comboType - Тип комбинации
     */
    applyComboEffect(comboType) {
        // Сбрасываем все флаги
        this.resetGlobalFlags();
        
        switch (comboType) {
            case 'ice_spikes':
                this.globalFlags.iceSpikes = true;
                this.hero.applyComboBuff('ice_spikes');
                console.log('🔥 Активированы ледяные шипы - все враги замедлены на 40%');
                break;
                
            case 'berserker_speed':
                this.globalFlags.berserkerSpeed = true;
                this.hero.applyComboBuff('berserker_speed');
                console.log('🔥 Активирована бешеная скорость - автоатака в 2 раза быстрее');
                break;
                
            case 'explosive_shot':
                this.globalFlags.explosiveShot = true;
                this.hero.applyComboBuff('explosive_shot');
                console.log('🔥 Активирована взрывная атака - снаряды взрываются при попадании');
                break;
                
            case 'universal_mode':
                this.globalFlags.universalMode = true;
                this.hero.applyComboBuff('universal_mode');
                console.log('🔥 Активирован универсальный режим - +15% урон, скорость, AoE');
                break;
                
            case 'standard_buff':
                this.globalFlags.standardBuff = true;
                this.hero.applyComboBuff('standard_buff');
                console.log('🔥 Активировано стандартное усиление - +20% урона');
                break;
        }
    }
    
    /**
     * Сбросить все глобальные флаги
     */
    resetGlobalFlags() {
        Object.keys(this.globalFlags).forEach(key => {
            this.globalFlags[key] = false;
        });
    }
    
    /**
     * Обновить систему
     * @param {number} time - Текущее время
     */
    update(time) {
        // Проверяем, не истекла ли комбинация
        if (this.activeCombo && this.comboEndTime && time >= this.comboEndTime) {
            this.endCombo();
        }
    }
    
    /**
     * Завершить активную комбинацию
     */
    endCombo() {
        if (!this.activeCombo) return;
        
        console.log(`RuneCastSystem: завершение комбинации "${this.activeCombo}"`);
        
        // Убираем эффекты с героя
        this.hero.removeComboBuff();
        
        // Сбрасываем флаги
        this.resetGlobalFlags();
        
        // Очищаем состояние
        this.activeCombo = null;
        this.comboEndTime = null;
    }
    
    /**
     * Проверить, активна ли комбинация
     * @returns {boolean} true если комбинация активна
     */
    isComboActive() {
        return this.activeCombo !== null;
    }
    
    /**
     * Получить оставшееся время комбинации
     * @param {number} time - Текущее время
     * @returns {number} Оставшееся время в миллисекундах
     */
    getRemainingTime(time) {
        if (!this.comboEndTime) return 0;
        return Math.max(0, this.comboEndTime - time);
    }
    
    /**
     * Получить информацию о текущей комбинации
     * @returns {object} Информация о комбинации
     */
    getComboInfo() {
        return {
            activeCombo: this.activeCombo,
            comboEndTime: this.comboEndTime,
            globalFlags: { ...this.globalFlags }
        };
    }
    
    /**
     * Получить глобальные флаги для других систем
     * @returns {object} Копия глобальных флагов
     */
    getGlobalFlags() {
        return { ...this.globalFlags };
    }
}
