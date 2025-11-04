/**
 * Система визуализации рун
 * Управляет отображением сфер рун вокруг героя
 */

export class RuneVisualSystem {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        
        // Массив активных визуальных рун
        this.activeVisualRunes = [];
        this.maxRunes = 3;
        
        // Параметры орбиты
        this.orbitRadius = 40;
        this.rotationSpeed = 0.02;
        this.currentAngle = 0;
        
        // Цвета рун
        this.runeColors = {
            'Q': 0x66ccff,  // Голубой
            'W': 0xaa66ff,  // Фиолетовый  
            'E': 0xff6633   // Оранжевый
        };
        
        // console.log('RuneVisualSystem: инициализирован');
    }
    
    init() {
        this.initialized = true;
        // console.log('RuneVisualSystem: система готова к работе');
    }
    
    /**
     * Добавить визуальную руну
     * @param {string} type - Тип руны ('Q', 'W', 'E')
     * @returns {boolean} true если руна добавлена успешно
     */
    addRuneVisual(type) {
        if (!this.initialized) {
            console.warn('RuneVisualSystem: система не инициализирована');
            return false;
        }
        
        if (this.activeVisualRunes.length >= this.maxRunes) {
            console.log(`RuneVisualSystem: достигнут максимум рун (${this.activeVisualRunes.length}/${this.maxRunes})`);
            return false;
        }
        
        if (!this.runeColors[type]) {
            console.warn(`RuneVisualSystem: неизвестный тип руны "${type}"`);
            return false;
        }
        
        // Создаем визуальную руну
        const visualRune = this.createVisualRune(type);
        this.activeVisualRunes.push(visualRune);
        
        // console.log(`RuneVisualSystem: добавлена визуальная руна "${type}", всего: ${this.activeVisualRunes.length}`);
        return true;
    }
    
    /**
     * Создать визуальную руну
     * @param {string} type - Тип руны
     * @returns {object} Объект визуальной руны
     */
    createVisualRune(type) {
        const color = this.runeColors[type];
        
        // Создаем контейнер для руны
        const runeContainer = this.scene.add.container(0, 0);
        
        // Создаем основную сферу
        const sphere = this.scene.add.circle(0, 0, 12, color, 1);
        runeContainer.add(sphere);
        
        // Добавляем эффект свечения
        const glowEffect = this.scene.add.circle(0, 0, 20, color, 0.3);
        runeContainer.add(glowEffect);
        runeContainer.sendToBack(glowEffect);
        
        // Добавляем символ руны
        const symbol = this.getRuneSymbol(type);
        const symbolText = this.scene.add.text(0, 0, symbol, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5);
        runeContainer.add(symbolText);
        
        // Анимация пульсации
        this.scene.tweens.add({
            targets: sphere,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Анимация свечения
        this.scene.tweens.add({
            targets: glowEffect,
            alpha: 0.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return {
            container: runeContainer,
            type: type,
            color: color,
            sphere: sphere,
            glow: glowEffect,
            symbol: symbolText
        };
    }
    
    /**
     * Получить символ руны
     * @param {string} type - Тип руны
     * @returns {string} Символ руны
     */
    getRuneSymbol(type) {
        const symbols = {
            'Q': '❄',
            'W': '⚡', 
            'E': '💥'
        };
        return symbols[type] || '?';
    }
    
    /**
     * Очистить все визуальные руны
     */
    clearRunesVisual() {
        if (!this.initialized) {
            console.warn('RuneVisualSystem: система не инициализирована');
            return;
        }
        
        // console.log(`RuneVisualSystem: очистка ${this.activeVisualRunes.length} визуальных рун`);
        
        // Анимация исчезновения для каждой руны
        if (this.activeVisualRunes && Array.isArray(this.activeVisualRunes)) {
            this.activeVisualRunes.forEach((rune, index) => {
            if (rune.container) {
                // Анимация масштабирования и исчезновения
                this.scene.tweens.add({
                    targets: rune.container,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 300,
                    delay: index * 50, // Задержка для каскадного эффекта
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        if (rune.container) {
                            // console.log(`RuneVisualSystem: уничтожен контейнер руны "${rune.type}"`);
                            rune.container.destroy();
                        }
                    }
                });
            }
            });
        }
        
        // Очищаем массив
        this.activeVisualRunes = [];
        // console.log('RuneVisualSystem: все визуальные руны очищены');
    }
    
    /**
     * Обновить систему
     * @param {number} deltaTime - Время с последнего обновления
     * @param {object} hero - Объект героя
     */
    update(deltaTime, hero) {
        if (!this.initialized || this.activeVisualRunes.length === 0) {
            return;
        }
        
        // Получаем позицию героя
        const heroPos = hero.getWorldPosition();
        const worldOffset = this.scene.worldOffset || { x: 0, y: 0 };
        
        // Вычисляем экранную позицию героя
        const screenX = heroPos.x - worldOffset.x;
        const screenY = heroPos.y - worldOffset.y;
        
        // Обновляем угол вращения
        this.currentAngle += this.rotationSpeed;
        
        // Позиционируем каждую руну по орбите
        if (this.activeVisualRunes && Array.isArray(this.activeVisualRunes)) {
            this.activeVisualRunes.forEach((rune, index) => {
            if (rune.container) {
                // Вычисляем угол для каждой руны
                const angle = this.currentAngle + (index * (Math.PI * 2 / this.activeVisualRunes.length));
                
                // Вычисляем позицию на орбите
                const orbitX = screenX + Math.cos(angle) * this.orbitRadius;
                const orbitY = screenY + Math.sin(angle) * this.orbitRadius;
                
                // Устанавливаем позицию контейнера
                rune.container.setPosition(orbitX, orbitY);
            }
            });
        }
    }
    
    /**
     * Получить количество активных визуальных рун
     * @returns {number} Количество рун
     */
    getVisualRuneCount() {
        return this.activeVisualRunes.length;
    }
    
    /**
     * Получить информацию о системе
     * @returns {object} Информация о системе
     */
    getSystemInfo() {
        return {
            initialized: this.initialized,
            activeRunes: this.activeVisualRunes.length,
            maxRunes: this.maxRunes,
            orbitRadius: this.orbitRadius,
            rotationSpeed: this.rotationSpeed,
            currentAngle: this.currentAngle
        };
    }
}
