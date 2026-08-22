/**
 * Touch Tooltips
 * Handles interactive tooltips for touch devices.
 * Shows dotted underlines on elements with tooltips and opens a popup on tap.
 * For links with tooltips, tapping shows the tooltip with a dedicated "Ir a <link text>" action.
 */
(function() {
	'use strict';

	var activePopup = null;
	var activeTarget = null;

	/**
	 * Check if the current device/environment uses touch interaction
	 * @return {boolean}
	 */
	function isTouchDevice() {
		var hasCoarsePointer = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
		var hasTouchSupport = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
		return Boolean(hasCoarsePointer || hasTouchSupport);
	}

	/**
	 * Retrieve tooltip text from an element's attributes
	 * @param {HTMLElement} element
	 * @return {string}
	 */
	function getTooltipText(element) {
		var text = '';
		if (element.hasAttribute('data-touch-tooltip-text')) {
			text = element.getAttribute('data-touch-tooltip-text');
		} else if (element.hasAttribute('title') && element.getAttribute('title').trim()) {
			text = element.getAttribute('title').trim();
		} else if (element.hasAttribute('aria-label') && element.getAttribute('aria-label').trim()) {
			text = element.getAttribute('aria-label').trim();
		} else if (element.tagName.toLowerCase() === 'img' && element.hasAttribute('alt') && element.getAttribute('alt').trim()) {
			text = element.getAttribute('alt').trim();
		} else if (element.hasAttribute('data-tooltip') && element.getAttribute('data-tooltip').trim()) {
			text = element.getAttribute('data-tooltip').trim();
		}
		return text ? text.trim() : '';
	}

	/**
	 * Find the closest ancestor link if any
	 * @param {HTMLElement} element
	 * @return {HTMLAnchorElement|null}
	 */
	function getClosestLink(element) {
		if (element.tagName.toLowerCase() === 'a' && element.hasAttribute('href')) {
			return element;
		}
		return element.closest('a[href]');
	}

	/**
	 * Scan DOM and register elements with tooltips
	 */
	function initTooltipTargets() {
		if (!isTouchDevice()) {
			return;
		}

		document.documentElement.classList.add('touch-tooltips-active');

		var selector = '[title], [aria-label], abbr, [data-tooltip]';
		var candidates = document.querySelectorAll(selector);

		for (var i = 0; i < candidates.length; i++) {
			var el = candidates[i];

			// Skip skip-links, scripts, svg child elements or empty titles
			if (el.classList.contains('screen-reader-text') || el.classList.contains('skip-link')) {
				continue;
			}

			var tooltipText = getTooltipText(el);
			if (!tooltipText) {
				continue;
			}

			// Store tooltip text in data attribute
			el.setAttribute('data-touch-tooltip-text', tooltipText);
			el.setAttribute('data-has-touch-tooltip', 'true');

			// If native title is present, remove to avoid conflicting native mobile tooltips
			if (el.hasAttribute('title')) {
				el.setAttribute('data-original-title', el.getAttribute('title'));
				el.removeAttribute('title');
			}
		}
	}

	/**
	 * Close active tooltip popup
	 */
	function closePopup() {
		if (activePopup && activePopup.parentNode) {
			activePopup.parentNode.removeChild(activePopup);
		}
		if (activeTarget) {
			activeTarget.removeAttribute('data-touch-tooltip-open');
		}
		activePopup = null;
		activeTarget = null;
	}

	/**
	 * Calculate position and display tooltip
	 * @param {HTMLElement} target
	 * @param {string} text
	 * @param {HTMLAnchorElement|null} link
	 */
	function showPopup(target, text, link) {
		closePopup();

		var popup = document.createElement('div');
		popup.className = 'touch-tooltip-popup';
		popup.setAttribute('role', 'tooltip');

		var textContainer = document.createElement('span');
		textContainer.className = 'touch-tooltip-text';
		textContainer.textContent = text;
		popup.appendChild(textContainer);

		if (link) {
			var linkText = link.textContent.trim() || link.getAttribute('href');
			var actionContainer = document.createElement('div');
			actionContainer.className = 'touch-tooltip-action';

			var actionLink = document.createElement('a');
			actionLink.className = 'touch-tooltip-link';
			actionLink.href = link.getAttribute('href');
			if (link.hasAttribute('target')) {
				actionLink.target = link.getAttribute('target');
			}
			if (link.hasAttribute('rel')) {
				actionLink.rel = link.getAttribute('rel');
			}
			actionLink.textContent = 'Ir a ' + linkText;

			actionContainer.appendChild(actionLink);
			popup.appendChild(actionContainer);
		}

		var arrow = document.createElement('div');
		arrow.className = 'touch-tooltip-arrow';
		popup.appendChild(arrow);

		document.body.appendChild(popup);

		var targetRect = target.getBoundingClientRect();
		var popupRect = popup.getBoundingClientRect();
		var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
		var scrollY = window.pageYOffset || document.documentElement.scrollTop;

		var margin = 10;
		var placement = 'top';

		// Determine if popup fits above
		if (targetRect.top - popupRect.height - 12 < margin) {
			placement = 'bottom';
		}

		var top = 0;
		if (placement === 'top') {
			top = targetRect.top + scrollY - popupRect.height - 8;
			popup.classList.add('placement-top');
		} else {
			top = targetRect.bottom + scrollY + 8;
			popup.classList.add('placement-bottom');
		}

		// Calculate horizontal position centered on target
		var targetCenterX = targetRect.left + scrollX + (targetRect.width / 2);
		var left = targetCenterX - (popupRect.width / 2);

		// Clamp within viewport
		var minLeft = scrollX + margin;
		var maxLeft = scrollX + document.documentElement.clientWidth - popupRect.width - margin;

		if (left < minLeft) {
			left = minLeft;
		} else if (left > maxLeft) {
			left = maxLeft;
		}

		popup.style.top = Math.round(top) + 'px';
		popup.style.left = Math.round(left) + 'px';

		// Position the arrow relative to popup
		var arrowLeft = targetCenterX - left;
		var minArrowLeft = 14;
		var maxArrowLeft = popupRect.width - 14;
		if (arrowLeft < minArrowLeft) {
			arrowLeft = minArrowLeft;
		} else if (arrowLeft > maxArrowLeft) {
			arrowLeft = maxArrowLeft;
		}
		arrow.style.left = Math.round(arrowLeft) + 'px';

		target.setAttribute('data-touch-tooltip-open', 'true');
		activePopup = popup;
		activeTarget = target;
	}

	/**
	 * Handle tap/click on targets
	 * @param {Event} event
	 */
	function handleClick(event) {
		if (!isTouchDevice()) {
			return;
		}

		// Ignore clicks inside the active popup
		if (activePopup && activePopup.contains(event.target)) {
			return;
		}

		var target = event.target.closest('[data-has-touch-tooltip]');
		if (!target) {
			// Click outside active popup closes it
			if (activePopup) {
				closePopup();
			}
			return;
		}

		var tooltipText = getTooltipText(target);
		if (!tooltipText) {
			return;
		}

		var link = getClosestLink(target);

		// If clicking on the already active target, toggle close
		if (activeTarget === target) {
			event.preventDefault();
			event.stopPropagation();
			closePopup();
			return;
		}

		// Prevent navigation or default action
		event.preventDefault();
		event.stopPropagation();

		showPopup(target, tooltipText, link);
	}

	/**
	 * Setup event listeners
	 */
	function setup() {
		initTooltipTargets();

		document.addEventListener('click', handleClick, true);
		window.addEventListener('resize', function() {
			closePopup();
			initTooltipTargets();
		});
		window.addEventListener('scroll', function() {
			if (activePopup) {
				closePopup();
			}
		}, { passive: true });
		document.addEventListener('keydown', function(event) {
			if (event.key === 'Escape') {
				closePopup();
			}
		});

		// Observe dynamically added content
		if (window.MutationObserver) {
			var observer = new MutationObserver(function() {
				initTooltipTargets();
			});
			observer.observe(document.body, { childList: true, subtree: true });
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setup);
	} else {
		setup();
	}
})();
