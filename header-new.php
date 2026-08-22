<?php
/**
 * 	Cabecera de página
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="http://gmpg.org/xfn/11">
	<?php if ( is_singular() && pings_open( get_queried_object() ) ) : ?>
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<?php endif; ?>
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div id="page" class="site">
	<header id="masthead" class="site-header header-duck" role="banner">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>portada"><img src="https://javilopezg.com/wp-content/uploads/2026/06/cropped-logo-naranja-transparente.png" alt="Logo pirata" class="rubber-header" style="max-width:230px;width:100%" /></a>
			
			<div class="site-header-main">
				<?php if ( has_nav_menu( 'primary' ) || has_nav_menu( 'social' ) ) : ?>
					<button id="menu-toggle" class="menu-toggle"><?php _e( 'Menu', 'twentysixteen' ); ?></button>

					<div id="site-header-menu" class="site-header-menu">
						<?php if ( has_nav_menu( 'primary' ) ) : ?>
							<nav id="site-navigation" class="main-navigation" role="navigation" aria-label="<?php esc_attr_e( 'Primary Menu', 'twentysixteen' ); ?>">
								<?php
									wp_nav_menu( array(
										'theme_location' => 'primary',
										'menu_class'     => 'primary-menu',
									 ) );
								?>
							</nav><!-- .main-navigation -->
						<?php endif; ?>
					</div><!-- .site-header-menu -->
				<?php endif; ?>
				<div class="site-branding">
					<?php if (is_page('portada')): ?>
					<h1 class="site-title">Soy Javi López G.</h1>
					<?php else: ?>
					<p class="site-title">Soy Javi López G.</p>
					<?php endif; ?>
					<p class="site-description">🏴 Hacktivismo <br />📺️ Ingeniería social <br />🪪 (Tecno)fascismo</p>
				</div><!-- .site-branding -->
			</div><!-- .site-header-main -->
		</header><!-- .site-header -->


		<div id="content" class="site-content">
