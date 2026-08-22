<?php 
/* Template Name: Página del diario aleatorio */
get_header('new'); ?>

	<main id="main" class="site-main" role="main">
	<?php
	$the_query = new WP_Query( array( 
		'post_type' => 'diario_enfermo_raro',
		'posts_per_page' => 1,
		'orderby' => 'rand',
	) );

	if ( $the_query->have_posts() ) {
		while ( $the_query->have_posts() ) {
			$the_query->the_post();?>
			<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
				<header class="entry-header">
					<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
				</header>
				<div class="entry-content">
					<?php
					the_content();
					?>
				</div>
			</article>
			<?php
		}
	}
	wp_reset_postdata();
	?>
	</main>

<?php get_footer('new'); ?>
