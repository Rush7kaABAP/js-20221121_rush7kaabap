import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    chartHeight = 50;
    subElements  = {};

    dbKeys = [];

    rerender = () => {
      if (!this.data.length) {
        this.element.classList.add("column-chart_loading");
      } else {
        this.element.classList.remove("column-chart_loading");
      }
    
      this.subElements .body.innerHTML = this.getChartBars( );
      this.subElements .header.innerHTML = this.getChartHeader( );
    }

    constructor( {
      url = "", 
      range = { from : new Date( ), to : new Date( ) }, 

      data = [],
      label = "",
      value = 0,
      link  = "",
      formatHeading = data => data
      } = {} ) {
      
      this.data = data;
      this.label = label;
      this.value = formatHeading(value);
      this.url = url;
      this.range = range;
      this.link = link;
      

      this.render();
      this.initEventListeners();
    };

    async loadServerData(){
        const url = new URL('https://course-js.javascript.ru/' + this.url);
        url.searchParams.set('from', this.range.from.toISOString());
        url.searchParams.set('to', this.range.to.toISOString());

        try {
        const response = await fetch(url);
        const dataHist = await response.json();
        // Загружаем данные в формате json
        //.then(response => response.json())
        //.then(dataHist => {
            this.dbKeys = Object.keys(dataHist);
            this.data   = Object.values(dataHist);
            this.value = this.data.reduce((sum, current) => sum + current, 0);
            this.rerender();
        // });
        } catch(err) {

        }
    }

    update( dateBegin = new Date(), dateEnd =  new Date() ) {
        this.range = { from : dateBegin, to : dateEnd };
        this.loadServerData();
    };

    getChartBars( ){
        
        if ( this.data.length == 0 ){
            return '';
        }

        const maxHt = Math.max(...this.data);
        const barMax = this.chartHeight / maxHt;

        const resBar = this.data.map( ( item, curIndex ) => {
            return  `<div style="--value: ${Math.floor(item * barMax)}" 
              data-tooltip=${this.dbKeys[curIndex]}></div>`;             
        }).join('');
        return resBar;
    }

    getLink( ) {
      if ( this.link != "" ) {
        return `<a class="column-chart__link" href="${this.link}">View all</a>`;
      } else {
        return '';
      }
    }

    getChartHeader( ){
      return this.value;
    }

    getTemplate() {
      return `
      <div class="column-chart ${ this.data.length ? '' : 'column-chart_loading'}" 
          style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink( )}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.getChartHeader( )}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartBars( )}
          </div>
          </div>
        </div>
      </div>
      `;
    }

    render() {
      const element = document.createElement("div");

      element.innerHTML = this.getTemplate();

      this.element = element.firstElementChild;
      this.subElements  = this.getInnerBars( );
    }
    
    getInnerBars( ) {
      const result = {};
      const elems = this.element.querySelectorAll("[data-element]");

      for (const simpleElem of elems) {
        const name = simpleElem.dataset.element;

        result[name] = simpleElem;
      }

      return result;
    }

    initEventListeners() {
      // NOTE: в данном методе добавляем обработчики событий, если они есть
    }
  
    remove() {
      if (this.element) {
        this.element.remove();
      }
    }
  
    destroy() {
      this.remove();
      this.element = null;
      // NOTE: удаляем обработчики событий, если они есть
    }
}
