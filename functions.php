<?php

add_action( 'wp_enqueue_scripts', 'theme_enqueue_styles' );
function theme_enqueue_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_script( 'mobile-sidebar', get_stylesheet_directory_uri() . '/js/mobile-sidebar.js', array(), '1.0.0', true );
    wp_enqueue_script( 'touch-tooltips', get_stylesheet_directory_uri() . '/js/touch-tooltips.js', array(), '1.0.0', true );
    wp_enqueue_script( 'widget-collapsible', get_stylesheet_directory_uri() . '/js/widget-collapsible.js', array(), '1.0.0', true );
}

/**
 *Adds social buttons on the footer of each post
 */
function juan_social_buttons(){
	if ( function_exists( 'sharing_display' ) ) {
		echo sharing_display();
	}
}

function juan_eliminar_sharing_debajo() {
    if ( function_exists( 'sharing_display' ) ) {
        remove_filter( 'the_content', 'sharing_display', 19 );
        remove_filter( 'the_excerpt', 'sharing_display', 19 );
    }
}
add_action( 'loop_start', 'juan_eliminar_sharing_debajo' );

if ( ! function_exists( 'twentysixteen_entry_meta' ) ) :
function twentysixteen_entry_meta() {
	if ( 'post' === get_post_type() ) {
		$author_avatar_size = apply_filters( 'twentysixteen_author_avatar_size', 49 );
		printf( '<span class="byline"><span class="author vcard">%1$s<span class="screen-reader-text">%2$s </span> <a class="url fn n" href="%3$s">%4$s</a></span></span>',
			get_avatar( get_the_author_meta( 'user_email' ), $author_avatar_size ),
			_x( 'Author', 'Used before post author name.', 'twentysixteen' ),
			esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
			get_the_author()
		);
	}

	if ( in_array( get_post_type(), array( 'post', 'attachment' ) ) ) {
		twentysixteen_entry_date();
	}

	$format = get_post_format();
	if ( current_theme_supports( 'post-formats', $format ) ) {
		printf( '<span class="entry-format">%1$s<a href="%2$s">%3$s</a></span>',
			sprintf( '<span class="screen-reader-text">%s </span>', _x( 'Format', 'Used before post format.', 'twentysixteen' ) ),
			esc_url( get_post_format_link( $format ) ),
			get_post_format_string( $format )
		);
	}

	if ( 'post' === get_post_type() ) {
		twentysixteen_entry_taxonomies();
	}

	if ( ! is_singular() && ! post_password_required() && ( comments_open() || get_comments_number() ) ) {
		echo '<span class="comments-link">';
		comments_popup_link( sprintf( __( 'Leave a comment<span class="screen-reader-text"> on %s</span>', 'twentysixteen' ), get_the_title() ) );
		echo '</span>';
	}
	juan_social_buttons();
}
endif;

/**
 * Delete wp-emoji and extra stuff from wp_head
 */

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );
remove_action( 'wp_head', 'rsd_link');
remove_action( 'wp_head', 'wlwmanifest_link');
remove_action( 'wp_head', 'wp_generator');
remove_action( 'wp_head', 'wp_shortlink_wp_head');
remove_action( 'wp_head', 'feed_links', 2 );
remove_action( 'wp_head', 'feed_links_extra', 3 );

/**
 * Add Google Fonts
 */

function vtx_load_fonts() {
	wp_register_style('atkinson-font', 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800&family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap');
	wp_enqueue_style( 'atkinson-font');
}
add_action('wp_print_styles', 'vtx_load_fonts');

/* CÓDIGO QUE OCULTA LOS POSTS DE LA CATEGORÍA TECH ROUNDUP EN TODOS LADOS

add_action( 'pre_get_posts', 'vtx_exclude_specific_cats' );
function vtx_exclude_specific_cats( $wp_query ) {
	if( !is_admin() && is_main_query() && !is_category(1666) && (is_archive() || is_category() || is_search() || strpos($_SERVER['REQUEST_URI'],'blog') ) ) {
		$wp_query->set( 'cat', -1666 );
	}
}
*/

// ÑAPA DE CÓDIGO QUE OCULTA LOS POSTS DE LA CATEGORÍA TECH ROUNDUP PERO MUESTRA UN FAKE EN EL ARCHIVO */
add_action( 'pre_get_posts', 'vtx_exclude_specific_cats' );
function vtx_exclude_specific_cats( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( is_category( 1666 ) ) {
		return;
	}
	$should_exclude = is_search() || is_category() || is_archive() || strpos( $_SERVER['REQUEST_URI'], 'blog' ) !== false;
	if ( ! $should_exclude ) {
		return;
	}
	$query->set( 'category__not_in', array( 1666 ) );
}

add_filter( 'the_posts', 'vtx_fake_post_for_empty_date_archive', 10, 2 );
function vtx_fake_post_for_empty_date_archive( $posts, $query ) {

	if ( is_admin() || ! $query->is_main_query() || ! $query->is_date() || ! empty( $posts ) ) {
		return $posts;
	}

	$check_args = $query->query_vars;
	unset( $check_args['category__not_in'] );
	$check_args['fields']         = 'ids';
	$check_args['posts_per_page'] = 1;
	$check_args['no_found_rows']  = true;

	$check = new WP_Query( $check_args );

	if ( ! $check->have_posts() ) {
		return $posts;
	}

	// Construimos la fecha a partir de lo que se está consultando (año/mes/día),
	// en vez de usar la fecha actual.
	$year  = $query->get( 'year' )     ? (int) $query->get( 'year' )     : (int) gmdate( 'Y' );
	$month = $query->get( 'monthnum' ) ? (int) $query->get( 'monthnum' ) : 1;
	$day   = $query->get( 'day' )      ? (int) $query->get( 'day' )      : 1;

	$fake_date = sprintf( '%04d-%02d-%02d 00:00:00', $year, $month, $day );

	$fake = new stdClass();
	$fake->ID             = 0;
	$fake->post_author    = 0;
	$fake->post_date      = $fake_date;
	$fake->post_date_gmt  = $fake_date;
	$fake->post_title     = 'Nada que ver aquí';
	$fake->post_content   = '<p>En este mes no hubo ningún post escrito por un humano aquí.</p>';
	$fake->post_excerpt   = '';
	$fake->post_status    = 'publish';
	$fake->comment_status = 'closed';
	$fake->ping_status    = 'closed';
	$fake->post_password  = '';
	$fake->post_name      = 'sin-posts-humanos';
	$fake->post_type      = 'post';
	$fake->filter         = 'raw';

	$query->found_posts   = 1;
	$query->max_num_pages = 1;
	$query->post_count    = 1;

	return array( new WP_Post( $fake ) );
}

if ( ! function_exists( 'jvlpzg_setup' ) ) :
function jvlpzg_setup() {
	add_theme_support( 'wp-block-styles' );
	add_editor_style( 'editor-style.css' );
}
endif;
add_action( 'after_setup_theme', 'jvlpzg_setup' );

add_theme_support( 'align-wide' );
add_theme_support( 'responsive-embeds' );
add_theme_support( 'editor-styles' );