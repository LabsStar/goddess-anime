$(document).ready(function () {
	"use strict"; // start of use strict

	/*==============================
	Menu
	==============================*/
	$('.header__btn').on('click', function() {
		$(this).toggleClass('header__btn--active');
		$('.header__menu').toggleClass('header__menu--active');
	});

	$('.header__search .close, .header__action--search button').on('click', function() {
		$('.header__search').toggleClass('header__search--active');
	});

	/*==============================
	Multi level dropdowns
	==============================*/
	$('ul.dropdown-menu [data-toggle="dropdown"]').on('click', function(event) {
		event.preventDefault();
		event.stopPropagation();

		$(this).siblings().toggleClass('show');
	});

	$(document).on('click', function (e) {
		$('.dropdown-menu').removeClass('show');
	});

	/*==============================
	Home slider
	==============================*/
	$('.hero').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: false,
		smartSpeed: 600,
		autoHeight: true,
		items: 1,
		responsive: {
			0 : {
				margin: 20,
			},
			576 : {
				margin: 20,
			},
			768 : {
				margin: 30,
			},
			1200 : {
				margin: 30,
				mouseDrag: false,
			},
		}
	});

	/*==============================
	Carousel
	==============================*/
	$('.main__carousel--collections').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: false,
		smartSpeed: 600,
		margin: 20,
		autoHeight: true,
		responsive: {
			0 : {
				items: 2,
			},
			576 : {
				items: 2,
			},
			768 : {
				items: 3,
				margin: 30,
			},
			992 : {
				items: 4,
				margin: 30,
			},
			1200 : {
				items: 5,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});

	$('.main__carousel--live').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: true,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		smartSpeed: 600,
		margin: 20,
		autoHeight: true,
		responsive: {
			0 : {
				items: 1,
			},
			576 : {
				items: 2,
			},
			768 : {
				items: 3,
				margin: 30,
			},
			992 : {
				items: 4,
				margin: 30,
			},
			1200 : {
				items: 4,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});

	$('.main__carousel--explore').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: true,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		smartSpeed: 600,
		margin: 20,
		autoHeight: true,
		responsive: {
			0 : {
				items: 1,
			},
			576 : {
				items: 2,
			},
			768 : {
				items: 3,
				margin: 30,
			},
			992 : {
				items: 4,
				margin: 30,
			},
			1200 : {
				items: 4,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});

	$('.main__carousel--authors').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: true,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		smartSpeed: 600,
		margin: 20,
		autoHeight: true,
		responsive: {
			0 : {
				items: 1,
			},
			576 : {
				items: 2,
			},
			768 : {
				items: 3,
				margin: 30,
			},
			992 : {
				items: 4,
				margin: 30,
			},
			1200 : {
				items: 4,
				margin: 30,
				mouseDrag: false,
				dots: false,
			},
		}
	});

	$('.card__cover--carousel').owlCarousel({
		mouseDrag: true,
		touchDrag: true,
		dots: true,
		loop: true,
		autoplay: true,
		autoplayHoverPause: true,
		autoplayTimeout: 5000,
		autoplaySpeed: 800,
		smartSpeed: 800,
		margin: 20,
		items: 1,
	});

	/*==============================
	Navigation
	==============================*/
	$('.main__nav--prev').on('click', function() {
		var carouselId = $(this).attr('data-nav');
		$(carouselId).trigger('prev.owl.carousel');
	});
	$('.main__nav--next').on('click', function() {
		var carouselId = $(this).attr('data-nav');
		$(carouselId).trigger('next.owl.carousel');
	});

	/*==============================
	Partners
	==============================*/
	$('.partners').owlCarousel({
		mouseDrag: false,
		touchDrag: false,
		dots: false,
		loop: true,
		autoplay: true,
		autoplayTimeout: 5000,
		autoplayHoverPause: true,
		smartSpeed: 600,
		margin: 20,
		responsive : {
			0 : {
				items: 2,
			},
			576 : {
				items: 3,
				margin: 20,
			},
			768 : {
				items: 4,
				margin: 30,
			},
			992 : {
				items: 4,
				margin: 30,
			},
			1200 : {
				items: 6,
				margin: 30,
			},
			1900 : {
				items: 8,
				margin: 30,
			},
		}
	});

	/*==============================
	Modal
	==============================*/
	$('.open-video, .open-map').magnificPopup({
		disableOn: 0,
		fixedContentPos: true,
		type: 'iframe',
		preloader: false,
		removalDelay: 300,
		mainClass: 'mfp-fade',
		callbacks: {
			open: function() {
				if ($(window).width() > 1200) {
					$('.header').css('padding-right', + getScrollBarWidth() + "px");
				}
			},
			close: function() {
				if ($(window).width() > 1200) {
					$('.header').css('padding-right', 0);
				}
			}
		}
	});

	$('.asset__img').magnificPopup({
		fixedContentPos: true,
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: false,
		mainClass: 'my-mfp-zoom-in',
		image: {
			verticalFit: true
		},
		zoom: {
			enabled: true,
			duration: 400
		},
		callbacks: {
			open: function() {
				if ($(window).width() > 1200) {
					$('.header').css('padding-right', + getScrollBarWidth() + "px");
				}
			},
			close: function() {
				if ($(window).width() > 1200) {
					$('.header').css('padding-right', 0);
				}
			}
		}
	});

	$('.open-modal').magnificPopup({
		fixedContentPos: true,
		fixedBgPos: true,
		overflowY: 'auto',
		type: 'inline',
		preloader: false,
		focus: '#username',
		modal: false,
		removalDelay: 300,
		mainClass: 'my-mfp-zoom-in',
		callbacks: {
			open: function() {
				if ($(window).width() > 1200) {
					$('.header').css('padding-right', getScrollBarWidth() + "px");
				}
			},
			close: function() {
				if ($(window).width() > 1200) {
					$('.header').css('padding-right', 0);
				}
			}
		}
	});

	$('.modal__close').on('click', function (e) {
		e.preventDefault();
		$.magnificPopup.close();
	});

	/*==============================
	Get Scrollbar Width
	==============================*/
	function getScrollBarWidth () {
		var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
			widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
		$outer.remove();
		return 100 - widthWithScroll;
	};

	/*==============================
	Select
	==============================*/
	$('.main__select').select2({
		minimumResultsForSearch: Infinity
	});

	/*==============================
	Copy
	==============================*/
	$('.author__code button').on('click', function() {
		var copyText = document.getElementById('author-code');
		copyText.select(); /* Select the text field */
		copyText.setSelectionRange(0, 99999); /* For mobile devices */
		document.execCommand("copy"); /* Copy the text inside the text field */

		/* Alert the copied text */
		$(this).addClass('active');
		setTimeout(function() {
			$('.author__code button').removeClass('active');
		}, 1200);
	});

	/*==============================
	Section bg
	==============================*/
	$('.main__video-bg, .author__cover--bg, .main__user, .collection__cover, .hero__slide').each(function(){
		if ($(this).attr('data-bg')){
			$(this).css({
				'background': 'url(' + $(this).data('bg') + ')',
				'background-position': 'center center',
				'background-repeat': 'no-repeat',
				'background-size': 'cover'
			});
		}
	});

	/*==============================
	Upload file
	==============================*/
	$('.sign__file-upload').on('change', function() {
		var videoLabel  = $(this).attr('data-name');

		if ($(this).val() != '') {
			$(videoLabel).text($(this)[0].files[0].name);
		} else {
			$(videoLabel).text('Upload file');
		}
	});

	/*==============================
	Countdown
	==============================*/
	$('.asset__clock').countdown('2022/12/01', function(event) {
		$(this).html(event.strftime('%D days %H:%M:%S'));
	});

	$('.card__clock--1').countdown('2022/12/01', function(event) {
		$(this).html(event.strftime('%H:%M:%S'));
	});

	$('.card__clock--2').countdown('2023/11/01', function(event) {
		$(this).html(event.strftime('%H:%M:%S'));
	});

	/*==============================
	Scrollbar
	==============================*/
	var Scrollbar = window.Scrollbar;

	if ($('#asset__actions--scroll').length) {
		Scrollbar.init(document.querySelector('#asset__actions--scroll'), {
			damping: 0.1,
			renderByPixels: true,
			alwaysShowTracks: true,
			continuousScrolling: false,
		});
	}

	/*==============================
	Canvas
	==============================*/
	if ($('.home__canvas').length) {
		VANTA.WAVES({
			el: "#canvas",
			mouseControls: true,
			touchControls: true,
			gyroControls: false,
			minHeight: 200.00,
			minWidth: 200.00,
			scale: 2.00,
			scaleMobile: 2.00,
			color: 0x16151a,
			shininess: 3.00,
			waveHeight: 6.00,
			waveSpeed: 1.00,
			zoom: 1.00
		})
	}

	if ($('.hero__canvas').length) {
		VANTA.WAVES({
			el: "#canvas",
			mouseControls: true,
			touchControls: true,
			gyroControls: false,
			minHeight: 200.00,
			minWidth: 200.00,
			scale: 2.00,
			scaleMobile: 2.00,
			color: 0x16151a,
			shininess: 3.00,
			waveHeight: 6.00,
			waveSpeed: 1.00,
			zoom: 1.00
		})
	}

	if ($('.main__canvas').length) {
		VANTA.WAVES({
			el: "#canvas",
			mouseControls: true,
			touchControls: true,
			gyroControls: false,
			minHeight: 200.00,
			minWidth: 200.00,
			scale: 2.00,
			scaleMobile: 2.00,
			color: 0x16151a,
			shininess: 3.00,
			waveHeight: 6.00,
			waveSpeed: 1.00,
			zoom: 1.00
		})
	}

});