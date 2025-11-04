/**
 * Основная игровая сцена - Phaser версия
 * Управляет всеми игровыми системами и сущностями через Phaser
 */

import Phaser from 'phaser';
import { Hero } from '../entities/Hero.js';
import { WorldSystem } from '../systems/WorldSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { ProjectileSystem } from '../systems/ProjectileSystem.js';
import { RuneCastSystem } from '../systems/RuneCastSystem.js';
import { RuneVisualSystem } from '../systems/RuneVisualSystem.js';
import { MotionParticleSystem } from '../systems/MotionParticleSystem.js';
import { CastVFXSystem } from '../systems/CastVFXSystem.js';
import { GAME_CONFIG, ConfigUtils } from '../config/GameBalance.js';
import { ImpactVFXSystem } from '../systems/ImpactVFXSystem.js';
import { DeathVFXSystem } from '../systems/DeathVFXSystem.js';
import { ManaPixelSystem } from '../systems/ManaPixelSystem.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        console.log('GameScene: конструктор вызван');
        
        // Система движения мира
        this.worldOffset = { x: 0, y: 0 };
        this.lastWorldOffset = { x: 0, y: 0 };
        this.hero = null;
        this.worldSystem = null;
        this.enemySystem = null;
        this.projectileSystem = null;
        this.runeCastSystem = null;
        this.runeVisualSystem = null;
        this.motionParticleSystem = null;
        this.castVFXSystem = null;
        this.impactVFXSystem = null;
        this.deathVFXSystem = null;
        this.manaPixelSystem = null;
        this.testBlock = null;
        
        // Система сфер (обновленная)
        this.spheresArray = []; // Массив текущих сфер
        this.maxSpheres = GAME_CONFIG.MAX_SPHERES; // Максимум 6 сфер
        this.sphereSprites = []; // Визуальные спрайты сфер
        this.sphereRadius = 60; // Радиус вращения сфер вокруг героя
        this.sphereRotationSpeed = 0.02; // Скорость вращения
        this.sphereRotationAngle = 0; // Текущий угол вращения
        
        // Система рун (legacy)
        this.runesArray = []; // Массив текущих рун (legacy)
        this.maxRunes = 3; // Максимум 3 руны (legacy)
        this.runeSprites = []; // Визуальные спрайты рун
        this.runeRadius = 60; // Радиус вращения рун вокруг героя
        this.runeRotationSpeed = 0.02; // Скорость вращения
        this.runeRotationAngle = 0; // Текущий угол вращения
        
        // Система отображения пассивных улучшений
        this.passiveBonusesDisplay = null;
        
        // Система отладки
        this.debugDisplay = null;
    }

    preload() {
        // Здесь будет загрузка ресурсов
        console.log('GameScene: preload() - загрузка ресурсов');
    }

    create() {
        console.log('GameScene: create() - создание сцены');
        
        // Устанавливаем темный фон
        this.cameras.main.setBackgroundColor('#222222');
        
        // Создаем героя
        this.hero = new Hero(this);
        
        // Создаем систему мира
        this.worldSystem = new WorldSystem(this);
        console.log('GameScene: WorldSystem создан');
        
        // Создаем систему врагов
        this.enemySystem = new EnemySystem(this, this.hero, this.worldSystem);
        console.log('GameScene: EnemySystem создан');
        
        // Создаем систему снарядов
        this.projectileSystem = new ProjectileSystem(this, this.enemySystem);
        console.log('GameScene: ProjectileSystem создан');
        
        // Создаем систему визуальных эффектов каста
        this.castVFXSystem = new CastVFXSystem(this);
        console.log('GameScene: CastVFXSystem создан');
        
        // Создаем систему визуальных эффектов попадания
        this.impactVFXSystem = new ImpactVFXSystem(this);
        console.log('GameScene: ImpactVFXSystem создан');
        
        // Создаем систему визуальных эффектов смерти
        this.deathVFXSystem = new DeathVFXSystem(this);
        console.log('GameScene: DeathVFXSystem создан');
        
        // Создаем систему пикселей маны
        this.manaPixelSystem = new ManaPixelSystem(this);
        console.log('GameScene: ManaPixelSystem создан');
        
        // Создаем систему активации комбинаций рун
        this.runeCastSystem = new RuneCastSystem(this, this.hero, this.enemySystem, this.projectileSystem, this.castVFXSystem);
        console.log('GameScene: RuneCastSystem создан');
        
        // Создаем систему визуализации рун
        this.runeVisualSystem = new RuneVisualSystem(this);
        this.runeVisualSystem.init();
        console.log('GameScene: RuneVisualSystem создан');
        
        // Очищаем старую систему на всякий случай
        this.clearRuneSprites();
        
        // Создаем систему частиц движения
        this.motionParticleSystem = new MotionParticleSystem(this);
        console.log('GameScene: MotionParticleSystem создан');
        
        // Создаем тестовый блок для демонстрации движения мира
        this.testBlock = this.add.rectangle(500, 500, 50, 50, 0xff0000);
        console.log('GameScene: testBlock создан в позиции (500, 500)');
        
   
        // Добавляем отладочную информацию
        this.debugText = this.add.text(10, 10, '', {
            fontSize: '14px',
            fill: '#ffffff',
            align: 'left'
        }).setOrigin(0, 0);
        
        // Создаем объекты клавиш для рун
        this.keys = this.input.keyboard.addKeys('Q,W,E,R');
        
        // Создаем отображение пассивных улучшений
        this.createPassiveBonusesDisplay();
        
        // Создаем систему отладки
        this.createDebugDisplay();
        
        // Создаем UI элементы
        this.createUI();
        
        console.log('GameScene: сцена создана успешно');
    }

    update(time, delta) {
        // Основной игровой цикл
        if (this.hero) {
            // Получаем позицию курсора
            const pointer = this.input.activePointer;
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            
            // Вычисляем вектор от центра к курсору
            const pointerVector = {
                x: pointer.x - centerX,
                y: pointer.y - centerY
            };
            
            // Нормализуем вектор (избегаем деления на ноль)
            const length = Math.sqrt(pointerVector.x * pointerVector.x + pointerVector.y * pointerVector.y);
            if (length > 0) {
                const normalizedVector = {
                    x: pointerVector.x / length,
                    y: pointerVector.y / length
                };
                
                // Сохраняем предыдущее значение worldOffset
                this.lastWorldOffset.x = this.worldOffset.x;
                this.lastWorldOffset.y = this.worldOffset.y;
                
                // Обновляем worldOffset (мир движется в том же направлении, что и курсор)
                const moveSpeed = this.hero.getEffectiveMoveSpeed();
                const deltaSeconds = delta / 1000; // Конвертируем в секунды
                
                this.worldOffset.x += normalizedVector.x * moveSpeed * deltaSeconds;
                this.worldOffset.y += normalizedVector.y * moveSpeed * deltaSeconds;
                
                // Обновляем позицию тестового блока
                this.testBlock.x = 500 - this.worldOffset.x;
                this.testBlock.y = 500 - this.worldOffset.y;
                
                // Обновляем систему чанков
                const heroWorldPos = this.hero.getWorldPosition();
                this.worldSystem.updateChunks(heroWorldPos.x, heroWorldPos.y);
            }
            
            // Обновляем героя
            this.hero.update(delta, pointerVector);
            
            // Обновляем систему врагов
            this.enemySystem.update(time, delta, this.worldOffset);
            
            // Обрабатываем смерть врагов и создание пикселей маны
            this.handleEnemyDeaths();
            
            // Обновляем систему пикселей маны
            this.manaPixelSystem.update(delta, this.hero);
            
            // Автоатака героя
            this.handleHeroAutoAttack(time);
            
            // Обновляем систему снарядов
            this.projectileSystem.update(delta, this.worldOffset, this.enemySystem.enemies);
            
            // Обновляем систему активации комбинаций
            this.runeCastSystem.update(time);
            
            // Обновляем систему визуализации рун
            this.runeVisualSystem.update(delta, this.hero);
            
            // Обновляем систему визуальных эффектов каста
            this.castVFXSystem.update(delta, this.worldOffset);
            
            // Обновляем систему визуальных эффектов попадания
            this.impactVFXSystem.update(delta, this.worldOffset);
            
            // Обновляем систему визуальных эффектов смерти
            this.deathVFXSystem.update(delta, this.worldOffset);
            
            // Обновляем комбо-флаги в ProjectileSystem
            this.projectileSystem.updateComboFlags(this.runeCastSystem.getGlobalFlags());
            
            // Обновляем комбо-флаги в EnemySystem
            this.enemySystem.updateGlobalFlags(this.runeCastSystem.getGlobalFlags());
            
            // Применяем эффект ледяных шипов
            this.enemySystem.applyIceSpikesEffect();
            
            // Обрабатываем ввод сфер
            this.handleSphereInput();
            
            // Обновляем позиции рун (теперь только через RuneVisualSystem)
            // this.updateRunePositions(); // Убрано - используем RuneVisualSystem
            
            // Обновляем отладочную информацию
            this.updateDebugInfo();
            
            // Обновляем отображение пассивных улучшений
            this.updatePassiveBonusesDisplay();
            
            // Обновляем отладочную информацию
            this.updateDebugDisplay();
            
            // Обновляем UI элементы
            this.updateUI();
        }
    }

    /**
     * Обработать автоатаку героя
     * @param {number} time - Время игры в миллисекундах
     */
    handleHeroAutoAttack(time) {
        // Проверяем, готов ли герой к атаке
        if (!this.hero.canFire(time)) {
            return;
        }
        
        // Получаем позицию героя
        const heroPos = this.hero.getWorldPosition();
        
        // Ищем ближайшего врага
        const nearestEnemy = this.enemySystem.getNearestEnemy(heroPos);
        
        if (nearestEnemy) {
            // Создаем снаряд
            this.projectileSystem.spawnProjectile(
                heroPos,
                nearestEnemy.getWorldPosition(),
                this.hero.getDamage()
            );
            
            // Устанавливаем время следующей атаки
            this.hero.setNextFireTime(time);
            
            // console.log(`GameScene: герой атакует врага в позиции (${Math.round(nearestEnemy.getWorldPosition().x)}, ${Math.round(nearestEnemy.getWorldPosition().y)})`);
        }
    }

    /**
     * Обработать ввод сфер
     */
    handleSphereInput() {
        if (!this.keys) return;
        
        // Обработка клавиш Q, W, E
        if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
            this.addSphere('Q');
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.addSphere('W');
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.addSphere('E');
        }
        
        // Обработка клавиши R для активации комбинации
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.activateCombo();
        }
    }
    
    /**
     * Добавить сферу в массив
     * @param {string} sphere - Сфера ('Q', 'W', или 'E')
     */
    addSphere(sphere) {
        if (this.spheresArray.length >= this.maxSpheres) {
            console.log(`SphereSystem: массив сфер полон (${this.spheresArray.length}/${this.maxSpheres})`);
            return;
        }
        
        this.spheresArray.push(sphere);
        console.log(`🔥 SphereSystem: добавлена сфера "${sphere}", текущий массив: [${this.spheresArray.join(', ')}]`);
        
        // Обновляем пассивные улучшения героя
        if (this.hero) {
            this.hero.activeSpheres = this.spheresArray || [];
            this.hero.updatePassiveBonuses(this.spheresArray || []);
        }
        
        // Добавляем визуальную сферу через RuneVisualSystem
        this.runeVisualSystem.addRuneVisual(sphere);
        
        // Визуальная обратная связь
        this.showRuneAdded(sphere);
    }
    
    /**
     * Показать визуальную обратную связь при добавлении руны
     * @param {string} rune - Добавленная руна
     */
    showRuneAdded(rune) {
        // Создаем временный текст для обратной связи
        const feedbackText = this.add.text(
            this.cameras.main.width / 2, 
            100, 
            `+ ${rune}`, 
            {
                fontSize: '32px',
                fill: '#00ff00',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Анимация появления и исчезновения
        this.tweens.add({
            targets: feedbackText,
            y: 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                feedbackText.destroy();
            }
        });
    }
    
    /**
     * Создать визуальную руну
     * @param {string} runeType - Тип руны ('Q', 'W', 'E')
     * @returns {Phaser.GameObjects.Container} Контейнер с руной
     */
    createRuneSprite(runeType) {
        const runeContainer = this.add.container(0, 0);
        
        // Определяем цвет и символ для руны
        let color, symbol;
        switch (runeType) {
            case 'Q':
                color = 0x00aaff; // Голубой
                symbol = '❄';
                break;
            case 'W':
                color = 0xff4400; // Красный
                symbol = '⚡';
                break;
            case 'E':
                color = 0xff8800; // Оранжевый
                symbol = '💥';
                break;
            default:
                color = 0xffffff;
                symbol = '?';
        }
        
        // Создаем фон руны (круг)
        const runeBackground = this.add.circle(0, 0, 20, color);
        runeBackground.setStrokeStyle(3, 0xffffff);
        runeContainer.add(runeBackground);
        
        // Создаем символ руны
        const runeSymbol = this.add.text(0, 0, symbol, {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        runeContainer.add(runeSymbol);
        
        // Добавляем эффект свечения
        const glowEffect = this.add.circle(0, 0, 25, color, 0.3);
        runeContainer.add(glowEffect);
        runeContainer.sendToBack(glowEffect);
        
        // Анимация пульсации
        this.tweens.add({
            targets: runeBackground,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return runeContainer;
    }
    
    /**
     * Обновить позиции рун вокруг героя
     */
    updateRunePositions() {
        if (this.runeSprites.length === 0) return;
        
        // Увеличиваем угол вращения
        this.runeRotationAngle += this.runeRotationSpeed;
        
        // Центр героя (центр экрана)
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // Располагаем руны по кругу
        if (this.runeSprites && Array.isArray(this.runeSprites)) {
        this.runeSprites.forEach((runeSprite, index) => {
            if (runeSprite && runeSprite.active) {
                // Вычисляем угол для каждой руны
                const angle = this.runeRotationAngle + (index * (Math.PI * 2 / this.runeSprites.length));
                
                // Вычисляем позицию
                const x = centerX + Math.cos(angle) * this.runeRadius;
                const y = centerY + Math.sin(angle) * this.runeRadius;
                
                // Устанавливаем позицию
                runeSprite.setPosition(x, y);
            }
        });
        }
    }
    
    /**
     * Очистить все визуальные руны
     */
    clearRuneSprites() {
        if (this.runeSprites && Array.isArray(this.runeSprites)) {
        this.runeSprites.forEach(sprite => {
            if (sprite && sprite.active) {
                sprite.destroy();
            }
        });
        }
        this.runeSprites = [];
    }
    
    /**
     * Активировать комбинацию сфер
     */
    activateCombo() {
        if (this.spheresArray.length !== 3) {
            console.log(`SphereSystem: для активации нужно 3 сферы, текущее количество: ${this.spheresArray.length}`);
            return;
        }
        
        // Проверяем, хватает ли маны для заклинания
        const comboString = this.spheresArray.slice().sort().join('');
        const comboType = this.determineComboType(comboString);
        
        if (!this.hero.useManaForSpell(comboType)) {
            console.log(`SphereSystem: недостаточно маны для заклинания ${comboType}`);
            return;
        }
        
        // Активируем комбинацию через RuneCastSystem
        const success = this.runeCastSystem.activateCombo(this.spheresArray, this.time.now);
        
        if (success) {
            console.log('SphereSystem: комбинация активирована успешно');
            
            // Показываем эффект активации комбинации
            this.showComboActivationEffect();
            
            // Очищаем визуальные сферы через RuneVisualSystem
            this.runeVisualSystem.clearRunesVisual();
            
            // Очищаем старую систему сразу
            this.clearSphereSprites();
            
            // Очищаем массив сфер
            this.spheresArray = [];
            
            // Обновляем пассивные улучшения (теперь массив пуст)
            if (this.hero) {
                this.hero.activeSpheres = this.spheresArray || [];
                this.hero.updatePassiveBonuses(this.spheresArray || []);
            }
        } else {
            console.log('SphereSystem: не удалось активировать комбинацию');
        }
    }
    
    /**
     * Определить тип комбинации по строке
     * @param {string} comboString - Строка комбинации
     * @returns {string} Тип комбинации
     */
    determineComboType(comboString) {
        switch (comboString) {
            case 'QQQ': return 'QQQ';
            case 'WWW': return 'WWW';
            case 'EEE': return 'EEE';
            case 'EQW': return 'QWE';
            default: return 'standard';
        }
    }
    
    /**
     * Показать эффект активации комбинации
     */
    showComboActivationEffect() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // Создаем взрывной эффект
        const explosion = this.add.circle(centerX, centerY, 0, 0xffffff, 0.8);
        explosion.setStrokeStyle(5, 0xffff00);
        
        // Анимация взрыва
        this.tweens.add({
            targets: explosion,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // Создаем текст активации
        const activationText = this.add.text(centerX, centerY - 50, 'КОМБО АКТИВИРОВАНО!', {
            fontSize: '24px',
            fill: '#ffff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Анимация текста
        this.tweens.add({
            targets: activationText,
            y: centerY - 100,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                activationText.destroy();
            }
        });
    }
    
    /**
     * Очистить визуальные руны с эффектом
     */
    clearRuneSpritesWithEffect() {
        if (this.runeSprites && Array.isArray(this.runeSprites)) {
        this.runeSprites.forEach((sprite, index) => {
            if (sprite && sprite.active) {
                // Анимация исчезновения
                this.tweens.add({
                    targets: sprite,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 500,
                    delay: index * 100, // Задержка для каждой руны
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        sprite.destroy();
                    }
                });
            }
        });
        }
    }
    
    /**
     * Создать отображение пассивных улучшений
     */
    createPassiveBonusesDisplay() {
        // Создаем контейнер для отображения пассивных улучшений
        this.passiveBonusesDisplay = this.add.container(10, 200);
        
        // Заголовок
        const title = this.add.text(0, 0, 'Пассивные улучшения:', {
            fontSize: '16px',
            fill: '#ffff00',
            align: 'left'
        }).setOrigin(0, 0);
        this.passiveBonusesDisplay.add(title);
        
        // Тексты для каждого типа бонуса
        this.healthRegenText = this.add.text(0, 25, '', {
            fontSize: '14px',
            fill: '#00ff00',
            align: 'left'
        }).setOrigin(0, 0);
        this.passiveBonusesDisplay.add(this.healthRegenText);
        
        this.moveSpeedText = this.add.text(0, 45, '', {
            fontSize: '14px',
            fill: '#ff6600',
            align: 'left'
        }).setOrigin(0, 0);
        this.passiveBonusesDisplay.add(this.moveSpeedText);
        
        this.attackSpeedText = this.add.text(0, 65, '', {
            fontSize: '14px',
            fill: '#ff0066',
            align: 'left'
        }).setOrigin(0, 0);
        this.passiveBonusesDisplay.add(this.attackSpeedText);
        
        this.attackDamageText = this.add.text(0, 85, '', {
            fontSize: '14px',
            fill: '#ff0000',
            align: 'left'
        }).setOrigin(0, 0);
        this.passiveBonusesDisplay.add(this.attackDamageText);
    }
    
    /**
     * Обновить отображение пассивных улучшений
     */
    updatePassiveBonusesDisplay() {
        if (!this.hero || !this.passiveBonusesDisplay) return;
        
        const bonuses = this.hero.getPassiveBonusesInfo();
        if (!bonuses) return;
        
        // Обновляем тексты
        this.healthRegenText.setText(`Q - Регенерация: +${bonuses.healthRegen.toFixed(1)}/сек`);
        this.moveSpeedText.setText(`W - Скорость: +${bonuses.moveSpeed.toFixed(1)}%`);
        this.attackSpeedText.setText(`E - Скорость атаки: +${bonuses.attackSpeed.toFixed(1)}%`);
        this.attackDamageText.setText(`E - Урон: +${bonuses.attackDamage}`);
        
        // Показываем/скрываем отображение в зависимости от наличия бонусов
        const hasBonuses = bonuses.healthRegen > 0 || bonuses.moveSpeed > 0 || 
                          bonuses.attackSpeed > 0 || bonuses.attackDamage > 0;
        this.passiveBonusesDisplay.setVisible(hasBonuses);
    }
    
    /**
     * Создать систему отладки
     */
    createDebugDisplay() {
        // Создаем контейнер для отладочной информации
        this.debugDisplay = this.add.container(10, 400);
        
        // Заголовок
        const title = this.add.text(0, 0, 'Отладочная информация:', {
            fontSize: '16px',
            fill: '#ffff00',
            align: 'left'
        }).setOrigin(0, 0);
        this.debugDisplay.add(title);
        
        // Тексты для метрик
        this.effectiveDPSText = this.add.text(0, 25, '', {
            fontSize: '14px',
            fill: '#00ff00',
            align: 'left'
        }).setOrigin(0, 0);
        this.debugDisplay.add(this.effectiveDPSText);
        
        this.effectiveEHPText = this.add.text(0, 45, '', {
            fontSize: '14px',
            fill: '#00ff00',
            align: 'left'
        }).setOrigin(0, 0);
        this.debugDisplay.add(this.effectiveEHPText);
        
        this.ttkText = this.add.text(0, 65, '', {
            fontSize: '14px',
            fill: '#00ff00',
            align: 'left'
        }).setOrigin(0, 0);
        this.debugDisplay.add(this.ttkText);
        
        this.manaText = this.add.text(0, 85, '', {
            fontSize: '14px',
            fill: '#0088ff',
            align: 'left'
        }).setOrigin(0, 0);
        this.debugDisplay.add(this.manaText);
        
        this.levelText = this.add.text(0, 105, '', {
            fontSize: '14px',
            fill: '#ff8800',
            align: 'left'
        }).setOrigin(0, 0);
        this.debugDisplay.add(this.levelText);
    }
    
    /**
     * Обновить отладочную информацию
     */
    updateDebugDisplay() {
        if (!this.hero || !this.debugDisplay) return;
        
        const bonuses = this.hero.getPassiveBonusesInfo();
        if (!bonuses) return;
        
        // Вычисляем эффективный DPS
        const effectiveDPS = bonuses.effectiveDamage * bonuses.effectiveAttackSpeed;
        
        // Вычисляем эффективное EHP (эффективное здоровье)
        const effectiveEHP = this.hero.health + (this.hero.maxHealth - this.hero.health);
        
        // Вычисляем TTK против обычного врага
        const normalEnemyHP = ConfigUtils.getEnemyStats('normal', this.hero.level).hp;
        const shotsToKill = Math.ceil(normalEnemyHP / bonuses.effectiveDamage);
        const ttk = shotsToKill / bonuses.effectiveAttackSpeed;
        
        // Обновляем тексты
        this.effectiveDPSText.setText(`Эффективный DPS: ${effectiveDPS.toFixed(1)}`);
        this.effectiveEHPText.setText(`Эффективное EHP: ${effectiveEHP.toFixed(0)}`);
        this.ttkText.setText(`TTK обычного врага: ${ttk.toFixed(1)}с (${shotsToKill} выстрелов)`);
        this.manaText.setText(`Мана: ${this.hero.mana.toFixed(0)}/${this.hero.maxMana}`);
        this.levelText.setText(`Уровень: ${this.hero.level}`);
    }
    
    /**
     * Обработать смерть врагов и создание пикселей маны
     * ПРИМЕЧАНИЕ: Основное создание маны происходит в EnemySystem.cleanupDeadEnemies()
     * Этот метод оставлен как резервный механизм, но обычно не нужен
     */
    handleEnemyDeaths() {
        // Мана создается в EnemySystem.cleanupDeadEnemies() перед удалением врагов
        // Этот метод больше не используется, но оставлен для совместимости
        return;
    }
    
    /**
     * Обновить отладочную информацию
     */
    updateDebugInfo() {
        if (this.debugText && this.worldSystem && this.enemySystem && this.projectileSystem) {
            const worldStats = this.worldSystem.getStats();
            const enemyStats = this.enemySystem.getStats();
            const projectileStats = this.projectileSystem.getStats();
            const heroPos = this.hero.getWorldPosition();
            
            // Информация о комбинациях
            const comboInfo = this.runeCastSystem.getComboInfo();
            const remainingTime = this.runeCastSystem.getRemainingTime(this.time.now);
            
            // Получаем параметры героя
            const heroProjectileSpeed = this.hero.projectileSpeed || 400;
            const heroProjectileDamage = this.hero.projectileDamage || 10;
            
            // Получаем параметры первого живого врага для примера
            const aliveEnemies = this.enemySystem.getEnemies();
            let enemyHP = 0;
            let enemySpeed = 0;
            if (aliveEnemies.length > 0) {
                const firstEnemy = aliveEnemies[0];
                enemyHP = Math.round(firstEnemy.maxHP);
                enemySpeed = Math.round(firstEnemy.speed);
            }
            
            this.debugText.setText([
                `Enemies: ${enemyStats.aliveEnemies}/${enemyStats.totalEnemies}`,
                `Projectiles: ${projectileStats.aliveProjectiles}/${projectileStats.totalProjectiles}`,
                `Spawn Interval: ${enemyStats.spawnInterval.toFixed(1)}s`,
                `Game Time: ${enemyStats.elapsedTime.toFixed(1)}s`,
                `Runes: [${(this.runesArray || []).join(', ')}] (${(this.runesArray || []).length}/${this.maxRunes})`,
                `Combo: ${comboInfo.activeCombo || 'None'} (${(remainingTime / 1000).toFixed(1)}s)`,
                `Projectile Speed: ${heroProjectileSpeed}px/s`,
                `Projectile Damage: ${heroProjectileDamage}`,
                `Enemy HP: ${enemyHP} | Speed: ${enemySpeed}px/s`
            ]);
        }
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
    import { Hero } from '../entities/Hero.js';
    import { Enemy } from '../entities/Enemy.js';
    import { Projectile } from '../entities/Projectile.js';
    import { WorldSystem } from '../systems/WorldSystem.js';
    import { SpawnSystem } from '../systems/SpawnSystem.js';
    import { RuneSystem } from '../systems/RuneSystem.js';
    import { ManaSystem } from '../systems/ManaSystem.js';

    export class GameScene {
        constructor(ctx, width, height) {
            this.ctx = ctx;
            this.width = width;
            this.height = height;
            
            // Игровые сущности
            this.hero = null;
            this.enemies = [];
            this.projectiles = [];
            this.runes = [];
            
            // Игровые системы
            this.worldSystem = new WorldSystem(width, height);
            this.spawnSystem = new SpawnSystem();
            this.runeSystem = new RuneSystem();
            this.manaSystem = new ManaSystem();
            
            // Игровое состояние
            this.score = 0;
            this.level = 1;
            this.gameTime = 0;
            this.isPaused = false;
            
            this.init();
        }

        init() {
            // Создаем героя
            this.hero = new Hero(this.width / 2, this.height / 2);
            
            // Инициализируем системы
            this.worldSystem.init();
            this.spawnSystem.init();
            this.runeSystem.init();
            this.manaSystem.init();
            
            // Настраиваем обработчики событий
            this.setupEventListeners();
        }

        setupEventListeners() {
            // Обработка клавиатуры
            document.addEventListener('keydown', (event) => {
                this.handleKeyDown(event);
            });
            
            document.addEventListener('keyup', (event) => {
                this.handleKeyUp(event);
            });
            
            // Обработка мыши
            this.ctx.canvas.addEventListener('mousemove', (event) => {
                this.handleMouseMove(event);
            });
            
            this.ctx.canvas.addEventListener('click', (event) => {
                this.handleMouseClick(event);
            });
        }

        handleKeyDown(event) {
            if (this.isPaused) return;
            
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.hero.moveUp();
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.hero.moveDown();
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.hero.moveLeft();
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.hero.moveRight();
                    break;
                case 'Space':
                    this.hero.shoot();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        }

        handleKeyUp(event) {
            switch(event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.hero.stopMoveUp();
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.hero.stopMoveDown();
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.hero.stopMoveLeft();
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.hero.stopMoveRight();
                    break;
            }
        }

        handleMouseMove(event) {
            if (this.isPaused) return;
            
            const rect = this.ctx.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            this.hero.aimAt(mouseX, mouseY);
        }

        handleMouseClick(event) {
            if (this.isPaused) return;
            
            this.hero.shoot();
        }

        togglePause() {
            this.isPaused = !this.isPaused;
        }

        update(deltaTime) {
            if (this.isPaused) return;
            
            this.gameTime += deltaTime;
            
            // Получаем позицию курсора для визуальных эффектов
            const pointer = this.input.activePointer;
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            
            const pointerVector = {
                x: pointer.x - centerX,
                y: pointer.y - centerY
            };
            
            // Обновляем героя
            this.hero.update(deltaTime, pointerVector);
            
            // Обновляем системы
            this.worldSystem.update(deltaTime);
            this.spawnSystem.update(deltaTime, this);
            this.runeSystem.update(deltaTime, this);
            this.manaSystem.update(deltaTime, this);
            this.motionParticleSystem.update();
            
            // Обновляем врагов
            this.enemies.forEach(enemy => enemy.update(deltaTime));
            
            // Обновляем снаряды
            this.projectiles.forEach(projectile => projectile.update(deltaTime));
            
            // Обновляем руны
            this.runes.forEach(rune => rune.update(deltaTime));
            
            // Проверяем коллизии
            this.checkCollisions();
            
            // Удаляем мертвые объекты
            this.cleanup();
            
            // Проверяем условия победы/поражения
            this.checkGameState();
        }

        checkCollisions() {
            // Коллизии снарядов с врагами
            this.projectiles.forEach((projectile, projectileIndex) => {
                this.enemies.forEach((enemy, enemyIndex) => {
                    if (this.isColliding(projectile, enemy)) {
                        // Враг получает урон
                        enemy.takeDamage(projectile.damage);
                        
                        // Снаряд уничтожается
                        projectile.destroy();
                        
                        // Если враг мертв, добавляем очки
                        if (enemy.isDead()) {
                            this.score += enemy.scoreValue;
                        }
                    }
                });
            });
            
            // Коллизии героя с врагами
            this.enemies.forEach(enemy => {
                if (this.isColliding(this.hero, enemy)) {
                    this.hero.takeDamage(enemy.damage);
                    enemy.destroy();
                }
            });
            
            // Коллизии героя с рунами
            this.runes.forEach((rune, runeIndex) => {
                if (this.isColliding(this.hero, rune)) {
                    this.hero.collectRune(rune);
                    rune.destroy();
                }
            });
        }

        isColliding(obj1, obj2) {
            const dx = obj1.x - obj2.x;
            const dy = obj1.y - obj2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (obj1.radius + obj2.radius);
        }

        cleanup() {
            // Удаляем мертвых врагов
            this.enemies = this.enemies.filter(enemy => !enemy.isDead() && !enemy.isDestroyed());
            
            // Удаляем уничтоженные снаряды
            this.projectiles = this.projectiles.filter(projectile => !projectile.isDestroyed());
            
            // Удаляем собранные руны
            this.runes = this.runes.filter(rune => !rune.isDestroyed());
        }

        checkGameState() {
            // Проверяем, жив ли герой
            if (this.hero.isDead()) {
                this.gameOver();
            }
            
            // Проверяем уровень
            if (this.score > this.level * 1000) {
                this.levelUp();
            }
        }

        gameOver() {
            this.isPaused = true;
            console.log('Игра окончена! Финальный счет:', this.score);
        }

        levelUp() {
            this.level++;
            console.log('Новый уровень:', this.level);
        }

        render(ctx) {
            // Очищаем экран
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.width, this.height);
            
            // Отрисовываем фон
            this.worldSystem.render(ctx);
            
            // Отрисовываем руны
            this.runes.forEach(rune => rune.render(ctx));
            
            // Отрисовываем врагов
            this.enemies.forEach(enemy => enemy.render(ctx));
            
            // Отрисовываем снаряды
            this.projectiles.forEach(projectile => projectile.render(ctx));
            
            // Отрисовываем героя
            this.hero.render(ctx);
            
            // Отрисовываем UI
            this.renderUI(ctx);
        }

        renderUI(ctx) {
            // Счет
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText(`Счет: ${this.score}`, 10, 30);
            
            // Уровень
            ctx.fillText(`Уровень: ${this.level}`, 10, 60);
            
            // Здоровье героя
            ctx.fillText(`Здоровье: ${this.hero.health}`, 10, 90);
            
            // Мана
            ctx.fillText(`Мана: ${this.manaSystem.currentMana}`, 10, 120);
            
            // Пауза
            if (this.isPaused) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, this.width, this.height);
                
                ctx.fillStyle = '#fff';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('ПАУЗА', this.width / 2, this.height / 2);
                ctx.textAlign = 'left';
            }
        }

        // Методы для взаимодействия с системами
        addEnemy(enemy) {
            this.enemies.push(enemy);
        }

        addProjectile(projectile) {
            this.projectiles.push(projectile);
        }

        addRune(rune) {
            this.runes.push(rune);
        }

        getHero() {
            return this.hero;
        }

        getEnemies() {
            return this.enemies;
        }
    */
    
    /**
     * Получить текущий тип элемента для VFX
     * @returns {string} Тип элемента ('Q', 'W', 'E', 'QWE', 'default')
     */
    getCurrentElementType() {
        const comboInfo = this.runeCastSystem.getComboInfo();
        
        // Если активна комбинация QWE
        if (comboInfo.activeCombo === 'universal_mode') {
            return 'QWE';
        }
        
        // Если активна комбинация QQQ
        if (comboInfo.activeCombo === 'ice_spikes') {
            return 'Q';
        }
        
        // Если активна комбинация WWW
        if (comboInfo.activeCombo === 'berserker_speed') {
            return 'W';
        }
        
        // Если активна комбинация EEE
        if (comboInfo.activeCombo === 'explosive_shot') {
            return 'E';
        }
        
        // Если есть активные руны, берем последнюю
        if (this.runesArray && this.runesArray.length > 0) {
            return this.runesArray[this.runesArray.length - 1];
        }
        
        // По умолчанию
        return 'default';
    }
    
    /**
     * Создать UI элементы
     */
    createUI() {
        // Создаем полоску маны
        this.createManaBar();
        
        // Создаем полоску здоровья
        this.createHealthBar();
        
        // Создаем индикатор уровня
        this.createLevelIndicator();
    }
    
    /**
     * Создать полоску маны
     */
    createManaBar() {
        const barWidth = 200;
        const barHeight = 20;
        const x = 10;
        const y = 10;
        
        // Фон полоски
        this.manaBarBg = this.add.rectangle(x + barWidth/2, y + barHeight/2, barWidth, barHeight, 0x333333);
        this.manaBarBg.setOrigin(0.5, 0.5);
        
        // Полоска маны
        this.manaBar = this.add.rectangle(x + barWidth/2, y + barHeight/2, barWidth, barHeight, 0x0088ff);
        this.manaBar.setOrigin(0.5, 0.5);
        
        // Текст маны
        this.manaUIText = this.add.text(x, y - 5, 'Мана: 0/100', {
            fontSize: '14px',
            fill: '#ffffff',
            align: 'left'
        }).setOrigin(0, 0);
    }
    
    /**
     * Создать полоску здоровья
     */
    createHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const x = 10;
        const y = 40;
        
        // Фон полоски
        this.healthBarBg = this.add.rectangle(x + barWidth/2, y + barHeight/2, barWidth, barHeight, 0x333333);
        this.healthBarBg.setOrigin(0.5, 0.5);
        
        // Полоска здоровья
        this.healthBar = this.add.rectangle(x + barWidth/2, y + barHeight/2, barWidth, barHeight, 0x00ff00);
        this.healthBar.setOrigin(0.5, 0.5);
        
        // Текст здоровья
        this.healthUIText = this.add.text(x, y - 5, 'Здоровье: 100/100', {
            fontSize: '14px',
            fill: '#ffffff',
            align: 'left'
        }).setOrigin(0, 0);
    }
    
    /**
     * Создать индикатор уровня
     */
    createLevelIndicator() {
        const x = 10;
        const y = 70;
        
        this.levelIndicator = this.add.text(x, y, 'Уровень: 1', {
            fontSize: '16px',
            fill: '#ff8800',
            align: 'left'
        }).setOrigin(0, 0);
    }
    
    /**
     * Обновить UI элементы
     */
    updateUI() {
        if (!this.hero) return;
        
        // Обновляем полоску маны
        const manaPercent = this.hero.mana / this.hero.maxMana;
        this.manaBar.scaleX = manaPercent;
        this.manaUIText.setText(`Мана: ${Math.floor(this.hero.mana)}/${this.hero.maxMana}`);
        
        // Обновляем полоску здоровья
        const healthPercent = this.hero.health / this.hero.maxHealth;
        this.healthBar.scaleX = healthPercent;
        this.healthUIText.setText(`Здоровье: ${Math.floor(this.hero.health)}/${this.hero.maxHealth}`);
        
        // Обновляем индикатор уровня
        this.levelIndicator.setText(`Уровень: ${this.hero.level}`);
    }
    
    /**
     * Изменить радиус подбора пикселей маны
     * @param {number} newRadius - Новый радиус подбора
     */
    setManaPixelPickupRadius(newRadius) {
        if (this.manaPixelSystem) {
            this.manaPixelSystem.setPickupRadius(newRadius);
        }
    }
    
    /**
     * Изменить радиус притяжения пикселей маны
     * @param {number} newRadius - Новый радиус притяжения
     */
    setManaPixelAttractionRadius(newRadius) {
        if (this.manaPixelSystem) {
            this.manaPixelSystem.setAttractionRadius(newRadius);
        }
    }
}