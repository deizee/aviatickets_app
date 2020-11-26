import currencyUI from './currency';

class FavoritesUI {
    constructor(currency) {
        this.container = document.getElementById('dropdown1');
        this.favotiteDelBtnClass = '.delete-favorite';
        this.getCurrencySymbol = currency.getCurrencySymbol.bind(currency);
    }

    get favoritesContainer() {
        return this.container;
    }

    renderFavoritesList(tickets) {
        this.clearContainer();

        const ticketsArray = Object.values(tickets);
        if (!ticketsArray.length) {
            this.showEmptyMsg();
            return;
        }

        let fragment = '';
        const currency = this.getCurrencySymbol();

        ticketsArray.forEach(ticket => {
            const template = FavoritesUI.favoritesTemplate(ticket, currency);
            fragment += template;
        });

        this.container.insertAdjacentHTML('afterbegin', fragment);
        
    }

    clearContainer() {
        this.container.innerHTML = '';
    }

    showEmptyMsg() {
        const template = FavoritesUI.emptyMsgTemplate();
        this.container.insertAdjacentHTML('afterbegin', template);
    }

    static emptyMsgTemplate() {
        return `
            <div class="tickets-empty-res-msg">
                Список избранных билетов пуст.
            </div>
        `;
    }

    static favoritesTemplate(ticket, currency) {
        return `
        <div class="favorite-item d-flex align-items-start" data-ticket-id="${ticket._id}">
        <img
                src="${ticket.airline_logo}"
                class="favorite-item-airline-img"
        />
        <div class="favorite-item-info d-flex flex-column">
          <div
                  class="favorite-item-destination d-flex align-items-center"
          >
            <div class="d-flex align-items-center mr-auto">
              <span class="favorite-item-city">${ticket.origin_name} </span>
              <i class="medium material-icons">flight_takeoff</i>
            </div>
            <div class="d-flex align-items-center">
              <i class="medium material-icons">flight_land</i>
              <span class="favorite-item-city">${ticket.destination_name}</span>
            </div>
          </div>
          <div class="ticket-time-price d-flex align-items-center">
            <span class="ticket-time-departure">${ticket.departure_at}</span>
            <span class="ticket-price ml-auto">${currency}${ticket.price}</span>
          </div>
          <div class="ticket-additional-info">
            <span class="ticket-transfers">Пересадок: ${ticket.transfers}</span>
            <span class="ticket-flight-number">Номер рейса: ${ticket.flight_number}</span>
          </div>
          <a
                  class="waves-effect waves-light btn-small pink darken-3 delete-favorite ml-auto"
          >Delete</a
          >
        </div>
      </div>
        `;
    }
}

const favoritesUI = new FavoritesUI(currencyUI);

export default favoritesUI;