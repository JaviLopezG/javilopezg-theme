/**
 * Touch Tooltips
 * Handles interactive tooltips on touch devices for allowed elements:
 * img, li, a, td, and buttons.
 *
 * Provides dotted outlines/underlines and opens an interactive popup on tap.
 * If the element is or contains a link, provides an "Ir a <link text>" action.
 * If the element is or contains a button, provides a "Clickar botón" action.
 */
(function() {
	'use strict';

	var activePopup = null;
	var activeTarget = null;
	var popupOpenedAt = 0;
	var popupScrollY = 0;
	var isExecutingProgrammaticClick = false;

	// Allowed element tag names / selectors based on requirements
	var ALLOWED_SELECTOR = 'img, li, a, td, button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]';

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
		if (!element) {
			return '';
		}

		var text = '';
		if (element.hasAttribute('data-touch-tooltip-text')) {
			text = element.getAttribute('data-touch-tooltip-text');
		} else if (element.hasAttribute('title') && element.getAttribute('title').trim()) {
			text = element.getAttribute('title').trim();
		} else if (element.tagName.toLowerCase() === 'img' && element.hasAttribute('alt') && element.getAttribute('alt').trim()) {
			text = element.getAttribute('alt').trim();
		} else if (element.hasAttribute('aria-label') && element.getAttribute('aria-label').trim()) {
			text = element.getAttribute('aria-label').trim();
		} else if (element.hasAttribute('data-tooltip') && element.getAttribute('data-tooltip').trim()) {
			text = element.getAttribute('data-tooltip').trim();
		}

		return text ? text.trim() : '';
	}

	/**
	 * Determine if element should have border style instead of underline
	 * @param {HTMLElement} element
	 * @return {boolean}
	 */
	function shouldShowBorder(element) {
		var tag = element.tagName.toLowerCase();
		if (tag === 'img' || tag === 'td' || tag === 'button' || tag === 'input') {
			return true;
		}
		if (element.getAttribute('role') === 'button') {
			return true;
		}
		// Also if text content is very short or only contains an image/media
		var text = element.textContent.trim();
		if (text.length === 0 || (element.querySelector('img') && text.length < 3)) {
			return true;
		}
		return false;
	}

	/**
	 * Scan DOM and register allowed elements with tooltips
	 */
	function initTooltipTargets() {
		if (!isTouchDevice()) {
			return;
		}

		document.documentElement.classList.add('touch-tooltips-active');

		var candidates = document.querySelectorAll(ALLOWED_SELECTOR);

		for (var i = 0; i < candidates.length; i++) {
			var el = candidates[i];

			// Skip screen reader utility text
			if (el.classList.contains('screen-reader-text') || el.classList.contains('skip-link')) {
				continue;
			}

			var tooltipText = getTooltipText(el);
			if (!tooltipText) {
				continue;
			}

			el.setAttribute('data-touch-tooltip-text', tooltipText);
			el.setAttribute('data-has-touch-tooltip', 'true');

			if (shouldShowBorder(el)) {
				el.setAttribute('data-touch-tooltip-display', 'border');
			} else {
				el.setAttribute('data-touch-tooltip-display', 'underline');
			}

			// Remove native title to prevent default conflicting browser popups
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
		popupOpenedAt = 0;
	}

	/**
	 * Find associated link in or around target
	 * @param {HTMLElement} target
	 * @param {EventTarget} eventTarget
	 * @return {HTMLAnchorElement|null}
	 */
	function resolveAssociatedLink(target, eventTarget) {
		if (eventTarget && eventTarget.closest) {
			var clickedLink = eventTarget.closest('a[href]');
			if (clickedLink) {
				return clickedLink;
			}
		}
		if (target.tagName.toLowerCase() === 'a' && target.hasAttribute('href')) {
			return target;
		}
		return target.querySelector('a[href]');
	}

	/**
	 * Find associated button in or around target
	 * @param {HTMLElement} target
	 * @param {EventTarget} eventTarget
	 * @return {HTMLElement|null}
	 */
	function resolveAssociatedButton(target, eventTarget) {
		var btnSelector = 'button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]';
		if (eventTarget && eventTarget.closest) {
			var clickedBtn = eventTarget.closest(btnSelector);
			if (clickedBtn && !clickedBtn.classList.contains('touch-tooltip-btn-action')) {
				return clickedBtn;
			}
		}
		if (target.matches(btnSelector)) {
			return target;
		}
		return target.querySelector(btnSelector);
	}

	/**
	 * Display tooltip popup above or below target
	 * @param {HTMLElement} target
	 * @param {string} text
	 * @param {HTMLAnchorElement|null} link
	 * @param {HTMLElement|null} button
	 */
	function showPopup(target, text, link, button) {
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
		} else if (button) {
			var buttonActionContainer = document.createElement('div');
			buttonActionContainer.className = 'touch-tooltip-action';

			var actionBtn = document.createElement('button');
			actionBtn.type = 'button';
			actionBtn.className = 'touch-tooltip-btn-action';
			actionBtn.textContent = 'Clickar botón';

			actionBtn.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				closePopup();
				isExecutingProgrammaticClick = true;
				try {
					button.click();
				} finally {
					isExecutingProgrammaticClick = false;
				}
			});

			buttonActionContainer.appendChild(actionBtn);
			popup.appendChild(buttonActionContainer);
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

		var targetCenterX = targetRect.left + scrollX + (targetRect.width / 2);
		var left = targetCenterX - (popupRect.width / 2);

		var minLeft = scrollX + margin;
		var maxLeft = scrollX + document.documentElement.clientWidth - popupRect.width - margin;

		if (left < minLeft) {
			left = minLeft;
		} else if (left > maxLeft) {
			left = maxLeft;
		}

		popup.style.top = Math.round(top) + 'px';
		popup.style.left = Math.round(left) + 'px';

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
		popupOpenedAt = Date.now();
		popupScrollY = scrollY;
	}

	/**
	 * Handle tap/click on targets
	 * @param {Event} event
	 */
	function handleClick(event) {
		if (isExecutingProgrammaticClick) {
			return;
		}

		if (!isTouchDevice()) {
			return;
		}

		// Allow interaction with active popup contents (e.g. action links/buttons)
		if (activePopup && activePopup.contains(event.target)) {
			return;
		}

		// Find closest tooltip target
		var target = event.target.closest('[data-has-touch-tooltip]');

		// If no tooltip target was clicked, close active popup
		if (!target) {
			if (activePopup) {
				closePopup();
			}
			return;
		}

		var tooltipText = getTooltipText(target);
		if (!tooltipText) {
			if (activePopup) {
				closePopup();
			}
			return;
		}

		// If clicking the same already-open target, toggle close
		if (activeTarget === target) {
			event.preventDefault();
			event.stopPropagation();
			closePopup();
			return;
		}

		// If clicking a different target, intercept and open new popup
		event.preventDefault();
		event.stopPropagation();

		var link = resolveAssociatedLink(target, event.target);
		var button = null;
		if (!link) {
			button = resolveAssociatedButton(target, event.target);
		}

		showPopup(target, tooltipText, link, button);
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
			if (!activePopup) {
				return;
			}
			// Only close if user scrolled intentionally (more than 20px)
			// and not immediately during popup insertion tap
			if (Date.now() - popupOpenedAt < 200) {
				return;
			}
			var currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
			if (Math.abs(currentScrollY - popupScrollY) > 20) {
				closePopup();
			}
		}, { passive: true });

		document.addEventListener('keydown', function(event) {
			if (event.key === 'Escape') {
				closePopup();
			}
		});

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
