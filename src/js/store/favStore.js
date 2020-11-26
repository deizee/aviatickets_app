import favoritesUI from '../views/favorites';
import locations from './locations';

class Favorites {
    constructor() {
        this.favoriteTickets = JSON.parse(localStorage.getItem('favoriteTickets')) || {};
    }

    changeFavoriteState(ticket) {
        // Ф-ция изменения статуса билета.
        // в параметре приходит ID билета
        // парсим объект избранных билетов из localStorage
        this.favoriteTickets = JSON.parse(localStorage.getItem('favoriteTickets')) || {};
        // в условии проверяем, является ли билет избранным
        // есди да, то удаляем его из избранных (повторное нажатие на сердечко)
        // если нет, добавляем
        if (this.checkTicketIsFavorite(ticket)) {
            this.removeFavoritesItem(ticket);
        } else {
            this.addFavoritesItem(ticket);
        }
        locations.changeFavoriteState(ticket, !this.checkTicketIsFavorite(ticket));
    }

    checkTicketIsFavorite(ticket) {
        // Ф-ция проверки билета на избранность.
        // в параметре приходит ID билета
        // парсим объект избранных билетов из localStorage
        // он записан в виде { id: { инфо о билете }, ... }
        // если есть билет с таким id, возвращаем true, если нет, то false
        this.favoriteTickets = JSON.parse(localStorage.getItem('favoriteTickets')) || {};
        return this.favoriteTickets.hasOwnProperty(ticket);
    }

    addFavoritesItem(ticket) {
        const ticketInfo = locations.getTicketByID(ticket);
        Favorites.addToLocalStorageObject('favoriteTickets', ticket, ticketInfo);
        this.favoriteTickets = JSON.parse(localStorage.getItem('favoriteTickets')) || {};
    }

    removeFavoritesItem(ticket) {
        Favorites.removeFromLocalStorageObject('favoriteTickets', ticket);
        this.favoriteTickets = JSON.parse(localStorage.getItem('favoriteTickets')) || {};
    }

    getFavoritesList() {
        favoritesUI.renderFavoritesList(this.favoriteTickets);
    }

    static addToLocalStorageObject(name, key, value) {
        let obj = localStorage.getItem(name);
        obj = obj ? JSON.parse(obj) : {};

        obj[key] = value;
        localStorage.setItem(name, JSON.stringify(obj));
    }

    static removeFromLocalStorageObject(name, key) {
        // получаем из хранилища объект с билетами
        // если он есть, парсим его, если нет, возвращаем пустой объект
        let obj = localStorage.getItem(name);
        obj = obj ? JSON.parse(obj) : {};
        // удаляем их объекта билет с переданным id
        delete obj[key];
        // перезаписываем хранилище
        localStorage.setItem(name, JSON.stringify(obj));
    }
}

const favorites = new Favorites();

export default favorites;