jQuery( document ).ready( function( jQuery ) {
	woosb_check_ready();

	jQuery( '.product-type-woosb .woosb-products select' ).on( 'change', function() {
		jQuery( this ).closest( '.woosb-product' ).attr( 'data-id', 0 );
		woosb_check_ready();
	} );

	jQuery( document ).on( 'found_variation', function( e, t ) {
		if ( jQuery( '#woosb_products' ).length ) {
			if ( t['image']['url'] && t['image']['srcset'] ) {
				// change image
				jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-thumb-ori' ).hide();
				jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-thumb-new' ).html( '<img src="' + t['image']['url'] + '" srcset="' + t['image']['srcset'] + '"/>' ).show();
			}
			if ( t['price_html'] ) {
				// change price
				jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-price-ori' ).hide();
				jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-price-new' ).html( t['price_html'] ).show();
			}
			if ( t['is_purchasable'] ) {
				// change stock notice
				if ( t['is_in_stock'] ) {
					jQuery( '#woosb_wrap' ).next( 'p.stock' ).show();
					jQuery( e['target'] ).closest( '.woosb-product' ).attr( 'data-id', t['variation_id'] );
					jQuery( e['target'] ).closest( '.woosb-product' ).attr( 'data-price', t['display_price'] );
					woosb_check_ready();
					woosb_save_ids();
				} else {
					jQuery( '#woosb_wrap' ).next( 'p.stock' ).hide();
				}
				if ( t['availability_html'] != '' ) {
					jQuery( e['target'] ).closest( '.variations_form' ).find( 'p.stock' ).remove();
					jQuery( e['target'] ).closest( '.variations_form' ).append( t['availability_html'] );
				}
			}
			if ( t['variation_description'] != '' ) {
				jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-variation-description' ).html( t['variation_description'] ).show();
			} else {
				jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-variation-description' ).html( '' ).hide();
			}

			if ( woosb_vars.change_image == 'no' ) {
				// prevent changing the main image
				jQuery( e['target'] ).closest( '.variations_form' ).trigger( 'reset_image' );
			}
		}
	} );

	jQuery( document ).on( 'reset_data', function( e ) {
		if ( jQuery( '#woosb_products' ).length ) {
			// reset thumb
			jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-thumb-new' ).hide();
			jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-thumb-ori' ).show();
			// reset price
			jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-price-new' ).hide();
			jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-price-ori' ).show();
			// reset stock
			jQuery( e['target'] ).closest( '.variations_form' ).find( 'p.stock' ).remove();
			// reset desc
			jQuery( e['target'] ).closest( '.woosb-product' ).find( '.woosb-variation-description' ).html( '' ).hide();
		}
	} );

	jQuery( '.single_add_to_cart_button' ).click( function() {
		jQuery.ajax( {
			url: woosb_vars.ajax_url,
			type: "POST",
			data: {
				action: 'woosb_custom_data',
				woosb_ids: jQuery( '#woosb_ids' ).val(),
				woosb_nonce: woosb_vars.woosb_nonce
			},
			async: false,
		} );
	} );

	jQuery( '.product-type-woosb .woosb-products .woosb-qty input' ).on( 'keyup change', function() {
		var qty = parseInt( jQuery( this ).val() );
		var min_qty = parseInt( jQuery( this ).attr( 'min' ) );
		var max_qty = parseInt( jQuery( this ).attr( 'max' ) );
		if ( ! isNaN( min_qty ) && (
				qty < min_qty
			) ) {
			qty = min_qty;
		}
		if ( ! isNaN( max_qty ) && (
				qty > max_qty
			) ) {
			qty = max_qty;
		}
		jQuery( this ).val( qty );
		jQuery( this ).closest( '.woosb-product' ).attr( 'data-qty', qty );
		woosb_check_ready();
		woosb_save_ids();
	} );

	jQuery( '.product-type-woosb' ).on( 'click', '.single_add_to_cart_button.disabled', function( e ) {
		if ( jQuery( this ).hasClass( 'woosb-selection' ) ) {
			alert( woosb_vars.alert_selection );
		} else if ( jQuery( this ).hasClass( 'woosb-empty' ) ) {
			alert( woosb_vars.alert_empty );
		}
		e.preventDefault();
	} );
} );

function woosb_check_ready() {
	var need_selection = false;
	var is_empty = true;
	jQuery( '.product-type-woosb .woosb-products .woosb-product' ).each( function() {
		if ( (
			     jQuery( this ).attr( 'data-qty' ) > 0
		     ) && (
			     jQuery( this ).attr( 'data-id' ) == 0
		     ) ) {
			need_selection = true;
		}
		if ( jQuery( this ).attr( 'data-qty' ) > 0 ) {
			is_empty = false;
		}
	} );
	if ( need_selection || is_empty ) {
		jQuery( '.product-type-woosb .single_add_to_cart_button' ).addClass( 'disabled' );
		if ( need_selection ) {
			jQuery( '.product-type-woosb .single_add_to_cart_button' ).addClass( 'woosb-selection' );
		} else {
			jQuery( '.product-type-woosb .single_add_to_cart_button' ).removeClass( 'woosb-selection' );
		}
		if ( is_empty ) {
			jQuery( '.product-type-woosb .single_add_to_cart_button' ).addClass( 'woosb-empty' );
		} else {
			jQuery( '.product-type-woosb .single_add_to_cart_button' ).removeClass( 'woosb-empty' );
		}
	} else {
		jQuery( '.product-type-woosb .single_add_to_cart_button' ).removeClass( 'disabled woosb-selection woosb-empty' );
	}
	woosb_calc_price();
}

function woosb_calc_price() {
	var total = 0;
	var total_html = '';
	jQuery( '.product-type-woosb .woosb-products .woosb-product' ).each( function() {
		if ( jQuery( this ).attr( 'data-price' ) > 0 ) {
			total += jQuery( this ).attr( 'data-price' ) * jQuery( this ).attr( 'data-qty' );
		}
	} );
	if ( (
		     jQuery( '#woosb_products' ).attr( 'data-percent' ) > 0
	     ) && (
		     jQuery( '#woosb_products' ).attr( 'data-percent' ) < 100
	     ) ) {
		total = (
			        total * jQuery( '#woosb_products' ).attr( 'data-percent' )
		        ) / 100;
	} else if ( jQuery( '#woosb_products' ).attr( 'data-sale' ) > 0 ) {
		total = jQuery( '#woosb_products' ).attr( 'data-sale' );
	}
	var total_formated = woosb_format_money( total, woosb_vars.price_decimals, '', woosb_vars.price_thousand_separator, woosb_vars.price_decimal_separator );
	switch ( woosb_vars.price_format ) {
		case '%1$s%2$s':
			//left
			total_html += woosb_vars.currency_symbol + '' + total_formated;
			break;
		case '%1$s %2$s':
			//left with space
			total_html += woosb_vars.currency_symbol + ' ' + total_formated;
			break;
		case '%2$s%1$s':
			//right
			total_html += total_formated + '' + woosb_vars.currency_symbol;
			break;
		case '%2$s %1$s':
			//right with space
			total_html += total_formated + ' ' + woosb_vars.currency_symbol;
			break;
		default:
			//default
			total_html += woosb_vars.currency_symbol + '' + total_formated;
	}
	jQuery( '#woosb_total' ).html( woosb_vars.bundle_price_text + ' ' + total_html ).slideDown();
	jQuery( document.body ).trigger( 'woosb_calc_price', [total, total_formated, total_html] );
}

function woosb_save_ids() {
	var woosb_ids = Array();
	jQuery( '.product-type-woosb .woosb-products .woosb-product' ).each( function() {
		if ( jQuery( this ).attr( 'data-id' ) != 0 ) {
			woosb_ids.push( jQuery( this ).attr( 'data-id' ) + '/' + jQuery( this ).attr( 'data-qty' ) );
		}
	} );
	jQuery( '#woosb_ids' ).val( woosb_ids.join( ',' ) );
}

function woosb_format_money( number, places, symbol, thousand, decimal ) {
	number = number || 0;
	places = ! isNaN( places = Math.abs( places ) ) ? places : 2;
	symbol = symbol !== undefined ? symbol : "$";
	thousand = thousand || ",";
	decimal = decimal || ".";
	var negative = number < 0 ? "-" : "",
		i = parseInt( number = Math.abs( + number || 0 ).toFixed( places ), 10 ) + "",
		j = (
			    j = i.length
		    ) > 3 ? j % 3 : 0;
	return symbol + negative + (
			j ? i.substr( 0, j ) + thousand : ""
		) + i.substr( j ).replace( /(\d{3})(?=\d)/g, "$1" + thousand ) + (
		       places ? decimal + Math.abs( number - i ).toFixed( places ).slice( 2 ) : ""
	       );
}