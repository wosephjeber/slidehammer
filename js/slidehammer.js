(function($){
  $.fn.slidehammer = function(options) {
    return this.each(function() {
      new SlideHammer($(this), options);
    });
  };
}(jQuery));

var SlideHammer = function(elem, options) {
  var _this = this;
  
  this.options = $.extend({
    thresholdPercentage: 0.33,
    thresholdVelocity: 0.5,
    onInit: function() {},
    onSlideChange: function() {},
    onPan: function() {}
  }, options);
  
  this.elem = $(elem);
  this.wrapper = elem.find('.slide-wrapper');
  this.container = elem.find('.slide-container');
  this.slides = elem.find('.slide');
  this.currentSlide = this.slides.first();
  this.slideWidth = null;
  this.left = 0;
  this.threshold = 100;
  
  this.sizeSlides = function() {
    _this.slideWidth = _this.wrapper.width();
    _this.threshold = _this.slideWidth * _this.options.thresholdPercentage;
    _this.slides.each(function() {
      $(this).width(_this.slideWidth);
    });
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
    }
  };
  
  this.slideTo = function(index) {
    _this.currentSlide = _this.slides.eq(index);
    _this.left = _this.currentSlide.index() * -_this.slideWidth;
    _this.moveTo(_this.left, 500);
    _this.options.onSlideChange.call(_this);
  };
  
  this.initTouch = function() {
    var touch = new Hammer.Manager(this.elem[0]);
  
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
  
  this.sizeSlides();
  this.initTouch();
  
  this.options.onInit.call(this);
  
  $(window).on('resize', function() {
    _this.sizeSlides();
    _this.moveTo(_this.currentSlide.index() * -_this.slideWidth, 0);
  });
};
