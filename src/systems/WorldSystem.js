/**
 * Система генерации мира по чанкам для Phaser
 * Управляет процедурной генерацией чанков и их объектов
 */

export class WorldSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Параметры чанков
        this.chunkSize = 512; // Размер чанка в пикселях
        this.loadRadius = 2; // Радиус загрузки чанков вокруг героя
        
        // Хранилище загруженных чанков
        this.loadedChunks = new Map();
        
        // Последняя позиция героя для оптимизации
        this.lastHeroChunk = { x: null, y: null };
        
        console.log('WorldSystem: инициализирован с размером чанка', this.chunkSize);
    }

    /**
     * Получить ключ чанка по координатам
     * @param {number} cx - X координата чанка
     * @param {number} cy - Y координата чанка
     * @returns {string} Ключ чанка
     */
    getChunkKey(cx, cy) {
        return `${cx}_${cy}`;
    }

    /**
     * Получить координаты чанка по мировым координатам
     * @param {number} worldX - Мировая X координата
     * @param {number} worldY - Мировая Y координата
     * @returns {object} Координаты чанка {x, y}
     */
    getChunkCoords(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.chunkSize),
            y: Math.floor(worldY / this.chunkSize)
        };
    }

    /**
     * Создать новый чанк с объектами
     * @param {number} cx - X координата чанка
     * @param {number} cy - Y координата чанка
     * @returns {object} Созданный чанк
     */
    createChunk(cx, cy) {
        console.log(`WorldSystem: создание чанка (${cx}, ${cy})`);
        
        const chunk = {
            cx: cx,
            cy: cy,
            objects: [], // Массив объектов чанка
            isLoaded: true,
            created: Date.now()
        };

        // Генерируем случайные объекты в чанке (2-5 штук)
        const objectCount = 2 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < objectCount; i++) {
            // Случайная позиция внутри чанка
            const localX = Math.random() * this.chunkSize;
            const localY = Math.random() * this.chunkSize;
            
            // Мировые координаты объекта
            const worldX = cx * this.chunkSize + localX;
            const worldY = cy * this.chunkSize + localY;
            
            // Случайный цвет и размер
            const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 20 + Math.random() * 30; // 20-50 пикселей
            
            // Создаем объект в Phaser
            const object = this.scene.add.rectangle(0, 0, size, size, color);
            object.setOrigin(0.5, 0.5);
            
            // Сохраняем данные объекта
            const objectData = {
                phaserObject: object,
                worldX: worldX,
                worldY: worldY,
                size: size,
                color: color
            };
            
            chunk.objects.push(objectData);
        }
        
        console.log(`WorldSystem: чанк (${cx}, ${cy}) создан с ${chunk.objects.length} объектами`);
        return chunk;
    }

    /**
     * Убедиться, что чанк существует и загружен
     * @param {number} cx - X координата чанка
     * @param {number} cy - Y координата чанка
     * @returns {object} Чанк
     */
    ensureChunk(cx, cy) {
        const key = this.getChunkKey(cx, cy);
        
        if (!this.loadedChunks.has(key)) {
            const chunk = this.createChunk(cx, cy);
            this.loadedChunks.set(key, chunk);
        }
        
        return this.loadedChunks.get(key);
    }

    /**
     * Обновить позиции объектов чанка согласно worldOffset
     * @param {object} chunk - Чанк для обновления
     */
    updateChunkObjects(chunk) {
        chunk.objects.forEach(objectData => {
            const screenX = objectData.worldX - this.scene.worldOffset.x;
            const screenY = objectData.worldY - this.scene.worldOffset.y;
            
            objectData.phaserObject.setPosition(screenX, screenY);
        });
    }

    /**
     * Удалить чанк и все его объекты
     * @param {string} key - Ключ чанка
     */
    unloadChunk(key) {
        const chunk = this.loadedChunks.get(key);
        if (chunk) {
            console.log(`WorldSystem: выгрузка чанка ${key}`);
            
            // Удаляем все объекты чанка
            chunk.objects.forEach(objectData => {
                objectData.phaserObject.destroy();
            });
            
            // Удаляем чанк из карты
            this.loadedChunks.delete(key);
        }
    }

    /**
     * Обновить систему чанков на основе позиции героя
     * @param {number} heroWorldX - Мировая X координата героя
     * @param {number} heroWorldY - Мировая Y координата героя
     */
    updateChunks(heroWorldX, heroWorldY) {
        // Получаем координаты текущего чанка героя
        const heroChunk = this.getChunkCoords(heroWorldX, heroWorldY);
        
        // Проверяем, изменился ли чанк героя
        if (this.lastHeroChunk.x !== heroChunk.x || this.lastHeroChunk.y !== heroChunk.y) {
            console.log(`WorldSystem: герой перешел в чанк (${heroChunk.x}, ${heroChunk.y})`);
            this.lastHeroChunk = { x: heroChunk.x, y: heroChunk.y };
            
            // Загружаем чанки в радиусе
            this.loadChunksInRadius(heroChunk.x, heroChunk.y);
            
            // Выгружаем чанки вне радиуса
            this.unloadChunksOutsideRadius(heroChunk.x, heroChunk.y);
        }
        
        // Обновляем позиции всех объектов в загруженных чанках
        this.updateAllChunkObjects();
    }

    /**
     * Загрузить чанки в радиусе вокруг позиции
     * @param {number} centerX - Центральная X координата
     * @param {number} centerY - Центральная Y координата
     */
    loadChunksInRadius(centerX, centerY) {
        for (let dx = -this.loadRadius; dx <= this.loadRadius; dx++) {
            for (let dy = -this.loadRadius; dy <= this.loadRadius; dy++) {
                const cx = centerX + dx;
                const cy = centerY + dy;
                this.ensureChunk(cx, cy);
            }
        }
    }

    /**
     * Выгрузить чанки вне радиуса
     * @param {number} centerX - Центральная X координата
     * @param {number} centerY - Центральная Y координата
     */
    unloadChunksOutsideRadius(centerX, centerY) {
        const chunksToUnload = [];
        
        this.loadedChunks.forEach((chunk, key) => {
            const distance = Math.max(
                Math.abs(chunk.cx - centerX),
                Math.abs(chunk.cy - centerY)
            );
            
            if (distance > this.loadRadius) {
                chunksToUnload.push(key);
            }
        });
        
        chunksToUnload.forEach(key => this.unloadChunk(key));
    }

    /**
     * Обновить позиции всех объектов во всех загруженных чанках
     */
    updateAllChunkObjects() {
        this.loadedChunks.forEach(chunk => {
            this.updateChunkObjects(chunk);
        });
    }

    /**
     * Получить информацию о загруженных чанках
     * @returns {object} Статистика системы
     */
    getStats() {
        return {
            loadedChunks: this.loadedChunks.size,
            totalObjects: Array.from(this.loadedChunks.values())
                .reduce((total, chunk) => total + chunk.objects.length, 0),
            chunkSize: this.chunkSize,
            loadRadius: this.loadRadius
        };
    }

    /**
     * Очистить все чанки (для перезапуска)
     */
    clear() {
        console.log('WorldSystem: очистка всех чанков');
        
        this.loadedChunks.forEach((chunk, key) => {
            this.unloadChunk(key);
        });
        
        this.loadedChunks.clear();
        this.lastHeroChunk = { x: null, y: null };
    }
}