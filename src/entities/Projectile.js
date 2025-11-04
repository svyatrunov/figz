/**
 * Класс снаряда для Phaser - летящий объект, наносящий урон врагам
 * Реализует движение по направлению к цели с учетом worldOffset
 */

export class Projectile {
    constructor(scene, worldX, worldY, velocityX, velocityY, damage, lifetime = 3000, comboFlags = {}, elementType = 'default') {
        this.scene = scene;
        this.worldX = worldX;
        this.worldY = worldY;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = damage;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.sprite = null;
        this.isAlive = true;
        this.elementType = elementType;
        
        // Комбо-флаги
        this.comboFlags = { ...comboFlags };
        
        // Создаем визуальное представление
        this.create();
        
        // console.log(`Projectile: создан в позиции (${worldX}, ${worldY}) с уроном ${damage}`);
    }

    create() {
        // Определяем цвет и размер в зависимости от комбо-флагов
        let color = 0xffff00; // Желтый по умолчанию
        let strokeColor = 0xffaa00;
        let radius = 8;
        
        if (this.comboFlags.iceSpikes) {
            color = 0x00aaff; // Голубой для ледяных шипов
            strokeColor = 0x0088cc;
            radius = 10;
        } else if (this.comboFlags.berserkerSpeed) {
            color = 0xff4400; // Красный для бешеной скорости
            strokeColor = 0xcc2200;
            radius = 6;
        } else if (this.comboFlags.explosiveShot) {
            color = 0xff8800; // Оранжевый для взрывной атаки
            strokeColor = 0xcc6600;
            radius = 12;
        } else if (this.comboFlags.universalMode) {
            color = 0x88ff88; // Зеленый для универсального режима
            strokeColor = 0x66cc66;
            radius = 9;
        } else if (this.comboFlags.standardBuff) {
            color = 0xff88ff; // Розовый для стандартного баффа
            strokeColor = 0xcc66cc;
            radius = 8;
        }
        
        // Создаем снаряд с соответствующим цветом
        this.sprite = this.scene.add.circle(0, 0, radius, color);
        this.sprite.setStrokeStyle(2, strokeColor);
        
        // Устанавливаем начальную позицию
        this.updateScreenPosition();
    }

    /**
     * Обновить снаряд
     * @param {number} delta - Время с последнего кадра в миллисекундах
     * @param {object} worldOffset - Смещение мира
     */
    update(delta, worldOffset) {
        if (!this.isAlive) return;

        // Обновляем позицию в мировых координатах
        this.worldX += this.velocityX * (delta / 1000);
        this.worldY += this.velocityY * (delta / 1000);
        
        // Обновляем экранную позицию
        this.updateScreenPosition(worldOffset);
        
        // Уменьшаем время жизни
        this.lifetime -= delta;
        
        // Проверяем, истекло ли время жизни
        if (this.lifetime <= 0) {
            this.destroy();
        }
    }

    /**
     * Обновить позицию спрайта на экране
     * @param {object} worldOffset - Смещение мира
     */
    updateScreenPosition(worldOffset) {
        if (this.sprite && worldOffset) {
            this.sprite.x = this.worldX - worldOffset.x;
            this.sprite.y = this.worldY - worldOffset.y;
        }
    }

    /**
     * Проверить попадание в врага
     * @param {Enemy} enemy - Враг для проверки
     * @returns {boolean} Попал ли снаряд
     */
    checkHit(enemy) {
        if (!this.isAlive || !enemy.isAlive) return false;
        
        const dx = this.worldX - enemy.worldX;
        const dy = this.worldY - enemy.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Радиус попадания
        const hitRadius = 20;
        return distance < hitRadius;
    }

    /**
     * Нанести урон врагу
     * @param {Enemy} enemy - Враг для нанесения урона
     */
    hitEnemy(enemy) {
        if (enemy.isAlive) {
            enemy.takeDamage(this.damage, this.elementType);
            // console.log(`Projectile: нанесен урон ${this.damage} врагу`);
            this.destroy();
        }
    }

    /**
     * Уничтожить снаряд
     */
    destroy() {
        this.isAlive = false;
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    /**
     * Проверить, жив ли снаряд
     * @returns {boolean} Жив ли снаряд
     */
    isDead() {
        return !this.isAlive;
    }

    /**
     * Получить мировую позицию снаряда
     * @returns {object} Позиция {x, y}
     */
    getWorldPosition() {
        return {
            x: this.worldX,
            y: this.worldY
        };
    }

    /**
     * Получить спрайт снаряда
     * @returns {Phaser.GameObjects.Circle} Спрайт снаряда
     */
    getSprite() {
        return this.sprite;
    }
    
    /**
     * Получить X координату снаряда
     * @returns {number} X координата
     */
    get x() {
        return this.worldX;
    }
    
    /**
     * Получить Y координату снаряда
     * @returns {number} Y координата
     */
    get y() {
        return this.worldY;
    }
}


