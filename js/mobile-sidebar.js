/**
 * Relocate sidebar widget area into main header menu on narrow viewports
 */
(function() {
	function setupMobileSidebar() {
		var sidebar = document.getElementById('secondary');
		var headerMenu = document.getElementById('site-header-menu');
		var content = document.getElementById('content');

		if (!sidebar || !headerMenu || !content) {
			return;
		}

		function handleResize() {
			if (window.innerWidth <= 910) {
				if (sidebar.parentNode !== headerMenu) {
					headerMenu.appendChild(sidebar);
				}
			} else {
				if (sidebar.parentNode !== content) {
					content.appendChild(sidebar);
				}
			}
		}

		handleResize();
		window.addEventListener('resize', handleResize);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupMobileSidebar);
	} else {
		setupMobileSidebar();
	}
})();
