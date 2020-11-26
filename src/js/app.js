import '../css/style.css';
import './plugins';   // подключили все плагины, в том числе и materialize
import locations from './store/locations';
import favorites from './store/favStore';
import formUI from './views/form';
import currencyUI from './views/currency';
import ticketsUI from './views/tickets';
import favoritesUI from './views/favorites';

document.addEventListener('DOMContentLoaded', () => {
    const form = formUI.form;
    const ticketsContainer = ticketsUI.ticketsContainer;
    const favoritesContainer = favoritesUI.favoritesContainer;
    const favoriteAddBtn = ticketsUI.favoriteAddBtnClass;
    const favoriteDelBtn = favoritesUI.favotiteDelBtnClass;
    

    // Events
    initApp();
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        onFormSubmit();
    })
    ticketsContainer.addEventListener('click', (e) => {
        // Обработчик события при клике на сердечко.
        // при клике на билет проверяем, если щелкаем не на элемент с ближайшим родителем,
        // имеющим класс .add-favorite (т.е. на сердечко), то выходим, 
        // если на элемент с таким родителем, то выполняем функцию onFavoritesChange
        e.preventDefault();
        if (!e.target.closest(favoriteAddBtn)) return;
        onFavoritesChange(e.target);
    })
    favoritesContainer.addEventListener('click', (e) => {
        // Обработчик события при клике на кнопку Delete в избранных билетах.
        // при клике на контейнер проверяем, содержит ли элемент класс .delete-favorite.
        // Если нет, то выходим, если да, то выполняем функцию onFavoritesRemove
        e.preventDefault();
        if (!e.target.matches(favoriteDelBtn)) return;
        onFavoritesRemove(e.target);
    })

    // Handlers
    async function initApp() {
        favorites.getFavoritesList();
        await locations.init();
        formUI.setAutocompleteData(locations.shortCities);
    }

    async function onFormSubmit() {
        // собрать все данные из инпутов в объект
        const origin = locations.getCityCodeByKey(formUI.originValue);
        const destination = locations.getCityCodeByKey(formUI.destinationValue);
        const depart_date = formUI.departDateValue;
        const return_date = formUI.returnDateValue;
        const currency = currencyUI.currencyValue;
        // нужно преобразовать данные в вид: 
        // "CODE(код города отправления), CODE(код города прибытия), 2019-09, 2019-10"
        await locations.fetchTickets({
            origin, 
            destination,
            depart_date, 
            return_date,
            currency,
        });
        
        ticketsUI.renderTickets(locations.lastSearch);
    }

    // favorites
    function onFavoritesChange(btn) {
        // btn - кнопка по которой щелкнули (сердечко)
        // ищем ID этого билета(записан в атрибуте dataset)
        const ticketID = btn.closest('[data-ticket-id]').dataset.ticketId;
        // если нет такого билета в избранных, то добавляем класс .favorite-true
        // если есть - удаляем
        if(!favorites.checkTicketIsFavorite(ticketID)) { // ф-ция проверяет, нажато ли сердечко
            btn.classList.add('favorite-true');
          } else {
            btn.classList.remove('favorite-true');
          }
          // запускаем ф-цию изменения статуса билета
          favorites.changeFavoriteState(ticketID);
          favorites.getFavoritesList();
    }; 

    //remove item from favorites list
    function onFavoritesRemove(btn) {
        const ticketID = btn.closest('[data-ticket-id]').dataset.ticketId;
        const ticketBlock = ticketsContainer.querySelector(`[data-ticket-id=${ticketID}]`);
        if (ticketBlock) {
            const ticketBlockBtn = ticketBlock.querySelector(favoriteAddBtn).querySelector('i');
            ticketBlockBtn.classList.remove('favorite-true');
        }
        favorites.removeFavoritesItem(ticketID);
        favorites.getFavoritesList();
    }
});