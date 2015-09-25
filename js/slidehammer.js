(function($){
  $.fn.slidehammer = function(options) {
    return this.each(function() {
      new SlideHammer($(this), options);
    });
  };
}(jQuery));

var SlideHammer = function(elem, options) {
  var _this = this;
  var touch = new Hammer.Manager(elem[0]);
  var hasStructure = false;
  
  this.options = $.extend({
    thresholdPercentage: 0.33,
    thresholdVelocity: 0.5,
    wrapperClass: 'slide-wrapper',
    containerClass: 'slide-container',
    slide: '.slide',
    height: '66.66%',
    enabled: true,
    breakpoint: null,
    onInit: function() {},
    onSlideChange: function() {},
    onPan: function() {}
  }, options);
  
  this.elem = $(elem);
  this.slides = elem.find(this.options.slide);
  this.currentSlide = this.slides.first();
  this.slideWidth = null;
  this.left = 0;
  this.threshold = 100;
  
  this.sizeSlider = function() {
    _this.slideWidth = _this.wrapper.outerWidth();
    _this.threshold = _this.slideWidth * _this.options.thresholdPercentage;
    _this.slides.outerWidth(_this.slideWidth);
    setHeight();
  };
  
  this.moveTo = function(x, time) {
    _this.container.css({
      '-webkit-transition-duration': time + 'ms',
      'transition-duration': time + 'ms',
      '-webkit-transform': 'translateX(' + x + 'px)',
      'transform': 'translateX(' + x + 'px)'
    });
  };
  
  _this.nextSlide = function(velocity) {
    if (_this.currentSlide.index() === _this.slides.length - 1) {
      _this.moveTo(_this.left, 500);
    } else {
      _this.currentSlide = _this.currentSlide.next();
      _this.left = _this.currentSlide.index() * -_this.slideWidth;
      var time = (velocity > _this.options.thresholdVelocity) ? (1 / velocity) * _this.slideWidth : 500;
      _this.moveTo(_this.left, time);
      _this.options.onSlideChange.call(_this);
      if (typeof _this.options.height === 'function') setHeight(time);
    }
  };
  
  _this.prevSlide = function(velocity) {
    if (_this.currentSlide.index() === 0) {
      _this.moveTo(_this.left, 500);
    } else {
      _this.currentSlide = _this.currentSlide.prev();
      _this.left = _this.currentSlide.index() * -_this.slideWidth;
      var time = (velocity < -_this.options.thresholdVelocity) ? (-1 / velocity) * _this.slideWidth : 500;
      _this.moveTo(_this.left, time);
      _this.options.onSlideChange.call(_this);
      if (typeof _this.options.height === 'function') setHeight(time);
    }
  };
  
  this.slideTo = function(index) {
    _this.currentSlide = _this.slides.eq(index);
    _this.left = _this.currentSlide.index() * -_this.slideWidth;
    _this.moveTo(_this.left, 500);
    _this.options.onSlideChange.call(_this);
    if (typeof _this.options.height === 'function') setHeight(500);
  };
  
  this.enableTouch = function() {
    var pan = new Hammer.Pan({
      threshold: 0,
      direction: Hammer.DIRECTION_HORIZONTAL
    });
    touch.add([pan]);

    touch.on('panleft panright panend', function(e) {
      switch(e.type) {
        case 'panleft':
        case 'panright':
          _this.moveTo(_this.left + e.deltaX, 0);
          break;
        case 'panend':
          if (e.deltaX <= -_this.threshold || e.velocityX >= _this.options.thresholdVelocity) {
            _this.nextSlide(e.velocityX);
          } else if (e.deltaX >= _this.threshold || e.velocityX <= -_this.options.thresholdVelocity) {
            _this.prevSlide(e.velocityX);
          } else {
            _this.moveTo(_this.left, 500);
          }
          break;
      }
      
      _this.options.onPan.call(_this, e);
    });
  };
  
  this.disableTouch = function() {
    touch.off('panleft panright panend');
  };
  
  function setHeight(transitionTime) {
    var height;
    
    switch(typeof _this.options.height) {
      case 'number':
        height = _this.options.height;
        break;
      case 'string':
        height = _this.slideWidth * (parseInt(_this.options.height) / 100);
        break;
      case 'function':
        height = _this.options.height.call(_this, _this.currentSlide);
        break;
    }
    
    _this.wrapper.css({
      'height': height,
      'transition-duration': transitionTime ? (transitionTime + 'ms') : '0ms',
      '-webkit-transition-duration': transitionTime ? (transitionTime + 'ms') : '0ms'
    });
  }
  
  function setup() {
    if (_this.options.enabled) {
      buildSlider();
      _this.sizeSlider();
      _this.moveTo(_this.currentSlide.index() * -_this.slideWidth, 0);
    }
  }
  
  function takedown() {
    if (_this.options.enabled) {
      demolishSlider();
    }
  }
  
  function buildSlider() {
    if (!hasStructure) {
      var wrapper = $('<div>', {class: _this.options.wrapperClass});
      var container = $('<div>', {class: _this.options.containerClass});
      wrapper.insertBefore(_this.slides.first()).append(container.append(_this.slides.detach()));
      
      _this.wrapper = elem.find('.' + _this.options.wrapperClass);
      _this.container = elem.find('.' + _this.options.containerClass);
      
      _this.enableTouch();
      
      hasStructure = true;
    }
  }
  
  function demolishSlider() {
    if (hasStructure) {
      _this.wrapper.after(_this.slides.width('').detach()).remove();
      
      _this.disableTouch();
      
      hasStructure = false;
    }
  }
  
  function checkBreakpoint() {
    return (_this.options.breakpoint && $(window).width() <= _this.options.breakpoint) || _this.options.breakpoint === null;
  }
  
  if (checkBreakpoint()) {
    setup();
  }  else {
    takedown();
  }
  
  this.options.onInit.call(this);
  
  $(window).on('resize', function() {
    if (checkBreakpoint()) {
      setup();
    }  else {
      takedown();
    }
  });
};
