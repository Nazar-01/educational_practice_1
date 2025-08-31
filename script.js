// Массив с URL изображений для слайдера
const images = [
    'https://picsum.photos/600/400?random=1',
    'https://picsum.photos/600/400?random=2',
    'https://picsum.photos/600/400?random=3',
    'https://picsum.photos/600/400?random=4',
    'https://picsum.photos/600/400?random=5'
];

// Переменная для отслеживания текущего индекса изображения
let currentImageIndex = 0;

// Получаем элементы DOM
const currentImage = document.getElementById('current-image');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const imageCounter = document.getElementById('image-counter');
const slideWrapper = document.querySelector('.slide-wrapper');

// Функция для обновления отображения изображения
function updateImage() {
    // Добавляем класс загрузки для анимации
    slideWrapper.classList.add('loading');
    
    // Создаем новое изображение для предзагрузки
    const newImage = new Image();
    
    newImage.onload = function() {
        // Когда изображение загружено, обновляем src и убираем загрузку
        currentImage.src = images[currentImageIndex];
        currentImage.alt = `Изображение ${currentImageIndex + 1}`;
        slideWrapper.classList.remove('loading');
        
        // Обновляем счетчик
        updateCounter();
    };
    
    newImage.onerror = function() {
        // В случае ошибки загрузки, убираем индикатор загрузки
        slideWrapper.classList.remove('loading');
        console.error('Ошибка загрузки изображения:', images[currentImageIndex]);
    };
    
    // Начинаем загрузку изображения
    newImage.src = images[currentImageIndex];
}

// Функция для обновления счетчика изображений
function updateCounter() {
    imageCounter.textContent = `Изображение ${currentImageIndex + 1} из ${images.length}`;
}

// Функция для перехода к следующему изображению
function nextImage() {
    // Зацикливание: если достигли конца, возвращаемся к началу
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateImage();
}

// Функция для перехода к предыдущему изображению
function prevImage() {
    // Зацикливание: если в начале, переходим к концу
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateImage();
}

// Добавляем обработчики событий для кнопок
nextBtn.addEventListener('click', nextImage);
prevBtn.addEventListener('click', prevImage);

// Добавляем поддержку клавиатуры
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
        case 'Escape':
            // Можно добавить функцию закрытия или другую логику
            break;
    }
});

// Добавляем поддержку свайпов на мобильных устройствах
let startX = 0;
let endX = 0;

currentImage.addEventListener('touchstart', function(event) {
    startX = event.touches[0].clientX;
});

currentImage.addEventListener('touchend', function(event) {
    endX = event.changedTouches[0].clientX;
    handleSwipe();
});

function handleSwipe() {
    const threshold = 50; // Минимальное расстояние для свайпа
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            // Свайп влево - следующее изображение
            nextImage();
        } else {
            // Свайп вправо - предыдущее изображение
            prevImage();
        }
    }
}

// Функция для автоматического воспроизведения слайдшоу
let autoplayInterval;
let isAutoplayActive = false;

function startAutoplay(interval = 3000) {
    if (isAutoplayActive) return;
    
    isAutoplayActive = true;
    autoplayInterval = setInterval(nextImage, interval);
}

function stopAutoplay() {
    if (!isAutoplayActive) return;
    
    isAutoplayActive = false;
    clearInterval(autoplayInterval);
}

// Останавливаем автовоспроизведение при взаимодействии пользователя
prevBtn.addEventListener('click', stopAutoplay);
nextBtn.addEventListener('click', stopAutoplay);
currentImage.addEventListener('click', function() {
    if (isAutoplayActive) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
});

// Добавляем индикатор автовоспроизведения
function createAutoplayIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'autoplay-indicator';
    indicator.innerHTML = '⏸️ Кликните на изображение для автовоспроизведения';
    indicator.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        z-index: 15;
        transition: opacity 0.3s ease;
    `;
    
    document.querySelector('.slider').appendChild(indicator);
    
    // Скрываем индикатор через 3 секунды
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }, 3000);
}

// Инициализация слайдера
function initSlider() {
    // Устанавливаем первое изображение
    updateImage();
    
    // Добавляем индикатор автовоспроизведения
    createAutoplayIndicator();
    
    // Предзагружаем следующее изображение для плавности
    const nextIndex = (currentImageIndex + 1) % images.length;
    const preloadImage = new Image();
    preloadImage.src = images[nextIndex];
}

// Запускаем инициализацию когда DOM готов
document.addEventListener('DOMContentLoaded', initSlider);

// Добавляем функцию для смены набора изображений (для расширяемости)
function setImages(newImages) {
    if (!Array.isArray(newImages) || newImages.length === 0) {
        console.error('Массив изображений должен содержать хотя бы одно изображение');
        return;
    }
    
    images.length = 0; // Очищаем текущий массив
    images.push(...newImages); // Добавляем новые изображения
    currentImageIndex = 0;
    updateImage();
}

// Экспортируем функции для возможного использования извне
window.SliderAPI = {
    nextImage,
    prevImage,
    setImages,
    startAutoplay,
    stopAutoplay,
    getCurrentIndex: () => currentImageIndex,
    getTotalImages: () => images.length
};
