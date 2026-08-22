<?php 
/* Template Name: Página de Portada */

get_header('new'); ?>

	<main id="main" class="site-main" role="main">
		<?php
			$args = array(
				'orderby'			=> 'date',
				'order'				=> 'DESC',
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
				$category_id = get_cat_ID( 'Aplicaciones digitales' );
				$category_link = get_category_link( $category_id ); ?>
				<a href="<?php echo esc_url( $category_link ); ?>" title="Proyectos personales">
					<img src="<?php echo get_stylesheet_directory_uri() . '/img/ico-tag.png';?>" alt="Categoría del blog" /><h3>Proyectos personales</h3>
				</a>
				<ul>
				<?php
				$args = array(
					'posts_per_page'	=> 7,
					'tax_query' => array(
						'relation' => 'AND',
						array(
							'taxonomy' => 'category',
							'field'    => 'slug',
							'terms'    => array( 'autoria-propia' ),
						),
						array(
							'taxonomy' => 'category',
							'field'    => 'slug',
							'terms'    => array( 'apps' ),
						),
					)
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
				$category_id = get_cat_ID( 'Tecnología' );
				$category_link = get_category_link( $category_id ); ?>
				<a href="<?php echo esc_url( $category_link ); ?>" title="Tecnología">
				<img src="<?php echo get_stylesheet_directory_uri() . '/img/ico-tag.png';?>" alt="Categoría del blog" /><h3>Tecnología</h3>
				</a>
				<ul>
				<?php
				$args = array(
					'posts_per_page'	=> 7,
					'category_name' => 'tecnologia'
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
				$category_id = get_cat_ID( 'English' );
				$category_link = get_category_link( $category_id ); ?>
				<a href="<?php echo esc_url( $category_link ); ?>" title="English">
					<img src="<?php echo get_stylesheet_directory_uri() . '/img/ico-tag.png';?>" alt="Categoría del blog" /><h3>English</h3>
				</a>
				<ul>
				<?php
				$args = array(
					'posts_per_page'	=> 7,
					'category_name' => 'english'
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
