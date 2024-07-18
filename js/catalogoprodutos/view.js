
const ViewFunctions = {
	getSelected: function(comb) {

		var atributos_selecionados = new Array();

		$(comb).each(function (index, element) {
			if ($(element).val() != '0') {

				atributos_selecionados[atributos_selecionados.length] = {
					'produto_id': ProductModel.id,
					'order': $(element).attr('data-order'),
					'atributo_id': $(element).val(),
					'combinacao_id': $(element).attr('data-comb'),
					'muda_vitrine': 1
				}
			}
		});

		return atributos_selecionados;
	},

	getCombinations: function() {

		var combinations = new Array();

		// Esta habilitado compra multipla para o produto
		if ($('#main-product-combination-select').length > 0) {

			var comb = $('#main-product-combination-select').find('.product-combination-select');
			var atributos_selecionados = ViewFunctions.getSelected(comb);
			var divCombination = $('#main-product-combination-select').offset();

		} else {

			// Cair aqui seria o padrao com os radio inputs
			var comb = $('#main-product-combination-list').find('.product-combination-list');
			var atributos_selecionados = ProductModel.getChecked(comb);
			var divCombination = $('#main-product-combination-list').offset();
		}

		combinations = {
			'comb': comb,
			'checked': atributos_selecionados,
			'divCombination': divCombination
		}

		return combinations;
	},

	dataLayerExtraInfoKits: function(kitList) {
		DL_item = DL_products.ecommerce.items[0];
		DL_item.isKit = true;
		
		kitList.map(elem => {
			const productKitName = elem['name'];
			const productKitQuantity = (elem['quantity']?.split(":")[1]?.trim());
			const productKitProductId = elem['produto_id'];
			const productKitSkuId = elem['produto_estoque_id'];
			const productKitPrice = convertToFloat(elem['price']);
			
			var newItem = {};
			productKitSkuId && (newItem['item_id'] = productKitSkuId);
			productKitName && (newItem['item_name'] = productKitName);
			productKitQuantity && (newItem['quantity'] = parseInt(productKitQuantity));
			productKitProductId && (newItem['product_id'] = productKitProductId);
			productKitPrice && (newItem['price'] = productKitPrice);
			
			if (!DL_item.items) {
				DL_item.items = [];
			}			
	
			if(productKitProductId){
				let existingItemIndex = DL_item.items.findIndex(item => item['product_id'] === newItem['product_id']);
				if (existingItemIndex !== -1) {
					DL_item.items[existingItemIndex] = newItem;
				} else {
					DL_item.items.push(newItem);
				}
			}			
		})

	}
}

$(function () {
	var slider = null;
	listaImagensMobile = null;
	positionZoomMobile = null;
	positionModalBudget = null;
	indexImagemZoom = null;

	$(window).on('load', function () {
		checkedatrributesCompoundedPro();
		checkedatrributesCompoundedKit();
	});

	const isMobile = $('body').hasClass('layout-mobile');
	var ratingSending = false;

	if (!isMobile) {
		$('.product-ratings-amount, .link-anchor').on('click', function () {
			if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

				if (target.length) {
					$('html,body').animate({
						scrollTop: target.offset().top - 20
					}, 1000);
					return false;
				}
			}
		});

		$('.product-main-image').find('source').remove();
	} else {
		// Ajusta o tamanho do label de Unida nas perguntas customizadas
		if ($('.wrapper-product-question').length > 0) {
			var maxWidth = Math.max.apply(null, $('.wrapper-product-question .label-unit').map(function () {
				return $(this).outerWidth(true);
			}).get());

			/*$('.wrapper-product-question').find('div[class^="grid"]').each(function(){
				$(this).addClass('has-label-unit').css('padding-right', maxWidth);
				$(this).children('.label-unit').css('min-width', maxWidth);
			});*/

			$('.wrapper-product-question').find('.label-unit').each(function () {
				$(this).closest('div[class^="grid"]').addClass('has-label-unit').css('padding-right', maxWidth);
				$(this).css('min-width', maxWidth);
			});
		}

		// Cria o slider das fotos
		$('.product-image-list').each(function () {
			var childrens = $(this).children().length;

			if (childrens) {
				listaImagensMobile = $('.product-image-list').bxSlider({
					infiniteLoop: false,
					hideControlOnEnd: true,
					pager: false,
					prevText: '<span class="icon-prev-h"></span>',
					nextText: '<span class="icon-next-h"></span>',
					video: true,
					useCSS: false
				});
			}
		});
	}

	if ($('.table-kit').find('.product-kit').length > 0) {
		$('.wrapper-progressive').hide();
	}


	ProductModel.id = $('h1.product-name').data('id');
	ProductModel.gift = $('h1.product-name').data('gift');

	$(document).on('change', '.product-combination-select', function (e) {

		select_atrribute($(this));
	});

	//Evento que controla marcação de checkboxes por produtos
	$(document).on('click', '.product-comb-attribute', function (e) {

		var value = this.value;
		var prodClass = '.' + this.className.split(' ').pop();
		var combClass = this.className.split(' ').shift();

		$(prodClass + '[value="' + value + '"][class~="' + combClass + '"]').prop('checked', true).parent().addClass('product-combination-active');
		$(prodClass + '[value!="' + value + '"][class~="' + combClass + '"]').prop('checked', false).parent().removeClass('product-combination-active');

		// Campo de Unidade para o Default
		//$('#product-amount').val(1);
		//$('#product-amount').data('multi', 1);

		if ($(this).hasClass('non-active-attribute')) {
			non_active_attribute($(this));

		} else if ($(this).hasClass('active-attribute')) {
			active_atrribute($(this));
		}

	});

	// Evento qe controla a marcacao de checkboxes no kit composto
	$(document).on('click', '.kit-comb-attribute', function () {
		ProductModel.id = $('h1.product-name').data('id');
		var self = $(this);
		var value = this.value;

		self.closest('ul').find('.kit-comb-attribute').prop('checked', false);
		self.closest('ul').find('li').removeClass('product-combination-active');

		self.prop('checked', true);
		self.closest('li').addClass('product-combination-active');

		var labelStamp = $('.label-stamp-wrapper'),
			tableKit = $('.table-kit tbody tr'),
			comb = self.closest('.main-product-combination-list').find('.product-combination-list'),
			produtoKitId = self.closest('.product-kit').attr('data-id'),
			atributos_selecionados = ProductModel.getChecked(comb),
			kits_selecionados = ProductModel.getKitChecked(tableKit, produtoKitId),
			produtoKit = {};

		produtoKit = {
			id: self.closest('tr').data('id'),
			produtoId: self.closest('tr').data('product')
		};

		ProductModel.amount = 1;
		if ($('#product-amount').length > 0) {
			ProductModel.amount = $('#product-amount').val();
		}

		var totalComb = $('.table-kit ul.product-combination-list').length;
		var TotalCombChecked = $('.table-kit ul.product-combination-list').find('li.product-combination-active').length;

		if (self.prop('checked')) {
			ProductModel.findKit(
				atributos_selecionados,
				kits_selecionados,
				produtoKit,
				function () {
					$('.loading-page').show(100);
				},
				function (data) {
					$('.loading-page').hide(100);
					if (data.id !== null) {

						var combinationList = self.closest('.main-product-combination-list'),
							checkclass = 'kit-comb-attribute',
							productKitStock = self.closest('tr'),
							productKitSku = self.closest('tr').find('.product-sku'),
							productKitValue = self.closest('tr').find('.product-price-kit'),
							productKitProductId = self.closest('tr').attr('data-product'),
							productKitName = self.closest('tr').find('.product-name').text(),
							productKitQuantity = parseInt((self.closest('tr').find('.product-amount').text())?.split(":")[1]?.trim()),
							productKitImage = self.closest('tr').children('td').first().find('img'),
							totalKitValue = $('.total-kit-value');

						/** Passar o ID do produto no kit para o produto_id ? Ref #6130 **/

						if (data['revendedor'] || data['cotacao']) {

							update_combinationsKit(combinationList, checkclass, data['combinacoes'], produtoKit);
						} else {

							labelStamp.find('.label-unavailable').remove();
							update_product_original_price(data);
							update_product_price(data['valor_venda']);
							update_product_parcelled(data.dados_integradores['maximo_parcelas'], data['valor_parcelado']);
							update_price_off(data.dados_integradores['desconto_avista'], data['valor_avista']);
							update_deferred_payment(data.dados_integradores['pagamentos_parcelado'], data.integradores);
							update_combinationsKit(combinationList, checkclass, data['combinacoes'], produtoKit);

							productKitStock.attr('data-stock', data['stock_item']);
							productKitSku.html('SKU: ' + data['sku_item']);
							productKitValue.html('por <span class="product-big-price">' + accounting.formatMoney(data['valor_item']) + '</span>');
							totalKitValue.html('<span>Total:</span><span class="kit-price">' + accounting.formatMoney(data['valor_venda']) + '</span>');
														
							// Somente atualiza infos quando selecionadas todas combinacoes - ref 64608
							if (totalComb == TotalCombChecked) {

								if (data['disponivel'] == true) {
									update_button_buyKit($('.wrapper-btn-buy'), data['label_comprar_detail']);

								} else {
									update_unavailable_button($('.wrapper-btn-buy'), labelStamp);
									update_unavailable_buttonKit($('.wrapper-btn-buy'));

								}
							}
						}

						productKitImage.attr('src', base_url_image + '/sku/thumb_' + data['img']).fadeIn(1000);

					} else {
						var productKitStock = self.closest('tr'),
							productKitSku = self.closest('tr').find('.product-sku');

						productKitStock.attr('data-stock', data['stock_item']);
						productKitSku.html('SKU: ' + data['sku_item']);
						update_unavailable_button($('.wrapper-btn-buy'), labelStamp);
					}
				}
			);
		}
	});

	function non_active_attribute(self) {
		ProductModel.id = $('h1.product-name').data('id');
		var labelStamp = $('.label-stamp-wrapper');
		var div_da_imagem = $('.product-main-image');
		var comb = $('#main-product-combination-list').find('.product-combination-list');

		var atributos_selecionados = ProductModel.getChecked(comb);

		if (self.prop('checked')) {

			ProductModel.find_det(
				atributos_selecionados,
				null,
				function (data) {
					if (data.id !== null) {

						var checkclass = 'product-comb-attribute';
						if (self[0]) {
							var combinationList = self[0].id;
							combinationList = $("#" + combinationList).closest('.wrapper-product-combination');
						}
						if (data['revendedor'] || data['cotacao']) {
							$('#tellme-sku').val(data['id']);
							update_sku($('.product-sku'), data['sku']);
							update_combinations(combinationList, checkclass, data['combinacoes']);
						} else {

							div_da_imagem.find('img').css('opacity', 1);
							$('.product-price').show();
							$('.product-amount .wrapper-product-price').show();

							if (data.estoque_disponivel == 0) {
								$('.wrapper-product-countdown').slideUp(500);
							} else {
								$('.wrapper-product-countdown').slideDown(500);
							}

							// Somente atualiza infos quando selecionadas todas combinacoes - ref 60183
							if (comb.length == atributos_selecionados.length) {

								update_stock($('h1.product-name'), data['id']);
								update_sku($('.product-sku'), data['sku']);
								update_amount(data);
								update_product_original_price(data);
								update_valor_venda_unitario(data['valor_venda_unitario']);
								update_product_price(data['valor_venda']);
								update_product_parcelled(data.dados_integradores['maximo_parcelas'], data['valor_parcelado']);
								update_price_off(data.dados_integradores['desconto_avista'], data['valor_avista']);
								update_deferred_payment(data.dados_integradores['pagamentos_parcelado'], data.integradores);
								update_progressive_discount(data['descontos'], data['valor_venda']);
								update_shipping(data);
							}

							update_combinations(combinationList, checkclass, data['combinacoes']); //

							if (data['disponivel'] == true) {
								labelStamp.find('.label-unavailable').hide();
								update_button_buy($('.wrapper-btn-buy'), data['label_comprar_detail']);
							} else {
								labelStamp.find('.label-unavailable').show();
								$('#tellme-sku').val(data['id']);
								update_tellme_price(data['exibe_preco_aviseme']);
								update_button_tellme($('.wrapper-btn-buy'), data['msg_aviseme']);
							}
						}

					} else {
						var unavailable = '<div class="label-stamp label-unavailable">Produto Indisponível</div>';
						labelStamp.find('.label-unavailable').remove();
						labelStamp.append(unavailable);
						div_da_imagem.find('img').css('opacity', 0.5);

						$('#tellme-sku').val(data['id']);
						update_stock($('.product-name'), '');
						update_tellme_price(data['exibe_preco_aviseme']);
						update_button_tellme($('.wrapper-btn-buy'), data['msg_aviseme']);
					}

					uncheckedatrributes();
				}
			);
		}
	}

	function active_atrribute(self) {

		ProductModel.id = $('h1.product-name').data('id');

		var labelStamp = $('.label-stamp-wrapper');
		var div_da_imagem = $('.product-main-image');
		var imagem = div_da_imagem.children().children('img');
		var comb = $('#main-product-combination-list').find('.product-combination-list');
		var atributos_selecionados = ProductModel.getChecked(comb);
		var div_video = div_da_imagem.find('.video-holder');


		if (self.prop('checked')) {

			ProductModel.find_det(
				atributos_selecionados,
				// Function Before Send
				function () { },
				// Function Sucess
				function (data) {
					if (data.id !== null) {
						var checkclass = 'product-comb-attribute';
						//var combinationList = self.closest('.wrapper-product-combination');
						if (self[0]) {
							var combinationList = self[0].id;
							combinationList = $("#" + combinationList).closest('.wrapper-product-combination');
						}
						if (data['ean']) {
							$('.product-codebar').show(100);
							$('.product-codebar span').html(data['ean']);
						}
						if (data['revendedor'] || data['cotacao']) {
							$('#tellme-sku').val(data['id']);
							update_sku($('.product-sku'), data['sku']);
							update_combinations(combinationList, checkclass, data['combinacoes']);
						} else {

							$('.product-price').show();
							$('.product-amount .wrapper-product-price').show();

							if (data.estoque_disponivel == 0) {
								$('.wrapper-product-countdown').slideUp(500);
							} else {
								$('.wrapper-product-countdown').slideDown(500);
							}

							// Somente atualiza infos quando selecionadas todas combinacoes - ref 60183
							if (comb.length == atributos_selecionados.length) {
								//
								update_product_big_price_unit_calculado(data['valor_venda_unitario']);
								update_sku($('.product-sku'), data['sku']);
								update_stock($('.product-name'), data['id']);
								update_amount(data);
								update_product_original_price(data);
								update_product_price(data['valor_venda']);
								update_product_parcelled(data.dados_integradores['maximo_parcelas'], data['valor_parcelado']);
								update_price_off(data.dados_integradores['desconto_avista'], data['valor_avista']);
								update_deferred_payment(data.dados_integradores['pagamentos_parcelado'], data.integradores);
								update_progressive_discount(data['descontos'], data['valor_venda']);
								update_shipping(data);
							}

							update_combinations(combinationList, checkclass, data['combinacoes']);

							if (data['disponivel'] == true) {
								labelStamp.find('.label-unavailable').hide();
								update_button_buy($('.wrapper-btn-buy'), data['label_comprar_detail']);
							} else {
								labelStamp.find('.label-unavailable').show();
								$('#tellme-sku').val(data['id']);
								update_tellme_price(data['exibe_preco_aviseme']);
								update_button_tellme($('.wrapper-btn-buy'), data['msg_aviseme']);
							}
						}

						// Imagens
						if (!isMobile) {

							imagem.unwrap();
							imagem.remove();
							$('.zoomContainer').remove();

							$('.product-main-image').html('<img src="' + base_url_image + '/sku/' + data['img'] + '" class="product-image-zoom" data-zoom-image="' + base_url_image + '/sku/' + data['img'] + '" />');
							$('.modal-product-image').children('img').attr('src', base_url_image + '/sku/thumb_' + data['img']).fadeIn(1000);

							update_thumbs($('.product-thumbnails-list'), data['thumbs']);

							$('.product-image-zoom').elevateZoom(elevateZoomConfig);
							addClassFirstThumb();
							div_da_imagem.append(div_video);
							hideProductVideo();

						} else {
							update_thumbs_mobile($('.product-main-image'), data['thumbs']);
						}

					} else {
						var unavailable = '<div class="label-stamp label-unavailable">Produto Indisponível</div>';
						labelStamp.find('.label-unavailable').remove();
						labelStamp.append(unavailable);

						$('#tellme-sku').val(data['id']);
						update_stock($('h1.product-name'), '');
						update_tellme_price(data['exibe_preco_aviseme']);
						update_button_tellme($('.wrapper-btn-buy'), data['msg_aviseme']);

						// Imagens
						if (!isMobile) {

							imagem.unwrap();
							imagem.remove();
							$('.zoomContainer').remove();

							$('.product-main-image').html('<img src="' + base_url_image + '/sku/' + data['img'] + '" class="product-image-zoom" data-zoom-image="' + base_url_image + '/sku/' + data['img'] + '" />');
							$('.modal-product-image').children('img').attr('src', base_url_image + '/sku/thumb_' + data['img']).fadeIn(1000);
							div_da_imagem.children('img').css('opacity', 0.5);

							update_thumbs($('.product-thumbnails-list'), data['thumbs']);

						} else {
							update_thumbs_mobile($('.product-main-image'), data['thumbs']);
						}
					}

					uncheckedatrributes();
				}
			);
		}
	}
	function select_atrribute(self) {
		ProductModel.id = $('h1.product-name').data('id');

		if (self.val() != '0') {

			var labelStamp = $('.label-stamp-wrapper');
			var div_da_imagem = $('.product-main-image');
			var div_video = div_da_imagem.find('.video-holder');
			var imagem = div_da_imagem.children().children('img');

			var comb = $('#main-product-combination-select').find('.product-combination-select');
			var atributos_selecionados = ViewFunctions.getSelected(comb);

			ProductModel.find_det(
				atributos_selecionados,
				function () { },
				function (data) {

					if (data.id !== null) {

						if (data['revendedor'] || data['cotacao']) {

							$('#tellme-sku').val(data['id']);
							update_sku($('.product-sku'), data['sku']);
							update_product_select_box(data.combinacoes, atributos_selecionados);

						} else {

							$('.product-price').show();
							$('.product-amount .wrapper-product-price').show();

							if (atributos_selecionados.length > 0) {
								update_product_select_box(data.combinacoes, atributos_selecionados);
							}

							if (comb.length == atributos_selecionados.length) {

								update_product_big_price_unit_calculado(data['valor_venda_unitario']);
								update_sku($('.product-sku'), data['sku']);
								update_stock($('.product-name'), data['id']);
								update_amount(data);
								update_product_original_price(data);
								update_product_price(data['valor_venda']);
								update_product_parcelled(data.dados_integradores['maximo_parcelas'], data['valor_parcelado']);
								update_price_off(data.dados_integradores['desconto_avista'], data['valor_avista']);
								update_deferred_payment(data.dados_integradores['pagamentos_parcelado'], data.integradores);
								update_progressive_discount(data['descontos'], data['valor_venda']);
								update_shipping(data);
							}

							if (data['disponivel'] == true) {
								labelStamp.find('.label-unavailable').hide();
								update_button_buy($('.wrapper-btn-buy'), data['label_comprar_detail']);
							} else {
								labelStamp.find('.label-unavailable').show();
								$('#tellme-sku').val(data['id']);
								update_tellme_price(data['exibe_preco_aviseme']);
								update_button_tellme($('.wrapper-btn-buy'), data['msg_aviseme']);
							}
						}

						// Imagens
						if (self.hasClass('active-attribute')) {
							if (!isMobile) {

								imagem.unwrap();
								imagem.remove();
								$('.zoomContainer').remove();

								$('.product-main-image').html('<img src="' + base_url_image + '/sku/' + data['img'] + '" class="product-image-zoom" data-zoom-image="' + base_url_image + '/sku/' + data['img'] + '" />');
								$('.modal-product-image').children('img').attr('src', base_url_image + '/sku/thumb_' + data['img']).fadeIn(1000);

								update_thumbs($('.product-thumbnails-list'), data['thumbs']);

								$('.product-image-zoom').elevateZoom(elevateZoomConfig);
								addClassFirstThumb();
								div_da_imagem.append(div_video);
								hideProductVideo();

							} else {
								update_thumbs_mobile($('.product-main-image'), data['thumbs']);
							}
						}

					} else {

						var unavailable = '<div class="label-stamp label-unavailable">Produto Indisponível</div>';
						labelStamp.find('.label-unavailable').remove();
						labelStamp.append(unavailable);

						$('#tellme-sku').val(data['id']);
						update_stock($('h1.product-name'), '');
						update_tellme_price(data['exibe_preco_aviseme']);
						update_button_tellme($('.wrapper-btn-buy'), data['msg_aviseme']);
					}
				}
			);
		}
	}

	function update_product_select_box(combinacoes, selecionados) {
		var ids_selected = [];
		selecionados.forEach((selected, index) => {
			ids_selected.push(selected.combinacao_id);
		});
		combinacoes.forEach((combinacao, index) => {
			var selected = false;
			$('#combination-select-' + combinacao.id).html('');
			$('#combination-select-' + combinacao.id).append('<option value="0">Escolha uma Opção</option>');
			combinacao.CombinacaoAtributo.forEach((atributo, jindex) => {
				$('#combination-select-' + combinacao.id).append('<option value="' + atributo.id + '" ' + (atributo.selecionado ? 'selected' : '') + '>' + atributo.nome + '</option>');
				if (atributo.selecionado) {
					selected = atributo.id;
				}
			});
			if (ids_selected.includes(combinacao.id) && selected) {
				$('#combination-select-' + combinacao.id).val(selected);
			}
		});
	}

	function showTellMe() {
		const modal = $('#modal-tell-me');

		modal.removeClass().addClass('modal modal-tell-me');
		modal.find('.modal-header-title').text('Avise-me quando disponível');
		modal.find('.modal-footer').each(function () {
			$(this).find('.btn').hide();
			$(this).find('#tellme-btn').show();
		});

		$('#modal-recommend').hide();
		$('#modal-rating').hide();
		$('#modal-product-tellme').show();

		$.modal.show('fadeInDown', 'modal-tell-me');
	}

	function uncheckedQuestions() {
		valid = true;
		var label = '';
		var length = 0;

		if ($('.product-custom-question').length > 0) {
			$('.product-custom-question').each(function () {

				label = $(this).closest('.row').find('.product-question-item-title').text();
				length = $(this).val().length;

				if ($(this).hasClass('error')) {
					$(this).removeClass('error');
					$(this).closest('div').find('label.error').remove();
				}

				/** Pergunta Obrigatoria **/
				if ($(this).prop('required') && length == 0) {


					if ($(this).prop('dataset')['question'] == "NOME DO PRESENTEADO") {

						$(this).addClass('error').after('<label class="error">INFORME O NOME DE QUEM IRÁ RECEBER O VALE PRESENTE</label>');

					} else if ($(this).prop('type') == 'email' && $(this).prop('dataset')['question'] == "EMAIL DO PRESENTEADO") {

						$(this).addClass('error').after('<label class="error">INFORME O E-MAIL DE QUEM IRÁ RECEBER O VALE PRESENTE</label>');

					} else {

						$(this).addClass('error').after('<label class="error">Informe o campo ' + label + '</label>');
					}
					valid = false;
				} else if (
					($(this).prop('type') == 'email') &&
					(!verificaValorEmail($(this).val())) &&
					(length > 0)
				) {
					$(this).addClass('error').after('<label class="error">Digite um e-mail válido</label>');
					valid = false;
				}
			});
		}

		return valid;
	}

	function uncheckedatrributesLabels() {
		var labelMessage = new Array();
		var label = '';

		$('.product-combination-list').each(function () {
			label = $(this).prev().text();
			labelMessage[labelMessage.length] = label;
		});

		return labelMessage;
	}

	function uncheckedatrributes() {

		$('.product-combination-list').each(function () {
			var label = $(this).prev().text();
			var length = $(this).children('.product-combination-active').length;

			if (length === 0 && !$(this).hasClass('error')) {
				$(this).addClass('error').after('<label class="error">Selecione opção de ' + label + '</label>')
			}
		});
	}

	function uncheckAtrributesCompoundedKit() {

		$('.product-combination-list').each(function () {
			$(this).children('.product-combination-active').removeClass('product-combination-active');
			$(this).find('input:checked').prop('checked', false);
		});
	}

	function checkedatrributesCompoundedPro() {
		var combinations = $('#main-product-combination-list').find('.product-combination-list');

		if (combinations.length > 0) {

			var combAtributes = null;

			$.each(combinations, function () {

				combAtributes = $(this).find('li.product-combination-item');
				if (combAtributes.length == 1) {
					combAtributes.find('.product-comb-attribute').trigger('click');
				}
			});
		}
	}

	function checkedatrributesCompoundedKit() {
		var tableKit = $('.table-kit').find('.product-kit');

		if (tableKit.length > 0) {

			var combinations = null,
				liCombination = null;

			$.each(tableKit, function () {
				combinations = $(this).find('.product-combination-list li');
				if (combinations.length == 1) {
					liCombination = combinations.find('.kit-comb-attribute');
					$(liCombination).trigger('click');
				}
			});
		}
	}

	/* Valida Kit quando Alterado Elemento de Quantidade (Kit Composto) */
	function validateCompoundedKit() {
		var tableKit = $('.table-kit').find('.product-kit');
		if (tableKit.length > 0) {

			/* Kit com Combinação - Seleciona Primeira linha que tenha li com Combinação */
			combinations = tableKit.first().find('.product-combination-list li');
			if (combinations.length > 0) {

				var atribute = null;

				/* Verifica se existe Atributo Ativo */
				atribute = tableKit.first().find('.product-combination-list').find('.product-combination-active');
				if (atribute.length > 0) {

					liCombination = atribute.find('.kit-comb-attribute');
					$(liCombination).trigger('click');

				} else {
					/* Seleciona Primeira Combinação */
					combination = tableKit.first().find('.product-combination-list li').first();

					liCombination = combination.find('.kit-comb-attribute');
					$(liCombination).trigger('click');
				}
			}
		}
	}

	$(document).on('click', '.btn-disabled', function () {
		return false;
	});

	$(document).on('click', '.btn-buy', async function (e) {
		let isValid = await valid_values();
		if (!isValid) return;

		ProductModel.id = $('h1.product-name').data('id');
		ProductModel.amount = 1;

		if ($('#product-amount').length > 0) {
			var productAmount = $('#product-amount').val();
			ProductModel.amount = ($('#product-amount-decimal').length > 0) ? productAmount + ',' + $('#product-amount-decimal').val() : productAmount;
		}

		var { comb, checked, divCombination } = ViewFunctions.getCombinations();
		var conta_marcados = checked.length;
		var conta_combinacoes = comb.length;

		var perguntas = $(".product-custom-question[required='required']");
		var perguntasArray = ProductModel.getQuestions($('.product-custom-question'));

		var pagarDepois = $(this).hasClass('btn-pay-later');
		ProductModel.payLater = (pagarDepois) ? 1 : 0;

		if (perguntasArray.length > 0 && perguntasArray[0].error) {
			$.message.show('error', {
				vars: {
					title: perguntasArray[0].msg
				},
				idleTime: 4000
			});
			return false;

		} else if (!uncheckedQuestions()) {
			var labelCustom = $('.product-question-title').html();

			if (labelCustom.length == 0) {
				labelCustom = 'Perguntas Customizadas';
			}

			$.message.show('error', {
				vars: {
					title: 'Você precisa preencher todos os campos de ' + labelCustom + '.'
				},
				idleTime: 4000
			});

			return false;
		}

		if (conta_combinacoes == conta_marcados) {

			e.preventDefault();
			var self = $(this);
			var btnIcon = self.children('.btn-icon');

			// Previne clique duplo (soh libera o botao depois de executar o ajax)
			if (!self.hasClass('btn-disabled')) {

				self.addClass('btn-disabled');
				btnIcon.addClass('loading-button');
				$('.loading-page').show();

				ProductModel.cartCreateProduct(checked, perguntasArray,
					function () {
						//beforeSave
					},
					function (cart) {
						if (!cart['alerta_quantidade']) {
							var el = $('.shopping-cart-total-price');
							var img = $('.modal-product-image').children('img');

							if (img.length) {
								img = img[0];
							}

							App.addProductIcon(cart, img);
							App.refreshCartIcon(cart);

							/** Mobile Config **/
							if (isMobile) {
								cart.acao_comprar = cart.acao_comprar_mobile;
							}

							if (cart.acao_comprar == '3' || cart.acao_comprar == '4') {

								var uri = base_url + 'carrinho';
								$(location).attr("href", uri);

							} else {

								$('.loading-page').hide();
								btnIcon.removeClass('loading-button');
								$.message.show(cart.continuar_comprando);
							}

						} else if (cart['alerta_quantidade'] == true) {

							$('.loading-page').hide();
							btnIcon.removeClass('loading-button');
							$.message.show('error', {
								vars: {
									title: 'Quantidade não disponível em estoque!'
								},
								idleTime: 4000
							});

						} else {

							$('.loading-page').hide();
							btnIcon.removeClass('loading-button');
							$.message.show('error', {
								vars: {
									title: cart['alerta_quantidade'].replace(".", ",")
								},
								idleTime: 4000
							});
						}

						setTimeout(function () {
							self.removeClass('btn-disabled');
						}, 1100);
					}
				);
			}

		} else {

			var labelMessage = uncheckedatrributesLabels();
			$.message.show('error', {
				vars: {
					title: 'Você precisa selecionar as combinações:<br/>' + labelMessage.join(", ")
				},
				idleTime: 4000
			});

			$('html, body').animate({
				scrollTop: divCombination.top - 100
			}, 350);

			// Adiciona mensagem de erro quando não existe combinação selecionada
			uncheckedatrributes();
		}
	});

	$(document).on('click', '.btn-buy-kit', function (e) {
		$('.loading-page').show();

		var kit = $('.table-kit').find('.product-kit');
		var kitId = $('.table-kit').data('kit');
		var valid = validBuyKit(kit);
		var validQuestions = validQuestionsKit(kit);

		if (valid && validQuestions) {

			var self = $(this);
			var btnIcon = self.children('.btn-icon');
			var checked = new Array();

			btnIcon.addClass('loading-button');

			// Quantidade eh 1, se existir o box de quantidade, pega o valor que tem nele
			ProductModel.amount = 1;
			if ($('#product-amount').length > 0) {
				ProductModel.amount = $('#product-amount').val();
			}

			// Pega os estoques ID selecionados para compra
			$.each(kit, function () {

				ProductModel.id = $(this).data('product');
				ProductModel.kitId = kitId;

				var perguntas = $(this).find('.product-custom-question');
				var perguntasArray = ProductModel.getQuestions(perguntas);

				checked[checked.length] = {
					'id': $(this).attr('data-id'),
					'produto_id': $(this).attr('data-product'),
					'produto_estoque_id': $(this).attr('data-stock'),
					'quantity': $(this).find(".product-amount").text(),
					'quantity_kit': ProductModel.amount,
					'name': $(this).find(".product-name").text(),
					'price': $(this).find(".product-big-price").text(),
					'Pergunta': JSON.stringify(perguntasArray)
				}
			});
			
			ViewFunctions.dataLayerExtraInfoKits(checked);

			ProductModel.cartCreateProductKitUnique(checked, null,
				function (cart) {
					if (!cart['alerta_quantidade']) {
						var el = $('.shopping-cart-total-price');
						var img = $(this).find('img');

						App.refreshCartIcon(cart);
						App.addProductIcon(cart, img);

						uncheckAtrributesCompoundedKit();
						checkedatrributesCompoundedKit();

						$('.loading-page').hide();

						if (cart.acao_comprar == '3' || cart.acao_comprar == '4') {

							var uri = base_url + 'carrinho';
							$(location).attr("href", uri);

						} else {
							$.message.show(cart.continuar_comprando);
						}

					} else {
						$('.loading-page').hide();
						$.message.show('error', {
							vars: {
								title: 'Quantidade não disponível em estoque!'
							},
							idleTime: 4000
						});
					}
				}
			);

			setTimeout(function () {
				btnIcon.removeClass('loading-button');
			}, 500);

		} else if (!validQuestions) {

			$('.loading-page').hide();

		} else {
			$('.loading-page').hide();
			$.message.show('error', {
				vars: {
					title: 'Você precisa selecionar as combinações dos itens.'
				},
				idleTime: 4000
			});
		}

	});

	$(document).on('click', '.btn-buy-all', function (e) {
		$('.loading-page').show();

		e.preventDefault();

		var checked = new Array();
		var list = $('#product-list').find('li');

		if (list.length) {

			ProductModel.id = $('h1.product-name').data('id');

			$.each(list, function () {

				// Somente os itens selecionados
				if ($(this).find('.product-buy-all-quantity').length > 0 && $(this).find('.product-buy-all-quantity').val() > 0) {

					checked[checked.length] = {
						'produto_estoque_id': $(this).attr('data-sku'),
						'quantidade': $(this).find('.product-buy-all-quantity').val()
					}
				}
			});
		}

		if (checked.length > 0) {

			route = WsRouter.generateRoute(null, 'carrinhos', 'createProductMultiple', ProductModel.id);

			WsDispatcher.postRequest(route, { 'Itens': checked }, null, function (data) {

				if (data.success) {

					var uri = base_url + 'carrinho';
					$(location).attr("href", uri);

				} else {

					$.message.show('error', {
						vars: {
							title: 'Itens com quantidade indisponível no estoque!',
							content: data.alerta_quantidade.join('<br/>')
						},
						idleTime: 4000
					});
				}
			});

		} else {

			$('.loading-page').hide();
			$.message.show('warning', {
				vars: {
					title: 'Nenhum item foi selecionado para compra'
				},
				idleTime: 4000
			});
		}
	});

	$(document).on('click', '#budget-btn', function (e) {

		e.preventDefault();

		if ($('#form-budget').valid()) {

			$('#budget-btn').find('span.btn-text').addClass('loading-button');
			$('#form-budget').attr('data-submit', 'true');
			grecaptcha.execute();
		}
	});

	$('.product-buy-all-quantity').change(function () {

		var self = $(this);

		if (self.val() > 0)
			self.closest('li').addClass('product-list-item-active');
		else
			self.closest('li').removeClass('product-list-item-active');
	});

	$(document).on('click', '.show-modal-video', function (e) {
		$.modal.show('fadeInDown', 'modal-youtube-video');
		$('.modal-mask').addClass('youtube-mask');
	});

	function stopVideoOnCloseModal() {
		const youtubePlayer = $("#youtube-player");
		const videoSrc = youtubePlayer.attr("src");

		youtubePlayer.removeAttr("src");
		youtubePlayer.attr("src", videoSrc);

		$('.modal-mask').removeClass('youtube-mask');
	}

	$(document).on('click', '#modal-youtube-video .modal-close, .modal-mask.youtube-mask', function () {
		stopVideoOnCloseModal();
	});

	$(document).on('click', '.modal-close', function () {
		setTimeout(function () {
			$('.wrapper-form-modal, #div-captcha').hide();
		}, 500);

		var form = $('form[data-submit="true"]');
		form.attr('data-submit', 'false');
		$.modal.hide('fadeInUp', 'modal-tell-me');
	});

	if (isMobile) {
		$(document).on('click', '.btn-budget', function () {
			var comb = $('#main-product-combination-list').find('.product-combination-list');
			checked = ProductModel.getChecked(comb);
			contaMarcados = checked.length;
			contaCombinacoes = comb.length;

			if (contaCombinacoes == contaMarcados) {
				recaptchaReset();
				$('.wrapper-form-modal, #div-captcha').show();

				positionModalBudget = $(window).scrollTop();

				var modal = $(modal),
					wHeight = $(window).height();

				$('body').css('overflow-y', 'hidden');

				setTimeout(function () {
					$('.wrapper').css({
						'overflow-y': 'hidden',
						'height': wHeight
					});
				}, 300);

				$('#modal-budget').addClass('open');
			} else {
				$.message.show('error', {
					vars: {
						title: 'Para fazer a cotação é preciso selecionar todas as combinações.'
					},
					idleTime: 4000
				});
			}
		});

		$(document).on('click', '.modal-close', function () {
			$('body').css('overflow-y', 'auto');
			$('.wrapper').removeAttr('style');
			$(window).scrollTop(positionModalBudget);
			$('.modal-x.open').removeClass('open');
			$('.modal-mask').hide();
		});

	} else {

		$(document).on('click', '.btn-budget', function () {
			var comb = $('#main-product-combination-list').find('.product-combination-list');
			checked = ProductModel.getChecked(comb);
			contaMarcados = checked.length;
			contaCombinacoes = comb.length;

			if (contaCombinacoes == contaMarcados) {
				recaptchaReset();
				$('.wrapper-form-modal, #div-captcha').show();
				$.modal.show(null, 'modal-budget');
			} else {
				$.message.show('error', {
					vars: {
						title: 'Para fazer a cotação é preciso selecionar todas as combinações.'
					},
					idleTime: 4000
				});
			}
		});

	}


	$('#CotacaoCep').blur(function () {

		var self = $(this);
		if (self.val() !== '') {
			$('#CotacaoLogradouro, #CotacaoBairro, #CotacaoCidade, #CotacaoEstado').addClass('input-loading');

			var route = WsRouter.generateRoute(null, 'api', 'getEnderecoByCep');
			WsDispatcher.postRequest(route, {
				'cep': self.val()
			}, null, function (data) {

				$('#CotacaoEstado').val(data.estado).removeClass('input-loading');
				$('#CotacaoCidade').val(data.cidade).removeClass('input-loading');
				$('#CotacaoBairro').val(data.bairro).removeClass('input-loading');
				$('#CotacaoLogradouro').val(data.logradouro).removeClass('input-loading');
			});
		}
	});

	$(document).on('click', '.btn-tell-me', function (e) {

		var { comb, checked, divCombination } = ViewFunctions.getCombinations();
		var conta_marcados = checked.length;
		var conta_combinacoes = comb.length;

		if (conta_combinacoes == conta_marcados) {

			showTellMe();

		} else {

			$.message.show('error', {
				vars: {
					title: 'Você precisa selecionar todas as combinações para receber o aviso.'
				},
				idleTime: 4000
			});
		}
	});

	$('.link-tell-me').click(function () {

		var self = $(this);
		var formSelect = '';
		var combs = new Array();

		if (!self.hasClass('link-tell-me-loading')) {

			self.addClass('link-tell-me-loading');

			// Atributos no formato select Box
			if ($('#main-product-combination-select').length > 0) {

				combs.push(self.attr('data-comb1'));
				combs.push(self.attr('data-comb2'));
				combs.push(self.attr('data-comb3'));

				// Seleciona o produto correspondente no form select para acionar o aviseme
				$(combs).each(function (index, element) {
					if (element != '0') {

						element = element.split('-');
						formSelect = '#combination-select-' + element[0];
						$(formSelect).val(element[1]);
					}
				});

				$('#main-product-combination-select').find('.product-combination-select').first().trigger("change");

			} else {

				var skuId = self.closest('li').attr('data-sku');
				$('#tellme-sku').val(skuId);
			}

			setTimeout(function () {
				showTellMe();
				self.removeClass('link-tell-me-loading');
			}, 500);
		}
	});

	$('.product-ratings-link').click(function () {
		const modal = $('#modal-tell-me');

		modal.removeClass().addClass('modal modal-rating');
		modal.find('.modal-header-title').text('Faça uma avaliação deste produto');
		modal.find('.modal-footer').each(function () {
			$(this).find('.btn').hide();
			$(this).find('#rating-btn').show();
		});

		$('#modal-recommend').hide();
		$('#modal-product-tellme').hide();
		$('#modal-rating').show();

		$.modal.show('fadeInDown', 'modal-tell-me');
	});

	$('#tellme-email').on('change', function () {

		var email = $(this).val();
		var emailValidado = validateEmail(email);

		if (emailValidado) {
			$('.modal-footer .btn').css('pointer-events', 'auto');

			var error = '';
			$('#g-recaptcha-response-error').remove();
			$('#modal-product-tellme').append(error);

		} else {
			$('.modal-footer .btn').css('pointer-events', 'none');

			var error = '<label id="g-recaptcha-response-error" class="error" for="g-recaptcha-response">E-mail Inválido!</label>';
			$('#g-recaptcha-response-error').remove();
			$('#modal-product-tellme').append(error);

		}
	});

	$(document).on('click', '.rating-stars', function () {
		$('.wrapper-form-modal, #div-captcha').show();

		var stars = null;
		var classes = $(this).prop('class').split(' ');

		stars = classes[1];
		$('#rating-avaliacao').val(stars.substring(5));

		$(this).parents('.product-rating').removeClass('star-1 star-2 star-3 star-4 star-5').addClass('star-' + stars.substring(5));
	});

	// ElevateZoom
	var elevateZoomConfig = {
		borderSize: 1,
		borderColour: '#ddd',
		lensBorder: 1,
		lensBorderColour: "#ddd",
		cursor: 'pointer',
		tint: true,
		tintColour: '#fff',
		tintOpacity: 0.5,
		zoomWindowPosition: 1,
		zoomWindowOffetx: 20,
		gallery: 'thumbnails-list',
		galleryActiveClass: 'active',
		//loadingIcon: base_url + 'img/frontend/bg-transparent.png'
	};

	if ($('.product-image-zoom').length > 0) {
		$('.product-image-zoom').elevateZoom(elevateZoomConfig);
		hideZoom();
	}

	// o click da li ou do a da ul.product-thumbnails-list
	// nao funciona devido a um conflito com o elevateZoom
	$(document).on('click', '.link-thumbnail', function () {
		$(this).prev('a').trigger('click');

		$('.zoomContainer').show();
		$('.zoomContainer').removeClass('hide-zoom');
		hideProductVideo();

		$('.product-main-image').find('source').remove();
	});

	$(document).on('click', '#open-video-product', function () {
		showProductVideo();
	});

	addClassFirstThumb();

	function addClassFirstThumb() {
		$('#thumbnails-list').find('li:first-child').each(function () {
			$(this).children('a').addClass('active');
		});
	}

	function showProductVideo() {
		$('.product-thumbnails-list').find('.active').removeClass('active');
		$('.product-thumbnails-list').find('.product-video-item').children('#open-video-product').addClass('active');
		$('.video-holder').addClass('active');
		$('.product-main-image').addClass('video-active');
		$('.zoomContainer').addClass('hide-zoom');
	}


	function hideProductVideo() {
		$('.product-main-image').removeClass('video-active');
		$('.video-holder').removeClass('active');
		$('#thumbnails-list').find('.product-video-item').children('#open-video-product').removeClass('active');
		$('.player-yt').attr('src', $('.player-yt').attr('src'));
	}

	function update_sku(sku, new_sku) {
		sku.html('');
		sku.html('Sku: <span itemprop="sku" content="' + new_sku + '">' + new_sku + '</span>');
	}

	function update_amount(params) {

		var maximo = $('.product-max-amount').length;
		var minimo = $('.product-min-amount').length;
		var dispo = $('.product-aval-amount').length;
		var measure = $('#product-measure').length;
		var parity = 1;

		// Incremento da unidade de medida
		if (measure > 0) {
			parity = parseInt($('#product-measure').val());
		}

		// Tem Paridade maior que 1
		if (measure > 0 && parity > 1) {

			measure = parseFloat($('#product-amount').attr('data-multi')).toFixed(2).replace('.', ',');

			$('.product-min-amount').hide();
			$('#product-amount').val(measure);

		} else {

			if (params['compra_minima'] <= 1) {
				$('.product-min-amount').hide();
				$('#product-amount').val(1);
			} else {
				$('.product-min-amount').show();

				$('.product-min-amount').children('span:nth-child(1)').html(params['compra_minima']);
				$('#product-amount').val(params['compra_minima']);
			}
		}

		if (params['compra_maxima'] > 0) {
			$('.product-max-amount').show();
			$('.product-max-amount').children('span:nth-child(1)').html(params['compra_maxima']);
		} else {
			$('.product-max-amount').hide();
		}

		if (dispo) {
			$('.product-aval-amount').children('span:nth-child(1)').html(params['estoque_disponivel']);
		}
	}

	function update_stock(stock, new_stock) {
		stock.attr('data-stock', new_stock);
	}

	function update_button_buy(button, label_comprar) {
		button.html('');

		var button_buy =
			'<a href="javascript:;" class="btn btn-buy">' +
			'<span class="icon-basket btn-icon"></span>' +
			'<span class="btn-text">' + label_comprar + '</span>' +
			'</a>';

		var button_favorite =
			'<a href="javascript:;" class="btn btn-favorite">' +
			'<span class="icon-favorite btn-icon"></span>' +
			'<span class="btn-text">Adicionar aos Favoritos</span>' +
			'</a>';

		if (isMobile) {
			if ($('.has-btn-favorite').length > 0) {
				button.html(button_buy + button_favorite);
				$('.wrapper-btn-fixed').removeClass('disabled');
			} else {
				button.html(button_buy);
				$('.wrapper-btn-fixed').removeClass('disabled');
			}
		} else {
			button.html(button_buy);
		}
	}

	function update_button_buyKit(button, label_comprar) {
		$('.btn-text-unavailable-kit').hide();

		button.html('');

		var button_buy =
			'<a href="javascript:;" class="btn btn-buy-kit">' +
			'<span class="icon-basket btn-icon"></span>' +
			'<span class="btn-text">' + label_comprar + '</span>' +
			'</a>';

		button.html(button_buy);
		$('.btn-buy-kit').show();
		$('.wrapper-btn-fixed').removeClass('disabled');
	}

	function update_button_tellme(button, message) {
		button.html('');

		if (!isMobile) {
			var button_tellme =
				'<a href="javascript:;" class="btn btn-tell-me">' +
				'<span class="icon-basket btn-icon"></span>' +
				'<span class="btn-text">' + message + '</span>' +
				'</a>';

			button.html(button_tellme);
		} else {
			var button_tellme =
				'<a href="#modal-tell-me" class="btn btn-tell-me">' +
				'<span class="icon-basket btn-icon"></span>' +
				'<span class="btn-text">' + message + '</span>' +
				'</a>';

			var button_favorite =
				'<a href="javascript:;" class="btn btn-favorite">' +
				'<span class="icon-favorite btn-icon"></span>' +
				'<span class="btn-text">Adicionar aos Favoritos</span>' +
				'</a>';

			if ($('.has-btn-favorite').length > 0) {
				button.html(button_tellme + button_favorite);
				$('.wrapper-btn-fixed').addClass('disabled');
			} else {
				button.html(button_tellme);
				$('.wrapper-btn-fixed').addClass('disabled');
			}
		}
	}

	function update_unavailable_buttonKit(button) {

		$('.btn-text-unavailable-kit').show();
		$('.wrapper-btn-fixed').addClass('disabled');
	}

	function update_unavailable_button(button, labelStamp) {
		button.html('');

		var button_unavailable = '<span class="btn-text-unavailable">Indisponível</span>';
		var unavailable = '<div class="label-stamp label-unavailable">Produto Indisponível</div>';

		labelStamp.find('.label-unavailable').remove();
		labelStamp.append(unavailable);
		button.html(button_unavailable);
		$('.btn-buy-kit').hide();
		$('.wrapper-btn-fixed').addClass('disabled');
	}

	function update_tellme_price(exibe_preco) {
		if (exibe_preco == '0')
			clear_price();
	}

	function clear_price() {
		$('.product-sku').html('');
		$('.element-product-detail').find('.product-old-price').children('span:nth-child(2)').html('');
		$('.element-product-detail').find('.product-new-price').children('span:nth-child(2)').html('');
		$('.element-product-detail').find('.product-parcelled-price').find('span').html('');
		$('.element-product-detail').find('.product-price-off').find('span').html('');
		$('.element-product-detail').find('.product-price').hide();
		$('.product-amount .wrapper-product-price').hide();
		$('.box-payment-off').hide();
		$('.box-payment-parceled').hide();
	}

	function update_product_original_price(product) {
		if (product['promocao'] && product['valor_original'] !== null) {
			$('.element-product-detail').find('.label-promo').html(product['percentual_promocao']);
			$('.element-product-detail').find('.label-promo').show();
			$('.element-product-detail').find('.product-old-price').show();
			$('.element-product-detail').find('.product-old-price').children('span:nth-child(1)').html('de ');
			$('.element-product-detail').find('.product-old-price').children('span:nth-child(2)').html(accounting.formatMoney(product['valor_original']));
		} else {
			$('.element-product-detail').find('.product-old-price').find('span').html('');
			$('.element-product-detail').find('.product-old-price').hide();
			$('.element-product-detail').find('.label-promo').hide();
		}
	}

	function update_product_price(valor_venda) {
		$('.element-product-detail').find('.product-new-price').children('span:nth-child(2)').html('');
		$('.element-product-detail').find('.product-new-price').children('span:nth-child(2)').html(accounting.formatMoney(valor_venda));

		if ($('.element-product-detail').find('.product-new-price-two').length > 0) {
			$('.element-product-detail').find('.product-new-price-two').children('.product-sell-value').html('');
			$('.element-product-detail').find('.product-new-price-two').children('.product-sell-value').html(accounting.formatMoney(valor_venda));
		}
	}

	function update_valor_venda_unitario(valor_unitario) {
		if ($('.element-product-detail').find('.product-new-price .product-big-price-unit').length > 0) {
			var texto = $('.element-product-detail').find('.product-new-price .product-big-price-unit').html();

			$('.element-product-detail').find('.product-new-price .product-big-price-unit').html(accounting.formatMoney(valor_unitario));
		}
	}

	function update_product_big_price_unit(valor_venda, quantidade) {

		quantidade = parseFloat(quantidade.replace(",", "."));

		let valor_unitario = valor_venda / quantidade;

		if ($('.element-product-detail').find('.product-new-price .product-big-price-unit').length > 0) {
			$('.element-product-detail').find('.product-new-price .product-big-price-unit').html('');
			$('.element-product-detail').find('.product-new-price .product-big-price-unit').html(accounting.formatMoney(valor_unitario));
		}

	}

	function update_product_big_price_unit_calculado(valor_venda_uni) {

		if ($('.element-product-detail').find('.product-new-price .product-big-price-unit').length > 0) {
			$('.element-product-detail').find('.product-new-price .product-big-price-unit').html('');
			$('.element-product-detail').find('.product-new-price .product-big-price-unit').html(accounting.formatMoney(valor_venda_uni));
		}

	}

	function update_product_parcelled(parcelas, valor_parcelado) {
		$('.element-product-detail').find('.product-parcelled-price').children('.parcel-number').html('');
		$('.element-product-detail').find('.product-parcelled-price').children('.parcel-number').html(parcelas + 'x');
		$('.element-product-detail').find('.product-parcelled-price').children('.parcel-value').html('');
		$('.element-product-detail').find('.product-parcelled-price').children('.parcel-value').html(accounting.formatMoney(valor_parcelado));

		if (valor_parcelado > 0) {
			$('.product-parcelled-price').css('display', 'block');
			$('.wrapper-product-parcels').css('display', 'block');
		} else {
			$('.product-parcelled-price').css('display', 'none');
			$('.wrapper-product-parcels').css('display', 'none');
		}
	}

	function update_price_off(desconto, valor_avista) {
		if (desconto > 0) {

			$('.element-product-detail').find('.product-price-off').children('span:nth-child(1)').html('');
			$('.element-product-detail').find('.product-price-off').children('span:nth-child(2)').html('');

			if ($(".desconto_avista").length > 0 || $(".desconto_parcela").length > 0) {

				if ($(".desconto_avista").length > 0) {
					$('.element-product-detail').find('.product-price-off').children('.desconto_avista').html(accounting.formatMoney(valor_avista));
				}

				if ($(".desconto_parcela").length > 0) {
					$('.element-product-detail').find('.product-price-off').children('.desconto_parcela').html(desconto + '%');
				}

			} else {
				$('.element-product-detail').find('.product-price-off').children('span:nth-child(1)').html(accounting.formatMoney(valor_avista)); //AQUI
				$('.element-product-detail').find('.product-price-off').children('span:nth-child(2)').html(desconto + '%');
			}

		}
	}

	function update_cash_payment(valor_venda, pagamentos_avista, integradores) {

		var lista = $('#cash-payment-list');
		lista.empty();
		$.each(integradores, function (idx, integrador) {
			if (integrador.numero_parcelas == 1) {

				if (integrador.desconto && integrador.desconto > 0) {
					var linha =
						'<li>' +
						'   <span>' + integrador.nome + '</span> - ' +
						'<span>' + accounting.formatMoney(integrador.valor_avista) + '</span>' +
						'- <span>c/ desconto de ' + integrador.desconto + '%</span>' +
						'</li>';
				} else {
					var linha =
						'<li>' +
						'<span>' + integrador.nome + '</span> - ' +
						'<span>' + accounting.formatMoney(valor_venda) + '</span>' +
						'</li>';
				}

				lista.append(linha);
			}
		})
	}

	function update_deferred_payment(pagamentos_parcelado, integradores) {

		if (!isMobile) {

			var pagamentos = $('#tabs-payment'),
				abas = '',
				parcelas = '';

			pagamentos.html('');
			abas += '<ul>';

			// Abas
			$.each(integradores, function (index, integrador) {
				if (integrador.numero_parcelas > 1) {
					abas += '<li><a href="#' + integrador.slug.replace("icon-payment-", "") + '">' + integrador.nome + '</a></li>';
				}
			});

			abas += '</ul>';
			pagamentos.append(abas);

			// Parcelas
			$.each(integradores, function (index, integrador) {
				if (integrador.numero_parcelas > 1) {

					parcelas += '<div id="' + integrador.slug.replace("icon-payment-", "") + '"><table id="deferred-payment">';

					if (typeof integrador.Parcelas !== 'undefined' && integrador.Parcelas.length > 0) {

						$.each(integrador.Parcelas, function (index2, parcela) {
							parcelas +=
								'<tr>' +
								'<td class="parcel-number">' +
								'<span class="parcel-number">' + parcela.numero + 'x</span>' +
								'</td>' +
								'<td>de</td>' +
								'<td class="parcel-price">' +
								'<span class="parcel-price">R$ ' + parcela.valor_parcela.toFixed(2).replace('.', ',') + '</span>' +
								'</td>' +
								'<td class="parcel-desc">' +
								'<span>' + parcela.descricao + '</span>' +
								'</td>' +
								'<td class="parcel-total"> ' +
								'<span>Total: R$ ' + parcela.total_parcela.replace('.', ',') + '</span>' +
								'</td>' +
								'</tr>';
						});
					}

					parcelas += '</table></div>';
				}
			});

			pagamentos.append(parcelas);
			pagamentos.tabs('destroy')
			pagamentos.tabs();

		} else {
			update_deferred_payment_mobile(pagamentos_parcelado, integradores);
		}
	}

	function update_deferred_payment_mobile(pagamentos_parcelado, integradores) {

		var pagamentos = $('#mobile-payment'),
			parcelas = '';

		pagamentos.html('');
		$.each(integradores, function (index, integrador) {
			if (integrador.numero_parcelas > 1) {

				parcelas += '<div class="row">';
				parcelas += '<h3>' + integrador.nome + '</h3>';
				parcelas += '<div id="' + integrador.slug.replace("icon-payment-", "") + '"><table class="deferred-payment">';

				if (typeof integrador.Parcelas !== 'undefined' && integrador.Parcelas.length > 0) {
					$.each(integrador.Parcelas, function (index2, parcela) {
						parcelas +=
							'<tr>' +
							'<td class="parcel-number">' +
							'<span class="parcel-number">' + parcela.numero + 'x</span>' +
							'</td>' +
							'<td>de</td>' +
							'<td class="parcel-price">' +
							'<span class="parcel-price">R$ ' + parcela.valor_parcela.toFixed(2).replace('.', ',') + '</span>' +
							'</td>' +
							'<td class="parcel-desc">' +
							'<span>' + parcela.descricao + '</span>' +
							'</td>' +
							'<td class="parcel-total"> ' +
							'<span>Total: R$ ' + parcela.total_parcela.replace('.', ',') + '</span>' +
							'</td>' +
							'</tr>';
					});
				}

				parcelas += '</table></div>';
				parcelas += '</div>';
			}
		});

		pagamentos.append(parcelas);
	}

	function update_progressive_discount(descontos, valor) {
		if (descontos['ativo'] == 1) {

			if (descontos.tabela.length > 0) {

				var progressiveTable = $('.table-progressive tbody'),
					novaTabela = '';

				progressiveTable.empty();
				$.each(descontos['tabela'], function (index, desconto) {
					novaTabela +=
						'<tr>' +
						'<td>' + desconto.ProdutoEstoqueDesconto.quantidade_rotulo + '</td>' +
						'<td>' + desconto.ProdutoEstoqueDesconto.desconto + '%</td>' +
						'<td>' +
						'<span class="">' + desconto.ProdutoEstoqueDesconto.valor_desconto + '</span>' +
						'<span class=""> (cada)</span>' +
						'</td>' +
						'</tr>';
				});

				progressiveTable.append(novaTabela);
				$('.wrapper-progressive').show();

			} else {
				$('.wrapper-progressive').hide();
			}
		} else if (descontos['ativo'] == 2) {
			if (descontos.tabela !== null && descontos.tabela.length > 0) {

				var progressiveTable = $('.table-progressive tbody'),
					novaTabela = '';

				progressiveTable.empty();
				$.each(descontos['tabela'], function (index, desconto) {
					novaTabela +=
						'<tr>' +
						'<td>' + desconto.ProdutoEstoqueDesconto.quantidade_rotulo + '</td>' +
						'<td>' + desconto.ProdutoEstoqueDesconto.desconto + '%</td>' +
						'<td>' +
						'<span class="">' + accounting.formatMoney(valor * (1 - desconto.ProdutoEstoqueDesconto.desconto / 100)) + '</span>' +
						'<span class=""> (cada)</span>' +
						'</td>' +
						'</tr>';
				});

				progressiveTable.append(novaTabela);
				$('.wrapper-progressive').show();

			} else {
				$('.wrapper-progressive').hide();
			}
		}
	}

	function update_thumbs(lista, thumbs) {

		var video = $('.product-thumbnails-list').find('.product-video-item').clone();

		lista.empty();

		$('#thumbnails-list').find('.bx-wrapper').each(function () {
			var slideLength = $(this).length;

			if (slideLength > 0) {
				slider.destroySlider();
			}
		});

		$.each(thumbs, function (index, element) {
			var nova_linha =
				'<li class="product-thumbnails-item">' +
				'<a href="javascript:;" data-image="' + base_url_image + '/sku/' + element.name + '" data-zoom-image="' + base_url_image + '/sku/' + element.name + '">' +
				'<img src="' + base_url_image + '/sku/thumb_' + element.name + '" class="product-thumb" height="50" width="50" alt="">' +
				'</a>' +
				'<span class="link-thumbnail"></span>' +
				'</li>';
			lista.append(nova_linha);
		});

		lista.append(video);

		if (slider == null) {
			sliderThumbs();
		} else {
			sliderThumbsReload();
		}

		$('.product-main-image').removeClass('video-active');
		hideZoom();
	}

	function update_thumbs_mobile(images, thumbs) {

		var video = images.find('.product-video-item').clone();

		images.html('');
		$('.product-image-list-zoom .product-image-zoom-inner').html('');

		var lista = '<ul class="product-image-list">';

		$.each(thumbs, function (index, element) {
			lista +=
				'<li>' +
				'<div class="inner">' +
				'<figure>' +
				'<img src="' + base_url_image + '/sku/' + element.name + '" alt="">' +
				'</figure>' +
				'</div>' +
				'</li>';
		});

		lista += '</ul>';

		var listaZoom = '';

		$.each(thumbs, function (index, element) {
			listaZoom +=
				'<div class="product-image-item-zoom" style="display:none;">' +
				'<img src="' + base_url_image + '/sku/' + element.name + '" alt="">' +
				'</div>';
		});

		images.append(lista);
		$('.product-image-list').append(video);
		$('.product-image-list-zoom .product-image-zoom-inner').append(listaZoom);

		listaImagensMobile = $('.product-image-list');
		listaImagensMobile.bxSlider({
			infiniteLoop: false,
			hideControlOnEnd: true,
			pager: false,
			prevText: '<span class="icon-prev-h"></span>',
			nextText: '<span class="icon-next-h"></span>',
			video: true,
			useCSS: false
		});
	}

	function validateEmail(email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	function update_combinations(combinationList, checkclass, combinacoes) { //

		combinationList.html('');
		var html_combinacoes = '';
		var wrapper_adicionais = '';

		$.each(combinacoes, function (idx, combinacao) {

			if (combinacao.classes_adicionais != null && combinacao.classes_adicionais.length > 0) {
				wrapper_adicionais = ' wrapper-' + combinacao.classes_adicionais;
			}

			html_combinacoes +=
				'<p class="product-combination-title">' + combinacao.label + '</p>' +
				'<ul class="product-combination-list' + wrapper_adicionais + '">';

			$.each(combinacao.CombinacaoAtributo, function (idx2, atributo) {


				var disponivel = ((atributo.disponivel == true) ? '' : ' product-combination-unavailable');
				var selecionado = ((atributo.selecionado == true) ? ' product-combination-active' : '');
				var atributo_ativo = ((combinacao.mostra_vitrine == true) ? ' active-attribute' : ' non-active-attribute');
				var selected = ((atributo.selecionado == true) ? ' checked="checked" ' : '');
				var atributo_tipo = __update_combinations_type(atributo);

				html_combinacoes +=
					'<li class="product-combination-item' + disponivel + selecionado + ' ' + combinacao.classes_adicionais + '">' +
					'<label for="CatalogoCombinacaoAtributoId' + combinacao.produto_id + combinacao.id + atributo.id + '" title="' + atributo.nome + '">' +
					atributo_tipo +
					'</label>' +
					((atributo.disponivel == true) ? '' : '<span class="label-product-combination-unavailable">x</span>') +
					'<input type="hidden" name="data[CatalogoCombinacaoAtributo][id][' + combinacao.produto_id + '][' + combinacao.id + '][' + atributo.id + ']" id="CatalogoCombinacaoAtributoId' + combinacao.produto_id + combinacao.id + atributo.id + '_" value="0">' +
					'<input type="checkbox" name="data[CatalogoCombinacaoAtributo][id][' + combinacao.produto_id + '][' + combinacao.id + '][' + atributo.id + ']" value="' + atributo.id + '"' + selected + 'class="comb-' + combinacao.id + ' ' + checkclass + ' prod-' + combinacao.produto_id + atributo_ativo + '" data-order="' + combinacao.ordem + '" id="CatalogoCombinacaoAtributoId' + combinacao.produto_id + combinacao.id + atributo.id + '">' +
					'</li>';
			});

			html_combinacoes += '</ul>';

			if (combinacao.instrucao_ativo == true) {

				if (combinacao.instrucao_nome == null || combinacao.instrucao_nome == "") {
					combinacao.instrucao_nome = "Instruções";
				}

				//Nao pode remover o ` no inicio da linha
				html_combinacoes += '<div class="pull-btn">' +
					`<a href="javascript:;" data-id="${combinacao.id}" class="btn-show-instrucao">${combinacao.instrucao_nome}</a>` +
					'</div>';
			}

		});

		combinationList.html(html_combinacoes);
	}

	function update_combinationsKit(combinationList, checkclass, combinacoes, produtoKit) {

		combinationList.html('');
		var html_combinacoes = '';
		var wrapper_adicionais = '';

		$.each(combinacoes, function (idx, combinacao) {

			if (combinacao.classes_adicionais != null && combinacao.classes_adicionais.length > 0) {
				wrapper_adicionais = ' wrapper-' + combinacao.classes_adicionais;
			}

			html_combinacoes +=
				'<p class="product-combination-title">' + combinacao.label + '</p>' +
				'<ul class="product-combination-list' + wrapper_adicionais + '">';

			$.each(combinacao.CombinacaoAtributo, function (idx2, atributo) {

				var disponivel = ((atributo.disponivel == true) ? '' : ' product-combination-unavailable');
				var selecionado = ((atributo.selecionado == true) ? ' product-combination-active' : '');
				var atributo_ativo = ((combinacao.mostra_vitrine == true) ? ' active-attribute' : ' non-active-attribute');
				var selected = ((atributo.selecionado == true) ? ' checked="checked" ' : '');
				var atributo_tipo = __update_combinations_type(atributo);

				html_combinacoes +=
					'<li class="product-combination-item' + disponivel + selecionado + ' ' + combinacao.classes_adicionais + '">' +
					'<label for="CatalogoCombinacaoAtributoId' + produtoKit.id + combinacao.id + atributo.id + '" title="' + atributo.nome + '">' +
					atributo_tipo +
					'</label>' +
					((atributo.disponivel == true) ? '' : '<span class="label-product-combination-unavailable">x</span>') +
					'<input type="hidden" name="data[CatalogoCombinacaoAtributo][id][' + produtoKit.id + '][' + combinacao.id + '][' + atributo.id + ']" id="CatalogoCombinacaoAtributoId' + produtoKit.id + combinacao.id + atributo.id + '_" value="0">' +
					'<input type="checkbox" name="data[CatalogoCombinacaoAtributo][id][' + produtoKit.id + '][' + combinacao.id + '][' + atributo.id + ']" value="' + atributo.id + '"' + selected + 'class="comb-' + combinacao.id + ' ' + checkclass + ' prod-' + produtoKit.id + atributo_ativo + '" data-order="' + combinacao.ordem + '" id="CatalogoCombinacaoAtributoId' + produtoKit.id + combinacao.id + atributo.id + '">' +
					'</li>';
			});

			html_combinacoes +=
				'</ul>';

			if (combinacao.instrucao_ativo == true) {

				if (combinacao.instrucao_nome == null || combinacao.instrucao_nome == "") {
					combinacao.instrucao_nome = "Instruções";
				}

				//Nao pode remover o ` no inicio da linha
				html_combinacoes += '<div class="pull-btn">' +
					`<a href="javascript:;" data-id="${combinacao.id}" class="btn-show-instrucao">${combinacao.instrucao_nome}</a>` +
					'</div>';
			}

		});

		combinationList.html(html_combinacoes);
	}

	function update_shipping(params) {

		if ($('#cepPeso').length > 0) {

			var cubagem = parseInt(params.altura * params.largura * params.comprimento);
			params.peso = parseInt(params.peso);

			// Ja existe uma cotacao de frete calculada
			if ($('#product-shipping').is(':visible')) {

				var lastPeso = parseInt($('#cepPeso').val());
				var lastCubagem = parseInt($('#cepCubagem').val());

				// se o peso ou a cubagem eh diferente, precisa re-calcular o frete
				if (params.peso != lastPeso || cubagem != lastCubagem) {

					$('#cep').trigger("keyup");
				}
			}

			$('#cepPeso').val(parseInt(params.peso));
			$('#cepCubagem').val(cubagem);
		}
	}

	function __update_combinations_type(atributo) {

		var atributo_tipo = '';

		if (atributo.tipo_capa == 'imagem') {

			atributo_tipo = '<div class="combination-image"><img src="' + base_url_image + '/combinacao_atributo/thumb_' + atributo.name + '" alt=""></div>';

		} else if (atributo.tipo_capa == 'cor') {

			atributo_tipo = '<div class="combination-color" style="background-color:#' + atributo.cor_primaria.replace('#', '') + '" >';

			if (atributo.cor_secundaria != null && atributo.cor_secundaria != '')
				atributo_tipo += '<span style="border-color:#' + atributo.cor_secundaria.replace('#', '') + '"></span>';

			atributo_tipo += '</div>';


		} else {

			atributo_tipo = '<div class="combination-text">' + atributo.nome + '</div>';

		}

		return atributo_tipo;
	}

	//Slider dos thumbs

	sliderThumbs();

	function sliderThumbs() {
		// Slider Vertical
		$('.product-thumbnails-vertical .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 4) {
				slider = $('.product-thumbnails-list').bxSlider({
					//minSlides: 4,
					//maxSlides: 5,
					mode: 'vertical',
					infiniteLoop: false,
					hideControlOnEnd: true,
					pager: false,
					slideMargin: 10,
					nextText: '<span class="icon-next-down"></span>',
					prevText: '<span class="icon-prev-up"></span>',
					autoReload: true,
					breaks: [{
						screen: 0,
						slides: 4,
						pager: false
					}]
				});
			}
		});

		// Uma coluna com 5 thumbs
		$('.content-main-cols-1').find('.product-thumbnails-horizontal .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 5) {
				slider = $('.product-thumbnails-list').bxSlider({
					infiniteLoop: false,
					hideControlOnEnd: true,
					pager: false,
					slideMargin: 10,
					nextText: '<span class="icon-next"></span>',
					prevText: '<span class="icon-prev"></span>',
					autoReload: true,
					breaks: [{
						screen: 0,
						slides: 5,
						pager: false
					}]
				});
			}
		});

		// Duas colunas com 4 thumbs
		$('.content-main-cols-2').find('.product-thumbnails-horizontal .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 4) {
				slider = $('.product-thumbnails-list').bxSlider({
					infiniteLoop: false,
					hideControlOnEnd: true,
					pager: false,
					slideMargin: 10,
					nextText: '<span class="icon-next"></span>',
					prevText: '<span class="icon-prev"></span>',
					autoReload: true,
					breaks: [{
						screen: 0,
						slides: 4,
						pager: false
					}]
				});
			}
		});

		// Três colunas com 3 thumbs
		$('.content-main-cols-3').find('.product-thumbnails-horizontal .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 3) {
				slider = $('.product-thumbnails-list').bxSlider({
					infiniteLoop: false,
					hideControlOnEnd: true,
					pager: false,
					slideMargin: 10,
					nextText: '<span class="icon-next"></span>',
					prevText: '<span class="icon-prev"></span>',
					autoReload: true,
					breaks: [{
						screen: 0,
						slides: 3,
						pager: false
					}]
				});
			}
		});
	}

	function sliderThumbsReload() {
		// Slider Vertical
		$('.product-thumbnails-vertical .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 4) {
				slider.reloadSlider();
			}
		});

		// Uma coluna com 5 thumbs
		$('.content-main-cols-1').find('.product-thumbnails-horizontal .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 5) {
				slider.reloadSlider();
			}
		});

		// Duas colunas com 4 thumbs
		$('.content-main-cols-2').find('.product-thumbnails-horizontal .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 4) {
				slider.reloadSlider();
			}
		});

		// Três colunas com 3 thumbs
		$('.content-main-cols-3').find('.product-thumbnails-horizontal .product-thumbnails-list').each(function () {
			var length = $(this).contents('li').length;

			if (length > 3) {
				slider.reloadSlider();
			}
		});
	}

	//ENTREGA
	function refreshShipping(cep) {

		ProductModel.id = $('h1.product-name').data('id');
		var { comb, checked } = ViewFunctions.getCombinations();

		let perguntas = new Array();
		let parametros = new Array();

		if ($('.product-custom-question').attr('data-question-action') != 0) {

			$('.product-custom-question').each(function (index) {

				if ($(this).attr('data-question-action') > 0) {
					if ($(this).val().length != 0) {
						perguntas[perguntas.length] = {
							'id': $(this).attr("data-question-id"),
							'valor': $(this).val()
						};
					}
				}

				if ($(this).attr('data-question') == 'Bandô') {

					let largura = ($('.custom-question-largura-persiana-vertical').length > 0) ? $('.custom-question-largura-persiana-vertical').val() : $('.custom-question-largura').val();

					parametros[parametros.length] = {
						'param': 'bando',
						'largura': largura,
						'value': $(this).val()
					};
				}
			});

		}

		ProductModel.find_det(checked, null, function (prod) {

			var item = [{
				produto_estoque_id: prod.id,
				produto_id: prod.produto_id,
				sku_produto: prod.sku,
				valor_unitario: prod.valor_venda_unitario,
				altura: prod.altura,
				largura: prod.largura,
				comprimento: prod.comprimento,
				peso: prod.peso,
				tempo_producao: prod.tempo_producao,
				estoque_disponivel: prod.estoque_disponivel,
				estoque_avancado: prod.estoque_avancado,
				estoque_situacao: prod.estoque_avancado_situacao,
				estoque_situacao_sem: prod.estoque_avancado_situacao_sem,
				frete_gratis: prod.frete_gratis,
				quantidade: ($('#product-amount').length > 0) ? $('#product-amount').val() : 1,
				perguntas: perguntas,
				parametros: parametros
			}];

			$('.loading-page').show();

			$.ajax({
				url: base_url + 'shipping/quote',
				data: {
					carrinho: JSON.stringify({
						Item: item
					}),
					cep: '{"Cep":"' + cep + '"}',
					product_only: true
				},
				type: 'POST',
				dataType: 'json',
				success: function (ret) {
					var li = [];
					$('#cep').prop('disabled', false);

					if (typeof ret.Erro === 'undefined') {
						var alerta = ret[ret.length - 1];
						if (typeof alerta != 'undefined' && alerta.alerta_fretegratis)
							alerta = ret.pop();

						$.each(ret, function (name, data) {
							if (typeof data.Id != 'undefined') {
								if ((data['PrazoEntrega']) > 0) {
									const infoDeadline = (data['PrazoCalculo']) ? data['PrazoEntrega'] + ' (' + data['PrazoCalculo'] + ')' : data['PrazoEntrega'];

									li.push('<tr>' +
										'<td>' + data['Nome'] + '</td>' +
										'<td>' + 'R$ ' + data['Valor'].replace(".", ",") + '</td>' +
										'<td>' + infoDeadline + ' ' + data['PrazoDescricao'] + '</td>' +
										'</tr>');

									if (data['PrazoMsg'].length > 0) {
										li.push('<tr><td colspan="3"><span class="list-shipping-estimate-alert">' + data['PrazoMsg'] + '</span></td></tr>');
									}

								} else if (((data['PrazoDescricao']).length > 0) && (data['PrazoEntrega'] == 0)) {
									li.push('<tr>' +
										'<td>' + data['Nome'] + '</td>' +
										'<td>' + 'R$ ' + data['Valor'].replace(".", ",") + '</td>' +
										'<td>' + data['PrazoDescricao'] + '</td>' +
										'</tr>');
								} else {
									li.push('<tr>' +
										'<td>' + data['Nome'] + '</td>' +
										'<td>' + 'R$ ' + data['Valor'].replace(".", ",") + '</td>' +
										'<td> </td>' +
										'</tr>');

								}
							} else {
								$.each(data, function (name, data) {
									li.push('<tr>' +
										'<td>' + data['Nome'] + '</td>' +
										'<td>' + 'R$ ' + data['Valor'].toString().replace(".", ",") + '</td>' +
										'<td>' + data['PrazoEntrega'] + ' ' + data['PrazoDescricao'] + '</td>' +
										'</tr>');

									if (data['PrazoMsg'].length > 0) {
										li.push('<tr><td colspan="3"><span class="list-shipping-estimate-alert">' + data['PrazoMsg'] + '</span></td></tr>');
									}
								});
							}
						});
						$('#product-shipping').find('th').show();
					} else {
						$('#product-shipping').find('th').hide();
						li.push('<tr><td colspan="3" class="wrapper-shipping-unavaliable"><div class="shipping-unavaliable">' + ret.Erro.MsgErro + '</div></td></tr>');
					}

					$('.loading-page').hide();
					$('#product-shipping').show().children('tbody').html('').append(li);
				}
			});
		});
	}

	$('#cep').keyup(function (e) {
		if (this.value.length === 9) {
			refreshShipping(this.value);
		}
	}).on('paste', function (e) {
		if (this.value.length === 9) {
			refreshShipping(this.value);
		}
	}).click(function () {
		$('#cep').val('');
	});

	$('.btn-share').click(ProductRecommend.open);



	$(document).on('click', '.deferred-payment-header', function () {
		$(this).toggleClass('deferred-payment-header-active').next('.deferred-payment-list').slideToggle(500);
	});

	$('#product-question-calculate').click(function () {
		$('.product-custom-question').trigger("change");
	});

	$('.product-custom-question').focus(function () {
		if (($(this).attr('data-type') == "float-two" || $(this).attr('data-type') == "number") && $(this).attr('data-question-action') > 0) {
			$('.question-action').slideDown()
		}
	})

	$('.product-custom-question').change(function () {

		var postData = new Array(),
			params = new Array(),
			calcular = false,
			result = $('.product-question-result');

		result.slideUp();

		//Perguntas Fechadas
		const isClosedQuestion = $(this).hasClass('product-custom-question-closed');
		if (isClosedQuestion) {
			let value = $(this).val()
			const costElement = $(this).parent(".product-custom-question-select").find(".product-custom-question-cost")

			if (value == "") {
				costElement.hide()
			} else {
				var selectedValue = $(this).val();
				var selectedOption = $(this).find('option[value="' + selectedValue + '"]');
				var cost = selectedOption.data('answer-cost');

				if (cost !== '') {
					costElement.find("span").text(accounting.formatMoney(cost))
					costElement.show()
					calcular = true
				} else {
					//Não possui um valor de custo associado
					costElement.hide()
				}
			}
		} else { //Pergunta Aberta
			//O calculo só pode ocorrer quando for número e float para pergunta aberta
			if (
				($(this).attr('data-question-action') == 1) &&
				(($(this).attr('data-type') !== "text") && ($(this).attr('data-type') !== "email"))
			) {
				calcular = true
			}
		}

		$('.product-custom-question').each(function (index) {
			var isClosedQuestion = $(this).hasClass('product-custom-question-closed');
			if (isClosedQuestion) {
				var selectedValue = $(this).val();
				var selectedOption = $(this).find('option[value="' + selectedValue + '"]');
				var answer = selectedOption.data('answer');
				var answerCost = selectedOption.data('answer-cost');

				postData[postData.length] = {
					'id': $(this).attr("data-question-id"),
					'valor': $(this).val() ?? "",
					'resposta': answer ?? ""
				};
			} else {
				if ($(this).attr('data-question-action') == 1) {
					if ($(this).attr('data-question') == 'Bandô') {
						var largura = ($('.custom-question-largura-persiana-vertical').length > 0) ? $('.custom-question-largura-persiana-vertical').val() : $('.custom-question-largura').val();

						params[params.length] = {
							'param': 'bando',
							'largura': largura,
							'value': $(this).val()
						};
					}
				}

				postData[postData.length] = {
					'id': $(this).attr("data-question-id"),
					'valor': $(this).val()
				};
			}
		});

		if (calcular) {
			var postId = parseInt($('h1.product-name').attr('data-stock'));
			var route = WsRouter.generateRoute(null, 'produto', 'readDetalhamentoPerguntas', postId);

			WsDispatcher.postRequest(route, {
				'perguntas': JSON.stringify(postData),
				'params': JSON.stringify(params)
			}, null, function (data) {
				if (data.pergunta !== false) {
					let time = 0
					if ($(".wrapper-product-question-price").is(':visible')) {
						time = 300
					}
					setTimeout(() => {
						if (data.pergunta.medida > 0) {
							result.find('.product-question-metrics').html(data.pergunta.medida + ' ' + data.label + ' ');
						}
						result.find('.product-question-value').html(data.pergunta.valor);
						result.slideDown();
					}, time);

					if (data.cmetragem == true) {
						$('.product-price .product-new-price span').first().html('Metro² ');
						$('.element-product-detail .product-price').hide();
						$('.product-amount .wrapper-product-price').hide();
					}

					//já existe cotação de frete
					if ($('#product-shipping').is(':visible')) {
						$('#cep').trigger("keyup");
					}

				} else {
					$.message.show('error', {
						vars: {
							title: data.msg
						},
						idleTime: 4000
					});
				}
			});
		} else {
			result.slideUp();
		}
	});

	$('.btn-item-increment').on('click', function () {
		var measure = parseInt($('#product-measure').val());
		var increment = $('#product-measure').attr('data-increment');
		product_amount(measure, increment, 1);
	});


	$('.btn-item-decrement').on('click', function () {
		var measure = parseInt($('#product-measure').val());
		var increment = $('#product-measure').attr('data-increment');
		product_amount(measure, increment, -1);
	});

	function product_amount(measure, increment, operator) {

		if (measure > 0 && measure != '' && measure != 'undefined') {
			if (measure == 1) {
				var amountAdd = 1;
				var amount = parseInt($('#product-amount').val());
				newAmount = amount + (operator * amountAdd);

				if (newAmount > 0) {

					$('#product-amount').val(newAmount);
					$('#product-amount').change();
				}

			} else {
				var amountAdd = increment;
				var amount = parseFloat($('#product-amount').val().replace(",", "."));
				newAmount = (amount + (operator * amountAdd)).toFixed(2);

				if (newAmount > 0) {
					newAmount = newAmount.replace(".", ",");
					$('#product-amount').val(newAmount);
					$('#product-amount').change();
				}
			}
		}
	}

	$('#product-amount').change(function () {
		valid_values();
	});

	function checkIsZero(num) {
		num = num.replace(/\s/g, '').replace(',', '.');
		num = parseFloat(num);

		if (num === 0) {
			return true;
		} else {
			return false;
		}
	}

	const defaultValue = $('#product-amount').val();
	async function valid_values() {
		var amount = $('#product-amount').val();
		if (!amount) return true;
		var isValid = true;

		if (checkIsZero(amount)) {
			isValid = false
			$('#product-amount').val(defaultValue);
		}

		await update_value();
		$('#cep').trigger("keyup");

		return isValid
	}

	var updating = 0;

	async function update_value() {

		ProductModel.find_detUnidade(
			parseInt($('h1.product-name').attr('data-stock')),
			$('#product-amount').val(),
			null,
			function (data) {
				if (data.id !== null) {
					if (!data['revendedor']) {

						productOldAmount = $('#product-amount').val();

						if (!data['alerta_quantidade']) {
							update_product_original_price(data);
							update_product_price(data['valor_venda']);
							update_product_big_price_unit(data['valor_venda'], $('#product-amount').val());
							update_product_parcelled(data.dados_integradores['maximo_parcelas'], data['valor_parcelado']);
							update_price_off(data.dados_integradores['desconto_avista'], data['valor_avista']);
							update_deferred_payment(data.dados_integradores['pagamentos_parcelado'], data.integradores);

							/* Executa Validação quando é Kit */
							if ($('.table-kit').length > 0) {
								$('.total-kit-value').children('.kit-price').html(accounting.formatMoney(data['valor_venda']));
								validateCompoundedKit();
							}

						} else if (data['alerta_quantidade'] == true) {

							$.message.show('error', {
								vars: {
									title: 'Quantidade não disponível em estoque!'
								},
								idleTime: 4000
							});

							$('#product-amount').val(productOldAmount);

						} else {

							if (typeof productOldAmount === 'undefined') {
								productOldAmount = data['compra_minima'];
							}

							$.message.show('error', {
								vars: {
									title: data['alerta_quantidade'].replace(".", ",")
								},
								idleTime: 4000
							});
							$('#product-amount').val(productOldAmount);
						}
					}
				}
			}
		);
	}

	function validQuestionsKit(kit) {

		valid = true;

		$.each(kit, function () {

			var self = $(this);
			var perguntas = self.find('.product-custom-question');
			var perguntasArray = ProductModel.getQuestions(perguntas);

			if (perguntasArray.length > 0 && perguntasArray[0].error) {

				$.message.show('error', {
					vars: {
						title: perguntasArray[0].msg
					},
					idleTime: 4000
				});

				valid = false;
				return false;

			} else if (perguntas.length > 0) {

				perguntas.each(function () {

					var label = $(this).closest('.row').find('.product-question-item-title').text();
					var length = $(this).val().length;

					if ($(this).hasClass('error')) {
						$(this).removeClass('error');
						$(this).closest('div').find('label.error').remove();
					}

					/** Pergunta Obrigatoria **/
					if ($(this).prop('required') && length == 0) {

						$(this).addClass('error').after('<label class="error">Informe o ' + label + '</label>');

						$('html,body').animate({
							scrollTop: $(this).offset().top - 100
						});

						$.message.show('error', {
							vars: {
								title: 'Você precisa preencher todos os campos de ' + label + '.'
							},
							idleTime: 4000
						});

						valid = false;
						return false;
					}
				});
			}
		});

		return valid;
	}

	function validBuyKit(kit) {

		valid = true;

		$.each(kit, function () {

			var self = $(this);
			var combinationList = self.find('.product-combination-list');
			var checked = ProductModel.getChecked(combinationList);
			var marcados = checked.length;
			var combinacoes = combinationList.length;

			if (marcados != combinacoes) {

				uncheckedatrributes();
				$('html,body').animate({
					scrollTop: $('.product-combination-list.error').first().offset().top - 200
				}, 1000);

				valid = false;
				return false;
			}
		});

		return valid;
	}

	function addItemDone(data) {
		if (data.resposta == 'success')
			$.message.show('product-list-add');

		else
			$.message.show('product-list-error');
	}

	function cleanRating() {
		$('#rating-nome').val('');
		$('#rating-email').val('');
		$('#rating-cidade').val('');
		$('#rating-estado').val('');
		$('#rating-titulo').val('');
		$('#rating-comentario').val('');
		$('#captcha-input').val('');
		$('#a-reload').click();
	}

	$('.btn-gift-list').click(function () {
		var stock = $('h1.product-name').attr('data-stock');

		if (stock !== '' && stock !== 'undefined') {
			var route = WsRouter.generateRoute(null, 'listaDePresentes', 'addItem', [stock]);
			WsDispatcher.postRequest(route, null, null, addItemDone);

		} else {
			$.message.show('error', {
				vars: {
					title: 'Você precisa selecionar as combinações do produto.'
				},
				idleTime: 4000
			});
		}
	});

	$(document).on('click', '.btn-favorite', function () {
		var stock = $('h1.product-name').attr('data-stock');

		if (stock !== '' && stock !== 'undefined') {

			ProductModel.favoriteProduct(
				stock,
				null,
				function (data) {
					if (data.status == 1)
						$.message.show('success', {
							vars: {
								title: data.message1,
								content: data.message2
							},
							idleTime: 4000
						});
					else if (data.status == 0 && data.logado == 0)
						$.message.show('warning', {
							vars: {
								title: data.message1,
								content: data.message2
							},
							idleTime: false
						});
					else
						$.message.show('error', {
							vars: {
								title: data.message1,
								content: data.message2
							},
							idleTime: 4000
						});
				}
			);

		} else {
			$.message.show('error', {
				vars: {
					title: 'Você precisa selecionar as combinações do produto.'
				},
				idleTime: 4000
			});
		}
	});

	$('#tabs-payment').tabs();

	$('.payment-parceled').each(function () {
		var width = $(this).width() / 2;

		$(this).css('margin-left', -width);
	});

	$('.rating-stars').tooltip();

	if ($('#tabs-att-tec').length > 0) {
		$('#tabs-att-tec').tabs();
	}

	/** Avaliacao Produto Posvenda **/
	if ($('#product-rating').length > 0) {
		if (typeof $('#product-rating').attr('data-dorating') !== 'undefined' && $('#product-rating').attr('data-dorating') == 1) {
			setTimeout(function () {
				$('.product-ratings-link').trigger("click");
			}, 2000);
		}
	}

	/** Dropshiping ativo **/
	if ($('.grid-cep').hasClass('grid-dropship')) {
		setTimeout(function () {
			$('#cep').trigger('keyup');
		}, 500);
	}

	$(document).on('click', '.product-thumbnails-item', function () {
		hideZoom();
	});

	$(document).on('click', '.btn-show-instrucao', function () {
		var idInstrucao = $(this).data("id");
		var titleModal = $(this).text();

		$('#modal-instrucao-atributo').find('.modal-header-title').text(titleModal);
		$('#modal-instrucao-atributo-mobile').find('.modal-title').text(titleModal);

		$.ajax({
			url: base_url + 'produto/combinacao/getInstrucaoAtributo',
			data: {
				id: idInstrucao
			},
			type: 'POST',
			dataType: 'json',
			success: function (ret) {
				$('.instrucao_atributo_descricao').html("");
				$('.instrucao_atributo_descricao').html(ret['Combinacao']['instrucao_descricao']);
				if (!isMobile) {
					$.modal.show('fadeInDown', 'modal-instrucao-atributo');
				} else {
					var wHeight = $(window).height();

					$('body').css('overflow-y', 'hidden');

					setTimeout(function () {
						$('.wrapper').css({
							'overflow-y': 'hidden',
							'height': wHeight
						});
					}, 300);
					$('#modal-instrucao-atributo-mobile').addClass('open');
				}
			}
		});
	});

	$(document).on('click', '#modal-instrucao-atributo-mobile .modal-close', function () {
		$('body').css('overflow-y', 'auto');
		$('.wrapper').removeAttr('style');
		$('body').scrollTop($('body').scrollTop());
		$('.modal-x.open').removeClass('open');
	});


	function hideZoom() {
		setTimeout(function () {
			var realH = $('.product-image-zoom').prop('naturalHeight'),
				realW = $('.product-image-zoom').prop('naturalWidth');

			if (realH >= 600 || realW >= 600) {
				$('.zoomContainer').show();
			} else {
				$('.zoomContainer').hide();
			}

		}, 500);
	}

	if (isMobile) {
		$(window).on('load resize scroll', function () {
			if (!$('.wrapper-btn-fixed').hasClass('disabled')) {
				//abaixo da dobra
				if (verificaElementoOffscreen($('.wrapper-product-price .wrapper-btn-buy'))) {
					showBtnFixed();
				} else {
					hideBtnFixed();
				}
			} else {
				$('.wrapper-btn-fixed').hide();
			}
		});

		$(document).on('click', '.product-image-list > li:not(.product-video-item)', function () {
			var self = $(this);

			showZoomMobile(self);
		});

		$(document).on('click', '.close-zoom', function () {
			hideZoomMobile();
		});
	}

	function hideBtnFixed() {
		$('.wrapper-btn-fixed').removeClass('fadeInUp').addClass('fadeOutDown');

		setTimeout(function () {
			$('.wrapper-btn-fixed').hide()
		}, 500);
	}

	function showBtnFixed() {
		$('.wrapper-btn-fixed').removeClass('fadeOutDown');

		setTimeout(function () {
			$('.wrapper-btn-fixed').show().addClass('fadeInUp');
		}, 500);
	}

	function update_compra_minima(compra_minima) {
		$('#product-measure').val(compra_minima);
	}

	function showZoomMobile(li) {
		var index = $(li).index(),
			wHeight = $(window).height();

		indexImagemZoom = index;
		positionZoomMobile = $('html, body').scrollTop();

		$('.wrapper').hide();
		$('.product-image-list-zoom').addClass('active');
		$('.product-image-list-zoom .product-image-zoom-inner').children().eq(index).show();
	}

	function hideZoomMobile() {
		$('body').css('overflow-y', 'auto');
		$('.wrapper').show();

		listaImagensMobile.reloadSlider();
		listaImagensMobile.goToSlide(indexImagemZoom);

		$('.product-image-list-zoom').removeClass('active');
		$('.product-image-list-zoom .product-image-zoom-inner').children().hide();

		$('html, body').scrollTop(positionZoomMobile);
	}
});

$(document).ready(() => {
	setTimeout(function () {
		$('.show-zoom').show(300);

		//Zoom Mobile
		$(document).on('click', '.show-zoom', function () {
			indexImagemZoom = listaImagensMobile.getCurrentSlide();
			positionZoomMobile = $('html, body').scrollTop();

			if (listaImagensMobile == null) {
				$('.product-image-list > li').eq(0).trigger('click');
			} else {
				var index = listaImagensMobile.getCurrentSlide();

				$('.product-image-list > li').eq(index).trigger('click');
			}
		});
	}, 2000);
});

function sendForm(token) {
	var form = $('form[data-submit="true"]');
	form.submit();
}

function verificaValorEmail(email) {
	var re = /\S+@\S+\.\S+/;
	return re.test(email);
}

function verificaElementoOffscreen(elem) {
	if ($(elem).length > 0) {
		return $(elem).offset().top - $(window).scrollTop() < $(elem).height();
	}
}

function submitTellMe() {
	const siteKey = $('#modal-tell-me').data('site-key');

	grecaptcha.enterprise.ready(function () {
		grecaptcha.enterprise.execute(siteKey, { action: 'submit' }).then(function (tokenRecaptcha) {
			$.ajax({
				url: base_url + 'produto/aviseme/add',
				data: {
					'nome': $('#tellme-nome').val(),
					'email': $('#tellme-email').val(),
					'produto_id': $('#tellme-produto-id').val(),
					'produto_estoque_id': $('#tellme-sku').val(),
					'g-recaptcha-response': tokenRecaptcha
				},
				dataType: 'json',
				type: 'POST',
				success: function (data) {
					$('#tellme-btn').find('.btn-text').removeClass('loading-button');
					if (data['id'] == -1) {
						$.message.show('error', {
							vars: {
								title: data['mensagem']
							},
							idleTime: 3500
						});
					} else {
						$.modal.hide('fadeInDown', 'modal-tell-me');
						$.message.show('success', {
							vars: {
								title: 'Aviso cadastrado com sucesso!',
								idleTime: 3500
							}
						});
					}
				}
			});
		});
	});
}

function submitRating() {
	const siteKey = $('#modal-tell-me').data('site-key');

	grecaptcha.enterprise.ready(function () {
		grecaptcha.enterprise.execute(siteKey, { action: 'submit' }).then(function (tokenRecaptcha) {
			$.ajax({
				url: base_url + 'produto/rateProduct',
				data: {
					'produto_id': $('#rating-produto-id').val(),
					'nome': $('#rating-nome').val(),
					'email': $('#rating-email').val(),
					'cidade': $('#rating-cidade').val(),
					'estado': $('#rating-estado').val(),
					'titulo': $('#rating-titulo').val(),
					'comentario': $('#rating-comentario').val(),
					'avaliacao': $('#rating-avaliacao').val(),
					'g-recaptcha-response': tokenRecaptcha
				},
				dataType: 'json',
				type: 'POST',
				success: function (data) {

					if (data['id'] == -1) {
						$.message.show('warning', {
							vars: {
								title: data['mensagem']
							},
							idleTime: 3500
						});
					} else {
						$.modal.hide('fadeInDown', 'modal-tell-me');
						$.message.show('success', {
							vars: {
								title: 'Avaliação cadastrada com sucesso!',
								idleTime: 3500
							}
						});
					}

					ratingSending = false;
					setTimeout(function () {
						$('.rating-btn:eq(1)').find('.btn-text').removeClass('loading-button');
					}, 300);
				}
			});
		});
	});
}

function submitRecommendation() {
	const siteKey = $('#modal-tell-me').data('site-key');
	const id = $('.product-name').data('id');

	grecaptcha.enterprise.ready(function () {
		grecaptcha.enterprise.execute(siteKey, { action: 'submit' }).then(function (tokenRecaptcha) {
			$.ajax({
				url: base_url + 'produto/recommend/' + id,
				data: {
					'name': $('#RecommendName').val(),
					'friend_name': $('#RecommendFriendName').val(),
					'email': $('#RecommendEmail').val(),
					'friend_email': $('#RecommendFriendEmail').val(),
					'comment': $('#RecommendComment').val(),
					'g-recaptcha-response': tokenRecaptcha
				},
				dataType: 'json',
				type: 'POST',
				success: function (data) {

					$('#submit-recommendation').find('.btn-text').removeClass('loading-button');

					if (!data.Evento.status) {
						$.message.show('error', { vars: { title: data.Evento.message }, idleTime: 3500 });
					} else {
						$.modal.hide('fadeInDown', 'modal-tell-me');
						$.message.show('success', { vars: { title: 'Produto recomendado com sucesso!', idleTime: 3500 } });
					}
				}
			});
		});
	});
}

function cleanBudget() {

	$('#CotacaoNome').val('');
	$('#CotacaoEmail').val('');
	$('#CotacaoTelefone').val('');
	$('#CotacaoObservacao').val('');
	$('#CotacaoLogradouro').val('');
	$('#CotacaoNumero').val('');
	$('#CotacaoComplemento').val('');
	$('#CotacaoBairro').val('');
	$('#CotacaoCidade').val('');
	$('#CotacaoEstado').val('');
	$('#CotacaoCep').val('');
	$('#CotacaoQuantidade').val('');
}

function recaptchaReset() {
	var reCaptcha = $('#g-recaptcha-response').val();
	if (reCaptcha.length > 0) {
		grecaptcha.reset()
	}
}

let executedBudgetForm = false;

function submitBudget() {

	const siteKey = $('#modal-budget').data('site-key');
	const isMobile = $('body').hasClass('layout-mobile');

	if (!executedBudgetForm) {
		executedBudgetForm = true;

		grecaptcha.enterprise.ready(function () {
			grecaptcha.enterprise.execute(siteKey, { action: 'submit' }).then(function (tokenRecaptcha) {
				let cotacao = {};
				let route = WsRouter.generateRoute(null, 'produto', 'cotacaoProduto', null);

				cotacao = {
					clienteNome: $('#CotacaoNome').val(),
					clienteEmail: $('#CotacaoEmail').val(),
					clienteTelefone: $('#CotacaoTelefone').val(),
					clienteObservacao: $('#CotacaoObservacao').val(),
					clienteLogradouro: $('#CotacaoLogradouro').val(),
					clienteNumero: $('#CotacaoNumero').val(),
					clienteComplemento: $('#CotacaoComplemento').val(),
					clienteBairro: $('#CotacaoBairro').val(),
					clienteCidade: $('#CotacaoCidade').val(),
					clienteEstado: $('#CotacaoEstado').val(),
					clienteCep: $('#CotacaoCep').val(),
					produtoId: $('#tellme-produto-id').val(),
					produtoEstoqueId: $('#tellme-sku').val(),
					quantidade: $('#CotacaoQuantidade').val(),
					'g-recaptcha-response': tokenRecaptcha
				};

				WsDispatcher.postRequest(route, { 'VendaCotacao': JSON.stringify(cotacao) }, null, function (data) {
					if (data.status == 1) {

						cleanBudget();

						if (isMobile) {
							$('#modal-budget .modal-close').trigger('click');
						} else {
							$.modal.hide('fadeInUp', 'modal-budget');
						}

						$.message.show('success', { vars: { title: data.message }, idleTime: 4000 });

						executedBudgetForm = false;

					} else {
						recaptchaReset();
						executedBudgetForm = false;
						$.message.show('error', { vars: { title: data.message }, idleTime: 4000 });
					}

					$('#budget-btn').find('span.btn-text').removeClass('loading-button');
				});
			});
		});
	};
};
