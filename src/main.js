/**
 * Главный файл игры - точка входа
 * Инициализирует Phaser игру и создает основную игровую сцену
 */

console.log('main.js: файл загружается...');

import Phaser from 'phaser';
console.log('main.js: Phaser импортирован:', Phaser);

import { GameScene } from './scenes/GameScene.js';
console.log('main.js: GameScene импортирован:', GameScene);

// Конфигурация Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Инициализируем Phaser игру
let game;

// Функция инициализации игры
function initGame() {
    console.log('Инициализация Phaser игры...');
    
    try {
        // Получаем контейнер для игры
        const gameContainer = document.getElementById('game-container');
        console.log('Контейнер игры найден:', gameContainer);
        
        if (!gameContainer) {
            throw new Error('Контейнер игры не найден!');
        }
        
        // Создаем Phaser игру
        game = new Phaser.Game({
            ...config,
            parent: gameContainer
        });
        
        console.log('Phaser игра запущена успешно!');
        
        // Добавляем обработчик успешной инициализации
        game.events.on('ready', () => {
            console.log('Phaser игра готова к работе!');
        });
        
        // Добавляем обработчик ошибок
        game.events.on('error', (error) => {
            console.error('Ошибка Phaser:', error);
        });
        
        // Проверяем, что игра создана
        if (game) {
            console.log('Игра создана:', game);
        } else {
            console.error('Игра не создана!');
        }
        
    } catch (error) {
        console.error('Ошибка инициализации Phaser:', error);
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = `Ошибка инициализации: ${error.message}`;
        }
    }
}

// Запускаем игру когда DOM загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM уже загружен
    initGame();
}

// Экспортируем для возможного использования
export { game };

// ====================================================================
// LEGACY CANVAS CODE - БУДЕТ ПЕРЕНОСИТЬСЯ ПОЭТАПНО
// ====================================================================

/*
ВНИМАНИЕ: Весь код ниже - это старая Canvas-реализация, которая будет
поэтапно переноситься в Phaser. Код сохранен для справки и постепенной миграции.

СТАТУС: Ожидает переноса в Phaser-системы
*/

/*
import { GameScene } from './scenes/GameScene.js';

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameScene = null;
        this.isRunning = false;
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        // Создаем canvas элемент
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.border = '1px solid #000';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        // Получаем контекст
        this.ctx = this.canvas.getContext('2d');
        
        // Добавляем canvas на страницу
        document.body.appendChild(this.canvas);
        
        // Создаем игровую сцену
        this.gameScene = new GameScene(this.ctx, this.canvas.width, this.canvas.height);
        
        // Запускаем игровой цикл
        this.start();
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Обновляем игру
        this.update(deltaTime);
        
        // Отрисовываем игру
        this.render();
        
        // Продолжаем цикл
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        this.gameScene.update(deltaTime);
    }

    render() {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовываем сцену
        this.gameScene.render(this.ctx);
    }
}

// Запускаем игру когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

// Экспортируем класс Game для возможного использования
export { Game };
*/