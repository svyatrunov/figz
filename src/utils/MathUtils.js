/**
 * Математические утилиты для игры
 */

export class MathUtils {
    /**
     * Вычисляет расстояние между двумя точками
     * @param {number} x1 - X координата первой точки
     * @param {number} y1 - Y координата первой точки
     * @param {number} x2 - X координата второй точки
     * @param {number} y2 - Y координата второй точки
     * @returns {number} Расстояние между точками
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Вычисляет угол между двумя точками
     * @param {number} x1 - X координата первой точки
     * @param {number} y1 - Y координата первой точки
     * @param {number} x2 - X координата второй точки
     * @param {number} y2 - Y координата второй точки
     * @returns {number} Угол в радианах
     */
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Нормализует угол в диапазоне [0, 2π]
     * @param {number} angle - Угол в радианах
     * @returns {number} Нормализованный угол
     */
    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }

    /**
     * Вычисляет разность углов
     * @param {number} angle1 - Первый угол
     * @param {number} angle2 - Второй угол
     * @returns {number} Разность углов в диапазоне [-π, π]
     */
    static angleDifference(angle1, angle2) {
        let diff = angle2 - angle1;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return diff;
    }

    /**
     * Линейная интерполяция между двумя значениями
     * @param {number} a - Начальное значение
     * @param {number} b - Конечное значение
     * @param {number} t - Параметр интерполяции [0, 1]
     * @returns {number} Интерполированное значение
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Ограничивает значение в заданном диапазоне
     * @param {number} value - Значение для ограничения
     * @param {number} min - Минимальное значение
     * @param {number} max - Максимальное значение
     * @returns {number} Ограниченное значение
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Случайное число в диапазоне
     * @param {number} min - Минимальное значение
     * @param {number} max - Максимальное значение
     * @returns {number} Случайное число
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Случайное целое число в диапазоне
     * @param {number} min - Минимальное значение
     * @param {number} max - Максимальное значение
     * @returns {number} Случайное целое число
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Случайный элемент из массива
     * @param {Array} array - Массив элементов
     * @returns {*} Случайный элемент
     */
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Проверяет, находится ли точка внутри круга
     * @param {number} pointX - X координата точки
     * @param {number} pointY - Y координата точки
     * @param {number} circleX - X координата центра круга
     * @param {number} circleY - Y координата центра круга
     * @param {number} radius - Радиус круга
     * @returns {boolean} true, если точка внутри круга
     */
    static pointInCircle(pointX, pointY, circleX, circleY, radius) {
        return this.distance(pointX, pointY, circleX, circleY) <= radius;
    }

    /**
     * Проверяет, находится ли точка внутри прямоугольника
     * @param {number} pointX - X координата точки
     * @param {number} pointY - Y координата точки
     * @param {number} rectX - X координата прямоугольника
     * @param {number} rectY - Y координата прямоугольника
     * @param {number} rectWidth - Ширина прямоугольника
     * @param {number} rectHeight - Высота прямоугольника
     * @returns {boolean} true, если точка внутри прямоугольника
     */
    static pointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
        return pointX >= rectX && pointX <= rectX + rectWidth &&
               pointY >= rectY && pointY <= rectY + rectHeight;
    }

    /**
     * Проверяет коллизию между двумя кругами
     * @param {number} x1 - X координата первого круга
     * @param {number} y1 - Y координата первого круга
     * @param {number} r1 - Радиус первого круга
     * @param {number} x2 - X координата второго круга
     * @param {number} y2 - Y координата второго круга
     * @param {number} r2 - Радиус второго круга
     * @returns {boolean} true, если круги пересекаются
     */
    static circleCollision(x1, y1, r1, x2, y2, r2) {
        return this.distance(x1, y1, x2, y2) <= (r1 + r2);
    }

    /**
     * Проверяет коллизию между кругом и прямоугольником
     * @param {number} circleX - X координата круга
     * @param {number} circleY - Y координата круга
     * @param {number} circleRadius - Радиус круга
     * @param {number} rectX - X координата прямоугольника
     * @param {number} rectY - Y координата прямоугольника
     * @param {number} rectWidth - Ширина прямоугольника
     * @param {number} rectHeight - Высота прямоугольника
     * @returns {boolean} true, если круг пересекается с прямоугольником
     */
    static circleRectCollision(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
        const closestX = this.clamp(circleX, rectX, rectX + rectWidth);
        const closestY = this.clamp(circleY, rectY, rectY + rectHeight);
        return this.distance(circleX, circleY, closestX, closestY) <= circleRadius;
    }

    /**
     * Вычисляет точку на окружности
     * @param {number} centerX - X координата центра
     * @param {number} centerY - Y координата центра
     * @param {number} radius - Радиус
     * @param {number} angle - Угол в радианах
     * @returns {Object} Объект с координатами {x, y}
     */
    static pointOnCircle(centerX, centerY, radius, angle) {
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    }

    /**
     * Вычисляет точку на эллипсе
     * @param {number} centerX - X координата центра
     * @param {number} centerY - Y координата центра
     * @param {number} radiusX - Радиус по X
     * @param {number} radiusY - Радиус по Y
     * @param {number} angle - Угол в радианах
     * @returns {Object} Объект с координатами {x, y}
     */
    static pointOnEllipse(centerX, centerY, radiusX, radiusY, angle) {
        return {
            x: centerX + Math.cos(angle) * radiusX,
            y: centerY + Math.sin(angle) * radiusY
        };
    }

    /**
     * Вычисляет вектор от одной точки к другой
     * @param {number} fromX - X координата начальной точки
     * @param {number} fromY - Y координата начальной точки
     * @param {number} toX - X координата конечной точки
     * @param {number} toY - Y координата конечной точки
     * @returns {Object} Объект с компонентами вектора {x, y}
     */
    static vector(fromX, fromY, toX, toY) {
        return {
            x: toX - fromX,
            y: toY - fromY
        };
    }

    /**
     * Нормализует вектор
     * @param {number} x - X компонента вектора
     * @param {number} y - Y компонента вектора
     * @returns {Object} Нормализованный вектор {x, y}
     */
    static normalizeVector(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }

    /**
     * Вычисляет длину вектора
     * @param {number} x - X компонента вектора
     * @param {number} y - Y компонента вектора
     * @returns {number} Длина вектора
     */
    static vectorLength(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    /**
     * Скалярное произведение двух векторов
     * @param {number} x1 - X компонента первого вектора
     * @param {number} y1 - Y компонента первого вектора
     * @param {number} x2 - X компонента второго вектора
     * @param {number} y2 - Y компонента второго вектора
     * @returns {number} Скалярное произведение
     */
    static dotProduct(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    }

    /**
     * Векторное произведение двух векторов
     * @param {number} x1 - X компонента первого вектора
     * @param {number} y1 - Y компонента первого вектора
     * @param {number} x2 - X компонента второго вектора
     * @param {number} y2 - Y компонента второго вектора
     * @returns {number} Z компонента векторного произведения
     */
    static crossProduct(x1, y1, x2, y2) {
        return x1 * y2 - y1 * x2;
    }

    /**
     * Преобразует градусы в радианы
     * @param {number} degrees - Угол в градусах
     * @returns {number} Угол в радианах
     */
    static degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Преобразует радианы в градусы
     * @param {number} radians - Угол в радианах
     * @returns {number} Угол в градусах
     */
    static radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Вычисляет факториал числа
     * @param {number} n - Число
     * @returns {number} Факториал
     */
    static factorial(n) {
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * Вычисляет биномиальный коэффициент
     * @param {number} n - Верхний индекс
     * @param {number} k - Нижний индекс
     * @returns {number} Биномиальный коэффициент
     */
    static binomialCoefficient(n, k) {
        if (k > n || k < 0) return 0;
        if (k === 0 || k === n) return 1;
        
        let result = 1;
        for (let i = 0; i < k; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    /**
     * Вычисляет значение функции Бесселя первого рода
     * @param {number} n - Порядок функции
     * @param {number} x - Аргумент
     * @returns {number} Значение функции Бесселя
     */
    static besselJ(n, x) {
        let sum = 0;
        for (let k = 0; k < 20; k++) {
            const term = Math.pow(-1, k) * Math.pow(x / 2, n + 2 * k) / 
                        (this.factorial(k) * this.factorial(n + k));
            sum += term;
        }
        return sum;
    }

    /**
     * Вычисляет значение функции синуса с высокой точностью
     * @param {number} x - Аргумент в радианах
     * @returns {number} Значение синуса
     */
    static sin(x) {
        // Нормализуем угол
        x = x % (2 * Math.PI);
        if (x < 0) x += 2 * Math.PI;
        
        // Используем ряд Тейлора для высокой точности
        let result = 0;
        for (let n = 0; n < 10; n++) {
            const term = Math.pow(-1, n) * Math.pow(x, 2 * n + 1) / this.factorial(2 * n + 1);
            result += term;
        }
        return result;
    }

    /**
     * Вычисляет значение функции косинуса с высокой точностью
     * @param {number} x - Аргумент в радианах
     * @returns {number} Значение косинуса
     */
    static cos(x) {
        // Нормализуем угол
        x = x % (2 * Math.PI);
        if (x < 0) x += 2 * Math.PI;
        
        // Используем ряд Тейлора для высокой точности
        let result = 0;
        for (let n = 0; n < 10; n++) {
            const term = Math.pow(-1, n) * Math.pow(x, 2 * n) / this.factorial(2 * n);
            result += term;
        }
        return result;
    }
}
