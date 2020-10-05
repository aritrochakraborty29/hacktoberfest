var MINIMALDOG = MINIMALDOG || {};

(function($){

	// USE STRICT
	"use strict";

	var $window = $(window);
	var $document = $(document);
	var $goToTopEl = $('.js-go-top-el');
	var $overlayBg = $('.js-overlay-bg');
    $(".single-body").fitVids();
    
	MINIMALDOG.header = {

		init: function(){
            MINIMALDOG.header.pagiButton();
			MINIMALDOG.header.ajaxSearch();
            MINIMALDOG.header.ajaxMegamenu();
			MINIMALDOG.header.loginForm();
			MINIMALDOG.header.offCanvasMenu();
			MINIMALDOG.header.priorityNavInit();
			MINIMALDOG.header.searchToggle();
			MINIMALDOG.header.smartAffix.init({
	            fixedHeader: '.js-sticky-header',
	            headerPlaceHolder: '.js-sticky-header-holder',
	        });
		},

		/* ============================================================================
	     * Fix sticky navbar padding when open modal
	     * ==========================================================================*/
		stickyNavbarPadding: function() {
            var oldSSB = $.fn.modal.Constructor.prototype.setScrollbar;
            var $stickyHeader = $('.sticky-header .navigation-bar');

            $.fn.modal.Constructor.prototype.setScrollbar = function () 
            {
                oldSSB.apply(this);
                if(this.bodyIsOverflowing && this.scrollbarWidth) 
                {
                    $stickyHeader.css('padding-right', this.scrollbarWidth);
                }       
            }

            var oldRSB = $.fn.modal.Constructor.prototype.resetScrollbar;
            $.fn.modal.Constructor.prototype.resetScrollbar = function () 
            {
                oldRSB.apply(this);
                $stickyHeader.css('padding-right', '');
            }
		},

		/* ============================================================================
	     * Header dropdown search
	     * ==========================================================================*/
		searchToggle: function() {
			var $headerSearchDropdown = $('#header-search-dropdown');
			var $searchDropdownToggle = $('.js-search-dropdown-toggle');
			var $mobileHeader = $('#atbs-mobile-header');
			var $stickyHeaderNav = $('#atbs-sticky-header').find('.navigation-bar__inner');
			var $staticHeaderNav = $('.site-header').find('.navigation-bar__inner');
			var $headerSearchDropdownInput = $headerSearchDropdown.find('.search-form__input');

			$headerSearchDropdown.on('click', function(e) {
				e.stopPropagation();
			});

			$searchDropdownToggle.on('click', function(e) {
				e.stopPropagation();
				var $toggleBtn = $(this);
				var position = '';
				

				if ($toggleBtn.hasClass('mobile-header-btn')) {
					position = 'mobile';
				} else if ($toggleBtn.parents('.sticky-header').length) {
					position = 'sticky';
				} else {
					position = 'navbar';
				}

				if ($headerSearchDropdown.hasClass('is-in-' + position) || !$headerSearchDropdown.hasClass('is-active')) {
					$headerSearchDropdown.toggleClass('is-active');
				}
console.log(position);
				switch(position) {
					case 'mobile':
						if (!$headerSearchDropdown.hasClass('is-in-mobile')) {
							$headerSearchDropdown.addClass('is-in-mobile');
							$headerSearchDropdown.removeClass('is-in-sticky');
							$headerSearchDropdown.removeClass('is-in-navbar');
							$headerSearchDropdown.appendTo($mobileHeader);
						}
						break;

					case 'sticky':
						if (!$headerSearchDropdown.hasClass('is-in-sticky')) {
							$headerSearchDropdown.addClass('is-in-sticky');
							$headerSearchDropdown.removeClass('is-in-mobile');
							$headerSearchDropdown.removeClass('is-in-navbar');
							$headerSearchDropdown.insertAfter($stickyHeaderNav);
						}
						break;

					default:
						if (!$headerSearchDropdown.hasClass('is-in-navbar')) {
							$headerSearchDropdown.addClass('is-in-navbar');
							$headerSearchDropdown.removeClass('is-in-sticky');
							$headerSearchDropdown.removeClass('is-in-mobile');
							$headerSearchDropdown.insertAfter($staticHeaderNav);
						}
				}
				
				if ($headerSearchDropdown.hasClass('is-active')) {
					setTimeout(function () {
					    $headerSearchDropdownInput.focus();
					}, 200);
				}
			});

			$document.on('click', function() {
                $headerSearchDropdown.removeClass('is-active');
            });

            $window.on('stickyHeaderHidden', function(){
            	if ($headerSearchDropdown.hasClass('is-in-sticky')) {
            		$headerSearchDropdown.removeClass('is-active');
            	}
            });
		},
        /* ============================================================================
	     * AJAX search
	     * ==========================================================================*/
		ajaxSearch: function() {
			var $results = null;
			var $ajaxSearch = $('.js-ajax-search');
			var ajaxStatus = '';
			var noResultText = '<span class="noresult-text">There is no result.</span>';
			var errorText = '<span class="error-text">There was some error.</span>';

			$ajaxSearch.each(function() {
				var $this = $(this);
				var $searchForm = $this.find('.search-form__input');
				var $resultsContainer = $this.find('.search-results');
				var $resultsInner = $this.find('.search-results__inner');
				var searchTerm = '';
				var lastSearchTerm = '';

				$searchForm.on('input', $.debounce(800, function() {
					searchTerm = $searchForm.val();

					if (searchTerm.length > 0) {
						$resultsContainer.addClass('is-active');

						if ((searchTerm != lastSearchTerm) || (ajaxStatus === 'failed' )) {
							$resultsContainer.removeClass('is-error').addClass('is-loading');
							lastSearchTerm = searchTerm;
							ajaxLoad(searchTerm, $resultsContainer, $resultsInner);
						}
					} else {
						$resultsContainer.removeClass('is-active');
					}
				}));
			});

			function ajaxLoad(searchTerm, $resultsContainer, $resultsInner) {
                var tnmAjaxSecurity = ajax_buff['tnm_security']['tnm_security_code']['content'];	 
				var	ajaxCall = $.ajax({
	                    url: ajaxurl,
	                    type: 'post',
	                    dataType: 'html',
	                    data: {
                            action: 'tnm_ajax_search',
	                        searchTerm: searchTerm,
                            securityCheck: tnmAjaxSecurity,
	                    },
                	});

                ajaxCall.done(function(respond) {
                    $results = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if (!$results.length) {
                    	$results = noResultText;
                    }
					$resultsInner.html($results).css('opacity', 0).animate({opacity: 1}, 500);	
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                    $resultsContainer.addClass('is-error');
                    $results = errorText;
                    $resultsInner.html($results).css('opacity', 0).animate({opacity: 1}, 500);	
                });

                ajaxCall.always(function() {
                    $resultsContainer.removeClass('is-loading');
                });
			}
		},

        /* ============================================================================
	     * Megamenu Ajax
	     * ==========================================================================*/
		ajaxMegamenu: function() {
            var $results = null;
            var $subCatItem = $('.atbs-mega-menu ul.sub-categories > li');
			$subCatItem.on('click',function(e) {
			     e.preventDefault();
                var $this = $(this);
                if($(this).hasClass('active')) {
                    return;
                }
                
                $(this).parents('.sub-categories').find('li').removeClass('active');
                
                var $container = $this.parents('.atbs-mega-menu__inner').find('.posts-list');
                var $thisCatSplit = $this.attr('class').split('-');
                var thisCatID = $thisCatSplit[$thisCatSplit.length - 1];
                var hasBigPost = 0;
                
                $container.append('<div class="bk-preload-wrapper"></div>');
                $container.find('article').addClass('bk-preload-blur');
            
                if($container.find('li:first-child').hasClass('big-post')) {
                    hasBigPost = 1;
                }else {
                    hasBigPost = 0;
                }
                
                $this.addClass('active');
                
                var $htmlRestore = ajax_buff['megamenu'][thisCatID]['html'];
                
                //console.log($htmlRestore);
                if($htmlRestore == '') {
                    ajaxLoad(thisCatID, hasBigPost, $container);
                }else {
                    ajaxRestore($container, thisCatID, $htmlRestore);
                }
            });
            function ajaxLoad(thisCatID, hasBigPost, $container) {
                var tnmAjaxSecurity = ajax_buff['tnm_security']['tnm_security_code']['content'];	 
                var ajaxCall = {
                    action: 'tnm_ajax_megamenu',
                    thisCatID: thisCatID,
                    hasBigPost : hasBigPost,
                    securityCheck: tnmAjaxSecurity
                };
                
                $.post(ajaxurl, ajaxCall, function (response) {
                    $results = $.parseJSON(response);
                    //Save HTML
                    ajax_buff['megamenu'][thisCatID]['html'] = $results;
                    // Append Result
                    $container.html($results).css('opacity', 0).animate({opacity: 1}, 500);	
                    $container.find('.bk-preload-wrapper').remove();
                    $container.find('article').removeClass('bk-preload-blur');
                });    
            }
            function ajaxRestore($container, thisCatID, $htmlRestore) {
                // Append Result
                $container.html($htmlRestore).css('opacity', 0).animate({opacity: 1}, 500);	
                $container.find('.bk-preload-wrapper').remove();
                $container.find('article').removeClass('bk-preload-blur'); 
            }
		},
        
        /* ============================================================================
	     * Ajax Button
	     * ==========================================================================*/
        pagiButton: function() {
            var $dotNextTemplate = '<span class="atbs-pagination__item atbs-pagination__dots atbs-pagination__dots-next">&hellip;</span>';
            var $dotPrevTemplate = '<span class="atbs-pagination__item atbs-pagination__dots atbs-pagination__dots-prev">&hellip;</span>';
            var $buttonTemplate = '<a class="atbs-pagination__item" href="#">##PAGENUMBER##</a>';
            var $dotIndex_next;
            var $dotIndex_prev;
            var $pagiAction;
            var $results = null;
            
            $('body').on('click', '.atbs-module-pagination .atbs-pagination__links > a', function(e) {
                e.preventDefault();
                var $this = $(this);
                if(($this.hasClass('disable-click')) || $this.hasClass('atbs-pagination__item-current')) 
                    return;
                
                var $pagiChildren = $this.parent().children();
                var $totalPageVal = parseInt($($pagiChildren[$pagiChildren.length - 2]).text());
                var $lastIndex = $this.parent().find('.atbs-pagination__item-current').index();
                var $lastPageVal = parseInt($($pagiChildren[$lastIndex]).text());
                
                var $nextButton = $this.parent().find('.atbs-pagination__item-next');
                var $prevButton = $this.parent().find('.atbs-pagination__item-prev');
                
                // Save the last active button 
                var $lastActiveButton = $this.parent().find('.atbs-pagination__item-current');
                // Save the last page
                var $lastActivePage = $this.parent().find('.atbs-pagination__item-current');
                
                // Add/Remove current class
                $this.siblings().removeClass('atbs-pagination__item-current');
                if($this.hasClass('atbs-pagination__item-prev')) {
                    $lastActivePage.prev().addClass('atbs-pagination__item-current');
                }else if($this.hasClass('atbs-pagination__item-next')) {
                    $lastActivePage.next().addClass('atbs-pagination__item-current');
                }else {
                    $this.addClass('atbs-pagination__item-current');
                }
                
                var $currentActiveButton = $this.parent().find('.atbs-pagination__item-current');
                var $currentIndex = $this.parent().find('.atbs-pagination__item-current').index();
                var $currentPageVal = parseInt($($pagiChildren[$currentIndex]).text());

                if($currentPageVal == 1) {
                    $($prevButton).addClass('disable-click');
                    $($nextButton).removeClass('disable-click');
                }else if($currentPageVal == $totalPageVal) {
                    $($prevButton).removeClass('disable-click');
                    $($nextButton).addClass('disable-click');
                }else {
                    $($prevButton).removeClass('disable-click');
                    $($nextButton).removeClass('disable-click');
                }
                
                if($totalPageVal > 5) {
                    
                    if($this.parent().find('.atbs-pagination__dots').hasClass('atbs-pagination__dots-next')) {
                        $dotIndex_next = $this.parent().find('.atbs-pagination__dots-next').index();
                    }else {
                        $dotIndex_next = -1;
                    }
                    if($this.parent().find('.atbs-pagination__dots').hasClass('atbs-pagination__dots-prev')) {
                        $dotIndex_prev = $this.parent().find('.atbs-pagination__dots-prev').index();
                    }else {
                        $dotIndex_prev = -1;
                    }
                    
                    if(isNaN($currentPageVal)) {
                        if($this.hasClass('atbs-pagination__item-prev')) {
                            $currentPageVal = parseInt($($pagiChildren[$currentIndex + 1]).text()) - 1;
                        }else if($this.hasClass('atbs-pagination__item-next')) {
                            $currentPageVal = parseInt($($pagiChildren[$currentIndex - 1]).text()) + 1;
                        }else {
                            return;
                        }
                        
                    }
                    
                    if($currentPageVal > $lastPageVal) {
                        $pagiAction = 'up';
                    }else {
                        $pagiAction = 'down';
                    }
                    
                    if(($pagiAction == 'up')) {
                        if(($currentIndex == ($dotIndex_next - 1)) || ($currentIndex == $dotIndex_next) || ($currentPageVal == $totalPageVal)) {
                            
                            $this.parent().find('.atbs-pagination__dots').remove();                 //Remove ALL Dot Signal
                            
                            if($currentIndex == $dotIndex_next) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal))).insertAfter($lastActiveButton);
                                $lastActiveButton.next().addClass('atbs-pagination__item-current');
                                $currentActiveButton = $this.parent().find('.atbs-pagination__item-current');
                            }
                            
                            while(parseInt(($this.parent().find('a:nth-child(3)')).text()) != $currentPageVal) {
                                $this.parent().find('a:nth-child(3)').remove();       //Remove 1 button before
                            }
                            
                            $($dotPrevTemplate).insertBefore($currentActiveButton);                 //Insert Dot Next             
                            
                            if(($currentPageVal < ($totalPageVal - 3))) {
                                $($dotNextTemplate).insertAfter($currentActiveButton);              //Insert Dot Prev
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 2))).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            }else if(($currentPageVal < ($totalPageVal - 2))) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 2))).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            }
                            else if(($currentPageVal < ($totalPageVal - 1))) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            }
                            if($currentPageVal == $totalPageVal) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 3))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }else if($currentPageVal == ($totalPageVal - 1)) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }else if($currentPageVal == ($totalPageVal - 2 )) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                        }
                    }else if($pagiAction == 'down') {
                        if(($currentIndex == ($dotIndex_prev + 1)) || ($currentIndex == $dotIndex_prev) || (($currentPageVal == 1) && ($currentIndex < $dotIndex_prev))) {
                            
                            $this.parent().find('.atbs-pagination__dots').remove();                 //Remove ALL Dot Signal
    
                            if($currentIndex == $dotIndex_prev) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal))).insertBefore($lastActiveButton);
                                $lastActiveButton.prev().addClass('atbs-pagination__item-current');
                                $currentActiveButton = $this.parent().find('.atbs-pagination__item-current');
                                while(parseInt($this.parent().find('a:nth-child('+($currentIndex + 2)+')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child('+($currentIndex + 2)+')').remove();       //Remove 1 button before
                                }
                            }else if(($currentPageVal == 1) && ($currentIndex < $dotIndex_prev)) {
                                while(parseInt($this.parent().find('a:nth-child('+($currentIndex + 2)+')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child('+($currentIndex + 2)+')').remove();       //Remove 1 button before
                                }
                            }else {
                                while(parseInt($this.parent().find('a:nth-child('+($currentIndex + 1)+')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child('+($currentIndex + 1)+')').remove();       //Remove 1 button before
                                }
                            }
                            $($dotNextTemplate).insertAfter($currentActiveButton);                  //Insert Dot After
        
                            if($currentPageVal > 4) {                                               // <- 1 ... 5 6 7 ... 10 -> 
                                $($dotPrevTemplate).insertBefore($currentActiveButton);              //Insert Dot Prev
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }else if($currentPageVal > 3) {                                         // <- 1 ... 4 5 6 ... 10 -> 
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                            else if($currentPageVal > 2) {                                          // <- 1 ... 3 4 5 ... 10 -> 
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                            if($currentPageVal == 1) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 3)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 2)).insertAfter($currentActiveButton);
                            }else if($currentPageVal == 2) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 3)).insertAfter($currentActiveButton);
                            }else if($currentPageVal == 3) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                            }
                        }
                    }
                }
                if($currentPageVal != 1) {
                    $this.siblings('.atbs-pagination__item-prev').css('display', 'inline-block');
                }else {
                    if($this.hasClass('atbs-pagination__item-prev')) {
                        $this.css('display', 'none');
                    }else {
                        $this.siblings('.atbs-pagination__item-prev').css('display', 'none');
                    }
                }
                if($currentPageVal == $totalPageVal) {
                    if($this.hasClass('atbs-pagination__item-next')) {
                        $this.css('display', 'none');
                    }else {
                        $this.siblings('.atbs-pagination__item-next').css('display', 'none');
                    }
                }else {
                    $this.siblings('.atbs-pagination__item-next').css('display', 'inline-block');
                }                
                ajaxListing($this, $currentPageVal);
            });
            function ajaxListing($this, $currentPageVal) {
                var $moduleID = $this.closest('.atbs-block').attr('id');
                var moduleName = $moduleID.split("-")[0];
                var args = ajax_buff['query'][$moduleID]['args'];
                if(moduleName == 'tnm_author_results') {
                    var postOffset = ($currentPageVal-1)*args['number'] + parseInt(args['offset']);
                    var $container = $this.closest('.atbs-block').find('.authors-list');
                    var moduleInfo = '';
                }else {
                    var postOffset = ($currentPageVal-1)*args['posts_per_page'] + parseInt(args['offset']);
                    var $container = $this.closest('.atbs-block').find('.posts-list');
                    var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];    
                }
                
                var parameters = {
    				    moduleName: moduleName,
    					args: args,
                        moduleInfo: moduleInfo,
                        postOffset: postOffset,
    				};
                console.log(parameters);
                $container.css('height', $container.height()+'px');
                $container.append('<div class="bk-preload-wrapper"></div>');
                $container.find('article').addClass('bk-preload-blur');
                
                loadAjax(parameters, $container);
                
                var $mainCol = $this.parents('.atbs-main-col');
                if($mainCol.length > 0) {
                    var $subCol = $mainCol.siblings('.atbs-sub-col');
                    $subCol.css('min-height', '1px');
                }                
                
                var $scrollTarget = $this.parents('.atbs-block');
                $('body,html').animate({
        			scrollTop: $scrollTarget.offset().top,
        		}, 1100);
                
                setTimeout(function(){ $container.css('height', 'auto'); }, 1100);
                
            }
            function loadAjax(parameters, $container){
                //console.log(parameters.moduleName);
                var tnmAjaxSecurity = ajax_buff['tnm_security']['tnm_security_code']['content'];
                
                var ajaxCall = {
                    action: parameters.moduleName,
                    args: parameters.args,
                    moduleInfo: parameters.moduleInfo,
                    postOffset: parameters.postOffset,
                    securityCheck: tnmAjaxSecurity
                };
                
                //console.log(ajaxCall);
                $.post(ajaxurl, ajaxCall, function (response) {
                    $results = $.parseJSON(response);
                    //Save HTML
                    // Append Result
                    $container.html($results).css('opacity', 0).animate({opacity: 1}, 500);	
                    $container.find('.bk-preload-wrapper').remove();
                    $container.find('article').removeClass('bk-preload-blur');
                });   
            }
            function checkStickySidebar($this){
                var $subCol = $this.parents('.atbs-main-col').siblings('.atbs-sub-col');
                if($subCol.hasClass('js-sticky-sidebar')) {
                    return $subCol;
                }else {
                    return 0;
                }
            }
        },
        
		/* ============================================================================
	     * Login Form tabs
	     * ==========================================================================*/
		loginForm: function() {
			var $loginFormTabsLinks = $('.js-login-form-tabs').find('a');

			$loginFormTabsLinks.on('click', function (e) {
				e.preventDefault()
				$(this).tab('show');
			});
		},

		/* ============================================================================
	     * Offcanvas Menu
	     * ==========================================================================*/
		offCanvasMenu: function() {
			var $backdrop = $('<div class="atbs-offcanvas-backdrop"></div>');
			var $offCanvas = $('.js-atbs-offcanvas');
			var $offCanvasToggle = $('.js-atbs-offcanvas-toggle');
			var $offCanvasClose = $('.js-atbs-offcanvas-close');
			var $offCanvasMenuHasChildren = $('.navigation--offcanvas').find('li.menu-item-has-children > a');
			var menuExpander = ('<div class="submenu-toggle"><i class="mdicon mdicon-expand_more"></i></div>');

			$backdrop.on('click', function(){
				$offCanvas.removeClass('is-active');
				$(this).fadeOut(200, function(){
					$(this).detach();
				});
			});

			$offCanvasToggle.on('click', function(e){
				e.preventDefault();
				var targetID = $(this).attr('href');
				var $target = $(targetID);
				$target.toggleClass('is-active');
				$backdrop.hide().appendTo(document.body).fadeIn(200);
			});

			$offCanvasClose.on('click', function(e){
				e.preventDefault();
				var targetID = $(this).attr('href');
				var $target = $(targetID);
				$target.removeClass('is-active');
				$backdrop.fadeOut(200, function(){
					$(this).detach();
				});
			});

            $offCanvasMenuHasChildren.append(function() {
            	return $(menuExpander).on('click', function(e){
            		e.preventDefault();
            		var $subMenu = $(this).parent().siblings('.sub-menu');

					$subMenu.slideToggle(200);
				});
            }); 
		},

		/* ============================================================================
	     * Prority+ menu init
	     * ==========================================================================*/
		priorityNavInit: function() {
			var $menus = $('.js-priority-nav');
			$menus.each(function() {
				MINIMALDOG.priorityNav($(this));
			})
		},

		/* ============================================================================
	     * Smart sticky header
	     * ==========================================================================*/
	    smartAffix: {
	        //settings
	        $headerPlaceHolder: null, //the affix menu (this element will get the mdAffixed)
	        $fixedHeader: null, //the menu wrapper / placeholder
	        isDestroyed: false,
	        isDisabled: false,
	        isFixed: false, //the current state of the menu, true if the menu is affix
	        isShown: false,
	        windowScrollTop: 0, 
	        lastWindowScrollTop: 0, //last scrollTop position, used to calculate the scroll direction
	        offCheckpoint: 0, // distance from top where fixed header will be hidden
	        onCheckpoint: 0, // distance from top where fixed header can show up
	        breakpoint: 992, // media breakpoint in px that it will be disabled

	        init : function init (options) {

	            //read the settings
	            this.$fixedHeader = $(options.fixedHeader);
	            this.$headerPlaceHolder = $(options.headerPlaceHolder);

	            // Check if selectors exist.
	            if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length ) {
	                this.isDestroyed = true;
	            } else if ( !this.$fixedHeader.length || !this.$headerPlaceHolder.length || ( MINIMALDOG.documentOnResize.windowWidth <= MINIMALDOG.header.smartAffix.breakpoint ) ) { // Check if device width is smaller than breakpoint.
	                this.isDisabled = true;
	            }

	        },// end init

	        compute: function compute(){
	        	if (MINIMALDOG.header.smartAffix.isDestroyed || MINIMALDOG.header.smartAffix.isDisabled) {
	        		return;
	        	}

	            // Set where from top fixed header starts showing up
	            if( !this.$headerPlaceHolder.length ) {
	                this.offCheckpoint = 400;
	            } else {
	            	this.offCheckpoint = $(this.$headerPlaceHolder).offset().top + 400;
	            }
	            
	            this.onCheckpoint = this.offCheckpoint + 500;

	            // Set menu top offset
	            this.windowScrollTop = MINIMALDOG.documentOnScroll.windowScrollTop;
	            if (this.offCheckpoint < this.windowScrollTop) {
	                this.isFixed = true;
	            }
	        },

	        updateState: function updateState(){
	            //update affixed state
	            if (this.isFixed) {
	                this.$fixedHeader.addClass('is-fixed');
	            } else {
	                this.$fixedHeader.removeClass('is-fixed');
	                $window.trigger('stickyHeaderHidden');
	            }

	            if (this.isShown) {
	                this.$fixedHeader.addClass('is-shown');
	            } else {
	                this.$fixedHeader.removeClass('is-shown');
	            }
	        },

	        /**
	         * called by events on scroll
	         */
	        eventScroll: function eventScroll(scrollTop) {

	            var scrollDirection = '';
	            var scrollDelta = 0;

	            // check the direction
	            if (scrollTop != this.lastWindowScrollTop) { //compute direction only if we have different last scroll top

	                // compute the direction of the scroll
	                if (scrollTop > this.lastWindowScrollTop) {
	                    scrollDirection = 'down';
	                } else {
	                    scrollDirection = 'up';
	                }

	                //calculate the scroll delta
	                scrollDelta = Math.abs(scrollTop - this.lastWindowScrollTop);
	                this.lastWindowScrollTop = scrollTop;

	                // update affix state
	                if (this.offCheckpoint < scrollTop) {
	                    this.isFixed = true;
	                } else {
	                    this.isFixed = false;
	                }
	                
	                // check affix state
	                if (this.isFixed) {
	                    // We're in affixed state, let's do some check
	                    if ((scrollDirection === 'down') && (scrollDelta > 14)) {
	                        if (this.isShown) {
	                            this.isShown = false; // hide menu
	                        }
	                    } else {
	                        if ((!this.isShown) && (scrollDelta > 14) && (this.onCheckpoint < scrollTop)) {
	                            this.isShown = true; // show menu
	                        }
	                    }
	                } else {
	                    this.isShown = false;
	                }

	                this.updateState(); // update state
	            }
	        }, // end eventScroll function

			/**
			* called by events on resize
			*/
	        eventResize: function eventResize(windowWidth) {
	        	// Check if device width is smaller than breakpoint.
	            if ( MINIMALDOG.documentOnResize.windowWidth < MINIMALDOG.header.smartAffix.breakpoint ) {
	                this.isDisabled = true;
	            } else {
	            	this.isDisabled = false;
	            	MINIMALDOG.header.smartAffix.compute();
	            }
	        }
	    },
	};

	MINIMALDOG.documentOnScroll = {
		ticking: false,
		windowScrollTop: 0, //used to store the scrollTop

        init: function() {
			window.addEventListener('scroll', function(e) {
				if (!MINIMALDOG.documentOnScroll.ticking) {
					window.requestAnimationFrame(function() {
						MINIMALDOG.documentOnScroll.windowScrollTop = $window.scrollTop();

						// Functions to call here
						if (!MINIMALDOG.header.smartAffix.isDisabled && !MINIMALDOG.header.smartAffix.isDestroyed) {
							MINIMALDOG.header.smartAffix.eventScroll(MINIMALDOG.documentOnScroll.windowScrollTop);
						}

						MINIMALDOG.documentOnScroll.goToTopScroll(MINIMALDOG.documentOnScroll.windowScrollTop);

						MINIMALDOG.documentOnScroll.ticking = false;
					});
				}
				MINIMALDOG.documentOnScroll.ticking = true;
			});
        },

        /* ============================================================================
	     * Go to top scroll event
	     * ==========================================================================*/
        goToTopScroll: function(windowScrollTop){
			if ($goToTopEl.length) {
				if(windowScrollTop > 800) {
					if (!$goToTopEl.hasClass('is-active')) $goToTopEl.addClass('is-active');
				} else {
					$goToTopEl.removeClass('is-active');
				}
			}
		},
    };

	MINIMALDOG.documentOnResize = {
		ticking: false,
		windowWidth: $window.width(),

		init: function() {
			window.addEventListener('resize', function(e) {
				if (!MINIMALDOG.documentOnResize.ticking) {
					window.requestAnimationFrame(function() {
						MINIMALDOG.documentOnResize.windowWidth = $window.width();

						// Functions to call here
						if (!MINIMALDOG.header.smartAffix.isDestroyed) {
							MINIMALDOG.header.smartAffix.eventResize(MINIMALDOG.documentOnResize.windowWidth);
						}

						MINIMALDOG.clippedBackground();

						MINIMALDOG.documentOnResize.ticking = false;
					});
				}
				MINIMALDOG.documentOnResize.ticking = true;
			});
        },
	};

	MINIMALDOG.documentOnReady = {

		init: function(){
			MINIMALDOG.header.init();
			MINIMALDOG.header.smartAffix.compute();
			MINIMALDOG.documentOnScroll.init();
			MINIMALDOG.documentOnReady.ajaxLoadPost();
			MINIMALDOG.documentOnReady.carousel_1i();
            MINIMALDOG.documentOnReady.carousel_1i_dark_arrow();
			MINIMALDOG.documentOnReady.carousel_1i30m();
			MINIMALDOG.documentOnReady.carousel_2i4m();
            MINIMALDOG.documentOnReady.carousel_2i20m();
			MINIMALDOG.documentOnReady.carousel_3i4m();
			MINIMALDOG.documentOnReady.carousel_3i4m_small();
			MINIMALDOG.documentOnReady.carousel_3i20m();
			MINIMALDOG.documentOnReady.carousel_headingAside_3i();
			MINIMALDOG.documentOnReady.carousel_4i();
            MINIMALDOG.documentOnReady.carousel_4i4m();
			MINIMALDOG.documentOnReady.carousel_4i20m();
			MINIMALDOG.documentOnReady.carousel_4i20m_center();
			MINIMALDOG.documentOnReady.carousel_overlap();
			MINIMALDOG.documentOnReady.customCarouselNav();
			MINIMALDOG.documentOnReady.countdown();
			MINIMALDOG.documentOnReady.goToTop();
			MINIMALDOG.documentOnReady.newsTicker();
			MINIMALDOG.documentOnReady.lightBox();
			MINIMALDOG.documentOnReady.perfectScrollbarInit();
			MINIMALDOG.documentOnReady.tooltipInit();
            MINIMALDOG.documentOnReady.gridMasonry();
		},
        gridMasonry: function() {
            $('.site-wrapper').imagesLoaded(function(){
                setTimeout(function() {
                    if($('.grid-masonry').find('article').length > 2){
                        $('.grid-masonry').masonry({
                            itemSelector: '.masonry-item',
                            columnWidth: 1,
                            isAnimated: true,
                            isFitWidth: true,
                         });
                    }
                 },500);
            });
        },
		/* ============================================================================
	     * AJAX load more posts
	     * ==========================================================================*/
		ajaxLoadPost: function() {
			var $loadedPosts = null;
			var $ajaxLoadPost = $('.js-ajax-load-post');
            var $this;

			function ajaxLoad(parameters, $postContainer) {
                var tnmAjaxSecurity = ajax_buff['tnm_security']['tnm_security_code']['content'];
				var	ajaxStatus = '',
					ajaxCall = $.ajax({
	                    url: ajaxurl,
	                    type: 'post',
	                    dataType: 'html',
	                    data: {
	                        action: parameters.action,
	                        args: parameters.args,
                            postOffset: parameters.postOffset,
                            type: parameters.type,
                            moduleInfo: parameters.moduleInfo,
                            the__lastPost: parameters.the__lastPost,
                            securityCheck: tnmAjaxSecurity                            
	                        // other parameters
	                    },
                	});
                //console.log(parameters.action);
                ajaxCall.done(function(respond) {
                    $loadedPosts = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if($loadedPosts == 'no-result') {
                        $postContainer.closest('.js-ajax-load-post').addClass('disable-click');
                        $postContainer.closest('.js-ajax-load-post').find('.js-ajax-load-post-trigger').addClass('hidden');
                        $postContainer.closest('.js-ajax-load-post').find('.tnm-no-more-button').removeClass('hidden');
                        return;
                    }
                    if ($loadedPosts) {
                        $postContainer.append($loadedPosts).css('opacity', 0).animate({opacity: 1}, 500);	
    				}
					$('html, body').animate({ scrollTop: $window.scrollTop() + 1 }, 0).animate({ scrollTop: $window.scrollTop() - 1 }, 0); // for recalculating of sticky sidebar
					// do stuff like changing parameters
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                });

                ajaxCall.always(function() {
                    $postContainer.find('.bk-preload-wrapper').remove();
                    $postContainer.find('article').removeClass('bk-preload-blur'); 
                    $this.removeClass('tnm_loading');
                });
			}

			$ajaxLoadPost.each(function() {
				$this = $(this);
                var $moduleID = $this.closest('.atbs-block').attr('id');
                var moduleName = $moduleID.split("-")[0];
				var $triggerBtn = $this.find('.js-ajax-load-post-trigger');
                var args = ajax_buff['query'][$moduleID]['args'];
                
                if(moduleName == 'tnm_author_results') {
                    var $postContainer = $this.find('.authors-list');
                    var moduleInfo = '';
                }else {
                    var $postContainer = $this.find('.posts-list');
                    var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];
                }
                                                
				$triggerBtn.on('click', function() {
				    if($this.hasClass('disable-click'))
                        return;
                    
                    $this.addClass('tnm_loading');
                    
                    if(moduleName == 'tnm_author_results') {
                        var postOffset      = parseInt(args['offset']) + $this.find('.author-box').length;   
                        var the__lastPost   = '';
                    }else {
                        var postOffset      = parseInt(args['offset']) + $this.find('article').length;    
                        if($this.closest('.atbs-block').hasClass('tnm_latest_blog_posts')) {
                            var stickPostLength = args['post__not_in'].length;
                            postOffset = postOffset - stickPostLength;
                        }
                        var the__lastPost   = $this.find('article').length;
                    }
				    $postContainer.append('<div class="bk-preload-wrapper"></div>');
                    $postContainer.find('article').addClass('bk-preload-blur');
    				var parameters = {
    				    action: moduleName,
    					args: args,
                        postOffset: postOffset,
                        type: 'loadmore',
                        moduleInfo: moduleInfo,
                        the__lastPost: the__lastPost,
    				};
                    //console.log(parameters);
					ajaxLoad(parameters, $postContainer);
				});
			});
		},

		/* ============================================================================
	     * Carousel funtions
	     * ==========================================================================*/
		carousel_1i: function() {
            var tnmArrows = ajax_buff['tnm_arrows']['sliderArrows']['content'];
			var $carousels = $('.js-atbs-carousel-1i');
			$carousels.each( function() {
				$(this).owlCarousel({
					items: 1,
					margin: 0,
					nav: true,
					loop: true,
					dots: true,
					autoHeight: true,
					navText: ['<img src="'+tnmArrows['light-prev']+'" alt="left" class="left-arrow ">', '<img src="'+tnmArrows['light-next']+'" alt="left" class="left-arrow ">'],
					smartSpeed: 500,
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 1,
					    },
                        autoplay:true,
                        autoplayTimeout: 3000,
					},
				});
			})
		},
        
        carousel_1i_dark_arrow: function() {
            var tnmArrows = ajax_buff['tnm_arrows']['sliderArrows']['content'];
			var $carousels = $('.js-atbs-carousel-1i-dark-arrow');
			$carousels.each( function() {
				$(this).owlCarousel({
					items: 1,
					margin: 0,
					nav: true,
					loop: true,
					dots: true,
					autoHeight: true,
					navText: ['<img src="'+tnmArrows['dark-prev']+'" alt="left" class="left-arrow ">', '<img src="'+tnmArrows['dark-next']+'" alt="left" class="left-arrow ">'],
					smartSpeed: 500,
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 1,
					    },
					},
				});
			})
		},

		carousel_1i30m: function() {
			var $carousels = $('.js-carousel-1i30m');
			$carousels.each( function() {
				$(this).owlCarousel({
					items: 1,
					margin: 30,
					loop: true,
					nav: true,
					dots: true,
					autoHeight: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					smartSpeed: 500,
				});
			})
		},

		carousel_overlap: function() {
			var $carousels = $('.js-atbs-carousel-overlap');
			$carousels.each( function() {
				var $carousel = $(this);
				$carousel.flickity({
					wrapAround: true,
				});

				$carousel.on( 'staticClick.flickity', function( event, pointer, cellElement, cellIndex ) {
					if ( (typeof cellIndex === 'number') && ($carousel.data('flickity').selectedIndex != cellIndex) ) {
						$carousel.flickity( 'selectCell', cellIndex );
					}
				});
			})
		},

		carousel_2i4m: function() {
			var $carousels = $('.js-carousel-2i4m');
			$carousels.each( function() {
				$(this).owlCarousel({
					items: 2,
					margin: 4,
					loop: false,
					nav: true,
					dots: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },
					},
				});
			})
		},
        carousel_2i20m: function() {
			var $carousels = $('.js-carousel-2i20m');
			$carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
				$(this).owlCarousel({
					margin: 20,
					loop: carousel_loop,
					nav: true,
					dots: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },
					},
				});
			})
		},
		carousel_3i: function() {
			var $carousels = $('.js-carousel-3i');
			$carousels.each( function() {
				$(this).owlCarousel({
					loop: true,
					nav: true,
					dots: false,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 3,
					    },
					},
				});
			})
		},

		carousel_3i4m: function() {
			var $carousels = $('.js-carousel-3i4m');
			$carousels.each( function() {
				$(this).owlCarousel({
					margin: 4,
					loop: true,
					nav: true,
					dots: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 3,
					    },
					},
				});
			})
		},

		carousel_3i4m_small: function() {
			var $carousels = $('.js-carousel-3i4m-small');
			$carousels.each( function() {
				$(this).owlCarousel({
					margin: 4,
					loop: false,
					nav: true,
					dots: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					autoHeight: true,
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },

					    1200 : {
					        items: 3,
					    },
					},
				});
			})
		},

		carousel_3i20m: function() {
            var tnmArrows = ajax_buff['tnm_arrows']['sliderArrows']['content'];
			var $carousels = $('.js-carousel-3i20m');
			$carousels.each( function() {
				$(this).owlCarousel({
					margin: 20,
					loop: true,
					nav: true,
					dots: false,
					navText: ['<img src="'+tnmArrows['dark-prev']+'" alt="left" class="left-arrow ">', '<img src="'+tnmArrows['dark-next']+'" alt="left" class="left-arrow ">'],
					responsive: {
						0 : {
					        items: 2,
					    },
					     576  : {
					        items: 2,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 3,
					    },
					},
				});
			})
		},

		carousel_headingAside_3i: function() {
			var $carousels = $('.js-atbs-carousel-heading-aside-3i');
			$carousels.each( function() {
				$(this).owlCarousel({
					margin: 20,
					nav: false,
					dots: false,
					loop: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					        margin: 10,
					        stagePadding: 40,
					        loop: false,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 3,
					    },
					},
				});
			})
		},

		customCarouselNav: function() {
			if ( $.isFunction($.fn.owlCarousel) ) {
				var $carouselNexts = $('.js-carousel-next');
				$carouselNexts.each( function() {
					var carouselNext = $(this);
					var carouselID = carouselNext.parent('.atbs-carousel-nav-custom-holder').attr('data-carouselID');
					var $carousel = $('#' + carouselID);

					carouselNext.on('click', function() {
					    $carousel.trigger('next.owl.carousel');
					});
				});

				var $carouselPrevs = $('.js-carousel-prev');
				$carouselPrevs.each( function() {
					var carouselPrev = $(this);
					var carouselID = carouselPrev.parent('.atbs-carousel-nav-custom-holder').attr('data-carouselID');
					var $carousel = $('#' + carouselID);

					carouselPrev.on('click', function() {
					    $carousel.trigger('prev.owl.carousel');
					});
				});
			}
		},

		carousel_4i: function() {
			var $carousels = $('.js-carousel-4i');

			$carousels.each( function() {
				$(this).owlCarousel({
					loop: true,
					nav: true,
					dots: false,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 4,
					    },
					},
				});
			})
		},

		carousel_4i20m: function() {
			var $carousels = $('.js-carousel-4i20m');

			$carousels.each( function() {
				$(this).owlCarousel({
					items: 4,
					margin: 20,
					loop: false,
					nav: true,
					dots: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 3,
					    },

					    1199 : {
					        items: 4,
					    },
					},
				});
			})
		},
        carousel_4i4m: function() {
			var $carousels = $('.js-carousel-4i4m');
			$carousels.each( function() {
                var carousel_loop = $(this).data('carousel-loop');
				$(this).owlCarousel({
					margin: 4,
					loop: carousel_loop,
					nav: true,
					dots: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 4,
					    },
					},
				});
			})
		},
		carousel_4i20m_center: function() {
			var $carousels = $('.js-carousel-4i20m--center');

			$carousels.each( function() {
				$(this).owlCarousel({
					items: 4,
					center: true,
					margin: 20,
					loop: true,
					 merge:true,
					nav: true,
					dots: true,
					navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
					responsive: {
						  678:{
				            mergeFit:true,
				        },
				        1000:{
				            mergeFit:false,
				        },
						0 : {
					        items: 1,
					    },

					    768 : {
					        items: 2,
					    },

					    992 : {
					        items: 3,
					    },

					    1199 : {
					        items: 4,
					    },
					},
				});
			})
		},

		/* ============================================================================
	     * Countdown timer
	     * ==========================================================================*/
		countdown: function() {
			if ( $.isFunction($.fn.countdown) ) {
				var $countdown = $('.js-countdown');

				$countdown.each(function() {
					var $this = $(this);
					var finalDate = $this.data('countdown');

					$this.countdown(finalDate, function(event) {
						$(this).html(event.strftime(''
						+ '<div class="countdown__section"><span class="countdown__digit">%-D</span><span class="countdown__text meta-font">day%!D</span></div>'
						+ '<div class="countdown__section"><span class="countdown__digit">%H</span><span class="countdown__text meta-font">hr</span></div>'
						+ '<div class="countdown__section"><span class="countdown__digit">%M</span><span class="countdown__text meta-font">min</span></div>'
						+ '<div class="countdown__section"><span class="countdown__digit">%S</span><span class="countdown__text meta-font">sec</span></div>'));
					});
				});
			};
		},

		/* ============================================================================
	     * Scroll top
	     * ==========================================================================*/
		goToTop: function() {
			if ($goToTopEl.length) {
				$goToTopEl.on('click', function() {
					$('html,body').stop(true).animate({scrollTop:0},400);
					return false;
				});
			}
		},

		/* ============================================================================
	     * News ticker
	     * ==========================================================================*/
		newsTicker: function() {
			var $tickers = $('.js-atbs-news-ticker');
			$tickers.each( function() {
				var $ticker = $(this);
				var $next = $ticker.siblings('.atbs-news-ticker__control').find('.atbs-news-ticker__next');
				var $prev = $ticker.siblings('.atbs-news-ticker__control').find('.atbs-news-ticker__prev');

				$ticker.addClass('initialized').vTicker('init', {
					speed: 300,
					pause: 3000,
				    showItems: 1,
				});

				$next.on('click', function() {
					$ticker.vTicker('next', {animate:true});
				});

				$prev.on('click', function() {
					$ticker.vTicker('prev', {animate:true});
				});
			})
		},

		/* ============================================================================
	     * Lightbox
	     * ==========================================================================*/
	  	lightBox: function() {
	  		if ( $.isFunction($.fn.magnificPopup) ) {
	  			var $imageLightbox = $('.js-atbs-lightbox-image');
	  			var $galleryLightbox = $('.js-atbs-lightbox-gallery');

	  			$imageLightbox.magnificPopup({
					type: 'image',
					mainClass: 'mfp-zoom-in',
					removalDelay: 80,
				});

	  			$galleryLightbox.each(function() {
	  				$(this).magnificPopup({
						delegate: '.gallery-icon > a',
						type: 'image',
						gallery:{
							enabled: true,
						},
						mainClass: 'mfp-zoom-in',
						removalDelay: 80,
					});
	  			});
	  		}
	  	},

		/* ============================================================================
	     * Custom scrollbar
	     * ==========================================================================*/
		perfectScrollbarInit: function() {
			if ( $.isFunction($.fn.perfectScrollbar) ) {
				var $area = $('.js-perfect-scrollbar');

				$area.perfectScrollbar({
					wheelPropagation: true,
				});
			}
		},

		/* ============================================================================
	     * Sticky sidebar
	     * ==========================================================================*/
		stickySidebar: function() {
			setTimeout(function() {
				var $stickySidebar = $('.js-sticky-sidebar');
				var $stickyHeader = $('.js-sticky-header');

				var marginTop = ($stickyHeader.length) ? ($stickyHeader.outerHeight() + 20) : 0; // check if there's sticky header
				if ( $.isFunction($.fn.theiaStickySidebar) ) {
					$stickySidebar.theiaStickySidebar({
						additionalMarginTop: marginTop,
						additionalMarginBottom: 20,
					});
				}
			}, 250); // wait a bit for precise height;
		},

		/* ============================================================================
	     * Bootstrap tooltip
	     * ==========================================================================*/
		tooltipInit: function() {
			var $element = $('[data-toggle="tooltip"]');

			$element.tooltip();
		},
	};

	MINIMALDOG.documentOnLoad = {

		init: function() {
			MINIMALDOG.clippedBackground();
            MINIMALDOG.header.smartAffix.compute(); //recompute when all the page + logos are loaded
            MINIMALDOG.header.smartAffix.updateState(); // update state
            MINIMALDOG.header.stickyNavbarPadding(); // fix bootstrap modal backdrop causes sticky navbar to shift
			MINIMALDOG.documentOnReady.stickySidebar();
		}

	};

	/* ============================================================================
     * Blur background mask
     * ==========================================================================*/
	MINIMALDOG.clippedBackground = function() {
		if ($overlayBg.length) {
			$overlayBg.each(function() {
				var $mainArea = $(this).find('.js-overlay-bg-main-area');
				if (!$mainArea.length) {
					$mainArea = $(this);
				}

				var $subArea = $(this).find('.js-overlay-bg-sub-area');
				var $subBg = $(this).find('.js-overlay-bg-sub');

				var leftOffset = $mainArea.offset().left - $subArea.offset().left;
				var topOffset = $mainArea.offset().top - $subArea.offset().top;
				
				$subBg.css('display', 'block');
				$subBg.css('position', 'absolute');
				$subBg.css('width', $mainArea.outerWidth() + 'px');
				$subBg.css('height', $mainArea.outerHeight() + 'px');
				$subBg.css('left', leftOffset + 'px');
				$subBg.css('top', topOffset + 'px');
			});
		};
	}

	/* ============================================================================
     * Priority+ menu
     * ==========================================================================*/
    MINIMALDOG.priorityNav = function($menu) {
    	var $btn = $menu.find('button');
    	var $menuWrap = $menu.find('.navigation');
    	var $menuItem = $menuWrap.children('li');
		var hasMore = false;

		if(!$menuWrap.length) {
			return;
		}

		function calcWidth() {
			if ($menuWrap[0].getBoundingClientRect().width === 0)
				return;

			var navWidth = 0;

			$menuItem = $menuWrap.children('li');
			$menuItem.each(function() {
				navWidth += $(this)[0].getBoundingClientRect().width;
			});

			if (hasMore) {
				var $more = $menu.find('.priority-nav__more');
				var moreWidth = $more[0].getBoundingClientRect().width;
				var availableSpace = $menu[0].getBoundingClientRect().width;

				//Remove the padding width (assumming padding are px values)
				availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
				//Remove the border width
				availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

				if (navWidth > availableSpace) {
					var $menuItems = $menuWrap.children('li:not(.priority-nav__more)');
					var itemsToHideCount = 1;

					$($menuItems.get().reverse()).each(function(index){
						navWidth -= $(this)[0].getBoundingClientRect().width;
						if (navWidth > availableSpace) {
							itemsToHideCount++;
						} else {
							return false;
						}
					});

					var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

					$itemsToHide.each(function(index){
						$(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
					});

					$itemsToHide.prependTo($more.children('ul'));
				} else {
					var $moreItems = $more.children('ul').children('li');
					var itemsToShowCount = 0;

					if ($moreItems.length === 1) { // if there's only 1 item in "More" dropdown
						if (availableSpace >= (navWidth - moreWidth + $moreItems.first().data('width'))) {
							itemsToShowCount = 1;
						}
					} else {
						$moreItems.each(function(index){
							navWidth += $(this).data('width');
							if (navWidth <= availableSpace) {
								itemsToShowCount++;
							} else {
								return false;
							}
						});
					}

					if (itemsToShowCount > 0) {
						var $itemsToShow = $moreItems.slice(0, itemsToShowCount);

						$itemsToShow.insertBefore($menuWrap.children('.priority-nav__more'));
						$moreItems = $more.children('ul').children('li');

						if ($moreItems.length <= 0) {
							$more.remove();
							hasMore = false;
						}
					}
				}
			} else {
				var $more = $('<li class="priority-nav__more"><a href="#"><span>More</span><i class="mdicon mdicon-more_vert"></i></a><ul class="sub-menu"></ul></li>');
				var availableSpace = $menu[0].getBoundingClientRect().width;

				//Remove the padding width (assumming padding are px values)
				availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
				//Remove the border width
				availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

				if (navWidth > availableSpace) {
					var $menuItems = $menuWrap.children('li');
					var itemsToHideCount = 1;

					$($menuItems.get().reverse()).each(function(index){
						navWidth -= $(this)[0].getBoundingClientRect().width;
						if (navWidth > availableSpace) {
							itemsToHideCount++;
						} else {
							return false;
						}
					});

					var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

					$itemsToHide.each(function(index){
						$(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
					});

					$itemsToHide.prependTo($more.children('ul'));
					$more.appendTo($menuWrap);
					hasMore = true;
				}
			}
		}

		$window.on('load webfontLoaded', calcWidth );
		$window.on('resize', $.throttle( 50, calcWidth ));
    }

	$document.ready( MINIMALDOG.documentOnReady.init );
	$window.on('load', MINIMALDOG.documentOnLoad.init );
	$window.on( 'resize', MINIMALDOG.documentOnResize.init );

})(jQuery);
