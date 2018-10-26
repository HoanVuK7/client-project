// JavaScript Document
var sbwev;
(function($) {
	
	sbwev = {
		init: function() {
			sbwev.remove_url_fragment();
		},
		remove_url_fragment: function() {
			if(!sbwev.msieversion()) {
				var current_url = window.location.href;
				current_url = current_url.replace('?registered=true', '');
				current_url = current_url.replace('?verify=false', '');
				current_url = current_url.replace('?verify=true', '');
				current_url = current_url.replace('?resend=true', '');
				window.history.replaceState('', '', current_url);
			}
		},
		msieversion: function() {
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf("MSIE ");

			if (msie > 0)      // If Internet Explorer, return version number
				return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));

			return false;
		}

	};
	sbwev.init();
	
})(jQuery);