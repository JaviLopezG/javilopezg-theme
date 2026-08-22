<?php 
/* Template Name: Página de Portada */

get_header('new'); ?>

	<main id="main" class="site-main" role="main">
		<?php
			$args = array(
				'posts_per_page'	=> 3,
			);
			$the_query = new WP_Query( $args ); 
			while ($the_query -> have_posts()) : $the_query -> the_post();  ?>
				<div class="news-info">
					<div class="news-info-img">
						<a href="<?php the_permalink() ?>"><img src="<?php echo get_stylesheet_directory_uri() . '/img/ico-5.png';?>" alt="Artículo del blog" /></a>
					</div>
					<div class="news-info-text">
						<span class="news-info-date"><?php echo get_the_date('j/m/Y'); ?></span>
						<a href="<?php the_permalink() ?>"><h2><?php the_title();?></h2></a>
						<?php the_excerpt();?>
					</div>
				</div>
			<?php endwhile;
			wp_reset_postdata();
		?>

		<div class="columnas-secciones">
			<div class="columna-blog">
				<?php 
				$category_id = get_cat_ID( 'Blog' );
				$category_link = get_category_link( $category_id ); ?>
				<a href="<?php echo esc_url( $category_link ); ?>" title="Artículos del blog">
				<img src="<?php echo get_stylesheet_directory_uri() . '/img/ico-tag.png';?>" alt="Categoría del blog" /><h3>Artículos del blog</h3>
				</a>
				<ul>
				<?php
				$args = array(
					'posts_per_page'	=> 7,
					'category_name' => 'blog'
				);
				$the_query = new WP_Query( $args ); 
				while ($the_query -> have_posts()) : $the_query -> the_post();  ?>
					<li>
						<a href="<?php the_permalink() ?>"><h3><?php the_title();?></h3></a>
					</li>
				<?php endwhile;
				wp_reset_postdata();
			?>
				</ul>
			</div>
			<div class="columna-blog">
				<?php 
				$category_id = get_cat_ID( 'Proyecto tipo' );
				$category_link = get_category_link( $category_id ); ?>
				<a href="<?php echo esc_url( $category_link ); ?>" title="Proyectos de ejemplo">
					<img src="<?php echo get_stylesheet_directory_uri() . '/img/ico-tag.png';?>" alt="Categoría del blog" /><h3>Proyectos de ejemplo</h3>
				</a>
				<ul>
				<?php
				$args = array(
					'posts_per_page'	=> 7,
					'category_name' => 'proyecto-tipo'
				);
				$the_query = new WP_Query( $args ); 
				while ($the_query -> have_posts()) : $the_query -> the_post();  ?>
					<li>
						<a href="<?php the_permalink() ?>"><h3><?php the_title();?></h3></a>
					</li>
				<?php endwhile;
				wp_reset_postdata();
			?>
				</ul>
			</div>
			<div class="columna-blog">
				<?php 
				$category_id = get_cat_ID( 'Tech Roundup' );
				$category_link = get_category_link( $category_id ); ?>
				<a href="<?php echo esc_url( $category_link ); ?>" title="Tech Roundup">
					<img src="<?php echo get_stylesheet_directory_uri() . '/img/ico-tag.png';?>" alt="Categoría del blog" /><h3>Tech Roundup</h3>
				</a>
				<ul>
				<?php
				$args = array(
					'posts_per_page'	=> 7,
					'category_name' => 'tech-roundup'
				);
				$the_query = new WP_Query( $args ); 
				while ($the_query -> have_posts()) : $the_query -> the_post();  ?>
					<li>
						<a href="<?php the_permalink() ?>"><h3><?php the_title();?></h3></a>
					</li>
				<?php endwhile;
				wp_reset_postdata();
			?>
				</ul>
			</div>
		</div>

	</main><!-- .site-main -->

<?php get_footer('new'); ?>
