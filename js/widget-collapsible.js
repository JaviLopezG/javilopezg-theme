/**
 * Collapsible Widgets
 * For Archives and Categories widgets with many items, display only the first 3
 * and last 3 items, with an ellipsis and a "Ver todos" expand action in between.
 */
(function() {
	'use strict';

	var WIDGET_SELECTOR = '.widget_archive, .widget_categories, .wp-block-archives, .wp-block-categories';

	/**
	 * Process a single widget element
	 * @param {HTMLElement} widget
	 */
	function setupCollapsibleWidget(widget) {
		if (widget.getAttribute('data-collapsible-initialized') === 'true') {
			return;
		}

		var list = widget.querySelector('ul');
		if (!list) {
			return;
		}

		// Find direct child li elements
		var items = [];
		for (var i = 0; i < list.children.length; i++) {
			if (list.children[i].tagName.toLowerCase() === 'li') {
				items.push(list.children[i]);
			}
		}

		// Only collapse if there are more than 6 items
		if (items.length <= 6) {
			return;
		}

		widget.setAttribute('data-collapsible-initialized', 'true');

		var hiddenItems = [];
		for (var j = 3; j < items.length - 3; j++) {
			var item = items[j];
			item.classList.add('widget-item-hidden');
			hiddenItems.push(item);
		}

		// Create the ellipsis and "Ver todos" expand item
		var moreItem = document.createElement('li');
		moreItem.className = 'widget-more-item';

		var ellipsis = document.createElement('span');
		ellipsis.className = 'widget-ellipsis';
		ellipsis.textContent = '…';

		var expandBtn = document.createElement('button');
		expandBtn.type = 'button';
		expandBtn.className = 'widget-show-all-btn';
		expandBtn.textContent = 'Ver todos';

		expandBtn.addEventListener('click', function(e) {
			e.preventDefault();
			for (var k = 0; k < hiddenItems.length; k++) {
				hiddenItems[k].classList.remove('widget-item-hidden');
			}
			if (moreItem.parentNode) {
				moreItem.parentNode.removeChild(moreItem);
			}
		});

		moreItem.appendChild(ellipsis);
		moreItem.appendChild(expandBtn);

		// Insert before the 4th item (first hidden item)
		list.insertBefore(moreItem, items[3]);
	}

	/**
	 * Initialize all matching widgets on page
	 */
	function init() {
		var widgets = document.querySelectorAll(WIDGET_SELECTOR);
		for (var i = 0; i < widgets.length; i++) {
			setupCollapsibleWidget(widgets[i]);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	if (window.MutationObserver) {
		var observer = new MutationObserver(function() {
			init();
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}
})();
