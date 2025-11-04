/**
 * Система спавна - управляет появлением врагов и других объектов
 */

import { Enemy } from '../entities/Enemy.js';

export class SpawnSystem {
    constructor() {
        this.initialized = false;
        
        // Параметры спавна
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2 секунды между спавнами
        this.maxEnemies = 10;
        this.currentEnemies = 0;
        
        // Типы врагов и их вероятности
        this.enemyTypes = [
            { type: 'basic', probability: 0.6, minLevel: 1 },
            { type: 'fast', probability: 0.3, minLevel: 2 },
            { type: 'tank', probability: 0.1, minLevel: 3 },
            { type: 'boss', probability: 0.05, minLevel: 5 }
        ];
        
        // Волны врагов
        this.waveNumber = 1;
        this.waveEnemies = 0;
        this.waveMaxEnemies = 5;
        this.waveComplete = false;
        
        // Спавн зоны
        this.spawnZones = [
            { x: 0, y: 0, width: 50, height: 600 }, // Левая сторона
            { x: 750, y: 0, width: 50, height: 600 }, // Правая сторона
            { x: 0, y: 0, width: 800, height: 50 }, // Верх
            { x: 0, y: 550, width: 800, height: 50 } // Низ
        ];
        
        // Спавн события
        this.spawnEvents = [];
        this.eventTimer = 0;
        this.eventInterval = 10000; // 10 секунд между событиями
    }

    init() {
        this.initialized = true;
        this.resetWave();
    }

    resetWave() {
        this.waveNumber = 1;
        this.waveEnemies = 0;
        this.waveMaxEnemies = 5;
        this.waveComplete = false;
        this.spawnInterval = 2000;
    }

    update(deltaTime, gameScene) {
        if (!this.initialized) return;
        
        this.spawnTimer += deltaTime;
        this.eventTimer += deltaTime;
        
        // Обновляем количество врагов
        this.currentEnemies = gameScene.getEnemies().length;
        
        // Проверяем завершение волны
        this.checkWaveComplete();
        
        // Спавним врагов
        this.updateEnemySpawning(deltaTime, gameScene);
        
        // Обновляем события
        this.updateSpawnEvents(deltaTime, gameScene);
    }

    checkWaveComplete() {
        if (this.currentEnemies === 0 && this.waveEnemies >= this.waveMaxEnemies) {
            this.waveComplete = true;
            this.nextWave();
        }
    }

    nextWave() {
        this.waveNumber++;
        this.waveEnemies = 0;
        this.waveMaxEnemies = Math.min(20, 5 + this.waveNumber * 2);
        this.waveComplete = false;
        
        // Уменьшаем интервал спавна с каждой волной
        this.spawnInterval = Math.max(500, 2000 - this.waveNumber * 100);
        
        console.log(`Волна ${this.waveNumber} началась! Врагов: ${this.waveMaxEnemies}`);
    }

    updateEnemySpawning(deltaTime, gameScene) {
        if (this.waveComplete) return;
        if (this.currentEnemies >= this.maxEnemies) return;
        if (this.waveEnemies >= this.waveMaxEnemies) return;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemy(gameScene);
            this.spawnTimer = 0;
        }
    }

    spawnEnemy(gameScene) {
        const enemyType = this.selectEnemyType();
        const spawnPosition = this.getSpawnPosition();
        
        const enemy = new Enemy(spawnPosition.x, spawnPosition.y, enemyType);
        gameScene.addEnemy(enemy);
        
        this.waveEnemies++;
        this.currentEnemies++;
    }

    selectEnemyType() {
        const availableTypes = this.enemyTypes.filter(
            type => this.waveNumber >= type.minLevel
        );
        
        if (availableTypes.length === 0) {
            return 'basic';
        }
        
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (const type of availableTypes) {
            cumulativeProbability += type.probability;
            if (random <= cumulativeProbability) {
                return type.type;
            }
        }
        
        return availableTypes[availableTypes.length - 1].type;
    }

    getSpawnPosition() {
        const zone = this.spawnZones[Math.floor(Math.random() * this.spawnZones.length)];
        
        return {
            x: zone.x + Math.random() * zone.width,
            y: zone.y + Math.random() * zone.height
        };
    }

    updateSpawnEvents(deltaTime, gameScene) {
        if (this.eventTimer >= this.eventInterval) {
            this.triggerSpawnEvent(gameScene);
            this.eventTimer = 0;
        }
    }

    triggerSpawnEvent(gameScene) {
        const events = [
            'enemyRush',
            'bossSpawn',
            'powerUpSpawn',
            'specialWave'
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        
        switch(event) {
            case 'enemyRush':
                this.enemyRush(gameScene);
                break;
            case 'bossSpawn':
                this.spawnBoss(gameScene);
                break;
            case 'powerUpSpawn':
                this.spawnPowerUps(gameScene);
                break;
            case 'specialWave':
                this.specialWave(gameScene);
                break;
        }
    }

    enemyRush(gameScene) {
        console.log('Вражеский натиск!');
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const enemy = new Enemy(
                    Math.random() * 800,
                    Math.random() * 600,
                    'fast'
                );
                gameScene.addEnemy(enemy);
            }, i * 500);
        }
    }

    spawnBoss(gameScene) {
        if (this.waveNumber >= 3) {
            console.log('Появление босса!');
            const boss = new Enemy(400, 100, 'boss');
            gameScene.addEnemy(boss);
        }
    }

    spawnPowerUps(gameScene) {
        console.log('Появление усилений!');
        // Здесь можно добавить логику спавна усилений
    }

    specialWave(gameScene) {
        console.log('Особая волна!');
        this.waveMaxEnemies += 5;
        this.spawnInterval *= 0.5;
    }

    // Методы для управления спавном
    setSpawnInterval(interval) {
        this.spawnInterval = interval;
    }

    setMaxEnemies(max) {
        this.maxEnemies = max;
    }

    addSpawnEvent(event) {
        this.spawnEvents.push(event);
    }

    // Получение информации о системе
    getWaveNumber() {
        return this.waveNumber;
    }

    getWaveProgress() {
        return this.waveEnemies / this.waveMaxEnemies;
    }

    isWaveComplete() {
        return this.waveComplete;
    }

    getCurrentEnemies() {
        return this.currentEnemies;
    }

    getMaxEnemies() {
        return this.maxEnemies;
    }
}
