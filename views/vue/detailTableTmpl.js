'use strinct'

module.exports = `
    <div class="detail_main">
      <h1 class="detail_title">{{item.name}}</h1>
      <div class="detail_address">
        <a href="https://maps.google.com/maps/place/{{item.location[1]}}%2C{{item.location[0]}}" target="_blank">
          <span class="icon_address"></span>
          {{item.address}}
        </a>
      </div>
      <hr>
      <div>
        {{item.desc_en}}
      </div>
      <div class="component_table">
        <div class="table_row">
            <div class="table_cell table_cell_left">
                <label>{{labels.detail_table_title_url}}</label>
            </div>
            <div class="table_cell table_cell_right">
              <a :href="item.hotel_url + '?aid=951743'" target="_blank">{{item.hotel_url}}</a>
            </div>
        </div>
        <div class="table_row">
            <div class="table_cell table_cell_left">
                <label>{{labels.detail_table_title_budget}}</label>
            </div>
            <div class="table_cell table_cell_right">
                {{item.minrate}} - {{item.maxrate}} ({{item.currencycode}})
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
                  <label>{{labels.detail_table_title_number_of_rooms}}</label>
              </div>
              <div class="table_cell table_cell_right">
                  {{item.nr_rooms}}
              </div>
          </div>
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label>{{labels.detail_table_title_public_ranking}}</label>
              </div>
              <div class="table_cell table_cell_right">
                  {{item.public_ranking}}
              </div>
          </div>
          <div class="table_row">
              <div class="table_cell table_cell_left">
                  <label>{{labels.detail_table_title_review_score}}</label>
              </div>
              <div class="table_cell table_cell_right">
                  {{item.review_score}}
              </div>
          </div>
        </div>
      </div>
      <div class="detail_readmore detail_readmore_opened" @click="onClickShowReadMore" v-show="showReadMore">
        <span>{{labels.common_hide}}</span>
      </div>
    </div>
`