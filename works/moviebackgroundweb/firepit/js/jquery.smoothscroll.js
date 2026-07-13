/* -----------------------------------------

 jquery.smoothscroll.js
 
------------------------------------------*/
(function(jQuery) {
	jQuery.fn.smoothScroll = function() {
		return this.each(function() {
			jQuery(this).click(function() {
				if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') &&
					location.hostname == this.hostname) {
					var $target = jQuery(this.hash);
					$target = $target.length && $target || $('[name="' + this.hash.slice(1) +'"]');
					if ($target.length) {
						var targetOffset = $target.offset().top;
						jQuery('html,body').animate({ scrollTop: targetOffset }, 500, 'swing');
						return false;
					}
				}
			});
		});
	};
})(jQuery);

jQuery(function(){
	jQuery('a[href^="#"]').smoothScroll();
});