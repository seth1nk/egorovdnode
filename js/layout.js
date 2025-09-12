document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';
    headerContainer.innerHTML = `
        <a class="pets-link" href="/bicycles/index.html">Велосипеды</a>
        <a class="pets-link" href="/">Главная</a>
        <a class="nutrition-link" href="/repair-services/index.html">Услуги</a>
    `;
    document.body.insertBefore(headerContainer, document.body.firstChild);
});