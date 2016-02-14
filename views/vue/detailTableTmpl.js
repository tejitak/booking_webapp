'use strinct'

module.exports = `
    <div class="detail_main">
      <h1 class="detail_title">{{item['name_ja']}} / {{item['name_en']}}</h1>
      <div class="detail_address">
        <a href="https://maps.google.com/maps/place/{{item.geo.latitude}}%2C{{item.geo.longitude}}" target="_blank">
          <span class="icon_address"></span>
          {{item.location.displayed_address}}
        </a>
      </div>
      <div class="component_table">
        <div class="table_row">
            <div class="table_cell table_cell_left">
                <label>{{labels.detail_table_title_phone}}</label>
            </div>
            <div class="table_cell table_cell_right">
                <a class="tel" href="tel:{{item.contact.phone}}">{{item.contact.phone}}</a>
            </div>
        </div>
        <div class="table_row">
            <div class="table_cell table_cell_left">
                <label>{{labels.detail_table_title_budget}}</label>
            </div>
            <div class="table_cell table_cell_right">
                {{{item.displayed_budgets | displayBudget}}}
            </div>
        </div>
        <div class="table_row">
            <div class="table_cell table_cell_left" style="border-bottom: none;">
                <label>{{labels.detail_table_title_open_hours}}</label>
            </div>
            <div class="table_cell table_cell_right" style="border-bottom: none;">
              <div>
                {{labels.common_today}} <span class="detail_now_open">{{{item.open_now | displayNowOpen}}}</span>
              </div>
              <div>
                {{item.displayed_open_hours | displayTodayOpenHours}}
              </div>
            </div>
        </div>
      </div>
      <div class="detail_readmore detail_readmore_closed" @click="onClickShowReadMore" :class="{detail_readmore_opened: showReadMore}" v-show="!showReadMore">
        <span>{{labels.common_readmore}}</span>
      </div>
      <div class="detail_readmore_content" v-show="showReadMore">
        <div class="component_table">
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label></label>
              </div>
              <div class="table_cell table_cell_right">
                {{{item.displayed_open_hours | displayOpenHours}}}
              </div>
          </div>
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label>{{labels.detail_table_title_shop_holidays}}</label>
              </div>
              <div class="table_cell table_cell_right">
                  {{item.displayed_shop_holidays}}
              </div>
          </div>
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label>{{labels.detail_table_title_cards}}</label>
              </div>
              <div class="table_cell table_cell_right">
                  {{item.displayed_cards}}
              </div>
          </div>
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label>{{labels.detail_table_title_smoking_availability}}</label>
              </div>
              <div class="table_cell table_cell_right">
                  {{item.displayed_smoking}}
              </div>
          </div>
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label>{{labels.detail_table_title_number_of_seats}}</label>
              </div>
              <div class="table_cell table_cell_right">
                  {{item.displayed_number_of_seats}}
              </div>
          </div>
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label>{{labels.detail_table_title_tags}}</label>
              </div>
              <div class="table_cell table_cell_right">
                <a v-for="tag in item.tags" href="{{tag | displayTagLink}}">
                  #{{tag}}
                </a>&nbsp;
              </div>
          </div>
        </div>
      </div>
      <div class="detail_readmore detail_readmore_opened" @click="onClickShowReadMore" v-show="showReadMore">
        <span>{{labels.common_hide}}</span>
      </div>
    </div>
`