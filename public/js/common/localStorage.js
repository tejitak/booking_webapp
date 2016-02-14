/**
 * localStorage
 */
export default {

  cache: {},

  adapter: {
    set(what, value) {
      var result = null
      try {
        result = localStorage.setItem(what, value)
      } catch (e) {
        // maybe private browsing mode
        console.log(e)
      }
      return result
    },

    get(what) {
      var result = null
      try {
        result = localStorage.getItem(what)
      } catch (e) {
        // maybe private browsing mode
        console.log(e)
      }
      return result
    },

    remove(what) {
      var result = null
      try {
        result = localStorage.removeItem(what)
      } catch (e) {
        // maybe private browsing mode
        console.log(e)
      }
      return result
    }
  },

  set(name, elem) {
    this.cache[name] = elem
    this.adapter.set(name, JSON.stringify(elem))
  },

  get(name) {
    if (this.cache[name]) {
      return this.cache[name]
    }
    var saved = this.adapter.get(name)
    return saved ? JSON.parse(saved) : null
  },

  remove(name) {
    this.cache[name] = null
    this.adapter.remove(name)
  }
}