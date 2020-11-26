// в этом файле формируем store (приводим данные из запроса к нужному нам формату)
import api from '../services/apiService';
import { formatDate } from '../helpers/date';
import favorites from '../store/favStore';

class Locations {
    constructor(api, helpers) {
        this.api = api;
        this.countries = null;
        this.cities = null;
        this.shortCities = {};
        this.lastSearch = {};
        this.airlines = {};
        this.formatDate = helpers.formatDate;
    }
    async init() {
        const response = await Promise.all([  // делаем все запросы на сервер
            this.api.countries(),
            this.api.cities(),
            this.api.airlines(),
        ]);

        const [countries, cities, airlines] = response; // деструктурируем ответ от сервера
        this.countries = this.serializeCountries(countries);
        this.cities = this.serializeCities(cities);
        this.shortCities = this.createShortCities(this.cities);
        this.airlines = this.serializeAirlines(airlines);

        return response;
    }

    getCityCodeByKey(key) {
        const city = Object.values(this.cities).find(item => item.full_name === key);
        return city.code;
    }

    getCityNameByCode(code) {
        return this.cities[code].name;
    }

    getAirlineNameByCode(code) {
        return this.airlines[code] ? this.airlines[code].name : '';
    }

    getAirlineLogoByCode(code) {
        return this.airlines[code] ? this.airlines[code].logo : '';
    }

    getTicketByID(id) {
        const ticket = Object.values(this.lastSearch).find((item) => item._id === id);
        return ticket;
    }

    createShortCities(cities) {   
        // создаем список для автокомплита
        return Object.entries(cities).reduce((acc, [, city]) => {   
            acc[city.full_name] = null;
            return acc;
        }, {});
    }

    serializeAirlines(airlines) {
        return airlines.reduce((acc, item) => {
            item.logo = `http://pics.avs.io/200/200/${item.code}.png`; // ищем логотип авиакомпании по ее коду
            item.name = item.name || item.name_translations.en;        // если название есть, то выводим это название, если нет, то название в английской вариации
            acc[item.code] = item; // формируем объект объектов; ключ - это код авиакомпании, значение - объект инфо о ней
            return acc;
        }, {});
    }

    serializeCountries(countries) {
        // Нам нужен формат { 'Country code': {...} }
        return countries.reduce((acc, country) => {
            acc[country.code] = country;
            return acc;
        }, {});
    }

    serializeCities(cities) {
        // Нам нужен формат { 'City name, Country name': {...} }
        return cities.reduce((acc, city) => {
            const country_name = this.countries[city.country_code].name;
            city.name = city.name || city.name_translations.en;
            const full_name = `${city.name}, ${country_name}`;
            acc[city.code] = {
                ...city,
                country_name,
                full_name,
            };
            return acc;
        }, {})
    }

    async fetchTickets(params) {
        const response = await this.api.prices(params);
        this.lastSearch = this.serializeTickets(response.data);     
        // в lastSearch мы записываем массив объектов найденных билетов, преобразованных под нужный нам формат с пом. функции serializeTickets
        // в response.data находится объект объектов
    }

    createTicketId(ticket) {
        return `id_${ticket.airline}${ticket.flight_number}${ticket.origin}${ticket.destination}${this.formatDate(ticket.departure_at, 'ddmmyyyyhhmm')}${this.formatDate(ticket.return_at, 'ddmmyyyyhhmm')}`
    }

    changeFavoriteState(ticketID, state = false) {
        const ticket = Object.values(this.lastSearch).find((item) => item._id === ticketID);
        ticket.isFavorite = state;
        return state;
    }

    getFavoriteState(ticket) {
        const ticketID = this.createTicketId(ticket);
        return favorites.checkTicketIsFavorite(ticketID);
    }

    serializeTickets(tickets) {
        return Object.values(tickets).map((ticket) => {
            return {
                ...ticket,
                _id: this.createTicketId(ticket),
                origin_name: this.getCityNameByCode(ticket.origin),
                destination_name: this.getCityNameByCode(ticket.destination),
                airline_logo: this.getAirlineLogoByCode(ticket.airline),
                airline_name: this.getAirlineNameByCode(ticket.airline),
                departure_at: this.formatDate(ticket.departure_at, 'dd MMM yyyy HH:mm'),
                return_at: this.formatDate(ticket.return_at, 'dd MMM yyyy HH:mm'),
                isFavorite: this.getFavoriteState(ticket),
            };
        });
    }
}

const locations = new Locations(api, { formatDate });

export default locations;

// { 'City, Country': null } -- в таком формате пртинимает данные автокомплит
// [{ city }, { country }] -- мы получаем ответ от сервера вот в таком формате
// { 'City': {...} } => cities[code]  -- для удобства преобразуем в такой формат