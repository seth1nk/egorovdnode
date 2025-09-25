document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';
    headerContainer.innerHTML = `
        <a class="pets-link" href="/televisions/index.html">Телевизоры</a>
        <a class="pets-link" href="/">Главная</a>
        <a class="nutrition-link" href="/sales/index.html">Продажи</a>
    `;
    document.body.insertBefore(headerContainer, document.body.firstChild);
});
