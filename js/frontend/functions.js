$(function () {
    sliderHighlight = '';
    sliderBestseller = '';
    sliderLatest = '';
    sliderPromotion = '';
    sliderRelated = '';
    sliderBrand = '';
    sliderBrandSidebar = '';

    let productsPerLine = 4;

    const productListItem = $('.product-list-item');
    const header = $('#header-main');
    const showSearch = $('.show-search');
    const bannerMain = $('#banner-main');

    if ($('ul[class^="col-pl-"]').length > 0) {
        const firstProductListClass = $('body').find('ul[class^="col-pl-"]:eq(0)').attr('class');
        const firstProductListClassReplace = firstProductListClass.replace('col-pl-', '');

        productsPerLine = parseInt(firstProductListClassReplace);
    }

    const configSliderHome = {
        infiniteLoop: false,
        hideControlOnEnd: true,
        autoReload: true,
        slideMargin: 32,
        prevText: '<span class="icon-prev"></span>',
        nextText: '<span class="icon-next"></span>',
        breaks: [{ screen: 0, slides: productsPerLine }]
    }

    const configSliderBrand = {
        auto: true,
        pager: false,
        autoReload: true,
        slideMargin: 32,
        prevText: '<span class="icon-prev"></span>',
        nextText: '<span class="icon-next"></span>',
        breaks: [{ screen: 0, slides: 7 }]
    }

    $('.element-menu-category-header .menu-category-list > li').find('ul').each(function () {
        $(this).prev('a').addClass('has-submenu');
    });

    $('<button class="close-search" type="button"><span class="icon-close"></span></button>').appendTo('.search-inner');

    showSearch.click(function () {
        header.addClass('search-open');
    });

    $(document).on('click', '.close-search', function () {
        header.removeClass('search-open');
    });

    productListItem.each(function () {
        const target = $(this).find('.product-list-item-inner'),
            divImagem = $(this).find('.product-image');

        $('<div class="wrapper-label"></div>').prependTo(target);

        const wrapperLabel = $(this).find('.wrapper-label');

        $(this).find('.label-promo').appendTo(wrapperLabel);
        $(this).find('.label-launch').appendTo(wrapperLabel);
        $(this).find('.label-freeshiping').appendTo(divImagem);
    });

    if ($('body').hasClass('pagina-home')) {
        $('.element-content').appendTo('#vitrine');

        $('#vitrine').find('#product-list').each(function () {
            const target = $(this).closest('div[class^="element"]');

            $('.element-banner-shop').insertAfter(target)
        });

        $('.element-highlight').find('#product-list').each(function () {
            const productList = $(this),
                children = $(productList).children().length;

            if (children > productsPerLine) {
                sliderHighlight = $(productList).bxSlider(configSliderHome);
            }
        });

        $('.element-bestseller').find('#product-list').each(function () {
            const productList = $(this),
                children = $(productList).children().length;

            if (children > productsPerLine) {
                sliderBestseller = $(productList).bxSlider(configSliderHome);
            }
        });

        $('.element-latest').find('#product-list').each(function () {
            const productList = $(this),
                children = $(productList).children().length;

            if (children > productsPerLine) {
                sliderLatest = $(productList).bxSlider(configSliderHome);
            }
        });

        $('.element-promotion').find('#product-list').each(function () {
            const productList = $(this),
                children = $(productList).children().length;

            if (children > productsPerLine) {
                sliderPromotion = $(productList).bxSlider(configSliderHome);
            }
        });

        $('.element-tags-vitrine').find('div[class^="wrapper-tag"]').each(function () {
            $(this).find('#product-list').each(function () {
                const productList = $(this);
                const children = $(productList).children().length;

                if (children > productsPerLine) {
                    $(productList).bxSlider(configSliderHome);
                }
            });
        });

        if ($('.sidebar').length > 0) {
            $('.sidebar').each(function () {
                const childrens = $(this).children().length;

                if (childrens == 1) {
                    $('.sidebar').children().each(function () {
                        const classElement = $(this).attr('class');

                        if (classElement == 'element-filter') {
                            removeSidebar();
                        }
                    });
                }
            });
        }
    }

    if (bannerMain.length > 0) {
        bannerMain.each(function () {
            const children = $(this).children().length;
            const bannerMainConfig = {
                auto: true,
                autoReload: true,
                prevText: '<span class="icon-prev-big"></span>',
                nextText: '<span class="icon-next-big"></span>',
                breaks: [{ screen: 0, slides: 1 }],
                useCSS: false
            };

            if (children > 1) {
                BannerMainslider = bannerMain.bxSlider(bannerMainConfig);
            }
        });
    }

    $('.element-product-related').find('#product-list').each(function () {
        const children = $(this).children().length;

        if (children > productsPerLine) {
            sliderRelated = $('.element-product-related #product-list').bxSlider(configSliderHome);
        }
    });

    if ($('.menu-sidebar-list').length != 0) {
        const url = window.location.pathname;

        $('.menu-sidebar-list').find('li a[href$="' + url + '"]').each(function () {
            $(this).parents('li').addClass('current');
        });
    }

    $('.element-categories .menu-sidebar-list > li').find('ul').each(function () {
        $(this).prev('a').parent('li').addClass('has-submenu');
    });

    $('.element-brands-bottom').find('.nav-bottom-brand-list').each(function () {
        const children = $(this).children().length;

        if (children > 7) {
            sliderBrand = $('.nav-bottom-brand-list').bxSlider(configSliderBrand);
        }
    });

    $('.element-brand-left').find('.brand-sidebar-list').each(function () {
        const children = $(this).children().length;

        if (children > 6) {
            sliderBrandSidebar = $('.brand-sidebar-list').bxSlider({
                minSlides: 6,
                maxSlides: 6,
                mode: 'vertical',
                auto: true,
                pager: false,
                autoReload: true,
                slideMargin: 16,
                prevText: '<span class="icon-prev-up"></span>',
                nextText: '<span class="icon-next-down"></span>'
            });
        }
    });

    $(window).on('load resize', function () {
        const menu = ($('.element-menu-main').length ? $('.element-menu-main') : $('.element-menu-category'));
        const windowWidth = $(window).width();
        const windowHalfWidth = windowWidth / 2;

        $(menu).find('ul[class^="menu"]').children('li').each(function () {
            const menuItem = $(this).offset();

            if (menuItem.left > windowHalfWidth) {
                $(this).addClass('menu-right');
            } else {
                $(this).addClass('menu-left');
            }
        });
    });

    $('.pagina-categoria, .pagina-busca, .pagina-marca, .pagina-tag').each(function () {
        $(this).find('.element-content').each(function () {
            const target = $(this).closest('#content-main');

            $('<div class="header-section"><div class="container-12"><div class="grid-12"><div class="header-section-inner"></div></div></div></div>').prependTo(target);

            const headerSection = $(this).closest('#content-main').find('.header-section-inner');

            $(this).find('.element-breadcrumb').prependTo(headerSection);
        });
    });

    $('.pagina-produto').each(function () {
        removeSidebar();

        $('.product-detail-right').find('.wrapper-product-price').each(function () {
            const productCashPrice = $(this).find('.product-price-off');
            const productNewPrice = $(this).find('.product-new-price');

            if (productCashPrice.length) {
                productNewPrice.hide();
                productCashPrice.wrapInner('<span class="label-cash-price"></span>');
                productCashPrice.find('.desconto_parcela').prependTo(productCashPrice);
                productCashPrice.find('.desconto_avista').prependTo(productCashPrice);

                const labelCashPrice = $(this).find('.label-cash-price');
                const textCashPrice = $(this).find('.desconto_parcela').text();

                labelCashPrice.text(textCashPrice + labelCashPrice.text());
            }

            if ($('.wrapper-product-parcels').length) {
                $('.wrapper-product-parcels .show-parcells').text('Ver opções de parcelamento');
            }

            $('<button class="btn-calc-cep" type="button"><span class="btn-text">Calcular</span></button>').appendTo('.grid-cep');
        });

        $('.box-shipping .box-title').text('Calcule o frete:');
        $('.box-shipping #cep').prop('placeholder', 'Seu CEP');
        $('.btn.btn-comment-submit.product-ratings-link .btn-text').text('Deixe o seu comentário');
        $('.label-stamp-wrapper').appendTo('.product-detail-left');
    });

    $('.element-social-footer .title-footer').text('Nossas redes');
    $('.element-payment-methods .title-footer').text('Pagamento');

    $('.list-product-empty').parent().addClass('list-product-empty');

    //Accordion Filtro
    $('.sidebar .element-filter').find('.filter-content ').hide();
    $('.label-filter').click(function () {
        $(this).toggleClass('active');
        $(this).next().toggleClass('active').slideToggle();
    });

    $(".selected-filters-list a").each(function () {
        const filter_text = $(this).text();
        const filter_name = filter_text?.split(":")[0]?.trim()?.toLowerCase();
        const filter_value = filter_text?.split(":")[1]?.trim();

        $(".filter-container-sidebar .label-filter").each(function () {
            let name = $(this).text()?.toLowerCase()?.trim();
            console.log(filter_name, name);
            if (name == "faixa de preço") {
                name = "faixa de preco";
            }

            if (filter_name == name) {
                $(this).toggleClass('active');
                $(this).next().toggleClass('active').slideToggle();
            }
        });

        $(".filter-container-sidebar .filter-list a[title='" + filter_value + "']").addClass('active');
    });
    //Fim Accordion

    removeBanner('.element-banner-main', '#banner-main');
    removeBanner('.element-banner-stripe', '#banner-stripe');
    removeBanner('.element-banner-shop', '#banner-shop');
    removeBanner('.element-banner-bottom', '#banner-bottom');

    function removeBanner($elementBanner, $listBanner) {
        const banner = $elementBanner;
        const listBanner = $listBanner;

        $(banner).find(listBanner).each(function () {
            const childrens = $(this).children().length;

            if (childrens == 0) {
                $(banner).remove();
            }
        });
    }

    removeBrand('.element-brands-bottom');

    function removeBrand($elementBrand) {
        const brand = $elementBrand;

        $(brand).find('ul[class$="brand-list"]').each(function () {
            const childrens = $(this).children().length;

            if (childrens == 0) {
                $(brand).remove();
            }
        });
    }

    function removeSidebar() {
        $('#content-main').removeClass('content-main-cols-2').removeClass('has-sidebar-left').removeClass('has-sidebar-right').addClass('content-main-cols-1');
        $('.sidebar').remove();
    }

});
