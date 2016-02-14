const ga = window.ga

var gaUtil = {

  _ga: ga,

  sendPage(page, title) {
    if (this._ga) {
      ga('send', 'pageview', {'page': page, 'title': title})
    }
  }
}

export default gaUtil