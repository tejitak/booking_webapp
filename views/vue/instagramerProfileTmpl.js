'use strinct'

module.exports = `
  <div class="component__instagramer_profile">
    <a :href="'https://www.instagram.com/' + user.username" target="_blank">
      <span class="icon_profile icon_large"><img :src="user.profile_picture"></span>
    </a>
    <div class="mypage_table">
      <div class="mypage_table_profile">
        <a :href="'https://www.instagram.com/' + user.username" target="_blank"><span class="icon_instagram_white"></span> {{user.username}}</a>
        <div class="mypage_table_description">
          <strong>{{user.full_name}}</strong> <span>{{user.bio}}</span>
        </div>
      </div>
    </div>
    <div class="mypage_head_overlay" :style="{backgroundImage: 'url(' + user.profile_picture + ')'}"></div>
</div>
`