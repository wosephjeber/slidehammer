(function($){
  $.fn.slidehammer = function(options) {
    return this.each(function() {
      new SlideHammer($(this), options);
    });
  };
  
  var SlideHammer = function(elem, options) {
    var _this = this;
    
    this.elem = $(elem);
  };
}(jQuery));
