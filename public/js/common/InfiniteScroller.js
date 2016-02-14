/**
 * Infinite Scroll Mixin
 */
import $ from 'npm-zepto'
import util from './util'

export default class InfiniteScroller {

  constructor(options) {
    var opt = options || {}
    this.$win = $(window)
    this.$container = options.selector ? $(options.selector) : $(document)
    this.callback = options.callback || function() {}
    this._winH = 0
    this.autoLoadingBottomHeight = 40
  }

  enable() {
    this.disable()
    this._attachScrollEvent()
  }

  disable() {
    this._removeScrollEvent()
  }

  getLastScrollTop() {
    return this._sct
  }

  _scroll() {
    this._sct = this.$win.scrollTop()
    // temp workaround for slideout opened call
    var winH = this.$win.height()
    var contentH = this.$container.height()
    if (winH === contentH) {
      return
    }
    if (this._sct + winH >= contentH - this.autoLoadingBottomHeight) {
      this.callback()
    }
  }

  _attachScrollEvent() {
    this.$win.on('scroll.paging', util.throttle(() => this._scroll(), 100))
  }

  _removeScrollEvent() {
    this.$win.off('scroll.paging')
  }

}